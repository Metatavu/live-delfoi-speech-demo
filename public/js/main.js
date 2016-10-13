(function () {
  'use strict';

  var socket = io();
  var recording = false;
  var recordRTC = null;

  navigator.getUserMedia({ video: false, audio: true }, function (stream) {
    recordRTC = RecordRTC(stream, {
      recorderType: StereoAudioRecorder,
      numberOfAudioChannels: 1
    });
  }, function (err) {
    console.log(err);
  });

  function startRecord() {
    recordRTC.clearRecordedData();
    recordRTC.startRecording();
  }

  function stopRecord(elementId) {
    recordRTC.stopRecording(function (audioURL) {
      var blob = recordRTC.getBlob();
      socket.emit('audioCaptured', { data: blob, elementId: elementId });
    });
  }

  socket.on('audioProcessed', function(payload) {
    $('#'+payload.elementId).val(payload.data);
  });

  $('.record-form').focus(function () {
    $(this).val('Nauhoitus käynnissä, poistu kentästä kun haluat lopettaa nauhoituksen.');
    startRecord();
  });

  $('.record-form').blur(function () {
    $(this).val('Nauhoitus tallennettu, käsitellään...');
    stopRecord($(this).attr('id'));
  });

})();