/* eslint-env jest */
import RcMessage from '../src/rc-message'

describe('RcMessage', () => {
  test('fromXml and toXml', async () => {
    const xmlStr1 = 'P-rc: <Msg><Hdr SID="35464010666666" Req="{DF5D0099-C67B-42F5-9730-A1627616653A}" From="#1336666@sip.ringcentral.com:6666" To="17203866666*115" Cmd="6"/><Bdy SrvLvl="-149696666" SrvLvlExt="666" Phn="+16504306666" Nm="WIRELESS CALLER" ToPhn="+16504226666" ToNm="Tyler Liu" RecUrl=""/></Msg>'
    const rcMessage = RcMessage.fromXml(xmlStr1)
    expect(rcMessage.Hdr.From).toBe('#1336666@sip.ringcentral.com:6666')
    expect(rcMessage.Bdy.Nm).toBe('WIRELESS CALLER')
    const xmlStr2 = rcMessage.toXml()
    expect(xmlStr2).toBe(xmlStr1.substring(6))
  })
})
