// Erfolge (Abzeichen): GAMETAB_SRC=web node tests/logic/test_achievements.js
const assert=require("assert/strict");
const src=require("../lib/source.js").getSource(process.argv[2]);
const a=src.indexOf("/*GT_ACH_BEGIN*/"),b=src.indexOf("/*GT_ACH_END*/");
assert(a>0&&b>a,"Marker GT_ACH fehlt");
const mem={};
global.localStorage={getItem:k=>(k in mem?mem[k]:null),setItem:(k,v)=>{mem[k]=String(v);},removeItem:k=>{delete mem[k];}};
const A=new Function(src.slice(a,b)+";return{ACHV_DEFS,computeAchievements,achvNewFromLast,achvUnseen,achvMarkSeen,achvForPodium,achvKeys};")();
const ti=src.indexOf("const TRANSLATIONS="),te=src.indexOf("\n",ti);
const TR=new Function(src.slice(ti,te)+";return TRANSLATIONS;")();
let n=0;const fails=[];
function T(name,fn){try{fn();n++;}catch(e){fails.push(name+": "+(e.message||e).split("\n")[0]);}}
const DAY=864e5,H=36e5;let id=0;
const base=new Date(2026,5,1,19,0,0).getTime();
// ps: [[Name,Score]], win: [Namen]
function M(game,ps,win,ts,extra){return Object.assign({id:"m"+(++id),ts,game,participants:ps.map(([name,score])=>({name,norm:name.toLowerCase(),score:score==null?null:score,rank:win.includes(name)?1:2})),winner:win[0]||null,winners:win.length>1?win:undefined},extra||{});}
const get=(log,name,aid)=>A.computeAchievements(log,name).find(x=>x.id===aid);
const two=(w,ts,g)=>M(g||"skyjo",[["Anna",1],["Bob",2]],w,ts);

T("leeres Log",()=>{const l=A.computeAchievements([],"Anna");assert.equal(l.length,A.ACHV_DEFS.length);assert(l.every(x=>!x.unlocked&&x.level===0));});
T("Katalogumfang",()=>{assert(A.ACHV_DEFS.length>=15&&A.ACHV_DEFS.length<=40);const ids=A.ACHV_DEFS.map(d=>d.id);assert.equal(new Set(ids).size,ids.length);});
T("erste Partie, Siege und Stufen",()=>{
  const log=[];for(let i=0;i<5;i++)log.push(two(["Anna"],base+i*DAY));
  assert.equal(get(log,"Anna","first").unlocked,true);
  const w=get(log,"Anna","wins");assert.equal(w.level,2);assert.equal(w.next,25);assert.equal(w.value,5);assert.equal(w.tier,"silver");
  assert.equal(get(log,"Bob","wins").level,0);assert.equal(get(log,"Bob","first").unlocked,true);
  assert.equal(get(log,"Cleo","first").unlocked,false);
});
T("Name normalisiert",()=>{assert.equal(get([two(["Anna"],base)],"  ANNA ","wins").value,1);});
T("Partien-Stufen",()=>{const log=[];for(let i=0;i<10;i++)log.push(two(["Bob"],base+i*DAY,"freeplay"));
  assert.equal(get(log,"Anna","played").level,1);assert.equal(get(log,"Anna","wins").unlocked,false);});
T("Siegesserie bricht bei Niederlage",()=>{
  const r=["Anna","Anna","Bob","Anna","Anna","Anna"];const log=r.map((w,i)=>two([w],base+i*DAY));
  const s=get(log,"Anna","streak");assert.equal(s.value,3);assert.equal(s.level,1);});
T("Serie nach Zeit sortiert, nicht nach Reihenfolge im Log",()=>{
  const log=[two(["Anna"],base+2*DAY),two(["Bob"],base+DAY),two(["Anna"],base)];
  assert.equal(get(log,"Anna","streak").value,1);});
T("Allrounder und Entdecker",()=>{
  const gs=["skyjo","flip7","yatzy","tutto","darts"];const log=gs.map((g,i)=>M(g,[["Anna",1],["Bob",0]],["Anna"],base+i*DAY));
  assert.equal(get(log,"Anna","allround").value,5);assert.equal(get(log,"Anna","allround").level,2);
  assert.equal(get(log,"Anna","explorer").value,5);assert.equal(get(log,"Anna","explorer").level,1);});
T("Spezialist: Siege im selben Spiel",()=>{const log=[];for(let i=0;i<5;i++)log.push(two(["Anna"],base+i*DAY,"tutto"));
  log.push(two(["Anna"],base+9*DAY,"darts"));assert.equal(get(log,"Anna","specialist").value,5);assert.equal(get(log,"Anna","specialist").unlocked,true);});
