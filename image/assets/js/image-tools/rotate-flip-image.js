
(function() {
  var dropzone = document.getElementById('dropzone');
  var fileInput = document.getElementById('fileInput');
  var editorWrap = document.getElementById('editorWrap');
  var rotLeftBtn = document.getElementById('rotLeftBtn');
  var rotRightBtn = document.getElementById('rotRightBtn');
  var flipHBtn = document.getElementById('flipHBtn');
  var flipVBtn = document.getElementById('flipVBtn');
  var downloadBtn = document.getElementById('downloadBtn');
  var canvas = document.getElementById('previewCanvas');
  var ctx = canvas.getContext('2d');

  var loadedImg = null;
  var rotation = 0; // 0, 90, 180, 270
  var flipH = false, flipV = false;

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
        rotation = 0; flipH = false; flipV = false;
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
    var is90 = (rotation === 90 || rotation === 270);
    canvas.width = is90 ? loadedImg.naturalHeight : loadedImg.naturalWidth;
    canvas.height = is90 ? loadedImg.naturalWidth : loadedImg.naturalHeight;

    ctx.save();
    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.rotate((rotation * Math.PI) / 180);
    ctx.scale(flipH ? -1 : 1, flipV ? -1 : 1);
    ctx.drawImage(loadedImg, -loadedImg.naturalWidth / 2, -loadedImg.naturalHeight / 2);
    ctx.restore();
  }

  rotRightBtn.addEventListener('click', function() { rotation = (rotation + 90) % 360; draw(); });
  rotLeftBtn.addEventListener('click', function() { rotation = (rotation + 270) % 360; draw(); });
  flipHBtn.addEventListener('click', function() { flipH = !flipH; draw(); });
  flipVBtn.addEventListener('click', function() { flipV = !flipV; draw(); });

  downloadBtn.addEventListener('click', function() {
    draw();
    canvas.toBlob(function(blob) {
      var a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = 'rotated-image.jpg';
      a.click();
    }, 'image/jpeg', 0.95);
  });
})();
