import RingCentral from '@rc-ex/core'
import { nonstandard } from 'wrtc'
import fs from 'fs'

import Softphone from '../../src/index'

// This softphone demo can take multiple incoming call simultaneously!
// Each incoming calll will generate an audio file on the disk, with IDs as the file name.

const rc = new RingCentral({
  server: process.env.RINGCENTRAL_SERVER_URL,
  clientId: process.env.RINGCENTRAL_CLIENT_ID,
  clientSecret: process.env.RINGCENTRAL_CLIENT_SECRET
})

;(async () => {
  await rc.authorize({
    username: process.env.RINGCENTRAL_USERNAME,
    extension: process.env.RINGCENTRAL_EXTENSION,
    password: process.env.RINGCENTRAL_PASSWORD
  })
  const softphone = new Softphone(rc)
  await softphone.register()
  await rc.revoke() // rc is no longer needed
  softphone.on('INVITE', async sipMessage => {
    console.log(sipMessage.headers)
    softphone.answer(sipMessage)
    softphone.once('track', e => {
      const audioFilePath = `${sipMessage.headers['p-rc-api-ids']}.raw`
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
  })
})()
// You can play the saved audio by: play -b 16 -e signed -c 1 -r 48000 audio.raw
