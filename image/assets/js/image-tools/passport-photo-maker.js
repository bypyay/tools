
(function() {
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
  var selectedBg = 'original';
  var posX = 0, posY = 0;
  var baseScale = 1.0;
  var isDragging = false;
  var startX = 0, startY = 0;

  var presets = {
    '35x45': { w: 413, h: 531, name: '3.5x4.5cm' },
    '51x51': { w: 600, h: 600, name: '2x2inch' },
    '35x45_eu': { w: 413, h: 531, name: '35x45mm' },
    '35x35': { w: 413, h: 413, name: '35x35mm' },
    '30x40': { w: 354, h: 472, name: '3x4cm' }
  };

  function handleFile(f) {
    if (!f || !f.type.startsWith('image/')) {
      alert('Please upload a valid portrait photo.');
      return;
    }
    var reader = new FileReader();
    reader.onload = function(e) {
      var img = new Image();
      img.onload = function() {
        loadedImg = img;
        dropzone.style.display = 'none';
        editorWrap.style.display = 'block';
        resultBox.style.display = 'none';
        resetFraming();
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

  function resetFraming() {
    var p = presets[presetSelect.value] || presets['35x45'];
    canvas.width = p.w;
    canvas.height = p.h;

    var imgAspect = loadedImg.naturalWidth / loadedImg.naturalHeight;
    var canvasAspect = p.w / p.h;

    if (imgAspect > canvasAspect) {
      baseScale = p.h / loadedImg.naturalHeight;
    } else {
      baseScale = p.w / loadedImg.naturalWidth;
    }
    baseScale *= 1.1;

    posX = (p.w - loadedImg.naturalWidth * baseScale) / 2;
    posY = (p.h - loadedImg.naturalHeight * baseScale) / 2;

    zoomRange.value = 100;
    zoomVal.textContent = '100%';
    draw();
  }

  function draw() {
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
    var drawW = loadedImg.naturalWidth * baseScale * z;
    var drawH = loadedImg.naturalHeight * baseScale * z;

    ctx.drawImage(loadedImg, posX, posY, drawW, drawH);
  }

  // Canvas Dragging
  canvas.addEventListener('mousedown', function(e) {
    isDragging = true;
    startX = e.clientX - posX;
    startY = e.clientY - posY;
    canvas.style.cursor = 'grabbing';
  });
  window.addEventListener('mousemove', function(e) {
    if (!isDragging) return;
    posX = e.clientX - startX;
    posY = e.clientY - startY;
    draw();
  });
  window.addEventListener('mouseup', function() { isDragging = false; canvas.style.cursor = 'grab'; });

  // Touch Dragging
  canvas.addEventListener('touchstart', function(e) {
    if (e.touches.length === 1) {
      isDragging = true;
      startX = e.touches[0].clientX - posX;
      startY = e.touches[0].clientY - posY;
    }
  });
  canvas.addEventListener('touchmove', function(e) {
    if (!isDragging || e.touches.length !== 1) return;
    posX = e.touches[0].clientX - startX;
    posY = e.touches[0].clientY - startY;
    draw();
    e.preventDefault();
  });
  canvas.addEventListener('touchend', function() { isDragging = false; });

  zoomRange.addEventListener('input', function() {
    zoomVal.textContent = zoomRange.value + '%';
    draw();
  });

  presetSelect.addEventListener('change', resetFraming);

  document.querySelectorAll('.bg-btn').forEach(function(btn) {
    btn.addEventListener('click', function() {
      document.querySelectorAll('.bg-btn').forEach(function(b) { b.classList.remove('active'); });
      btn.classList.add('active');
      selectedBg = btn.getAttribute('data-bg');
      draw();
    });
  });

  generateBtn.addEventListener('click', function() {
    draw();
    var mode = outputMode.value;

    if (mode === 'single') {
      canvas.toBlob(function(blob) {
        var url = URL.createObjectURL(blob);
        finalImg.src = url;
        downloadLink.href = url;
        downloadLink.download = 'passport-photo-' + presets[presetSelect.value].name + '.jpg';
        editorWrap.style.display = 'none';
        resultBox.style.display = 'block';
      }, 'image/jpeg', 0.95);
    } else {
      var sheet = document.createElement('canvas');
      var sCtx = sheet.getContext('2d');
      var pW = canvas.width, pH = canvas.height;

      if (mode === 'sheet_4x6_6') {
        sheet.width = 1800;
        sheet.height = 1200;
        sCtx.fillStyle = '#ffffff';
        sCtx.fillRect(0, 0, 1800, 1200);

        var startX = 140, startY = 80, gapX = 140, gapY = 80;
        for (var r = 0; r < 2; r++) {
          for (var c = 0; c < 3; c++) {
            var x = startX + c * (pW + gapX);
            var y = startY + r * (pH + gapY);
            sCtx.drawImage(canvas, x, y, pW, pH);
            sCtx.strokeStyle = '#cbd5e1';
            sCtx.lineWidth = 1;
            sCtx.strokeRect(x, y, pW, pH);
          }
        }
      } else if (mode === 'sheet_a4_8') {
        sheet.width = 2480;
        sheet.height = 3508;
        sCtx.fillStyle = '#ffffff';
        sCtx.fillRect(0, 0, 2480, 3508);

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

      sheet.toBlob(function(blob) {
        var url = URL.createObjectURL(blob);
        finalImg.src = url;
        downloadLink.href = url;
        downloadLink.download = 'passport-printable-sheet.jpg';
        editorWrap.style.display = 'none';
        resultBox.style.display = 'block';
      }, 'image/jpeg', 0.95);
    }
  });

  resetBtn.addEventListener('click', function() {
    loadedImg = null;
    dropzone.style.display = 'block';
    editorWrap.style.display = 'none';
    resultBox.style.display = 'none';
  });
})();
