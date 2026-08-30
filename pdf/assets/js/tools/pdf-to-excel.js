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
  var downloadXlsxLink = document.getElementById('downloadXlsxLink');
  var btnDownloadCsv = document.getElementById('btnDownloadCsv');
  var btnCopyClipboard = document.getElementById('btnCopyClipboard');
  var btnDownloadJson = document.getElementById('btnDownloadJson');
  var resetBtn = document.getElementById('resetBtn');
  var previewTableWrap = document.getElementById('previewTableWrap');
  var previewTableHead = document.getElementById('previewTableHead');
  var previewTableBody = document.getElementById('previewTableBody');
  var previewStatsBadge = document.getElementById('previewStatsBadge');
  var selSheetMode = document.getElementById('selSheetMode');
  var chkFormatNumbers = document.getElementById('chkFormatNumbers');
  var chkEnableOcr = document.getElementById('chkEnableOcr');

  var currentFile = null;
  var pdfDoc = null;
  var pageCount = 0;
  var extractedWorkbook = null;
  var extractedMasterGrid = [];

  function baseName(name) {
    return name.replace(/\.pdf$/i, '');
  }

  // 3. File Loading & Validation
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
      pdfDoc = pdf;
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

  // Dropzone Events
  if (dropzone) {
    dropzone.addEventListener('click', function () { fileInput.click(); });
    fileInput.addEventListener('change', function (e) {
      loadFile(e.target.files[0]);
      fileInput.value = '';
    });
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
      if (e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files[0]) {
        loadFile(e.dataTransfer.files[0]);
      }
    });
  }

  if (removeFileBtn) {
    removeFileBtn.addEventListener('click', function () {
      currentFile = null;
      pdfDoc = null;
      pageCount = 0;
      if (dropzone) dropzone.style.display = 'block';
      if (fileInfo) fileInfo.style.display = 'none';
      if (actions) actions.style.display = 'none';
    });
  }

  // 4. Advanced 2D Coordinate Table Grid Reconstruction Algorithm
  function extractTableGridFromPageText(textContent, viewport) {
    var rawItems = textContent.items.filter(function (it) {
      return it.str !== undefined && it.str.trim().length > 0;
    });

    if (!rawItems.length) return [];

    // Map items to viewport coordinates
    var items = rawItems.map(function (it) {
      var tx = pdfjsLib.Util.transform(viewport.transform, it.transform);
      var fontHeight = Math.sqrt((tx[2] * tx[2]) + (tx[3] * tx[3])) || 10;
      return {
        str: it.str,
        x: tx[4],
        y: tx[5],
        width: (it.width || 0) * (viewport.scale || 1),
        height: fontHeight
      };
    });

    // Sort items by Y (top to bottom), then X (left to right)
    items.sort(function (a, b) {
      return a.y - b.y || a.x - b.x;
    });

    // Cluster into horizontal rows
    var rows = [];
    var rowTolerance = 5; // vertical px tolerance
    items.forEach(function (it) {
      var matchingRow = null;
      for (var r = 0; r < rows.length; r++) {
        if (Math.abs(rows[r].y - it.y) <= rowTolerance) {
          matchingRow = rows[r];
          break;
        }
      }
      if (matchingRow) {
        matchingRow.items.push(it);
        matchingRow.y = (matchingRow.y + it.y) / 2; // moving average
      } else {
        rows.push({ y: it.y, items: [it] });
      }
    });

    // Sort rows from top of the page to bottom
    rows.sort(function (a, b) { return a.y - b.y; });

    // Detect column boundaries across all rows
    var allXPositions = [];
    rows.forEach(function (row) {
      row.items.sort(function (a, b) { return a.x - b.x; });
      row.items.forEach(function (it) {
        allXPositions.push(it.x);
      });
    });

    allXPositions.sort(function (a, b) { return a - b; });

    // Cluster X positions into column intervals
    var colClusters = [];
    var colTolerance = 14; // horizontal px tolerance for column headers/cells
    allXPositions.forEach(function (x) {
      var found = false;
      for (var c = 0; c < colClusters.length; c++) {
        if (Math.abs(colClusters[c].center - x) <= colTolerance) {
          colClusters[c].count++;
          colClusters[c].min = Math.min(colClusters[c].min, x);
          colClusters[c].max = Math.max(colClusters[c].max, x);
          colClusters[c].center = (colClusters[c].min + colClusters[c].max) / 2;
          found = true;
          break;
        }
      }
      if (!found) {
        colClusters.push({ min: x, max: x, center: x, count: 1 });
      }
    });

    // Sort column clusters left to right
    colClusters.sort(function (a, b) { return a.center - b.center; });

    // Build 2D Grid Matrix
    var grid = [];
    rows.forEach(function (row) {
      var rowArray = new Array(colClusters.length).fill('');
      row.items.forEach(function (it) {
        // Find closest column cluster
        var bestColIdx = 0;
        var minDist = 99999;
        for (var c = 0; c < colClusters.length; c++) {
          var dist = Math.abs(colClusters[c].center - it.x);
          if (dist < minDist) {
            minDist = dist;
            bestColIdx = c;
          }
        }
        if (rowArray[bestColIdx]) {
          rowArray[bestColIdx] += ' ' + it.str;
        } else {
          rowArray[bestColIdx] = it.str;
        }
      });

      // Clean cells
      var cleanedRow = rowArray.map(function (cell) {
        return (cell || '').trim();
      });

      // Only add non-empty rows
      if (cleanedRow.some(function (c) { return c.length > 0; })) {
        grid.push(cleanedRow);
      }
    });

    return grid;
  }

  // 5. OCR Fallback for Scanned PDF Pages using Tesseract
  async function extractOcrGridFromPage(page) {
    if (typeof Tesseract === 'undefined') return [];
    try {
      var scale = 2.0;
      var viewport = page.getViewport({ scale: scale });
      var offCanvas = document.createElement('canvas');
      offCanvas.width = viewport.width;
      offCanvas.height = viewport.height;
      var ctx = offCanvas.getContext('2d');

      await page.render({ canvasContext: ctx, viewport: viewport }).promise;

      var result = await Tesseract.recognize(offCanvas, 'eng', {
        logger: function (m) {
          if (m.status === 'recognizing text' && m.progress) {
            statusText.textContent = 'OCR Scanning page... ' + Math.round(m.progress * 100) + '%';
          }
        }
      });

      if (!result || !result.data || !result.data.lines) return [];

      var lines = result.data.lines;
      var grid = [];
      lines.forEach(function (line) {
        var lineText = (line.text || '').trim();
        if (lineText.length > 0) {
          // Split by multiple spaces or tabs into columns
          var cols = lineText.split(/\s{2,}|\t/).map(function (s) { return s.trim(); }).filter(function (s) { return s.length > 0; });
          if (cols.length > 0) grid.push(cols);
        }
      });
      return grid;
    } catch (e) {
      console.warn('OCR error:', e);
      return [];
    }
  }

  // 6. Smart Type Parsing (Numbers, Currency, Dates)
  function formatCellValue(val, autoFormat) {
    if (!autoFormat || typeof val !== 'string') return val;
    var trimmed = val.trim();
    if (!trimmed) return '';

    // Check for pure number or decimal (e.g. "1234", "1234.56", "-45.20")
    var cleanNumStr = trimmed.replace(/,/g, '');
    if (/^-?\d+(\.\d+)?$/.test(cleanNumStr)) {
      var num = parseFloat(cleanNumStr);
      if (!isNaN(num)) return num;
    }

    // Check for percentage (e.g. "45.5%")
    if (/^-?\d+(\.\d+)?%$/.test(cleanNumStr)) {
      var pctNum = parseFloat(cleanNumStr.replace('%', ''));
      if (!isNaN(pctNum)) return pctNum / 100;
    }

    return trimmed;
  }

  // 7. Convert Button Handler
  if (convertBtn) {
    convertBtn.addEventListener('click', function () {
      if (!currentFile || !pdfDoc) return;
      convertBtn.disabled = true;
      progressWrap.style.display = 'block';
      progressBar.style.width = '0%';
      statusText.textContent = 'Initializing extraction engine...';
      setTimeout(doConvert, 60);
    });
  }

  async function doConvert() {
    var name = baseName(currentFile.name);
    var isMultiSheet = selSheetMode ? (selSheetMode.value === 'multi') : false;
    var autoFormat = chkFormatNumbers ? chkFormatNumbers.checked : true;
    var enableOcr = chkEnableOcr ? chkEnableOcr.checked : true;

    var wb = XLSX.utils.book_new();
    var masterGrid = [];
    var totalRowsExtracted = 0;
    var maxColsExtracted = 0;

    try {
      for (var pageNum = 1; pageNum <= pageCount; pageNum++) {
        statusText.textContent = 'Extracting tables from page ' + pageNum + ' of ' + pageCount + '...';
        progressBar.style.width = Math.round(((pageNum - 1) / pageCount) * 85) + '%';

        var page = await pdfDoc.getPage(pageNum);
        var viewport = page.getViewport({ scale: 1.0 });
        var textContent = await page.getTextContent({ normalizeWhitespace: true });

        var pageGrid = extractTableGridFromPageText(textContent, viewport);

        // If no text found on page and OCR enabled, run OCR fallback
        if (pageGrid.length === 0 && enableOcr) {
          statusText.textContent = 'Scanned page detected. Running OCR on page ' + pageNum + '...';
          pageGrid = await extractOcrGridFromPage(page);
        }

        // Format grid cell values (Numbers, Currency, Math values)
        var formattedPageGrid = pageGrid.map(function (row) {
          return row.map(function (cell) {
            return formatCellValue(cell, autoFormat);
          });
        });

        // Track max columns
        formattedPageGrid.forEach(function (r) {
          maxColsExtracted = Math.max(maxColsExtracted, r.length);
        });

        totalRowsExtracted += formattedPageGrid.length;

        if (isMultiSheet) {
          // Normalize row column lengths
          var normalizedGrid = formattedPageGrid.map(function (r) {
            while (r.length < maxColsExtracted) r.push('');
            return r;
          });
          var ws = XLSX.utils.aoa_to_sheet(normalizedGrid.length ? normalizedGrid : [['(No table data on this page)']]);
          autoFitColumnWidths(ws, normalizedGrid);
          XLSX.utils.book_append_sheet(wb, ws, 'Page ' + pageNum);
        } else {
          if (formattedPageGrid.length > 0) {
            if (masterGrid.length > 0 && pageNum > 1) {
              // Add a page divider indicator in combined mode if helpful
              // masterGrid.push(['--- Page ' + pageNum + ' ---']);
            }
            formattedPageGrid.forEach(function (r) {
              masterGrid.push(r);
            });
          }
        }
      }

      // If combined mode, build the single master sheet
      if (!isMultiSheet) {
        if (!masterGrid.length) {
          masterGrid.push(['No tabular data could be extracted from this PDF.']);
        }
        // Normalize column lengths
        var normalizedMasterGrid = masterGrid.map(function (r) {
          while (r.length < maxColsExtracted) r.push('');
          return r;
        });
        var wsMaster = XLSX.utils.aoa_to_sheet(normalizedMasterGrid);
        autoFitColumnWidths(wsMaster, normalizedMasterGrid);
        XLSX.utils.book_append_sheet(wb, wsMaster, 'PDF_Table_Data');
        extractedMasterGrid = normalizedMasterGrid;
      } else {
        extractedMasterGrid = masterGrid;
      }

      extractedWorkbook = wb;

      statusText.textContent = 'Finalizing Excel spreadsheet...';
      progressBar.style.width = '100%';

      // Generate XLSX binary blob
      var wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
      var xlsxBlob = new Blob([wbout], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      var xlsxUrl = URL.createObjectURL(xlsxBlob);

      downloadXlsxLink.href = xlsxUrl;
      downloadXlsxLink.setAttribute('download', name + '.xlsx');

      // Populate Live Table Preview
      renderPreviewTable(extractedMasterGrid);

      resultInfo.textContent = pageCount + ' page' + (pageCount === 1 ? '' : 's') + ' successfully converted &bull; ' + totalRowsExtracted + ' rows extracted across ' + maxColsExtracted + ' columns.';
      if (previewStatsBadge) {
        previewStatsBadge.textContent = totalRowsExtracted + ' Rows Extracted \u2022 ' + maxColsExtracted + ' Columns';
      }

      progressWrap.style.display = 'none';
      resultBox.style.display = 'block';
      if (previewTableWrap) previewTableWrap.style.display = 'block';

    } catch (err) {
      console.error(err);
      statusText.textContent = 'Conversion error: ' + err.message;
      convertBtn.disabled = false;
    }
  }

  // 8. Auto-fit Column Widths in SheetJS Worksheet
  function autoFitColumnWidths(ws, grid) {
    if (!grid || !grid.length) return;
    var colWidths = [];
    grid.forEach(function (row) {
      row.forEach(function (cell, cIdx) {
        var cellLen = (cell !== undefined && cell !== null) ? String(cell).length : 0;
        colWidths[cIdx] = Math.max(colWidths[cIdx] || 10, cellLen + 3);
      });
    });
    ws['!cols'] = colWidths.map(function (w) {
      return { wch: Math.min(w, 50) };
    });
  }

  // 9. Render Interactive Live Table Preview (First 50 Rows)
  function renderPreviewTable(grid) {
    if (!previewTableHead || !previewTableBody) return;
    previewTableHead.innerHTML = '';
    previewTableBody.innerHTML = '';

    if (!grid || !grid.length) return;

    var maxCols = 0;
    grid.forEach(function (r) { maxCols = Math.max(maxCols, r.length); });

    // Table Header Row (A, B, C, D...)
    var trHead = document.createElement('tr');
    var thRowIdx = document.createElement('th');
    thRowIdx.textContent = '#';
    thRowIdx.style.width = '40px';
    thRowIdx.style.textAlign = 'center';
    thRowIdx.style.background = '#0d6535';
    trHead.appendChild(thRowIdx);

    for (var c = 0; c < maxCols; c++) {
      var th = document.createElement('th');
      // Column letters A, B, C...
      var colLetter = String.fromCharCode(65 + (c % 26));
      if (c >= 26) colLetter = 'A' + colLetter;
      th.textContent = colLetter;
      trHead.appendChild(th);
    }
    previewTableHead.appendChild(trHead);

    // Table Body (Show first 50 rows)
    var previewRows = grid.slice(0, 50);
    previewRows.forEach(function (row, rIdx) {
      var tr = document.createElement('tr');
      var tdIdx = document.createElement('td');
      tdIdx.textContent = (rIdx + 1);
      tdIdx.style.fontWeight = '700';
      tdIdx.style.color = '#64748b';
      tdIdx.style.textAlign = 'center';
      tdIdx.style.background = '#f1f5f9';
      tr.appendChild(tdIdx);

      for (var c = 0; c < maxCols; c++) {
        var td = document.createElement('td');
        var val = (row[c] !== undefined && row[c] !== null) ? row[c] : '';
        td.textContent = val;
        tr.appendChild(td);
      }
      previewTableBody.appendChild(tr);
    });
  }

  // 10. Multi-Format Export Handlers (CSV, Clipboard, JSON)
  if (btnDownloadCsv) {
    btnDownloadCsv.addEventListener('click', function () {
      if (!extractedWorkbook) return;
      var firstSheetName = extractedWorkbook.SheetNames[0];
      var ws = extractedWorkbook.Sheets[firstSheetName];
      var csv = XLSX.utils.sheet_to_csv(ws);
      // Add UTF-8 BOM so Excel opens non-ASCII/Hindi characters properly
      var blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
      var a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = baseName(currentFile.name) + '.csv';
      document.body.appendChild(a);
      a.click();
      setTimeout(function () { a.remove(); }, 200);
    });
  }

  if (btnCopyClipboard) {
    btnCopyClipboard.addEventListener('click', function () {
      if (!extractedMasterGrid || !extractedMasterGrid.length) return;
      var tsv = extractedMasterGrid.map(function (row) {
        return row.map(function (cell) {
          var s = (cell === undefined || cell === null) ? '' : String(cell);
          return s.replace(/\t/g, ' ').replace(/\n/g, ' ');
        }).join('\t');
      }).join('\n');

      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(tsv).then(function () {
          alert('\u2705 Table data copied to clipboard!\n\nYou can now paste (Ctrl+V) directly into Microsoft Excel, Google Sheets, or Numbers with formatted rows and columns.');
        }).catch(function () {
          prompt('Copy extracted table data:', tsv);
        });
      } else {
        prompt('Copy extracted table data:', tsv);
      }
    });
  }

  if (btnDownloadJson) {
    btnDownloadJson.addEventListener('click', function () {
      if (!extractedMasterGrid || !extractedMasterGrid.length) return;
      var jsonStr = JSON.stringify(extractedMasterGrid, null, 2);
      var blob = new Blob([jsonStr], { type: 'application/json;charset=utf-8;' });
      var a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = baseName(currentFile.name) + '.json';
      document.body.appendChild(a);
      a.click();
      setTimeout(function () { a.remove(); }, 200);
    });
  }

  // 11. Reset Button
  if (resetBtn) {
    resetBtn.addEventListener('click', function () {
      currentFile = null;
      pdfDoc = null;
      pageCount = 0;
      extractedWorkbook = null;
      extractedMasterGrid = [];
      if (fileInfo) fileInfo.style.display = 'none';
      if (actions) actions.style.display = 'none';
      if (resultBox) resultBox.style.display = 'none';
      if (previewTableWrap) previewTableWrap.style.display = 'none';
      if (dropzone) dropzone.style.display = 'block';
      if (convertBtn) convertBtn.disabled = false;
    });
  }

  // 12. Handoff from other PDF Tools
  if (window.PdfHandoff) {
    PdfHandoff.take().then(function (result) {
      if (result && result.blob) {
        var f = new File([result.blob], result.filename || 'file.pdf', { type: 'application/pdf' });
        loadFile(f);
        PdfHandoff.showBanner('Continuing with ' + (result.filename || 'your file') + ' \u2014 click Convert to Excel below.');
      }
    });
  }
})();
