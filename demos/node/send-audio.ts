import RingCentral from '@rc-ex/core';
// eslint-disable-next-line node/no-unpublished-import
import {MediaStream} from 'wrtc';
// eslint-disable-next-line node/no-unpublished-import
import RTCAudioStreamSource from 'node-webrtc-audio-stream-source';
import fs from 'fs';

import Softphone from '../../src/index';

const rc = new RingCentral({
  server: process.env.RINGCENTRAL_SERVER_URL,
  clientId: process.env.RINGCENTRAL_CLIENT_ID,
  clientSecret: process.env.RINGCENTRAL_CLIENT_SECRET,
});

(async () => {
  await rc.authorize({
    username: process.env.RINGCENTRAL_USERNAME,
    extension: process.env.RINGCENTRAL_EXTENSION,
    password: process.env.RINGCENTRAL_PASSWORD,
  });
  const softphone = new Softphone(rc);
  await softphone.register();
  await rc.revoke(); // rc is no longer needed

  const rtcAudioStreamSource = new RTCAudioStreamSource();
  const track = rtcAudioStreamSource.createTrack();
  const inputAudioStream = new MediaStream();
  inputAudioStream.addTrack(track);
  softphone.invite(process.env.CALLEE_FOR_TESTING, inputAudioStream);

  softphone.once('track', e => {
    rtcAudioStreamSource.addStream(
      fs.createReadStream('test.wav'),
      16,
      48000,
      1
    );
  });
})();
