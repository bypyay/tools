/**
 * Daily1Step Collage Tools - Core Canvas Collage Engine
 * High-performance 2D Canvas rendering for 100+ templates, custom grids, and 4K export.
 */

window.CollageCore = {
  // Preset Layout Cell Coordinates (x, y, w, h in percentages 0..1)
  LAYOUTS: {
    // 2 Photos
    "2-side": [
      { x: 0, y: 0, w: 0.5, h: 1 },
      { x: 0.5, y: 0, w: 0.5, h: 1 }
    ],
    "2-vert": [
      { x: 0, y: 0, w: 1, h: 0.5 },
      { x: 0, y: 0.5, w: 1, h: 0.5 }
    ],
    // 3 Photos
    "3-left-big": [
      { x: 0, y: 0, w: 0.5, h: 1 },
      { x: 0.5, y: 0, w: 0.5, h: 0.5 },
      { x: 0.5, y: 0.5, w: 0.5, h: 0.5 }
    ],
    "3-top-big": [
      { x: 0, y: 0, w: 1, h: 0.5 },
      { x: 0, y: 0.5, w: 0.5, h: 0.5 },
      { x: 0.5, y: 0.5, w: 0.5, h: 0.5 }
    ],
    "3-row": [
      { x: 0, y: 0, w: 1/3, h: 1 },
      { x: 1/3, y: 0, w: 1/3, h: 1 },
      { x: 2/3, y: 0, w: 1/3, h: 1 }
    ],
    // 4 Photos
    "4-grid": [
      { x: 0, y: 0, w: 0.5, h: 0.5 },
      { x: 0.5, y: 0, w: 0.5, h: 0.5 },
      { x: 0, y: 0.5, w: 0.5, h: 0.5 },
      { x: 0.5, y: 0.5, w: 0.5, h: 0.5 }
    ],
    "4-strip": [
      { x: 0, y: 0, w: 0.25, h: 1 },
      { x: 0.25, y: 0, w: 0.25, h: 1 },
      { x: 0.5, y: 0, w: 0.25, h: 1 },
      { x: 0.75, y: 0, w: 0.25, h: 1 }
    ],
    // 5 Photos
    "5-mag": [
      { x: 0, y: 0, w: 0.6, h: 1 },
      { x: 0.6, y: 0, w: 0.4, h: 0.25 },
      { x: 0.6, y: 0.25, w: 0.4, h: 0.25 },
      { x: 0.6, y: 0.5, w: 0.4, h: 0.25 },
      { x: 0.6, y: 0.75, w: 0.4, h: 0.25 }
    ],
    // 6 Photos
    "6-grid": [
      { x: 0, y: 0, w: 1/3, h: 0.5 },
      { x: 1/3, y: 0, w: 1/3, h: 0.5 },
      { x: 2/3, y: 0, w: 1/3, h: 0.5 },
      { x: 0, y: 0.5, w: 1/3, h: 0.5 },
      { x: 1/3, y: 0.5, w: 1/3, h: 0.5 },
      { x: 2/3, y: 0.5, w: 1/3, h: 0.5 }
    ],
    // 8 Photos
    "8-grid": [
      { x: 0, y: 0, w: 0.25, h: 0.5 },
      { x: 0.25, y: 0, w: 0.25, h: 0.5 },
      { x: 0.5, y: 0, w: 0.25, h: 0.5 },
      { x: 0.75, y: 0, w: 0.25, h: 0.5 },
      { x: 0, y: 0.5, w: 0.25, h: 0.5 },
      { x: 0.25, y: 0.5, w: 0.25, h: 0.5 },
      { x: 0.5, y: 0.5, w: 0.25, h: 0.5 },
      { x: 0.75, y: 0.5, w: 0.25, h: 0.5 }
    ],
    // 9 Photos
    "9-grid": [
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
    "10-grid": [
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
    "12-grid": [
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
    ]
  },

  /**
   * Generate an NxM custom grid layout array.
   */
  createGrid: function(cols, rows) {
    var cells = [];
    var cellW = 1 / cols;
    var cellH = 1 / rows;
    for (var r = 0; r < rows; r++) {
      for (var c = 0; c < cols; c++) {
        cells.push({
          x: c * cellW,
          y: r * cellH,
          w: cellW,
          h: cellH
        });
      }
    }
    return cells;
  },

  /**
   * Render collage onto target canvas.
   */
  renderCollage: function(canvas, options) {
    options = options || {};
    var ctx = canvas.getContext('2d');
    var W = canvas.width;
    var H = canvas.height;
    var cells = options.cells || this.LAYOUTS["4-grid"];
    var images = options.images || [];
    var spacing = options.spacing !== undefined ? options.spacing : 12;
    var radius = options.radius !== undefined ? options.radius : 8;
    var bgColor = options.bgColor || "#ffffff";
    var borderColor = options.borderColor || "#ffffff";
    var filter = options.filter || "none";
    var textOverlay = options.text || "";

    // 1. Draw Canvas Background
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, W, H);

    // 2. Draw Each Cell
    cells.forEach(function(cell, idx) {
      var cellX = cell.x * W + spacing / 2;
      var cellY = cell.y * H + spacing / 2;
      var cellW = cell.w * W - spacing;
      var cellH = cell.h * H - spacing;

      if (cellW <= 0 || cellH <= 0) return;

      ctx.save();
      // Apply rounded corner clipping
      ctx.beginPath();
      if (ctx.roundRect) {
        ctx.roundRect(cellX, cellY, cellW, cellH, radius);
      } else {
        ctx.rect(cellX, cellY, cellW, cellH);
      }
      ctx.clip();

      var img = images[idx];
      if (img && img.complete && img.naturalWidth > 0) {
        // Draw image object-fit: cover
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

        // Apply CSS filters if needed
        if (filter === 'grayscale') ctx.filter = 'grayscale(100%)';
        else if (filter === 'sepia') ctx.filter = 'sepia(80%)';
        else if (filter === 'vintage') ctx.filter = 'contrast(120%) brightness(95%) sepia(30%)';
        else if (filter === 'warm') ctx.filter = 'saturate(130%) sepia(20%)';
        else if (filter === 'cool') ctx.filter = 'hue-rotate(180deg) saturate(90%)';
        else ctx.filter = 'none';

        ctx.drawImage(img, drawX, drawY, drawW, drawH);
      } else {
        // Empty Cell Placeholder
        ctx.fillStyle = "#f1f5f9";
        ctx.fillRect(cellX, cellY, cellW, cellH);
        ctx.fillStyle = "#94a3b8";
        ctx.font = "bold 16px 'Plus Jakarta Sans', sans-serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText("Photo " + (idx + 1), cellX + cellW / 2, cellY + cellH / 2);
      }
      ctx.restore();
    });

    // 3. Draw Text Overlay if present
    if (textOverlay) {
      ctx.save();
      ctx.fillStyle = options.textColor || "#ffffff";
      ctx.strokeStyle = "#000000";
      ctx.lineWidth = 4;
      ctx.font = "bold 32px 'Outfit', sans-serif";
      ctx.textAlign = "center";
      ctx.strokeText(textOverlay, W / 2, H - 24);
      ctx.fillText(textOverlay, W / 2, H - 24);
      ctx.restore();
    }
  },

  /**
   * Export canvas to high resolution Blob or DataURL.
   */
  exportCollage: function(canvas, scale, type, quality) {
    scale = scale || 1;
    type = type || 'image/png';
    quality = quality || 0.95;

    if (scale === 1) {
      return canvas.toDataURL(type, quality);
    }

    var hiResCanvas = document.createElement('canvas');
    hiResCanvas.width = canvas.width * scale;
    hiResCanvas.height = canvas.height * scale;
    var hCtx = hiResCanvas.getContext('2d');
    hCtx.scale(scale, scale);
    hCtx.drawImage(canvas, 0, 0);
    return hiResCanvas.toDataURL(type, quality);
  },

  /**
   * Helper to trigger download.
   */
  downloadFile: function(dataUrl, filename) {
    var a = document.createElement('a');
    a.href = dataUrl;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    setTimeout(function() {
      document.body.removeChild(a);
    }, 100);
  }
};
