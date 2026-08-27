(function () {
  var dropzone = document.getElementById('dropzone');
  var fileInput = document.getElementById('fileInput');
  var editorWrap = document.getElementById('editorWrap');
  var fileCountText = document.getElementById('fileCountText');
  var targetWidth = document.getElementById('targetWidth');
  var targetHeight = document.getElementById('targetHeight');
  var bulkProcessBtn = document.getElementById('bulkProcessBtn');

  var selectedFiles = [];

  function loadFiles(files) {
    if (!files || files.length === 0) return;
    selectedFiles = Array.from(files);
    fileCountText.textContent = selectedFiles.length + ' Images Selected for Bulk Resizing';
    dropzone.style.display = 'none';
    editorWrap.style.display = 'block';
  }

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

  bulkProcessBtn.addEventListener('click', function () {
    if (selectedFiles.length === 0 || typeof JSZip === 'undefined') return;
    bulkProcessBtn.disabled = true;
    bulkProcessBtn.textContent = 'Processing Images in Browser...';

    var maxW = parseInt(targetWidth.value) || 1200;
    var maxH = parseInt(targetHeight.value) || 1200;
    var zip = new JSZip();
    var promises = [];

    selectedFiles.forEach(function (file) {
      var p = new Promise(function (resolve) {
        var reader = new FileReader();
        reader.onload = function (e) {
          var img = new Image();
          img.onload = function () {
            var origW = img.naturalWidth || img.width;
            var origH = img.naturalHeight || img.height;
            var scale = Math.min(1, maxW / origW, maxH / origH);
            var drawW = Math.round(origW * scale);
            var drawH = Math.round(origH * scale);

            var canvas = document.createElement('canvas');
            canvas.width = drawW;
            canvas.height = drawH;
            var ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0, drawW, drawH);

            canvas.toBlob(function (blob) {
              zip.file('resized_' + file.name, blob);
              resolve();
            }, 'image/jpeg', 0.90);
          };
          img.src = e.target.result;
        };
        reader.readAsDataURL(file);
      });
      promises.push(p);
    });

    Promise.all(promises).then(function () {
      zip.generateAsync({ type: 'blob' }).then(function (zipBlob) {
        var url = URL.createObjectURL(zipBlob);
        var a = document.createElement('a');
        a.href = url;
        a.download = 'bulk-resized-images.zip';
        a.click();
        bulkProcessBtn.disabled = false;
        bulkProcessBtn.textContent = 'Resize All & Download ZIP';
      });
    });
  });
})();
