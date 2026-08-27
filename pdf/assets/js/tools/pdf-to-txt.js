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
  var textPreviewWrap = document.getElementById('textPreviewWrap');
  var copyTextBtn = document.getElementById('copyTextBtn');
  var extractedTextArea = document.getElementById('extractedTextArea');
  var actions = document.getElementById('actions');
  var extractTextBtn = document.getElementById('extractTextBtn');
  var progressWrap = document.getElementById('progressWrap');
  var progressBar = document.getElementById('progressBar');
  var statusText = document.getElementById('statusText');
  var resultBox = document.getElementById('resultBox');
  var resultInfo = document.getElementById('resultInfo');
  var downloadTxtLink = document.getElementById('downloadTxtLink');
  var resetBtn = document.getElementById('resetBtn');

  var currentFile = null;

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
    textPreviewWrap.style.display = 'none';

    file.arrayBuffer().then(function (buf) {
      return pdfjsLib.getDocument({ data: buf }).promise;
    }).then(function (pdf) {
      pageCountEl.textContent = pdf.numPages + ' page' + (pdf.numPages === 1 ? '' : 's');
    }).catch(function (err) {
      console.error(err);
      alert('Could not read PDF: ' + err.message);
      currentFile = null;
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
    textPreviewWrap.style.display = 'none';
  });

  extractTextBtn.addEventListener('click', function () {
    if (!currentFile) return;
    extractTextBtn.disabled = true;
    progressWrap.style.display = 'block';
    progressBar.style.width = '10%';
    statusText.textContent = 'Extracting text from pages...';

    currentFile.arrayBuffer().then(function (buf) {
      return pdfjsLib.getDocument({ data: buf }).promise;
    }).then(function (pdf) {
      var numPages = pdf.numPages;
      var fullText = [];
      var chain = Promise.resolve();

      for (var i = 1; i <= numPages; i++) {
        (function (pNum) {
          chain = chain.then(function () {
            statusText.textContent = 'Reading page ' + pNum + ' of ' + numPages + '...';
            progressBar.style.width = Math.round((pNum / numPages) * 90) + '%';

            return pdf.getPage(pNum).then(function (page) {
              return page.getTextContent().then(function (tc) {
                var pageStr = '';
                var lastY = null;
                tc.items.forEach(function (item) {
                  if (lastY !== null && Math.abs(item.transform[5] - lastY) > 5) {
                    pageStr += '\n';
                  } else if (pageStr.length > 0 && !pageStr.endsWith(' ') && !pageStr.endsWith('\n')) {
                    pageStr += ' ';
                  }
                  pageStr += item.str;
                  lastY = item.transform[5];
                });

                if (numPages > 1) {
                  fullText.push('--- Page ' + pNum + ' ---\n' + pageStr.trim() + '\n');
                } else {
                  fullText.push(pageStr.trim());
                }
              });
            });
          });
        })(i);
      }

      return chain.then(function () {
        return fullText.join('\n');
      });
    }).then(function (textResult) {
      progressBar.style.width = '100%';
      progressWrap.style.display = 'none';

      extractedTextArea.value = textResult || '(No selectable text found in this PDF document. The pages may be scanned images.)';
      textPreviewWrap.style.display = 'block';

      var blob = new Blob([textResult], { type: 'text/plain;charset=utf-8' });
      var url = URL.createObjectURL(blob);
      downloadTxtLink.href = url;
      var outName = currentFile.name.replace(/\.pdf$/i, '') + '.txt';
      downloadTxtLink.download = outName;
      downloadTxtLink.textContent = 'Download ' + outName;
      resultInfo.textContent = 'Extracted ' + textResult.length + ' characters of text.';

      resultBox.style.display = 'block';
    }).catch(function (err) {
      console.error(err);
      alert('Error extracting text: ' + err.message);
      progressWrap.style.display = 'none';
      extractTextBtn.disabled = false;
    });
  });

  copyTextBtn.addEventListener('click', function () {
    navigator.clipboard.writeText(extractedTextArea.value).then(function () {
      copyTextBtn.textContent = '✓ Copied!';
      setTimeout(function () { copyTextBtn.textContent = '📋 Copy to Clipboard'; }, 2000);
    });
  });

  resetBtn.addEventListener('click', function () {
    currentFile = null;
    if (dropzone) dropzone.style.display = 'block';
    fileInfo.style.display = 'none';
    actions.style.display = 'none';
    textPreviewWrap.style.display = 'none';
    resultBox.style.display = 'none';
    extractTextBtn.disabled = false;
  });
})();
