const mic = require('mic')

const sampleRate = 48000
const sliceSize = sampleRate / 100 // gives us 10 ms chunks
const channels = 1
const bitrate = 16

var micInstance = mic({
  endian: 'little',
  encoding: 'signed-integer',
  rate: sampleRate,
  channels: channels,
  bitwidth: bitrate
})

const { RTCAudioSource } = require('wrtc').nonstandard
const { MediaStream } = require('wrtc')

const source = new RTCAudioSource()
const track = source.createTrack()

let samples = new Int16Array(0)
const micInputStream = micInstance.getAudioStream()

// every time we get data from the mic append it to the existing buffer
micInputStream.on('data', function (data) {
  const newSamples = new Int16Array(data.buffer)
  const mergedSamples = new Int16Array(samples.length + newSamples.length)
  mergedSamples.set(samples)
  mergedSamples.set(newSamples, samples.length)
  samples = mergedSamples
})

micInstance.start()

setInterval(() => {
// if there's enough data to read slice off 10ms worth and pass it to the track
  if (samples.length >= sliceSize) {
    const sampleSlice = samples.slice(0, sliceSize)
    samples = samples.slice(sliceSize)
    source.onData({
      samples: sampleSlice,
      sampleRate: sampleRate,
      bitsPerSample: bitrate,
      channelCount: channels,
      numberOfFrames: sampleSlice.length
    })
  } else {
    console.log('buffer underrun detected')
  }
}, 10) // 10 ms chunks

// not shown: code that actually adds the track to a stream, etc

const stream = new MediaStream()
stream.addTrack(track)
export default stream
