// This repository is a Next.js static export. Keep server HTML and both copies
// of the React Server Component payload synchronized; do not edit minified JS.
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const data = JSON.parse(fs.readFileSync(path.join(root, 'homepage-content.json'), 'utf8'));
const h = (tag, props = {}, children = undefined) => ['$', tag, null, {...props, ...(children === undefined ? {} : {children})}];
const outlinePaths = {
  About:'M20 21v-2a7 7 0 0 0-14 0v2 M17 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0',
  News:'M4 4h16v16H4z M8 8h8 M8 12h8 M8 16h4',
  Publications:'M4 4h6a3 3 0 0 1 3 3v14a4 4 0 0 0-4-2H4z M13 7a3 3 0 0 1 3-3h5v15h-4a4 4 0 0 0-4 2',
  Services:'m12 3 7 3v6c0 4-7 9-7 9s-7-5-7-9V6z m-3 9 2 2 4-4',
  Visitors:'M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0 M3 12h18 M12 3c5 5 5 13 0 18 M12 3c-5 5-5 13 0 18',
  Phone:'M7 3H4a1 1 0 0 0-1 1c0 9.4 7.6 17 17 17a1 1 0 0 0 1-1v-3l-5-2-2 2a15 15 0 0 1-7-7l2-2z',
  WeChat:'M21 11a8 8 0 0 1-8 8H9l-5 3 1-6a8 8 0 1 1 16-5 M8 10h.01 M12 10h.01 M16 10h.01',
  Copy:'M9 9h11v12H9z M5 16H3V3h12v2',
  Project:'M8 4H4v16h16v-4 M13 3h8v8 M10 14 21 3'
};
const outline = kind => h('svg',{viewBox:'0 0 24 24',fill:'none',stroke:'currentColor',strokeWidth:1.7,strokeLinecap:'round',strokeLinejoin:'round','aria-hidden':'true'},h('path',{d:outlinePaths[kind]}));
const heading = (_icon, text, more) => h('div', {className:'home-heading'}, [h('h2',{},[outline(text),text]), ...(more ? [h('a',{className:'view-all',href:typeof more==='string'?more:'/publications/'},'View All →')] : [])]);
const icon = kind => h('svg',{viewBox:'0 0 24 24',fill:'none',stroke:'currentColor',strokeWidth:1.7,'aria-hidden':'true'},h('path',{d:kind==='Paper'?'M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z M14 2v6h6 M8 13h8 M8 17h8':'M9 19c-4.3 1.3-4.3-2.2-6-2.7 M15 22v-3.4c0-1 .1-1.4-.5-2 3.3-.4 6.5-1.6 6.5-7a5.4 5.4 0 0 0-1.5-3.7c.2-.9.2-2.3-.2-3.3 0 0-1.3-.4-4.2 1.5a14 14 0 0 0-6.2 0C6 1.2 4.7 1.6 4.7 1.6c-.4 1-.4 2.4-.2 3.3A5.4 5.4 0 0 0 3 8.6c0 5.4 3.2 6.6 6.5 7-.6.6-.5 1-.5 2V22'}));
const link = (label, href) => h('a',{href,target:'_blank',rel:'noopener noreferrer',className:'paper-button'},[icon(label),label]);
const projectLink = p => h('a',{href:p.project,className:'paper-button project-button'},[outline('Project'),'Project']);
const venue = p => [h('span',{className:'venue-label'},p.venue.split(' · ')[0]),...(p.venue.includes(' · ')?[h('span',{className:'paper-distinction'},p.venue.split(' · ')[1])]:[])];
const newsItem = n => h('li',{},[h('time',{dateTime:n.date},n.date),h('span',{},[h('strong',{},h('a',{href:n.href},n.venue)),` — ${n.text}`])]);
const paper = p => h('article',{className:'paper-row',id:p.id},[
  h('div',{className:'paper-visual'},[
    h('a',{className:'paper-figure',href:p.project,'aria-label':`Explore ${p.title}`},[
      h('span',{className:'paper-image-canvas'},h('img',{src:p.image,alt:p.imageAlt,width:1200,height:600,loading:'lazy',decoding:'async'}))
    ])]),
  h('div',{className:'paper-copy'},[h('div',{className:'paper-venue'},venue(p)),h('h3',{className:'paper-title'},h('a',{href:p.paper,target:'_blank',rel:'noopener noreferrer'},p.title)),
    h('ul',{className:'paper-details'},[
      h('li',{className:'paper-authors'},[h('strong',{},'Yu Liang'),p.authors.slice('Yu Liang'.length)]),
      h('li',{},p.description),h('li',{},h('div',{className:'paper-links'},[projectLink(p),link('Paper',p.paper),link('Code',p.code)]))])])]);
