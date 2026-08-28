
(function() {
  var dropzone = document.getElementById('dropzone');
  var fileInput = document.getElementById('fileInput');
  var editorWrap = document.getElementById('editorWrap');
  var gridType = document.getElementById('gridType');
  var splitBtn = document.getElementById('splitBtn');
  var canvas = document.getElementById('gridCanvas');
  var ctx = canvas.getContext('2d');

  var loadedImg = null;

  function handleFile(f) {
    if (!f || !f.type.startsWith('image/')) {
      alert('Please upload an image.');
      return;
    }
    var reader = new FileReader();
    reader.onload = function(e) {
      var img = new Image();
      img.onload = function() {
        loadedImg = img;
        dropzone.style.display = 'none';
        editorWrap.style.display = 'block';
        drawGrid();
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

  function getColsRows() {
    var val = gridType.value;
    var parts = val.split('x');
    return { cols: parseInt(parts[0]), rows: parseInt(parts[1]) };
  }

  function drawGrid() {
    if (!loadedImg) return;
    var dims = getColsRows();
    var cols = dims.cols, rows = dims.rows;

    canvas.width = loadedImg.naturalWidth;
    canvas.height = loadedImg.naturalHeight;

    ctx.drawImage(loadedImg, 0, 0);

    // Draw grid lines
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.85)';
    ctx.lineWidth = Math.max(2, Math.round(canvas.width / 300));

    var cellW = canvas.width / cols;
    var cellH = canvas.height / rows;

    for (var c = 1; c < cols; c++) {
      ctx.beginPath();
      ctx.moveTo(c * cellW, 0);
      ctx.lineTo(c * cellW, canvas.height);
      ctx.stroke();
    }
    for (var r = 1; r < rows; r++) {
      ctx.beginPath();
      ctx.moveTo(0, r * cellH);
      ctx.lineTo(canvas.width, r * cellH);
      ctx.stroke();
    }

    // Number tiles
    var num = 1;
    ctx.font = 'bold ' + Math.round(cellW * 0.15) + 'px sans-serif';
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    for (var r = 0; r < rows; r++) {
      for (var c = 0; c < cols; c++) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
        var x = c * cellW + cellW / 2;
        var y = r * cellH + cellH / 2;
        ctx.beginPath();
        ctx.arc(x, y, cellW * 0.12, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#ffffff';
        ctx.fillText(num, x, y);
        num++;
      }
    }
  }

  gridType.addEventListener('change', drawGrid);

  splitBtn.addEventListener('click', function() {
    if (!loadedImg || typeof JSZip === 'undefined') return;
    splitBtn.disabled = true;
    splitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Slicing Grid Tiles...';

    var zip = new JSZip();
    var dims = getColsRows();
    var cols = dims.cols, rows = dims.rows;

    var cellW = Math.floor(loadedImg.naturalWidth / cols);
    var cellH = Math.floor(loadedImg.naturalHeight / rows);

    var tileCanvas = document.createElement('canvas');
    tileCanvas.width = cellW;
    tileCanvas.height = cellH;
    var tCtx = tileCanvas.getContext('2d');

    var tilePromises = [];
    var tileNum = 1;

    for (var r = 0; r < rows; r++) {
      for (var c = 0; c < cols; c++) {
        (function(row, col, num) {
          tilePromises.push(new Promise(function(resolve) {
            tCtx.clearRect(0, 0, cellW, cellH);
            tCtx.drawImage(loadedImg, col * cellW, row * cellH, cellW, cellH, 0, 0, cellW, cellH);
            tileCanvas.toBlob(function(blob) {
              zip.file('tile-' + num + '.jpg', blob);
              resolve();
            }, 'image/jpeg', 0.95);
          }));
        })(r, c, tileNum);
        tileNum++;
      }
    }

    Promise.all(tilePromises).then(function() {
      zip.generateAsync({ type: 'blob' }).then(function(content) {
        var a = document.createElement('a');
        a.href = URL.createObjectURL(content);
        a.download = 'instagram-grid-tiles.zip';
        a.click();
        splitBtn.disabled = false;
        splitBtn.innerHTML = '<i class="fa-solid fa-file-zipper"></i> Split &amp; Download Grid Tiles (ZIP)';
      });
    });
  });
})();
