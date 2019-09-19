import uuid from 'uuid/v4'
import WebSocket from 'isomorphic-ws'
import EventEmitter from 'events'
import { RTCSessionDescription, RTCPeerConnection } from 'isomorphic-webrtc'

import RequestSipMessage from './SipMessage/outbound/RequestSipMessage'
import InboundSipMessage from './SipMessage/inbound/InboundSipMessage'
import ResponseSipMessage from './SipMessage/outbound/ResponseSipMessage'
import { generateAuthorization } from './utils'

class Softphone extends EventEmitter {
  constructor (rc) {
    super()
    this.rc = rc
    this.fakeDomain = uuid() + '.invalid'
    this.fakeEmail = uuid() + '@' + this.fakeDomain
    this.branch = () => 'z9hG4bK' + uuid()
    this.fromTag = uuid()
    this.callerId = uuid()
  }

  async handleSipMessage (inboundSipMessage) {
    if (inboundSipMessage.subject.startsWith('INVITE sip:')) { // invite
      await this.send(new ResponseSipMessage(inboundSipMessage, 100, 'Trying'))
      await this.send(new ResponseSipMessage(inboundSipMessage, 180, 'Ringing', {
        Contact: `<sip:${this.fakeDomain};transport=ws>`
      }))
      this.inviteSipMessage = inboundSipMessage
      this.emit('INVITE', this.inviteSipMessage)
    } else if (inboundSipMessage.subject.startsWith('BYE ')) { // bye
      this.emit('BYE', inboundSipMessage)
    } else if (inboundSipMessage.subject.startsWith('MESSAGE ') && inboundSipMessage.body.includes(' Cmd="7"')) { // take over
      await this.send(new ResponseSipMessage(inboundSipMessage, 200, 'OK'))
    }
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
        if (inboundSipMessage.subject === 'SIP/2.0 100 Trying') {
          return // ignore
        }
        this.off('sipMessage', responseHandler)
        if (inboundSipMessage.subject.startsWith('SIP/2.0 603 ')) {
          reject(inboundSipMessage)
          return
        }
        resolve(inboundSipMessage)
      }
      this.on('sipMessage', responseHandler)
      this.ws.send(sipMessage.toString())
    })
  }

  async register () {
    const r = await this.rc.post('/restapi/v1.0/client-info/sip-provision', {
      sipInfo: [{ transport: 'WSS' }]
    })
    const json = await r.json()
    this.device = json.device
    this.sipInfo = json.sipInfo[0]
    this.ws = new WebSocket('wss://' + this.sipInfo.outboundProxy, 'sip')
    /* this is for debugging - start */
    this.ws.addEventListener('message', e => {
      console.log('\n***** WebSocket Got - start *****')
      console.log(e.data)
      console.log('***** WebSocket Got - end *****\n')
    })
    const send = this.ws.send.bind(this.ws)
    this.ws.send = (...args) => {
      console.log('\n***** WebSocket Send - start *****')
      console.log(...args)
      console.log('***** WebSocket Send - end *****\n')
      send(...args)
    }
    /* this is for debugging - end */
    this.ws.addEventListener('message', e => {
      const sipMessage = InboundSipMessage.fromString(e.data)
      this.emit('sipMessage', sipMessage)
      this.handleSipMessage(sipMessage)
    })
    const openHandler = async e => {
      this.ws.removeEventListener('open', openHandler)
      const requestSipMessage = new RequestSipMessage(`REGISTER sip:${this.sipInfo.domain} SIP/2.0`, {
        'Call-ID': this.callerId,
        Contact: `<sip:${this.fakeEmail};transport=ws>;expires=600`,
        From: `<sip:${this.sipInfo.username}@${this.sipInfo.domain}>;tag=${this.fromTag}`,
        To: `<sip:${this.sipInfo.username}@${this.sipInfo.domain}>`,
        Via: `SIP/2.0/WSS ${this.fakeDomain};branch=${this.branch()}`
      })
      let inboundSipMessage = await this.send(requestSipMessage)
      const wwwAuth = inboundSipMessage.headers['Www-Authenticate']
      if (wwwAuth && wwwAuth.includes(', nonce="')) { // authorization required
        const nonce = wwwAuth.match(/, nonce="(.+?)"/)[1]
        requestSipMessage.headers.Authorization = generateAuthorization(this.sipInfo, 'REGISTER', nonce)
        inboundSipMessage = await this.send(requestSipMessage)
      }
    }
    this.ws.addEventListener('open', openHandler)
  }

  async answer (inputAudioStream = undefined) {
    const sdp = this.inviteSipMessage.body
    const remoteRtcSd = new RTCSessionDescription({ type: 'offer', sdp })
    const pc1 = new RTCPeerConnection({ iceServers: [{ urls: 'stun:74.125.194.127:19302' }] })
    pc1.addEventListener('track', e => {
      this.emit('track', e)
    })
    pc1.setRemoteDescription(remoteRtcSd)
    if (inputAudioStream) {
      const track = inputAudioStream.getAudioTracks()[0]
      pc1.addTrack(track, inputAudioStream)
    }
    const localRtcSd = await pc1.createAnswer()
    pc1.setLocalDescription(localRtcSd)
    await this.send(new ResponseSipMessage(this.inviteSipMessage, 200, 'OK', {
      Contact: `<sip:${this.fakeEmail};transport=ws>`,
      'Content-Type': 'application/sdp'
    }, localRtcSd.sdp))
  }

  async reject () {

  }
}

export default Softphone
