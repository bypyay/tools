(function () {
  if (window.pdfjsLib) {
    var pdfScriptTag = document.querySelector('script[src*="vendor/pdf.min.js"]');
    var siteRoot = pdfScriptTag ? pdfScriptTag.getAttribute('src').replace(/vendor\/pdf\.min\.js.*$/, '') : '';
    pdfjsLib.GlobalWorkerOptions.workerSrc = siteRoot + 'vendor/pdf.worker.min.js';
  }

  var dropzone = document.getElementById('dropzone');
  var fileInput = document.getElementById('fileInput');
  var fileInfo = document.getElementById('fileInfo');
  var fileNameEl = document.getElementById('fileName');
  var pageCountEl = document.getElementById('pageCount');
  var removeFileBtn = document.getElementById('removeFile');
  var cropTop = document.getElementById('cropTop');
  var cropBottom = document.getElementById('cropBottom');
  var cropLeft = document.getElementById('cropLeft');
  var cropRight = document.getElementById('cropRight');
  var autoMarginBtn = document.getElementById('autoMarginBtn');
  var resetCropBtn = document.getElementById('resetCropBtn');
  var cropPreviewWrap = document.getElementById('cropPreviewWrap');
  var actions = document.getElementById('actions');
  var cropBtn = document.getElementById('cropBtn');
  var progressWrap = document.getElementById('progressWrap');
  var progressBar = document.getElementById('progressBar');
  var statusText = document.getElementById('statusText');
  var resultBox = document.getElementById('resultBox');
  var resultInfo = document.getElementById('resultInfo');
  var downloadLink = document.getElementById('downloadLink');
  var resetBtn = document.getElementById('resetBtn');
  var continueBox = document.getElementById('continueBox');
  var continueGrid = document.getElementById('continueGrid');

  var currentFile = null;
  var pageCount = 0;
  var baseCanvas = null;
  var previewCanvas = null;

  var topPct = 0.05;
  var bottomPct = 0.05;
  var leftPct = 0.05;
  var rightPct = 0.05;

  var isDragging = false;
  var dragSide = null; // 't'|'b'|'l'|'r'|'all'
  var startX = 0, startY = 0;
  var initT = 0, initB = 0, initL = 0, initR = 0;

  function loadFile(file) {
    if (!file) return;
    if (file.type !== 'application/pdf' && !/\.pdf$/i.test(file.name)) {
      alert('Please select a PDF file.');
      return;
    }
    currentFile = file;
    file.arrayBuffer().then(function (buf) {
      return pdfjsLib.getDocument({ data: buf }).promise;
    }).then(function (pdf) {
      pageCount = pdf.numPages;
      fileNameEl.textContent = file.name;
      pageCountEl.textContent = pageCount + ' page' + (pageCount === 1 ? '' : 's');
      if (dropzone) dropzone.style.display = 'none';
      fileInfo.style.display = 'block';
      actions.style.display = 'block';
      return renderPreviewBase(pdf);
    }).catch(function (err) {
      console.error(err);
      alert('Could not read PDF: ' + err.message);
      currentFile = null;
    });
  }

  function renderPreviewBase(pdf) {
    return pdf.getPage(1).then(function (page) {
      var targetWidth = 340;
      var unscaled = page.getViewport({ scale: 1 });
      var previewScale = targetWidth / unscaled.width;
      var viewport = page.getViewport({ scale: previewScale });

      baseCanvas = document.createElement('canvas');
      baseCanvas.width = Math.round(viewport.width);
      baseCanvas.height = Math.round(viewport.height);
      var ctx = baseCanvas.getContext('2d');

      return page.render({ canvasContext: ctx, viewport: viewport }).promise.then(function () {
        cropPreviewWrap.innerHTML = '';
        previewCanvas = document.createElement('canvas');
        previewCanvas.width = baseCanvas.width;
        previewCanvas.height = baseCanvas.height;
        previewCanvas.style.display = 'block';
        previewCanvas.style.cursor = 'crosshair';
        cropPreviewWrap.appendChild(previewCanvas);

        setupInteractiveCrop(previewCanvas);
        redrawPreview();
      });
    });
  }

  function redrawPreview() {
    if (!baseCanvas || !previewCanvas) return;
    var ctx = previewCanvas.getContext('2d');
    var w = previewCanvas.width;
    var h = previewCanvas.height;

    ctx.clearRect(0, 0, w, h);
    ctx.drawImage(baseCanvas, 0, 0);

    var cropX = w * leftPct;
    var cropY = h * topPct;
    var cropW = w * (1 - leftPct - rightPct);
    var cropH = h * (1 - topPct - bottomPct);

    // Darken cropped areas
    ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
    ctx.fillRect(0, 0, w, cropY); // top
    ctx.fillRect(0, cropY + cropH, w, h - (cropY + cropH)); // bottom
    ctx.fillRect(0, cropY, cropX, cropH); // left
    ctx.fillRect(cropX + cropW, cropY, w - (cropX + cropW), cropH); // right

    // Crop box outline
    ctx.strokeStyle = '#e5322d';
    ctx.lineWidth = 2;
    ctx.setLineDash([6, 6]);
    ctx.strokeRect(cropX, cropY, cropW, cropH);

    // Corner & Edge Handles
    ctx.setLineDash([]);
    ctx.fillStyle = '#fff';
    ctx.strokeStyle = '#e5322d';
    ctx.lineWidth = 2;

    var handles = [
      [cropX, cropY], [cropX + cropW / 2, cropY], [cropX + cropW, cropY],
      [cropX, cropY + cropH / 2], [cropX + cropW, cropY + cropH / 2],
      [cropX, cropY + cropH], [cropX + cropW / 2, cropY + cropH], [cropX + cropW, cropY + cropH]
    ];

    handles.forEach(function (pt) {
      ctx.fillRect(pt[0] - 4, pt[1] - 4, 8, 8);
      ctx.strokeRect(pt[0] - 4, pt[1] - 4, 8, 8);
    });
  }

  function setupInteractiveCrop(canvas) {
    function getCoords(e) {
      var rect = canvas.getBoundingClientRect();
      var cx = e.touches ? e.touches[0].clientX : e.clientX;
      var cy = e.touches ? e.touches[0].clientY : e.clientY;
      return {
        x: (cx - rect.left) * (canvas.width / rect.width),
        y: (cy - rect.top) * (canvas.height / rect.height)
      };
    }

    function startDrag(e) {
      var c = getCoords(e);
      var w = canvas.width, h = canvas.height;
      var cropX = w * leftPct, cropY = h * topPct;
      var cropW = w * (1 - leftPct - rightPct), cropH = h * (1 - topPct - bottomPct);

      var hitDist = 14;
      dragSide = null;

      if (Math.abs(c.y - cropY) <= hitDist) dragSide = 't';
      else if (Math.abs(c.y - (cropY + cropH)) <= hitDist) dragSide = 'b';
      else if (Math.abs(c.x - cropX) <= hitDist) dragSide = 'l';
      else if (Math.abs(c.x - (cropX + cropW)) <= hitDist) dragSide = 'r';
      else if (c.x > cropX && c.x < cropX + cropW && c.y > cropY && c.y < cropY + cropH) dragSide = 'all';

      if (dragSide) {
        isDragging = true;
        startX = c.x;
        startY = c.y;
        initT = topPct; initB = bottomPct; initL = leftPct; initR = rightPct;
        e.preventDefault();
      }
    }

    function moveDrag(e) {
      var c = getCoords(e);
      var w = canvas.width, h = canvas.height;

      if (isDragging) {
        var dx = (c.x - startX) / w;
        var dy = (c.y - startY) / h;

        if (dragSide === 't') {
          topPct = Math.max(0, Math.min(0.45, initT + dy));
          cropTop.value = Math.round(topPct * 100);
        } else if (dragSide === 'b') {
          bottomPct = Math.max(0, Math.min(0.45, initB - dy));
          cropBottom.value = Math.round(bottomPct * 100);
        } else if (dragSide === 'l') {
          leftPct = Math.max(0, Math.min(0.45, initL + dx));
          cropLeft.value = Math.round(leftPct * 100);
        } else if (dragSide === 'r') {
          rightPct = Math.max(0, Math.min(0.45, initR - dx));
          cropRight.value = Math.round(rightPct * 100);
        } else if (dragSide === 'all') {
          var newL = Math.max(0, Math.min(0.45, initL + dx));
          var newR = Math.max(0, Math.min(0.45, initR - dx));
          var newT = Math.max(0, Math.min(0.45, initT + dy));
          var newB = Math.max(0, Math.min(0.45, initB - dy));
          leftPct = newL; rightPct = newR; topPct = newT; bottomPct = newB;
          cropTop.value = Math.round(topPct * 100);
          cropBottom.value = Math.round(bottomPct * 100);
          cropLeft.value = Math.round(leftPct * 100);
          cropRight.value = Math.round(rightPct * 100);
        }
        redrawPreview();
        e.preventDefault();
      }
    }

    function endDrag() {
      isDragging = false;
    }

    canvas.addEventListener('mousedown', startDrag);
    window.addEventListener('mousemove', moveDrag);
    window.addEventListener('mouseup', endDrag);

    canvas.addEventListener('touchstart', startDrag, { passive: false });
    window.addEventListener('touchmove', moveDrag, { passive: false });
    window.addEventListener('touchend', endDrag);
  }

  [cropTop, cropBottom, cropLeft, cropRight].forEach(function (inp) {
    inp.addEventListener('input', function () {
      topPct = (parseFloat(cropTop.value) || 0) / 100;
      bottomPct = (parseFloat(cropBottom.value) || 0) / 100;
      leftPct = (parseFloat(cropLeft.value) || 0) / 100;
      rightPct = (parseFloat(cropRight.value) || 0) / 100;
      redrawPreview();
    });
  });

  autoMarginBtn.addEventListener('click', function () {
    topPct = 0.10; bottomPct = 0.10; leftPct = 0.10; rightPct = 0.10;
    cropTop.value = 10; cropBottom.value = 10; cropLeft.value = 10; cropRight.value = 10;
    redrawPreview();
  });

  resetCropBtn.addEventListener('click', function () {
    topPct = 0; bottomPct = 0; leftPct = 0; rightPct = 0;
    cropTop.value = 0; cropBottom.value = 0; cropLeft.value = 0; cropRight.value = 0;
    redrawPreview();
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

  removeFileBtn.addEventListener('click', function () {
    currentFile = null;
    if (dropzone) dropzone.style.display = 'block';
    fileInfo.style.display = 'none';
    actions.style.display = 'none';
    cropPreviewWrap.innerHTML = '';
  });

  cropBtn.addEventListener('click', function () {
    if (!currentFile) return;
    cropBtn.disabled = true;
    progressWrap.style.display = 'block';
    progressBar.style.width = '20%';
    statusText.textContent = 'Cropping PDF pages...';

    var scope = document.querySelector('input[name=cropScope]:checked').value;

    currentFile.arrayBuffer().then(function (buf) {
      return PDFLib.PDFDocument.load(buf, { ignoreEncryption: true });
    }).then(function (doc) {
      var pages = doc.getPages();
      pages.forEach(function (page, idx) {
        if (scope === 'first' && idx > 0) return;
        var pw = page.getWidth();
        var ph = page.getHeight();

        var trimL = pw * leftPct;
        var trimR = pw * rightPct;
        var trimT = ph * topPct;
        var trimB = ph * bottomPct;

        var newX = trimL;
        var newY = trimB;
        var newW = Math.max(10, pw - trimL - trimR);
        var newH = Math.max(10, ph - trimT - trimB);

        page.setCropBox(newX, newY, newW, newH);
        page.setMediaBox(newX, newY, newW, newH);
      });

      progressBar.style.width = '80%';
      return doc.save();
    }).then(function (bytes) {
      var blob = new Blob([bytes], { type: 'application/pdf' });
      var url = URL.createObjectURL(blob);
      downloadLink.href = url;
      var outName = currentFile.name.replace(/\.pdf$/i, '') + '-cropped.pdf';
      downloadLink.download = outName;
      downloadLink.textContent = 'Download ' + outName;
      resultInfo.textContent = 'PDF successfully cropped.';

      progressBar.style.width = '100%';
      progressWrap.style.display = 'none';
      resultBox.style.display = 'block';

      if (window.PdfHandoff && continueBox && continueGrid) {
        PdfHandoff.renderContinueBox(continueGrid, ['compress-pdf', 'watermark-pdf', 'protect-pdf'], function () {
          return { blob: blob, filename: outName };
        });
        continueBox.style.display = 'block';
      }
    }).catch(function (err) {
      console.error(err);
      alert('Error cropping PDF: ' + err.message);
      progressWrap.style.display = 'none';
      cropBtn.disabled = false;
    });
  });

  resetBtn.addEventListener('click', function () {
    currentFile = null;
    if (dropzone) dropzone.style.display = 'block';
    fileInfo.style.display = 'none';
    actions.style.display = 'none';
    resultBox.style.display = 'none';
    if (continueBox) continueBox.style.display = 'none';
    cropBtn.disabled = false;
    cropPreviewWrap.innerHTML = '';
  });

  if (window.PdfHandoff) {
    PdfHandoff.take().then(function (result) {
      if (result && result.blob) {
        var f = new File([result.blob], result.filename || 'file.pdf', { type: 'application/pdf' });
        loadFile(f);
        PdfHandoff.showBanner('Continuing with ' + (result.filename || 'your file') + ' — crop margins below.');
      }
    });
  }
})();
