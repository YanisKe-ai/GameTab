// Wizard im Stil "Astrolabium" (Rundenrad, Rangliste als Zeilen, Eingabe reihum). Regeln: Ken Fisher / Amigo, 60 Karten, 3 bis 6 Spielende.
import { React } from "../../vendor/react-globals.js";
import { Fragment, useEffect, useRef, useState } from "../../prelude.js";
import { GLOBAL_STYLES } from "../../styles/global.js";
import { RulesButton, RulesSheet } from "../../app/App.js";
import { useT } from "../../i18n/use-t.js";
import { wizardTokens } from "../../themes/tokens.js";
import { hapticWin, playWinSound } from "../../shared/sound.js";
import { rankedPodium } from "../../shared/ranking.js";
import { useGtRecord } from "../../stats/match-log.js";
import { gtWinLine } from "../../shared/game-helpers.js";
import { PodiumOverlay, useCelebration, useMilestoneBurst } from "../../shared/podium.js";
import { GameIcon, XMark } from "../../assets/icons.js";
import { WizardLogo } from "../../assets/logos.js";
import { GameHeader } from "../../shared/game-header.js";
import { GtRoundChart } from "../../shared/standings.js";
import { GroupPicker, GtPlayerList, GtStartBar, gtSkin, gtSkinTk, gtSoftTk } from "../../shared/setup-ui.js";
import { GtCol } from "../../shared/unit.js";
import { GtUbStyle } from "../../shared/unit-boards.js";
/*@gt-body-begin*/const WZ_CSS=`
.wz-root{--wz-gold:#D9B46A;--wz-hi:#F3DFA9;--wz-tx:#ECE6D6;--wz-mu:#B8B0C8;--wz-line:rgba(217,180,106,.34);--wz-soft:rgba(236,230,214,.14);--wz-card:rgba(255,255,255,.05);--wz-rowa:rgba(217,180,106,.13);--wz-on:#1A1230;--wz-bg:#0E1030;--wz-seg:#D9B46A;--wz-open:rgba(217,180,106,.2);font-family:'Inter',sans-serif;color:var(--wz-tx)}
.wz-root .wz-inner.reveal-1{transform:none}
.wz-wheelrow{--wz-sw:clamp(62px,22vw,76px);display:flex;align-items:flex-start;justify-content:center;gap:6px;margin:2px 0 0}
.wz-side{width:var(--wz-sw);flex:none;padding-top:10px;display:flex;flex-direction:column;gap:2px;min-width:0}
.wz-side.r{align-items:flex-end;text-align:right}
.wz-side b{font:700 30px/1 'Fraunces',Georgia,serif;color:var(--wz-gold)}
.wz-side .n{font:700 14px/1.2 'Fraunces',Georgia,serif;color:var(--wz-gold);max-width:100%;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.wz-side span{font-size:12px;color:var(--wz-mu);letter-spacing:.04em}
.wz-wheel{position:relative;width:clamp(120px,calc(100vw - 2*var(--wz-sw) - 36px),196px);aspect-ratio:1;flex:none}
.wz-wheel svg{display:block;width:100%;height:100%}
.wz-seg{transition:fill .26s cubic-bezier(.23,1,.32,1)}
.wz-seg.cur{filter:drop-shadow(0 0 5px var(--wz-hi))}
.wz-seg.pop{animation:wzPop .3s cubic-bezier(.23,1,.32,1)}
@keyframes wzPop{from{opacity:.25}to{opacity:1}}
.wz-mid{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;pointer-events:none;text-align:center}
.wz-mid b{font:700 clamp(40px,12vw,60px)/1 'Fraunces',Georgia,serif;color:var(--wz-tx);font-variant-numeric:tabular-nums}
.wz-mid span{font-size:12px;color:var(--wz-mu);margin-top:4px}
.wz-infoline{display:none;align-items:center;justify-content:center;gap:5px;min-width:0;margin:2px 0 0;font-size:12.5px;color:var(--wz-mu);white-space:nowrap}
.wz-infoline .n{font-weight:700;color:var(--wz-gold);min-width:0;max-width:44%;overflow:hidden;text-overflow:ellipsis}
.wz-infoline .k{font-weight:700;color:var(--wz-gold)}
.wz-sum{min-height:30px;display:flex;align-items:center;justify-content:center;gap:7px;font-size:13px;color:var(--wz-mu);margin:2px 0 4px;text-align:center}
.wz-sum svg{flex:none}
.wz-rank{display:flex;flex-direction:column;gap:3px}
.wz-cap{display:grid;grid-template-columns:28px minmax(0,1fr) 40px 40px 58px;gap:6px;padding:0 10px;font-size:11px;letter-spacing:.02em;color:var(--wz-mu)}
.wz-cap span{text-align:center;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.wz-row{display:grid;grid-template-columns:28px minmax(0,1fr) 40px 40px 58px;gap:6px;align-items:center;min-height:42px;padding:0 10px;border-radius:14px;border:1px solid transparent;box-sizing:border-box;transition:background-color .2s ease,border-color .2s ease}
.wz-row.act{background:var(--wz-rowa);border-color:var(--wz-line)}
.wz-pl{font:600 15px/1 'Fraunces',Georgia,serif;color:var(--wz-gold);text-align:center}
.wz-nm{display:flex;align-items:center;gap:6px;min-width:0;font-size:15px;font-weight:600}
.wz-nm>span:first-child{min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.wz-deal{flex:none;font-size:10px;font-weight:700;letter-spacing:.06em;text-transform:uppercase;color:var(--wz-gold);border:1px solid var(--wz-line);border-radius:999px;padding:2px 6px}
.wz-c{width:32px;height:32px;justify-self:center;border-radius:50%;box-sizing:border-box;display:grid;place-items:center;font:700 15px/1 'Inter',sans-serif;border:1.5px solid var(--wz-soft);color:var(--wz-mu);font-variant-numeric:tabular-nums;transition:background-color .2s ease,border-color .2s ease,color .2s ease}
.wz-c.on{border:2px solid var(--wz-gold);box-shadow:0 0 0 3px var(--wz-open);color:var(--wz-gold)}
.wz-c.fill{background:var(--wz-gold);border-color:var(--wz-gold);color:var(--wz-on)}
.wz-c.ring{border-color:var(--wz-gold);color:var(--wz-tx)}
.wz-c.hid{visibility:hidden}
.wz-tot{text-align:right;font:700 24px/1 'Fraunces',Georgia,serif;font-variant-numeric:tabular-nums}
.wz-tot.lead{color:var(--wz-gold)}
.wz-dockbox{position:static;margin-top:auto;background:var(--wz-bg);border-radius:20px 20px 0 0;border-top:1px solid var(--wz-line);padding:10px 10px calc(10px + env(safe-area-inset-bottom,0px))}
.gtL-content .wz-tbl{display:none}
.wz-prompt{display:flex;align-items:center;justify-content:space-between;gap:8px;min-height:44px}
.wz-prompt b{font:600 17px/1.2 'Fraunces',Georgia,serif;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.wz-undo{flex:none;display:inline-flex;align-items:center;gap:6px;min-height:44px;padding:0 12px;border-radius:999px;border:1.5px solid var(--wz-soft);background:transparent;color:var(--wz-tx);font:600 13px 'Inter',sans-serif;cursor:pointer}
.wz-undo:disabled{opacity:.35;cursor:default}
.wz-hint{font-size:12.5px;color:var(--wz-mu);margin:0 0 8px;min-height:18px;line-height:1.35}
.wz-hint.warn{color:var(--wz-gold);font-weight:600}
.wz-pad{display:grid;grid-template-columns:repeat(auto-fit,44px);gap:7px;justify-content:center}
.wz-n{width:44px;height:44px;border-radius:50%;border:2px solid var(--wz-gold);background:transparent;color:var(--wz-tx);font:700 18px/1 'Inter',sans-serif;cursor:pointer;display:grid;place-items:center;font-variant-numeric:tabular-nums;touch-action:manipulation;transition:transform .12s ease,background-color .16s ease}
.wz-n:active{transform:scale(.92);background:var(--wz-open)}
.wz-n:disabled{opacity:.28;cursor:default;border-color:var(--wz-soft)}
.wz-n.sel{background:var(--wz-gold);color:var(--wz-on)}
.wz-link{display:inline-flex;align-items:center;justify-content:center;gap:8px;min-height:40px;width:100%;margin-top:2px;border:none;background:transparent;color:var(--wz-gold);font:600 14px 'Inter',sans-serif;cursor:pointer;text-decoration:underline;text-underline-offset:3px}
.wz-cta{width:100%;min-height:52px;border:none;border-radius:16px;background:var(--wz-gold);color:var(--wz-on);font:700 16px 'Inter',sans-serif;cursor:pointer}
.wz-win{border:1px solid var(--wz-line);color:var(--wz-gold);border-radius:14px;padding:12px 14px;margin:0 0 10px;font:600 15px/1.3 'Fraunces',Georgia,serif;text-align:center;background:var(--wz-rowa)}
.wz-sheet{position:fixed;inset:0;z-index:80;background:var(--wz-bg);overflow:auto;overscroll-behavior:contain;-webkit-overflow-scrolling:touch;padding:calc(env(safe-area-inset-top,0px) + 8px) 12px 40px;box-sizing:border-box;display:none;color:var(--wz-tx);font-family:'Inter',sans-serif}
.wz-sheet.open{display:block;animation:wzIn .22s cubic-bezier(.23,1,.32,1)}
.wz-sheet.edit{padding-bottom:380px}
@keyframes wzIn{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:none}}
.wz-sheet-h{display:flex;align-items:center;justify-content:space-between;min-height:48px}
.wz-sheet-h b{font:700 20px 'Fraunces',Georgia,serif;color:var(--wz-gold)}
.wz-x{width:44px;height:44px;border-radius:50%;border:none;background:var(--wz-card);color:var(--wz-tx);display:grid;place-items:center;cursor:pointer}
.wz-scroll{overflow-x:auto;border:1px solid var(--wz-line);border-radius:14px;background:var(--wz-card)}
.wz-grid{display:grid;min-width:100%}
.wz-th{position:sticky;top:0;z-index:2;background:var(--wz-bg);border-bottom:1px solid var(--wz-line);padding:9px 3px;text-align:center;font-size:12px;font-weight:700;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;box-sizing:border-box}
.wz-th.corner{left:0;z-index:3;border-right:1px solid var(--wz-line)}
.wz-rd{position:sticky;left:0;z-index:1;background:var(--wz-bg);border-bottom:1px solid var(--wz-soft);border-right:1px solid var(--wz-line);display:grid;place-items:center;font:700 15px 'Fraunces',Georgia,serif;color:var(--wz-gold);min-height:48px}
.wz-cell{cursor:pointer;-webkit-tap-highlight-color:transparent;-webkit-user-select:none;user-select:none;box-sizing:border-box;text-align:center;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:2px;min-height:48px;padding:3px 1px;border:none;border-bottom:1px solid var(--wz-soft);border-left:1px solid var(--wz-soft);background:transparent;color:var(--wz-tx);cursor:pointer;touch-action:manipulation;transition:background-color .16s ease,transform .12s ease;font-family:'Inter',sans-serif}
.wz-cell:active{transform:scale(.95)}
.wz-cell small{font-size:11px;line-height:1;color:var(--wz-mu);font-variant-numeric:tabular-nums}
.wz-cell b{font:700 18px/1 'Fraunces',Georgia,serif;font-variant-numeric:tabular-nums}
.wz-cell.cur{background:var(--wz-rowa)}
.wz-rd.cur{background:color-mix(in oklab,var(--wz-gold) 22%,var(--wz-bg))}
.wz-tab:focus-visible,.wz-cell:focus-visible{outline:2px solid var(--wz-gold);outline-offset:-2px}
.wz-cell.sel{background:var(--wz-open);box-shadow:inset 0 0 0 2px var(--wz-gold)}
.wz-editor{position:fixed;left:0;right:0;bottom:0;z-index:90;background:var(--wz-bg);border-top:2px solid var(--wz-gold);box-shadow:0 -10px 28px rgba(0,0,0,.4);padding:12px 14px calc(12px + env(safe-area-inset-bottom,0px));max-height:70vh;overflow-y:auto;box-sizing:border-box;color:var(--wz-tx);font-family:'Inter',sans-serif;animation:wzIn .2s cubic-bezier(.23,1,.32,1)}
.wz-ed-h{display:flex;justify-content:space-between;align-items:center;gap:8px;margin-bottom:8px}
.wz-ed-h b{font:600 16px 'Fraunces',Georgia,serif;color:var(--wz-gold);min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.wz-tabs{display:flex;gap:8px;margin-bottom:10px}
.wz-tab{cursor:pointer;-webkit-tap-highlight-color:transparent;-webkit-user-select:none;user-select:none;box-sizing:border-box;text-align:center;-webkit-appearance:none;flex:1;min-height:52px;border-radius:14px;border:1.5px solid var(--wz-soft);background:transparent;color:var(--wz-mu);font:600 11px 'Inter',sans-serif;cursor:pointer;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:3px;text-transform:uppercase;letter-spacing:.06em}
.wz-tab b{font:700 20px/1 'Fraunces',Georgia,serif;color:var(--wz-tx);text-transform:none;letter-spacing:0}
.wz-tab.on{border-color:var(--wz-gold);background:var(--wz-open);color:var(--wz-gold)}
.wz-start{display:flex;flex-wrap:wrap;gap:8px;margin:2px 0 4px}
.wz-chip{min-height:44px;max-width:100%;padding:0 14px;border-radius:999px;border:1.5px solid var(--wz-soft);background:transparent;color:var(--wz-tx);font:600 14px 'Inter',sans-serif;cursor:pointer;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.wz-chip.on{border-color:var(--wz-gold);background:var(--wz-gold);color:var(--wz-on)}
.wz-lbl{font-size:12px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:var(--wz-mu);margin:8px 2px 4px}
.wz-info{font-size:13px;color:var(--wz-mu);text-align:center;margin:2px 0}
.wz-main,.wz-aside{display:contents}
.gtL-content .wz-split.gtL-e-fit{grid-template-columns:minmax(340px,440px) minmax(380px,1fr)!important;gap:28px!important;justify-content:stretch!important;align-items:start}
.gtL-content .wz-main,.gtL-content .wz-aside{display:block}
.gtL-content .wz-sheet{position:static;display:block;padding:0;overflow:visible;background:transparent;animation:none}
.gtL-content .wz-sheet-h,.gtL-content .wz-open-sheet{display:none}
.gtL-content .wz-sheet.edit{padding-bottom:0}
.gtL-content .wz-editor{position:sticky;bottom:12px;left:auto;right:auto;margin:10px 0 0;border:1px solid var(--wz-gold);border-radius:18px;max-height:none;box-shadow:0 10px 28px rgba(0,0,0,.3);background:var(--wz-bg)}
.gtL-content .wz-dockbox{position:static;margin:10px 0 0;border:1px solid var(--wz-line);border-radius:18px;box-shadow:none;background:var(--wz-card)}
.gtL-content .wz-split.gtL-e-fit{grid-template-columns:minmax(400px,540px) minmax(0,1fr)!important;gap:32px!important;align-items:stretch}
.gtL-content .wz-aside{position:relative;min-height:0;min-width:0}
.gtL-content .wz-aside .wz-sheet{position:absolute;inset:0;overflow:auto;overscroll-behavior:contain;border-radius:18px;scrollbar-width:thin}
.gtL-content .wz-aside .wz-scroll{overflow:clip;border-radius:18px}
.gtL-content .wz-wheelrow{--wz-sw:104px;margin-top:6px;gap:10px}
.gtL-content .wz-wheel{width:196px}
.gtL-content .wz-mid b{font-size:62px}
.gtL-content .wz-side b{font-size:38px}
.gtL-content .wz-side span{font-size:14px}
.gtL-content .wz-sum{font-size:15px;min-height:30px;margin:2px 0 6px}
.gtL-content .wz-cap{grid-template-columns:34px minmax(0,1fr) 48px 48px 76px;gap:8px;padding:0 16px;font-size:13px}
.gtL-content .wz-row{grid-template-columns:34px minmax(0,1fr) 48px 48px 76px;gap:8px;min-height:50px;padding:0 16px;border-radius:16px}
.gtL-content .wz-rank{gap:4px}
.gtL-content .wz-pl{font-size:20px}
.gtL-content .wz-nm{font-size:20px}
.gtL-content .wz-deal{font-size:11px;padding:3px 8px}
.gtL-content .wz-c{width:38px;height:38px;font-size:19px}
.gtL-content .wz-tot{font-size:30px}
.gtL-content .wz-dockbox{padding:10px 14px 12px}
.gtL-content .wz-prompt b{font-size:21px}
.gtL-content .wz-hint{font-size:14px}
.gtL-content .wz-pad{grid-template-columns:repeat(auto-fit,50px);gap:8px}
.gtL-content .wz-n{width:50px;height:50px;font-size:21px}
.gtL-content .wz-cta{min-height:54px;font-size:17px}
.gtL-content .wz-th{font-size:16px;padding:16px 4px}
.gtL-content .wz-rd{font-size:20px;min-height:52px}
.gtL-content .wz-cell{min-height:52px}
.gtL-content .wz-cell small{font-size:13px}
.gtL-content .wz-cell b{font-size:22px}
@media (max-height:860px){:root:not(.gt-laptopmode) .wz-wheel{width:min(172px,calc(100vw - 2*var(--wz-sw) - 36px))}:root:not(.gt-laptopmode) .wz-mid b{font-size:44px}:root:not(.gt-laptopmode) .wz-side b{font-size:26px}:root:not(.gt-laptopmode) .wz-sum{min-height:24px;margin:0 0 2px}:root:not(.gt-laptopmode) .wz-row{min-height:40px}}
@media (max-height:700px){:root:not(.gt-laptopmode) .wz-root .gt-u-col{min-height:0}:root:not(.gt-laptopmode) .wz-side{display:none}:root:not(.gt-laptopmode) .wz-infoline{display:flex}:root:not(.gt-laptopmode) .wz-wheel{width:min(112px,calc(100vw - 60px))}:root:not(.gt-laptopmode) .wz-mid b{font-size:34px}:root:not(.gt-laptopmode) .wz-mid span{display:none}:root:not(.gt-laptopmode) .wz-sum{min-height:20px;font-size:12px;margin:0}:root:not(.gt-laptopmode) .wz-row{min-height:36px;border-radius:12px}:root:not(.gt-laptopmode) .wz-c{width:30px;height:30px;font-size:14px}:root:not(.gt-laptopmode) .wz-tot{font-size:21px}:root:not(.gt-laptopmode) .wz-hint{margin-bottom:4px}:root:not(.gt-laptopmode) .wz-dockbox{padding-top:4px;padding-bottom:4px}}
@media (max-height:600px){:root:not(.gt-laptopmode):not([data-phone-landscape]) .wz-wheel{width:84px}:root:not(.gt-laptopmode):not([data-phone-landscape]) .wz-mid b{font-size:28px}:root:not(.gt-laptopmode):not([data-phone-landscape]) .wz-mid span{display:none}:root:not(.gt-laptopmode):not([data-phone-landscape]) .wz-row{min-height:34px}:root:not(.gt-laptopmode):not([data-phone-landscape]) .wz-cap{display:none}:root:not(.gt-laptopmode):not([data-phone-landscape]) .wz-sum{display:none}:root:not(.gt-laptopmode):not([data-phone-landscape]) .wz-hint:not(.warn){display:none}}
@media (max-width:359px){.wz-deal{font-size:0;padding:0;width:9px;height:9px;min-width:9px;border:none;border-radius:50%;background:var(--wz-gold)}.wz-undo.t span{display:none}.wz-undo.t{padding:0;width:44px;justify-content:center}}
@media (prefers-reduced-motion:reduce){.wz-seg,.wz-row,.wz-c,.wz-n,.wz-cell{transition:none}.wz-seg.pop,.wz-sheet.open,.wz-editor{animation:none}.wz-n:active,.wz-cell:active{transform:none}}
[data-phone-landscape] .wz-land{padding-top:calc(var(--pl-sat) + 6px)!important;padding-bottom:calc(var(--pl-sab) + 8px)!important;--wz-edw:clamp(296px,46vw,400px)}
[data-phone-landscape] .wz-inner{max-width:none!important;margin:0!important;width:100%!important}
[data-phone-landscape] .wz-main{display:grid;grid-template-columns:clamp(190px,34vw,260px) minmax(0,1fr);grid-template-areas:"wheel rank" "wheel dock";gap:4px 14px;align-items:start;margin-top:6px}
[data-phone-landscape] .wz-wheelbox{grid-area:wheel}
[data-phone-landscape] .wz-rank{grid-area:rank}
[data-phone-landscape] .wz-dockbox{grid-area:dock;position:static;margin:0;border:1px solid var(--wz-line);border-radius:16px;box-shadow:none;background:var(--wz-card)}
[data-phone-landscape] .wz-wheel{width:clamp(110px,22vw,150px)}
[data-phone-landscape] .wz-wheelrow{--wz-sw:52px}
[data-phone-landscape] .wz-row{min-height:40px}
[data-phone-landscape] .wz-sheet{padding-left:calc(14px + var(--pl-sal));padding-right:calc(14px + var(--pl-sar))}
[data-phone-landscape] .wz-sheet.edit{padding-bottom:20px;padding-right:calc(var(--wz-edw) + 20px + var(--pl-sar))}
[data-phone-landscape] .wz-editor{left:auto;right:0;top:0;bottom:0;width:calc(var(--wz-edw) + var(--pl-sar));max-height:none;border-top:none;border-left:2px solid var(--wz-gold);padding-right:calc(14px + var(--pl-sar))}
`;function wizardRoundCount(playerCount){return Math.floor(60/playerCount);}function wizardRoundScore(bid,tricks){if(bid===null||tricks===null)return null;if(bid===tricks)return 20+10*tricks;return-10*Math.abs(bid-tricks);}function wizardTotals(players,rounds,uptoRound){const totals={};players.forEach(p=>totals[p.id]=0);for(let r=1;r<=uptoRound;r++){const roundData=rounds[r];if(!roundData)continue;players.forEach(p=>{const cell=roundData[p.id];if(cell){const score=wizardRoundScore(cell.bid,cell.tricks);if(score!==null)totals[p.id]+=score;}});}return totals;}
const WIZARD_HUES=["#3B6EA5","#3F8F5F","#B3242E","#C99A2E"];
const WIZARD_HUES_LIGHT=["#456C97","#397551","#A82F37","#816628"];
const WIZARD_PARCHMENT_CSS=".wizard-parchment{position:relative;}.wizard-parchment::before{content:'';position:absolute;inset:0;pointer-events:none;z-index:0;background-image:radial-gradient(circle at 18% 24%, rgba(120,90,50,0.07) 0%, transparent 42%),radial-gradient(circle at 82% 18%, rgba(120,90,50,0.06) 0%, transparent 38%),radial-gradient(circle at 75% 82%, rgba(120,90,50,0.07) 0%, transparent 42%),radial-gradient(circle at 15% 85%, rgba(120,90,50,0.05) 0%, transparent 36%);}";
const WIZARD_INK_DARK="#151016";
const WIZARD_CARD_DARK="#231A1E";
const WIZARD_BORDER_DARK="#4A3540";
const WIZARD_GOLD_DARK="#D4AF5A";
const WIZARD_PARCH_DARK="#EFE6D2";
const WZ_ROMAN=["I","II","III","IV","V","VI","VII","VIII"];
function wzTk(theme){if(theme==="light")return{bg:"linear-gradient(180deg,#F6F7FD 0%,#E9ECF7 100%)",bgSolid:"#EEF0F9",gold:"#7A5A12",hi:"#D9A72E",seg:"#B8862B",open:"rgba(122,90,18,0.16)",tx:"#1E1B4B",mu:"#4A4768",line:"rgba(122,90,18,0.5)",soft:"rgba(30,27,75,0.2)",card:"rgba(255,255,255,0.85)",rowa:"rgba(122,90,18,0.12)",on:"#FFFFFF",cardSolid:"#FFFFFF",borderSolid:"#B9B5D0"};if(theme==="noir")return{bg:"#0A0A0A",bgSolid:"#0A0A0A",gold:"#C4C4C4",hi:"#F2F2F2",seg:"#9A9A9A",open:"rgba(255,255,255,0.14)",tx:"#EDEDED",mu:"#A5A5A5",line:"rgba(255,255,255,0.3)",soft:"rgba(255,255,255,0.16)",card:"rgba(255,255,255,0.05)",rowa:"rgba(255,255,255,0.1)",on:"#111111",cardSolid:"#1E1E1E",borderSolid:"#454545"};return{bg:"radial-gradient(ellipse at 50% -8%, #1B1E52 0%, #0E1030 55%, #070818 100%)",bgSolid:"#0E1030",gold:"#D9B46A",hi:"#F3DFA9",seg:"#D9B46A",open:"rgba(217,180,106,0.2)",tx:"#ECE6D6",mu:"#B8B0C8",line:"rgba(217,180,106,0.34)",soft:"rgba(236,230,214,0.14)",card:"rgba(255,255,255,0.05)",rowa:"rgba(217,180,106,0.13)",on:"#1A1230",cardSolid:"#171A45",borderSolid:"#3A3B6B"};}
function wzVars(tk){return{"--wz-gold":tk.gold,"--wz-hi":tk.hi,"--wz-tx":tk.tx,"--wz-mu":tk.mu,"--wz-line":tk.line,"--wz-soft":tk.soft,"--wz-card":tk.card,"--wz-rowa":tk.rowa,"--wz-on":tk.on,"--wz-bg":tk.bgSolid,"--wz-seg":tk.seg,"--wz-open":tk.open};}
function wzShell(theme){const tk=wzTk(theme);return{minHeight:"100vh",boxSizing:"border-box",background:tk.bg,padding:"20px 12px 32px",...wzVars(tk)};}
function wzCompat(theme){const tk=wzTk(theme);return{...wizardTokens(theme),gold:tk.gold,parch:tk.tx,ink:tk.tx,muted:tk.mu,mutedLight:tk.mu,card:tk.cardSolid,border:tk.borderSolid,groupLine:tk.borderSolid,onAccent:tk.on};}
function wzCell(rounds,r,pid){return(rounds[r]&&rounds[r][pid])||{bid:null,tricks:null};}
function wzStartIdx(players,startId){const i=players.findIndex(p=>p.id===startId);return i<0?0:i;}
function wzRound(players,rounds,sIdx,r){const n=players.length;const f=(sIdx+r-1)%n;const order=players.map((_,k)=>players[(f+k)%n]);const cells=order.map(p=>wzCell(rounds,r,p.id));const bidsIn=cells.filter(c=>c.bid!==null).length;const phase=bidsIn<n?"bid":(cells.some(c=>c.tricks===null)?"tricks":"done");const key=phase==="bid"?"bid":"tricks";const ni=cells.findIndex(c=>c[key]===null);return{order,phase,next:ni<0?null:order[ni],bidSum:cells.reduce((s,c)=>s+(c.bid||0),0),trickSum:cells.reduce((s,c)=>s+(c.tricks||0),0),trickLeft:cells.filter(c=>c.tricks===null).length,cards:r,dealer:players[(f-1+n)%n]};}
function wzSet(s,r,pid,kind,val){const rounds=s.rounds||{};const cur=wzCell(rounds,r,pid);if(cur[kind]===val)return s;return{...s,rounds:{...rounds,[r]:{...(rounds[r]||{}),[pid]:{...cur,[kind]:val}}},hist:[...(s.hist||[]),{r,p:pid,k:kind,v:cur[kind]}].slice(-300)};}
function wzPad(players,t){const out=[...players];while(out.length<3){const id=out.length?Math.max(...out.map(p=>p.id))+1:1;out.push({id,name:t("defaultPlayerName")(out.length+1)});}return out;}
function wzArc(cx,cy,r0,r1,a0,a1){const f=v=>v.toFixed(2);const P=(r,a)=>f(cx+r*Math.cos(a))+" "+f(cy+r*Math.sin(a));const lg=a1-a0>Math.PI?1:0;return"M"+P(r1,a0)+"A"+r1+" "+r1+" 0 "+lg+" 1 "+P(r1,a1)+"L"+P(r0,a1)+"A"+r0+" "+r0+" 0 "+lg+" 0 "+P(r0,a0)+"Z";}
function WzWheel({count,isDone,cur,pop,label,sub}){const segs=[];const span=Math.PI*2/count;const gap=count>14?0.03:0.045;for(let i=0;i<count;i++){const r=i+1;const a0=-Math.PI/2+i*span+gap/2;const a1=-Math.PI/2+(i+1)*span-gap/2;const cls="wz-seg"+(r===cur?" cur":"")+(r===pop?" pop":"");segs.push(<path key={r} className={cls} d={wzArc(110,110,82,98,a0,a1)} style={{fill:isDone(r)?"var(--wz-seg)":(r===cur?"var(--wz-hi)":"var(--wz-open)")}}/>);}
const ticks=[];for(let k=0;k<60;k++){const a=k/60*Math.PI*2;const big=k%5===0;const r0=103,r1=big?109:106;ticks.push(<line key={k} x1={110+r0*Math.cos(a)} y1={110+r0*Math.sin(a)} x2={110+r1*Math.cos(a)} y2={110+r1*Math.sin(a)} stroke="var(--wz-gold)" strokeOpacity={big?0.7:0.35} strokeWidth={big?1.2:0.8}/>);}
return <div className="wz-wheel"><svg viewBox="0 0 220 220" aria-hidden="true"><circle cx="110" cy="110" r="76" fill="none" stroke="var(--wz-gold)" strokeOpacity="0.35" strokeWidth="0.8"/><circle cx="110" cy="110" r="72" fill="none" stroke="var(--wz-gold)" strokeOpacity="0.18" strokeWidth="0.6" strokeDasharray="1 4"/>{ticks}{segs}</svg><div className="wz-mid"><b className="wz-serif">{label}</b><span>{sub}</span></div></div>;}
function WizardTopBar({subtitle,onBack,theme,t,onHome,rulesText,onEndGame}){const wt=wzCompat(theme);return <GameHeader title={t("gameWizard")} titleFont="'Fraunces', Georgia, serif" subtitle={subtitle} onBack={onBack} backLabel={t("back")} tk={{...wt,ink:wt.mutedLight}} accent={wt.gold} icon={<WizardLogo theme={theme}/>} onHome={onHome} onEndGame={onEndGame} rulesText={rulesText}/>;}
function WizardSetup({players,setPlayers,startId,setStartId,onStart,theme,t}){const wt=gtSoftTk(wzCompat(theme),theme);
const gtS=gtSkin(theme,wt,"wizard",{ink:wt.parch,acc:wt.gold});
const rename=(idx,name)=>setPlayers(ps=>ps.map((p,i)=>i===idx?{...p,name}:p));
const addPlayer=()=>setPlayers(ps=>{const nextId=ps.length?Math.max(...ps.map(p=>p.id))+1:1;return[...ps,{id:nextId,name:t("defaultPlayerName")(ps.length+1)}];});
const removePlayer=idx=>setPlayers(ps=>ps.filter((_,i)=>i!==idx));
const move=(idx,dir)=>setPlayers(ps=>{const next=[...ps];
const target=idx+dir;if(target<0||target>=next.length)return ps;[next[idx],next[target]]=[next[target],next[idx]];return next;});
const tooFew=players.length<3;const sIdx=wzStartIdx(players,startId);return <div className="gt-ub-fill"><div className="gtL-split gtL-split-setup"><div className="gtL-col-main" style={{gap:8}}><GroupPicker getNames={()=>players.map(p=>p.name)} setNames={names=>setPlayers(names.map((name,i)=>({id:i+1,name})))} t={t} tk={gtSkinTk(wt,gtS)} onStarter={nm=>{const q=players.find(x=>String(x.name||"").trim()===nm);if(q)setStartId(q.id);}}/><GtPlayerList players={players} onRename={rename} onRemove={removePlayer} onAdd={addPlayer} skin={gtS} t={t} onMove={move} minPlayers={3} maxPlayers={6} hues={wt.hues}/></div><div className="gtL-col-side" style={{gap:8}}><div className="wz-lbl">{t("wzFirstBidder")}</div><div className="wz-start" role="radiogroup" aria-label={t("wzFirstBidder")}>{players.map((p,i)=><button key={p.id} type="button" role="radio" aria-checked={i===sIdx} className={"wz-chip"+(i===sIdx?" on":"")} onClick={()=>setStartId(p.id)}>{p.name}</button>)}</div><div className="wz-info">{t("wzSetupInfo")(players.length,wizardRoundCount(Math.max(players.length,1)))}</div><GtStartBar onClick={onStart} disabled={tooFew} label={tooFew?t("wzNeedThree"):t("startGame")} skin={gtS}/></div></div></div>;}
function WizardEditorPanel({editing,players,rounds,onSave,onClose,theme,t}){const[bid,setBid]=useState(null);const[tricks,setTricks]=useState(null);const[tab,setTab]=useState("bid");const eR=editing?editing.round:0,eP=editing?editing.playerId:0;useEffect(()=>{if(eR){const c=wzCell(rounds,eR,eP);setBid(c.bid);setTricks(c.tricks);setTab(c.bid===null?"bid":"tricks");}},[eR,eP]);if(!editing)return null;
const player=players.find(p=>p.id===eP);const cards=eR;
const sumOf=(useNew)=>players.reduce((s,p)=>{const c=p.id===eP?{tricks:useNew?tricks:wzCell(rounds,eR,p.id).tricks}:wzCell(rounds,eR,p.id);return s+(c.tricks||0);},0);
const allIn=players.every(p=>(p.id===eP?tricks:wzCell(rounds,eR,p.id).tricks)!==null);
const sum=sumOf(true);const bad=sum>cards||(allIn&&sum!==cards);
const wasAll=players.every(p=>wzCell(rounds,eR,p.id).tricks!==null);const wasBad=wasAll&&sumOf(false)!==cards;
const blocked=bad&&!wasBad;const miss=bid===null||tricks===null;
const preview=wizardRoundScore(bid,tricks);
const setVal=v=>{if(tab==="bid"){setBid(v);if(tricks===null)setTab("tricks");}else setTricks(v);};const cur=tab==="bid"?bid:tricks;
return <div className="wz-editor" role="dialog" aria-label={t("roundLabel")(eR)+" · "+(player?player.name:"")}><div className="wz-ed-h"><b>{t("roundLabel")(eR)}{" · "}{player?player.name:""}</b><button type="button" className="wz-x" onClick={onClose} aria-label={t("mgClose")}><XMark/></button></div><div className="wz-tabs"><div role="button" tabIndex={0} className={"wz-tab"+(tab==="bid"?" on":"")} onClick={()=>setTab("bid")} onKeyDown={e=>{if(e.key==="Enter"||e.key===" "){e.preventDefault();setTab("bid");}}}>{t("bidLabel")}<b>{bid===null?"·":bid}</b></div><div role="button" tabIndex={0} className={"wz-tab"+(tab==="tricks"?" on":"")} onClick={()=>setTab("tricks")} onKeyDown={e=>{if(e.key==="Enter"||e.key===" "){e.preventDefault();setTab("tricks");}}}>{t("wzTricksShort")}<b>{tricks===null?"·":tricks}</b></div></div><div className="wz-pad" style={{marginBottom:10}}>{Array.from({length:cards+1},(_,v)=>v).map(v=><button key={v} type="button" className={"wz-n"+(cur===v?" sel":"")} onClick={()=>setVal(v)}>{v}</button>)}</div><div className={"wz-hint"+(bad?" warn":"")} role={bad?"alert":undefined}>{bad?t("wzSumBad")(sum,cards):(preview!==null?<span><strong style={{color:preview>=0?"var(--wz-gold)":"var(--wz-tx)"}}>{preview>=0?"+"+preview:preview}</strong>{" "}{t("pointsThisRound")}</span>:t("enterBidAndTricks"))}</div><button type="button" className="wz-cta" data-gt-sound="1" disabled={miss||blocked} onClick={()=>onSave(eP,eR,bid,tricks)} style={{opacity:miss||blocked?0.4:1,cursor:miss||blocked?"default":"pointer"}}>{t("save")}</button></div>;}
function wzIsLaptop(){try{return document.documentElement.classList.contains("gt-laptopmode");}catch(e){return false;}}
function WzSheet({open,onClose,players,rounds,curRound,roundCount,editing,setEditing,editPad,t,chart,editor}){const n=players.length;useEffect(()=>{if(!open)return undefined;const h=e=>{if(e.key==="Escape"){if(editing)setEditing(null);else onClose();}};window.addEventListener("keydown",h);return()=>window.removeEventListener("keydown",h);},[open,!!editing]);
const cols="36px repeat("+n+",minmax(54px,1fr))";
return <div className={"wz-sheet"+(open?" open":"")+(editPad?" edit":"")}><div className="wz-sheet-h"><b className="wz-serif">{t("wzSheetTitle")}</b><button type="button" className="wz-x" onClick={onClose} aria-label={t("mgClose")}><XMark/></button></div><div className="wz-scroll"><div className="wz-grid" style={{gridTemplateColumns:cols}}><div className="wz-th corner"/>{players.map(p=><div key={p.id} className="wz-th" title={p.name}>{p.name}</div>)}{Array.from({length:roundCount},(_,i)=>i+1).map(r=>{const run=wizardTotals(players,rounds,r);return <Fragment key={r}><div className={"wz-rd"+(r===curRound?" cur":"")}>{r}</div>{players.map(p=>{const c=wzCell(rounds,r,p.id);const sel=editing&&editing.round===r&&editing.playerId===p.id;return <div key={p.id} role="button" tabIndex={0} className={"wz-cell"+(r===curRound?" cur":"")+(sel?" sel":"")} onClick={()=>setEditing({round:r,playerId:p.id})} onKeyDown={e=>{if(e.key==="Enter"||e.key===" "){e.preventDefault();setEditing({round:r,playerId:p.id});}}} aria-label={p.name+", "+t("roundLabel")(r)+": "+(c.bid===null?"-":c.bid)+" / "+(c.tricks===null?"-":c.tricks)}>{(c.bid!==null||c.tricks!==null)&&<small>{c.bid===null?"·":c.bid}{"/"}{c.tricks===null?"·":c.tricks}</small>}<b style={c.tricks!==null&&c.bid!==null?undefined:{color:"var(--wz-mu)",opacity:0.45}}>{c.tricks!==null&&c.bid!==null?run[p.id]:"·"}</b></div>;})}</Fragment>;})}</div></div>{chart}{editor}</div>;}
function WizardPlay({state,setState,onBack,onHome,onEndGame,lang="de",theme="dark"}){const t=useT(lang);const tk=wzTk(theme);const wt=wizardTokens(theme);
const players=state.players,rounds=state.rounds||{},hist=state.hist||[],ended=!!state.ended;
const[editing,setEditing]=useState(null);const[sheet,setSheet]=useState(false);const lapRound=useRef("");useEffect(()=>{const el=document.querySelector(".gtL-content .wz-aside .wz-rd.cur");const key=el?el.textContent:"";if(key===lapRound.current)return;lapRound.current=key;const box=el&&el.closest(".wz-sheet");if(!box)return;box.scrollTo({top:Math.max(0,el.offsetTop-150),behavior:"auto"});});const[confirmingSetup,setConfirmingSetup]=useState(false);const[confirmingEnd,setConfirmingEnd]=useState(false);const[rulesOpen,setRulesOpen]=useState(false);const{node:perfectBidNode,fire:firePerfectBid}=useMilestoneBurst();
const n=players.length;const roundCount=wizardRoundCount(Math.max(n,1));const sIdx=wzStartIdx(players,state.startId);
const roundDone=r=>n>0&&players.every(p=>{const c=wzCell(rounds,r,p.id);return c.bid!==null&&c.tricks!==null;});
let curRound=0,doneCount=0,lastDone=0;for(let r=1;r<=roundCount;r++){if(roundDone(r)){doneCount++;lastDone=r;}else if(!curRound)curRound=r;}
const anyDone=doneCount>0;const finished=n>0&&(curRound===0||(ended&&anyDone));
const totals=wizardTotals(players,rounds,roundCount);const totalsArr=players.map(p=>totals[p.id]);const maxTotal=Math.max(...totalsArr,-Infinity);
const leaders=finished?players.filter((_,i)=>totalsArr[i]===maxTotal):[];
useGtRecord("wizard",finished,()=>{const perfect=players.filter(p=>{for(let r=1;r<=roundCount;r++){const c=rounds[r]&&rounds[r][p.id];if(!c||c.bid===null||c.bid!==c.tricks)return false;}return roundCount>0;}).map(p=>p.name);return{participants:players.map((p,i)=>({name:p.name,score:totalsArr[i]})),lowWins:false,extra:perfect.length?{perfect}:undefined};});
const winMargin=finished?(()=>{const sorted=[...totalsArr].sort((a,b)=>b-a);return(sorted[0]||0)-(sorted[1]||0);})():0;
const celebration=useCelebration(finished,finished?Math.max(0,1-winMargin/Math.max(1,Math.abs(maxTotal))):undefined);const[podiumOpen,setPodiumOpen]=useState(false);useEffect(()=>{if(finished)setPodiumOpen(true);},[finished]);
const podiumRanked=finished?rankedPodium(players,p=>totals[p.id]||0):[];
const prevDone=useRef(doneCount);const[pop,setPop]=useState(0);useEffect(()=>{if(doneCount>prevDone.current)setPop(lastDone);prevDone.current=doneCount;},[doneCount]);
const rs=!finished&&curRound?wzRound(players,rounds,sIdx,curRound):null;
const who=rs&&rs.next;const isBid=!!rs&&rs.phase==="bid";const cards=curRound||roundCount;
const remaining=rs?rs.cards-rs.trickSum:0;const lastTrick=!!rs&&rs.phase==="tricks"&&rs.trickLeft===1&&remaining>=0&&remaining<=rs.cards;
const allowed=v=>{if(!rs||isBid)return true;if(remaining<0)return true;if(lastTrick)return v===remaining;return v<=remaining;};
const pick=v=>{if(!rs||!who||!allowed(v))return;const k=isBid?"bid":"tricks";if(k==="tricks"){const c=wzCell(rounds,curRound,who.id);if(c.bid===v&&v>=4){playWinSound();hapticWin();firePerfectBid();}}setState(s=>wzSet(s,curRound,who.id,k,v));};
const undo=()=>{globalThis.__gtUndoAt=Date.now();undo0();};const undo0=()=>setState(s=>{const h=s.hist||[];if(!h.length)return{...s,ended:false};const e=h[h.length-1];const cur=wzCell(s.rounds||{},e.r,e.p);return{...s,ended:false,hist:h.slice(0,-1),rounds:{...s.rounds,[e.r]:{...((s.rounds||{})[e.r]||{}),[e.p]:{...cur,[e.k]:e.v}}}};});
const saveCell=(pid,round,bidNum,tricksNum)=>{if(bidNum!==null&&bidNum===tricksNum&&bidNum>=4){playWinSound();hapticWin();firePerfectBid();}setState(s=>wzSet(wzSet(s,round,pid,"bid",bidNum),round,pid,"tricks",tricksNum));setEditing(null);};
const resetDone=()=>setState(s=>({...s,rounds:{},hist:[],ended:false}));
const editPlayers=()=>{if(!confirmingSetup){setConfirmingSetup(true);setTimeout(()=>setConfirmingSetup(false),3000);return;}setState(s=>({...s,phase:"setup"}));setConfirmingSetup(false);};
const endTap=()=>{if(!confirmingEnd){setConfirmingEnd(true);setTimeout(()=>setConfirmingEnd(false),3000);return;}setState(s=>({...s,ended:true}));setConfirmingEnd(false);};
const wizItems=[anyDone&&!finished&&{key:"endscore",icon:"flag",label:t("wzEndScored"),onClick:endTap,confirming:confirmingEnd,confirmLabel:t("confirmAgain"),twoStep:true},{key:"clear",icon:"restart",label:t("wzClearSheet"),hold:resetDone},{key:"teams",icon:"users",label:t("changePlayers"),onClick:editPlayers,confirming:confirmingSetup,confirmLabel:t("confirmAgain"),twoStep:true}].filter(Boolean);
const doneTot={};players.forEach(p=>{doneTot[p.id]=0;});for(let r=1;r<=roundCount;r++){if(roundDone(r))players.forEach(p=>{const c=wzCell(rounds,r,p.id);doneTot[p.id]+=wizardRoundScore(c.bid,c.tricks);});}
const sorted=players.map((p,i)=>({p,i,total:totals[p.id],st:doneTot[p.id]})).sort((a,b)=>b.st-a.st);
const placeOf=st=>1+sorted.filter(q=>q.st>st).length;
const showR=curRound||roundCount;const lap=wzIsLaptop();const editorEl=<WizardEditorPanel editing={editing} players={players} rounds={rounds} onSave={saveCell} onClose={()=>setEditing(null)} theme={theme} t={t}/>;
const hits=lastDone?players.filter(p=>{const c=wzCell(rounds,lastDone,p.id);return c.bid===c.tricks;}).length:0;
const undoable=hist.length>0||ended;
const chartSeries=(()=>{const per=players.map(()=>[]);for(let r=1;r<=roundCount;r++){const sc=players.map(p=>{const c=wzCell(rounds,r,p.id);return wizardRoundScore(c.bid,c.tricks);});if(sc.some(v=>v===null))break;sc.forEach((v,k)=>per[k].push(v));}return players.map((p,i)=>({id:p.id,name:p.name,color:wt.hues[i%wt.hues.length],vals:per[i]}));})();
const chart=<div style={{marginTop:12}}><GtRoundChart series={chartSeries} ink={tk.tx} muted={tk.mu} card={tk.cardSolid} border={tk.borderSolid} title={t("gtChartTitle")} theme={theme}/></div>;
return <div className={"gtL-shellpage wz-root wz-land pl-page pl-head-compact"} style={{...wzShell(theme),paddingBottom:14}}><style>{GLOBAL_STYLES}{WZ_CSS}</style>{celebration}{perfectBidNode}<PodiumOverlay gameId="wizard" gameLabel={t("gameWizard")} open={podiumOpen} onClose={()=>setPodiumOpen(false)} onRestart={resetDone} ranked={podiumRanked} tk={wt} t={t} theme={theme} shareExtra={()=>({roundCount:roundCount,players:players.map(p=>{let h=0;for(let r=1;r<=roundCount;r++){const c=rounds[r]&&rounds[r][p.id];if(c&&c.bid!==null&&c.bid===c.tricks)h++;}return{name:p.name,total:totals[p.id]||0,hits:h};})})}/><GtCol accent={tk.gold} className="reveal-1 gtL-game wz-inner" style={{maxWidth:560,margin:"0 auto"}}><RulesButton onClick={()=>setRulesOpen(true)} onHome={onHome} onEndGame={onEndGame} moreItems={wizItems} onMenuOpen={()=>setEditing(null)} tokens={wt}/><WizardTopBar subtitle={t("wizardSubtitle")(roundCount)} onBack={onBack} theme={theme} t={t}/><div className="gtL-split gtL-e-fit wz-split"><div className="wz-main gtL-col-main"><div className="wz-wheelbox"><div className="wz-wheelrow"><div className="wz-side" style={{visibility:finished?"hidden":"visible"}}><b>{cards}</b><span>{t("wzCardsLbl")(cards)}</span></div><WzWheel count={roundCount} isDone={roundDone} cur={curRound} pop={pop} label={showR} sub={t("wzRoundOfN")(roundCount)}/><div className="wz-side r" style={{visibility:finished||!rs?"hidden":"visible"}}><span className="n">{rs?rs.dealer.name:""}</span><span>{t("wzDealsLbl")}</span></div></div><div className="wz-infoline" style={{visibility:finished||!rs?"hidden":"visible"}}><span><span className="k">{cards}</span>{" "}{t("wzCardsLbl")(cards)}{","}</span><span className="n">{rs?rs.dealer.name:""}</span><span>{t("wzDealsLbl")}</span></div><div className="wz-sum" aria-live="polite">{lastDone>0&&<Fragment><GameIcon name="moon" size={14} color={tk.gold}/><span>{t("wzRoundSummary")(lastDone,hits,n)}</span></Fragment>}</div></div><div className="wz-rank" role="list"><div className="wz-cap" aria-hidden="true"><span/><span/><span>{t("bidAbbr")}</span><span>{t("wzTricksShort")}</span><span/></div>{sorted.map(({p,total,st})=>{const c=wzCell(rounds,showR,p.id);const act=!!who&&who.id===p.id;const bidCls=finished?" hid":(c.bid!==null?" fill":(act&&isBid?" on":""));const trCls=finished||(isBid&&c.tricks===null)?" hid":(c.tricks!==null?(c.tricks===c.bid?" fill":" ring"):(act?" on":""));const lead=anyDone&&st===Math.max(...sorted.map(q=>q.st));return <div key={p.id} role="listitem" className={"wz-row"+(act?" act":"")}><span className="wz-pl">{WZ_ROMAN[placeOf(st)-1]||placeOf(st)}</span><div className="wz-nm" title={p.name}><span>{p.name}</span>{!finished&&rs&&rs.dealer.id===p.id&&<span className="wz-deal" role="img" aria-label={t("wzDealsLbl")} title={t("wzDealsLbl")}>{t("wzDealsLbl")}</span>}</div><span className={"wz-c"+bidCls} aria-label={t("bidLabel")+": "+(c.bid===null?"-":c.bid)}>{c.bid!==null?c.bid:""}</span><span className={"wz-c"+trCls} aria-label={t("tricksMadeLabel")+": "+(c.tricks===null?"-":c.tricks)}>{c.tricks!==null?c.tricks:""}</span><span className={"wz-tot"+(lead?" lead":"")}>{total}</span></div>;})}</div>{lap&&editing?editorEl:<div className="wz-dockbox">{finished?<Fragment><div className="wz-win">{gtWinLine(t,"wizardWinsWith","winsTie",leaders.map(q=>q.name),maxTotal)}</div><div style={{display:"flex",gap:8,alignItems:"center"}}><button type="button" className="wz-cta" data-gt-sound="1" onClick={()=>setPodiumOpen(true)}>{t("wzShowPodium")}</button><button type="button" className="wz-undo" onClick={undo} disabled={!undoable} aria-label={t("stuUndo")}>{t("stuUndo")}</button></div></Fragment>:<Fragment><div className="wz-prompt"><b>{who?(isBid?t("wzBidOf")(who.name):t("wzTricksOf")(who.name)):""}</b><div style={{display:"flex",gap:6,flex:"none"}}><button type="button" className="wz-undo wz-tbl" style={{padding:0,width:44,justifyContent:"center"}} onClick={()=>setSheet(true)} aria-label={t("wzSheetOpen")} title={t("wzSheetOpen")}><svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3.5" y="4.5" width="17" height="15" rx="2"/><path d="M3.5 10h17M9.5 10v9.5"/></svg></button><button type="button" className="wz-undo t" onClick={undo} disabled={!undoable} aria-label={t("stuUndo")}><svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 14 4 9l5-5"/><path d="M4 9h10.5a5.5 5.5 0 0 1 0 11H11"/></svg><span>{t("stuUndo")}</span></button></div></div><div className={"wz-hint"+(lastTrick?" warn":"")} aria-live="polite">{isBid?t("wzBidSoFar")(rs?rs.bidSum:0,cards):(lastTrick?t("wzLastTrick")(remaining,cards):t("wzTricksSoFar")(rs?rs.trickSum:0,cards))}</div><div className="wz-pad">{Array.from({length:cards+1},(_,v)=>v).map(v=><button key={v} type="button" className="wz-n" data-gt-sound="1" disabled={!allowed(v)} onClick={()=>pick(v)}>{v}</button>)}</div></Fragment>}{finished&&<button type="button" className="wz-link wz-open-sheet" onClick={()=>setSheet(true)}>{t("wzSheetOpen")}</button>}</div>}</div><div className="wz-aside gtL-col-side"><WzSheet open={sheet} onClose={()=>{setEditing(null);setSheet(false);}} players={players} rounds={rounds} curRound={curRound} roundCount={roundCount} editing={editing} editPad={!!editing&&!lap} setEditing={setEditing} t={t} chart={chart} editor={lap?null:editorEl}/></div></div></GtCol><RulesSheet open={rulesOpen} onClose={()=>setRulesOpen(false)} title={t("gameWizard")} text={t("rulesWizard")} tokens={wt}/></div>;}
function WizardGame({state,setState,onBack,onHome,onEndGame,lang="de",theme="dark"}){const t=useT(lang);
const setPlayers=updater=>setState(s=>({...s,players:typeof updater==="function"?updater(s.players):updater}));
const setStartId=id=>setState(s=>({...s,startId:id}));
const startGame=()=>{setState(s=>({...s,phase:"play",rounds:{},hist:[],ended:false}));};
useEffect(()=>{if(state.phase==="setup"&&state.players.length<3)setState(s=>s.phase!=="setup"||s.players.length>=3?s:{...s,players:wzPad(s.players,t)});},[state.phase,state.players.length]);
if(state.phase==="setup"){return <div className="gtL-shellpage wz-root" style={wzShell(theme)}><style>{GLOBAL_STYLES}{WZ_CSS}</style><div className="gtL-page gtL-game" style={{maxWidth:380,margin:"0 auto",position:"relative",zIndex:1}}><GtCol accent={wzTk(theme).gold}><GtUbStyle/><WizardTopBar subtitle={t("gtNewMatch")} onBack={onBack} theme={theme} t={t} onHome={onHome} rulesText={t("rulesWizard")}/><WizardSetup players={state.players} setPlayers={setPlayers} startId={state.startId} setStartId={setStartId} onStart={startGame} theme={theme} t={t}/></GtCol></div></div>;}return <WizardPlay state={state} setState={setState} onBack={onBack} onHome={onHome} onEndGame={onEndGame} lang={lang} theme={theme}/>;}/*@gt-body-end*/
export { wizardRoundCount, wizardRoundScore, wizardTotals, WIZARD_HUES, WIZARD_HUES_LIGHT, WIZARD_PARCHMENT_CSS, WIZARD_INK_DARK, WIZARD_CARD_DARK, WIZARD_BORDER_DARK, WIZARD_GOLD_DARK, WIZARD_PARCH_DARK, WizardTopBar, WizardSetup, WizardEditorPanel, WizardPlay, WizardGame };
