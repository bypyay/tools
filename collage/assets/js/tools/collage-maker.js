/**
 * Daily1Step Collage Studio - Full Interactive Studio Controller
 * Matches Pi7 Collage Maker Studio with 6 Sidebar Tabs, Canvas Zoom, and 4K Export
 */

(function() {
  var canvas = document.getElementById('studioCanvas');
  if (!canvas) return;
  var ctx = canvas.getContext('2d');

  // Studio State
  var state = {
    width: 800,
    height: 800,
    zoom: 1.0,
    currentLayout: '4-grid',
    cells: CollageCore.LAYOUTS['4-grid'],
    images: [],
    spacing: 8,
    radius: 4,
    bgColor: '#ffffff',
    bgType: 'color', // color, gradient
    gradFrom: '#f43f5e',
    gradTo: '#8b5cf6',
    gradDir: '135deg',
    borderWidth: 0,
    borderColor: '#ffffff',
    borderStyle: 'solid',
    filter: 'none',
    brightness: 100,
    saturation: 100,
    textLayers: [],
    stickers: [],
    history: [],
    historyIndex: -1
  };

  // 1. Sidebar Tab Switching
  window.switchTab = function(tabName, btn) {
    document.querySelectorAll('.stab').forEach(function(b) { b.classList.remove('active'); });
    document.querySelectorAll('.sidebar-panel').forEach(function(p) { p.classList.remove('active'); });
    if (btn) btn.classList.add('active');
    var targetPanel = document.getElementById('tab-' + tabName);
    if (targetPanel) targetPanel.classList.add('active');
  };

  // 2. Canvas Size Presets
  window.setCanvasSize = function(w, h, btn) {
    state.width = w;
    state.height = h;
    canvas.width = w;
    canvas.height = h;
    document.querySelectorAll('.size-pill').forEach(function(p) { p.classList.remove('active'); });
    if (btn) btn.classList.add('active');
    var badge = document.getElementById('size-badge');
    if (badge) badge.textContent = w + ' x ' + h;
    render();
  };

  // 3. Layout Switching
  window.selectLayout = function(layoutKey, btn) {
    state.currentLayout = layoutKey;
    state.cells = CollageCore.LAYOUTS[layoutKey] || CollageCore.LAYOUTS['4-grid'];
    document.querySelectorAll('.layout-card').forEach(function(c) { c.classList.remove('active'); });
    if (btn) btn.classList.add('active');
    updateFillInfo();
    render();
  };

  // 4. Custom Grid Builder
  window.applyCustomGrid = function() {
    var cols = parseInt(document.getElementById('customCols').value || 3);
    var rows = parseInt(document.getElementById('customRows').value || 3);
    state.cells = CollageCore.createGrid(cols, rows);
    updateFillInfo();
    render();
  };

  // 5. Bulk Photo Upload
  var bulkInput = document.getElementById('bulk-input');
  if (bulkInput) {
    bulkInput.addEventListener('change', function(e) {
      if (e.target.files && e.target.files.length > 0) {
        var files = Array.from(e.target.files);
        var loaded = 0;
        files.forEach(function(f, idx) {
          var reader = new FileReader();
          reader.onload = function(ev) {
            var img = new Image();
            img.onload = function() {
              state.images.push(img);
              addThumbToTray(ev.target.result);
              loaded++;
              if (loaded === files.length) {
                updateFillInfo();
                render();
              }
            };
            img.src = ev.target.result;
          };
          reader.readAsDataURL(f);
        });
      }
    });
  }

  function addThumbToTray(src) {
    var tray = document.getElementById('photo-thumbs-tray');
    if (!tray) return;
    var img = document.createElement('img');
    img.src = src;
    img.className = 'photo-thumb-item';
    tray.appendChild(img);
    var count = document.getElementById('photo-count');
    if (count) count.textContent = state.images.length;
  }

  function updateFillInfo() {
    var info = document.getElementById('fill-info');
    if (info) {
      var filled = Math.min(state.images.length, state.cells.length);
      info.textContent = filled + '/' + state.cells.length + ' filled';
    }
  }

  // 6. Style Controls (Background, Gap, Radius, Filter)
  window.setBgColor = function(colorHex) {
    state.bgType = 'color';
    state.bgColor = colorHex;
    render();
  };

  window.applyGradientBg = function() {
    state.bgType = 'gradient';
    state.gradFrom = document.getElementById('gradFrom').value;
    state.gradTo = document.getElementById('gradTo').value;
    state.gradDir = document.getElementById('gradDir').value;
    render();
  };

  window.updateGap = function(val) {
    state.spacing = parseInt(val);
    var v = document.getElementById('gap-val');
    if (v) v.textContent = val + 'px';
    render();
  };

  window.updateRadius = function(val) {
    state.radius = parseInt(val);
    var v = document.getElementById('radius-val');
    if (v) v.textContent = val + 'px';
    render();
  };

  window.setFilter = function(filterVal, btn) {
    state.filter = filterVal;
    document.querySelectorAll('.filter-pill').forEach(function(p) { p.classList.remove('active'); });
    if (btn) btn.classList.add('active');
    render();
  };

  // 7. Text & Stickers
  window.addQuickText = function() {
    var textInput = document.getElementById('quickTextInput');
    var fontSelect = document.getElementById('quickFontSelect');
    var colorInput = document.getElementById('quickTextColor');
    if (!textInput || !textInput.value) return;

    state.textLayers.push({
      text: textInput.value,
      font: fontSelect ? fontSelect.value : "'Outfit', sans-serif",
      color: colorInput ? colorInput.value : "#ffffff",
      size: 36,
      x: state.width / 2,
      y: state.height - 30
    });
    textInput.value = '';
    render();
  };

  window.addSticker = function(emoji) {
    state.stickers.push({
      emoji: emoji,
      x: state.width / 2,
      y: state.height / 2,
      size: 48
    });
    render();
  };

  // 8. Toolbar Actions (Shuffle, Auto-Fill, Clear)
  window.shufflePhotos = function() {
    for (var i = state.images.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var temp = state.images[i];
      state.images[i] = state.images[j];
      state.images[j] = temp;
    }
    render();
  };

  window.autoFill = function() {
    render();
  };

  window.clearCanvas = function() {
    if (confirm('Clear canvas and remove all photos?')) {
      state.images = [];
      state.textLayers = [];
      state.stickers = [];
      var tray = document.getElementById('photo-thumbs-tray');
      if (tray) tray.innerHTML = '';
      var count = document.getElementById('photo-count');
      if (count) count.textContent = '0';
      updateFillInfo();
      render();
    }
  };

  // 9. Master Render Function
  function render() {
    var W = canvas.width;
    var H = canvas.height;

    // Draw Background
    if (state.bgType === 'gradient') {
      var grad = ctx.createLinearGradient(0, 0, W, H);
      grad.addColorStop(0, state.gradFrom);
      grad.addColorStop(1, state.gradTo);
      ctx.fillStyle = grad;
    } else {
      ctx.fillStyle = state.bgColor;
    }
    ctx.fillRect(0, 0, W, H);

    // Draw Cells
    state.cells.forEach(function(cell, idx) {
      var cellX = cell.x * W + state.spacing / 2;
      var cellY = cell.y * H + state.spacing / 2;
      var cellW = cell.w * W - state.spacing;
      var cellH = cell.h * H - state.spacing;

      if (cellW <= 0 || cellH <= 0) return;

      ctx.save();
      ctx.beginPath();
      if (ctx.roundRect) {
        ctx.roundRect(cellX, cellY, cellW, cellH, state.radius);
      } else {
        ctx.rect(cellX, cellY, cellW, cellH);
      }
      ctx.clip();

      var img = state.images[idx];
      if (img && img.complete && img.naturalWidth > 0) {
        var imgAspect = img.naturalWidth / img.naturalHeight;
        var cellAspect = cellW / cellH;
        var drawW, drawH, drawX, drawY;

        if (imgAspect > cellAspect) {
          drawH = cellH;
          drawW = cellH * imgAspect;
          drawX = cellX + (cellW - drawW) / 2;
          drawY = cellY;
        } else {
          drawW = cellW;
          drawH = cellW / imgAspect;
          drawX = cellX;
          drawY = cellY + (cellH - drawH) / 2;
        }

        if (state.filter === 'grayscale') ctx.filter = 'grayscale(100%)';
        else if (state.filter === 'sepia') ctx.filter = 'sepia(90%)';
        else if (state.filter === 'vivid') ctx.filter = 'saturate(180%) contrast(110%)';
        else if (state.filter === 'warm') ctx.filter = 'hue-rotate(30deg) saturate(140%)';
        else if (state.filter === 'cool') ctx.filter = 'hue-rotate(180deg) saturate(110%)';
        else if (state.filter === 'vintage') ctx.filter = 'contrast(120%) brightness(95%) sepia(40%)';
        else ctx.filter = 'none';

        ctx.drawImage(img, drawX, drawY, drawW, drawH);
      } else {
        ctx.fillStyle = "#f1f5f9";
        ctx.fillRect(cellX, cellY, cellW, cellH);
        ctx.fillStyle = "#94a3b8";
        ctx.font = "bold 15px 'Outfit', sans-serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText("Photo " + (idx + 1), cellX + cellW / 2, cellY + cellH / 2);
      }
      ctx.restore();
    });

    // Draw Text Layers
    state.textLayers.forEach(function(layer) {
      ctx.save();
      ctx.font = "bold " + layer.size + "px " + layer.font;
      ctx.fillStyle = layer.color;
      ctx.strokeStyle = "#000000";
      ctx.lineWidth = Math.max(2, layer.size / 10);
      ctx.textAlign = "center";
      ctx.strokeText(layer.text, layer.x, layer.y);
      ctx.fillText(layer.text, layer.x, layer.y);
      ctx.restore();
    });

    // Draw Stickers
    state.stickers.forEach(function(stk) {
      ctx.save();
      ctx.font = stk.size + "px 'Outfit', sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(stk.emoji, stk.x, stk.y);
      ctx.restore();
    });
  }

  // 10. Export Modal & Download
  window.showExportModal = function() {
    var modal = document.getElementById('exportModal');
    if (modal) modal.style.display = 'flex';
  };

  window.closeExportModal = function() {
    var modal = document.getElementById('exportModal');
    if (modal) modal.style.display = 'none';
  };

  window.doExport = function() {
    var scale = parseInt(document.getElementById('exportScale').value || 2);
    var fmt = document.querySelector('.export-fmt-card.selected').getAttribute('data-fmt');
    var filename = (document.getElementById('exportFilename').value || 'my-collage') + '.' + fmt;

    var mime = fmt === 'jpg' ? 'image/jpeg' : (fmt === 'webp' ? 'image/webp' : 'image/png');
    var dataUrl = CollageCore.exportCollage(canvas, scale, mime, 0.95);

    if (fmt === 'pdf') {
      var { jsPDF } = window.jspdf;
      var pdf = new jsPDF({
        orientation: state.width > state.height ? 'landscape' : 'portrait',
        unit: 'px',
        format: [canvas.width, canvas.height]
      });
      pdf.addImage(dataUrl, 'PNG', 0, 0, canvas.width, canvas.height);
      pdf.save(filename);
    } else {
      CollageCore.downloadFile(dataUrl, filename);
    }
    closeExportModal();
  };

  // Initial draw
  render();
})();
