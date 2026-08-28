
(function() {
  var dropzone = document.getElementById('dropzone');
  var fileInput = document.getElementById('fileInput');
  var editorWrap = document.getElementById('editorWrap');
  var canvas = document.getElementById('previewCanvas');
  var ctx = canvas.getContext('2d');
  var colorSwatch = document.getElementById('colorSwatch');
  var hexCode = document.getElementById('hexCode');
  var rgbCode = document.getElementById('rgbCode');
  var copyHexBtn = document.getElementById('copyHexBtn');

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
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        ctx.drawImage(loadedImg, 0, 0);
        dropzone.style.display = 'none';
        editorWrap.style.display = 'block';
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(f);
  }

  dropzone.addEventListener('click', function() { fileInput.click(); });
  fileInput.addEventListener('change', function(e) { handleFile(e.target.files[0]); fileInput.value = ''; });

  function pickColor(e) {
    var rect = canvas.getBoundingClientRect();
    var scaleX = canvas.width / rect.width;
    var scaleY = canvas.height / rect.height;
    var x = Math.floor((e.clientX - rect.left) * scaleX);
    var y = Math.floor((e.clientY - rect.top) * scaleY);

    if (x >= 0 && x < canvas.width && y >= 0 && y < canvas.height) {
      var pixel = ctx.getImageData(x, y, 1, 1).data;
      var r = pixel[0], g = pixel[1], b = pixel[2];
      var hex = '#' + [r, g, b].map(function(v) { return v.toString(16).padStart(2, '0'); }).join('').toUpperCase();

      colorSwatch.style.background = hex;
      hexCode.textContent = hex;
      rgbCode.textContent = 'rgb(' + r + ', ' + g + ', ' + b + ')';
    }
  }

  canvas.addEventListener('mousemove', pickColor);
  canvas.addEventListener('click', pickColor);

  copyHexBtn.addEventListener('click', function() {
    navigator.clipboard.writeText(hexCode.textContent).then(function() {
      alert('Copied ' + hexCode.textContent + ' to clipboard!');
    });
  });
})();
