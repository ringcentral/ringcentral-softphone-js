class SipMessage {
  constructor (subject, headers, body) {
    this.subject = subject
    this.headers = headers
    this.body = body || ''
  }

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

export default SipMessage
