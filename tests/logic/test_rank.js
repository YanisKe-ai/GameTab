// Rang und Rechenstelle: node tests/logic/test_rank.js
// rankedPodium und recordMatch muessen gleich ranken, GT_STATS.won / nightKey.
const assert=require("assert/strict");
const src=require("../lib/source.js").getSource(process.argv[2]);
const cut=(a,b)=>{const i=src.indexOf(a),j=src.indexOf(b);assert(i>=0&&j>i,"Marker fehlt: "+a);return src.slice(i,j);};
const GTRK=cut("/*GT_RANK_BEGIN*/","/*GT_RANK_END*/");
const mem={};
const LS={getItem:k=>(k in mem?mem[k]:null),setItem:(k,v)=>{mem[k]=String(v);},removeItem:k=>{delete mem[k];}};
const SS={getItem:()=>null,setItem:()=>{}};
const g=src.indexOf("function gtWon("),ge=src.indexOf("\n",g);
const sides=src.indexOf("function gtRecordSides("),se=src.indexOf("\n",sides);
const pre=GTRK+';function gtIsObj(v){return v!==null&&typeof v==="object"&&!Array.isArray(v);}function gtNum(v){if(typeof v==="number")return isFinite(v)?v:null;return null;}const GT_MATCH_IDS={};const gtSidesDone=null;';
const rp=src.indexOf("function rankedPodium("),rpe=src.indexOf("\nfunction usePlayCount(",rp);assert(rp>0&&rpe>rp,"rankedPodium fehlt");
const F=new Function("localStorage","sessionStorage",pre+src.slice(g,ge)+";"+cut("/*GT_PS_BEGIN*/","/*GT_PS_END*/")+";"+src.slice(sides,se)+";"+src.slice(rp,rpe)+";return{recordMatch,loadMatchLogRaw,rankedPodium,gtRankList,normalizeName};")(LS,SS);
const sa=src.indexOf("/*GT_STATS_BEGIN*/"),sb=src.indexOf("/*GT_STATS_END*/");
const S=new Function("TRANSLATIONS",src.slice(sa+18,sb)+";return GT_STATS;")({de:{}});
let n=0;const fails=[];
function T(name,fn){try{fn();n++;}catch(e){fails.push(name+": "+(e.message||e).split("\n")[0]);}}
// beide Wege mit denselben Eingaben; Ergebnis: Map Name -> Rang
function both(pl,lowWins,winners){
  mem.gt_matchLog="[]";
  F.recordMatch("freeplay",pl.map(p=>({name:p.name,score:p.score})),lowWins,winners?{winners}:undefined);
  const m=JSON.parse(mem.gt_matchLog).pop();const a={};m.participants.forEach(p=>{a[p.name]=p.rank;});
  const pod=F.rankedPodium(pl.map((p,i)=>({id:i+1,name:p.name,score:p.score})),p=>p.score,{lowWins:!!lowWins,winners:winners||null});
  const b={};pod.forEach(e=>{b[e.name]=e.rk;});
  return{a,b,m};
}
const P=(...x)=>x.map(([name,score])=>({name,score}));
T("normale Rangfolge",()=>{const r=both(P(["A",10],["B",30],["C",20]));assert.deepEqual(r.a,{A:3,B:1,C:2});assert.deepEqual(r.a,r.b);});
T("Gleichstand an der Spitze (Wettbewerbsrang)",()=>{const r=both(P(["A",30],["B",30],["C",20],["D",5]));assert.deepEqual(r.a,{A:1,B:1,C:3,D:4});assert.deepEqual(r.a,r.b);assert.deepEqual(r.m.winners,["A","B"]);});
T("lowWins",()=>{const r=both(P(["A",10],["B",30],["C",10]),true);assert.deepEqual(r.a,{A:1,B:3,C:1});assert.deepEqual(r.a,r.b);});
T("erzwungene winners",()=>{const r=both(P(["A",10],["B",30],["C",20]),false,["A"]);assert.deepEqual(r.a,{A:1,B:2,C:3});assert.deepEqual(r.a,r.b);assert.equal(r.m.winner,"A");});
T("zwei erzwungene winners",()=>{const r=both(P(["A",1],["B",30],["C",20],["D",20]),false,["A","C"]);assert.deepEqual(r.a,{A:1,C:1,B:3,D:4});assert.deepEqual(r.a,r.b);});
T("winners mit Gross-/Kleinschreibung (Norm)",()=>{const r=both(P(["Anna",1],["Bob",9]),false,["  ANNA "]);assert.deepEqual(r.a,{Anna:1,Bob:2});assert.deepEqual(r.a,r.b);});
T("gtRankList direkt, Reihenfolge und keyFn",()=>{const L=[{k:"a",score:5},{k:"b",score:9},{k:"c",score:9}];assert.deepEqual(F.gtRankList(L,{}),[3,1,1]);assert.deepEqual(F.gtRankList(L,{low:true}),[1,2,2]);assert.deepEqual(F.gtRankList(L,{winners:["a"],keyFn:p=>p.k}),[1,2,2]);assert.deepEqual(F.gtRankList([],{}),[]);});
T("Nullpunkte: recordMatch ohne Wertung gibt keinen Rang (unveraendert)",()=>{const r=both(P(["A",null],["B",null]));assert.deepEqual(r.a,{A:null,B:null});});
// GT_STATS.won
const mk=(o)=>Object.assign({participants:[{name:"Anna"},{name:"Bob"},{name:"Cleo"},{name:"ANNA  x"}]},o);
T("won: winner",()=>{assert.equal(S.won(mk({winner:"Anna"}),"anna"),true);assert.equal(S.won(mk({winner:"Anna"}),"bob"),false);});
T("won: geteilter Sieg zaehlt fuer alle (E1)",()=>{const m=mk({winner:"Anna",winners:["Anna","Bob"]});assert.equal(S.won(m,"anna"),true);assert.equal(S.won(m,"bob"),true);assert.equal(S.won(m,"cleo"),false);});
T("won: Rang 1 ohne winner/winners",()=>{const m=mk({participants:[{name:"Anna",rank:1},{name:"Bob",rank:2},{name:"Cleo",rank:1}]});assert.equal(S.won(m,"anna"),true);assert.equal(S.won(m,"cleo"),true);assert.equal(S.won(m,"bob"),false);});
T("won: Normalisierung der winners, Leerwerte",()=>{assert.equal(S.won(mk({winners:["  ANNA  x"]}),"anna x"),true);assert.equal(S.won(null,"a"),false);assert.equal(S.won(mk({}),""),false);assert.equal(S.won(mk({}),"anna"),false);});
T("won: Solo-Partie und noWinner-Spiel zaehlen nicht als Sieg (angeglichen an prep)",()=>{assert.equal(S.won({participants:[{name:"Anna"}],winner:"Anna"},"anna"),false);assert.equal(S.won({game:"mostlikely",participants:[{name:"Anna"},{name:"Bob"}],winner:"Anna"},"anna"),false);assert.equal(S.won({game:"skyjo",participants:[{name:"Anna"},{name:"Bob"}],winner:"Anna"},"anna"),true);});
// nightKey
T("nightKey: 04:59 gehoert zum Vortag, 05:00 zum neuen Tag",()=>{
  assert.equal(S.nightKey(new Date(2026,5,2,4,59,59).getTime()),"2026-06-01");
  assert.equal(S.nightKey(new Date(2026,5,2,5,0,0).getTime()),"2026-06-02");
  assert.equal(S.nightKey(new Date(2026,5,2,23,59).getTime()),"2026-06-02");
  assert.equal(S.nightKey(new Date(2026,0,1,2,0).getTime()),"2025-12-31");
  assert.equal(S.nightKey(NaN),null);});
T("norm: mit Akzentfaltung (Zoë = Zoe)",()=>{assert.equal(S.norm("  Anna   Lena "),"anna lena");assert.equal(S.norm("Zoe\u0308"),"zoe");assert.equal(S.norm("Zo\u00eb"),S.norm("Zoe"));assert.equal(S.norm(null),"");assert.equal(S.norm("Z"),F.normalizeName("Z"));assert.equal(S.norm("Zo\u00eb"),F.normalizeName("Zoe"));});
console.log(fails.length?"FEHLER:\n"+fails.join("\n"):"OK test_rank: "+n+" Tests");
process.exit(fails.length?1:0);
