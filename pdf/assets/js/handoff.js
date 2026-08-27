// Carries a result file (e.g. a merged PDF) from one tool's result screen
// into another tool's upload step, entirely client-side via IndexedDB, so
// the user never has to re-download and re-upload the same file.
window.PdfHandoff = (function () {
  var DB_NAME = 'pdfnext_handoff';
  var STORE = 'files';
  var KEY = 'current';

  function openDb() {
    return new Promise(function (resolve, reject) {
      var req = indexedDB.open(DB_NAME, 1);
      req.onupgradeneeded = function () {
        req.result.createObjectStore(STORE);
      };
      req.onsuccess = function () { resolve(req.result); };
      req.onerror = function () { reject(req.error); };
    });
  }

  function save(blob, filename) {
    return openDb().then(function (db) {
      return new Promise(function (resolve, reject) {
        var tx = db.transaction(STORE, 'readwrite');
        tx.objectStore(STORE).put({ blob: blob, filename: filename }, KEY);
        tx.oncomplete = function () { resolve(); };
        tx.onerror = function () { reject(tx.error); };
      });
    });
  }

  // Reads the pending handoff file and removes it, so it isn't re-applied
  // on a later, unrelated visit to a tool page.
  function take() {
    return openDb().then(function (db) {
      return new Promise(function (resolve, reject) {
        var tx = db.transaction(STORE, 'readwrite');
        var store = tx.objectStore(STORE);
        var getReq = store.get(KEY);
        getReq.onsuccess = function () {
          var result = getReq.result || null;
          if (result) store.delete(KEY);
          resolve(result);
        };
        getReq.onerror = function () { reject(getReq.error); };
      });
    }).catch(function () { return null; });
  }

  function goTo(url, blob, filename) {
    save(blob, filename).then(function () {
      window.location.href = url;
    });
  }

  var TOOLS = {
    'merge-pdf': { title: 'Merge PDF', color: '#e5322d' },
    'split-pdf': { title: 'Split PDF', color: '#1ba94c' },
    'compress-pdf': { title: 'Compress PDF', color: '#e58a1c' },
    'pdf-to-jpg': { title: 'PDF to JPG', color: '#2b7de9' },
    'jpg-to-pdf': { title: 'JPG to PDF', color: '#8a3ee5' }
  };

  // Renders a row of "Continue to <tool>" buttons. blobProvider is a
  // function returning { blob, filename } for the file to hand off.
  function renderContinueBox(container, keys, blobProvider) {
    container.innerHTML = '';
    keys.forEach(function (key) {
      var meta = TOOLS[key];
      if (!meta) return;
      var item = document.createElement('div');
      item.className = 'continue-item';
      item.innerHTML = '<span class="continue-icon" style="background:' + meta.color + '"></span><span>' + meta.title + '</span>';
      item.addEventListener('click', function () {
        var res = blobProvider();
        if (!res) return;
        goTo('../' + key + '/', res.blob, res.filename);
      });
      container.appendChild(item);
    });
  }

  function showBanner(text) {
    var banner = document.getElementById('handoffBanner');
    var textEl = document.getElementById('handoffBannerText');
    if (!banner || !textEl) return;
    textEl.textContent = text;
    banner.style.display = 'flex';
  }

  return { save: save, take: take, goTo: goTo, renderContinueBox: renderContinueBox, showBanner: showBanner, TOOLS: TOOLS };
})();
