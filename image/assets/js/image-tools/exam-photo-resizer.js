(function () {
  var dropzone = document.getElementById('dropzone');
  var fileInput = document.getElementById('fileInput');
  var editorWrap = document.getElementById('editorWrap');
  var fileNameEl = document.getElementById('fileName');
  var fileOriginalSize = document.getElementById('fileOriginalSize');
  var removeFileBtn = document.getElementById('removeFile');
  var examPreset = document.getElementById('examPreset');
  var imgPreview = document.getElementById('imgPreview');
  var processBtn = document.getElementById('processBtn');
  var resultBox = document.getElementById('resultBox');
  var resultInfo = document.getElementById('resultInfo');
  var finalImg = document.getElementById('finalImg');
  var downloadLink = document.getElementById('downloadLink');
  var resetBtn = document.getElementById('resetBtn');

  var loadedImg = null;
  var currentFile = null;

  var specs = {
    'ssc_photo': { w: 413, h: 531, targetKb: 40, name: 'ssc-photo.jpg' },
    'ssc_sign': { w: 472, h: 236, targetKb: 15, name: 'ssc-signature.jpg' },
    'upsc_photo': { w: 350, h: 350, targetKb: 100, name: 'upsc-photo.jpg' },
    'upsc_sign': { w: 350, h: 350, targetKb: 50, name: 'upsc-signature.jpg' },
    'pan_photo': { w: 213, h: 213, targetKb: 25, name: 'pan-photo.jpg' },
    'pan_sign': { w: 400, h: 200, targetKb: 15, name: 'pan-signature.jpg' },
    'ibps_photo': { w: 531, h: 413, targetKb: 35, name: 'ibps-photo.jpg' },
    'ibps_sign': { w: 140, h: 60, targetKb: 15, name: 'ibps-signature.jpg' },
    'rrb_photo': { w: 413, h: 531, targetKb: 35, name: 'rrb-photo.jpg' },
    'rrb_sign': { w: 590, h: 236, targetKb: 25, name: 'rrb-signature.jpg' }
  };

  function formatSize(bytes) {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  }

  function loadFile(file) {
    if (!file || !file.type.match(/image.*/)) {
      alert('Please select a valid image file.');
      return;
    }
    currentFile = file;
    fileNameEl.textContent = file.name;
    fileOriginalSize.textContent = 'Original: ' + formatSize(file.size);

    var reader = new FileReader();
    reader.onload = function (e) {
      var img = new Image();
      img.onload = function () {
        loadedImg = img;
        imgPreview.src = e.target.result;
        dropzone.style.display = 'none';
        editorWrap.style.display = 'block';
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  }

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

  removeFileBtn.addEventListener('click', function () {
    loadedImg = null;
    dropzone.style.display = 'block';
    editorWrap.style.display = 'none';
  });

  processBtn.addEventListener('click', function () {
    if (!loadedImg) return;
    var spec = specs[examPreset.value] || specs['ssc_photo'];

    var canvas = document.createElement('canvas');
    var ctx = canvas.getContext('2d');
    canvas.width = spec.w;
    canvas.height = spec.h;

    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(loadedImg, 0, 0, spec.w, spec.h);

    var targetBytes = spec.targetKb * 1024;
    var q = 0.85;

    function tryCompress(currentQ, attempts) {
      return new Promise(function (resolve) {
        canvas.toBlob(function (blob) {
          if (blob.size <= targetBytes || attempts <= 0) {
            resolve(blob);
          } else {
            resolve(tryCompress(currentQ * 0.8, attempts - 1));
          }
        }, 'image/jpeg', currentQ);
      });
    }

    tryCompress(0.85, 5).then(function (blob) {
      var url = URL.createObjectURL(blob);
      finalImg.src = url;
      downloadLink.href = url;
      downloadLink.download = spec.name;
      downloadLink.textContent = 'Download ' + spec.name;

      resultInfo.innerHTML = 'Resized to <strong>' + spec.w + ' × ' + spec.h + ' px</strong> | Size: <strong style="color:var(--green);">' + formatSize(blob.size) + '</strong>.';

      editorWrap.style.display = 'none';
      resultBox.style.display = 'block';
    });
  });

  resetBtn.addEventListener('click', function () {
    loadedImg = null;
    dropzone.style.display = 'block';
    editorWrap.style.display = 'none';
    resultBox.style.display = 'none';
  });
})();
