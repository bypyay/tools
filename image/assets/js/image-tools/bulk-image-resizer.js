
(function() {
  var dropzone = document.getElementById('dropzone');
  var fileInput = document.getElementById('fileInput');
  var editorWrap = document.getElementById('editorWrap');
  var fileCount = document.getElementById('fileCount');
  var clearBtn = document.getElementById('clearBtn');
  var maxWInput = document.getElementById('maxWInput');
  var maxHInput = document.getElementById('maxHInput');
  var bulkResizeBtn = document.getElementById('bulkResizeBtn');

  var filesList = [];

  function handleFiles(files) {
    if (!files || files.length === 0) return;
    filesList = Array.from(files).filter(function(f) { return f.type.startsWith('image/'); });
    fileCount.textContent = filesList.length;
    dropzone.style.display = 'none';
    editorWrap.style.display = 'block';
  }

  dropzone.addEventListener('click', function() { fileInput.click(); });
  fileInput.addEventListener('change', function(e) { handleFiles(e.target.files); fileInput.value = ''; });

  ['dragenter', 'dragover'].forEach(function(evt) {
    dropzone.addEventListener(evt, function(e) { e.preventDefault(); dropzone.classList.add('dragover'); });
  });
  ['dragleave', 'drop'].forEach(function(evt) {
    dropzone.addEventListener(evt, function(e) { e.preventDefault(); dropzone.classList.remove('dragover'); });
  });
  dropzone.addEventListener('drop', function(e) {
    if (e.dataTransfer && e.dataTransfer.files) handleFiles(e.dataTransfer.files);
  });

  bulkResizeBtn.addEventListener('click', function() {
    if (filesList.length === 0 || typeof JSZip === 'undefined') return;
    bulkResizeBtn.disabled = true;
    bulkResizeBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Processing ' + filesList.length + ' Images...';

    var zip = new JSZip();
    var maxW = parseInt(maxWInput.value) || 1200;
    var maxH = parseInt(maxHInput.value) || 1200;

    var tasks = filesList.map(function(file) {
      return new Promise(function(resolve) {
        var reader = new FileReader();
        reader.onload = function(e) {
          var img = new Image();
          img.onload = function() {
            var w = img.naturalWidth;
            var h = img.naturalHeight;
            var scale = Math.min(maxW / w, maxH / h, 1.0);
            var outW = Math.round(w * scale);
            var outH = Math.round(h * scale);

            var canvas = document.createElement('canvas');
            canvas.width = outW;
            canvas.height = outH;
            var ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0, outW, outH);

            canvas.toBlob(function(blob) {
              zip.file(file.name, blob);
              resolve();
            }, file.type || 'image/jpeg', 0.9);
          };
          img.src = e.target.result;
        };
        reader.readAsDataURL(file);
      });
    });

    Promise.all(tasks).then(function() {
      zip.generateAsync({ type: 'blob' }).then(function(content) {
        var a = document.createElement('a');
        a.href = URL.createObjectURL(content);
        a.download = 'bulk-resized-images.zip';
        a.click();
        bulkResizeBtn.disabled = false;
        bulkResizeBtn.innerHTML = '<i class="fa-solid fa-file-zipper"></i> Resize All &amp; Download ZIP';
      });
    });
  });

  clearBtn.addEventListener('click', function() {
    filesList = [];
    dropzone.style.display = 'block';
    editorWrap.style.display = 'none';
  });
})();
