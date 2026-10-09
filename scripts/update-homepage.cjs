// This repository is a Next.js static export. Keep server HTML and both copies
// of the React Server Component payload synchronized; do not edit minified JS.
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const data = JSON.parse(fs.readFileSync(path.join(root, 'homepage-content.json'), 'utf8'));
const h = (tag, props = {}, children = undefined) => ['$', tag, null, {...props, ...(children === undefined ? {} : {children})}];
const heading = (icon, text, more) => h('div', {className:'home-heading'}, [h('h2',{},[h('span',{'aria-hidden':'true'},icon),text]), ...(more ? [h('a',{className:'view-all',href:'/publications/'},'View All →')] : [])]);
const icon = kind => h('svg',{viewBox:'0 0 24 24',fill:'none',stroke:'currentColor',strokeWidth:1.7,'aria-hidden':'true'},h('path',{d:kind==='Paper'?'M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z M14 2v6h6 M8 13h8 M8 17h8':'M9 19c-4.3 1.3-4.3-2.2-6-2.7 M15 22v-3.4c0-1 .1-1.4-.5-2 3.3-.4 6.5-1.6 6.5-7a5.4 5.4 0 0 0-1.5-3.7c.2-.9.2-2.3-.2-3.3 0 0-1.3-.4-4.2 1.5a14 14 0 0 0-6.2 0C6 1.2 4.7 1.6 4.7 1.6c-.4 1-.4 2.4-.2 3.3A5.4 5.4 0 0 0 3 8.6c0 5.4 3.2 6.6 6.5 7-.6.6-.5 1-.5 2V22'}));
const link = (label, href) => h('a',{href,target:'_blank',rel:'noopener noreferrer',className:'paper-button'},[icon(label),label]);
const paper = p => h('article',{className:'paper-row',id:p.id},[
  h('a',{className:'paper-figure',href:p.paper,target:'_blank',rel:'noopener noreferrer','aria-label':`Read ${p.title}`},[
    h('img',{src:p.image,alt:p.imageAlt,width:1200,height:600,loading:'lazy',decoding:'async'}),h('span',{className:'paper-venue'},p.venue)]),
  h('div',{},[h('h3',{className:'paper-title'},h('a',{href:p.paper,target:'_blank',rel:'noopener noreferrer'},p.title)),
    h('ul',{className:'paper-details'},[
      h('li',{className:'paper-authors'},[h('strong',{},'Yu Liang'),p.authors.slice('Yu Liang'.length)]),
      h('li',{},p.description),h('li',{},h('div',{className:'paper-links'},[link('Paper',p.paper),link('Code',p.code)]))])])]);
const content = h('section',{id:'about',className:'scroll-mt-24 space-y-8 home-content'},[
  h('link',{rel:'stylesheet',href:'/assets/homepage.css?v=20261009-cf'}),
  h('section',{'aria-label':'About'},[heading('👋','About'),h('div',{className:'home-about'},[
    h('p',{},['I am a doctoral student in the School of Computer Science at the University of Electronic Science and Technology of China (UESTC), under the supervision of ',h('a',{href:'https://www.en.scse.uestc.edu.cn/info/1085/2257.htm',target:'_blank',rel:'noopener noreferrer'},'Prof. Malu Zhang'),'. I am participating in a joint Ph.D. training program with the Shenzhen Loop Area Institute.']),
    h('p',{},'Previously, I graduated from UESTC with a Bachelor of Engineering degree.'),
    h('p',{},'My current research focuses on model compression, the integration of large models, and neuromorphic computing.'),
    h('p',{className:'contact-line'},['Please feel free to contact me via Phone: ',h('a',{href:data.phoneHref},data.phone),'.'])])]),
  h('section',{'aria-label':'News'},[heading('🔥','News'),h('ul',{className:'home-news'},data.news.map(n=>h('li',{},[h('time',{dateTime:n.date},n.date),h('span',{},n.content)])))]),
  h('section',{'aria-label':'Selected Publications'},[heading('📝','Selected Publications',true),h('div',{className:'paper-list'},data.publications.map(paper))]),
  h('section',{'aria-label':'Visitors'},[heading('🌍','Visitors'),h('iframe',{className:'visitor-frame',src:'/visitors.html?v=cloudflare1',title:'Visitor locations around the world'})])
]);
function walk(value) {
  if (!value || typeof value!=='object') return value;
  if (Array.isArray(value) && value[0]==='$' && value[1]==='section' && value[3]?.id==='about') return content;
  if (Array.isArray(value)) return value.map(walk);
  return Object.fromEntries(Object.entries(value).map(([k,v])=>[k,k==='lastUpdated'?data.updated:walk(v)]));
}
function flight(text) {return text.split('\n').map(line=>{const i=line.indexOf(':'); if(i<0)return line;try{return line.slice(0,i+1)+JSON.stringify(walk(JSON.parse(line.slice(i+1))));}catch{return line;}}).join('\n');}
const esc = s => String(s).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');
function html(n) {
  if(n===null || n===undefined || n===false)return '';
  if(!Array.isArray(n))return esc(n);
  if(n[0]!=='$')return n.map(html).join('');
  const [,tag,,props]=n;
  const names={className:'class',dateTime:'datetime',strokeWidth:'stroke-width'};
  const attrs=Object.entries(props).filter(([k])=>k!=='children').map(([k,v])=>` ${names[k]||k}="${esc(v)}"`).join('');
  return `<${tag}${attrs}>`+(['img','link'].includes(tag)?'':html(props.children)+`</${tag}>`);
}
const htmlPath=path.join(root,'index.html');
let page=fs.readFileSync(htmlPath,'utf8');
const start=page.indexOf('<section id="about"');
if(start<0)throw Error('Homepage content section missing');
const tags=/<\/?section\b[^>]*>/g;tags.lastIndex=start;
let depth=0,end=0,m;
while((m=tags.exec(page))){depth+=m[0].startsWith('</')?-1:1;if(depth===0){end=tags.lastIndex;break;}}
if(!end)throw Error('Unbalanced homepage sections');
page=page.slice(0,start)+html(content)+page.slice(end);
page=page.replace(/self\.__next_f\.push\((\[1,"(?:[^"\\]|\\.)*"\])\)/g,(_,payload)=>{const a=JSON.parse(payload);a[1]=flight(a[1]);return 'self.__next_f.push('+JSON.stringify(a).replaceAll('<','\\u003c')+')';});
page=page.replace(/Last updated: <!-- -->[^<]+/,`Last updated: <!-- -->${data.updated}`);
fs.writeFileSync(htmlPath,page);
const flightPath=path.join(root,'index.txt');
fs.writeFileSync(flightPath,flight(fs.readFileSync(flightPath,'utf8')));
console.log('Updated homepage HTML and React navigation payload.');
