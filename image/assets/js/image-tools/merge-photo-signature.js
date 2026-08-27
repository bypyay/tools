(function () {
  var photoDrop = document.getElementById('photoDropzone');
  var photoInput = document.getElementById('photoInput');
  var photoPreview = document.getElementById('photoPreview');

  var signDrop = document.getElementById('signDropzone');
  var signInput = document.getElementById('signInput');
  var signPreview = document.getElementById('signPreview');

  var mergeBtn = document.getElementById('mergeBtn');
  var uploadGrid = document.getElementById('uploadGrid');
  var resultBox = document.getElementById('resultBox');
  var mergedCanvas = document.getElementById('mergedCanvas');
  var downloadLink = document.getElementById('downloadLink');
  var resetBtn = document.getElementById('resetBtn');

  var photoImg = null, signImg = null;

  function handleImage(file, isPhoto) {
    var reader = new FileReader();
    reader.onload = function (e) {
      var img = new Image();
      img.onload = function () {
        if (isPhoto) {
          photoImg = img;
          photoPreview.src = e.target.result;
          photoPreview.style.display = 'inline-block';
        } else {
          signImg = img;
          signPreview.src = e.target.result;
          signPreview.style.display = 'inline-block';
        }
        if (photoImg && signImg) {
          mergeBtn.disabled = false;
        }
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  }

  photoDrop.addEventListener('click', function () { photoInput.click(); });
  photoInput.addEventListener('change', function (e) { handleImage(e.target.files[0], true); });

  signDrop.addEventListener('click', function () { signInput.click(); });
  signInput.addEventListener('change', function (e) { handleImage(e.target.files[0], false); });

  mergeBtn.addEventListener('click', function () {
    if (!photoImg || !signImg) return;

    var targetW = 600;
    var photoH = Math.round(targetW * 1.25); // 750 px photo height
    var signH = Math.round(targetW * 0.40);  // 240 px sign height
    var totalH = photoH + signH + 20;       // margin

    mergedCanvas.width = targetW;
    mergedCanvas.height = totalH;
    var ctx = mergedCanvas.getContext('2d');

    // Background card
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, targetW, totalH);

    // Draw photo centered on top
    ctx.drawImage(photoImg, 0, 0, targetW, photoH);

    // Divider line
    ctx.strokeStyle = '#cbd5e1';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, photoH);
    ctx.lineTo(targetW, photoH);
    ctx.stroke();

    // Draw signature in bottom box
    var sAspect = signImg.naturalWidth / signImg.naturalHeight;
    var sDrawW = Math.min(targetW - 40, signH * sAspect);
    var sDrawH = sDrawW / sAspect;
    if (sDrawH > signH - 20) {
      sDrawH = signH - 20;
      sDrawW = sDrawH * sAspect;
    }
    var sX = (targetW - sDrawW) / 2;
    var sY = photoH + (signH - sDrawH) / 2;

    ctx.drawImage(signImg, sX, sY, sDrawW, sDrawH);

    mergedCanvas.toBlob(function (blob) {
      var url = URL.createObjectURL(blob);
      downloadLink.href = url;
      downloadLink.download = 'merged-photo-signature.jpg';
      uploadGrid.style.display = 'none';
      resultBox.style.display = 'block';
    }, 'image/jpeg', 0.95);
  });

  resetBtn.addEventListener('click', function () {
    photoImg = null;
    signImg = null;
    photoPreview.style.display = 'none';
    signPreview.style.display = 'none';
    mergeBtn.disabled = true;
    uploadGrid.style.display = 'block';
    resultBox.style.display = 'none';
  });
})();
