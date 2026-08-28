
(function() {
  var dropzone = document.getElementById('dropzone');
  var fileInput = document.getElementById('fileInput');
  var editorWrap = document.getElementById('editorWrap');
  var unitSelect = document.getElementById('unitSelect');
  var dpiSelect = document.getElementById('dpiSelect');
  var widthInput = document.getElementById('widthInput');
  var heightInput = document.getElementById('heightInput');
  var lblW = document.getElementById('lblW');
  var lblH = document.getElementById('lblH');
  var calcPx = document.getElementById('calcPx');
  var resizeBtn = document.getElementById('resizeBtn');
  var resultBox = document.getElementById('resultBox');
  var resultInfo = document.getElementById('resultInfo');
  var downloadLink = document.getElementById('downloadLink');
  var resetBtn = document.getElementById('resetBtn');

  var loadedImg = null;
  var currentFile = null;

  function handleFile(f) {
    if (!f || !f.type.startsWith('image/')) {
      alert('Please upload a valid image.');
      return;
    }
    currentFile = f;
    var reader = new FileReader();
    reader.onload = function(e) {
      var img = new Image();
      img.onload = function() {
        loadedImg = img;
        dropzone.style.display = 'none';
        editorWrap.style.display = 'block';
        resultBox.style.display = 'none';
        updatePixels();
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(f);
  }

  dropzone.addEventListener('click', function() { fileInput.click(); });
  fileInput.addEventListener('change', function(e) { handleFile(e.target.files[0]); fileInput.value = ''; });

  ['dragenter', 'dragover'].forEach(function(evt) {
    dropzone.addEventListener(evt, function(e) { e.preventDefault(); dropzone.classList.add('dragover'); });
  });
  ['dragleave', 'drop'].forEach(function(evt) {
    dropzone.addEventListener(evt, function(e) { e.preventDefault(); dropzone.classList.remove('dragover'); });
  });
  dropzone.addEventListener('drop', function(e) {
    if (e.dataTransfer && e.dataTransfer.files[0]) handleFile(e.dataTransfer.files[0]);
  });

  function updatePixels() {
    var u = unitSelect.value;
    var dpi = parseFloat(dpiSelect.value) || 300;
    var w = parseFloat(widthInput.value) || 3.5;
    var h = parseFloat(heightInput.value) || 4.5;

    lblW.textContent = 'Width (' + u + '):';
    lblH.textContent = 'Height (' + u + '):';

    var wIn = (u === 'cm') ? w / 2.54 : (u === 'mm') ? w / 25.4 : w;
    var hIn = (u === 'cm') ? h / 2.54 : (u === 'mm') ? h / 25.4 : h;

    var pxW = Math.round(wIn * dpi);
    var pxH = Math.round(hIn * dpi);

    calcPx.textContent = pxW + ' × ' + pxH + ' px (' + dpi + ' DPI)';
    return { pxW: pxW, pxH: pxH, dpi: dpi };
  }

  unitSelect.addEventListener('change', function() {
    var u = unitSelect.value;
    if (u === 'mm') { widthInput.value = '35'; heightInput.value = '45'; }
    else if (u === 'inch') { widthInput.value = '2'; heightInput.value = '2'; }
    else { widthInput.value = '3.5'; heightInput.value = '4.5'; }
    updatePixels();
  });

  dpiSelect.addEventListener('change', updatePixels);
  widthInput.addEventListener('input', updatePixels);
  heightInput.addEventListener('input', updatePixels);

  resizeBtn.addEventListener('click', function() {
    if (!loadedImg) return;
    var p = updatePixels();

    var canvas = document.createElement('canvas');
    var ctx = canvas.getContext('2d');
    canvas.width = p.pxW;
    canvas.height = p.pxH;

    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, p.pxW, p.pxH);
    ctx.drawImage(loadedImg, 0, 0, p.pxW, p.pxH);

    canvas.toBlob(function(blob) {
      var url = URL.createObjectURL(blob);
      downloadLink.href = url;
      downloadLink.download = 'print-' + widthInput.value + 'x' + heightInput.value + unitSelect.value + '.jpg';
      resultInfo.innerHTML = 'Resized to <strong>' + widthInput.value + ' × ' + heightInput.value + ' ' + unitSelect.value + '</strong> (' + p.pxW + ' × ' + p.pxH + ' px @ ' + p.dpi + ' DPI).';
      resultBox.style.display = 'block';
    }, 'image/jpeg', 0.95);
  });

  resetBtn.addEventListener('click', function() {
    dropzone.style.display = 'block';
    editorWrap.style.display = 'none';
    resultBox.style.display = 'none';
  });
})();
