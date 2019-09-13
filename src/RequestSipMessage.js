import OutboundSipMessage from './OutboundSipMessage'

class RequestSipMessage extends OutboundSipMessage {
  toString () {
    if (!this.headers['Max-Forwards']) {
      this.headers['Max-Forwards'] = 70
    }
    return super.toString()
  }
}

export default RequestSipMessage
