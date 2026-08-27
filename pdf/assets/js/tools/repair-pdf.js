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
  var repairBtn = document.getElementById('repairBtn');
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

  function formatSize(bytes) {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  }

  function loadFile(file) {
    if (!file) return;
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

  repairBtn.addEventListener('click', function () {
    if (!currentFile) return;
    repairBtn.disabled = true;
    progressWrap.style.display = 'block';
    progressBar.style.width = '20%';
    statusText.textContent = 'Parsing damaged PDF structure...';

    currentFile.arrayBuffer().then(function (buf) {
      // Step 1: Attempt standard PDFLib load with ignoreEncryption & relaxed parser
      return PDFLib.PDFDocument.load(buf, { ignoreEncryption: true, parseSpeed: PDFLib.ParseSpeeds.Fast }).then(function (srcDoc) {
        return PDFLib.PDFDocument.create().then(function (outDoc) {
          var pageCount = srcDoc.getPageCount();
          var indices = [];
          for (var i = 0; i < pageCount; i++) indices.push(i);

          return outDoc.copyPages(srcDoc, indices).then(function (copiedPages) {
            copiedPages.forEach(function (p) { outDoc.addPage(p); });
            progressBar.style.width = '80%';
            return outDoc.save();
          });
        });
      }).catch(function () {
        // Fallback: If PDFLib fails, use PDF.js canvas renderer to recover page-by-page visual stream
        statusText.textContent = 'Reconstructing raster pages...';
        return pdfjsLib.getDocument({ data: buf, stopAtErrors: false }).promise.then(function (pdf) {
          var numPages = pdf.numPages;
          return PDFLib.PDFDocument.create().then(function (outDoc) {
            var chain = Promise.resolve();
            for (var i = 1; i <= numPages; i++) {
              (function (pNum) {
                chain = chain.then(function () {
                  return pdf.getPage(pNum).then(function (page) {
                    var vp = page.getViewport({ scale: 2 });
                    var canvas = document.createElement('canvas');
                    canvas.width = Math.round(vp.width);
                    canvas.height = Math.round(vp.height);
                    var ctx = canvas.getContext('2d');
                    return page.render({ canvasContext: ctx, viewport: vp }).promise.then(function () {
                      return new Promise(function (res) {
                        canvas.toBlob(function (blob) {
                          blob.arrayBuffer().then(function (b) { res(new Uint8Array(b)); });
                        }, 'image/jpeg', 0.9);
                      });
                    }).then(function (jpgBytes) {
                      return outDoc.embedJpg(jpgBytes);
                    }).then(function (pdfImg) {
                      var baseVp = page.getViewport({ scale: 1 });
                      var p = outDoc.addPage([baseVp.width, baseVp.height]);
                      p.drawImage(pdfImg, { x: 0, y: 0, width: baseVp.width, height: baseVp.height });
                    });
                  });
                });
              })(i);
            }
            return chain.then(function () { return outDoc.save(); });
          });
        });
      });
    }).then(function (bytes) {
      var blob = new Blob([bytes], { type: 'application/pdf' });
      var url = URL.createObjectURL(blob);
      downloadLink.href = url;
      var outName = currentFile.name.replace(/\.pdf$/i, '') + '-repaired.pdf';
      downloadLink.download = outName;
      downloadLink.textContent = 'Download ' + outName;
      resultInfo.textContent = 'PDF repaired (' + formatSize(blob.size) + ').';

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
      alert('Could not recover this file. It may be severely corrupted beyond salvage.');
      progressWrap.style.display = 'none';
      repairBtn.disabled = false;
    });
  });

  resetBtn.addEventListener('click', function () {
    currentFile = null;
    if (dropzone) dropzone.style.display = 'block';
    fileInfo.style.display = 'none';
    actions.style.display = 'none';
    resultBox.style.display = 'none';
    if (continueBox) continueBox.style.display = 'none';
    repairBtn.disabled = false;
  });

  if (window.PdfHandoff) {
    PdfHandoff.take().then(function (result) {
      if (result && result.blob) {
        var f = new File([result.blob], result.filename || 'file.pdf', { type: 'application/pdf' });
        loadFile(f);
        PdfHandoff.showBanner('Continuing with ' + (result.filename || 'your file') + ' — repair structure below.');
      }
    });
  }
})();
