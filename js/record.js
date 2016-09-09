var clock;

$(document).ready(function() {
    try {
        // webkit shim
        window.AudioContext = window.AudioContext || window.webkitAudioContext;
        navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia;
        window.URL = window.URL || window.webkitURL;

        audio_context = new AudioContext;
    } catch (e) {
        alert('No web audio support in this browser!');
    }

    navigator.getUserMedia({audio: true}, startUserMedia, function(e) {
        console.log('No live audio input: ' + e);
    });

    clock = $('.clock').FlipClock(0, {
        clockFace: 'MinuteCounter',
        // countdown: true,
        autoStart: false
    });

});


var audio_context;
var recorder;

function startUserMedia(stream) {
    var input = audio_context.createMediaStreamSource(stream);
    recorder = new Recorder(input);
}

function startRecording() {
    clock.start();
    recorder && recorder.record();
    $('.start').attr("disabled",true);
    $('.stop').attr("disabled",false);
}

function stopRecording() {
    clock.stop();
    clock.reset();
    recorder && recorder.stop();
    $('.start').attr("disabled",false);
    $('.stop').attr("disabled",true);
    // create WAV download link using audio data blob
    createDownloadLink();

    recorder.clear();
}

function resetRecording() {
    clock.reset();
    recorder && recorder.stop();
    recorder.clear();
    $('.stop').attr("disabled",true);
    $('.start').attr("disabled",false);
    $("#recordingsList").empty();
}

function recordSecond(sec) {
    startRecording();
    setTimeout(function(){stopRecording()}, sec*1000);
}

function createDownloadLink() {
    recorder && recorder.exportWAV(function(blob) {
        var url = URL.createObjectURL(blob);
        var newRec = "<li><audio controls=true src='"
            +url+"'></audio>" +
            "<a href='"
            +url+"' download='"+
            new Date().toISOString() + '.wav'
            +"'><button type='button' class='btn btn-primary'><i class='icon-download3'></i></button></a></li>";
        $("#recordingsList").prepend(newRec);
    });
}

document.addEventListener('keydown', function(e){
    switch (e.keyCode) {
        case 65:    // A
            startRecording();
            break;
        case 83:    // S
            stopRecording();
            break;
        case 49:    // 1
            recordSecond(45);
            break;
        case 50:    // 2
            recordSecond(60);
            break;
    }
    return false;
}, false);