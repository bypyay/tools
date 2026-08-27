// Daily1Step Audio Tool: remove-silence-from-audio
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
      <label style="font-weight:700; font-size:.95rem; display:block; margin-bottom:8px;">Silence Detection Threshold:</label>
      <div style="display:flex; gap:8px; flex-wrap:wrap; margin-bottom:14px;">
        <button type="button" class="preset-chip" data-thresh="0.005">-46 dB (Gentle)</button>
        <button type="button" class="preset-chip active" data-thresh="0.01">-40 dB (Standard)</button>
        <button type="button" class="preset-chip" data-thresh="0.02">-34 dB (Aggressive)</button>
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

    
      var thresh = parseFloat(window.silenceThresh || 0.01);
      var channels = currentBuffer.numberOfChannels;
      var dataL = currentBuffer.getChannelData(0);
      var sr = currentBuffer.sampleRate;
      var windowSize = Math.floor(sr * 0.05); // 50ms chunks

      var nonSilentChunks = [];
      for (var i = 0; i < dataL.length; i += windowSize) {
        var end = Math.min(i + windowSize, dataL.length);
        var sum = 0;
        for (var j = i; j < end; j++) {
          sum += Math.abs(dataL[j]);
        }
        var rms = sum / (end - i);
        if (rms >= thresh) {
          nonSilentChunks.push({ start: i, end: end });
        }
      }

      if (nonSilentChunks.length === 0) {
        alert('Entire audio is below silence threshold. Try a gentler threshold.');
        processBtn.disabled = false;
        progressBar.style.display = 'none';
        return;
      }

      var totalLen = nonSilentChunks.reduce(function(acc, c) { return acc + (c.end - c.start); }, 0);
      var ctx = AudioCore.getContext();
      var cleanBuf = ctx.createBuffer(channels, totalLen, sr);

      for (var c = 0; c < channels; c++) {
        var srcD = currentBuffer.getChannelData(c);
        var destD = cleanBuf.getChannelData(c);
        var offset = 0;
        for (var k = 0; k < nonSilentChunks.length; k++) {
          var ch = nonSilentChunks[k];
          destD.set(srcD.subarray(ch.start, ch.end), offset);
          offset += (ch.end - ch.start);
        }
      }

      AudioCore.audioBufferToMp3(cleanBuf, 192, function(pct) {
        progressFill.style.width = pct + '%';
      }).then(function(blob) {
        workspace.style.display = 'none';
        resultBox.style.display = 'block';
        var savedSec = (currentBuffer.duration - cleanBuf.duration).toFixed(1);
        resultInfo.textContent = 'Removed ' + savedSec + 's of silence | New Duration: ' + AudioCore.formatTime(cleanBuf.duration, true) + ' | Size: ' + AudioCore.formatBytes(blob.size);
        downloadBtn.href = URL.createObjectURL(blob);
        downloadBtn.download = 'clean_' + currentFile.name.replace(/\.[^/.]+$/, "") + '.mp3';
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

  
      window.silenceThresh = 0.01;
      document.querySelectorAll('.preset-chip').forEach(function(c) {
        c.addEventListener('click', function() {
          document.querySelectorAll('.preset-chip').forEach(function(b) { b.classList.remove('active'); });
          this.classList.add('active');
          window.silenceThresh = this.getAttribute('data-thresh');
        });
      });
    
})();
