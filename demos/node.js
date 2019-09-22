import RingCentral from '@ringcentral/sdk'
import fs from 'fs'
import { nonstandard } from 'wrtc'
import mediaDevices from 'node-webrtc-media-devices'

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
  let audioStream
  const audioPath = 'audio.raw'
  if (fs.existsSync(audioPath)) {
    fs.unlinkSync(audioPath)
  }
  softphone.on('INVITE', async sipMessage => {
    softphone.on('track', e => {
      audioSink = new RTCAudioSink(e.track)
      audioStream = fs.createWriteStream(audioPath, { flags: 'a' })
      audioSink.ondata = data => {
        audioStream.write(Buffer.from(data.samples.buffer))
      }
    })
    const inputAudioStream = mediaDevices.getUserMedia({ audio: true, video: false })
    await softphone.answer(inputAudioStream)
    mediaDevices.startAudio()
  })
  softphone.on('BYE', () => {
    mediaDevices.stopAudio()
    audioSink.stop()
    audioStream.end()
  })
})()
