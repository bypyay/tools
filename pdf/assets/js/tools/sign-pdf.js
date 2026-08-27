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
  var tabDrawBtn = document.getElementById('tabDrawBtn');
  var tabTypeBtn = document.getElementById('tabTypeBtn');
  var tabUploadBtn = document.getElementById('tabUploadBtn');
  var drawSection = document.getElementById('drawSection');
  var typeSection = document.getElementById('typeSection');
  var uploadSection = document.getElementById('uploadSection');
  var sigPad = document.getElementById('sigPad');
  var clearPadBtn = document.getElementById('clearPadBtn');
  var inkColor = document.getElementById('inkColor');
  var typeSigInput = document.getElementById('typeSigInput');
  var typedPreview = document.getElementById('typedPreview');
  var sigUploadDropzone = document.getElementById('sigUploadDropzone');
  var sigFileInput = document.getElementById('sigFileInput');
  var sigScale = document.getElementById('sigScale');
  var sigScaleVal = document.getElementById('sigScaleVal');
  var pageSelect = document.getElementById('pageSelect');
  var addDateCheck = document.getElementById('addDateCheck');
  var sigPreviewWrap = document.getElementById('sigPreviewWrap');
  var actions = document.getElementById('actions');
  var signBtn = document.getElementById('signBtn');
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
  var pdfDoc = null;
  var totalPages = 0;
  var selectedPageNum = 1;
  var baseCanvas = null;
  var previewCanvas = null;
  var previewScale = 1;

  var currentSigMode = 'draw'; // 'draw'|'type'|'upload'
  var sigXPercent = 0.5;
  var sigYPercent = 0.75;
  var uploadedSigImg = null;
  var isDrawingOnPad = false;
  var hasDrawn = false;

  var isDraggingSig = false;
  var dragStartX = 0, dragStartY = 0;
  var initX = 0.5, initY = 0.75;

  // Drawing Pad setup
  var padCtx = sigPad.getContext('2d');
  padCtx.lineWidth = 2.5;
  padCtx.lineCap = 'round';
  padCtx.lineJoin = 'round';

  function getPadCoords(e) {
    var rect = sigPad.getBoundingClientRect();
    var cx = e.touches ? e.touches[0].clientX : e.clientX;
    var cy = e.touches ? e.touches[0].clientY : e.clientY;
    return {
      x: (cx - rect.left) * (sigPad.width / rect.width),
      y: (cy - rect.top) * (sigPad.height / rect.height)
    };
  }

  function startPadDraw(e) {
    isDrawingOnPad = true;
    hasDrawn = true;
    var c = getPadCoords(e);
    padCtx.strokeStyle = inkColor.value;
    padCtx.beginPath();
    padCtx.moveTo(c.x, c.y);
    e.preventDefault();
  }

  function movePadDraw(e) {
    if (!isDrawingOnPad) return;
    var c = getPadCoords(e);
    padCtx.lineTo(c.x, c.y);
    padCtx.stroke();
    redrawPreview();
    e.preventDefault();
  }

  function endPadDraw() {
    isDrawingOnPad = false;
    redrawPreview();
  }

  sigPad.addEventListener('mousedown', startPadDraw);
  window.addEventListener('mousemove', movePadDraw);
  window.addEventListener('mouseup', endPadDraw);

  sigPad.addEventListener('touchstart', startPadDraw, { passive: false });
  window.addEventListener('touchmove', movePadDraw, { passive: false });
  window.addEventListener('touchend', endPadDraw);

  clearPadBtn.addEventListener('click', function () {
    padCtx.clearRect(0, 0, sigPad.width, sigPad.height);
    hasDrawn = false;
    redrawPreview();
  });

  inkColor.addEventListener('input', function () {
    redrawPreview();
  });

  // Tab buttons
  tabDrawBtn.addEventListener('click', function () {
    currentSigMode = 'draw';
    setTabActive(tabDrawBtn);
    drawSection.style.display = 'block';
    typeSection.style.display = 'none';
    uploadSection.style.display = 'none';
    redrawPreview();
  });

  tabTypeBtn.addEventListener('click', function () {
    currentSigMode = 'type';
    setTabActive(tabTypeBtn);
    typeSection.style.display = 'block';
    drawSection.style.display = 'none';
    uploadSection.style.display = 'none';
    if (!typeSigInput.value) typeSigInput.value = 'John Doe';
    typedPreview.textContent = typeSigInput.value;
    redrawPreview();
  });

  tabUploadBtn.addEventListener('click', function () {
    currentSigMode = 'upload';
    setTabActive(tabUploadBtn);
    uploadSection.style.display = 'block';
    drawSection.style.display = 'none';
    typeSection.style.display = 'none';
    redrawPreview();
  });

  function setTabActive(btn) {
    [tabDrawBtn, tabTypeBtn, tabUploadBtn].forEach(function (b) {
      b.style.background = 'var(--bg-soft)';
      b.style.color = 'var(--ink)';
      b.style.border = '1px solid var(--border)';
    });
    btn.style.background = 'var(--red)';
    btn.style.color = '#fff';
    btn.style.border = 'none';
  }

  typeSigInput.addEventListener('input', function () {
    typedPreview.textContent = typeSigInput.value || 'Your Signature';
    redrawPreview();
  });

  sigUploadDropzone.addEventListener('click', function () { sigFileInput.click(); });
  sigFileInput.addEventListener('change', function (e) {
    if (e.target.files && e.target.files[0]) {
      var file = e.target.files[0];
      var reader = new FileReader();
      reader.onload = function (evt) {
        var img = new Image();
        img.onload = function () {
          uploadedSigImg = img;
          sigUploadDropzone.innerHTML = '<img src="' + evt.target.result + '" style="max-height:60px; max-width:180px; display:inline-block; border-radius:4px;"><p style="margin:4px 0 0; font-size:.78rem; color:var(--ink-soft);">' + file.name + ' (Click to change)</p>';
          redrawPreview();
        };
        img.src = evt.target.result;
      };
      reader.readAsDataURL(file);
    }
  });

  sigScale.addEventListener('input', function () {
    sigScaleVal.textContent = sigScale.value + '%';
    redrawPreview();
  });

  pageSelect.addEventListener('change', function () {
    selectedPageNum = parseInt(pageSelect.value, 10);
    renderPagePreview(selectedPageNum);
  });

  addDateCheck.addEventListener('change', redrawPreview);

  function loadFile(file) {
    if (!file) return;
    if (file.type !== 'application/pdf' && !/\.pdf$/i.test(file.name)) {
      alert('Please select a PDF file.');
      return;
    }
    currentFile = file;
    fileNameEl.textContent = file.name;
    if (dropzone) dropzone.style.display = 'none';
    fileInfo.style.display = 'block';
    actions.style.display = 'block';

    file.arrayBuffer().then(function (buf) {
      return pdfjsLib.getDocument({ data: buf }).promise;
    }).then(function (pdf) {
      pdfDoc = pdf;
      totalPages = pdf.numPages;
      pageCountEl.textContent = totalPages + ' page' + (totalPages === 1 ? '' : 's');

      pageSelect.innerHTML = '';
      for (var i = 1; i <= totalPages; i++) {
        var opt = document.createElement('option');
        opt.value = i;
        opt.textContent = 'Page ' + i;
        pageSelect.appendChild(opt);
      }
      selectedPageNum = 1;
      return renderPagePreview(1);
    }).catch(function (err) {
      console.error(err);
      alert('Could not read PDF: ' + err.message);
      currentFile = null;
    });
  }

  function renderPagePreview(pNum) {
    if (!pdfDoc) return;
    return pdfDoc.getPage(pNum).then(function (page) {
      var targetWidth = 340;
      var unscaled = page.getViewport({ scale: 1 });
      previewScale = targetWidth / unscaled.width;
      var viewport = page.getViewport({ scale: previewScale });

      baseCanvas = document.createElement('canvas');
      baseCanvas.width = Math.round(viewport.width);
      baseCanvas.height = Math.round(viewport.height);
      var ctx = baseCanvas.getContext('2d');

      return page.render({ canvasContext: ctx, viewport: viewport }).promise.then(function () {
        sigPreviewWrap.innerHTML = '';
        previewCanvas = document.createElement('canvas');
        previewCanvas.width = baseCanvas.width;
        previewCanvas.height = baseCanvas.height;
        previewCanvas.style.display = 'block';
        previewCanvas.style.cursor = 'move';
        sigPreviewWrap.appendChild(previewCanvas);

        setupInteractiveDrag(previewCanvas);
        redrawPreview();
      });
    });
  }

  function getSignatureImageCanvas() {
    var c = document.createElement('canvas');
    if (currentSigMode === 'draw') {
      c.width = sigPad.width;
      c.height = sigPad.height;
      var ctx = c.getContext('2d');
      ctx.drawImage(sigPad, 0, 0);
      return c;
    } else if (currentSigMode === 'type') {
      c.width = 400;
      c.height = 120;
      var ctx = c.getContext('2d');
      ctx.font = '54px "Brush Script MT", cursive, sans-serif';
      ctx.fillStyle = inkColor.value;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(typeSigInput.value || 'John Doe', 200, 60);
      return c;
    } else if (currentSigMode === 'upload' && uploadedSigImg) {
      c.width = uploadedSigImg.width;
      c.height = uploadedSigImg.height;
      var ctx = c.getContext('2d');
      ctx.drawImage(uploadedSigImg, 0, 0);
      return c;
    }
    return null;
  }

  function redrawPreview() {
    if (!baseCanvas || !previewCanvas) return;
    var ctx = previewCanvas.getContext('2d');
    var pw = previewCanvas.width;
    var ph = previewCanvas.height;

    ctx.clearRect(0, 0, pw, ph);
    ctx.drawImage(baseCanvas, 0, 0);

    var sigCanvas = getSignatureImageCanvas();
    if (!sigCanvas) return;

    var scale = parseFloat(sigScale.value) / 100;
    var sigW = Math.round(140 * scale * previewScale * 2.2);
    var sigH = Math.round(sigCanvas.height * (sigW / sigCanvas.width));

    var cx = pw * sigXPercent;
    var cy = ph * sigYPercent;

    var drawX = cx - sigW / 2;
    var drawY = cy - sigH / 2;

    ctx.drawImage(sigCanvas, drawX, drawY, sigW, sigH);

    if (addDateCheck.checked) {
      var d = new Date();
      var dateStr = ('0' + d.getDate()).slice(-2) + '/' + ('0' + (d.getMonth() + 1)).slice(-2) + '/' + d.getFullYear();
      ctx.font = 'bold 10px sans-serif';
      ctx.fillStyle = '#374151';
      ctx.textAlign = 'center';
      ctx.fillText('Date: ' + dateStr, cx, drawY + sigH + 12);
    }

    // Bounding Box
    ctx.strokeStyle = '#e5322d';
    ctx.lineWidth = 1.5;
    ctx.setLineDash([4, 4]);
    ctx.strokeRect(drawX - 2, drawY - 2, sigW + 4, sigH + (addDateCheck.checked ? 18 : 4));
  }

  function setupInteractiveDrag(canvas) {
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
      isDraggingSig = true;
      var c = getCoords(e);
      dragStartX = c.x;
      dragStartY = c.y;
      initX = sigXPercent;
      initY = sigYPercent;
      e.preventDefault();
    }

    function moveDrag(e) {
      if (!isDraggingSig) return;
      var c = getCoords(e);
      var dx = (c.x - dragStartX) / canvas.width;
      var dy = (c.y - dragStartY) / canvas.height;
      sigXPercent = Math.max(0.1, Math.min(0.9, initX + dx));
      sigYPercent = Math.max(0.1, Math.min(0.9, initY + dy));
      redrawPreview();
      e.preventDefault();
    }

    function endDrag() {
      isDraggingSig = false;
    }

    canvas.addEventListener('mousedown', startDrag);
    window.addEventListener('mousemove', moveDrag);
    window.addEventListener('mouseup', endDrag);

    canvas.addEventListener('touchstart', startDrag, { passive: false });
    window.addEventListener('touchmove', moveDrag, { passive: false });
    window.addEventListener('touchend', endDrag);
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

  removeFileBtn.addEventListener('click', function () {
    currentFile = null;
    if (dropzone) dropzone.style.display = 'block';
    fileInfo.style.display = 'none';
    actions.style.display = 'none';
    sigPreviewWrap.innerHTML = '';
  });

  signBtn.addEventListener('click', function () {
    if (!currentFile) return;
    var sigCanvas = getSignatureImageCanvas();
    if (!sigCanvas || (currentSigMode === 'draw' && !hasDrawn)) {
      alert('Please draw, type, or upload your signature first.');
      return;
    }

    signBtn.disabled = true;
    progressWrap.style.display = 'block';
    progressBar.style.width = '20%';
    statusText.textContent = 'Applying signature to document...';

    // Convert sig canvas to PNG blob
    sigCanvas.toBlob(function (sigBlob) {
      sigBlob.arrayBuffer().then(function (sigBytes) {
        return currentFile.arrayBuffer().then(function (pdfBytes) {
          return PDFLib.PDFDocument.load(pdfBytes, { ignoreEncryption: true }).then(function (doc) {
            return doc.embedPng(sigBytes).then(function (pngImg) {
              var pages = doc.getPages();
              var targetPage = pages[selectedPageNum - 1] || pages[0];
              var pw = targetPage.getWidth();
              var ph = targetPage.getHeight();

              var scale = parseFloat(sigScale.value) / 100;
              var sigW = Math.round(180 * scale);
              var sigH = Math.round(pngImg.height * (sigW / pngImg.width));

              var cx = pw * sigXPercent;
              var cy = ph * (1 - sigYPercent); // Flip Y for PDF

              var x = cx - sigW / 2;
              var y = cy - sigH / 2;

              targetPage.drawImage(pngImg, {
                x: x,
                y: y,
                width: sigW,
                height: sigH
              });

              if (addDateCheck.checked) {
                return doc.embedFont(PDFLib.StandardFonts.HelveticaBold).then(function (font) {
                  var d = new Date();
                  var dateStr = ('0' + d.getDate()).slice(-2) + '/' + ('0' + (d.getMonth() + 1)).slice(-2) + '/' + d.getFullYear();
                  var text = 'Date: ' + dateStr;
                  var tSize = 9;
                  var tw = font.widthOfTextAtSize(text, tSize);
                  targetPage.drawText(text, {
                    x: cx - tw / 2,
                    y: y - 12,
                    size: tSize,
                    font: font,
                    color: PDFLib.rgb(0.2, 0.2, 0.2)
                  });
                });
              }
            }).then(function () {
              progressBar.style.width = '80%';
              return doc.save();
            });
          });
        });
      }).then(function (finalBytes) {
        var blob = new Blob([finalBytes], { type: 'application/pdf' });
        var url = URL.createObjectURL(blob);
        downloadLink.href = url;
        var outName = currentFile.name.replace(/\.pdf$/i, '') + '-signed.pdf';
        downloadLink.download = outName;
        downloadLink.textContent = 'Download ' + outName;
        resultInfo.textContent = 'Signed on page ' + selectedPageNum + '.';

        progressBar.style.width = '100%';
        progressWrap.style.display = 'none';
        resultBox.style.display = 'block';

        if (window.PdfHandoff && continueBox && continueGrid) {
          PdfHandoff.renderContinueBox(continueGrid, ['protect-pdf', 'compress-pdf', 'watermark-pdf'], function () {
            return { blob: blob, filename: outName };
          });
          continueBox.style.display = 'block';
        }
      }).catch(function (err) {
        console.error(err);
        alert('Error signing PDF: ' + err.message);
        progressWrap.style.display = 'none';
        signBtn.disabled = false;
      });
    }, 'image/png');
  });

  resetBtn.addEventListener('click', function () {
    currentFile = null;
    if (dropzone) dropzone.style.display = 'block';
    fileInfo.style.display = 'none';
    actions.style.display = 'none';
    resultBox.style.display = 'none';
    if (continueBox) continueBox.style.display = 'none';
    signBtn.disabled = false;
    sigPreviewWrap.innerHTML = '';
  });

  if (window.PdfHandoff) {
    PdfHandoff.take().then(function (result) {
      if (result && result.blob) {
        var f = new File([result.blob], result.filename || 'file.pdf', { type: 'application/pdf' });
        loadFile(f);
        PdfHandoff.showBanner('Continuing with ' + (result.filename || 'your file') + ' — add signature below.');
      }
    });
  }
})();