T("Comeback: Sieg nach 3 Niederlagen",()=>{
  const r=["Bob","Bob","Bob","Anna"];const log=r.map((w,i)=>two([w],base+i*DAY));
  assert.equal(get(log,"Anna","comeback").unlocked,true);
  assert.equal(get(log.slice(1),"Anna","comeback").unlocked,false);});
T("Unentschiedene Partie zaehlt nicht als Niederlage",()=>{
  const log=[two(["Bob"],base),M("mostlikely",[["Anna"],["Bob"]],[],base+DAY),two(["Bob"],base+2*DAY),two(["Anna"],base+3*DAY)];
  assert.equal(get(log,"Anna","comeback").unlocked,false);});
T("Gleichstand-Sieg",()=>{const log=[M("skyjo",[["Anna",1],["Bob",1]],["Anna","Bob"],base)];
  assert.equal(get(log,"Anna","shared").unlocked,true);assert.equal(get(log,"Anna","wins").value,1);});
T("Spieleabend: Mitternacht gehoert zum Abend, 5 Uhr trennt",()=>{
  const t0=new Date(2026,5,1,22,0,0).getTime();
  const log=[two(["Anna"],t0),two(["Anna"],t0+3*H),two(["Anna"],t0+5*H)];
  assert.equal(get(log,"Anna","evening").value,3);
  const log2=[two(["Anna"],t0),two(["Anna"],t0+3*H),two(["Anna"],t0+10*H)];
  assert.equal(get(log2,"Anna","evening").value,2);});
T("Treue: verschiedene Tage",()=>{const log=[];for(let i=0;i<5;i++)log.push(two(["Anna"],base+i*DAY));
  assert.equal(get(log,"Anna","loyal").value,5);assert.equal(get(log,"Anna","loyal").unlocked,true);});
T("Gesellig: verschiedene Mitspieler, Teams zaehlen nicht",()=>{
  const log=[M("skyjo",[["Anna",1],["Bob",2],["Cleo",3],["Dan",4]],["Anna"],base)];
  assert.equal(get(log,"Anna","social").value,3);
  const t=M("tabu",[["Anna",1],["Zeta",2]],["Anna"],base+DAY);t.participants[1].isTeam=true;
  assert.equal(get([t],"Anna","social").value,0);});
T("Skyjo unter null",()=>{const log=[M("skyjo",[["Anna",-3],["Bob",9]],["Anna"],base)];
  assert.equal(get(log,"Anna","skyjoNeg").unlocked,true);assert.equal(get(log,"Bob","skyjoNeg").unlocked,false);
  assert.equal(get([M("skyjo",[["Anna",0],["Bob",9]],["Anna"],base)],"Anna","skyjoNeg").unlocked,false);
  assert.equal(get([M("flip7",[["Anna",-3],["Bob",9]],["Bob"],base)],"Anna","skyjoNeg").unlocked,false);});
T("Yatzy ab 300",()=>{assert.equal(get([M("yatzy",[["Anna",300],["Bob",200]],["Anna"],base)],"Anna","yatzy300").unlocked,true);
  assert.equal(get([M("yatzy",[["Anna",299],["Bob",200]],["Anna"],base)],"Anna","yatzy300").unlocked,false);});
T("Extrafelder: Hole-in-one, Wizard, Flip 7 (alte Eintraege ohne Feld ignoriert)",()=>{
  const mg=M("minigolf",[["Anna",30],["Bob",35]],["Anna"],base,{aces:["Anna"]});
  assert.equal(get([mg],"Anna","ace").unlocked,true);assert.equal(get([mg],"Bob","ace").unlocked,false);
  assert.equal(get([M("minigolf",[["Anna",30],["Bob",35]],["Anna"],base)],"Anna","ace").unlocked,false);
  const wz=M("wizard",[["Anna",100],["Bob",90]],["Anna"],base,{perfect:["Bob"]});
  assert.equal(get([wz],"Bob","perfect").unlocked,true);assert.equal(get([wz],"Anna","perfect").unlocked,false);
  const f7=M("flip7",[["Anna",210],["Bob",90]],["Anna"],base,{flip7:["anna"]});
  assert.equal(get([f7],"Anna","flip7").unlocked,true);
  assert.equal(get([M("skyjo",[["Anna",1],["Bob",2]],["Anna"],base,{aces:["Anna"]})],"Anna","ace").unlocked,false);});
