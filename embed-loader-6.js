(function(){
  "use strict";

  // Find this script reliably, even when injected asynchronously by a page builder.
  var thisScript = document.currentScript;
  if(!thisScript){
    var all = document.querySelectorAll('script[src*="embed-loader-6.js"]');
    thisScript = all[all.length - 1];
  }
  var scriptSrc = (thisScript && thisScript.src) || '';
  var origin = '';
  var scriptBase = '';
  try {
    var scriptUrl = new URL(scriptSrc, window.location.href);
    origin = scriptUrl.origin;
    scriptBase = new URL('.', scriptUrl.href).href;
  } catch(e) {}

  var qIndex = scriptSrc.indexOf('?');
  var hIndex = scriptSrc.indexOf('#');
  var queryPart = qIndex > -1 ? scriptSrc.slice(qIndex + 1, hIndex > qIndex ? hIndex : undefined) : '';
  var hashPart = hIndex > -1 ? scriptSrc.slice(hIndex + 1) : '';
  var params = new URLSearchParams(queryPart);
  var hashParams = new URLSearchParams(hashPart);

  // Settings payload (base64 JSON). Carried in the fragment so it is never sent to a
  // server: no request-size limits, so uploaded images (data URLs) embed fine.
  var payload = hashParams.get('p') || hashParams.get('data') || params.get('data') || '';

  // Page can come from ?page=, data-page="", or defaults to the frame on this origin.
  var fileName =
    params.get('file') ||
    hashParams.get('file') ||
    (thisScript && thisScript.getAttribute('data-file')) || '';

  var dataPage = (thisScript && thisScript.getAttribute('data-page')) || '';
  var explicitPage = params.get('page') || hashParams.get('page') || '';

  var pageUrl =
    explicitPage ||
    (/^https?:\/\//i.test(dataPage) ? dataPage : '') ||
    (fileName ? new URL(fileName.replace(/^\/+/, ''), scriptBase || origin + '/').href : '') ||
    (dataPage ? new URL(dataPage.replace(/^\/+/, ''), scriptBase || origin + '/').href : '') ||
    (scriptBase ? new URL('sv-website-6.html', scriptBase).href : '');

  if(!pageUrl){
    console.error('embed-loader.js: could not resolve the page URL.');
    return;
  }

  if(payload && pageUrl.indexOf('#') === -1 && pageUrl.indexOf('data=') === -1){
    pageUrl += '#data=' + encodeURIComponent(payload);
  }

  var iframe = document.createElement('iframe');
  iframe.src = pageUrl;
  iframe.style.width = '100%';
  iframe.style.border = '0';
  iframe.style.display = 'block';
  // Fixed-height, internally-scrolling frame: the framed page scrolls itself,
  // so position:fixed / IntersectionObserver work natively inside it.
  iframe.style.height = '100vh';
  iframe.setAttribute('allow', 'clipboard-write');
  iframe.setAttribute('title', 'FRAME');

  // Insert next to the script when possible, otherwise append to body.
  if(thisScript && thisScript.parentNode){
    thisScript.parentNode.insertBefore(iframe, thisScript);
  } else if(document.body){
    document.body.appendChild(iframe);
  } else {
    document.addEventListener('DOMContentLoaded', function(){
      document.body.appendChild(iframe);
    });
  }
})();