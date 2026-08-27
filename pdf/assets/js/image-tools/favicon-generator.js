(function () {
  var dropzone = document.getElementById('dropzone');
  var fileInput = document.getElementById('fileInput');
  var editorWrap = document.getElementById('editorWrap');
  var downloadZipBtn = document.getElementById('downloadZipBtn');

  var f16 = document.getElementById('fav16');
  var f32 = document.getElementById('fav32');
  var f48 = document.getElementById('fav48');
  var f180 = document.getElementById('fav180');

  var loadedImg = null;

  function loadFile(file) {
    if (!file || !file.type.match(/image.*/)) return;
    var reader = new FileReader();
    reader.onload = function (e) {
      var img = new Image();
      img.onload = function () {
        loadedImg = img;
        drawIcons();
        dropzone.style.display = 'none';
        editorWrap.style.display = 'block';
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  }

  function drawIcons() {
    [[f16, 16], [f32, 32], [f48, 48], [f180, 180]].forEach(function (pair) {
      var c = pair[0], s = pair[1];
      var ctx = c.getContext('2d');
      ctx.clearRect(0, 0, s, s);
      ctx.drawImage(loadedImg, 0, 0, s, s);
    });
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

  downloadZipBtn.addEventListener('click', function () {
    if (!loadedImg || typeof JSZip === 'undefined') return;
    var zip = new JSZip();
    var promises = [];

    var items = [
      { c: f16, name: 'favicon-16x16.png' },
      { c: f32, name: 'favicon-32x32.png' },
      { c: f48, name: 'favicon-48x48.png' },
      { c: f180, name: 'apple-touch-icon.png' }
    ];

    items.forEach(function (item) {
      promises.push(new Promise(function (resolve) {
        item.c.toBlob(function (blob) {
          zip.file(item.name, blob);
          resolve();
        }, 'image/png');
      }));
    });

    Promise.all(promises).then(function () {
      zip.generateAsync({ type: 'blob' }).then(function (zipBlob) {
        var url = URL.createObjectURL(zipBlob);
        var a = document.createElement('a');
        a.href = url;
        a.download = 'favicon-package.zip';
        a.click();
      });
    });
  });
})();
