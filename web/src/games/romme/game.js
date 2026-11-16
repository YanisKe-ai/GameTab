// Erzeugt von tools/split.mjs aus index.html. Inhalt zwischen den gt-body-Markern ist 1:1 Originalcode.
import { isHell, hc } from "../../themes/hell.js";
import { React } from "../../vendor/react-globals.js";
import { useState } from "../../prelude.js";
import { useGtDialog } from "../../shared/dialog.js";
import { XMark } from "../../assets/icons.js";
import { GtCount, GtRing, gtLeader } from "../../shared/fx.js";
import { ROM_TK, RommeLogo, S8E, S8F, S8GameOver, S8History, S8I, S8Players, S8Wrap, s8Ghost, s8Hint, s8Lbl, s8NumPad, s8Prim, s8Record, s8Skin, s8Switch, s8Tok } from "../s8/shared.js";
import { useT } from "../../i18n/use-t.js";
import { gtIsObj, gtNum } from "../../app/storage.js";
import { GameIcon } from "../../assets/icons.js";
import { GtChips, GtStartBar } from "../../shared/setup-ui.js";
import { GtDock } from "../../shared/unit.js";
import { GtBars } from "../../shared/unit-games.js";
import { GtlStandings } from "../../shared/laptop-keys.js";
import { usePlakat } from "../../themes/theme-id.js";
/*@gt-body-begin*/
/* Rommé. Wertung (de.wikipedia, Rommé): wer Rommé macht 0, sonst Handkarten: Joker 20, Ass 11, König/Dame/Bube 10, Zahlen nach Wert.
   Hand-Rommé (alles auf einmal ausgelegt): die anderen zahlen doppelt. Ende bei Zielpunktzahl, weniger Punkte gewinnt. */
