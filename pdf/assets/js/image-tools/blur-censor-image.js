(function () {
  var dropzone = document.getElementById('dropzone');
  var fileInput = document.getElementById('fileInput');
  var editorWrap = document.getElementById('editorWrap');
  var canvas = document.getElementById('previewCanvas');
  var ctx = canvas.getContext('2d');
  var pixelBtn = document.getElementById('pixelBtn');
  var blackoutBtn = document.getElementById('blackoutBtn');
  var clearBtn = document.getElementById('clearBtn');
  var downloadBtn = document.getElementById('downloadBtn');

  var loadedImg = null;
  var mode = 'pixel'; // 'pixel' or 'blackout'
  var isDrawing = false, startX = 0, startY = 0;

  function loadFile(file) {
    if (!file || !file.type.match(/image.*/)) return;
    var reader = new FileReader();
    reader.onload = function (e) {
      var img = new Image();
      img.onload = function () {
        loadedImg = img;
        canvas.width = img.naturalWidth || img.width;
        canvas.height = img.naturalHeight || img.height;
        ctx.drawImage(img, 0, 0);
        dropzone.style.display = 'none';
        editorWrap.style.display = 'block';
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  }

  pixelBtn.addEventListener('click', function () { mode = 'pixel'; pixelBtn.classList.add('active'); blackoutBtn.classList.remove('active'); });
  blackoutBtn.addEventListener('click', function () { mode = 'blackout'; blackoutBtn.classList.add('active'); pixelBtn.classList.remove('active'); });
  clearBtn.addEventListener('click', function () { if (loadedImg) ctx.drawImage(loadedImg, 0, 0); });

  function getCanvasCoords(e) {
    var rect = canvas.getBoundingClientRect();
    return {
      x: (e.clientX - rect.left) * (canvas.width / rect.width),
      y: (e.clientY - rect.top) * (canvas.height / rect.height)
    };
  }

  canvas.addEventListener('mousedown', function (e) {
    isDrawing = true;
    var c = getCanvasCoords(e);
    startX = c.x; startY = c.y;
  });

  window.addEventListener('mouseup', function (e) {
    if (!isDrawing) return;
    isDrawing = false;
    var c = getCanvasCoords(e);
    var x = Math.min(startX, c.x);
    var y = Math.min(startY, c.y);
    var w = Math.abs(c.x - startX);
    var h = Math.abs(c.y - startY);
    if (w < 4 || h < 4) return;

    if (mode === 'blackout') {
      ctx.fillStyle = '#000000';
      ctx.fillRect(x, y, w, h);
    } else {
      // Pixelate effect
      var pixelSize = Math.max(10, Math.round(w / 12));
      var sampleCanvas = document.createElement('canvas');
      sampleCanvas.width = Math.max(1, Math.floor(w / pixelSize));
      sampleCanvas.height = Math.max(1, Math.floor(h / pixelSize));
      var sCtx = sampleCanvas.getContext('2d');
      sCtx.drawImage(canvas, x, y, w, h, 0, 0, sampleCanvas.width, sampleCanvas.height);
      ctx.imageSmoothingEnabled = false;
      ctx.drawImage(sampleCanvas, 0, 0, sampleCanvas.width, sampleCanvas.height, x, y, w, h);
      ctx.imageSmoothingEnabled = true;
    }
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

  downloadBtn.addEventListener('click', function () {
    canvas.toBlob(function (blob) {
      var url = URL.createObjectURL(blob);
      var a = document.createElement('a');
      a.href = url;
      a.download = 'censored-image.jpg';
      a.click();
    }, 'image/jpeg', 0.95);
  });
})();
