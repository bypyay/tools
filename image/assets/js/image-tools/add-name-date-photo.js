(function () {
  var dropzone = document.getElementById('dropzone');
  var fileInput = document.getElementById('fileInput');
  var editorWrap = document.getElementById('editorWrap');
  var canvas = document.getElementById('previewCanvas');
  var ctx = canvas.getContext('2d');
  var candidateName = document.getElementById('candidateName');
  var candidateDate = document.getElementById('candidateDate');
  var stripBg = document.getElementById('stripBg');
  var stripHeight = document.getElementById('stripHeight');
  var downloadBtn = document.getElementById('downloadBtn');

  var loadedImg = null;
  var currentFile = null;

  function loadFile(file) {
    if (!file || !file.type.match(/image.*/)) return;
    currentFile = file;
    var reader = new FileReader();
    reader.onload = function (e) {
      var img = new Image();
      img.onload = function () {
        loadedImg = img;
        dropzone.style.display = 'none';
        editorWrap.style.display = 'block';
        renderCanvas();
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  }

  function renderCanvas() {
    if (!loadedImg) return;
    var w = loadedImg.naturalWidth || loadedImg.width;
    var h = loadedImg.naturalHeight || loadedImg.height;
    canvas.width = w;
    canvas.height = h;

    ctx.drawImage(loadedImg, 0, 0, w, h);

    var nameText = (candidateName.value || 'CANDIDATE NAME').toUpperCase();
    var dateText = candidateDate.value || 'DOP: 15/08/2026';

    var stripPercent = (parseInt(stripHeight.value) || 20) / 100;
    var sH = Math.round(h * stripPercent);
    var sY = h - sH;

    var bgMode = stripBg.value;
    if (bgMode === 'white') {
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, sY, w, sH);
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = Math.max(1, Math.round(w * 0.003));
      ctx.strokeRect(0, sY, w, sH);
      ctx.fillStyle = '#000000';
    } else if (bgMode === 'black') {
      ctx.fillStyle = '#000000';
      ctx.fillRect(0, sY, w, sH);
      ctx.fillStyle = '#ffffff';
    } else {
      ctx.fillStyle = '#ffffff';
      ctx.shadowColor = 'rgba(0,0,0,0.8)';
      ctx.shadowBlur = 4;
    }

    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    var fontSizeName = Math.round(sH * 0.38);
    var fontSizeDate = Math.round(sH * 0.32);

    ctx.font = 'bold ' + fontSizeName + 'px sans-serif';
    ctx.fillText(nameText, w / 2, sY + sH * 0.35);

    ctx.font = '600 ' + fontSizeDate + 'px sans-serif';
    ctx.fillText(dateText, w / 2, sY + sH * 0.75);

    ctx.shadowBlur = 0;
  }

  candidateName.addEventListener('input', renderCanvas);
  candidateDate.addEventListener('input', renderCanvas);
  stripBg.addEventListener('change', renderCanvas);
  stripHeight.addEventListener('input', renderCanvas);

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

  downloadBtn.addEventListener('click', function () {
    renderCanvas();
    canvas.toBlob(function (blob) {
      var url = URL.createObjectURL(blob);
      var a = document.createElement('a');
      a.href = url;
      a.download = 'photo-with-name-date.jpg';
      a.click();
    }, 'image/jpeg', 0.95);
  });
})();