T("Darts: 180er zaehlen pro Person, Ton-Checkout",()=>{
  const d=M("darts",[["Anna",3],["Bob",1]],["Anna"],base,{d180:{Anna:2,bob:1},ton:["Anna"]});
  assert.equal(get([d],"Anna","d180").value,2);assert.equal(get([d],"Anna","d180").level,1);assert.equal(get([d],"Bob","d180").value,1);
  const d2=M("darts",[["Anna",3],["Bob",1]],["Anna"],base+DAY,{d180:{Anna:4}});
  assert.equal(get([d,d2],"Anna","d180").value,6);assert.equal(get([d,d2],"Anna","d180").level,2);
  assert.equal(get([d],"Anna","tonOut").unlocked,true);assert.equal(get([d],"Bob","tonOut").unlocked,false);
  assert.equal(get([M("darts",[["Anna",3],["Bob",1]],["Anna"],base)],"Anna","d180").value,0);
  assert.equal(get([M("skyjo",[["Anna",3],["Bob",1]],["Anna"],base,{d180:{Anna:9}})],"Anna","d180").value,0);});
T("Partyspiele: Seiten und Rollen, alte Eintraege ignoriert",()=>{
  const im=M("impostor",[["Anna"],["Bob"],["Cleo"]],["Anna"],base,{impostors:["Anna"]});
  assert.equal(get([im],"Anna","unseen").value,1);assert.equal(get([im],"Bob","unseen").value,0);
  const imLost=M("impostor",[["Anna"],["Bob"],["Cleo"]],["Bob","Cleo"],base,{impostors:["Anna"]});
  assert.equal(get([imLost],"Anna","unseen").value,0);
  assert.equal(get([M("impostor",[["Anna"],["Bob"]],["Anna"],base)],"Anna","unseen").value,0);
  const ww=M("werwolf",[["Anna"],["Bob"],["Cleo"]],["Anna","Cleo"],base,{wolves:["Bob"],wwWin:"dorf"});
  assert.equal(get([ww],"Anna","villageSaver").value,1);assert.equal(get([ww],"Bob","villageSaver").value,0);
  const wwW=M("werwolf",[["Anna"],["Bob"]],["Bob"],base,{wolves:["Bob"],wwWin:"wolf"});
  assert.equal(get([wwW],"Bob","villageSaver").value,0);
  const mf=M("mafia",[["Anna"],["Bob"]],["Anna"],base,{mafiosi:["Anna"]});
  assert.equal(get([mf],"Anna","godfather").value,1);assert.equal(get([mf],"Bob","godfather").value,0);
  const tr=M("traitor",[["Anna"],["Bob"],["Cleo"]],["Anna","Bob"],base,{traitors:["Cleo"]});
  assert.equal(get([tr],"Anna","exposed").value,1);assert.equal(get([tr],"Cleo","exposed").value,0);
  assert.equal(get([M("traitor",[["Anna"],["Bob"]],["Anna"],base)],"Anna","exposed").value,0);
  const ml=M("mostlikely",[["Anna"],["Bob"]],[],base,{fav:["Bob"]});
  assert.equal(get([ml],"Bob","darling").value,1);assert.equal(get([ml],"Anna","darling").value,0);});
T("Weitere Spiele: Tutto, Freeplay, Phase 10, Romme, Heads Up, Jass, 5 Sekunden",()=>{
  assert.equal(get([M("tutto",[["Anna",5000],["Bob",100]],["Anna"],base,{big:["Anna"]})],"Anna","thousand").unlocked,true);
  assert.equal(get([M("tutto",[["Anna",5000],["Bob",100]],["Anna"],base)],"Anna","thousand").unlocked,false);
  assert.equal(get([M("freeplay",[["Anna",5],["Bob",1]],["Anna"],base,{fpRounds:20})],"Bob","marathon").unlocked,true);
  assert.equal(get([M("freeplay",[["Anna",5],["Bob",1]],["Anna"],base,{fpRounds:19})],"Bob","marathon").unlocked,false);
  assert.equal(get([M("phase10",[["Anna",50],["Bob",90]],["Anna"],base,{straight:["Anna"]})],"Anna","straight").unlocked,true);
  assert.equal(get([M("romme",[["Anna",50],["Bob",500]],["Anna"],base,{clean:["Anna"]})],"Anna","cleanHand").unlocked,true);
  assert.equal(get([M("romme",[["Anna",50],["Bob",500]],["Anna"],base)],"Anna","cleanHand").unlocked,false);
  const hu=[M("headsup",[["Anna",12],["Bob",16]],["Bob"],base),M("headsup",[["Anna",9],["Bob",3]],["Anna"],base+DAY)];
  assert.equal(get(hu,"Anna","wordAcrobat").value,12);assert.equal(get(hu,"Anna","wordAcrobat").level,1);assert.equal(get(hu,"Bob","wordAcrobat").level,2);
  const js=[];for(let i=0;i<5;i++)js.push(M("jass-differenzler",[["Anna",9],["Bob",3]],["Anna"],base+i*DAY));
  assert.equal(get(js,"Anna","jassAce").level,2);assert.equal(get(js,"Bob","jassAce").level,0);
  assert.equal(get([M("fivesec",[["Anna",9],["Bob",3]],["Anna"],base)],"Anna","quick5").level,1);});
