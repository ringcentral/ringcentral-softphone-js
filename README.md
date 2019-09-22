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

- for node.js, check [here](./demos/node)
- for browser, check [here](./demos/browser)


## Demos

### Setup

```
yarn install
cp .env.sample .env
```

Edit `.env` file to specify credentials.


### Run

- for node.js `yarn server`
- for browser `yarn browser`


### Test

Make a phone call to the phone number you configured in `.env` file.

- for node.js, the app will auto pick up the call and redirect your voice to speaker.
- for browser, the app will auto pick up the call and redirect your voice to an `<audio/>` HTML5 element.


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

- hang up
- make outbound call
