
(function() {
  var dropzone = document.getElementById('dropzone');
  var fileInput = document.getElementById('fileInput');
  var editorWrap = document.getElementById('editorWrap');
  var downloadBtn = document.getElementById('downloadBtn');
  var canvas = document.getElementById('previewCanvas');
  var ctx = canvas.getContext('2d');

  var loadedImg = null;
  var currentFilter = 'bw';

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
        apply();
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(f);
  }

  dropzone.addEventListener('click', function() { fileInput.click(); });
  fileInput.addEventListener('change', function(e) { handleFile(e.target.files[0]); fileInput.value = ''; });

  window.setFilter = function(flt) {
    currentFilter = flt;
    document.querySelectorAll('.preset-chip').forEach(function(b) { b.classList.remove('active'); });
    event.target.classList.add('active');
    apply();
  };

  function apply() {
    if (!loadedImg) return;
    canvas.width = loadedImg.naturalWidth;
    canvas.height = loadedImg.naturalHeight;

    ctx.save();
    if (currentFilter === 'bw') ctx.filter = 'grayscale(100%)';
    else if (currentFilter === 'sepia') ctx.filter = 'sepia(100%)';
    else if (currentFilter === 'noir') ctx.filter = 'grayscale(100%) contrast(160%)';
    else if (currentFilter === 'invert') ctx.filter = 'invert(100%)';
    ctx.drawImage(loadedImg, 0, 0);
    ctx.restore();
  }

  downloadBtn.addEventListener('click', function() {
    apply();
    canvas.toBlob(function(blob) {
      var a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = 'grayscale-image.jpg';
      a.click();
    }, 'image/jpeg', 0.95);
  });
})();
