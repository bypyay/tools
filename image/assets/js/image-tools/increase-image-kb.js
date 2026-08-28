
(function() {
  var dropzone = document.getElementById('dropzone');
  var fileInput = document.getElementById('fileInput');
  var editorWrap = document.getElementById('editorWrap');
  var fileName = document.getElementById('fileName');
  var fileOriginalSize = document.getElementById('fileOriginalSize');
  var removeFile = document.getElementById('removeFile');
  var targetKbInput = document.getElementById('targetKbInput');
  var increaseBtn = document.getElementById('increaseBtn');
  var imgPreview = document.getElementById('imgPreview');
  var resultBox = document.getElementById('resultBox');
  var resultInfo = document.getElementById('resultInfo');
  var downloadLink = document.getElementById('downloadLink');
  var resetBtn = document.getElementById('resetBtn');

  var currentFile = null;

  function fmtSize(b) {
    if (b < 1024) return b + ' B';
    if (b < 1048576) return (b / 1024).toFixed(1) + ' KB';
    return (b / 1048576).toFixed(2) + ' MB';
  }

  function handleFile(f) {
    if (!f || !f.type.startsWith('image/')) {
      alert('Please select a valid image file.');
      return;
    }
    currentFile = f;
    fileName.textContent = f.name;
    fileOriginalSize.textContent = fmtSize(f.size);

    var reader = new FileReader();
    reader.onload = function(e) {
      imgPreview.src = e.target.result;
      dropzone.style.display = 'none';
      editorWrap.style.display = 'block';
      resultBox.style.display = 'none';
    };
    reader.readAsDataURL(f);
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

  document.querySelectorAll('.preset-chip').forEach(function(btn) {
    btn.addEventListener('click', function() {
      document.querySelectorAll('.preset-chip').forEach(function(b) { b.classList.remove('active'); });
      btn.classList.add('active');
      targetKbInput.value = btn.getAttribute('data-kb');
    });
  });

  removeFile.addEventListener('click', function() {
    dropzone.style.display = 'block';
    editorWrap.style.display = 'none';
    resultBox.style.display = 'none';
  });

  increaseBtn.addEventListener('click', function() {
    if (!currentFile) return;
    var targetBytes = (parseFloat(targetKbInput.value) || 50) * 1024;

    var reader = new FileReader();
    reader.onload = function(e) {
      var arrayBuffer = e.target.result;
      var curSize = arrayBuffer.byteLength;

      if (curSize >= targetBytes) {
        alert('Image is already ' + fmtSize(curSize) + ', which is larger than the requested ' + targetKbInput.value + ' KB.');
        return;
      }

      var diff = targetBytes - curSize;
      var padding = new Uint8Array(diff);
      // Fill safe padding
      for (var i = 0; i < diff; i++) padding[i] = (i % 255);

      var combined = new Blob([arrayBuffer, padding], { type: currentFile.type || 'image/jpeg' });
      var url = URL.createObjectURL(combined);

      downloadLink.href = url;
      var outName = currentFile.name.replace(/\.[^/.]+$/, '') + '-' + targetKbInput.value + 'kb.jpg';
      downloadLink.download = outName;
      downloadLink.textContent = 'Download ' + outName + ' (' + fmtSize(combined.size) + ')';

      resultInfo.innerHTML = 'Size increased from <strong>' + fmtSize(curSize) + '</strong> to <strong style="color:var(--success); font-size:1.1rem;">' + fmtSize(combined.size) + '</strong> without image distortion.';
      resultBox.style.display = 'block';
    };
    reader.readAsArrayBuffer(currentFile);
  });

  resetBtn.addEventListener('click', function() {
    dropzone.style.display = 'block';
    editorWrap.style.display = 'none';
    resultBox.style.display = 'none';
  });
})();
