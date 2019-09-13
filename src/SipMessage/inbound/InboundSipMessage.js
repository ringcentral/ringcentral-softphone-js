import SipMessage from '../SipMessage'

class InboundSipMessage extends SipMessage {
  static fromString (str) {
    const sipMessage = new SipMessage()
    const [init, ...body] = str.split('\r\n\r\n')
    sipMessage.body = body.join('\r\n\r\n')
    const [subject, ...headers] = init.split('\r\n')
    sipMessage.subject = subject
    sipMessage.headers = Object.fromEntries(headers.map(line => line.split(': ')))
    return sipMessage
  }
}

export default InboundSipMessage
