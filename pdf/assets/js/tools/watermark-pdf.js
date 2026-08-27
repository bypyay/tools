(function () {
  if (window.pdfjsLib) {
    var pdfScriptTag = document.querySelector('script[src*="vendor/pdf.min.js"]');
    var siteRoot = pdfScriptTag ? pdfScriptTag.getAttribute('src').replace(/vendor\/pdf\.min\.js.*$/, '') : '';
    pdfjsLib.GlobalWorkerOptions.workerSrc = siteRoot + 'vendor/pdf.worker.min.js';
  }

  // DOM Elements
  var dropzone = document.getElementById('dropzone');
  var fileInput = document.getElementById('fileInput');
  var fileInfo = document.getElementById('fileInfo');
  var fileNameEl = document.getElementById('fileName');
  var pageCountEl = document.getElementById('pageCount');
  var removeFileBtn = document.getElementById('removeFile');
  var previewWrap = document.getElementById('previewWrap');
  var actions = document.getElementById('actions');
  var applyBtn = document.getElementById('applyBtn');
  var progressWrap = document.getElementById('progressWrap');
  var progressBar = document.getElementById('progressBar');
  var statusText = document.getElementById('statusText');
  var resultBox = document.getElementById('resultBox');
  var resultInfo = document.getElementById('resultInfo');
  var downloadLink = document.getElementById('downloadLink');
  var resetBtn = document.getElementById('resetBtn');
  var continueBox = document.getElementById('continueBox');
  var continueGrid = document.getElementById('continueGrid');

  // Mode Tabs
  var tabTextBtn = document.getElementById('tabTextBtn');
  var tabImgBtn = document.getElementById('tabImgBtn');
  var textOptions = document.getElementById('textOptions');
  var imgOptions = document.getElementById('imgOptions');

  // Text Inputs
  var wmText = document.getElementById('wmText');
  var wmSize = document.getElementById('wmSize');
  var wmSizeVal = document.getElementById('wmSizeVal');
  var wmColor = document.getElementById('wmColor');

  // Image Inputs
  var imgDropzone = document.getElementById('imgDropzone');
  var imgInput = document.getElementById('imgInput');
  var imgUploadedInfo = document.getElementById('imgUploadedInfo');
  var imgThumb = document.getElementById('imgThumb');
  var imgName = document.getElementById('imgName');
  var removeImgBtn = document.getElementById('removeImgBtn');
  var imgScale = document.getElementById('imgScale');
  var imgScaleVal = document.getElementById('imgScaleVal');

  // Shared Inputs
  var wmOpacity = document.getElementById('wmOpacity');
  var wmOpacityVal = document.getElementById('wmOpacityVal');
  var wmRotation = document.getElementById('wmRotation');
  var wmRotationVal = document.getElementById('wmRotationVal');
  var tileWatermark = document.getElementById('tileWatermark');

  // State
  var currentFile = null;
  var pageCount = 0;
  var baseCanvas = null;
  var previewCanvas = null;
  var previewScale = 1;

  var currentMode = 'text'; // 'text' | 'image'
  var posXPercent = 0.5; // 0.0 to 1.0 (relative to page)
  var posYPercent = 0.5; // 0.0 to 1.0 (relative to page)

  var loadedImg = null;
  var loadedImgBytes = null;
  var loadedImgType = 'png'; // 'png' | 'jpg'

  // Dragging & Interaction on Canvas
  var isDragging = false;
  var isResizing = false;
  var dragStartX = 0;
  var dragStartY = 0;
  var initialPosXPct = 0.5;
  var initialPosYPct = 0.5;
  var initialSize = 48;
  var initialScale = 50;

  var currentBounds = { x: 0, y: 0, w: 0, h: 0, handleX: 0, handleY: 0 };

  function hexToRgb(hex) {
    var m = hex.replace('#', '');
    var r = parseInt(m.substring(0, 2), 16);
    var g = parseInt(m.substring(2, 4), 16);
    var b = parseInt(m.substring(4, 6), 16);
    return { r: r, g: g, b: b };
  }

  // Tab Switching
  tabTextBtn.addEventListener('click', function () {
    currentMode = 'text';
    tabTextBtn.style.background = 'var(--red)';
    tabTextBtn.style.color = '#fff';
    tabTextBtn.style.border = 'none';

    tabImgBtn.style.background = 'var(--bg-soft)';
    tabImgBtn.style.color = 'var(--ink)';
    tabImgBtn.style.border = '1px solid var(--border)';

    textOptions.style.display = 'block';
    imgOptions.style.display = 'none';
    redrawPreview();
  });

  tabImgBtn.addEventListener('click', function () {
    currentMode = 'image';
    tabImgBtn.style.background = 'var(--red)';
    tabImgBtn.style.color = '#fff';
    tabImgBtn.style.border = 'none';

    tabTextBtn.style.background = 'var(--bg-soft)';
    tabTextBtn.style.color = 'var(--ink)';
    tabTextBtn.style.border = '1px solid var(--border)';

    imgOptions.style.display = 'block';
    textOptions.style.display = 'none';
    redrawPreview();
  });

  // Text preset chips
  document.querySelectorAll('.preset-chip').forEach(function (chip) {
    chip.addEventListener('click', function () {
      wmText.value = chip.getAttribute('data-text');
      redrawPreview();
    });
  });

  // Angle preset buttons
  document.querySelectorAll('.angle-btn').forEach(function (btn) {
    btn.addEventListener('click', function () {
      document.querySelectorAll('.angle-btn').forEach(function (b) { b.classList.remove('active'); });
      btn.classList.add('active');
      var angle = parseInt(btn.getAttribute('data-angle'), 10);
      wmRotation.value = angle;
      wmRotationVal.innerHTML = angle + '&deg;';
      redrawPreview();
    });
  });

  // Position quick-align buttons
  document.querySelectorAll('.pos-btn').forEach(function (btn) {
    btn.addEventListener('click', function () {
      document.querySelectorAll('.pos-btn').forEach(function (b) { b.classList.remove('active'); });
      btn.classList.add('active');
      var pos = btn.getAttribute('data-pos');
      if (pos === 'tl') { posXPercent = 0.2; posYPercent = 0.2; }
      else if (pos === 'tc') { posXPercent = 0.5; posYPercent = 0.2; }
      else if (pos === 'tr') { posXPercent = 0.8; posYPercent = 0.2; }
      else if (pos === 'ml') { posXPercent = 0.2; posYPercent = 0.5; }
      else if (pos === 'mc') { posXPercent = 0.5; posYPercent = 0.5; }
      else if (pos === 'mr') { posXPercent = 0.8; posYPercent = 0.5; }
      else if (pos === 'bl') { posXPercent = 0.2; posYPercent = 0.8; }
      else if (pos === 'bc') { posXPercent = 0.5; posYPercent = 0.8; }
      else if (pos === 'br') { posXPercent = 0.8; posYPercent = 0.8; }
      redrawPreview();
    });
  });

  // Image Upload Handling
  imgDropzone.addEventListener('click', function () { imgInput.click(); });
  imgInput.addEventListener('change', function (e) {
    if (e.target.files && e.target.files[0]) {
      loadImageFile(e.target.files[0]);
    }
  });

  function loadImageFile(file) {
    var isPng = /\.png$/i.test(file.name);
    loadedImgType = isPng ? 'png' : 'jpg';
    var reader = new FileReader();
    reader.onload = function (evt) {
      var img = new Image();
      img.onload = function () {
        loadedImg = img;
        imgThumb.src = evt.target.result;
        imgName.textContent = file.name;
        imgDropzone.style.display = 'none';
        imgUploadedInfo.style.display = 'flex';
        redrawPreview();
      };
      img.src = evt.target.result;
    };
    reader.readAsDataURL(file);

    file.arrayBuffer().then(function (buf) {
      loadedImgBytes = new Uint8Array(buf);
    });
  }

  removeImgBtn.addEventListener('click', function () {
    loadedImg = null;
    loadedImgBytes = null;
    imgInput.value = '';
    imgDropzone.style.display = 'block';
    imgUploadedInfo.style.display = 'none';
    redrawPreview();
  });

  // Load Main PDF File
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
      alert('Could not read this PDF. It may be corrupted or password-protected.');
      currentFile = null;
    });
  }

  function renderPreviewBase(pdf) {
    return pdf.getPage(1).then(function (page) {
      var targetWidth = 340;
      var unscaled = page.getViewport({ scale: 1 });
      previewScale = targetWidth / unscaled.width;
      var viewport = page.getViewport({ scale: previewScale });

      baseCanvas = document.createElement('canvas');
      baseCanvas.width = Math.round(viewport.width);
      baseCanvas.height = Math.round(viewport.height);
      var ctx = baseCanvas.getContext('2d');

      return page.render({ canvasContext: ctx, viewport: viewport }).promise.then(function () {
        previewWrap.innerHTML = '';
        previewCanvas = document.createElement('canvas');
        previewCanvas.width = baseCanvas.width;
        previewCanvas.height = baseCanvas.height;
        previewCanvas.style.display = 'block';
        previewCanvas.style.cursor = 'move';
        previewWrap.appendChild(previewCanvas);

        setupInteractiveEvents(previewCanvas);
        redrawPreview();
      });
    });
  }

  function redrawPreview() {
    if (!baseCanvas || !previewCanvas) return;
    var ctx = previewCanvas.getContext('2d');
    ctx.clearRect(0, 0, previewCanvas.width, previewCanvas.height);
    ctx.drawImage(baseCanvas, 0, 0);

    var opacity = parseFloat(wmOpacity.value) / 100;
    var rotation = parseFloat(wmRotation.value);
    var isTile = tileWatermark.checked;

    var cw = previewCanvas.width;
    var ch = previewCanvas.height;

    var targetCenterX = cw * posXPercent;
    var targetCenterY = ch * posYPercent;

    if (currentMode === 'text') {
      var text = wmText.value || '';
      if (!text) return;

      var fontSize = parseFloat(wmSize.value) * previewScale;
      var rgb = hexToRgb(wmColor.value);

      ctx.font = 'bold ' + fontSize + 'px "Plus Jakarta Sans", Helvetica, Arial, sans-serif';
      var textMetrics = ctx.measureText(text);
      var textWidth = textMetrics.width;
      var textHeight = fontSize;

      currentBounds = {
        x: targetCenterX - textWidth / 2 - 10,
        y: targetCenterY - textHeight / 2 - 6,
        w: textWidth + 20,
        h: textHeight + 12,
        handleX: targetCenterX + textWidth / 2 + 10,
        handleY: targetCenterY + textHeight / 2 + 6
      };

      if (isTile) {
        // Tile repeat across canvas
        ctx.save();
        ctx.fillStyle = 'rgba(' + rgb.r + ',' + rgb.g + ',' + rgb.b + ',' + opacity + ')';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        var stepX = Math.max(textWidth + 60, 120);
        var stepY = Math.max(textHeight + 60, 90);

        for (var x = stepX / 2; x < cw + stepX; x += stepX) {
          for (var y = stepY / 2; y < ch + stepY; y += stepY) {
            ctx.save();
            ctx.translate(x, y);
            ctx.rotate(-rotation * Math.PI / 180);
            ctx.fillText(text, 0, 0);
            ctx.restore();
          }
        }
        ctx.restore();
      } else {
        // Single positioned text
        ctx.save();
        ctx.translate(targetCenterX, targetCenterY);
        ctx.rotate(-rotation * Math.PI / 180);

        ctx.fillStyle = 'rgba(' + rgb.r + ',' + rgb.g + ',' + rgb.b + ',' + opacity + ')';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(text, 0, 0);

        // Draw interactive dashed bounding box & resize handle
        ctx.strokeStyle = 'rgba(229, 50, 45, 0.6)';
        ctx.lineWidth = 1.5;
        ctx.setLineDash([4, 4]);
        ctx.strokeRect(-textWidth / 2 - 8, -textHeight / 2 - 4, textWidth + 16, textHeight + 8);

        // Corner Resize Handle
        ctx.setLineDash([]);
        ctx.fillStyle = '#e5322d';
        ctx.beginPath();
        ctx.arc(textWidth / 2 + 8, textHeight / 2 + 4, 5, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
      }
    } else if (currentMode === 'image') {
      if (!loadedImg) {
        // Draw placeholder icon on preview
        ctx.save();
        ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
        ctx.font = '13px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('(Upload an image logo above to preview)', targetCenterX, targetCenterY);
        ctx.restore();
        return;
      }

      var scalePct = parseFloat(imgScale.value) / 100;
      var imgW = (loadedImg.width * previewScale * scalePct * 0.4);
      var imgH = (loadedImg.height * previewScale * scalePct * 0.4);

      currentBounds = {
        x: targetCenterX - imgW / 2 - 6,
        y: targetCenterY - imgH / 2 - 6,
        w: imgW + 12,
        h: imgH + 12,
        handleX: targetCenterX + imgW / 2 + 6,
        handleY: targetCenterY + imgH / 2 + 6
      };

      if (isTile) {
        var stepX = Math.max(imgW + 50, 100);
        var stepY = Math.max(imgH + 50, 90);

        for (var x = stepX / 2; x < cw + stepX; x += stepX) {
          for (var y = stepY / 2; y < ch + stepY; y += stepY) {
            ctx.save();
            ctx.translate(x, y);
            ctx.rotate(-rotation * Math.PI / 180);
            ctx.globalAlpha = opacity;
            ctx.drawImage(loadedImg, -imgW / 2, -imgH / 2, imgW, imgH);
            ctx.restore();
          }
        }
      } else {
        ctx.save();
        ctx.translate(targetCenterX, targetCenterY);
        ctx.rotate(-rotation * Math.PI / 180);
        ctx.globalAlpha = opacity;
        ctx.drawImage(loadedImg, -imgW / 2, -imgH / 2, imgW, imgH);

        // Bounding Box
        ctx.globalAlpha = 1;
        ctx.strokeStyle = 'rgba(229, 50, 45, 0.6)';
        ctx.lineWidth = 1.5;
        ctx.setLineDash([4, 4]);
        ctx.strokeRect(-imgW / 2 - 4, -imgH / 2 - 4, imgW + 8, imgH + 8);

        // Resize Handle
        ctx.setLineDash([]);
        ctx.fillStyle = '#e5322d';
        ctx.beginPath();
        ctx.arc(imgW / 2 + 4, imgH / 2 + 4, 5, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
      }
    }
  }

  // Interactive Drag & Resize Handling
  function setupInteractiveEvents(canvas) {
    function getCanvasCoords(e) {
      var rect = canvas.getBoundingClientRect();
      var clientX = e.touches ? e.touches[0].clientX : e.clientX;
      var clientY = e.touches ? e.touches[0].clientY : e.clientY;
      return {
        x: (clientX - rect.left) * (canvas.width / rect.width),
        y: (clientY - rect.top) * (canvas.height / rect.height)
      };
    }

    function isNearHandle(coords) {
      var cx = canvas.width * posXPercent;
      var cy = canvas.height * posYPercent;
      var dist = Math.hypot(coords.x - currentBounds.handleX, coords.y - currentBounds.handleY);
      return dist <= 16;
    }

    function isInsideWatermark(coords) {
      var b = currentBounds;
      return coords.x >= b.x && coords.x <= b.x + b.w && coords.y >= b.y && coords.y <= b.y + b.h;
    }

    function startAction(e) {
      var coords = getCanvasCoords(e);

      if (isNearHandle(coords)) {
        isResizing = true;
        dragStartX = coords.x;
        dragStartY = coords.y;
        initialSize = parseFloat(wmSize.value);
        initialScale = parseFloat(imgScale.value);
        e.preventDefault();
      } else {
        isDragging = true;
        dragStartX = coords.x;
        dragStartY = coords.y;
        initialPosXPct = posXPercent;
        initialPosYPct = posYPercent;
        e.preventDefault();
      }
    }

    function moveAction(e) {
      var coords = getCanvasCoords(e);

      if (isResizing) {
        var deltaX = coords.x - dragStartX;
        if (currentMode === 'text') {
          var newSize = Math.max(12, Math.min(150, Math.round(initialSize + deltaX / previewScale)));
          wmSize.value = newSize;
          wmSizeVal.textContent = newSize;
        } else if (currentMode === 'image') {
          var newScale = Math.max(10, Math.min(200, Math.round(initialScale + deltaX)));
          imgScale.value = newScale;
          imgScaleVal.textContent = newScale;
        }
        redrawPreview();
        e.preventDefault();
      } else if (isDragging) {
        var dx = (coords.x - dragStartX) / canvas.width;
        var dy = (coords.y - dragStartY) / canvas.height;
        posXPercent = Math.max(0.05, Math.min(0.95, initialPosXPct + dx));
        posYPercent = Math.max(0.05, Math.min(0.95, initialPosYPct + dy));
        redrawPreview();
        e.preventDefault();
      } else {
        // Update Cursor on Hover
        if (isNearHandle(coords)) {
          canvas.style.cursor = 'nwse-resize';
        } else if (isInsideWatermark(coords)) {
          canvas.style.cursor = 'grab';
        } else {
          canvas.style.cursor = 'crosshair';
        }
      }
    }

    function endAction() {
      isDragging = false;
      isResizing = false;
    }

    canvas.addEventListener('mousedown', startAction);
    window.addEventListener('mousemove', moveAction);
    window.addEventListener('mouseup', endAction);

    canvas.addEventListener('touchstart', startAction, { passive: false });
    window.addEventListener('touchmove', moveAction, { passive: false });
    window.addEventListener('touchend', endAction);
  }

  // Input Listeners
  [wmText, wmColor].forEach(function (el) { el.addEventListener('input', redrawPreview); });
  wmSize.addEventListener('input', function () { wmSizeVal.textContent = wmSize.value; redrawPreview(); });
  wmOpacity.addEventListener('input', function () { wmOpacityVal.textContent = wmOpacity.value + '%'; redrawPreview(); });
  wmRotation.addEventListener('input', function () { wmRotationVal.innerHTML = wmRotation.value + '&deg;'; redrawPreview(); });
  imgScale.addEventListener('input', function () { imgScaleVal.textContent = imgScale.value; redrawPreview(); });
  tileWatermark.addEventListener('change', redrawPreview);

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
    pageCount = 0;
    if (dropzone) dropzone.style.display = 'block';
    fileInfo.style.display = 'none';
    actions.style.display = 'none';
    previewWrap.innerHTML = '';
  });

  // Apply Watermark
  applyBtn.addEventListener('click', function () {
    if (!currentFile) return;
    if (currentMode === 'text' && !wmText.value.trim()) { alert('Please enter watermark text.'); return; }
    if (currentMode === 'image' && !loadedImgBytes) { alert('Please upload an image logo first.'); return; }

    applyBtn.disabled = true;
    progressWrap.style.display = 'block';
    progressBar.style.width = '10%';
    statusText.textContent = 'Adding watermark to PDF...';
    setTimeout(doWatermark, 50);
  });

  function doWatermark() {
    var opacity = parseFloat(wmOpacity.value) / 100;
    var rotationDeg = parseFloat(wmRotation.value);
    var isTile = tileWatermark.checked;

    currentFile.arrayBuffer().then(function (buf) {
      return PDFLib.PDFDocument.load(buf, { ignoreEncryption: true });
    }).then(function (doc) {
      if (currentMode === 'text') {
        var text = wmText.value;
        var size = parseFloat(wmSize.value);
        var rgbHex = hexToRgb(wmColor.value);

        return doc.embedFont(PDFLib.StandardFonts.HelveticaBold).then(function (font) {
          var pages = doc.getPages();
          var textWidth = font.widthOfTextAtSize(text, size);
          var halfW = textWidth / 2;
          var halfH = size / 2;
          var theta = rotationDeg * Math.PI / 180;

          pages.forEach(function (page, index) {
            progressBar.style.width = Math.round(((index + 1) / pages.length) * 90) + '%';
            var pw = page.getWidth();
            var ph = page.getHeight();

            if (isTile) {
              var stepX = Math.max(textWidth + 80, 160);
              var stepY = Math.max(size + 80, 120);

              for (var tx = stepX / 2; tx < pw + stepX; tx += stepX) {
                for (var ty = stepY / 2; ty < ph + stepY; ty += stepY) {
                  var x = tx - (halfW * Math.cos(theta) - halfH * Math.sin(theta));
                  var y = ty - (halfW * Math.sin(theta) + halfH * Math.cos(theta));
                  page.drawText(text, {
                    x: x,
                    y: y,
                    size: size,
                    font: font,
                    color: PDFLib.rgb(rgbHex.r / 255, rgbHex.g / 255, rgbHex.b / 255),
                    opacity: opacity,
                    rotate: PDFLib.degrees(rotationDeg)
                  });
                }
              }
            } else {
              var cx = pw * posXPercent;
              var cy = ph * (1 - posYPercent); // Flip Y for PDF coordinate system (origin bottom-left)
              var x = cx - (halfW * Math.cos(theta) - halfH * Math.sin(theta));
              var y = cy - (halfW * Math.sin(theta) + halfH * Math.cos(theta));

              page.drawText(text, {
                x: x,
                y: y,
                size: size,
                font: font,
                color: PDFLib.rgb(rgbHex.r / 255, rgbHex.g / 255, rgbHex.b / 255),
                opacity: opacity,
                rotate: PDFLib.degrees(rotationDeg)
              });
            }
          });
          return doc.save();
        });
      } else if (currentMode === 'image') {
        var embedPromise = (loadedImgType === 'png') ? doc.embedPng(loadedImgBytes) : doc.embedJpg(loadedImgBytes);

        return embedPromise.then(function (pdfImg) {
          var pages = doc.getPages();
          var scalePct = parseFloat(imgScale.value) / 100;
          var imgW = pdfImg.width * scalePct * 0.5;
          var imgH = pdfImg.height * scalePct * 0.5;

          var halfW = imgW / 2;
          var halfH = imgH / 2;
          var theta = rotationDeg * Math.PI / 180;

          pages.forEach(function (page, index) {
            progressBar.style.width = Math.round(((index + 1) / pages.length) * 90) + '%';
            var pw = page.getWidth();
            var ph = page.getHeight();

            if (isTile) {
              var stepX = Math.max(imgW + 80, 160);
              var stepY = Math.max(imgH + 80, 140);

              for (var tx = stepX / 2; tx < pw + stepX; tx += stepX) {
                for (var ty = stepY / 2; ty < ph + stepY; ty += stepY) {
                  var x = tx - (halfW * Math.cos(theta) - halfH * Math.sin(theta));
                  var y = ty - (halfW * Math.sin(theta) + halfH * Math.cos(theta));
                  page.drawImage(pdfImg, {
                    x: x,
                    y: y,
                    width: imgW,
                    height: imgH,
                    opacity: opacity,
                    rotate: PDFLib.degrees(rotationDeg)
                  });
                }
              }
            } else {
              var cx = pw * posXPercent;
              var cy = ph * (1 - posYPercent);
              var x = cx - (halfW * Math.cos(theta) - halfH * Math.sin(theta));
              var y = cy - (halfW * Math.sin(theta) + halfH * Math.cos(theta));

              page.drawImage(pdfImg, {
                x: x,
                y: y,
                width: imgW,
                height: imgH,
                opacity: opacity,
                rotate: PDFLib.degrees(rotationDeg)
              });
            }
          });
          return doc.save();
        });
      }
    }).then(function (bytes) {
      var blob = new Blob([bytes], { type: 'application/pdf' });
      var url = URL.createObjectURL(blob);
      downloadLink.href = url;
      resultInfo.textContent = pageCount + ' page' + (pageCount === 1 ? '' : 's') + ' watermarked.';
      progressBar.style.width = '100%';
      progressWrap.style.display = 'none';
      resultBox.style.display = 'block';

      if (window.PdfHandoff && continueBox && continueGrid) {
        PdfHandoff.renderContinueBox(continueGrid, ['merge-pdf', 'split-pdf', 'compress-pdf', 'pdf-to-jpg'], function () {
          return { blob: blob, filename: 'watermarked.pdf' };
        });
        continueBox.style.display = 'block';
      }
    }).catch(function (err) {
      console.error(err);
      alert('Something went wrong: ' + err.message);
      progressWrap.style.display = 'none';
      applyBtn.disabled = false;
    });
  }

  resetBtn.addEventListener('click', function () {
    currentFile = null;
    pageCount = 0;
    if (dropzone) dropzone.style.display = 'block';
    fileInfo.style.display = 'none';
    actions.style.display = 'none';
    resultBox.style.display = 'none';
    if (continueBox) continueBox.style.display = 'none';
    applyBtn.disabled = false;
    previewWrap.innerHTML = '';
  });

  if (window.PdfHandoff) {
    PdfHandoff.take().then(function (result) {
      if (result && result.blob) {
        var f = new File([result.blob], result.filename || 'file.pdf', { type: 'application/pdf' });
        loadFile(f);
        PdfHandoff.showBanner('Continuing with ' + (result.filename || 'your file') + ' — set your watermark below.');
      }
    });
  }
})();
