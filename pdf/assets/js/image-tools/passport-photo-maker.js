(function () {
  var dropzone = document.getElementById('dropzone');
  var fileInput = document.getElementById('fileInput');
  var editorWrap = document.getElementById('editorWrap');
  var canvas = document.getElementById('passportCanvas');
  var ctx = canvas.getContext('2d');
  var presetSelect = document.getElementById('presetSelect');
  var zoomRange = document.getElementById('zoomRange');
  var zoomVal = document.getElementById('zoomVal');
  var outputMode = document.getElementById('outputMode');
  var generateBtn = document.getElementById('generateBtn');
  var resultBox = document.getElementById('resultBox');
  var finalImg = document.getElementById('finalImg');
  var downloadLink = document.getElementById('downloadLink');
  var resetBtn = document.getElementById('resetBtn');

  var loadedImg = null;
  var currentFile = null;
  var selectedBg = 'original';

  // Canvas interaction state
  var posX = 0, posY = 0;
  var scale = 1.0;
  var isDragging = false;
  var startX = 0, startY = 0;

  // Preset aspect ratios & pixel sizes at 300 DPI
  var presets = {
    '35x45': { w: 413, h: 531 },      // 3.5cm x 4.5cm @ 300 DPI
    '35x45_mm': { w: 413, h: 531 },   // 35mm x 45mm
    '51x51': { w: 600, h: 600 },      // 2x2 inch
    '35x35': { w: 413, h: 413 },
    'custom': { w: 413, h: 531 }
  };

  function loadFile(file) {
    if (!file || !file.type.match(/image.*/)) {
      alert('Please upload a valid photo.');
      return;
    }
    currentFile = file;
    var reader = new FileReader();
    reader.onload = function (e) {
      var img = new Image();
      img.onload = function () {
        loadedImg = img;
        dropzone.style.display = 'none';
        editorWrap.style.display = 'block';
        resetPosition();
        renderCanvas();
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  }

  function resetPosition() {
    var p = presets[presetSelect.value] || presets['35x45'];
    canvas.width = p.w;
    canvas.height = p.h;

    var imgAspect = loadedImg.naturalWidth / loadedImg.naturalHeight;
    var canvasAspect = p.w / p.h;

    if (imgAspect > canvasAspect) {
      scale = p.h / loadedImg.naturalHeight;
    } else {
      scale = p.w / loadedImg.naturalWidth;
    }
    scale *= 1.1; // Default slightly zoomed

    posX = (p.w - loadedImg.naturalWidth * scale) / 2;
    posY = (p.h - loadedImg.naturalHeight * scale) / 2;

    zoomRange.value = 100;
    zoomVal.textContent = '100%';
  }

  function renderCanvas() {
    if (!loadedImg) return;
    var p = presets[presetSelect.value] || presets['35x45'];
    canvas.width = p.w;
    canvas.height = p.h;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (selectedBg !== 'original') {
      ctx.fillStyle = selectedBg;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    var z = parseFloat(zoomRange.value) / 100;
    var drawW = loadedImg.naturalWidth * scale * z;
    var drawH = loadedImg.naturalHeight * scale * z;

    ctx.drawImage(loadedImg, posX, posY, drawW, drawH);
  }

  // Mouse & Touch Dragging
  canvas.addEventListener('mousedown', function (e) {
    isDragging = true;
    startX = e.clientX - posX;
    startY = e.clientY - posY;
  });
  window.addEventListener('mousemove', function (e) {
    if (!isDragging) return;
    posX = e.clientX - startX;
    posY = e.clientY - startY;
    renderCanvas();
  });
  window.addEventListener('mouseup', function () { isDragging = false; });

  // Touch Support
  canvas.addEventListener('touchstart', function (e) {
    if (e.touches.length === 1) {
      isDragging = true;
      startX = e.touches[0].clientX - posX;
      startY = e.touches[0].clientY - posY;
    }
  });
  canvas.addEventListener('touchmove', function (e) {
    if (!isDragging || e.touches.length !== 1) return;
    posX = e.touches[0].clientX - startX;
    posY = e.touches[0].clientY - startY;
    renderCanvas();
    e.preventDefault();
  });
  canvas.addEventListener('touchend', function () { isDragging = false; });

  zoomRange.addEventListener('input', function () {
    zoomVal.textContent = zoomRange.value + '%';
    renderCanvas();
  });

  presetSelect.addEventListener('change', function () {
    resetPosition();
    renderCanvas();
  });

  document.querySelectorAll('.bg-btn').forEach(function (btn) {
    btn.addEventListener('click', function () {
      document.querySelectorAll('.bg-btn').forEach(function (b) { b.classList.remove('active'); });
      btn.classList.add('active');
      selectedBg = btn.getAttribute('data-bg');
      renderCanvas();
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

  generateBtn.addEventListener('click', function () {
    renderCanvas();
    var mode = outputMode.value;

    if (mode === 'single') {
      canvas.toBlob(function (blob) {
        var url = URL.createObjectURL(blob);
        finalImg.src = url;
        downloadLink.href = url;
        downloadLink.download = 'passport-photo-3.5x4.5cm.jpg';
        editorWrap.style.display = 'none';
        resultBox.style.display = 'block';
      }, 'image/jpeg', 0.95);
    } else {
      // Multi photo printable sheet
      var sheetCanvas = document.createElement('canvas');
      var sCtx = sheetCanvas.getContext('2d');

      if (mode === 'sheet_4x6_6') {
        // 4x6 inch @ 300 DPI = 1200 x 1800 px (6 photos: 2 cols x 3 rows)
        sheetCanvas.width = 1800;
        sheetCanvas.height = 1200;
        sCtx.fillStyle = '#ffffff';
        sCtx.fillRect(0, 0, 1800, 1200);

        var pW = canvas.width, pH = canvas.height;
        var startLeft = 140, startTop = 80, gapX = 140, gapY = 80;

        for (var r = 0; r < 2; r++) {
          for (var c = 0; c < 3; c++) {
            var x = startLeft + c * (pW + gapX);
            var y = startTop + r * (pH + gapY);
            sCtx.drawImage(canvas, x, y, pW, pH);
            sCtx.strokeStyle = '#e2e8f0';
            sCtx.lineWidth = 1;
            sCtx.strokeRect(x, y, pW, pH);
          }
        }
      } else if (mode === 'sheet_a4_8') {
        // A4 @ 300 DPI = 2480 x 3508 px (8 photos: 4 cols x 2 rows)
        sheetCanvas.width = 2480;
        sheetCanvas.height = 3508;
        sCtx.fillStyle = '#ffffff';
        sCtx.fillRect(0, 0, 2480, 3508);

        var pW = canvas.width, pH = canvas.height;
        for (var r = 0; r < 2; r++) {
          for (var c = 0; c < 4; c++) {
            var x = 160 + c * (pW + 140);
            var y = 200 + r * (pH + 140);
            sCtx.drawImage(canvas, x, y, pW, pH);
            sCtx.strokeStyle = '#cbd5e1';
            sCtx.lineWidth = 1;
            sCtx.strokeRect(x, y, pW, pH);
          }
        }
      }

      sheetCanvas.toBlob(function (blob) {
        var url = URL.createObjectURL(blob);
        finalImg.src = url;
        downloadLink.href = url;
        downloadLink.download = 'passport-printable-sheet.jpg';
        editorWrap.style.display = 'none';
        resultBox.style.display = 'block';
      }, 'image/jpeg', 0.95);
    }
  });

  resetBtn.addEventListener('click', function () {
    loadedImg = null;
    dropzone.style.display = 'block';
    editorWrap.style.display = 'none';
    resultBox.style.display = 'none';
  });
})();
