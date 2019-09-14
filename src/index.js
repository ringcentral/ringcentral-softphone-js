import WS from 'ws'
import uuid from 'uuid/v4'
import fs from 'fs'
import { SDK } from '@ringcentral/sdk'
import { RTCSessionDescription, RTCPeerConnection, nonstandard } from 'wrtc'

import { generateAuthorization, parseSipHeaders, addHeader } from './utils'
import RcMessage from './RcMessage'

const RingCentral = SDK
const RTCAudioSink = nonstandard.RTCAudioSink

const fakeDomain = uuid() + '.invalid'
const fakeEmail = uuid() + '@' + fakeDomain
const branch = () => 'z9hG4bK' + uuid()
const fromTag = uuid()
const toTag = uuid()
const callerId = uuid()
let cseq = Math.floor(Math.random() * 10000)

let ws
let sipInfo

const send = async (lines, method) => {
  return new Promise((resolve, reject) => {
    const seq = cseq++
    const seqLine = `CSeq: ${seq} ${method}`
    lines = addHeader(seqLine, lines)
    lines = addHeader('Max-Forwards: 70', lines)
    lines = addHeader('User-Agent: SoftphoneTest/1.0.0', lines)
    const message = lines.join('\r\n')
    const messageHandler = event => {
      const data = event.data
      if (!data.includes(seqLine)) {
        return // message not for this send
      }
      if (data.startsWith('SIP/2.0 100 Trying')) {
        return // ignore
      }
      ws.removeEventListener('message', messageHandler)
      resolve(data)
    }
    ws.addEventListener('message', messageHandler)
    ws.send(message)
  })
}

const answer = (offerHeaders, lines) => {
  const sameHeaders = ['Via', 'From', 'Call-ID', 'CSeq']
  for (const header of sameHeaders) {
    if (offerHeaders[header]) {
      lines = addHeader(`${header}: ${offerHeaders[header]}`, lines)
    }
  }
  lines = addHeader('User-Agent: SoftphoneTest/1.0.0', lines)
  const message = lines.join('\r\n')
  ws.send(message)
}

const openHandler = async (event) => {
  ws.removeEventListener('open', openHandler)
  const registerLines = [
    `REGISTER sip:${sipInfo.domain} SIP/2.0`,
    `Via: SIP/2.0/WSS ${fakeDomain};branch=${branch()}`,
    `From: <sip:${sipInfo.username}@${sipInfo.domain}>;tag=${fromTag}`,
    `To: <sip:${sipInfo.username}@${sipInfo.domain}>`,
    `Call-ID: ${callerId}`,
    `Contact: <sip:${fakeEmail};transport=ws>;expires=600`,
    'Content-Length: 0',
    '',
    ''
  ]
  let data = await send(registerLines, 'REGISTER')
  if (data.includes(', nonce="')) { // authorization required
    const nonce = data.match(/, nonce="(.+?)"/)[1]
    data = await send(addHeader(generateAuthorization(sipInfo, 'REGISTER', nonce), registerLines), 'REGISTER')
    if (data.startsWith('SIP/2.0 200 OK')) { // register successful
      ws.addEventListener('message', inviteHandler)
    }
  }
}

