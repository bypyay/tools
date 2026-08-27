/**
 * Daily1Step Collage Studio PRO — Master Controller & High-Definition Canvas Engine
 * Built for ultra-clean, modern, glitch-free collage editing with 4K export.
 */

(function() {
  'use strict';

  // ══════════════════════════════════════════════════════════════════
  // 1. COMPREHENSIVE LAYOUT DEFINITIONS (Normalized 0.0 to 1.0)
  // ══════════════════════════════════════════════════════════════════
  const LAYOUTS = {
    // 1 Photo
    '1-full': [{ x: 0, y: 0, w: 1, h: 1 }],

    // 2 Photos
    '2-side': [
      { x: 0, y: 0, w: 0.5, h: 1 },
      { x: 0.5, y: 0, w: 0.5, h: 1 }
    ],
    '2-stack': [
      { x: 0, y: 0, w: 1, h: 0.5 },
      { x: 0, y: 0.5, w: 1, h: 0.5 }
    ],
    '2-big-left': [
      { x: 0, y: 0, w: 0.65, h: 1 },
      { x: 0.65, y: 0, w: 0.35, h: 1 }
    ],

    // 3 Photos
    '3-left-big': [
      { x: 0, y: 0, w: 0.5, h: 1 },
      { x: 0.5, y: 0, w: 0.5, h: 0.5 },
      { x: 0.5, y: 0.5, w: 0.5, h: 0.5 }
    ],
    '3-top-big': [
      { x: 0, y: 0, w: 1, h: 0.5 },
      { x: 0, y: 0.5, w: 0.5, h: 0.5 },
      { x: 0.5, y: 0.5, w: 0.5, h: 0.5 }
    ],
    '3-columns': [
      { x: 0, y: 0, w: 1/3, h: 1 },
      { x: 1/3, y: 0, w: 1/3, h: 1 },
      { x: 2/3, y: 0, w: 1/3, h: 1 }
    ],
    '3-rows': [
      { x: 0, y: 0, w: 1, h: 1/3 },
      { x: 0, y: 1/3, w: 1, h: 1/3 },
      { x: 0, y: 2/3, w: 1, h: 1/3 }
    ],

    // 4 Photos
    '4-grid': [
      { x: 0, y: 0, w: 0.5, h: 0.5 },
      { x: 0.5, y: 0, w: 0.5, h: 0.5 },
      { x: 0.5, y: 0.5, w: 0.5, h: 0.5 },
      { x: 0, y: 0.5, w: 0.5, h: 0.5 }
    ],
    '4-hero-left': [
      { x: 0, y: 0, w: 0.6, h: 1 },
      { x: 0.6, y: 0, w: 0.4, h: 1/3 },
      { x: 0.6, y: 1/3, w: 0.4, h: 1/3 },
      { x: 0.6, y: 2/3, w: 0.4, h: 1/3 }
    ],
    '4-hero-top': [
      { x: 0, y: 0, w: 1, h: 0.6 },
      { x: 0, y: 0.6, w: 1/3, h: 0.4 },
      { x: 1/3, y: 0.6, w: 1/3, h: 0.4 },
      { x: 2/3, y: 0.6, w: 1/3, h: 0.4 }
    ],
    '4-strip': [
      { x: 0, y: 0, w: 0.25, h: 1 },
      { x: 0.25, y: 0, w: 0.25, h: 1 },
      { x: 0.5, y: 0, w: 0.25, h: 1 },
      { x: 0.75, y: 0, w: 0.25, h: 1 }
    ],

    // 5 Photos (Magazine Default)
    '5-mag': [
      { x: 0, y: 0, w: 0.5, h: 0.5 },
      { x: 0.5, y: 0, w: 0.5, h: 0.5 },
      { x: 0, y: 0.5, w: 1/3, h: 0.5 },
      { x: 1/3, y: 0.5, w: 1/3, h: 0.5 },
      { x: 2/3, y: 0.5, w: 1/3, h: 0.5 }
    ],
    '5-hero-center': [
      { x: 0, y: 0, w: 0.3, h: 0.5 },
      { x: 0.7, y: 0, w: 0.3, h: 0.5 },
      { x: 0.3, y: 0, w: 0.4, h: 1 },
      { x: 0, y: 0.5, w: 0.3, h: 0.5 },
      { x: 0.7, y: 0.5, w: 0.3, h: 0.5 }
    ],

    // 6 Photos
    '6-grid': [
      { x: 0, y: 0, w: 1/3, h: 0.5 },
      { x: 1/3, y: 0, w: 1/3, h: 0.5 },
      { x: 2/3, y: 0, w: 1/3, h: 0.5 },
      { x: 0, y: 0.5, w: 1/3, h: 0.5 },
      { x: 1/3, y: 0.5, w: 1/3, h: 0.5 },
      { x: 2/3, y: 0.5, w: 1/3, h: 0.5 }
    ],
    '6-hero-left': [
      { x: 0, y: 0, w: 0.5, h: 1 },
      { x: 0.5, y: 0, w: 0.25, h: 0.5 },
      { x: 0.75, y: 0, w: 0.25, h: 0.5 },
      { x: 0.5, y: 0.5, w: 0.25, h: 0.5 },
      { x: 0.75, y: 0.5, w: 0.25, h: 0.5 },
      { x: 0.5, y: 0.75, w: 0.5, h: 0.25 }
    ],

    // 8 Photos
    '8-grid': [
      { x: 0, y: 0, w: 0.25, h: 0.5 },
      { x: 0.25, y: 0, w: 0.25, h: 0.5 },
      { x: 0.5, y: 0, w: 0.25, h: 0.5 },
      { x: 0.75, y: 0, w: 0.25, h: 0.5 },
      { x: 0, y: 0.5, w: 0.25, h: 0.5 },
      { x: 0.25, y: 0.5, w: 0.25, h: 0.5 },
      { x: 0.5, y: 0.5, w: 0.25, h: 0.5 },
      { x: 0.75, y: 0.5, w: 0.25, h: 0.5 }
    ],

    // 9 Photos (Best Nine)
    '9-grid': [
      { x: 0, y: 0, w: 1/3, h: 1/3 },
      { x: 1/3, y: 0, w: 1/3, h: 1/3 },
      { x: 2/3, y: 0, w: 1/3, h: 1/3 },
      { x: 0, y: 1/3, w: 1/3, h: 1/3 },
      { x: 1/3, y: 1/3, w: 1/3, h: 1/3 },
      { x: 2/3, y: 1/3, w: 1/3, h: 1/3 },
      { x: 0, y: 2/3, w: 1/3, h: 1/3 },
      { x: 1/3, y: 2/3, w: 1/3, h: 1/3 },
      { x: 2/3, y: 2/3, w: 1/3, h: 1/3 }
    ],

    // 10 Photos
    '10-grid': [
      { x: 0, y: 0, w: 0.2, h: 0.5 },
      { x: 0.2, y: 0, w: 0.2, h: 0.5 },
      { x: 0.4, y: 0, w: 0.2, h: 0.5 },
      { x: 0.6, y: 0, w: 0.2, h: 0.5 },
      { x: 0.8, y: 0, w: 0.2, h: 0.5 },
      { x: 0, y: 0.5, w: 0.2, h: 0.5 },
      { x: 0.2, y: 0.5, w: 0.2, h: 0.5 },
      { x: 0.4, y: 0.5, w: 0.2, h: 0.5 },
      { x: 0.6, y: 0.5, w: 0.2, h: 0.5 },
      { x: 0.8, y: 0.5, w: 0.2, h: 0.5 }
    ],

    // 12 Photos
    '12-grid': [
      { x: 0, y: 0, w: 0.25, h: 1/3 },
      { x: 0.25, y: 0, w: 0.25, h: 1/3 },
      { x: 0.5, y: 0, w: 0.25, h: 1/3 },
      { x: 0.75, y: 0, w: 0.25, h: 1/3 },
      { x: 0, y: 1/3, w: 0.25, h: 1/3 },
      { x: 0.25, y: 1/3, w: 0.25, h: 1/3 },
      { x: 0.5, y: 1/3, w: 0.25, h: 1/3 },
      { x: 0.75, y: 1/3, w: 0.25, h: 1/3 },
      { x: 0, y: 2/3, w: 0.25, h: 1/3 },
      { x: 0.25, y: 2/3, w: 0.25, h: 1/3 },
      { x: 0.5, y: 2/3, w: 0.25, h: 1/3 },
      { x: 0.75, y: 2/3, w: 0.25, h: 1/3 }
    ],

    // 30 Photos
    '30-grid': createCustomGrid(6, 5),

    // Heart Shape Layout (13 aesthetic cell positions)
    'heart-grid': [
      { x: 0.2, y: 0.05, w: 0.25, h: 0.25 },
      { x: 0.55, y: 0.05, w: 0.25, h: 0.25 },
      { x: 0.05, y: 0.32, w: 0.25, h: 0.25 },
      { x: 0.375, y: 0.32, w: 0.25, h: 0.25 },
      { x: 0.7, y: 0.32, w: 0.25, h: 0.25 },
      { x: 0.2, y: 0.6, w: 0.25, h: 0.25 },
      { x: 0.55, y: 0.6, w: 0.25, h: 0.25 },
      { x: 0.375, y: 0.78, w: 0.25, h: 0.2 }
    ]
  };

  function createCustomGrid(cols, rows) {
    var list = [];
    var cw = 1 / cols;
    var ch = 1 / rows;
    for (var r = 0; r < rows; r++) {
      for (var c = 0; c < cols; c++) {
        list.push({ x: c * cw, y: r * ch, w: cw, h: ch });
      }
    }
    return list;
  }

  // Determine initial layout from page data attribute or global variable
  var initLayoutKey = window.DEFAULT_LAYOUT || (document.body ? document.body.getAttribute('data-default-layout') : null) || '5-mag';
  if (!LAYOUTS[initLayoutKey]) {
    initLayoutKey = '5-mag';
  }

  // ══════════════════════════════════════════════════════════════════
  // 2. STUDIO STATE
  // ══════════════════════════════════════════════════════════════════
  var state = {
    canvasW: 800,
    canvasH: 800,
    zoom: 1.0,
    activeLayout: initLayoutKey,
    cells: LAYOUTS[initLayoutKey],
    images: [],
    slotImages: {}, // slotIndex -> HTMLImageElement
    activeCellIndex: null,
    
    // Spacing & Border
    gap: 8,
    radius: 6,
    margin: 8,
    borderColor: '#ffffff',
    borderWidth: 0,
    
    // Background
    bgType: 'color', // 'color', 'gradient'
    bgColor: '#ffffff',
    gradFrom: '#6366f1',
    gradTo: '#ec4899',
    gradAngle: '135deg',
    
    // Filters & Adjustments
    filter: 'none',
    brightness: 100,
    contrast: 100,
    saturation: 100,
    
    // Layers
    textLayers: [],
    stickers: []
  };

  var canvas = document.getElementById('proCanvas');
  if (!canvas) return;
  var ctx = canvas.getContext('2d');

  // ══════════════════════════════════════════════════════════════════
  // 3. TAB SWITCHING & DRAWER CONTROLLER
  // ══════════════════════════════════════════════════════════════════
  window.switchDrawerTab = function(tabKey, btn) {
    document.querySelectorAll('.nav-rail-btn').forEach(function(b) { b.classList.remove('active'); });
    document.querySelectorAll('.drawer-content').forEach(function(d) { d.classList.remove('active'); });
    if (btn) btn.classList.add('active');
    var target = document.getElementById('drawer-' + tabKey);
    if (target) target.classList.add('active');
  };

  // ══════════════════════════════════════════════════════════════════
  // 4. ASPECT RATIO PRESETS
  // ══════════════════════════════════════════════════════════════════
  window.setAspectRatio = function(w, h, btn) {
    state.canvasW = w;
    state.canvasH = h;
    canvas.width = w;
    canvas.height = h;
    document.querySelectorAll('.aspect-pill').forEach(function(p) { p.classList.remove('active'); });
    if (btn) btn.classList.add('active');
    var badge = document.getElementById('canvasSizeBadge');
    if (badge) badge.textContent = w + ' × ' + h;
    renderCanvas();
    autoFitZoom();
  };

  // ══════════════════════════════════════════════════════════════════
  // 5. LAYOUT SELECTION & CUSTOM BUILDER
  // ══════════════════════════════════════════════════════════════════
  window.selectLayoutPro = function(layoutKey, btn) {
    state.activeLayout = layoutKey;
    state.cells = LAYOUTS[layoutKey] || LAYOUTS['4-grid'];
    document.querySelectorAll('.layout-card-pro').forEach(function(c) { c.classList.remove('active'); });
    if (btn) btn.classList.add('active');
    updateFilledBadge();
    renderCanvas();
  };

  window.applyNxMGrid = function() {
    var cols = parseInt(document.getElementById('customGridCols').value || 3);
    var rows = parseInt(document.getElementById('customGridRows').value || 3);
    state.cells = createCustomGrid(cols, rows);
    state.activeLayout = 'custom-' + cols + 'x' + rows;
    updateFilledBadge();
    renderCanvas();
  };

  // ══════════════════════════════════════════════════════════════════
  // 6. PHOTO UPLOAD & POOL MANAGEMENT
  // ══════════════════════════════════════════════════════════════════
  var fileInput = document.getElementById('proPhotoInput');
  if (fileInput) {
    fileInput.addEventListener('change', function(e) {
      if (e.target.files && e.target.files.length > 0) {
        handleIncomingFiles(Array.from(e.target.files));
      }
    });
  }

  function handleIncomingFiles(files) {
    var loaded = 0;
    files.forEach(function(file) {
      if (!file.type.startsWith('image/')) return;
      var reader = new FileReader();
      reader.onload = function(ev) {
        var img = new Image();
        img.onload = function() {
          state.images.push(img);
          addThumbnailToPool(img, state.images.length - 1);
          
          // Auto-fill empty slots sequentially
          for (var i = 0; i < state.cells.length; i++) {
            if (!state.slotImages[i]) {
              state.slotImages[i] = img;
              break;
            }
          }
          
          loaded++;
          if (loaded === files.length) {
            updateFilledBadge();
            renderCanvas();
          }
        };
        img.src = ev.target.result;
      };
      reader.readAsDataURL(file);
    });
  }

  function addThumbnailToPool(img, index) {
    var pool = document.getElementById('photoPoolGrid');
    if (!pool) return;
    
    var card = document.createElement('div');
    card.className = 'photo-pool-item';
    card.title = 'Click to fill active slot';
    card.innerHTML = '<img src="' + img.src + '" alt="Photo ' + (index + 1) + '"><button class="pool-remove-btn" title="Remove">&times;</button>';
    
    card.querySelector('img').addEventListener('click', function() {
      if (state.activeCellIndex !== null) {
        state.slotImages[state.activeCellIndex] = img;
      } else {
        // find first empty or slot 0
        var target = 0;
        for (var i = 0; i < state.cells.length; i++) {
          if (!state.slotImages[i]) { target = i; break; }
        }
        state.slotImages[target] = img;
      }
      updateFilledBadge();
      renderCanvas();
    });

    card.querySelector('.pool-remove-btn').addEventListener('click', function(e) {
      e.stopPropagation();
      card.remove();
      // remove from slotImages if present
      for (var k in state.slotImages) {
        if (state.slotImages[k] === img) delete state.slotImages[k];
      }
      updateFilledBadge();
      renderCanvas();
    });

    pool.appendChild(card);
  }

  window.autoDistributePhotos = function() {
    if (state.images.length === 0) return;
    for (var i = 0; i < state.cells.length; i++) {
      state.slotImages[i] = state.images[i % state.images.length];
    }
    updateFilledBadge();
    renderCanvas();
  };

  window.shufflePhotos = function() {
    if (state.images.length === 0) return;
    var shuffled = state.images.slice().sort(function() { return 0.5 - Math.random(); });
    for (var i = 0; i < state.cells.length; i++) {
      state.slotImages[i] = shuffled[i % shuffled.length];
    }
    renderCanvas();
  };

  window.clearAllCanvas = function() {
    state.slotImages = {};
    state.images = [];
    state.textLayers = [];
    state.stickers = [];
    var pool = document.getElementById('photoPoolGrid');
    if (pool) pool.innerHTML = '';
    updateFilledBadge();
    renderCanvas();
  };

  function updateFilledBadge() {
    var filled = Object.keys(state.slotImages).length;
    var total = state.cells.length;
    var badge = document.getElementById('filledCountBadge');
    if (badge) badge.textContent = filled + ' / ' + total + ' filled';
  }

  // ══════════════════════════════════════════════════════════════════
  // 7. SPACING, CORNER & BORDER CONTROLLERS
  // ══════════════════════════════════════════════════════════════════
  window.updateGap = function(val) {
    state.gap = parseInt(val);
    var badge = document.getElementById('gapBadge');
    if (badge) badge.textContent = val + 'px';
    renderCanvas();
  };

  window.updateRadius = function(val) {
    state.radius = parseInt(val);
    var badge = document.getElementById('radiusBadge');
    if (badge) badge.textContent = val + 'px';
    renderCanvas();
  };

  window.updateMargin = function(val) {
    state.margin = parseInt(val);
    var badge = document.getElementById('marginBadge');
    if (badge) badge.textContent = val + 'px';
    renderCanvas();
  };

  window.updateBorderWidth = function(val) {
    state.borderWidth = parseInt(val);
    var badge = document.getElementById('borderWidthBadge');
    if (badge) badge.textContent = val + 'px';
    renderCanvas();
  };

  window.setBorderColor = function(color) {
    state.borderColor = color;
    renderCanvas();
  };

  // ══════════════════════════════════════════════════════════════════
  // 8. BACKGROUND STYLE CONTROLLER
  // ══════════════════════════════════════════════════════════════════
  window.setSolidBgColor = function(color, btn) {
    state.bgType = 'color';
    state.bgColor = color;
    document.querySelectorAll('.swatch-circle').forEach(function(s) { s.classList.remove('active'); });
    if (btn) btn.classList.add('active');
    renderCanvas();
  };

  window.setGradientBg = function(from, to, angle, btn) {
    state.bgType = 'gradient';
    state.gradFrom = from;
    state.gradTo = to;
    state.gradAngle = angle || '135deg';
    document.querySelectorAll('.grad-preset-btn').forEach(function(g) { g.classList.remove('active'); });
    if (btn) btn.classList.add('active');
    renderCanvas();
  };

  // ══════════════════════════════════════════════════════════════════
  // 9. FILTERS & COLOR ADJUSTMENTS
  // ══════════════════════════════════════════════════════════════════
  window.setFilter = function(filterName, card) {
    state.filter = filterName;
    document.querySelectorAll('.filter-card').forEach(function(c) { c.classList.remove('active'); });
    if (card) card.classList.add('active');
    renderCanvas();
  };

  window.updateBrightness = function(val) {
    state.brightness = parseInt(val);
    var b = document.getElementById('brightBadge');
    if (b) b.textContent = val + '%';
    renderCanvas();
  };

  window.updateContrast = function(val) {
    state.contrast = parseInt(val);
    var b = document.getElementById('contrastBadge');
    if (b) b.textContent = val + '%';
    renderCanvas();
  };

  window.updateSaturation = function(val) {
    state.saturation = parseInt(val);
    var b = document.getElementById('satBadge');
    if (b) b.textContent = val + '%';
    renderCanvas();
  };

  // ══════════════════════════════════════════════════════════════════
  // 10. TEXT & STICKER LAYERS
  // ══════════════════════════════════════════════════════════════════
  window.addTextLayer = function() {
    var textInput = document.getElementById('textLayerInput');
    var fontSelect = document.getElementById('textFontSelect');
    var colorInput = document.getElementById('textColorInput');
    var sizeRange = document.getElementById('textSizeRange');
    
    var str = textInput ? textInput.value.trim() : 'Collage 2026';
    if (!str) str = 'Memories';

    state.textLayers.push({
      text: str,
      font: (fontSelect ? fontSelect.value : 'Plus Jakarta Sans'),
      size: parseInt(sizeRange ? sizeRange.value : 44),
      color: (colorInput ? colorInput.value : '#ffffff'),
      x: state.canvasW / 2,
      y: state.canvasH / 2,
      align: 'center',
      shadow: true
    });

    renderCanvas();
    renderTextLayersList();
  };

  function renderTextLayersList() {
    var list = document.getElementById('textLayersList');
    if (!list) return;
    list.innerHTML = '';
    state.textLayers.forEach(function(layer, idx) {
      var item = document.createElement('div');
      item.className = 'layer-item';
      item.innerHTML = '<span>"' + layer.text + '" (' + layer.size + 'px)</span><button onclick="removeTextLayer(' + idx + ')">&times;</button>';
      list.appendChild(item);
    });
  }

  window.removeTextLayer = function(idx) {
    state.textLayers.splice(idx, 1);
    renderCanvas();
    renderTextLayersList();
  };

  window.addSticker = function(emoji) {
    state.stickers.push({
      symbol: emoji,
      size: 64,
      x: state.canvasW / 2 + (Math.random() * 60 - 30),
      y: state.canvasH / 2 + (Math.random() * 60 - 30)
    });
    renderCanvas();
  };

  // ══════════════════════════════════════════════════════════════════
  // 11. MASTER CANVAS RENDER ENGINE
  // ══════════════════════════════════════════════════════════════════
  function renderCanvas() {
    var W = canvas.width;
    var H = canvas.height;

    ctx.clearRect(0, 0, W, H);

    // 1. Render Background
    if (state.bgType === 'gradient') {
      var grad = ctx.createLinearGradient(0, 0, W, H);
      grad.addColorStop(0, state.gradFrom);
      grad.addColorStop(1, state.gradTo);
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, W, H);
    } else {
      ctx.fillStyle = state.bgColor;
      ctx.fillRect(0, 0, W, H);
    }

    // Outer Margins & Gap metrics
    var m = state.margin;
    var g = state.gap;
    var r = state.radius;
    var bw = state.borderWidth;

    var availW = W - (m * 2);
    var availH = H - (m * 2);

    // 2. Render Cells
    state.cells.forEach(function(cell, idx) {
      var cellX = m + (cell.x * availW) + (g / 2);
      var cellY = m + (cell.y * availH) + (g / 2);
      var cellW = (cell.w * availW) - g;
      var cellH = (cell.h * availH) - g;

      if (cellW <= 0 || cellH <= 0) return;

      ctx.save();
      // Clip cell path with rounded corners
      roundRect(ctx, cellX, cellY, cellW, cellH, r);
      ctx.clip();

      var img = state.slotImages[idx];
      if (img && img.complete) {
        // Apply Filters
        ctx.filter = buildFilterString();
        drawImageProp(ctx, img, cellX, cellY, cellW, cellH);
      } else {
        // Empty Slot Placeholder
        ctx.fillStyle = '#f1f5f9';
        ctx.fillRect(cellX, cellY, cellW, cellH);
        
        // Plus Icon
        ctx.fillStyle = '#94a3b8';
        ctx.font = '24px "Font Awesome 6 Free", sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('+', cellX + cellW / 2, cellY + cellH / 2);
      }
      ctx.restore();

      // Border around cell if set
      if (bw > 0) {
        ctx.save();
        ctx.strokeStyle = state.borderColor;
        ctx.lineWidth = bw;
        roundRect(ctx, cellX, cellY, cellW, cellH, r);
        ctx.stroke();
        ctx.restore();
      }

      // Highlight active cell outline
      if (state.activeCellIndex === idx) {
        ctx.save();
        ctx.strokeStyle = '#6366f1';
        ctx.lineWidth = 3;
        roundRect(ctx, cellX, cellY, cellW, cellH, r);
        ctx.stroke();
        ctx.restore();
      }
    });

    // 3. Render Stickers
    state.stickers.forEach(function(st) {
      ctx.save();
      ctx.font = st.size + 'px serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(st.symbol, st.x, st.y);
      ctx.restore();
    });

    // 4. Render Text Layers
    state.textLayers.forEach(function(layer) {
      ctx.save();
      ctx.font = 'bold ' + layer.size + 'px "' + layer.font + '", sans-serif';
      ctx.fillStyle = layer.color;
      ctx.textAlign = layer.align || 'center';
      ctx.textBaseline = 'middle';

      if (layer.shadow) {
        ctx.shadowColor = 'rgba(0,0,0,0.6)';
        ctx.shadowBlur = 8;
        ctx.shadowOffsetX = 2;
        ctx.shadowOffsetY = 2;
      }

      ctx.fillText(layer.text, layer.x, layer.y);
      ctx.restore();
    });
  }

  function buildFilterString() {
    var parts = [];
    if (state.brightness !== 100) parts.push('brightness(' + state.brightness + '%)');
    if (state.contrast !== 100) parts.push('contrast(' + state.contrast + '%)');
    if (state.saturation !== 100) parts.push('saturate(' + state.saturation + '%)');

    switch (state.filter) {
      case 'warm': parts.push('sepia(25%) saturate(120%)'); break;
      case 'cool': parts.push('hue-rotate(185deg) saturate(110%)'); break;
      case 'vintage': parts.push('sepia(45%) contrast(110%) brightness(95%)'); break;
      case 'grayscale': parts.push('grayscale(100%)'); break;
      case 'sepia': parts.push('sepia(100%)'); break;
      case 'dramatic': parts.push('contrast(140%) brightness(90%)'); break;
    }

    return parts.length > 0 ? parts.join(' ') : 'none';
  }

  function drawImageProp(ctx, img, x, y, w, h) {
    var nw = img.naturalWidth || img.width;
    var nh = img.naturalHeight || img.height;
    var r = Math.max(w / nw, h / nh);
    var nw_scaled = nw * r;
    var nh_scaled = nh * r;
    var cx = (w - nw_scaled) * 0.5;
    var cy = (h - nh_scaled) * 0.5;
    ctx.drawImage(img, 0, 0, nw, nh, x + cx, y + cy, nw_scaled, nh_scaled);
  }

  function roundRect(ctx, x, y, w, h, r) {
    if (w < 2 * r) r = w / 2;
    if (h < 2 * r) r = h / 2;
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }

  // ══════════════════════════════════════════════════════════════════
  // 12. CANVAS CLICK / SLOT SELECTOR INTERACTION
  // ══════════════════════════════════════════════════════════════════
  canvas.addEventListener('click', function(e) {
    var rect = canvas.getBoundingClientRect();
    var scaleX = canvas.width / rect.width;
    var scaleY = canvas.height / rect.height;
    var clickX = (e.clientX - rect.left) * scaleX;
    var clickY = (e.clientY - rect.top) * scaleY;

    var m = state.margin;
    var g = state.gap;
    var availW = canvas.width - (m * 2);
    var availH = canvas.height - (m * 2);

    for (var i = 0; i < state.cells.length; i++) {
      var cell = state.cells[i];
      var cellX = m + (cell.x * availW) + (g / 2);
      var cellY = m + (cell.y * availH) + (g / 2);
      var cellW = (cell.w * availW) - g;
      var cellH = (cell.h * availH) - g;

      if (clickX >= cellX && clickX <= cellX + cellW && clickY >= cellY && clickY <= cellY + cellH) {
        state.activeCellIndex = i;
        renderCanvas();
        // If empty, trigger photo selector
        if (!state.slotImages[i]) {
          if (fileInput) fileInput.click();
        }
        return;
      }
    }

    state.activeCellIndex = null;
    renderCanvas();
  });

  // ══════════════════════════════════════════════════════════════════
  // 13. ZOOM & AUTO-FIT
  // ══════════════════════════════════════════════════════════════════
  window.zoomIn = function() {
    state.zoom = Math.min(2.5, state.zoom + 0.15);
    applyZoom();
  };

  window.zoomOut = function() {
    state.zoom = Math.max(0.3, state.zoom - 0.15);
    applyZoom();
  };

  window.zoomReset = function() {
    autoFitZoom();
  };

  function applyZoom() {
    var wrap = document.getElementById('canvasWrapPro');
    if (wrap) {
      canvas.style.transform = 'scale(' + state.zoom + ')';
    }
    var badge = document.getElementById('zoomBadge');
    if (badge) badge.textContent = Math.round(state.zoom * 100) + '%';
  }

  function autoFitZoom() {
    var stage = document.getElementById('proStageArea');
    if (!stage) return;
    var sw = stage.clientWidth - 64;
    var sh = stage.clientHeight - 64;
    var scale = Math.min(sw / state.canvasW, sh / state.canvasH, 1.0);
    state.zoom = Math.max(0.4, scale);
    applyZoom();
  }

  // ══════════════════════════════════════════════════════════════════
  // 14. 4K ULTRA HD EXPORT MODAL & GENERATOR
  // ══════════════════════════════════════════════════════════════════
  var selectedExportFmt = 'png';

  window.openExportModalPro = function() {
    var modal = document.getElementById('proExportModal');
    if (modal) modal.style.display = 'flex';
  };

  window.closeExportModalPro = function() {
    var modal = document.getElementById('proExportModal');
    if (modal) modal.style.display = 'none';
  };

  window.setExportFmtPro = function(fmt, card) {
    selectedExportFmt = fmt;
    document.querySelectorAll('.export-card-opt').forEach(function(c) { c.classList.remove('active'); });
    if (card) card.classList.add('active');
    var qualityRow = document.getElementById('jpegQualityRow');
    if (qualityRow) {
      qualityRow.style.display = (fmt === 'jpg' || fmt === 'jpeg') ? 'block' : 'none';
    }
  };

  window.downloadCollagePro = function() {
    var scale = parseInt(document.getElementById('exportScaleSelect').value || 2);
    var filename = (document.getElementById('exportFilenameInput').value || 'photo-collage').trim();
    var quality = parseFloat(document.getElementById('jpegQualitySlider') ? document.getElementById('jpegQualitySlider').value : 95) / 100;

    // Render onto high-res export canvas
    var expCanvas = document.createElement('canvas');
    expCanvas.width = canvas.width * scale;
    expCanvas.height = canvas.height * scale;
    var expCtx = expCanvas.getContext('2d');
    expCtx.scale(scale, scale);

    // Render
    var oldCanvas = canvas;
    var oldCtx = ctx;
    canvas = expCanvas;
    ctx = expCtx;
    renderCanvas();
    canvas = oldCanvas;
    ctx = oldCtx;

    // Format handling
    var mime = 'image/png';
    if (selectedExportFmt === 'jpg' || selectedExportFmt === 'jpeg') mime = 'image/jpeg';
    else if (selectedExportFmt === 'webp') mime = 'image/webp';

    var dataUrl = expCanvas.toDataURL(mime, quality);

    if (selectedExportFmt === 'pdf' && window.jspdf) {
      var { jsPDF } = window.jspdf;
      var pdf = new jsPDF({
        orientation: expCanvas.width > expCanvas.height ? 'landscape' : 'portrait',
        unit: 'px',
        format: [canvas.width, canvas.height]
      });
      pdf.addImage(dataUrl, 'PNG', 0, 0, canvas.width, canvas.height);
      pdf.save(filename + '.pdf');
    } else {
      var a = document.createElement('a');
      a.download = filename + '.' + (selectedExportFmt === 'jpg' ? 'jpeg' : selectedExportFmt);
      a.href = dataUrl;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }

    closeExportModalPro();
  };

  // Initial Boot
  window.addEventListener('resize', autoFitZoom);
  setTimeout(function() {
    // Select initial layout card button if present
    var initCard = document.querySelector('[data-layout="' + state.activeLayout + '"]');
    if (initCard) {
      document.querySelectorAll('.layout-card-pro').forEach(function(c) { c.classList.remove('active'); });
      initCard.classList.add('active');
    }
    renderCanvas();
    autoFitZoom();
  }, 100);

})();
