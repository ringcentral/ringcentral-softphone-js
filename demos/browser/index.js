import RingCentral from '@ringcentral/sdk'
import { Component } from 'react-subx'
import ReactDOM from 'react-dom'
import React from 'react'

import Softphone from '../../src/index'
import store from './store'

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
  store.ready = true

  const audioElement = document.getElementById('audio')
  softphone.on('INVITE', async sipMessage => {
    store.busy = true
    store.ringing = true
    store.inviteSipMessage = sipMessage
    softphone.once('track', e => {
      audioElement.srcObject = e.streams[0]
      softphone.once('BYE', () => {
        audioElement.srcObject = null
      })
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
        <h1>RingCentral Softphone SDK official demo</h1>
        {store.ready ? (store.busy ? <Calling store={store} /> : <Home />) : <Initializing />}
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
      </>
    )
  }
}

class Calling extends Component {
  render () {
    const store = this.props.store
    return <div>{store.ringing ? 'Ringing' : 'Call in progress'}</div>
  }
}

ReactDOM.render(<App store={store} />, document.getElementById('container'))
