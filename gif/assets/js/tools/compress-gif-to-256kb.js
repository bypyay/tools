// Tool logic for Compress GIF to Target KB (compress-gif-to-256kb)
(function() {
  var fileInput = document.getElementById('fileInput');
  var dropZone = document.getElementById('dropZone');
  var workspaceArea = document.getElementById('workspaceArea');
  var processBtn = document.getElementById('processBtn');
  var previewWrap = document.getElementById('previewWrap');
  var previewImg = document.getElementById('previewImg');
  var previewVideo = document.getElementById('previewVideo');
  var resultBox = document.getElementById('resultBox');
  var downloadBtn = document.getElementById('downloadBtn');
  var progressWrap = document.getElementById('progressWrap');
  var progressBar = document.getElementById('progressBar');

  var currentFiles = [];
  var resultBlob = null;
  var resultDataUrl = null;
  var decodedGifData = null;

  if (!fileInput) return;

  fileInput.addEventListener('change', function(e) {
    if (e.target.files && e.target.files.length > 0) {
      currentFiles = Array.from(e.target.files);
      handleFileSelected();
    }
  });

  // Preset chip activation
  document.querySelectorAll('.preset-chip').forEach(function(chip) {
    chip.addEventListener('click', function() {
      chip.parentElement.querySelectorAll('.preset-chip').forEach(function(c) { c.classList.remove('active'); });
      chip.classList.add('active');
    });
  });

  function handleFileSelected() {
    if (currentFiles.length === 0) return;
    workspaceArea.style.display = 'block';
    resultBox.style.display = 'none';

    var firstFile = currentFiles[0];
    if (firstFile.type === 'image/gif') {
      var reader = new FileReader();
      reader.onload = function(ev) {
        previewWrap.style.display = 'flex';
        previewImg.style.display = 'block';
        if (previewVideo) previewVideo.style.display = 'none';
        previewImg.src = ev.target.result;

        // Pre-decode GIF frames using GifCore
        GifCore.decodeGif(ev.target.result).then(function(decoded) {
          decodedGifData = decoded;
        }).catch(function(err) {
          console.warn('Could not decode GIF frames, fallback to canvas renderer:', err);
        });
      };
      reader.readAsArrayBuffer(firstFile);
    } else if (firstFile.type.startsWith('video/')) {
      var vUrl = URL.createObjectURL(firstFile);
      previewWrap.style.display = 'flex';
      previewImg.style.display = 'none';
      if (previewVideo) {
        previewVideo.style.display = 'block';
        previewVideo.src = vUrl;
      }
    } else if (firstFile.type.startsWith('image/')) {
      var reader = new FileReader();
      reader.onload = function(ev) {
        previewWrap.style.display = 'flex';
        previewImg.style.display = 'block';
        previewImg.src = ev.target.result;
      };
      reader.readAsDataURL(firstFile);
    }
  }

  processBtn.addEventListener('click', function() {
    if (currentFiles.length === 0) {
      alert('Please select a file first.');
      return;
    }

    processBtn.disabled = true;
    processBtn.textContent = 'Processing...';
    if (progressWrap) {
      progressWrap.style.display = 'block';
      progressBar.style.width = '30%';
    }

    var firstFile = currentFiles[0];

    if ('target_kb' === 'maker') {
      var interval = parseFloat((document.getElementById('frameInterval') || {}).value || 0.1);
      var dim = parseInt((document.getElementById('gifDimensions') || {}).value || 400);

      var imgUrls = [];
      var loaded = 0;
      currentFiles.forEach(function(f) {
        var reader = new FileReader();
        reader.onload = function(ev) {
          imgUrls.push(ev.target.result);
          loaded++;
          if (loaded === currentFiles.length) {
            GifCore.createGifFromImages(imgUrls, {
              width: dim,
              height: dim,
              interval: interval,
              onProgress: function(p) {
                if (progressBar) progressBar.style.width = Math.round(p * 100) + '%';
              }
            }).then(function(dataUrl) {
              finishSuccess(dataUrl, 'animation.gif');
            }).catch(function(err) {
              alert('Error creating GIF: ' + err.message);
              resetBtn();
            });
          }
        };
        reader.readAsDataURL(f);
      });

    } else if ('target_kb' === 'video_to_gif') {
      var vUrl = URL.createObjectURL(firstFile);
      var offset = parseFloat((document.getElementById('videoOffset') || {}).value || 0);
      var duration = parseFloat((document.getElementById('videoDuration') || {}).value || 5);
      var fps = parseInt((document.getElementById('videoFps') || {}).value || 10);
      var width = parseInt((document.getElementById('videoWidth') || {}).value || 480);

      GifCore.createGifFromVideo(vUrl, {
        offset: offset,
        duration: duration,
        fps: fps,
        width: width,
        height: Math.round(width * 9 / 16),
        onProgress: function(p) {
          if (progressBar) progressBar.style.width = Math.round(p * 100) + '%';
        }
      }).then(function(dataUrl) {
        finishSuccess(dataUrl, 'video-clip.gif');
      }).catch(function(err) {
        alert('Error converting video: ' + err.message);
        resetBtn();
      });

    } else if ('target_kb' === 'split_frames') {
      var reader = new FileReader();
      reader.onload = function(ev) {
        GifCore.decodeGif(ev.target.result).then(function(decoded) {
          var zip = new JSZip();
          decoded.frames.forEach(function(frame, idx) {
            var data = frame.canvas.toDataURL('image/png').split(',')[1];
            zip.file('frame_' + String(idx + 1).padStart(3, '0') + '.png', data, { base64: true });
          });
          zip.generateAsync({ type: 'blob' }).then(function(zipBlob) {
            resultBlob = zipBlob;
            finishSuccess(URL.createObjectURL(zipBlob), 'extracted-frames.zip', true);
          });
        }).catch(function(err) {
          alert('Error extracting frames: ' + err.message);
          resetBtn();
        });
      };
      reader.readAsArrayBuffer(firstFile);

    } else if ('target_kb' === 'reverse') {
      var reader = new FileReader();
      reader.onload = function(ev) {
        GifCore.decodeGif(ev.target.result).then(function(decoded) {
          var mode = (document.getElementById('reverseMode') || {}).value || 'reverse';
          var canvases = decoded.frames.map(function(f) { return f.canvas; });
          if (mode === 'boomerang') {
            var cloned = canvases.slice().reverse();
            canvases = canvases.concat(cloned);
          } else {
            canvases.reverse();
          }
          GifCore.createGifFromImages(canvases, {
            width: decoded.width,
            height: decoded.height,
            interval: 0.1
          }).then(function(dataUrl) {
            finishSuccess(dataUrl, 'reversed.gif');
          });
        }).catch(function(err) {
          alert('Error reversing GIF: ' + err.message);
          resetBtn();
        });
      };
      reader.readAsArrayBuffer(firstFile);

    } else if ('target_kb' === 'text_on_gif') {
      var topText = (document.getElementById('topText') || {}).value || '';
      var bottomText = (document.getElementById('bottomText') || {}).value || '';
      var fontSize = (document.getElementById('fontSize') || {}).value || '28';
      var textColor = (document.getElementById('textColor') || {}).value || '#FFFFFF';

      var reader = new FileReader();
      reader.onload = function(ev) {
        GifCore.decodeGif(ev.target.result).then(function(decoded) {
          var canvases = decoded.frames.map(function(f) {
            var c = f.canvas;
            var ctx = c.getContext('2d');
            ctx.font = 'bold ' + fontSize + 'px Impact, sans-serif';
            ctx.fillStyle = textColor;
            ctx.strokeStyle = '#000000';
            ctx.lineWidth = Math.max(2, parseInt(fontSize) / 8);
            ctx.textAlign = 'center';

            if (topText) {
              ctx.strokeText(topText.toUpperCase(), c.width / 2, parseInt(fontSize) + 10);
              ctx.fillText(topText.toUpperCase(), c.width / 2, parseInt(fontSize) + 10);
            }
            if (bottomText) {
              ctx.strokeText(bottomText.toUpperCase(), c.width / 2, c.height - 16);
              ctx.fillText(bottomText.toUpperCase(), c.width / 2, c.height - 16);
            }
            return c;
          });

          GifCore.createGifFromImages(canvases, {
            width: decoded.width,
            height: decoded.height,
            interval: 0.1
          }).then(function(dataUrl) {
            finishSuccess(dataUrl, 'captioned-meme.gif');
          });
        }).catch(function(err) {
          alert('Error captioning GIF: ' + err.message);
          resetBtn();
        });
      };
      reader.readAsArrayBuffer(firstFile);

    } else {
      // Generic optimized encoder for resizer, speed, compressor, etc.
      var reader = new FileReader();
      reader.onload = function(ev) {
        GifCore.decodeGif(ev.target.result).then(function(decoded) {
          var canvases = decoded.frames.map(function(f) { return f.canvas; });
          var outWidth = decoded.width;
          var outHeight = decoded.height;

          // Speed multiplier check
          var speedChip = document.querySelector('.preset-chip.active[data-speed]');
          var speedMult = speedChip ? parseFloat(speedChip.getAttribute('data-speed')) : 1.0;
          var interval = 0.1 / speedMult;

          // Resize check
          var customW = parseInt((document.getElementById('resizeWidth') || {}).value);
          var customH = parseInt((document.getElementById('resizeHeight') || {}).value);
          if (customW && customH) {
            outWidth = customW;
            outHeight = customH;
          }

          GifCore.createGifFromImages(canvases, {
            width: outWidth,
            height: outHeight,
            interval: interval
          }).then(function(dataUrl) {
            finishSuccess(dataUrl, 'optimized.gif');
          });
        }).catch(function(err) {
          alert('Error processing GIF: ' + err.message);
          resetBtn();
        });
      };
      reader.readAsArrayBuffer(firstFile);
    }
  });

  function finishSuccess(outputUrlOrData, filename, isBlob) {
    resetBtn();
    if (progressWrap) progressWrap.style.display = 'none';
    resultBox.style.display = 'block';

    if (!isBlob) {
      previewWrap.style.display = 'flex';
      previewImg.style.display = 'block';
      if (previewVideo) previewVideo.style.display = 'none';
      previewImg.src = outputUrlOrData;
    }

    downloadBtn.onclick = function() {
      GifCore.downloadFile(outputUrlOrData, filename);
    };
  }

  function resetBtn() {
    processBtn.disabled = false;
    processBtn.textContent = 'Process GIF';
  }
})();
