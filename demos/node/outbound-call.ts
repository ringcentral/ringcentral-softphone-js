/* eslint-disable node/no-unpublished-import */
import RingCentral from '@rc-ex/core';
import mediaDevices from 'node-webrtc-media-devices';
import Speaker from 'speaker';
import wrtc from 'wrtc';

import Softphone from '../../src/index';

const {RTCAudioSink} = wrtc.nonstandard;

const rc = new RingCentral({
  server: process.env.RINGCENTRAL_SERVER_URL,
  clientId: process.env.RINGCENTRAL_CLIENT_ID,
  clientSecret: process.env.RINGCENTRAL_CLIENT_SECRET,
});

(async () => {
  await rc.authorize({
    username: process.env.RINGCENTRAL_USERNAME!,
    extension: process.env.RINGCENTRAL_EXTENSION,
    password: process.env.RINGCENTRAL_PASSWORD!,
  });
  const softphone = new Softphone(rc);
  await softphone.register();
  await rc.revoke(); // rc is no longer needed
  softphone.on('track', e => {
    const speaker = new Speaker({
      channels: 1,
      bitDepth: 16,
      sampleRate: 48000,
      // signed: true,
    });
    const audioSink = new RTCAudioSink(e.track);
    audioSink.ondata = (data: any) => {
      speaker.write(Buffer.from(data.samples.buffer));
    };
    softphone.once('BYE', () => {
      audioSink.stop();
      speaker.close(true);
    });
  });
  const inputAudioStream = await mediaDevices.getUserMedia({
    audio: true,
    video: false,
  });
  softphone.invite(process.env.CALLEE_FOR_TESTING!, inputAudioStream);
})();
