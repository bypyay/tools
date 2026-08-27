(function () {
  if (window.pdfjsLib) {
    var pdfScriptTag = document.querySelector('script[src*="vendor/pdf.min.js"]');
    var siteRoot = pdfScriptTag ? pdfScriptTag.getAttribute('src').replace(/vendor\/pdf\.min\.js.*$/, '') : '';
    pdfjsLib.GlobalWorkerOptions.workerSrc = siteRoot + 'vendor/pdf.worker.min.js';
  }

  var dropzone = document.getElementById('dropzone');
  var fileInput = document.getElementById('fileInput');
  var thumbGrid = document.getElementById('thumbGrid');
  var thumbHint = document.getElementById('thumbHint');
  var actions = document.getElementById('actions');
  var mergeBtn = document.getElementById('mergeBtn');
  var progressWrap = document.getElementById('progressWrap');
  var progressBar = document.getElementById('progressBar');
  var statusText = document.getElementById('statusText');
  var resultBox = document.getElementById('resultBox');
  var resultInfo = document.getElementById('resultInfo');
  var downloadLink = document.getElementById('downloadLink');
  var resetBtn = document.getElementById('resetBtn');
  var continueBox = document.getElementById('continueBox');
  var continueGrid = document.getElementById('continueGrid');

  var files = []; // { file, id, canvas }
  var nextId = 1;
  var dragSrcId = null;

  function formatSize(bytes) {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  }

  function addFiles(fileListInput) {
    var added = [];
    for (var i = 0; i < fileListInput.length; i++) {
      var f = fileListInput[i];
      if (f.type !== 'application/pdf' && !/\.pdf$/i.test(f.name)) continue;
      var item = { file: f, id: nextId++, canvas: null };
      files.push(item);
      added.push(item);
    }
    render();
    added.forEach(renderThumb);
  }

  function renderThumb(item) {
    if (!window.pdfjsLib) return;
    item.file.arrayBuffer().then(function (buf) {
      return pdfjsLib.getDocument({ data: buf }).promise;
    }).then(function (pdf) {
      return pdf.getPage(1);
    }).then(function (page) {
      var targetWidth = 130;
      var unscaled = page.getViewport({ scale: 1 });
      var scale = targetWidth / unscaled.width;
      var viewport = page.getViewport({ scale: scale });
      var canvas = document.createElement('canvas');
      canvas.width = Math.round(viewport.width);
      canvas.height = Math.round(viewport.height);
      var ctx = canvas.getContext('2d');
      return page.render({ canvasContext: ctx, viewport: viewport }).promise.then(function () {
        item.canvas = canvas;
        var wrap = thumbGrid.querySelector('[data-id="' + item.id + '"] .thumb-canvas-wrap');
        if (wrap) { wrap.innerHTML = ''; wrap.appendChild(canvas); }
      });
    }).catch(function (err) {
      console.error('Thumbnail failed for', item.file.name, err);
    });
  }

  function render() {
    thumbGrid.innerHTML = '';
    if (!files.length) {
      thumbGrid.style.display = 'none';
      thumbHint.style.display = 'none';
      dropzone.style.display = 'block';
      actions.style.display = 'none';
      return;
    }
    dropzone.style.display = 'none';
    thumbGrid.style.display = 'grid';
    thumbHint.style.display = files.length > 1 ? 'block' : 'none';

    files.forEach(function (item, index) {
      var card = document.createElement('div');
      card.className = 'thumb-card';
      card.setAttribute('draggable', 'true');
      card.setAttribute('data-id', item.id);

      var badge = document.createElement('span');
      badge.className = 'order-badge';
      badge.textContent = index + 1;
      card.appendChild(badge);

      var removeBtn = document.createElement('button');
      removeBtn.className = 'remove-thumb';
      removeBtn.title = 'Remove';
      removeBtn.innerHTML = '&times;';
      removeBtn.addEventListener('click', function (e) { e.stopPropagation(); removeItem(item.id); });
      card.appendChild(removeBtn);

      var wrap = document.createElement('div');
      wrap.className = 'thumb-canvas-wrap';
      if (item.canvas) {
        wrap.appendChild(item.canvas);
      } else {
        wrap.textContent = 'Loading…';
      }
      card.appendChild(wrap);

      var name = document.createElement('span');
      name.className = 'thumb-name';
      name.textContent = item.file.name;
      card.appendChild(name);

      card.addEventListener('dragstart', function (e) {
        dragSrcId = item.id;
        card.classList.add('dragging');
        e.dataTransfer.effectAllowed = 'move';
      });
      card.addEventListener('dragend', function () {
        card.classList.remove('dragging');
        thumbGrid.querySelectorAll('.thumb-card').forEach(function (c) { c.classList.remove('drag-over'); });
      });
      card.addEventListener('dragover', function (e) {
        e.preventDefault();
        if (item.id !== dragSrcId) card.classList.add('drag-over');
      });
      card.addEventListener('dragleave', function () { card.classList.remove('drag-over'); });
      card.addEventListener('drop', function (e) {
        e.preventDefault();
        card.classList.remove('drag-over');
        if (dragSrcId === null || dragSrcId === item.id) return;
        reorder(dragSrcId, item.id);
      });

      thumbGrid.appendChild(card);
    });

    var addTile = document.createElement('div');
    addTile.className = 'thumb-add';
    addTile.innerHTML = '<span class="plus">+</span><span>Add more</span>';
    addTile.addEventListener('click', function () { fileInput.click(); });
    thumbGrid.appendChild(addTile);

    actions.style.display = files.length >= 2 ? 'block' : 'none';
  }

  function reorder(srcId, targetId) {
    var srcIndex = files.findIndex(function (f) { return f.id === srcId; });
    var targetIndex = files.findIndex(function (f) { return f.id === targetId; });
    if (srcIndex === -1 || targetIndex === -1) return;
    var moved = files.splice(srcIndex, 1)[0];
    files.splice(targetIndex, 0, moved);
    render();
  }

  function removeItem(id) {
    files = files.filter(function (item) { return item.id !== id; });
    render();
  }

  dropzone.addEventListener('click', function () { fileInput.click(); });
  fileInput.addEventListener('change', function (e) { addFiles(e.target.files); fileInput.value = ''; });

  ['dragenter', 'dragover'].forEach(function (evt) {
    dropzone.addEventListener(evt, function (e) {
      e.preventDefault();
      dropzone.classList.add('dragover');
    });
  });
  ['dragleave', 'drop'].forEach(function (evt) {
    dropzone.addEventListener(evt, function (e) {
      e.preventDefault();
      dropzone.classList.remove('dragover');
    });
  });
  dropzone.addEventListener('drop', function (e) {
    if (e.dataTransfer && e.dataTransfer.files) addFiles(e.dataTransfer.files);
  });

  mergeBtn.addEventListener('click', function () {
    if (files.length < 2) return;
    mergeBtn.disabled = true;
    progressWrap.style.display = 'block';
    progressBar.style.width = '0%';
    statusText.textContent = 'Reading files...';

    setTimeout(mergeFiles, 50); // let UI paint before heavy work
  });

  function mergeFiles() {
    var PDFDocument = PDFLib.PDFDocument;
    var mergedPdf;

    PDFDocument.create().then(function (doc) {
      mergedPdf = doc;
      return files.reduce(function (chain, item, index) {
        return chain.then(function () {
          statusText.textContent = 'Merging ' + item.file.name + ' (' + (index + 1) + '/' + files.length + ')...';
          progressBar.style.width = Math.round(((index) / files.length) * 90) + '%';
          return item.file.arrayBuffer().then(function (buf) {
            return PDFDocument.load(buf, { ignoreEncryption: true });
          }).then(function (srcDoc) {
            return mergedPdf.copyPages(srcDoc, srcDoc.getPageIndices());
          }).then(function (pages) {
            pages.forEach(function (p) { mergedPdf.addPage(p); });
          });
        });
      }, Promise.resolve());
    }).then(function () {
      statusText.textContent = 'Finalizing...';
      progressBar.style.width = '95%';
      return mergedPdf.save();
    }).then(function (bytes) {
      var blob = new Blob([bytes], { type: 'application/pdf' });
      var url = URL.createObjectURL(blob);
      downloadLink.href = url;
      resultInfo.textContent = files.length + ' files merged, ' + formatSize(blob.size) + ' total.';
      progressBar.style.width = '100%';
      progressWrap.style.display = 'none';
      resultBox.style.display = 'block';
      if (window.PdfHandoff && continueBox && continueGrid) {
        PdfHandoff.renderContinueBox(continueGrid, ['split-pdf', 'compress-pdf', 'pdf-to-jpg'], function () {
          return { blob: blob, filename: 'merged.pdf' };
        });
        continueBox.style.display = 'block';
      }
    }).catch(function (err) {
      console.error(err);
      statusText.textContent = 'Something went wrong: ' + err.message + '. Make sure all files are valid, non-encrypted PDFs.';
      mergeBtn.disabled = false;
    });
  }

  resetBtn.addEventListener('click', function () {
    files = [];
    render();
    resultBox.style.display = 'none';
    if (continueBox) continueBox.style.display = 'none';
    mergeBtn.disabled = false;
  });

  if (window.PdfHandoff) {
    PdfHandoff.take().then(function (result) {
      if (result && result.blob) {
        var f = new File([result.blob], result.filename || 'file.pdf', { type: 'application/pdf' });
        addFiles([f]);
        PdfHandoff.showBanner('Continuing with ' + (result.filename || 'your file') + ' — add the other files to merge with it below.');
      }
    });
  }
})();
