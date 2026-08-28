
(function() {
  var dropzone = document.getElementById('dropzone');
  var fileInput = document.getElementById('fileInput');
  var editorWrap = document.getElementById('editorWrap');
  var fileName = document.getElementById('fileName');
  var fileOriginalSize = document.getElementById('fileOriginalSize');
  var removeFile = document.getElementById('removeFile');
  var targetKbInput = document.getElementById('targetKbInput');
  var selFormat = document.getElementById('selFormat');
  var compressBtn = document.getElementById('compressBtn');
  var imgPreviewOriginal = document.getElementById('imgPreviewOriginal');
  var imgPreviewCompressed = document.getElementById('imgPreviewCompressed');
  var resultBox = document.getElementById('resultBox');
  var resultInfo = document.getElementById('resultInfo');
  var downloadLink = document.getElementById('downloadLink');
  var resetBtn = document.getElementById('resetBtn');

  var currentFile = null;
  var loadedImg = null;

  function fmtSize(b) {
    if (b < 1024) return b + ' B';
    if (b < 1048576) return (b / 1024).toFixed(1) + ' KB';
    return (b / 1048576).toFixed(2) + ' MB';
  }

  function handleFile(f) {
    if (!f || !f.type.startsWith('image/')) {
      alert('Please upload a valid image file (JPG, PNG, WebP).');
      return;
    }
    currentFile = f;
    fileName.textContent = f.name;
    fileOriginalSize.textContent = fmtSize(f.size);

    var reader = new FileReader();
    reader.onload = function(e) {
      var img = new Image();
      img.onload = function() {
        loadedImg = img;
        imgPreviewOriginal.src = e.target.result;
        imgPreviewCompressed.src = e.target.result;
        dropzone.style.display = 'none';
        editorWrap.style.display = 'block';
        resultBox.style.display = 'none';
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

  // Paste image support
  window.addEventListener('paste', function(e) {
    if (e.clipboardData && e.clipboardData.files && e.clipboardData.files[0]) {
      handleFile(e.clipboardData.files[0]);
    }
  });

  document.querySelectorAll('.preset-chip').forEach(function(btn) {
    btn.addEventListener('click', function() {
      document.querySelectorAll('.preset-chip').forEach(function(b) { b.classList.remove('active'); });
      btn.classList.add('active');
      targetKbInput.value = btn.getAttribute('data-kb');
    });
  });

  removeFile.addEventListener('click', function() {
    loadedImg = null;
    dropzone.style.display = 'block';
    editorWrap.style.display = 'none';
    resultBox.style.display = 'none';
  });

  compressBtn.addEventListener('click', function() {
    if (!loadedImg) return;
    compressBtn.disabled = true;
    compressBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Compressing...';

    var targetBytes = (parseFloat(targetKbInput.value) || 50) * 1024;
    var mime = selFormat.value;

    setTimeout(function() {
      var canvas = document.createElement('canvas');
      var ctx = canvas.getContext('2d');
      var w = loadedImg.naturalWidth;
      var h = loadedImg.naturalHeight;

      // Iterative binary search for optimal dimension & quality
      var scale = 1.0;
      var minQ = 0.05, maxQ = 0.98;
      var bestBlob = null;

      function test(q, sc) {
        var curW = Math.max(50, Math.round(w * sc));
        var curH = Math.max(50, Math.round(h * sc));
        canvas.width = curW;
        canvas.height = curH;
        ctx.drawImage(loadedImg, 0, 0, curW, curH);

        return new Promise(function(resolve) {
          canvas.toBlob(function(b) { resolve(b); }, mime, q);
        });
      }

      function search(iters) {
        if (iters <= 0) {
          if (!bestBlob || bestBlob.size > targetBytes * 1.15) {
            scale *= 0.82;
            if (scale > 0.15) {
              return test(0.75, scale).then(function(b) {
                if (b.size <= targetBytes) return b;
                return search(4);
              });
            }
          }
          return Promise.resolve(bestBlob);
        }

        var midQ = (minQ + maxQ) / 2;
        return test(midQ, scale).then(function(b) {
          bestBlob = b;
          if (b.size > targetBytes) {
            maxQ = midQ;
          } else {
            minQ = midQ;
          }
          return search(iters - 1);
        });
      }

      search(8).then(function(finalBlob) {
        var url = URL.createObjectURL(finalBlob);
        imgPreviewCompressed.src = url;
        downloadLink.href = url;
        var ext = mime === 'image/webp' ? '.webp' : '.jpg';
        var outName = currentFile.name.replace(/\.[^/.]+$/, '') + '-' + targetKbInput.value + 'kb' + ext;
        downloadLink.download = outName;
        downloadLink.textContent = 'Download ' + outName + ' (' + fmtSize(finalBlob.size) + ')';

        var pct = Math.round((1 - finalBlob.size / currentFile.size) * 100);
        resultInfo.innerHTML = 'Compressed from <strong>' + fmtSize(currentFile.size) + '</strong> to <strong style="color:var(--success); font-size:1.1rem;">' + fmtSize(finalBlob.size) + '</strong> (' + (pct >= 0 ? pct + '% reduction' : 'Adjusted') + ').';

        resultBox.style.display = 'block';
        compressBtn.disabled = false;
        compressBtn.innerHTML = '<i class="fa-solid fa-bolt"></i> Compress to Target KB';
      });
    }, 40);
  });

  resetBtn.addEventListener('click', function() {
    loadedImg = null;
    dropzone.style.display = 'block';
    editorWrap.style.display = 'none';
    resultBox.style.display = 'none';
  });
})();
