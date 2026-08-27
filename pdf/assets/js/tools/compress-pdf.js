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
  var fileSizeEl = document.getElementById('fileSize');
  var removeFileBtn = document.getElementById('removeFile');
  var actions = document.getElementById('actions');
  var compressBtn = document.getElementById('compressBtn');
  var progressWrap = document.getElementById('progressWrap');
  var progressBar = document.getElementById('progressBar');
  var statusText = document.getElementById('statusText');
  var resultBox = document.getElementById('resultBox');
  var resultInfo = document.getElementById('resultInfo');
  var downloadLink = document.getElementById('downloadLink');
  var resetBtn = document.getElementById('resetBtn');
  var continueBox = document.getElementById('continueBox');
  var continueGrid = document.getElementById('continueGrid');
  var targetSizeWrap = document.getElementById('targetSizeWrap');
  var targetSizeInput = document.getElementById('targetSizeInput');

  var currentFile = null;

  var LEVELS = {
    low: { scale: 1.5, quality: 0.85 },
    recommended: { scale: 1.0, quality: 0.7 },
    high: { scale: 0.75, quality: 0.5 }
  };

  function formatSize(bytes) {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  }

  function loadFile(file) {
    if (!file) return;
    if (file.type !== 'application/pdf' && !/\.pdf$/i.test(file.name)) {
      alert('Please select a PDF file.');
      return;
    }
    currentFile = file;
    fileNameEl.textContent = file.name;
    fileSizeEl.textContent = formatSize(file.size);
    if (dropzone) dropzone.style.display = 'none';
    fileInfo.style.display = 'block';
    actions.style.display = 'block';
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
  });

  document.querySelectorAll('input[name=level]').forEach(function (radio) {
    radio.addEventListener('change', function () {
      targetSizeWrap.style.display = (radio.value === 'target' && radio.checked) ? 'block' : targetSizeWrap.style.display;
      if (radio.checked && radio.value !== 'target') targetSizeWrap.style.display = 'none';
    });
  });

  function canvasToJpegBytes(canvas, quality) {
    return new Promise(function (resolve, reject) {
      canvas.toBlob(function (blob) {
        if (!blob) { reject(new Error('Could not encode page as image.')); return; }
        blob.arrayBuffer().then(function (buf) { resolve(new Uint8Array(buf)); });
      }, 'image/jpeg', quality);
    });
  }

  compressBtn.addEventListener('click', function () {
    if (!currentFile) return;
    var levelKey = document.querySelector('input[name=level]:checked').value;

    if (levelKey === 'target') {
      var targetKB = parseFloat(targetSizeInput.value);
      if (!targetKB || targetKB <= 0) {
        alert('Enter a target size in KB (e.g. 200).');
        return;
      }
      compressBtn.disabled = true;
      progressWrap.style.display = 'block';
      progressBar.style.width = '0%';
      statusText.textContent = 'Loading PDF...';
      setTimeout(function () { doCompressToTarget(targetKB * 1024); }, 50);
      return;
    }

    var level = LEVELS[levelKey];
    compressBtn.disabled = true;
    progressWrap.style.display = 'block';
    progressBar.style.width = '0%';
    statusText.textContent = 'Loading PDF...';

    setTimeout(function () { doCompress(level); }, 50);
  });

  function doCompress(level) {
    var originalSize = currentFile.size;
    var outDoc;
    var numPages;

    currentFile.arrayBuffer().then(function (buf) {
      return pdfjsLib.getDocument({ data: buf }).promise;
    }).then(function (pdf) {
      numPages = pdf.numPages;
      return PDFLib.PDFDocument.create().then(function (doc) {
        outDoc = doc;
        var chain = Promise.resolve();
        for (var i = 1; i <= numPages; i++) {
          (function (pageNum) {
            chain = chain.then(function () {
              statusText.textContent = 'Compressing page ' + pageNum + '/' + numPages + '...';
              progressBar.style.width = Math.round(((pageNum - 1) / numPages) * 90) + '%';
              return pdf.getPage(pageNum).then(function (page) {
                var baseViewport = page.getViewport({ scale: 1 });
                var renderViewport = page.getViewport({ scale: level.scale });
                var canvas = document.createElement('canvas');
                canvas.width = Math.max(1, Math.round(renderViewport.width));
                canvas.height = Math.max(1, Math.round(renderViewport.height));
                var ctx = canvas.getContext('2d');
                return page.render({ canvasContext: ctx, viewport: renderViewport }).promise.then(function () {
                  return canvasToJpegBytes(canvas, level.quality);
                }).then(function (jpgBytes) {
                  return outDoc.embedJpg(jpgBytes);
                }).then(function (jpgImage) {
                  var pdfPage = outDoc.addPage([baseViewport.width, baseViewport.height]);
                  pdfPage.drawImage(jpgImage, { x: 0, y: 0, width: baseViewport.width, height: baseViewport.height });
                });
              });
            });
          })(i);
        }
        return chain;
      });
    }).then(function () {
      statusText.textContent = 'Finalizing...';
      progressBar.style.width = '95%';
      return outDoc.save();
    }).then(function (bytes) {
      var blob = new Blob([bytes], { type: 'application/pdf' });
      var url = URL.createObjectURL(blob);
      downloadLink.href = url;
      var pct = originalSize > 0 ? Math.round((1 - blob.size / originalSize) * 100) : 0;
      var pctText = pct > 0 ? (pct + '% smaller') : (pct < 0 ? 'larger than original (already well optimized)' : 'about the same size');
      resultInfo.textContent = formatSize(originalSize) + ' → ' + formatSize(blob.size) + ' (' + pctText + ')';
      progressBar.style.width = '100%';
      progressWrap.style.display = 'none';
      resultBox.style.display = 'block';
      if (window.PdfHandoff && continueBox && continueGrid) {
        PdfHandoff.renderContinueBox(continueGrid, ['merge-pdf', 'split-pdf', 'pdf-to-jpg'], function () {
          return { blob: blob, filename: 'compressed.pdf' };
        });
        continueBox.style.display = 'block';
      }
    }).catch(function (err) {
      console.error(err);
      statusText.textContent = 'Something went wrong: ' + err.message;
      compressBtn.disabled = false;
    });
  }

  // Renders every page to a canvas once, so a target-size search can try
  // many JPEG quality levels afterwards without re-rendering via pdf.js each time.
  function renderAllPages(scale) {
    return currentFile.arrayBuffer().then(function (buf) {
      return pdfjsLib.getDocument({ data: buf }).promise;
    }).then(function (pdf) {
      var numPages = pdf.numPages;
      var renders = [];
      var chain = Promise.resolve();
      var _loop = function (pageNum) {
        chain = chain.then(function () {
          statusText.textContent = 'Rendering page ' + pageNum + '/' + numPages + '...';
          progressBar.style.width = Math.round(((pageNum - 1) / numPages) * 35) + '%';
          return pdf.getPage(pageNum).then(function (page) {
            var baseViewport = page.getViewport({ scale: 1 });
            var renderViewport = page.getViewport({ scale: scale });
            var canvas = document.createElement('canvas');
            canvas.width = Math.max(1, Math.round(renderViewport.width));
            canvas.height = Math.max(1, Math.round(renderViewport.height));
            var ctx = canvas.getContext('2d');
            return page.render({ canvasContext: ctx, viewport: renderViewport }).promise.then(function () {
              renders[pageNum - 1] = { canvas: canvas, baseViewport: baseViewport };
            });
          });
        });
      };
      for (var i = 1; i <= numPages; i++) _loop(i);
      return chain.then(function () { return renders; });
    });
  }

  function buildPdfFromRenders(renders, quality) {
    return PDFLib.PDFDocument.create().then(function (outDoc) {
      var chain = Promise.resolve();
      renders.forEach(function (r) {
        chain = chain.then(function () {
          return canvasToJpegBytes(r.canvas, quality).then(function (jpgBytes) {
            return outDoc.embedJpg(jpgBytes);
          }).then(function (jpgImage) {
            var pdfPage = outDoc.addPage([r.baseViewport.width, r.baseViewport.height]);
            pdfPage.drawImage(jpgImage, { x: 0, y: 0, width: r.baseViewport.width, height: r.baseViewport.height });
          });
        });
      });
      return chain.then(function () { return outDoc.save(); });
    });
  }

  function doCompressToTarget(targetBytes) {
    var originalSize = currentFile.size;
    var TRIAL_SCALE = 1.0;
    var ATTEMPTS = 7;

    renderAllPages(TRIAL_SCALE).then(function (renders) {
      var lo = 0.05, hi = 0.92;
      var bestBytes = null;
      var iter = 0;

      function tryQuality(q) {
        statusText.textContent = 'Trying quality ' + Math.round(q * 100) + '% (attempt ' + (iter + 1) + '/' + ATTEMPTS + ')...';
        progressBar.style.width = Math.round(35 + (iter / ATTEMPTS) * 60) + '%';
        return buildPdfFromRenders(renders, q);
      }

      function search() {
        if (iter >= ATTEMPTS) return Promise.resolve();
        var mid = (lo + hi) / 2;
        return tryQuality(mid).then(function (bytes) {
          iter++;
          if (bytes.length > targetBytes) {
            hi = mid;
          } else {
            lo = mid;
            bestBytes = bytes;
          }
          return search();
        });
      }

      return search().then(function () {
        return bestBytes || tryQuality(lo);
      });
    }).then(function (bytes) {
      var blob = new Blob([bytes], { type: 'application/pdf' });
      var url = URL.createObjectURL(blob);
      downloadLink.href = url;
      var note = blob.size <= targetBytes
        ? 'hit your target'
        : "couldn't reach the target while keeping pages readable — this is the smallest we could manage";
      resultInfo.textContent = formatSize(originalSize) + ' → ' + formatSize(blob.size) + ' (' + note + ')';
      progressBar.style.width = '100%';
      progressWrap.style.display = 'none';
      resultBox.style.display = 'block';
      if (window.PdfHandoff && continueBox && continueGrid) {
        PdfHandoff.renderContinueBox(continueGrid, ['merge-pdf', 'split-pdf', 'pdf-to-jpg'], function () {
          return { blob: blob, filename: 'compressed.pdf' };
        });
        continueBox.style.display = 'block';
      }
    }).catch(function (err) {
      console.error(err);
      statusText.textContent = 'Something went wrong: ' + err.message;
      compressBtn.disabled = false;
    });
  }

  resetBtn.addEventListener('click', function () {
    currentFile = null;
    if (dropzone) dropzone.style.display = 'block';
    fileInfo.style.display = 'none';
    actions.style.display = 'none';
    resultBox.style.display = 'none';
    if (continueBox) continueBox.style.display = 'none';
    compressBtn.disabled = false;
    targetSizeInput.value = '';
    targetSizeWrap.style.display = 'none';
    document.querySelector('input[name=level][value=recommended]').checked = true;
  });

  if (window.PdfHandoff) {
    PdfHandoff.take().then(function (result) {
      if (result && result.blob) {
        var f = new File([result.blob], result.filename || 'file.pdf', { type: 'application/pdf' });
        loadFile(f);
        PdfHandoff.showBanner('Continuing with ' + (result.filename || 'your file') + ' — pick a compression level below.');
      }
    });
  }
})();
