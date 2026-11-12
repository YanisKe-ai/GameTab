// A1: Geisterpartie, Zaehler, Speicherfehler. node tests/logic/test_matchsync.js
const assert=require("assert/strict");
const src=require("./../lib/source.js").getSource(process.argv[2]);
function cut(a,b){const i=src.indexOf(a),j=src.indexOf(b);assert(i>=0&&j>i,"Marker fehlt: "+a);return src.slice(i,j);}
function fn(name){const i=src.indexOf("function "+name+"(");assert(i>=0,name);const e=src.indexOf("\n",i);return src.slice(i,e);}
const ps=cut("/*GT_PS_BEGIN*/","/*GT_PS_END*/");
const mid=cut("/*GT_MID_BEGIN*/","/*GT_MID_END*/");
const gtWon=fn("gtWon");const quota=fn("gtIsQuotaErr");
let mem,throwQuota,notices;
global.localStorage={getItem:k=>(k in mem?mem[k]:null),setItem:(k,v)=>{if(throwQuota){const e=new Error("q");e.name="QuotaExceededError";throw e;}mem[k]=String(v);},removeItem:k=>{delete mem[k];},get length(){return Object.keys(mem).length;},key:i=>Object.keys(mem)[i]||null};
function load(){
  mem={};throwQuota=false;notices=[];
  const pre='function gtIsObj(v){return v!==null&&typeof v==="object"&&!Array.isArray(v);}function gtNum(v){return typeof v==="number"&&isFinite(v)?v:null;}const STORAGE_KEY="spieleblock-app-state-v1";function gtPadDone(k,s){return !!s.__done;}function gtStorageFullNotice(l,k){NOTICES.push(k||"storageFull");}'+quota+";"+gtWon+";";
  return new Function("NOTICES",pre+mid+";"+ps+";return{recordMatch,gtAutoReopen,gtPurgeOpenOrphans,gtSyncMatchId,saveMatchLog,loadMatchLogRaw,GT_MATCH_IDS,gtMatchHasData};")(notices);
}
let n=0;const fails=[];
function T(name,f){try{f();n++;}catch(e){fails.push(name+": "+(e.message||e).split("\n")[0]);}}
const P=(a,b)=>[{name:"Anna",score:a},{name:"Ben",score:b}];
const log=()=>JSON.parse(mem.gt_matchLog||"[]");
const cnt=()=>parseInt(mem.gt_totalGamesPlayed||"0",10);