T("Loeschen entfernt den Erfolg",()=>{const m1=M("skyjo",[["Anna",-1],["Bob",2]],["Anna"],base);
  assert.equal(get([m1],"Anna","skyjoNeg").unlocked,true);assert.equal(get([],"Anna","skyjoNeg").unlocked,false);});
T("Neu durch jüngste Partie",()=>{
  const old=[];for(let i=0;i<4;i++)old.push(two(["Anna"],base+i*DAY));
  const last=two(["Anna"],base+4*DAY);const log=old.concat([last]);
  const f=A.achvNewFromLast(log,"Anna",last.ts+1000).map(x=>x.key).sort();
  assert.deepEqual(f,["loyal:1","specialist:1","streak:2","wins:2"].sort());
  assert.deepEqual(A.achvNewFromLast(log,"Anna",last.ts+11*60*1000),[]);
  assert.deepEqual(A.achvNewFromLast(log,"Zoe",last.ts),[]);});
T("Erste Partie ist sofort neu",()=>{const m=two(["Bob"],base);
  assert.deepEqual(A.achvNewFromLast([m],"Anna",base+5).map(x=>x.key),["first:1"]);});
T("Merkliste: Erstbestand still, danach nur Neues",()=>{
  delete mem["gametab-achv-seen-v1"];
  const log=[two(["Anna"],base),two(["Anna"],base+DAY)];
  assert.deepEqual(A.achvUnseen("Anna",A.computeAchievements(log,"Anna")),[]);
  log.push(two(["Anna"],base+2*DAY));
  const u=A.achvUnseen("Anna",A.computeAchievements(log,"Anna"));assert.deepEqual(u,["streak:1"]);
  A.achvMarkSeen("Anna",u);assert.deepEqual(A.achvUnseen("Anna",A.computeAchievements(log,"Anna")),[]);});
T("Podest: neue Erfolge einmalig und mit Erstbestand",()=>{
  delete mem["gametab-achv-seen-v1"];
  const log=[];for(let i=0;i<3;i++)log.push(two(["Anna"],base+i*DAY));
  const now=log[2].ts+500;
  const r=A.achvForPodium(log,["Anna","Bob","Anna"],now);
  assert.deepEqual(r.map(x=>x.name+":"+x.id+":"+x.level).sort(),["Anna:streak:1"]);
  assert.deepEqual(A.achvForPodium(log,["Anna","Bob"],now),[]);
  assert.deepEqual(A.achvUnseen("Bob",A.computeAchievements(log,"Bob")),[]);});
T("Podest: kaputte Merkliste crasht nicht",()=>{mem["gametab-achv-seen-v1"]="{kaputt";const m=two(["Anna"],base);
  assert(Array.isArray(A.achvForPodium([m],["Anna"],base+1)));});
T("Texte in allen 6 Sprachen",()=>{
  const ids=A.ACHV_DEFS.map(d=>d.id);const keys=["avSection","avSub","avNew","avOf","avLocked","avDone","avBronze","avSilver","avGold","avHint"];
  ids.forEach(i=>{const c=i.charAt(0).toUpperCase()+i.slice(1);keys.push("av"+c+"T","av"+c+"D");});
  ["de","en","fr","it","es","pt"].forEach(l=>{keys.forEach(k=>{assert(typeof TR[l][k]==="string"&&TR[l][k].length>0,l+"."+k+" fehlt");assert(!/[–—]/.test(TR[l][k]),l+"."+k+" Gedankenstrich");if(l==="de")assert(!/ß/.test(TR[l][k]),"ss statt ß in "+k);});});});
console.log(n+" bestanden, "+fails.length+" fehlgeschlagen");fails.forEach(f=>console.log("FAIL "+f));
process.exit(fails.length?1:0);
