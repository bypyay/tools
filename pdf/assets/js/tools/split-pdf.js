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
  var splitBtn = document.getElementById('splitBtn');
  var rangesInputWrap = document.getElementById('rangesInputWrap');
  var rangesInput = document.getElementById('rangesInput');
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
  var selectedPages = new Set();

  function baseName(name) {
    return name.replace(/\.pdf$/i, '');
  }

  function updateSelectedCountText() {
    selectedCountText.textContent = selectedPages.size ? '(' + selectedPages.size + ' selected)' : '';
  }

  function loadFile(file) {
    if (!file) return;
    if (file.type !== 'application/pdf' && !/\.pdf$/i.test(file.name)) {
      alert('Please select a PDF file.');
      return;
    }
    currentFile = file;
    selectedPages = new Set();
    updateSelectedCountText();
    statusText.textContent = '';
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
          var mode = document.querySelector('input[name=mode]:checked').value;
          if (mode !== 'select') return;
          if (selectedPages.has(pageNum)) {
            selectedPages.delete(pageNum);
            card.classList.remove('selected');
          } else {
            selectedPages.add(pageNum);
            card.classList.add('selected');
          }
          updateSelectedCountText();
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
    selectedPages = new Set();
    if (dropzone) dropzone.style.display = 'block';
    fileInfo.style.display = 'none';
    pageThumbGrid.style.display = 'none';
    actions.style.display = 'none';
  });

  document.querySelectorAll('input[name=mode]').forEach(function (radio) {
    radio.addEventListener('change', function () {
      rangesInputWrap.style.display = (radio.value === 'ranges' && radio.checked) ? 'block' : rangesInputWrap.style.display;
      if (radio.checked && radio.value !== 'ranges') rangesInputWrap.style.display = 'none';
    });
  });

  function parseRanges(input, max) {
    var parts = input.split(',').map(function (s) { return s.trim(); }).filter(Boolean);
    if (!parts.length) throw new Error('Enter at least one page or range.');
    var ranges = [];
    parts.forEach(function (part) {
      var m = part.match(/^(\d+)(?:-(\d+))?$/);
      if (!m) throw new Error('"' + part + '" is not a valid page or range.');
      var start = parseInt(m[1], 10);
      var end = m[2] ? parseInt(m[2], 10) : start;
      if (start < 1 || end < 1 || start > max || end > max || start > end) {
        throw new Error('"' + part + '" is out of range (this PDF has ' + max + ' pages).');
      }
      ranges.push([start, end]);
    });
    return ranges;
  }

  function groupFilename(name, group) {
    if (group.length === 1) return name + '_page' + group[0] + '.pdf';
    var contiguous = group.every(function (p, i) { return i === 0 || p === group[i - 1] + 1; });
    if (contiguous) return name + '_pages' + group[0] + '-' + group[group.length - 1] + '.pdf';
    return name + '_selected_pages.pdf';
  }

  splitBtn.addEventListener('click', function () {
    if (!currentFile) return;
    var mode = document.querySelector('input[name=mode]:checked').value;
    var groups;
    if (mode === 'ranges') {
      try {
        groups = parseRanges(rangesInput.value, pageCount).map(function (r) {
          var arr = [];
          for (var p = r[0]; p <= r[1]; p++) arr.push(p);
          return arr;
        });
      } catch (e) {
        alert(e.message);
        return;
      }
    } else if (mode === 'select') {
      if (!selectedPages.size) { alert('Click at least one page thumbnail to select it.'); return; }
      groups = [Array.from(selectedPages).sort(function (a, b) { return a - b; })];
    } else {
      groups = [];
      for (var i = 1; i <= pageCount; i++) groups.push([i]);
    }

    splitBtn.disabled = true;
    progressWrap.style.display = 'block';
    progressBar.style.width = '0%';
    statusText.textContent = 'Reading PDF...';

    setTimeout(function () { doSplit(groups); }, 50);
  });

  function doSplit(groups) {
    var name = baseName(currentFile.name);
    var zip = new JSZip();
    var singleResultBytes = null;
    var singleResultName = null;

    currentFile.arrayBuffer().then(function (buf) {
      return PDFLib.PDFDocument.load(buf, { ignoreEncryption: true });
    }).then(function (srcDoc) {
      return groups.reduce(function (chain, group, index) {
        return chain.then(function () {
          statusText.textContent = 'Creating file ' + (index + 1) + '/' + groups.length + '...';
          progressBar.style.width = Math.round((index / groups.length) * 90) + '%';
          var indices = group.map(function (p) { return p - 1; });
          return PDFLib.PDFDocument.create().then(function (outDoc) {
            return outDoc.copyPages(srcDoc, indices).then(function (pages) {
              pages.forEach(function (pg) { outDoc.addPage(pg); });
              return outDoc.save();
            });
          }).then(function (bytes) {
            var fname = groupFilename(name, group);
            zip.file(fname, bytes);
            if (groups.length === 1) { singleResultBytes = bytes; singleResultName = fname; }
          });
        });
      }, Promise.resolve());
    }).then(function () {
      statusText.textContent = 'Building ZIP...';
      progressBar.style.width = '95%';
      return zip.generateAsync({ type: 'blob' });
    }).then(function (blob) {
      var url = URL.createObjectURL(blob);
      downloadLink.href = url;
      downloadLink.setAttribute('download', name + '_split.zip');
      resultInfo.textContent = groups.length + ' file' + (groups.length === 1 ? '' : 's') + ' created.';
      progressBar.style.width = '100%';
      progressWrap.style.display = 'none';
      resultBox.style.display = 'block';
      if (window.PdfHandoff && continueBox && continueGrid && singleResultBytes) {
        PdfHandoff.renderContinueBox(continueGrid, ['merge-pdf', 'compress-pdf', 'pdf-to-jpg'], function () {
          return { blob: new Blob([singleResultBytes], { type: 'application/pdf' }), filename: singleResultName };
        });
        continueBox.style.display = 'block';
      } else if (continueBox) {
        continueBox.style.display = 'none';
      }
    }).catch(function (err) {
      console.error(err);
      statusText.textContent = 'Something went wrong: ' + err.message;
      splitBtn.disabled = false;
    });
  }

  resetBtn.addEventListener('click', function () {
    currentFile = null;
    pageCount = 0;
    selectedPages = new Set();
    updateSelectedCountText();
    fileInfo.style.display = 'none';
    pageThumbGrid.style.display = 'none';
    pageThumbGrid.innerHTML = '';
    actions.style.display = 'none';
    resultBox.style.display = 'none';
    if (continueBox) continueBox.style.display = 'none';
    splitBtn.disabled = false;
    rangesInput.value = '';
    document.querySelector('input[name=mode][value=all]').checked = true;
    rangesInputWrap.style.display = 'none';
  });

  if (window.PdfHandoff) {
    PdfHandoff.take().then(function (result) {
      if (result && result.blob) {
        var f = new File([result.blob], result.filename || 'file.pdf', { type: 'application/pdf' });
        loadFile(f);
        PdfHandoff.showBanner('Continuing with ' + (result.filename || 'your file') + ' — choose how to split it below.');
      }
    });
  }
})();