T("a) leerer Stand mit alter matchId oeffnet Partie wieder",()=>{
  const F=load();F.GT_MATCH_IDS.skyjo="m1";
  F.recordMatch("skyjo",P(10,20),true);
  assert.equal(log()[0].status,"done");
  const empty={players:[{name:"Anna",rounds:[]},{name:"Ben",rounds:[]}],matchId:"m1"};
  assert.equal(F.gtMatchHasData("skyjo",empty),false);
  globalThis.__gtUndoAt=Date.now();
  F.gtAutoReopen({skyjo:empty});
  delete globalThis.__gtUndoAt;
  assert.equal(log()[0].status,"open");
  assert.equal(log().length,1);
});
T("a1) Revanche (leerer Stand ohne Rueckgaengig) laesst Partie done",()=>{
  const F=load();F.GT_MATCH_IDS.skyjo="m1";
  F.recordMatch("skyjo",P(10,20),true);
  delete globalThis.__gtUndoAt;
  F.gtAutoReopen({skyjo:{players:[{name:"Anna",rounds:[]},{name:"Ben",rounds:[]}],matchId:"m1"}});
  assert.equal(log()[0].status,"done");
});
T("a2) volle fertige Partie bleibt done",()=>{
  const F=load();F.GT_MATCH_IDS.skyjo="m1";
  F.recordMatch("skyjo",P(10,20),true);
  F.gtAutoReopen({skyjo:{players:[{rounds:[1]}],matchId:"m1",__done:true}});
  assert.equal(log()[0].status,"done");
});
T("a3) verwaiste offene Eintraege (>1 Tag) werden entfernt, lebende bleiben",()=>{
  const F=load();const old=Date.now()-3*864e5;
  mem.gt_matchLog=JSON.stringify([
    {id:"1",ts:old,game:"skyjo",status:"open",matchId:"x1",participants:[]},
    {id:"2",ts:old,game:"skyjo",status:"open",matchId:"x2",participants:[]},
    {id:"3",ts:Date.now(),game:"skyjo",status:"open",matchId:"x3",participants:[]},
    {id:"4",ts:old,game:"skyjo",status:"done",matchId:"x4",participants:[]}]);
  F.gtPurgeOpenOrphans({skyjo:{matchId:"x2"}});
  assert.deepEqual(log().map(m=>m.id),["2","3","4"]);
});
T("b) gleiche matchId zweimal: Zaehler +1",()=>{
  const F=load();F.GT_MATCH_IDS.skyjo="m1";
  F.recordMatch("skyjo",P(10,20),true);assert.equal(cnt(),1);
  F.recordMatch("skyjo",P(10,20),true);assert.equal(cnt(),1);
  F.recordMatch("skyjo",P(11,20),true);assert.equal(cnt(),1);
  assert.equal(log().length,1);
  F.GT_MATCH_IDS.skyjo="m2";F.recordMatch("skyjo",P(1,2),true);assert.equal(cnt(),2);
});
T("b2) Migration setzt Zaehler auf Zahl beendeter Partien",()=>{
  const F=load();
  mem.gt_matchLog=JSON.stringify([{id:"1",status:"done",participants:[]},{id:"2",participants:[]},{id:"3",status:"open",participants:[]}]);
  mem.gt_totalGamesPlayed="17";mem.gt_matchLogMig="1";
  F.loadMatchLogRaw();
  assert.equal(cnt(),2);assert.equal(mem.gt_matchLogMig,"2");
});
T("c) kaputter Rohtext: Sicherung und []",()=>{
  const F=load();mem.gt_matchLog="{kaputt";
  assert.deepEqual(F.loadMatchLogRaw(),[]);
  const ks=Object.keys(mem).filter(k=>k.indexOf("gt_matchLog_corrupt_")===0);
  assert.equal(ks.length,1);assert.equal(mem[ks[0]],"{kaputt");
  F.loadMatchLogRaw();assert.equal(Object.keys(mem).filter(k=>k.indexOf("gt_matchLog_corrupt_")===0).length,1);
});
T("c2) hoechstens 2 Sicherungen",()=>{
  const F=load();mem.gt_matchLog_corrupt_1="a";mem.gt_matchLog_corrupt_2="b";mem.gt_matchLog="{neu";
  F.loadMatchLogRaw();
  const ks=Object.keys(mem).filter(k=>k.indexOf("gt_matchLog_corrupt_")===0);
  assert.equal(ks.length,2);assert(!("gt_matchLog_corrupt_1" in mem));
});
T("d) Quota: saveMatchLog false und Meldung",()=>{
  const F=load();throwQuota=true;
  assert.equal(F.saveMatchLog([]),false);
  assert.deepEqual(notices,["storageFull"]);
  throwQuota=false;assert.equal(F.saveMatchLog([]),true);
});
T("e) Hinweis ab 1400 einmal pro Sitzung",()=>{
  const F=load();global.window={};
  const l=[];for(let i=0;i<1399;i++)l.push({id:"i"+i,ts:1,game:"x",participants:[],status:"done"});mem.gt_matchLog=JSON.stringify(l);mem.gt_matchLogMig="2";
  F.recordMatch("freeplay",P(1,2),false);
  F.recordMatch("freeplay",P(1,2),false);
  assert.deepEqual(notices,["statsNearFull"]);
  assert.equal(log().length,1401);
  delete global.window;
});
if(fails.length){console.log("FEHLER:\n"+fails.join("\n"));process.exit(1);}
console.log("test_matchsync: "+n+" Tests OK");
