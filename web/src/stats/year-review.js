// Erzeugt von tools/split.mjs aus index.html. Inhalt zwischen den gt-body-Markern ist 1:1 Originalcode.
import { React } from "../vendor/react-globals.js";
import { useEffect, useMemo, useRef, useState } from "../prelude.js";
import { gtRM } from "../shared/fx.js";
import { APP_LOGO_URI_GOLD } from "../assets/logo-data.js";
import { shellTokens } from "../themes/tokens.js";
import { GT_STATS } from "./core.js";
import { loadMatchLog } from "./match-log.js";
import { GT_EC_CJK } from "../export/result-card.js";
import { gtStxF, gtStxFit, gtStxFitLines, gtStxFonts, gtStxG, gtStxWrap } from "../export/schieber-sheet.js";
import { GT_SU_ACC, gtHexRgb, gtMixDark, gtRgbHex } from "../shared/setup-ui.js";
import { STATS_GAME_COLORS } from "./legacy-ui.js";
/*@gt-body-begin*//*GT_STATS_END*/
/*GT_YR_BEGIN*/
const GT_YR_SUIT={spade:"M12 2C9 6 4 9.5 4 13.5a4 4 0 0 0 6.5 3.1C10.3 18.8 9.5 20.5 8 22h8c-1.5-1.5-2.3-3.2-2.5-5.4A4 4 0 0 0 20 13.5C20 9.5 15 6 12 2z",heart:"M12 21C5 15.5 2 12 2 8.5A5 5 0 0 1 12 6a5 5 0 0 1 10 2.5c0 3.5-3 7-10 12.5z",diamond:"M12 2l7 10-7 10-7-10z",club:"M12 2a4.5 4.5 0 0 0-2.2 8.4A4.5 4.5 0 1 0 11 16.5c-.1 2-.8 3.7-2.2 5.5h6.4c-1.4-1.8-2.1-3.5-2.2-5.5a4.5 4.5 0 1 0 1.2-6.1A4.5 4.5 0 0 0 12 2z"};
const GT_YR_SUIT_ORDER=["spade","heart","diamond","club"];
function gtYrAccent(game,theme,fb){if(theme==="noir")return"#E8E8E8";const m=(typeof STATS_GAME_COLORS!=="undefined"&&STATS_GAME_COLORS[game])||(typeof GT_SU_ACC!=="undefined"&&GT_SU_ACC[game])||fb||"#C9A15C";if(theme==="light"){const c=gtHexRgb(m);return c?gtRgbHex(gtMixDark(c,0.32)):m;}return m;}
function gtYrRaw(game,theme,fb){if(theme==="noir")return"#E8E8E8";return(typeof STATS_GAME_COLORS!=="undefined"&&STATS_GAME_COLORS[game])||(typeof GT_SU_ACC!=="undefined"&&GT_SU_ACC[game])||fb||"#C9A15C";}
function gtYrA(hex,a){const c=gtHexRgb(hex);return c?"rgba("+c[0]+","+c[1]+","+c[2]+","+a+")":hex;}
function gtYrPal(theme){if(theme==="light")return{bg:"#F8F9FA",bg2:"#EDEFF2",ink:"#1A1D20",muted:"#5B6470",line:"rgba(26,29,32,0.16)",chip:"rgba(26,29,32,0.06)",glow:0.12,onAcc:"#FFFFFF",gold:"#8F6418"};if(theme==="vitrum")return{bg:"#0D1430",bg2:"#0A0F24",ink:"#F2F4F8",muted:"rgba(242,244,248,0.7)",line:"rgba(255,255,255,0.18)",chip:"rgba(255,255,255,0.09)",glow:0.3,onAcc:"#1A1408",gold:"#E0C589",vit:1};if(theme==="noir")return{bg:"#0A0A0A",bg2:"#050505",ink:"#EDEDED",muted:"#A5A5A5",line:"rgba(255,255,255,0.2)",chip:"#1E1E1E",glow:0.1,onAcc:"#111111",gold:"#C9C9C9"};return{bg:"#12141C",bg2:"#0B0C12",ink:"#F0F1F5",muted:"#8890A0",line:"rgba(240,241,245,0.16)",chip:"#1D212D",glow:0.26,onAcc:"#1A1408",gold:"#C9A15C"};}
function gtYrNames(c,map){if(!c)return[];const src=Array.isArray(c.people)?c.people:[];const out=src.map(p=>p&&typeof p==="object"?(p.name||p.key||""):((map&&map[p])||String(p))).filter(Boolean);return out.filter((n,k)=>out.indexOf(n)===k).slice(0,6);}
function gtYrVal(c){const v=c.value==null?"":String(c.value);return c.kind==="champion"&&/^\d+$/.test(v)?v+" %":v;}
function gtYrSplit(v){const s=String(v==null?"":v);const m=/^(\d{1,7})(\D*)$/.exec(s.trim());return m?{n:parseInt(m[1],10),suf:m[2]}:null;}
function gtYrValSize(len){return len<=2?44:len<=3?38:len<=5?27:len<=8?19:len<=12?13:10;}
function useGtYrTicker(target,run){const[v,setV]=useState(run&&!gtRM()?0:target);useEffect(()=>{if(!run||gtRM()||target<=0){setV(target);return;}let raf=0,t0=0;const D=Math.min(1100,500+target*8);const step=ts=>{if(!t0)t0=ts;const p=Math.min(1,(ts-t0)/D);setV(Math.round(target*(1-Math.pow(1-p,3))));if(p<1)raf=requestAnimationFrame(step);};setV(0);raf=requestAnimationFrame(step);return()=>cancelAnimationFrame(raf);},[target,run]);return v;}
function GtYrNum({value,style}){const sp=gtYrSplit(value);const n=useGtYrTicker(sp?sp.n:0,!!sp);if(!sp)return React.createElement("span",{style:style},String(value==null?"":value));const full=String(sp.n)+sp.suf;return React.createElement("span",{style:style,"aria-label":full},React.createElement("span",{"aria-hidden":"true",style:{fontVariantNumeric:"tabular-nums"}},String(n)+sp.suf));}
const GT_YR_CSS=".gtYR{position:fixed;left:0;top:0;right:0;height:100vh;height:100dvh;z-index:9600;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,.8);-webkit-tap-highlight-color:transparent;overscroll-behavior:contain;touch-action:manipulation;animation:gtYRfade .22s ease-out both}"+
"@media (display-mode:standalone){.gtYR{height:100vh}}"+
".gtYR-card{position:relative;width:100%;height:100%;overflow:hidden;container-type:inline-size;display:flex;flex-direction:column;user-select:none;-webkit-user-select:none;font-family:'Inter',system-ui,-apple-system,sans-serif;outline:none}"+
"@media (min-width:640px){.gtYR-card{width:auto;height:min(94%,880px);aspect-ratio:9/16;border-radius:28px;box-shadow:0 30px 80px rgba(0,0,0,.5)}}"+
".gtYR-in{animation:gtYRin .56s cubic-bezier(.23,1,.32,1) both}"+
".gtYR-glow{animation:gtYRfade .9s ease-out both}"+
".gtYR-drift{animation:gtYRdrift 9s ease-in-out infinite alternate}"+
".gtYR-zone{position:absolute;top:84px;bottom:0;border:0;padding:0;margin:0;background:transparent;cursor:pointer;z-index:1;-webkit-tap-highlight-color:transparent}"+
".gtYR-zone:focus-visible,.gtYR-btn:focus-visible{outline:2px solid currentColor;outline-offset:-4px}"+
".gtYR-btn{transition:transform .14s cubic-bezier(.23,1,.32,1),opacity .14s;cursor:pointer;-webkit-tap-highlight-color:transparent}"+
".gtYR-btn:active{transform:scale(.97)}"+
"@keyframes gtYRfade{from{opacity:0}to{opacity:1}}"+
"@keyframes gtYRin{from{opacity:0;transform:translate3d(0,16px,0)}to{opacity:1;transform:none}}"+
"@keyframes gtYRdrift{from{transform:translate3d(0,0,0) rotate(-12deg)}to{transform:translate3d(0,-14px,0) rotate(-12deg)}}"+
"@media (prefers-reduced-motion:reduce){.gtYR,.gtYR *{animation:none!important;transition:none!important}}";
function GtYearReview({t,theme,onClose,year}){
  const e=React.createElement;
  const yr=year||new Date().getFullYear();
  const pal=gtYrPal(theme);
  const tk=shellTokens(theme);
  const model=useMemo(()=>{try{const log=loadMatchLog();const o={t:t,now:new Date(),tournaments:GT_STATS.storeTournaments?GT_STATS.storeTournaments():[]};const m=GT_STATS.yearReview(log,yr,o);let nm={};try{nm=GT_STATS.build(log,{range:"year",year:yr,now:o.now,tournaments:o.tournaments,t:t}).names||{};}catch(_){}return m&&Array.isArray(m.cards)?Object.assign({},m,{nameMap:nm}):{year:yr,cards:[],nameMap:{}};}catch(err){try{console.warn("GameTab Rueckblick:",err);}catch(_){}return{year:yr,cards:[]};}},[yr]);
  const seq=useMemo(()=>{const cs=model.cards||[];if(!cs.length)return[{kind:"empty"}];return cs.concat([{kind:"share"}]);},[model]);
  const[i,setI]=useState(0);const[busy,setBusy]=useState(false);const[note,setNote]=useState("");
  const cardRef=useRef(null);const alive=useRef(true);const lastFocus=useRef(null);
  const n=seq.length;const cur=seq[Math.min(i,n-1)];
  const go=d=>setI(x=>Math.max(0,Math.min(n-1,x+d)));
  useEffect(()=>{alive.current=true;lastFocus.current=document.activeElement;try{cardRef.current&&cardRef.current.focus({preventScroll:true});}catch(_){}return()=>{alive.current=false;try{lastFocus.current&&lastFocus.current.focus&&lastFocus.current.focus({preventScroll:true});}catch(_){}};},[]);
  useEffect(()=>{const k=ev=>{if(ev.key==="Escape"){ev.preventDefault();onClose&&onClose();}else if(ev.key==="ArrowRight"){ev.preventDefault();go(1);}else if(ev.key==="ArrowLeft"){ev.preventDefault();go(-1);}};document.addEventListener("keydown",k);return()=>document.removeEventListener("keydown",k);},[n,onClose]);
  const game=cur.game||null;
  const acc=gtYrAccent(game,theme,pal.gold);const accRaw=gtYrRaw(game,theme,pal.gold);
  const fill=theme==="light"?acc:accRaw;
  const names=gtYrNames(cur,model.nameMap);
  const doShare=async()=>{if(busy)return;setBusy(true);setNote("");try{const cvs=await gtYearReviewImage(model,t,theme);const blobs=await Promise.all(cvs.map(c=>new Promise((res,rej)=>c.toBlob(b=>b?res(b):rej(Error("toBlob")),"image/png"))));const files=blobs.map((b,k)=>new File([b],"gametab-rueckblick-"+yr+"-"+(k+1)+".png",{type:"image/png"}));let done=false;try{if(navigator.share&&navigator.canShare&&navigator.canShare({files:files})){await navigator.share({files:files,title:"GameTab "+yr});done=true;}}catch(err){if(err&&err.name==="AbortError")done=true;}if(!done){files.forEach((f,k)=>setTimeout(()=>{const u=URL.createObjectURL(f);const a=document.createElement("a");a.href=u;a.download=f.name;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(u),4000);},k*350));if(alive.current)setNote(t("gtYrSaved"));}}catch(err){try{console.warn("GameTab Rueckblick Bild:",err);}catch(_){}if(alive.current)setNote(t("gtYrFail"));}if(alive.current)setBusy(false);};
  const cardBg=pal.vit?tk.pageBg:"linear-gradient(180deg,"+pal.bg+" 0%,"+pal.bg2+" 100%)";
  const d=k=>({animationDelay:(k*70)+"ms"});
  const closeBtn=e("button",{type:"button",className:"gtYR-btn",onClick:onClose,"aria-label":t("gtYrClose"),style:{width:44,height:44,borderRadius:22,border:"none",background:pal.chip,color:pal.ink,display:"flex",alignItems:"center",justifyContent:"center",position:"relative",zIndex:3,padding:0}},e("svg",{width:18,height:18,viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:2.2,strokeLinecap:"round","aria-hidden":"true"},e("path",{d:"M6 6l12 12M18 6L6 18"})));
  const bars=e("div",{"aria-hidden":"true",style:{display:"flex",gap:4,padding:"calc(env(safe-area-inset-top,0px) + 12px) 16px 0",position:"relative",zIndex:3}},seq.map((s,k)=>e("div",{key:k,style:{flex:1,height:3,borderRadius:2,background:k<=i?pal.ink:pal.line,opacity:k<=i?1:0.7,transition:"background .2s"}})));
  const head=e("div",{style:{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"8px 8px 0 20px",position:"relative",zIndex:3}},e("div",{style:{display:"flex",alignItems:"center",gap:8,color:pal.ink,fontWeight:800,fontSize:15,letterSpacing:"0.02em"}},e("span",{"aria-hidden":"true",style:{width:8,height:8,borderRadius:4,background:fill,display:"inline-block"}}),"GameTab",e("span",{style:{color:pal.muted,fontWeight:600}},String(yr))),closeBtn);
  let body;
  const eyebrow=(txt)=>e("div",{className:"gtYR-in",style:Object.assign({display:"flex",alignItems:"center",gap:10,fontSize:12,fontWeight:700,letterSpacing:"0.14em",textTransform:"uppercase",color:pal.muted},d(0))},e("span",{"aria-hidden":"true",style:{width:22,height:3,borderRadius:2,background:fill}}),txt);
  if(cur.kind==="empty"){
    body=e("div",{style:{flex:1,display:"flex",flexDirection:"column",justifyContent:"center",gap:14,padding:"0 28px 40px",position:"relative",zIndex:2,pointerEvents:"none"}},eyebrow(String(yr)),e("div",{className:"gtYR-in",style:Object.assign({fontSize:30,fontWeight:800,lineHeight:1.12,color:pal.ink,textWrap:"balance"},d(1))},t("gtYrEmpty")),e("div",{className:"gtYR-in",style:Object.assign({fontSize:16,lineHeight:1.5,color:pal.muted},d(2))},t("gtYrEmptyText")),e("button",{type:"button",className:"gtYR-btn",onClick:onClose,style:Object.assign({marginTop:10,minHeight:52,borderRadius:16,border:"none",background:fill,color:pal.onAcc,fontWeight:800,fontSize:16,fontFamily:"inherit",padding:"0 22px",alignSelf:"flex-start",pointerEvents:"auto"},d(3))},t("gtYrClose")));
  }else if(cur.kind==="share"){
    body=e("div",{style:{flex:1,display:"flex",flexDirection:"column",justifyContent:"center",gap:14,padding:"0 28px calc(env(safe-area-inset-bottom,0px) + 40px)",position:"relative",zIndex:3,pointerEvents:"none"}},eyebrow(String(yr)),e("div",{className:"gtYR-in",style:Object.assign({fontSize:38,fontWeight:800,lineHeight:1.05,letterSpacing:"-0.02em",color:pal.ink},d(1))},t("gtYrShareTitle")),e("div",{className:"gtYR-in",style:Object.assign({fontSize:16,lineHeight:1.5,color:pal.muted,maxWidth:"30ch"},d(2))},t("gtYrShareText")),e("div",{className:"gtYR-in",style:Object.assign({display:"flex",flexDirection:"column",gap:10,marginTop:12,pointerEvents:"auto"},d(3))},e("button",{type:"button",className:"gtYR-btn",onClick:doShare,disabled:busy,"aria-busy":busy,style:{minHeight:54,borderRadius:16,border:"none",background:fill,color:pal.onAcc,fontWeight:800,fontSize:16,fontFamily:"inherit",padding:"0 22px",opacity:busy?0.7:1}},busy?t("gtYrWorking"):t("gtYrShare")),e("button",{type:"button",className:"gtYR-btn",onClick:()=>{setNote("");setI(0);},style:{minHeight:48,borderRadius:16,border:"1px solid "+pal.line,background:"transparent",color:pal.ink,fontWeight:700,fontSize:15,fontFamily:"inherit",padding:"0 22px"}},t("gtYrAgain")),e("div",{role:"status","aria-live":"polite",style:{minHeight:20,fontSize:13,color:pal.muted}},note)));
  }else{
    const val=gtYrVal(cur);
    const vs=gtYrValSize(Array.from(val).length);
    body=e("div",{style:{flex:1,display:"flex",flexDirection:"column",justifyContent:"center",gap:12,padding:"0 28px 56px",position:"relative",zIndex:2,pointerEvents:"none"}},
      eyebrow(cur.title||""),
      e("div",{className:"gtYR-in",style:Object.assign({fontSize:Math.round(vs*3.6),lineHeight:0.95,fontWeight:800,letterSpacing:"-0.04em",color:pal.ink,wordBreak:"break-word",overflowWrap:"anywhere",textWrap:"balance",margin:"4px 0 2px"},d(1))},e(GtYrNum,{value:val,style:{fontSize:"clamp(40px,"+vs+"cqw,200px)"}})),
      cur.text?e("div",{className:"gtYR-in",style:Object.assign({fontSize:19,lineHeight:1.42,color:pal.ink,opacity:0.86,maxWidth:"28ch",textWrap:"pretty"},d(2))},cur.text):null,
      i===0?e("div",{className:"gtYR-in",style:Object.assign({fontSize:13,color:pal.muted,marginTop:18,display:"flex",alignItems:"center",gap:8},d(4))},e("svg",{width:16,height:16,viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:2.2,strokeLinecap:"round",strokeLinejoin:"round","aria-hidden":"true"},e("path",{d:"M9 5l7 7-7 7"})),t("gtYrTapHint")):null,
      names.length?e("div",{className:"gtYR-in",style:Object.assign({display:"flex",flexWrap:"wrap",gap:8,marginTop:10},d(3))},names.map((nm,k)=>e("span",{key:k,style:{padding:"9px 16px",borderRadius:999,background:pal.chip,border:"1px solid "+pal.line,color:pal.ink,fontWeight:700,fontSize:15,maxWidth:"100%",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}},nm))):null);
  }
  const suitIdx=cur.kind==="empty"||cur.kind==="share"?0:(i%4);
  const suit=e("div",{"aria-hidden":"true",style:{position:"absolute",right:"-18%",bottom:"-6%",width:"86%",aspectRatio:"1",pointerEvents:"none",zIndex:0}},e("div",{className:"gtYR-drift",style:{width:"100%",height:"100%"}},e("svg",{viewBox:"0 0 24 24",width:"100%",height:"100%"},e("path",{d:GT_YR_SUIT[GT_YR_SUIT_ORDER[suitIdx]],fill:gtYrA(accRaw,theme==="light"?0.1:0.09)}))));
  const glow=e("div",{key:"g"+i,className:"gtYR-glow","aria-hidden":"true",style:{position:"absolute",left:0,top:0,right:0,bottom:0,pointerEvents:"none",zIndex:0,background:"radial-gradient(120% 55% at 50% 0%,"+gtYrA(accRaw,pal.glow)+" 0%,transparent 72%)"}});
  const zonesOn=cur.kind!=="empty";
  return e("div",{className:"gtYR",role:"dialog","aria-modal":"true","aria-label":t("gtYrAria").replace("{year}",String(yr)),onClick:ev=>{if(ev.target===ev.currentTarget)onClose&&onClose();}},
    e("style",null,GT_YR_CSS),
    e("div",{className:"gtYR-card",ref:cardRef,tabIndex:-1,style:{background:cardBg,color:pal.ink}},
      glow,suit,bars,head,
      e("div",{key:i,style:{flex:1,display:"flex",flexDirection:"column",minHeight:0,position:"relative"}},body),
      zonesOn&&i>0?e("button",{type:"button",className:"gtYR-zone","aria-label":t("gtYrPrev"),onClick:()=>go(-1),style:{left:0,width:"32%",color:pal.ink}}):null,
      zonesOn&&i<n-1?e("button",{type:"button",className:"gtYR-zone","aria-label":t("gtYrNext"),onClick:()=>go(1),style:{right:0,width:i>0?"68%":"100%",color:pal.ink}}):null,
      e("div",{className:"gtYR-sr",role:"status","aria-live":"polite",style:{position:"absolute",width:1,height:1,overflow:"hidden",clip:"rect(0 0 0 0)",whiteSpace:"nowrap"}},t("gtYrCardOf").replace("{n}",String(i+1)).replace("{m}",String(n)))));
}
/* Bild-Export: 1080x1920 je Karte, Fonts aus fonts/, keine Emoji, Kartenzeichen als Pfade */
let gtYrLogoP=null;
function gtYrLogo(){if(!gtYrLogoP)gtYrLogoP=new Promise(res=>{try{const im=new Image();im.onload=()=>res(im);im.onerror=()=>res(null);im.src=APP_LOGO_URI_GOLD;}catch(_){res(null);}});return gtYrLogoP;}
function gtYrRR(x,l,t,w,h,r){x.beginPath();x.moveTo(l+r,t);x.lineTo(l+w-r,t);x.arcTo(l+w,t,l+w,t+r,r);x.lineTo(l+w,t+h-r);x.arcTo(l+w,t+h,l+w-r,t+h,r);x.lineTo(l+r,t+h);x.arcTo(l,t+h,l,t+h-r,r);x.lineTo(l,t+r);x.arcTo(l,t,l+r,t,r);x.closePath();}
function gtYrDraw(spec,theme,logo){
  const W=1080,H=1920,M=84,F=gtStxF;const pal=gtYrPal(theme);
  const cv=document.createElement("canvas");cv.width=W;cv.height=H;const x=cv.getContext("2d");x.textBaseline="alphabetic";x.direction="ltr";
  const accRaw=gtYrRaw(spec.game,theme,pal.gold);const acc=gtYrAccent(spec.game,theme,pal.gold);const fill=theme==="light"?acc:accRaw;
  /* Hintergrund */
  if(pal.vit){let g=x.createLinearGradient(0,0,W*0.35,H);g.addColorStop(0,"#16204A");g.addColorStop(0.52,"#0D1430");g.addColorStop(1,"#0A0F24");x.fillStyle=g;x.fillRect(0,0,W,H);
    [[W*0.12,-H*0.03,1300,"rgba(120,110,255,0.40)"],[W*1.08,H*0.32,1100,"rgba(84,132,255,0.30)"],[-W*0.05,H*1.04,1300,"rgba(38,200,186,0.24)"]].forEach(b=>{const r=x.createRadialGradient(b[0],b[1],0,b[0],b[1],b[2]);r.addColorStop(0,b[3]);r.addColorStop(1,"rgba(0,0,0,0)");x.fillStyle=r;x.fillRect(0,0,W,H);});}
  else{const g=x.createLinearGradient(0,0,0,H);g.addColorStop(0,pal.bg);g.addColorStop(1,pal.bg2);x.fillStyle=g;x.fillRect(0,0,W,H);}
  const gl=x.createRadialGradient(W/2,0,0,W/2,0,1250);gl.addColorStop(0,gtYrA(accRaw,pal.glow));gl.addColorStop(1,gtYrA(accRaw,0));x.fillStyle=gl;x.fillRect(0,0,W,H);
  /* Kartenzeichen als Pfad */
  x.save();x.translate(W*0.52,H*0.58);x.rotate(-12*Math.PI/180);x.scale(36,36);x.fillStyle=gtYrA(accRaw,theme==="light"?0.1:0.085);x.fill(new Path2D(GT_YR_SUIT[GT_YR_SUIT_ORDER[(spec.idx||0)%4]]));x.restore();
  /* Fortschritt wie Stories */
  const tot=spec.total,gap=10,bw=(W-2*M-(tot-1)*gap)/tot;for(let k=0;k<tot;k++){gtYrRR(x,M+k*(bw+gap),64,bw,8,4);x.fillStyle=k<=spec.idx?pal.ink:pal.line;x.fill();}
  /* Kopf */
  let hx=M;
  if(logo&&logo.naturalWidth){const lh=60,lw=lh*logo.naturalWidth/logo.naturalHeight;const oc=document.createElement("canvas");oc.width=Math.round(lw);oc.height=lh;const o=oc.getContext("2d");o.drawImage(logo,0,0,oc.width,lh);o.globalCompositeOperation="source-in";o.fillStyle=fill;o.fillRect(0,0,oc.width,lh);x.drawImage(oc,hx,112);hx+=lw+22;}
  x.font=F.inter(800,46);x.fillStyle=pal.ink;x.fillText("GameTab",hx,160);
  x.font=F.inter(600,46);x.fillStyle=pal.muted;x.textAlign="right";x.fillText(String(spec.year),W-M,160);x.textAlign="left";
  /* Inhalt messen */
  const maxW=W-2*M;const lines=[];let stack=0;
  const eb=String(spec.eyebrow||"").toUpperCase();
  const ebF=F.mono(600,34),ebLS=5;x.font=ebF;
  const ebLines=gtStxWrap(x,eb,maxW-90,ebF,ebLS).slice(0,2);const ebH=ebLines.length*50;stack+=ebH+46;
  const val=String(spec.value==null?"":spec.value);const vlen=Array.from(val).length;
  let vFont,vLines,vLH,vSize;
  if(vlen<=9){vSize=gtStxFit(x,val,maxW,s=>F.inter(800,s),vlen<=3?560:vlen<=5?420:300,110);vFont=F.inter(800,vSize);vLines=[val];vLH=vSize*0.86;}
  else{const r=gtStxFitLines(x,val,maxW,s=>F.inter(800,s),170,84,4,3);vSize=r.s;vFont=F.inter(800,vSize);vLines=r.l;vLH=vSize*1.04;}
  const vH=vLines.length===1?vSize*0.74:vLH*vLines.length;stack+=vH+70;
  let tLines=[],tSize=54,tLH=0;
  if(spec.text){const r=gtStxFitLines(x,String(spec.text),maxW,s=>F.inter(600,s),56,38,2,7);tSize=r.s;tLines=r.l;tLH=tSize*1.38;stack+=tLines.length*tLH+36;}
  const pills=[];let pH=0;
  if(spec.names&&spec.names.length){x.font=F.inter(700,40);let row=[],rw=0;const rows=[];spec.names.forEach(nm=>{let s=String(nm);while(x.measureText(s).width>maxW-72&&s.length>2)s=s.slice(0,-1);if(s!==nm)s=s.replace(/\s+$/,"")+"...";const w=x.measureText(s).width+72;if(row.length&&rw+14+w>maxW){rows.push(row);row=[];rw=0;}row.push({s:s,w:w});rw+=(row.length>1?14:0)+w;});if(row.length)rows.push(row);rows.slice(0,3).forEach(r=>pills.push(r));pH=pills.length*(84+14);stack+=pH+20;}
  let y=Math.max(300,Math.round((H-stack)/2)-40);
  /* Eyebrow */
  x.fillStyle=fill;gtYrRR(x,M,y+8,56,8,4);x.fill();
  x.font=ebF;x.fillStyle=pal.muted;ebLines.forEach((ln,k)=>{let px=M+80;gtStxG(ln).forEach(g=>{x.fillText(g,px,y+30+k*50);px+=x.measureText(g).width+ebLS;});});
  y+=ebH+46;
  /* Wert */
  x.font=vFont;x.fillStyle=pal.ink;
  if(vLines.length===1){y+=vSize*0.74;x.fillText(vLines[0],M-6,y);y+=70;}else{vLines.forEach((ln,k)=>x.fillText(ln,M-4,y+vSize*0.82+k*vLH));y+=vH+70;}
  /* Satz */
  if(tLines.length){x.font=F.inter(600,tSize);x.fillStyle=pal.ink;x.globalAlpha=0.88;tLines.forEach((ln,k)=>x.fillText(ln,M,y+tSize*0.9+k*tLH));x.globalAlpha=1;y+=tLines.length*tLH+36;}
  /* Namen */
  pills.forEach(r=>{let px=M;r.forEach(p=>{gtYrRR(x,px,y+4,p.w,84,42);x.fillStyle=pal.chip;x.fill();x.lineWidth=2;x.strokeStyle=pal.line;x.stroke();x.font=F.inter(700,40);x.fillStyle=pal.ink;x.fillText(p.s,px+36,y+4+56);px+=p.w+14;});y+=84+14;});
  /* Fuss */
  x.font=F.mono(600,30);x.fillStyle=pal.muted;x.textAlign="left";x.fillText("gametab",M,H-96);x.textAlign="right";x.fillText((spec.idx+1)+" / "+tot,W-M,H-96);x.textAlign="left";
  return cv;
}
function gtYearReviewImage(model,t,theme){
  const yr=(model&&model.year)||new Date().getFullYear();const cs=(model&&Array.isArray(model.cards)?model.cards:[]);
  const nm=(model&&model.nameMap)||{};const specs=cs.map(c=>({eyebrow:c.title||"",value:gtYrVal(c),text:c.text||"",names:gtYrNames(c,nm),game:c.game||null,year:yr}));
  specs.forEach((s,k)=>{s.idx=k;s.total=specs.length;});
  const all=specs.map(s=>[s.eyebrow,s.value,s.text].concat(s.names||[]).join(" ")).join(" ");
  return Promise.all([gtStxFonts(GT_EC_CJK.test(all)),gtYrLogo()]).then(r=>{const logo=r[1];return specs.map(s=>gtYrDraw(s,theme,logo));});
}/*@gt-body-end*/
export { GT_YR_SUIT, GT_YR_SUIT_ORDER, gtYrAccent, gtYrRaw, gtYrA, gtYrPal, gtYrNames, gtYrVal, gtYrSplit, gtYrValSize, useGtYrTicker, GtYrNum, GT_YR_CSS, GtYearReview, gtYrLogoP, gtYrLogo, gtYrRR, gtYrDraw, gtYearReviewImage };
