
(function() {
  var photoDropzone = document.getElementById('photoDropzone');
  var photoInput = document.getElementById('photoInput');
  var photoPreview = document.getElementById('photoPreview');
  var photoPreviewWrap = document.getElementById('photoPreviewWrap');

  var signDropzone = document.getElementById('signDropzone');
  var signInput = document.getElementById('signInput');
  var signPreview = document.getElementById('signPreview');
  var signPreviewWrap = document.getElementById('signPreviewWrap');

  var controlsWrap = document.getElementById('controlsWrap');
  var mergeLayout = document.getElementById('mergeLayout');
  var cleanSign = document.getElementById('cleanSign');
  var mergeBtn = document.getElementById('mergeBtn');
  var resultBox = document.getElementById('resultBox');
  var mergedCanvas = document.getElementById('mergedCanvas');
  var ctx = mergedCanvas.getContext('2d');
  var downloadLink = document.getElementById('downloadLink');
  var resetBtn = document.getElementById('resetBtn');

  var photoImg = null;
  var signImg = null;

  photoDropzone.addEventListener('click', function() { photoInput.click(); });
  photoInput.addEventListener('change', function(e) {
    if (e.target.files[0]) {
      var reader = new FileReader();
      reader.onload = function(evt) {
        var img = new Image();
        img.onload = function() {
          photoImg = img;
          photoPreview.src = evt.target.result;
          photoPreviewWrap.style.display = 'block';
          checkBothLoaded();
        };
        img.src = evt.target.result;
      };
      reader.readAsDataURL(e.target.files[0]);
    }
  });

  signDropzone.addEventListener('click', function() { signInput.click(); });
  signInput.addEventListener('change', function(e) {
    if (e.target.files[0]) {
      var reader = new FileReader();
      reader.onload = function(evt) {
        var img = new Image();
        img.onload = function() {
          signImg = img;
          signPreview.src = evt.target.result;
          signPreviewWrap.style.display = 'block';
          checkBothLoaded();
        };
        img.src = evt.target.result;
      };
      reader.readAsDataURL(e.target.files[0]);
    }
  });

  function checkBothLoaded() {
    if (photoImg && signImg) {
      controlsWrap.style.display = 'block';
    }
  }

  mergeBtn.addEventListener('click', function() {
    if (!photoImg || !signImg) return;
    var layout = mergeLayout.value;

    if (layout === 'vertical') {
      var w = 400;
      var photoH = 380;
      var signH = 140;
      var totalH = photoH + signH + 10;

      mergedCanvas.width = w;
      mergedCanvas.height = totalH;

      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, w, totalH);

      // Draw Photo centered
      var pScale = Math.min((w - 20) / photoImg.naturalWidth, photoH / photoImg.naturalHeight);
      var pW = photoImg.naturalWidth * pScale;
      var pH = photoImg.naturalHeight * pScale;
      ctx.drawImage(photoImg, (w - pW) / 2, (photoH - pH) / 2 + 5, pW, pH);

      // Draw Separator
      ctx.strokeStyle = '#e2e8f0';
      ctx.lineWidth = 1;
      ctx.strokeRect(10, photoH + 5, w - 20, signH);

      // Draw Signature centered
      var sScale = Math.min((w - 40) / signImg.naturalWidth, (signH - 20) / signImg.naturalHeight);
      var sW = signImg.naturalWidth * sScale;
      var sH = signImg.naturalHeight * sScale;
      ctx.drawImage(signImg, (w - sW) / 2, photoH + 5 + (signH - sH) / 2, sW, sH);

    } else {
      var totalW = 600;
      var totalH = 300;

      mergedCanvas.width = totalW;
      mergedCanvas.height = totalH;

      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, totalW, totalH);

      // Photo left
      ctx.drawImage(photoImg, 10, 10, 280, 280);
      // Signature right
      ctx.drawImage(signImg, 300, 50, 290, 200);
    }

    mergedCanvas.toBlob(function(blob) {
      var url = URL.createObjectURL(blob);
      downloadLink.href = url;
      downloadLink.download = 'photo-and-signature.jpg';
      resultBox.style.display = 'block';
    }, 'image/jpeg', 0.95);
  });

  resetBtn.addEventListener('click', function() {
    photoImg = null;
    signImg = null;
    photoPreviewWrap.style.display = 'none';
    signPreviewWrap.style.display = 'none';
    controlsWrap.style.display = 'none';
    resultBox.style.display = 'none';
  });
})();
