import SipMessage from './SipMessage'

class SipRequestMessage extends SipMessage {
  toString () {
    if (!this.headers['Content-Length']) {
      this.headers['Content-Length'] = this.body.length
    }
    return super.toString()
  }
}

export default SipRequestMessage
