import OutboundSipMessage from './outbound-sip-message'

let cseq = Math.floor(Math.random() * 10000)

class RequestSipMessage extends OutboundSipMessage {
  constructor (subject, headers = {}, body = '') {
    super(subject, headers, body)
    this.headers['Max-Forwards'] = 70
    this.newCseq()
  }

  newCseq () {
    this.headers.CSeq = `${++cseq} ${this.subject.split(' ')[0]}`
  }

  reuseCseq () {
    this.headers.CSeq = `${--cseq} ${this.subject.split(' ')[0]}`
  }
}

export default RequestSipMessage
