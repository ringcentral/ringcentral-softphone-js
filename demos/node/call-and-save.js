import RingCentral from '@ringcentral/sdk'
import { nonstandard, MediaStream } from 'wrtc'
import fs from 'fs'
import RTCAudioStreamSource from 'node-webrtc-audio-stream-source'

import Softphone from '../../src/index'

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

  const rtcAudioStreamSource = new RTCAudioStreamSource()
  const track = rtcAudioStreamSource.createTrack()
  const inputAudioStream = new MediaStream()
  inputAudioStream.addTrack(track)
  softphone.invite(process.env.CALLEE_FOR_TESTING, inputAudioStream)

  softphone.once('track', e => {
    const audioFilePath = 'audio.raw'
    if (fs.existsSync(audioFilePath)) {
      fs.unlinkSync(audioFilePath)
    }
    const writeStream = fs.createWriteStream(audioFilePath, { flags: 'a' })
    const audioSink = new nonstandard.RTCAudioSink(e.track)
    audioSink.ondata = data => {
      writeStream.write(Buffer.from(data.samples.buffer))
    }
    softphone.once('BYE', () => {
      audioSink.stop()
      writeStream.end()
    })
  })
})()
// You can play the saved audio by: play -b 16 -e signed -c 1 -r 48000 audio.raw
