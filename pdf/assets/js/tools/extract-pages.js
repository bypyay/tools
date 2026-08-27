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
  var rangeInput = document.getElementById('rangeInput');
  var selectAllBtn = document.getElementById('selectAllBtn');
  var clearAllBtn = document.getElementById('clearAllBtn');
  var thumbGrid = document.getElementById('thumbGrid');
  var actions = document.getElementById('actions');
  var extractBtn = document.getElementById('extractBtn');
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
  var totalPages = 0;
  var selectedPages = new Set(); // 1-based page numbers
  var thumbCards = [];

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
    thumbGrid.innerHTML = '<p style="grid-column:1/-1; text-align:center; color:var(--ink-soft);">Loading page previews...</p>';

    selectedPages.clear();
    thumbCards = [];

    file.arrayBuffer().then(function (buf) {
      return pdfjsLib.getDocument({ data: buf }).promise;
    }).then(function (pdf) {
      totalPages = pdf.numPages;
      pageCountEl.textContent = totalPages + ' page' + (totalPages === 1 ? '' : 's');

      thumbGrid.innerHTML = '';
      var chain = Promise.resolve();

      for (var i = 1; i <= totalPages; i++) {
        (function (pNum) {
          chain = chain.then(function () {
            return pdf.getPage(pNum).then(function (page) {
              var viewport = page.getViewport({ scale: 0.35 });
              var canvas = document.createElement('canvas');
              canvas.width = Math.round(viewport.width);
              canvas.height = Math.round(viewport.height);
              var ctx = canvas.getContext('2d');
              return page.render({ canvasContext: ctx, viewport: viewport }).promise.then(function () {
                var card = document.createElement('div');
                card.className = 'thumb-card selectable';
                card.dataset.pageNum = pNum;

                var badge = document.createElement('span');
                badge.className = 'order-badge';
                badge.textContent = pNum;
                card.appendChild(badge);

                var check = document.createElement('span');
                check.className = 'select-check';
                check.innerHTML = '&#10003;';
                card.appendChild(check);

                var canvasWrap = document.createElement('div');
                canvasWrap.className = 'thumb-canvas-wrap';
                canvasWrap.appendChild(canvas);
                card.appendChild(canvasWrap);

                var label = document.createElement('span');
                label.className = 'thumb-name';
                label.textContent = 'Page ' + pNum;
                card.appendChild(label);

                card.addEventListener('click', function () {
                  togglePage(pNum);
                });

                thumbGrid.appendChild(card);
                thumbCards[pNum] = card;
              });
            });
          });
        })(i);
      }

      return chain;
    }).then(function () {
      // Default: select first page
      togglePage(1);
    }).catch(function (err) {
      console.error(err);
      alert('Could not read PDF: ' + err.message);
      removeFileBtn.click();
    });
  }

  function togglePage(pNum) {
    if (selectedPages.has(pNum)) {
      selectedPages.delete(pNum);
      if (thumbCards[pNum]) thumbCards[pNum].classList.remove('selected');
    } else {
      selectedPages.add(pNum);
      if (thumbCards[pNum]) thumbCards[pNum].classList.add('selected');
    }
    updateRangeInputFromSet();
  }

  function updateRangeInputFromSet() {
    var arr = Array.from(selectedPages).sort(function (a, b) { return a - b; });
    if (arr.length === 0) {
      rangeInput.value = '';
      extractBtn.disabled = true;
      return;
    }
    extractBtn.disabled = false;
    rangeInput.value = formatRangeString(arr);
  }

  function formatRangeString(nums) {
    if (nums.length === 0) return '';
    var ranges = [];
    var start = nums[0];
    var end = nums[0];

    for (var i = 1; i < nums.length; i++) {
      if (nums[i] === end + 1) {
        end = nums[i];
      } else {
        ranges.push(start === end ? '' + start : start + '-' + end);
        start = nums[i];
        end = nums[i];
      }
    }
    ranges.push(start === end ? '' + start : start + '-' + end);
    return ranges.join(', ');
  }

  function parseRangeString(str) {
    var set = new Set();
    var parts = str.split(',');
    parts.forEach(function (part) {
      part = part.trim();
      if (!part) return;
      var range = part.split('-');
      if (range.length === 1) {
        var n = parseInt(range[0], 10);
        if (n >= 1 && n <= totalPages) set.add(n);
      } else if (range.length === 2) {
        var r1 = parseInt(range[0], 10);
        var r2 = parseInt(range[1], 10);
        if (!isNaN(r1) && !isNaN(r2)) {
          var min = Math.max(1, Math.min(r1, r2));
          var max = Math.min(totalPages, Math.max(r1, r2));
          for (var i = min; i <= max; i++) set.add(i);
        }
      }
    });
    return set;
  }

  rangeInput.addEventListener('input', function () {
    selectedPages = parseRangeString(rangeInput.value);
    for (var i = 1; i <= totalPages; i++) {
      if (thumbCards[i]) {
        if (selectedPages.has(i)) thumbCards[i].classList.add('selected');
        else thumbCards[i].classList.remove('selected');
      }
    }
    extractBtn.disabled = selectedPages.size === 0;
  });

  selectAllBtn.addEventListener('click', function () {
    for (var i = 1; i <= totalPages; i++) {
      selectedPages.add(i);
      if (thumbCards[i]) thumbCards[i].classList.add('selected');
    }
    updateRangeInputFromSet();
  });

  clearAllBtn.addEventListener('click', function () {
    selectedPages.clear();
    for (var i = 1; i <= totalPages; i++) {
      if (thumbCards[i]) thumbCards[i].classList.remove('selected');
    }
    updateRangeInputFromSet();
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
    selectedPages.clear();
    if (dropzone) dropzone.style.display = 'block';
    fileInfo.style.display = 'none';
    actions.style.display = 'none';
    thumbGrid.innerHTML = '';
  });

  extractBtn.addEventListener('click', function () {
    if (!currentFile || selectedPages.size === 0) return;
    extractBtn.disabled = true;
    progressWrap.style.display = 'block';
    progressBar.style.width = '20%';
    statusText.textContent = 'Extracting pages...';

    var sortedNums = Array.from(selectedPages).sort(function (a, b) { return a - b; });
    var pageIndices = sortedNums.map(function (n) { return n - 1; });

    currentFile.arrayBuffer().then(function (buf) {
      return PDFLib.PDFDocument.load(buf, { ignoreEncryption: true });
    }).then(function (srcDoc) {
      return PDFLib.PDFDocument.create().then(function (outDoc) {
        return outDoc.copyPages(srcDoc, pageIndices).then(function (copiedPages) {
          copiedPages.forEach(function (page) {
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
      var outName = currentFile.name.replace(/\.pdf$/i, '') + '-extracted.pdf';
      downloadLink.download = outName;
      downloadLink.textContent = 'Download ' + outName;
      resultInfo.textContent = 'Extracted ' + sortedNums.length + ' page' + (sortedNums.length === 1 ? '' : 's') + ' (' + formatRangeString(sortedNums) + ').';

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
      alert('Error extracting pages: ' + err.message);
      progressWrap.style.display = 'none';
      extractBtn.disabled = false;
    });
  });

  resetBtn.addEventListener('click', function () {
    currentFile = null;
    selectedPages.clear();
    if (dropzone) dropzone.style.display = 'block';
    fileInfo.style.display = 'none';
    actions.style.display = 'none';
    resultBox.style.display = 'none';
    if (continueBox) continueBox.style.display = 'none';
    extractBtn.disabled = false;
    thumbGrid.innerHTML = '';
  });

  if (window.PdfHandoff) {
    PdfHandoff.take().then(function (result) {
      if (result && result.blob) {
        var f = new File([result.blob], result.filename || 'file.pdf', { type: 'application/pdf' });
        loadFile(f);
        PdfHandoff.showBanner('Continuing with ' + (result.filename || 'your file') + ' — select pages to extract.');
      }
    });
  }
})();
