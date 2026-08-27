(function () {
  var dropzone = document.getElementById('dropzone');
  var fileInput = document.getElementById('fileInput');
  var editorWrap = document.getElementById('editorWrap');
  var canvas = document.getElementById('previewCanvas');
  var ctx = canvas.getContext('2d');
  var wmText = document.getElementById('wmText');
  var wmColor = document.getElementById('wmColor');
  var wmOpacity = document.getElementById('wmOpacity');
  var wmSize = document.getElementById('wmSize');
  var downloadBtn = document.getElementById('downloadBtn');

  var loadedImg = null;
  var currentFile = null;
  var posX = 100, posY = 100;
  var isDragging = false, startX = 0, startY = 0;

  function loadFile(file) {
    if (!file || !file.type.match(/image.*/)) return;
    currentFile = file;
    var reader = new FileReader();
    reader.onload = function (e) {
      var img = new Image();
      img.onload = function () {
        loadedImg = img;
        canvas.width = img.naturalWidth || img.width;
        canvas.height = img.naturalHeight || img.height;
        posX = canvas.width / 2;
        posY = canvas.height / 2;
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
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(loadedImg, 0, 0);

    var text = wmText.value || 'WATERMARK';
    var size = parseInt(wmSize.value) || 42;
    var opacity = (parseInt(wmOpacity.value) || 50) / 100;

    ctx.save();
    ctx.globalAlpha = opacity;
    ctx.fillStyle = wmColor.value;
    ctx.font = 'bold ' + size + 'px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.shadowColor = 'rgba(0,0,0,0.5)';
    ctx.shadowBlur = 6;
    ctx.fillText(text, posX, posY);
    ctx.restore();
  }

  wmText.addEventListener('input', render);
  wmColor.addEventListener('input', render);
  wmOpacity.addEventListener('input', render);
  wmSize.addEventListener('input', render);

  canvas.addEventListener('mousedown', function (e) {
    isDragging = true;
    var rect = canvas.getBoundingClientRect();
    var scaleX = canvas.width / rect.width;
    var scaleY = canvas.height / rect.height;
    posX = (e.clientX - rect.left) * scaleX;
    posY = (e.clientY - rect.top) * scaleY;
    render();
  });
  window.addEventListener('mousemove', function (e) {
    if (!isDragging || !loadedImg) return;
    var rect = canvas.getBoundingClientRect();
    var scaleX = canvas.width / rect.width;
    var scaleY = canvas.height / rect.height;
    posX = (e.clientX - rect.left) * scaleX;
    posY = (e.clientY - rect.top) * scaleY;
    render();
  });
  window.addEventListener('mouseup', function () { isDragging = false; });

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
      a.download = 'watermarked-image.jpg';
      a.click();
    }, 'image/jpeg', 0.95);
  });
})();
