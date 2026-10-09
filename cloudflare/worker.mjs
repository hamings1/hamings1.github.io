const ORIGIN = 'https://hamings1.github.io';
function response(data, status = 200, extra = {}) {
  return new Response(JSON.stringify(data), {status, headers:{
    'Content-Type':'application/json; charset=utf-8', 'Access-Control-Allow-Origin':ORIGIN,
    'X-Content-Type-Options':'nosniff', 'Cache-Control':'no-store', ...extra
  }});
}
async function rateKey(request) {
  const ip = request.headers.get('CF-Connecting-IP');
  if (!ip) return null;
  // Daily rotating rate-limit key; neither this key nor raw IPs are stored in D1.
  const input = new TextEncoder().encode(`${new Date().toISOString().slice(0,10)}:${ip}`);
  const bytes = new Uint8Array(await crypto.subtle.digest('SHA-256',input));
  return Array.from(bytes,b=>b.toString(16).padStart(2,'0')).join('');
}
export default {
  async fetch(request, env) {
    const {pathname} = new URL(request.url);
    if (pathname !== '/stats' && pathname !== '/visit') return response({error:'Not found'},404);
    if (request.method === 'OPTIONS') {
      if (request.headers.get('Origin') !== ORIGIN) return response({error:'Forbidden'},403);
      return new Response(null,{status:204,headers:{'Access-Control-Allow-Origin':ORIGIN,'Access-Control-Allow-Methods':'GET, POST, OPTIONS','Access-Control-Allow-Headers':'Content-Type','Access-Control-Max-Age':'86400'}});
    }
    const read = pathname === '/stats' && request.method === 'GET';
    const write = pathname === '/visit' && request.method === 'POST';
    if (!read && !write) return response({error:'Method not allowed'},405,{Allow:pathname==='/stats'?'GET, OPTIONS':'POST, OPTIONS'});
    if (write && request.headers.get('Origin') !== ORIGIN) return response({error:'Forbidden'},403);
    if (write && (request.headers.get('Sec-GPC') === '1' || request.headers.get('DNT') === '1')) return response({recorded:false});
    try {
      const key = await rateKey(request);
      if (!env.DB || !env.RATE_LIMIT || !env.GLOBAL_LIMIT) return response({error:'Service unavailable'},503);
      const global = await env.GLOBAL_LIMIT.limit({key:'homepage-visitors'});
      const individual = key ? await env.RATE_LIMIT.limit({key:`${read?'read':'write'}:${key}`}) : {success:false};
      if (!global.success || !individual.success) return response({error:'Too many requests'},429,{'Retry-After':'60'});
      if (write) {
        if (request.cf?.botManagement?.verifiedBot || /bot|crawler|spider|headless/i.test(request.headers.get('User-Agent')||'')) return response({recorded:false});
        const raw = request.cf?.country;
        const country = typeof raw === 'string' && /^[A-Z]{2}$/.test(raw) ? raw : 'XX';
        await env.DB.prepare(`INSERT INTO country_visits(country, visits) VALUES (?, 1)
          ON CONFLICT(country) DO UPDATE SET visits = visits + 1`).bind(country).run();
        return response({recorded:true});
      }
      const {results} = await env.DB.prepare('SELECT country, visits, first_seen FROM country_visits ORDER BY visits DESC, country LIMIT 676').all();
      return response({
        total:results.reduce((n,r)=>n+Number(r.visits),0),
        since:results.length?results.reduce((a,r)=>a<r.first_seen?a:r.first_seen,results[0].first_seen):null,
        countries:results.map(r=>({country:r.country,visits:Number(r.visits)}))
      },200,{'Cache-Control':'public, max-age=60','Access-Control-Allow-Origin':'*'});
    } catch { return response({error:'Statistics temporarily unavailable'},503); }
  }
};
