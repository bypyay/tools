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
  var imagesGalleryWrap = document.getElementById('imagesGalleryWrap');
  var foundImagesCount = document.getElementById('foundImagesCount');
  var downloadAllZipBtn = document.getElementById('downloadAllZipBtn');
  var imagesGrid = document.getElementById('imagesGrid');
  var actions = document.getElementById('actions');
  var extractImgBtn = document.getElementById('extractImgBtn');
  var progressWrap = document.getElementById('progressWrap');
  var progressBar = document.getElementById('progressBar');
  var statusText = document.getElementById('statusText');
  var resultBox = document.getElementById('resultBox');
  var resultInfo = document.getElementById('resultInfo');
  var downloadZipLink = document.getElementById('downloadZipLink');
  var resetBtn = document.getElementById('resetBtn');

  var currentFile = null;
  var extractedImages = []; // [{ blob, name, dataUrl, width, height }]

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
    imagesGalleryWrap.style.display = 'none';
    extractedImages = [];

    file.arrayBuffer().then(function (buf) {
      return pdfjsLib.getDocument({ data: buf }).promise;
    }).then(function (pdf) {
      pageCountEl.textContent = pdf.numPages + ' page' + (pdf.numPages === 1 ? '' : 's');
    }).catch(function (err) {
      console.error(err);
      alert('Could not read PDF: ' + err.message);
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
    extractedImages = [];
    if (dropzone) dropzone.style.display = 'block';
    fileInfo.style.display = 'none';
    actions.style.display = 'none';
    imagesGalleryWrap.style.display = 'none';
  });

  extractImgBtn.addEventListener('click', function () {
    if (!currentFile) return;
    extractImgBtn.disabled = true;
    progressWrap.style.display = 'block';
    progressBar.style.width = '10%';
    statusText.textContent = 'Scanning PDF pages for images...';
    extractedImages = [];

    currentFile.arrayBuffer().then(function (buf) {
      return pdfjsLib.getDocument({ data: buf }).promise;
    }).then(function (pdf) {
      var numPages = pdf.numPages;
      var chain = Promise.resolve();
      var imgIndex = 1;

      for (var i = 1; i <= numPages; i++) {
        (function (pNum) {
          chain = chain.then(function () {
            statusText.textContent = 'Scanning page ' + pNum + ' of ' + numPages + '...';
            progressBar.style.width = Math.round(((pNum) / numPages) * 80) + '%';

            return pdf.getPage(pNum).then(function (page) {
              return page.getOperatorList().then(function (ops) {
                var fnArray = ops.fnArray;
                var argsArray = ops.argsArray;
                var pageImgPromises = [];

                for (var j = 0; j < fnArray.length; j++) {
                  if (fnArray[j] === pdfjsLib.OPS.paintImageXObject || fnArray[j] === pdfjsLib.OPS.paintInlineImageXObject) {
                    var objId = argsArray[j][0];
                    (function (nameId, imgNum) {
                      pageImgPromises.push(
                        new Promise(function (resolve) {
                          page.objs.get(nameId, function (imgObj) {
                            if (imgObj && imgObj.data) {
                              var canvas = document.createElement('canvas');
                              canvas.width = imgObj.width;
                              canvas.height = imgObj.height;
                              var ctx = canvas.getContext('2d');
                              var imgData = ctx.createImageData(imgObj.width, imgObj.height);

                              if (imgObj.data.length === imgObj.width * imgObj.height * 3) {
                                // RGB to RGBA
                                var d = imgData.data;
                                var s = imgObj.data;
                                for (var k = 0, l = 0; k < s.length; k += 3, l += 4) {
                                  d[l] = s[k];
                                  d[l + 1] = s[k + 1];
                                  d[l + 2] = s[k + 2];
                                  d[l + 3] = 255;
                                }
                              } else if (imgObj.data.length === imgObj.width * imgObj.height * 4) {
                                imgData.data.set(imgObj.data);
                              } else {
                                // Grayscale
                                var d = imgData.data;
                                var s = imgObj.data;
                                for (var k = 0, l = 0; k < s.length; k++, l += 4) {
                                  d[l] = s[k];
                                  d[l + 1] = s[k];
                                  d[l + 2] = s[k];
                                  d[l + 3] = 255;
                                }
                              }
                              ctx.putImageData(imgData, 0, 0);

                              canvas.toBlob(function (blob) {
                                resolve({
                                  blob: blob,
                                  name: 'image-page' + pNum + '-' + imgNum + '.png',
                                  dataUrl: canvas.toDataURL(),
                                  width: imgObj.width,
                                  height: imgObj.height
                                });
                              }, 'image/png');
                            } else {
                              resolve(null);
                            }
                          });
                        })
                      );
                    })(objId, imgIndex++);
                  }
                }

                return Promise.all(pageImgPromises).then(function (imgs) {
                  imgs.forEach(function (im) {
                    if (im && im.width > 20 && im.height > 20) {
                      extractedImages.push(im);
                    }
                  });
                });
              });
            });
          });
        })(i);
      }

      return chain;
    }).then(function () {
      progressBar.style.width = '100%';
      progressWrap.style.display = 'none';

      if (extractedImages.length === 0) {
        alert('No embedded images were found in this PDF document (the pages may be vector text or scanned full-page layers).');
        extractImgBtn.disabled = false;
        return;
      }

      foundImagesCount.textContent = 'Found ' + extractedImages.length + ' image' + (extractedImages.length === 1 ? '' : 's') + ':';
      imagesGrid.innerHTML = '';

      extractedImages.forEach(function (im) {
        var card = document.createElement('div');
        card.style.cssText = 'border:1.5px solid var(--border); border-radius:10px; overflow:hidden; background:var(--bg); box-shadow:var(--shadow-sm); display:flex; flex-direction:column; padding:10px; text-align:center;';

        var imgEl = document.createElement('img');
        imgEl.src = im.dataUrl;
        imgEl.style.cssText = 'width:100%; aspect-ratio:1/1; object-fit:contain; background:var(--bg-soft); border-radius:6px; margin-bottom:8px;';
        card.appendChild(imgEl);

        var info = document.createElement('span');
        info.textContent = im.width + ' × ' + im.height + ' px';
        info.style.cssText = 'font-size:.75rem; color:var(--ink-soft); font-weight:600; margin-bottom:8px;';
        card.appendChild(info);

        var dlBtn = document.createElement('a');
        dlBtn.href = im.dataUrl;
        dlBtn.download = im.name;
        dlBtn.textContent = 'Download';
        dlBtn.className = 'btn secondary';
        dlBtn.style.cssText = 'padding:4px 10px; font-size:.78rem; border-radius:6px;';
        card.appendChild(dlBtn);

        imagesGrid.appendChild(card);
      });

      imagesGalleryWrap.style.display = 'block';
      actions.style.display = 'none';
    }).catch(function (err) {
      console.error(err);
      alert('Error extracting images: ' + err.message);
      progressWrap.style.display = 'none';
      extractImgBtn.disabled = false;
    });
  });

  downloadAllZipBtn.addEventListener('click', function () {
    if (extractedImages.length === 0) return;
    downloadAllZipBtn.disabled = true;
    downloadAllZipBtn.textContent = 'Building ZIP...';

    var zip = new JSZip();
    extractedImages.forEach(function (im) {
      zip.file(im.name, im.blob);
    });

    zip.generateAsync({ type: 'blob' }).then(function (content) {
      var url = URL.createObjectURL(content);
      var a = document.createElement('a');
      a.href = url;
      a.download = (currentFile ? currentFile.name.replace(/\.pdf$/i, '') : 'extracted') + '-images.zip';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      downloadAllZipBtn.disabled = false;
      downloadAllZipBtn.textContent = '📦 Download All as ZIP';
    });
  });

  resetBtn.addEventListener('click', function () {
    currentFile = null;
    extractedImages = [];
    if (dropzone) dropzone.style.display = 'block';
    fileInfo.style.display = 'none';
    actions.style.display = 'none';
    imagesGalleryWrap.style.display = 'none';
    resultBox.style.display = 'none';
    extractImgBtn.disabled = false;
  });
})();
