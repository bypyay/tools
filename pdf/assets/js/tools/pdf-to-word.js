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
  var actions = document.getElementById('actions');
  var convertBtn = document.getElementById('convertBtn');
  var progressWrap = document.getElementById('progressWrap');
  var progressBar = document.getElementById('progressBar');
  var statusText = document.getElementById('statusText');
  var resultBox = document.getElementById('resultBox');
  var resultInfo = document.getElementById('resultInfo');
  var downloadLink = document.getElementById('downloadLink');
  var resetBtn = document.getElementById('resetBtn');

  var currentFile = null;
  var pageCount = 0;

  function baseName(name) { return name.replace(/\.pdf$/i, ''); }

  function loadFile(file) {
    if (!file) return;
    if (file.type !== 'application/pdf' && !/\.pdf$/i.test(file.name)) {
      alert('Please select a PDF file.');
      return;
    }
    currentFile = file;
    file.arrayBuffer().then(function (buf) {
      return pdfjsLib.getDocument({ data: buf }).promise;
    }).then(function (pdf) {
      pageCount = pdf.numPages;
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

  // Groups a page's text items into visual lines (by y position), then
  // joins the items on each line left-to-right, inserting spaces where
  // there's a real gap between words.
  function extractPageLines(textContent, viewport) {
    var items = textContent.items.filter(function (it) { return it.str !== undefined; });
    var mapped = items.map(function (it) {
      var tx = pdfjsLib.Util.transform(viewport.transform, it.transform);
      return {
        str: it.str,
        x: tx[4],
        y: tx[5],
        width: (it.width || 0) * (viewport.scale || 1)
      };
    });
    mapped.sort(function (a, b) { return a.y - b.y || a.x - b.x; });

    var lines = [];
    var tolerance = 4;
    mapped.forEach(function (it) {
      var line = lines.length ? lines[lines.length - 1] : null;
      if (line && Math.abs(it.y - line.y) <= tolerance) {
        line.items.push(it);
      } else {
        lines.push({ y: it.y, items: [it] });
      }
    });

    return lines.map(function (line) {
      line.items.sort(function (a, b) { return a.x - b.x; });
      var text = '';
      var prevEndX = null;
      line.items.forEach(function (it) {
        if (prevEndX !== null && it.x - prevEndX > 2) text += ' ';
        text += it.str;
        prevEndX = it.x + it.width;
      });
      return text.trim();
    }).filter(function (t) { return t.length > 0; });
  }

  convertBtn.addEventListener('click', function () {
    if (!currentFile) return;
    convertBtn.disabled = true;
    progressWrap.style.display = 'block';
    progressBar.style.width = '0%';
    statusText.textContent = 'Reading PDF...';
    setTimeout(doConvert, 50);
  });

  function doConvert() {
    var name = baseName(currentFile.name);
    var paragraphs = [];
    var pagesWithNoText = 0;

    currentFile.arrayBuffer().then(function (buf) {
      return pdfjsLib.getDocument({ data: buf }).promise;
    }).then(function (pdf) {
      var numPages = pdf.numPages;
      var chain = Promise.resolve();
      for (var i = 1; i <= numPages; i++) {
        (function (pageNum) {
          chain = chain.then(function () {
            statusText.textContent = 'Extracting page ' + pageNum + '/' + numPages + '...';
            progressBar.style.width = Math.round(((pageNum - 1) / numPages) * 90) + '%';
            return pdf.getPage(pageNum).then(function (page) {
              var viewport = page.getViewport({ scale: 1 });
              return page.getTextContent().then(function (textContent) {
                var lines = extractPageLines(textContent, viewport);
                if (!lines.length) pagesWithNoText++;

                if (pageNum > 1) {
                  // Attach the page-break to the first paragraph of this page
                  // (or an empty one, if the page has no extractable text).
                  paragraphs.push(new docx.Paragraph({
                    pageBreakBefore: true,
                    children: [new docx.TextRun(lines.length ? lines[0] : '')]
                  }));
                  lines = lines.slice(1);
                } else if (!lines.length) {
                  paragraphs.push(new docx.Paragraph({ children: [new docx.TextRun('')] }));
                }

                lines.forEach(function (line) {
                  paragraphs.push(new docx.Paragraph({ children: [new docx.TextRun(line)] }));
                });
              });
            });
          });
        })(i);
      }
      return chain;
    }).then(function () {
      statusText.textContent = 'Building document...';
      progressBar.style.width = '95%';
      if (!paragraphs.length) {
        paragraphs.push(new docx.Paragraph({ children: [new docx.TextRun('(No extractable text was found in this PDF — it may be a scanned/image-only document.)')] }));
      }
      var doc = new docx.Document({ sections: [{ properties: {}, children: paragraphs }] });
      return docx.Packer.toBlob(doc);
    }).then(function (blob) {
      var url = URL.createObjectURL(blob);
      downloadLink.href = url;
      downloadLink.setAttribute('download', name + '.docx');
      resultInfo.textContent = pageCount + ' page' + (pageCount === 1 ? '' : 's') + ' converted' + (pagesWithNoText ? ' (' + pagesWithNoText + ' had no extractable text)' : '') + '.';
      progressBar.style.width = '100%';
      progressWrap.style.display = 'none';
      resultBox.style.display = 'block';
    }).catch(function (err) {
      console.error(err);
      statusText.textContent = 'Something went wrong: ' + err.message;
      convertBtn.disabled = false;
    });
  }

  resetBtn.addEventListener('click', function () {
    currentFile = null;
    pageCount = 0;
    fileInfo.style.display = 'none';
    actions.style.display = 'none';
    resultBox.style.display = 'none';
    convertBtn.disabled = false;
  });

  if (window.PdfHandoff) {
    PdfHandoff.take().then(function (result) {
      if (result && result.blob) {
        var f = new File([result.blob], result.filename || 'file.pdf', { type: 'application/pdf' });
        loadFile(f);
        PdfHandoff.showBanner('Continuing with ' + (result.filename || 'your file') + ' — click Convert to Word below.');
      }
    });
  }
})();
