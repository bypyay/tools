(function () {
  var dropzone = document.getElementById('dropzone');
  var fileInput = document.getElementById('fileInput');
  var editorWrap = document.getElementById('editorWrap');
  var canvas = document.getElementById('previewCanvas');
  var ctx = canvas.getContext('2d');
  var splitCols = document.getElementById('splitCols');
  var splitRows = document.getElementById('splitRows');
  var downloadZipBtn = document.getElementById('downloadZipBtn');

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
    var w = loadedImg.naturalWidth || loadedImg.width;
    var h = loadedImg.naturalHeight || loadedImg.height;
    canvas.width = w;
    canvas.height = h;
    ctx.drawImage(loadedImg, 0, 0, w, h);

    var cols = parseInt(splitCols.value) || 2;
    var rows = parseInt(splitRows.value) || 2;
    var tW = w / cols, tH = h / rows;

    ctx.strokeStyle = '#e5322d';
    ctx.lineWidth = Math.max(2, Math.round(w * 0.003));
    for (var r = 0; r < rows; r++) {
      for (var c = 0; c < cols; c++) {
        ctx.strokeRect(c * tW, r * tH, tW, tH);
      }
    }
  }

  splitCols.addEventListener('input', render);
  splitRows.addEventListener('input', render);

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
    var cols = parseInt(splitCols.value) || 2;
    var rows = parseInt(splitRows.value) || 2;

    var fullW = loadedImg.naturalWidth || loadedImg.width;
    var fullH = loadedImg.naturalHeight || loadedImg.height;
    var tileW = Math.floor(fullW / cols);
    var tileH = Math.floor(fullH / rows);

    var tileCanvas = document.createElement('canvas');
    tileCanvas.width = tileW;
    tileCanvas.height = tileH;
    var tCtx = tileCanvas.getContext('2d');

    var promises = [];
    var pieceNum = 1;

    for (var r = 0; r < rows; r++) {
      for (var c = 0; c < cols; c++) {
        (function (row, col, idx) {
          tCtx.clearRect(0, 0, tileW, tileH);
          tCtx.drawImage(loadedImg, col * tileW, row * tileH, tileW, tileH, 0, 0, tileW, tileH);
          var p = new Promise(function (resolve) {
            tileCanvas.toBlob(function (blob) {
              zip.file('piece_' + idx + '.jpg', blob);
              resolve();
            }, 'image/jpeg', 0.95);
          });
          promises.push(p);
          pieceNum++;
        })(r, c, pieceNum);
      }
    }

    Promise.all(promises).then(function () {
      zip.generateAsync({ type: 'blob' }).then(function (zipBlob) {
        var url = URL.createObjectURL(zipBlob);
        var a = document.createElement('a');
        a.href = url;
        a.download = 'split-image-pieces.zip';
        a.click();
      });
    });
  });
})();
