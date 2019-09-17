import uuid from 'uuid/v4'
import WebSocket from 'isomorphic-ws'
import EventEmitter from 'events'
import { RTCSessionDescription, RTCPeerConnection } from 'isomorphic-webrtc'

import RequestSipMessage from './SipMessage/outbound/RequestSipMessage'
import InboundSipMessage from './SipMessage/inbound/InboundSipMessage'
import ResponseSipMessage from './SipMessage/outbound/ResponseSipMessage'
import { generateAuthorization } from './utils'
import RcMessage from './RcMessage'

class Softphone extends EventEmitter {
  constructor (rc) {
    super()
    this.rc = rc
    this.fakeDomain = uuid() + '.invalid'
    this.fakeEmail = uuid() + '@' + this.fakeDomain
    this.branch = () => 'z9hG4bK' + uuid()
    this.fromTag = uuid()
    this.toTag = uuid()
    this.callerId = uuid()
  }

  async handleSipMessage (inboundSipMessage) {
    if (inboundSipMessage.subject.startsWith('INVITE sip:')) { // invite
      await this.send(new ResponseSipMessage(inboundSipMessage, 100, 'Trying', {
        To: inboundSipMessage.headers.To
      }))
      await this.send(new ResponseSipMessage(inboundSipMessage, 180, 'Ringing', {
        To: `${inboundSipMessage.headers.To};tag=${this.toTag}`,
        Contact: `<sip:${this.fakeDomain};transport=ws>`
      }))
      this.inviteSipMessage = inboundSipMessage
      this.emit('invite', this.inviteSipMessage)
    } else if (inboundSipMessage.subject.startsWith('BYE ')) { // bye
      this.emit('bye', inboundSipMessage)
    } else if (inboundSipMessage.subject.startsWith('MESSAGE ') && inboundSipMessage.body.includes(' Cmd="7"')) { // take over
      await this.send(new ResponseSipMessage(inboundSipMessage, 200, 'OK', {
        To: `${inboundSipMessage.headers.To};tag=${this.toTag}`
      }))
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
    this.sipInfo = json.sipInfo[0]
    this.ws = new WebSocket('wss://' + this.sipInfo.outboundProxy, 'sip')
    this.ws.addEventListener('message', e => {
      const inboundSipMessage = InboundSipMessage.fromString(e.data)
      this.emit('sipMessage', inboundSipMessage)
      this.handleSipMessage(inboundSipMessage)
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
        if (inboundSipMessage.subject === 'SIP/2.0 200 OK') { // register successful
          this.registered = true
        }
      }
    }
    this.ws.addEventListener('open', openHandler)
  }

  async answer () {
    const sdp = this.inviteSipMessage.body
    const rcMessage = RcMessage.fromXml(this.inviteSipMessage.headers['P-rc'])
    const newRcMessage = new RcMessage(
      {
        SID: rcMessage.Hdr.SID,
        Req: rcMessage.Hdr.Req,
        From: rcMessage.Hdr.To,
        To: rcMessage.Hdr.From,
        Cmd: 17
      },
      {
        Cln: this.sipInfo.authorizationId
      }
    )
    const newMsgStr = newRcMessage.toXml()
    const requestSipMessage = new RequestSipMessage(`MESSAGE sip:${rcMessage.Hdr.From.replace('#', '%23')} SIP/2.0`, {
      Via: `SIP/2.0/WSS ${this.fakeEmail};branch=${this.branch()}`,
      To: `<sip:${rcMessage.Hdr.From.replace('#', '%23')}>`,
      From: `<sip:${rcMessage.Hdr.To}@sip.ringcentral.com>;tag=${this.fromTag}`,
      'Call-ID': this.callerId,
      'Content-Type': 'x-rc/agent'
    }, newMsgStr)
    await this.send(requestSipMessage)
    const remoteRtcSd = new RTCSessionDescription({ type: 'offer', sdp })
    const rtcpc = new RTCPeerConnection({ iceServers: [{ urls: 'stun:74.125.194.127:19302' }] })
    rtcpc.addEventListener('track', e => {
      this.emit('track', e)
    })
    rtcpc.setRemoteDescription(remoteRtcSd)
    const localRtcSd = await rtcpc.createAnswer()
    rtcpc.setLocalDescription(localRtcSd)
    await this.send(new ResponseSipMessage(this.inviteSipMessage, 200, 'OK', {
      To: `${this.inviteSipMessage.headers.To};tag=${this.toTag}`,
      Contact: `<sip:${this.fakeEmail};transport=ws>`,
      'Content-Type': 'application/sdp'
    }, localRtcSd.sdp))
  }

  async reject () {

  }
}

export default Softphone
