(function () {
  var dropzone = document.getElementById('dropzone');
  var fileInput = document.getElementById('fileInput');
  var editorWrap = document.getElementById('editorWrap');
  var unitSelect = document.getElementById('unitSelect');
  var widthInput = document.getElementById('widthInput');
  var heightInput = document.getElementById('heightInput');
  var resizeBtn = document.getElementById('resizeBtn');

  var loadedImg = null;
  var currentDpi = 300;

  function loadFile(file) {
    if (!file || !file.type.match(/image.*/)) return;
    var reader = new FileReader();
    reader.onload = function (e) {
      var img = new Image();
      img.onload = function () {
        loadedImg = img;
        dropzone.style.display = 'none';
        editorWrap.style.display = 'block';
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  }

  document.querySelectorAll('.dpi-btn').forEach(function (btn) {
    btn.addEventListener('click', function () {
      document.querySelectorAll('.dpi-btn').forEach(function (b) { b.classList.remove('active'); });
      btn.classList.add('active');
      currentDpi = parseInt(btn.getAttribute('data-dpi')) || 300;
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

  resizeBtn.addEventListener('click', function () {
    if (!loadedImg) return;
    var unit = unitSelect.value;
    var wVal = parseFloat(widthInput.value) || 3.5;
    var hVal = parseFloat(heightInput.value) || 4.5;

    var pxW = 0, pxH = 0;
    if (unit === 'cm') {
      pxW = Math.round((wVal / 2.54) * currentDpi);
      pxH = Math.round((hVal / 2.54) * currentDpi);
    } else if (unit === 'mm') {
      pxW = Math.round((wVal / 25.4) * currentDpi);
      pxH = Math.round((hVal / 25.4) * currentDpi);
    } else {
      pxW = Math.round(wVal * currentDpi);
      pxH = Math.round(hVal * currentDpi);
    }

    var canvas = document.createElement('canvas');
    canvas.width = pxW;
    canvas.height = pxH;
    var ctx = canvas.getContext('2d');
    ctx.drawImage(loadedImg, 0, 0, pxW, pxH);

    canvas.toBlob(function (blob) {
      var url = URL.createObjectURL(blob);
      var a = document.createElement('a');
      a.href = url;
      a.download = 'resized-' + wVal + unit + 'x' + hVal + unit + '.jpg';
      a.click();
    }, 'image/jpeg', 0.95);
  });
})();
