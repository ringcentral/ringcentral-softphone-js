/* eslint-env jest */
import ResponseSipMessage from '../src/ResponseSipMessage'

describe('ResponseSipMessage', () => {
  test('Trying', async () => {
    const responseSipMessage = new ResponseSipMessage('SIP/2.0 100 Trying', {
      'User-Agent': 'SoftphoneTest/1.0.0',
      Supported: 'outbound',
      CSeq: '218461177 INVITE',
      'Call-ID': '5628d6b687a849cb826d7ac0259f0df9',
      From: '"WIRELESS CALLER" <sip:+16504306662@104.245.57.183>;tag=10.13.121.70-5070-46867dec796244',
      Via: 'SIP/2.0/WSS 104.245.57.183:8083;rport;branch=z9hG4bK2YLFDF-4Cfcnb',
      To: '"WIRELESS CALLER" <sip:17203861294*115@50.237.72.154>'
    }, '')
    expect(responseSipMessage.toString()).toBe(`SIP/2.0 100 Trying
User-Agent: SoftphoneTest/1.0.0
Supported: outbound
CSeq: 218461177 INVITE
Call-ID: 5628d6b687a849cb826d7ac0259f0df9
From: "WIRELESS CALLER" <sip:+16504306662@104.245.57.183>;tag=10.13.121.70-5070-46867dec796244
Via: SIP/2.0/WSS 104.245.57.183:8083;rport;branch=z9hG4bK2YLFDF-4Cfcnb
To: "WIRELESS CALLER" <sip:17203861294*115@50.237.72.154>
Content-Length: 0

`.split('\n').join('\r\n'))
  })
})
