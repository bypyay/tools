// Daily1Step Audio Tool: audio-recorder
(function() {
  'use strict';
  var recCanvas = document.getElementById('recCanvas');
  var recTime = document.getElementById('recTime');
  var startRecBtn = document.getElementById('startRecBtn');
  var pauseRecBtn = document.getElementById('pauseRecBtn');
  var stopRecBtn = document.getElementById('stopRecBtn');
  var resultBox = document.getElementById('resultBox');
  var resultInfo = document.getElementById('resultInfo');
  var playbackAudio = document.getElementById('playbackAudio');
  var downloadBtn = document.getElementById('downloadBtn');
  var resetBtn = document.getElementById('resetBtn');

  var mediaRecorder = null;
  var audioChunks = [];
  var startTime = 0;
  var timerInterval = null;
  var animFrameId = null;
  var analyser = null;
  var audioStream = null;

  startRecBtn.addEventListener('click', function() {
    navigator.mediaDevices.getUserMedia({ audio: true }).then(function(stream) {
      audioStream = stream;
      var ctx = AudioCore.getContext();
      var src = ctx.createMediaStreamSource(stream);
      analyser = ctx.createAnalyser();
      analyser.fftSize = 256;
      src.connect(analyser);

      mediaRecorder = new MediaRecorder(stream);
      audioChunks = [];
      mediaRecorder.ondataavailable = function(e) {
        if (e.data.size > 0) audioChunks.push(e.data);
      };
      mediaRecorder.onstop = function() {
        var audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
        AudioCore.decodeAudioFile(audioBlob).then(function(buf) {
          AudioCore.audioBufferToMp3(buf, 192).then(function(mp3Blob) {
            resultBox.style.display = 'block';
            var url = URL.createObjectURL(mp3Blob);
            playbackAudio.src = url;
            downloadBtn.href = url;
            downloadBtn.download = 'recording_' + Date.now() + '.mp3';
            resultInfo.textContent = 'Duration: ' + AudioCore.formatTime(buf.duration, true) + ' | Size: ' + AudioCore.formatBytes(mp3Blob.size);
          });
        });
      };

      mediaRecorder.start(100);
      startTime = Date.now();
      timerInterval = setInterval(updateTimer, 30);
      visualize();

      startRecBtn.style.display = 'none';
      pauseRecBtn.style.display = 'inline-flex';
      stopRecBtn.style.display = 'inline-flex';
      resultBox.style.display = 'none';
    }).catch(function(err) {
      alert('Microphone access denied: ' + err.message);
    });
  });

  pauseRecBtn.addEventListener('click', function() {
    if (mediaRecorder.state === 'recording') {
      mediaRecorder.pause();
      pauseRecBtn.textContent = 'Resume';
    } else if (mediaRecorder.state === 'paused') {
      mediaRecorder.resume();
      pauseRecBtn.textContent = 'Pause';
    }
  });

  stopRecBtn.addEventListener('click', function() {
    if (mediaRecorder) {
      mediaRecorder.stop();
      if (audioStream) {
        audioStream.getTracks().forEach(function(t) { t.stop(); });
      }
    }
    clearInterval(timerInterval);
    cancelAnimationFrame(animFrameId);
    startRecBtn.style.display = 'inline-flex';
    pauseRecBtn.style.display = 'none';
    stopRecBtn.style.display = 'none';
  });

  function updateTimer() {
    var elapsed = (Date.now() - startTime) / 1000;
    recTime.textContent = AudioCore.formatTime(elapsed, true);
  }

  function visualize() {
    if (!analyser) return;
    var canvasCtx = recCanvas.getContext('2d');
    var bufferLength = analyser.frequencyBinCount;
    var dataArray = new Uint8Array(bufferLength);

    function draw() {
      animFrameId = requestAnimationFrame(draw);
      analyser.getByteFrequencyData(dataArray);

      canvasCtx.fillStyle = '#1e1b4b';
      canvasCtx.fillRect(0, 0, recCanvas.width, recCanvas.height);

      var barWidth = (recCanvas.width / bufferLength) * 2.5;
      var barHeight;
      var x = 0;

      for (var i = 0; i < bufferLength; i++) {
        barHeight = (dataArray[i] / 255) * recCanvas.height;
        canvasCtx.fillStyle = 'rgb(' + (barHeight + 100) + ',99,241)';
        canvasCtx.fillRect(x, recCanvas.height - barHeight, barWidth, barHeight);
        x += barWidth + 1;
      }
    }
    draw();
  }

  resetBtn.addEventListener('click', function() {
    resultBox.style.display = 'none';
    recTime.textContent = '00:00.00';
    playbackAudio.src = '';
  });
})();
