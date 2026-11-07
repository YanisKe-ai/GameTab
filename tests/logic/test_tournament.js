// Turnier: Rangfolge (Quote) und Rundenvorschlag. Aufruf: GAMETAB_SRC=web node tests/logic/test_tournament.js
const assert=require("assert/strict");
const {getSource}=require("../lib/source.js");
const src=getSource(process.argv[2]);
const a=src.indexOf("/*GT_ST_BEGIN*/"),b=src.indexOf("/*GT_ST_END*/");
assert(a>0&&b>a,"Marker GT_ST fehlt");
const mem={};global.localStorage={getItem:k=>(k in mem?mem[k]:null),setItem:(k,v)=>{mem[k]=String(v);},removeItem:k=>{delete mem[k];}};
const {GT_ST}=new Function(src.slice(a,b)+";return{GT_ST};")();
let n=0;const fails=[];
function T(name,fn){try{fn();n++;}catch(e){fails.push(name+": "+(e.message||e).split("\n")[0]);}}
let clock=0;const NOW=Date.parse("2026-11-07T10:00:00.000Z");const tick=()=>({now:new Date(NOW+(++clock)*60000).toISOString()});
let op=0;const O=()=>"o"+(++op);
const names="ABCDEFGHIJKLMNOP".split("");
const mk=(k,tables)=>GT_ST.newTournament({name:"T",tables,participants:names.slice(0,k).map(x=>({id:x,displayName:x}))});
const play=(t,m,win)=>{t=GT_ST.startMatch(t,m.tableId,m.teamA,m.teamB,O(),tick());const mid=t.matches[t.matches.length-1].id;return GT_ST.completeMatch(t,mid,win||"A",tick());};

T("Rang: bei gleichen Punkten entscheidet die Quote",()=>{
  let t=mk(8,2);
  // A: 2 Siege 1 Niederlage (+1, Quote .67); E: 1 Sieg 0 Niederlagen (+1, Quote 1.0)
  t=GT_ST.enterResult(t,["A","B"],["C","D"],"A",O(),tick());t=GT_ST.enterResult(t,["A","C"],["B","D"],"A",O(),tick());t=GT_ST.enterResult(t,["A","D"],["B","C"],"B",O(),tick());
  t=GT_ST.enterResult(t,["E","F"],["G","H"],"A",O(),tick());
  const d=GT_ST.derive(t);const A=d.standings.find(s=>s.id==="A"),E=d.standings.find(s=>s.id==="E");
  assert.equal(A.points,1);assert.equal(E.points,1);assert(E.quote>A.quote);assert(E.rank<A.rank,"E (Quote 1.0) muss vor A (Quote .67) stehen");
});
T("Rang: voellig gleich = gleicher Rang",()=>{
  let t=mk(8,2);t=GT_ST.enterResult(t,["A","B"],["C","D"],"A",O(),tick());t=GT_ST.enterResult(t,["E","F"],["G","H"],"A",O(),tick());
  const d=GT_ST.derive(t);const r=id=>d.standings.find(s=>s.id===id).rank;assert.equal(r("A"),r("E"));assert.equal(r("A"),1);assert.equal(r("C"),r("G"));assert.equal(r("C"),5);
});
T("Rang: Summe Punkte bleibt 0, Sieg +1 Niederlage -1",()=>{let t=mk(4,1);t=GT_ST.enterResult(t,["A","B"],["C","D"],"B",O(),tick());const d=GT_ST.derive(t);assert.equal(d.standings.reduce((s,x)=>s+x.points,0),0);assert.equal(d.standings.find(s=>s.id==="C").points,1);assert.equal(d.standings.find(s=>s.id==="A").points,-1);});

function checkRound(t,r,tag){const ids=r.matches.flatMap(m=>m.teamA.concat(m.teamB));assert.equal(new Set(ids).size,ids.length,tag+": Person doppelt");const occ=GT_ST.occupancy(t);r.matches.forEach(m=>{assert(occ.freeTables.includes(m.tableId),tag+": Tisch nicht frei");assert.equal(m.teamA.length,2);assert.equal(m.teamB.length,2);});assert.equal(new Set(r.matches.map(m=>m.tableId)).size,r.matches.length);}
[[4,1],[5,1],[6,1],[8,2],[9,2],[12,3]].forEach(([k,tb])=>{
  T("Vorschlag "+k+" Personen/"+tb+" Tische: gueltig, "+Math.min(tb,Math.floor(k/4))+" Partien",()=>{const t=mk(k,tb);const r=GT_ST.suggestRound(t,{seed:7});checkRound(t,r,"r1");assert.equal(r.matches.length,Math.min(tb,Math.floor(k/4)));assert.equal(r.resting.length,k-4*r.matches.length);});
});
T("Vorschlag ist mit gleichem Startwert reproduzierbar, anderer Startwert mischt neu",()=>{const t=mk(8,2);const a=JSON.stringify(GT_ST.suggestRound(t,{seed:3}));assert.equal(a,JSON.stringify(GT_ST.suggestRound(t,{seed:3})));const diff=[4,5,6,7,8,9].some(s=>JSON.stringify(GT_ST.suggestRound(t,{seed:s}))!==a);assert(diff,"Neu mischen aendert nichts");});
T("Vorschlag: nichts bei belegtem Tisch, abwesenden und zu wenigen Personen",()=>{let t=mk(5,1);const r=GT_ST.suggestRound(t,{seed:1});t=GT_ST.startMatch(t,t.tables[0].id,r.matches[0].teamA,r.matches[0].teamB,O(),tick());assert.equal(GT_ST.suggestRound(t,{seed:1}).matches.length,0);
  let u=mk(5,1);u=GT_ST.setAttendance(u,"E","absent",tick());u=GT_ST.setAttendance(u,"D","absent",tick());assert.equal(GT_ST.suggestRound(u,{seed:1}).matches.length,0);});
