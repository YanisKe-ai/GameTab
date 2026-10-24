// Erfolge (Abzeichen). Reine Funktionen: alles wird aus dem Match-Log berechnet, nichts wird gespeichert.
// Einzige Ausnahme: die Merkliste "schon gesehen" (localStorage, nur fuer die Neu-Markierung).
/*@gt-body-begin*/
/*GT_ACH_BEGIN*/
const ACHV_SEEN_KEY="gametab-achv-seen-v1";
function achvNorm(name){let s=typeof name==="string"?name:(name==null?"":String(name));try{s=s.normalize("NFC");}catch(e){}return s.replace(/\s+/g," ").trim().toLowerCase();}
function achvNames(v){return Array.isArray(v)?v.map(achvNorm):[];}
function achvNight(ts){const d=new Date(ts);if(d.getHours()<5)d.setDate(d.getDate()-1);return d.getFullYear()+"-"+d.getMonth()+"-"+d.getDate();}
// Eigene, nicht-Team-Teilnahme einer Person
function achvPart(m,norm){if(!m||!Array.isArray(m.participants))return null;return m.participants.find(p=>p&&p.isTeam!==true&&(p.norm||achvNorm(p.name))===norm)||null;}
function achvWon(m,norm){if(Array.isArray(m.winners)&&m.winners.length)return m.winners.some(w=>achvNorm(w)===norm);return!!m.winner&&achvNorm(m.winner)===norm;}
function achvDecided(m){return(Array.isArray(m.winners)&&m.winners.length>0)||!!m.winner;}
function achvCtx(matches,norm){
  const mine=(matches||[]).filter(m=>m&&typeof m.ts==="number"&&achvPart(m,norm)).sort((a,b)=>a.ts-b.ts);
  const won=mine.map(m=>achvWon(m,norm));
  const games=new Set(),gamesWon=new Set(),perGameWins={},nights={},co=new Set();
  let streak=0,bestStreak=0,lossRun=0,comeback=false,shared=false;
  mine.forEach((m,i)=>{
    games.add(m.game);
    const n=achvNight(m.ts);nights[n]=(nights[n]||0)+1;
    m.participants.forEach(p=>{if(p&&p.isTeam!==true&&(p.norm||achvNorm(p.name))!==norm)co.add(p.norm||achvNorm(p.name));});
    if(won[i]){
      gamesWon.add(m.game);perGameWins[m.game]=(perGameWins[m.game]||0)+1;
      streak++;if(streak>bestStreak)bestStreak=streak;
      if(lossRun>=3)comeback=true;lossRun=0;
      if(Array.isArray(m.winners)&&m.winners.length>1)shared=true;
    }else{streak=0;if(achvDecided(m))lossRun++;}
  });
  const has=(m,key)=>achvNames(m[key]).includes(norm);
  return{
    mine,played:mine.length,wins:won.filter(Boolean).length,bestStreak,
    gamesWon:gamesWon.size,gamesPlayed:games.size,comeback,shared,
    maxNight:Object.keys(nights).reduce((a,k)=>Math.max(a,nights[k]),0),nightCount:Object.keys(nights).length,
    coPlayers:co.size,bestGameWins:Object.keys(perGameWins).reduce((a,k)=>Math.max(a,perGameWins[k]),0),
    skyjoNeg:mine.some(m=>{const p=achvPart(m,norm);return m.game==="skyjo"&&p&&typeof p.score==="number"&&p.score<0;}),
    yatzy300:mine.some(m=>{const p=achvPart(m,norm);return m.game==="yatzy"&&p&&typeof p.score==="number"&&p.score>=300;}),
    ace:mine.some(m=>m.game==="minigolf"&&has(m,"aces")),
    perfect:mine.some(m=>m.game==="wizard"&&has(m,"perfect")),
    flip7:mine.some(m=>m.game==="flip7"&&has(m,"flip7")),
  };
}
// id, glyph (Symbolname fuer das Abzeichen), tiers (Schwellen, 1 bis 3 Stufen), v (Fortschrittswert), bool: nur ja/nein
const ACHV_DEFS=[
  {id:"first",glyph:"flag",tiers:[1],bool:true,v:c=>c.played>=1?1:0},
  {id:"played",glyph:"cards",tiers:[10,50,100],v:c=>c.played},
  {id:"wins",glyph:"cup",tiers:[1,5,25],v:c=>c.wins},
  {id:"streak",glyph:"flame",tiers:[3,5,8],v:c=>c.bestStreak},
  {id:"allround",glyph:"grid",tiers:[3,5,8],v:c=>c.gamesWon},
  {id:"explorer",glyph:"compass",tiers:[3,6,10],v:c=>c.gamesPlayed},
  {id:"specialist",glyph:"target",tiers:[5,10,20],v:c=>c.bestGameWins},
  {id:"evening",glyph:"moon",tiers:[3,5,8],v:c=>c.maxNight},
  {id:"loyal",glyph:"calendar",tiers:[5,15,30],v:c=>c.nightCount},
  {id:"social",glyph:"people",tiers:[3,8,15],v:c=>c.coPlayers},
  {id:"comeback",glyph:"rise",tiers:[1],bool:true,v:c=>c.comeback?1:0},
  {id:"shared",glyph:"pair",tiers:[1],bool:true,v:c=>c.shared?1:0},
  {id:"skyjoNeg",glyph:"below",game:"skyjo",tiers:[1],bool:true,v:c=>c.skyjoNeg?1:0},
  {id:"yatzy300",glyph:"dice",game:"yatzy",tiers:[1],bool:true,v:c=>c.yatzy300?1:0},
  {id:"ace",glyph:"hole",game:"minigolf",tiers:[1],bool:true,v:c=>c.ace?1:0},
  {id:"perfect",glyph:"hat",game:"wizard",tiers:[1],bool:true,v:c=>c.perfect?1:0},
  {id:"flip7",glyph:"seven",game:"flip7",tiers:[1],bool:true,v:c=>c.flip7?1:0},
];
// Stufenfarbe: Bronze, Silber, Gold. Einstufige Erfolge zaehlen als Gold (Spezialleistung) bzw. Bronze (Einstieg).
const ACHV_TIER_NAMES=["bronze","silver","gold"];
function achvTierName(def,level){if(def.tiers.length===1)return def.game||def.id==="comeback"?"gold":def.id==="shared"?"silver":"bronze";return ACHV_TIER_NAMES[Math.min(2,Math.max(0,level-1))];}
function computeAchievements(matches,name){
  const norm=achvNorm(name);const c=achvCtx(matches,norm);
  return ACHV_DEFS.map(def=>{
    const value=def.v(c);let level=0;def.tiers.forEach(n=>{if(value>=n)level++;});
    const maxed=level>=def.tiers.length;const next=maxed?null:def.tiers[level];
    return{id:def.id,glyph:def.glyph,game:def.game||null,bool:!!def.bool,tiers:def.tiers.slice(),value,level,maxed,next,
      target:next!=null?next:def.tiers[def.tiers.length-1],unlocked:level>0,tier:achvTierName(def,Math.max(1,level))};
  });
}
function achvKeys(list){const o=[];list.forEach(a=>{for(let l=1;l<=a.level;l++)o.push(a.id+":"+l);});return o;}
// Jüngste Partie der Person und Erfolgsschluessel ohne diese Partie
function achvSplit(matches,norm){
  const mine=(matches||[]).filter(m=>m&&typeof m.ts==="number"&&achvPart(m,norm)).sort((a,b)=>a.ts-b.ts);
  if(!mine.length)return null;const last=mine[mine.length-1];
  return{last,before:achvKeys(computeAchievements((matches||[]).filter(m=>m!==last),norm))};
}
// Neu freigeschaltet durch die jüngste Partie dieser Person (nur wenn sie hoechstens 10 Minuten alt ist)
function achvNewFromLast(matches,name,now){
  const norm=achvNorm(name);if(!norm)return[];
  const sp=achvSplit(matches,norm);if(!sp)return[];
  if(typeof now==="number"&&now-sp.last.ts>10*60*1000)return[];
  const before=new Set(sp.before);const out=[];
  computeAchievements(matches,norm).forEach(a=>{for(let l=1;l<=a.level;l++){if(!before.has(a.id+":"+l))out.push({id:a.id,level:l,glyph:a.glyph,multi:a.tiers.length>1,tier:a.tiers.length===1?a.tier:ACHV_TIER_NAMES[l-1],key:a.id+":"+l});}});
  return out;
}
function achvLoadSeen(){try{const v=JSON.parse(localStorage.getItem(ACHV_SEEN_KEY)||"null");return v&&typeof v==="object"&&!Array.isArray(v)?v:{};}catch(e){return{};}}
function achvSaveSeen(o){try{localStorage.setItem(ACHV_SEEN_KEY,JSON.stringify(o));}catch(e){}}
// Gibt die noch nicht gesehenen Schluessel zurueck. Fehlt die Person in der Merkliste, gilt der Bestand als gesehen (keine Flut beim ersten Mal).
function achvUnseen(name,list){const norm=achvNorm(name);const seen=achvLoadSeen();const keys=achvKeys(list);if(!Array.isArray(seen[norm])){seen[norm]=keys;achvSaveSeen(seen);return[];}return keys.filter(k=>seen[norm].indexOf(k)<0);}
function achvMarkSeen(name,keys){const norm=achvNorm(name);const seen=achvLoadSeen();const cur=Array.isArray(seen[norm])?seen[norm]:[];const add=keys.filter(k=>cur.indexOf(k)<0);if(!add.length)return;seen[norm]=cur.concat(add);achvSaveSeen(seen);}
// Fuer das Podest: neue Erfolge der Beteiligten, noch nicht angezeigt. Merkt sie als gesehen.
function achvForPodium(matches,names,now){
  const out=[];const done={};
  (names||[]).forEach(nm=>{const norm=achvNorm(nm);if(!norm||done[norm])return;done[norm]=1;
    const fresh=achvNewFromLast(matches,nm,now);if(!fresh.length)return;
    const seen=achvLoadSeen();
    if(!Array.isArray(seen[norm])){seen[norm]=achvSplit(matches,norm).before;achvSaveSeen(seen);}
    const cur=achvLoadSeen()[norm]||[];
    const show=fresh.filter(f=>cur.indexOf(f.key)<0);
    if(show.length){achvMarkSeen(nm,show.map(f=>f.key));show.forEach(f=>out.push({name:String(nm),id:f.id,level:f.level,glyph:f.glyph,tier:f.tier,multi:f.multi}));}
  });
  return out;
}
/*GT_ACH_END*/
/*@gt-body-end*/
export { ACHV_DEFS, ACHV_SEEN_KEY, computeAchievements, achvNorm, achvKeys, achvNewFromLast, achvUnseen, achvMarkSeen, achvForPodium };
