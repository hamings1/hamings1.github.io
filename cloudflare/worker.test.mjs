import test from 'node:test';
import assert from 'node:assert/strict';
import {DatabaseSync} from 'node:sqlite';
import {readFileSync} from 'node:fs';
import worker from './worker.mjs';
function fixture() {
  const db=new DatabaseSync(':memory:');db.exec(readFileSync(new URL('./schema.sql',import.meta.url),'utf8'));
  const env={DB:{prepare(sql){let values=[];return{bind(...v){values=v;return this;},async run(){return db.prepare(sql).run(...values);},async all(){return{results:db.prepare(sql).all(...values)};}};}},RATE_LIMIT:{async limit(){return{success:true};}},GLOBAL_LIMIT:{async limit(){return{success:true};}}};
  return {db,env};
}
function req(path='/stats',method='GET',country='CN',headers={}) {
  const request=new Request('https://example.workers.dev'+path,{method,headers:{Origin:'https://hamings1.github.io','CF-Connecting-IP':'192.0.2.1','User-Agent':'Mozilla/5.0',...headers}});
  Object.defineProperty(request,'cf',{value:{country}});return request;
}
test('real SQLite upserts preserve counts and expose only aggregate data',async()=>{
  const {db,env}=fixture();
  for(const c of ['CN','CN','US'])assert.equal((await worker.fetch(req('/visit','POST',c),env)).status,200);
  const r=await worker.fetch(req(),env),body=await r.json();
  assert.equal(body.total,3);assert.deepEqual(body.countries,[{country:'CN',visits:2},{country:'US',visits:1}]);
  assert.equal(r.headers.get('Access-Control-Allow-Origin'),'*');
  assert(!JSON.stringify(body).includes('192.0.2.1'));
  assert.deepEqual(db.prepare('PRAGMA table_info(country_visits)').all().map(r=>r.name),['country','visits','first_seen']);db.close();
});
test('empty database reports zero without invented map dots',async()=>{const {db,env}=fixture();assert.deepEqual(await(await worker.fetch(req(),env)).json(),{total:0,since:null,countries:[]});db.close();});
test('foreign origin and wrong method cannot write',async()=>{const {db,env}=fixture();assert.equal((await worker.fetch(req('/visit','POST','CN',{Origin:'https://evil.example'}),env)).status,403);assert.equal((await worker.fetch(req('/visit'),env)).status,405);assert.equal(db.prepare('SELECT count(*) AS n FROM country_visits').get().n,0);db.close();});
test('privacy opt-out and known bots are not counted',async()=>{const {db,env}=fixture();for(const headers of [{'DNT':'1'},{'Sec-GPC':'1'},{'User-Agent':'Googlebot'}])assert.deepEqual(await(await worker.fetch(req('/visit','POST','CN',headers),env)).json(),{recorded:false});assert.equal(db.prepare('SELECT count(*) AS n FROM country_visits').get().n,0);db.close();});
test('rate limiting blocks writes; unknown countries cannot inject SQL',async()=>{const {db,env}=fixture();env.RATE_LIMIT.limit=async()=>({success:false});assert.equal((await worker.fetch(req('/visit','POST'),env)).status,429);env.RATE_LIMIT.limit=async()=>({success:true});await worker.fetch(req('/visit','POST',"'; DROP TABLE country_visits;--"),env);assert.deepEqual(db.prepare('SELECT country,visits FROM country_visits').all().map(r=>({...r})),[{country:'XX',visits:1}]);db.close();});
test('missing binding and database failure return a safe unavailable response',async()=>{assert.equal((await worker.fetch(req(),{})).status,503);const {db,env}=fixture();db.close();const r=await worker.fetch(req(),env);assert.equal(r.status,503);assert.deepEqual(await r.json(),{error:'Statistics temporarily unavailable'});});
