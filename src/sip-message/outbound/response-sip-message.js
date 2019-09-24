import uuid from 'uuid/v4'
import md5 from 'blueimp-md5'

import OutboundSipMessage from './outbound-sip-message'
import responseCodes from '../response-codes'

const toTag = md5(uuid())

class ResponseSipMessage extends OutboundSipMessage {
  constructor (inboundSipMessage, responseCode, headers = {}, body = '') {
    super(undefined, headers, body)
    this.subject = `SIP/2.0 ${responseCode} ${responseCodes[responseCode]}`
    for (const key of ['Via', 'From', 'Call-ID', 'CSeq']) {
      this.headers[key] = inboundSipMessage.headers[key]
    }
    this.headers.To = `${inboundSipMessage.headers.To};tag=${toTag}`
    this.headers.Supported = 'outbound'
  }
}

export default ResponseSipMessage
