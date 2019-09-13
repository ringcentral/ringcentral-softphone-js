import SipMessage from './SipMessage'

class OutboundSipMessage extends SipMessage {
  toString () {
    if (!this.headers['Content-Length']) {
      this.headers['Content-Length'] = this.body.length
    }
    return super.toString()
  }
}

export default OutboundSipMessage
