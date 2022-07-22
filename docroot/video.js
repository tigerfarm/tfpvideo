// -----------------------------------------------------------------
// Basic Twilio Video Client
// 
// To do:
//  Move than 2 participants in a room.
//  Audio mute/unmute during a session.
//  Video on/off during a session.
//  Screen sharing.
//  Backgrounds.
//  
// -----------------------------------------------------------------
var theToken = "";
var roomName = "";
var clientId = "";

// -----------------------------------------------------------------
function log(message) {
    var aTextarea = document.getElementById('logBox');
    aTextarea.value += "\n> " + message;
    aTextarea.scrollTop = aTextarea.scrollHeight;
}
function logger(message) {
    var aTextarea = document.getElementById('logBox');
    aTextarea.value += "\n> " + message;
    aTextarea.scrollTop = aTextarea.scrollHeight;
}
function clearTextAreas() {
    logBox.value = "+ Ready";
}

// -----------------------------------------------------------------------------
// Track functions

var activeRoom = null;
var previewTracks = false;

function previewLocalTracks() {
    if (previewTracks) {
        log("+ Already previewing LocalParticipant's Tracks.");
        return;
    }
    // https://www.twilio.com/docs/video/javascript-getting-started#display-a-camera-preview
    log("+ Preview LocalParticipant's Tracks.");
    // This confirms that the camera and mic are available.
    Twilio.Video.createLocalVideoTrack().then(track => {
        const localMediaContainer = document.getElementById('local-media');
        localMediaContainer.appendChild(track.attach());
        previewTracks = true;
    }, function (error) {
        log('- Unable to access Camera and Microphone: ' + error);
    });
}

// Attach the Participant's Tracks to the DOM.
// Documentation: https://www.twilio.com/docs/video/javascript-getting-started#display-a-remote-participants-video
// Tutorial: https://www.twilio.com/docs/video/tutorials/get-started-with-twilio-video-node-express-frontend#display-data-from-tracks
function attachParticipantTracks(participant) {
    // DIV for remote participants.
    var remoteParticipantContainer = document.getElementById('remote-media-div');
    //
    // create a div for this participant's tracks
    var participantDiv = document.createElement("div");
    participantDiv.setAttribute("id", participant.identity);
    remoteParticipantContainer.appendChild(participantDiv);
    theParticipantDiv = document.getElementById(participant.identity);
    //
    participant.tracks.forEach(publication => {
        if (publication.isSubscribed) {
            log("+ participantConnected, track published, isSubscribed: " + publication.track.kind);
            const track = publication.track;
            // From Documentation, Old: remoteParticipantContainer.appendChild(track.attach());
            // From Tutorial:
            theParticipantDiv.appendChild(track.attach());
        }
    });
    participant.on('trackSubscribed', track => {
        log("++ " + participant.identity + ", trackSubscribed: " + track.kind);
        theParticipantDiv.appendChild(track.attach());
        // From Documentation, Old: document.getElementById('remote-media-div').appendChild(track.attach());
    });
}

// -----------------------------------------------------------------------------
// Room functions

function joinRoom() {
    if (!previewTracks && setCamera) {
        // Attach LocalParticipant's Tracks, if not already attached.
        previewLocalTracks();
    }
    log("+ joinRoom,  room: " + roomName + ", Camera:" + setCamera + " Mic:" + setMic + " Token:" + theToken + ":");
    var connectOptions = {
        name: roomName,
        video: setCamera, // { width: 800 }
        baudio: setMic,
        logLevel: 'debug'
    };
    // Documentation: https://www.twilio.com/docs/video/javascript-getting-started#connect-to-a-room
    Twilio.Video.connect(theToken, connectOptions).then(room => {
        log("+ Connect, join a room: " + roomName);
        roomJoined(room);
    }, error => {
        console.error('- Could not connect to Twilio: ' + error.message);
    });

}

function roomJoined(room) {
    window.room = activeRoom = room;
    log("++ Joined as: " + clientId + ", activeRoom join: " + activeRoom);
    document.getElementById('button-join').style.display = 'none';
    document.getElementById('button-leave').style.display = 'inline';

    // Attach LocalParticipant's Tracks, if not already attached.
    if (!previewTracks) {
        previewLocalTracks();
    }
    // ----------------------------------------------------
    // Attach the Tracks of the Room's Participants.
    room.participants.forEach(function (participant) {
        log("++ Already in Room: " + participant.identity);
        attachParticipantTracks(participant);
    });

    // ----------------------------------------------------
    // Room events

    // New participant connects to the room.
    room.on('participantConnected', function (participant) {
        log("+ participantConnected: " + participant.identity);
        var remoteContainer = document.getElementById('remote-media');
        attachParticipantTracks(participant, remoteContainer);
    });
    // Participant leaves the Room.
    room.on('participantDisconnected', function (participant) {
        log("+ Participant: " + participant.identity + ", left the room: " + roomName);
        //
        // Stacy
        // stop listening for this participant
        participant.removeAllListeners();
        // remove this participant's div from the page
        const participantDiv = document.getElementById(participant.identity);
        participantDiv.remove();
    });
    // You leave the room.
    room.on('disconnected', function () {
        log('+ You, left the room: ' + roomName);
        // 
        // ----------------------------------------
        // Detach the local media elements
        // Documentation: https://www.twilio.com/docs/video/javascript-getting-started#disconnect-from-a-room
        if (previewTracks) {
            log('+ Detach local tracks.');
            const mediaContainer = document.getElementById('local-media');
            room.localParticipant.tracks.forEach(publication => {
                log('++ Detach local track: ' + publication.track.kind);
                const attachedElements = publication.track.detach();
                // attachedElements.forEach(element => element.remove());  // Stacy, documentation command didn't work
                mediaContainer.firstChild.remove();
            });
            previewTracks = false;
        }
        // ----------------------------------------
        // Remove remote participant DIVs.
        //
        var remoteParticipantContainer = document.getElementById('remote-media-div');
        // Remove DIVs under remoteParticipantContainer which are the participant's DIVs.
        var elements = remoteParticipantContainer.children;
        log('+ Number of remote participant DIVs to remove: ' + elements.length);
        if (elements.length === 0) {
            log('++ No participant tracks to remove.');
        } else {
            log('++ Remove participant DIV: ' + elements[0].id);
            var participantDiv = document.getElementById(elements[0].id);
            participantDiv.remove();
            log('++ Participant DIVs removed.');
        }
        // ----------------------------------------
        activeRoom = null;
        document.getElementById('button-join').style.display = 'inline';
        document.getElementById('button-leave').style.display = 'none';
        log("+ You're disconnected from the room.");
    });

}

