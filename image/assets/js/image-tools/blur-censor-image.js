
(function() {
  var dropzone = document.getElementById('dropzone');
  var fileInput = document.getElementById('fileInput');
  var editorWrap = document.getElementById('editorWrap');
  var downloadBtn = document.getElementById('downloadBtn');
  var undoBtn = document.getElementById('undoBtn');
  var canvas = document.getElementById('previewCanvas');
  var ctx = canvas.getContext('2d');

  var loadedImg = null;
  var censorMode = 'blur'; // blur, pixelate, blackout
  var isDrawing = false;
  var startX = 0, startY = 0;

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
        ctx.drawImage(loadedImg, 0, 0);
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(f);
  }

  dropzone.addEventListener('click', function() { fileInput.click(); });
  fileInput.addEventListener('change', function(e) { handleFile(e.target.files[0]); fileInput.value = ''; });

  window.setMode = function(m) {
    censorMode = m;
    document.querySelectorAll('.preset-chip').forEach(function(b) { b.classList.remove('active'); });
    event.target.classList.add('active');
  };

  canvas.addEventListener('mousedown', function(e) {
    isDrawing = true;
    var rect = canvas.getBoundingClientRect();
    var scaleX = canvas.width / rect.width;
    var scaleY = canvas.height / rect.height;
    startX = (e.clientX - rect.left) * scaleX;
    startY = (e.clientY - rect.top) * scaleY;
  });

  canvas.addEventListener('mouseup', function(e) {
    if (!isDrawing) return;
    isDrawing = false;
    var rect = canvas.getBoundingClientRect();
    var scaleX = canvas.width / rect.width;
    var scaleY = canvas.height / rect.height;
    var endX = (e.clientX - rect.left) * scaleX;
    var endY = (e.clientY - rect.top) * scaleY;

    var x = Math.min(startX, endX);
    var y = Math.min(startY, endY);
    var w = Math.abs(endX - startX);
    var h = Math.abs(endY - startY);

    if (w < 5 || h < 5) return;

    if (censorMode === 'blackout') {
      ctx.fillStyle = '#000000';
      ctx.fillRect(x, y, w, h);
    } else if (censorMode === 'pixelate') {
      var blockSize = Math.max(8, Math.round(w / 12));
      var imgData = ctx.getImageData(x, y, w, h);
      for (var py = 0; py < h; py += blockSize) {
        for (var px = 0; px < w; px += blockSize) {
          var i = (py * w + px) * 4;
          ctx.fillStyle = 'rgb(' + imgData.data[i] + ',' + imgData.data[i+1] + ',' + imgData.data[i+2] + ')';
          ctx.fillRect(x + px, y + py, blockSize, blockSize);
        }
      }
    } else {
      // Gaussian blur box
      ctx.filter = 'blur(10px)';
      ctx.drawImage(canvas, x, y, w, h, x, y, w, h);
      ctx.filter = 'none';
    }
  });

  undoBtn.addEventListener('click', function() {
    if (loadedImg) ctx.drawImage(loadedImg, 0, 0);
  });

  downloadBtn.addEventListener('click', function() {
    canvas.toBlob(function(blob) {
      var a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = 'censored-image.jpg';
      a.click();
    }, 'image/jpeg', 0.95);
  });
})();
