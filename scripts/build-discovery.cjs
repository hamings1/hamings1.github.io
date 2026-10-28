// Enhancements for the existing static export; preserve framework bundles.
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const read = f => fs.readFileSync(path.join(root, f), 'utf8');
const write = (f, s) => { fs.mkdirSync(path.dirname(path.join(root, f)), {recursive:true}); fs.writeFileSync(path.join(root, f), s); };
const data = JSON.parse(read('homepage-content.json'));
const projects = JSON.parse(read('project-content.json'));
const citations = JSON.parse(read('publication-citations.json'));
const origin = 'https://hamings1.github.io';
const all = [...data.publications, ...data.others].sort((a,b)=>b.year-a.year);
for (const p of projects) citations[p.id] = p.citation;
// Keep the final proceedings' author order in all representations.
for (const p of all) {
  const names = Array.isArray(p.authors) ? p.authors : p.authors.split(', ');
  citations[p.id] = citations[p.id].replace(/author = \{[^}]*\}/, 'author = {'+names.map(n=>{const a=n.split(' ');return a.pop()+', '+a.join(' ');}).join(' and ')+'}');
}
const esc = s => String(s).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');
const json = o => JSON.stringify(o).replaceAll('<','\\u003c');
const h = (tag, props={}, children) => ['$',tag,null,{...props,...(children===undefined?{}:{children})}];
function html(n) {
  if(n===null||n===undefined||n===false) return '';
  if(!Array.isArray(n)) return esc(n);
  if(n[0]!=='$') return n.map((v,i)=>(i>0&&typeof v==='string'&&typeof n[i-1]==='string'?'<!-- -->':'')+html(v)).join('');
  const [,tag,,p]=n, names={className:'class',htmlFor:'for',dateTime:'datetime',defaultValue:'value'};
  const attrs=Object.entries(p).filter(([k,v])=>k!=='children'&&k!=='dangerouslySetInnerHTML'&&v!==false).map(([k,v])=>` ${names[k]||k}="${v===true?'':esc(v)}"`).join('');
  return `<${tag}${attrs}>`+(['img','link','meta','input','br'].includes(tag)?'':(p.dangerouslySetInnerHTML?.__html??html(p.children))+`</${tag}>`);
}
const anchor=(text,url,cls='paper-button')=>h('a',{href:url,className:cls,...(url.startsWith('http')?{target:'_blank',rel:'noopener noreferrer'}:{})},text);
const authors=p=>{const a=Array.isArray(p.authors)?p.authors:p.authors.split(', '),i=a.indexOf('Yu Liang');return [a.slice(0,i).join(', ')+(i>0?', ':''),h('strong',{},'Yu Liang'),(i<a.length-1?', ':'')+a.slice(i+1).join(', ')];};
const venue=p=>h('div',{className:'publication-badges'},[h('span',{className:'venue-label'},p.venue.split(' · ')[0]),...(p.venue.includes(' · ')?[h('span',{className:'paper-distinction'},p.venue.split(' · ')[1])]:[])]);
const select=(id,label,options)=>h('label',{},[h('span',{},label),h('select',{id,name:id},[h('option',{value:''},'All '+label.toLowerCase()),...options.map(o=>h('option',{value:String(o)},String(o)))])]);
const directory = h('section',{id:'publication-directory',className:'publication-directory'},[
  h('header',{},[h('p',{className:'eyebrow'},'RESEARCH'),h('h1',{},'Publications'),h('p',{},'Explore work on efficient AI, model compression, language models and neuromorphic computing.')]),
  h('form',{className:'publication-filters','aria-label':'Filter publications'},[
    h('label',{className:'publication-search'},[h('span',{},'Search'),h('input',{type:'search',name:'query',placeholder:'Title, author, venue or topic…','aria-label':'Search publications'})]),
    select('year','Years',[...new Set(all.map(p=>p.year))]),select('topic','Topics',[...new Set(all.flatMap(p=>p.topics))].sort()),h('button',{type:'reset',className:'paper-button'},'Reset')
  ]),
  h('p',{className:'publication-count',role:'status','aria-live':'polite'},`${all.length} publications`),
  h('div',{className:'publication-results'},all.map(p=>h('article',{id:p.id,className:'publication-record','data-year':String(p.year),'data-topics':p.topics.join('|'),'data-search':[p.title,Array.isArray(p.authors)?p.authors.join(' '):p.authors,p.venue,...p.topics].join(' ').toLowerCase()},[
    venue(p),h('h2',{},anchor(p.title,p.paper,'publication-title')),h('p',{className:'publication-authors'},authors(p)),h('p',{className:'publication-topics'},p.topics.join(' · ')),
    h('div',{className:'paper-links'},[...(p.project?[anchor('Project →',p.project,'paper-button project-button')]:[]),anchor('Paper',p.paper),...(p.code?[anchor('Code',p.code)]:[])]),
    h('details',{className:'citation'},[h('summary',{},'BibTeX'),h('pre',{},h('code',{},citations[p.id])),anchor('Download BibTeX',`/papers/${p.id}.bib`)])
  ]))),h('p',{className:'publication-empty',hidden:true},'No publications match these filters. Try another year, topic or search term.')
]);
const person={'@type':'Person','@id':origin+'/#person',name:'Yu Liang',url:origin+'/',image:origin+'/bio.jpg',affiliation:{'@type':'CollegeOrUniversity',name:'University of Electronic Science and Technology of China',alternateName:'UESTC'},knowsAbout:['Efficient AI','Model Compression','Language Models','Neuromorphic Computing'],sameAs:['https://github.com/hamings1','https://www.linkedin.com/in/yu-liang-641685288']};
const schema={'@context':'https://schema.org','@type':'ProfilePage','@id':origin+'/#profile',url:origin+'/',mainEntity:person};
const commonHead=[h('link',{rel:'stylesheet',href:'/assets/discovery.css?v=20261028'}),h('script',{src:'/assets/discovery.js?v=20261028',defer:true})];
function metadata(title,description,url,image) {return [
  h('title',{},title),h('meta',{name:'description',content:description}),h('meta',{name:'author',content:'Yu Liang'}),h('link',{rel:'canonical',href:url}),
  h('meta',{property:'og:title',content:title}),h('meta',{property:'og:description',content:description}),h('meta',{property:'og:url',content:url}),h('meta',{property:'og:type',content:'website'}),h('meta',{property:'og:site_name',content:'Yu Liang | Efficient AI'}),h('meta',{name:'twitter:card',content:image?'summary_large_image':'summary'}),h('meta',{name:'twitter:title',content:title}),h('meta',{name:'twitter:description',content:description}),...(image?[h('meta',{property:'og:image',content:image}),h('meta',{name:'twitter:image',content:image})]:[]),h('link',{rel:'icon',href:'/favicon.svg'})
];}
function patchFlight(text,transform){return text.split('\n').map(l=>{const i=l.indexOf(':');try{return l.slice(0,i+1)+json(transform(JSON.parse(l.slice(i+1))))}catch{return l}}).join('\n');}
const routes=[['','',data.seo.description],['publications','Publications','Research publications by Yu Liang, with papers, code, project pages and citations. Filter by year or research topic.'],['services','Services','Academic reviewing services by Yu Liang.'],['awards','Awards','Academic honors and awards of Yu Liang.'],['cv','CV','Curriculum vitae of Yu Liang, PhD student at UESTC working on efficient AI.']];
for(const [route,label,description] of routes){
  const prefix=route?route+'/':'',url=origin+'/'+prefix,title=label?`${label} | Yu Liang | Efficient AI | UESTC`:data.seo.title;
  const metas=metadata(title,description,url);
  const extra=[...commonHead,...(!route?[h('meta',{name:'google-site-verification',content:data.seo.verification}),h('script',{type:'application/ld+json',dangerouslySetInnerHTML:{__html:json(schema)}})]:[])];
  function walk(v){
    if(!v||typeof v!=='object')return v;
    if(Array.isArray(v)){
      if(route==='publications'&&v[0]==='$'&&(v[3]?.config?.type==='publication'||v[3]?.id==='publication-directory'))return directory;
      if(v[0]==='$'&&v[1]==='head') {const children=(v[3]?.children||[]).filter(n=>!Array.isArray(n)||!(n[3]?.href?.startsWith('/assets/discovery.')||n[3]?.src?.startsWith('/assets/discovery.')||n[3]?.name==='google-site-verification'||n[3]?.type==='application/ld+json'));return h('head',{},[...children,...extra]);}
      return v.map(walk);
    }
    if(Array.isArray(v.metadata))return {...v,metadata:metas};
    return Object.fromEntries(Object.entries(v).map(([k,x])=>[k,k==='lastUpdated'?data.updated:walk(x)]));
  }
  let page=read(prefix+'index.html');
  page=page.replace(/Last updated: <!-- -->[^<]+/,`Last updated: <!-- -->${data.updated}`);
  if(route==='publications')page=page.replace(/(<main\b[^>]*>)[\s\S]*?<\/main>/,`$1<div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">${html(directory)}</div></main>`);
  page=page.replace(/self\.__next_f\.push\((\[1,"(?:[^"\\]|\\.)*"\])\)/g,(_,payload)=>{const a=JSON.parse(payload);a[1]=patchFlight(a[1],walk);return 'self.__next_f.push('+json(a)+')';});
  page=page.replace(/<head>([\s\S]*?)<\/head>/,(_,head)=>{
    head=head.replace(/<!-- discovery:start -->[\s\S]*?<!-- discovery:end -->/g,'').replace(/<title>[\s\S]*?<\/title>/g,'').replace(/<meta\b[^>]*(?:name="(?:description|author|keywords|creator|publisher|twitter:[^"]+|google-site-verification)"|property="og:[^"]+")[^>]*\/?\s*>/g,'').replace(/<link\b[^>]*rel="canonical"[^>]*>/g,'');
    return '<head>'+head+'<!-- discovery:start -->'+html(metas)+html(extra)+'<!-- discovery:end --></head>';
  });
  write(prefix+'index.html',page);write(prefix+'index.txt',patchFlight(read(prefix+'index.txt'),walk));
}
for(const p of all)write(`papers/${p.id}.bib`,citations[p.id]+'\n');
for(const info of projects){
  const p=all.find(p=>p.id===info.id), url=origin+p.project;
  const scholarly={'@context':'https://schema.org','@type':'ScholarlyArticle',headline:p.title,name:p.title,url,author:(Array.isArray(p.authors)?p.authors:p.authors.split(', ')).map(name=>({'@type':'Person',name,...(name==='Yu Liang'?{'@id':origin+'/#person'}:{})})),image:origin+p.image,description:info.overview,sameAs:info.source};
  const content=h('main',{id:'main',className:'project-page'},[
    h('header',{className:'project-hero'},[h('p',{className:'eyebrow'},'EFFICIENT AI / RESEARCH PROJECT'),venue(p),h('h1',{},info.name),h('p',{className:'project-full-title'},p.title),h('p',{className:'project-tagline'},info.tagline),h('p',{className:'publication-authors'},authors(p)),h('div',{className:'paper-links'},[anchor('Read paper ↗',p.paper,'paper-button project-button'),anchor('Code ↗',p.code),anchor('BibTeX','#citation')])]),
    h('figure',{className:'project-figure'},[h('a',{href:p.image,'aria-label':'View full-size method figure'},h('img',{src:p.image,alt:p.imageAlt,width:1200,height:600})),h('figcaption',{},'Method overview. Select the figure to view it at full size.')]),
    h('section',{},[h('h2',{},'Overview'),h('p',{},info.overview)]),
    h('section',{},[h('h2',{},'How it works'),h('div',{className:'method-grid'},info.method.map(([title,body],i)=>h('article',{},[h('span',{className:'method-number'},'0'+(i+1)),h('h3',{},title),h('p',{},body)])))]),
    h('section',{},[h('h2',{},'Key results'),h('div',{className:'result-grid'},info.results.map(([value,detail])=>h('article',{},[h('strong',{},value),h('p',{},detail)]))),h('p',{className:'result-note'},info.resultNote),anchor('Results and experimental details ↗',info.source,'source-link')]),
    h('section',{id:'citation'},[h('div',{className:'citation-heading'},[h('h2',{},'Citation'),h('button',{type:'button',className:'paper-button','data-copy-citation':'project-bibtex'},'Copy BibTeX')]),h('pre',{id:'project-bibtex'},h('code',{},citations[p.id])),anchor('Download .bib',`/papers/${p.id}.bib`)]),
    h('nav',{'aria-label':'Other research projects',className:'related-projects'},[h('h2',{},'Explore more research'),...projects.filter(x=>x.id!==p.id).map(x=>anchor(x.name+' →',all.find(a=>a.id===x.id).project))])
  ]);
  write(p.project.slice(1)+'index.html','<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">'+html(metadata(p.title+' | Yu Liang',info.tagline,url,origin+p.image))+html(commonHead)+`<script type="application/ld+json">${json(scholarly)}</script></head><body class="project-body"><a class="skip-link" href="#main">Skip to content</a><nav class="project-nav" aria-label="Main navigation"><a href="/">← Yu Liang</a><a href="/publications/">All publications</a></nav>`+html(content)+'<footer class="project-footer">Yu Liang · Efficient AI · UESTC</footer></body></html>');
}
const urls=[...routes.map(([r])=>origin+'/'+(r?r+'/':'')),...all.filter(p=>p.project).map(p=>origin+p.project)];
write('sitemap.xml','<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'+urls.map(url=>`  <url><loc>${url}</loc></url>`).join('\n')+'\n</urlset>\n');
write('robots.txt',`User-agent: *\nAllow: /\n\nSitemap: ${origin}/sitemap.xml\n`);
console.log('Built searchable publication directory, 3 project pages, metadata and sitemap.');
