(function () {
  var htmlInput = document.getElementById('htmlInput');
  var htmlPreviewIframe = document.getElementById('htmlPreviewIframe');
  var loadSampleHtmlBtn = document.getElementById('loadSampleHtmlBtn');
  var pageSize = document.getElementById('pageSize');
  var pageOrientation = document.getElementById('pageOrientation');
  var generatePdfBtn = document.getElementById('generatePdfBtn');
  var progressWrap = document.getElementById('progressWrap');
  var progressBar = document.getElementById('progressBar');
  var statusText = document.getElementById('statusText');
  var resultBox = document.getElementById('resultBox');
  var resultInfo = document.getElementById('resultInfo');
  var downloadPdfLink = document.getElementById('downloadPdfLink');

  function updatePreview() {
    var doc = htmlPreviewIframe.contentDocument || htmlPreviewIframe.contentWindow.document;
    doc.open();
    doc.write('<!DOCTYPE html><html><head><meta charset="utf-8"><style>body{margin:0;padding:12px;font-family:sans-serif;}</style></head><body>' + htmlInput.value + '</body></html>');
    doc.close();
  }

  htmlInput.addEventListener('input', updatePreview);
  updatePreview();

  loadSampleHtmlBtn.addEventListener('click', function () {
    htmlInput.value = '<div style="padding: 24px; font-family: -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif; color: #111827;">\n' +
      '  <div style="display:flex; justify-content:space-between; align-items:center; border-bottom: 2px solid #e5322d; padding-bottom: 12px; margin-bottom: 20px;">\n' +
      '    <h1 style="color: #e5322d; margin:0; font-size: 24px;">Daily1Step Project Brief</h1>\n' +
      '    <span style="background: #fee2e2; color: #b91c1c; padding: 4px 10px; border-radius: 12px; font-weight: bold; font-size: 12px;">CONFIDENTIAL</span>\n' +
      '  </div>\n' +
      '  <p style="font-size: 14px; line-height: 1.6; color: #4b5563;">This document outlines the core architecture and feature milestones for client-side document processing.</p>\n' +
      '  <h3 style="color: #1f2937; margin-top: 18px;">Key Milestones</h3>\n' +
      '  <ul style="color: #374151; font-size: 14px; line-height: 1.8;">\n' +
      '    <li><strong>Milestone 1:</strong> Complete 22 client-side PDF tool integrations</li>\n' +
      '    <li><strong>Milestone 2:</strong> Sub-second client-side WebAssembly execution</li>\n' +
      '    <li><strong>Milestone 3:</strong> Seamless IndexedDB cross-tool handoff</li>\n' +
      '  </ul>\n' +
      '</div>';
    updatePreview();
  });

  generatePdfBtn.addEventListener('click', function () {
    generatePdfBtn.disabled = true;
    progressWrap.style.display = 'block';
    progressBar.style.width = '20%';
    statusText.textContent = 'Rendering HTML to vector graphics...';

    // Page dimension mapping (points at 72 dpi)
    var isLandscape = pageOrientation.value === 'landscape';
    var pageDims = [595.28, 841.89]; // A4 default
    if (pageSize.value === 'letter') pageDims = [612.0, 792.0];
    if (pageSize.value === 'legal') pageDims = [612.0, 1008.0];

    var pw = isLandscape ? pageDims[1] : pageDims[0];
    var ph = isLandscape ? pageDims[0] : pageDims[1];

    // Create SVG foreignObject to render HTML to canvas
    var content = htmlInput.value;
    var svgWidth = 800;
    var svgHeight = Math.round(800 * (ph / pw));

    var svgString = '<svg xmlns="http://www.w3.org/2000/svg" width="' + svgWidth + '" height="' + svgHeight + '">' +
      '<foreignObject width="100%" height="100%">' +
      '<div xmlns="http://www.w3.org/1999/xhtml" style="background:#fff; width:100%; height:100%; box-sizing:border-box; font-family:sans-serif;">' +
      content +
      '</div>' +
      '</foreignObject>' +
      '</svg>';

    var img = new Image();
    var svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
    var url = URL.createObjectURL(svgBlob);

    img.onload = function () {
      progressBar.style.width = '60%';
      var canvas = document.createElement('canvas');
      canvas.width = svgWidth;
      canvas.height = svgHeight;
      var ctx = canvas.getContext('2d');
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);

      canvas.toBlob(function (blob) {
        blob.arrayBuffer().then(function (imgBuf) {
          return PDFLib.PDFDocument.create().then(function (doc) {
            return doc.embedPng(new Uint8Array(imgBuf)).then(function (pdfImg) {
              var page = doc.addPage([pw, ph]);
              page.drawImage(pdfImg, { x: 0, y: 0, width: pw, height: ph });
              progressBar.style.width = '85%';
              return doc.save();
            });
          });
        }).then(function (bytes) {
          var outBlob = new Blob([bytes], { type: 'application/pdf' });
          var outUrl = URL.createObjectURL(outBlob);
          downloadPdfLink.href = outUrl;
          downloadPdfLink.download = 'document.pdf';
          resultInfo.textContent = 'Document successfully generated (' + pageSize.value.toUpperCase() + ', ' + pageOrientation.value + ').';

          progressBar.style.width = '100%';
          progressWrap.style.display = 'none';
          resultBox.style.display = 'block';
          generatePdfBtn.disabled = false;
        }).catch(function (err) {
          console.error(err);
          alert('Error generating PDF: ' + err.message);
          progressWrap.style.display = 'none';
          generatePdfBtn.disabled = false;
        });
      }, 'image/png');
    };

    img.onerror = function () {
      alert('Could not render HTML. Please ensure all HTML tags are well-formed.');
      progressWrap.style.display = 'none';
      generatePdfBtn.disabled = false;
    };

    img.src = url;
  });
})();
