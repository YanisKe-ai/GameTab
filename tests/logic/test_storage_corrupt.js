// B/SI-1: loadAppState mit kaputtem Text. node tests/logic/test_storage_corrupt.js
const assert=require("assert/strict");
const src=require("./../lib/source.js").getSource(process.argv[2]);
const i=src.indexOf("/*GT_LOAD_BEGIN*/"),j=src.indexOf("/*GT_LOAD_END*/");
assert(i>=0&&j>i,"Marker fehlt");
const blk=src.slice(i,j);
let mem,now=1000;
global.window={};
global.localStorage={getItem:k=>(k in mem?mem[k]:null),setItem:(k,v)=>{mem[k]=String(v);},removeItem:k=>{delete mem[k];},key:n=>Object.keys(mem)[n]||null,get length(){return Object.keys(mem).length;}};
const realNow=Date.now;
function load(){mem={};delete global.window.__gtStateCorrupt;return new Function('const STORAGE_KEY="spieleblock-app-state-v1";'+blk+";return loadAppState;")();}
const P="spieleblock-app-state-corrupt-";
const copies=()=>Object.keys(mem).filter(k=>k.indexOf(P)===0);
let n=0;const fails=[];
async function T(name,f){try{await f();n++;}catch(e){fails.push(name+": "+(e.message||e).split("\n")[0]);}}
(async()=>{
await T("kaputter Text: null, Kopie, Flag",async()=>{const f=load();mem["spieleblock-app-state-v1"]="{kaputt";assert.equal(await f(),null);assert.equal(copies().length,1);assert.equal(mem[copies()[0]],"{kaputt");assert.equal(window.__gtStateCorrupt.len,7);assert.equal(window.__gtStateCorrupt.key,copies()[0]);});
for(const bad of["null","[1,2]","42",'"x"']){await T("Nicht-Objekt "+bad,async()=>{const f=load();mem["spieleblock-app-state-v1"]=bad;assert.equal(await f(),null);assert.equal(copies().length,1);});}
await T("gueltiges Objekt: normal, keine Kopie",async()=>{const f=load();mem["spieleblock-app-state-v1"]='{"lang":"de"}';assert.deepEqual(await f(),{lang:"de"});assert.equal(copies().length,0);assert.equal(window.__gtStateCorrupt,undefined);});
await T("leer: null ohne Kopie",async()=>{const f=load();assert.equal(await f(),null);assert.equal(copies().length,0);});
await T("gleicher Text nicht doppelt",async()=>{const f=load();mem["spieleblock-app-state-v1"]="{a";await f();await f();assert.equal(copies().length,1);});
await T("hoechstens 2 Kopien, aeltere weg",async()=>{const f=load();let t=5000;Date.now=()=>t;for(const x of["{1","{2","{3","{4"]){mem["spieleblock-app-state-v1"]=x;t+=10;await f();}Date.now=realNow;const c=copies();assert.equal(c.length,2);const vals=c.map(k=>mem[k]).sort();assert.deepEqual(vals,["{3","{4"]);});
await T("Speicher voll: kein Absturz",async()=>{const f=load();mem["spieleblock-app-state-v1"]="{x";const orig=localStorage.setItem;localStorage.setItem=()=>{const e=new Error("q");e.name="QuotaExceededError";throw e;};try{assert.equal(await f(),null);}finally{localStorage.setItem=orig;}assert.equal(window.__gtStateCorrupt.key,null);});
console.log(fails.length?"FAIL\n"+fails.join("\n"):"OK "+n+" Tests");process.exit(fails.length?1:0);
})();
