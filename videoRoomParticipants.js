console.log("+++ Fetch a video room's information.");
var client = require('twilio')(process.env.MASTER_ACCOUNT_SID, process.env.MASTER_AUTH_TOKEN);

// client.video.rooms('this3')
client.video.rooms('RMdca9f915c16414a089aad3fa747425c1')
      .participants
      .list({status: 'connected', limit: 20})
    .then(
    participants => participants.forEach(p => console.log(p.sid + " " + p.identity))
    ).catch(error => console.error(error));
