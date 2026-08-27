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
  var rotateAllLeft = document.getElementById('rotateAllLeft');
  var rotateAllRight = document.getElementById('rotateAllRight');
  var actions = document.getElementById('actions');
  var rotateBtn = document.getElementById('rotateBtn');
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
  var deltas = {}; // pageNum (1-indexed) -> extra rotation applied by the user (0/90/180/270)

  function loadFile(file) {
    if (!file) return;
    if (file.type !== 'application/pdf' && !/\.pdf$/i.test(file.name)) {
      alert('Please select a PDF file.');
      return;
    }
    currentFile = file;
    deltas = {};
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
        deltas[pageNum] = 0;
        var card = document.createElement('div');
        card.className = 'thumb-card';
        card.setAttribute('data-page', pageNum);

        var badge = document.createElement('span');
        badge.className = 'order-badge';
        badge.textContent = pageNum;
        card.appendChild(badge);

        var wrap = document.createElement('div');
        wrap.className = 'thumb-canvas-wrap';
        wrap.textContent = '…';
        card.appendChild(wrap);

        var controls = document.createElement('div');
        controls.className = 'rotate-controls';
        var leftBtn = document.createElement('button');
        leftBtn.innerHTML = '&#8634;';
        leftBtn.title = 'Rotate left';
        leftBtn.addEventListener('click', function (e) { e.stopPropagation(); applyDelta(pageNum, -90); });
        var rightBtn = document.createElement('button');
        rightBtn.innerHTML = '&#8635;';
        rightBtn.title = 'Rotate right';
        rightBtn.addEventListener('click', function (e) { e.stopPropagation(); applyDelta(pageNum, 90); });
        controls.appendChild(leftBtn);
        controls.appendChild(rightBtn);
        card.appendChild(controls);

        pageThumbGrid.appendChild(card);
        wraps[pageNum] = wrap;
      })(i);
    }

    var chain = Promise.resolve();
    var _loop = function (pageNum) {
      chain = chain.then(function () {
        return pdf.getPage(pageNum).then(function (page) {
          var targetWidth = 120;
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

  function applyDelta(pageNum, delta) {
    deltas[pageNum] = ((deltas[pageNum] || 0) + delta + 360) % 360;
    var card = pageThumbGrid.querySelector('[data-page="' + pageNum + '"]');
    var canvas = card && card.querySelector('canvas');
    if (canvas) canvas.style.transform = 'rotate(' + deltas[pageNum] + 'deg)';
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
    deltas = {};
    fileInfo.style.display = 'none';
    pageThumbGrid.style.display = 'none';
    actions.style.display = 'none';
  });

  rotateAllLeft.addEventListener('click', function () {
    for (var i = 1; i <= pageCount; i++) applyDelta(i, -90);
  });
  rotateAllRight.addEventListener('click', function () {
    for (var i = 1; i <= pageCount; i++) applyDelta(i, 90);
  });

  rotateBtn.addEventListener('click', function () {
    if (!currentFile) return;
    rotateBtn.disabled = true;
    progressWrap.style.display = 'block';
    progressBar.style.width = '0%';
    statusText.textContent = 'Applying rotation...';
    setTimeout(doRotate, 50);
  });

  function doRotate() {
    currentFile.arrayBuffer().then(function (buf) {
      return PDFLib.PDFDocument.load(buf, { ignoreEncryption: true });
    }).then(function (doc) {
      var pages = doc.getPages();
      pages.forEach(function (page, index) {
        var pageNum = index + 1;
        var delta = deltas[pageNum] || 0;
        if (!delta) return;
        var current = page.getRotation().angle;
        page.setRotation(PDFLib.degrees((current + delta + 360) % 360));
      });
      progressBar.style.width = '80%';
      return doc.save();
    }).then(function (bytes) {
      var blob = new Blob([bytes], { type: 'application/pdf' });
      var url = URL.createObjectURL(blob);
      downloadLink.href = url;
      resultInfo.textContent = pageCount + ' page' + (pageCount === 1 ? '' : 's') + ' processed.';
      progressBar.style.width = '100%';
      progressWrap.style.display = 'none';
      resultBox.style.display = 'block';
      if (window.PdfHandoff && continueBox && continueGrid) {
        PdfHandoff.renderContinueBox(continueGrid, ['merge-pdf', 'split-pdf', 'compress-pdf', 'pdf-to-jpg'], function () {
          return { blob: blob, filename: 'rotated.pdf' };
        });
        continueBox.style.display = 'block';
      }
    }).catch(function (err) {
      console.error(err);
      statusText.textContent = 'Something went wrong: ' + err.message;
      rotateBtn.disabled = false;
    });
  }

  resetBtn.addEventListener('click', function () {
    currentFile = null;
    pageCount = 0;
    deltas = {};
    fileInfo.style.display = 'none';
    pageThumbGrid.style.display = 'none';
    pageThumbGrid.innerHTML = '';
    actions.style.display = 'none';
    resultBox.style.display = 'none';
    if (continueBox) continueBox.style.display = 'none';
    rotateBtn.disabled = false;
  });

  if (window.PdfHandoff) {
    PdfHandoff.take().then(function (result) {
      if (result && result.blob) {
        var f = new File([result.blob], result.filename || 'file.pdf', { type: 'application/pdf' });
        loadFile(f);
        PdfHandoff.showBanner('Continuing with ' + (result.filename || 'your file') + ' — rotate pages below.');
      }
    });
  }
})();
