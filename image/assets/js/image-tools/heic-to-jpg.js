(function () {
  var dropzone = document.getElementById('dropzone');
  var fileInput = document.getElementById('fileInput');
  var fileInfo = document.getElementById('fileInfo');
  var fileNameEl = document.getElementById('fileName');
  var fileSizeEl = document.getElementById('fileSize');
  var removeFileBtn = document.getElementById('removeFile');
  var convertBtn = document.getElementById('convertBtn');
  var progressWrap = document.getElementById('progressWrap');
  var progressBar = document.getElementById('progressBar');
  var statusText = document.getElementById('statusText');
  var resultBox = document.getElementById('resultBox');
  var convertedPreview = document.getElementById('convertedPreview');
  var downloadLink = document.getElementById('downloadLink');
  var resetBtn = document.getElementById('resetBtn');

  var currentFile = null;

  function formatSize(bytes) {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  }

  function loadFile(file) {
    if (!file) return;
    currentFile = file;
    fileNameEl.textContent = file.name;
    fileSizeEl.textContent = formatSize(file.size);

    dropzone.style.display = 'none';
    fileInfo.style.display = 'block';
  }

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
    dropzone.style.display = 'block';
    fileInfo.style.display = 'none';
  });

  convertBtn.addEventListener('click', function () {
    if (!currentFile || typeof heic2any === 'undefined') {
      alert('HEIC converter library is initializing. Please wait a moment.');
      return;
    }

    convertBtn.disabled = true;
    progressWrap.style.display = 'block';
    progressBar.style.width = '30%';
    statusText.textContent = 'Decoding HEIC bitstream...';

    heic2any({
      blob: currentFile,
      toType: 'image/jpeg',
      quality: 0.92
    }).then(function (resultBlob) {
      progressBar.style.width = '90%';
      var blob = Array.isArray(resultBlob) ? resultBlob[0] : resultBlob;
      var url = URL.createObjectURL(blob);

      convertedPreview.src = url;
      downloadLink.href = url;
      var outName = currentFile.name.replace(/\.[^/.]+$/, '') + '.jpg';
      downloadLink.download = outName;
      downloadLink.textContent = 'Download ' + outName;

      progressBar.style.width = '100%';
      progressWrap.style.display = 'none';
      fileInfo.style.display = 'none';
      resultBox.style.display = 'block';
    }).catch(function (err) {
      console.error(err);
      alert('Error converting HEIC: ' + (err.message || 'Corrupted or unsupported HEIC'));
      progressWrap.style.display = 'none';
      convertBtn.disabled = false;
    });
  });

  resetBtn.addEventListener('click', function () {
    currentFile = null;
    dropzone.style.display = 'block';
    fileInfo.style.display = 'none';
    resultBox.style.display = 'none';
    convertBtn.disabled = false;
  });
})();
