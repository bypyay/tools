
(function() {
  var dropzone = document.getElementById('dropzone');
  var fileInput = document.getElementById('fileInput');
  var editorWrap = document.getElementById('editorWrap');
  var splitCols = document.getElementById('splitCols');
  var splitRows = document.getElementById('splitRows');
  var downloadZipBtn = document.getElementById('downloadZipBtn');
  var canvas = document.getElementById('previewCanvas');
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
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        dropzone.style.display = 'none';
        editorWrap.style.display = 'block';
        draw();
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(f);
  }

  dropzone.addEventListener('click', function() { fileInput.click(); });
  fileInput.addEventListener('change', function(e) { handleFile(e.target.files[0]); fileInput.value = ''; });

  function draw() {
    if (!loadedImg) return;
    var cols = parseInt(splitCols.value) || 2;
    var rows = parseInt(splitRows.value) || 2;

    ctx.drawImage(loadedImg, 0, 0);

    ctx.strokeStyle = '#ef4444';
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
  }

  splitCols.addEventListener('input', draw);
  splitRows.addEventListener('input', draw);

  downloadZipBtn.addEventListener('click', function() {
    if (!loadedImg || typeof JSZip === 'undefined') return;
    downloadZipBtn.disabled = true;
    downloadZipBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Splitting Image...';

    var zip = new JSZip();
    var cols = parseInt(splitCols.value) || 2;
    var rows = parseInt(splitRows.value) || 2;

    var cellW = Math.floor(loadedImg.naturalWidth / cols);
    var cellH = Math.floor(loadedImg.naturalHeight / rows);

    var tileCanvas = document.createElement('canvas');
    tileCanvas.width = cellW;
    tileCanvas.height = cellH;
    var tCtx = tileCanvas.getContext('2d');

    var promises = [];
    var count = 1;

    for (var r = 0; r < rows; r++) {
      for (var c = 0; c < cols; c++) {
        (function(row, col, num) {
          promises.push(new Promise(function(resolve) {
            tCtx.clearRect(0, 0, cellW, cellH);
            tCtx.drawImage(loadedImg, col * cellW, row * cellH, cellW, cellH, 0, 0, cellW, cellH);
            tileCanvas.toBlob(function(blob) {
              zip.file('slice_' + num + '.jpg', blob);
              resolve();
            }, 'image/jpeg', 0.95);
          }));
        })(r, c, count);
        count++;
      }
    }

    Promise.all(promises).then(function() {
      zip.generateAsync({ type: 'blob' }).then(function(content) {
        var a = document.createElement('a');
        a.href = URL.createObjectURL(content);
        a.download = 'split-slices.zip';
        a.click();
        downloadZipBtn.disabled = false;
        downloadZipBtn.innerHTML = '<i class="fa-solid fa-file-zipper"></i> Split &amp; Download Slices (ZIP)';
      });
    });
  });
})();
