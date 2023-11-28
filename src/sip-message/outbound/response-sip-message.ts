import {v4 as uuid} from 'uuid';

import OutboundSipMessage from './outbound-sip-message';
import responseCodes from '../response-codes';
import InboundSipMessage from '../inbound/inbound-sip-message';

const toTag = uuid();

class ResponseSipMessage extends OutboundSipMessage {
  constructor(
    inboundSipMessage: InboundSipMessage,
    responseCode: number,
    headers = {},
    body = ''
  ) {
    super(undefined, {...headers}, body);
    this.subject = `SIP/2.0 ${responseCode} ${responseCodes[responseCode]}`;
    for (const key of ['Via', 'From', 'Call-ID', 'Call-Id', 'CSeq']) {
      if (inboundSipMessage.headers[key]) {
        this.headers[key] = inboundSipMessage.headers[key];
      }
    }
    this.headers.To = `${inboundSipMessage.headers.To};tag=${toTag}`;
    this.headers.Supported = 'outbound';
    this.headers = {...this.headers, ...headers}; // user provided headers override auto headers
  }
}

export default ResponseSipMessage;
