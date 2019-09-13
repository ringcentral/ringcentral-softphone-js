import crypto from 'crypto'

const md5 = str => crypto.createHash('md5').update(str).digest('hex')

const generateResponse = (username, password, realm, method, uri, nonce) => {
  const ha1 = md5(username + ':' + realm + ':' + password)
  const ha2 = md5(method + ':' + uri)
  const response = md5(ha1 + ':' + nonce + ':' + ha2)
  return response
}

/*
Sample input:
  const username = '802396666666'
  const password = 'xxxxxx'
  const realm = 'sip.ringcentral.com'
  const method = 'REGISTER'
  const nonce = 'yyyyyy'
*/
export const generateAuthorization = (sipInfo, method, nonce) => {
  const { authorizationId: username, password, domain: realm } = sipInfo
  return `Authorization: Digest algorithm=MD5, username="${username}", realm="${realm}", nonce="${nonce}", uri="sip:${realm}", response="${generateResponse(username, password, realm, method, `sip:${realm}`, nonce)}"`
}

/*
Proxy-Authorization: Digest algorithm=MD5, username="802396666666", realm="sip.ringcentral.com", nonce="yyyyyyy", uri="sip:+16508888888@sip.ringcentral.com", response="zzzzzzzzz"
*/
export const generateProxyAuthorization = (sipInfo, method, targetUser, nonce) => {
  const { authorizationId: username, password, domain: realm } = sipInfo
  return `Proxy-Authorization: Digest algorithm=MD5, username="${username}", realm="${realm}", nonce="${nonce}", uri="sip:${targetUser}@${realm}", response="${generateResponse(username, password, realm, method, `sip:${targetUser}@${realm}`, nonce)}"`
}

export const parseSipHeaders = sipMessage => {
  const headersStr = sipMessage.split('\r\n\r\n')[0]
  return Object.fromEntries(headersStr.split('\r\n').filter(line => line.includes(': ')).map(line => line.trim().split(': ')))
}

export const addHeader = (headerLine, lines) => {
  return [lines[0], headerLine, ...lines.slice(1)]
}