// -----------------------------------------------------------------------------
function listDevices() {
    log("+ listDevices()");
    navigator.mediaDevices.enumerateDevices().then(devices => {
        const videoInput = devices.find(device => device.kind === 'videoinput');
        log("++ " + videoInput.deviceId);
    });
    // reference: https://www.twilio.com/blog/2018/04/choosing-cameras-javascript-mediadevices-api.html
    navigator.mediaDevices.enumerateDevices().then(devices => {
        devices.forEach((device) => {
            log("++ " + device.kind + " : " + device.deviceId);
        });
    });
}

// -----------------------------------------------------------------------------
// Local Media
// Documentation: https://www.twilio.com/docs/video/javascript-getting-started#set-up-local-media

var setCamera = true;
var setMic = true;

function toggleCamera() {
    if (setCamera) {
        log('Camera set OFF');
        setCamera = false;
        $("#button-camera").html('Set Camera ON');
        return;
    }
    log('Camera set ON');
    setCamera = true;
    $("#button-camera").html('Set Camera OFF');
}
function toggleMic() {
    if (setMic) {
        log('Mic set OFF');
        setMic = false;
        $("#button-Mic").html('Set Mic ON');
        return;
    }
    log('Mic set ON');
    setMic = true;
    $("#button-Mic").html('Set Mic OFF');
}

// -----------------------------------------------------------------------------
function leaveRoomIfJoined() {
    if (activeRoom) {
        activeRoom.disconnect;
    }
}

// -----------------------------------------------------------------------------
// Activity log.
window.onload = function () {
    log('+++ Start.');

    // When transitioning away from this page, disconnect from the room, if joined.
    window.addEventListener('beforeunload', leaveRoomIfJoined);

    document.getElementById('room-controls').style.display = 'block';

    // Bind button to join Room.
    document.getElementById('button-join').onclick = function () {
        roomName = document.getElementById('roomid').value;
        clientId = document.getElementById('clientid').value;
        if (clientId === "") {
            log("++ Enter participant identity.");
            return;
        }
        if (roomName === "") {
            log("++ Enter a room name.");
            return;
        }
        log("Using participant id: " + clientId + ".");
        log("Using room name: " + roomName + ".");
        if (theToken !== "") {
            joinRoom();
        } else {
            $.get("getToken?identity=" + clientId + "&roomid=" + roomName, function (gotToken) {
                theToken = gotToken.trim();
                log("+ New token, theToken: " + theToken);
                joinRoom();
            }).fail(function () {
                log("- Error getting new token.");
                return;
            });
        }
    };

    // Bind button to leave Room.
    // Documentation: https://www.twilio.com/docs/video/javascript-getting-started#disconnect-from-a-room
    document.getElementById('button-leave').onclick = function () {
        log('Click button to leave the room: ' + roomName);
        activeRoom.disconnect();
    };

    // Preview LocalParticipant's Tracks.
    // Documentation: https://www.twilio.com/docs/video/javascript-getting-started#set-up-local-media
    document.getElementById('button-preview').onclick = function () {
        previewLocalTracks();
    };
};

// -----------------------------------------------------------------------------
// -----------------------------------------------------------------------------
// Individual track handling, not updated.
// 
// Attach the Tracks to the DOM.
function attachTracks(tracks, container) {
    tracks.forEach(function (track) {
        container.appendChild(track.attach());
    });
}
// Detach the Tracks from the DOM.
function detachTracks(tracks) {
    tracks.forEach(function (track) {
        track.detach().forEach(function (detachedElement) {
            detachedElement.remove();
        });
    });
}

function doConnect() {
    // This will go up into "Room events" section.
    // "doConnect()" is just a place holder.
    // 
    // ----------------------------------------------------
    // Individual track handling, not yet updated.
    // Participant Track added.
    room.on('trackAdded', function (track, participant) {
        log(participant.identity + "++ added track: " + track.kind);
        var previewContainer = document.getElementById('remote-media');
        attachTracks([track], previewContainer);
    });
    // Participant Track removed.
    room.on('trackRemoved', function (track, participant) {
        log(participant.identity + " removed track: " + track.kind);
        detachTracks([track]);
    });
}
// -----------------------------------------------------------------------------
