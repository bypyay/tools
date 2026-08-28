
(function() {
  var dropzone = document.getElementById('dropzone');
  var fileInput = document.getElementById('fileInput');
  var editorWrap = document.getElementById('editorWrap');
  var fileName = document.getElementById('fileName');
  var fileSize = document.getElementById('fileSize');
  var removeFile = document.getElementById('removeFile');
  var bgColorPicker = document.getElementById('bgColorPicker');
  var bgPreset = document.getElementById('bgPreset');
  var qRange = document.getElementById('qRange');
  var qVal = document.getElementById('qVal');
  var convertBtn = document.getElementById('convertBtn');
  var imgPreview = document.getElementById('imgPreview');
  var resultBox = document.getElementById('resultBox');
  var downloadLink = document.getElementById('downloadLink');
  var resetBtn = document.getElementById('resetBtn');

  var loadedImg = null;
  var currentFile = null;

  function fmtSize(b) {
    if (b < 1024) return b + ' B';
    if (b < 1048576) return (b / 1024).toFixed(1) + ' KB';
    return (b / 1048576).toFixed(2) + ' MB';
  }

  function handleFile(f) {
    if (!f || !f.type.startsWith('image/')) {
      alert('Please upload a valid PNG or image file.');
      return;
    }
    currentFile = f;
    fileName.textContent = f.name;
    fileSize.textContent = fmtSize(f.size);

    var reader = new FileReader();
    reader.onload = function(e) {
      var img = new Image();
      img.onload = function() {
        loadedImg = img;
        imgPreview.src = e.target.result;
        dropzone.style.display = 'none';
        editorWrap.style.display = 'block';
        resultBox.style.display = 'none';
      };
      img.src = e.target.result;
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

  bgPreset.addEventListener('change', function() {
    if (bgPreset.value !== 'custom') bgColorPicker.value = bgPreset.value;
  });

  qRange.addEventListener('input', function() {
    qVal.textContent = qRange.value + '%';
  });

  convertBtn.addEventListener('click', function() {
    if (!loadedImg) return;
    var canvas = document.createElement('canvas');
    var ctx = canvas.getContext('2d');
    canvas.width = loadedImg.naturalWidth;
    canvas.height = loadedImg.naturalHeight;

    ctx.fillStyle = bgColorPicker.value;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(loadedImg, 0, 0);

    var q = (parseFloat(qRange.value) || 92) / 100;
    canvas.toBlob(function(blob) {
      var url = URL.createObjectURL(blob);
      downloadLink.href = url;
      var outName = currentFile.name.replace(/\.[^/.]+$/, '') + '.jpg';
      downloadLink.download = outName;
      downloadLink.textContent = 'Download ' + outName + ' (' + fmtSize(blob.size) + ')';
      resultBox.style.display = 'block';
    }, 'image/jpeg', q);
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
