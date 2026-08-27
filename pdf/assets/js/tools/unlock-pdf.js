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
  var passwordWrap = document.getElementById('passwordWrap');
  var pwInput = document.getElementById('pwInput');
  var pwError = document.getElementById('pwError');
  var actions = document.getElementById('actions');
  var unlockBtn = document.getElementById('unlockBtn');
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
  var needsPassword = false;

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
    passwordWrap.style.display = 'none';
    pwError.style.display = 'none';
    actions.style.display = 'none';

    file.arrayBuffer().then(function (buf) {
      return pdfjsLib.getDocument({ data: buf }).promise;
    }).then(function () {
      needsPassword = false;
      actions.style.display = 'block';
    }).catch(function (err) {
      if (err && err.name === 'PasswordException') {
        needsPassword = true;
        passwordWrap.style.display = 'block';
        actions.style.display = 'block';
      } else {
        console.error(err);
        alert('Could not read this PDF. It may be corrupted.');
        currentFile = null;
      }
    });
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
    passwordWrap.style.display = 'none';
  });

  unlockBtn.addEventListener('click', function () {
    if (!currentFile) return;
    unlockBtn.disabled = true;
    progressWrap.style.display = 'block';
    progressBar.style.width = '0%';
    statusText.textContent = 'Opening PDF...';
    pwError.style.display = 'none';
    setTimeout(function () { doUnlock(needsPassword ? pwInput.value : undefined); }, 50);
  });

  function doUnlock(password) {
    currentFile.arrayBuffer().then(function (buf) {
      var opts = { data: buf };
      if (password) opts.password = password;
      return pdfjsLib.getDocument(opts).promise;
    }).then(function (pdf) {
      var numPages = pdf.numPages;
      return PDFLib.PDFDocument.create().then(function (outDoc) {
        var chain = Promise.resolve();
        for (var i = 1; i <= numPages; i++) {
          (function (pageNum) {
            chain = chain.then(function () {
              statusText.textContent = 'Rebuilding page ' + pageNum + '/' + numPages + '...';
              progressBar.style.width = Math.round(((pageNum - 1) / numPages) * 90) + '%';
              return pdf.getPage(pageNum).then(function (page) {
                var baseViewport = page.getViewport({ scale: 1 });
                var renderViewport = page.getViewport({ scale: 2 });
                var canvas = document.createElement('canvas');
                canvas.width = Math.round(renderViewport.width);
                canvas.height = Math.round(renderViewport.height);
                var ctx = canvas.getContext('2d');
                return page.render({ canvasContext: ctx, viewport: renderViewport }).promise.then(function () {
                  return new Promise(function (resolve, reject) {
                    canvas.toBlob(function (blob) {
                      if (!blob) { reject(new Error('Could not encode page.')); return; }
                      blob.arrayBuffer().then(function (b) { resolve(new Uint8Array(b)); });
                    }, 'image/jpeg', 0.92);
                  });
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
        return chain.then(function () { return outDoc.save(); });
      });
    }).then(function (bytes) {
      var blob = new Blob([bytes], { type: 'application/pdf' });
      var url = URL.createObjectURL(blob);
      downloadLink.href = url;
      resultInfo.textContent = 'Password and restrictions removed.';
      progressBar.style.width = '100%';
      progressWrap.style.display = 'none';
      resultBox.style.display = 'block';
      if (window.PdfHandoff && continueBox && continueGrid) {
        PdfHandoff.renderContinueBox(continueGrid, ['merge-pdf', 'split-pdf', 'compress-pdf', 'pdf-to-jpg'], function () {
          return { blob: blob, filename: 'unlocked.pdf' };
        });
        continueBox.style.display = 'block';
      }
    }).catch(function (err) {
      console.error(err);
      if (err && err.name === 'PasswordException') {
        pwError.style.display = 'block';
        progressWrap.style.display = 'none';
      } else {
        statusText.textContent = 'Something went wrong: ' + err.message;
      }
      unlockBtn.disabled = false;
    });
  }

  resetBtn.addEventListener('click', function () {
    currentFile = null;
    needsPassword = false;
    fileInfo.style.display = 'none';
    passwordWrap.style.display = 'none';
    pwInput.value = '';
    actions.style.display = 'none';
    resultBox.style.display = 'none';
    if (continueBox) continueBox.style.display = 'none';
    unlockBtn.disabled = false;
  });
})();
