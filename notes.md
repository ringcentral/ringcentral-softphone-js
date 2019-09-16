## how to debug `RTCPeerConnection`

```js
// const rtcpc = new RTCPeerConnection({ iceServers: [{ urls: 'stun:74.125.194.127:19302' }] })

/* this is for debugging - start */
// const eventNames = [
//   'addstream', 'connectionstatechange', 'datachannel', 'icecandidate',
//   'iceconnectionstatechange', 'icegatheringstatechange', 'identityresult',
//   'negotiationneeded', 'removestream', 'signalingstatechange', 'track'
// ]
// for (const eventName of eventNames) {
//   rtcpc.addEventListener(eventName, e => {
//     console.log(`\n****** RTCPeerConnection ${eventName} event - start *****`)
//     console.log(e)
//     console.log(`****** RTCPeerConnection ${eventName} event - end *****\n`)
//   })
// }
/* this is for debugging - end */
```
