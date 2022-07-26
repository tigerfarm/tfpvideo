// -----------------------------------------------------------------------------
// Local Media
//  Needs further implementation and testing
//  
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
// 
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