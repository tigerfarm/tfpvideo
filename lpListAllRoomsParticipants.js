console.log("+++ List all participants in all the active(in-progress) video rooms.");
var client = require('twilio')(process.env.MASTER_ACCOUNT_SID, process.env.MASTER_AUTH_TOKEN);

client.video.rooms.list()   // Default is status: in-progress.
        .then(rooms => rooms.forEach(
                    r => {
                        console.log("+ " + r.sid + " " + r.status + " " + r.uniqueName);
                        client.video.rooms(r.sid)
                                .participants
                                .list({status: 'connected', limit: 20})
                                .then(
                                        participants => participants.forEach(p => {
                                                console.log("++ " + p.sid + " " + p.identity);
                                            })
                                ).catch(error => console.error(error));
                    }
            ).catch(error => console.error(error)));
