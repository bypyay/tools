
(function() {
  var dropzone = document.getElementById('dropzone');
  var fileInput = document.getElementById('fileInput');
  var editorWrap = document.getElementById('editorWrap');
  var fileName = document.getElementById('fileName');
  var fileOriginalSize = document.getElementById('fileOriginalSize');
  var removeFile = document.getElementById('removeFile');
  var examPreset = document.getElementById('examPreset');
  var processBtn = document.getElementById('processBtn');
  var imgPreview = document.getElementById('imgPreview');
  var resultBox = document.getElementById('resultBox');
  var resultInfo = document.getElementById('resultInfo');
  var finalImg = document.getElementById('finalImg');
  var downloadLink = document.getElementById('downloadLink');
  var resetBtn = document.getElementById('resetBtn');

  var loadedImg = null;
  var currentFile = null;

  var specs = {
    'ssc_photo': { w: 413, h: 531, targetKb: 40, name: 'ssc-cgl-photo.jpg' },
    'ssc_sign': { w: 472, h: 236, targetKb: 15, name: 'ssc-signature.jpg' },
    'upsc_photo': { w: 350, h: 350, targetKb: 80, name: 'upsc-photo.jpg' },
    'upsc_sign': { w: 350, h: 350, targetKb: 40, name: 'upsc-signature.jpg' },
    'ibps_photo': { w: 531, h: 413, targetKb: 35, name: 'ibps-photo.jpg' },
    'ibps_sign': { w: 140, h: 60, targetKb: 15, name: 'ibps-signature.jpg' },
    'rrb_photo': { w: 413, h: 531, targetKb: 35, name: 'rrb-photo.jpg' },
    'rrb_sign': { w: 590, h: 236, targetKb: 25, name: 'rrb-signature.jpg' },
    'pan_photo': { w: 213, h: 213, targetKb: 25, name: 'pan-photo.jpg' },
    'pan_sign': { w: 400, h: 200, targetKb: 20, name: 'pan-signature.jpg' }
  };

  function fmtSize(b) {
    if (b < 1024) return b + ' B';
    if (b < 1048576) return (b / 1024).toFixed(1) + ' KB';
    return (b / 1048576).toFixed(2) + ' MB';
  }

  function handleFile(f) {
    if (!f || !f.type.startsWith('image/')) {
      alert('Please upload a valid image file.');
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
        imgPreview.src = e.target.result;
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

  removeFile.addEventListener('click', function() {
    loadedImg = null;
    dropzone.style.display = 'block';
    editorWrap.style.display = 'none';
    resultBox.style.display = 'none';
  });

  processBtn.addEventListener('click', function() {
    if (!loadedImg) return;
    var spec = specs[examPreset.value] || specs['ssc_photo'];

    var canvas = document.createElement('canvas');
    var ctx = canvas.getContext('2d');
    canvas.width = spec.w;
    canvas.height = spec.h;

    // Fill clean white background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, spec.w, spec.h);

    // Smart aspect-preserving cover
    var imgW = loadedImg.naturalWidth;
    var imgH = loadedImg.naturalHeight;
    var scale = Math.max(spec.w / imgW, spec.h / imgH);
    var drawW = imgW * scale;
    var drawH = imgH * scale;
    var drawX = (spec.w - drawW) / 2;
    var drawY = (spec.h - drawH) / 2;

    ctx.drawImage(loadedImg, drawX, drawY, drawW, drawH);

    var targetBytes = spec.targetKb * 1024;
    var q = 0.85;

    function tryCompress(currentQ, attempts) {
      return new Promise(function(resolve) {
        canvas.toBlob(function(blob) {
          if (blob.size <= targetBytes || attempts <= 0 || currentQ <= 0.1) {
            resolve(blob);
          } else {
            resolve(tryCompress(currentQ * 0.85, attempts - 1));
          }
        }, 'image/jpeg', currentQ);
      });
    }

    tryCompress(0.85, 6).then(function(blob) {
      var url = URL.createObjectURL(blob);
      finalImg.src = url;
      downloadLink.href = url;
      downloadLink.download = spec.name;
      downloadLink.textContent = 'Download ' + spec.name + ' (' + fmtSize(blob.size) + ')';

      resultInfo.innerHTML = 'Resized to <strong>' + spec.w + ' × ' + spec.h + ' px</strong> | File Size: <strong style="color:var(--success);">' + fmtSize(blob.size) + '</strong>.';
      resultBox.style.display = 'block';
    });
  });

  resetBtn.addEventListener('click', function() {
    loadedImg = null;
    dropzone.style.display = 'block';
    editorWrap.style.display = 'none';
    resultBox.style.display = 'none';
  });
})();
