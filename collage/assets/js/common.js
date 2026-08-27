  
  function loadJS(FILE_URL, async = true,adload = false,typ='ot') {
    let scriptEle = document.createElement("script");
  
    scriptEle.setAttribute("src", FILE_URL);
    scriptEle.setAttribute("type", "text/javascript");
    scriptEle.setAttribute("async", async);
  
    document.body.appendChild(scriptEle);
  
    // success event 
    scriptEle.addEventListener("load", () => {
     
    });
     // error event
    scriptEle.addEventListener("error", (ev) => {
      console.log("Error on loading file", ev);
    });
  }

function loadgtags(){
  if(!location.href.includes('127.')){
    loadJS("https://www.googletagmanager.com/gtag/js?id=G-PSBMTG193Q", true);
    window.dataLayer = window.dataLayer || [];
    function gtag() { dataLayer.push(arguments); }
    gtag('js', new Date());
    gtag('config', 'G-PSBMTG193Q');
  }
}
  

window.onload = function(){
    loadEzoicAds()
    loadgtags()
}

// Ezoic ads: inject standalone placeholders and request them.
// Placement IDs are configured in the Ezoic dashboard for collage.pi7.org:
//   124 = landing-page sidebar 336x280       (loaded on page load)
//   125 = collage editor right-panel 250x250 (loaded on page load)
//   126 = export modal right column 336x280  (loaded on demand, when export modal opens)
var adcontside = document.getElementById('adcontside');
var adboxtool = document.getElementById('ad-box');

function loadEzoicAds() {
  window.ezstandalone = window.ezstandalone || {};
  ezstandalone.cmd = ezstandalone.cmd || [];

  if (adcontside && screen.width > 750) {
    ezstandalone.cmd.push(function () {
        ezstandalone.showAds(124);
    });
  }

  if (adboxtool && screen.width > 768) {
    ezstandalone.cmd.push(function () {
        ezstandalone.showAds(125);
    });
  }
}

if (adcontside && screen.width > 750) {
    adcontside.insertAdjacentHTML('afterbegin', '<div id="ezoic-pub-ad-placeholder-124"></div>');
}

if (adboxtool && screen.width > 768) {
    adboxtool.insertAdjacentHTML('afterbegin', '<div id="ezoic-pub-ad-placeholder-125"></div>');
}

// Called when the export modal opens — defers ad load until needed.
// Idempotent: placeholder is only injected the first time; subsequent
// calls just trigger showAds() which Ezoic refreshes.
function loadExportAd() {
  var box = document.getElementById('exp-ad-box');
  if (!box || screen.width <= 750) return;
  if (!box.querySelector('#ezoic-pub-ad-placeholder-126')) {
    box.insertAdjacentHTML('afterbegin', '<div id="ezoic-pub-ad-placeholder-126"></div>');
  }
  window.ezstandalone = window.ezstandalone || {};
  ezstandalone.cmd = ezstandalone.cmd || [];
  ezstandalone.cmd.push(function () {
    ezstandalone.showAds(126);
  });
}
window.loadExportAd = loadExportAd;