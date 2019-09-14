import OutboundSipMessage from './OutboundSipMessage'

class RequestSipMessage extends OutboundSipMessage {
  constructor (subject, headers, body = '') {
    super(subject, headers, body)
    this.headers['Max-Forwards'] = 70
  }
}

export default RequestSipMessage
