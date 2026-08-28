
(function() {
  var dropzone = document.getElementById('dropzone');
  var fileInput = document.getElementById('fileInput');
  var editorWrap = document.getElementById('editorWrap');
  var canvas = document.getElementById('stampCanvas');
  var ctx = canvas.getContext('2d');
  var inpName = document.getElementById('inpName');
  var inpDate = document.getElementById('inpDate');
  var fontSizeRange = document.getElementById('fontSizeRange');
  var fontVal = document.getElementById('fontVal');
  var bannerStyle = document.getElementById('bannerStyle');
  var downloadBtn = document.getElementById('downloadBtn');
  var changeBtn = document.getElementById('changeBtn');

  var loadedImg = null;

  function handleFile(f) {
    if (!f || !f.type.startsWith('image/')) {
      alert('Please upload a valid photo.');
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
    var w = loadedImg.naturalWidth;
    var h = loadedImg.naturalHeight;

    canvas.width = w;
    canvas.height = h;

    ctx.drawImage(loadedImg, 0, 0, w, h);

    var nameText = inpName.value.trim().toUpperCase();
    var dateText = inpDate.value.trim();
    var fSize = parseInt(fontSizeRange.value) || 28;
    // Scale font relative to canvas width
    var scaleRatio = w / 450;
    var scaledFontSize = Math.round(fSize * scaleRatio);

    var bannerH = Math.round(scaledFontSize * 2.8);
    var bannerY = h - bannerH;
    var style = bannerStyle.value;

    if (style === 'white_bg') {
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, bannerY, w, bannerH);
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = Math.max(1, Math.round(scaleRatio));
      ctx.strokeRect(0, bannerY, w, bannerH);
      ctx.fillStyle = '#000000';
    } else if (style === 'black_bg') {
      ctx.fillStyle = '#000000';
      ctx.fillRect(0, bannerY, w, bannerH);
      ctx.fillStyle = '#ffffff';
    } else {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.55)';
      ctx.fillRect(0, bannerY, w, bannerH);
      ctx.fillStyle = '#ffffff';
    }

    ctx.font = 'bold ' + scaledFontSize + 'px Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    if (nameText && dateText) {
      ctx.fillText(nameText, w / 2, bannerY + bannerH * 0.35);
      ctx.fillText(dateText, w / 2, bannerY + bannerH * 0.72);
    } else if (nameText) {
      ctx.fillText(nameText, w / 2, bannerY + bannerH * 0.5);
    } else if (dateText) {
      ctx.fillText(dateText, w / 2, bannerY + bannerH * 0.5);
    }
  }

  inpName.addEventListener('input', draw);
  inpDate.addEventListener('input', draw);
  fontSizeRange.addEventListener('input', function() {
    fontVal.textContent = fontSizeRange.value + 'px';
    draw();
  });
  bannerStyle.addEventListener('change', draw);

  downloadBtn.addEventListener('click', function() {
    draw();
    canvas.toBlob(function(blob) {
      var url = URL.createObjectURL(blob);
      var a = document.createElement('a');
      a.href = url;
      a.download = 'candidate-photo-stamped.jpg';
      a.click();
    }, 'image/jpeg', 0.95);
  });

  changeBtn.addEventListener('click', function() {
    dropzone.style.display = 'block';
    editorWrap.style.display = 'none';
  });
})();
