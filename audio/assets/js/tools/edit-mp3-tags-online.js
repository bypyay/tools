// Daily1Step Audio Tool: edit-mp3-tags-online
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
      <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(220px, 1fr)); gap:14px; margin-bottom:16px;">
        <div>
          <label style="font-weight:700; font-size:.85rem; display:block; margin-bottom:4px;">Song Title:</label>
          <input type="text" id="tagTitle" placeholder="Song Title" style="width:100%; padding:8px 12px; border:1px solid var(--border); border-radius:var(--radius-sm);">
        </div>
        <div>
          <label style="font-weight:700; font-size:.85rem; display:block; margin-bottom:4px;">Artist / Band:</label>
          <input type="text" id="tagArtist" placeholder="Artist Name" style="width:100%; padding:8px 12px; border:1px solid var(--border); border-radius:var(--radius-sm);">
        </div>
        <div>
          <label style="font-weight:700; font-size:.85rem; display:block; margin-bottom:4px;">Album:</label>
          <input type="text" id="tagAlbum" placeholder="Album Title" style="width:100%; padding:8px 12px; border:1px solid var(--border); border-radius:var(--radius-sm);">
        </div>
        <div>
          <label style="font-weight:700; font-size:.85rem; display:block; margin-bottom:4px;">Release Year:</label>
          <input type="number" id="tagYear" placeholder="2026" style="width:100%; padding:8px 12px; border:1px solid var(--border); border-radius:var(--radius-sm);">
        </div>
      </div>
      <div>
        <label style="font-weight:700; font-size:.85rem; display:block; margin-bottom:4px;">Cover Art Image (Optional):</label>
        <input type="file" id="tagCoverInput" accept="image/jpeg, image/png" style="font-size:.85rem;">
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

    
      var title = document.getElementById('tagTitle').value || '';
      var artist = document.getElementById('tagArtist').value || '';
      var album = document.getElementById('tagAlbum').value || '';
      var year = document.getElementById('tagYear').value || '';
      var coverInput = document.getElementById('tagCoverInput');

      var reader = new FileReader();
      reader.onload = function(e) {
        var arrayBuffer = e.target.result;
        try {
          if (typeof ID3Writer !== 'undefined') {
            var writer = new ID3Writer(arrayBuffer);
            if (title) writer.setFrame('TIT2', title);
            if (artist) writer.setFrame('TPE1', [artist]);
            if (album) writer.setFrame('TALB', album);
            if (year) writer.setFrame('TYER', year);

            if (coverInput.files.length > 0) {
              var imgReader = new FileReader();
              imgReader.onload = function(ev) {
                writer.setFrame('APIC', {
                  type: 3,
                  data: ev.target.result,
                  description: 'Cover'
                });
                writer.addTag();
                var taggedBlob = writer.getBlob();
                finishSave(taggedBlob);
              };
              imgReader.readAsArrayBuffer(coverInput.files[0]);
              return;
            }

            writer.addTag();
            var taggedBlob = writer.getBlob();
            finishSave(taggedBlob);
          } else {
            finishSave(currentFile);
          }
        } catch (err) {
          alert('Error embedding ID3 tags: ' + err.message);
          processBtn.disabled = false;
          progressBar.style.display = 'none';
        }
      };

      function finishSave(blob) {
        workspace.style.display = 'none';
        resultBox.style.display = 'block';
        resultInfo.textContent = 'ID3 Tags Updated Successfully! | Size: ' + AudioCore.formatBytes(blob.size);
        downloadBtn.href = URL.createObjectURL(blob);
        downloadBtn.download = currentFile.name;
      }

      reader.readAsArrayBuffer(currentFile);
    
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

  
      function onAudioLoaded() {
        if (typeof jsmediatags !== 'undefined' && currentFile) {
          jsmediatags.read(currentFile, {
            onSuccess: function(tag) {
              var tags = tag.tags;
              if (tags.title) document.getElementById('tagTitle').value = tags.title;
              if (tags.artist) document.getElementById('tagArtist').value = tags.artist;
              if (tags.album) document.getElementById('tagAlbum').value = tags.album;
              if (tags.year) document.getElementById('tagYear').value = tags.year;
            },
            onError: function(error) {
              console.log('No existing ID3 tags found');
            }
          });
        }
      }
    
})();
