console.log("+++ Fetch a video room's information.");
var client = require('twilio')(process.env.MASTER_ACCOUNT_SID, process.env.MASTER_AUTH_TOKEN);

// client.video.rooms('this3')
client.video.rooms('RM1c14b67f5cceb96e519d83382a3a9168')
    .fetch()
    .then(
    room => console.log(room)
    ).catch(error => console.error(error));

