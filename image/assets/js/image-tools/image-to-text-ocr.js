
(function() {
  var dropzone = document.getElementById('dropzone');
  var fileInput = document.getElementById('fileInput');
  var editorWrap = document.getElementById('editorWrap');
  var langSelect = document.getElementById('langSelect');
  var ocrBtn = document.getElementById('ocrBtn');
  var ocrOutput = document.getElementById('ocrOutput');
  var charCount = document.getElementById('charCount');
  var wordCount = document.getElementById('wordCount');
  var copyBtn = document.getElementById('copyBtn');
  var downloadTxtBtn = document.getElementById('downloadTxtBtn');
  var resetBtn = document.getElementById('resetBtn');

  var currentFile = null;

  function handleFile(f) {
    if (!f || !f.type.startsWith('image/')) {
      alert('Please upload an image.');
      return;
    }
    currentFile = f;
    dropzone.style.display = 'none';
    editorWrap.style.display = 'block';
  }

  dropzone.addEventListener('click', function() { fileInput.click(); });
  fileInput.addEventListener('change', function(e) { handleFile(e.target.files[0]); fileInput.value = ''; });

  ['dragenter', 'dragover'].forEach(function(evt) {
    dropzone.addEventListener(evt, function(e) { e.preventDefault(); dropzone.classList.add('dragover'); });
  });
  ['dragleave', 'drop'].forEach(function(evt) {
    dropzone.addEventListener(evt, function(e) { e.preventDefault(); dropzone.classList.remove('dragover'); });
  });
  dropzone.addEventListener('drop', function(e) {
    if (e.dataTransfer && e.dataTransfer.files[0]) handleFile(e.dataTransfer.files[0]);
  });

  ocrBtn.addEventListener('click', function() {
    if (!currentFile || typeof Tesseract === 'undefined') return;
    ocrBtn.disabled = true;
    ocrBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Reading Text via Neural OCR...';

    var lang = langSelect.value;
    Tesseract.recognize(currentFile, lang, {
      logger: function(m) {
        if (m.status === 'recognizing text') {
          ocrBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Extracting: ' + Math.round(m.progress * 100) + '%';
        }
      }
    }).then(function(res) {
      var text = res.data.text;
      ocrOutput.value = text;
      charCount.textContent = text.length;
      wordCount.textContent = text.trim() ? text.trim().split(/\s+/).length : 0;

      ocrBtn.disabled = false;
      ocrBtn.innerHTML = '<i class="fa-solid fa-brain"></i> Extract Text with Neural OCR';
    }).catch(function(err) {
      alert('OCR Error: ' + err.message);
      ocrBtn.disabled = false;
      ocrBtn.innerHTML = '<i class="fa-solid fa-brain"></i> Extract Text with Neural OCR';
    });
  });

  copyBtn.addEventListener('click', function() {
    navigator.clipboard.writeText(ocrOutput.value).then(function() {
      alert('Text copied to clipboard!');
    });
  });

  downloadTxtBtn.addEventListener('click', function() {
    var blob = new Blob([ocrOutput.value], { type: 'text/plain;charset=utf-8' });
    var a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'extracted-text.txt';
    a.click();
  });

  resetBtn.addEventListener('click', function() {
    dropzone.style.display = 'block';
    editorWrap.style.display = 'none';
    ocrOutput.value = '';
  });
})();
