
(function() {
  var dropzone = document.getElementById('dropzone');
  var fileInput = document.getElementById('fileInput');
  var editorWrap = document.getElementById('editorWrap');
  var fileName = document.getElementById('fileName');
  var fileSize = document.getElementById('fileSize');
  var removeFile = document.getElementById('removeFile');
  var convertBtn = document.getElementById('convertBtn');
  var resultBox = document.getElementById('resultBox');
  var convertedPreview = document.getElementById('convertedPreview');
  var downloadLink = document.getElementById('downloadLink');
  var resetBtn = document.getElementById('resetBtn');

  var currentFile = null;

  function fmtSize(b) {
    if (b < 1024) return b + ' B';
    if (b < 1048576) return (b / 1024).toFixed(1) + ' KB';
    return (b / 1048576).toFixed(2) + ' MB';
  }

  function handleFile(f) {
    if (!f) return;
    currentFile = f;
    fileName.textContent = f.name;
    fileSize.textContent = fmtSize(f.size);
    dropzone.style.display = 'none';
    editorWrap.style.display = 'block';
    resultBox.style.display = 'none';
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

  convertBtn.addEventListener('click', function() {
    if (!currentFile) return;
    convertBtn.disabled = true;
    convertBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Decoding Apple HEIC...';

    if (typeof heic2any !== 'undefined') {
      heic2any({
        blob: currentFile,
        toType: 'image/jpeg',
        quality: 0.92
      }).then(function(resultBlob) {
        var blob = Array.isArray(resultBlob) ? resultBlob[0] : resultBlob;
        var url = URL.createObjectURL(blob);
        convertedPreview.src = url;
        downloadLink.href = url;
        var outName = currentFile.name.replace(/\.[^/.]+$/, '') + '.jpg';
        downloadLink.download = outName;
        downloadLink.textContent = 'Download ' + outName + ' (' + fmtSize(blob.size) + ')';
        editorWrap.style.display = 'none';
        resultBox.style.display = 'block';
        convertBtn.disabled = false;
        convertBtn.innerHTML = '<i class="fa-solid fa-bolt"></i> Convert HEIC to JPG Now';
      }).catch(function(err) {
        alert('Could not decode HEIC file: ' + err.message);
        convertBtn.disabled = false;
        convertBtn.innerHTML = '<i class="fa-solid fa-bolt"></i> Convert HEIC to JPG Now';
      });
    } else {
      alert('HEIC decoder library is loading, please try again in a few seconds.');
      convertBtn.disabled = false;
    }
  });

  removeFile.addEventListener('click', function() {
    dropzone.style.display = 'block';
    editorWrap.style.display = 'none';
    resultBox.style.display = 'none';
  });

  resetBtn.addEventListener('click', function() {
    dropzone.style.display = 'block';
    editorWrap.style.display = 'none';
    resultBox.style.display = 'none';
  });
})();
