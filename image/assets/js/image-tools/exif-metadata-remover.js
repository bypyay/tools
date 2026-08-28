
(function() {
  var dropzone = document.getElementById('dropzone');
  var fileInput = document.getElementById('fileInput');
  var editorWrap = document.getElementById('editorWrap');
  var fileName = document.getElementById('fileName');
  var cleanBtn = document.getElementById('cleanBtn');

  var loadedImg = null;
  var currentFile = null;

  function handleFile(f) {
    if (!f || !f.type.startsWith('image/')) {
      alert('Please upload an image.');
      return;
    }
    currentFile = f;
    fileName.textContent = f.name;

    var reader = new FileReader();
    reader.onload = function(e) {
      var img = new Image();
      img.onload = function() {
        loadedImg = img;
        dropzone.style.display = 'none';
        editorWrap.style.display = 'block';
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(f);
  }

  dropzone.addEventListener('click', function() { fileInput.click(); });
  fileInput.addEventListener('change', function(e) { handleFile(e.target.files[0]); fileInput.value = ''; });

  cleanBtn.addEventListener('click', function() {
    if (!loadedImg) return;
    // Drawing onto clean HTML5 Canvas strips 100% of EXIF, GPS, and metadata
    var canvas = document.createElement('canvas');
    canvas.width = loadedImg.naturalWidth;
    canvas.height = loadedImg.naturalHeight;
    var ctx = canvas.getContext('2d');
    ctx.drawImage(loadedImg, 0, 0);

    canvas.toBlob(function(blob) {
      var a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = 'cleaned-' + currentFile.name;
      a.click();
      alert('All EXIF and GPS location metadata stripped cleanly!');
    }, 'image/jpeg', 0.95);
  });
})();
