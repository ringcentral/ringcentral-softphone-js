import RingCentral from '@ringcentral/sdk'
import { nonstandard } from 'wrtc'
import mediaDevices from 'node-webrtc-media-devices'
import Speaker from 'speaker'
import { Readable } from 'stream'

import Softphone from '../src/index'

const { RTCAudioSink } = nonstandard

const rc = new RingCentral({
  server: process.env.RINGCENTRAL_SERVER_URL,
  clientId: process.env.RINGCENTRAL_CLIENT_ID,
  clientSecret: process.env.RINGCENTRAL_CLIENT_SECRET
})

;(async () => {
  await rc.login({
    username: process.env.RINGCENTRAL_USERNAME,
    extension: process.env.RINGCENTRAL_EXTENSION,
    password: process.env.RINGCENTRAL_PASSWORD
  })
  const softphone = new Softphone(rc)
  await softphone.register()
  await rc.logout() // rc is no longer needed

  let audioSink
  let readable
  softphone.on('INVITE', async sipMessage => {
    softphone.on('track', e => {
      audioSink = new RTCAudioSink(e.track)
      const speaker = new Speaker({
        channels: 1,
        bitDepth: 16,
        sampleRate: 48000,
        signed: true
      })
      readable = new Readable()
      readable._read = () => {}
      readable.pipe(speaker)
      audioSink.ondata = data => {
        readable.push(Buffer.from(data.samples.buffer))
      }
    })
    const inputAudioStream = await mediaDevices.getUserMedia({ audio: true, video: false })
    softphone.answer(inputAudioStream)
  })
  softphone.on('BYE', () => {
    audioSink.stop()
    readable.push(null)
  })
})()
