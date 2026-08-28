
(function() {
  var dropzone = document.getElementById('dropzone');
  var fileInput = document.getElementById('fileInput');
  var editorWrap = document.getElementById('editorWrap');
  var fileName = document.getElementById('fileName');
  var removeFile = document.getElementById('removeFile');
  var generateBtn = document.getElementById('generateBtn');
  var favPreview = document.getElementById('favPreview');

  var loadedImg = null;

  function handleFile(f) {
    if (!f || !f.type.startsWith('image/')) {
      alert('Please upload a valid logo image.');
      return;
    }
    var reader = new FileReader();
    reader.onload = function(e) {
      var img = new Image();
      img.onload = function() {
        loadedImg = img;
        favPreview.src = e.target.result;
        dropzone.style.display = 'none';
        editorWrap.style.display = 'block';
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

  generateBtn.addEventListener('click', function() {
    if (!loadedImg || typeof JSZip === 'undefined') return;
    generateBtn.disabled = true;
    generateBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Generating Icons...';

    var zip = new JSZip();
    var sizes = [
      { name: 'favicon-16x16.png', size: 16 },
      { name: 'favicon-32x32.png', size: 32 },
      { name: 'favicon-48x48.png', size: 48 },
      { name: 'apple-touch-icon.png', size: 180 },
      { name: 'android-chrome-192x192.png', size: 192 },
      { name: 'android-chrome-512x512.png', size: 512 }
    ];

    var canvas = document.createElement('canvas');
    var ctx = canvas.getContext('2d');

    var promises = sizes.map(function(s) {
      return new Promise(function(resolve) {
        canvas.width = s.size;
        canvas.height = s.size;
        ctx.clearRect(0, 0, s.size, s.size);
        ctx.drawImage(loadedImg, 0, 0, s.size, s.size);
        canvas.toBlob(function(blob) {
          zip.file(s.name, blob);
          if (s.size === 32) zip.file('favicon.ico', blob);
          resolve();
        }, 'image/png');
      });
    });

    // Add HTML instructions
    var htmlSnippet = '<link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png">\n' +
                      '<link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png">\n' +
                      '<link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png">';
    zip.file('README-HTML-HEAD.txt', htmlSnippet);

    Promise.all(promises).then(function() {
      zip.generateAsync({ type: 'blob' }).then(function(content) {
        var a = document.createElement('a');
        a.href = URL.createObjectURL(content);
        a.download = 'favicon-package.zip';
        a.click();
        generateBtn.disabled = false;
        generateBtn.innerHTML = '<i class="fa-solid fa-file-zipper"></i> Generate &amp; Download Favicon Package (ZIP)';
      });
    });
  });

  removeFile.addEventListener('click', function() {
    dropzone.style.display = 'block';
    editorWrap.style.display = 'none';
  });
})();
