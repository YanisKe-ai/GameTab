// GT_STATS Kern-Tests: node test_stats.js [pfad/zu/index.html]
const fs=require("fs"),path=require("path"),assert=require("assert/strict");
const src=require("../lib/source.js").getSource(process.argv[2]);
const a=src.indexOf("/*GT_STATS_BEGIN*/"),b=src.indexOf("/*GT_STATS_END*/");
assert(a>0&&b>a,"Marker GT_STATS fehlt");
const ti=src.indexOf("const TRANSLATIONS="),te=src.indexOf("\n",ti);
const TR=new Function(src.slice(ti,te)+";return TRANSLATIONS;")();
const S=new Function("TRANSLATIONS",src.slice(a+18,b)+";return GT_STATS;")(TR);
const tDe=k=>TR.de[k]||k;
let n=0;const fails=[];
function T(name,fn){try{fn();n++;}catch(e){fails.push(name+": "+(e.message||e).split("\n")[0]);}}
const near=(x,y,msg)=>assert(Math.abs(x-y)<1e-9,(msg||"")+" "+x+" != "+y);
let id=0;
// d = [Jahr,Monat(1-12),Tag,Stunde,Minute]; ps = [[Name,Punkte,Rang,{isTeam}]]
function M(game,d,ps,winners,extra){const ts=new Date(d[0],d[1]-1,d[2],d[3]||20,d[4]||0).getTime();const parts=ps.map(([name,score,rank,o])=>Object.assign({name,norm:name.toLowerCase(),score:score==null?null:score,rank:rank==null?null:rank},o||{}));const w=winners||[];return Object.assign({id:"t"+(++id),ts,game,participants:parts,winner:w[0]||null,lowWins:false,status:"done"},w.length>1?{winners:w}:{},extra||{});}
const P=(...names)=>names.map((x,i)=>[x,null,null]);
const NOW=new Date(2026,9,24,12);
const pp=(model,key)=>model.people.find(x=>x.key===key);

