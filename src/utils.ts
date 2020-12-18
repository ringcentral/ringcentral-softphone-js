import md5 from 'blueimp-md5';
import {v4 as uuid} from 'uuid';
import WebSocket from 'isomorphic-ws';

const generateResponse = (
  username: string,
  password: string,
  realm: string,
  method: string,
  uri: string,
  nonce: string
) => {
  const ha1 = md5(username + ':' + realm + ':' + password);
  const ha2 = md5(method + ':' + uri);
  const response = md5(ha1 + ':' + nonce + ':' + ha2);
  return response;
};

/*
Sample input:
const username = '802396666666'
const password = 'xxxxxx'
const realm = 'sip.ringcentral.com'
const method = 'REGISTER'
const nonce = 'yyyyyy'
*/
export type SipInfo = {
  authorizationId: string;
  password: string;
  domain: string;
  username: string;
  outboundProxy: string;
};
export const generateAuthorization = (
  sipInfo: SipInfo,
  method: string,
  nonce: string
) => {
  const {authorizationId: username, password, domain: realm} = sipInfo;
  return `Digest algorithm=MD5, username="${username}", realm="${realm}", nonce="${nonce}", uri="sip:${realm}", response="${generateResponse(
    username,
    password,
    realm,
    method,
    `sip:${realm}`,
    nonce
  )}"`;
};

/*
Sample output:
Proxy-Authorization: Digest algorithm=MD5, username="802396666666", realm="sip.ringcentral.com", nonce="yyyyyyy", uri="sip:+16508888888@sip.ringcentral.com", response="zzzzzzzzz"
*/
export const generateProxyAuthorization = (
  sipInfo: SipInfo,
  method: string,
  targetUser: string,
  nonce: string
) => {
  const {authorizationId: username, password, domain: realm} = sipInfo;
  return `Digest algorithm=MD5, username="${username}", realm="${realm}", nonce="${nonce}", uri="sip:${targetUser}@${realm}", response="${generateResponse(
    username,
    password,
    realm,
    method,
    `sip:${targetUser}@${realm}`,
    nonce
  )}"`;
};

export const branch = () => 'z9hG4bK' + uuid();

export const enableWebSocketDebugging = (ws: WebSocket) => {
  ws.addEventListener('message', (e: any) => {
    console.log(
      `\n***** WebSocket Receive - ${new Date()} - ${Date.now()} *****`
    );
    console.log(e.data);
    console.log('***** WebSocket Receive - end *****\n');
  });
  const send = ws.send.bind(ws);
  ws.send = (arg: any) => {
    console.log(`\n***** WebSocket Send - ${new Date()} - ${Date.now()} *****`);
    console.log(arg);
    console.log('***** WebSocket Send - end *****\n');
    send(arg);
  };
};

export const enableWebRtcDebugging = (rtcPeerConnection: RTCPeerConnection) => {
  const eventNames = [
    'addstream',
    'connectionstatechange',
    'datachannel',
    'icecandidate',
    'iceconnectionstatechange',
    'icegatheringstatechange',
    'identityresult',
    'negotiationneeded',
    'removestream',
    'signalingstatechange',
    'track',
  ];
  for (const eventName of eventNames) {
    rtcPeerConnection.addEventListener(eventName, (...args) => {
      console.log(
        `\n****** RTCPeerConnection "${eventName}" event - ${new Date()} - ${Date.now()} *****`
      );
      console.log(...args);
      console.log(
        `****** RTCPeerConnection "${eventName}" event - end *****\n`
      );
    });
  }
};
