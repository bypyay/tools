/**
 * Daily1Step GIF Tools - Core Client-Side Engine
 * Handles frame decoding, manipulation, canvas filters, and GIF encoding.
 */

window.GifCore = {
  /**
   * Decode an animated GIF ArrayBuffer into individual Canvas frames with delay times using omggif.
   */
  decodeGif: function(arrayBuffer) {
    return new Promise(function(resolve, reject) {
      try {
        var uint8 = new Uint8Array(arrayBuffer);
        var gr = new GifReader(uint8);
        var width = gr.width;
        var height = gr.height;
        var numFrames = gr.numFrames();
        var frames = [];

        var canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        var ctx = canvas.getContext('2d');
        var fullImageData = ctx.createImageData(width, height);

        for (var i = 0; i < numFrames; i++) {
          var frameInfo = gr.frameInfo(i);
          gr.decodeAndBlitFrameRGBA(i, fullImageData.data);

          // Create a detached canvas for this frame
          var fCanvas = document.createElement('canvas');
          fCanvas.width = width;
          fCanvas.height = height;
          var fCtx = fCanvas.getContext('2d');
          fCtx.putImageData(fullImageData, 0, 0);

          frames.push({
            canvas: fCanvas,
            ctx: fCtx,
            delay: (frameInfo.delay || 10) * 10, // convert 1/100s to ms
            disposal: frameInfo.disposal
          });
        }

        resolve({
          width: width,
          height: height,
          numFrames: numFrames,
          frames: frames
        });
      } catch (err) {
        reject(err);
      }
    });
  },

  /**
   * Encode multiple images or canvases into an animated GIF via gifshot.
   */
  createGifFromImages: function(imagesOrCanvases, options) {
    options = options || {};
    return new Promise(function(resolve, reject) {
      var defaultOpts = {
        images: imagesOrCanvases,
        gifWidth: options.width || 400,
        gifHeight: options.height || 400,
        interval: options.interval || 0.1,
        numFrames: imagesOrCanvases.length,
        numWorkers: 2,
        progressCallback: options.onProgress || function() {}
      };

      if (options.text) {
        defaultOpts.text = options.text;
        defaultOpts.fontWeight = options.fontWeight || 'bold';
        defaultOpts.fontSize = (options.fontSize || '24') + 'px';
        defaultOpts.fontFamily = options.fontFamily || 'Arial';
        defaultOpts.fontColor = options.fontColor || '#FFFFFF';
        defaultOpts.textAlign = options.textAlign || 'center';
        defaultOpts.textBaseline = options.textBaseline || 'bottom';
      }

      gifshot.createGIF(defaultOpts, function(obj) {
        if (!obj.error) {
          resolve(obj.image); // data:image/gif;base64,...
        } else {
          reject(new Error(obj.errorMsg || 'Failed to create GIF'));
        }
      });
    });
  },

  /**
   * Convert a Video file to an animated GIF via gifshot.
   */
  createGifFromVideo: function(videoUrl, options) {
    options = options || {};
    return new Promise(function(resolve, reject) {
      var opts = {
        video: [videoUrl],
        gifWidth: options.width || 480,
        gifHeight: options.height || 360,
        videoDuration: options.duration || 5,
        offset: options.offset || 0,
        interval: 1 / (options.fps || 10),
        numWorkers: 2,
        progressCallback: options.onProgress || function() {}
      };

      gifshot.createGIF(opts, function(obj) {
        if (!obj.error) {
          resolve(obj.image);
        } else {
          reject(new Error(obj.errorMsg || 'Video to GIF conversion failed'));
        }
      });
    });
  },

  /**
   * Convert Data URL to Blob for download.
   */
  dataUrlToBlob: function(dataUrl) {
    var arr = dataUrl.split(',');
    var mime = arr[0].match(/:(.*?);/)[1];
    var bstr = atob(arr[1]);
    var n = bstr.length;
    var u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new Blob([u8arr], { type: mime });
  },

  /**
   * Trigger browser file download.
   */
  downloadFile: function(blobOrDataUrl, filename) {
    var url = typeof blobOrDataUrl === 'string' ? blobOrDataUrl : URL.createObjectURL(blobOrDataUrl);
    var a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    setTimeout(function() {
      document.body.removeChild(a);
      if (typeof blobOrDataUrl !== 'string') {
        URL.revokeObjectURL(url);
      }
    }, 100);
  },

  /**
   * Format bytes to readable KB/MB.
   */
  formatBytes: function(bytes, decimals) {
    if (bytes === 0) return '0 Bytes';
    var k = 1024;
    var dm = decimals < 0 ? 0 : (decimals || 2);
    var sizes = ['Bytes', 'KB', 'MB', 'GB'];
    var i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  }
};
