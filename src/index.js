import uuid from 'uuid/v4'
import WebSocket from 'isomorphic-ws'
import EventEmitter from 'events'
import { RTCSessionDescription, RTCPeerConnection } from 'isomorphic-webrtc'

import { RequestSipMessage, ResponseSipMessage, InboundSipMessage } from './sip-message'
import { generateAuthorization, generateProxyAuthorization, branch, enableWebSocketDebugging, enableWebRtcDebugging } from './utils'
import RcMessage from './rc-message/rc-message'

class Softphone extends EventEmitter {
  constructor (rc) {
    super()
    this.rc = rc
    this.fakeDomain = uuid() + '.invalid'
    this.fakeEmail = uuid() + '@' + this.fakeDomain
    this.fromTag = uuid()
    this.callId = uuid()
  }

  newCallId () {
    this.callId = uuid()
  }

  async handleSipMessage (inboundSipMessage) {
    if (inboundSipMessage.subject.startsWith('INVITE sip:')) { // invite
      await this.response(inboundSipMessage, 180, {
        Contact: `<sip:${this.fakeDomain};transport=ws>`
      })
      await this.sendRcMessage(inboundSipMessage, 17)
      this.emit('INVITE', inboundSipMessage)
    } else if (inboundSipMessage.subject.startsWith('BYE ')) { // bye
      await this.response(inboundSipMessage, 200)
      this.emit('BYE', inboundSipMessage)
    } else if (inboundSipMessage.subject.startsWith('MESSAGE ') && inboundSipMessage.body.includes(' Cmd="7"')) { // server side: already processed
      await this.response(inboundSipMessage, 200)
    }
  }

  async sendRcMessage (inboundSipMessage, reqid) {
    const rcMessage = RcMessage.fromXml(inboundSipMessage.headers['P-rc'])
    const newRcMessage = new RcMessage(
      {
        SID: rcMessage.Hdr.SID,
        Req: rcMessage.Hdr.Req,
        From: rcMessage.Hdr.To,
        To: rcMessage.Hdr.From,
        Cmd: reqid
      },
      {
        Cln: this.sipInfo.authorizationId
      }
    )
    const requestSipMessage = new RequestSipMessage(`MESSAGE sip:${newRcMessage.Hdr.To} SIP/2.0`, {
      Via: `SIP/2.0/WSS ${this.fakeDomain};branch=${branch()}`,
      To: `<sip:${newRcMessage.Hdr.To}>`,
      From: `<sip:${this.sipInfo.username}@${this.sipInfo.domain}>;tag=${this.fromTag}`,
      'Call-ID': this.callId,
      'Content-Type': 'x-rc/agent'
    }, newRcMessage.toXml())
    await this.send(requestSipMessage)
  }

  async send (sipMessage) {
    return new Promise((resolve, reject) => {
      if (sipMessage.subject.startsWith('SIP/2.0 ')) { // response message, no waiting for response from server side
        this.ws.send(sipMessage.toString())
        resolve(undefined)
        return
      }
      const responseHandler = inboundSipMessage => {
        if (inboundSipMessage.headers.CSeq !== sipMessage.headers.CSeq) {
          return // message not for this send
        }
        if (inboundSipMessage.subject === 'SIP/2.0 100 Trying' ||
          inboundSipMessage.subject === 'SIP/2.0 183 Session Progress'
        ) {
          return // ignore
        }
        this.off('sipMessage', responseHandler)
        if (inboundSipMessage.subject.startsWith('SIP/2.0 5') ||
          inboundSipMessage.subject.startsWith('SIP/2.0 6') ||
          inboundSipMessage.subject.startsWith('SIP/2.0 403')
        ) {
          reject(inboundSipMessage)
          return
        }
        resolve(inboundSipMessage)
      }
      this.on('sipMessage', responseHandler)
      this.ws.send(sipMessage.toString())
    })
  }

  async response (inboundSipMessage, responseCode, headers = {}, body = '') {
    await this.send(new ResponseSipMessage(inboundSipMessage, responseCode, headers, body))
  }

