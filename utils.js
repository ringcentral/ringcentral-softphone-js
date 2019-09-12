const MD5 = require('crypto-js/md5')
const DOMParser = require('xmldom').DOMParser
const R = require('ramda')

const generateResponse = (username, password, realm, method, uri, nonce) => {
  const ha1 = MD5(username + ':' + realm + ':' + password)
  const ha2 = MD5(method + ':' + uri)
  const response = MD5(ha1 + ':' + nonce + ':' + ha2)
  return response
}

/*
Sample input:
  const username = '802398776016'
  const password = 'zMT7PPA1g'
  const realm = 'sip.ringcentral.com'
  const method = 'REGISTER'
  const nonce = 'XXLbhV1y2lkhAnSTneLbX2xtVQbQIunG'
*/
const generateAuthorization = (sipInfo, method, nonce) => {
  const { authorizationId: username, password, domain: realm } = sipInfo
  return `Authorization: Digest algorithm=MD5, username="${username}", realm="${realm}", nonce="${nonce}", uri="sip:${realm}", response="${generateResponse(username, password, realm, method, `sip:${realm}`, nonce)}"`
}

/*
Proxy-Authorization: Digest algorithm=MD5, username="802398776016", realm="sip.ringcentral.com", nonce="XXVoNV11ZwleXD6JQCOPSV8StAHvrEYo", uri="sip:+16504306662@sip.ringcentral.com", response="baefc2cb1dd11d5e82726b773385f7b4"
*/
const generateProxyAuthorization = (sipInfo, method, targetUser, nonce) => {
  const { authorizationId: username, password, domain: realm } = sipInfo
  return `Proxy-Authorization: Digest algorithm=MD5, username="${username}", realm="${realm}", nonce="${nonce}", uri="sip:${targetUser}@${realm}", response="${generateResponse(username, password, realm, method, `sip:${targetUser}@${realm}`, nonce)}"`
}

/*
P-rc: <Msg><Hdr SID="35461544856848" Req="{8BB0E158-AD7E-4EB5-A51A-2AE4193E9003}" From="#1092016@sip.ringcentral.com:5060" To="17203861294*115" Cmd="6"/><Bdy SrvLvl="-149699523" SrvLvlExt="406" Phn="+16504306662" Nm="WIRELESS CALLER" ToPhn="+16504223279" ToNm="Tyler Liu" RecUrl=""/></Msg>
*/
const parseRcMessage = str => {
  if (str.startsWith('P-rc: ')) {
    str = str.substring(6)
  }
  const parser = new DOMParser()
  const xmlDoc = parser.parseFromString(str, 'text/xml')
  const hdrNode = xmlDoc.getElementsByTagName('Hdr')[0]
  const bdyNode = xmlDoc.getElementsByTagName('Bdy')[0]

  const Msg = { Hdr: {}, Bdy: {} }
  for (let i = 0; i < hdrNode.attributes.length; i++) {
    const attr = hdrNode.attributes[i]
    Msg.Hdr[attr.nodeName] = attr.nodeValue
  }
  for (let i = 0; i < bdyNode.attributes.length; i++) {
    const attr = bdyNode.attributes[i]
    Msg.Bdy[attr.nodeName] = attr.nodeValue
  }
  return Msg
}

const rcMessageToXml = Msg => {
  return '<Msg>' + Object.keys(Msg).map(Tag => `<${Tag} ${Object.keys(Msg[Tag]).map(Attr => `${Attr}="${Msg[Tag][Attr]}"`).join(' ')}/>`).join('') + '</Msg>'
}

const parseSipHeaders = sipMessage => {
  const headersStr = sipMessage.split('\r\n\r\n')[0]
  return R.fromPairs(headersStr.split('\r\n').filter(line => line.includes(': ')).map(line => line.trim().split(': ')))
}

module.exports = {
  generateAuthorization,
  generateProxyAuthorization,
  parseRcMessage,
  rcMessageToXml,
  parseSipHeaders
}
