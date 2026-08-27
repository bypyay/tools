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
  var pageThumbGrid = document.getElementById('pageThumbGrid');
  var selectedCountText = document.getElementById('selectedCountText');
  var actions = document.getElementById('actions');
  var deleteBtn = document.getElementById('deleteBtn');
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
  var toDelete = new Set();

  function updateCountText() {
    selectedCountText.textContent = toDelete.size ? '(' + toDelete.size + ' marked for deletion)' : '';
  }

  function loadFile(file) {
    if (!file) return;
    if (file.type !== 'application/pdf' && !/\.pdf$/i.test(file.name)) {
      alert('Please select a PDF file.');
      return;
    }
    currentFile = file;
    toDelete = new Set();
    updateCountText();
    file.arrayBuffer().then(function (buf) {
      return pdfjsLib.getDocument({ data: buf }).promise;
    }).then(function (pdf) {
      pageCount = pdf.numPages;
      fileNameEl.textContent = file.name;
      pageCountEl.textContent = pageCount + ' page' + (pageCount === 1 ? '' : 's');
      if (dropzone) dropzone.style.display = 'none';
    fileInfo.style.display = 'block';
      actions.style.display = 'block';
      renderPageThumbs(pdf);
    }).catch(function (err) {
      console.error(err);
      alert('Could not read this PDF. It may be corrupted or password-protected.');
      currentFile = null;
    });
  }

  function renderPageThumbs(pdf) {
    pageThumbGrid.innerHTML = '';
    pageThumbGrid.style.display = 'grid';
    var wraps = {};

    for (var i = 1; i <= pageCount; i++) {
      (function (pageNum) {
        var card = document.createElement('div');
        card.className = 'thumb-card selectable';
        card.setAttribute('data-page', pageNum);

        var badge = document.createElement('span');
        badge.className = 'order-badge';
        badge.textContent = pageNum;
        card.appendChild(badge);

        var check = document.createElement('span');
        check.className = 'select-check';
        check.innerHTML = '&#10003;';
        card.appendChild(check);

        var wrap = document.createElement('div');
        wrap.className = 'thumb-canvas-wrap';
        wrap.textContent = '…';
        card.appendChild(wrap);

        card.addEventListener('click', function () {
          if (toDelete.has(pageNum)) {
            toDelete.delete(pageNum);
            card.classList.remove('selected');
          } else {
            if (toDelete.size >= pageCount - 1) {
              alert('You must keep at least one page.');
              return;
            }
            toDelete.add(pageNum);
            card.classList.add('selected');
          }
          updateCountText();
        });

        pageThumbGrid.appendChild(card);
        wraps[pageNum] = wrap;
      })(i);
    }

    var chain = Promise.resolve();
    var _loop = function (pageNum) {
      chain = chain.then(function () {
        return pdf.getPage(pageNum).then(function (page) {
          var targetWidth = 110;
          var unscaled = page.getViewport({ scale: 1 });
          var scale = targetWidth / unscaled.width;
          var viewport = page.getViewport({ scale: scale });
          var canvas = document.createElement('canvas');
          canvas.width = Math.round(viewport.width);
          canvas.height = Math.round(viewport.height);
          var ctx = canvas.getContext('2d');
          return page.render({ canvasContext: ctx, viewport: viewport }).promise.then(function () {
            var wrap = wraps[pageNum];
            if (wrap) { wrap.innerHTML = ''; wrap.appendChild(canvas); }
          });
        });
      });
    };
    for (var p = 1; p <= pageCount; p++) _loop(p);
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
    pageCount = 0;
    toDelete = new Set();
    if (dropzone) dropzone.style.display = 'block';
    fileInfo.style.display = 'none';
    pageThumbGrid.style.display = 'none';
    actions.style.display = 'none';
  });

  deleteBtn.addEventListener('click', function () {
    if (!currentFile) return;
    if (!toDelete.size) { alert('Click at least one page to mark it for deletion.'); return; }
    deleteBtn.disabled = true;
    progressWrap.style.display = 'block';
    progressBar.style.width = '0%';
    statusText.textContent = 'Working...';
    setTimeout(doDelete, 50);
  });

  function doDelete() {
    var name = currentFile.name.replace(/\.pdf$/i, '');
    currentFile.arrayBuffer().then(function (buf) {
      return PDFLib.PDFDocument.load(buf, { ignoreEncryption: true });
    }).then(function (srcDoc) {
      var keepIndices = [];
      for (var i = 1; i <= pageCount; i++) {
        if (!toDelete.has(i)) keepIndices.push(i - 1);
      }
      progressBar.style.width = '40%';
      return PDFLib.PDFDocument.create().then(function (outDoc) {
        return outDoc.copyPages(srcDoc, keepIndices).then(function (pages) {
          pages.forEach(function (pg) { outDoc.addPage(pg); });
          return outDoc.save();
        });
      });
    }).then(function (bytes) {
      var blob = new Blob([bytes], { type: 'application/pdf' });
      var url = URL.createObjectURL(blob);
      downloadLink.href = url;
      downloadLink.setAttribute('download', name + '_edited.pdf');
      var kept = pageCount - toDelete.size;
      resultInfo.textContent = toDelete.size + ' page' + (toDelete.size === 1 ? '' : 's') + ' removed, ' + kept + ' remaining.';
      progressBar.style.width = '100%';
      progressWrap.style.display = 'none';
      resultBox.style.display = 'block';
      if (window.PdfHandoff && continueBox && continueGrid) {
        PdfHandoff.renderContinueBox(continueGrid, ['merge-pdf', 'split-pdf', 'compress-pdf', 'pdf-to-jpg'], function () {
          return { blob: blob, filename: name + '_edited.pdf' };
        });
        continueBox.style.display = 'block';
      }
    }).catch(function (err) {
      console.error(err);
      statusText.textContent = 'Something went wrong: ' + err.message;
      deleteBtn.disabled = false;
    });
  }

  resetBtn.addEventListener('click', function () {
    currentFile = null;
    pageCount = 0;
    toDelete = new Set();
    updateCountText();
    fileInfo.style.display = 'none';
    pageThumbGrid.style.display = 'none';
    pageThumbGrid.innerHTML = '';
    actions.style.display = 'none';
    resultBox.style.display = 'none';
    if (continueBox) continueBox.style.display = 'none';
    deleteBtn.disabled = false;
  });

  if (window.PdfHandoff) {
    PdfHandoff.take().then(function (result) {
      if (result && result.blob) {
        var f = new File([result.blob], result.filename || 'file.pdf', { type: 'application/pdf' });
        loadFile(f);
        PdfHandoff.showBanner('Continuing with ' + (result.filename || 'your file') + ' — click pages to delete below.');
      }
    });
  }
})();
