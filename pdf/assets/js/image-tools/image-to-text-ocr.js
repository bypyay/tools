(function () {
  var dropzone = document.getElementById('dropzone');
  var fileInput = document.getElementById('fileInput');
  var editorWrap = document.getElementById('editorWrap');
  var fileNameEl = document.getElementById('fileName');
  var removeFileBtn = document.getElementById('removeFile');
  var ocrBtn = document.getElementById('ocrBtn');
  var progressWrap = document.getElementById('progressWrap');
  var progressBar = document.getElementById('progressBar');
  var statusText = document.getElementById('statusText');
  var resultBox = document.getElementById('resultBox');
  var extractedText = document.getElementById('extractedText');
  var copyTextBtn = document.getElementById('copyTextBtn');
  var downloadTxtBtn = document.getElementById('downloadTxtBtn');

  var currentFile = null;

  function loadFile(file) {
    if (!file || !file.type.match(/image.*/)) return;
    currentFile = file;
    fileNameEl.textContent = file.name;
    dropzone.style.display = 'none';
    editorWrap.style.display = 'block';
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
    editorWrap.style.display = 'none';
  });

  ocrBtn.addEventListener('click', function () {
    if (!currentFile || typeof Tesseract === 'undefined') {
      alert('OCR Engine is loading...');
      return;
    }

    ocrBtn.disabled = true;
    progressWrap.style.display = 'block';
    progressBar.style.width = '25%';
    statusText.textContent = 'Initializing OCR engine...';

    Tesseract.recognize(currentFile, 'eng', {
      logger: function (m) {
        if (m.status === 'recognizing text') {
          progressBar.style.width = Math.round(m.progress * 100) + '%';
          statusText.textContent = 'Extracting text: ' + Math.round(m.progress * 100) + '%';
        }
      }
    }).then(function (res) {
      extractedText.value = res.data.text || 'No text found in image.';
      var blob = new Blob([extractedText.value], { type: 'text/plain;charset=utf-8' });
      downloadTxtBtn.href = URL.createObjectURL(blob);
      downloadTxtBtn.download = currentFile.name.replace(/\.[^/.]+$/, '') + '.txt';

      progressWrap.style.display = 'none';
      editorWrap.style.display = 'none';
      resultBox.style.display = 'block';
    }).catch(function (err) {
      console.error(err);
      alert('Error during OCR: ' + err.message);
      progressWrap.style.display = 'none';
      ocrBtn.disabled = false;
    });
  });

  copyTextBtn.addEventListener('click', function () {
    navigator.clipboard.writeText(extractedText.value);
    copyTextBtn.textContent = 'Copied!';
    setTimeout(function () { copyTextBtn.textContent = 'Copy Text'; }, 1500);
  });
})();
