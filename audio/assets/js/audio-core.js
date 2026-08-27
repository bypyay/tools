/**
 * Daily1Step Audio Core Engine
 * Client-Side Web Audio API, Interactive Waveform, and MP3/WAV Encoders
 */
(function(window) {
  'use strict';

  var AudioCore = {};
  var audioCtx = null;

  AudioCore.getContext = function() {
    if (!audioCtx) {
      var AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (AudioContextClass) {
        audioCtx = new AudioContextClass();
      }
    }
    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
    return audioCtx;
  };

  /**
   * Decode any File or Blob to AudioBuffer
   */
  AudioCore.decodeAudioFile = function(file) {
    return new Promise(function(resolve, reject) {
      var reader = new FileReader();
      reader.onload = function(e) {
        var arrayBuffer = e.target.result;
        var ctx = AudioCore.getContext();
        if (!ctx) {
          return reject(new Error('Web Audio API is not supported in this browser.'));
        }
        ctx.decodeAudioData(arrayBuffer.slice(0), function(decodedBuffer) {
          resolve(decodedBuffer);
        }, function(err) {
          reject(err || new Error('Failed to decode audio data.'));
        });
      };
      reader.onerror = function() {
        reject(new Error('Failed to read file from disk.'));
      };
      reader.readAsArrayBuffer(file);
    });
  };

  /**
   * Format seconds to MM:SS or MM:SS.ms
   */
  AudioCore.formatTime = function(sec, withMs) {
    if (isNaN(sec) || sec < 0) sec = 0;
    var m = Math.floor(sec / 60);
    var s = Math.floor(sec % 60);
    var ms = Math.floor((sec % 1) * 100);
    var str = (m < 10 ? '0' + m : m) + ':' + (s < 10 ? '0' + s : s);
    if (withMs) {
      str += '.' + (ms < 10 ? '0' + ms : ms);
    }
    return str;
  };

  /**
   * Format file size bytes to human string
   */
  AudioCore.formatBytes = function(bytes) {
    if (!bytes || bytes === 0) return '0 B';
    var k = 1024;
    var sizes = ['B', 'KB', 'MB', 'GB'];
    var i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  /**
   * Slice AudioBuffer from startSec to endSec
   */
  AudioCore.sliceAudioBuffer = function(buffer, startSec, endSec) {
    var ctx = AudioCore.getContext();
    var sampleRate = buffer.sampleRate;
    var channels = buffer.numberOfChannels;
    var startSample = Math.floor(Math.max(0, startSec) * sampleRate);
    var endSample = Math.floor(Math.min(buffer.duration, endSec) * sampleRate);
    var frameCount = Math.max(1, endSample - startSample);

    var newBuffer = ctx.createBuffer(channels, frameCount, sampleRate);
    for (var i = 0; i < channels; i++) {
      var srcData = buffer.getChannelData(i);
      var destData = newBuffer.getChannelData(i);
      for (var j = 0; j < frameCount; j++) {
        destData[j] = srcData[startSample + j] || 0;
      }
    }
    return newBuffer;
  };

  /**
   * Reverse AudioBuffer
   */
  AudioCore.reverseAudioBuffer = function(buffer) {
    var ctx = AudioCore.getContext();
    var channels = buffer.numberOfChannels;
    var length = buffer.length;
    var sampleRate = buffer.sampleRate;
    var newBuffer = ctx.createBuffer(channels, length, sampleRate);

    for (var i = 0; i < channels; i++) {
      var src = buffer.getChannelData(i);
      var dest = newBuffer.getChannelData(i);
      for (var j = 0; j < length; j++) {
        dest[j] = src[length - 1 - j];
      }
    }
    return newBuffer;
  };

  /**
   * Apply Gain / Volume multiplier
   */
  AudioCore.applyGain = function(buffer, gain) {
    var ctx = AudioCore.getContext();
    var channels = buffer.numberOfChannels;
    var length = buffer.length;
    var sampleRate = buffer.sampleRate;
    var newBuffer = ctx.createBuffer(channels, length, sampleRate);

    for (var i = 0; i < channels; i++) {
      var src = buffer.getChannelData(i);
      var dest = newBuffer.getChannelData(i);
      for (var j = 0; j < length; j++) {
        var val = src[j] * gain;
        // Soft clipping
        if (val > 1.0) val = 1.0;
        else if (val < -1.0) val = -1.0;
        dest[j] = val;
      }
    }
    return newBuffer;
  };

  /**
   * Concat multiple AudioBuffers into one
   */
  AudioCore.concatAudioBuffers = function(buffers) {
    var ctx = AudioCore.getContext();
    if (!buffers || buffers.length === 0) return null;
    if (buffers.length === 1) return buffers[0];

    var channels = Math.max.apply(null, buffers.map(function(b) { return b.numberOfChannels; }));
    var sampleRate = buffers[0].sampleRate;
    var totalLength = buffers.reduce(function(acc, b) { return acc + b.length; }, 0);

    var newBuffer = ctx.createBuffer(channels, totalLength, sampleRate);

    for (var c = 0; c < channels; c++) {
      var dest = newBuffer.getChannelData(c);
      var offset = 0;
      for (var b = 0; b < buffers.length; b++) {
        var buf = buffers[b];
        var src = (c < buf.numberOfChannels) ? buf.getChannelData(c) : buf.getChannelData(0);
        dest.set(src, offset);
        offset += buf.length;
      }
    }
    return newBuffer;
  };

  /**
   * Convert AudioBuffer to 16-bit stereo/mono WAV Blob
   */
  AudioCore.audioBufferToWav = function(buffer, opt) {
    opt = opt || {};
    var numChannels = buffer.numberOfChannels;
    var sampleRate = buffer.sampleRate;
    var format = 1; // PCM
    var bitDepth = 16;

    var result;
    if (numChannels === 2) {
      result = interleave(buffer.getChannelData(0), buffer.getChannelData(1));
    } else {
      result = buffer.getChannelData(0);
    }

    var bytesPerSample = bitDepth / 8;
    var blockAlign = numChannels * bytesPerSample;
    var dataSize = result.length * bytesPerSample;
    var headerSize = 44;
    var totalSize = headerSize + dataSize;
    var arrayBuffer = new ArrayBuffer(totalSize);
    var view = new DataView(arrayBuffer);

    /* RIFF identifier */
    writeString(view, 0, 'RIFF');
    /* RIFF chunk length */
    view.setUint32(4, 36 + dataSize, true);
    /* RIFF type */
    writeString(view, 8, 'WAVE');
    /* format chunk identifier */
    writeString(view, 12, 'fmt ');
    /* format chunk length */
    view.setUint32(16, 16, true);
    /* sample format (raw) */
    view.setUint16(20, format, true);
    /* channel count */
    view.setUint16(22, numChannels, true);
    /* sample rate */
    view.setUint32(24, sampleRate, true);
    /* byte rate (sample rate * block align) */
    view.setUint32(28, sampleRate * blockAlign, true);
    /* block align (channel count * bytes per sample) */
    view.setUint16(32, blockAlign, true);
    /* bits per sample */
    view.setUint16(34, bitDepth, true);
    /* data chunk identifier */
    writeString(view, 36, 'data');
    /* data chunk length */
    view.setUint32(40, dataSize, true);

    // Float to 16-bit PCM
    var offset = 44;
    for (var i = 0; i < result.length; i++, offset += 2) {
      var s = Math.max(-1, Math.min(1, result[i]));
      view.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7FFF, true);
    }

    return new Blob([view], { type: 'audio/wav' });

    function writeString(v, off, str) {
      for (var k = 0; k < str.length; k++) {
        v.setUint8(off + k, str.charCodeAt(k));
      }
    }

    function interleave(inputL, inputR) {
      var length = inputL.length + inputR.length;
      var r = new Float32Array(length);
      var index = 0, inputIndex = 0;
      while (index < length) {
        r[index++] = inputL[inputIndex];
        r[index++] = inputR[inputIndex];
        inputIndex++;
      }
      return r;
    }
  };

  /**
   * Convert AudioBuffer to MP3 Blob using lamejs
   */
  AudioCore.audioBufferToMp3 = function(buffer, bitrate, onProgress) {
    return new Promise(function(resolve, reject) {
      if (typeof lamejs === 'undefined') {
        // Fallback to WAV if lamejs is unavailable
        resolve(AudioCore.audioBufferToWav(buffer));
        return;
      }

      bitrate = bitrate || 192;
      var channels = buffer.numberOfChannels;
      var sampleRate = buffer.sampleRate;
      var mp3encoder = new lamejs.Mp3Encoder(channels, sampleRate, bitrate);
      var mp3Data = [];

      var sampleBlockSize = 1152;
      var left = buffer.getChannelData(0);
      var right = channels > 1 ? buffer.getChannelData(1) : left;

      // Convert float32 to int16
      var leftInt = new Int16Array(left.length);
      var rightInt = new Int16Array(right.length);
      for (var i = 0; i < left.length; i++) {
        var sL = Math.max(-1, Math.min(1, left[i]));
        var sR = Math.max(-1, Math.min(1, right[i]));
        leftInt[i] = sL < 0 ? sL * 0x8000 : sL * 0x7FFF;
        rightInt[i] = sR < 0 ? sR * 0x8000 : sR * 0x7FFF;
      }

      var totalBlocks = Math.ceil(left.length / sampleBlockSize);
      var currentBlock = 0;

      function processChunk() {
        var chunkLimit = 150; // Process 150 blocks per tick to keep UI fluid
        while (currentBlock < totalBlocks && chunkLimit > 0) {
          var start = currentBlock * sampleBlockSize;
          var end = Math.min(start + sampleBlockSize, left.length);
          var leftChunk = leftInt.subarray(start, end);
          var rightChunk = rightInt.subarray(start, end);

          var mp3buf;
          if (channels === 1) {
            mp3buf = mp3encoder.encodeBuffer(leftChunk);
          } else {
            mp3buf = mp3encoder.encodeBuffer(leftChunk, rightChunk);
          }
          if (mp3buf.length > 0) {
            mp3Data.push(mp3buf);
          }

          currentBlock++;
          chunkLimit--;
        }

        if (onProgress) {
          onProgress(Math.min(100, Math.floor((currentBlock / totalBlocks) * 98)));
        }

        if (currentBlock < totalBlocks) {
          setTimeout(processChunk, 0);
        } else {
          var flushBuf = mp3encoder.flush();
          if (flushBuf.length > 0) {
            mp3Data.push(flushBuf);
          }
          if (onProgress) onProgress(100);
          var blob = new Blob(mp3Data, { type: 'audio/mp3' });
          resolve(blob);
        }
      }

      processChunk();
    });
  };

  /**
   * Draw Interactive Retina Audio Waveform on Canvas
   */
  AudioCore.drawWaveform = function(canvas, buffer, opt) {
    if (!canvas || !buffer) return;
    opt = opt || {};
    var ctx = canvas.getContext('2d');
    var dpr = window.devicePixelRatio || 1;
    var rect = canvas.getBoundingClientRect();
    var width = rect.width || canvas.width || 800;
    var height = rect.height || canvas.height || 160;

    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);

    var waveColor = opt.waveColor || '#6366f1';
    var progressColor = opt.progressColor || '#4338ca';
    var selColor = opt.selColor || 'rgba(99, 102, 241, 0.18)';
    var bgColor = opt.bgColor || '#1e1b4b';

    var rawData = buffer.getChannelData(0);
    var samples = Math.floor(width);
    var blockSize = Math.floor(rawData.length / samples);
    var filteredData = [];

    for (var i = 0; i < samples; i++) {
      var blockStart = blockSize * i;
      var sum = 0;
      for (var j = 0; j < blockSize; j++) {
        sum += Math.abs(rawData[blockStart + j] || 0);
      }
      filteredData.push(sum / blockSize);
    }

    // Normalize
    var maxVal = Math.max.apply(null, filteredData) || 1;
    var multiplier = (height / 2) * 0.9 / maxVal;

    // Background
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, width, height);

    // Grid / Center Line
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, height / 2);
    ctx.lineTo(width, height / 2);
    ctx.stroke();

    // Selection Box (Start to End)
    if (opt.startSec !== undefined && opt.endSec !== undefined) {
      var startX = (opt.startSec / buffer.duration) * width;
      var endX = (opt.endSec / buffer.duration) * width;
      ctx.fillStyle = selColor;
      ctx.fillRect(startX, 0, Math.max(2, endX - startX), height);

      // Left handle line
      ctx.strokeStyle = '#a855f7';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(startX, 0);
      ctx.lineTo(startX, height);
      ctx.moveTo(endX, 0);
      ctx.lineTo(endX, height);
      ctx.stroke();
    }

    // Waveform Bars
    var midY = height / 2;
    for (var k = 0; k < samples; k++) {
      var barHeight = Math.max(2, filteredData[k] * multiplier);
      var x = k;

      var isPassed = (opt.currentTime !== undefined && (k / samples) <= (opt.currentTime / buffer.duration));
      ctx.fillStyle = isPassed ? progressColor : waveColor;
      ctx.fillRect(x, midY - barHeight, 1.5, barHeight * 2);
    }

    // Playhead Line
    if (opt.currentTime !== undefined && buffer.duration > 0) {
      var playheadX = (opt.currentTime / buffer.duration) * width;
      ctx.strokeStyle = '#ec4899';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(playheadX, 0);
      ctx.lineTo(playheadX, height);
      ctx.stroke();

      // Playhead Top Pointer
      ctx.fillStyle = '#ec4899';
      ctx.beginPath();
      ctx.arc(playheadX, 6, 5, 0, Math.PI * 2);
      ctx.fill();
    }
  };

  /**
   * Helper to download Blob
   */
  AudioCore.downloadBlob = function(blob, filename) {
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url;
    a.download = filename || 'audio.mp3';
    document.body.appendChild(a);
    a.click();
    setTimeout(function() {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 200);
  };

  window.AudioCore = AudioCore;
})(window);
