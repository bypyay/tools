(function () {
  var dropzone = document.getElementById('dropzone');
  var fileInput = document.getElementById('fileInput');
  var thumbGrid = document.getElementById('thumbGrid');
  var thumbHint = document.getElementById('thumbHint');
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

  var files = []; // { file, id, url }
  var nextId = 1;
  var dragSrcId = null;

  function formatSize(bytes) {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  }

  function isImage(f) {
    return f.type === 'image/jpeg' || f.type === 'image/png' || /\.(jpe?g|png)$/i.test(f.name);
  }

  function addFiles(fileListInput) {
    for (var i = 0; i < fileListInput.length; i++) {
      var f = fileListInput[i];
      if (!isImage(f)) continue;
      files.push({ file: f, id: nextId++, url: URL.createObjectURL(f) });
    }
    render();
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
      var img = document.createElement('img');
      img.src = item.url;
      img.alt = item.file.name;
      wrap.appendChild(img);
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

    actions.style.display = files.length >= 1 ? 'block' : 'none';
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
    var item = files.find(function (f) { return f.id === id; });
    if (item) URL.revokeObjectURL(item.url);
    files = files.filter(function (f) { return f.id !== id; });
    render();
  }

  dropzone.addEventListener('click', function () { fileInput.click(); });
  fileInput.addEventListener('change', function (e) { addFiles(e.target.files); fileInput.value = ''; });
  ['dragenter', 'dragover'].forEach(function (evt) {
    dropzone.addEventListener(evt, function (e) { e.preventDefault(); dropzone.classList.add('dragover'); });
  });
  ['dragleave', 'drop'].forEach(function (evt) {
    dropzone.addEventListener(evt, function (e) { e.preventDefault(); dropzone.classList.remove('dragover'); });
  });
  dropzone.addEventListener('drop', function (e) {
    if (e.dataTransfer && e.dataTransfer.files) addFiles(e.dataTransfer.files);
  });

  convertBtn.addEventListener('click', function () {
    if (!files.length) return;
    convertBtn.disabled = true;
    progressWrap.style.display = 'block';
    progressBar.style.width = '0%';
    statusText.textContent = 'Reading images...';
    setTimeout(doConvert, 50);
  });

  function doConvert() {
    var PDFDocument = PDFLib.PDFDocument;
    PDFDocument.create().then(function (pdfDoc) {
      return files.reduce(function (chain, item, index) {
        return chain.then(function () {
          statusText.textContent = 'Adding ' + item.file.name + ' (' + (index + 1) + '/' + files.length + ')...';
          progressBar.style.width = Math.round((index / files.length) * 90) + '%';
          return item.file.arrayBuffer().then(function (buf) {
            var isPng = item.file.type === 'image/png' || /\.png$/i.test(item.file.name);
            return isPng ? pdfDoc.embedPng(buf) : pdfDoc.embedJpg(buf);
          }).then(function (img) {
            var page = pdfDoc.addPage([img.width, img.height]);
            page.drawImage(img, { x: 0, y: 0, width: img.width, height: img.height });
          });
        });
      }, Promise.resolve()).then(function () { return pdfDoc; });
    }).then(function (pdfDoc) {
      statusText.textContent = 'Finalizing...';
      progressBar.style.width = '95%';
      return pdfDoc.save();
    }).then(function (bytes) {
      var blob = new Blob([bytes], { type: 'application/pdf' });
      var url = URL.createObjectURL(blob);
      downloadLink.href = url;
      resultInfo.textContent = files.length + ' image' + (files.length === 1 ? '' : 's') + ' converted, ' + formatSize(blob.size) + '.';
      progressBar.style.width = '100%';
      progressWrap.style.display = 'none';
      resultBox.style.display = 'block';
      if (window.PdfHandoff && continueBox && continueGrid) {
        PdfHandoff.renderContinueBox(continueGrid, ['merge-pdf', 'split-pdf', 'compress-pdf'], function () {
          return { blob: blob, filename: 'images.pdf' };
        });
        continueBox.style.display = 'block';
      }
    }).catch(function (err) {
      console.error(err);
      statusText.textContent = 'Something went wrong: ' + err.message;
      convertBtn.disabled = false;
    });
  }

  resetBtn.addEventListener('click', function () {
    files.forEach(function (item) { URL.revokeObjectURL(item.url); });
    files = [];
    render();
    resultBox.style.display = 'none';
    if (continueBox) continueBox.style.display = 'none';
    convertBtn.disabled = false;
  });
})();
