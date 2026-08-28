
(function() {
  var dropzone = document.getElementById('dropzone');
  var fileInput = document.getElementById('fileInput');
  var editorWrap = document.getElementById('editorWrap');
  var canvas = document.getElementById('cropCanvas');
  var ctx = canvas.getContext('2d');
  var cropBtn = document.getElementById('cropBtn');
  var resultBox = document.getElementById('resultBox');
  var croppedImg = document.getElementById('croppedImg');
  var downloadLink = document.getElementById('downloadLink');
  var resetBtn = document.getElementById('resetBtn');

  var loadedImg = null;
  var cropRatio = 'free';

  // Crop box in canvas coordinates
  var cropX = 50, cropY = 50, cropW = 200, cropH = 200;
  var isDragging = false, isResizing = false;
  var dragStartX = 0, dragStartY = 0;

  function handleFile(f) {
    if (!f || !f.type.startsWith('image/')) {
      alert('Please upload a valid image.');
      return;
    }
    var reader = new FileReader();
    reader.onload = function(e) {
      var img = new Image();
      img.onload = function() {
        loadedImg = img;
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        cropX = Math.round(canvas.width * 0.1);
        cropY = Math.round(canvas.height * 0.1);
        cropW = Math.round(canvas.width * 0.8);
        cropH = Math.round(canvas.height * 0.8);
        dropzone.style.display = 'none';
        editorWrap.style.display = 'block';
        resultBox.style.display = 'none';
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
    ctx.drawImage(loadedImg, 0, 0, canvas.width, canvas.height);

    // Dim overlay
    ctx.fillStyle = 'rgba(0, 0, 0, 0.55)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Clear crop area
    ctx.save();
    if (cropRatio === 'circle') {
      ctx.beginPath();
      var rad = Math.min(cropW, cropH) / 2;
      ctx.arc(cropX + cropW / 2, cropY + cropH / 2, rad, 0, Math.PI * 2);
      ctx.clip();
    } else {
      ctx.beginPath();
      ctx.rect(cropX, cropY, cropW, cropH);
      ctx.clip();
    }
    ctx.drawImage(loadedImg, 0, 0, canvas.width, canvas.height);
    ctx.restore();

    // Border and handles
    ctx.strokeStyle = '#e5322d';
    ctx.lineWidth = Math.max(2, Math.round(canvas.width / 400));
    if (cropRatio === 'circle') {
      ctx.beginPath();
      var rad = Math.min(cropW, cropH) / 2;
      ctx.arc(cropX + cropW / 2, cropY + cropH / 2, rad, 0, Math.PI * 2);
      ctx.stroke();
    } else {
      ctx.strokeRect(cropX, cropY, cropW, cropH);
    }
  }

  window.setRatio = function(r) {
    cropRatio = r;
    document.querySelectorAll('.preset-chip').forEach(function(b) { b.classList.remove('active'); });
    event.target.classList.add('active');

    if (r === '1:1' || r === 'circle') {
      var s = Math.min(cropW, cropH);
      cropW = s; cropH = s;
    } else if (r === '16:9') {
      cropH = Math.round(cropW * (9 / 16));
    } else if (r === '9:16') {
      cropW = Math.round(cropH * (9 / 16));
    } else if (r === '4:3') {
      cropH = Math.round(cropW * (3 / 4));
    }
    draw();
  };

  cropBtn.addEventListener('click', function() {
    if (!loadedImg) return;
    var outCanvas = document.createElement('canvas');
    var oCtx = outCanvas.getContext('2d');

    if (cropRatio === 'circle') {
      var rad = Math.min(cropW, cropH) / 2;
      outCanvas.width = rad * 2;
      outCanvas.height = rad * 2;
      oCtx.beginPath();
      oCtx.arc(rad, rad, rad, 0, Math.PI * 2);
      oCtx.clip();
      oCtx.drawImage(loadedImg, cropX + (cropW / 2 - rad), cropY + (cropH / 2 - rad), rad * 2, rad * 2, 0, 0, rad * 2, rad * 2);
    } else {
      outCanvas.width = cropW;
      outCanvas.height = cropH;
      oCtx.drawImage(loadedImg, cropX, cropY, cropW, cropH, 0, 0, cropW, cropH);
    }

    outCanvas.toBlob(function(blob) {
      var url = URL.createObjectURL(blob);
      croppedImg.src = url;
      downloadLink.href = url;
      downloadLink.download = 'cropped-image.jpg';
      resultBox.style.display = 'block';
    }, 'image/jpeg', 0.95);
  });

  resetBtn.addEventListener('click', function() {
    dropzone.style.display = 'block';
    editorWrap.style.display = 'none';
    resultBox.style.display = 'none';
  });
})();
