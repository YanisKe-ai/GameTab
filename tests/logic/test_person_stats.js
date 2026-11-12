// Personenstatistik: node tests/test_person_stats.js [pfad/zu/index.html]
const fs=require("fs"),path=require("path"),assert=require("assert/strict");
const src=require("./../lib/source.js").getSource(process.argv[2]);
const a=src.indexOf("/*GT_PS_BEGIN*/"),b=src.indexOf("/*GT_PS_END*/");
assert(a>0&&b>a,"Marker GT_PS nicht gefunden");
const g=src.indexOf("function gtWon("),ge=src.indexOf("\n",g);
const mem={};
global.localStorage={getItem:k=>(k in mem?mem[k]:null),setItem:(k,v)=>{mem[k]=String(v);},removeItem:k=>{delete mem[k];}};
const GTRK=src.slice(src.indexOf("/*GT_RANK_BEGIN*/"),src.indexOf("/*GT_RANK_END*/"));
const pre=GTRK+';function gtIsObj(v){return v!==null&&typeof v==="object"&&!Array.isArray(v);}function gtNum(v){if(typeof v==="number")return isFinite(v)?v:null;return null;}const GT_MATCH_IDS={};';
const F=new Function(pre+src.slice(g,ge)+";"+src.slice(a,b)+`;return{normalizeName,getAllKnownNames,getNameSuggestions,mergeNames,loadMatchLog,gtMigrateMatchLog,gtGroupTag,gtNoteGroup,recordMatch,gtWon,GT_MLOG_MIG_V};`)();
let n=0;const fails=[];
function T(name,fn){try{fn();n++;}catch(e){fails.push(name+": "+(e.message||e).split("\n")[0]);}}
let ts=1000,id=0;
// Partie: ps = [[Name,Punkte]], winners = [Namen]
function M(game,ps,winners,extra){ts+=1000;return Object.assign({id:"m"+(++id),ts,game,participants:ps.map(([name,score,team])=>Object.assign({name,norm:name.trim().toLowerCase(),score:score==null?null:score,rank:winners.includes(name)?1:2},team?{isTeam:true}:{})),winner:winners.length===1?winners[0]:null},winners.length>1?{winners}:{},extra||{});}
function seed(list){mem.gt_matchLog=JSON.stringify(list);}
// Mini-Auswertung (der alte getPersonStats ist entfernt): Partien/Siege/Treffer einer Person aus dem Matchlog
const S=q=>{const k=F.normalizeName(q);const ms=F.loadMatchLog().filter(m=>m.participants.some(p=>p.norm===k&&p.isTeam!==true));return{played:ms.length,wins:ms.filter(m=>F.gtWon(m,k)).length,matches:ms};};

