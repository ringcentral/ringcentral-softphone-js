import RingCentral from '@rc-ex/core';
// // eslint-disable-next-line node/no-unpublished-import
// import wrtc from 'wrtc';
// import fs from 'fs';

import Softphone from '../../src/index';

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
  softphone.on('INVITE', async sipMessage => {
    softphone.answer(sipMessage);
    softphone.once('track', e => {
      console.log('on track');
      // const audioFilePath = 'audio.raw';
      // if (fs.existsSync(audioFilePath)) {
      //   fs.unlinkSync(audioFilePath);
      // }
      // const writeStream = fs.createWriteStream(audioFilePath, {flags: 'a'});
      // const audioSink = new wrtc.nonstandard.RTCAudioSink(e.track);
      // audioSink.ondata = (data: any) => {
      //   writeStream.write(Buffer.from(data.samples.buffer));
      // };
      softphone.once('BYE', () => {
        console.log('on bye');
        // audioSink.stop();
        // writeStream.end();
      });
    });
  });
})();
// You can play the saved audio by: play -b 16 -e signed -c 1 -r 48000 audio.raw
