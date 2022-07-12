// -----------------------------------------------------------------------------
// Notify notification testing web server
// + No Twilio requests made from this web server.
// 
// Easy to use.
// Install modules.
//  $ npm install --save express
//  
// 
// Run the web server. Default port is hardcoded to 8000.
//  $ node websever.js
// 
// -----------------------------------------------------------------------------
console.log("+++ Minimum Notification Web Application server is starting up.");
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
