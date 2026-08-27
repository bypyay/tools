(function () {
  if (window.pdfjsLib) {
    var pdfScriptTag = document.querySelector('script[src*="vendor/pdf.min.js"]');
    var siteRoot = pdfScriptTag ? pdfScriptTag.getAttribute('src').replace(/vendor\/pdf\.min\.js.*$/, '') : '';
    pdfjsLib.GlobalWorkerOptions.workerSrc = siteRoot + 'vendor/pdf.worker.min.js';
  }

  var dropzoneA = document.getElementById('dropzoneA');
  var fileInputA = document.getElementById('fileInputA');
  var nameA = document.getElementById('nameA');

  var dropzoneB = document.getElementById('dropzoneB');
  var fileInputB = document.getElementById('fileInputB');
  var nameB = document.getElementById('nameB');

  var dualDropzoneWrap = document.getElementById('dualDropzoneWrap');
  var compareViewerWrap = document.getElementById('compareViewerWrap');
  var prevPageBtn = document.getElementById('prevPageBtn');
  var nextPageBtn = document.getElementById('nextPageBtn');
  var pageNavLabel = document.getElementById('pageNavLabel');
  var modeSideBtn = document.getElementById('modeSideBtn');
  var modeDiffBtn = document.getElementById('modeDiffBtn');
  var resetCompareBtn = document.getElementById('resetCompareBtn');

  var sideBySideView = document.getElementById('sideBySideView');
  var diffView = document.getElementById('diffView');
  var canvasWrapA = document.getElementById('canvasWrapA');
  var canvasWrapB = document.getElementById('canvasWrapB');
  var diffCanvasWrap = document.getElementById('diffCanvasWrap');

  var fileA = null, fileB = null;
  var pdfDocA = null, pdfDocB = null;
  var currentPage = 1;
  var maxPages = 1;
  var currentViewMode = 'side'; // 'side'|'diff'

  function checkReady() {
    if (fileA && fileB) {
      dualDropzoneWrap.style.display = 'none';
      compareViewerWrap.style.display = 'block';
      loadDocs();
    }
  }

  function setupDrop(dropzone, input, nameEl, isA) {
    dropzone.addEventListener('click', function () { input.click(); });
    input.addEventListener('change', function (e) {
      if (e.target.files && e.target.files[0]) {
        var f = e.target.files[0];
        if (isA) fileA = f; else fileB = f;
        nameEl.textContent = '✓ ' + f.name;
        dropzone.style.borderColor = '#10b981';
        checkReady();
      }
    });
    ['dragenter', 'dragover'].forEach(function (evt) {
      dropzone.addEventListener(evt, function (e) { e.preventDefault(); dropzone.classList.add('dragover'); });
    });
    ['dragleave', 'drop'].forEach(function (evt) {
      dropzone.addEventListener(evt, function (e) { e.preventDefault(); dropzone.classList.remove('dragover'); });
    });
    dropzone.addEventListener('drop', function (e) {
      if (e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files[0]) {
        var f = e.dataTransfer.files[0];
        if (isA) fileA = f; else fileB = f;
        nameEl.textContent = '✓ ' + f.name;
        dropzone.style.borderColor = '#10b981';
        checkReady();
      }
    });
  }

  setupDrop(dropzoneA, fileInputA, nameA, true);
  setupDrop(dropzoneB, fileInputB, nameB, false);

  function loadDocs() {
    Promise.all([
      fileA.arrayBuffer().then(function (b) { return pdfjsLib.getDocument({ data: b }).promise; }),
      fileB.arrayBuffer().then(function (b) { return pdfjsLib.getDocument({ data: b }).promise; })
    ]).then(function (res) {
      pdfDocA = res[0];
      pdfDocB = res[1];
      maxPages = Math.max(pdfDocA.numPages, pdfDocB.numPages);
      currentPage = 1;
      renderCurrentPage();
    }).catch(function (err) {
      console.error(err);
      alert('Error loading PDF files: ' + err.message);
      resetCompareBtn.click();
    });
  }

  function renderPageToCanvas(pdfDoc, pageNum, targetWidth) {
    if (!pdfDoc || pageNum > pdfDoc.numPages) {
      var blank = document.createElement('canvas');
      blank.width = targetWidth;
      blank.height = Math.round(targetWidth * 1.3);
      var ctx = blank.getContext('2d');
      ctx.fillStyle = '#f3f4f6';
      ctx.fillRect(0, 0, blank.width, blank.height);
      ctx.fillStyle = '#9ca3af';
      ctx.font = '14px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('(No page in this document)', blank.width / 2, blank.height / 2);
      return Promise.resolve(blank);
    }

    return pdfDoc.getPage(pageNum).then(function (page) {
      var unscaled = page.getViewport({ scale: 1 });
      var scale = targetWidth / unscaled.width;
      var viewport = page.getViewport({ scale: scale });

      var canvas = document.createElement('canvas');
      canvas.width = Math.round(viewport.width);
      canvas.height = Math.round(viewport.height);
      var ctx = canvas.getContext('2d');

      return page.render({ canvasContext: ctx, viewport: viewport }).promise.then(function () {
        return canvas;
      });
    });
  }

  function renderCurrentPage() {
    pageNavLabel.textContent = 'Page ' + currentPage + ' of ' + maxPages;
    prevPageBtn.disabled = currentPage <= 1;
    nextPageBtn.disabled = currentPage >= maxPages;

    var targetW = 380;
    Promise.all([
      renderPageToCanvas(pdfDocA, currentPage, targetW),
      renderPageToCanvas(pdfDocB, currentPage, targetW)
    ]).then(function (canvases) {
      var cA = canvases[0];
      var cB = canvases[1];

      canvasWrapA.innerHTML = '';
      canvasWrapA.appendChild(cA);

      canvasWrapB.innerHTML = '';
      canvasWrapB.appendChild(cB);

      // Render Visual Diff Canvas
      var diffCanvas = document.createElement('canvas');
      var dw = Math.max(cA.width, cB.width);
      var dh = Math.max(cA.height, cB.height);
      diffCanvas.width = dw;
      diffCanvas.height = dh;
      var dctx = diffCanvas.getContext('2d');

      var ctxA = cA.getContext('2d');
      var ctxB = cB.getContext('2d');

      var dataA = ctxA.getImageData(0, 0, cA.width, cA.height).data;
      var dataB = ctxB.getImageData(0, 0, cB.width, cB.height).data;
      var diffData = dctx.createImageData(dw, dh);
      var d = diffData.data;

      var len = Math.min(dataA.length, dataB.length);
      for (var i = 0; i < len; i += 4) {
        var diff = Math.abs(dataA[i] - dataB[i]) + Math.abs(dataA[i + 1] - dataB[i + 1]) + Math.abs(dataA[i + 2] - dataB[i + 2]);
        if (diff > 40) {
          // Highlight difference in vibrant Red
          d[i] = 229;     // R
          d[i + 1] = 50;  // G
          d[i + 2] = 45;  // B
          d[i + 3] = 255; // A
        } else {
          // Muted grayscale background
          var g = (dataB[i] + dataB[i + 1] + dataB[i + 2]) / 3;
          d[i] = g;
          d[i + 1] = g;
          d[i + 2] = g;
          d[i + 3] = 180;
        }
      }
      dctx.putImageData(diffData, 0, 0);

      diffCanvasWrap.innerHTML = '';
      diffCanvasWrap.appendChild(diffCanvas);
    });
  }

  prevPageBtn.addEventListener('click', function () {
    if (currentPage > 1) { currentPage--; renderCurrentPage(); }
  });

  nextPageBtn.addEventListener('click', function () {
    if (currentPage < maxPages) { currentPage++; renderCurrentPage(); }
  });

  modeSideBtn.addEventListener('click', function () {
    currentViewMode = 'side';
    modeSideBtn.classList.add('active');
    modeDiffBtn.classList.remove('active');
    sideBySideView.style.display = 'flex';
    diffView.style.display = 'none';
  });

  modeDiffBtn.addEventListener('click', function () {
    currentViewMode = 'diff';
    modeDiffBtn.classList.add('active');
    modeSideBtn.classList.remove('active');
    sideBySideView.style.display = 'none';
    diffView.style.display = 'block';
  });

  resetCompareBtn.addEventListener('click', function () {
    fileA = null; fileB = null;
    pdfDocA = null; pdfDocB = null;
    fileInputA.value = ''; fileInputB.value = '';
    nameA.textContent = 'Drag & drop or click';
    nameB.textContent = 'Drag & drop or click';
    dropzoneA.style.borderColor = 'var(--border)';
    dropzoneB.style.borderColor = 'var(--border)';
    dualDropzoneWrap.style.display = 'flex';
    compareViewerWrap.style.display = 'none';
  });
})();
