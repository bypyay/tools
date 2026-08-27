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
  var convertBtn = document.getElementById('convertBtn');
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

  convertBtn.addEventListener('click', function () {
    if (!currentFile) return;
    convertBtn.disabled = true;
    progressWrap.style.display = 'block';
    progressBar.style.width = '0%';
    statusText.textContent = 'Processing pages...';

    var isContrast = document.querySelector('input[name=grayMode]:checked').value === 'contrast';

    currentFile.arrayBuffer().then(function (buf) {
      return pdfjsLib.getDocument({ data: buf }).promise;
    }).then(function (pdf) {
      var numPages = pdf.numPages;
      return PDFLib.PDFDocument.create().then(function (outDoc) {
        var chain = Promise.resolve();

        for (var i = 1; i <= numPages; i++) {
          (function (pNum) {
            chain = chain.then(function () {
              statusText.textContent = 'Converting page ' + pNum + ' of ' + numPages + '...';
              progressBar.style.width = Math.round(((pNum - 1) / numPages) * 85) + '%';

              return pdf.getPage(pNum).then(function (page) {
                var baseVp = page.getViewport({ scale: 1 });
                var vp = page.getViewport({ scale: 2 });

                var canvas = document.createElement('canvas');
                canvas.width = Math.round(vp.width);
                canvas.height = Math.round(vp.height);
                var ctx = canvas.getContext('2d');

                return page.render({ canvasContext: ctx, viewport: vp }).promise.then(function () {
                  // Pixel grayscale conversion
                  var imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                  var data = imgData.data;
                  for (var px = 0; px < data.length; px += 4) {
                    var r = data[px];
                    var g = data[px + 1];
                    var b = data[px + 2];
                    var gray = 0.299 * r + 0.587 * g + 0.114 * b;

                    if (isContrast) {
                      // Boost contrast
                      gray = gray < 160 ? gray * 0.75 : Math.min(255, gray * 1.15);
                    }

                    data[px] = gray;
                    data[px + 1] = gray;
                    data[px + 2] = gray;
                  }
                  ctx.putImageData(imgData, 0, 0);

                  return new Promise(function (resolve) {
                    canvas.toBlob(function (blob) {
                      blob.arrayBuffer().then(function (b) {
                        resolve(new Uint8Array(b));
                      });
                    }, 'image/jpeg', 0.88);
                  });
                }).then(function (jpgBytes) {
                  return outDoc.embedJpg(jpgBytes);
                }).then(function (pdfImg) {
                  var p = outDoc.addPage([baseVp.width, baseVp.height]);
                  p.drawImage(pdfImg, {
                    x: 0,
                    y: 0,
                    width: baseVp.width,
                    height: baseVp.height
                  });
                });
              });
            });
          })(i);
        }

        return chain.then(function () {
          progressBar.style.width = '90%';
          return outDoc.save();
        });
      });
    }).then(function (bytes) {
      var blob = new Blob([bytes], { type: 'application/pdf' });
      var url = URL.createObjectURL(blob);
      downloadLink.href = url;
      var outName = currentFile.name.replace(/\.pdf$/i, '') + '-grayscale.pdf';
      downloadLink.download = outName;
      downloadLink.textContent = 'Download ' + outName;
      resultInfo.textContent = 'PDF converted to grayscale (' + formatSize(blob.size) + ').';

      progressBar.style.width = '100%';
      progressWrap.style.display = 'none';
      resultBox.style.display = 'block';

      if (window.PdfHandoff && continueBox && continueGrid) {
        PdfHandoff.renderContinueBox(continueGrid, ['compress-pdf', 'protect-pdf', 'watermark-pdf'], function () {
          return { blob: blob, filename: outName };
        });
        continueBox.style.display = 'block';
      }
    }).catch(function (err) {
      console.error(err);
      alert('Error converting PDF: ' + err.message);
      progressWrap.style.display = 'none';
      convertBtn.disabled = false;
    });
  });

  resetBtn.addEventListener('click', function () {
    currentFile = null;
    if (dropzone) dropzone.style.display = 'block';
    fileInfo.style.display = 'none';
    actions.style.display = 'none';
    resultBox.style.display = 'none';
    if (continueBox) continueBox.style.display = 'none';
    convertBtn.disabled = false;
  });

  if (window.PdfHandoff) {
    PdfHandoff.take().then(function (result) {
      if (result && result.blob) {
        var f = new File([result.blob], result.filename || 'file.pdf', { type: 'application/pdf' });
        loadFile(f);
        PdfHandoff.showBanner('Continuing with ' + (result.filename || 'your file') + ' — convert to grayscale.');
      }
    });
  }
})();
