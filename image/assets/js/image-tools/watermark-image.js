
(function() {
  var dropzone = document.getElementById('dropzone');
  var fileInput = document.getElementById('fileInput');
  var editorWrap = document.getElementById('editorWrap');
  var wmText = document.getElementById('wmText');
  var wmColor = document.getElementById('wmColor');
  var wmSize = document.getElementById('wmSize');
  var sizeVal = document.getElementById('sizeVal');
  var wmOpacity = document.getElementById('wmOpacity');
  var opVal = document.getElementById('opVal');
  var downloadBtn = document.getElementById('downloadBtn');
  var canvas = document.getElementById('previewCanvas');
  var ctx = canvas.getContext('2d');

  var loadedImg = null;

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
        dropzone.style.display = 'none';
        editorWrap.style.display = 'block';
        draw();
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

  function draw() {
    if (!loadedImg) return;
    canvas.width = loadedImg.naturalWidth;
    canvas.height = loadedImg.naturalHeight;

    ctx.drawImage(loadedImg, 0, 0);

    var text = wmText.value;
    if (!text) return;

    var size = parseInt(wmSize.value) || 36;
    var op = (parseFloat(wmOpacity.value) || 60) / 100;
    var color = wmColor.value;

    ctx.save();
    ctx.globalAlpha = op;
    ctx.fillStyle = color;
    ctx.font = 'bold ' + size + 'px sans-serif';
    ctx.textAlign = 'right';
    ctx.textBaseline = 'bottom';

    // Bottom right corner with margin
    ctx.fillText(text, canvas.width - 24, canvas.height - 24);
    ctx.restore();
  }

  wmText.addEventListener('input', draw);
  wmColor.addEventListener('input', draw);
  wmSize.addEventListener('input', function() {
    sizeVal.textContent = wmSize.value + 'px';
    draw();
  });
  wmOpacity.addEventListener('input', function() {
    opVal.textContent = wmOpacity.value + '%';
    draw();
  });

  downloadBtn.addEventListener('click', function() {
    draw();
    canvas.toBlob(function(blob) {
      var a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = 'watermarked-image.jpg';
      a.click();
    }, 'image/jpeg', 0.95);
  });
})();
