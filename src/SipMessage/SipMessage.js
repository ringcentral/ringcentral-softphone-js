class SipMessage {
  constructor (subject, headers, body = '') {
    this.subject = subject
    this.headers = headers
    this.body = body
  }

  toString () {
    return [this.subject, ...Object.keys(this.headers).map(key => `${key}: ${this.headers[key]}`), '', this.body].join('\r\n')
  }
}

export default SipMessage