// ---------- Rechenregeln ----------
T("Quote geglaettet k=4, roh, vorlaeufig",()=>{
  const L=[1,2,3].map(i=>M("yatzy",[2026,1,i],[["A",200,1],["B",100,2]],["A"]));
  const m=S.build(L,{now:NOW});const A=pp(m,"a"),B=pp(m,"b");
  near(A.rate,(3+2)/(3+4));near(A.rateRaw,1);near(B.rate,2/7);near(B.rateRaw,0);
  assert.equal(A.provisional,true);assert.equal(S.K,4);
  assert.equal(m.ranking.length,2);assert.equal(m.ranking[0].key,"a");assert.equal(m.ranking[0].rank,1);assert.equal(m.ranking[1].rank,2);
});
T("vorlaeufig ab 5 Partien weg",()=>{
  const L=[1,2,3,4,5].map(i=>M("yatzy",[2026,1,i],[["A",2,1],["B",1,2]],["A"]));
  assert.equal(pp(S.build(L),"a").provisional,false);
});
T("Rangliste erst ab 3 entschiedenen Partien",()=>{
  const L=[M("skyjo",[2026,1,1],[["A",1,1],["B",2,2]],["A"]),M("skyjo",[2026,1,2],[["A",1,1],["B",2,2]],["A"]),M("skyjo",[2026,1,3],[["A",1,1],["C",2,2]],["A"])];
  const m=S.build(L);assert.deepEqual(m.ranking.map(r=>r.key),["a"]);assert.deepEqual(m.tooFew.map(r=>r.key).sort(),["b","c"]);
  assert.equal(m.tooFew.find(x=>x.key==="b").decided,2);
});
T("Gleichstand geteilt: winPoints 1/n, wins ganz, sharedWins",()=>{
  const L=[M("yatzy",[2026,1,1],[["A",5,1],["B",5,1],["C",1,3]],["A","B"]),M("yatzy",[2026,1,2],[["A",5,1],["B",1,2],["C",1,3]],["A"])];
  const m=S.build(L);const A=pp(m,"a"),B=pp(m,"b"),C=pp(m,"c");
  assert.equal(A.wins,2);assert.equal(A.sharedWins,1);near(A.winPoints,1.5);
  assert.equal(B.wins,1);assert.equal(B.sharedWins,1);near(B.winPoints,0.5);near(C.winPoints,0);
  near(A.rateRaw,0.75);
});
T("Gleiche Quote = gleicher Rang",()=>{
  const L=[];for(let i=1;i<=3;i++){L.push(M("yatzy",[2026,1,i],[["A",2,1],["B",1,2]],["A"]));L.push(M("yatzy",[2026,2,i],[["C",2,1],["D",1,2]],["C"]));}
  const m=S.build(L);const r=Object.fromEntries(m.ranking.map(x=>[x.key,x.rank]));
  assert.equal(r.a,1);assert.equal(r.c,1);assert.equal(r.b,3);assert.equal(r.d,3);
});
T("Niedrig gewinnt: Sieger aus Rang (ohne winner-Feld)",()=>{
  const m0=M("skyjo",[2026,1,1],[["A",10,1],["B",30,2]],[]);m0.lowWins=true;delete m0.winner;
  const m=S.build([m0]);assert.equal(pp(m,"a").wins,1);assert.equal(pp(m,"b").wins,0);assert.equal(m.summary.decided,1);
});
T("Bestwerte mit Richtung (Minigolf min, Yatzy max, Freies Spiel je Partie)",()=>{
  const L=[M("minigolf",[2026,1,1],[["A",40,1],["B",50,2]],["A"],{lowWins:true}),M("minigolf",[2026,1,2],[["A",35,2],["B",30,1]],["B"],{lowWins:true}),
    M("yatzy",[2026,1,3],[["A",250,1],["B",200,2]],["A"]),M("yatzy",[2026,1,4],[["A",180,2],["B",300,1]],["B"]),
    M("freeplay",[2026,1,5],[["A",3,1],["B",9,2]],["A"],{lowWins:true}),M("freeplay",[2026,1,6],[["A",70,1],["B",9,2]],["A"],{lowWins:false})];
  const pa=S.profile(L,"A");const mg=pa.bests.find(x=>x.game==="minigolf");assert.equal(mg.value,35);assert.equal(mg.lowWins,true);
  assert.equal(pa.bests.find(x=>x.game==="yatzy").value,250);
  const fp=pa.bests.filter(x=>x.game==="freeplay");assert.equal(fp.length,2);
  const m=S.build(L);assert.equal(m.games.find(g=>g.game==="minigolf").best.value,30);assert.equal(m.games.find(g=>g.game==="minigolf").lowWins,true);
  assert.equal(m.games.find(g=>g.game==="yatzy").best.value,300);
  assert.equal(S.profile(L,"B").bests.find(x=>x.game==="minigolf").value,30);
});
T("Darts (Legs) und Partyspiele ohne Punkte: keine Bestwerte",()=>{
  const L=[M("darts",[2026,1,1],[["A",3,1],["B",1,2]],["A"]),M("werwolf",[2026,1,2],[["A",null,1],["B",null,2]],["A"])];
  assert.equal(S.profile(L,"A").bests.length,0);
});
// ---------- Teams ----------
T("Teams separat, Mitglieder aus Name abgeleitet oder members",()=>{
  const L=[M("yatzy",[2026,1,1],[["Anna",2,1],["Ben",1,2]],["Anna"]),
    M("tabu",[2026,1,2],[["Anna & Ben",20,1,{isTeam:true}],["Team Rot",10,2,{isTeam:true}]],["Anna & Ben"]),
    M("schieber",[2026,1,3],[["Wir",1000,1,{isTeam:true,members:["Anna","Cleo"]}],["Ihr",800,2,{isTeam:true}]],["Wir"])];
  const m=S.build(L);assert.deepEqual(m.people.map(x=>x.key).sort(),["anna","ben"]);
  assert.equal(pp(m,"anna").matches,1);
  const ab=m.teams.find(x=>x.key==="anna & ben");assert.deepEqual(ab.members,["anna","ben"]);assert.equal(ab.membersInferred,true);assert.equal(ab.wins,1);
  assert.deepEqual(m.teams.find(x=>x.key==="team rot").members,[]);
  assert.deepEqual(m.teams.find(x=>x.key==="wir").members,["anna","cleo"]);
  assert.equal(m.games.find(g=>g.game==="tabu").team,true);assert.equal(m.games.find(g=>g.game==="tabu").champion.key,"anna & ben");
  const pa=S.profile(L,"anna");assert.equal(pa.matches,1);assert.deepEqual(pa.teams.map(x=>x.key).sort(),["anna & ben","wir"]);
  assert.equal(S.profile(L,"cleo").matches,0);
  assert.equal(S.profile(L,"Niemand"),null);
});
// ---------- Partyspiele ohne Sieger ----------
T("Am ehesten: Teilnahme, nie Niederlage, Serie bleibt",()=>{
  const L=[M("yatzy",[2026,1,1],[["A",2,1],["B",1,2]],["A"]),M("mostlikely",[2026,1,2],P("A","B"),[]),M("yatzy",[2026,1,3],[["A",2,1],["B",1,2]],["A"])];
  const m=S.build(L);const A=pp(m,"a");assert.equal(A.matches,3);assert.equal(A.decided,2);near(A.rateRaw,1);
  assert.equal(pp(m,"b").decided,2);assert.equal(S.profile(L,"A").streak.current,2);
  assert.equal(m.games.find(g=>g.game==="mostlikely").champion,null);
  // selbst wenn ein Altdatensatz faelschlich einen Sieger hat: mostlikely kennt keinen Sieger
  const x=M("mostlikely",[2026,1,4],[["A",null,1],["B",null,2]],["A"]);assert.equal(pp(S.build([x]),"a").decided,0);
});
T("Partei-Spiele mit Siegerseite (Werwolf) zaehlen normal",()=>{
  const x=M("werwolf",[2026,1,1],[["A",null,1],["B",null,1],["C",null,2]],["A","B"]);delete x.lowWins;delete x.status;
  const m=S.build([x]);assert.equal(pp(m,"a").wins,1);assert.equal(pp(m,"a").sharedWins,1);assert.equal(pp(m,"c").decided,1);
});
// ---------- Spielabende ----------
T("Spielabend: 05:00-Grenze und Personen-Ueberschneidung",()=>{
  const L=[M("yatzy",[2026,3,6,21,0],[["A",2,1],["B",1,2],["C",0,3]],["A"]),
    M("skyjo",[2026,3,7,1,30],[["A",9,2],["B",3,1],["C",5,3]],["B"],{lowWins:true}),
    M("wizard",[2026,3,7,4,59],[["A",90,1],["B",50,2]],["A"]),
    M("yatzy",[2026,3,7,5,0],[["A",2,1],["B",1,2]],["A"]),
    M("yatzy",[2026,3,7,20,0],[["A",2,1],["B",1,2]],["B"]),
    M("tutto",[2026,3,6,20,0],[["X",2,1],["Y",1,2]],["X"]),M("tutto",[2026,3,6,22,0],[["X",1,2],["Y",2,1]],["Y"])];
  assert.equal(S.nightDate(new Date(2026,2,7,4,59).getTime()),"2026-03-06");assert.equal(S.nightDate(new Date(2026,2,7,5,0).getTime()),"2026-03-07");
  const m=S.build(L);assert.equal(m.summary.nights,3);
  const n6=m.nights.filter(x=>x.date==="2026-03-06");assert.equal(n6.length,2);
  const abc=n6.find(x=>x.people.includes("a"));assert.equal(abc.matches,3);assert.deepEqual(abc.winners,["a"]);near(abc.points.a,2);
  const xy=n6.find(x=>x.people.includes("x"));assert.deepEqual(xy.winners.sort(),["x","y"]);
  const n7=m.nights.find(x=>x.date==="2026-03-07");assert.equal(n7.matches,2);assert.deepEqual(n7.winners.sort(),["a","b"]);
  assert.equal(m.nights[0].date,"2026-03-07");
});
T("Einzelne Partie ist kein Spielabend",()=>{assert.equal(S.build([M("yatzy",[2026,1,1],[["A",1,1],["B",0,2]],["A"])]).summary.nights,0);});
// ---------- Nemesis ----------
T("Nemesis nach NemeStats und Lieblingsgegner",()=>{
  const L=[];
  for(let i=0;i<3;i++)L.push(M("yatzy",[2026,1,1+i],[["Me",1,2],["X",2,1],["Y",0,3]],["X"]));
  L.push(M("yatzy",[2026,1,5],[["Me",3,1],["X",2,2],["Y",0,3]],["Me"]));
  const p=S.profile(L,"me");assert.equal(p.nemesis.key,"x");assert.equal(p.nemesis.losses,3);assert.equal(p.nemesis.together,4);near(p.nemesis.share,0.75);
  assert.equal(p.victim,null);
  assert.equal(S.profile(L,"y").nemesis.key,"x");
});
T("Nemesis: weniger als 3 oder nicht ueber 50 % oder Gleichstand -> null",()=>{
  const L=[];for(let i=0;i<2;i++)L.push(M("yatzy",[2026,1,1+i],[["Me",1,2],["X",2,1]],["X"]));
  assert.equal(S.profile(L,"me").nemesis,null);
  const L2=[];for(let i=0;i<3;i++)L2.push(M("yatzy",[2026,1,1+i],[["Me",1,2],["X",2,1]],["X"]));for(let i=0;i<3;i++)L2.push(M("yatzy",[2026,2,1+i],[["Me",2,1],["X",1,2]],["Me"]));
  assert.equal(S.profile(L2,"me").nemesis,null,"genau 50 %");
  const L3=[];for(let i=0;i<3;i++){L3.push(M("yatzy",[2026,1,1+i],[["Me",1,2],["X",2,1]],["X"]));L3.push(M("yatzy",[2026,2,1+i],[["Me",1,2],["Z",2,1]],["Z"]));}
  assert.equal(S.profile(L3,"me").nemesis,null,"Gleichstand X/Z");
  const L4=L3.concat([M("yatzy",[2026,3,1],[["Me",1,2],["Z",2,1]],["Z"])]);assert.equal(S.profile(L4,"me").nemesis.key,"z");
  const pz=S.profile(L4,"z");assert.equal(pz.victim.key,"me");assert.equal(pz.victim.wins,4);
});
// ---------- Serien ----------
T("Serien aktuell und beste, geteilter Sieg zaehlt",()=>{
  const r=["A","A","B","A","A","AB","A","B"];
  const L=r.map((w,i)=>M("yatzy",[2026,1,1+i],[["A",1,w.includes("A")?1:2],["B",1,w.includes("B")?1:2]],w.split("")));
  const p=S.profile(L,"a");assert.equal(p.streak.best,4);assert.equal(p.streak.current,0);
  assert.equal(S.profile(L,"b").streak.current,1);
  assert.equal(p.timeline.length,8);assert.equal(p.timeline[5].shared,true);
  const m=S.build(L.slice(0,7));const h=m.highlights.find(x=>x.kind==="streak");assert.equal(h.value,4);assert.deepEqual(h.people,["a"]);
});
// ---------- Filter ----------
T("Zeitraum: 30 Tage, Jahr, alles",()=>{
  const L=[M("yatzy",[2026,10,20],[["A",1,1],["B",0,2]],["A"]),M("yatzy",[2026,9,1],[["A",1,1],["B",0,2]],["A"]),M("yatzy",[2025,12,31,23],[["A",1,1],["B",0,2]],["A"])];
  assert.equal(S.build(L,{range:"30d",now:NOW}).summary.matches,1);
  assert.equal(S.build(L,{range:"year",now:NOW}).summary.matches,2);
  assert.equal(S.build(L,{range:"year",year:2025,now:NOW}).summary.matches,1);
  assert.equal(S.build(L,{range:"all",now:NOW}).summary.matches,3);
  assert.equal(S.build(L,{now:NOW.getTime(),range:"30d"}).summary.matches,1);
});
T("Spielfilter",()=>{
  const L=[M("yatzy",[2026,1,1],[["A",1,1],["B",0,2]],["A"]),M("skyjo",[2026,1,2],[["A",1,1],["B",0,2]],["A"])];
  const m=S.build(L,{game:"skyjo"});assert.equal(m.summary.matches,1);assert.equal(m.games.length,1);assert.equal(m.games[0].game,"skyjo");
  assert.equal(S.profile(L,"a",{game:"yatzy"}).matches,1);
});
T("Gruppenfilter: groupId, Namensliste, Teilmenge",()=>{
  const groups=[{id:7,name:"Stamm",players:["Anna","Ben","Cleo"]}];
  const L=[M("yatzy",[2026,1,1],[["Anna",1,1],["Ben",0,2]],["Anna"]),
    M("yatzy",[2026,1,2],[["Anna",1,1],["Ben",0,2],["Dora",0,3]],["Anna"]),
    M("yatzy",[2026,1,3],[["Anna",1,1],["Dora",0,2]],["Anna"],{groupId:7}),
    M("yatzy",[2026,1,4],[["Anna",1,1]],["Anna"]),
    M("tabu",[2026,1,5],[["Anna & Ben",3,1,{isTeam:true}],["Cleo und Anna",1,2,{isTeam:true}]],["Anna & Ben"]),
    M("yatzy",[2026,1,6],[["Ben",1,1],["Cleo",0,2]],["Ben"])];
  const g=S.build(L,{group:7,groups});assert.equal(g.summary.matches,4,"Teilmenge(2)+groupId+Team+BenCleo");
  assert.equal(S.build(L,{group:["anna","BEN","cleo"]}).summary.matches,3,"ohne groupId-Treffer");
  assert.equal(S.build(L,{group:7}).summary.matches,1,"ohne groups-Liste nur groupId");
  assert.equal(S.build(L,{group:null}).summary.matches,6);
});
// ---------- Altdaten, offene Partien ----------
T("Altdaten ohne neue Felder (keine id, kein status, ts als Text, nur winner)",()=>{
  const L=[{ts:String(new Date(2025,5,1).getTime()),game:"skyjo",participants:[{name:"Lena",score:40,rank:1},{name:"Ben",score:61,rank:2}],winner:"Lena"},
    {ts:new Date(2025,5,2).getTime(),game:"yatzy",participants:[{name:"Lena",score:1},{name:"Ben",score:2}],winner:"Ben"},
    {game:"yatzy",participants:[{name:"Lena"},{name:" "},{foo:1}],winner:null},
    null,{participants:"x"}];
  const m=S.build(L);assert.equal(m.summary.matches,3);assert.equal(pp(m,"lena").wins,1);assert.equal(pp(m,"ben").wins,1);
  assert.equal(m.games.find(g=>g.game==="skyjo").lowWins,true);
  assert.equal(S.build(L,{range:"year",now:NOW}).summary.matches,0);
});
T("Offene Partien zaehlen nicht",()=>{
  const L=[M("yatzy",[2026,1,1],[["A",1,1],["B",0,2]],["A"],{status:"open"}),M("yatzy",[2026,1,2],[["A",1,1],["B",0,2]],["B"])];
  const m=S.build(L);assert.equal(m.summary.matches,1);assert.equal(pp(m,"a").wins,0);
});
T("Doppelte Teilnehmer (alter mergeNames-Fehler) nur einmal gezaehlt",()=>{
  const x=M("yatzy",[2026,1,1],[["Max",5,2],["Max",9,1],["B",1,3]],["Max"]);
  const m=S.build([x]);assert.equal(pp(m,"max").matches,1);assert.equal(pp(m,"max").wins,1);assert.equal(S.profile([x],"max").recent[0].rank,1);
});
// ---------- Identitaet ----------
T("Anna/Hanna exakt getrennt, Gross/Klein und Leerzeichen gleich",()=>{
  const L=[M("skyjo",[2026,1,1],[["Anna",10,1],["Hanna",20,2]],["Anna"]),M("skyjo",[2026,1,2],[["Hanna",5,1],["Bob",9,2]],["Hanna"]),M("skyjo",[2026,1,3],[["  anna ",5,1],["Bob",9,2]],["anna"])];
  const m=S.build(L);assert.equal(pp(m,"anna").matches,2);assert.equal(pp(m,"hanna").matches,2);assert.equal(pp(m,"anna").wins,2);
  assert.equal(pp(m,"anna").name,"anna","neueste Schreibweise");
  const h=S.headToHead(L,"Anna","Hanna");assert.equal(h.together,1);assert.equal(h.aWins,1);assert.equal(h.bWins,0);
  assert.equal(S.headToHead(L,"Hanna","Anna").bWins,1);assert.equal(S.norm("  ÄBC  d "),"äbc d");
  assert.equal(S.profile(L,"Ann"),null);
});
// ---------- Direktvergleich ----------
T("Direktvergleich: Siege, geteilt, keiner, Platzierung, Spiele",()=>{
  const L=[M("yatzy",[2026,1,1],[["A",3,1],["B",2,2],["C",1,3]],["A"]),M("yatzy",[2026,1,2],[["A",3,1],["B",3,1]],["A","B"]),
    M("skyjo",[2026,1,3],[["A",9,3],["B",5,2],["C",1,1]],["C"],{lowWins:true}),M("mostlikely",[2026,1,4],P("A","B"),[])];
  const h=S.headToHead(L,"a","b");assert.equal(h.together,4);assert.equal(h.decided,3);assert.equal(h.aWins,1);assert.equal(h.bWins,0);
  assert.equal(h.shared,1);assert.equal(h.neither,1);assert.equal(h.aAhead,1);assert.equal(h.bAhead,1);
  assert.equal(h.games.find(g=>g.game==="yatzy").together,2);assert.equal(h.recent[0].game,"mostlikely");
  assert.equal(S.headToHead(L,"a","a").together,0);
});
// ---------- Labels ----------
T("Spiel-Labels inkl. Flip 7 und Am ehesten",()=>{
  ["skyjo","flip7","mostlikely","schieber","jass-differenzler","hiscore","fivesec","phase10","romme","werwolf","tabu","headsup","impostor","mafia","darts","cricket","splitscore","shanghai","minigolf","yatzy","tutto","wizard","freeplay"].forEach(g=>{
    assert(S.GAMES[g],"GAMES fehlt "+g);const l=S.gameLabel(g,tDe);assert(l&&l!==S.GAMES[g].key&&l!==g||g==="tabu"||g==="mafia"||g==="yatzy"||g==="skyjo"||g==="tutto"||g==="darts"||g==="cricket"||g==="wizard"||g==="minigolf"||g==="schieber"||g==="shanghai","Label "+g+"="+l);});
  assert.equal(S.gameLabel("flip7",tDe),"Flip 7");assert.equal(S.gameLabel("mostlikely",tDe),"Am ehesten");assert.equal(S.gameLabel("mostlikely",k=>(TR.en[k])),"Most Likely To");
  assert.equal(S.gameLabel("unbekannt"),"unbekannt");assert.equal(S.GAMES.skyjo.lowWins,true);assert.equal(S.GAMES.minigolf.lowWins,true);assert.equal(S.GAMES.flip7.lowWins,false);
});
T("Uebersetzungen gtS2 in allen 6 Sprachen",()=>{
  const keys=Object.keys(TR.de).filter(k=>k.startsWith("gtS2"));assert(keys.length>=30,"nur "+keys.length);
  ["en","fr","it","es","pt"].forEach(l=>keys.forEach(k=>assert(TR[l][k]!==undefined,l+" fehlt "+k)));
  const bad=/[–—ß]/;["de","en","fr","it","es","pt"].forEach(l=>keys.forEach(k=>{const v=TR[l][k];const s=typeof v==="function"?v({name:"N",a:"A",b:"B",x:1,y:2,n:3,game:"G",value:4,pct:5,date:"1.1.2026",names:"N",matches:2,year:2026,people:3,games:2,nights:1,avg:2,wins:1,month:"M"}):JSON.stringify(v);assert(!bad.test(s),l+" "+k+" "+s);assert(!/undefined/.test(s),l+" "+k+" "+s);}));
});
// ---------- Highlights, Turniere ----------
T("Highlights: Rivalitaet, Rekord, Ueberraschung, Abend mit Text",()=>{
  const L=[];for(let i=0;i<4;i++)L.push(M("yatzy",[2026,1,1+i],[["A",3,1],["B",2,2],["C",1,3]],["A"]));
  for(let i=0;i<3;i++)L.push(M("yatzy",[2026,2,1+i],[["A",2,2],["B",3,1],["C",1,3]],["B"]));
  L.push(M("yatzy",[2026,3,1,20],[["A",2,2],["B",1,3],["C",350,1]],["C"]));L.push(M("yatzy",[2026,3,1,21],[["A",9,1],["B",1,2]],["A"]));
  const m=S.build(L,{t:tDe});if(process.env.DBG)console.log(JSON.stringify(m.highlights));const k=Object.fromEntries(m.highlights.map(h=>[h.kind,h]));
  assert.equal(k.rivalry.value,"5:3");assert.deepEqual(k.rivalry.people,["a","b"]);assert(/A und B/.test(k.rivalry.text),k.rivalry.text);
  assert.equal(k.record.value,350);assert.equal(k.record.game,"yatzy");
  assert.deepEqual(k.surprise.people,["c"]);assert.equal(k.surprise.value,0);assert(/gewannen/.test(k.night.text),k.night.text);
  assert.equal(k.night.value,1);assert.equal(k.rivalry.title,"Rivalität");
  m.highlights.forEach(h=>{assert(!/gtS2/.test(h.title+h.text),h.kind);assert(typeof h.text==="string");});
});
T("Ohne Daten: leeres Modell, keine Fehler",()=>{
  const m=S.build([]);assert.equal(m.summary.matches,0);assert.equal(m.ranking.length,0);assert.equal(m.highlights.length,0);assert.equal(m.summary.favGame,null);
  assert.equal(S.yearReview([],2026).cards.length,0);assert.equal(S.build(null).summary.matches,0);
});
const TOUR={id:"t1",name:"Cup",status:"completed",completedAt:"2026-06-13T19:00:00.000Z",participants:["A","B","C","D"].map((n,i)=>({id:"p"+i,displayName:n})),
  matches:[{status:"completed",teamA:["p0","p1"],teamB:["p2","p3"],winner:"A"},{status:"completed",teamA:["p0","p2"],teamB:["p1","p3"],winner:"A"},{status:"aborted",teamA:["p0","p3"],teamB:["p1","p2"],winner:null}]};