const inviteHandler = async (event) => {
  const data = event.data
  if (data.startsWith('INVITE sip:')) {
    ws.removeEventListener('message', inviteHandler) // todo: can accept one and only one call
    const offerHeaders = parseSipHeaders(data)

    answer(offerHeaders, [
      'SIP/2.0 100 Trying',
      `To: ${offerHeaders.To}`,
      'Content-Length: 0',
      '',
      ''
    ])
    answer(offerHeaders, [
      'SIP/2.0 180 Ringing',
      `To: ${offerHeaders.To};tag=${toTag}`,
      `Contact: <sip:${fakeDomain};transport=ws>`,
      'Content-Length: 0',
      '',
      ''
    ])

    const sdp = 'v=0\r\n' + data.split('\r\nv=0\r\n')[1].trim() + '\r\n'
    const rcMessage = RcMessage.fromXml(offerHeaders['P-rc'])
    const newRcMessage = new RcMessage(
      {
        SID: rcMessage.Hdr.SID,
        Req: rcMessage.Hdr.Req,
        From: rcMessage.Hdr.To,
        To: rcMessage.Hdr.From,
        Cmd: 17
      },
      {
        Cln: sipInfo.authorizationId
      }
    )
    const newMsgStr = newRcMessage.toXml()
    // this is for 17: receiveConfirm
    // not sure why server side needs this
    await send([
      `MESSAGE sip:${rcMessage.Hdr.From.replace('#', '%23')} SIP/2.0`,
      `Via: SIP/2.0/WSS ${fakeEmail};branch=${branch()}`,
      `To: <sip:${rcMessage.Hdr.From.replace('#', '%23')}>`,
      `From: <sip:${rcMessage.Hdr.To}@sip.ringcentral.com>;tag=${fromTag}`,
      `Call-ID: ${callerId}`,
      'Content-Type: x-rc/agent',
      `Content-Length: ${newMsgStr.length}`,
      '',
      newMsgStr
    ], 'MESSAGE')

    const remoteRtcSd = new RTCSessionDescription({ type: 'offer', sdp })
    const rtcpc = new RTCPeerConnection({ iceServers: [{ urls: 'stun:74.125.194.127:19302' }] })

    /* this is for debugging - start */
    // const eventNames = [
    //   'addstream', 'connectionstatechange', 'datachannel', 'icecandidate',
    //   'iceconnectionstatechange', 'icegatheringstatechange', 'identityresult',
    //   'negotiationneeded', 'removestream', 'signalingstatechange', 'track'
    // ]
    // for (const eventName of eventNames) {
    //   rtcpc.addEventListener(eventName, e => {
    //     console.log(`\n****** RTCPeerConnection ${eventName} event - start *****`)
    //     console.log(e)
    //     console.log(`****** RTCPeerConnection ${eventName} event - end *****\n`)
    //   })
    // }
    /* this is for debugging - end */

    rtcpc.addEventListener('track', e => {
      const audioSink = new RTCAudioSink(e.track)

      const audioPath = 'audio.raw'
      if (fs.existsSync(audioPath)) {
        fs.unlinkSync(audioPath)
      }
      const stream = fs.createWriteStream(audioPath, { flags: 'a' })
      audioSink.ondata = data => {
        stream.write(Buffer.from(data.samples.buffer))
      }
      const byeHandler = e => {
        if (e.data.startsWith('BYE ')) {
          ws.removeEventListener('message', byeHandler)
          audioSink.stop()
          stream.end()
        }
      }
      ws.addEventListener('message', byeHandler)
    })

    rtcpc.setRemoteDescription(remoteRtcSd)
    const localRtcSd = await rtcpc.createAnswer()
    rtcpc.setLocalDescription(localRtcSd)

    answer(offerHeaders, [
      'SIP/2.0 200 OK',
      `To: ${offerHeaders.To};tag=${toTag}`,
      `Contact: <sip:${fakeEmail};transport=ws>`,
      'Content-Type: application/sdp',
      `Content-Length: ${localRtcSd.sdp.length}`,
      '',
      localRtcSd.sdp
    ])
    ws.addEventListener('message', takeOverHandler)
  }
}

const takeOverHandler = event => {
  const data = event.data
  if (data.startsWith('MESSAGE ') && data.includes(' Cmd="7"')) {
    ws.removeEventListener('message', takeOverHandler)
    const messageHeaders = parseSipHeaders(data)
    answer(messageHeaders, [
      'SIP/2.0 200 OK',
      `To: ${messageHeaders.To};tag=${toTag}`,
      'Content-Length: 0',
      '',
      ''
    ])
  }
}

const rc = new RingCentral({
  server: process.env.RINGCENTRAL_SERVER_URL,
  clientId: process.env.RINGCENTRAL_CLIENT_ID,
  clientSecret: process.env.RINGCENTRAL_CLIENT_SECRET
})

;(async () => {
  await rc.login({
    username: process.env.RINGCENTRAL_USERNAME,
    extension: process.env.RINGCENTRAL_EXTENSION,
    password: process.env.RINGCENTRAL_PASSWORD
  })
  const r = await rc.post('/restapi/v1.0/client-info/sip-provision', {
    sipInfo: [{ transport: 'WSS' }]
  })
  await rc.logout()
  const json = await r.json()
  sipInfo = json.sipInfo[0]
  ws = new WS('wss://' + sipInfo.outboundProxy, 'sip')
  ws.addEventListener('open', openHandler)

  /* this is for debugging - start */
  ws.addEventListener('message', event => {
    console.log('\n***** WebSocket Got - start *****')
    console.log(event.data)
    console.log('***** WebSocket Got - end *****\n')
  })
  const send = ws.send.bind(ws)
  ws.send = (...args) => {
    console.log('\n***** WebSocket Send - start *****')
    console.log(...args)
    console.log('***** WebSocket Send - end *****\n')
    send(...args)
  }
  /* this is for debugging - end */
})()
