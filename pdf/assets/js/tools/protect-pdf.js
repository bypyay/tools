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
  var userPwInput = document.getElementById('userPw');
  var confirmPwInput = document.getElementById('confirmPw');
  var pwMismatch = document.getElementById('pwMismatch');
  var allowPrinting = document.getElementById('allowPrinting');
  var allowCopying = document.getElementById('allowCopying');
  var allowModifying = document.getElementById('allowModifying');
  var actions = document.getElementById('actions');
  var protectBtn = document.getElementById('protectBtn');
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
  var cachedBuffer = null;

  function formatSize(bytes) {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  }

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
    actions.style.display = 'none';
    pwMismatch.style.display = 'none';
    pageCountEl.textContent = formatSize(file.size);

    file.arrayBuffer().then(function (buf) {
      cachedBuffer = buf;
      return pdfjsLib.getDocument({ data: buf.slice(0) }).promise;
    }).then(function (pdf) {
      var n = pdf.numPages;
      pageCountEl.textContent = n + ' page' + (n === 1 ? '' : 's') + ' (' + formatSize(file.size) + ')';
      actions.style.display = 'block';
    }).catch(function (err) {
      if (err && err.name === 'PasswordException') {
        alert('This PDF is already password protected. Use the Unlock PDF tool first if you want to change its password.');
        removeFileBtn.click();
      } else {
        console.error(err);
        alert('Could not read this PDF. It may be corrupted.');
        removeFileBtn.click();
      }
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
    cachedBuffer = null;
    if (dropzone) dropzone.style.display = 'block';
    fileInfo.style.display = 'none';
    actions.style.display = 'none';
    userPwInput.value = '';
    confirmPwInput.value = '';
    pwMismatch.style.display = 'none';
  });

  protectBtn.addEventListener('click', function () {
    if (!currentFile || !cachedBuffer) return;

    var pw = userPwInput.value.trim();
    var cpw = confirmPwInput.value.trim();

    if (!pw) {
      alert('Please enter a password to protect your PDF.');
      userPwInput.focus();
      return;
    }

    if (pw !== cpw) {
      pwMismatch.style.display = 'block';
      confirmPwInput.focus();
      return;
    }
    pwMismatch.style.display = 'none';

    protectBtn.disabled = true;
    progressWrap.style.display = 'block';
    progressBar.style.width = '20%';
    statusText.textContent = 'Encrypting document...';

    setTimeout(function () {
      doProtect(pw);
    }, 50);
  });

  function doProtect(password) {
    PDFLib.PDFDocument.load(cachedBuffer.slice(0)).then(function (doc) {
      progressBar.style.width = '60%';
      statusText.textContent = 'Applying security permissions...';

      doc.encrypt({
        userPassword: password,
        ownerPassword: password + '_owner_' + Date.now(),
        permissions: {
          printing: allowPrinting.checked ? 'highResolution' : false,
          modifying: allowModifying.checked,
          copying: allowCopying.checked,
          annotating: allowModifying.checked,
          fillingForms: true,
          contentAccessibility: true,
          documentAssembly: false
        }
      });

      return doc.save();
    }).then(function (bytes) {
      progressBar.style.width = '100%';
      statusText.textContent = 'Done!';

      var blob = new Blob([bytes], { type: 'application/pdf' });
      var url = URL.createObjectURL(blob);
      downloadLink.href = url;
      var outName = currentFile.name.replace(/\.pdf$/i, '') + '-protected.pdf';
      downloadLink.download = outName;
      downloadLink.textContent = 'Download ' + outName;
      resultInfo.textContent = 'Your PDF is now encrypted with password protection.';

      progressWrap.style.display = 'none';
      resultBox.style.display = 'block';

      if (window.PdfHandoff && continueBox && continueGrid) {
        PdfHandoff.renderContinueBox(continueGrid, ['unlock-pdf', 'merge-pdf', 'compress-pdf'], function () {
          return { blob: blob, filename: outName };
        });
        continueBox.style.display = 'block';
      }
    }).catch(function (err) {
      console.error(err);
      alert('Could not protect PDF: ' + err.message);
      progressWrap.style.display = 'none';
      protectBtn.disabled = false;
    });
  }

  resetBtn.addEventListener('click', function () {
    currentFile = null;
    cachedBuffer = null;
    fileInfo.style.display = 'none';
    actions.style.display = 'none';
    userPwInput.value = '';
    confirmPwInput.value = '';
    pwMismatch.style.display = 'none';
    resultBox.style.display = 'none';
    if (continueBox) continueBox.style.display = 'none';
    protectBtn.disabled = false;
  });

  if (window.PdfHandoff) {
    PdfHandoff.initReceiver({
      onReceive: function (file) {
        loadFile(file);
      }
    });
  }
})();
