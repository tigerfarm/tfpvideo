console.log("+++ Set a video room to status: completed. This closes the room.");
var client = require('twilio')(process.env.MASTER_ACCOUNT_SID, process.env.MASTER_AUTH_TOKEN);

// client.video.rooms('this3')  // Or use the friendly name.
client.video.rooms('RMdca9f915c16414a089aad3fa747425c1')
    .update({status: 'completed'})
    .then(
    room => console.log(room)
    ).catch(error => console.error(error));
