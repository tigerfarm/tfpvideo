#### Application Files

+ [webserver.js](webserver.js) : a NodeJS Express HTTP Server that serves the client files 
and generates Twilio video tokens.
+ [docroot/index.html](docroot/index.html) : Client HTML, basic video client application
+ [docroot/video.js](docroot/video.js) : JavaScript code based on the
[documentation samples](https://www.twilio.com/docs/video/javascript-getting-started).
+ [docroot/video.css](docroot/video.css) : Web page styles and formatting
+ app.json and package.json, file descriptures for deploying to Heroku.

# Twilio JavaScript Video client web application 

In development. Mostly works.

To do:
+ Need to properly clean up DOM objects after leaving a room.
+ Need to properly clean up DOM objects after a remote participant leaves the room.
+ Mute and unmute audio.
+ Turn video track off and on.

[![Deploy to Heroku](https://www.herokucdn.com/deploy/button.svg)](https://heroku.com/deploy?template=https://github.com/tigerfarm/tfpvideo)

### Web Client Screen Print

<img src="tfpvideo.jpg" width="600"/>

--------------------------------------------------------------------------------
### Documentation Links

[Programmable Video Getting Started: JavaScript](https://www.twilio.com/docs/video/javascript-getting-started)
steps to create a video client web application.

Generate tokens documentation with a sample
[Node.JS program](https://www.twilio.com/docs/iam/access-tokens?code-sample=code-create-an-access-token-for-video&code-language=Node.js&code-sdk-version=3.x)

[Programmable Video Tutorials](https://www.twilio.com/docs/video/tutorials)

[Part 1: Creating a server with Node/Express](https://www.twilio.com/docs/video/tutorials/get-started-with-twilio-video-node-express-server)

[Part 2: Creating the Frontend](https://www.twilio.com/docs/video/tutorials/get-started-with-twilio-video-node-express-frontend)

''''
const handleDisconnectedParticipant = (participant) => {
  // stop listening for this participant
  participant.removeAllListeners();
  // remove this participant's div from the page
  const participantDiv = document.getElementById(participant.identity);
  participantDiv.remove();
};
''''

--------------------------------------------------------------------------------

Cheers...