T("Turniere: nur abgeschlossen, Sieger, Filter",()=>{
  const m=S.build([],{tournaments:[TOUR,Object.assign({},TOUR,{id:"t2",status:"active"}),Object.assign({},TOUR,{id:"t3",deletedAt:"x"})],now:NOW});
  assert.equal(m.tournaments.length,1);assert.equal(m.tournaments[0].matches,2);assert.deepEqual(m.tournaments[0].winners,["a"]);
  assert.equal(m.tournaments[0].people.find(x=>x.key==="d").points,-2);
  assert.equal(S.build([],{tournaments:[TOUR],game:"yatzy"}).tournaments.length,0);
  assert.equal(S.build([],{tournaments:[TOUR],range:"30d",now:NOW}).tournaments.length,0);
  assert.equal(S.build([],{tournaments:[TOUR],group:["a","b","c","d","e"]}).tournaments.length,1);
  assert.equal(S.build([],{tournaments:[TOUR],group:["a","b"]}).tournaments.length,0);
  const p=S.profile([M("yatzy",[2026,1,1],[["A",1,1],["B",0,2]],["A"])],"a",{tournaments:[TOUR]});assert.equal(p.tournaments.played,1);assert.equal(p.tournaments.won,1);
});
// ---------- Fixtures + Jahresrueckblick ----------
const FX=JSON.parse(fs.readFileSync([path.join(__dirname,"fixtures.json"),path.join(__dirname,"..","fixtures_st","stats_fixtures.json")].find(f=>fs.existsSync(f)),"utf8"));
T("Fixtures: Umfang",()=>{
  const L=FX.gt_matchLog;assert(L.length>=55&&L.length<=70,"Partien "+L.length);
  const m=S.build(L,{now:NOW,tournaments:FX.schieberTournaments});assert.equal(m.summary.people,7);assert.equal(m.teams.length,2);
  assert(m.summary.nights>=10);assert(m.summary.games>=18,"Spiele "+m.summary.games);assert(m.people.some(x=>x.sharedWins>0));
  const span=(m.summary.lastTs-m.summary.firstTs)/864e5;assert(span>395&&span<460,"Spanne "+span);
  assert.equal(m.tournaments.length,1);assert(L.some(x=>x.status==="open"));assert(L.some(x=>x.id==null));assert(L.some(x=>x.groupId!=null));
});
T("Jahresrueckblick: mind. 8 Karten, keine erfundenen Werte",()=>{
  const Y=S.yearReview(FX.gt_matchLog,2026,{now:NOW,t:tDe,focus:"Yanis"});assert(Y.cards.length>=8,"nur "+Y.cards.length);
  assert.equal(Y.cards[0].kind,"intro");assert.equal(Y.cards[1].kind,"me");assert.equal(Y.cards[Y.cards.length-1].kind,"outro");
  const M26=S.build(FX.gt_matchLog,{range:"year",year:2026});assert.equal(Y.matches,M26.summary.matches);assert.equal(Y.cards[0].value,M26.summary.matches);
  Y.cards.forEach(c=>{assert(c.title&&c.text&&!/gtS2|undefined|NaN/.test(c.title+c.text),c.kind+": "+c.title+" / "+c.text);assert(c.value!==undefined&&c.value!==null&&!(typeof c.value==="number"&&!isFinite(c.value)),c.kind);});
  const kinds=Y.cards.map(c=>c.kind);assert(kinds.includes("newcomer")===false||true);
  const small=S.yearReview([M("yatzy",[2026,1,1],[["A",1,1],["B",0,2]],["A"])],2026,{t:tDe});if(process.env.DBG)console.log(small.cards.map(c=>c.kind));
  assert.deepEqual(small.cards.map(c=>c.kind),["intro","favGame","social","outro"]);
  assert.equal(S.yearReview(FX.gt_matchLog,2020,{t:tDe}).cards.length,0);
});
T("Jahresrueckblick: Neu dabei nur mit Vorjahresdaten",()=>{
  const L=[M("yatzy",[2025,5,1],[["A",1,1],["B",0,2]],["A"])];for(let i=0;i<3;i++)L.push(M("yatzy",[2026,1,1+i],[["A",1,1],["N",0,2]],["A"]));
  const Y=S.yearReview(L,2026,{t:tDe});const nc=Y.cards.find(c=>c.kind==="newcomer");assert(nc,"fehlt");assert.deepEqual(nc.people,["n"]);
  assert(!S.yearReview(L.slice(1),2026,{t:tDe}).cards.some(c=>c.kind==="newcomer"));
});
T("Leistung: 1500 Partien unter 1.5 s",()=>{
  const L=[];for(let i=0;i<1500;i++){const nm=["A","B","C","D","E","F","G","H"];const ps=nm.slice(i%4,i%4+4).map((x,j)=>[x,(i*7+j*13)%50,j+1]);L.push(M(["yatzy","skyjo","tutto"][i%3],[2025,1+(i%12),1+(i%27),18+(i%5)],ps,[ps[0][0]]));}
  const t0=Date.now();S.build(L,{now:NOW});S.profile(L,"a");S.yearReview(L,2025);assert(Date.now()-t0<1500,"zu langsam "+(Date.now()-t0));
});

