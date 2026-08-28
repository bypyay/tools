
(function() {
  var dropzone = document.getElementById('dropzone');
  var fileInput = document.getElementById('fileInput');
  var editorWrap = document.getElementById('editorWrap');
  var joinHBtn = document.getElementById('joinHBtn');
  var joinVBtn = document.getElementById('joinVBtn');
  var downloadBtn = document.getElementById('downloadBtn');
  var canvas = document.getElementById('previewCanvas');
  var ctx = canvas.getContext('2d');

  var loadedImages = [];
  var direction = 'H'; // 'H' or 'V'

  function handleFiles(files) {
    if (!files || files.length === 0) return;
    loadedImages = [];
    var promises = Array.from(files).map(function(f) {
      return new Promise(function(resolve) {
        var reader = new FileReader();
        reader.onload = function(e) {
          var img = new Image();
          img.onload = function() {
            loadedImages.push(img);
            resolve();
          };
          img.src = e.target.result;
        };
        reader.readAsDataURL(f);
      });
    });

    Promise.all(promises).then(function() {
      dropzone.style.display = 'none';
      editorWrap.style.display = 'block';
      draw();
    });
  }

  dropzone.addEventListener('click', function() { fileInput.click(); });
  fileInput.addEventListener('change', function(e) { handleFiles(e.target.files); fileInput.value = ''; });

  function draw() {
    if (loadedImages.length === 0) return;

    if (direction === 'H') {
      var maxH = Math.max.apply(null, loadedImages.map(function(i) { return i.naturalHeight; }));
      var totalW = 0;
      var scaledWidths = loadedImages.map(function(img) {
        var scale = maxH / img.naturalHeight;
        var w = Math.round(img.naturalWidth * scale);
        totalW += w;
        return w;
      });

      canvas.width = totalW;
      canvas.height = maxH;

      var curX = 0;
      loadedImages.forEach(function(img, idx) {
        ctx.drawImage(img, curX, 0, scaledWidths[idx], maxH);
        curX += scaledWidths[idx];
      });
    } else {
      var maxW = Math.max.apply(null, loadedImages.map(function(i) { return i.naturalWidth; }));
      var totalH = 0;
      var scaledHeights = loadedImages.map(function(img) {
        var scale = maxW / img.naturalWidth;
        var h = Math.round(img.naturalHeight * scale);
        totalH += h;
        return h;
      });

      canvas.width = maxW;
      canvas.height = totalH;

      var curY = 0;
      loadedImages.forEach(function(img, idx) {
        ctx.drawImage(img, 0, curY, maxW, scaledHeights[idx]);
        curY += scaledHeights[idx];
      });
    }
  }

  joinHBtn.addEventListener('click', function() { direction = 'H'; draw(); });
  joinVBtn.addEventListener('click', function() { direction = 'V'; draw(); });

  downloadBtn.addEventListener('click', function() {
    draw();
    canvas.toBlob(function(blob) {
      var a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = 'joined-images.jpg';
      a.click();
    }, 'image/jpeg', 0.95);
  });
})();
