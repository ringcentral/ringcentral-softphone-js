import RingCentral from '@rc-ex/core';

const rc = new RingCentral({
  clientId: process.env.RINGCENTRAL_CLIENT_ID,
  clientSecret: process.env.RINGCENTRAL_CLIENT_SECRET,
  server: process.env.RINGCENTRAL_SERVER_URL,
});

(async () => {
  await rc.authorize({
    username: process.env.RINGCENTRAL_USERNAME!,
    extension: process.env.RINGCENTRAL_EXTENSION,
    password: process.env.RINGCENTRAL_PASSWORD!,
  });
  console.log(JSON.stringify(rc.token, null, 2));
  await rc.post('/restapi/v1.0/client-info/sip-provision', {
    sipInfo: [{transport: 'WSS'}],
  });
  await rc.revoke();
})();
