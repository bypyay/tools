// Daily1Step Audio Tool: convert-audio
(function() {
  'use strict';

  var dropzone = document.getElementById('dropzone');
  var fileInput = document.getElementById('fileInput');
  var workspace = document.getElementById('workspace');
  var fileNameEl = document.getElementById('fileName');
  var fileDurationEl = document.getElementById('fileDuration');
  var waveformCanvas = document.getElementById('waveformCanvas');
  var playBtn = document.getElementById('playBtn');
  var stopBtn = document.getElementById('stopBtn');
  var loopBtn = document.getElementById('loopBtn');
  var timeDisplay = document.getElementById('timeDisplay');
  var toolControls = document.getElementById('toolControls');
  var processBtn = document.getElementById('processBtn');
  var progressBar = document.getElementById('progressBar');
  var progressFill = document.getElementById('progressFill');
  var resultBox = document.getElementById('resultBox');
  var resultInfo = document.getElementById('resultInfo');
  var downloadBtn = document.getElementById('downloadBtn');
  var resetBtn = document.getElementById('resetBtn');

  var currentFile = null;
  var currentBuffer = null;
  var sourceNode = null;
  var isPlaying = false;
  var isLooping = false;
  var startTime = 0;
  var pauseOffset = 0;
  var animFrameId = null;

  // Render Tool Controls
  if (toolControls) {
    toolControls.innerHTML = `
      <label style="font-weight:700; font-size:.95rem; display:block; margin-bottom:8px;">Convert To Format:</label>
      <div style="display:flex; gap:10px; align-items:center; flex-wrap:wrap;">
        <select id="targetFormat" style="padding:10px 16px; border:1px solid var(--border); border-radius:var(--radius-sm); font-weight:700; font-size:1rem;">
          <option value="mp3-320">MP3 (320 kbps High Quality)</option>
          <option value="mp3-192" selected>MP3 (192 kbps Standard)</option>
          <option value="mp3-128">MP3 (128 kbps Compact)</option>
          <option value="wav">WAV (Uncompressed Lossless)</option>
        </select>
      </div>
    `;
  }

  // File Upload Handling
  dropzone.addEventListener('click', function() { fileInput.click(); });
  dropzone.addEventListener('dragover', function(e) { e.preventDefault(); dropzone.classList.add('dragover'); });
  dropzone.addEventListener('dragleave', function() { dropzone.classList.remove('dragover'); });
  dropzone.addEventListener('drop', function(e) {
    e.preventDefault();
    dropzone.classList.remove('dragover');
    if (e.dataTransfer.files.length > 0) {
      loadAudioFile(e.dataTransfer.files[0]);
    }
  });
  fileInput.addEventListener('change', function(e) {
    if (e.target.files.length > 0) {
      loadAudioFile(e.target.files[0]);
    }
  });

  function loadAudioFile(file) {
    currentFile = file;
    fileNameEl.textContent = file.name;
    fileDurationEl.textContent = 'Loading and decoding audio...';
    dropzone.style.display = 'none';
    workspace.style.display = 'block';
    resultBox.style.display = 'none';

    AudioCore.decodeAudioFile(file).then(function(buffer) {
      currentBuffer = buffer;
      fileDurationEl.textContent = 'Duration: ' + AudioCore.formatTime(buffer.duration, true) + ' | ' + buffer.sampleRate + ' Hz';
      drawWave();
      if (typeof onAudioLoaded === 'function') {
        onAudioLoaded(buffer);
      }
    }).catch(function(err) {
      alert('Error decoding audio: ' + err.message);
      resetUI();
    });
  }

  function drawWave(currentTime) {
    if (!currentBuffer) return;
    var opt = {
      currentTime: currentTime || pauseOffset,
      startSec: window.selStartSec,
      endSec: window.selEndSec
    };
    AudioCore.drawWaveform(waveformCanvas, currentBuffer, opt);
  }

  // Playback Transport
  playBtn.addEventListener('click', function() {
    if (isPlaying) {
      pausePlayback();
    } else {
      startPlayback();
    }
  });

  stopBtn.addEventListener('click', function() {
    stopPlayback();
  });

  loopBtn.addEventListener('click', function() {
    isLooping = !isLooping;
    loopBtn.classList.toggle('active', isLooping);
  });

  function startPlayback() {
    if (!currentBuffer) return;
    var ctx = AudioCore.getContext();
    sourceNode = ctx.createBufferSource();
    sourceNode.buffer = currentBuffer;
    sourceNode.loop = isLooping;

    // Connect effects if defined
    if (typeof applyLiveEffects === 'function') {
      applyLiveEffects(sourceNode, ctx);
    } else {
      sourceNode.connect(ctx.destination);
    }

    var offset = (window.selStartSec !== undefined) ? Math.max(window.selStartSec, pauseOffset) : pauseOffset;
    if (offset >= (window.selEndSec || currentBuffer.duration)) {
      offset = window.selStartSec || 0;
    }

    sourceNode.start(0, offset);
    startTime = ctx.currentTime - offset;
    isPlaying = true;
    playBtn.textContent = '⏸ Pause';
    trackProgress();
  }

  function pausePlayback() {
    if (sourceNode) {
      sourceNode.stop();
      sourceNode.disconnect();
    }
    var ctx = AudioCore.getContext();
    pauseOffset = ctx.currentTime - startTime;
    isPlaying = false;
    playBtn.textContent = '▶ Play';
    cancelAnimationFrame(animFrameId);
  }

  function stopPlayback() {
    if (sourceNode) {
      sourceNode.stop();
      sourceNode.disconnect();
    }
    isPlaying = false;
    pauseOffset = window.selStartSec || 0;
    playBtn.textContent = '▶ Play';
    cancelAnimationFrame(animFrameId);
    timeDisplay.textContent = AudioCore.formatTime(pauseOffset, true);
    drawWave(pauseOffset);
  }

  function trackProgress() {
    if (!isPlaying) return;
    var ctx = AudioCore.getContext();
    var cur = ctx.currentTime - startTime;

    if (window.selEndSec && cur >= window.selEndSec) {
      if (isLooping) {
        stopPlayback();
        startPlayback();
        return;
      } else {
        stopPlayback();
        return;
      }
    }

    if (cur >= currentBuffer.duration) {
      if (!isLooping) {
        stopPlayback();
        return;
      }
    }

    timeDisplay.textContent = AudioCore.formatTime(cur, true);
    drawWave(cur);
    animFrameId = requestAnimationFrame(trackProgress);
  }

  // Interactive Waveform Clicking
  waveformCanvas.addEventListener('click', function(e) {
    if (!currentBuffer) return;
    var rect = waveformCanvas.getBoundingClientRect();
    var x = e.clientX - rect.left;
    var pct = Math.max(0, Math.min(1, x / rect.width));
    var clickedTime = pct * currentBuffer.duration;
    pauseOffset = clickedTime;
    timeDisplay.textContent = AudioCore.formatTime(clickedTime, true);
    drawWave(clickedTime);
    if (isPlaying) {
      pausePlayback();
      startPlayback();
    }
  });

  // Process & Export Audio
  processBtn.addEventListener('click', function() {
    if (!currentBuffer) return;
    stopPlayback();
    progressBar.style.display = 'block';
    progressFill.style.width = '10%';
    processBtn.disabled = true;

    
      var fmt = document.getElementById('targetFormat').value;
      if (fmt === 'wav') {
        var wavBlob = AudioCore.audioBufferToWav(currentBuffer);
        workspace.style.display = 'none';
        resultBox.style.display = 'block';
        resultInfo.textContent = 'Converted to WAV | Size: ' + AudioCore.formatBytes(wavBlob.size);
        downloadBtn.href = URL.createObjectURL(wavBlob);
        downloadBtn.download = currentFile.name.replace(/\.[^/.]+$/, "") + '.wav';
      } else {
        var br = parseInt(fmt.split('-')[1]) || 192;
        AudioCore.audioBufferToMp3(currentBuffer, br, function(pct) {
          progressFill.style.width = pct + '%';
        }).then(function(blob) {
          workspace.style.display = 'none';
          resultBox.style.display = 'block';
          resultInfo.textContent = 'Converted to MP3 (' + br + ' kbps) | Size: ' + AudioCore.formatBytes(blob.size);
          downloadBtn.href = URL.createObjectURL(blob);
          downloadBtn.download = currentFile.name.replace(/\.[^/.]+$/, "") + '.mp3';
        });
      }
    
  });

  resetBtn.addEventListener('click', resetUI);

  function resetUI() {
    stopPlayback();
    currentFile = null;
    currentBuffer = null;
    dropzone.style.display = 'block';
    workspace.style.display = 'none';
    resultBox.style.display = 'none';
    progressBar.style.display = 'none';
    processBtn.disabled = false;
    fileInput.value = '';
  }

  
})();
