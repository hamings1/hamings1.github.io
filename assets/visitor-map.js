// Paste the site-specific `d` value from the owner's ClustrMaps embed here.
// Do not reuse the reference website's ID: it would count visits for that site.
const clustrMapsSiteId = '';
if (clustrMapsSiteId) {
  const script = document.createElement('script');
  script.id = 'clustrmaps';
  script.src = 'https://cdn.clustrmaps.com/map_v2.js?' + new URLSearchParams({
    cl:'d6e1e9',w:'a',t:'tt',d:clustrMapsSiteId,co:'f6f9fb',cmo:'2563eb',cmn:'16a34a'
  });
  script.onload = () => {
    const placeholder = document.getElementById('map-placeholder');
    const widget = document.getElementById('map-widget');
    // Retain the honest empty state until the provider renders a map.
    const ready = () => { if (widget.querySelector('iframe,img,canvas,svg')) {placeholder.hidden = true;return true;}return false; };
    if (!ready()) {
      const observer = new MutationObserver(() => {if (ready()) observer.disconnect();});
      observer.observe(widget,{childList:true,subtree:true});
    }
  };
  document.getElementById('map-widget').appendChild(script);
}