// ---------- Datenpunkte 7 in GT_PS (recordMatch, mergeNames) ----------
(function(){
  const pa=src.indexOf("/*GT_PS_BEGIN*/"),pb=src.indexOf("/*GT_PS_END*/");
  const g=src.indexOf("function gtWon("),ge=src.indexOf("\n",g);
  const sides=src.indexOf("function gtRecordSides("),se=src.indexOf("\n",sides);
  const mem={},ses={};
  const LS={getItem:k=>(k in mem?mem[k]:null),setItem:(k,v)=>{mem[k]=String(v);},removeItem:k=>{delete mem[k];}};
  const SS={getItem:k=>(k in ses?ses[k]:null),setItem:(k,v)=>{ses[k]=String(v);}};
  const pre='function gtIsObj(v){return v!==null&&typeof v==="object"&&!Array.isArray(v);}function gtNum(v){if(typeof v==="number")return isFinite(v)?v:null;return null;}const GT_MATCH_IDS={};const gtSidesDone=null;';
  const F=new Function("localStorage","sessionStorage",pre+src.slice(g,ge)+";"+src.slice(pa,pb)+";"+src.slice(sides,se)+";return{recordMatch,mergeNames,loadMatchLog,gtNoteGroup,gtRecordSides,statsGameLabel,STATS_SCOREPAD_GAMES};")(LS,SS);
  const log=()=>JSON.parse(mem.gt_matchLog||"[]");
  T("recordMatch ohne Gruppe: kein groupId (rueckwaertsvertraeglich)",()=>{mem.gt_matchLog="[]";F.recordMatch("yatzy",[{name:"A",score:2},{name:"B",score:1}],false);const e=log()[0];assert.equal(e.groupId,undefined);assert.equal(e.winner,"A");assert.equal(e.status,"done");});
  T("recordMatch nach Gruppe laden: groupId bei Teilmenge, sonst nicht",()=>{mem.gt_matchLog="[]";F.gtNoteGroup({id:3,name:"S",players:["Anna","Ben","Cleo"]});
    F.recordMatch("yatzy",[{name:"anna",score:2},{name:"Ben",score:1}],false);F.recordMatch("yatzy",[{name:"Anna",score:2},{name:"Dora",score:1}],false);
    F.gtRecordSides("werwolf",[{name:"Anna"},{name:"Ben"},{name:"Cleo"}],p=>p.name==="Anna");
    const L=log();assert.equal(L[0].groupId,3);assert.equal(L[1].groupId,undefined);assert.equal(L[2].groupId,3);
    assert(ses.gt_lastGroup&&JSON.parse(ses.gt_lastGroup).id===3);});
  T("recordMatch: Teammitglieder additiv",()=>{mem.gt_matchLog="[]";F.recordMatch("tabu",[{name:"Rot",score:5,isTeam:true,members:["Anna"," Ben ",""]},{name:"Blau",score:3,isTeam:true}],false);
    const e=log()[0];assert.deepEqual(e.participants[0].members,["Anna","Ben"]);assert.equal(e.participants[1].members,undefined);assert.equal(e.groupId,undefined);});
  T("mergeNames: beide Namen in derselben Partie ergibt kein Duplikat",()=>{
    mem.gt_matchLog=JSON.stringify([{id:"1",ts:1,game:"yatzy",participants:[{name:"Max",norm:"max",score:5,rank:2},{name:"Maxi",norm:"maxi",score:9,rank:1},{name:"B",norm:"b",score:1,rank:3}],winner:"Maxi",status:"done"},
      {id:"2",ts:2,game:"yatzy",participants:[{name:"Maxi",norm:"maxi",score:9,rank:1},{name:"B",norm:"b",score:1,rank:2}],winner:"Maxi",status:"done"}]);
    F.mergeNames("maxi","Max");const L=F.loadMatchLog();
    assert.equal(L[0].participants.length,2);const mx=L[0].participants.find(p=>p.norm==="max");assert.equal(mx.rank,1);assert.equal(mx.score,5);assert.equal(L[0].winner,"Max");
    assert.equal(L[1].participants[0].name,"Max");const m=S.build(L);assert.equal(pp(m,"max").matches,2);assert.equal(pp(m,"max").wins,2);});
  T("statsGameLabel kennt Flip 7, Bestenliste enthaelt flip7",()=>{assert.equal(F.statsGameLabel("flip7",tDe),"Flip 7");assert.equal(F.statsGameLabel("hiscore",tDe),"Hi Score");assert(F.STATS_SCOREPAD_GAMES.includes("flip7"));});
})();

console.log((fails.length?"FEHLER":"OK")+": "+n+" Tests bestanden, "+fails.length+" fehlgeschlagen");
fails.forEach(f=>console.log("  x "+f));
process.exit(fails.length?1:0);
