// -----------------------------------------------------------------
// code
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
function attachParticipantTracks(participant) {
    var remoteParticipantContainer = document.getElementById('remote-media-div');
    participant.tracks.forEach(publication => {
        if (publication.isSubscribed) {
            log("+ participantConnected, track published, isSubscribed: " + publication.track.kind);
            const track = publication.track;
            remoteParticipantContainer.appendChild(track.attach());
        }
    });
    participant.on('trackSubscribed', track => {
        log("++ participantConnected: " + participant.identity + ", trackSubscribed: " + track.kind);
        document.getElementById('remote-media-div').appendChild(track.attach());
    });
}

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

// -----------------------------------------------------------------------------
// Room functions

function joinRoom() {
    log("+ joinRoom,  room: " + roomName + ", Camera:" + setCamera + " Mic:" + setMic + " Token:" + theToken + ":");
    var connectOptions = {
        name: roomName,
        video: setCamera, // { width: 800 }
        baudio: setMic,
        logLevel: 'debug'
    };
    // Documentation: https://www.twilio.com/docs/video/javascript-getting-started#connect-to-a-room
    // Twilio.Video.connect(theToken, connectOptions).then(roomJoined, function (error) {
    //     log('Could not connect to Twilio: ' + error.message);
    // });
    Twilio.Video.connect(theToken, connectOptions).then(room => {
        log("+ Successfully joined a Room: " + roomName);
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

    // New participant
    room.on('participantConnected', function (participant) {
        log("++ participantConnected: " + participant.identity);
        var remoteContainer = document.getElementById('remote-media');
        attachParticipantTracks(participant, remoteContainer);
    });
    // Participant leaves the Room.
    room.on('participantDisconnected', function (participant) {
        log("+ Participant: " + participant.identity + ", left the room: " + roomName);
        //
        // Stacy, detach the Participant's Tracks from the DOM.
        // For now, detach the firstChild, which needs to run twice for some reason.
        log('+ Detach Participant tracks.');
        document.getElementById('remote-media-div').firstChild.remove();
        document.getElementById('remote-media-div').firstChild.remove();
    });
    // ----------------------------------------------------
    // You leave the room.
    room.on('disconnected', function () {
        log('+ You, left the room: ' + roomName);
        //
        // Stacy, need to remove remote participant DOM elements.
        // 
        // Detach the local media elements
        // Documentation: https://www.twilio.com/docs/video/javascript-getting-started#disconnect-from-a-room
        if (previewTracks) {
            log('+ Detach local tracks.');
            const mediaContainer = document.getElementById('local-media');
            room.localParticipant.tracks.forEach(publication => {
                log('++ Detach local track: ' + publication.track.kind);
                const attachedElements = publication.track.detach();
                // attachedElements.forEach(element => element.remove());  // Stacy, didn't work
                mediaContainer.firstChild.remove();
            });
            // https://www.w3schools.com/jsref/prop_node_firstchild.asp
            // 
            // const element = document.getElementById("demo");
            // element.remove();
            // 
            // let theFirstChild = document.getElementById("local-media").firstChild
            // 
            // Twilio.Video.createLocalVideoTrack().then(track => {
            //      const localMediaContainer = document.getElementById('local-media');
            //      localMediaContainer.appendChild(track.attach());
            //      previewTracks = true;
            // }
            previewTracks = false;
        }
        //
        activeRoom = null;
        document.getElementById('button-join').style.display = 'inline';
        document.getElementById('button-leave').style.display = 'none';
    }
    );

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

function leaveRoomIfJoined() {
    if (activeRoom) {
        activeRoom.disconnect;
    }
}

// -----------------------------------------------------------------------------
function listDevices() {
    log("listDevices:");
    navigator.mediaDevices.enumerateDevices().then(devices => {
        const videoInput = devices.find(device => device.kind === 'videoinput');
        // log("+ " + videoInput.deviceId);
        // return createLocalTracks({ audio: true, video: { deviceId: videoInput.deviceId } });

    });
    // reference: https://www.twilio.com/blog/2018/04/choosing-cameras-javascript-mediadevices-api.html
    navigator.mediaDevices.enumerateDevices().then(devices => {
        devices.forEach((device) => {
            log("+ " + device.kind + " : " + device.deviceId);
        });
    });
}

// -----------------------------------------------------------------------------
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
        if (roomName === "") {
            log("++ Enter a room name.");
            return;
        }
        if (clientId === "") {
            log("++ Enter participant identity.");
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
        log('Leave the room: ' + roomName);
        activeRoom.disconnect();
    };

    // Preview LocalParticipant's Tracks.
    // Documentation: https://www.twilio.com/docs/video/javascript-getting-started#set-up-local-media
    document.getElementById('button-preview').onclick = function () {
        previewLocalTracks();
    };
};

// -----------------------------------------------------------------------------
