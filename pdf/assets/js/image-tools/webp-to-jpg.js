(function () {
  var dropzone = document.getElementById('dropzone');
  var fileInput = document.getElementById('fileInput');
  var fileInfo = document.getElementById('fileInfo');
  var fileNameEl = document.getElementById('fileName');
  var fileSizeEl = document.getElementById('fileSize');
  var removeFileBtn = document.getElementById('removeFile');
  var imgPreview = document.getElementById('imgPreview');
  var convertBtn = document.getElementById('convertBtn');
  var resultBox = document.getElementById('resultBox');
  var finalImg = document.getElementById('finalImg');
  var downloadLink = document.getElementById('downloadLink');
  var resetBtn = document.getElementById('resetBtn');

  var loadedImg = null;
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

    var reader = new FileReader();
    reader.onload = function (e) {
      var img = new Image();
      img.onload = function () {
        loadedImg = img;
        imgPreview.src = e.target.result;
        dropzone.style.display = 'none';
        fileInfo.style.display = 'block';
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
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
    loadedImg = null;
    dropzone.style.display = 'block';
    fileInfo.style.display = 'none';
  });

  convertBtn.addEventListener('click', function () {
    if (!loadedImg) return;
    var canvas = document.createElement('canvas');
    var ctx = canvas.getContext('2d');
    var w = loadedImg.naturalWidth || loadedImg.width;
    var h = loadedImg.naturalHeight || loadedImg.height;
    canvas.width = w;
    canvas.height = h;

    ctx.fillStyle = '#ffffff'; ctx.fillRect(0, 0, w, h);
    ctx.drawImage(loadedImg, 0, 0, w, h);

    

    canvas.toBlob(function (blob) {
      var url = URL.createObjectURL(blob);
      finalImg.src = url;
      downloadLink.href = url;
      var outName = currentFile.name.replace(/\.[^/.]+$/, '') + '-converted.jpg';
      downloadLink.download = outName;
      downloadLink.textContent = 'Download ' + outName;

      fileInfo.style.display = 'none';
      resultBox.style.display = 'block';
    }, 'image/jpeg', 0.95);
  });

  resetBtn.addEventListener('click', function () {
    loadedImg = null;
    dropzone.style.display = 'block';
    fileInfo.style.display = 'none';
    resultBox.style.display = 'none';
  });
})();
