import OutboundSipMessage from './OutboundSipMessage'

let cseq = Math.floor(Math.random() * 10000)

class RequestSipMessage extends OutboundSipMessage {
  constructor (subject, headers = {}, body = '') {
    super(subject, headers, body)
    this.headers['Max-Forwards'] = 70
    this.headers.CSeq = `${cseq++} ${subject.split(' ')[0]}`
  }
}

export default RequestSipMessage
