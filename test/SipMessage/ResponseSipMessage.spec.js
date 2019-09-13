/* eslint-env jest */
import ResponseSipMessage from '../../src/SipMessage/ResponseSipMessage'

describe('ResponseSipMessage', () => {
  test('Trying', async () => {
    const responseSipMessage = new ResponseSipMessage('SIP/2.0 100 Trying', {
      'User-Agent': 'SoftphoneTest/1.0.0',
      Supported: 'outbound',
      CSeq: '218461177 INVITE',
      'Call-ID': '5628d6b687a849cb826d7ac0259f0df9',
      From: '"WIRELESS CALLER" <sip:+16506666666@104.245.57.183>;tag=10.13.121.70-5070-46867dec796244',
      Via: 'SIP/2.0/WSS 104.245.57.183:8083;rport;branch=z9hG4bK2YLFDF-4Cfcnb',
      To: '"WIRELESS CALLER" <sip:17206666666*115@50.237.72.154>'
    }, '')
    expect(responseSipMessage.toString()).toBe(`SIP/2.0 100 Trying
User-Agent: SoftphoneTest/1.0.0
Supported: outbound
CSeq: 218461177 INVITE
Call-ID: 5628d6b687a849cb826d7ac0259f0df9
From: "WIRELESS CALLER" <sip:+16506666666@104.245.57.183>;tag=10.13.121.70-5070-46867dec796244
Via: SIP/2.0/WSS 104.245.57.183:8083;rport;branch=z9hG4bK2YLFDF-4Cfcnb
To: "WIRELESS CALLER" <sip:17206666666*115@50.237.72.154>
Content-Length: 0

`.split('\n').join('\r\n'))
  })

  test('Ringing', async () => {
    const responseSipMessage = new ResponseSipMessage('SIP/2.0 180 Ringing', {
      'User-Agent': 'SoftphoneTest/1.0.0',
      Supported: 'outbound',
      CSeq: '218424460 INVITE',
      'Call-ID': '2e4fc664d44d470a9430b67d95c620cd',
      From: '"WIRELESS CALLER" <sip:+16506666666@104.245.57.165>;tag=10.13.20.230-5070-f8266a70eaff44',
      Via: 'SIP/2.0/WSS 104.245.57.165:8083;rport;branch=z9hG4bK2IenZ1-a9iUhd',
      To: '"WIRELESS CALLER" <sip:17206666666*115@50.237.72.154>;tag=046ae66d-e535-48e0-937a-6a4bda72b2c4',
      Contact: '<sip:568cdf84-8199-4d9c-be39-255cf5fba974.invalid;transport=ws>'
    }, '')
    expect(responseSipMessage.toString()).toBe(`SIP/2.0 180 Ringing
User-Agent: SoftphoneTest/1.0.0
Supported: outbound
CSeq: 218424460 INVITE
Call-ID: 2e4fc664d44d470a9430b67d95c620cd
From: "WIRELESS CALLER" <sip:+16506666666@104.245.57.165>;tag=10.13.20.230-5070-f8266a70eaff44
Via: SIP/2.0/WSS 104.245.57.165:8083;rport;branch=z9hG4bK2IenZ1-a9iUhd
To: "WIRELESS CALLER" <sip:17206666666*115@50.237.72.154>;tag=046ae66d-e535-48e0-937a-6a4bda72b2c4
Contact: <sip:568cdf84-8199-4d9c-be39-255cf5fba974.invalid;transport=ws>
Content-Length: 0

`.split('\n').join('\r\n'))
  })

  test('OK', async () => {
    const responseSipMessage = new ResponseSipMessage('SIP/2.0 200 OK', {
      'User-Agent': 'SoftphoneTest/1.0.0',
      Supported: 'outbound',
      CSeq: '218557048 MESSAGE',
      'Call-ID': '8929584cbd7d4088a0b0821adcf0f088',
      From: '<sip:%231028016@sip.ringcentral.com>;tag=a1b89c44b7aa4310b12cf029ca35539c',
      Via: 'SIP/2.0/WSS 104.245.57.165:8083;rport;branch=z9hG4bKaTt1kM-3U7roB',
      To: '<sip:17206666666*115@sip.ringcentral.com>;tag=db3e8b0a-28bb-48e2-852d-371579c9b707'
    }, '')
    expect(responseSipMessage.toString()).toBe(`SIP/2.0 200 OK
User-Agent: SoftphoneTest/1.0.0
Supported: outbound
CSeq: 218557048 MESSAGE
Call-ID: 8929584cbd7d4088a0b0821adcf0f088
From: <sip:%231028016@sip.ringcentral.com>;tag=a1b89c44b7aa4310b12cf029ca35539c
Via: SIP/2.0/WSS 104.245.57.165:8083;rport;branch=z9hG4bKaTt1kM-3U7roB
To: <sip:17206666666*115@sip.ringcentral.com>;tag=db3e8b0a-28bb-48e2-852d-371579c9b707
Content-Length: 0

`.split('\n').join('\r\n'))
  })

  test('INVITE response', () => {
    const responseSipMessage = new ResponseSipMessage('SIP/2.0 200 OK', {
      'User-Agent': 'SoftphoneTest/1.0.0',
      Supported: 'outbound',
      CSeq: '218557040 INVITE',
      'Call-ID': 'e6eaca5f7cb54701aa103e5b17d3d4bf',
      From: '"WIRELESS CALLER" <sip:+16506666666@104.245.57.165>;tag=10.13.22.19-5070-c3e8b4c2377649d',
      Via: 'SIP/2.0/WSS 104.245.57.165:8083;rport;branch=z9hG4bK3Ge8Q7-2f3qeA',
      To: '"WIRELESS CALLER" <sip:17206666666*115@50.237.72.154>;tag=db3e8b0a-28bb-48e2-852d-371579c9b707',
      Contact: '<sip:b6e8165c-c0c5-4897-a97a-57c754c3fe79@a34bcaa7-dbf5-4fc6-87fd-f7c5b3ab28d6.invalid;transport=ws>',
      'Content-Type': 'application/sdp',
      'P-rc-endpoint-id': 'e5a682cf-72da-4087-a456-453b3c7424eb',
      'Client-id': '7K-VX-tDQTOa0CQbpjSslg',
      Allow: 'ACK,CANCEL,INVITE,MESSAGE,BYE,OPTIONS,INFO,NOTIFY,REFER'
    }, `v=0
o=- 8459707152793500392 2 IN IP4 127.0.0.1
s=-
t=0 0
a=msid-semantic: WMS
m=audio 9 RTP/SAVPF 111 0 8 9 96 101
c=IN IP4 0.0.0.0
a=rtcp:9 IN IP4 0.0.0.0
a=ice-ufrag:Tthu
a=ice-pwd:eYefupkdcbRyhFoWGz6tq7pU
a=ice-options:trickle
a=fingerprint:sha-256 FD:72:04:3D:75:6B:E0:A9:B7:84:31:D7:07:44:D1:25:AD:DE:BD:77:36:D6:A4:4F:7D:0C:61:26:D9:A1:5B:F9
a=setup:active
a=mid:0
a=recvonly
a=rtcp-mux
a=rtpmap:111 OPUS/48000/2
a=fmtp:111 minptime=10;useinbandfec=1
a=rtpmap:0 pcmu/8000
a=rtpmap:8 pcma/8000
a=rtpmap:9 g722/8000
a=rtpmap:96 ilbc/8000
a=rtpmap:101 telephone-event/8000
`.split('\n').join('\r\n'))

    expect(responseSipMessage.toString()).toBe(`SIP/2.0 200 OK
User-Agent: SoftphoneTest/1.0.0
Supported: outbound
CSeq: 218557040 INVITE
Call-ID: e6eaca5f7cb54701aa103e5b17d3d4bf
From: "WIRELESS CALLER" <sip:+16506666666@104.245.57.165>;tag=10.13.22.19-5070-c3e8b4c2377649d
Via: SIP/2.0/WSS 104.245.57.165:8083;rport;branch=z9hG4bK3Ge8Q7-2f3qeA
To: "WIRELESS CALLER" <sip:17206666666*115@50.237.72.154>;tag=db3e8b0a-28bb-48e2-852d-371579c9b707
Contact: <sip:b6e8165c-c0c5-4897-a97a-57c754c3fe79@a34bcaa7-dbf5-4fc6-87fd-f7c5b3ab28d6.invalid;transport=ws>
Content-Type: application/sdp
P-rc-endpoint-id: e5a682cf-72da-4087-a456-453b3c7424eb
Client-id: 7K-VX-tDQTOa0CQbpjSslg
Allow: ACK,CANCEL,INVITE,MESSAGE,BYE,OPTIONS,INFO,NOTIFY,REFER
Content-Length: 599

v=0
o=- 8459707152793500392 2 IN IP4 127.0.0.1
s=-
t=0 0
a=msid-semantic: WMS
m=audio 9 RTP/SAVPF 111 0 8 9 96 101
c=IN IP4 0.0.0.0
a=rtcp:9 IN IP4 0.0.0.0
a=ice-ufrag:Tthu
a=ice-pwd:eYefupkdcbRyhFoWGz6tq7pU
a=ice-options:trickle
a=fingerprint:sha-256 FD:72:04:3D:75:6B:E0:A9:B7:84:31:D7:07:44:D1:25:AD:DE:BD:77:36:D6:A4:4F:7D:0C:61:26:D9:A1:5B:F9
a=setup:active
a=mid:0
a=recvonly
a=rtcp-mux
a=rtpmap:111 OPUS/48000/2
a=fmtp:111 minptime=10;useinbandfec=1
a=rtpmap:0 pcmu/8000
a=rtpmap:8 pcma/8000
a=rtpmap:9 g722/8000
a=rtpmap:96 ilbc/8000
a=rtpmap:101 telephone-event/8000
`.split('\n').join('\r\n'))
  })
})
