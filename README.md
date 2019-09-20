# RingCentral Softphone SDK for JavaScript

## What are the differences between ringcentral-web-phone and this project?

[ringcentral-web-phone](https://github.com/ringcentral/ringcentral-web-phone) is designed for client side and only works with browsers.

This project was originally designed for server and desktop. It works both with and without browsers.


## Install

```
yarn add ringcentral-softphone @ringcentral/sdk
```

For node.js you also need to:

```
yarn add ws wrtc
```

because node.js by default doesn't support WebSocket & WebRTC.


## Usage

```js
import RingCentral from '@ringcentral/sdk'
import Softphone from 'ringcentral-softphpone'

const rc = new RingCentral(...)
await rc.login(...)
const softphone = new Softphone(rc)
await softphone.register()
await rc.logout()

// const stream = <input-audio-stream-from-microphone>

softphone.on('INVITE', sipMessage => {
  softphone.answer(stream)
  softphone.on('track', e => {
    // phone call connected
    const { track, streams } = e
    // you can get audio data from track and streams
  })
})
softphone.on('BYE', () => {
  // phone call ended
})
```


## Demos

### Setup

```
yarn install
cp .env.sample .env
```

Edit `.env` file to specify credentials.

Note: please do NOT get rid of `NODE_TLS_REJECT_UNAUTHORIZED=0` in `.env` file. It is required for WebSocket to work without a TLS certificate installed on your laptop.
You may remove it however if your app target browsers instead of node.js.


### Run

For node.js:

```
yarn server
```

For browsers:

```
yarn browser
```


### Test

Make a phone call to the phone number you configured in `.env` file.

#### for node.js

The app will auto pick up the call and save your voice to `audio.raw`

You can play `audio.raw` file by command line

```
play -b 16 -e signed -c 1 -r 48000 audio.raw
```

If `play` command is not available, please install sox: `brew install sox`.

#### for browsers

The app will auto pick up the call and redirect your voice to an `<audio/>` HTML5 element.


## Interesting Usage cases

### Call supervision

Let's say there is a phone call ongoing between a customer and the call agent.

You can use this library to supervise this phone call to get live audio stream.

You can analyze the audio stream using some AI algorithm and provide tips to the call agent in real time.


### Live transcription

Use this library to supervise an existing phone call to get live audio stream.

Translate the audio stream into text by invoking some speech-to-text service.

Show the text to the caller and/or callee so they can see live transcription.


## Todo

- make outbound call