const ROM_CARDS=[["J",20],["A",11],["K",10],["D",10],["B",10],["10",10],["9",9],["8",8],["7",7],["6",6],["5",5],["4",4],["3",3],["2",2]];
const ROM_VAL=Object.fromEntries(ROM_CARDS);
function romCalc(players,history){return players.map(p=>({...p,total:(history||[]).reduce((s,r)=>s+(gtIsObj(r)?(gtNum(r.scores&&r.scores[p.id])||0):0),0)}));}
function romSum(cards){return(cards||[]).reduce((s,c)=>s+(ROM_VAL[c]||0),0);}
function romCards(x){return Array.isArray(x)?x.filter(c=>ROM_VAL[c]!=null).slice(0,40):[];}
function romDraft(dr,players){const ids=players.map(p=>p.id);const cards={},tch={};ids.forEach(id=>{cards[id]=romCards(dr&&dr.cards&&dr.cards[id]);tch[id]=!!(dr&&dr.tch&&dr.tch[id]);});const out=dr&&ids.some(id=>String(id)===String(dr.out))?dr.out:null;const step=dr&&dr.step==="cards"&&out!=null?"cards":"out";const cur=dr&&Number.isInteger(dr.cur)&&dr.cur>=0?dr.cur:0;return{step,out,hand:!!(dr&&dr.hand),cards,tch,cur,zc:dr&&dr.zc!=null?dr.zc:null};}
const ROM_CSS=`
.rm-flow{display:grid;gap:10px;grid-template-columns:minmax(0,1fr)}
.rm-seg{display:grid;grid-template-columns:1fr 1fr;gap:4px;padding:4px;border-radius:16px;background:var(--r-card);border:1px solid var(--r-line)}
.rm-seg button{height:44px;border:0;border-radius:12px;background:transparent;color:var(--r-muted);font:700 15px 'Inter',sans-serif;cursor:pointer;padding:0}
.rm-seg button[aria-selected="true"]{background:var(--r-acc);color:var(--r-on)}
.rm-q{margin:4px 0 0;font:800 22px/1.2 'Inter',sans-serif;color:var(--r-ink)}
.rm-qh{margin:0;font:500 13.5px/1.35 'Inter',sans-serif;color:var(--r-muted)}
.rm-tiles{display:grid;grid-template-columns:1fr 1fr;gap:8px}
.rm-tile{min-height:68px;border-radius:16px;border:2px solid var(--r-line);background:var(--r-card);padding:8px 12px;display:flex;flex-direction:column;justify-content:center;gap:2px;cursor:pointer;box-sizing:border-box;min-width:0}
.rm-tile[aria-pressed="true"]{border-color:var(--r-acc);background:color-mix(in oklab,var(--r-acc) 16%,var(--r-card))}
.rm-tn{font:700 17px/1.2 'Inter',sans-serif;color:var(--r-ink);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.rm-tt{font:600 12.5px 'Inter',sans-serif;color:var(--r-muted)}
.rm-hand{display:flex;align-items:center;gap:10px;min-height:56px;border-radius:16px;border:1.5px solid var(--r-line);background:var(--r-card);padding:8px 14px;cursor:pointer;text-align:left;color:var(--r-ink)}
.rm-hand[aria-pressed="true"]{border-color:var(--r-acc)}
.rm-hand span{flex:1;min-width:0;font:700 15px/1.25 'Inter',sans-serif}
.rm-hand small{display:block;font:500 12.5px/1.3 'Inter',sans-serif;color:var(--r-muted)}
.rm-sw{flex:none;width:44px;height:26px;border-radius:13px;background:rgba(127,127,127,.3);position:relative;transition:background .15s}
.rm-sw::after{content:"";position:absolute;left:3px;top:3px;width:20px;height:20px;border-radius:50%;background:#fff;transition:transform .15s ease-out}
.rm-hand[aria-pressed="true"] .rm-sw{background:var(--r-acc)}
.rm-hand[aria-pressed="true"] .rm-sw::after{transform:translateX(18px)}
.rm-strip{display:flex;gap:6px;overflow-x:auto;scrollbar-width:none;padding:2px}
.rm-strip::-webkit-scrollbar{display:none}
.rm-chip{flex:1 0 74px;max-width:132px;min-height:46px;box-sizing:border-box;border-radius:12px;border:1.5px solid var(--r-line);background:var(--r-card);padding:4px 8px;display:flex;flex-direction:column;justify-content:center;cursor:pointer;min-width:0}
.rm-chip[data-s="cur"]{border-color:var(--r-acc)}
.rm-chip[data-s="out"]{opacity:.55;cursor:default}
.rm-cn{font:600 12px/1.2 'Inter',sans-serif;color:var(--r-muted);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.rm-cv{font:800 17px/1.15 'Space Grotesk',sans-serif;color:var(--r-ink)}
.rm-who{display:flex;justify-content:space-between;align-items:flex-end;gap:10px;min-width:0}
.rm-wl{font:600 12.5px 'Inter',sans-serif;color:var(--r-muted)}
.rm-wn{margin:0;font:800 22px/1.15 'Inter',sans-serif;color:var(--r-ink);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.rm-wt{flex:none;text-align:right;font:600 12.5px/1.35 'Inter',sans-serif;color:var(--r-muted)}
.rm-wt b{display:block;font:800 30px/1 'Space Grotesk',sans-serif;color:var(--r-acc)}
.rm-handrow{display:flex;flex-wrap:wrap;gap:5px;min-height:52px;align-content:flex-start;background:var(--r-card);border:1px solid var(--r-line);border-radius:16px;padding:8px;box-sizing:border-box}
.rm-hc{width:36px;height:44px;border-radius:6px;border:1px solid rgba(0,0,0,.25);background:var(--r-face);color:var(--c);font:800 15px/1 'Space Grotesk',sans-serif;display:grid;place-items:center;cursor:pointer;padding:0;box-shadow:0 2px 0 rgba(0,0,0,.25);animation:rmIn .2s cubic-bezier(.2,.8,.2,1)}
@keyframes rmIn{0%{transform:translateY(-8px) scale(.8);opacity:0}100%{transform:none;opacity:1}}
.rm-empty{align-self:center;font:500 13px 'Inter',sans-serif;color:var(--r-muted);padding:0 4px}
.rm-lab{font:700 11px 'Inter',sans-serif;letter-spacing:.06em;text-transform:uppercase;color:var(--r-muted);margin:0 0 5px}
.rm-grid{display:grid;grid-template-columns:repeat(7,minmax(0,1fr));gap:6px}
.rm-c{height:58px;border-radius:9px;border:1.5px solid rgba(0,0,0,.2);background:var(--r-face);color:var(--c);font:800 20px/1 'Space Grotesk',sans-serif;cursor:pointer;padding:0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:2px;box-shadow:0 3px 0 rgba(0,0,0,.25)}
.rm-c small{font:700 10px 'Inter',sans-serif;color:rgba(20,20,28,.55)}
.rm-c:active{transform:translateY(2px);box-shadow:0 1px 0 rgba(0,0,0,.25)}
.rm-foot{display:flex;gap:8px}
.rm-ghost{flex:none;min-height:54px;padding:0 14px;border-radius:18px;border:1px solid var(--r-line);background:transparent;color:var(--r-muted);font:700 14px 'Inter',sans-serif;cursor:pointer}
.rm-ghost:disabled{opacity:.4;cursor:default}
.rm-save{flex:1;min-width:0;min-height:54px;border:0;border-radius:18px;background:var(--r-acc);color:var(--r-on);font:800 17px 'Space Grotesk',sans-serif;cursor:pointer;padding:0 10px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.rm-save:disabled{background:rgba(127,127,127,.18);color:var(--r-muted);cursor:default}
.rm-tile:focus-visible,.rm-hand:focus-visible,.rm-c:focus-visible,.rm-hc:focus-visible,.rm-chip:focus-visible,.rm-seg button:focus-visible,.rm-save:focus-visible,.rm-ghost:focus-visible,.rm-cell:focus-visible{outline:2px solid var(--r-acc);outline-offset:2px}
.rm-tbl{background:var(--r-card);border:1px solid var(--r-line);border-radius:16px;padding:8px 6px;overflow-x:auto}
.rm-tr{display:grid;gap:4px;align-items:center;min-width:min-content}
.rm-th{font:700 11.5px 'Inter',sans-serif;color:var(--r-muted);text-align:center;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;padding:4px 2px}
.rm-rn{font:700 12px 'Inter',sans-serif;color:var(--r-muted);text-align:center}
.rm-cell{min-height:42px;border:0;border-radius:10px;background:transparent;color:var(--r-ink);font:700 16px 'Space Grotesk',sans-serif;font-variant-numeric:tabular-nums;cursor:pointer;padding:0 4px}
.rm-cell[data-o="1"]{color:var(--r-acc);cursor:default}
.rm-cell:hover{background:rgba(127,127,127,.12)}
.rm-tot{border-top:1px solid var(--r-line);margin-top:4px;padding-top:4px}
.rm-tot .rm-cell{cursor:default;font-weight:800}
.rm-x2{display:inline-block;margin-left:3px;padding:1px 4px;border-radius:6px;background:var(--r-acc);color:var(--r-on);font:800 10px/1.2 'Inter',sans-serif;vertical-align:2px}
.rm-none{padding:24px 10px;text-align:center;font:500 14px 'Inter',sans-serif;color:var(--r-muted)}
.rm-ov{position:fixed;inset:0;background:rgba(0,0,0,.55);z-index:80;display:flex;align-items:flex-end;justify-content:center}
.gtL-content .rm-ov{align-items:center}
.rm-sheet{outline:none;width:100%;max-width:440px;max-height:94vh;max-height:94dvh;overflow-y:auto;box-sizing:border-box;background:var(--r-bg);color:var(--r-ink);border-radius:24px 24px 0 0;padding:16px 16px calc(14px + env(safe-area-inset-bottom));display:flex;flex-direction:column;gap:10px}
.gtL-content .rm-sheet{border-radius:24px}
.rm-sh{display:flex;justify-content:space-between;align-items:center;gap:10px;font:700 17px 'Inter',sans-serif}
.rm-xb{flex:none;width:44px;height:44px;border:0;background:transparent;color:var(--r-muted);cursor:pointer;display:grid;place-items:center;border-radius:12px}
@media (max-height:700px){.rm-flow{gap:8px}.rm-c{height:50px;font-size:18px}.rm-handrow{min-height:46px}.rm-hc{width:28px;height:38px}.rm-save,.rm-ghost{min-height:48px}.rm-tile{min-height:58px}}
@media (max-height:620px){.rm-c small{display:none}.rm-c{height:42px}.rm-lab{display:none}.rm-seg button{height:36px}}
@media (max-width:360px){.rm-grid{gap:4px}.rm-c{font-size:17px}}
.gtL-content .rm-seg{display:none}
@media (prefers-reduced-motion: reduce){.rm-hc{animation:none}}
[data-phone-landscape] .gt-ug.gt-u-col>.gt-headbtns+.gt-gamehead{margin-top:0}
[data-phone-landscape] .rm-flow{column-gap:14px;align-items:start}
[data-phone-landscape] .rm-flow:has(>.rm-strip){grid-template-columns:minmax(0,1fr) minmax(0,1fr);grid-template-areas:"seg grid" "strip grid" "who grid" "hand foot"}
[data-phone-landscape] .rm-flow:has(>.rm-strip)>.rm-seg{grid-area:seg}
[data-phone-landscape] .rm-flow:has(>.rm-strip)>.rm-strip{grid-area:strip}
[data-phone-landscape] .rm-flow:has(>.rm-strip)>.rm-who{grid-area:who}
[data-phone-landscape] .rm-flow:has(>.rm-strip)>.rm-handrow{grid-area:hand}
[data-phone-landscape] .rm-flow:has(>.rm-strip)>div:not([class]){grid-area:grid}
[data-phone-landscape] .rm-flow:has(>.rm-strip)>.rm-foot{grid-area:foot;align-self:end}
[data-phone-landscape] .rm-flow:has(>.rm-tiles){grid-template-columns:minmax(0,1fr) minmax(0,1fr);grid-template-areas:"seg tiles" "q tiles" "hand tiles" "foot foot"}
[data-phone-landscape] .rm-flow:has(>.rm-tiles)>.rm-seg{grid-area:seg}
[data-phone-landscape] .rm-flow:has(>.rm-tiles)>div:not([class]){grid-area:q}
[data-phone-landscape] .rm-flow:has(>.rm-tiles)>.rm-tiles{grid-area:tiles}
[data-phone-landscape] .rm-flow:has(>.rm-tiles)>.rm-hand{grid-area:hand}
[data-phone-landscape] .rm-flow:has(>.rm-tiles)>.rm-foot{grid-area:foot}
[data-phone-landscape] .rm-c{height:44px}
[data-phone-landscape] .rm-hc{width:32px;height:44px}
`;
const ROM_PK2=`
.rm-pk{--su-h:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath fill='%23E4312B' d='M12 21C5 15 2 11.5 2 8a5 5 0 0 1 10-1 5 5 0 0 1 10 1c0 3.5-3 7-10 13z'/%3E%3C/svg%3E");--su-d:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath fill='%23E4312B' d='M12 2l8 10-8 10-8-10z'/%3E%3C/svg%3E");--su-s:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath fill='%23141414' d='M12 2C7 8 3 11 3 14.5A4.5 4.5 0 0 0 11 17c0 2-1 3.5-3 5h8c-2-1.5-3-3-3-5a4.5 4.5 0 0 0 8-2.5C21 11 17 8 12 2z'/%3E%3C/svg%3E");--su-c:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath fill='%23141414' d='M12 2a4.5 4.5 0 0 0-3.5 7.3A4.5 4.5 0 1 0 11 16c0 2-1 4-3 6h8c-2-2-3-4-3-6a4.5 4.5 0 1 0 2.5-6.7A4.5 4.5 0 0 0 12 2z'/%3E%3C/svg%3E");--su-cs:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath fill='%23F4EAD5' d='M12 2C7 8 3 11 3 14.5A4.5 4.5 0 0 0 11 17c0 2-1 3.5-3 5h8c-2-1.5-3-3-3-5a4.5 4.5 0 0 0 8-2.5C21 11 17 8 12 2z'/%3E%3C/svg%3E");--su-cc:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath fill='%23F4EAD5' d='M12 2a4.5 4.5 0 0 0-3.5 7.3A4.5 4.5 0 1 0 11 16c0 2-1 4-3 6h8c-2-2-3-4-3-6a4.5 4.5 0 1 0 2.5-6.7A4.5 4.5 0 0 0 12 2z'/%3E%3C/svg%3E")}
.rm-pk [data-i="1"]{--suit:var(--su-h);color:#E4312B}
.rm-pk [data-i="2"]{--suit:var(--su-s);color:#141414}
.rm-pk [data-i="3"]{--suit:var(--su-d);color:#E4312B}
.rm-pk [data-i="4"]{--suit:var(--su-c);color:#141414}
.rm-pk [data-i="5"]{--suit:var(--su-h);color:#E4312B}
.rm-pk [data-i="6"]{--suit:var(--su-s);color:#141414}
.rm-pk [data-i="7"]{--suit:var(--su-d);color:#E4312B}
.rm-pk [data-i="8"]{--suit:var(--su-c);color:#141414}
.rm-pk [data-i="9"]{--suit:var(--su-h);color:#E4312B}
.rm-pk [data-i="10"]{--suit:var(--su-s);color:#141414}
.rm-pk [data-i="11"]{--suit:var(--su-d);color:#E4312B}
.rm-pk [data-i="12"]{--suit:var(--su-c);color:#141414}
.rm-pk [data-i="13"]{--suit:var(--su-h);color:#E4312B}
.rm-pk .rm-c,.rm-pk .rm-hc{position:relative;background:#FFFDF7;border-radius:9px}
.rm-pk .rm-c::before,.rm-pk .rm-hc::before{content:"";position:absolute;left:5px;top:5px;width:11px;height:11px;background:var(--suit) center/contain no-repeat}
.rm-pk .rm-c[data-i="0"],.rm-pk .rm-hc[data-i="0"]{background:#141414;color:#F4EAD5}
.rm-pk .rm-c[data-i="0"]::before,.rm-pk .rm-hc[data-i="0"]::before{display:none}
.rm-pk .rm-c[data-i="0"] small{color:#F4EAD5}
.rm-pk .rm-c{height:62px;font-size:22px}
.rm-pk .rm-c small{font-family:'Inter',sans-serif;font-size:11px;font-weight:800;color:#141414}
.rm-pk .rm-c:not([data-i="0"])::after{content:"";position:absolute;right:5px;bottom:5px;width:11px;height:11px;background:var(--suit) center/contain no-repeat;transform:rotate(180deg)}
.rm-pk .rm-lab{display:inline-block;background:#141414;color:#F4EAD5;padding:3px 10px 4px;border-radius:8px;transform:rotate(-1.5deg);margin:2px 0 8px}
.rm-pk .rm-handrow{background-color:#141414;outline:none;box-shadow:0 4px 0 #141414,0 0 0 2.5px #141414;border-radius:20px;padding:12px 10px;min-height:76px;gap:6px;align-items:center;align-content:center;background-image:radial-gradient(rgba(244,234,213,.16) 1px,transparent 1.5px);background-size:9px 9px}
.rm-pk .rm-empty{color:#F4EAD5}
.rm-pk .rm-hc{--rot:0deg;width:40px;height:52px;border-radius:7px;outline:2.5px solid #141414;outline-offset:-2.5px;box-shadow:0 3px 0 rgba(0,0,0,.45);font-size:19px;transform:rotate(var(--rot));animation:rmPkIn .28s cubic-bezier(.2,.9,.3,1.3)}
.rm-pk .rm-hc::before{width:9px;height:9px;left:4px;top:4px}
.rm-pk .rm-hc:nth-child(3n+1){--rot:-3deg}
.rm-pk .rm-hc:nth-child(3n+2){--rot:2deg}
.rm-pk .rm-hc:nth-child(3n){--rot:-1deg;margin-top:2px}
.rm-pk .rm-hc:active{transform:rotate(var(--rot)) scale(.92)}
@keyframes rmPkIn{0%{transform:translateY(-14px) rotate(calc(var(--rot) - 10deg)) scale(.7);opacity:0}100%{transform:rotate(var(--rot));opacity:1}}
.rm-pk .rm-strip{padding:12px 12px 4px 2px;margin-top:-8px}
.rm-pk .rm-hc[data-i="0"]{color:#F4EAD5;outline-color:#F4EAD5}
.rm-pk .rm-chip{border-radius:10px;transform:rotate(-1deg)}
.rm-pk .rm-chip:nth-child(even){transform:rotate(1deg)}
.rm-pk .rm-chip[data-s="cur"]{transform:rotate(0) translateY(-2px);box-shadow:0 5px 0 #E4312B}
.rm-pk .rm-chip[data-s="out"]{background:#FFFDF7;outline-color:#E4312B;box-shadow:0 3px 0 #E4312B;position:relative;transform:rotate(-3deg)}
.rm-pk .rm-chip[data-s="out"]::after{content:"";position:absolute;right:-8px;top:-10px;width:26px;height:26px;border-radius:50%;background:#E4312B url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath fill='%23F4EAD5' d='M12 3l2.6 5.9 6.4.6-4.8 4.3 1.4 6.3L12 16.8 6.4 20.1l1.4-6.3L3 9.5l6.4-.6z'/%3E%3C/svg%3E") center/16px no-repeat;outline:2px solid #141414;transform:rotate(12deg)}
.rm-pk .rm-chip[data-s="out"] .rm-cv{color:#E4312B}
.rm-pk .rm-tile{position:relative;min-height:76px;padding:8px 12px 8px 14px;border-radius:12px}
.rm-pk .rm-tile::before,.rm-pk .rm-tile::after{content:"";position:absolute;right:9px;width:13px;height:13px;background-repeat:no-repeat;background-size:contain;background-position:center}
.rm-pk .rm-tile::before{top:8px}
.rm-pk .rm-tile::after{bottom:8px;transform:rotate(180deg)}
.rm-pk .rm-tile:nth-child(4n+1)::before,.rm-pk .rm-tile:nth-child(4n+1)::after{background-image:var(--su-h)}
.rm-pk .rm-tile:nth-child(4n+2)::before,.rm-pk .rm-tile:nth-child(4n+2)::after{background-image:var(--su-s)}
.rm-pk .rm-tile:nth-child(4n+3)::before,.rm-pk .rm-tile:nth-child(4n+3)::after{background-image:var(--su-d)}
.rm-pk .rm-tile:nth-child(4n)::before,.rm-pk .rm-tile:nth-child(4n)::after{background-image:var(--su-c)}
.rm-pk .rm-tile[aria-pressed="true"]:nth-child(4n+2)::before,.rm-pk .rm-tile[aria-pressed="true"]:nth-child(4n+2)::after{background-image:var(--su-cs)}
.rm-pk .rm-tile[aria-pressed="true"]:nth-child(4n)::before,.rm-pk .rm-tile[aria-pressed="true"]:nth-child(4n)::after{background-image:var(--su-cc)}
.rm-pk .rm-tile[aria-pressed="true"]{box-shadow:0 4px 0 #E4312B;transform:rotate(-1deg)}
.rm-pk .rm-tn{max-width:calc(100% - 22px)}
.rm-pk .rm-hand[aria-pressed="true"]{background:#141414;box-shadow:0 4px 0 #E4312B}
.rm-pk .rm-hand[aria-pressed="true"] span{color:#F4EAD5}
.rm-pk .rm-hand[aria-pressed="true"] small{color:#EADDC2}
.rm-pk .rm-hand[aria-pressed="true"] .rm-sw{background:#E4312B;outline-color:#F4EAD5}
.rm-pk .rm-hand[aria-pressed="true"] .rm-sw::after{background:#FFFDF7}
.rm-pk .rm-tbl{padding:10px 8px 8px}
.rm-pk .rm-th{background:#141414;color:#F4EAD5;border-radius:8px;padding:5px 4px 6px;font-size:12px}
.rm-pk .rm-tr{gap:5px}
.rm-pk .rm-tr+.rm-tr{margin-top:3px}
.rm-pk .rm-cell{border-radius:8px}
.rm-pk .rm-tr:not(.rm-tot) .rm-cell:not([data-o]){background:#F4EAD5}
.rm-pk .rm-cell[data-o="1"]{background:#E4312B;color:#FFFDF7;outline:2px solid #141414;outline-offset:-2px;border-radius:19px;min-width:0;padding:0 6px;height:36px;min-height:0;justify-self:center;transform:rotate(-6deg);font-size:13px;opacity:1;white-space:nowrap}
.rm-pk .rm-tot{border-top:0;background:#141414;border-radius:12px;margin-top:8px;padding:6px 4px}
.rm-pk .rm-tot .rm-rn,.rm-pk .rm-tot .rm-cell{color:#F4EAD5}
.rm-pk .rm-tot .rm-cell[data-lead="1"]{color:#141414;background:#F4EAD5;box-shadow:0 0 0 2px #E4312B}
.rm-pk .rm-x2{background:#E4312B;color:#FFFDF7}
.rm-pk .rm-sheet .rm-handrow{min-height:70px}
.rm-fan{display:block;width:min(100%,300px);margin:6px auto 0;pointer-events:none;filter:drop-shadow(0 4px 0 #141414)}
.rm-fan svg{display:block;width:100%;height:auto;overflow:visible}
.rm-fc{transform-origin:150px 190px;transform-box:view-box;transform:rotate(var(--a));animation:rmDeal .75s cubic-bezier(.2,.9,.3,1.2) var(--d) both}
@keyframes rmDeal{0%{transform:rotate(0)}100%{transform:rotate(var(--a))}}
@media (max-height:760px){.rm-fan{display:none!important}}
@media (max-height:910px){.rm-fan-s{display:none!important}}
[data-phone-landscape] .rm-fan,.gtL-content .rm-fan{display:none!important}
.rm-pk .gt-su-num{background:#FFFDF7!important;color:#141414!important;border-radius:7px!important;width:30px!important;height:38px!important;outline:2.5px solid #141414;outline-offset:-2.5px;font-family:'Bagel Fat One','Bowlby One',sans-serif!important;font-weight:400!important;font-size:18px!important;position:relative;transform:rotate(-4deg);box-shadow:0 2px 0 #141414}
.rm-pk .gt-su-row:nth-child(even) .gt-su-num{transform:rotate(3deg)}
.rm-pk .gt-su-row:nth-child(4n+1) .gt-su-num,.rm-pk .gt-su-row:nth-child(4n+3) .gt-su-num{color:#E4312B!important}
.rm-pk .gt-su-num::after{content:"";position:absolute;right:3px;bottom:3px;width:9px;height:9px;background:var(--suit) center/contain no-repeat}
.rm-pk .gt-su-row:nth-child(4n+1) .gt-su-num{--suit:var(--su-h)}
.rm-pk .gt-su-row:nth-child(4n+2) .gt-su-num{--suit:var(--su-s)}
.rm-pk .gt-su-row:nth-child(4n+3) .gt-su-num{--suit:var(--su-d)}
.rm-pk .gt-su-row:nth-child(4n) .gt-su-num{--suit:var(--su-c)}
@media (max-height:700px){.rm-pk .rm-c{height:52px;font-size:19px}.rm-pk .rm-hc{width:34px;height:44px;font-size:16px}.rm-pk .rm-handrow{min-height:60px;padding:8px}.rm-pk .rm-tile{min-height:62px}.rm-pk .rm-lab{margin:0 0 4px}}
@media (max-height:620px){.rm-pk .rm-c{height:44px}.rm-pk .rm-c small,.rm-pk .rm-c::after,.rm-pk .rm-lab{display:none}.rm-pk .rm-hc{height:40px;width:30px}.rm-pk .rm-tile{min-height:54px}}
[data-phone-landscape] .rm-pk .rm-c{height:44px}[data-phone-landscape] .rm-pk .rm-c small,[data-phone-landscape] .rm-pk .rm-c::after{display:none}
@media (prefers-reduced-motion:reduce){.rm-pk .rm-hc,.rm-fc{animation:none}}
`;
const ROM_PK_CSS=`
.gtL-shellpage:has(.rm-pk){--pk-bg:#E4312B;background:url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='180' height='180'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.85' numOctaves='2' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='.32'/%3E%3C/svg%3E\") 0 0/180px 180px,#E4312B!important;background-blend-mode:multiply}
.gtL-shellpage:has(.rm-pk) .gt-wm{color:#F4EAD5!important;font-size:clamp(34px,12vw,48px)!important;white-space:nowrap!important;word-break:keep-all!important}
.rm-pk{--pkf:'Bagel Fat One','Bowlby One',sans-serif;--r-card:#FFFDF7;--r-bg:#F4EAD5;--r-ink:#141414;--r-muted:#4A4236;--r-line:#141414;--r-acc:#141414;--r-on:#F4EAD5;--r-face:#FFFDF7}
.rm-pk .rm-seg{background:#FFFDF7;outline:2.5px solid #141414;outline-offset:-2.5px;box-shadow:0 4px 0 #141414;border-radius:18px}
.rm-pk .rm-seg button{font-family:var(--pkf);font-weight:400;font-size:15px;color:#141414}
.rm-pk .rm-seg button[aria-selected="true"]{background:#141414;color:#F4EAD5}
.rm-pk .rm-q{font-family:var(--pkf);font-weight:400;color:#141414}
.rm-pk .rm-qh{color:#141414;font-weight:600}
.rm-pk .rm-tile{background:#FFFDF7;outline:2.5px solid #141414;outline-offset:-2.5px;box-shadow:0 4px 0 #141414;}
.rm-pk .rm-tile[aria-pressed="true"]{background:#141414}
.rm-pk .rm-tile[aria-pressed="true"] .rm-tn,.rm-pk .rm-tile[aria-pressed="true"] .rm-tt{color:#F4EAD5}
.rm-pk .rm-tn{font-family:var(--pkf);font-weight:400;color:#141414}
.rm-pk .rm-tt{color:#4A4236;font-weight:700}
.rm-pk .rm-hand{background:#FFFDF7;outline:2.5px solid #141414;outline-offset:-2.5px;box-shadow:0 4px 0 #141414;}
.rm-pk .rm-hand span{font-family:var(--pkf);font-weight:400}
.rm-pk .rm-hand small{font-family:'Inter',sans-serif;font-weight:600;color:#4A4236}
.rm-pk .rm-sw{background:#EADDC2;outline:2.5px solid #141414;outline-offset:-2.5px;box-sizing:border-box}
.rm-pk .rm-sw::after{left:2px;top:2px;width:15px;height:15px;background:#141414}
.rm-pk .rm-hand[aria-pressed="true"] .rm-sw{background:#141414}
.rm-pk .rm-hand[aria-pressed="true"] .rm-sw::after{background:#F4EAD5;transform:translateX(18px)}
.rm-pk .rm-chip{background:#FFFDF7;outline:2.5px solid #141414;outline-offset:-2.5px;box-shadow:0 3px 0 #141414;}
.rm-pk .rm-chip[data-s="cur"]{background:#141414}
.rm-pk .rm-chip[data-s="cur"] .rm-cn,.rm-pk .rm-chip[data-s="cur"] .rm-cv{color:#F4EAD5}
.rm-pk .rm-chip[data-s="out"]{opacity:1;background:#EADDC2}
.rm-pk .rm-cn{color:#141414}
.rm-pk .rm-cv{font-family:var(--pkf);font-weight:400}
.rm-pk .rm-wl{font-family:var(--pkf);font-weight:400;color:#141414;font-size:13px}
.rm-pk .rm-wn{font-family:var(--pkf);font-weight:400;font-size:26px;color:#141414}
.rm-pk .rm-wt{color:#141414;font-weight:700}
.rm-pk .rm-wt b{font-family:var(--pkf);font-weight:400;font-size:36px;color:#141414}
.rm-pk .rm-handrow{background:#FFFDF7;outline:2.5px solid #141414;outline-offset:-2.5px;box-shadow:0 4px 0 #141414;}
.rm-pk .rm-hc{outline:2.5px solid #141414;outline-offset:-2.5px;box-shadow:0 2px 0 #141414;font-family:var(--pkf);font-weight:400;background:#FFFDF7}
.rm-pk .rm-empty{color:#4A4236;font-weight:600}
.rm-pk .rm-lab{color:#141414;font-family:var(--pkf);font-weight:400;letter-spacing:.04em}
.rm-pk .rm-c{outline:2.5px solid #141414;outline-offset:-2.5px;box-shadow:0 3px 0 #141414;font-family:var(--pkf);font-weight:400;border-radius:12px}
.rm-pk .rm-c small{color:#4A4236;font-weight:800}
.rm-pk .rm-c:active{transform:translateY(2px);box-shadow:0 1px 0 #141414}
.rm-pk .rm-foot{padding-bottom:6px}
.rm-pk .rm-ghost{outline:2.5px solid #141414;outline-offset:-2.5px;background:#FFFDF7;color:#141414;box-shadow:0 4px 0 #141414;font-family:var(--pkf);font-weight:400}
.rm-pk .rm-ghost:active:not(:disabled){transform:translateY(3px);box-shadow:0 1px 0 #141414}
.rm-pk .rm-ghost:disabled{opacity:1;background:#EADDC2;color:#4A4236}
.rm-pk .rm-save{position:relative;overflow:hidden;outline:2.5px solid #141414;outline-offset:-2.5px;background:#141414;color:#F4EAD5;box-shadow:0 6px 0 #141414;font-family:var(--pkf);font-weight:400;font-size:17px;border-radius:20px}
.rm-pk .rm-save:disabled{background:#EADDC2;color:#4A4236}
.rm-pk .rm-save:not(:disabled)::after{content:"";position:absolute;top:0;bottom:0;left:0;width:35%;background:linear-gradient(90deg,transparent,rgba(255,255,255,.28),transparent);animation:pk-shine 3.2s ease-in-out infinite;pointer-events:none}
.rm-pk .rm-save:active:not(:disabled){transform:translateY(4px);box-shadow:0 2px 0 #141414}
.rm-pk .rm-tbl{background:#FFFDF7;outline:2.5px solid #141414;outline-offset:-2.5px;box-shadow:0 4px 0 #141414;border-radius:20px;}
.rm-pk .rm-th,.rm-pk .rm-rn{font-family:var(--pkf);font-weight:400;color:#141414}
.rm-pk .rm-cell{font-family:var(--pkf);font-weight:400;font-size:17px;color:#141414}
.rm-pk .rm-cell[data-o="1"]{color:#141414;font-size:13px}
.rm-pk .rm-cell:hover{background:#F4EAD5}
.rm-pk .rm-tot{border-top:2.5px solid #141414}
.rm-pk .rm-x2{background:#141414;color:#F4EAD5;font-family:var(--pkf);font-weight:400}
.rm-pk .rm-none{color:#141414}
.rm-pk .rm-ov{background:rgba(20,20,20,.6)}
.rm-pk .rm-sheet{background:#F4EAD5;outline:2.5px solid #141414;outline-offset:-2.5px;border-bottom:0}
.rm-pk .rm-sh{font-family:var(--pkf);font-weight:400;font-size:18px}
.rm-pk .rm-xb{color:#141414}
.rm-pk .rm-tile:focus-visible,.rm-pk .rm-hand:focus-visible,.rm-pk .rm-c:focus-visible,.rm-pk .rm-hc:focus-visible,.rm-pk .rm-chip:focus-visible,.rm-pk .rm-seg button:focus-visible,.rm-pk .rm-save:focus-visible,.rm-pk .rm-ghost:focus-visible,.rm-pk .rm-cell:focus-visible{outline:3px solid #141414;outline-offset:2px}
.rm-pk .rm-tile[aria-pressed="true"]:focus-visible{outline-color:#F4EAD5}
@media (max-width:360px){.rm-pk .rm-c{font-size:17px}}
@media (prefers-reduced-motion:reduce){.rm-pk .rm-save::after{animation:none}}
`;
function romPkTk(tk){return{...tk,bg:"#F4EAD5",bg2:"#EADDC2",card:"#FFFDF7",ink:"#141414",muted:"#141414",teal:"#141414",gold:"#141414",border:"#141414",btnFrom:"#141414",btnTo:"#141414",onAccent:"#F4EAD5"};}
function romVars(tk,theme){return{"--r-card":tk.card,"--r-bg":tk.bg,"--r-ink":tk.ink,"--r-muted":tk.muted,"--r-line":theme==="light"?"rgba(24,22,32,0.14)":tk.border,"--r-acc":tk.teal,"--r-on":tk.onAccent,"--r-face":theme==="noir"?"#EBEBEB":"#FFF6EE"};}
function romCol(c,i,theme){if(theme==="noir")return"#1E1E1E";if(theme==="light"&&isHell())return"#1E1A15";if(c==="J")return"#7A3FB0";return i%2?"#C8102E":"#1B1B24";}
const ROM_FAN=[["★",-34,0],["A",-17,1],["K",0,2],["D",17,3],["B",34,4]];
const ROM_SP={h:"M12 21C5 15 2 11.5 2 8a5 5 0 0 1 10-1 5 5 0 0 1 10 1c0 3.5-3 7-10 13z",d:"M12 2l8 10-8 10-8-10z",s:"M12 2C7 8 3 11 3 14.5A4.5 4.5 0 0 0 11 17c0 2-1 3.5-3 5h8c-2-1.5-3-3-3-5a4.5 4.5 0 0 0 8-2.5C21 11 17 8 12 2z",c:"M12 2a4.5 4.5 0 0 0-3.5 7.3A4.5 4.5 0 1 0 11 16c0 2-1 4-3 6h8c-2-2-3-4-3-6a4.5 4.5 0 1 0 2.5-6.7A4.5 4.5 0 0 0 12 2z"};
function RomFan({setup}){const suit=["s","h","d","c"];return <div className={"rm-fan"+(setup?" rm-fan-s":"")} aria-hidden="true"><svg viewBox="0 0 300 140" focusable="false">{ROM_FAN.map(([l,a,i])=>{const jk=l==="★";const sp=jk?null:suit[(i-1)%4];const red=sp==="h"||sp==="d";const col=red?"#E4312B":"#141414";return <g key={l} className="rm-fc" style={{"--a":a+"deg","--d":(i*70)+"ms"}}><g transform="translate(115 20)"><rect x="1.5" y="1.5" width="67" height="97" rx="8" fill={jk?"#141414":"#FFFDF7"} stroke="#141414" strokeWidth="3"/>{jk?<g fill="#F4EAD5"><path transform="translate(7 7) scale(1.3)" d="M12 1.5l2.8 6.6 7.1.6-5.4 4.7 1.6 7-6.1-3.7-6.1 3.7 1.6-7L2.1 8.7l7.1-.6z"/><path transform="translate(20 44) scale(1.8)" d="M12 1.5l2.8 6.6 7.1.6-5.4 4.7 1.6 7-6.1-3.7-6.1 3.7 1.6-7L2.1 8.7l7.1-.6z"/></g>:<g><text x="9" y="26" fontFamily="'Bagel Fat One','Bowlby One',sans-serif" fontSize="23" fill={col}>{l}</text><path transform="translate(9 31) scale(.55)" d={ROM_SP[sp]} fill={col}/><path transform="translate(22 46) scale(1.1)" d={ROM_SP[sp]} fill={col}/></g>}</g></g>;})}</svg></div>;}
function RomPicker({cards,setCards,t,theme}){const add=c=>{if(cards.filter(x=>x===c).length>=(c==="J"?6:8))return;setCards([...cards,c].slice(0,40));};const rm=i=>setCards(cards.filter((_,k)=>k!==i));return <React.Fragment><div className="rm-handrow" aria-live="polite" aria-label={t("romHandCards")}>{cards.length?cards.map((c,i)=><button key={i+"-"+c} type="button" className="rm-hc press-fx" data-i={ROM_CARDS.findIndex(x=>x[0]===c)} style={{"--c":romCol(c,ROM_CARDS.findIndex(x=>x[0]===c),theme)}} aria-label={t("romRemove")(c)} onClick={()=>rm(i)}>{c==="J"?"★":c}</button>):<span className="rm-empty">{t("romNoCards")}</span>}</div><div><div className="rm-lab">{t("romTapCards")}</div><div className="rm-grid" role="group" aria-label={t("romTapCards")}>{ROM_CARDS.map(([c,v],i)=><button key={c} type="button" className="rm-c press-fx" data-i={i} style={{"--c":romCol(c,i,theme)}} aria-label={t("romAdd")(c==="J"?t("romJoker"):c,v)} onClick={()=>add(c)}>{c==="J"?"★":c}<small>{v}</small></button>)}</div></div></React.Fragment>;}
function RomFlow({list,d,upd,roundNo,target,tk,t,theme,lap,onSave,view,setView}){const others=list.filter(p=>String(p.id)!==String(d.out));const act=fn=>ev=>{if(ev.key==="Enter"||ev.key===" "){ev.preventDefault();fn();}};const seg=!lap&&<div className="rm-seg" role="tablist"><button role="tab" aria-selected={view==="round"} onClick={()=>setView("round")}>{t("skyjoRoundLabel")(roundNo)}</button><button role="tab" aria-selected={view==="table"} onClick={()=>setView("table")}>{t("skyjoViewTable")}</button></div>;if(d.step!=="cards"||!others.length){return <div className="rm-flow">{seg}<div><h2 className="rm-q">{t("romOutQ")}</h2><p className="rm-qh">{t("romOutHint")}</p></div><div className="rm-tiles" role="group" aria-label={t("romOutQ")}>{list.map(q=>{const on=String(d.out)===String(q.id);return <div key={q.id} className="rm-tile press-fx" role="button" tabIndex={0} aria-pressed={on} onClick={()=>upd({out:on?null:q.id})} onKeyDown={act(()=>upd({out:on?null:q.id}))}><span className="rm-tn">{q.name}</span><span className="rm-tt">{t("gtlTotal")} {q.total}</span></div>;})}</div><button className="rm-hand press-fx" aria-pressed={d.hand} onClick={()=>upd({hand:!d.hand})}><span>{t("romHand")}<small>{t("romHandDesc")}</small></span><i className="rm-sw" aria-hidden/></button><div className="rm-foot"><button className="rm-save press-fx" disabled={d.out==null} onClick={()=>upd({step:"cards",cur:0})}>{t("skyjoFlowNext")}</button></div></div>;}
const cur=Math.min(d.cur,others.length-1);const p=others[cur];const cards=d.cards[p.id];const raw=romSum(cards);const pts=d.hand?raw*2:raw;const last=cur>=others.length-1;const save=()=>{const raw2={},scores={},cardsOut={};list.forEach(q=>{const isOut=String(q.id)===String(d.out);const r=isOut?0:romSum(d.cards[q.id]);raw2[q.id]=r;scores[q.id]=d.hand?r*2:r;cardsOut[q.id]=isOut?[]:d.cards[q.id];});onSave({scores,raw:raw2,outId:d.out,hand:d.hand,cards:cardsOut});};const outP=list.find(q=>String(q.id)===String(d.out));
return <div className="rm-flow">{seg}<div className="rm-strip" role="group" aria-label={t("skyjoFlowStrip")}>{outP&&<div className="rm-chip" data-s="out"><span className="rm-cn">{outP.name}</span><span className="rm-cv">0</span></div>}{others.map((q,i)=>{const has=d.tch[q.id];const r=romSum(d.cards[q.id]);return <div key={q.id} className="rm-chip press-fx" data-s={i===cur?"cur":undefined} role="button" tabIndex={0} aria-current={i===cur?"step":undefined} aria-label={q.name} onClick={()=>upd({cur:i})} onKeyDown={act(()=>upd({cur:i}))}><span className="rm-cn">{q.name}</span><span className="rm-cv">{has?(d.hand?r*2:r):"·"}</span></div>;})}</div>
<div className="rm-who"><div style={{minWidth:0}}><div className="rm-wl">{t("romCardsOf")}</div><h2 className="rm-wn">{p.name}</h2></div><div className="rm-wt"><b>{pts}</b>{d.hand?t("romDoubled")(raw):t("skyjoFlowNewTotal")(p.total+pts)}</div></div>
<RomPicker cards={cards} setCards={c=>upd(dr=>({cards:{...dr.cards,[p.id]:c},tch:{...dr.tch,[p.id]:true}}))} t={t} theme={theme}/>
<div className="rm-foot"><button className="rm-ghost press-fx" onClick={()=>cur>0?upd({cur:cur-1}):upd({step:"out"})}>{t("mgUndo")}</button><button className="rm-save press-fx" data-gt-sound={last?"1":undefined} onClick={()=>{if(!(cards&&cards.length)&&d.zc!==p.id){upd({zc:p.id});return;}if(last)save();else upd({cur:cur+1,zc:null});}}>{!(cards&&cards.length)&&d.zc===p.id?t("romZeroConfirm"):last?t("skyjoSaveRoundN")(roundNo):t("skyjoFlowNextTo")(others[cur+1].name)}</button></div></div>;}
function RomTable({players,hist,list,onCell,t}){if(!hist.length)return <div className="rm-tbl"><div className="rm-none">{t("skyjoTableEmpty")}</div></div>;const cols=`28px repeat(${players.length}, minmax(${players.length>5?54:0}px, 1fr))`;return <div className="rm-tbl"><div className="rm-tr" style={{gridTemplateColumns:cols}}><span/>{players.map(p=><span key={p.id} className="rm-th">{p.name}</span>)}</div>{hist.map((r,i)=><div key={i} className="rm-tr" style={{gridTemplateColumns:cols}}><span className="rm-rn">{i+1}</span>{players.map(p=>{const isOut=String(r.outId)===String(p.id);return <button key={p.id} className="rm-cell press-fx" data-o={isOut?"1":undefined} disabled={isOut} aria-label={`${p.name}, ${t("skyjoRoundLabel")(i+1)}`} onClick={()=>onCell(i,p.id)}>{isOut?t("romOutShort"):gtNum(r.scores&&r.scores[p.id])||0}{!isOut&&r.hand&&<i className="rm-x2">×2</i>}</button>;})}</div>)}<div className="rm-tr rm-tot" style={{gridTemplateColumns:cols}}><span className="rm-rn">{"Σ"}</span>{list.map(p=><span key={p.id} className="rm-cell" data-lead={p.total===Math.min(...list.map(q=>q.total))?"1":undefined} style={{display:"grid",placeItems:"center",cursor:"default"}}>{p.total}</span>)}</div></div>;}
function RomEditSheet({p,init,round,legacy,onSave,onClose,t,theme}){const[cards,setCards]=useState(init);const c0=React.useRef(JSON.stringify(init));const tap=()=>{if(JSON.stringify(cards)!==c0.current)return;onClose();};const tr=React.useRef(tap);tr.current=tap;const ref=useGtDialog({open:true,onClose,outside:()=>tr.current()});return <div className="rm-ov" onClick={tap}><div className="rm-sheet" role="dialog" aria-modal="true" aria-label={p.name} tabIndex={-1} ref={ref} onClick={ev=>ev.stopPropagation()}><div className="rm-sh"><span>{p.name} · {t("skyjoRoundLabel")(round)}</span><button className="rm-xb" onClick={onClose} aria-label={t("skyjoGridClose")}><XMark/></button></div>{legacy!=null&&!cards.length&&<div className="rm-qh">{t("romLegacy")(legacy)}</div>}<RomPicker cards={cards} setCards={setCards} t={t} theme={theme}/><button className="rm-save press-fx" data-gt-sound="1" onClick={()=>onSave(cards)}>{t("confirm")}</button></div></div>;}
function RommeGame({state,setState,onBack,onHome,onEndGame,lang="de",theme="dark"}){const t=useT(lang);const pk=usePlakat();const tk=pk?romPkTk(s8Tok(theme,ROM_TK)):s8Tok(theme,ROM_TK);const[view,setView]=useState("round");const[edit,setEdit]=useState(null);const rootRef=React.useRef(null);const[lap,setLap]=useState(false);const hist=Array.isArray(state.history)?state.history.filter(gtIsObj):[];const target=Math.max(50,gtNum(state.target)||500);const list=romCalc(state.players,hist);const over=state.phase==="play"&&hist.length>0&&list.some(p=>p.total>=target);React.useLayoutEffect(()=>{setLap(!!(rootRef.current&&rootRef.current.closest(".gtL-content")));},[state.phase,over]);const d=romDraft(state.draft,state.players);const upd=f=>setState(s=>{const dr=romDraft(s.draft,s.players);const patch=typeof f==="function"?f(dr):f;return{...s,draft:{...dr,...patch}};});const start=()=>{setState(s=>({...s,phase:"play",history:[],draft:null}));setView("round");};const addRound=r=>setState(s=>({...s,history:[...(s.history||[]),r],draft:null}));const editCell=(i,pid,cards)=>{setState(s=>({...s,history:s.history.map((x,j)=>{if(j!==i)return x;const raw={...(gtIsObj(x.raw)?x.raw:x.scores||{})};const r=romSum(cards);raw[pid]=r;return{...x,raw,scores:{...(x.scores||{}),[pid]:x.hand?r*2:r},cards:{...(gtIsObj(x.cards)?x.cards:{}),[pid]:cards}};})}));setEdit(null);};const undo=()=>{globalThis.__gtUndoAt=Date.now();const lastR=hist[hist.length-1];if(!lastR)return;const cards={},tch={};state.players.forEach(p=>{cards[p.id]=romCards(lastR.cards&&lastR.cards[p.id]);tch[p.id]=true;});setState(s=>({...s,history:(s.history||[]).slice(0,-1),draft:{step:lastR.outId!=null?"cards":"out",out:lastR.outId,hand:!!lastR.hand,cards,tch,cur:0}}));setEdit(null);setView("round");};const W=(sub,kids)=><S8Wrap theme={theme} tk={tk} t={t} title={t("gameRomme")} sub={sub} logo={<RommeLogo color={tk.teal} size={26}/>} onBack={onBack} onHome={onHome} onEndGame={sub===t("gtNewMatch")?undefined:onEndGame} rulesText={t("rulesRomme")} pld unit extraCss={ROM_CSS+(pk?ROM_PK_CSS+ROM_PK2:"")}>{kids}</S8Wrap>;if(state.phase!=="play"){const tooFew=state.players.length<2;return W(t("gtNewMatch"),<div className={"gt-ug-fill"+(pk?" rm-pk":"")}><div className="gtL-split gtL-split-setup pld-split pld-setup"><div className="gtL-col-main"><S8Players players={state.players} setPlayers={u=>setState(s=>({...s,players:typeof u==="function"?u(s.players):u}))} min={2} max={6} mk={(id,name)=>({id,name})} tk={tk} t={t} theme={theme}/></div><div className="gtL-col-side"><GtChips label={t("romTarget")} options={[300,500,1000]} value={state.target} onChange={v=>setState(s=>({...s,target:v}))} custom max={9999} skin={pk?{...s8Skin(theme,tk),fill:"#141414",on:"#F4EAD5",txt:"#141414"}:s8Skin(theme,tk)} t={t}/>{pk&&<RomFan setup/>}<GtStartBar onClick={start} disabled={tooFew} label={t("startGame")} skin={pk?{...s8Skin(theme,tk),fill:"#141414",on:"#F4EAD5",txt:"#141414",fade:"#E4312B"}:s8Skin(theme,tk)}/></div></div></div>);}if(over){const ranked=[...list].sort((a,b)=>a.total-b.total).map(p=>({id:p.id,name:p.name,score:p.total,rk:p.total,sub:p.total>=target?t("romOverTarget"):null}));return W(`${t("romTarget")} ${target}`,<S8GameOver ranked={ranked} tk={tk} theme={theme} t={t} gameId="romme" label={t("gameRomme")} onRestart={start} onNewSetup={()=>setState(s=>({...s,phase:"setup"}))} onUndo={undo} shareExtra={()=>({rounds:hist.length,target:target,players:ranked.map(p=>({name:p.name,total:p.score}))})} record={()=>s8Record("romme",ranked,ranked[0]&&ranked[0].score*4<=target?{clean:ranked.filter(p=>p.score===ranked[0].score).map(p=>p.name)}:undefined)}/>);}
const editP=edit?state.players.find(p=>p.id===edit.pid):null;const er=edit?hist[edit.i]:null;const table=<div style={{display:"flex",flexDirection:"column",gap:10}}><RomTable players={state.players} hist={hist} list={list} onCell={(i,pid)=>setEdit({i,pid})} t={t}/>{hist.length>0&&<button className="rm-ghost press-fx" style={{alignSelf:"center"}} onClick={undo}>{t("skyjoUndoRound")}</button>}</div>;
return W(`${t("romTarget")} ${target}`,<div ref={rootRef} className={pk?"rm-pk":undefined} style={pk?{...romVars(tk,theme),"--r-acc":"#141414","--r-on":"#F4EAD5","--r-line":"#141414","--r-face":"#FFFDF7"}:romVars(tk,theme)}><div className="gtL-split"><div className="gtL-col-main">{(lap||view==="round")?<RomFlow list={list} d={d} upd={upd} roundNo={hist.length+1} target={target} tk={tk} t={t} theme={theme} lap={lap} onSave={addRound} view={view} setView={setView}/>:<div className="rm-flow"><div className="rm-seg" role="tablist"><button role="tab" aria-selected={false} onClick={()=>setView("round")}>{t("skyjoRoundLabel")(hist.length+1)}</button><button role="tab" aria-selected={true}>{t("skyjoViewTable")}</button></div>{table}</div>}{pk&&!lap&&<RomFan/>}</div>{lap&&<div className="gtL-col-side"><GtlStandings players={list} target={target} lowWins={true} rounds={hist.length} accent={tk.teal} tk={tk} font={S8F} theme={theme} t={t}/>{hist.length>0&&table}</div>}</div>{editP&&er&&<RomEditSheet key={edit.i+"-"+edit.pid} p={editP} round={edit.i+1} init={romCards(er.cards&&er.cards[edit.pid])} legacy={er.cards&&er.cards[edit.pid]?null:(gtNum((gtIsObj(er.raw)?er.raw:er.scores||{})[edit.pid])||0)} t={t} theme={theme} onClose={()=>setEdit(null)} onSave={c=>editCell(edit.i,edit.pid,c)}/>}</div>);}/*@gt-body-end*/
export { romCalc, romSum, RommeGame };
