(function () {
  var dropzone = document.getElementById('dropzone');
  var fileInput = document.getElementById('fileInput');
  var editorWrap = document.getElementById('editorWrap');
  var canvas = document.getElementById('previewCanvas');
  var ctx = canvas.getContext('2d');
  var downloadZipBtn = document.getElementById('downloadZipBtn');

  var loadedImg = null;
  var currentFile = null;
  var cols = 3, rows = 3;

  function loadFile(file) {
    if (!file || !file.type.match(/image.*/)) return;
    currentFile = file;
    var reader = new FileReader();
    reader.onload = function (e) {
      var img = new Image();
      img.onload = function () {
        loadedImg = img;
        dropzone.style.display = 'none';
        editorWrap.style.display = 'block';
        renderPreview();
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  }

  function renderPreview() {
    if (!loadedImg) return;
    var w = loadedImg.naturalWidth || loadedImg.width;
    var h = loadedImg.naturalHeight || loadedImg.height;
    canvas.width = w;
    canvas.height = h;

    ctx.drawImage(loadedImg, 0, 0, w, h);

    // Draw grid lines and tile numbers
    var tileW = w / cols;
    var tileH = h / rows;

    ctx.strokeStyle = 'rgba(229, 50, 45, 0.9)';
    ctx.lineWidth = Math.max(2, Math.round(w * 0.004));

    var tileNumber = 1;
    for (var r = 0; r < rows; r++) {
      for (var c = 0; c < cols; c++) {
        var x = c * tileW;
        var y = r * tileH;
        ctx.strokeRect(x, y, tileW, tileH);

        // Tile number badge
        ctx.fillStyle = 'rgba(0, 0, 0, 0.55)';
        ctx.fillRect(x + 10, y + 10, 36, 28);
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 16px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('#' + (rows * cols - tileNumber + 1), x + 28, y + 24);
        tileNumber++;
      }
    }
  }

  document.querySelectorAll('.grid-mode-btn').forEach(function (btn) {
    btn.addEventListener('click', function () {
      document.querySelectorAll('.grid-mode-btn').forEach(function (b) { b.classList.remove('active'); });
      btn.classList.add('active');
      cols = parseInt(btn.getAttribute('data-cols')) || 3;
      rows = parseInt(btn.getAttribute('data-rows')) || 3;
      renderPreview();
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

  downloadZipBtn.addEventListener('click', function () {
    if (!loadedImg || typeof JSZip === 'undefined') return;

    var zip = new JSZip();
    var fullW = loadedImg.naturalWidth || loadedImg.width;
    var fullH = loadedImg.naturalHeight || loadedImg.height;
    var tileW = Math.floor(fullW / cols);
    var tileH = Math.floor(fullH / rows);

    var tileCanvas = document.createElement('canvas');
    tileCanvas.width = tileW;
    tileCanvas.height = tileH;
    var tCtx = tileCanvas.getContext('2d');

    var tileIndex = 1;
    var promises = [];

    for (var r = 0; r < rows; r++) {
      for (var c = 0; c < cols; c++) {
        (function (row, col, idx) {
          tCtx.clearRect(0, 0, tileW, tileH);
          tCtx.drawImage(loadedImg, col * tileW, row * tileH, tileW, tileH, 0, 0, tileW, tileH);

          var promise = new Promise(function (resolve) {
            tileCanvas.toBlob(function (blob) {
              // Number tiles in post order (bottom-right first or sequential)
              var fileName = 'grid_tile_' + idx + '.jpg';
              zip.file(fileName, blob);
              resolve();
            }, 'image/jpeg', 0.95);
          });
          promises.push(promise);
          tileIndex++;
        })(r, c, tileIndex);
      }
    }

    Promise.all(promises).then(function () {
      zip.generateAsync({ type: 'blob' }).then(function (zipBlob) {
        var url = URL.createObjectURL(zipBlob);
        var a = document.createElement('a');
        a.href = url;
        a.download = 'instagram-grid-tiles.zip';
        a.click();
      });
    });
  });
})();
