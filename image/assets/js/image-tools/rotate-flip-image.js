(function () {
  var dropzone = document.getElementById('dropzone');
  var fileInput = document.getElementById('fileInput');
  var editorWrap = document.getElementById('editorWrap');
  var canvas = document.getElementById('previewCanvas');
  var ctx = canvas.getContext('2d');
  var rotLeftBtn = document.getElementById('rotLeftBtn');
  var rotRightBtn = document.getElementById('rotRightBtn');
  var flipHBtn = document.getElementById('flipHBtn');
  var flipVBtn = document.getElementById('flipVBtn');
  var downloadBtn = document.getElementById('downloadBtn');

  var loadedImg = null;
  var currentAngle = 0;
  var flipH = 1, flipV = 1;

  function loadFile(file) {
    if (!file || !file.type.match(/image.*/)) return;
    var reader = new FileReader();
    reader.onload = function (e) {
      var img = new Image();
      img.onload = function () {
        loadedImg = img;
        currentAngle = 0;
        flipH = 1; flipV = 1;
        dropzone.style.display = 'none';
        editorWrap.style.display = 'block';
        render();
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  }

  function render() {
    if (!loadedImg) return;
    var rad = (currentAngle * Math.PI) / 180;
    var sin = Math.abs(Math.sin(rad));
    var cos = Math.abs(Math.cos(rad));
    var origW = loadedImg.naturalWidth || loadedImg.width;
    var origH = loadedImg.naturalHeight || loadedImg.height;

    var newW = Math.round(origW * cos + origH * sin);
    var newH = Math.round(origW * sin + origH * cos);
    canvas.width = newW;
    canvas.height = newH;

    ctx.save();
    ctx.translate(newW / 2, newH / 2);
    ctx.rotate(rad);
    ctx.scale(flipH, flipV);
    ctx.drawImage(loadedImg, -origW / 2, -origH / 2);
    ctx.restore();
  }

  rotLeftBtn.addEventListener('click', function () { currentAngle = (currentAngle - 90) % 360; render(); });
  rotRightBtn.addEventListener('click', function () { currentAngle = (currentAngle + 90) % 360; render(); });
  flipHBtn.addEventListener('click', function () { flipH *= -1; render(); });
  flipVBtn.addEventListener('click', function () { flipV *= -1; render(); });

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

  downloadBtn.addEventListener('click', function () {
    render();
    canvas.toBlob(function (blob) {
      var url = URL.createObjectURL(blob);
      var a = document.createElement('a');
      a.href = url;
      a.download = 'transformed-image.jpg';
      a.click();
    }, 'image/jpeg', 0.95);
  });
})();
