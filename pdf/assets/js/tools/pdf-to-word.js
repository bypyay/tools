(function () {
  'use strict';

  // 1. Initialize PDF.js Worker
  if (window.pdfjsLib) {
    var pdfScriptTag = document.querySelector('script[src*="vendor/pdf.min.js"]');
    var siteRoot = pdfScriptTag ? pdfScriptTag.getAttribute('src').replace(/vendor\/pdf\.min\.js.*$/, '') : '';
    pdfjsLib.GlobalWorkerOptions.workerSrc = siteRoot + 'vendor/pdf.worker.min.js';
  }

  // 2. DOM Elements
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
  var extractedAllText = '';

  function baseName(name) { return name.replace(/\.pdf$/i, ''); }

  function loadFile(file) {
    if (!file) return;
    if (file.type !== 'application/pdf' && !/\.pdf$/i.test(file.name)) {
      alert('Please select a valid PDF file.');
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
      if (fileInfo) fileInfo.style.display = 'block';
      if (actions) actions.style.display = 'block';
    }).catch(function (err) {
      console.error(err);
      alert('Could not read this PDF. It may be corrupted or password-protected.');
      currentFile = null;
    });
  }

  if (dropzone) {
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
  }

  if (removeFileBtn) {
    removeFileBtn.addEventListener('click', function () {
      currentFile = null;
      pageCount = 0;
      if (dropzone) dropzone.style.display = 'block';
      if (fileInfo) fileInfo.style.display = 'none';
      if (actions) actions.style.display = 'none';
    });
  }

  // 3. Extract Structured Lines and Tables with Coordinates
  function extractPageStructuredElements(textContent, viewport) {
    var rawItems = textContent.items.filter(function (it) { return it.str !== undefined && it.str.trim().length > 0; });
    if (!rawItems.length) return [];

    var mapped = rawItems.map(function (it) {
      var tx = pdfjsLib.Util.transform(viewport.transform, it.transform);
      var fontHeight = Math.round(Math.sqrt((tx[2] * tx[2]) + (tx[3] * tx[3])) || 12);
      return {
        str: it.str,
        x: tx[4],
        y: tx[5],
        width: (it.width || 0) * (viewport.scale || 1),
        fontSize: fontHeight,
        fontName: it.fontName || ''
      };
    });

    mapped.sort(function (a, b) { return a.y - b.y || a.x - b.x; });

    // Group into visual lines
    var lines = [];
    var tolerance = 4;
    mapped.forEach(function (it) {
      var line = lines.length ? lines[lines.length - 1] : null;
      if (line && Math.abs(it.y - line.y) <= tolerance) {
        line.items.push(it);
        line.fontSize = Math.max(line.fontSize, it.fontSize);
      } else {
        lines.push({ y: it.y, items: [it], fontSize: it.fontSize });
      }
    });

    // Detect if lines form a table or standard paragraphs
    var elements = [];
    var currentTableRows = [];

    lines.forEach(function (line) {
      line.items.sort(function (a, b) { return a.x - b.x; });

      // Check for columnar text (gaps > 25px between items on same line)
      var cols = [];
      var curCol = '';
      var prevEndX = null;
      line.items.forEach(function (it) {
        if (prevEndX !== null && it.x - prevEndX > 25) {
          if (curCol.trim().length > 0) cols.push(curCol.trim());
          curCol = it.str;
        } else {
          if (prevEndX !== null && it.x - prevEndX > 2) curCol += ' ';
          curCol += it.str;
        }
        prevEndX = it.x + it.width;
      });
      if (curCol.trim().length > 0) cols.push(curCol.trim());

      // If line has 2 or more distinct columns, it is likely a table row
      if (cols.length >= 2) {
        currentTableRows.push(cols);
      } else {
        // If we had a table accumulating, flush it
        if (currentTableRows.length >= 2) {
          elements.push({ type: 'table', rows: currentTableRows });
          currentTableRows = [];
        } else if (currentTableRows.length === 1) {
          elements.push({ type: 'paragraph', text: currentTableRows[0].join('   '), fontSize: line.fontSize });
          currentTableRows = [];
        }

        var fullText = line.items.map(function(it){ return it.str; }).join(' ').trim();
        if (fullText.length > 0) {
          var isHeading = line.fontSize >= 18;
          var isSubHeading = line.fontSize >= 14 && line.fontSize < 18;
          elements.push({
            type: 'paragraph',
            text: fullText,
            fontSize: line.fontSize,
            isHeading: isHeading,
            isSubHeading: isSubHeading
          });
        }
      }
    });

    if (currentTableRows.length >= 2) {
      elements.push({ type: 'table', rows: currentTableRows });
    } else if (currentTableRows.length === 1) {
      elements.push({ type: 'paragraph', text: currentTableRows[0].join('   '), fontSize: 12 });
    }

    return elements;
  }

  // 4. OCR Fallback for Scanned PDF Pages
  async function extractOcrTextFromPage(page) {
    if (typeof Tesseract === 'undefined') return [];
    try {
      var viewport = page.getViewport({ scale: 2.0 });
      var offCanvas = document.createElement('canvas');
      offCanvas.width = viewport.width;
      offCanvas.height = viewport.height;
      var ctx = offCanvas.getContext('2d');

      await page.render({ canvasContext: ctx, viewport: viewport }).promise;

      var result = await Tesseract.recognize(offCanvas, 'eng');
      if (!result || !result.data || !result.data.lines) return [];

      return result.data.lines.map(function (l) {
        return { type: 'paragraph', text: (l.text || '').trim(), fontSize: 12 };
      }).filter(function (el) { return el.text.length > 0; });
    } catch (e) {
      console.warn('OCR error:', e);
      return [];
    }
  }

  if (convertBtn) {
    convertBtn.addEventListener('click', function () {
      if (!currentFile) return;
      convertBtn.disabled = true;
      progressWrap.style.display = 'block';
      progressBar.style.width = '0%';
      statusText.textContent = 'Reading PDF structure...';
      setTimeout(doConvert, 60);
    });
  }

  async function doConvert() {
    var name = baseName(currentFile.name);
    var docChildren = [];
    var pagesWithNoText = 0;
    var rawTextCollector = [];

    try {
      var buf = await currentFile.arrayBuffer();
      var pdf = await pdfjsLib.getDocument({ data: buf }).promise;
      var numPages = pdf.numPages;

      for (var i = 1; i <= numPages; i++) {
        statusText.textContent = 'Extracting page ' + i + ' of ' + numPages + '...';
        progressBar.style.width = Math.round(((i - 1) / numPages) * 88) + '%';

        var page = await pdf.getPage(i);
        var viewport = page.getViewport({ scale: 1.0 });
        var textContent = await page.getTextContent({ normalizeWhitespace: true });

        var elements = extractPageStructuredElements(textContent, viewport);

        // Scanned OCR fallback
        if (elements.length === 0) {
          statusText.textContent = 'Scanned page detected. Running OCR on page ' + i + '...';
          elements = await extractOcrTextFromPage(page);
          if (!elements.length) pagesWithNoText++;
        }

        if (i > 1) {
          // Page break
          docChildren.push(new docx.Paragraph({
            pageBreakBefore: true,
            children: []
          }));
        }

        elements.forEach(function (el) {
          if (el.type === 'paragraph') {
            rawTextCollector.push(el.text);
            if (el.isHeading) {
              docChildren.push(new docx.Paragraph({
                heading: docx.HeadingLevel.HEADING_1,
                spacing: { before: 240, after: 120 },
                children: [new docx.TextRun({ text: el.text, bold: true, size: 32, color: '18191F' })]
              }));
            } else if (el.isSubHeading) {
              docChildren.push(new docx.Paragraph({
                heading: docx.HeadingLevel.HEADING_2,
                spacing: { before: 180, after: 90 },
                children: [new docx.TextRun({ text: el.text, bold: true, size: 26, color: '2B5CE9' })]
              }));
            } else {
              docChildren.push(new docx.Paragraph({
                spacing: { before: 60, after: 60, line: 276 },
                children: [new docx.TextRun({ text: el.text, size: 22, color: '222222' })]
              }));
            }
          } else if (el.type === 'table') {
            // Build Native Word DOCX Table
            var maxCols = 0;
            el.rows.forEach(function (r) { maxCols = Math.max(maxCols, r.length); });

            var tableRows = el.rows.map(function (row, rIdx) {
              var isHeader = (rIdx === 0);
              var cells = [];
              for (var c = 0; c < maxCols; c++) {
                var cellText = row[c] || '';
                cells.push(new docx.TableCell({
                  children: [new docx.Paragraph({
                    children: [new docx.TextRun({
                      text: cellText,
                      bold: isHeader,
                      size: isHeader ? 22 : 20
                    })]
                  })],
                  shading: isHeader ? { fill: 'F1F5F9' } : undefined,
                  margins: { top: 100, bottom: 100, left: 150, right: 150 }
                }));
              }
              return new docx.TableRow({
                children: cells,
                tableHeader: isHeader
              });
            });

            docChildren.push(new docx.Table({
              rows: tableRows,
              width: { size: 100, type: docx.WidthType.PERCENTAGE },
              spacing: { before: 180, after: 180 }
            }));
          }
        });
      }

      statusText.textContent = 'Building Word (.docx) document...';
      progressBar.style.width = '96%';

      if (!docChildren.length) {
        docChildren.push(new docx.Paragraph({ children: [new docx.TextRun('(No extractable text found in this PDF document.)')] }));
      }

      var doc = new docx.Document({
        sections: [{
          properties: {
            page: {
              margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 }
            }
          },
          children: docChildren
        }]
      });

      var blob = await docx.Packer.toBlob(doc);
      var url = URL.createObjectURL(blob);
      downloadLink.href = url;
      downloadLink.setAttribute('download', name + '.docx');

      extractedAllText = rawTextCollector.join('\n\n');

      resultInfo.textContent = pageCount + ' page' + (pageCount === 1 ? '' : 's') + ' converted with native tables & headings' + (pagesWithNoText ? ' (' + pagesWithNoText + ' had no text)' : '') + '.';
      progressBar.style.width = '100%';
      progressWrap.style.display = 'none';
      resultBox.style.display = 'block';

    } catch (err) {
      console.error(err);
      statusText.textContent = 'Something went wrong: ' + err.message;
      convertBtn.disabled = false;
    }
  }

  if (resetBtn) {
    resetBtn.addEventListener('click', function () {
      currentFile = null;
      pageCount = 0;
      if (fileInfo) fileInfo.style.display = 'none';
      if (actions) actions.style.display = 'none';
      if (resultBox) resultBox.style.display = 'none';
      if (dropzone) dropzone.style.display = 'block';
      if (convertBtn) convertBtn.disabled = false;
    });
  }

  if (window.PdfHandoff) {
    PdfHandoff.take().then(function (result) {
      if (result && result.blob) {
        var f = new File([result.blob], result.filename || 'file.pdf', { type: 'application/pdf' });
        loadFile(f);
        PdfHandoff.showBanner('Continuing with ' + (result.filename || 'your file') + ' \u2014 click Convert to Word below.');
      }
    });
  }
})();
