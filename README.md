# RingCentral Softphone SDK for JavaScript

## What are the differences between ringcentral-web-phone and this project?

[ringcentral-web-phone](https://github.com/ringcentral/ringcentral-web-phone) is designed for client side and only works with browsers.

This project was originally designed for server and desktop. It doesn't require a browser to run. It could run in browser too.


## Supported features:

- Answer inbound call
- Make outbound call
- Speak and listen, two way communication
- Call control features
    - Redirect inbound call to voicemail
    - Ignore inbound call


## Demos

- [browser demo](./demos/browser)
- node.js
    - [answer inbound call](./demos/node/answer-and-talk.js)
    - [make outbound call](./demos/node/outbound-call.js)
    - [redirect inbound call to voicemail](./demos/node/to-voicemail.js)
    - [ignore inbound call](./demos/node/ignore.js)
- [call supervise](https://github.com/tylerlong/ringcentral-call-supervise-demo)
    - supervise an existing phone call and get real time audio stream


## Install

```
yarn add ringcentral-softphone @ringcentral/sdk
```

For node.js you also need to:

```
yarn add ws wrtc
```


## Usage

- for node.js, check [here](./demos/node)
- for browser, check [here](./demos/browser)


## Get realtime inbound audio

```js
import { nonstandard } from 'wrtc'

softphone.once('track', e => {
  const audioSink = new nonstandard.RTCAudioSink(e.track)
  audioSink.ondata = data => {
    // here you have the `data`
  }
  softphone.once('BYE', () => {
    audioSink.stop()
  })
})
```

The data you got via `audioSink.ondata` is of the following structure:

```js
{
  samples: Int16Array [ ... ],
  bitsPerSample: 16,
  sampleRate: 48000,
  channelCount: 1,
  numberOfFrames: 480,
  type: 'data'
}
```

Please note that, you may get different numbers, for example, `sampleRate` you get might be 16000 instead of 48000.


## Official demos

### Setup

```
yarn install
cp .env.sample .env
```

Edit `.env` file to specify credentials.

- `CALLEE_FOR_TESTING` is a phone number to receive testing phone calls. You don't need to specify it if you do not make outbound calls.
- If you have `WEB_SOCKET_DEBUGGING=true`, then all WebSocket traffic will be printed to console.


### Run

- for node.js `yarn server`
- for browser `yarn browser`


### Test

Make a phone call to the phone number you configured in `.env` file. The demo app will answer the call and you can speak and listen.


## Interesting Use cases

### Call supervision

Let's say there is a phone call ongoing between a customer and the call agent.
You can use this library to supervise this phone call to get live audio stream.
You can analyze the audio stream using some AI algorithm and provide tips to the call agent in real time.


### Live transcription

Use this library to supervise an existing phone call to get live audio stream.
Translate the audio stream into text by invoking some speech-to-text service.
Show the text to the caller and/or callee so they can see live transcription.


### Play recorded audio

You can create a program to make a phone call or answer a phone call and play recorded audio.
This is good for announcement purpose. This is also good for quick voicemail drop.
Or you can use text-to-speech service to read text to the callee.


## Todo

- Keep SIP sessoin alive
- How to create a publish message
- How to forward a call
- Multiple inbound call conflicts
- Hang up:

```
BYE sip:+16504306662@104.245.57.183:8083;transport=wss SIP/2.0
Via: SIP/2.0/WSS lvlnn8gadc4t.invalid;branch=z9hG4bK1073489
Max-Forwards: 70
To: <sip:+16504306662@104.245.57.183:8083;transport=wss>;tag=10.13.20.229-5070-28258043d5e447
From: <sip:17203861294*115@50.237.72.154>;tag=vvaunssuc8
Call-ID: ed884e8cfc9c4f3882bb8029dc889fa7
CSeq: 260861000 BYE
Supported: outbound
User-Agent: WebPhoneDemo/1.0.0 Macintosh-Intel-Mac-OS-X-10_14_5 RCWEBPHONE/0.7.2
Content-Length: 0
```

- ACK message contact header should be in subsequent messages' subjects
    - need to design the code
