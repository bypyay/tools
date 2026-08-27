// Tool logic for 8 Picture Collage (8-picture-collage)
(function() {
  var fileInput = document.getElementById('fileInput');
  var canvas = document.getElementById('collageCanvas');
  var spacingRange = document.getElementById('spacingRange');
  var radiusRange = document.getElementById('radiusRange');
  var bgColor = document.getElementById('bgColor');
  var filterSelect = document.getElementById('filterSelect');
  var captionText = document.getElementById('captionText');
  var exportScale = document.getElementById('exportScale');
  var exportBtn = document.getElementById('exportBtn');

  var loadedImages = [];
  var layoutKey = '8-grid';
  var layoutCells = CollageCore.LAYOUTS[layoutKey] || CollageCore.LAYOUTS['4-grid'];

  function updateCollage() {
    if (!canvas) return;
    CollageCore.renderCollage(canvas, {
      cells: layoutCells,
      images: loadedImages,
      spacing: parseInt(spacingRange ? spacingRange.value : 12),
      radius: parseInt(radiusRange ? radiusRange.value : 8),
      bgColor: bgColor ? bgColor.value : '#ffffff',
      filter: filterSelect ? filterSelect.value : 'none',
      text: captionText ? captionText.value : ''
    });
  }

  // Initial draw
  updateCollage();

  if (fileInput) {
    fileInput.addEventListener('change', function(e) {
      if (e.target.files && e.target.files.length > 0) {
        loadedImages = [];
        var files = Array.from(e.target.files);
        var loaded = 0;
        files.forEach(function(f, idx) {
          var img = new Image();
          img.onload = function() {
            loadedImages[idx] = img;
            loaded++;
            if (loaded === files.length) {
              updateCollage();
            }
          };
          var reader = new FileReader();
          reader.onload = function(ev) {
            img.src = ev.target.result;
          };
          reader.readAsDataURL(f);
        });
      }
    });
  }

  [spacingRange, radiusRange, bgColor, filterSelect, captionText].forEach(function(el) {
    if (el) {
      el.addEventListener('input', updateCollage);
      el.addEventListener('change', updateCollage);
    }
  });

  if (exportBtn) {
    exportBtn.addEventListener('click', function() {
      var scale = parseInt(exportScale ? exportScale.value : 2);
      var dataUrl = CollageCore.exportCollage(canvas, scale, 'image/png', 0.95);
      CollageCore.downloadFile(dataUrl, '8-picture-collage-collage.png');
    });
  }
})();
