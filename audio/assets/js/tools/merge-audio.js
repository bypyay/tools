// Daily1Step Audio Tool: merge-audio
(function() {
  'use strict';
  var dropzone = document.getElementById('dropzone');
  var fileInput = document.getElementById('fileInput');
  var workspace = document.getElementById('workspace');
  var trackList = document.getElementById('trackList');
  var formatSelect = document.getElementById('formatSelect');
  var addMoreBtn = document.getElementById('addMoreBtn');
  var processBtn = document.getElementById('processBtn');
  var progressBar = document.getElementById('progressBar');
  var progressFill = document.getElementById('progressFill');
  var resultBox = document.getElementById('resultBox');
  var resultInfo = document.getElementById('resultInfo');
  var downloadBtn = document.getElementById('downloadBtn');
  var resetBtn = document.getElementById('resetBtn');

  var audioFiles = [];

  dropzone.addEventListener('click', function() { fileInput.click(); });
  dropzone.addEventListener('dragover', function(e) { e.preventDefault(); dropzone.classList.add('dragover'); });
  dropzone.addEventListener('dragleave', function() { dropzone.classList.remove('dragover'); });
  dropzone.addEventListener('drop', function(e) {
    e.preventDefault();
    dropzone.classList.remove('dragover');
    if (e.dataTransfer.files.length > 0) {
      handleFiles(Array.from(e.dataTransfer.files));
    }
  });
  fileInput.addEventListener('change', function(e) {
    if (e.target.files.length > 0) {
      handleFiles(Array.from(e.target.files));
    }
  });
  addMoreBtn.addEventListener('click', function() { fileInput.click(); });

  function handleFiles(files) {
    dropzone.style.display = 'none';
    workspace.style.display = 'block';

    files.forEach(function(f) {
      AudioCore.decodeAudioFile(f).then(function(buf) {
        audioFiles.push({ file: f, buffer: buf });
        renderTrackList();
      }).catch(function(err) {
        console.error('Error decoding', f.name, err);
      });
    });
  }

  function renderTrackList() {
    trackList.innerHTML = '';
    audioFiles.forEach(function(item, idx) {
      var row = document.createElement('div');
      row.style.cssText = 'display:flex; justify-content:space-between; align-items:center; padding:10px 14px; background:var(--bg-soft); border:1px solid var(--border); border-radius:var(--radius-sm);';
      row.innerHTML = `
        <div>
          <span style="font-weight:700; font-size:.9rem;">${idx + 1}. ${item.file.name}</span>
          <span style="font-size:.8rem; color:var(--ink-soft); margin-left:8px;">(${AudioCore.formatTime(item.buffer.duration)})</span>
        </div>
        <div style="display:flex; gap:6px;">
          ${idx > 0 ? `<button class="btn sm secondary move-up" data-idx="${idx}" type="button">▲</button>` : ''}
          ${idx < audioFiles.length - 1 ? `<button class="btn sm secondary move-down" data-idx="${idx}" type="button">▼</button>` : ''}
          <button class="btn sm danger remove-track" data-idx="${idx}" type="button">&times;</button>
        </div>
      `;
      trackList.appendChild(row);
    });

    document.querySelectorAll('.move-up').forEach(function(b) {
      b.addEventListener('click', function() {
        var i = parseInt(this.getAttribute('data-idx'));
        var temp = audioFiles[i];
        audioFiles[i] = audioFiles[i - 1];
        audioFiles[i - 1] = temp;
        renderTrackList();
      });
    });

    document.querySelectorAll('.move-down').forEach(function(b) {
      b.addEventListener('click', function() {
        var i = parseInt(this.getAttribute('data-idx'));
        var temp = audioFiles[i];
        audioFiles[i] = audioFiles[i + 1];
        audioFiles[i + 1] = temp;
        renderTrackList();
      });
    });

    document.querySelectorAll('.remove-track').forEach(function(b) {
      b.addEventListener('click', function() {
        var i = parseInt(this.getAttribute('data-idx'));
        audioFiles.splice(i, 1);
        renderTrackList();
        if (audioFiles.length === 0) resetUI();
      });
    });
  }

  processBtn.addEventListener('click', function() {
    if (audioFiles.length < 2) {
      alert('Please add at least 2 audio files to merge.');
      return;
    }
    progressBar.style.display = 'block';
    progressFill.style.width = '10%';
    processBtn.disabled = true;

    var buffers = audioFiles.map(function(item) { return item.buffer; });
    var mergedBuffer = AudioCore.concatAudioBuffers(buffers);

    var fmt = formatSelect.value;
    if (fmt === 'wav') {
      var wavBlob = AudioCore.audioBufferToWav(mergedBuffer);
      workspace.style.display = 'none';
      resultBox.style.display = 'block';
      resultInfo.textContent = 'Merged ' + audioFiles.length + ' tracks into Lossless WAV | Total Duration: ' + AudioCore.formatTime(mergedBuffer.duration, true);
      downloadBtn.href = URL.createObjectURL(wavBlob);
      downloadBtn.download = 'merged_audio.wav';
    } else {
      var br = parseInt(fmt.split('-')[1]) || 192;
      AudioCore.audioBufferToMp3(mergedBuffer, br, function(pct) {
        progressFill.style.width = pct + '%';
      }).then(function(blob) {
        workspace.style.display = 'none';
        resultBox.style.display = 'block';
        resultInfo.textContent = 'Merged ' + audioFiles.length + ' tracks into MP3 (' + br + ' kbps) | Total Duration: ' + AudioCore.formatTime(mergedBuffer.duration, true) + ' | Size: ' + AudioCore.formatBytes(blob.size);
        downloadBtn.href = URL.createObjectURL(blob);
        downloadBtn.download = 'merged_audio.mp3';
      });
    }
  });

  resetBtn.addEventListener('click', resetUI);

  function resetUI() {
    audioFiles = [];
    dropzone.style.display = 'block';
    workspace.style.display = 'none';
    resultBox.style.display = 'none';
    progressBar.style.display = 'none';
    processBtn.disabled = false;
    fileInput.value = '';
  }
})();
