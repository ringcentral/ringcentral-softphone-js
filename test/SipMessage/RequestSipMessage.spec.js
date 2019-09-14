/* eslint-env jest */
import RequestSipMessage from '../../src/SipMessage/outbound/RequestSipMessage'
import { version } from '../../package.json'

describe('RequestSipMessage', () => {
  test('Register', async () => {
    const requestSipMessage = new RequestSipMessage('REGISTER sip:sip.ringcentral.com SIP/2.0', {
      CSeq: '8145 REGISTER',
      'Call-ID': '9968cdcb-70a2-4275-9cd2-f50d42343b6e',
      Contact: '<sip:db228b2d-10a2-4a61-aeb1-3e5697c4348e@f00b012e-4b95-45dc-a530-27e04537b158.invalid;transport=ws>;expires=600',
      From: '<sip:17203861294*115@sip.ringcentral.com>;tag=ab6de166-c075-4fc8-9f83-1129199d1b25',
      To: '<sip:17203861294*115@sip.ringcentral.com>',
      Via: 'SIP/2.0/WSS f00b012e-4b95-45dc-a530-27e04537b158.invalid;branch=z9hG4bKf91a2558-5eb4-4e6a-a8db-d23f2b8d59a3'
    })
    expect(requestSipMessage.subject).toBe('REGISTER sip:sip.ringcentral.com SIP/2.0')
    expect(requestSipMessage.headers).toEqual({
      'User-Agent': `ringcentral-softphone-js/${version}`,
      'Max-Forwards': 70,
      CSeq: '8145 REGISTER',
      Via: 'SIP/2.0/WSS f00b012e-4b95-45dc-a530-27e04537b158.invalid;branch=z9hG4bKf91a2558-5eb4-4e6a-a8db-d23f2b8d59a3',
      From: '<sip:17203861294*115@sip.ringcentral.com>;tag=ab6de166-c075-4fc8-9f83-1129199d1b25',
      To: '<sip:17203861294*115@sip.ringcentral.com>',
      'Call-ID': '9968cdcb-70a2-4275-9cd2-f50d42343b6e',
      Contact: '<sip:db228b2d-10a2-4a61-aeb1-3e5697c4348e@f00b012e-4b95-45dc-a530-27e04537b158.invalid;transport=ws>;expires=600',
      'Content-Length': 0
    })
    expect(requestSipMessage.body).toBe('')
  })
})
