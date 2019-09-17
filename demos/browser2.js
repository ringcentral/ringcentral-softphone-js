import RingCentral from '@ringcentral/sdk'

import Softphone from '../src/index'

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

  const audioElement = document.getElementById('audio')
  softphone.on('INVITE', sipMessage => {
    softphone.answer()
    softphone.on('track', e => {
      audioElement.srcObject = e.streams[0]
      audioElement.play()
    })
  })
  softphone.on('BYE', () => {
    audioElement.pause()
    audioElement.srcObject = null
  })
})()