T("Vorschlag: Pause wechselt reihum (5 Personen, 10 Runden)",()=>{let t=mk(5,1);const rested=[];for(let i=0;i<10;i++){const r=GT_ST.suggestRound(t,{seed:100+i});checkRound(t,r,"R"+i);rested.push(r.resting[0]);t=play(t,r.matches[0],i%2?"A":"B");const g=GT_ST.derive(t).standings.map(s=>s.games);assert(Math.max(...g)-Math.min(...g)<=4,"Spielzahlen laufen auseinander: "+g);}
  assert(new Set(rested.slice(0,5)).size===5,"in 5 Runden pausiert nicht jede Person einmal: "+rested.join(""));for(let i=1;i<rested.length;i++)assert.notEqual(rested[i],rested[i-1],"gleiche Person pausiert zweimal hintereinander");});
T("Vorschlag: 6 Personen, 1 Tisch: Spielzahlen nach 9 Runden hoechstens 1 auseinander",()=>{let t=mk(6,1);for(let i=0;i<9;i++){const r=GT_ST.suggestRound(t,{seed:50+i});t=play(t,r.matches[0],"A");}const g=GT_ST.derive(t).standings.map(s=>s.games);assert(Math.max(...g)-Math.min(...g)<=1,"Spielzahlen: "+g);});
T("Vorschlag: 4 Personen: erst alle 3 Paarungen, dann Wiederholung",()=>{let t=mk(4,1);const seen=new Set();for(let i=0;i<3;i++){const r=GT_ST.suggestRound(t,{seed:20+i});const m=r.matches[0];const k=[GT_ST.pairKey(m.teamA[0],m.teamA[1]),GT_ST.pairKey(m.teamB[0],m.teamB[1])].sort().join("/");assert(!seen.has(k),"Paarung wiederholt vor Runde 4: "+k);seen.add(k);t=play(t,m,"A");}});
T("Vorschlag: 8 Personen/2 Tische: in 3 Runden kein Paar doppelt, jede Person 3 Partien",()=>{let t=mk(8,2);let rep=0;const seen=new Set();for(let i=0;i<3;i++){const r=GT_ST.suggestRound(t,{seed:70+i});checkRound(t,r,"8p"+i);r.matches.forEach(m=>{[m.teamA,m.teamB].forEach(tm=>{const k=GT_ST.pairKey(tm[0],tm[1]);if(seen.has(k))rep++;seen.add(k);});});t=play(t,r.matches[0],"A");t=play(t,r.matches[1],"B");}
  assert.equal(rep,0,"Paare doppelt: "+rep);const g=GT_ST.derive(t).standings.map(s=>s.games);assert(g.every(x=>x===3),"jede Person 3 Partien: "+g);});
T("Vorschlag: nur anwesende Personen",()=>{let t=mk(9,2);t=GT_ST.setAttendance(t,"I","absent",tick());const r=GT_ST.suggestRound(t,{seed:2});checkRound(t,r,"abw");r.matches.forEach(m=>assert(!m.teamA.concat(m.teamB).includes("I")));});
T("Vorschlag startet ueber startMatch ohne Fehler (alle Tische)",()=>{let t=mk(8,2);const r=GT_ST.suggestRound(t,{seed:9});r.matches.forEach(m=>{t=GT_ST.startMatch(t,m.tableId,m.teamA,m.teamB,O(),tick());});assert.equal(GT_ST.derive(t).summary.running,2);assert.equal(GT_ST.derive(t).invariants.ok,true);});

if(fails.length){console.error(fails.join("\n"));console.error("FEHLER: "+fails.length+" von "+(n+fails.length));process.exit(1);}
console.log("OK: "+n+" Turnier-Tests (Quote, Vorschlag)");
