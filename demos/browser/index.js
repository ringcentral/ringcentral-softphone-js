import RingCentral from '@ringcentral/sdk'
import { Component } from 'react-subx'
import ReactDOM from 'react-dom'
import React from 'react'

import Softphone from '../../src/index'
import _store from './store'

const rc = new RingCentral({
  server: process.env.RINGCENTRAL_SERVER_URL,
  clientId: process.env.RINGCENTRAL_CLIENT_ID,
  clientSecret: process.env.RINGCENTRAL_CLIENT_SECRET
})
let softphone
;(async () => {
  await rc.login({
    username: process.env.RINGCENTRAL_USERNAME,
    extension: process.env.RINGCENTRAL_EXTENSION,
    password: process.env.RINGCENTRAL_PASSWORD
  })
  softphone = new Softphone(rc)
  await softphone.register()
  await rc.logout() // rc is no longer needed
  _store.ready = true

  const audioElement = document.getElementById('audio')
  softphone.on('INVITE', async sipMessage => {
    _store.ringing = true
    _store.inviteSipMessage = sipMessage
    softphone.once('track', e => {
      audioElement.srcObject = e.streams[0]
      softphone.once('BYE', () => {
        audioElement.srcObject = null
      })
    })
    softphone.once('CANCEL', e => {
      _store.ringing = false
      delete _store.inviteSipMessage
    })
  })
})()

// const answer = async () => {
//   const inputAudioStream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false })
//   softphone.answer(store.inviteSipMessage, inputAudioStream)
// }

class App extends Component {
  render () {
    const store = this.props.store
    return (
      <>
        <h1>RingCentral Softphone Demo</h1>
        {store.ready ? (store.busy ? <Calling store={store} /> : <Home store={store} />) : <Initializing store={store} />}
      </>
    )
  }
}

class Initializing extends Component {
  render () {
    return <div>Initializing</div>
  }
}

class Home extends Component {
  constructor (props) {
    super(props)
    this.state = {
      calleeNumber: null
    }
  }

  render () {
    const store = this.props.store
    return (
      <>
        <h2>
          You can make an inbound call by calling
          &nbsp;{process.env.RINGCENTRAL_USERNAME}{process.env.RINGCENTRAL_EXTENSION.length > 0 ? ` * ${process.env.RINGCENTRAL_EXTENSION}` : ''}
        </h2>
        <h2>You can make an outbound call here:
          &nbsp;<input placeholder='16508888888' type='number' onChange={e => this.setState({ calleeNumber: e.target.value })} />
          &nbsp;<button disabled={this.state.calleeNumber === null || this.state.calleeNumber.length < 10} onClick={e => console.log(typeof this.state.calleeNumber)}>Call</button>
        </h2>
        {store.ringing ? <Ringing /> : ''}
      </>
    )
  }
}

class Calling extends Component {
  render () {
    return <div>Call in progress</div>
  }
}

class Ringing extends Component {
  render () {
    return <h2>Incoming call</h2>
  }
}

ReactDOM.render(<App store={_store} />, document.getElementById('container'))
