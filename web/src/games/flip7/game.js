// Flip 7: Kartenreihe pro Person antippen statt Summe tippen.
// Regeln nach offizieller Anleitung (The Op, Ruleset Edition 3.1, Seiten 8-12):
// Summe der Zahlenkarten, bei x2 verdoppeln, dann +2/+4/+6/+8/+10 addieren, bei Flip 7 (7 verschiedene Zahlen) +15.
// Bust = 0 Punkte. Bonuskarten allein zaehlen auch ohne Zahlenkarten. Spielende: nach der Runde, in der jemand 200 erreicht,
// gewinnt die hoechste Punktzahl. Gleichstand an der Spitze: Stechrunde mit allen (Op Games FAQ).
import { isHell, hc } from "../../themes/hell.js";
import { React } from "../../vendor/react-globals.js";
import { useGtDialog } from "../../shared/dialog.js";
import { useEffect, useRef, useState } from "../../prelude.js";
import { playerHue as playerHue0 } from "../../themes/palette.js";
const HELL_HUES=["#1E1A15","#4A443A","#5E574C","#2B261F","#6B6458","#38322A","#524B40","#756D60"];function playerHue(i,theme){return theme==="light"&&isHell()?HELL_HUES[i%8]:playerHue0(i,theme);}
import { GLOBAL_STYLES } from "../../styles/global.js";
import { RulesButton, RulesSheet } from "../../app/App.js";
import { useT } from "../../i18n/use-t.js";
import { flip7Tokens } from "../../themes/tokens.js";
import { recordMatch } from "../../stats/match-log.js";
import { gtWinLine } from "../../shared/game-helpers.js";
import { PodiumOverlay, useCelebration } from "../../shared/podium.js";
import { GameIcon, XMark } from "../../assets/icons.js";
import { Flip7Logo } from "../../assets/logos.js";
import { GameHeader } from "../../shared/game-header.js";
import { GtRoundChart } from "../../shared/standings.js";
import { GroupPicker, GtChips, GtPlayerList, GtStartBar, gtSkin, gtSkinTk, gtSoftTk } from "../../shared/setup-ui.js";
import { GtlStandings, useGtlKeys } from "../../shared/laptop-keys.js";
import { PLD_CSS } from "../skyjo/landscape.js";
import { GtCol } from "../../shared/unit.js";
import { GT_UG_CSS } from "../../shared/unit-games.js";
import { usePlakat } from "../../themes/theme-id.js";
import { pkPage, PkRibbon } from "../../shared/plakat/kit.js";
/*@gt-body-begin*/
const FLIP7_FONT="'Space Grotesk', sans-serif";
const FLIP7_MODS=[2,4,6,8,10];
const F7_NUMS=[0,1,2,3,4,5,6,7,8,9,10,11,12];
function flip7RoundScore({numberSum,busted,x2,mods,flip7}){if(busted)return 0;let base=numberSum||0;if(x2)base*=2;const flat=(mods||[]).reduce((s,m)=>s+m,0);let total=base+flat;if(flip7)total+=15;return total;}
function f7Entry(nums,mods,x2,busted){const ns=[...new Set((nums||[]).filter(n=>F7_NUMS.includes(n)))].sort((a,b)=>a-b);const ms=[...new Set((mods||[]).filter(m=>FLIP7_MODS.includes(m)))].sort((a,b)=>a-b);const b=!!busted;return{busted:b,nums:b?[]:ns,numberSum:b?0:ns.reduce((s,n)=>s+n,0),mods:b?[]:ms,x2:b?false:!!x2,flip7:!b&&ns.length>=7};}
function f7T(theme){const b=flip7Tokens(theme);if(theme==="light"&&isHell())return{...b,bg:"#F6F1E7",bg2:"#EDE5D5",card:"#FFFCF6",ink:"#1E1A15",muted:"#4A443A",line:"#B5AC9A",acc:"#1E1A15",on:"#FFFCF6",red:"#1E1A15",gold:"#1E1A15",face:"#FFFCF6",faceLine:"#4A443A",back:"#1E1A15",bink:"#F6F1E7"};if(theme==="light")return{...b,bg:"#FAF7F0",bg2:"#F2EADB",card:"#FFFFFF",ink:"#1B1815",muted:"#585360",line:"rgba(40,36,30,0.16)",acc:"#C4470F",on:"#FFFFFF",red:"#B3261E",gold:"#8A6100",face:"#FFF6EA",faceLine:"rgba(40,36,30,0.22)",back:"#C4470F",bink:"#FFFFFF"};if(theme==="noir")return{...b,line:"#454545",acc:"#D6D6D6",on:"#111111",red:"#F2F2F2",gold:"#D6D6D6",face:"#EDEDED",faceLine:"#5A5A5A",back:"#3A3A3A"};return{...b,bg:"#12141C",bg2:"#181B25",card:"#1A1E2B",ink:"#F0F1F5",muted:"#8890A0",line:"#2A3040",acc:"#FF7A3D",on:"#1A0E06",red:"#FF6B5E",gold:"#FFC24B",face:"#FFF1DC",faceLine:"rgba(255,255,255,0.28)",back:"#FF7A3D"};}
function f7PkT(b){return{...b,pageBg:"#E4312B",bg:"#E4312B",bg2:"#E4312B",card:"#FFFDF7",ink:"#141414",muted:"#141414",line:"#141414",acc:"#1A1716",on:"#F4EAD5",red:"#B3261E",gold:"#141414",face:"#FFFDF7",faceLine:"#141414",back:"#1A1716",bink:"#F4EAD5"};}
function f7Shell(theme){const k=f7T(theme);return{minHeight:"100vh",background:`radial-gradient(ellipse at 50% -10%, ${k.bg2} 0%, ${k.bg} 65%)`,padding:"20px 12px 32px"};}
function f7Vars(k,pk){if(pk)return{"--f7-card":"#FFFDF7","--f7-ink":"#141414","--f7-muted":"#141414","--f7-line":"#141414","--f7-acc":"#1A1716","--f7-on":"#F4EAD5","--f7-red":"#B3261E","--f7-gold":"#141414","--f7-face":"#FFFDF7","--f7-fline":"#141414","--f7-back":"#2B1607","--f7-bink":"#F4EAD5"};return{"--f7-card":k.card,"--f7-ink":k.ink,"--f7-muted":k.muted,"--f7-line":k.line,"--f7-acc":k.acc,"--f7-on":k.on,"--f7-red":k.red,"--f7-gold":k.gold,"--f7-face":k.face,"--f7-fline":k.faceLine,"--f7-back":k.back,"--f7-bink":k.bink||"#1A1205"};}
const F7_NUM_COL=["#6B6F80","#8C5A2B","#2E7D5B","#B2384E","#2F6FB0","#3E8E41","#8A4FB0","#C2571A","#1F7F86","#A0367A","#A85A12","#3D5BA8","#6A3FA0"];
function f7NumCol(n,theme){return theme==="noir"?"#2C2C2C":theme==="light"&&isHell()?"#1E1A15":F7_NUM_COL[n]||"#333";}
function flip7BtnPrimary(theme){const k=f7T(theme);return{border:"none",borderRadius:18,background:k.acc,color:k.on,fontSize:15,fontWeight:800,padding:"14px 0",cursor:"pointer",fontFamily:FLIP7_FONT};}
function flip7BtnGhost(theme){const k=f7T(theme);return{border:`1px solid ${k.line}`,borderRadius:18,background:"transparent",color:k.muted,fontSize:13,fontWeight:700,padding:"12px 20px",cursor:"pointer",fontFamily:"'Inter', sans-serif"};}
function Flip7TopBar({subtitle,onBack,theme,t,hideTitle}){const k=f7T(theme);return <GameHeader title={t("gameFlip7")} subtitle={subtitle} onBack={onBack} backLabel={t("back")} tk={k} accent={k.acc} titleFont={FLIP7_FONT} icon={<Flip7Logo color={k.acc} theme={theme}/>} hideTitle={hideTitle}/>;}
const F7_CSS=`
@font-face{font-family:'Bowlby One';font-style:normal;font-weight:400;font-display:swap;src:url("./fonts/BowlbyOne-Regular-lat.woff2") format('woff2');}
.f7-flow{display:grid;gap:10px;grid-template-columns:minmax(0,1fr);grid-template-areas:"hero" "seg" "tie" "strip" "who" "disp" "nums" "mods" "foot";}
.f7-hero{grid-area:hero;display:flex;align-items:center;justify-content:center;gap:10px;padding:0 0 2px}
.f7-fan{display:block;width:62px;height:auto;filter:drop-shadow(0 4px 5px rgba(0,0,0,.34))}
.f7-sub{font:600 12px/1.2 'Inter',sans-serif;color:var(--f7-muted);margin-top:3px;letter-spacing:.02em}
.f7-word{margin:0;font-family:'Bowlby One',sans-serif;font-weight:400;font-size:48px;line-height:1.05;color:#FF7A3D;-webkit-text-stroke:.028em #14100E;paint-order:stroke fill;text-shadow:.037em .037em 0 #14100E,.074em .074em 0 #2EC4B6,.093em .093em 0 #2EC4B6,.111em .111em 0 #14100E;white-space:nowrap}
.f7-seg{grid-area:seg;display:grid;grid-template-columns:1fr 1fr;gap:4px;padding:4px;border-radius:16px;background:var(--f7-card);border:1px solid var(--f7-line)}
.f7-seg button{height:44px;border:0;border-radius:12px;background:transparent;color:var(--f7-muted);font:700 15px 'Inter',sans-serif;cursor:pointer;padding:0}
.f7-seg button[aria-selected="true"]{background:var(--f7-acc);color:var(--f7-on)}
.f7-tie{grid-area:tie;border:1.5px solid var(--f7-gold);color:var(--f7-gold);border-radius:14px;padding:8px 12px;font:700 13px/1.35 'Inter',sans-serif;text-align:center}
.f7-strip{grid-area:strip;display:flex;gap:6px;overflow-x:auto;scrollbar-width:none;padding:2px}
.f7-strip::-webkit-scrollbar{display:none}
.f7-chip{flex:1 0 74px;max-width:132px;min-height:46px;box-sizing:border-box;border-radius:12px;border:1.5px solid var(--f7-line);background:var(--f7-card);padding:4px 8px;display:flex;flex-direction:column;justify-content:center;cursor:pointer;min-width:0}
.f7-chip[data-s="cur"]{border-color:var(--f7-acc)}
.f7-chip[data-s="done"]{border-color:color-mix(in oklab,var(--f7-acc) 40%,var(--f7-line))}
.f7-cn{font:600 12px/1.2 'Inter',sans-serif;color:var(--f7-muted);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.f7-cv{font:800 17px/1.15 'Space Grotesk',sans-serif;color:var(--f7-ink);font-variant-numeric:tabular-nums}
.f7-cv[data-b="1"]{color:var(--f7-red)}
.f7-who{grid-area:who;display:flex;align-items:baseline;justify-content:space-between;gap:10px;min-width:0}
.f7-wl{font:600 12.5px 'Inter',sans-serif;color:var(--f7-muted)}
.f7-wn{margin:0;font:800 22px/1.15 'Inter',sans-serif;color:var(--f7-ink);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;word-break:keep-all}
.f7-wt{flex:none;font:600 13px 'Inter',sans-serif;color:var(--f7-muted);text-align:right}
.f7-disp{grid-area:disp;position:relative;display:flex;align-items:center;gap:12px;background:var(--f7-card);border:1px solid var(--f7-line);border-radius:18px;padding:10px 14px;min-height:64px;box-sizing:border-box}
.f7-dv{font:800 42px/1 'Space Grotesk',sans-serif;color:var(--f7-acc);font-variant-numeric:tabular-nums;min-width:62px}
.f7-dv[data-b="1"]{color:var(--f7-red)}
.f7-df{flex:1;min-width:0;font:600 13px/1.35 'Inter',sans-serif;color:var(--f7-muted);overflow-wrap:anywhere}
.f7-df b{color:var(--f7-ink);font-weight:700}
.f7-badge{position:absolute;right:10px;top:-11px;padding:3px 9px;border-radius:999px;background:var(--f7-gold);color:var(--f7-bink,#1A1205);font:800 12px/1.2 'Space Grotesk',sans-serif;animation:f7Pop .32s cubic-bezier(.2,.8,.2,1) both}
@keyframes f7Pop{0%{transform:scale(.6);opacity:0}70%{transform:scale(1.12);opacity:1}100%{transform:scale(1)}}
.f7-lab{font:700 11px 'Inter',sans-serif;letter-spacing:.06em;text-transform:uppercase;color:var(--f7-muted);margin:0 0 5px}
.f7-nums{grid-area:nums}
.f7-grid{display:grid;grid-template-columns:repeat(7,minmax(0,1fr));gap:6px}
.f7-c{position:relative;height:58px;border-radius:9px;border:1.5px dashed color-mix(in oklab,var(--f7-muted) 38%,transparent);background:transparent;color:var(--f7-muted);font:400 21px/1 'Bowlby One',sans-serif;cursor:pointer;padding:0;display:grid;place-items:center;transition:opacity .15s linear,transform .12s ease-out;-webkit-tap-highlight-color:transparent}
.f7-c[data-on="1"]{border:1.5px solid var(--f7-fline);background:var(--f7-face);color:var(--c);box-shadow:0 3px 0 rgba(0,0,0,.28);transform:translateY(-2px);animation:f7Flip .26s cubic-bezier(.2,.8,.2,1)}
@keyframes f7Flip{0%{transform:translateY(-2px) rotateY(90deg);background:var(--f7-back);color:transparent}100%{transform:translateY(-2px) rotateY(0)}}
.f7-c:disabled{opacity:.3;cursor:default}
.f7-c:active:not(:disabled){transform:scale(.95)}
.f7-c[data-k="bust"]{font:800 13px/1.1 'Inter',sans-serif;border-style:solid;color:var(--f7-red);border-color:color-mix(in oklab,var(--f7-red) 45%,transparent)}
.f7-c[data-k="bust"][aria-pressed="true"]{background:var(--f7-red);color:#1A0606;border-color:var(--f7-red);animation:none;transform:none}
html[data-gt-theme="light"] .f7-c[data-k="bust"][aria-pressed="true"]{color:#FFFFFF}
.f7-mods{grid-area:mods}
.f7-mg{display:grid;grid-template-columns:repeat(6,minmax(0,1fr));gap:6px}
.f7-m{height:46px;border-radius:9px;border:1.5px dashed color-mix(in oklab,var(--f7-muted) 38%,transparent);background:transparent;color:var(--f7-muted);font:800 16px 'Space Grotesk',sans-serif;cursor:pointer;padding:0}
.f7-m[aria-pressed="true"]{border:1.5px solid var(--f7-gold);background:color-mix(in oklab,var(--f7-gold) 20%,transparent);color:var(--f7-gold)}
.f7-m:disabled{opacity:.3;cursor:default}
.f7-c:focus-visible,.f7-m:focus-visible,.f7-chip:focus-visible,.f7-seg button:focus-visible,.f7-save:focus-visible,.f7-ghost:focus-visible,.f7-cell:focus-visible{outline:2px solid var(--f7-acc);outline-offset:2px}
.f7-foot{grid-area:foot;display:flex;gap:8px}
.f7-ghost{flex:none;min-height:54px;padding:0 14px;border-radius:18px;border:1px solid var(--f7-line);background:transparent;color:var(--f7-muted);font:700 14px 'Inter',sans-serif;cursor:pointer;display:flex;align-items:center;gap:6px}
.f7-ghost:disabled{opacity:.4;cursor:default}
.f7-save{flex:1;min-width:0;min-height:54px;border:0;border-radius:18px;background:var(--f7-acc);color:var(--f7-on);font:800 17px 'Space Grotesk',sans-serif;cursor:pointer;padding:0 10px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.f7-tbl{background:var(--f7-card);border:1px solid var(--f7-line);border-radius:16px;padding:8px 6px;overflow-x:auto}
.f7-tr{display:grid;gap:4px;align-items:center;min-width:min-content}
.f7-th{font:700 11.5px 'Inter',sans-serif;color:var(--f7-muted);text-align:center;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;padding:4px 2px}
.f7-rn{font:700 12px 'Inter',sans-serif;color:var(--f7-muted);text-align:center}
.f7-cell{position:relative;min-height:42px;border:0;border-radius:10px;background:transparent;color:var(--f7-ink);font:700 16px 'Space Grotesk',sans-serif;font-variant-numeric:tabular-nums;cursor:pointer;padding:0 4px}
.f7-cell:hover{background:rgba(127,127,127,.12)}
.f7-cell[data-b="1"]{color:var(--f7-red);font-size:13px}
.f7-cell[data-f="1"]{color:var(--f7-gold)}
.f7-tot{border-top:1px solid var(--f7-line);margin-top:4px;padding-top:4px}
.f7-tot .f7-cell{cursor:default;font-weight:800;font-size:17px}
.f7-tot .f7-cell:hover{background:transparent}
.f7-empty{padding:24px 10px;text-align:center;font:500 14px 'Inter',sans-serif;color:var(--f7-muted)}
.f7-tview{display:flex;flex-direction:column;gap:10px}
.f7-ov{position:fixed;inset:0;background:rgba(0,0,0,.55);z-index:80;display:flex;align-items:flex-end;justify-content:center}
.gtL-content .f7-ov{align-items:center}
.f7-sheet{outline:none;width:100%;max-width:440px;max-height:94vh;max-height:94dvh;overflow-y:auto;box-sizing:border-box;background:var(--f7-card);color:var(--f7-ink);border-radius:24px 24px 0 0;padding:16px 16px calc(14px + env(safe-area-inset-bottom));box-shadow:0 -8px 30px rgba(0,0,0,.35);display:flex;flex-direction:column;gap:12px}
.gtL-content .f7-sheet{border-radius:24px}
.f7-sheet .f7-disp{background:transparent}
.f7-sh-head{display:flex;align-items:center;justify-content:space-between;gap:10px}
.f7-sh-title{font:700 17px 'Inter',sans-serif;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.f7-x{flex:none;width:44px;height:44px;border:0;background:transparent;color:var(--f7-muted);cursor:pointer;display:grid;place-items:center;padding:0;border-radius:12px}
@media (max-height:760px){.f7-fan{width:50px}.f7-word{font-size:28px}.f7-c{height:52px}.f7-m{height:44px}}
@media (max-height:700px){.f7-flow{gap:8px}.f7-hero{display:none}.f7-c{height:48px;font-size:19px}.f7-dv{font-size:36px}.f7-disp{min-height:56px;padding:8px 12px}.f7-save,.f7-ghost{min-height:48px}.f7-chip{min-height:42px}}
@media (max-height:620px){.f7-c{height:42px;font-size:17px}.f7-m{height:40px}.f7-lab{display:none}.f7-seg button{height:36px}.f7-wn{font-size:19px}}
@media (max-width:360px){.f7-grid,.f7-mg{gap:4px}.f7-c{font-size:17px}.f7-save{font-size:15px}.f7-gl{display:none}}
.gtL-content .f7-hero{display:none} .gtL-content .f7-hero.f7-su-hero{display:flex;justify-content:center;margin-top:0!important;margin-bottom:14px!important} .gtL-content .f7-su-hero .f7-word{font-size:48px} .gtL-content .f7-lap-hero{margin-top:-8px!important;margin-bottom:12px!important;flex-direction:column} .gtL-content .f7-lap-hero .f7-word{font-size:52px;margin-bottom:12px}
.gtL-content .f7-seg{display:none}
[data-phone-landscape] .f7-flow{grid-template-columns:minmax(0,.9fr) minmax(0,1.1fr);column-gap:14px;grid-template-areas:"seg nums" "tie nums" "strip nums" "who mods" "disp mods" "disp foot";align-items:start}
[data-phone-landscape] .f7-hero{display:none}
[data-phone-landscape] .f7-c{height:40px;font-size:17px}
[data-phone-landscape] .f7-m{height:40px}
[data-phone-landscape] .f7-save,[data-phone-landscape] .f7-ghost{min-height:46px}
@media (prefers-reduced-motion: reduce){.f7-c,.f7-badge{animation:none !important;transition:none}}
`;
const F7_PK_CSS=`
.f7-pk{--pkf:'Bagel Fat One','Bowlby One',sans-serif}
.f7-pk .gt-wm{font-size:clamp(26px,8.4vw,36px)!important;white-space:nowrap!important;color:#F4EAD5!important}
.f7-pk .f7-word{font-family:var(--pkf);font-weight:400;color:#F4EAD5;-webkit-text-stroke:.09em #141414;paint-order:stroke fill;text-shadow:.05em .07em 0 #141414;letter-spacing:0;white-space:nowrap}
.f7-pk .f7-fan{filter:drop-shadow(0 3px 0 #141414)}
.f7-pk .f7-sub{color:#141414}
.f7-pk .f7-seg{background:#FFFDF7;outline:2.5px solid #141414;outline-offset:-2.5px;box-shadow:0 4px 0 #141414;border-radius:18px}
.f7-pk .f7-seg button{font-family:var(--pkf);font-weight:400;color:#141414;border-radius:12px}
.f7-pk .f7-seg button[aria-selected="true"]{background:#1A1716;color:#F3EAD3}
.f7-pk .f7-tie{background:#FFFDF7;outline:2.5px solid #141414;outline-offset:-2.5px;color:#141414;box-shadow:0 3px 0 #141414}
.f7-pk .f7-chip{outline:2.5px solid #141414;outline-offset:-2.5px;background:#FFFDF7;border-radius:14px}
.f7-pk .f7-chip[data-s="cur"]{background:#E4312B;border-color:#141414;box-shadow:0 2px 0 #141414}
.f7-pk .f7-chip[data-s="cur"] .f7-cn,.f7-pk .f7-chip[data-s="cur"] .f7-cv{color:#F4EAD5}
.f7-pk .f7-chip[data-s="done"]{border-color:#141414;box-shadow:0 2px 0 #141414}
.f7-pk .f7-chip[data-s="open"]{background:transparent;border-style:dashed}
.f7-pk .f7-cn{font-weight:600}
.f7-pk .f7-cv{font-family:var(--pkf);font-weight:400}
.f7-pk .f7-cv[data-b="1"]{color:#B3261E}
.f7-pk .f7-wl,.f7-pk .f7-wt,.f7-pk .f7-lab{color:#141414}
.f7-pk .f7-wn{font-family:var(--pkf);font-weight:400}
.f7-pk .f7-lab{font-family:var(--pkf);font-weight:400;font-size:12px;letter-spacing:.08em}
.f7-pk .f7-disp{outline:2.5px solid #141414;outline-offset:-2.5px;box-shadow:0 4px 0 #141414;background:#FFFDF7;border-radius:20px}
.f7-pk .f7-dv{font-family:var(--pkf);font-weight:400;color:#141414}
.f7-pk .f7-dv[data-b="1"]{color:#B3261E}
.f7-pk .f7-df,.f7-pk .f7-df b{color:#141414}
.f7-pk .f7-badge{background:#141414;color:#F4EAD5;font-family:var(--pkf);font-weight:400;outline:2px solid #141414;outline-offset:-2px}
.f7-pk .f7-c{outline:2.5px dashed #141414;outline-offset:-2.5px;background:rgba(255,253,247,.35);color:#141414;border-radius:11px}
.f7-pk .f7-c[data-on="1"]{outline:2.5px solid #141414;outline-offset:-2.5px;background:#FFFDF7;color:var(--c);box-shadow:0 4px 0 #141414}
.f7-pk .f7-c:disabled{opacity:.4}
.f7-pk .f7-c[data-k="bust"]{font-family:var(--pkf);font-weight:400;font-size:13px;border-style:solid;background:#FFFDF7;color:#B3261E}
.f7-pk .f7-c[data-k="bust"][aria-pressed="true"]{background:#B3261E;color:#FFFFFF;border-color:#141414;box-shadow:0 4px 0 #141414}
.f7-pk .f7-m{outline:2.5px dashed #141414;outline-offset:-2.5px;background:rgba(255,253,247,.35);color:#141414;font-family:var(--pkf);font-weight:400;border-radius:11px}
.f7-pk .f7-m[aria-pressed="true"]{outline:2.5px solid #141414;outline-offset:-2.5px;background:#1A1716;color:#F3EAD3;box-shadow:0 3px 0 #141414}
.f7-pk .f7-m:disabled{opacity:.4}
.f7-pk .f7-ghost{outline:2.5px solid #141414;outline-offset:-2.5px;background:#FFFDF7;color:#141414;box-shadow:0 4px 0 #141414;font-family:var(--pkf);font-weight:400}
.f7-pk .f7-save{position:relative;outline:2.5px solid #141414;outline-offset:-2.5px;background:#1A1716;color:#F3EAD3;box-shadow:0 6px 0 #141414;font-family:var(--pkf);font-weight:400;font-size:17px;border-radius:20px}
.f7-pk .f7-ghost:active,.f7-pk .f7-save:active{transform:translateY(3px);box-shadow:0 1px 0 #141414}
.f7-pk .f7-save::after{content:"";position:absolute;top:0;bottom:0;left:0;width:35%;background:linear-gradient(90deg,transparent,rgba(255,255,255,.3),transparent);animation:pk-shine 3.2s ease-in-out infinite;pointer-events:none}
.f7-pk .f7-tbl{background:#FFFDF7;outline:2.5px solid #141414;outline-offset:-2.5px;box-shadow:0 4px 0 #141414;border-radius:20px}
.f7-pk .f7-th{font-family:var(--pkf);font-weight:400;font-size:12px;color:#141414}
.f7-pk .f7-rn,.f7-pk .f7-empty{color:#141414}
.f7-pk .f7-cell{font-family:var(--pkf);font-weight:400}
.f7-pk .f7-cell[data-b="1"]{color:#B3261E}
.f7-pk .f7-cell[data-f="1"]{color:#141414;text-decoration:underline wavy #E4312B;text-decoration-thickness:2px}
.f7-pk .f7-tot{border-top:2.5px solid #141414}
.f7-pk .f7-tot .f7-cell{font-weight:400}
.f7-pk.f7-pk .f7-sheet,.f7-pk .f7-sheet{background:#FFFDF7;outline:2.5px solid #141414;outline-offset:-2.5px;border-bottom:none;box-shadow:0 -5px 0 #141414}
.f7-pk .f7-sh-title{font-family:var(--pkf);font-weight:400}
.f7-pk .f7-sheet .f7-disp{background:#F4EAD5}
.f7-pk .f7-sheet .f7-c{background:#F4EAD5}
.f7-pk :focus-visible{outline-color:#141414}
/* Ryu-Eigenbau: Spielkarten, Stempel, Starburst */
.f7-pk .f7-word{display:inline-block}
.f7-pk .f7-seven{position:relative;display:inline-block;z-index:0;isolation:isolate;color:#E4312B;-webkit-text-fill-color:#E4312B;background:#FFFDF7;-webkit-text-stroke:0;text-shadow:none;font-size:.86em;line-height:1;padding:.1em .2em .06em;margin-left:.16em;border-radius:.16em;outline:.07em solid #141414;box-shadow:.05em .08em 0 #141414;transform:rotate(6deg);vertical-align:-.02em}
.f7-pk .f7-seven::before,.f7-pk .f7-seven::after{content:"";position:absolute;inset:0;z-index:-1;border-radius:.16em;outline:.07em solid #141414;transform-origin:20% 100%}
.f7-pk .f7-seven::before{background:#EADDC2;transform:rotate(-13deg) translateX(-.05em)}
.f7-pk .f7-seven::after{background:#D8CBA8;transform:rotate(-26deg) translateX(-.08em)}
.f7-pk .f7-hero{margin-bottom:4px}
.f7-pk .f7-lab{display:inline-block;background:#141414;color:#F3EAD3;padding:3px 9px 2px;border-radius:7px;transform:rotate(-1.5deg);margin-bottom:8px}
.f7-pk .f7-wl{display:inline-block;background:#141414;color:#F3EAD3;font-size:11px;font-weight:700;padding:2px 8px;border-radius:6px;transform:rotate(-1.5deg)}
.f7-pk .f7-wn{font-size:26px;color:#141414;text-shadow:0 0 0 #141414;padding-top:2px}
.f7-pk .f7-wt{background:#FFFDF7;outline:2.5px solid #141414;outline-offset:-2.5px;box-shadow:0 3px 0 #141414;border-radius:12px;padding:6px 10px;font-weight:700;transform:rotate(1.6deg)}
.f7-pk .f7-chip{box-shadow:0 3px 0 #141414}
.f7-pk .f7-chip[data-s="cur"]{background:#1A1716;transform:rotate(-1.5deg) translateY(-1px);box-shadow:0 4px 0 #141414}
.f7-pk .f7-chip[data-s="cur"] .f7-cn,.f7-pk .f7-chip[data-s="cur"] .f7-cv{color:#F3EAD3}
.f7-pk .f7-chip[data-s="done"]{background:#F3EAD3}
.f7-pk .f7-chip[data-s="open"]{box-shadow:none}
.f7-pk .f7-cv[data-b="1"]{color:#E4312B}
.f7-pk .f7-chip[data-s="cur"] .f7-cv[data-b="1"]{color:#F3EAD3}
.f7-pk .f7-chip[data-s="done"] .f7-cv[data-b="1"]{color:#B3261E}
/* Anzeige: Spielkarte mit Eckzahl-Optik, Bust = roter Stempel, Flip 7 = Strahlen */
.f7-pk .f7-disp{overflow:visible}
.f7-pk .f7-dv{font-size:46px}
.f7-pk .f7-disp:has(.f7-dv[data-b="1"]){background:repeating-linear-gradient(-45deg,#FFFDF7 0 9px,#F3D9D4 9px 18px)}
.f7-pk .f7-dv[data-b="1"]{color:#B3261E;position:relative;transform:rotate(-5deg);outline:3px double #B3261E;outline-offset:6px;border-radius:6px;padding:0 6px;margin:0 8px 0 4px}
.f7-pk .f7-disp:has(.f7-badge){background:repeating-conic-gradient(from 0deg at 18% 50%,#FFFDF7 0 9deg,#F4EAD5 9deg 18deg)}
.f7-pk .f7-badge{right:8px;top:-17px;padding:11px 14px 9px;background:transparent;color:#F3EAD3;outline:0;font-size:12.5px;letter-spacing:.02em;transform:rotate(7deg);isolation:isolate;filter:drop-shadow(0 3px 0 #141414);animation:f7PkBurst .4s cubic-bezier(.2,.8,.2,1) both}
.f7-pk .f7-badge::before{content:"";position:absolute;inset:-6px -4px;z-index:-1;background:#1A1716;clip-path:polygon(50% 0,59% 14%,75% 6%,76% 22%,93% 25%,86% 40%,100% 50%,86% 60%,93% 75%,76% 78%,75% 94%,59% 86%,50% 100%,41% 86%,25% 94%,24% 78%,7% 75%,14% 60%,0 50%,14% 40%,7% 25%,24% 22%,25% 6%,41% 14%)}
@keyframes f7PkBurst{0%{transform:rotate(-20deg) scale(.3);opacity:0}65%{transform:rotate(10deg) scale(1.18);opacity:1}100%{transform:rotate(7deg) scale(1)}}
/* Zahlenkarten: echte Karten mit Eckzahlen, ausgewaehlte werden ausgeteilt */
.f7-pk .f7-grid{gap:7px 6px;padding-top:3px}
.f7-pk .f7-c{border-radius:9px;color:#141414;--r:0deg}
.f7-pk .f7-c::before,.f7-pk .f7-c::after{content:attr(data-v);position:absolute;font:400 9px/1 var(--pkf);color:inherit;pointer-events:none}
.f7-pk .f7-c::before{left:5px;top:4px}
.f7-pk .f7-c::after{right:5px;bottom:4px;transform:rotate(180deg)}
.f7-pk .f7-c[data-k="bust"]::before,.f7-pk .f7-c[data-k="bust"]::after{content:none}
.f7-pk .f7-c:nth-child(4n+1){--r:-2.2deg}
.f7-pk .f7-c:nth-child(4n+2){--r:1.4deg}
.f7-pk .f7-c:nth-child(4n+3){--r:-1deg}
.f7-pk .f7-c:nth-child(4n){--r:2deg}
.f7-pk .f7-c[data-on="1"]{color:#141414;transform:translateY(-4px) rotate(var(--r));box-shadow:0 5px 0 #141414;animation:f7PkDeal .3s cubic-bezier(.2,.9,.25,1.2) both}
@keyframes f7PkDeal{0%{transform:translateY(-22px) rotate(calc(var(--r) * 5)) scale(.8);opacity:.2}100%{transform:translateY(-4px) rotate(var(--r)) scale(1);opacity:1}}
.f7-pk .f7-c:active:not(:disabled){transform:translateY(0) scale(.95) rotate(var(--r))}
/* die Sieben: Heldenkarte */
.f7-pk .f7-c[data-v="7"]{background:#FFFDF7;color:#E4312B;outline-style:solid;box-shadow:0 3px 0 #141414}
.f7-pk .f7-c[data-v="7"][data-on="1"]{color:#E4312B;box-shadow:0 5px 0 #141414,0 0 0 2px #F3EAD3,0 0 0 4px #141414;z-index:1}
.f7-pk .f7-c[data-v="7"]:disabled{opacity:.55}
/* Bust: roter Stempel */
.f7-pk .f7-c[data-k="bust"]{transform:rotate(-4deg);outline-style:double;outline-width:4px;outline-offset:-5px;color:#B3261E;background:#FFFDF7;letter-spacing:.02em;font-size:12.5px}
.f7-pk .f7-c[data-k="bust"][aria-pressed="true"]{background:#B3261E;color:#F3EAD3;outline-color:#F3EAD3;outline-style:double;box-shadow:0 4px 0 #141414,0 0 0 2.5px #141414;transform:rotate(-7deg) scale(1.06);animation:f7PkStamp .28s cubic-bezier(.3,1.4,.4,1) both}
@keyframes f7PkStamp{0%{transform:rotate(-20deg) scale(1.9);opacity:0}100%{transform:rotate(-7deg) scale(1.06);opacity:1}}
/* Bonuskarten: runde Marken */
.f7-pk .f7-m{border-radius:999px;color:#141414}
.f7-pk .f7-m[aria-pressed="true"]{background:#1A1716;color:#F3EAD3;transform:rotate(-2deg);box-shadow:0 4px 0 #141414}
.f7-pk .f7-m:last-child{font-size:19px}
.f7-pk .f7-m:last-child:not([aria-pressed="true"]){background:#FFFDF7;outline-style:solid;color:#E4312B}
.f7-pk .f7-mg{padding-top:2px}
/* Tabelle */
.f7-pk .f7-tbl{padding:10px 8px}
.f7-pk .f7-tr:not(.f7-tot):nth-child(even){background:rgba(20,20,20,.06);border-radius:10px}
.f7-pk .f7-th{background:#141414;color:#F3EAD3;border-radius:7px;padding:4px 6px 3px}
.f7-pk .f7-cell[data-b="1"]{color:#B3261E;font-size:12px;outline:2.5px double #B3261E;outline-offset:-4px;transform:rotate(-5deg);border-radius:6px}
.f7-pk .f7-cell[data-f="1"]{background:#1A1716;color:#F3EAD3;text-decoration:none;border-radius:14px;transform:rotate(-3deg);box-shadow:0 2px 0 #141414;margin:3px 4px;min-height:36px}
.f7-pk .f7-tot{background:#1A1716;border-radius:12px;margin:8px 0 0;padding:4px 0;border-top:0}
.f7-pk .f7-tot .f7-cell,.f7-pk .f7-tot .f7-rn{color:#F3EAD3!important;font-size:19px}
.f7-pk .f7-seg{transform:rotate(-.4deg)}
.f7-pk .f7-deck{display:none;position:relative;height:72px;margin:0;pointer-events:none}
.f7-pk .f7-deck span{position:absolute;bottom:0;left:50%;width:44px;height:60px;margin-left:-22px;background:#FFFDF7;outline:2.5px solid #141414;outline-offset:-2.5px;border-radius:9px;box-shadow:0 3px 0 #141414;font:400 17px/1 var(--pkf);text-align:left;padding:6px 0 0 7px;box-sizing:border-box;color:#141414;transform-origin:50% 170px;transform:rotate(calc(var(--i) * 8deg))}
.f7-pk .f7-deck span:last-child{color:#E4312B;font-size:30px;text-align:center;padding:12px 0 0;transform:rotate(26deg) scale(1.08);box-shadow:0 3px 0 #141414,0 0 0 2px #F3EAD3,0 0 0 4px #141414}
@media (min-height:800px){.f7-pk .f7-deck{display:block}}
.gtL-content .f7-pk .f7-deck{display:block;margin:22px 0 14px}
[data-phone-landscape] .f7-pk .f7-deck{display:none}
.f7-pk .f7-tie{transform:rotate(-1deg);font-family:var(--pkf);font-weight:400}
@media (max-width:360px){.f7-pk .f7-c::before,.f7-pk .f7-c::after{display:none}.f7-pk .f7-wn{font-size:22px}.f7-pk .f7-badge{font-size:11px;padding:10px 11px 8px}}
@media (max-height:700px){.f7-pk .f7-c::before,.f7-pk .f7-c::after{display:none}}
[data-phone-landscape] .f7-pk .f7-c::before,[data-phone-landscape] .f7-pk .f7-c::after{display:none}
@media (prefers-reduced-motion:reduce){.f7-pk .f7-c[data-on="1"],.f7-pk .f7-c[data-k="bust"][aria-pressed="true"],.f7-pk .f7-badge{animation:none!important}}
@media (prefers-reduced-motion:reduce){.f7-pk .f7-save::after{animation:none;display:none}}
`;
function Flip7Fan({theme,className}){const k=f7T(theme);const vs=[3,12,7];const ang=[-22,0,22];return <svg className={className} viewBox="0 0 96 70" aria-hidden="true">{vs.map((v,i)=><g key={i} transform={`rotate(${ang[i]} 48 66)`}><rect x="33" y="8" width="30" height="42" rx="5" fill={k.face} stroke={theme==="light"?"rgba(40,36,30,.3)":"rgba(0,0,0,.35)"} strokeWidth="1.2"/><text x="48" y="37" fontSize={v>9?15:18} fontFamily="'Bowlby One',sans-serif" fill={f7NumCol(v,theme)} textAnchor="middle">{v}</text></g>)}</svg>;}
function Flip7Picker({e,setE,t,theme}){const n=e.nums.length;const full=n>=7;const tog=v=>setE(f7Entry(e.nums.includes(v)?e.nums.filter(x=>x!==v):[...e.nums,v],e.mods,e.x2,false));const togM=m=>setE(f7Entry(e.nums,e.mods.includes(m)?e.mods.filter(x=>x!==m):[...e.mods,m],e.x2,false));return <React.Fragment><div className="f7-nums"><div className="f7-lab">{t("f7Numbers")}</div><div className="f7-grid" role="group" aria-label={t("f7Numbers")}>{F7_NUMS.map(v=>{const on=e.nums.includes(v);return <button key={v} type="button" className="f7-c" data-v={v} data-on={on?"1":undefined} aria-pressed={on} disabled={e.busted||(!on&&full)} style={{"--c":f7NumCol(v,theme)}} onClick={()=>tog(v)}>{v}</button>;})}<button type="button" className="f7-c" data-k="bust" aria-pressed={e.busted} onClick={()=>setE(e.busted?f7Entry([],[],false,false):f7Entry([],[],false,true))}>{t("flip7BustAbbr")}</button></div></div><div className="f7-mods"><div className="f7-lab">{t("f7Mods")}</div><div className="f7-mg" role="group" aria-label={t("f7Mods")}>{FLIP7_MODS.map(m=><button key={m} type="button" className="f7-m" aria-pressed={e.mods.includes(m)} disabled={e.busted} onClick={()=>togM(m)}>+{m}</button>)}<button type="button" className="f7-m" aria-pressed={e.x2} disabled={e.busted} aria-label={t("f7Double")} onClick={()=>setE(f7Entry(e.nums,e.mods,!e.x2,false))}>{"×2"}</button></div></div></React.Fragment>;}
function Flip7Display({e,t}){const sc=flip7RoundScore(e);let parts=[];if(e.busted)parts=[t("flip7BustedHint")];else{if(e.nums.length)parts.push(<b key="n">{e.nums.join(" + ")}</b>);if(e.x2)parts.push(<span key="x">{" ×2"}</span>);e.mods.forEach(m=>parts.push(<span key={"m"+m}>{" +"+m}</span>));if(e.flip7)parts.push(<span key="f">{" +15"}</span>);if(!parts.length)parts=[t("f7TapCards")];}return <div className="f7-disp" aria-live="polite"><div className="f7-dv" data-b={e.busted?"1":undefined}>{sc}</div><div className="f7-df">{parts}</div>{e.flip7&&<span className="f7-badge">{t("f7Flip7Badge")}</span>}</div>;}
function F7Undo(){return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M9 7 4 12l5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M4 12h10a6 6 0 0 1 0 12h-2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" transform="translate(0 -6)"/></svg>;}
function f7Blank(){return f7Entry([],[],false,false);}
function f7Norm(x){if(!x||typeof x!=="object")return null;if(Array.isArray(x.nums))return f7Entry(x.nums,x.mods,x.x2,x.busted);return null;}
function f7Draft(draft,players){const ids=players.map(p=>p.id);const ents={};ids.forEach(id=>{ents[id]=(draft&&draft.ents&&f7Norm(draft.ents[id]))||f7Blank();});const touched={};ids.forEach(id=>{touched[id]=!!(draft&&draft.touched&&draft.touched[id]);});const cur=draft&&Number.isInteger(draft.cur)&&draft.cur>=0&&draft.cur<ids.length?draft.cur:0;return{cur,ents,touched};}
function Flip7Flow({players,d,upd,roundNo,target,tie,theme,t,lap,keysOn,onSave,view,setView}){const pk=usePlakat();const n=players.length;const cur=d.cur;const p=players[cur]||players[0];const e=d.ents[p.id];const last=cur>=n-1;const stripRef=useRef(null);const setE=v=>upd(dr=>({ents:{...dr.ents,[p.id]:v},touched:{...dr.touched,[p.id]:true}}));const goTo=i=>upd({cur:i});const next=()=>{if(last){const ents=players.map(q=>[q.id,d.ents[q.id]]);onSave(Object.fromEntries(ents.map(([id,x])=>[id,flip7RoundScore(x)])),Object.fromEntries(ents));}else goTo(cur+1);};useGtlKeys(!!keysOn,ev=>{const k=ev.key;if(k==="Enter"){if(ev.target&&ev.target.closest&&ev.target.closest("button,[role=\"button\"]"))return;ev.preventDefault();next();}});useEffect(()=>{const el=stripRef.current;if(!el)return;const c=el.querySelector('[aria-current="step"]');if(!c)return;el.scrollLeft=Math.max(0,c.offsetLeft-el.clientWidth/2+c.offsetWidth/2);},[cur]);const act=fn=>ev=>{if(ev.key==="Enter"||ev.key===" "){ev.preventDefault();fn();}};const sc=flip7RoundScore(e);const nextName=players[cur+1]?players[cur+1].name:"";const rest=Math.max(0,target-(p.total+sc));return <div className="f7-flow">
 {!lap&&<div className="f7-hero"><div><h1 className="f7-word">{"FLIP 7"}</h1>{pk?<PkRibbon bg="#141414" color="#F4EAD5" fontSize={12} lineHeight={1.2} style={{marginTop:3}}>{t("skyjoTarget")} {target}</PkRibbon>:<div className="f7-sub">{t("skyjoTarget")} {target}</div>}</div></div>}
 {!lap&&<div className="f7-seg" role="tablist"><button role="tab" aria-selected={view==="round"} onClick={()=>setView("round")}>{t("skyjoRoundLabel")(roundNo)}</button><button role="tab" aria-selected={view==="table"} onClick={()=>setView("table")}>{t("skyjoViewTable")}</button></div>}
 {tie&&<div className="f7-tie" role="status">{t("f7TieRound")}</div>}
 <div className="f7-strip" ref={stripRef} role="group" aria-label={t("skyjoFlowStrip")}>{players.map((q,i)=>{const x=d.ents[q.id];const has=d.touched[q.id];const s=i===cur?"cur":has?"done":"open";return <div key={q.id} className="f7-chip press-fx" data-s={s} role="button" tabIndex={0} aria-current={i===cur?"step":undefined} aria-label={`${q.name}${has?", "+(x.busted?t("flip7BustAbbr"):flip7RoundScore(x)):""}`} onClick={()=>goTo(i)} onKeyDown={act(()=>goTo(i))}><span className="f7-cn">{q.name}</span><span className="f7-cv" data-b={has&&x.busted?"1":undefined}>{has?(x.busted?t("flip7BustAbbr"):flip7RoundScore(x)):"·"}</span></div>;})}</div>
 <div className="f7-who"><div style={{minWidth:0}}><div className="f7-wl">{t("f7CardsOf")}</div><h2 className="f7-wn">{p.name}</h2></div><div className="f7-wt">{t("skyjoFlowNewTotal")(p.total+sc)}<br/>{rest>0?t("f7ToTarget")(rest):t("f7AtTarget")}</div></div>
 <Flip7Display e={e} t={t}/>
 <Flip7Picker e={e} setE={setE} t={t} theme={theme}/>
 <div className="f7-foot"><button className="f7-ghost press-fx" disabled={cur===0} onClick={()=>goTo(cur-1)} aria-label={t("mgUndo")}><F7Undo/><span className="f7-gl">{t("mgUndo")}</span></button><button className="f7-save press-fx" data-gt-sound={last?"1":undefined} onClick={next}>{last?t("skyjoSaveRoundN")(roundNo):t("skyjoFlowNextTo")(nextName)}</button></div>
</div>;}
function Flip7Table({players,history,target,onCell,t}){const n=history.length;if(n===0)return <div className="f7-tbl"><div className="f7-empty">{t("skyjoTableEmpty")}</div></div>;const cols=`28px repeat(${players.length}, minmax(${players.length>5?54:0}px, 1fr))`;return <div className="f7-tbl"><div className="f7-tr" style={{gridTemplateColumns:cols}}><span/>{players.map(p=><span key={p.id} className="f7-th" title={p.name}>{p.name}</span>)}</div>{history.map((r,i)=><div key={i} className="f7-tr" style={{gridTemplateColumns:cols}}><span className="f7-rn">{i+1}</span>{players.map(p=>{const x=(r.data&&r.data[p.id])||{};const sc=(r.scores&&r.scores[p.id])||0;return <button key={p.id} className="f7-cell press-fx" data-b={x.busted?"1":undefined} data-f={x.flip7&&!x.busted?"1":undefined} aria-label={`${p.name}, ${t("skyjoRoundLabel")(i+1)}: ${x.busted?t("flip7BustAbbr"):sc}`} onClick={()=>onCell(i,p.id)}>{x.busted?t("flip7BustAbbr"):sc}</button>;})}</div>)}<div className="f7-tr f7-tot" style={{gridTemplateColumns:cols}}><span className="f7-rn">{"Σ"}</span>{players.map(p=><span key={p.id} className="f7-cell" style={{display:"grid",placeItems:"center",color:target>0&&p.total>=target?"var(--f7-acc)":undefined}}>{p.total}</span>)}</div></div>;}
function Flip7EditSheet({player,round,init,onSave,onClose,theme,t}){const[e,setE]=useState(()=>f7Norm(init)||f7Blank());const e0=useRef(null);if(e0.current===null)e0.current=JSON.stringify(e);const tapOut=()=>{if(JSON.stringify(e)!==e0.current)return;onClose();};const tapRef=useRef(tapOut);tapRef.current=tapOut;const ref=useGtDialog({open:true,onClose,outside:()=>tapRef.current()});return <div className="f7-ov" onClick={tapOut}><div className="f7-sheet" role="dialog" aria-modal="true" aria-label={`${player.name}, ${t("skyjoRoundLabel")(round)}`} tabIndex={-1} ref={ref} onClick={ev=>ev.stopPropagation()}><div className="f7-sh-head"><div className="f7-sh-title">{player.name} · {t("skyjoRoundLabel")(round)}</div><button className="f7-x" onClick={onClose} aria-label={t("skyjoGridClose")}><XMark/></button></div><Flip7Display e={e} t={t}/><Flip7Picker e={e} setE={setE} t={t} theme={theme}/><button className="f7-save press-fx" data-gt-sound="1" onClick={()=>onSave(e)}>{t("confirm")}</button></div></div>;}
function Flip7Setup({state,setState,onStart,theme,t}){const pk=usePlakat();const fk=gtSoftTk(pk?f7PkT(f7T(theme)):f7T(theme),theme);const gtS=gtSkin(theme,fk,"flip7",{font:FLIP7_FONT,acc:pk?"#1A1716":fk.acc});const{players,target}=state;const setPlayers=updater=>setState(s=>({...s,players:typeof updater==="function"?updater(s.players):updater}));const rename=(idx,name)=>setPlayers(ps=>ps.map((p,i)=>i===idx?{...p,name}:p));const addPlayer=()=>setPlayers(ps=>{const nextId=ps.length?Math.max(...ps.map(p=>p.id))+1:1;return[...ps,{id:nextId,name:t("defaultPlayerName")(ps.length+1),total:0}];});const removePlayer=idx=>setPlayers(ps=>ps.filter((_,i)=>i!==idx));const tooFew=players.length<2;return <div className="gt-ug-fill"><div className="gtL-split gtL-split-setup pld-split pld-setup"><div className="gtL-col-main"><div className="f7-hero f7-su-hero" style={{marginBottom:10,marginTop:-14}}><h1 className="f7-word">{"FLIP 7"}</h1></div><GroupPicker getNames={()=>players.map(p=>p.name)} setNames={names=>setPlayers(names.map((name,i)=>({id:i+1,name,total:0})))} t={t} tk={gtSkinTk(fk,gtS)}/><GtPlayerList players={players} onRename={rename} onRemove={removePlayer} onAdd={addPlayer} skin={gtS} t={t} minPlayers={2}/></div><div className="gtL-col-side"><div className="gt-chres"><GtChips label={t("skyjoTarget")} options={[100,150,200]} value={target} onChange={v=>setState(s=>({...s,target:v}))} custom max={9999} skin={gtS} t={t}/></div>{pk&&<div className="f7-deck" aria-hidden="true">{[1,2,3,4,5,6,7].map(v=><span key={v} style={{"--i":v-4}}>{v}</span>)}</div>}<GtStartBar onClick={onStart} disabled={tooFew} label={tooFew?t("needTwoPlayersHeadsUp"):t("startGame")} skin={gtS}/></div></div></div>;}
function f7Flip7Count(history,pid){return(history||[]).filter(r=>r&&r.data&&r.data[pid]&&r.data[pid].flip7&&!r.data[pid].busted).length;}
function Flip7GameOver({players,history,onRestart,onNewSetup,onUndo,theme,t}){const k=f7T(theme);const ranked=[...players].sort((a,b)=>b.total-a.total);const winner=ranked[0];const celebration=useCelebration(true);const[podiumOpen,setPodiumOpen]=useState(false);useEffect(()=>{setPodiumOpen(true);recordMatch("flip7",players.map(p=>({name:p.name,score:p.total})),false,(()=>{const f7=players.filter(p=>f7Flip7Count(history,p.id)>0).map(p=>p.name);return f7.length?{flip7:f7}:undefined;})());},[]);const podiumRanked=ranked.map(p=>({name:p.name,score:p.total}));return <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:16}}>{celebration}<PodiumOverlay gameId="flip7" gameLabel={t("gameFlip7")} open={podiumOpen} onClose={()=>setPodiumOpen(false)} onRestart={onRestart} ranked={podiumRanked} tk={k} t={t} theme={theme} shareExtra={()=>({players:ranked.map(p=>({name:p.name,rounds:(history||[]).map(r=>Number(r&&r.scores&&r.scores[p.id])||0),flip7:f7Flip7Count(history,p.id)}))})}/><div className="reveal-1"><Flip7Fan theme={theme} className="f7-fan"/></div><div className="reveal-2" style={{fontSize:24,fontWeight:800,color:k.acc,fontFamily:FLIP7_FONT,textAlign:"center"}}>{gtWinLine(t,"winnerWins","winnersTie",ranked.filter(q=>q.total===winner.total).map(q=>q.name))}</div><div className="reveal-3" style={{display:"flex",flexDirection:"column",gap:6,width:"100%",maxWidth:300}}>{ranked.map((p,i)=><div key={p.id} style={{display:"flex",justifyContent:"space-between",alignItems:"center",gap:10,padding:"10px 14px",background:i===0?`color-mix(in oklab, ${k.acc} 14%, ${k.card})`:k.card,border:`1px solid ${i===0?k.acc:k.line}`,borderRadius:18}}><span style={{fontSize:14,fontWeight:600,color:k.ink,fontFamily:"'Inter', sans-serif",minWidth:0,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{i===0&&<GameIcon name="crown" size={13} color={k.acc} style={{marginRight:4,verticalAlign:"-2px"}}/>}{p.name}</span><span style={{fontSize:16,fontWeight:800,color:i===0?k.acc:k.muted,fontFamily:FLIP7_FONT}}>{p.total}</span></div>)}</div><div className="reveal-4" style={{display:"flex",gap:8,marginTop:8,flexWrap:"wrap",justifyContent:"center"}}><button data-gt-sound="1" onClick={onRestart} className="press-fx" style={{...flip7BtnPrimary(theme),padding:"12px 22px",minHeight:44}}>{t("rematch")}</button><button onClick={onNewSetup} className="press-fx" style={flip7BtnGhost(theme)}>{t("changePlayers")}</button><button onClick={onUndo} className="press-fx" style={flip7BtnGhost(theme)}>{t("skyjoUndoRound")}</button></div></div>;}
function f7Totals(players,history){return players.map(p=>({...p,total:(history||[]).reduce((s,r)=>s+((r&&r.scores&&r.scores[p.id])||0),0)}));}
function f7Status(players,target,nRounds){if(!nRounds)return"play";const max=Math.max(...players.map(p=>p.total));if(max<target)return"play";return players.filter(p=>p.total===max).length>1?"tie":"over";}
function Flip7Game({state,setState,onBack,onHome,onEndGame,lang="de",theme="dark"}){const pk=usePlakat();const t=useT(lang);const k=f7T(theme);const[rulesOpen,setRulesOpen]=useState(false);const[view,setView]=useState("round");const[edit,setEdit]=useState(null);const rootRef=useRef(null);const[lap,setLap]=useState(false);const history=state.history||[];const nRounds=history.length;const status=state.phase==="play"?f7Status(state.players,state.target,nRounds):"play";const gameOver=status==="over";React.useLayoutEffect(()=>{setLap(!!(rootRef.current&&rootRef.current.closest(".gtL-content")));},[state.phase,gameOver]);const d=f7Draft(state.draft,state.players);const upd=f=>setState(s=>{const dr=f7Draft(s.draft,s.players);const patch=typeof f==="function"?f(dr):f;return{...s,draft:{...dr,...patch}};});const startGame=()=>{setState(s=>({...s,phase:"play",draft:null,history:[],players:s.players.map(p=>({id:p.id,name:p.name,total:0}))}));setView("round");};const saveRound=(scores,data)=>{setState(s=>{const h=[...(s.history||[]),{scores,data}];return{...s,draft:null,history:h,players:f7Totals(s.players,h)};});};const editCell=(i,pid,e)=>{setState(s=>{const h=(s.history||[]).map((r,k2)=>k2!==i?r:{scores:{...r.scores,[pid]:flip7RoundScore(e)},data:{...r.data,[pid]:e}});return{...s,history:h,players:f7Totals(s.players,h)};});setEdit(null);};const undoRound=()=>{globalThis.__gtUndoAt=Date.now();if(!nRounds)return;const lastR=history[nRounds-1];const ents={};const touched={};state.players.forEach(p=>{ents[p.id]=f7Norm(lastR.data&&lastR.data[p.id])||f7Blank();touched[p.id]=true;});setState(s=>{const h=(s.history||[]).slice(0,-1);return{...s,history:h,players:f7Totals(s.players,h),draft:{cur:0,ents,touched}};});setView("round");};const shellVars={maxWidth:lap?undefined:420,margin:"0 auto",position:"relative",...f7Vars(k,pk)};const editPlayer=edit?state.players.find(p=>p.id===edit.pid):null;const keysOn=lap&&!edit&&!rulesOpen;if(state.phase==="setup"){return <div className={"gtL-shellpage pld-shell"+(pk?" f7-pk":"")} style={pk?{...f7Shell(theme),background:pkPage().background,backgroundBlendMode:"multiply","--pk-bg":"#E4312B"}:f7Shell(theme)}><style>{GLOBAL_STYLES}{PLD_CSS}{F7_CSS}{pk?F7_PK_CSS:""}</style><div className="gtL-game pl-wide pl-page pl-head-compact pld" style={{maxWidth:380,margin:"0 auto",position:"relative",...f7Vars(k,pk)}}><GtCol accent={k.acc} className="gt-ug"><style>{GT_UG_CSS}</style><RulesButton onClick={()=>setRulesOpen(true)} onHome={onHome} tokens={k}/><Flip7TopBar subtitle={t("gtNewMatch")} onBack={onBack} theme={theme} t={t} hideTitle/><Flip7Setup state={state} setState={setState} onStart={startGame} theme={theme} t={t}/></GtCol></div><RulesSheet open={rulesOpen} onClose={()=>setRulesOpen(false)} title={t("gameFlip7")} text={t("rulesFlip7")} tokens={k}/></div>;}
const table=<div className="f7-tview"><Flip7Table players={state.players} history={history} target={state.target} onCell={(i,pid)=>setEdit({i,pid})} t={t}/>{nRounds>0&&<button className="f7-ghost press-fx" style={{alignSelf:"center"}} onClick={undoRound}><F7Undo/>{t("skyjoUndoRound")}</button>}</div>;
return <div className={"gtL-shellpage pld-shell"+(pk?" f7-pk":"")} style={pk?{...f7Shell(theme),background:pkPage().background,backgroundBlendMode:"multiply","--pk-bg":"#E4312B"}:f7Shell(theme)}><style>{GLOBAL_STYLES}{PLD_CSS}{F7_CSS}{pk?F7_PK_CSS:""}</style><div ref={rootRef} className="gtL-game pl-wide pl-page pl-head-compact" style={shellVars}><RulesButton onClick={()=>setRulesOpen(true)} onHome={onHome} onEndGame={onEndGame} tokens={k}/><Flip7TopBar subtitle={`${t("skyjoTarget")} ${state.target}`} onBack={onBack} theme={theme} t={t} hideTitle/>{lap&&<div className="f7-hero f7-su-hero f7-lap-hero" style={{textAlign:"center"}}><div><h1 className="f7-word">{"FLIP 7"}</h1>{pk?<PkRibbon bg="#141414" color="#F4EAD5" fontSize={12} lineHeight={1.2} style={{marginTop:3}}>{t("skyjoTarget")} {state.target}</PkRibbon>:<div className="f7-sub">{t("skyjoTarget")} {state.target}</div>}</div></div>}{gameOver?<Flip7GameOver players={state.players} history={history} onRestart={startGame} onUndo={undoRound} onNewSetup={()=>setState(s=>({...s,phase:"setup",draft:null}))} theme={theme} t={t}/>:<div className="gtL-split"><div className="gtL-col-main">{(lap||view==="round")?<Flip7Flow players={state.players} d={d} upd={upd} roundNo={nRounds+1} target={state.target} tie={status==="tie"} theme={theme} t={t} lap={lap} keysOn={keysOn} onSave={saveRound} view={view} setView={setView}/>:<div className="f7-flow" style={{gridTemplateAreas:"\"hero\" \"seg\" \"tbl\""}}><div className="f7-hero"><div><h1 className="f7-word">{"FLIP 7"}</h1>{pk?<PkRibbon bg="#141414" color="#F4EAD5" fontSize={12} lineHeight={1.2} style={{marginTop:3}}>{t("skyjoTarget")} {state.target}</PkRibbon>:<div className="f7-sub">{t("skyjoTarget")} {state.target}</div>}</div></div><div className="f7-seg" role="tablist"><button role="tab" aria-selected={false} onClick={()=>setView("round")}>{t("skyjoRoundLabel")(nRounds+1)}</button><button role="tab" aria-selected={true}>{t("skyjoViewTable")}</button></div><div style={{gridArea:"tbl"}}>{table}</div></div>}</div>{lap&&<div className="gtL-col-side"><GtlStandings players={state.players} target={state.target} lowWins={false} rounds={nRounds} accent={k.acc} tk={k} font={FLIP7_FONT} theme={theme} t={t}/>{nRounds>0&&table}<GtRoundChart series={state.players.map((p,i)=>({id:p.id,name:p.name,color:playerHue(i,theme),vals:history.map(r=>(r.scores&&r.scores[p.id])||0)}))} ink={k.ink} muted={k.muted} card={k.card} border={k.line} title={t("gtChartTitle")} theme={theme}/></div>}</div>}</div>{editPlayer&&<div className={pk?"f7-pk":undefined} style={f7Vars(k,pk)}><Flip7EditSheet key={edit.i+"-"+edit.pid} player={editPlayer} round={edit.i+1} init={history[edit.i]&&history[edit.i].data&&history[edit.i].data[edit.pid]} theme={theme} t={t} onClose={()=>setEdit(null)} onSave={e=>editCell(edit.i,edit.pid,e)}/></div>}<RulesSheet open={rulesOpen} onClose={()=>setRulesOpen(false)} title={t("gameFlip7")} text={t("rulesFlip7")} tokens={k}/></div>;}
const DEFAULT_FLIP7={phase:"setup",players:[{id:1,name:"Spieler 1",total:0},{id:2,name:"Spieler 2",total:0}],target:200,history:[]};/*@gt-body-end*/
export { FLIP7_FONT, FLIP7_MODS, flip7RoundScore, f7Entry, Flip7TopBar, flip7BtnPrimary, flip7BtnGhost, Flip7Setup, Flip7GameOver, Flip7Game, DEFAULT_FLIP7 };
