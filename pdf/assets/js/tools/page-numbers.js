(function () {
  var dropzone = document.getElementById('dropzone');
  var fileInput = document.getElementById('fileInput');
  var fileInfo = document.getElementById('fileInfo');
  var fileNameEl = document.getElementById('fileName');
  var pageCountEl = document.getElementById('pageCount');
  var removeFileBtn = document.getElementById('removeFile');
  var actions = document.getElementById('actions');
  var applyBtn = document.getElementById('applyBtn');
  var progressWrap = document.getElementById('progressWrap');
  var progressBar = document.getElementById('progressBar');
  var statusText = document.getElementById('statusText');
  var resultBox = document.getElementById('resultBox');
  var resultInfo = document.getElementById('resultInfo');
  var downloadLink = document.getElementById('downloadLink');
  var resetBtn = document.getElementById('resetBtn');
  var continueBox = document.getElementById('continueBox');
  var continueGrid = document.getElementById('continueGrid');

  var pnPosition = document.getElementById('pnPosition');
  var pnFormat = document.getElementById('pnFormat');
  var pnStart = document.getElementById('pnStart');
  var pnSize = document.getElementById('pnSize');

  var currentFile = null;
  var pageCount = 0;

  function loadFile(file) {
    if (!file) return;
    if (file.type !== 'application/pdf' && !/\.pdf$/i.test(file.name)) {
      alert('Please select a PDF file.');
      return;
    }
    currentFile = file;
    file.arrayBuffer().then(function (buf) {
      return PDFLib.PDFDocument.load(buf, { ignoreEncryption: true });
    }).then(function (doc) {
      pageCount = doc.getPageCount();
      fileNameEl.textContent = file.name;
      pageCountEl.textContent = pageCount + ' page' + (pageCount === 1 ? '' : 's');
      if (dropzone) dropzone.style.display = 'none';
    fileInfo.style.display = 'block';
      actions.style.display = 'block';
    }).catch(function (err) {
      console.error(err);
      alert('Could not read this PDF. It may be corrupted or password-protected.');
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
    pageCount = 0;
    if (dropzone) dropzone.style.display = 'block';
    fileInfo.style.display = 'none';
    actions.style.display = 'none';
  });

  function formatLabel(format, num, total) {
    switch (format) {
      case 'page-n': return 'Page ' + num;
      case 'n-of-total': return num + ' / ' + total;
      case 'page-n-of-total': return 'Page ' + num + ' of ' + total;
      default: return String(num);
    }
  }

  applyBtn.addEventListener('click', function () {
    if (!currentFile) return;
    applyBtn.disabled = true;
    progressWrap.style.display = 'block';
    progressBar.style.width = '0%';
    statusText.textContent = 'Adding page numbers...';
    setTimeout(doApply, 50);
  });

  function doApply() {
    var position = pnPosition.value;
    var format = pnFormat.value;
    var start = parseInt(pnStart.value, 10) || 0;
    var size = parseFloat(pnSize.value) || 11;
    var margin = 24;

    currentFile.arrayBuffer().then(function (buf) {
      return PDFLib.PDFDocument.load(buf, { ignoreEncryption: true });
    }).then(function (doc) {
      return doc.embedFont(PDFLib.StandardFonts.Helvetica).then(function (font) {
        var pages = doc.getPages();
        var total = pages.length;
        pages.forEach(function (page, index) {
          progressBar.style.width = Math.round((index / pages.length) * 90) + '%';
          var num = start + index;
          var label = formatLabel(format, num, total + start - 1);
          var textWidth = font.widthOfTextAtSize(label, size);
          var w = page.getWidth();
          var h = page.getHeight();
          var x, y;
          if (position.indexOf('right') !== -1) x = w - margin - textWidth;
          else if (position.indexOf('left') !== -1) x = margin;
          else x = (w - textWidth) / 2;
          y = position.indexOf('top') !== -1 ? h - margin : margin - size * 0.3;

          page.drawText(label, { x: x, y: y, size: size, font: font, color: PDFLib.rgb(0.1, 0.1, 0.1) });
        });
        return doc.save();
      });
    }).then(function (bytes) {
      var blob = new Blob([bytes], { type: 'application/pdf' });
      var url = URL.createObjectURL(blob);
      downloadLink.href = url;
      resultInfo.textContent = pageCount + ' page' + (pageCount === 1 ? '' : 's') + ' numbered.';
      progressBar.style.width = '100%';
      progressWrap.style.display = 'none';
      resultBox.style.display = 'block';
      if (window.PdfHandoff && continueBox && continueGrid) {
        PdfHandoff.renderContinueBox(continueGrid, ['merge-pdf', 'split-pdf', 'compress-pdf', 'pdf-to-jpg'], function () {
          return { blob: blob, filename: 'numbered.pdf' };
        });
        continueBox.style.display = 'block';
      }
    }).catch(function (err) {
      console.error(err);
      statusText.textContent = 'Something went wrong: ' + err.message;
      applyBtn.disabled = false;
    });
  }

  resetBtn.addEventListener('click', function () {
    currentFile = null;
    pageCount = 0;
    fileInfo.style.display = 'none';
    actions.style.display = 'none';
    resultBox.style.display = 'none';
    if (continueBox) continueBox.style.display = 'none';
    applyBtn.disabled = false;
  });

  if (window.PdfHandoff) {
    PdfHandoff.take().then(function (result) {
      if (result && result.blob) {
        var f = new File([result.blob], result.filename || 'file.pdf', { type: 'application/pdf' });
        loadFile(f);
        PdfHandoff.showBanner('Continuing with ' + (result.filename || 'your file') + ' — choose a position below.');
      }
    });
  }
})();
