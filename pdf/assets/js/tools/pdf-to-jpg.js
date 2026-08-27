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
  var qualitySelect = document.getElementById('qualitySelect');
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
    currentFile = null; pageCount = 0;
    if (dropzone) dropzone.style.display = 'block';
    fileInfo.style.display = 'none';
    actions.style.display = 'none';
  });

  function canvasToJpegBytes(canvas, quality) {
    return new Promise(function (resolve, reject) {
      canvas.toBlob(function (blob) {
        if (!blob) { reject(new Error('Could not encode page as image.')); return; }
        blob.arrayBuffer().then(function (buf) { resolve(new Uint8Array(buf)); });
      }, 'image/jpeg', 0.9);
    });
  }

  convertBtn.addEventListener('click', function () {
    if (!currentFile) return;
    var scale = parseFloat(qualitySelect.value);
    convertBtn.disabled = true;
    progressWrap.style.display = 'block';
    progressBar.style.width = '0%';
    statusText.textContent = 'Reading PDF...';
    setTimeout(function () { doConvert(scale); }, 50);
  });

  function doConvert(scale) {
    var name = baseName(currentFile.name);
    currentFile.arrayBuffer().then(function (buf) {
      return pdfjsLib.getDocument({ data: buf }).promise;
    }).then(function (pdf) {
      var numPages = pdf.numPages;
      var images = []; // { name, bytes }
      var chain = Promise.resolve();
      for (var i = 1; i <= numPages; i++) {
        (function (pageNum) {
          chain = chain.then(function () {
            statusText.textContent = 'Converting page ' + pageNum + '/' + numPages + '...';
            progressBar.style.width = Math.round(((pageNum - 1) / numPages) * 90) + '%';
            return pdf.getPage(pageNum).then(function (page) {
              var viewport = page.getViewport({ scale: scale * 2 }); // 2x for crisp screen->print quality
              var canvas = document.createElement('canvas');
              canvas.width = Math.round(viewport.width);
              canvas.height = Math.round(viewport.height);
              var ctx = canvas.getContext('2d');
              return page.render({ canvasContext: ctx, viewport: viewport }).promise.then(function () {
                return canvasToJpegBytes(canvas, 0.9);
              }).then(function (bytes) {
                var pageLabel = numPages > 1 ? String(pageNum).padStart(String(numPages).length, '0') : '1';
                images.push({ name: name + '_page' + pageLabel + '.jpg', bytes: bytes });
              });
            });
          });
        })(i);
      }
      return chain.then(function () { return images; });
    }).then(function (images) {
      statusText.textContent = 'Finalizing...';
      progressBar.style.width = '95%';
      if (images.length === 1) {
        var blob = new Blob([images[0].bytes], { type: 'image/jpeg' });
        var url = URL.createObjectURL(blob);
        downloadLink.href = url;
        downloadLink.setAttribute('download', images[0].name);
        resultInfo.textContent = '1 image ready.';
      } else {
        var zip = new JSZip();
        images.forEach(function (img) { zip.file(img.name, img.bytes); });
        return zip.generateAsync({ type: 'blob' }).then(function (zipBlob) {
          var url = URL.createObjectURL(zipBlob);
          downloadLink.href = url;
          downloadLink.setAttribute('download', name + '_images.zip');
          resultInfo.textContent = images.length + ' images converted.';
        });
      }
    }).then(function () {
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
    currentFile = null; pageCount = 0;
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
        PdfHandoff.showBanner('Continuing with ' + (result.filename || 'your file') + ' — pick a quality below and convert.');
      }
    });
  }
})();
