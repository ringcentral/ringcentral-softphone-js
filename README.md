# RingCentral Softphone SDK for JavaScript


## Experimental

This project is still in its early stage. It is not ready for production yet!


## Setup

```
yarn install
cp .env.sample .env
```

Edit `.env` file to specify credentials.

Note: please do NOT get rid of `NODE_TLS_REJECT_UNAUTHORIZED=0` in `.env` file. It is required for WebSocket to work without a TLS certificate installed on your laptop.


## Run

```
yarn start
```

## Test

Make a phone call to the phone number you configured in `.env` file.

The app will auto pick up the call and save your voice to `temp.raw`

You can play `test.raw` file by command line

```
play -b 16 -e signed -c 1 -r 48000 temp.raw
```

If `play` command is not available, please install `sox`: `brew install sox`.


## What's the difference between ringcentral-web-phone and this project?

[ringcentral-web-phone](https://github.com/ringcentral/ringcentral-web-phone) is designed for client side and only works with browsers.

This project is designed for server or desktop and works without a browser.


## Todo

- state machine
- make outbound call
