/* eslint-env jest */
import InboundSipMessage from '../../src/SipMessage/inbound/InboundSipMessage'

describe('InboundSipMessage', () => {
  test('Trying', async () => {
    const tryingString = `SIP/2.0 100 Trying
Via: SIP/2.0/WSS d798d849-0447-4b28-ad5e-008889cfaabc.invalid;branch=z9hG4bK34f246ae-c6ca-417f-8a73-3a518309b2be
From: <sip:17206666666*115@sip.ringcentral.com>;tag=9b77dd92-6a64-4e91-8831-b00f7ef9597c
To: <sip:17206666666*115@sip.ringcentral.com>
Call-ID: 3b556547-776e-4bed-967a-176b374f4de9
CSeq: 8016 REGISTER
Content-Length: 0

`.split('\n').join('\r\n')
    const sipMessage = InboundSipMessage.fromString(tryingString)
    expect(sipMessage.subject).toBe('SIP/2.0 100 Trying')
    expect(sipMessage.headers).toEqual({
      Via: 'SIP/2.0/WSS d798d849-0447-4b28-ad5e-008889cfaabc.invalid;branch=z9hG4bK34f246ae-c6ca-417f-8a73-3a518309b2be',
      From: '<sip:17206666666*115@sip.ringcentral.com>;tag=9b77dd92-6a64-4e91-8831-b00f7ef9597c',
      To: '<sip:17206666666*115@sip.ringcentral.com>',
      'Call-ID': '3b556547-776e-4bed-967a-176b374f4de9',
      CSeq: '8016 REGISTER',
      'Content-Length': '0'
    })
    expect(sipMessage.body).toBe('')
    expect(tryingString).toBe(sipMessage.toString())
  })

  test('Unauthorized', async () => {
    const tryingString = `SIP/2.0 401 Unauthorized
Via: SIP/2.0/WSS d798d849-0447-4b28-ad5e-008889cfaabc.invalid;branch=z9hG4bK34f246ae-c6ca-417f-8a73-3a518309b2be
From: <sip:17206666666*115@sip.ringcentral.com>;tag=9b77dd92-6a64-4e91-8831-b00f7ef9597c
To: <sip:17206666666*115@sip.ringcentral.com>;tag=45rk14
Call-ID: 3b556547-776e-4bed-967a-176b374f4de9
CSeq: 8016 REGISTER
Content-Length: 0
Www-Authenticate: Digest realm="sip.ringcentral.com", nonce="XXvrW1176i9sn4clcQVdEk6ezAYxEy/P"

`.split('\n').join('\r\n')
    const sipMessage = InboundSipMessage.fromString(tryingString)

    expect(sipMessage.subject).toBe('SIP/2.0 401 Unauthorized')
    expect(sipMessage.headers).toEqual({
      Via: 'SIP/2.0/WSS d798d849-0447-4b28-ad5e-008889cfaabc.invalid;branch=z9hG4bK34f246ae-c6ca-417f-8a73-3a518309b2be',
      From: '<sip:17206666666*115@sip.ringcentral.com>;tag=9b77dd92-6a64-4e91-8831-b00f7ef9597c',
      To: '<sip:17206666666*115@sip.ringcentral.com>;tag=45rk14',
      'Call-ID': '3b556547-776e-4bed-967a-176b374f4de9',
      CSeq: '8016 REGISTER',
      'Content-Length': '0',
      'Www-Authenticate': 'Digest realm="sip.ringcentral.com", nonce="XXvrW1176i9sn4clcQVdEk6ezAYxEy/P"'
    })
    expect(sipMessage.body).toBe('')

    expect(tryingString).toBe(sipMessage.toString())
  })

  test('OK', async () => {
    const tryingString = `SIP/2.0 200 OK
Via: SIP/2.0/WSS a710736f-55c8-4a5b-8c6c-bae7993a4c0e.invalid;branch=z9hG4bK5354601a-c6f9-44e0-900b-dc33c2bb1194
From: <sip:17206666666*115@sip.ringcentral.com>;tag=4a103f65-ddb0-471f-8f12-8eac08c75aa9
To: <sip:17206666666*115@sip.ringcentral.com>;tag=1fMQdC
Call-ID: 37a4a494-b220-4dc9-8171-80491a46226c
CSeq: 709 REGISTER
Content-Length: 0
Contact: <sip:66c5fb5b-e78b-4bda-8799-97376028976e@a710736f-55c8-4a5b-8c6c-bae7993a4c0e.invalid;transport=ws>;expires=47

`.split('\n').join('\r\n')
    const sipMessage = InboundSipMessage.fromString(tryingString)
    expect(sipMessage.subject).toBe('SIP/2.0 200 OK')
    expect(sipMessage.headers).toEqual({
      Via: 'SIP/2.0/WSS a710736f-55c8-4a5b-8c6c-bae7993a4c0e.invalid;branch=z9hG4bK5354601a-c6f9-44e0-900b-dc33c2bb1194',
      From: '<sip:17206666666*115@sip.ringcentral.com>;tag=4a103f65-ddb0-471f-8f12-8eac08c75aa9',
      To: '<sip:17206666666*115@sip.ringcentral.com>;tag=1fMQdC',
      'Call-ID': '37a4a494-b220-4dc9-8171-80491a46226c',
      CSeq: '709 REGISTER',
      'Content-Length': '0',
      Contact: '<sip:66c5fb5b-e78b-4bda-8799-97376028976e@a710736f-55c8-4a5b-8c6c-bae7993a4c0e.invalid;transport=ws>;expires=47'
    })
    expect(sipMessage.body).toBe('')
    expect(tryingString).toBe(sipMessage.toString())
  })

  test('INVITE', async () => {
    const tryingString = `INVITE sip:4a4d40b5-247c-4330-bf09-2395bdf0337e@604faea0-3b32-476c-8271-9e58e1f96448.invalid;transport=ws SIP/2.0
Via: SIP/2.0/WSS 104.245.57.165:8083;rport;branch=z9hG4bK305I2S-2qHqTu
From: "WIRELESS CALLER" <sip:+16506666666@104.245.57.165>;tag=10.13.22.241-5070-4b7881ea95b447
To: "WIRELESS CALLER" <sip:17206666666*115@50.237.72.154>
Call-ID: 8677929a431a4244aa159ce3ec10bd92
CSeq: 218449525 INVITE
Max-Forwards: 67
Content-Length: 873
Contact: <sip:+16506666666@104.245.57.165:8083;transport=wss>
Content-Type: application/sdp
User-Agent: RC_SIPWRP_22.241
p-rc-api-ids: party-id=p-33f727da499c463aac3cf8294de576c0-2;session-id=s-33f727da499c463aac3cf8294de576c0
p-rc-api-call-info: callAttributes=reject,send-vm
P-rc: <Msg><Hdr SID="35464233129848" Req="{EEB7D831-D9D9-4815-9631-EEC476D21BD4}" From="#996016@sip.ringcentral.com:5060" To="17206666666*115" Cmd="6"/><Bdy SrvLvl="-149699523" SrvLvlExt="406" Phn="+16506666666" Nm="WIRELESS CALLER" ToPhn="+16504223279" ToNm="Tyler Liu" RecUrl=""/></Msg>
Call-Info: <201625796_120575908@10.22.66.84>;purpose=info

v=0
o=- 7066956197903366029 7997658033229634982 IN IP4 104.245.57.182
s=SmcSip
c=IN IP4 104.245.57.182
t=0 0
m=audio 29768 RTP/SAVPF 109 111 18 0 8 9 96 101
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
a=rtcp:29769
a=rtcp-mux
a=setup:actpass
a=fingerprint:sha-1 8E:C8:DB:21:CE:E5:F8:5A:F9:73:EC:08:B8:4D:5C:2A:96:BA:27:26
a=ice-ufrag:mqlmHMAU
a=ice-pwd:QTEEF1lt81VyKvJvEHhabIh9JZ
a=candidate:Mjq5KtrBWhOTFixu 1 UDP 2130706431 104.245.57.182 29768 typ host
a=candidate:Mjq5KtrBWhOTFixu 2 UDP 2130706430 104.245.57.182 29769 typ host
`.split('\n').join('\r\n')
    const sipMessage = InboundSipMessage.fromString(tryingString)
    expect(sipMessage.subject).toBe('INVITE sip:4a4d40b5-247c-4330-bf09-2395bdf0337e@604faea0-3b32-476c-8271-9e58e1f96448.invalid;transport=ws SIP/2.0')
    expect(sipMessage.headers).toEqual({
      Via: 'SIP/2.0/WSS 104.245.57.165:8083;rport;branch=z9hG4bK305I2S-2qHqTu',
      From: '"WIRELESS CALLER" <sip:+16506666666@104.245.57.165>;tag=10.13.22.241-5070-4b7881ea95b447',
      To: '"WIRELESS CALLER" <sip:17206666666*115@50.237.72.154>',
      'Call-ID': '8677929a431a4244aa159ce3ec10bd92',
      CSeq: '218449525 INVITE',
      'Max-Forwards': '67',
      'Content-Length': sipMessage.body.length + '',
      Contact: '<sip:+16506666666@104.245.57.165:8083;transport=wss>',
      'Content-Type': 'application/sdp',
      'User-Agent': 'RC_SIPWRP_22.241',
      'p-rc-api-ids': 'party-id=p-33f727da499c463aac3cf8294de576c0-2;session-id=s-33f727da499c463aac3cf8294de576c0',
      'p-rc-api-call-info': 'callAttributes=reject,send-vm',
      'P-rc': '<Msg><Hdr SID="35464233129848" Req="{EEB7D831-D9D9-4815-9631-EEC476D21BD4}" From="#996016@sip.ringcentral.com:5060" To="17206666666*115" Cmd="6"/><Bdy SrvLvl="-149699523" SrvLvlExt="406" Phn="+16506666666" Nm="WIRELESS CALLER" ToPhn="+16504223279" ToNm="Tyler Liu" RecUrl=""/></Msg>',
      'Call-Info': '<201625796_120575908@10.22.66.84>;purpose=info'
    })
    expect(sipMessage.body).toBe(`v=0
o=- 7066956197903366029 7997658033229634982 IN IP4 104.245.57.182
s=SmcSip
c=IN IP4 104.245.57.182
t=0 0
m=audio 29768 RTP/SAVPF 109 111 18 0 8 9 96 101
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
a=rtcp:29769
a=rtcp-mux
a=setup:actpass
a=fingerprint:sha-1 8E:C8:DB:21:CE:E5:F8:5A:F9:73:EC:08:B8:4D:5C:2A:96:BA:27:26
a=ice-ufrag:mqlmHMAU
a=ice-pwd:QTEEF1lt81VyKvJvEHhabIh9JZ
a=candidate:Mjq5KtrBWhOTFixu 1 UDP 2130706431 104.245.57.182 29768 typ host
a=candidate:Mjq5KtrBWhOTFixu 2 UDP 2130706430 104.245.57.182 29769 typ host
`.split('\n').join('\r\n'))
    expect(tryingString).toBe(sipMessage.toString())
  })

  test('MESSAGE', async () => {
    const tryingString = `MESSAGE sip:f234d4ad-aa84-4953-b7fe-475829102b56@f653434b-7cfa-4bc4-ba5a-52fb637395d1.invalid;transport=ws SIP/2.0
Via: SIP/2.0/WSS 104.245.57.165:8083;rport;branch=z9hG4bK3DmKRO-atQnvs
From: <sip:%231024016@sip.ringcentral.com>;tag=93c4a86e6fad4fb4a5f10b698d35b1c6
To: <sip:17206666666*115@sip.ringcentral.com>
Call-ID: 0037695cd4ec46dcb6da8e59edc1cfa9
CSeq: 218346883 MESSAGE
Max-Forwards: 67
Content-Length: 200
Content-Type: x-rc/agent

<Msg><Hdr SID="35464243582848" Req="" From="#1024016@sip.ringcentral.com:5060" To="17206666666*115@sip.ringcentral.com:5060" Cmd="7"/><Bdy Cln="802398808016" IP="4294967295" Sts="0" CtrlCln=""/></Msg>`.split('\n').join('\r\n')
    const sipMessage = InboundSipMessage.fromString(tryingString)
    expect(sipMessage.subject).toBe('MESSAGE sip:f234d4ad-aa84-4953-b7fe-475829102b56@f653434b-7cfa-4bc4-ba5a-52fb637395d1.invalid;transport=ws SIP/2.0')
    expect(sipMessage.headers).toEqual({
      Via: 'SIP/2.0/WSS 104.245.57.165:8083;rport;branch=z9hG4bK3DmKRO-atQnvs',
      From: '<sip:%231024016@sip.ringcentral.com>;tag=93c4a86e6fad4fb4a5f10b698d35b1c6',
      To: '<sip:17206666666*115@sip.ringcentral.com>',
      'Call-ID': '0037695cd4ec46dcb6da8e59edc1cfa9',
      CSeq: '218346883 MESSAGE',
      'Max-Forwards': '67',
      'Content-Length': sipMessage.body.length + '',
      'Content-Type': 'x-rc/agent'
    })
    expect(sipMessage.body).toBe('<Msg><Hdr SID="35464243582848" Req="" From="#1024016@sip.ringcentral.com:5060" To="17206666666*115@sip.ringcentral.com:5060" Cmd="7"/><Bdy Cln="802398808016" IP="4294967295" Sts="0" CtrlCln=""/></Msg>')
    expect(tryingString).toBe(sipMessage.toString())
  })
})
