(function () {
  var dropzone = document.getElementById('dropzone');
  var fileInput = document.getElementById('fileInput');
  var editorWrap = document.getElementById('editorWrap');
  var fileNameEl = document.getElementById('fileName');
  var fileOriginalDims = document.getElementById('fileOriginalDims');
  var removeFileBtn = document.getElementById('removeFile');
  var widthInput = document.getElementById('widthInput');
  var heightInput = document.getElementById('heightInput');
  var lockAspect = document.getElementById('lockAspect');
  var imgPreview = document.getElementById('imgPreview');
  var resizeBtn = document.getElementById('resizeBtn');
  var resultBox = document.getElementById('resultBox');
  var resultInfo = document.getElementById('resultInfo');
  var downloadLink = document.getElementById('downloadLink');
  var resetBtn = document.getElementById('resetBtn');

  var loadedImg = null;
  var currentFile = null;
  var origW = 0, origH = 0;
  var aspectRatio = 1.0;

  function loadFile(file) {
    if (!file || !file.type.match(/image.*/)) return;
    currentFile = file;
    fileNameEl.textContent = file.name;

    var reader = new FileReader();
    reader.onload = function (e) {
      var img = new Image();
      img.onload = function () {
        loadedImg = img;
        origW = img.naturalWidth || img.width;
        origH = img.naturalHeight || img.height;
        aspectRatio = origW / origH;

        fileOriginalDims.textContent = 'Original: ' + origW + ' × ' + origH + ' px';
        widthInput.value = origW;
        heightInput.value = origH;
        imgPreview.src = e.target.result;

        dropzone.style.display = 'none';
        editorWrap.style.display = 'block';
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  }

  widthInput.addEventListener('input', function () {
    if (lockAspect.checked && origW > 0) {
      var newW = parseInt(widthInput.value) || 0;
      heightInput.value = Math.round(newW / aspectRatio);
    }
  });

  heightInput.addEventListener('input', function () {
    if (lockAspect.checked && origH > 0) {
      var newH = parseInt(heightInput.value) || 0;
      widthInput.value = Math.round(newH * aspectRatio);
    }
  });

  document.querySelectorAll('.preset-chip').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var scale = parseFloat(btn.getAttribute('data-scale')) || 1.0;
      widthInput.value = Math.round(origW * scale);
      heightInput.value = Math.round(origH * scale);
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
    loadedImg = null;
    dropzone.style.display = 'block';
    editorWrap.style.display = 'none';
  });

  resizeBtn.addEventListener('click', function () {
    if (!loadedImg) return;
    var targetW = parseInt(widthInput.value) || origW;
    var targetH = parseInt(heightInput.value) || origH;

    var canvas = document.createElement('canvas');
    var ctx = canvas.getContext('2d');
    canvas.width = targetW;
    canvas.height = targetH;

    ctx.drawImage(loadedImg, 0, 0, targetW, targetH);

    canvas.toBlob(function (blob) {
      var url = URL.createObjectURL(blob);
      downloadLink.href = url;
      var outName = currentFile.name.replace(/\.[^/.]+$/, '') + '-' + targetW + 'x' + targetH + '.jpg';
      downloadLink.download = outName;
      downloadLink.textContent = 'Download ' + outName;

      resultInfo.innerHTML = 'Resized from <strong>' + origW + ' × ' + origH + ' px</strong> to <strong style="color:var(--green);">' + targetW + ' × ' + targetH + ' px</strong>.';

      editorWrap.style.display = 'none';
      resultBox.style.display = 'block';
    }, 'image/jpeg', 0.92);
  });

  resetBtn.addEventListener('click', function () {
    loadedImg = null;
    dropzone.style.display = 'block';
    editorWrap.style.display = 'none';
    resultBox.style.display = 'none';
  });
})();
