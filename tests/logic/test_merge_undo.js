// Paket U3: mergeNames (inkl. Gruppen, gesehene Erfolge, Rueckgaengig), deleteMatchUndo/restoreMatch: node tests/logic/test_merge_undo.js
const assert=require("assert/strict");
const src=require("../lib/source.js").getSource(process.argv[2]);
const cut=(a,b)=>{const i=src.indexOf(a),j=src.indexOf(b);assert(i>=0&&j>i,"Marker fehlt: "+a);return src.slice(i,j);};
const GTRK=cut("/*GT_RANK_BEGIN*/","/*GT_RANK_END*/");
let mem={};
const LS={getItem:k=>(k in mem?mem[k]:null),setItem:(k,v)=>{mem[k]=String(v);},removeItem:k=>{delete mem[k];}};
const SS={getItem:()=>null,setItem:()=>{}};
const events=[];
const WIN={dispatchEvent:e=>{events.push(e.type);}};
class Ev{constructor(t){this.type=t;}}
const pre=GTRK+';function gtIsObj(v){return v!==null&&typeof v==="object"&&!Array.isArray(v);}function gtNum(v){if(typeof v==="number")return isFinite(v)?v:null;return null;}function gtIsQuotaErr(){return false;}function gtStorageFullNotice(){}function gtMatchHasData(){return false;}function gtPadDone(){return false;}const GT_MATCH_IDS={};const GT_MATCH_GAME={};const STORAGE_KEY="x";';
const F=new Function("localStorage","sessionStorage","window","Event",pre+";"+cut("/*GT_PS_BEGIN*/","/*GT_PS_END*/")+";return{mergeNames,deleteMatchUndo,restoreMatch,deleteMatch,gtClearResults,loadMatchLogRaw,normalizeName};")(LS,SS,WIN,Ev);
let n=0;const fails=[];
function T(name,fn){mem={};events.length=0;try{fn();n++;}catch(e){fails.push(name+": "+(e.message||e).split("\n")[0]);}}
const P=(name,rank)=>({name,norm:F.normalizeName(name),score:null,rank});
const M=(id,ps,winner,extra)=>Object.assign({id,ts:1700000000000+id.length,game:"freeplay",status:"done",participants:ps,winner},extra||{});
function seed(){
  const log=[M("m1",[P("anna",1),P("Ben",2)],"anna"),M("m2",[P("Anna",1),P("Ben",2),P("Cleo",3)],"Anna"),M("m3",[P("anna",1),P("Anna",1)],"anna",{winners:["anna","Anna"]}),M("m4",[P("Ben",1),P("Cleo",2)],"Ben")];
  mem.gt_matchLog=JSON.stringify(log);
  mem.gt_playerGroups=JSON.stringify([{id:1,name:"A",players:["anna","Ben"]},{id:2,name:"B",players:["Anna","ANNA","Cleo"]},{id:3,name:"C",players:["Ben","Cleo"]}]);
  mem["gametab-achv-seen-v1"]=JSON.stringify({anna:["a1","a2"],anna2:["x"]});
  mem.gt_achSeen=JSON.stringify({anna:["q"]});
  mem.schieberTournamentsMarker="unveraendert";
}
T("mergeNames ersetzt Namen in Partien und dedupliziert",()=>{seed();F.mergeNames("anna","Annie");const log=JSON.parse(mem.gt_matchLog);assert.deepEqual(log[0].participants.map(p=>p.name),["Annie","Ben"]);assert.equal(log[0].winner,"Annie");assert.equal(log[2].participants.length,1);assert.deepEqual(log[2].winners,["Annie"]);});
T("mergeNames aendert Gruppen (Ersetzen und Duplikate je Gruppe)",()=>{seed();F.mergeNames("anna","Annie");const g=JSON.parse(mem.gt_playerGroups);assert.deepEqual(g[0].players,["Annie","Ben"]);assert.deepEqual(g[1].players,["Annie","Cleo"]);assert.deepEqual(g[2].players,["Ben","Cleo"]);assert(events.includes("gt-groups"));});
T("mergeNames schluesselt gesehene Erfolge um",()=>{seed();F.mergeNames("anna","Bert");const o=JSON.parse(mem["gametab-achv-seen-v1"]);assert(!("anna" in o));assert.deepEqual(o.bert,["a1","a2"]);assert.deepEqual(o.anna2,["x"]);assert.deepEqual(JSON.parse(mem.gt_achSeen),{bert:["q"]});});
T("mergeNames fasst gesehene Erfolge zusammen, wenn Ziel schon existiert",()=>{seed();mem.gt_achSeen=JSON.stringify({anna:["q","r"],bert:["r","s"]});F.mergeNames("anna","Bert");assert.deepEqual(JSON.parse(mem.gt_achSeen),{bert:["r","s","q"]});});
T("Rueckgaengig stellt Partien, Gruppen und Erfolge her",()=>{seed();const before={...mem};const undo=F.mergeNames("anna","Annie");assert.equal(typeof undo,"function");assert.notEqual(mem.gt_matchLog,before.gt_matchLog);assert.equal(undo(),true);for(const k of["gt_matchLog","gt_playerGroups","gametab-achv-seen-v1","gt_achSeen","schieberTournamentsMarker"])assert.equal(mem[k],before[k],k);});
T("Rueckgaengig entfernt neu entstandene Schluessel wieder",()=>{seed();delete mem.gt_achSeen;const undo=F.mergeNames("anna","Annie");undo();assert(!("gt_achSeen" in mem));});
T("Rueckgaengig verweigert, wenn danach eine Partie dazukam",()=>{seed();const undo=F.mergeNames("anna","Annie");const log=JSON.parse(mem.gt_matchLog);log.push(M("m9",[P("Zoe",1)],"Zoe"));mem.gt_matchLog=JSON.stringify(log);const keep=mem.gt_matchLog;assert.equal(undo(),false);assert.equal(mem.gt_matchLog,keep);});
T("mergeNames mit gleichem Namen tut nichts",()=>{seed();assert.equal(F.mergeNames("anna","ANNA"),undefined);});
T("Turniere (App-Zustand) bleiben unveraendert",()=>{seed();mem["spieleblock-app-state-v1"]='{"schieberTournaments":[{"teams":["anna"]}]}';const s=mem["spieleblock-app-state-v1"];F.mergeNames("anna","Anna");assert.equal(mem["spieleblock-app-state-v1"],s);});
T("deleteMatchUndo gibt Rohobjekt und Index, restoreMatch fuegt an alter Stelle ein",()=>{seed();const raw=JSON.parse(mem.gt_matchLog);const u=F.deleteMatchUndo("m2");assert.equal(u.index,1);assert.deepEqual(u.match,raw[1]);assert.equal(JSON.parse(mem.gt_matchLog).length,3);assert.equal(F.restoreMatch(u),true);assert.deepEqual(JSON.parse(mem.gt_matchLog),raw);});
T("restoreMatch doppelt tut nichts, Unbekanntes gibt null",()=>{seed();const u=F.deleteMatchUndo("m1");F.restoreMatch(u);assert.equal(F.restoreMatch(u),false);assert.equal(JSON.parse(mem.gt_matchLog).length,4);assert.equal(F.deleteMatchUndo("nope"),null);});
T("deleteMatch gibt weiter die normalisierte Liste zurueck",()=>{seed();const l=F.deleteMatch("m4");assert.equal(l.length,3);assert(l.every(m=>m.participants[0].norm));});
T("gtClearResults leert Log, Zaehler, Podest- und Erfolgs-Merker, nicht die Gruppen",()=>{seed();mem.gt_totalGamesPlayed="9";mem.gt_podiumSeen='["x"]';F.gtClearResults();for(const k of["gt_matchLog","gt_totalGamesPlayed","gt_podiumSeen","gametab-achv-seen-v1","gt_achSeen"])assert(!(k in mem),k);assert("gt_playerGroups" in mem);assert(events.includes("gt-count"));});
if(fails.length){console.log("FEHLER:\n"+fails.join("\n"));process.exit(1);}
console.log("test_merge_undo OK ("+n+" Faelle)");
