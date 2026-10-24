// Erzeugt von tools/split.mjs aus index.html. Inhalt zwischen den gt-body-Markern ist 1:1 Originalcode.
import { React } from "../../vendor/react-globals.js";
import { Fragment, useEffect, useMemo, useRef, useState } from "../../prelude.js";
import { GLOBAL_STYLES } from "../../styles/global.js";
import { useT } from "../../i18n/use-t.js";
import { shellTokens } from "../../themes/tokens.js";
import { hapticTap } from "../../shared/sound.js";
import { GtStExportSheet } from "../../export/schieber-sheet.js";
import { pageShellStyle } from "../../shared/top-bar.js";
import { showcaseAccent } from "../../app/start.js";
import { GameHeader } from "../../shared/game-header.js";
import { GT_ST, GT_ST_STORE, useGtStStore } from "./tournament-core.js";
import { useSavedGroups } from "../../shared/groups.js";
import { gtCR, gtHexRgb, gtSkin } from "../../shared/setup-ui.js";
/*@gt-body-begin*/
/*GT_ST_END*/
/*GT_STU_BEGIN*/
const{SchieberTournament,GtStuLogo}=(function(){
const H=React.createElement;
let UID="app:dark";
function stuT(theme){return["light","vitrum","noir"].includes(theme)?theme:"dark";}
function stuSkin(theme){const T=stuT(theme);const tk=shellTokens(T);return gtSkin(T,tk,"jass",T==="noir"?{}:{acc:T==="light"?"#D52B1E":"#F0584A"});}
function stuAvPal(d){const T=String(d||"").slice(4);return T==="light"?["#B8241A","#1D5FA8","#2F6B52","#7A5512","#6A43A8","#4A5260"]:T==="noir"?["#EDEDED","#BDBDBD","#9A9A9A","#D6D6D6","#ABABAB","#C8C8C8"]:["#F0584A","#7DB7F0","#5FB58C","#E0BA72","#B89BE6","#AEB5B9"];}
function stuRoot(theme){const T=stuT(theme);const s=stuSkin(T);const L=T==="light",V=T==="vitrum",N=T==="noir";const a=s.txt;const al=(x,h)=>/^#[0-9a-fA-F]{6}$/.test(x)?x+h:x;
const solid=L?"#FFFFFF":V?"#1A1E2B":N?"#161616":"#1C1F29";
const v={"--st-hink":s.ink,"--st-hmuted":s.muted,"--st-uline":a,"--st-live":a,"--st-title-font":"800 30px/1.1 'Baloo 2',sans-serif","--st-title-track":"-0.01em","--st-data":"'Inter',sans-serif","--st-ui":"'Inter',sans-serif",
"--st-body":"transparent","--st-body-solid":solid,"--st-body-r":"0","--st-body-pad":"0","--st-body-border":"none","--st-body-shadow":"none",
"--st-panel":s.card,"--st-pline":s.border,"--st-pshadow":s.shadow,"--st-ink":s.ink,"--st-muted":s.muted,"--st-bline":L?"rgba(24,22,32,0.2)":"rgba(255,255,255,0.2)","--st-rline":s.border,
"--st-accent":s.fill,"--st-on-accent":s.on,"--st-accent-soft":al(s.fill,"1F"),"--st-focus":a,"--st-danger":N?s.ink:L?"#B42318":"#FF8A7A","--st-field":L?"#FFFFFF":N?"#141414":"rgba(255,255,255,0.05)","--st-ph":s.muted,"--st-hover":L?"rgba(24,22,32,0.05)":"rgba(255,255,255,0.06)",
"--st-tabgap":"0","--st-tabpad":"0","--st-tabbg":"transparent","--st-tabr":"6px","--st-tabline":"1px solid "+s.border,"--st-tabon-ink":s.ink,"--st-tabon-bg":"transparent",
"--st-lead":al(s.fill,"14"),"--st-lead-ink":a,"--st-pt":s.ink,"--st-pos":a,"--st-chalk":s.ink,"--st-self":L?"#EEF0F3":"rgba(255,255,255,0.07)",
"--st-leadbox":s.card,"--st-leadbox-ink":s.ink,"--st-leadbox-cap":a,"--st-leadbox-line":"1px solid "+s.border,"--st-lname-font":"800 24px/1.15 'Baloo 2',sans-serif",
"--st-sel":al(s.fill,"55"),"--st-toast":L?"#1A1D20":"#F2F2F2","--st-toast-ink":L?"#FFFFFF":"#16161C","--st-cta-shadow":L?"0 10px 24px -12px rgba(24,22,32,.35)":"0 10px 26px -10px rgba(0,0,0,.7)","--st-sheet-line":"1px solid "+s.border};
return Object.assign({},v,pageShellStyle(T),{paddingBottom:"calc(env(safe-area-inset-bottom,0px) + 32px)"});}

const DESIGNS={
strichliste:{head:"#F4F3EA",headMuted:"#AEB5B9",headLine:"rgba(244,243,234,0.28)",headCard:"rgba(244,243,234,0.06)",accent:"#85D1F5"},
grandslam:{head:"#FFFFFF",headMuted:"rgba(248,250,255,0.86)",headLine:"rgba(255,255,255,0.42)",headCard:"rgba(255,255,255,0.14)",accent:"#FFFFFF"}};
const LOCALES={de:"de-CH",en:"en-GB",fr:"fr-CH",it:"it-CH",es:"es-ES",pt:"pt-PT"};
const AV={strichliste:["#85D1F5","#F4F3EA","#9FD8C6","#E9C9A0","#C9B6E4","#B9C4CA"],grandslam:["#2448E8","#FF7659","#071743","#5B7BFF","#C8391C","#3A4A7A"]};
function fmt(s,v){return String(s).replace(/\{(\w+)\}/g,(m,k)=>v&&v[k]!=null?String(v[k]):m);}
function joinNames(t,a){return a.length<2?a.join(""):a.slice(0,-1).join(", ")+" "+t("stuAnd")+" "+a[a.length-1];}
function bestLine(t,names,n){const w=fmt(t(n===1?"stuSharedWinOne":"stuSharedWinOther"),{n});return fmt(t("stuBestWith"),{names:joinNames(t,names)})+" \u00b7 "+(names.length>1?fmt(t("stuEachTpl"),{x:w}):w);}
function pts(n){return n>0?"+"+n:n<0?"−"+Math.abs(n):"0";}
function hash(s){let x=0;for(let i=0;i<s.length;i++)x=(x*31+s.charCodeAt(i))|0;return Math.abs(x);}
function initials(n){const g=GT_ST.graphemes(String(n||"").trim());if(!g.length)return"?";const parts=String(n).trim().split(/\s+/);if(parts.length>1){const a=GT_ST.graphemes(parts[0])[0]||"",b=GT_ST.graphemes(parts[parts.length-1])[0]||"";return(a+b).toUpperCase();}return(g[0]+(g[1]||"")).toUpperCase();}
function fold(s){return String(s||"").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g,"");}
function dt(iso,lang,withDay){if(!iso)return"";const d=new Date(iso);if(isNaN(d))return"";try{return d.toLocaleString(LOCALES[lang]||"de-CH",withDay===false?{hour:"2-digit",minute:"2-digit"}:{day:"numeric",month:"numeric",hour:"2-digit",minute:"2-digit"});}catch(e){return d.toISOString().slice(0,16).replace("T"," ");}}
function dday(iso,lang){if(!iso)return"";const d=new Date(iso);if(isNaN(d))return"";try{return d.toLocaleDateString(LOCALES[lang]||"de-CH",{day:"numeric",month:"numeric",year:"numeric"});}catch(e){return iso.slice(0,10);}}
/* ---------- Icons (eigene Pfade, keine Glyphen) ---------- */
const IC={
plus:"M12 5v14M5 12h14",pencil:"M4 20h4L19 9l-4-4L4 16v4zM13.5 6.5l4 4",flag:"M5 21V4M5 4h11l-2 4 2 4H5",dots:"M5 12h.01M12 12h.01M19 12h.01",close:"M6 6l12 12M18 6L6 18",
trash:"M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3",users:"M16 20v-1.5a3.5 3.5 0 0 0-3.5-3.5h-5A3.5 3.5 0 0 0 4 18.5V20M10 11a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7zM20 20v-1.5a3.5 3.5 0 0 0-2.5-3.35M15.5 4.15a3.5 3.5 0 0 1 0 6.7",
table:"M3 9h18M5 9v10M19 9v10M4 5h16v4H4z",search:"M11 18a7 7 0 1 0 0-14 7 7 0 0 0 0 14zM20 20l-4-4",undo:"M9 14L4 9l5-5M4 9h10.5a5.5 5.5 0 0 1 0 11H11",check:"M5 12.5l4.5 4.5L19 7.5",
chev:"M9 6l6 6-6 6",back:"M15 6l-6 6 6 6",person:"M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM5 20a7 7 0 0 1 14 0",share:"M12 15V4M8 8l4-4 4 4M5 13v6h14v-6",play:"M8 5.5v13l10.5-6.5z",
reopen:"M4 12a8 8 0 1 0 2.4-5.7M4 4v4h4",list:"M8 7h12M8 12h12M8 17h12M4 7h.01M4 12h.01M4 17h.01",copy:"M9 9h10v10H9zM5 15V5h10"};
function Icon({n,size=20,sw=2}){return H("svg",{width:size,height:size,viewBox:"0 0 24 24","aria-hidden":true,focusable:"false",style:{flexShrink:0,display:"block"}},H("path",{d:IC[n]||"",fill:n==="play"?"currentColor":"none",stroke:"currentColor",strokeWidth:sw,strokeLinecap:"round",strokeLinejoin:"round"}));}
/* Franzoesische Kartenzeichen als Pfade (nie als Unicode-Zeichen) */
const SUIT={
heart:"M12 21.2C11 20.5 2.6 14.9 2.6 8.9 2.6 5.8 5 3.4 7.9 3.4c1.8 0 3.2.9 4.1 2.3.9-1.4 2.3-2.3 4.1-2.3 2.9 0 5.3 2.4 5.3 5.5 0 6-8.4 11.6-9.4 12.3z",
diamond:"M12 2.2l7.6 9.8L12 21.8 4.4 12z",
club:"M12 2.6a4.3 4.3 0 0 0-4.1 5.7 4.3 4.3 0 1 0 2.9 7.3c-.3 2.4-1.2 4.3-2.9 5.8h8.2c-1.7-1.5-2.6-3.4-2.9-5.8a4.3 4.3 0 1 0 2.9-7.3A4.3 4.3 0 0 0 12 2.6z",
spade:"M12 2.4C9.9 4.6 3.4 9.1 3.4 13.6a4.1 4.1 0 0 0 7.1 2.8c-.3 2.1-1.2 3.8-2.7 5.1h8.4c-1.5-1.3-2.4-3-2.7-5.1a4.1 4.1 0 0 0 7.1-2.8c0-4.5-6.5-9-8.6-11.2z"};
function Suit({s,size=16,fill="none",stroke="currentColor",sw=1.5,style}){return H("svg",{width:size,height:size,viewBox:"0 0 24 24","aria-hidden":true,focusable:"false",style:Object.assign({display:"block",flexShrink:0},style)},H("path",{d:SUIT[s],fill:fill,stroke:stroke,strokeWidth:sw,strokeLinejoin:"round"}));}
function GtStuLogo({color}){return H("svg",{width:30,height:30,viewBox:"0 0 30 30","aria-hidden":true,style:{flexShrink:0}},H("g",{stroke:color,strokeWidth:2.4,strokeLinecap:"round",fill:"none"},H("path",{d:"M7 8v14M11.5 7.5v14M16 8v14M20.5 7.5v14M4 19.5L24 10"})),H("path",{d:"M25.2 18.6c-1.1.9-3 2.2-3 3.6a1.3 1.3 0 0 0 2.3.8l-.5 1.6h2.4l-.5-1.6a1.3 1.3 0 0 0 2.3-.8c0-1.4-1.9-2.7-3-3.6z",fill:color}));}
/* Strichliste: 4 senkrecht + 1 diagonal pro Fuenfergruppe, Rest 0..4. Ab max nur Zahl mit kleinem Motiv. */
function Tally({n,max=10,h=18,label}){n=Math.max(0,n|0);if(n===0)return H("span",{className:"gtst-tz","aria-hidden":true},"0");if(n>max){return H("span",{className:"gtst-tbig","aria-hidden":true},H(Tally,{n:5,max:5,h:Math.round(h*0.8)}),H("span",null,n));}
const g=Math.floor(n/5),r=n%5,sp=4.2,gw=16,gap=6,w=Math.ceil(g*(gw+gap)+r*sp+2),paths=[];let x=1.5;
const j=i=>(((i*37)%7)-3)*0.12;
for(let k=0;k<g;k++){for(let i=0;i<4;i++){const xx=x+i*sp;paths.push("M"+(xx+j(k*5+i)).toFixed(2)+" 2.2L"+(xx-j(k*5+i)).toFixed(2)+" "+(h-2.2));}paths.push("M"+(x-1.6)+" "+(h-4.5)+"L"+(x+3*sp+1.8)+" 4.2");x+=gw+gap;}
for(let i=0;i<r;i++){const xx=x+i*sp;paths.push("M"+(xx+j(i+3)).toFixed(2)+" 2.2L"+(xx-j(i+3)).toFixed(2)+" "+(h-2.2));}
return H("svg",{width:w,height:h,viewBox:"0 0 "+w+" "+h,"aria-hidden":true,focusable:"false",className:"gtst-tally"},H("path",{d:paths.join(""),fill:"none",stroke:"currentColor",strokeWidth:1.9,strokeLinecap:"round"}));}
/* ---------- Styles ---------- */
const CSS=`
.gtst{color:var(--st-ink);font-family:var(--st-ui);-webkit-tap-highlight-color:transparent}
.gtst *,.gtst *::before,.gtst *::after{box-sizing:border-box}
.gtst ::selection{background:var(--st-sel);color:var(--st-ink)}
.gtst input,.gtst select,.gtst button{font-family:inherit}
.gtst-head{position:relative;color:var(--st-hink);padding:2px 2px 14px;overflow-x:clip}
.gtst[data-d=grandslam] .gtst-head{padding-right:120px} @media (max-width:380px){.gtst[data-d=grandslam] .gtst-head{padding-right:92px} .gtst-grandart{transform:scale(.7);transform-origin:100% 0} .gtst[data-d=grandslam] .gtst-title{font-size:28px}}
.gtst-title{margin:4px 0 0;font:var(--st-title-font);letter-spacing:var(--st-title-track);line-height:1.12;color:var(--st-hink);overflow-wrap:anywhere;word-break:normal;text-wrap:balance}
.gtst-titlerow{display:flex;align-items:flex-start;gap:6px;position:relative;z-index:1}
.gtst-under{display:block;margin-top:2px;height:8px;width:min(70%,260px);color:var(--st-uline)}
.gtst-meta{display:flex;flex-wrap:wrap;align-items:center;gap:4px 10px;margin-top:10px;font:500 13.5px/1.35 var(--st-data);color:var(--st-hmuted);position:relative;z-index:1}
.gtst-meta>span{display:inline-flex;align-items:center;gap:6px}
.gtst-dot{width:8px;height:8px;border-radius:50%;background:var(--st-live);display:inline-block}
.gtst-body{background:var(--st-body);border-radius:var(--st-body-r);padding:var(--st-body-pad);border:var(--st-body-border);box-shadow:var(--st-body-shadow)}
.gtst-panel{background:var(--st-panel);border:1px solid var(--st-pline);border-radius:14px;box-shadow:var(--st-pshadow)}
.gtst-btn{min-height:44px;border-radius:12px;border:1px solid var(--st-bline);background:transparent;color:var(--st-ink);font:600 15px/1.2 var(--st-ui);padding:10px 16px;display:inline-flex;align-items:center;justify-content:center;gap:8px;cursor:pointer;text-align:center;transition:transform .16s cubic-bezier(.23,1,.32,1),background-color .2s ease,border-color .2s ease,opacity .2s ease;touch-action:manipulation;-webkit-user-select:none;user-select:none}
.gtst-btn:active:not(:disabled){transform:scale(.97)}
.gtst-btn:disabled{opacity:.42;cursor:not-allowed}
.gtst-btn.is-primary{background:var(--st-accent);border-color:var(--st-accent);color:var(--st-on-accent);font-weight:700}
.gtst-btn.is-block{width:100%}
.gtst-btn.is-ghost{border-color:transparent;padding:10px 12px}
.gtst-btn.is-danger{color:var(--st-danger)}
.gtst-btn.is-small{min-height:44px;font-size:14px;padding:8px 12px}
.gtst-ibtn{width:44px;height:44px;min-width:44px;border-radius:12px;border:1px solid transparent;background:transparent;color:inherit;display:inline-flex;align-items:center;justify-content:center;cursor:pointer;padding:0;transition:transform .16s cubic-bezier(.23,1,.32,1),background-color .2s ease}
.gtst-ibtn:active{transform:scale(.94)}
@media (hover:hover) and (pointer:fine){.gtst-btn:hover:not(:disabled){filter:brightness(1.08)}.gtst-ibtn:hover{background:var(--st-hover)}}
.gtst :focus{outline:none}
.gtst :focus-visible{outline:2px solid var(--st-focus);outline-offset:2px}
.gtst-input{width:100%;min-height:48px;border-radius:12px;border:1px solid var(--st-bline);background:var(--st-field);color:var(--st-ink);font:500 16px/1.3 var(--st-ui);padding:12px 14px;-webkit-appearance:none;appearance:none}
.gtst-input::placeholder{color:var(--st-ph)}
.gtst-input:focus-visible{outline:2px solid var(--st-focus);outline-offset:1px}
.gtst-input[aria-invalid=true]{border-color:var(--st-danger)}
.gtst-label{display:block;font:600 13px/1.3 var(--st-ui);color:var(--st-muted);margin:0 0 6px}
.gtst-help{font:500 12.5px/1.4 var(--st-ui);color:var(--st-muted);margin-top:6px;display:flex;justify-content:space-between;gap:10px}
.gtst-err{color:var(--st-danger);font:600 13px/1.4 var(--st-ui)}
.gtst-cap{font:600 11px/1.2 var(--st-data);letter-spacing:.14em;text-transform:uppercase;color:var(--st-muted)}
.gtst-tabs{display:grid;grid-template-columns:repeat(3,1fr);gap:var(--st-tabgap);padding:var(--st-tabpad);background:var(--st-tabbg);border-radius:var(--st-tabr);border-bottom:var(--st-tabline);margin-bottom:12px}
.gtst-tab{min-height:44px;border:none;background:transparent;color:var(--st-muted);font:600 14px/1.15 var(--st-ui);cursor:pointer;border-radius:calc(var(--st-tabr) - 3px);padding:6px 4px;position:relative;transition:color .2s ease,background-color .2s ease;-webkit-hyphens:none;hyphens:none;overflow-wrap:normal;word-break:normal;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;min-width:0}
.gtst-row.gtst-hrow>.gtst-col{font:600 10.5px/1.2 var(--st-ui);color:var(--st-muted)}
.gtst-tabs{container-type:inline-size}.gtst-tab .gtst-tl{display:none}.gtst-tab .gtst-ts{display:inline}
@container (min-width:400px){.gtst-tab .gtst-tl{display:inline}.gtst-tab .gtst-ts{display:none}}
@container (max-width:300px){.gtst-tab{font-size:13px}}
.gtst-tab[aria-selected=true]{color:var(--st-tabon-ink);background:var(--st-tabon-bg)}
.gtst[data-d=app] .gtst-tab[aria-selected=true]::after{content:"";position:absolute;left:12%;right:12%;bottom:-1px;height:3px;border-radius:3px;background:var(--st-accent)}
.gtst-rank{container-type:inline-size}
.gtst-row{display:grid;grid-template-columns:30px minmax(0,1fr) auto;align-items:center;gap:10px;padding:10px 10px;border-bottom:1px solid var(--st-rline)}
.gtst-row:last-child{border-bottom:none}
.gtst-row.is-lead{background:var(--st-lead)}
.gtst-hrow{padding-top:6px;padding-bottom:6px}
.gtst-hrow>*{font:600 10.5px/1.2 var(--st-ui);letter-spacing:.04em;white-space:nowrap;text-transform:uppercase;color:var(--st-muted)}
.gtst-rk{font:700 16px/1 var(--st-data);font-variant-numeric:tabular-nums;color:var(--st-ink)}
.gtst-row.is-lead .gtst-rk,.gtst-row.is-lead .gtst-pt{color:var(--st-lead-ink)}
.gtst-nm{font:600 16px/1.25 var(--st-ui);overflow-wrap:anywhere;min-width:0}
.gtst-sub{display:block;font:500 12.5px/1.35 var(--st-ui);color:var(--st-muted);margin-top:2px;font-variant-numeric:tabular-nums}
.gtst-pt{font:700 17px/1 var(--st-data);font-variant-numeric:tabular-nums;text-align:right;min-width:40px;color:var(--st-pt)}
.gtst-pt.is-pos{color:var(--st-pos)}
.gtst-col{display:none;align-items:center;gap:6px;font:600 14px/1 var(--st-data);font-variant-numeric:tabular-nums;color:var(--st-ink)}
.gtst-tz{color:var(--st-muted);font:600 13px/1 var(--st-data)}
.gtst-tbig{display:inline-flex;align-items:center;gap:5px;font:700 14px/1 var(--st-data)}
.gtst-tally{display:block;color:var(--st-chalk)}
@container (min-width:340px){.gtst[data-d=app] .gtst-row{grid-template-columns:34px minmax(0,1fr) 44px 44px 44px;gap:6px}.gtst[data-d=app] .gtst-col.c-t{display:flex}}
.gtst-lg{display:none}.gtst-sh{display:inline}
@container (min-width:560px){.gtst .gtst-row{grid-template-columns:40px minmax(0,1fr) 96px 120px 64px 60px}.gtst[data-d=app] .gtst-row{grid-template-columns:40px minmax(0,1fr) 96px 120px 64px 60px;gap:10px}.gtst .gtst-col .gtst-tz{display:none}.gtst .gtst-col{display:flex}.gtst .gtst-col.c-n{justify-content:flex-start}.gtst .gtst-sub{display:none}.gtst-num{display:inline!important}}
.gtst-num{display:none}
@container (min-width:560px){.gtst-lg{display:inline}.gtst-sh{display:none}}
.gtst-lead{border-radius:14px;padding:14px 14px 12px;margin-bottom:12px;background:var(--st-leadbox);color:var(--st-leadbox-ink);border:var(--st-leadbox-line)}
.gtst-lead .gtst-cap{color:var(--st-leadbox-cap)}
.gtst-lname{font:var(--st-lname-font);letter-spacing:-.01em;overflow-wrap:anywhere;margin-top:4px}
.gtst-lpts{font:700 15px/1.2 var(--st-data);color:var(--st-leadbox-cap)}
.gtst-lhint{font:500 13px/1.4 var(--st-ui);margin-top:4px;opacity:.92}
.gtst-empty{padding:22px 16px;text-align:left;font:500 14.5px/1.5 var(--st-ui);color:var(--st-muted)}
.gtst-empty b{display:block;color:var(--st-ink);font:700 16px/1.3 var(--st-ui);margin-bottom:4px}
.gtst-sec{margin-top:14px}
.gtst-sechead{display:flex;align-items:center;justify-content:space-between;gap:8px;margin:0 2px 8px}
.gtst-tbl{padding:12px 12px 12px;margin-bottom:10px}
.gtst-tblhead{display:flex;align-items:center;justify-content:space-between;gap:8px;margin-bottom:8px}
.gtst-tname{font:700 13px/1.2 var(--st-data);letter-spacing:.16em;text-transform:uppercase;color:var(--st-ink)}
.gtst-state{font:600 12.5px/1.2 var(--st-ui);color:var(--st-muted);display:inline-flex;align-items:center;gap:6px}
.gtst-teams{display:grid;grid-template-columns:minmax(0,1fr) auto minmax(0,1fr);gap:8px;align-items:center;margin:4px 0 10px}
.gtst-team{border:1px solid var(--st-rline);border-radius:10px;padding:8px 10px;min-width:0}
.gtst-team b{display:block;font:700 11px/1.2 var(--st-ui);letter-spacing:.08em;text-transform:uppercase;color:var(--st-muted);margin-bottom:3px}
.gtst-team span{font:600 14.5px/1.3 var(--st-ui);overflow-wrap:anywhere}
.gtst-vs{font:600 12px/1 var(--st-ui);color:var(--st-muted)}
.gtst-acts{display:flex;flex-wrap:wrap;gap:8px}
.gtst-acts>.gtst-btn{flex:1 1 auto;white-space:nowrap}
.gtst-people{font:500 14px/1.45 var(--st-ui);color:var(--st-ink);padding:10px 12px}
.gtst-people .gtst-cap{display:block;margin-bottom:3px}
.gtst-cta{position:sticky;bottom:calc(env(safe-area-inset-bottom,0px) + 10px);z-index:6;margin-top:14px;display:grid;gap:8px}
.gtst-cta .is-primary{min-height:52px;font-size:16px;box-shadow:var(--st-cta-shadow)}
.gtst-chips{display:flex;gap:8px;overflow-x:auto;padding:2px 2px 8px;scrollbar-width:thin;-webkit-overflow-scrolling:touch}
.gtst-chip{min-height:44px;flex:0 0 auto;border-radius:999px;border:1px solid var(--st-bline);background:transparent;color:var(--st-ink);font:600 14px/1.2 var(--st-ui);padding:6px 14px 6px 6px;display:inline-flex;align-items:center;gap:8px;cursor:pointer;max-width:240px}
.gtst-chip>span:last-child{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.gtst-chip[aria-pressed=true]{background:var(--st-accent);border-color:var(--st-accent);color:var(--st-on-accent)}
.gtst-av{width:32px;height:32px;min-width:32px;border-radius:50%;display:inline-flex;align-items:center;justify-content:center;font:700 12px/1 var(--st-ui);letter-spacing:.02em}
.gtst-mx{overflow-x:auto;border-radius:12px;border:1px solid var(--st-rline);-webkit-overflow-scrolling:touch}
.gtst-mx table{border-collapse:separate;border-spacing:0;font:500 13px/1.25 var(--st-data);font-variant-numeric:tabular-nums}
.gtst-mx th,.gtst-mx td{padding:8px 8px;border-bottom:1px solid var(--st-rline);border-right:1px solid var(--st-rline);text-align:center;min-width:64px;background:var(--st-panel)}
.gtst-mx thead th{position:sticky;top:0;z-index:1;font:600 12px/1.2 var(--st-ui);color:var(--st-ink);max-width:110px;overflow-wrap:anywhere}
.gtst-mx th[scope=row]{position:sticky;left:0;z-index:2;text-align:left;font:600 13px/1.25 var(--st-ui);min-width:110px;max-width:150px;overflow-wrap:anywhere}
.gtst-mx thead th:first-child{left:0;z-index:3}
.gtst-mx td.is-self{background:var(--st-self)}
.gtst-mx td b{display:block;font:700 15px/1.1 var(--st-data)}
.gtst-mx td small{display:block;color:var(--st-muted);font-size:11.5px;margin-top:2px}
.gtst-mx td.is-none{color:var(--st-muted)}
.gtst-mxwrap{display:none}
@container (min-width:600px){.gtst-mxwrap{display:block}.gtst-plist.has-mx{display:none}}
.gtst-prow{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:10px;align-items:center;padding:10px 12px;border-bottom:1px solid var(--st-rline)}
.gtst-prow:last-child{border-bottom:none}
.gtst-hist{padding:12px;margin-bottom:10px}
.gtst-hmeta{display:flex;flex-wrap:wrap;gap:4px 10px;align-items:center;font:500 12.5px/1.3 var(--st-data);color:var(--st-muted)}
.gtst-hmeta b{color:var(--st-ink);font:700 14px/1.2 var(--st-ui)}
.gtst-badge{display:inline-flex;align-items:center;gap:4px;border-radius:999px;padding:3px 9px;font:600 11.5px/1.2 var(--st-ui);border:1px solid var(--st-bline);color:var(--st-ink)}
.gtst-badge.is-win{background:var(--st-accent);border-color:var(--st-accent);color:var(--st-on-accent)}
.gtst-hteams{display:grid;gap:4px;margin:8px 0 6px;font:500 14.5px/1.35 var(--st-ui)}
.gtst-hteams>div{display:flex;align-items:center;gap:8px;flex-wrap:wrap}
.gtst-hteams .is-w{font-weight:700}
.gtst-hteams .is-l{color:var(--st-muted)}
.gtst-filt{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:10px}
.gtst-sel{min-height:44px;width:100%;border-radius:12px;border:1px solid var(--st-bline);background:var(--st-field);color:var(--st-ink);font:500 15px/1.2 var(--st-ui);padding:8px 10px}
.gtst-ovl{position:fixed;inset:0;z-index:95;display:flex;align-items:flex-end;justify-content:center;background:rgba(5,8,14,.56);animation:gtstFade .2s ease-out}
.gtst-sheet{width:100%;max-width:560px;max-height:calc(100dvh - env(safe-area-inset-top,0px) - 10px);display:flex;flex-direction:column;background:var(--st-body-solid);color:var(--st-ink);border-radius:20px 20px 0 0;box-shadow:0 -12px 40px -12px rgba(0,0,0,.5);animation:gtstUp .24s cubic-bezier(.23,1,.32,1);border:var(--st-sheet-line)}
@media (min-width:700px){.gtst-ovl{align-items:center;padding:24px}.gtst-sheet{border-radius:20px;max-height:calc(100dvh - 48px)}}
.gtst-shead{display:flex;align-items:center;justify-content:space-between;gap:8px;padding:12px 10px 6px 18px}
.gtst-shead h2{margin:0;font:700 18px/1.25 var(--st-ui);overflow-wrap:anywhere}
.gtst-sbody{overflow-y:auto;padding:4px 18px 16px;-webkit-overflow-scrolling:touch;overscroll-behavior:contain}
.gtst-sfoot{padding:10px 18px calc(env(safe-area-inset-bottom,0px) + 14px);border-top:1px solid var(--st-rline);display:grid;gap:8px;background:var(--st-body-solid);border-radius:0 0 20px 20px}
@keyframes gtstFade{from{opacity:0}to{opacity:1}}
@keyframes gtstUp{from{transform:translateY(18px);opacity:.6}to{transform:none;opacity:1}}
@media (prefers-reduced-motion:reduce){.gtst-ovl,.gtst-sheet,.gtst-toast{animation:none!important}.gtst-btn,.gtst-ibtn{transition:none}}
.gtst-slots{display:grid;grid-template-columns:1fr 1fr;gap:8px}
.gtst-tbox{border:1px solid var(--st-rline);border-radius:12px;padding:8px;display:grid;gap:6px;min-width:0}
.gtst-tbox>b{font:700 11.5px/1.2 var(--st-ui);letter-spacing:.08em;text-transform:uppercase;color:var(--st-muted);padding:2px 2px 0}
.gtst-slot{min-height:48px;width:100%;border-radius:10px;border:1.5px dashed var(--st-bline);background:transparent;color:var(--st-muted);display:flex;align-items:center;gap:8px;padding:6px 8px;font:600 14px/1.25 var(--st-ui);text-align:left;cursor:pointer;min-width:0}
.gtst-slot.is-full{border-style:solid;color:var(--st-ink);background:var(--st-field)}
.gtst-slot.is-active{border:2px solid var(--st-focus);border-style:solid}
.gtst-slot>span.nm{flex:1;min-width:0;overflow-wrap:anywhere}
.gtst-plist2{display:grid;gap:6px;margin-top:8px}
.gtst-pbtn{min-height:52px;width:100%;border-radius:12px;border:1px solid var(--st-rline);background:transparent;color:var(--st-ink);display:flex;align-items:center;gap:10px;padding:8px 10px;text-align:left;cursor:pointer;font:600 15px/1.25 var(--st-ui)}
.gtst-pbtn:disabled{cursor:not-allowed;opacity:.5}
.gtst-pbtn[aria-pressed=true]{border-color:var(--st-focus);background:var(--st-accent-soft)}
.gtst-pbtn .nm{flex:1;min-width:0;overflow-wrap:anywhere}
.gtst-pbtn .why{font:500 12px/1.3 var(--st-ui);color:var(--st-muted);text-align:right;max-width:46%}
.gtst-tag{min-width:26px;height:26px;border-radius:8px;display:inline-flex;align-items:center;justify-content:center;font:800 13px/1 var(--st-ui);background:var(--st-accent);color:var(--st-on-accent)}
.gtst-win{display:grid;grid-template-columns:1fr 1fr;gap:8px}
.gtst-wbtn{min-height:64px;border-radius:12px;border:1.5px solid var(--st-bline);background:transparent;color:var(--st-ink);padding:8px 10px;text-align:left;cursor:pointer;display:grid;gap:2px;font:700 15px/1.25 var(--st-ui)}
.gtst-wbtn small{font:500 12.5px/1.3 var(--st-ui);color:var(--st-muted);overflow-wrap:anywhere}
.gtst-wbtn[aria-pressed=true]{background:var(--st-accent);border-color:var(--st-accent);color:var(--st-on-accent)}
.gtst-wbtn[aria-pressed=true] small{color:var(--st-on-accent);opacity:.88}
.gtst-wbtn:disabled{opacity:.42;cursor:not-allowed}
.gtst-when{display:flex;align-items:center;justify-content:space-between;gap:10px;border:1px solid var(--st-rline);border-radius:12px;padding:8px 8px 8px 12px}
.gtst[data-d=app] .gtst-input{color-scheme:dark}
.gtst-sum{border-radius:12px;padding:12px;background:var(--st-accent-soft);font:600 15px/1.4 var(--st-ui);overflow-wrap:anywhere}
.gtst-prev{display:flex;flex-wrap:wrap;gap:6px;margin-top:8px}
.gtst-prev span{border-radius:999px;padding:4px 10px;font:600 12.5px/1.2 var(--st-data);border:1px solid var(--st-bline);background:var(--st-panel)}
.gtst-note{border-radius:12px;padding:10px 12px;border:1px solid var(--st-bline);font:500 13.5px/1.45 var(--st-ui);color:var(--st-ink);background:var(--st-panel)}
.gtst-toast{position:fixed;left:50%;top:calc(env(safe-area-inset-top,0px) + 12px);bottom:auto;transform:translateX(-50%);z-index:96;width:min(520px,calc(100vw - 24px));display:flex;align-items:center;gap:10px;padding:8px 8px 8px 16px;border-radius:14px;background:var(--st-toast);color:var(--st-toast-ink);box-shadow:0 14px 34px -14px rgba(0,0,0,.6);font:600 14px/1.35 var(--st-ui);animation:gtstUp .22s cubic-bezier(.23,1,.32,1)}
.gtst-toast>span{flex:1;min-width:0;overflow-wrap:anywhere}
.gtst-toast .gtst-btn{color:var(--st-toast-ink);border-color:currentColor}
.gtst-mini{border:1.5px solid var(--st-bline);border-radius:14px;padding:8px;background:transparent;color:var(--st-ink);cursor:pointer;display:grid;gap:8px;text-align:left;font:600 14px/1.2 var(--st-ui);min-height:44px}
.gtst-mini[aria-checked=true]{border:2px solid var(--st-focus);box-shadow:0 0 0 3px var(--st-accent-soft)}
.gtst-mini .pv{height:74px;border-radius:9px;position:relative;overflow:hidden}
.gtst-mini .lb{display:flex;align-items:center;gap:6px;justify-content:space-between}
.gtst-step{display:flex;align-items:center;gap:6px}
.gtst-step output{min-width:44px;text-align:center;font:700 20px/1 var(--st-data);font-variant-numeric:tabular-nums}
.gtst-lrow{display:flex;align-items:center;gap:4px;padding:6px 6px 6px 14px;margin-bottom:10px}
.gtst-lrow>button.main{flex:1;min-width:0;background:none;border:none;color:inherit;text-align:left;padding:8px 0;cursor:pointer;min-height:56px}
.gtst-lrow .nm{font:700 16.5px/1.25 var(--st-ui);overflow-wrap:anywhere}
.gtst-mrow{width:100%;min-height:52px;display:flex;align-items:center;gap:12px;border:none;border-bottom:1px solid var(--st-rline);background:none;color:var(--st-ink);font:600 15.5px/1.25 var(--st-ui);text-align:left;padding:8px 4px;cursor:pointer}
.gtst-mrow:disabled{opacity:.45;cursor:not-allowed}
.gtst-mrow>span{flex:1}
.gtst-mrow.is-danger{color:var(--st-danger)}
.gtst-ro{border-radius:12px;padding:12px;margin-bottom:12px;background:var(--st-accent-soft);font:500 14px/1.45 var(--st-ui);color:var(--st-ink)}
.gtst-grandart{position:absolute;right:-8px;top:-2px;width:118px;height:96px;pointer-events:none;z-index:0}
.gtL-content .gtst-cta{position:static}
.gtst[data-t=light] .gtst-input,.gtst[data-t=light] .gtst-sel{color-scheme:light}
.gtst[data-t=vitrum] .gtst-panel,.gtst[data-t=vitrum] .gtst-sheet{-webkit-backdrop-filter:blur(14px) saturate(140%);backdrop-filter:blur(14px) saturate(140%)}
.gtst[data-t=vitrum] .gtst-sheet{background:rgba(26,30,43,.94)}
.gtst .gtst-title{font-weight:800}
`;
const VARS={
strichliste:{"--st-page":"#15191C","--st-hink":"#F4F3EA","--st-hmuted":"#AEB5B9","--st-uline":"#85D1F5","--st-live":"#85D1F5",
"--st-title-font":"700 32px/1.1 'Kalam','Baloo 2',cursive","--st-title-track":"0","--st-data":"'Space Grotesk','Inter',sans-serif","--st-ui":"'Inter',sans-serif",
"--st-body":"#24282B","--st-body-solid":"#24282B","--st-body-r":"18px","--st-body-pad":"12px","--st-body-border":"1px solid rgba(98,107,112,.55)","--st-body-shadow":"none",
"--st-panel":"#1D2124","--st-pline":"rgba(98,107,112,.7)","--st-pshadow":"none","--st-ink":"#F4F3EA","--st-muted":"#AEB5B9","--st-bline":"#626B70","--st-rline":"rgba(98,107,112,.55)",
"--st-accent":"#85D1F5","--st-on-accent":"#0B1A22","--st-accent-soft":"rgba(133,209,245,.12)","--st-focus":"#85D1F5","--st-danger":"#F4A08F","--st-field":"#1A1E21","--st-ph":"#8C959A","--st-hover":"rgba(244,243,234,.07)",
"--st-tabgap":"0","--st-tabpad":"0","--st-tabbg":"transparent","--st-tabr":"6px","--st-tabline":"1px solid rgba(98,107,112,.7)","--st-tabon-ink":"#F4F3EA","--st-tabon-bg":"transparent",
"--st-lead":"rgba(133,209,245,.07)","--st-lead-ink":"#85D1F5","--st-pt":"#F4F3EA","--st-pos":"#85D1F5","--st-chalk":"#F4F3EA","--st-self":"#2E3337",
"--st-leadbox":"#1D2124","--st-leadbox-ink":"#F4F3EA","--st-leadbox-cap":"#85D1F5","--st-leadbox-line":"1px solid rgba(98,107,112,.7)","--st-lname-font":"700 24px/1.15 'Space Grotesk','Inter',sans-serif",
"--st-sel":"rgba(133,209,245,.35)","--st-toast":"#F4F3EA","--st-toast-ink":"#15191C","--st-cta-shadow":"0 10px 26px -10px rgba(0,0,0,.7)","--st-sheet-line":"1px solid rgba(98,107,112,.6)"},
grandslam:{"--st-page":"#2448E8","--st-hink":"#FFFFFF","--st-hmuted":"rgba(248,250,255,.88)","--st-uline":"#FF7659","--st-live":"#FF7659",
"--st-title-font":"700 34px/1.04 'Space Grotesk','Inter',sans-serif","--st-title-track":"-0.025em","--st-data":"'Inter',sans-serif","--st-ui":"'Inter',sans-serif",
"--st-body":"#F8FAFF","--st-body-solid":"#F8FAFF","--st-body-r":"22px","--st-body-pad":"12px","--st-body-border":"none","--st-body-shadow":"0 18px 40px -22px rgba(7,23,67,.6)",
"--st-panel":"#FFFFFF","--st-pline":"#DCE3F6","--st-pshadow":"0 6px 16px -12px rgba(7,23,67,.35)","--st-ink":"#071743","--st-muted":"#47507A","--st-bline":"#B9C4EA","--st-rline":"#D8DFF4",
"--st-accent":"#2448E8","--st-on-accent":"#FFFFFF","--st-accent-soft":"rgba(36,72,232,.08)","--st-focus":"#2448E8","--st-danger":"#B8321A","--st-field":"#FFFFFF","--st-ph":"#6A7398","--st-hover":"rgba(36,72,232,.07)",
"--st-tabgap":"4px","--st-tabpad":"4px","--st-tabbg":"#E8EDFC","--st-tabr":"12px","--st-tabline":"none","--st-tabon-ink":"#FFFFFF","--st-tabon-bg":"#2448E8",
"--st-lead":"#FFE5DD","--st-lead-ink":"#B8321A","--st-pt":"#071743","--st-pos":"#071743","--st-chalk":"#071743","--st-self":"#E3E8F7",
"--st-leadbox":"#FF7659","--st-leadbox-ink":"#071743","--st-leadbox-cap":"#071743","--st-leadbox-line":"none","--st-lname-font":"800 26px/1.08 'Space Grotesk','Inter',sans-serif",
"--st-sel":"rgba(255,118,89,.35)","--st-toast":"#071743","--st-toast-ink":"#FFFFFF","--st-cta-shadow":"0 12px 26px -12px rgba(7,23,67,.7)","--st-sheet-line":"none"}};
function rootStyle(d){const v=VARS[d]||VARS.strichliste;const bg=d==="grandslam"?"#2448E8":"radial-gradient(120% 55% at 12% -4%, rgba(244,243,234,0.07) 0%, rgba(244,243,234,0) 62%), radial-gradient(80% 40% at 100% 100%, rgba(133,209,245,0.05) 0%, rgba(133,209,245,0) 70%), #15191C";return Object.assign({},v,{minHeight:"100vh",background:bg,padding:"20px 12px calc(env(safe-area-inset-bottom,0px) + 32px)"});}
/* ---------- Bausteine ---------- */
function useLabels(tour){return useMemo(()=>{const by={},m={};if(!tour)return{lbl:id=>"",map:m};tour.participants.slice().sort((a,b)=>a.stableOrder-b.stableOrder).forEach(p=>{const k=fold(p.displayName).trim();(by[k]=by[k]||[]).push(p);});Object.keys(by).forEach(k=>{const arr=by[k];arr.forEach((p,i)=>{m[p.id]=arr.length>1?p.displayName+" ("+(i+1)+")":p.displayName;});});return{lbl:id=>m[id]!=null?m[id]:"?",map:m};},[tour]);}
function Avatar({id,name,design}){const pal=AV[design]||stuAvPal(design);const c=pal[hash(id)%pal.length];const st=design==="grandslam"?{background:c,color:(function(){const r=gtHexRgb(c);return r&&gtCR(r,[255,255,255])<4.5?"#071743":"#FFFFFF";})()}:{background:"transparent",color:c,boxShadow:"inset 0 0 0 1.5px "+c};return H("span",{className:"gtst-av","aria-hidden":true,style:st},initials(name));}
function Sheet({title,onClose,children,footer,labelId}){const ref=useRef(null);const opener=useRef(typeof document!=="undefined"?document.activeElement:null);const lid=useRef(labelId||("gtst-s-"+GT_ST.uid().slice(0,6))).current;
useEffect(()=>{const el=ref.current;const prev=document.body.style.overflow;document.body.style.overflow="hidden";const f=el&&el.querySelector("[data-autofocus]")||el&&el.querySelector("input,button:not([data-close])")||el;if(f&&f.focus)try{f.focus({preventScroll:true});}catch(e){}
const key=e=>{if(e.key==="Escape"){e.stopPropagation();onClose();return;}if(e.key==="Tab"&&el){const q=[...el.querySelectorAll('button:not(:disabled),input:not(:disabled),select:not(:disabled),[tabindex="0"]')].filter(x=>x.offsetParent!==null);if(!q.length)return;const a=q[0],b=q[q.length-1];if(e.shiftKey&&document.activeElement===a){e.preventDefault();b.focus();}else if(!e.shiftKey&&document.activeElement===b){e.preventDefault();a.focus();}}};
document.addEventListener("keydown",key,true);return()=>{document.removeEventListener("keydown",key,true);document.body.style.overflow=prev;const o=opener.current;if(o&&o.isConnected&&o.focus)try{o.focus({preventScroll:true});}catch(e){}};},[]);
return H("div",{className:"gtst-ovl",onMouseDown:e=>{if(e.target===e.currentTarget)onClose();}},H("div",{ref:ref,className:"gtst-sheet",role:"dialog","aria-modal":"true","aria-labelledby":lid,tabIndex:-1},
H("div",{className:"gtst-shead"},H("h2",{id:lid},title),H("button",{type:"button",className:"gtst-ibtn","data-close":"1",onClick:onClose,"aria-label":"×"},H(Icon,{n:"close"}))),
H("div",{className:"gtst-sbody"},children),footer&&H("div",{className:"gtst-sfoot"},footer)));}
function NameField({value,onChange,t,id,label,error,onEnter}){const len=GT_ST.graphemeLength(value);const max=GT_ST.LIMITS.name;const over=len>max;const hid=id+"-h";
return H("div",null,H("label",{className:"gtst-label",htmlFor:id},label),H("input",{id:id,className:"gtst-input",value:value,onChange:e=>onChange(e.target.value),autoComplete:"off",enterKeyHint:"done","aria-invalid":(over||!!error)?"true":"false","aria-describedby":hid,onKeyDown:e=>{if(e.key==="Enter"&&onEnter){e.preventDefault();onEnter();}}}),
H("div",{className:"gtst-help",id:hid},H("span",{className:(over||error)?"gtst-err":"",role:(over||error)?"alert":undefined},over?fmt(t("stuNameTooLong"),{max,n:len}):error||t("stuNameHelp")),H("span",{style:{fontVariantNumeric:"tabular-nums",whiteSpace:"nowrap",color:over?"var(--st-danger)":undefined}},len+"/"+max)));}
function ThemePick({value,onChange,t}){const opts=[["strichliste",t("stuDesignStrich"),t("stuDesignStrichSub")],["grandslam",t("stuDesignGrand"),t("stuDesignGrandSub")]];
const pv=k=>k==="strichliste"?H("div",{className:"pv",style:{background:"#24282B",border:"1px solid #626B70"}},H("div",{style:{position:"absolute",left:10,top:8,font:"700 15px/1 'Kalam',cursive",color:"#F4F3EA"}},"Jass"),H("div",{style:{position:"absolute",left:10,top:28,width:46,height:3,borderRadius:2,background:"#85D1F5"}}),H("div",{style:{position:"absolute",left:10,bottom:9,color:"#F4F3EA","--st-chalk":"#F4F3EA"}},H(Tally,{n:7,h:16})),H("div",{style:{position:"absolute",right:10,bottom:10,font:"700 13px/1 'Space Grotesk',sans-serif",color:"#85D1F5"}},"+4"),H(Suit,{s:"spade",size:16,stroke:"#F4F3EA",style:{position:"absolute",right:10,top:8}}))
:H("div",{className:"pv",style:{background:"#2448E8"}},H(Suit,{s:"heart",size:44,fill:"#FF7659",stroke:"none",style:{position:"absolute",right:24,top:-8}}),H(Suit,{s:"spade",size:40,fill:"#071743",stroke:"none",style:{position:"absolute",right:-6,top:2}}),H("div",{style:{position:"absolute",left:9,top:9,font:"700 15px/1 'Space Grotesk',sans-serif",color:"#fff"}},"Jass"),H("div",{style:{position:"absolute",left:8,right:8,bottom:8,height:26,borderRadius:5,background:"#F8FAFF",display:"flex",alignItems:"center",justifyContent:"space-between",padding:"0 7px",font:"700 11px/1 Inter,sans-serif",color:"#071743"}},H("span",null,"1"),H("span",{style:{color:"#B8321A"}},"+4")));
return H("div",{role:"radiogroup","aria-label":t("stuDesign"),style:{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}},opts.map(([k,l,sub])=>H("button",{key:k,type:"button",role:"radio","aria-checked":value===k?"true":"false",className:"gtst-mini",onClick:()=>onChange(k)},pv(k),H("span",{className:"lb"},H("span",null,l,H("span",{style:{display:"block",font:"500 12px/1.3 var(--st-ui)",color:"var(--st-muted)",marginTop:2}},sub)),value===k&&H(Icon,{n:"check",size:18})))));}
function errText(t,res,lbl,tour){if(!res)return"";const c=res.code;const d=res.details||{};const tbl=d.tableId&&tour?tour.tables.find(x=>x.id===d.tableId):null;const v={name:d.id?lbl(d.id):"",table:tbl?fmt(t("stuTableN"),{n:tbl.number}):"",max:GT_ST.LIMITS.name,min:d.min,maxT:d.max};const k="stuErr_"+c;const s=t(k);return fmt(s!==k?s:t("stuErrGeneric"),v);}
/* ---------- Turnierliste ---------- */
function ListView({snap,t,lang,onOpen,onNew,onDelete,onRestore}){const[showTrash,setShowTrash]=useState(false);const statusText=x=>{const d=GT_ST.derive(x);if(x.status==="completed")return d.summary.matches?fmt(t("stuStatusDoneOn"),{d:dday(x.completedAt,lang)}):t("stuStatusUnrated");if(x.status==="draft")return t("stuStatusDraft");return t("stuStatusRunning");};
return H("div",null,H("button",{type:"button",className:"gtst-btn is-primary is-block",onClick:onNew,style:{minHeight:52,marginBottom:14}},H(Icon,{n:"plus"}),t("stuNewTour")),
snap.list.length===0?H("div",{className:"gtst-panel gtst-empty"},H("b",null,t("stuListEmptyT")),t("stuListEmpty")):snap.list.map(x=>{const d=GT_ST.derive(x);return H("div",{key:x.id,className:"gtst-panel gtst-lrow"},H("button",{type:"button",className:"main",onClick:()=>onOpen(x.id)},H("div",{className:"nm"},x.name),H("div",{className:"gtst-sub",style:{display:"block"}},statusText(x)+" · "+fmt(t(x.participants.length===1?"stuPersonsOne":"stuPersonsOther"),{n:x.participants.length})+" · "+fmt(t(d.summary.matches===1?"stuMatchesOne":"stuMatchesOther"),{n:d.summary.matches}))),H("button",{type:"button",className:"gtst-ibtn",onClick:()=>onDelete(x),"aria-label":fmt(t("stuDeleteAria"),{name:x.name}),style:{color:"var(--st-muted)"}},H(Icon,{n:"trash"})));}),
snap.trash.length>0&&H("div",{className:"gtst-sec"},H("button",{type:"button",className:"gtst-btn is-ghost","aria-expanded":showTrash?"true":"false",onClick:()=>setShowTrash(v=>!v)},fmt(t("stuTrash"),{n:snap.trash.length})),showTrash&&snap.trash.map(x=>H("div",{key:x.id,className:"gtst-panel gtst-lrow",style:{opacity:.85}},H("div",{style:{flex:1,minWidth:0,padding:"8px 0"}},H("div",{className:"nm"},x.name),H("div",{className:"gtst-sub",style:{display:"block"}},fmt(t("stuDeletedOn"),{d:dday(x.deletedAt,lang)}))),H("button",{type:"button",className:"gtst-btn is-small",onClick:()=>onRestore(x)},H(Icon,{n:"undo",size:18}),t("stuRestore"))))));}
/* ---------- Einrichtung ---------- */
function SetupView({t,lang,design,setDesign,onCreate,err}){const[name,setName]=useState(()=>GT_ST.suggestName(new Date(),t("stuNamePrefix")));const[names,setNames]=useState([]);const[nn,setNn]=useState("");const[tables,setTables]=useState(1);const[nameErr,setNameErr]=useState("");const{groups}=useSavedGroups();const inRef=useRef(null);
const add=()=>{const v=GT_ST.cleanName(nn);if(!v)return;setNames(a=>a.concat([v]));setNn("");if(inRef.current)inRef.current.focus();};
const addGroup=g=>{const have=new Set(names.map(fold));const add2=(g.players||[]).map(x=>GT_ST.cleanName(String(x||""))).filter(x=>x&&!have.has(fold(x)));setNames(a=>a.concat(add2));};
const maxT=Math.max(1,Math.floor(names.length/4));
const submit=()=>{const v=GT_ST.cleanName(name);if(!v){setNameErr(t("stuErr_NAME_EMPTY"));return;}if(GT_ST.graphemeLength(v)>GT_ST.LIMITS.name)return;onCreate({name:v,participants:names,tables,theme:design});};
return H("div",{className:"gtst-body"},
H("div",{className:"gtst-panel",style:{padding:14}},H(NameField,{id:"gtst-setup-name",label:t("stuNameLabel"),value:name,onChange:v=>{setName(v);setNameErr("");},t:t,error:nameErr})),
H("div",{className:"gtst-panel",style:{padding:14,marginTop:12}},H("label",{className:"gtst-label",htmlFor:"gtst-add"},t("stuParticipants")+" ("+names.length+")"),
H("div",{style:{display:"flex",gap:8}},H("input",{id:"gtst-add",ref:inRef,className:"gtst-input",value:nn,placeholder:t("stuAddPh"),onChange:e=>setNn(e.target.value),enterKeyHint:"enter",autoComplete:"off",onKeyDown:e=>{if(e.key==="Enter"){e.preventDefault();add();}}}),H("button",{type:"button",className:"gtst-btn is-primary",onClick:add,disabled:!GT_ST.cleanName(nn),"aria-label":t("stuAdd"),style:{minWidth:52}},H(Icon,{n:"plus"}))),
groups.length>0&&H("div",{style:{marginTop:10}},H("div",{className:"gtst-cap",style:{marginBottom:6}},t("stuFromGroup")),H("div",{className:"gtst-chips"},groups.map(g=>H("button",{key:g.id,type:"button",className:"gtst-chip",onClick:()=>addGroup(g),style:{paddingLeft:14}},H(Icon,{n:"users",size:18}),H("span",null,g.name+" ("+(g.players||[]).length+")"))))),
names.length>0&&H("ul",{style:{listStyle:"none",margin:"10px 0 0",padding:0,display:"flex",flexWrap:"wrap",gap:6}},names.map((n,i)=>H("li",{key:i},H("button",{type:"button",className:"gtst-chip",onClick:()=>setNames(a=>a.filter((_,j)=>j!==i)),"aria-label":fmt(t("stuRemoveName"),{name:n})},H(Avatar,{id:n+i,name:n,design:UID}),H("span",null,n),H(Icon,{n:"close",size:16}))))),
H("div",{className:"gtst-help"},H("span",null,names.length<4?fmt(t("stuNeedFour"),{n:4-names.length}):t("stuEnoughPeople")))),
H("div",{className:"gtst-panel",style:{padding:14,marginTop:12}},H("div",{className:"gtst-label",id:"gtst-tl"},t("stuTables")),H("div",{className:"gtst-step",role:"group","aria-labelledby":"gtst-tl"},H("button",{type:"button",className:"gtst-btn",onClick:()=>setTables(n=>Math.max(1,n-1)),disabled:tables<=1,"aria-label":t("stuLess")},"−"),H("output",{"aria-live":"polite"},tables),H("button",{type:"button",className:"gtst-btn",onClick:()=>setTables(n=>Math.min(GT_ST.LIMITS.tables,n+1)),disabled:tables>=GT_ST.LIMITS.tables,"aria-label":t("stuMore")},"+")),
H("div",{className:"gtst-help"},H("span",null,names.length>=4?fmt(t("stuTablesHint"),{p:names.length,m:maxT}):t("stuTablesHint0")))),
H("div",{className:"gtst-panel",style:{padding:14,marginTop:12}},H("div",{className:"gtst-label"},t("stuDesign")),H(ThemePick,{value:design,onChange:setDesign,t:t}),H("p",{className:"gtst-help",style:{display:"block"}},t("stuDesignHint"))),
err&&H("p",{className:"gtst-err",role:"alert",style:{margin:"12px 2px 0"}},err),
H("div",{className:"gtst-cta"},H("button",{type:"button",className:"gtst-btn is-primary is-block",onClick:submit},H(Icon,{n:"check"}),t("stuCreate"))));}
/* ---------- Partie waehlen / eintragen ---------- */
function toLocalInput(d){const p=n=>String(n).padStart(2,"0");return d.getFullYear()+"-"+p(d.getMonth()+1)+"-"+p(d.getDate())+"T"+p(d.getHours())+":"+p(d.getMinutes());}
function chronNum(hist){const tm=h=>Date.parse(h.completedAt||h.startedAt||h.createdAt)||0;const c=hist.slice().sort((a,b)=>tm(a)-tm(b)||a.seq-b.seq);const num={};c.forEach((h,i)=>num[h.id]=i+1);return{num,chron:c};}
function MatchSheet({mode,tour,tableId,match,prefill,t,lang,lbl,design,onClose,onSaved}){
const occ=GT_ST.occupancy(tour);const d=GT_ST.derive(tour);const games={};d.standings.forEach(s=>games[s.id]=s.games);
const init=match?[match.teamA[0],match.teamA[1],match.teamB[0],match.teamB[1]]:prefill?[prefill.teamA[0],prefill.teamA[1],prefill.teamB[0],prefill.teamB[1]]:[null,null,null,null];
const[slots,setSlots]=useState(init);const[act,setAct]=useState(()=>{const i=init.indexOf(null);return i<0?0:i;});const[winner,setWinner]=useState(match&&mode==="edit"?match.winner:null);const[q,setQ]=useState("");const[err,setErr]=useState("");const[busy,setBusy]=useState(false);
const op=useRef(GT_ST.uid()).current;const lock=mode==="result";const[when,setWhen]=useState("");const[showWhen,setShowWhen]=useState(false);const whenD=mode==="enter"&&showWhen?(when?new Date(when):null):null;const whenBad=mode==="enter"&&showWhen&&(!whenD||isNaN(whenD.getTime()));const whenFuture=!whenBad&&whenD&&whenD.getTime()>Date.now()+60000;const whenEarly=!whenBad&&whenD&&!whenFuture&&tour.createdAt&&whenD.getTime()<Date.parse(tour.createdAt)-60000;
const tableOf=id=>{const mid=occ.busyIds.has(id)?tour.matches.find(m=>m.status==="running"&&(m.teamA.includes(id)||m.teamB.includes(id))):null;if(!mid||(match&&mid.id===match.id))return null;const tb=tour.tables.find(x=>x.id===mid.tableId);return tb?fmt(t("stuTableN"),{n:tb.number}):t("stuOtherTable");};
const people=tour.participants.slice().sort((a,b)=>a.stableOrder-b.stableOrder).map(p=>{const tb=tableOf(p.id);const absent=p.attendance!=="present";let dis=false,why="";if(mode==="start"){if(tb){dis=true;why=fmt(t("stuBusyAt"),{table:tb});}else if(absent){dis=true;why=t("stuAbsent");}}else{if(tb)why=fmt(t("stuBusyAt"),{table:tb});else if(absent)why=t("stuAbsent");}return{p,dis,why,absent};});
const order=people.slice().sort((a,b)=>(a.dis-b.dis)||(a.absent-b.absent));
const fq=fold(q.trim());const shown=fq?order.filter(x=>fold(x.p.displayName).includes(fq)):order;
const pick=id=>{if(lock)return;setErr("");const at=slots.indexOf(id);if(at>=0){const s=slots.slice();s[at]=null;setSlots(s);setAct(at);return;}const s=slots.slice();let i=s[act]==null?act:s.indexOf(null);if(i<0)i=act;s[i]=id;setSlots(s);const nx=[1,2,3,0].map(k=>(i+k)%4).find(k=>s[k]==null);setAct(nx==null?i:nx);if(typeof hapticTap==="function")hapticTap();};
const clearSlot=i=>{if(lock)return;const s=slots.slice();if(s[i]!=null){s[i]=null;setSlots(s);}setAct(i);};
const full=slots.every(x=>x!=null);const A=[slots[0],slots[1]],B=[slots[2],slots[3]];const nm=ids=>ids.map(id=>id?lbl(id):"?").join(" & ");
const needW=mode!=="start";const ready=full&&(!needW||winner)&&!whenBad&&!whenFuture;
const busyNote=mode==="enter"&&full?slots.filter(id=>tableOf(id)).map(id=>fmt(t("stuRetroBusy"),{name:lbl(id),table:tableOf(id)})):[];
const save=()=>{if(!ready||busy)return;setBusy(true);setErr("");let fn;if(mode==="start")fn=x=>GT_ST.startMatch(x,tableId,A,B,op);else if(mode==="enter")fn=x=>GT_ST.enterResult(x,A,B,winner,op,whenD&&!whenBad?{completedAt:whenD.toISOString()}:undefined);else if(mode==="result")fn=x=>GT_ST.completeMatch(x,match.id,winner);else fn=x=>GT_ST.editMatch(x,match.id,{teamA:A,teamB:B,winner});
const res=GT_ST_STORE.commit(tour.id,fn);setBusy(false);if(!res.ok){setErr(errText(t,res,lbl,tour));return;}const m=mode==="start"||mode==="enter"?res.tournament.matches.find(x=>x.operationId===op):res.tournament.matches.find(x=>x.id===match.id);onSaved({mode,match:m,prev:match,teamA:A,teamB:B,winner,noop:res.noop});};
const title=mode==="start"?fmt(t("stuStartAt"),{table:fmt(t("stuTableN"),{n:(tour.tables.find(x=>x.id===tableId)||{}).number||""})}):mode==="result"?t("stuEnterResult"):mode==="edit"?t("stuEditMatch"):t("stuEnterMatch");
const slot=(i)=>{const id=slots[i];return H("button",{key:i,type:"button",className:"gtst-slot"+(id?" is-full":"")+(act===i&&!lock?" is-active":""),onClick:()=>clearSlot(i),disabled:lock,"aria-label":id?fmt(t("stuSlotFull"),{name:lbl(id)}):t("stuSlotEmpty"),"aria-current":act===i&&!lock?"true":undefined},id?H(Avatar,{id,name:lbl(id),design}):H(Icon,{n:"person",size:18}),H("span",{className:"nm"},id?lbl(id):t("stuPick")),id&&!lock&&H(Icon,{n:"close",size:16}));};
const footer=[err&&H("div",{key:"e",className:"gtst-err",role:"alert"},err),H("button",{key:"s",type:"button",className:"gtst-btn is-primary is-block",disabled:!ready||busy,onClick:save,style:{minHeight:52}},H(Icon,{n:mode==="start"?"play":"check"}),mode==="start"?t("stuStartBtn"):t("stuSaveResult"))];
return H(Sheet,{title,onClose,footer},
mode==="enter"&&H("p",{className:"gtst-help",style:{marginTop:0,marginBottom:10}},t("stuEnterHint")),
H("div",{className:"gtst-slots"},H("div",{className:"gtst-tbox"},H("b",null,t("stuTeamA")),slot(0),slot(1)),H("div",{className:"gtst-tbox"},H("b",null,t("stuTeamB")),slot(2),slot(3))),
!lock&&H("div",{style:{marginTop:12}},tour.participants.length>8&&H("div",{style:{position:"relative"}},H("label",{className:"gtst-label",htmlFor:"gtst-q",style:{position:"absolute",width:1,height:1,overflow:"hidden",clip:"rect(0 0 0 0)"}},t("stuSearch")),H("input",{id:"gtst-q",type:"search",className:"gtst-input",placeholder:t("stuSearch"),value:q,onChange:e=>setQ(e.target.value),autoComplete:"off",style:{paddingLeft:40}}),H("span",{style:{position:"absolute",left:12,top:14,color:"var(--st-muted)"}},H(Icon,{n:"search",size:20}))),
H("div",{className:"gtst-plist2",role:"group","aria-label":t("stuPeople")},shown.map(({p,dis,why})=>{const at=slots.indexOf(p.id);return H("button",{key:p.id,type:"button",className:"gtst-pbtn",disabled:dis&&at<0,"aria-pressed":at>=0?"true":"false",onClick:()=>pick(p.id)},H(Avatar,{id:p.id,name:lbl(p.id),design}),H("span",{className:"nm"},lbl(p.id),H("span",{className:"gtst-sub"},fmt(t(games[p.id]===1?"stuGamesOne":"stuGamesOther"),{n:games[p.id]||0}))),why&&H("span",{className:"why"},why),at>=0&&H("span",{className:"gtst-tag","aria-label":at<2?t("stuTeamA"):t("stuTeamB")},at<2?"A":"B"));}),shown.length===0&&H("p",{className:"gtst-help"},t("stuNoHits")))),
needW&&H("div",{style:{marginTop:16}},H("div",{className:"gtst-label",id:"gtst-wl"},t("stuWhoWon")),H("div",{className:"gtst-win",role:"group","aria-labelledby":"gtst-wl"},["A","B"].map(w=>H("button",{key:w,type:"button",className:"gtst-wbtn","aria-pressed":winner===w?"true":"false",disabled:!full,onClick:()=>{setWinner(w);setErr("");}},H("span",{style:{display:"flex",alignItems:"center",gap:6}},winner===w&&H(Icon,{n:"check",size:18}),w==="A"?t("stuTeamAWins"):t("stuTeamBWins")),H("small",null,full?nm(w==="A"?A:B):t("stuPickFour")))))),
ready&&needW&&H("div",{className:"gtst-sum",style:{marginTop:14},"aria-live":"polite"},fmt(t("stuSummary"),{w:nm(winner==="A"?A:B),l:nm(winner==="A"?B:A)}),H("div",{className:"gtst-prev"},(winner==="A"?A:B).map(id=>H("span",{key:id},"+1 "+lbl(id))),(winner==="A"?B:A).map(id=>H("span",{key:id},"−1 "+lbl(id))))),
mode==="start"&&full&&H("div",{className:"gtst-sum",style:{marginTop:14}},fmt(t("stuStartSummary"),{a:nm(A),b:nm(B)})),
mode==="enter"&&H("div",{style:{marginTop:14}},!showWhen?H("div",{className:"gtst-when"},H("span",{style:{minWidth:0}},H("span",{className:"gtst-label",style:{margin:0}},t("stuWhen")),H("span",{className:"gtst-sub"},t("stuWhenNow"))),H("button",{type:"button",className:"gtst-btn is-small",onClick:()=>{setWhen(toLocalInput(new Date()));setShowWhen(true);setTimeout(()=>{const el=document.getElementById("gtst-when");if(el)el.focus();},0);}},H(Icon,{n:"pencil",size:16}),t("stuWhenChange"))):H("div",null,H("label",{className:"gtst-label",htmlFor:"gtst-when"},t("stuWhen")),H("div",{style:{display:"flex",gap:8}},H("input",{id:"gtst-when",type:"datetime-local",className:"gtst-input",value:when,max:toLocalInput(new Date()),step:60,onChange:e=>{setWhen(e.target.value);setErr("");},"aria-invalid":(whenFuture||whenBad)?"true":"false","aria-describedby":"gtst-when-h",style:{minWidth:0}}),H("button",{type:"button",className:"gtst-btn",onClick:()=>{setShowWhen(false);setWhen("");}},t("stuWhenReset"))),H("div",{id:"gtst-when-h",className:"gtst-help"},H("span",{className:(whenFuture||whenBad)?"gtst-err":"",role:(whenFuture||whenBad)?"alert":undefined},whenBad?t("stuWhenInvalid"):whenFuture?t("stuWhenFuture"):whenEarly?fmt(t("stuWhenEarly"),{d:dt(tour.createdAt,lang)}):t("stuWhenHint"))))),
busyNote.length>0&&H("div",{className:"gtst-note",style:{marginTop:10}},busyNote.join(" "),H("br"),t("stuRetroNote")));}
/* ---------- Ansichten ---------- */
function Ranking({tour,d,t,lbl,design,onPeople,ro}){
if(!d.summary.matches){const present=tour.participants.filter(p=>p.attendance==="present").length;return H("div",{className:"gtst-panel gtst-empty"},H("b",null,t("stuRankEmptyT")),present<4?fmt(t("stuRankEmptyFew"),{n:4-present}):t("stuRankEmpty"),present<4&&!ro&&H("div",{style:{marginTop:12}},H("button",{type:"button",className:"gtst-btn",onClick:onPeople},H(Icon,{n:"users",size:18}),t("stuManagePeople"))));}
const lead=d.winners;const final=d.leadersLabelKind==="final";
const row=(s,i)=>{const isLead=s.rank===1;const aria=fmt(t("stuRowAria"),{rank:s.rank,name:lbl(s.id),w:s.wins,l:s.losses,g:s.games,p:pts(s.points)})+(s.tied?" "+t("stuTied"):"");
return H("div",{key:s.id,role:"row",className:"gtst-row"+(isLead?" is-lead":""),"aria-label":aria},H("span",{className:"gtst-rk",role:"cell"},s.rank),H("span",{className:"gtst-nm",role:"cell"},lbl(s.id),H("span",{className:"gtst-sub"},fmt(t(s.games===1?"stuSubOne":"stuSubOther"),{w:s.wins,l:s.losses,g:s.games}))),
H("span",{className:"gtst-col c-t",role:"cell"},H(Tally,{n:s.wins}),H("span",{className:"gtst-num"},s.wins)),H("span",{className:"gtst-col c-t",role:"cell"},H(Tally,{n:s.losses}),H("span",{className:"gtst-num"},s.losses)),H("span",{className:"gtst-col c-n",role:"cell"},s.games),
H("span",{className:"gtst-pt"+(s.points>0?" is-pos":""),role:"cell"},pts(s.points)));};
return H("div",{className:"gtst-rank"},lead.length>0&&H("div",{className:"gtst-lead"},H("div",{className:"gtst-cap"},final?(lead.length>1?t("stuWinnersFinal"):t("stuWinnerFinal")):t("stuLeadingNow")),lead.map(w=>H("div",{key:w.id,style:{marginTop:8}},H("div",{style:{display:"flex",alignItems:"baseline",justifyContent:"space-between",gap:10}},H("div",{className:"gtst-lname"},lbl(w.id)),H("div",{className:"gtst-lpts"},fmt(t(Math.abs(w.points)===1?"stuPointsOne":"stuPointsOther"),{p:pts(w.points)}))),H("div",{className:"gtst-lhint"},w.topPartners&&w.topPartners.length?bestLine(t,w.topPartners.map(x=>lbl(x.id)),w.topPartners[0].wins):t("stuNoSharedWin"))))),
H("div",{className:"gtst-panel",role:"table","aria-label":t("stuTabRank")},H("div",{role:"row",className:"gtst-row gtst-hrow"},H("span",{role:"columnheader","aria-label":t("stuColRank")},t("stuColRankShort")),H("span",{role:"columnheader"},t("stuColName")),H("span",{className:"gtst-col c-t",role:"columnheader"},H("span",{className:"gtst-lg"},t("stuColW")),H("span",{className:"gtst-sh","aria-hidden":true},t("stuColWShort"))),H("span",{className:"gtst-col c-t",role:"columnheader"},H("span",{className:"gtst-lg"},t("stuColL")),H("span",{className:"gtst-sh","aria-hidden":true},t("stuColLShort"))),H("span",{className:"gtst-col c-n",role:"columnheader"},t("stuColG")),H("span",{role:"columnheader",style:{textAlign:"right"}},t("stuColP"))),d.ranked.map(row)),
d.unplayed.length>0&&H("div",{className:"gtst-sec"},H("div",{className:"gtst-sechead"},H("span",{className:"gtst-cap"},t("stuUnplayed")+" ("+d.unplayed.length+")")),H("div",{className:"gtst-panel"},d.unplayed.map(s=>H("div",{key:s.id,className:"gtst-row"},H("span",{className:"gtst-rk",style:{color:"var(--st-muted)"},"aria-label":t("stuNoRank")},"–"),H("span",{className:"gtst-nm"},lbl(s.id),H("span",{className:"gtst-sub",style:{display:"block"}},t("stuNoGamesYet")+(s.attendance!=="present"?" · "+t("stuAbsent"):""))),H("span",{className:"gtst-pt",style:{color:"var(--st-muted)",gridColumn:"-2"}},"0"))))),
H("p",{className:"gtst-help",style:{margin:"10px 2px 0"}},t("stuLegend")));}
function Partners({tour,d,t,lbl,design}){const people=d.standings;const[sel,setSel]=useState(()=>(d.ranked[0]||people[0]||{}).id||null);if(!people.length)return H("div",{className:"gtst-panel gtst-empty"},t("stuNoPeople"));
const cur=people.find(p=>p.id===sel)?sel:people[0].id;const list=d.partnersOf(cur);const withIds=new Set(list.map(x=>x.id));const never=people.filter(p=>p.id!==cur&&!withIds.has(p.id));const n=people.length;const total=n*(n-1)/2;const played=Object.keys(d.pairs).length;const mx=n<=16&&n>=2;
return H("div",{className:"gtst-rank"},H("p",{className:"gtst-help",style:{margin:"0 2px 10px"}},fmt(t("stuPairsInfo"),{k:played,n:total})),
H("div",{className:"gtst-plist"+(mx?" has-mx":"")},H("div",{className:"gtst-chips",role:"group","aria-label":t("stuPickPerson")},people.map(p=>H("button",{key:p.id,type:"button",className:"gtst-chip","aria-pressed":cur===p.id?"true":"false",onClick:()=>setSel(p.id)},H(Avatar,{id:p.id,name:lbl(p.id),design}),H("span",null,lbl(p.id))))),
H("div",{className:"gtst-panel",style:{marginTop:4}},H("div",{className:"gtst-prow gtst-hrow"},H("span",{className:"gtst-cap"},fmt(t("stuPartnersOf"),{name:lbl(cur)})),H("span",{className:"gtst-cap"},t("stuBalance"))),list.length===0&&H("div",{className:"gtst-empty",style:{padding:"14px 12px"}},t("stuNoPartnerYet")),list.map(x=>H("div",{key:x.id,className:"gtst-prow"},H("span",{className:"gtst-nm"},lbl(x.id),H("span",{className:"gtst-sub",style:{display:"block"}},fmt(t("stuWL"),{w:x.wins,l:x.losses}))),H("span",{className:"gtst-pt"+(x.wins-x.losses>0?" is-pos":"")},pts(x.wins-x.losses)))),
never.length>0&&H("div",{className:"gtst-prow"},H("span",{className:"gtst-nm",style:{fontWeight:500,color:"var(--st-muted)"}},t("stuNeverTogether")+": "+never.map(p=>lbl(p.id)).join(", ")),H("span",{className:"gtst-pt",style:{color:"var(--st-muted)"},"aria-hidden":true},"—")))),
mx&&H("div",{className:"gtst-mxwrap"},H("div",{className:"gtst-mx",tabIndex:0,role:"region","aria-label":t("stuMatrix")},H("table",null,H("caption",{style:{position:"absolute",width:1,height:1,overflow:"hidden",clip:"rect(0 0 0 0)"}},t("stuMatrix")),H("thead",null,H("tr",null,H("th",{scope:"col"},""),people.map(p=>H("th",{key:p.id,scope:"col"},lbl(p.id))))),H("tbody",null,people.map(r=>H("tr",{key:r.id},H("th",{scope:"row"},lbl(r.id)),people.map(c=>{if(c.id===r.id)return H("td",{key:c.id,className:"is-self","aria-label":t("stuSelf")},"");const v=d.pairs[GT_ST.pairKey(r.id,c.id)];if(!v)return H("td",{key:c.id,className:"is-none","aria-label":t("stuNeverTogether")},"—");return H("td",{key:c.id},H("b",null,pts(v.wins-v.losses)),H("small",null,fmt(t("stuWL"),{w:v.wins,l:v.losses})));}))))))));}
function History({tour,d,t,lang,lbl,ro,onEdit,onVoid,onRestore,onResult,onAbort}){const[fp,setFp]=useState("");const[ft,setFt]=useState("");
const{num:hnum,chron}=chronNum(d.history);let items=chron.slice().reverse();if(fp)items=items.filter(h=>h.teamA.includes(fp)||h.teamB.includes(fp));if(ft)items=items.filter(h=>ft==="none"?!h.tableId:h.tableId===ft);
const stLabel=h=>h.status==="running"?t("stuHRunning"):h.status==="aborted"?t("stuHAborted"):h.status==="void"?t("stuHVoid"):null;
const tbls=tour.tables.slice().sort((a,b)=>a.number-b.number);
return H("div",null,d.history.length>0&&H("div",{className:"gtst-filt"},H("select",{className:"gtst-sel",value:fp,onChange:e=>setFp(e.target.value),"aria-label":t("stuFilterPerson")},H("option",{value:""},t("stuAllPeople")),tour.participants.slice().sort((a,b)=>a.stableOrder-b.stableOrder).map(p=>H("option",{key:p.id,value:p.id},lbl(p.id)))),H("select",{className:"gtst-sel",value:ft,onChange:e=>setFt(e.target.value),"aria-label":t("stuFilterTable")},H("option",{value:""},t("stuAllTables")),tbls.map(x=>H("option",{key:x.id,value:x.id},fmt(t("stuTableN"),{n:x.number}))),H("option",{value:"none"},t("stuNoTable")))),
d.history.length===0?H("div",{className:"gtst-panel gtst-empty"},H("b",null,t("stuHistEmptyT")),t("stuHistEmpty")):items.length===0?H("div",{className:"gtst-panel gtst-empty"},t("stuNoHits")):items.map(h=>{const tb=h.tableId?tour.tables.find(x=>x.id===h.tableId):null;const m=tour.matches.find(x=>x.id===h.id);const corr=m&&m.correctionHistory&&m.correctionHistory.length;const sl=stLabel(h);
const team=(ids,w)=>H("div",{className:h.status==="completed"?(w?"is-w":"is-l"):""},H("span",null,ids.map(lbl).join(" & ")),h.status==="completed"&&w&&H("span",{className:"gtst-badge is-win"},H(Icon,{n:"check",size:13,sw:2.6}),t("stuWin")));
return H("div",{key:h.id,className:"gtst-panel gtst-hist",style:h.status==="void"||h.status==="aborted"?{opacity:.78}:null},H("div",{className:"gtst-hmeta"},H("b",null,fmt(t("stuMatchN"),{n:hnum[h.id]})),H("span",null,(tb?fmt(t("stuTableN"),{n:tb.number})+" · ":"")+dt(h.completedAt||h.startedAt||h.createdAt,lang)),sl&&H("span",{className:"gtst-badge"},sl),h.entryKind==="retrospective"&&H("span",{className:"gtst-badge"},t("stuHRetro")),corr?H("span",{className:"gtst-badge"},t("stuHCorrected")):null),
H("div",{className:"gtst-hteams"},team(h.teamA,h.winner==="A"),H("div",{className:"gtst-vs"},t("stuVs")),team(h.teamB,h.winner==="B")),
!ro&&H("div",{className:"gtst-acts"},h.status==="completed"&&[H("button",{key:"e",type:"button",className:"gtst-btn is-small",onClick:()=>onEdit(m)},H(Icon,{n:"pencil",size:17}),t("stuEdit")),H("button",{key:"v",type:"button",className:"gtst-btn is-small is-danger",onClick:()=>onVoid(m)},H(Icon,{n:"trash",size:17}),t("stuRemove"))],h.status==="void"&&H("button",{type:"button",className:"gtst-btn is-small",onClick:()=>onRestore(m)},H(Icon,{n:"undo",size:17}),t("stuRestore")),h.status==="running"&&[H("button",{key:"r",type:"button",className:"gtst-btn is-small",onClick:()=>onResult(m)},t("stuEnterResult")),H("button",{key:"a",type:"button",className:"gtst-btn is-small is-danger",onClick:()=>onAbort(m)},t("stuAbort"))]));}));}
function Tables({tour,d,occ,t,lang,lbl,ro,onStart,onResult,onAbort,onAgain}){const[all,setAll]=useState(false);const tbls=tour.tables.filter(x=>x.enabled).sort((a,b)=>a.number-b.number);const many=tbls.length>3;const freePeople=occ.resting.length;
const vis=many&&!all?tbls.filter(x=>occ.tableState[x.id]==="running"):tbls;
const lastAt=tb=>{for(let i=tour.matches.length-1;i>=0;i--){const m=tour.matches[i];if(m.tableId===tb.id&&m.status==="completed")return m;}return null;};
const card=tb=>{const mid=occ.runningByTable[tb.id];const m=mid?tour.matches.find(x=>x.id===mid):null;const last=!m&&lastAt(tb);const againOk=last&&last.teamA.concat(last.teamB).every(id=>!occ.busyIds.has(id)&&(tour.participants.find(p=>p.id===id)||{}).attendance==="present");
return H("div",{key:tb.id,className:"gtst-panel gtst-tbl"},H("div",{className:"gtst-tblhead"},H("span",{className:"gtst-tname"},fmt(t("stuTableN"),{n:tb.number})),H("span",{className:"gtst-state"},m?[H("span",{key:"d",className:"gtst-dot","aria-hidden":true}),fmt(t("stuRunningSince"),{time:dt(m.startedAt,lang,false)})]:t("stuFree"))),
m?H(Fragment,null,H("div",{className:"gtst-teams"},H("div",{className:"gtst-team"},H("b",null,t("stuTeamA")),H("span",null,m.teamA.map(lbl).join(" & "))),H("span",{className:"gtst-vs"},t("stuVs")),H("div",{className:"gtst-team"},H("b",null,t("stuTeamB")),H("span",null,m.teamB.map(lbl).join(" & ")))),!ro&&H("div",{className:"gtst-acts"},H("button",{type:"button",className:"gtst-btn is-primary",onClick:()=>onResult(m)},H(Icon,{n:"check",size:18}),t("stuEnterResult")),H("button",{type:"button",className:"gtst-btn is-danger",onClick:()=>onAbort(m)},t("stuAbort"))))
:!ro&&H("div",{className:"gtst-acts"},H("button",{type:"button",className:"gtst-btn",onClick:()=>onStart(tb.id),disabled:freePeople<4},H(Icon,{n:"play",size:16}),t("stuStartBtn")),againOk&&freePeople>=4&&H("button",{type:"button",className:"gtst-btn is-ghost",onClick:()=>onAgain(tb.id,last)},H(Icon,{n:"copy",size:18}),t("stuAgain"))));};
return H("div",{className:"gtst-sec"},H("div",{className:"gtst-sechead"},H("span",{className:"gtst-cap"},fmt(t(tbls.length===1?"stuTablesOne":"stuTablesOther"),{n:tbls.length})),many&&H("button",{type:"button",className:"gtst-btn is-ghost is-small","aria-expanded":all?"true":"false",onClick:()=>setAll(v=>!v)},all?t("stuOnlyRunning"):fmt(t("stuShowAllTables"),{n:tbls.length}))),
many&&!all&&vis.length===0&&H("div",{className:"gtst-panel gtst-people"},fmt(t("stuAllFree"),{n:tbls.length})),vis.map(card),
!ro&&occ.present>=4&&freePeople<4&&occ.freeTables.length>0&&H("p",{className:"gtst-help",style:{margin:"0 2px 8px"}},t("stuTooFewFree")),
(occ.resting.length>0&&Object.keys(occ.runningByTable).length>0||occ.absent.length>0)&&H("div",{className:"gtst-panel gtst-people"},occ.resting.length>0&&Object.keys(occ.runningByTable).length>0&&H("div",null,H("span",{className:"gtst-cap"},fmt(t("stuResting"),{n:occ.resting.length})),occ.resting.map(lbl).join(", ")),occ.absent.length>0&&H("div",{style:{marginTop:occ.resting.length&&Object.keys(occ.runningByTable).length?8:0}},H("span",{className:"gtst-cap"},fmt(t("stuAbsentN"),{n:occ.absent.length})),occ.absent.map(lbl).join(", "))));}
function PeopleSheet({tour,t,lbl,design,onClose,toast}){const[nn,setNn]=useState("");const[edit,setEdit]=useState(null);const[ev,setEv]=useState("");const[err,setErr]=useState("");const[rm,setRm]=useState(null);const{groups}=useSavedGroups();const d=GT_ST.derive(tour);const occ=GT_ST.occupancy(tour);const ro=tour.status==="completed";
const games={};d.standings.forEach(s=>games[s.id]=s.games);
const c=(fn,ok)=>{const r=GT_ST_STORE.commit(tour.id,fn);if(!r.ok){setErr(errText(t,r,lbl,tour));return false;}setErr("");if(ok)ok(r);return true;};
const add=()=>{const v=GT_ST.cleanName(nn);if(!v)return;if(c(x=>GT_ST.addParticipant(x,v)))setNn("");};
const addGroup=g=>{const have=new Set(tour.participants.map(p=>fold(p.displayName)));const list=(g.players||[]).map(x=>GT_ST.cleanName(String(x||""))).filter(x=>x&&!have.has(fold(x)));if(!list.length){setErr(t("stuGroupAllIn"));return;}c(x=>list.reduce((a,n)=>GT_ST.addParticipant(a,n),x));};
return H(Sheet,{title:t("stuManagePeople"),onClose},ro&&H("div",{className:"gtst-ro"},t("stuReadonlyPeople")),
!ro&&H("div",{style:{display:"flex",gap:8,marginBottom:8}},H("label",{htmlFor:"gtst-padd",style:{position:"absolute",width:1,height:1,overflow:"hidden",clip:"rect(0 0 0 0)"}},t("stuAddPh")),H("input",{id:"gtst-padd",className:"gtst-input",value:nn,placeholder:t("stuAddPh"),onChange:e=>setNn(e.target.value),autoComplete:"off",enterKeyHint:"enter",onKeyDown:e=>{if(e.key==="Enter"){e.preventDefault();add();}},"data-autofocus":"1"}),H("button",{type:"button",className:"gtst-btn is-primary",onClick:add,disabled:!GT_ST.cleanName(nn),style:{minWidth:52},"aria-label":t("stuAdd")},H(Icon,{n:"plus"}))),
!ro&&groups.length>0&&H("div",{className:"gtst-chips"},groups.map(g=>H("button",{key:g.id,type:"button",className:"gtst-chip",onClick:()=>addGroup(g),style:{paddingLeft:14}},H(Icon,{n:"users",size:18}),H("span",null,fmt(t("stuAddGroup"),{name:g.name}))))),
err&&H("p",{className:"gtst-err",role:"alert",style:{margin:"4px 0 8px"}},err),
H("div",{className:"gtst-panel",style:{marginTop:6}},tour.participants.slice().sort((a,b)=>a.stableOrder-b.stableOrder).map(p=>{const g=games[p.id]||0;const busy=occ.busyIds.has(p.id);const present=p.attendance==="present";
if(edit===p.id){const save=()=>{const v=GT_ST.cleanName(ev);if(!v){setErr(t("stuErr_NAME_EMPTY"));return;}if(c(x=>GT_ST.renameParticipant(x,p.id,v)))setEdit(null);};return H("div",{key:p.id,className:"gtst-prow",style:{gridTemplateColumns:"1fr"}},H("label",{className:"gtst-label",htmlFor:"gtst-ren"},fmt(t("stuRenameP"),{name:lbl(p.id)})),H("input",{id:"gtst-ren",className:"gtst-input",value:ev,onChange:e=>setEv(e.target.value),autoFocus:true,onKeyDown:e=>{if(e.key==="Enter"){e.preventDefault();save();}if(e.key==="Escape"){e.stopPropagation();setEdit(null);}}}),H("div",{className:"gtst-acts"},H("button",{type:"button",className:"gtst-btn is-primary",onClick:save},t("stuSave")),H("button",{type:"button",className:"gtst-btn",onClick:()=>setEdit(null)},t("stuCancel"))));}
return H("div",{key:p.id,className:"gtst-prow",style:{gridTemplateColumns:"auto minmax(0,1fr) auto"}},H(Avatar,{id:p.id,name:lbl(p.id),design}),H("span",{className:"gtst-nm"},lbl(p.id),H("span",{className:"gtst-sub",style:{display:"block"}},fmt(t(g===1?"stuGamesOne":"stuGamesOther"),{n:g})+(busy?" · "+t("stuPlayingNow"):"")+(!present?" · "+t("stuAbsent"):""))),
!ro&&H("div",{style:{display:"flex",gap:2,flexWrap:"wrap",justifyContent:"flex-end"}},H("button",{type:"button",className:"gtst-ibtn",onClick:()=>{setEdit(p.id);setEv(p.displayName);setErr("");},"aria-label":fmt(t("stuRenameP"),{name:lbl(p.id)})},H(Icon,{n:"pencil",size:19})),
H("button",{type:"button",className:"gtst-btn is-small",disabled:busy&&present,title:busy&&present?t("stuBusyCannotLeave"):undefined,onClick:()=>c(x=>GT_ST.setAttendance(x,p.id,present?"absent":"present"))},present?t("stuSetAbsent"):t("stuSetPresent")),
g===0&&!busy&&H("button",{type:"button",className:"gtst-btn is-small is-danger",onClick:()=>{if(rm!==p.id){setRm(p.id);return;}setRm(null);c(x=>GT_ST.removeParticipant(x,p.id));}},rm===p.id?t("stuReallyRemove"):H(Icon,{n:"trash",size:18}))));})),
!ro&&H("p",{className:"gtst-help"},t("stuPeopleHint")));}
function ConfirmSheet({title,text,ok,danger,onOk,onClose,children,okDisabled,cancel}){return H(Sheet,{title,onClose,footer:[H("button",{key:"o",type:"button",className:"gtst-btn is-block "+(danger?"is-danger":"is-primary"),onClick:onOk,disabled:okDisabled,"data-autofocus":"1",style:{minHeight:52,borderColor:danger?"var(--st-danger)":undefined}},ok),H("button",{key:"c",type:"button",className:"gtst-btn is-block is-ghost",onClick:onClose},cancel)]},text&&H("p",{style:{margin:"0 0 10px",font:"500 15px/1.5 var(--st-ui)"}},text),children);}
/* ---------- Turnieransicht ---------- */
function TourView({tour,t,lang,toast,openSheet,goList,onRename}){const d=GT_ST.derive(tour);const occ=GT_ST.occupancy(tour);const{lbl}=useLabels(tour);const[tab,setTab]=useState("rank");const ro=tour.status==="completed";const design=UID;
const runningCount=Object.keys(occ.runningByTable).length;
const tabs=[["rank",t("stuTabRank"),t("stuTabRankShort")],["pairs",t("stuTabPairs"),t("stuTabPairsShort")],["hist",t("stuTabHist"),t("stuTabHistShort")]];
const onTabKey=e=>{const i=tabs.findIndex(x=>x[0]===tab);if(e.key==="ArrowRight"||e.key==="ArrowLeft"){e.preventDefault();const n=(i+(e.key==="ArrowRight"?1:2))%3;setTab(tabs[n][0]);const b=e.currentTarget.querySelectorAll("[role=tab]")[n];if(b)b.focus();}};
const act={onStart:tid=>openSheet({k:"match",mode:"start",tableId:tid}),onAgain:(tid,m)=>openSheet({k:"match",mode:"start",tableId:tid,prefill:{teamA:m.teamA,teamB:m.teamB}}),onResult:m=>openSheet({k:"match",mode:"result",match:m}),onAbort:m=>openSheet({k:"abort",match:m}),onEdit:m=>openSheet({k:"match",mode:"edit",match:m}),
onVoid:m=>{const r=GT_ST_STORE.commit(tour.id,x=>GT_ST.voidMatch(x,m.id));if(!r.ok){toast({msg:errText(t,r,lbl,tour)});return;}toast({msg:fmt(t("stuToastVoid"),{n:chronNum(d.history).num[m.id]||""}),undo:()=>GT_ST_STORE.commit(tour.id,x=>GT_ST.restoreMatch(x,m.id))});},
onRestore:m=>{const r=GT_ST_STORE.commit(tour.id,x=>GT_ST.restoreMatch(x,m.id));if(!r.ok)toast({msg:errText(t,r,lbl,tour)});else toast({msg:t("stuToastRestored")});}};
const tablesEl=H(Tables,Object.assign({tour,d,occ,t,lang,lbl,ro},act));
const canEnter=!ro&&tour.participants.length>=4;
return H(Fragment,null,
H("div",{className:"gtL-split"},H("div",{className:"gtL-col-main"},H("div",{className:"gtst-body"},
ro&&H("div",{className:"gtst-ro",role:"status"},H("b",{style:{display:"block",marginBottom:2}},d.summary.matches?t("stuDoneBannerT"):t("stuStatusUnrated")),t("stuDoneBanner"),H("div",{className:"gtst-acts",style:{marginTop:10}},H("button",{type:"button",className:"gtst-btn",onClick:()=>openSheet({k:"reopen"})},H(Icon,{n:"reopen",size:18}),t("stuReopen")),H("button",{type:"button",className:"gtst-btn is-primary",onClick:()=>openSheet({k:"export"}),disabled:typeof GtStExportSheet!=="function"},H(Icon,{n:"share",size:18}),t("stuExport")))),
H("div",{className:"gtst-tabs",role:"tablist","aria-label":t("stuViews"),onKeyDown:onTabKey},tabs.map(([k,l,sl])=>H("button",{key:k,type:"button",role:"tab","aria-label":l,id:"gtst-tab-"+k,"aria-selected":tab===k?"true":"false","aria-controls":"gtst-panel-"+k,tabIndex:tab===k?0:-1,className:"gtst-tab",onClick:()=>setTab(k)},H("span",{className:"gtst-tl"},l),H("span",{className:"gtst-ts","aria-hidden":true},sl)))),
H("div",{role:"tabpanel",id:"gtst-panel-"+tab,"aria-labelledby":"gtst-tab-"+tab},tab==="rank"?H(Ranking,{tour,d,t,lbl,design,ro,onPeople:()=>openSheet({k:"people"})}):tab==="pairs"?H(Partners,{tour,d,t,lbl,design}):H(History,Object.assign({tour,d,t,lang,lbl,ro},act))))),
H("div",{className:"gtL-col-side"},H("div",{className:"gtst-body",style:{marginTop:12}},!ro&&tablesEl,
!ro&&H("div",{className:"gtst-cta"},H("button",{type:"button",className:"gtst-btn is-primary is-block",disabled:!canEnter,onClick:()=>openSheet({k:"match",mode:"enter"})},H(Icon,{n:"plus"}),t("stuEnterMatch")),!canEnter&&H("p",{className:"gtst-help",style:{margin:0}},t("stuNeedFourShort"))),
!ro&&H("div",{className:"gtst-acts",style:{marginTop:8}},H("button",{type:"button",className:"gtst-btn",onClick:()=>openSheet({k:"people"})},H(Icon,{n:"users",size:18}),t("stuPeopleBtn")),H("button",{type:"button",className:"gtst-btn",onClick:()=>openSheet({k:"end"})},H(Icon,{n:"flag",size:18}),t("stuEndTour"))),
ro&&H("div",{className:"gtst-acts"},H("button",{type:"button",className:"gtst-btn",onClick:()=>openSheet({k:"people"})},H(Icon,{n:"users",size:18}),t("stuPeopleBtn")),H("button",{type:"button",className:"gtst-btn",onClick:goList},H(Icon,{n:"list",size:18}),t("stuAllTours")))))));}
/* ---------- Kopf ---------- */
function stuTitleParts(nm){const s=String(nm||"");const k=s.lastIndexOf(" \u00b7 ");if(k<=0)return s;const d=s.slice(k+3);if(d.length>12||!/\d/.test(d))return s;return[s.slice(0,k),H("span",{key:"d",style:{display:"block",fontSize:".6em",fontWeight:600,opacity:.8,letterSpacing:0,marginTop:3}},d)];} function TourHead({tour,t,lang,onRename}){const d=GT_ST.derive(tour);const occ=GT_ST.occupancy(tour);const[ed,setEd]=useState(false);const[v,setV]=useState(tour.name);const[err,setErr]=useState("");const btn=useRef(null);
const st=tour.status==="completed"?(d.summary.matches?t("stuStatusDone"):t("stuStatusUnrated")):tour.status==="draft"?t("stuStatusDraft"):t("stuStatusRunning");
const save=()=>{const x=GT_ST.cleanName(v);if(!x){setErr(t("stuErr_NAME_EMPTY"));return;}if(GT_ST.graphemeLength(x)>GT_ST.LIMITS.name)return;const r=onRename(x);if(r&&!r.ok){setErr(r.msg);return;}setEd(false);setTimeout(()=>{if(btn.current)btn.current.focus();},0);};
const tables=tour.tables.filter(x=>x.enabled).length;
return H("div",{className:"gtst-head"},false&&H("div",{className:"gtst-grandart","aria-hidden":true},H(Suit,{s:"heart",size:74,fill:"#FF7659",stroke:"none",style:{position:"absolute",right:36,top:0}}),H(Suit,{s:"spade",size:68,fill:"#071743",stroke:"none",style:{position:"absolute",right:0,top:18}})),
H("div",{"aria-hidden":true,style:{display:"flex",gap:8,color:"var(--st-hmuted)",marginBottom:2,position:"relative",zIndex:1}},["heart","diamond","club","spade"].map(s=>H(Suit,{key:s,s,size:15,sw:1.4}))),
ed?H("div",{className:"gtst-panel",style:{padding:12,marginTop:6,background:"var(--st-body-solid)",color:"var(--st-ink)",position:"relative",zIndex:2}},H(NameField,{id:"gtst-rename",label:t("stuRenameTour"),value:v,onChange:x=>{setV(x);setErr("");},t,error:err,onEnter:save}),H("div",{className:"gtst-acts",style:{marginTop:10}},H("button",{type:"button",className:"gtst-btn is-primary",onClick:save},t("stuSave")),H("button",{type:"button",className:"gtst-btn",onClick:()=>{setEd(false);setV(tour.name);setErr("");}},t("stuCancel"))))
:H("div",{className:"gtst-titlerow"},H("h2",{className:"gtst-title"},stuTitleParts(tour.name)),H("button",{ref:btn,type:"button",className:"gtst-ibtn",onClick:()=>{setV(tour.name);setEd(true);},"aria-label":t("stuRenameTour"),style:{color:"var(--st-hink)",marginTop:-2}},H(Icon,{n:"pencil",size:20}))),
false&&H("svg",{className:"gtst-under",viewBox:"0 0 200 8",preserveAspectRatio:"none","aria-hidden":true},H("path",{d:"M2 5.5C40 3 90 2.6 130 3.4S185 5 198 3.6",stroke:"currentColor",strokeWidth:2.6,fill:"none",strokeLinecap:"round"})),
H("div",{className:"gtst-meta"},H("span",null,tour.status==="active"?H("span",{className:"gtst-dot","aria-hidden":true}):tour.status==="completed"?H(Icon,{n:"flag",size:15}):null,st),H("span",null,H(Icon,{n:"users",size:15}),fmt(t(tour.participants.length===1?"stuPersonsOne":"stuPersonsOther"),{n:tour.participants.length})),H("span",null,fmt(t(d.summary.matches===1?"stuMatchesOne":"stuMatchesOther"),{n:d.summary.matches})),H("span",null,H(Icon,{n:"table",size:15}),fmt(t(tables===1?"stuTablesOne":"stuTablesOther"),{n:tables})),Object.keys(occ.runningByTable).length>0&&H("span",null,fmt(t("stuRunningN"),{n:Object.keys(occ.runningByTable).length}))));}
function MenuSheet({tour,t,onClose,openSheet,goList,toast,lbl}){const occ=GT_ST.occupancy(tour);const ro=tour.status==="completed";const n=tour.tables.filter(x=>x.enabled).length;const[err,setErr]=useState("");const exp=typeof GtStExportSheet==="function";
const setT=k=>{const r=GT_ST_STORE.commit(tour.id,x=>GT_ST.setTables(x,k));if(!r.ok)setErr(errText(t,r,lbl,tour));else setErr("");};
return H(Sheet,{title:t("stuMenu"),onClose},H("div",{className:"gtst-label"},t("stuDesign")),H(ThemePick,{value:tour.theme,onChange:k=>{GT_ST_STORE.commit(tour.id,x=>GT_ST.setTheme(x,k));},t}),H("p",{className:"gtst-help",style:{display:"block"}},t("stuDesignHint")),
!ro&&H("div",{style:{marginTop:16}},H("div",{className:"gtst-label",id:"gtst-ml"},t("stuTables")),H("div",{className:"gtst-step",role:"group","aria-labelledby":"gtst-ml"},H("button",{type:"button",className:"gtst-btn",onClick:()=>setT(n-1),disabled:n<=1,"aria-label":t("stuLess")},"−"),H("output",{"aria-live":"polite"},n),H("button",{type:"button",className:"gtst-btn",onClick:()=>setT(n+1),disabled:n>=GT_ST.LIMITS.tables,"aria-label":t("stuMore")},"+")),H("p",{className:"gtst-help"},fmt(t("stuTablesHint"),{p:occ.present,m:occ.maxTables})),err&&H("p",{className:"gtst-err",role:"alert"},err)),
H("div",{style:{marginTop:12}},H("button",{type:"button",className:"gtst-mrow",onClick:()=>openSheet({k:"people"})},H(Icon,{n:"users"}),H("span",null,t("stuManagePeople")),H(Icon,{n:"chev",size:18})),
H("button",{type:"button",className:"gtst-mrow",onClick:()=>openSheet({k:"export"}),disabled:!exp},H(Icon,{n:"share"}),H("span",null,t("stuExport"),!exp&&H("span",{className:"gtst-sub"},t("stuExportSoon"))),H(Icon,{n:"chev",size:18})),
ro?H("button",{type:"button",className:"gtst-mrow",onClick:()=>openSheet({k:"reopen"})},H(Icon,{n:"reopen"}),H("span",null,t("stuReopen")),H(Icon,{n:"chev",size:18})):H("button",{type:"button",className:"gtst-mrow",onClick:()=>openSheet({k:"end"})},H(Icon,{n:"flag"}),H("span",null,t("stuEndTour")),H(Icon,{n:"chev",size:18})),
H("button",{type:"button",className:"gtst-mrow",onClick:()=>openSheet({k:"repeat"})},H(Icon,{n:"copy"}),H("span",null,t("stuRepeat")),H(Icon,{n:"chev",size:18})),
H("button",{type:"button",className:"gtst-mrow",onClick:()=>openSheet({k:"rules"})},H(Icon,{n:"check"}),H("span",null,t("stuRulesT")),H(Icon,{n:"chev",size:18})),
H("button",{type:"button",className:"gtst-mrow",onClick:goList},H(Icon,{n:"list"}),H("span",null,t("stuAllTours")),H(Icon,{n:"chev",size:18})),
H("button",{type:"button",className:"gtst-mrow is-danger",onClick:()=>openSheet({k:"delete"})},H(Icon,{n:"trash"}),H("span",null,t("stuDeleteTour")))));}
/* ---------- Wurzel ---------- */
function SchieberTournament({onBack,onHome,lang="de",theme="dark"}){const t=useT(lang);const snap=useGtStStore();
const[autoId,setAutoId]=useState(()=>{const s=GT_ST_STORE.getSnapshot();const a=s.activeId&&s.list.find(x=>x.id===s.activeId);if(a&&a.status!=="completed")return null;const run=s.list.filter(x=>x.status!=="completed");return run.length===1?run[0].id:null;});
useEffect(()=>{if(autoId){GT_ST_STORE.setActive(autoId);setAutoId(null);}},[]);
const[screen,setScreen]=useState(()=>{const s=GT_ST_STORE.getSnapshot();const a=s.activeId&&s.list.find(x=>x.id===s.activeId);return autoId||a?"tour":s.list.length?"list":"setup";});
const[setupDesign,setSetupDesign]=useState("strichliste");const[sheet,setSheet]=useState(null);const[toastS,setToastS]=useState(null);const[err,setErr]=useState("");const tmr=useRef(null);
const tid=autoId||snap.activeId;const tour=tid?snap.tournaments.find(x=>x.id===tid&&!x.deletedAt)||null:null;
const scr=screen==="tour"&&!tour?(snap.list.length?"list":"setup"):screen;
const{lbl}=useLabels(tour);
const toast=o=>{if(tmr.current)clearTimeout(tmr.current);const id=Date.now();setToastS(Object.assign({id},o));tmr.current=setTimeout(()=>setToastS(s=>s&&s.id===id?null:s),o.undo?7000:3800);};
useEffect(()=>()=>{if(tmr.current)clearTimeout(tmr.current);},[]);
useEffect(()=>{try{window.scrollTo(0,0);}catch(e){}},[scr]);
UID="app:"+stuT(theme);const design=UID;
const openSheet=o=>setSheet(o);const close=()=>setSheet(null);
const goList=()=>{setSheet(null);GT_ST_STORE.setActive(null);setScreen("list");};
const back=()=>{if(scr==="tour"){goList();return;}if(scr==="setup"&&snap.list.length){setScreen("list");return;}onBack();};
const open=id=>{GT_ST_STORE.setActive(id);setScreen("tour");};
const create=o=>{const r=GT_ST_STORE.create(o);if(!r.ok){setErr(errText(t,r,id=>id,null));return;}setErr("");setScreen("tour");};
const del=x=>setSheet({k:"delete",target:x});
const doDelete=x=>{const r=GT_ST_STORE.remove(x.id);close();if(!r.ok){toast({msg:errText(t,r,lbl,x)});return;}if(snap.activeId===x.id)GT_ST_STORE.setActive(null);setScreen(GT_ST_STORE.getSnapshot().list.length?"list":"setup");toast({msg:fmt(t("stuToastDeleted"),{name:x.name}),undo:()=>GT_ST_STORE.restore(x.id)});};
const restore=x=>{const r=GT_ST_STORE.restore(x.id);if(r.ok)toast({msg:fmt(t("stuToastRestoredTour"),{name:x.name})});};
const onSaved=r=>{close();if(r.noop)return;const nm=ids=>ids.map(lbl).join(" & ");const tid=tour.id;
if(r.mode==="start"){toast({msg:fmt(t("stuToastStarted"),{a:nm(r.teamA),b:nm(r.teamB)}),undo:()=>GT_ST_STORE.commit(tid,x=>GT_ST.abortMatch(x,r.match.id))});return;}
const w=r.winner==="A"?r.teamA:r.teamB,l=r.winner==="A"?r.teamB:r.teamA;const msg=fmt(t("stuToastSaved"),{w:nm(w),l:nm(l)});
if(r.mode==="enter")toast({msg,undo:()=>GT_ST_STORE.commit(tid,x=>GT_ST.voidMatch(x,r.match.id))});
else if(r.mode==="edit"&&r.prev){const p=r.prev;toast({msg:t("stuToastEdited"),undo:()=>GT_ST_STORE.commit(tid,x=>GT_ST.editMatch(x,p.id,{teamA:p.teamA,teamB:p.teamB,winner:p.winner}))});}
else toast({msg});};
const commitT=(fn,okMsg)=>{const r=GT_ST_STORE.commit(tour.id,fn);if(!r.ok){toast({msg:errText(t,r,lbl,tour)});return r;}if(okMsg)toast({msg:okMsg});return r;};
const sk=stuSkin(theme);const tk={ink:sk.ink,muted:sk.muted,border:sk.border,card:sk.card};
const hf={border:"1px solid "+tk.border,background:tk.card,width:36,height:36};const homeIc=H("svg",{width:16,height:16,viewBox:"0 0 24 24","aria-hidden":true},H("path",{d:"M4 11l8-7 8 7M6 9.5V20h12V9.5",stroke:"currentColor",strokeWidth:2,fill:"none",strokeLinecap:"round",strokeLinejoin:"round"}));
const menuBtn=H(Fragment,null,H("button",{type:"button",className:"gt-hb",onClick:onHome,"aria-label":t("stuHome"),style:{color:tk.ink}},H("span",{className:"gt-hf",style:hf},homeIc)),scr==="tour"&&tour&&H("button",{type:"button",className:"gt-hb",onClick:()=>openSheet({k:"rules"}),"aria-label":t("stuRulesT"),style:{color:tk.ink}},H("span",{className:"gt-hf",style:hf},H("span",{style:{font:"700 15px/1 Inter,sans-serif"}},"?"))),H("button",{type:"button",className:"gt-hb",onClick:()=>openSheet({k:scr==="tour"&&tour?"menu":"rules"}),"aria-label":scr==="tour"&&tour?t("stuMenu"):t("stuRulesT"),style:{color:tk.ink}},H("span",{className:"gt-hf",style:hf},scr==="tour"&&tour?H(Icon,{n:"dots",size:20,sw:3}):H("span",{style:{font:"700 15px/1 Inter,sans-serif"}},"?"))));
let sheetEl=null;
if(sheet&&tour&&scr==="tour"){const k=sheet.k;const d=GT_ST.derive(tour);
if(k==="match")sheetEl=H(MatchSheet,{key:"m"+(sheet.match?sheet.match.id:"")+sheet.mode+(sheet.tableId||""),mode:sheet.mode,tour,tableId:sheet.tableId,match:sheet.match?tour.matches.find(m=>m.id===sheet.match.id)||sheet.match:null,prefill:sheet.prefill,t,lang,lbl,design,onClose:close,onSaved});
else if(k==="people")sheetEl=H(PeopleSheet,{tour,t,lbl,design,onClose:close,toast});
else if(k==="menu")sheetEl=H(MenuSheet,{tour,t,onClose:close,openSheet,goList,toast,lbl});
else if(k==="abort"){const m=sheet.match;const tb=tour.tables.find(x=>x.id===m.tableId);sheetEl=H(ConfirmSheet,{cancel:t("stuCancel"),title:fmt(t("stuAbortT"),{table:tb?fmt(t("stuTableN"),{n:tb.number}):""}),text:t("stuAbortText"),ok:t("stuAbortOk"),danger:true,onClose:close,onOk:()=>{const r=commitT(x=>GT_ST.abortMatch(x,m.id));if(r.ok){close();toast({msg:t("stuToastAborted")});}}});}
else if(k==="end"){const run=Object.keys(GT_ST.occupancy(tour).runningByTable).length;const w=d.winners;sheetEl=H(ConfirmSheet,{cancel:t("stuCancel"),title:t("stuEndT"),ok:t("stuEndOk"),okDisabled:run>0,onClose:close,onOk:()=>{const r=commitT(x=>GT_ST.completeTournament(x));if(r.ok){close();toast({msg:t("stuToastEnded")});}}},
run>0?H("div",{className:"gtst-note",role:"alert"},fmt(t(run===1?"stuEndBlockedOne":"stuEndBlockedOther"),{n:run})):H("div",null,H("p",{style:{margin:"0 0 10px",font:"500 15px/1.5 var(--st-ui)"}},d.summary.matches?fmt(t("stuEndSummary"),{m:d.summary.matches,p:d.summary.players}):t("stuEndNoMatches")),w.length>0&&H("div",{className:"gtst-sum"},H("div",{className:"gtst-cap",style:{marginBottom:4}},w.length>1?t("stuWinnersFinal"):t("stuWinnerFinal")),w.map(x=>lbl(x.id)+" ("+pts(x.points)+")").join(", ")),H("p",{className:"gtst-help"},t("stuEndHint"))));}
else if(k==="reopen")sheetEl=H(ConfirmSheet,{cancel:t("stuCancel"),title:t("stuReopenT"),text:t("stuReopenText"),ok:t("stuReopen"),onClose:close,onOk:()=>{const r=commitT(x=>GT_ST.reopenTournament(x));if(r.ok){close();toast({msg:t("stuToastReopened")});}}});
else if(k==="delete")sheetEl=H(ConfirmSheet,{cancel:t("stuCancel"),title:fmt(t("stuDeleteT"),{name:tour.name}),text:t("stuDeleteText"),ok:t("stuDeleteOk"),danger:true,onClose:close,onOk:()=>doDelete(tour)});
else if(k==="repeat")sheetEl=H(ConfirmSheet,{cancel:t("stuCancel"),title:t("stuRepeat"),text:fmt(t("stuRepeatText"),{n:tour.participants.length}),ok:t("stuRepeatOk"),onClose:close,onOk:()=>{let nt;try{nt=GT_ST.repeatTournament(tour,{name:GT_ST.suggestName(new Date(),t("stuNamePrefix"))});}catch(e){toast({msg:t("stuErrGeneric")});return;}const r=GT_ST_STORE.create({name:nt.name,participants:nt.participants.map(p=>({displayName:p.displayName,profileId:p.profileId})),tables:nt.tables.filter(x=>x.enabled).length,theme:nt.theme});close();if(!r.ok){toast({msg:errText(t,r,lbl,tour)});return;}toast({msg:t("stuToastRepeated")});}});
else if(k==="export")sheetEl=typeof GtStExportSheet==="function"?H(GtStExportSheet,{tournament:tour,t,onClose:close,initialTheme:tour.theme}):null;}
if(sheet&&sheet.k==="rules")sheetEl=H(Sheet,{title:t("stuRulesT"),onClose:close},String(t("stuRules")).split("\n\n").map((x,i)=>H("p",{key:i,style:{margin:"0 0 12px",font:"500 15px/1.55 var(--st-ui)"}},x)));
else if(sheet&&sheet.k==="delete"&&sheet.target)sheetEl=H(ConfirmSheet,{cancel:t("stuCancel"),title:fmt(t("stuDeleteT"),{name:sheet.target.name}),text:t("stuDeleteText"),ok:t("stuDeleteOk"),danger:true,onClose:close,onOk:()=>doDelete(sheet.target)});
const gtitle=t("stuMode");
return H("div",{className:"gtL-shellpage gtst","data-d":"app","data-t":stuT(theme),lang:lang,style:stuRoot(theme)},H("style",null,GLOBAL_STYLES,CSS),
H("div",{className:"gtL-page gtL-game",style:{maxWidth:scr==="tour"?380:420,margin:"0 auto"}},
H(GameHeader,{title:gtitle,subtitle:scr==="list"?t("stuListSub"):scr==="setup"?t("stuSetupSub"):null,onBack:back,backLabel:t("back"),tk,accent:sk.txt,icon:H(GtStuLogo,{color:sk.txt}),extra:menuBtn}),
snap.error&&snap.error.code==="STORAGE"&&H("div",{className:"gtst-note",role:"alert",style:{marginBottom:10,background:"var(--st-body-solid)"}},t("stuErr_STORAGE"),H("button",{type:"button",className:"gtst-btn is-small",style:{marginLeft:8},onClick:()=>GT_ST_STORE.dismissError()},t("stuOk"))),
scr==="tour"&&tour?H(Fragment,null,H(TourHead,{tour,t,lang,onRename:nm=>{const r=GT_ST_STORE.commit(tour.id,x=>GT_ST.rename(x,nm));return r.ok?r:{ok:false,msg:errText(t,r,lbl,tour)};}}),H(TourView,{tour,t,lang,toast,openSheet,goList}))
:scr==="setup"?H(SetupView,{t,lang,design:setupDesign,setDesign:setSetupDesign,onCreate:create,err})
:H(ListView,{snap,t,lang,onOpen:open,onNew:()=>{setErr("");setScreen("setup");},onDelete:del,onRestore:restore})),
sheetEl,
toastS&&H("div",{key:toastS.id,className:"gtst-toast",role:"status","aria-live":"polite"},H("span",null,toastS.msg),toastS.undo&&H("button",{type:"button",className:"gtst-btn is-small",onClick:()=>{const u=toastS.undo;setToastS(null);const r=u();if(r&&r.ok===false)toast({msg:errText(t,r,lbl,tour)});}},H(Icon,{n:"undo",size:17}),t("stuUndo"))));}
return{SchieberTournament,GtStuLogo};})();
function gtStuResume(t,theme){try{const n=GT_ST_STORE.getSnapshot().list.filter(x=>x.status!=="completed").length;if(!n)return[];const c=showcaseAccent("jass","#D52B1E",theme);return[{id:"schieber-turnier",label:t("stuMode"),accent:c,logo:React.createElement(GtStuLogo,{color:c})}];}catch(e){return[];}}/*@gt-body-end*/
export { SchieberTournament, GtStuLogo, gtStuResume };
