import md5 from 'blueimp-md5'
import uuid from 'uuid/v4'

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
  return `Digest algorithm=MD5, username="${username}", realm="${realm}", nonce="${nonce}", uri="sip:${realm}", response="${generateResponse(username, password, realm, method, `sip:${realm}`, nonce)}"`
}

/*
Sample output:
Proxy-Authorization: Digest algorithm=MD5, username="802396666666", realm="sip.ringcentral.com", nonce="yyyyyyy", uri="sip:+16508888888@sip.ringcentral.com", response="zzzzzzzzz"
*/
export const generateProxyAuthorization = (sipInfo, method, targetUser, nonce) => {
  const { authorizationId: username, password, domain: realm } = sipInfo
  return `Digest algorithm=MD5, username="${username}", realm="${realm}", nonce="${nonce}", uri="sip:${targetUser}@${realm}", response="${generateResponse(username, password, realm, method, `sip:${targetUser}@${realm}`, nonce)}"`
}

export const branch = () => 'z9hG4bK' + uuid()

export const enableWebSocketDebugging = ws => {
  ws.addEventListener('message', e => {
    console.log('\n***** WebSocket Receive - start *****')
    console.log(e.data)
    console.log('***** WebSocket Receive - end *****\n')
  })
  const send = ws.send.bind(ws)
  ws.send = (...args) => {
    console.log('\n***** WebSocket Send - start *****')
    console.log(...args)
    console.log('***** WebSocket Send - end *****\n')
    send(...args)
  }
}