const otherPaper = p => h('li',{id:p.id,className:'other-paper'},[
  h('div',{className:'other-paper-title'},[h('span',{className:'other-paper-venue'},venue(p)), ' ', h('a',{href:p.paper,target:'_blank',rel:'noopener noreferrer'},p.title)]),
  h('div',{className:'other-paper-authors'},[p.authors.slice(0,p.authors.indexOf('Yu Liang')).join(', ')+(p.authors.indexOf('Yu Liang')>0?', ':''),h('strong',{},'Yu Liang'),(p.authors.indexOf('Yu Liang')<p.authors.length-1?', ':'')+p.authors.slice(p.authors.indexOf('Yu Liang')+1).join(', ')]),
  h('div',{className:'other-paper-links'},[h('a',{className:'inline-link',href:p.paper,target:'_blank',rel:'noopener noreferrer'},'Paper'),...(p.code?[' · ',h('a',{className:'inline-link',href:p.code,target:'_blank',rel:'noopener noreferrer'},'Code')]:[])])
]);
const contact = (label, phone, href, kind, id) => h('div',{className:'contact-item'},[
  h('div',{className:'contact-info'},[h('span',{className:'contact-label'},label),h('a',{href,id},phone)]),
  h('button',{type:'button',className:'contact-copy','data-copy-contact':href.slice(4),'data-contact-target':id,'aria-label':`Copy ${label} number ${phone}`,title:'Copy number'},[outline('Copy')])
]);
const content = h('section',{id:'about',className:'scroll-mt-24 space-y-8 home-content'},[
  h('link',{rel:'stylesheet',href:'/assets/homepage.css?v=20261029-refine'}),
  h('section',{'aria-label':'About'},[heading('👋','About'),h('div',{className:'home-about'},[
    h('p',{className:'research-statement'},'I work on efficient AI: making large models smaller, faster, and more energy-efficient through model compression and brain-inspired computation.'),
    h('p',{},['I am a Ph.D. student in the School of Computer Science at the University of Electronic Science and Technology of China (UESTC), advised by ',h('a',{href:'https://www.en.scse.uestc.edu.cn/info/1085/2257.htm',target:'_blank',rel:'noopener noreferrer'},'Prof. Malu Zhang'),', and part of a joint Ph.D. program with the Shenzhen Loop Area Institute. I received my B.Eng. from UESTC. My research focuses on model compression, combining large models with spiking neural networks, and neuromorphic computing.']),
    h('div',{className:'contact-panel','aria-label':'Contact information'},[
      h('div',{className:'contact-grid'},[contact('Phone & WeChat',data.phone,data.phoneHref,'WeChat','contact-primary'),contact('Phone',data.additionalPhone,data.additionalPhoneHref,'Phone','contact-secondary')]),
      h('p',{className:'contact-status',role:'status','aria-live':'polite'},'')
    ])])]),
  h('section',{'aria-label':'News'},[heading('🔥','News'),h('ul',{className:'home-news'},data.news.slice(0,5).map(newsItem)),...(data.news.length>5?[h('details',{className:'news-archive'},[h('summary',{},'Earlier news'),h('ul',{className:'home-news'},data.news.slice(5).map(newsItem))])]:[])]),
  h('section',{'aria-label':'Publications'},[heading('📝','Publications',true),h('div',{className:'paper-list'},data.publications.map(paper)),
    h('section',{id:'other-publications','aria-label':'Other Publications',className:'other-publications'},[
      h('h3',{},'Others'),...[...new Set(data.others.map(p=>p.year))].sort((a,b)=>b-a).map(year=>h('section',{className:'publication-year','aria-label':`${year} publications`},[h('h4',{},String(year)),h('ul',{className:'other-paper-list'},data.others.filter(p=>p.year===year).map(otherPaper))]))
    ])
  ]),
  h('section',{id:'services','aria-label':'Services'},[
    heading('🤝','Services','/services/'),
    h('div',{className:'home-services'},[
      h('div',{},[h('h3',{},'Journal Reviewer'),h('ul',{},data.services.journals.map(name=>h('li',{},name)))]),
      h('div',{},[h('h3',{},'Conference Reviewer'),h('ul',{},[...new Set(data.services.conferences.map(c=>c.year))].map(year=>h('li',{},[h('strong',{},year+': '),data.services.conferences.filter(c=>c.year===year).map(c=>c.venue).join(', ')])))])
    ])
  ]),
  h('section',{'aria-label':'Visitors'},[heading('🌍','Visitors'),h('iframe',{className:'visitor-frame',src:'/visitors.html?v=cloudflare1',title:'Visitor locations around the world'})])
]);
const conferenceNames = {
  ICLR:'International Conference on Learning Representations',
  AAAI:'AAAI Conference on Artificial Intelligence',
  ICML:'International Conference on Machine Learning',
  NeurIPS:'Conference on Neural Information Processing Systems',
  CVPR:'IEEE/CVF Conference on Computer Vision and Pattern Recognition'
};
const serviceItems = [
  ...data.services.journals.map(name=>({title:'Reviewer',subtitle:name,content:`Reviewer for ${name}.`})),
  ...data.services.conferences.map(c=>({title:'Reviewer',subtitle:`${c.venue} ${c.year}`,date:c.year,content:`Reviewer for the ${conferenceNames[c.venue] || c.venue} ${c.year}.`}))
];
function walk(value) {
  if (!value || typeof value!=='object') return value;
  if (value.type==='card' && value.title==='Services') return {...value,items:serviceItems};
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
  const names={className:'class',dateTime:'datetime',strokeWidth:'stroke-width',strokeLinecap:'stroke-linecap',strokeLinejoin:'stroke-linejoin'};
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

// Preserve the standalone Services card component and its hydration data.
const serviceGrid = h('div',{className:'grid gap-6'},serviceItems.map(item=>h('div',{
  className:'bg-white dark:bg-neutral-900 p-6 rounded-xl shadow-sm border border-neutral-200 dark:border-neutral-800 hover:shadow-lg transition-all duration-200 hover:scale-[1.01]',
  style:'opacity:0;transform:translateY(20px)'
},[
  h('div',{className:'flex justify-between items-start mb-2'},[
    h('h3',{className:'text-xl font-semibold text-primary'},item.title),
    ...(item.date?[h('span',{className:'text-sm text-neutral-500 font-medium bg-neutral-100 dark:bg-neutral-800 px-2 py-1 rounded'},item.date)]:[])
  ]),
  h('p',{className:'text-base text-accent font-medium mb-3'},item.subtitle),
  h('p',{className:'text-base text-neutral-600 dark:text-neutral-500 leading-relaxed'},item.content)
])));
const servicesPath=path.join(root,'services/index.html');
let servicesPage=fs.readFileSync(servicesPath,'utf8');
const gridStart=servicesPage.indexOf('<div class="grid gap-6">');
if(gridStart<0)throw Error('Services grid missing');
const divTags=/<\/?div\b[^>]*>/g;divTags.lastIndex=gridStart;
let gridDepth=0,gridEnd=0,match;
while((match=divTags.exec(servicesPage))){gridDepth+=match[0].startsWith('</')?-1:1;if(gridDepth===0){gridEnd=divTags.lastIndex;break;}}
if(!gridEnd)throw Error('Unbalanced Services grid');
servicesPage=servicesPage.slice(0,gridStart)+html(serviceGrid)+servicesPage.slice(gridEnd);
servicesPage=servicesPage.replace(/self\.__next_f\.push\((\[1,"(?:[^"\\]|\\.)*"\])\)/g,(_,payload)=>{const a=JSON.parse(payload);a[1]=flight(a[1]);return 'self.__next_f.push('+JSON.stringify(a).replaceAll('<','\\u003c')+')';});
servicesPage=servicesPage.replace(/Last updated: <!-- -->[^<]+/,`Last updated: <!-- -->${data.updated}`);
fs.writeFileSync(servicesPath,servicesPage);
const servicesFlightPath=path.join(root,'services/index.txt');
fs.writeFileSync(servicesFlightPath,flight(fs.readFileSync(servicesFlightPath,'utf8')));
console.log('Updated standalone Services HTML and React navigation payload.');
require('./build-discovery.cjs');