T("Gross/klein und Leerzeichen",()=>{
  seed([M("skyjo",[["ANNA",1],["bob",2]],["ANNA"]),M("skyjo",[["  anna ",1],["Bob",2]],["  anna "]),M("skyjo",[["Anna  Lena",1],["Bob",2]],["Anna  Lena"]),M("skyjo",[["Anna Lena",1],["Bob",2]],["Bob"])]);
  assert.equal(S("anna").played,2);assert.equal(S("  Anna").wins,2);
  assert.equal(S("anna lena").played,2);assert.equal(S("ANNA LENA").wins,1);
  assert.equal(S("Bob").played,4);
  assert.equal(F.normalizeName("  Anna   Lena "),"anna lena");
  assert.equal(F.normalizeName(null),"");assert.equal(F.normalizeName(undefined),"");assert.equal(F.normalizeName("   "),"");
});
T("Umlaute, Bindestrich, Unicode NFC/NFD",()=>{
  const nfd="José",nfc="José";
  assert.equal(F.normalizeName(nfd),F.normalizeName(nfc));
  assert.equal(F.normalizeName("ÄRIN"),F.normalizeName("ärin"));
  // alter Eintrag mit zerlegtem Namen/alter norm bleibt dieselbe Person
  const m1=M("skyjo",[[nfd,1],["Bob",2]],[nfd]);m1.participants[0].norm=nfd.toLowerCase();
  seed([m1,M("skyjo",[[nfc,1],["Bob",2]],["Bob"])]);
  assert.equal(S(nfc).played,2);assert.equal(S("JOSÉ").wins,1);
  seed([M("skyjo",[["Anna-Lena",1],["Anna Lena",2],["Anna",3],["Lena",4]],["Anna-Lena"])]);
  assert.equal(S("Anna-Lena").played,1);assert.equal(S("Anna Lena").played,1);assert.equal(S("Anna Lena").wins,0);assert.equal(S("Anna").wins,0);assert.equal(S("Lena").played,1);
  seed([M("skyjo",[["Müller",1],["Mueller",2],["Muller",3]],["Müller"])]);
  // Akzentfaltung: Müller und Muller sind eine Person, Mueller bleibt getrennt
  assert.equal(S("Müller").played,1);assert.equal(S("Müller").wins,1);assert.equal(S("Mueller").played,1);assert.equal(S("Mueller").wins,0);assert.equal(S("Muller").wins,1);assert.equal(F.getAllKnownNames().filter(n=>n.norm==="muller").length,1);
});
T("Teams nicht mit Personen vermischt",()=>{
  seed([M("schieber",[["Anna & Bob",1000,true],["Cy & Dan",900,true]],["Anna & Bob"]),M("schieber",[["Anna",1000,true],["Cy",900,true]],["Anna"]),M("skyjo",[["Anna",1],["Cy",2]],["Anna"])]);
  assert.equal(S("Anna").played,1);assert.equal(S("Anna").wins,1);
  assert.equal(S("Anna & Bob").played,0);
  assert.ok(!F.getAllKnownNames().some(n=>n.name.includes("&")));
  // ohne Markierung: Teamname "Anna & Bob" ist trotzdem nicht Anna
  seed([M("schieber",[["Anna & Bob",1000],["Cy & Dan",900]],["Anna & Bob"])]);
  assert.equal(S("Anna").played,0);assert.equal(S("Anna & Bob").played,1);
});
T("Vorschlaege unscharf, Berechnung nicht",()=>{
  seed([M("skyjo",[["Anna",1],["Hanna",9]],["Anna"]),M("skyjo",[["Anna",1],["Hanna",9]],["Anna"]),M("skyjo",[["Hanna",1],["Hannes",9]],["Hanna"])]);
  assert.deepEqual(F.getNameSuggestions("Ann").map(n=>n.name),["Anna","Hanna","Hannes"]);
  assert.deepEqual(F.getNameSuggestions("anna").map(n=>n.name),["Hanna"]);
  assert.deepEqual(F.getNameSuggestions("").map(n=>n.name),[]);
  assert.equal(S("Ann").played,0);
});
T("Bewusstes Zusammenfuehren",()=>{
  seed([M("skyjo",[["Anna",1],["Hanna",9]],["Anna"]),M("skyjo",[["Anna",2],["Bob",9]],["Anna"]),M("skyjo",[["Hanna",1],["Bob",9]],["Hanna"]),M("skyjo",[["Ann",1],["Bob",9]],["Bob"])]);
  F.mergeNames("ann","Anna");
  const a=S("Anna");assert.equal(a.played,3);assert.equal(a.wins,2);
  assert.equal(S("Hanna").played,2);assert.equal(S("Ann").played,0);
  // keine automatische Zusammenfuehrung: Hanna unveraendert
  F.mergeNames("hanna","Anna");
  const a2=S("Anna");assert.equal(a2.played,4);assert.equal(a2.wins,3);
  // beide in derselben Partie: Partie zaehlt einmal, kein Doppelsieg, keine Selbst-Mitspielerin
  assert.equal(a2.matches.length,4);
  assert.ok(!JSON.parse(mem.gt_matchLog).some(m=>m.participants.filter(p=>p.name==="Anna").length>1));
  const wm=JSON.parse(mem.gt_matchLog)[0];assert.equal(wm.participants.length,1);assert.equal(wm.participants[0].rank,1);assert.equal(wm.winner,"Anna");
});
T("Zusammenfuehren: Gleichstand-Sieger ohne Doppelte",()=>{
  seed([M("skyjo",[["Anna",1],["Hanna",1],["Bob",5]],["Anna","Hanna"])]);
  F.mergeNames("hanna","Anna");
  const m=JSON.parse(mem.gt_matchLog)[0];assert.deepEqual(m.winners,["Anna"]);
});
T("alte Eintraege: fehlende norm, fehlende ids, kaputte Eintraege",()=>{
  mem.gt_matchLog=JSON.stringify([{ts:5,game:"skyjo",participants:[{name:"Anna",score:1},{name:"Hanna",score:2}],winner:"Anna"},null,{participants:"x"},{ts:6,game:"skyjo",participants:[{name:"Hanna"},{name:" "}],winner:"Hanna"}]);
  assert.equal(S("Anna").played,1);assert.equal(S("Anna").wins,1);assert.equal(S("Hanna").played,2);assert.equal(S("Hanna").wins,1);
});
T("Leere Anfrage und leeres Log",()=>{
  seed([]);assert.equal(S("Anna").played,0);assert.equal(S("").played,0);
  delete mem.gt_matchLog;assert.equal(S("Anna").played,0);
});
T("alte Sicherung laden: Akzent-Migration (Zoë/zoe, Erfolge gesehen, Anna)",()=>{
  // Zustand wie vor der Umstellung: Schluessel alt (zoë und zoe getrennt), Version 2
  const mk=(id,ts,ps,w)=>({id,ts,game:"skyjo",status:"done",participants:ps.map(([name,sc,rk])=>({name,norm:name.trim().toLowerCase(),score:sc,rank:rk})),winner:w});
  mem.gt_matchLog=JSON.stringify([mk("a",1,[["Zoë",1,1],["Anna",5,2]],"Zoë"),mk("b",2,[["zoe ",1,1],["Anna",5,2]],"zoe "),mk("c",3,[["Anna",1,1],["Zoë",5,2]],"Anna")]);
  mem["gametab-achv-seen-v1"]=JSON.stringify({"zoë":["first_win:1"],"zoe":["played:1","first_win:1"],"anna":["first_win:1"]});
  mem.gt_achSeen=JSON.stringify({"zoë":["first_win"],"anna":["streak3"]});
  mem.gt_matchLogMig="2";
  // frisch geladen: Migration laeuft einmalig beim ersten Lesen (neue Funktionsinstanz nur fuer diesen Test)
  const G=new Function(pre+src.slice(g,ge)+";"+src.slice(a,b)+";return{loadMatchLog,gtWon,normalizeName,GT_MLOG_MIG_V};")();
  assert.equal(G.GT_MLOG_MIG_V,3);
  const log=G.loadMatchLog();
  const z=log.filter(m=>m.participants.some(p=>p.norm==="zoe"));assert.equal(z.length,3);
  assert.equal(z.filter(m=>G.gtWon(m,"zoe")).length,2);
  const an=log.filter(m=>m.participants.some(p=>p.norm==="anna"));assert.equal(an.length,3);assert.equal(an.filter(m=>G.gtWon(m,"anna")).length,1);
  assert.equal(mem.gt_matchLogMig,"3");
  const stored=JSON.parse(mem.gt_matchLog);assert.ok(stored.every(m=>m.participants.every(p=>p.norm===G.normalizeName(p.name))),"gespeicherte norm neu berechnet");
  assert.equal(stored[0].participants[0].norm,"zoe");assert.equal(stored[0].participants[1].norm,"anna");
  const seen=JSON.parse(mem["gametab-achv-seen-v1"]);
  assert.deepEqual(Object.keys(seen).sort(),["anna","zoe"]);
  assert.deepEqual(seen.zoe.slice().sort(),["first_win:1","played:1"]);   // vereinigt, ohne Doppelte: nichts wird wieder "neu"
  assert.deepEqual(seen.anna,["first_win:1"]);
  const so=JSON.parse(mem.gt_achSeen);assert.deepEqual(so,{zoe:["first_win"],anna:["streak3"]});
  // zweiter Lauf aendert nichts (Version 3 gesetzt)
  const before=mem.gt_matchLog,b2=mem["gametab-achv-seen-v1"];
  new Function(pre+src.slice(g,ge)+";"+src.slice(a,b)+";loadMatchLog();")();
  assert.equal(mem.gt_matchLog,before);assert.equal(mem["gametab-achv-seen-v1"],b2);
});
T("gt_lastGroup (sessionStorage) mit alter Schluesselform wird neu gefaltet",()=>{
  global.sessionStorage={_m:{},getItem(k){return k in this._m?this._m[k]:null;},setItem(k,v){this._m[k]=String(v);},removeItem(k){delete this._m[k];}};
  sessionStorage.setItem("gt_lastGroup",JSON.stringify({id:7,set:["zoë","anna"]}));
  assert.equal(F.gtGroupTag([{name:"Zoe"},{name:"Anna"}]),7);
  assert.equal(F.gtGroupTag([{name:"Zoe"},{name:"Bob"}]),undefined);
  delete global.sessionStorage;
});
T("Akzentfaltung im Namensschluessel und recordMatch",()=>{
  assert.equal(F.normalizeName("Zoë"),"zoe");assert.equal(F.normalizeName(" ZOE  "),"zoe");assert.equal(F.normalizeName("Müller"),"muller");assert.equal(F.normalizeName("Anna   Lena "),"anna lena");
  // GT_STATS.norm und normalizeName muessen identisch sein
  const ca=src.indexOf("/*GT_STATS_BEGIN*/"),cs=src.slice(ca,src.indexOf("/*GT_STATS_END*/")),ni=cs.indexOf("function norm(name)"),ne=cs.indexOf("\n",ni);
  const N=new Function(cs.slice(ni,ne)+";return norm;")();
  ["Zoë","zoe ","  Anna   Lena ","Müller","José","ÄRIN","","   ",null,undefined,"Anna K.","Anna-Lena","ß","Ørsted","\u0041\u030a"].forEach(x=>assert.equal(N(x),F.normalizeName(x),"norm("+x+")"));
});
console.log((n)+" bestanden, "+fails.length+" fehlgeschlagen");fails.forEach(f=>console.log("FAIL "+f));
process.exit(fails.length?1:0);
