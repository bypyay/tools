
(function() {
  var dropzone = document.getElementById('dropzone');
  var fileInput = document.getElementById('fileInput');
  var editorWrap = document.getElementById('editorWrap');
  var fileName = document.getElementById('fileName');
  var fileOriginalDims = document.getElementById('fileOriginalDims');
  var removeFile = document.getElementById('removeFile');
  var widthInput = document.getElementById('widthInput');
  var heightInput = document.getElementById('heightInput');
  var lockAspect = document.getElementById('lockAspect');
  var resizeBtn = document.getElementById('resizeBtn');
  var imgPreview = document.getElementById('imgPreview');
  var resultBox = document.getElementById('resultBox');
  var resultInfo = document.getElementById('resultInfo');
  var downloadLink = document.getElementById('downloadLink');
  var resetBtn = document.getElementById('resetBtn');

  var loadedImg = null;
  var currentFile = null;
  var origW = 0, origH = 0;

  function handleFile(f) {
    if (!f || !f.type.startsWith('image/')) {
      alert('Please upload a valid image.');
      return;
    }
    currentFile = f;
    fileName.textContent = f.name;

    var reader = new FileReader();
    reader.onload = function(e) {
      var img = new Image();
      img.onload = function() {
        loadedImg = img;
        origW = img.naturalWidth;
        origH = img.naturalHeight;
        fileOriginalDims.textContent = origW + ' × ' + origH + ' px';
        widthInput.value = origW;
        heightInput.value = origH;
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

  widthInput.addEventListener('input', function() {
    if (lockAspect.checked && origW > 0) {
      var w = parseFloat(widthInput.value) || 0;
      heightInput.value = Math.round(w * (origH / origW));
    }
  });

  heightInput.addEventListener('input', function() {
    if (lockAspect.checked && origH > 0) {
      var h = parseFloat(heightInput.value) || 0;
      widthInput.value = Math.round(h * (origW / origH));
    }
  });

  window.scalePct = function(pct) {
    if (origW > 0) {
      widthInput.value = Math.round(origW * pct);
      heightInput.value = Math.round(origH * pct);
    }
  };

  resizeBtn.addEventListener('click', function() {
    if (!loadedImg) return;
    var targetW = parseInt(widthInput.value) || origW;
    var targetH = parseInt(heightInput.value) || origH;

    var canvas = document.createElement('canvas');
    var ctx = canvas.getContext('2d');
    canvas.width = targetW;
    canvas.height = targetH;

    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(loadedImg, 0, 0, targetW, targetH);

    var mime = currentFile.type === 'image/png' ? 'image/png' : 'image/jpeg';
    canvas.toBlob(function(blob) {
      var url = URL.createObjectURL(blob);
      downloadLink.href = url;
      var ext = mime === 'image/png' ? '.png' : '.jpg';
      var outName = currentFile.name.replace(/\.[^/.]+$/, '') + '-' + targetW + 'x' + targetH + ext;
      downloadLink.download = outName;
      downloadLink.textContent = 'Download ' + outName;

      resultInfo.innerHTML = 'Resized from <strong>' + origW + ' × ' + origH + ' px</strong> to <strong style="color:var(--success);">' + targetW + ' × ' + targetH + ' px</strong>.';
      resultBox.style.display = 'block';
    }, mime, 0.95);
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
