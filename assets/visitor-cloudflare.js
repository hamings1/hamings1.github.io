/* Country-level Cloudflare map. No API credentials belong in this file. */
(async () => {
  const status = document.getElementById('map-status');
  const total = document.getElementById('visit-total');
  const retry = document.getElementById('retry');
  const points = document.getElementById('map-points');
  const list = document.getElementById('country-list');
  const ns = 'http://www.w3.org/2000/svg';
  const names = new Intl.DisplayNames(['en'],{type:'region'});
  let base, coordinates;
  const getJson = async url => {
    const r = await fetch(url,{credentials:'omit',signal:AbortSignal.timeout(8000)});
    if (!r.ok) throw new Error('Unavailable');
    return r.json();
  };
  function show(data) {
    if (!Number.isSafeInteger(data.total) || data.total < 0 || !Array.isArray(data.countries)) throw new Error('Invalid statistics');
    total.textContent = `${data.total.toLocaleString('en')} visits`;
    points.replaceChildren(); list.replaceChildren();
    let regions = 0;
    for (const item of data.countries) {
      if (!/^[A-Z]{2}$/.test(item.country) || !Number.isSafeInteger(item.visits) || item.visits <= 0) continue;
      const label = item.country==='XX'?'Unknown region':names.of(item.country);
      const text = `${label}: ${item.visits.toLocaleString('en')} visits`;
      const li = document.createElement('li');li.textContent = text;list.appendChild(li);
      const pos = coordinates[item.country];
      if (!pos) continue;
      regions++;
      const circle = document.createElementNS(ns,'circle');
      circle.setAttribute('cx',(pos[1]+180)*2);
      circle.setAttribute('cy',(90-pos[0])*2);
      circle.setAttribute('r',Math.min(11,3+Math.log2(item.visits+1)));
      circle.setAttribute('tabindex','0');circle.setAttribute('role','img');circle.setAttribute('aria-label',text);
      const title=document.createElementNS(ns,'title');title.textContent=text;circle.appendChild(title);points.appendChild(circle);
    }
    status.textContent = data.total ? `${regions} countries / regions · powered by Cloudflare` : 'No visits recorded yet · powered by Cloudflare';
    document.getElementById('country-details').hidden = !data.countries.length;
    retry.hidden = true;
    document.getElementById('world-map').setAttribute('aria-label',`World map showing ${data.total} visits by country or region`);
  }
  async function loadStats() {
    status.textContent='Loading visitor statistics…';retry.hidden=true;
    try { show(await getJson(`${base}/stats`)); }
    catch { status.textContent='Visitor statistics are temporarily unavailable.';retry.hidden=false; }
  }
  try {
    const config = await getJson('/assets/visitor-config.json');
    if (!config.apiBase) { status.textContent='Visitor statistics coming soon.';return; }
    const url = new URL(config.apiBase);
    if (url.protocol!=='https:') throw new Error('HTTPS endpoint required');
    base = url.origin;
    coordinates = await getJson('/assets/country-coordinates.json');
    // Timestamp stays in the browser tab. No visitor ID or cookie is sent.
    const key = 'homepage-visit-cloudflare';
    const optedOut = navigator.doNotTrack==='1' || navigator.globalPrivacyControl===true;
    const live = location.origin==='https://hamings1.github.io';
    let previous = 0;
    try { previous=Number(sessionStorage.getItem(key))||0; } catch {}
    if (live && !optedOut && Date.now()-previous > 30*60*1000) {
      try { sessionStorage.setItem(key,String(Date.now())); } catch {}
      try { await fetch(`${base}/visit`,{method:'POST',credentials:'omit',signal:AbortSignal.timeout(5000)}); }
      catch { /* Failed counts must not prevent displaying existing totals. */ }
    }
    retry.addEventListener('click',loadStats);
    await loadStats();
  } catch { status.textContent='Visitor statistics are temporarily unavailable.'; }
})();
