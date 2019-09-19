/* eslint-env jest */
import * as R from 'ramda'

import ResponseSipMessage from '../../src/SipMessage/outbound/ResponseSipMessage'
import InboundSipMessage from '../../src/SipMessage/inbound/InboundSipMessage'
import { version } from '../../package.json'

const inboundInviteMessage = InboundSipMessage.fromString(`INVITE sip:db228b2d-10a2-4a61-aeb1-3e5697c4348e@f00b012e-4b95-45dc-a530-27e04537b158.invalid;transport=ws SIP/2.0
Via: SIP/2.0/WSS 104.245.57.165:8083;rport;branch=z9hG4bK1HlzGT-2WxVW2
From: "WIRELESS CALLER" <sip:+16506666666@104.245.57.165>;tag=10.13.22.242-5070-26c2b3fce8a242
To: "WIRELESS CALLER" <sip:17203861294*115@50.237.72.154>
Call-ID: 7661f03e2b374012b8cfe8e7f1442261
CSeq: 218658393 INVITE
Max-Forwards: 67
Content-Length: 873
Contact: <sip:+16506666666@104.245.57.165:8083;transport=wss>
Content-Type: application/sdp
User-Agent: RC_SIPWRP_22.242
p-rc-api-ids: party-id=p-e9d16ea3dabd47f59e40b1f92d8515f3-2;session-id=s-e9d16ea3dabd47f59e40b1f92d8515f3
p-rc-api-call-info: callAttributes=reject,send-vm
P-rc: <Msg><Hdr SID="35464295783848" Req="{4E1DBD96-9DA5-43FB-A8BD-3252938BF0C7}" From="#1000016@sip.ringcentral.com:5060" To="17203861294*115" Cmd="6"/><Bdy SrvLvl="-149699523" SrvLvlExt="406" Phn="+16506666666" Nm="WIRELESS CALLER" ToPhn="+16508888888" ToNm="Tyler Liu" RecUrl=""/></Msg>
Call-Info: <906531240_133538243@10.13.116.50>;purpose=info

v=0
o=- 7028228953198384563 8403357933122626934 IN IP4 104.245.57.182
s=SmcSip
c=IN IP4 104.245.57.182
t=0 0
m=audio 37216 RTP/SAVPF 109 111 18 0 8 9 96 101
a=rtpmap:109 OPUS/16000
a=fmtp:109 useinbandfec=1
a=rtcp-fb:109 ccm tmmbr
a=rtpmap:111 OPUS/48000/2
a=fmtp:111 useinbandfec=1
a=rtcp-fb:111 ccm tmmbr
a=rtpmap:18 g729/8000
a=fmtp:18 annexb=no
a=rtpmap:0 pcmu/8000
a=rtpmap:8 pcma/8000
a=rtpmap:9 g722/8000
a=rtpmap:96 ilbc/8000
a=fmtp:96 mode=20
a=rtpmap:101 telephone-event/8000
a=fmtp:101 0-15
a=sendrecv
a=rtcp:37217
a=rtcp-mux
a=setup:actpass
a=fingerprint:sha-1 46:81:F7:FD:FB:15:4E:75:EC:6A:D1:4C:69:DA:21:EB:B3:B3:52:16
a=ice-ufrag:r7cg0L7k
a=ice-pwd:zUgXquxBbhEansWDjaVyQA3rmW
a=candidate:mQ0FXtgcx3Jp54R9 1 UDP 2130706431 104.245.57.182 37216 typ host
a=candidate:mQ0FXtgcx3Jp54R9 2 UDP 2130706430 104.245.57.182 37217 typ host
`.split('\n').join('\r\n'))

describe('ResponseSipMessage', () => {
  test('Trying', async () => {
    const sipMessage = new ResponseSipMessage(inboundInviteMessage, 100, 'Trying')
    expect(sipMessage.subject).toBe('SIP/2.0 100 Trying')
    expect(R.dissoc('To', sipMessage.headers)).toEqual({
      'User-Agent': `ringcentral-softphone-js/${version}`,
      Supported: 'outbound',
      CSeq: '218658393 INVITE',
      'Call-ID': '7661f03e2b374012b8cfe8e7f1442261',
      From: '"WIRELESS CALLER" <sip:+16506666666@104.245.57.165>;tag=10.13.22.242-5070-26c2b3fce8a242',
      Via: 'SIP/2.0/WSS 104.245.57.165:8083;rport;branch=z9hG4bK1HlzGT-2WxVW2',
      'Content-Length': 0
    })
  })

  test('Ringing', async () => {
    const sipMessage = new ResponseSipMessage(inboundInviteMessage, 180, 'Ringing', {
      Contact: '<sip:f00b012e-4b95-45dc-a530-27e04537b158.invalid;transport=ws>'
    })
    expect(sipMessage.subject).toBe('SIP/2.0 180 Ringing')
    expect(R.dissoc('To', sipMessage.headers)).toEqual({
      'User-Agent': `ringcentral-softphone-js/${version}`,
      Supported: 'outbound',
      CSeq: '218658393 INVITE',
      'Call-ID': '7661f03e2b374012b8cfe8e7f1442261',
      From: '"WIRELESS CALLER" <sip:+16506666666@104.245.57.165>;tag=10.13.22.242-5070-26c2b3fce8a242',
      Via: 'SIP/2.0/WSS 104.245.57.165:8083;rport;branch=z9hG4bK1HlzGT-2WxVW2',
      Contact: '<sip:f00b012e-4b95-45dc-a530-27e04537b158.invalid;transport=ws>',
      'Content-Length': 0
    })
  })
})
