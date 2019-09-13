/* eslint-env jest */
import SipMessage from '../src/SipMessage'

describe('SipMessage', () => {
  test('from trying string', async () => {
    const tryingString = `SIP/2.0 100 Trying
Via: SIP/2.0/WSS d798d849-0447-4b28-ad5e-008889cfaabc.invalid;branch=z9hG4bK34f246ae-c6ca-417f-8a73-3a518309b2be
From: <sip:17203861294*115@sip.ringcentral.com>;tag=9b77dd92-6a64-4e91-8831-b00f7ef9597c
To: <sip:17203861294*115@sip.ringcentral.com>
Call-ID: 3b556547-776e-4bed-967a-176b374f4de9
CSeq: 8016 REGISTER
Content-Length: 0

`.split('\n').join('\r\n')
    const sipMessage = SipMessage.fromString(tryingString)
    expect(sipMessage.subject).toBe('SIP/2.0 100 Trying')
    expect(sipMessage.headers).toEqual({
      Via: 'SIP/2.0/WSS d798d849-0447-4b28-ad5e-008889cfaabc.invalid;branch=z9hG4bK34f246ae-c6ca-417f-8a73-3a518309b2be',
      From: '<sip:17203861294*115@sip.ringcentral.com>;tag=9b77dd92-6a64-4e91-8831-b00f7ef9597c',
      To: '<sip:17203861294*115@sip.ringcentral.com>',
      'Call-ID': '3b556547-776e-4bed-967a-176b374f4de9',
      CSeq: '8016 REGISTER',
      'Content-Length': '0'
    })
    expect(sipMessage.body).toBe('')
  })
})
