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
  var thumbGrid = document.getElementById('thumbGrid');
  var rotateAllBtn = document.getElementById('rotateAllBtn');
  var resetOrderBtn = document.getElementById('resetOrderBtn');
  var actions = document.getElementById('actions');
  var saveBtn = document.getElementById('saveBtn');
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
  var pagesData = []; // [{ pageNum: 1, rotation: 0, canvas: ... }]
  var initialPagesData = [];
  var draggedIndex = null;

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
    thumbGrid.innerHTML = '<p style="grid-column:1/-1; text-align:center; color:var(--ink-soft);">Loading pages...</p>';

    file.arrayBuffer().then(function (buf) {
      return pdfjsLib.getDocument({ data: buf }).promise;
    }).then(function (pdf) {
      pdfDoc = pdf;
      var numPages = pdf.numPages;
      pageCountEl.textContent = numPages + ' page' + (numPages === 1 ? '' : 's');

      pagesData = [];
      var chain = Promise.resolve();

      for (var i = 1; i <= numPages; i++) {
        (function (pNum) {
          chain = chain.then(function () {
            return pdf.getPage(pNum).then(function (page) {
              var viewport = page.getViewport({ scale: 0.35 });
              var canvas = document.createElement('canvas');
              canvas.width = Math.round(viewport.width);
              canvas.height = Math.round(viewport.height);
              var ctx = canvas.getContext('2d');
              return page.render({ canvasContext: ctx, viewport: viewport }).promise.then(function () {
                pagesData.push({ pageNum: pNum, rotation: 0, canvas: canvas });
              });
            });
          });
        })(i);
      }

      return chain;
    }).then(function () {
      initialPagesData = pagesData.slice(0);
      renderThumbnails();
    }).catch(function (err) {
      console.error(err);
      alert('Could not read PDF: ' + err.message);
      removeFileBtn.click();
    });
  }

  function renderThumbnails() {
    thumbGrid.innerHTML = '';
    if (pagesData.length === 0) {
      thumbGrid.innerHTML = '<p style="grid-column:1/-1; text-align:center; color:var(--ink-soft);">All pages removed.</p>';
      saveBtn.disabled = true;
      return;
    }
    saveBtn.disabled = false;

    pagesData.forEach(function (p, index) {
      var card = document.createElement('div');
      card.className = 'thumb-card';
      card.draggable = true;
      card.dataset.index = index;

      var badge = document.createElement('span');
      badge.className = 'order-badge';
      badge.textContent = index + 1;
      card.appendChild(badge);

      var removeBtn = document.createElement('button');
      removeBtn.className = 'remove-thumb';
      removeBtn.innerHTML = '&times;';
      removeBtn.title = 'Delete this page';
      removeBtn.addEventListener('click', function (e) {
        e.stopPropagation();
        pagesData.splice(index, 1);
        renderThumbnails();
      });
      card.appendChild(removeBtn);

      var canvasWrap = document.createElement('div');
      canvasWrap.className = 'thumb-canvas-wrap';
      var c = p.canvas.cloneNode(true);
      var ctx = c.getContext('2d');
      ctx.drawImage(p.canvas, 0, 0);
      c.style.transform = 'rotate(' + p.rotation + 'deg)';
      c.style.transition = 'transform .2s ease';
      canvasWrap.appendChild(c);
      card.appendChild(canvasWrap);

      var rotateControls = document.createElement('div');
      rotateControls.className = 'rotate-controls';
      rotateControls.innerHTML = '<button type="button" class="rot-r" title="Rotate 90°">&#8635;</button>';
      rotateControls.querySelector('.rot-r').addEventListener('click', function (e) {
        e.stopPropagation();
        p.rotation = (p.rotation + 90) % 360;
        c.style.transform = 'rotate(' + p.rotation + 'deg)';
      });
      card.appendChild(rotateControls);

      var nameLabel = document.createElement('span');
      nameLabel.className = 'thumb-name';
      nameLabel.textContent = 'Page ' + p.pageNum;
      card.appendChild(nameLabel);

      // Drag & Drop
      card.addEventListener('dragstart', function () {
        draggedIndex = index;
        card.classList.add('dragging');
      });
      card.addEventListener('dragend', function () {
        card.classList.remove('dragging');
        document.querySelectorAll('.thumb-card').forEach(function (c) { c.classList.remove('drag-over'); });
      });
      card.addEventListener('dragover', function (e) {
        e.preventDefault();
        card.classList.add('drag-over');
      });
      card.addEventListener('dragleave', function () {
        card.classList.remove('drag-over');
      });
      card.addEventListener('drop', function (e) {
        e.preventDefault();
        card.classList.remove('drag-over');
        if (draggedIndex !== null && draggedIndex !== index) {
          var moved = pagesData.splice(draggedIndex, 1)[0];
          pagesData.splice(index, 0, moved);
          renderThumbnails();
        }
      });

      thumbGrid.appendChild(card);
    });
  }

  rotateAllBtn.addEventListener('click', function () {
    pagesData.forEach(function (p) {
      p.rotation = (p.rotation + 90) % 360;
    });
    renderThumbnails();
  });

  resetOrderBtn.addEventListener('click', function () {
    pagesData = initialPagesData.slice(0);
    renderThumbnails();
  });

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
    pagesData = [];
    if (dropzone) dropzone.style.display = 'block';
    fileInfo.style.display = 'none';
    actions.style.display = 'none';
    thumbGrid.innerHTML = '';
  });

  saveBtn.addEventListener('click', function () {
    if (!currentFile || pagesData.length === 0) return;
    saveBtn.disabled = true;
    progressWrap.style.display = 'block';
    progressBar.style.width = '20%';
    statusText.textContent = 'Building organized PDF...';

    currentFile.arrayBuffer().then(function (buf) {
      return PDFLib.PDFDocument.load(buf, { ignoreEncryption: true });
    }).then(function (srcDoc) {
      return PDFLib.PDFDocument.create().then(function (outDoc) {
        var pageIndices = pagesData.map(function (p) { return p.pageNum - 1; });
        return outDoc.copyPages(srcDoc, pageIndices).then(function (copiedPages) {
          copiedPages.forEach(function (page, idx) {
            var rot = pagesData[idx].rotation;
            if (rot !== 0) {
              var currentRot = page.getRotation().angle;
              page.setRotation(PDFLib.degrees((currentRot + rot) % 360));
            }
            outDoc.addPage(page);
          });
          progressBar.style.width = '80%';
          return outDoc.save();
        });
      });
    }).then(function (bytes) {
      var blob = new Blob([bytes], { type: 'application/pdf' });
      var url = URL.createObjectURL(blob);
      downloadLink.href = url;
      var outName = currentFile.name.replace(/\.pdf$/i, '') + '-organized.pdf';
      downloadLink.download = outName;
      downloadLink.textContent = 'Download ' + outName;
      resultInfo.textContent = 'Organized PDF created with ' + pagesData.length + ' page' + (pagesData.length === 1 ? '' : 's') + '.';

      progressBar.style.width = '100%';
      progressWrap.style.display = 'none';
      resultBox.style.display = 'block';

      if (window.PdfHandoff && continueBox && continueGrid) {
        PdfHandoff.renderContinueBox(continueGrid, ['compress-pdf', 'merge-pdf', 'watermark-pdf', 'protect-pdf'], function () {
          return { blob: blob, filename: outName };
        });
        continueBox.style.display = 'block';
      }
    }).catch(function (err) {
      console.error(err);
      alert('Error building organized PDF: ' + err.message);
      progressWrap.style.display = 'none';
      saveBtn.disabled = false;
    });
  });

  resetBtn.addEventListener('click', function () {
    currentFile = null;
    pagesData = [];
    if (dropzone) dropzone.style.display = 'block';
    fileInfo.style.display = 'none';
    actions.style.display = 'none';
    resultBox.style.display = 'none';
    if (continueBox) continueBox.style.display = 'none';
    saveBtn.disabled = false;
    thumbGrid.innerHTML = '';
  });

  if (window.PdfHandoff) {
    PdfHandoff.take().then(function (result) {
      if (result && result.blob) {
        var f = new File([result.blob], result.filename || 'file.pdf', { type: 'application/pdf' });
        loadFile(f);
        PdfHandoff.showBanner('Continuing with ' + (result.filename || 'your file') + ' — organize pages below.');
      }
    });
  }
})();
