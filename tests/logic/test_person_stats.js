// Personenstatistik: node tests/test_person_stats.js [pfad/zu/index.html]
const fs=require("fs"),path=require("path"),assert=require("assert/strict");
const HTML=process.argv[2]||path.join(__dirname,"..","index.html");
const src=fs.readFileSync(HTML,"utf8");
const a=src.indexOf("/*GT_PS_BEGIN*/"),b=src.indexOf("/*GT_PS_END*/");
assert(a>0&&b>a,"Marker GT_PS nicht gefunden");
const g=src.indexOf("function gtWon("),ge=src.indexOf("\n",g);
const mem={};
global.localStorage={getItem:k=>(k in mem?mem[k]:null),setItem:(k,v)=>{mem[k]=String(v);},removeItem:k=>{delete mem[k];}};
const pre='function gtIsObj(v){return v!==null&&typeof v==="object"&&!Array.isArray(v);}function gtNum(v){if(typeof v==="number")return isFinite(v)?v:null;return null;}const GT_MATCH_IDS={};';
const F=new Function(pre+src.slice(g,ge)+";"+src.slice(a,b)+`;return{normalizeName,getMatchesForName,getPersonStats,getHeadToHead,getCoPlayers,getRivalries,getGroupMatches,getAllKnownNames,getNameSuggestions:typeof getNameSuggestions=="function"?getNameSuggestions:()=>[],mergeNames,getLeaderboard,computeWinStreaks,gtWon};`)();
let n=0;const fails=[];
function T(name,fn){try{fn();n++;}catch(e){fails.push(name+": "+(e.message||e).split("\n")[0]);}}
let ts=1000,id=0;
// Partie: ps = [[Name,Punkte]], winners = [Namen]
function M(game,ps,winners,extra){ts+=1000;return Object.assign({id:"m"+(++id),ts,game,participants:ps.map(([name,score,team])=>Object.assign({name,norm:name.trim().toLowerCase(),score:score==null?null:score,rank:winners.includes(name)?1:2},team?{isTeam:true}:{})),winner:winners.length===1?winners[0]:null},winners.length>1?{winners}:{},extra||{});}
function seed(list){mem.gt_matchLog=JSON.stringify(list);}
const S=q=>F.getPersonStats(q);

