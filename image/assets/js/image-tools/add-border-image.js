
(function() {
  var dropzone = document.getElementById('dropzone');
  var fileInput = document.getElementById('fileInput');
  var editorWrap = document.getElementById('editorWrap');
  var borderWidth = document.getElementById('borderWidth');
  var wVal = document.getElementById('wVal');
  var borderColor = document.getElementById('borderColor');
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

  function draw() {
    if (!loadedImg) return;
    var b = parseInt(borderWidth.value) || 20;
    var col = borderColor.value;

    canvas.width = loadedImg.naturalWidth + b * 2;
    canvas.height = loadedImg.naturalHeight + b * 2;

    ctx.fillStyle = col;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(loadedImg, b, b);
  }

  borderWidth.addEventListener('input', function() {
    wVal.textContent = borderWidth.value + 'px';
    draw();
  });
  borderColor.addEventListener('input', draw);

  downloadBtn.addEventListener('click', function() {
    draw();
    canvas.toBlob(function(blob) {
      var a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = 'framed-image.jpg';
      a.click();
    }, 'image/jpeg', 0.95);
  });
})();
