import RingCentral from '@ringcentral/sdk'
import { MediaStream } from 'wrtc'
import RTCAudioStreamSource from 'node-webrtc-audio-stream-source'
import fs from 'fs'
import { exec } from 'child_process'

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
  softphone.on('track', e => {
    const text = 'Hello Tyler, you need to to give a talk to the AI RTC conference today at 3PM, don\'t forget!'
    const process = exec(`say -o temp.wav --data-format=LEI16@48000 "${text}"`)
    process.on('exit', () => {
      rtcAudioStreamSource.addStream(fs.createReadStream('temp.wav'), 16, 48000, 1)
    })
  })
})()