  async register () {
    const r = await this.rc.post('/restapi/v1.0/client-info/sip-provision', {
      sipInfo: [{ transport: 'WSS' }]
    })
    const json = await r.json()
    this.device = json.device
    this.sipInfo = json.sipInfo[0]
    this.ws = new WebSocket('wss://' + this.sipInfo.outboundProxy, 'sip', { rejectUnauthorized: false })
    if (process.env.WEB_SOCKET_DEBUGGING === 'true') {
      enableWebSocketDebugging(this.ws)
    }
    this.ws.addEventListener('message', e => {
      const sipMessage = InboundSipMessage.fromString(e.data)
      this.emit('sipMessage', sipMessage)
      this.handleSipMessage(sipMessage)
    })
    const openHandler = async e => {
      this.ws.removeEventListener('open', openHandler)
      const requestSipMessage = new RequestSipMessage(`REGISTER sip:${this.sipInfo.domain} SIP/2.0`, {
        'Call-ID': this.callId,
        Contact: `<sip:${this.fakeEmail};transport=ws>;expires=600`,
        From: `<sip:${this.sipInfo.username}@${this.sipInfo.domain}>;tag=${this.fromTag}`,
        To: `<sip:${this.sipInfo.username}@${this.sipInfo.domain}>`,
        Via: `SIP/2.0/WSS ${this.fakeDomain};branch=${branch()}`
      })
      let inboundSipMessage = await this.send(requestSipMessage)
      const wwwAuth = inboundSipMessage.headers['Www-Authenticate']
      if (wwwAuth && wwwAuth.includes(', nonce="')) { // authorization required
        const nonce = wwwAuth.match(/, nonce="(.+?)"/)[1]
        const newRequestSipMessage = requestSipMessage.fork()
        newRequestSipMessage.headers.Authorization = generateAuthorization(this.sipInfo, 'REGISTER', nonce)
        inboundSipMessage = await this.send(newRequestSipMessage)
        if (inboundSipMessage.subject === 'SIP/2.0 200 OK') {
          this.emit('registered')
        }
      }
    }
    this.ws.addEventListener('open', openHandler)
  }

  async answer (inviteSipMessage, inputAudioStream = undefined) {
    const sdp = inviteSipMessage.body
    const remoteRtcSd = new RTCSessionDescription({ type: 'offer', sdp })
    const peerConnection = new RTCPeerConnection({ iceServers: [{ urls: 'stun:74.125.194.127:19302' }] })
    if (process.env.WEB_RTC_DEBUGGING) {
      enableWebRtcDebugging(peerConnection)
    }
    peerConnection.addEventListener('track', e => {
      this.emit('track', e)
    })
    peerConnection.setRemoteDescription(remoteRtcSd)
    if (inputAudioStream) {
      const track = inputAudioStream.getAudioTracks()[0]
      peerConnection.addTrack(track, inputAudioStream)
    }
    const localRtcSd = await peerConnection.createAnswer()
    peerConnection.setLocalDescription(localRtcSd)
    await this.response(inviteSipMessage, 200, {
      Contact: `<sip:${this.fakeEmail};transport=ws>`,
      'Content-Type': 'application/sdp'
    }, localRtcSd.sdp)
  }

  async toVoicemail (inviteSipMessage) {
    await this.sendRcMessage(inviteSipMessage, 11)
  }

  async ignore (inviteSipMessage) {
    await this.response(inviteSipMessage, 480)
  }

  async invite (callee, inputAudioStream = undefined) {
    this.newCallId()
    const peerConnection = new RTCPeerConnection({
      iceServers: [{ urls: 'stun:74.125.194.127:19302' }]
    })
    if (process.env.WEB_RTC_DEBUGGING) {
      enableWebRtcDebugging(peerConnection)
    }
    if (inputAudioStream) {
      const track = inputAudioStream.getAudioTracks()[0]
      peerConnection.addTrack(track, inputAudioStream)
    }
    const localRtcSd = await peerConnection.createOffer()
    peerConnection.setLocalDescription(localRtcSd)
    const requestSipMessage = new RequestSipMessage(`INVITE sip:${callee}@${this.sipInfo.domain} SIP/2.0`, {
      Via: `SIP/2.0/WSS ${this.fakeDomain};branch=${branch()}`,
      To: `<sip:${callee}@${this.sipInfo.domain}>`,
      From: `<sip:${this.sipInfo.username}@${this.sipInfo.domain}>;tag=${this.fromTag}`,
      'Call-ID': this.callId,
      Contact: `<sip:${this.fakeEmail};transport=ws;ob>`,
      'Content-Type': 'application/sdp'
    }, localRtcSd.sdp)
    let inboundSipMessage = await this.send(requestSipMessage)
    const wwwAuth = inboundSipMessage.headers['Proxy-Authenticate']
    if (wwwAuth && wwwAuth.includes(', nonce="')) { // authorization required
      const ackMessage = new RequestSipMessage(`ACK ${inboundSipMessage.headers.Contact.match(/<(.+?)>/)[1]} SIP/2.0`, {
        Via: `SIP/2.0/WSS ${this.fakeDomain};branch=${branch()}`,
        To: inboundSipMessage.headers.To,
        From: inboundSipMessage.headers.From,
        'Call-ID': this.callId
      })
      ackMessage.reuseCseq()
      this.send(ackMessage)
      const nonce = wwwAuth.match(/, nonce="(.+?)"/)[1]
      const newRequestSipMessage = requestSipMessage.fork()
      newRequestSipMessage.headers['Proxy-Authorization'] = generateProxyAuthorization(this.sipInfo, 'INVITE', callee, nonce)
      inboundSipMessage = await this.send(newRequestSipMessage)
      const remoteRtcSd = new RTCSessionDescription({ type: 'answer', sdp: inboundSipMessage.body })
      peerConnection.addEventListener('track', e => {
        this.emit('track', e)
      })
      peerConnection.setRemoteDescription(remoteRtcSd)
    }
  }
}

export default Softphone
