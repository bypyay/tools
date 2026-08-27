(function () {
  var dropzone = document.getElementById('dropzone');
  var fileInput = document.getElementById('fileInput');
  var editorWrap = document.getElementById('editorWrap');
  var canvas = document.getElementById('previewCanvas');
  var ctx = canvas.getContext('2d');
  var joinHBtn = document.getElementById('joinHBtn');
  var joinVBtn = document.getElementById('joinVBtn');
  var downloadBtn = document.getElementById('downloadBtn');

  var loadedImages = [];
  var isHorizontal = true;

  function loadFiles(files) {
    if (!files || files.length === 0) return;
    loadedImages = [];
    var count = files.length;
    var loadedCount = 0;

    Array.from(files).forEach(function (f) {
      var reader = new FileReader();
      reader.onload = function (e) {
        var img = new Image();
        img.onload = function () {
          loadedImages.push(img);
          loadedCount++;
          if (loadedCount === count) {
            dropzone.style.display = 'none';
            editorWrap.style.display = 'block';
            render();
          }
        };
        img.src = e.target.result;
      };
      reader.readAsDataURL(f);
    });
  }

  function render() {
    if (loadedImages.length === 0) return;
    if (isHorizontal) {
      var totalW = 0, maxH = 0;
      loadedImages.forEach(function (img) {
        totalW += img.naturalWidth || img.width;
        maxH = Math.max(maxH, img.naturalHeight || img.height);
      });
      canvas.width = totalW;
      canvas.height = maxH;
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, totalW, maxH);

      var curX = 0;
      loadedImages.forEach(function (img) {
        var w = img.naturalWidth || img.width;
        var h = img.naturalHeight || img.height;
        ctx.drawImage(img, curX, (maxH - h) / 2);
        curX += w;
      });
    } else {
      var maxW = 0, totalH = 0;
      loadedImages.forEach(function (img) {
        maxW = Math.max(maxW, img.naturalWidth || img.width);
        totalH += img.naturalHeight || img.height;
      });
      canvas.width = maxW;
      canvas.height = totalH;
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, maxW, totalH);

      var curY = 0;
      loadedImages.forEach(function (img) {
        var w = img.naturalWidth || img.width;
        var h = img.naturalHeight || img.height;
        ctx.drawImage(img, (maxW - w) / 2, curY);
        curY += h;
      });
    }
  }

  joinHBtn.addEventListener('click', function () { isHorizontal = true; joinHBtn.classList.add('active'); joinVBtn.classList.remove('active'); render(); });
  joinVBtn.addEventListener('click', function () { isHorizontal = false; joinVBtn.classList.add('active'); joinHBtn.classList.remove('active'); render(); });

  dropzone.addEventListener('click', function () { fileInput.click(); });
  fileInput.addEventListener('change', function (e) { loadFiles(e.target.files); fileInput.value = ''; });
  ['dragenter', 'dragover'].forEach(function (evt) {
    dropzone.addEventListener(evt, function (e) { e.preventDefault(); dropzone.classList.add('dragover'); });
  });
  ['dragleave', 'drop'].forEach(function (evt) {
    dropzone.addEventListener(evt, function (e) { e.preventDefault(); dropzone.classList.remove('dragover'); });
  });
  dropzone.addEventListener('drop', function (e) {
    if (e.dataTransfer && e.dataTransfer.files) loadFiles(e.dataTransfer.files);
  });

  downloadBtn.addEventListener('click', function () {
    canvas.toBlob(function (blob) {
      var url = URL.createObjectURL(blob);
      var a = document.createElement('a');
      a.href = url;
      a.download = 'joined-image.jpg';
      a.click();
    }, 'image/jpeg', 0.95);
  });
})();
