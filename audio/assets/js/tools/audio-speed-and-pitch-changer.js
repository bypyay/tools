// Daily1Step Audio Tool: audio-speed-changer-online
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
      <label style="font-weight:700; font-size:.95rem; display:block; margin-bottom:8px;">Playback Speed: <span id="speedVal" style="color:var(--primary);">1.25x</span></label>
      <input type="range" id="speedSlider" min="0.25" max="3.0" value="1.25" step="0.05" class="range-slider" style="margin-bottom:14px;">
      <div style="display:flex; gap:6px; flex-wrap:wrap;">
        <button type="button" class="preset-chip" data-val="0.5">0.5x (Slow)</button>
        <button type="button" class="preset-chip" data-val="0.75">0.75x</button>
        <button type="button" class="preset-chip" data-val="1.0">1.0x (Normal)</button>
        <button type="button" class="preset-chip active" data-val="1.25">1.25x</button>
        <button type="button" class="preset-chip" data-val="1.5">1.5x</button>
        <button type="button" class="preset-chip" data-val="2.0">2.0x (Fast)</button>
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

    
      var speed = parseFloat(document.getElementById('speedSlider').value) || 1.0;
      var ctx = AudioCore.getContext();
      var offlineCtx = new (window.OfflineAudioContext || window.webkitOfflineAudioContext)(
        currentBuffer.numberOfChannels,
        Math.floor(currentBuffer.length / speed),
        currentBuffer.sampleRate
      );

      var src = offlineCtx.createBufferSource();
      src.buffer = currentBuffer;
      src.playbackRate.value = speed;
      src.connect(offlineCtx.destination);
      src.start(0);

      offlineCtx.startRendering().then(function(renderedBuffer) {
        AudioCore.audioBufferToMp3(renderedBuffer, 192, function(pct) {
          progressFill.style.width = pct + '%';
        }).then(function(blob) {
          workspace.style.display = 'none';
          resultBox.style.display = 'block';
          resultInfo.textContent = 'Speed: ' + speed + 'x | New Duration: ' + AudioCore.formatTime(renderedBuffer.duration, true) + ' | Size: ' + AudioCore.formatBytes(blob.size);
          downloadBtn.href = URL.createObjectURL(blob);
          downloadBtn.download = 'speed_' + speed + 'x_' + currentFile.name.replace(/\.[^/.]+$/, "") + '.mp3';
        });
      });
    
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

  
      var slider = document.getElementById('speedSlider');
      var valEl = document.getElementById('speedVal');
      slider.addEventListener('input', function() {
        var v = this.value;
        valEl.textContent = v + 'x';
        document.querySelectorAll('.preset-chip').forEach(function(c) {
          c.classList.toggle('active', c.getAttribute('data-val') === v);
        });
      });
      document.querySelectorAll('.preset-chip').forEach(function(c) {
        c.addEventListener('click', function() {
          slider.value = this.getAttribute('data-val');
          slider.dispatchEvent(new Event('input'));
        });
      });
    
})();
