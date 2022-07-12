// -----------------------------------------------------------------------------
// Notify notification testing web server
// + No Twilio requests made from this web server.
// 
// Easy to use.
// Install modules.
//  $ npm install --save express
//  $ npm install --save twilio
// 
// Run the web server. Default port is hardcoded to 8000.
//  $ node websever.js
// 
// -----------------------------------------------------------------------------
console.log("+++ Video Client Web Application server is starting up.");
//
// -----------------------------------------------------------------------------
// Web server interface to call functions.
// 
const express = require('express');
const path = require('path');
const url = require("url");

// When deploying to Heroku, must use the keyword, "PORT".
// This allows Heroku to override the value and use port 80. And when running locally can use other ports.
const PORT = process.env.PORT || 8000;

var app = express();

// -----------------------------------------------------------------------------
// Setup to generate tokens.
//  Documentation, sample Node.JS program: 
//      https://www.twilio.com/docs/iam/access-tokens?code-sample=code-create-an-access-token-for-video&code-language=Node.js&code-sdk-version=3.x
// 
// Environment variables used to generate video tokens.
var ACCOUNT_SID = process.env.MASTER_ACCOUNT_SID;
var API_KEY = process.env.MASTER_API_KEY;
var API_KEY_SECRET = process.env.MASTER_API_KEY_SECRET;
//
function generateToken(theIdentity) {
    if (theIdentity === "") {
        console.log("- Required: user identity for creating a Conversations token.");
        return "";
    }
    sayMessage("+ Generate token, Conversations participants ID: " + theIdentity);
    const AccessToken = require('twilio').jwt.AccessToken;
    const token = new AccessToken(
            ACCOUNT_SID,
            API_KEY,
            API_KEY_SECRET,
            {identity: theIdentity}
            );
    const theGrant = new AccessToken.VideoGrant({
        // room: 'theRoom'  // Optional
    });
    token.addGrant(theGrant);
    // token.ttl = 1200; // Token time to live, in seconds. 1200 = 20 minutes.
    theToken = token.toJwt();
    // console.log("+ theToken " + theToken);
    return(theToken);
}

// -----------------------------------------------------------------------------
var returnMessage = '';
function sayMessage(message) {
    returnMessage = returnMessage + message + "<br>";
    console.log(message);
}

// -----------------------------------------------------------------------------
app.get('/getToken', function (req, res) {
    sayMessage("+ Generate Video Token.");
    if (req.query.identity) {
        res.status(200).send(generateToken(req.query.identity));
    } else {
        sayMessage("- Parameter required: identity.");
        res.status(500).send('HTTP Error 500.');
    }
});

// -----------------------------------------------------------------------------
app.get('/hello', function (req, res) {
    res.send('+ hello there.');
});
// -----------------------------------------------------------------------------
app.use(express.static('docroot'));
app.use(function (err, req, res, next) {
    console.error(err.stack);
    res.status(500).send('HTTP Error 500.');
});
app.listen(PORT, function () {
    console.log('+ Listening on port: ' + PORT);
});
