(function () {
  var dropzone = document.getElementById('dropzone');
  var fileInput = document.getElementById('fileInput');
  var fileInfo = document.getElementById('fileInfo');
  var fileNameEl = document.getElementById('fileName');
  var fileOriginalSize = document.getElementById('fileOriginalSize');
  var removeFileBtn = document.getElementById('removeFile');
  var targetKbInput = document.getElementById('targetKbInput');
  var imgPreview = document.getElementById('imgPreview');
  var actions = document.getElementById('actions');
  var compressBtn = document.getElementById('compressBtn');
  var progressWrap = document.getElementById('progressWrap');
  var progressBar = document.getElementById('progressBar');
  var statusText = document.getElementById('statusText');
  var resultBox = document.getElementById('resultBox');
  var resultInfo = document.getElementById('resultInfo');
  var downloadLink = document.getElementById('downloadLink');
  var resetBtn = document.getElementById('resetBtn');

  var currentFile = null;
  var loadedImg = null;

  function formatSize(bytes) {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  }

  function loadFile(file) {
    if (!file || !file.type.match(/image.*/)) {
      alert('Please select a valid image file (JPG, PNG, WEBP).');
      return;
    }
    currentFile = file;
    fileNameEl.textContent = file.name;
    fileOriginalSize.textContent = 'Original: ' + formatSize(file.size);

    var reader = new FileReader();
    reader.onload = function (e) {
      var img = new Image();
      img.onload = function () {
        loadedImg = img;
        imgPreview.src = e.target.result;
        if (dropzone) dropzone.style.display = 'none';
        fileInfo.style.display = 'block';
        actions.style.display = 'block';
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  }

  // Preset chips
  document.querySelectorAll('.preset-chip').forEach(function (chip) {
    chip.addEventListener('click', function () {
      document.querySelectorAll('.preset-chip').forEach(function (c) { c.classList.remove('active'); });
      chip.classList.add('active');
      targetKbInput.value = chip.getAttribute('data-kb');
    });
  });

  dropzone.addEventListener('click', function () { fileInput.click(); });
  fileInput.addEventListener('change', function (e) { loadFile(e.target.files[0]); fileInput.value = ''; });
  ['dragenter', 'dragover'].forEach(function (evt) {
    dropzone.addEventListener(evt, function (e) { e.preventDefault(); dropzone.classList.add('dragover'); });
  });
  ['dragleave', 'drop'].forEach(function (evt) {
    dropzone.addEventListener(evt, function (e) { e.preventDefault(); dropzone.classList.remove('dragover'); });
  });
  dropzone.addEventListener('drop', function (e) {
    if (e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files[0]) loadFile(e.dataTransfer.files[0]);
  });

  removeFileBtn.addEventListener('click', function () {
    currentFile = null;
    loadedImg = null;
    if (dropzone) dropzone.style.display = 'block';
    fileInfo.style.display = 'none';
    actions.style.display = 'none';
  });

  compressBtn.addEventListener('click', function () {
    if (!loadedImg) return;
    compressBtn.disabled = true;
    progressWrap.style.display = 'block';
    progressBar.style.width = '20%';
    statusText.textContent = 'Calculating optimal compression ratio...';

    var targetBytes = (parseFloat(targetKbInput.value) || 50) * 1024;
    setTimeout(function () {
      compressToTarget(loadedImg, targetBytes);
    }, 50);
  });

  function compressToTarget(img, targetBytes) {
    var canvas = document.createElement('canvas');
    var ctx = canvas.getContext('2d');

    var curW = img.naturalWidth || img.width;
    var curH = img.naturalHeight || img.height;
    canvas.width = curW;
    canvas.height = curH;
    ctx.drawImage(img, 0, 0, curW, curH);

    function tryQuality(q, scale) {
      var w = Math.round(curW * scale);
      var h = Math.round(curH * scale);
      canvas.width = w;
      canvas.height = h;
      ctx.drawImage(img, 0, 0, w, h);

      return new Promise(function (resolve) {
        canvas.toBlob(function (blob) {
          resolve(blob);
        }, 'image/jpeg', q);
      });
    }

    // Binary search for optimal quality & scaling
    var minQ = 0.05, maxQ = 0.98, bestBlob = null;
    var scale = 1.0;

    function search(iterations) {
      if (iterations <= 0) {
        if (!bestBlob || bestBlob.size > targetBytes * 1.2) {
          // If still too large, downscale image dimensions
          scale *= 0.85;
          return tryQuality(0.7, scale).then(function (blob) {
            if (blob.size <= targetBytes || scale < 0.25) return blob;
            return search(3);
          });
        }
        return Promise.resolve(bestBlob);
      }

      var midQ = (minQ + maxQ) / 2;
      return tryQuality(midQ, scale).then(function (blob) {
        bestBlob = blob;
        if (blob.size > targetBytes) {
          maxQ = midQ;
        } else {
          minQ = midQ;
        }
        progressBar.style.width = (100 - iterations * 10) + '%';
        return search(iterations - 1);
      });
    }

    search(7).then(function (finalBlob) {
      var url = URL.createObjectURL(finalBlob);
      downloadLink.href = url;
      var outName = currentFile.name.replace(/\.[^/.]+$/, '') + '-' + targetKbInput.value + 'kb.jpg';
      downloadLink.download = outName;
      downloadLink.textContent = 'Download ' + outName;

      var savings = Math.round((1 - finalBlob.size / currentFile.size) * 100);
      resultInfo.innerHTML = 'Compressed from <strong>' + formatSize(currentFile.size) + '</strong> to <strong style="color:var(--green);">' + formatSize(finalBlob.size) + '</strong> (' + (savings >= 0 ? savings + '% smaller' : 'Adjusted') + ').';

      progressBar.style.width = '100%';
      progressWrap.style.display = 'none';
      resultBox.style.display = 'block';
      compressBtn.disabled = false;
    }).catch(function (err) {
      console.error(err);
      alert('Error compressing image: ' + err.message);
      progressWrap.style.display = 'none';
      compressBtn.disabled = false;
    });
  }

  resetBtn.addEventListener('click', function () {
    currentFile = null;
    loadedImg = null;
    if (dropzone) dropzone.style.display = 'block';
    fileInfo.style.display = 'none';
    actions.style.display = 'none';
    resultBox.style.display = 'none';
    compressBtn.disabled = false;
  });
})();
