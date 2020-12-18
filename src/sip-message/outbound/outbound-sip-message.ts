import SipMessage from '../sip-message';
import {version} from '../../../package.json';

class OutboundSipMessage extends SipMessage {
  constructor(subject = '', headers = {}, body = '') {
    super(subject, headers, body);
    this.headers['Content-Length'] = this.body.length.toString();
    this.headers['User-Agent'] = `ringcentral-softphone-js/${version}`;
  }
}

export default OutboundSipMessage;
