var express = require('express');
var app = express();
var http = require('http').Server(app);
var config = require('./config.json');
var io = require('socket.io')(http);

var speech = require('@google-cloud/speech')({
  projectId: config.projectId,
  keyFilename: config.keyFile
});

app.use(express.static('public'));

io.on('connection', function (socket) {
  socket.on('audioCaptured', function (payload) {
    speech.startRecognition({
      content: payload.data
    }, {
      encoding: 'LINEAR16',
      sampleRate: 44100,
      languageCode: 'fi_FI'
    }, function (err, operation, apiResponse) {
      if (err) {
        console.log(err);
      }
      operation
        .on('error', function (err) {
          console.log(err);
        }).on('complete', function (transcript) {
          socket.emit('audioProcessed', {data: transcript, elementId: payload.elementId});
        });
    });
  });
});

http.listen(3000, function () {
  console.log('listening on *:3000');
});