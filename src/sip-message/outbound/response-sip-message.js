import uuid from 'uuid/v4'

import OutboundSipMessage from './outbound-sip-message'

const toTag = uuid()

class ResponseSipMessage extends OutboundSipMessage {
  constructor (inboundSipMessage, statusCode, statusMessage, headers = {}, body = '') {
    super(undefined, headers, body)
    this.subject = `SIP/2.0 ${statusCode} ${statusMessage}`
    for (const key of ['Via', 'From', 'Call-ID', 'CSeq']) {
      this.headers[key] = inboundSipMessage.headers[key]
    }
    this.headers.To = `${inboundSipMessage.headers.To};tag=${toTag}`
    this.headers.Supported = 'outbound'
  }
}

export default ResponseSipMessage
