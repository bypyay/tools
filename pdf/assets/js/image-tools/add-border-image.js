(function () {
  var dropzone = document.getElementById('dropzone');
  var fileInput = document.getElementById('fileInput');
  var editorWrap = document.getElementById('editorWrap');
  var canvas = document.getElementById('previewCanvas');
  var ctx = canvas.getContext('2d');
  var borderColor = document.getElementById('borderColor');
  var borderThickness = document.getElementById('borderThickness');
  var downloadBtn = document.getElementById('downloadBtn');

  var loadedImg = null;

  function loadFile(file) {
    if (!file || !file.type.match(/image.*/)) return;
    var reader = new FileReader();
    reader.onload = function (e) {
      var img = new Image();
      img.onload = function () {
        loadedImg = img;
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
    var origW = loadedImg.naturalWidth || loadedImg.width;
    var origH = loadedImg.naturalHeight || loadedImg.height;
    var borderPct = (parseInt(borderThickness.value) || 6) / 100;
    var bW = Math.round(Math.min(origW, origH) * borderPct);

    canvas.width = origW + bW * 2;
    canvas.height = origH + bW * 2;

    ctx.fillStyle = borderColor.value;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(loadedImg, bW, bW);
  }

  borderColor.addEventListener('input', render);
  borderThickness.addEventListener('input', render);

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
      a.download = 'photo-with-border.jpg';
      a.click();
    }, 'image/jpeg', 0.95);
  });
})();
