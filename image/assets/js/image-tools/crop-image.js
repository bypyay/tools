(function () {
  var dropzone = document.getElementById('dropzone');
  var fileInput = document.getElementById('fileInput');
  var editorWrap = document.getElementById('editorWrap');
  var canvas = document.getElementById('cropCanvas');
  var ctx = canvas.getContext('2d');
  var cropBox = document.getElementById('cropBox');
  var cropBtn = document.getElementById('cropBtn');

  var loadedImg = null;
  var currentFile = null;
  var selectedRatio = 'free';

  // Crop box bounding box in % (0 to 100)
  var box = { left: 10, top: 10, width: 80, height: 80 };
  var isDraggingBox = false, activeHandle = null;
  var dragStartX = 0, dragStartY = 0, initialBox = null;

  function loadFile(file) {
    if (!file || !file.type.match(/image.*/)) return;
    currentFile = file;
    var reader = new FileReader();
    reader.onload = function (e) {
      var img = new Image();
      img.onload = function () {
        loadedImg = img;
        canvas.width = img.naturalWidth || img.width;
        canvas.height = img.naturalHeight || img.height;
        ctx.drawImage(img, 0, 0);

        dropzone.style.display = 'none';
        editorWrap.style.display = 'block';
        updateBoxUI();
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  }

  function updateBoxUI() {
    cropBox.style.left = box.left + '%';
    cropBox.style.top = box.top + '%';
    cropBox.style.width = box.width + '%';
    cropBox.style.height = box.height + '%';

    if (selectedRatio === 'circle') {
      cropBox.style.borderRadius = '50%';
    } else {
      cropBox.style.borderRadius = '0';
    }
  }

  // Ratio Buttons
  document.querySelectorAll('.crop-mode-btn').forEach(function (btn) {
    btn.addEventListener('click', function () {
      document.querySelectorAll('.crop-mode-btn').forEach(function (b) { b.classList.remove('active'); });
      btn.classList.add('active');
      selectedRatio = btn.getAttribute('data-ratio');

      if (selectedRatio === '1:1' || selectedRatio === 'circle') {
        box.width = Math.min(box.width, box.height);
        box.height = box.width;
      } else if (selectedRatio === '16:9') {
        box.height = Math.round(box.width * (9 / 16));
      } else if (selectedRatio === '4:3') {
        box.height = Math.round(box.width * (3 / 4));
      } else if (selectedRatio === '9:16') {
        box.width = Math.round(box.height * (9 / 16));
      }
      updateBoxUI();
    });
  });

  // Dragging crop box
  cropBox.addEventListener('mousedown', function (e) {
    if (e.target.classList.contains('crop-handle')) {
      activeHandle = e.target.className.split(' ')[1];
    } else {
      isDraggingBox = true;
    }
    dragStartX = e.clientX;
    dragStartY = e.clientY;
    initialBox = Object.assign({}, box);
    e.stopPropagation();
  });

  window.addEventListener('mousemove', function (e) {
    if (!loadedImg || (!isDraggingBox && !activeHandle)) return;
    var rect = canvas.getBoundingClientRect();
    var deltaXPercent = ((e.clientX - dragStartX) / rect.width) * 100;
    var deltaYPercent = ((e.clientY - dragStartY) / rect.height) * 100;

    if (isDraggingBox) {
      box.left = Math.max(0, Math.min(100 - initialBox.width, initialBox.left + deltaXPercent));
      box.top = Math.max(0, Math.min(100 - initialBox.height, initialBox.top + deltaYPercent));
    } else if (activeHandle === 'se') {
      box.width = Math.max(10, Math.min(100 - initialBox.left, initialBox.width + deltaXPercent));
      box.height = Math.max(10, Math.min(100 - initialBox.top, initialBox.height + deltaYPercent));
      if (selectedRatio === '1:1' || selectedRatio === 'circle') {
        box.height = box.width;
      }
    }
    updateBoxUI();
  });

  window.addEventListener('mouseup', function () {
    isDraggingBox = false;
    activeHandle = null;
  });

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

  cropBtn.addEventListener('click', function () {
    if (!loadedImg) return;
    var fullW = canvas.width, fullH = canvas.height;

    var cropX = Math.round((box.left / 100) * fullW);
    var cropY = Math.round((box.top / 100) * fullH);
    var cropW = Math.round((box.width / 100) * fullW);
    var cropH = Math.round((box.height / 100) * fullH);

    var outCanvas = document.createElement('canvas');
    var oCtx = outCanvas.getContext('2d');
    outCanvas.width = cropW;
    outCanvas.height = cropH;

    if (selectedRatio === 'circle') {
      oCtx.beginPath();
      oCtx.arc(cropW / 2, cropH / 2, Math.min(cropW, cropH) / 2, 0, Math.PI * 2);
      oCtx.clip();
      oCtx.drawImage(canvas, cropX, cropY, cropW, cropH, 0, 0, cropW, cropH);

      outCanvas.toBlob(function (blob) {
        var url = URL.createObjectURL(blob);
        var a = document.createElement('a');
        a.href = url;
        a.download = 'cropped-circle.png';
        a.click();
      }, 'image/png');
    } else {
      oCtx.drawImage(canvas, cropX, cropY, cropW, cropH, 0, 0, cropW, cropH);
      outCanvas.toBlob(function (blob) {
        var url = URL.createObjectURL(blob);
        var a = document.createElement('a');
        a.href = url;
        a.download = 'cropped-image.jpg';
        a.click();
      }, 'image/jpeg', 0.95);
    }
  });
})();
