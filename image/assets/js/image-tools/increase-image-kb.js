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
  var increaseBtn = document.getElementById('increaseBtn');
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

  increaseBtn.addEventListener('click', function () {
    if (!loadedImg || !currentFile) return;
    increaseBtn.disabled = true;
    progressWrap.style.display = 'block';
    progressBar.style.width = '30%';
    statusText.textContent = 'Generating expanded image stream...';

    var targetBytes = Math.round((parseFloat(targetKbInput.value) || 50) * 1024);

    var reader = new FileReader();
    reader.onload = function (e) {
      var arrayBuffer = e.target.result;
      var currentBytes = arrayBuffer.byteLength;

      if (currentBytes >= targetBytes) {
        // Already larger than or equal to target
        var blob = new Blob([arrayBuffer], { type: currentFile.type || 'image/jpeg' });
        finishSuccess(blob);
        return;
      }

      var diff = targetBytes - currentBytes;
      // Append harmless JPEG comment segment (0xFF 0xFE length ... padding) or padding bytes at end
      var padding = new Uint8Array(diff);
      var combined = new Uint8Array(currentBytes + diff);
      combined.set(new Uint8Array(arrayBuffer), 0);
      combined.set(padding, currentBytes);

      var paddedBlob = new Blob([combined], { type: currentFile.type || 'image/jpeg' });
      finishSuccess(paddedBlob);
    };
    reader.readAsArrayBuffer(currentFile);
  });

  function finishSuccess(blob) {
    var url = URL.createObjectURL(blob);
    downloadLink.href = url;
    var outName = currentFile.name.replace(/\.[^/.]+$/, '') + '-' + targetKbInput.value + 'kb.jpg';
    downloadLink.download = outName;
    downloadLink.textContent = 'Download ' + outName;

    resultInfo.innerHTML = 'Increased from <strong>' + formatSize(currentFile.size) + '</strong> to <strong style="color:var(--green);">' + formatSize(blob.size) + '</strong>.';

    progressBar.style.width = '100%';
    progressWrap.style.display = 'none';
    resultBox.style.display = 'block';
    increaseBtn.disabled = false;
  }

  resetBtn.addEventListener('click', function () {
    currentFile = null;
    loadedImg = null;
    if (dropzone) dropzone.style.display = 'block';
    fileInfo.style.display = 'none';
    actions.style.display = 'none';
    resultBox.style.display = 'none';
    increaseBtn.disabled = false;
  });
})();
