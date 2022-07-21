console.log("+++ List all participants in all the active(in-progress) video rooms.");
var client = require('twilio')(process.env.MASTER_ACCOUNT_SID, process.env.MASTER_AUTH_TOKEN);

client.video.rooms.list()   // Default is status: in-progress.
        .then(rooms => rooms.forEach(
                    r => {
                        theRoom = r.uniqueName;
                        console.log("+ " + r.sid + " " + r.status + " " + r.uniqueName);
                        client.video.rooms(r.sid)
                                .update({status: 'completed'})
                                .then(
                                        room => console.log("++ Room completed: " + theRoom)
                                ).catch(error => console.error(error));
                    }
            ).catch(error => console.error(error)));
