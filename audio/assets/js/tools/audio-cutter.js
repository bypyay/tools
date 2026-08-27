// Daily1Step Audio Tool: audio-cutter
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
      <div style="display:flex; justify-content:space-between; gap:16px; flex-wrap:wrap;">
        <div style="flex:1; min-width:200px;">
          <label style="font-weight:700; font-size:.9rem; display:block; margin-bottom:4px;">Start Time (seconds):</label>
          <input type="number" id="startTimeInput" step="0.1" min="0" value="0" style="width:100%; padding:8px 12px; border:1px solid var(--border); border-radius:var(--radius-sm); font-weight:700;">
        </div>
        <div style="flex:1; min-width:200px;">
          <label style="font-weight:700; font-size:.9rem; display:block; margin-bottom:4px;">End Time (seconds):</label>
          <input type="number" id="endTimeInput" step="0.1" min="0" value="30" style="width:100%; padding:8px 12px; border:1px solid var(--border); border-radius:var(--radius-sm); font-weight:700;">
        </div>
      </div>
      <div style="display:flex; gap:16px; margin-top:14px; flex-wrap:wrap;">
        <label style="display:flex; align-items:center; gap:6px; font-weight:600; font-size:.9rem; cursor:pointer;">
          <input type="checkbox" id="fadeInCheck" checked> Fade In (1s)
        </label>
        <label style="display:flex; align-items:center; gap:6px; font-weight:600; font-size:.9rem; cursor:pointer;">
          <input type="checkbox" id="fadeOutCheck" checked> Fade Out (1s)
        </label>
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

    
      var s = parseFloat(document.getElementById('startTimeInput').value) || 0;
      var e = parseFloat(document.getElementById('endTimeInput').value) || currentBuffer.duration;
      s = Math.max(0, Math.min(s, currentBuffer.duration));
      e = Math.max(s + 0.1, Math.min(e, currentBuffer.duration));

      var cutBuffer = AudioCore.sliceAudioBuffer(currentBuffer, s, e);

      // Apply Fade In / Out
      if (document.getElementById('fadeInCheck').checked) {
        var fadeSamples = Math.min(cutBuffer.sampleRate * 1, cutBuffer.length / 2);
        for (var c = 0; c < cutBuffer.numberOfChannels; c++) {
          var d = cutBuffer.getChannelData(c);
          for (var i = 0; i < fadeSamples; i++) {
            d[i] *= (i / fadeSamples);
          }
        }
      }
      if (document.getElementById('fadeOutCheck').checked) {
        var fadeSamples = Math.min(cutBuffer.sampleRate * 1, cutBuffer.length / 2);
        for (var c = 0; c < cutBuffer.numberOfChannels; c++) {
          var d = cutBuffer.getChannelData(c);
          var len = cutBuffer.length;
          for (var i = 0; i < fadeSamples; i++) {
            d[len - 1 - i] *= (i / fadeSamples);
          }
        }
      }

      AudioCore.audioBufferToMp3(cutBuffer, 192, function(pct) {
        progressFill.style.width = pct + '%';
      }).then(function(blob) {
        workspace.style.display = 'none';
        resultBox.style.display = 'block';
        resultInfo.textContent = 'Trimmed: ' + AudioCore.formatTime(s) + ' to ' + AudioCore.formatTime(e) + ' | Size: ' + AudioCore.formatBytes(blob.size);
        downloadBtn.href = URL.createObjectURL(blob);
        downloadBtn.download = 'cut_' + currentFile.name.replace(/\.[^/.]+$/, "") + '.mp3';
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

  
      function onAudioLoaded(buf) {
        window.selStartSec = 0;
        window.selEndSec = Math.min(buf.duration, 30);
        document.getElementById('startTimeInput').value = window.selStartSec.toFixed(1);
        document.getElementById('endTimeInput').value = window.selEndSec.toFixed(1);
        document.getElementById('endTimeInput').max = buf.duration.toFixed(1);
      }
      document.getElementById('startTimeInput').addEventListener('input', function() {
        window.selStartSec = Math.max(0, parseFloat(this.value) || 0);
        drawWave();
      });
      document.getElementById('endTimeInput').addEventListener('input', function() {
        window.selEndSec = Math.min(currentBuffer ? currentBuffer.duration : 1000, parseFloat(this.value) || 0);
        drawWave();
      });
    
})();