T("Anna/Hanna Pflichtfall",()=>{
  seed([M("skyjo",[["Anna",10],["Hanna",20]],["Anna"]),M("skyjo",[["Hanna",5],["Bob",9]],["Hanna"])]);
  const a=S("Anna"),h=S("Hanna");
  assert.equal(a.played,1);assert.equal(a.wins,1);assert.equal(a.displayName,"Anna");assert.equal(a.winRate,100);
  assert.equal(h.played,2);assert.equal(h.wins,1);assert.equal(h.displayName,"Hanna");assert.equal(h.winRate,50);
  const hh=F.getHeadToHead("Anna","Hanna");assert.equal(hh.together,1);assert.equal(hh.winsA,1);assert.equal(hh.winsB,0);
  const hh2=F.getHeadToHead("Hanna","Anna");assert.equal(hh2.winsA,0);assert.equal(hh2.winsB,1);
  assert.equal(F.getHeadToHead("Anna","Bob").together,0);
});
T("Jan/Janis",()=>{
  seed([M("yatzy",[["Jan",1],["Janis",2]],["Janis"]),M("yatzy",[["Janis",5],["Eva",1]],["Janis"]),M("yatzy",[["Jan",9],["Eva",1]],["Jan"])]);
  assert.equal(S("Jan").played,2);assert.equal(S("Jan").wins,1);
  assert.equal(S("Janis").played,2);assert.equal(S("Janis").wins,2);
  assert.equal(F.getHeadToHead("Jan","Janis").together,1);
  assert.deepEqual(F.getCoPlayers("Jan").map(c=>c.name).sort(),["Eva","Janis"]);
});
T("Spieler 1 / Spieler 10",()=>{
  seed([M("skyjo",[["Spieler 1",1],["Spieler 10",2]],["Spieler 1"]),M("skyjo",[["Spieler 10",1],["Spieler 2",2]],["Spieler 10"]),M("skyjo",[["Spieler 1",1],["Spieler 2",2]],["Spieler 2"])]);
  assert.equal(S("Spieler 1").played,2);assert.equal(S("Spieler 1").wins,1);
  assert.equal(S("Spieler 10").played,2);assert.equal(S("Spieler 10").wins,1);
  assert.equal(F.getHeadToHead("Spieler 1","Spieler 10").together,1);
  assert.equal(F.getHeadToHead("Spieler 1","Spieler 2").together,1);
});
T("Name komplett in anderem enthalten (Al/Alexander/Alexandra)",()=>{
  seed([M("skyjo",[["Al",1],["Alexander",2]],["Alexander"]),M("skyjo",[["Alexandra",1],["Alexander",2]],["Alexandra"])]);
  assert.equal(S("Al").played,1);assert.equal(S("Al").wins,0);
  assert.equal(S("Alexander").played,2);assert.equal(S("Alexander").wins,1);
  assert.equal(S("Alex").played,0);assert.equal(S("Alex").displayName,"Alex");
  assert.equal(F.getHeadToHead("Al","Alexandra").together,0);
  assert.equal(F.getHeadToHead("Al","Alexander").together,1);assert.equal(F.getHeadToHead("Al","Alexander").winsA,0);assert.equal(F.getHeadToHead("Al","Alexander").winsB,1);
});
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
  assert.equal(F.getHeadToHead("Anna-Lena","Anna Lena").winsA,1);
  seed([M("skyjo",[["Müller",1],["Mueller",2],["Muller",3]],["Müller"])]);
  assert.equal(S("Müller").wins,1);assert.equal(S("Mueller").wins,0);assert.equal(S("Muller").played,1);
});
T("gemeinsamer Sieg zaehlt fuer beide",()=>{
  seed([M("skyjo",[["Anna",1],["Bob",1],["Cy",5]],["Anna","Bob"]),M("skyjo",[["Anna",1],["Bob",3]],["Anna"]),M("skyjo",[["Anna",4],["Bob",3]],["Bob"])]);
  const h=F.getHeadToHead("Anna","Bob");
  assert.equal(h.together,3);assert.equal(h.winsA,2);assert.equal(h.winsB,2);assert.equal(h.bothWon,1);
  assert.equal(S("Anna").wins,2);assert.equal(S("Bob").wins,2);
  const hb=F.getHeadToHead("Bob","Anna");assert.equal(hb.winsA,2);assert.equal(hb.winsB,2);
});
T("Partie mit nur einer der Personen",()=>{
  seed([M("skyjo",[["Anna",1],["Cy",2]],["Anna"]),M("skyjo",[["Bob",1],["Cy",2]],["Bob"])]);
  const h=F.getHeadToHead("Anna","Bob");assert.equal(h.together,0);assert.equal(h.winsA,0);assert.equal(h.winsB,0);assert.equal(h.matches.length,0);
  assert.equal(F.getHeadToHead("Anna","Anna"),null);assert.equal(F.getHeadToHead("","Bob"),null);
});
T("Serien und Erfolge nur eigene Partien",()=>{
  const l=[];for(let i=0;i<5;i++)l.push(M("skyjo",[["Anna",1],["Hanna",9]],["Anna"]));
  for(let i=0;i<3;i++)l.push(M("yatzy",[["Hanna",9],["Cy",1]],["Hanna"]));
  seed(l);
  const a=S("Anna"),h=S("Hanna");
  assert.equal(a.played,5);assert.equal(a.wins,5);
  assert.equal(F.computeWinStreaks("anna",a.matches).best,5);
  assert.ok(a.achievements.find(x=>x.id==="streak5").unlocked);
  assert.ok(a.achievements.find(x=>x.id==="first_win").unlocked);
  assert.equal(h.played,8);assert.equal(h.wins,3);
  assert.equal(F.computeWinStreaks("hanna",h.matches).best,3);
  assert.ok(!h.achievements.find(x=>x.id==="streak5").unlocked);
  assert.ok(!h.achievements.find(x=>x.id==="played10").unlocked);
  assert.equal(h.perGame.skyjo.played,5);assert.equal(h.perGame.skyjo.wins,0);
});
T("Lieblingsspiel und Mitspieler getrennt",()=>{
  seed([M("skyjo",[["Anna",1],["Cy",2]],["Anna"]),M("yatzy",[["Hanna",1],["Cy",2]],["Hanna"]),M("yatzy",[["Hanna",1],["Dan",2]],["Hanna"]),M("yatzy",[["Hanna",1],["Dan",2]],["Dan"])]);
  assert.equal(S("Anna").favoriteGame,"skyjo");assert.equal(S("Hanna").favoriteGame,"yatzy");
  assert.deepEqual(F.getCoPlayers("Anna").map(c=>c.name),["Cy"]);
  const ch=F.getCoPlayers("Hanna");assert.deepEqual(ch.map(c=>c.name+":"+c.together+":"+c.meWins).sort(),["Cy:1:1","Dan:2:1"]);
});
T("Rivalitaeten exakt",()=>{
  const l=[];for(let i=0;i<3;i++)l.push(M("skyjo",[["Anna",1],["Hanna",9]],["Anna"]));
  for(let i=0;i<3;i++)l.push(M("skyjo",[["Anna",9],["Hans",1]],["Hans"]));
  seed(l);
  const r=F.getRivalries("Anna");assert.equal(r.nemesis.name,"Hans");assert.equal(r.favorite.name,"Hanna");
  assert.equal(F.getRivalries("Han"),null);
  assert.equal(F.getRivalries("Hanna").nemesis.name,"Anna");
});
T("Teams nicht mit Personen vermischt",()=>{
  seed([M("schieber",[["Anna & Bob",1000,true],["Cy & Dan",900,true]],["Anna & Bob"]),M("schieber",[["Anna",1000,true],["Cy",900,true]],["Anna"]),M("skyjo",[["Anna",1],["Cy",2]],["Anna"])]);
  assert.equal(S("Anna").played,1);assert.equal(S("Anna").wins,1);
  assert.equal(S("Anna & Bob").played,0);
  assert.equal(F.getHeadToHead("Anna","Cy").together,1);
  assert.ok(!F.getAllKnownNames().some(n=>n.name.includes("&")));
  // ohne Markierung: Teamname "Anna & Bob" ist trotzdem nicht Anna
  seed([M("schieber",[["Anna & Bob",1000],["Cy & Dan",900]],["Anna & Bob"])]);
  assert.equal(S("Anna").played,0);assert.equal(S("Anna & Bob").played,1);
});
T("Gruppenpartien exakt",()=>{
  seed([M("skyjo",[["Anna",1],["Bob",2],["Cy",3]],["Anna"]),M("skyjo",[["Hanna",1],["Bob",2]],["Hanna"]),M("skyjo",[["Anna",1],["Bob",2]],["Bob"])]);
  assert.equal(F.getGroupMatches(["Anna","Bob"]).length,2);
  assert.equal(F.getGroupMatches(["anna "," BOB"]).length,2);
  assert.equal(F.getGroupMatches(["Anna","Bob","Cy"]).length,1);
  assert.equal(F.getGroupMatches(["Anna","Anna"]).length,0);
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
  assert.ok(!F.getCoPlayers("Anna").some(c=>c.name==="Anna"));
  assert.equal(F.getLeaderboard("skyjo",5).find(x=>x.name==="Anna").played,4);
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
  seed([]);assert.equal(S("Anna").played,0);assert.deepEqual(F.getMatchesForName(""),[]);assert.equal(F.getRivalries("Anna"),null);
  delete mem.gt_matchLog;assert.equal(S("Anna").played,0);
});
T("Quote und Rundung",()=>{
  seed([M("skyjo",[["Anna",1],["Bob",2]],["Anna"]),M("skyjo",[["Anna",2],["Bob",1]],["Bob"]),M("skyjo",[["Anna",2],["Bob",1]],["Bob"])]);
  assert.equal(S("Anna").winRate,33);assert.equal(S("Bob").winRate,67);
});
console.log((n)+" bestanden, "+fails.length+" fehlgeschlagen");fails.forEach(f=>console.log("FAIL "+f));
process.exit(fails.length?1:0);
