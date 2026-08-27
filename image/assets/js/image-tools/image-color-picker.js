(function () {
  var dropzone = document.getElementById('dropzone');
  var fileInput = document.getElementById('fileInput');
  var editorWrap = document.getElementById('editorWrap');
  var canvas = document.getElementById('previewCanvas');
  var ctx = canvas.getContext('2d');
  var colorSwatch = document.getElementById('colorSwatch');
  var hexVal = document.getElementById('hexVal');
  var rgbVal = document.getElementById('rgbVal');
  var copyHexBtn = document.getElementById('copyHexBtn');
  var copyRgbBtn = document.getElementById('copyRgbBtn');

  function rgbToHex(r, g, b) {
    return '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).toUpperCase();
  }

  function loadFile(file) {
    if (!file || !file.type.match(/image.*/)) return;
    var reader = new FileReader();
    reader.onload = function (e) {
      var img = new Image();
      img.onload = function () {
        canvas.width = img.naturalWidth || img.width;
        canvas.height = img.naturalHeight || img.height;
        ctx.drawImage(img, 0, 0);
        dropzone.style.display = 'none';
        editorWrap.style.display = 'block';
        sampleAt(Math.floor(canvas.width / 2), Math.floor(canvas.height / 2));
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  }

  function sampleAt(x, y) {
    var p = ctx.getImageData(x, y, 1, 1).data;
    var hex = rgbToHex(p[0], p[1], p[2]);
    var rgb = 'rgb(' + p[0] + ', ' + p[1] + ', ' + p[2] + ')';

    colorSwatch.style.background = hex;
    hexVal.value = hex;
    rgbVal.value = rgb;
  }

  canvas.addEventListener('click', function (e) {
    var rect = canvas.getBoundingClientRect();
    var x = Math.floor((e.clientX - rect.left) * (canvas.width / rect.width));
    var y = Math.floor((e.clientY - rect.top) * (canvas.height / rect.height));
    sampleAt(x, y);
  });

  copyHexBtn.addEventListener('click', function () {
    navigator.clipboard.writeText(hexVal.value);
    copyHexBtn.textContent = 'Copied!';
    setTimeout(function () { copyHexBtn.textContent = 'Copy'; }, 1500);
  });

  copyRgbBtn.addEventListener('click', function () {
    navigator.clipboard.writeText(rgbVal.value);
    copyRgbBtn.textContent = 'Copied!';
    setTimeout(function () { copyRgbBtn.textContent = 'Copy'; }, 1500);
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
})();
