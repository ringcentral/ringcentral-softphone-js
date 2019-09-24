import RingCentral from '@ringcentral/sdk'
import mediaDevices from 'node-webrtc-media-devices'
import Speaker from 'speaker'
import { nonstandard } from 'wrtc'

import Softphone from '../../src/index'

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
  softphone.on('track', e => {
    const speaker = new Speaker({ channels: 1, bitDepth: 16, sampleRate: 48000, signed: true })
    const audioSink = new RTCAudioSink(e.track)
    audioSink.ondata = data => {
      speaker.write(Buffer.from(data.samples.buffer))
    }
    softphone.on('BYE', () => {
      audioSink.stop()
      speaker.close()
    })
  })
  softphone.on('registered', async () => {
    const inputAudioStream = await mediaDevices.getUserMedia({ audio: true, video: false })
    softphone.invite(process.env.CALLEE_FOR_TESTING, inputAudioStream)
  })
})()
