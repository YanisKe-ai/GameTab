// Molotow (Jass, jeder fuer sich, wenigste Punkte gewinnen). Regeln: jassverzeichnis.ch/molotow-jass, Variante "nach alten Regeln".
// Spielansicht: Jasstafel (oben Punkte pro Runde, unten Wyys/Stoeck minus und Tischwyys plus der laufenden Runde, darunter Total).
import { React } from "../../vendor/react-globals.js";
import { Fragment, useEffect, useRef, useState } from "../../prelude.js";
import { GLOBAL_STYLES } from "../../styles/global.js";
import { RulesButton, RulesSheet } from "../../app/App.js";
import { useT } from "../../i18n/use-t.js";
import { useGtDialog } from "../../shared/dialog.js";
import { hapticTap } from "../../shared/sound.js";
import { rankedPodium } from "../../shared/ranking.js";
import { useGtRecord } from "../../stats/match-log.js";
import { gtWinLine } from "../../shared/game-helpers.js";
import { PodiumOverlay, useCelebration } from "../../shared/podium.js";
import { GameHeader } from "../../shared/game-header.js";
import { GroupPicker, GtChips, GtPlayerList, GtStartBar, gtSkin, gtSkinTk } from "../../shared/setup-ui.js";
import { GtCol } from "../../shared/unit.js";
import { GtUbStyle } from "../../shared/unit-boards.js";
import { WyFan, WEIS_LBL, SCHIEBER_PL_CSS } from "../schieber/game.js";
import { MolotowLogo } from "./logo.js";
import herzA from "../schieber/img/herz-A.svg";
import eckeA from "./img/ecke-A.svg";
import schaufelA from "./img/schaufel-A.svg";
import kreuzA from "./img/kreuz-A.svg";
import { MOL_MAX_CARD_PTS, MOL_MAX_ROUNDS, MOL_MIN_ROUNDS, MOL_SUITS, MOL_WEIS_PTS, MOL_STOECK, DEFAULT_MOLOTOW, molCardsPer, molCell, molClampRounds, molFmt, molMinus, molPlus, molRanks, molState, molStarter, molValue, molWeisSum } from "./core.js";

/*@gt-body-begin*/
const MOL_SUIT_PATH = {
  h: "M12 21C5 15 2 11.5 2 7.6 2 4.8 4.2 3 6.6 3c2.2 0 4 1.2 5.4 3.4C13.4 4.2 15.2 3 17.4 3 19.8 3 22 4.8 22 7.6 22 11.5 19 15 12 21Z",
  d: "M12 2 20 12 12 22 4 12Z",
  c: "M12 2a5 5 0 0 1 4.6 7 5 5 0 1 1-2.9 7.6c.2 1.9.9 3.4 2.2 5.4H8.1c1.3-2 2-3.5 2.2-5.4A5 5 0 1 1 7.4 9 5 5 0 0 1 12 2Z",
  s: "M12 2C8 7 3 10 3 14.5 3 17 5 19 7.4 19c1.4 0 2.7-.6 3.5-1.7-.2 1.7-.9 3-2.2 4.2h6.6c-1.3-1.2-2-2.5-2.2-4.2.8 1.1 2.1 1.7 3.5 1.7C19 19 21 17 21 14.5 21 10 16 7 12 2Z",
};
const MOL_SUIT_IMG = { h: herzA, d: eckeA, s: schaufelA, c: kreuzA };
const MOL_SUIT_KEY = { h: "molSuitH", d: "molSuitD", s: "molSuitS", c: "molSuitC" };
const MOL_TILES = [["w3", ["D", "K", "A"], "h"], ["w4", ["9", "10", "B", "D"], "s"], ["w5", ["8", "9", "10", "B", "D"], "h"], ["g4", ["A", "A", "A", "A"], ["h", "s", "d", "c"]]];
const MOL_MORE = ["w6", "w7", "w8", "w9", "g4n", "g4b"];

function SuitGlyph({ s, size = 14 }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" style={{ flex: "none" }}><path d={MOL_SUIT_PATH[s]} /></svg>;
}

function molTk(theme) {
  if (theme === "light") return { theme, bg: "radial-gradient(ellipse at 50% -10%, #FBF7EC 0%, #F6F1E7 55%, #EFE8D8 100%)", bgSolid: "#F6F1E7", ink: "#1E1A15", muted: "#5E574C", card: "#FFFCF6", border: "rgba(30,26,21,0.18)", acc: "#59690A", on: "#FFFFFF", sheet: "#FBF7EC", sheetLine: "rgba(30,26,21,0.14)", slate: "#26302A", w1: "#B48A58", w2: "#8A6339", ch: "#F4F1E8", chm: "rgba(244,241,232,0.62)", mi: "#C8E04A", pl: "#FF9A7B", hues: ["#59690A", "#1F7A6A", "#A85F12", "#B23A63", "#3F58B5", "#7B4FB5"], badgeInk: "#FFFFFF" };
  if (theme === "noir") return { theme, bg: "#000000", bgSolid: "#000000", ink: "#EBEBEB", muted: "#A8A8A8", card: "#1A1A1A", border: "#5F5F5F", acc: "#EBEBEB", on: "#000000", sheet: "#111111", sheetLine: "#3A3A3A", slate: "#0D0D0D", w1: "#6C6C6C", w2: "#444444", ch: "#FFFFFF", chm: "rgba(255,255,255,0.62)", mi: "#FFFFFF", pl: "#D4D4D4", hues: ["#E6E6E6", "#C8C8C8", "#AAAAAA", "#D8D8D8", "#B8B8B8", "#9C9C9C"], badgeInk: "#000000" };
  return { theme: "dark", bg: "radial-gradient(ellipse at 50% -10%, #28351F 0%, #151B11 55%, #0B0E09 100%)", bgSolid: "#12170E", ink: "#EEF1E4", muted: "#A9B29C", card: "rgba(238,241,228,0.06)", border: "rgba(238,241,228,0.16)", acc: "#B8D52A", on: "#18200A", sheet: "#161C12", sheetLine: "rgba(238,241,228,0.12)", slate: "#222C26", w1: "#9A6F43", w2: "#6B4A2A", ch: "#F4F1E8", chm: "rgba(244,241,232,0.62)", mi: "#C8E04A", pl: "#FF9A7B", hues: ["#B8D52A", "#6EC9B8", "#F2A65A", "#E9779A", "#8FA8F0", "#C9A6F0"], badgeInk: "#141A0A" };
}
function molVars(k) {
  return { "--mo-bg": k.bgSolid, "--mo-ink": k.ink, "--mo-mu": k.muted, "--mo-card": k.card, "--mo-line": k.border, "--mo-acc": k.acc, "--mo-on": k.on, "--mo-sheet": k.sheet, "--mo-sline": k.sheetLine, "--mo-sl": k.slate, "--mo-w1": k.w1, "--mo-w2": k.w2, "--mo-ch": k.ch, "--mo-chm": k.chm, "--mo-mi": k.mi, "--mo-pl": k.pl, "--mo-bi": k.badgeInk };
}
function molShell(theme) { const k = molTk(theme); return { minHeight: "100vh", boxSizing: "border-box", background: k.bg, padding: "20px 12px 32px", ...molVars(k) }; }

const MO_CSS = `
.mo-root{font-family:'Inter',system-ui,sans-serif;color:var(--mo-ink)}
.mo-lbl{font:700 12px/1.2 'Inter',sans-serif;letter-spacing:.06em;color:var(--mo-mu);margin:4px 2px 8px}
.mo-sw{display:flex;align-items:center;gap:12px;width:100%;min-height:56px;padding:6px 14px;border-radius:16px;border:1px solid var(--mo-line);background:var(--mo-card);color:var(--mo-ink);font:inherit;text-align:left;cursor:pointer;box-sizing:border-box}
.mo-sw b{display:block;font:600 15px/1.25 'Inter',sans-serif}
.mo-sw small{display:block;font:400 12.5px/1.3 'Inter',sans-serif;color:var(--mo-mu);margin-top:1px}
.mo-sw>span:first-child{min-width:0;flex:1}
.mo-tg{flex:none;width:46px;height:28px;border-radius:999px;background:rgba(127,127,127,.35);position:relative;transition:background-color .2s ease}
.mo-tg::after{content:"";position:absolute;left:3px;top:3px;width:22px;height:22px;border-radius:50%;background:#fff;box-shadow:0 1px 3px rgba(0,0,0,.35);transition:transform .2s cubic-bezier(.23,1,.32,1)}
.mo-sw[aria-checked="true"] .mo-tg{background:var(--mo-acc)}
.mo-sw[aria-checked="true"] .mo-tg::after{transform:translateX(18px)}
.mo-start{display:flex;flex-wrap:wrap;gap:6px}
.mo-chip{min-height:44px;max-width:100%;padding:0 14px;border-radius:14px;border:1px solid var(--mo-line);background:var(--mo-card);color:var(--mo-ink);font:600 14px 'Inter',sans-serif;cursor:pointer;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.mo-chip.on{background:var(--mo-acc);border-color:var(--mo-acc);color:var(--mo-on)}
.mo-info{font:500 13px/1.4 'Inter',sans-serif;color:var(--mo-mu);padding:2px 2px 4px}
.mo-fan{display:flex;justify-content:center;gap:0;margin:0 0 4px;height:58px}
.mo-fan img{width:44px;height:62px;margin:0 -6px;filter:drop-shadow(0 3px 5px rgba(0,0,0,.35))}
.mo-fan img:nth-child(1){transform:rotate(-15deg) translateY(2px)}.mo-fan img:nth-child(2){transform:rotate(-5deg)}.mo-fan img:nth-child(3){transform:rotate(5deg)}.mo-fan img:nth-child(4){transform:rotate(15deg) translateY(2px)}
/* Tafel */
.mo-board{width:100%;margin:6px 0 0;position:relative}
.mo-frame{padding:9px;border-radius:18px;background:linear-gradient(145deg,var(--mo-w1),var(--mo-w2));box-shadow:0 12px 28px -14px rgba(0,0,0,.6),inset 0 1px 0 rgba(255,255,255,.2)}
.mo-slate{border-radius:9px;padding:4px 6px 8px;background:radial-gradient(120% 90% at 25% 0%,rgba(255,255,255,.07),transparent 60%),var(--mo-sl);box-shadow:inset 0 0 0 1px rgba(0,0,0,.45),inset 0 10px 26px rgba(0,0,0,.35);color:var(--mo-ch);--mo-lc:44px;--mo-rh:44px}
.mo-slate.dense{--mo-rh:36px}
.mo-grid{display:flex;flex-direction:column;text-align:center}
.mo-hrow,.mo-row,.mo-trow{display:grid;grid-template-columns:var(--mo-lc) repeat(var(--n),minmax(0,1fr));align-items:center;width:100%;box-sizing:border-box}
.mo-hrow{padding:4px 0 6px;border-bottom:2px solid rgba(244,241,232,.34)}
.mo-hc{display:flex;flex-direction:column;align-items:center;gap:3px;min-width:0;padding:0 2px}
.mo-bd{width:22px;height:22px;border-radius:50%;display:grid;place-items:center;font:800 12px/1 'Inter',sans-serif;color:var(--mo-bi)}
.mo-hn{max-width:100%;font:600 11px/1.1 'Inter',sans-serif;color:var(--mo-chm);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.mo-row{min-height:var(--mo-rh);border:0;border-bottom:1px dashed rgba(244,241,232,.16);background:none;color:inherit;font:inherit;padding:0;text-align:center;cursor:pointer;-webkit-tap-highlight-color:transparent;transition:background-color .15s ease}
.mo-row:active:not(:disabled){background:rgba(244,241,232,.08)}
.mo-row:disabled{cursor:default}
.mo-row.fut{opacity:.34}
.mo-row.cur{background:rgba(200,224,74,.11);box-shadow:inset 3px 0 0 var(--mo-mi)}
.mo-slate .mo-row:focus-visible{outline:2px solid var(--mo-ch);outline-offset:-3px}
.mo-rn{display:flex;align-items:center;justify-content:center;gap:3px;font:400 15px/1 'Kalam',cursive;color:var(--mo-chm)}
.mo-rn svg{opacity:.95}
.mo-rn.h svg,.mo-rn.d svg{color:var(--mo-pl)}
.mo-v{font:400 clamp(17px,5.2vw,22px)/1 'Kalam',cursive;font-variant-numeric:tabular-nums;color:var(--mo-ch);min-width:0;overflow:hidden;text-overflow:clip;white-space:nowrap}
.mo-v.part{opacity:.5;font-style:italic}
.mo-v.neg{color:var(--mo-mi)}
.mo-n6 .mo-v{font-size:clamp(15px,4.3vw,19px)}
.mo-div{height:0;border-top:2px solid rgba(244,241,232,.34);margin:6px 0 0}
.mo-trow{min-height:34px}
.mo-sg{display:grid;place-items:center;width:22px;height:22px;margin:0 auto;border-radius:50%;border:1.5px solid currentColor;font:800 15px/1 'Inter',sans-serif}
.mo-trow.mi .mo-sg,.mo-trow.mi .mo-v{color:var(--mo-mi)}
.mo-trow.pl .mo-sg,.mo-trow.pl .mo-v{color:var(--mo-pl)}
.mo-trow.zero .mo-v{color:var(--mo-chm);opacity:.45}
.mo-tot{border-top:2px solid rgba(244,241,232,.34);margin-top:4px;padding-top:6px;min-height:50px}
.mo-tot .mo-rn{font:700 11px/1 'Inter',sans-serif;color:var(--mo-chm)}
.mo-tc{position:relative;display:flex;flex-direction:column;align-items:center;justify-content:center;min-width:0}
.mo-tc .mo-v{font-size:clamp(20px,6vw,26px);font-weight:700}
.mo-n6 .mo-tc .mo-v{font-size:clamp(17px,4.8vw,22px)}
.mo-tc.lead .mo-v{color:var(--mo-mi)}
.mo-tc.lead::before{content:"";position:absolute;left:50%;top:50%;width:min(86%,54px);height:38px;transform:translate(-50%,-52%) rotate(-3deg);border:1.5px solid var(--mo-mi);border-radius:50%;opacity:.7;pointer-events:none}
.mo-rk{font:700 10.5px/1 'Inter',sans-serif;color:var(--mo-chm);margin-top:3px}
.mo-legend{display:flex;flex-wrap:wrap;gap:4px 14px;justify-content:center;margin:9px 0 0;font:500 12px/1.3 'Inter',sans-serif;color:var(--mo-mu)}
.mo-legend span{display:inline-flex;align-items:center;gap:5px}
.mo-legend b{font:800 13px/1 'Inter',sans-serif}
/* Dock */
.mo-dock{position:sticky;bottom:0;z-index:5;margin:12px -12px 0;padding:10px 12px calc(10px + env(safe-area-inset-bottom,0px));background:linear-gradient(to top,var(--mo-bg) 78%,transparent);display:flex;flex-direction:column;gap:8px}
.mo-dk{display:flex;gap:8px;align-items:center}
.mo-dkinfo{display:flex;flex-direction:row;align-items:baseline;gap:4px 10px;flex-wrap:wrap;min-width:0;padding:0 2px}
.mo-dkinfo b{font:700 15px/1.2 'Inter',sans-serif;white-space:nowrap}
.mo-dkinfo span{font:500 12.5px/1.3 'Inter',sans-serif;color:var(--mo-mu);min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;max-width:100%}
.mo-cta{flex:none;min-height:50px;padding:0 20px;border:0;border-radius:16px;background:var(--mo-acc);color:var(--mo-on);font:800 15px 'Inter',sans-serif;cursor:pointer;box-shadow:0 12px 26px -14px var(--mo-acc);transition:transform .14s ease-out;max-width:62%}
.mo-cta:active{transform:scale(.97)}
.mo-cta.wide{flex:1;max-width:none}
.mo-ib{flex:none;width:50px;height:50px;border-radius:16px;border:1px solid var(--mo-line);background:var(--mo-card);color:var(--mo-ink);display:grid;place-items:center;cursor:pointer;padding:0}
.mo-ib:disabled{opacity:.3;cursor:default}
.mo-win{font:700 17px/1.25 'Inter',sans-serif;text-align:center;color:var(--mo-acc);padding:2px 4px}
.mo-rank{display:none}
.mo-root button:focus-visible{outline:2px solid var(--mo-acc);outline-offset:2px}
/* Eingabe-Blatt */
.mo-ov{position:fixed;inset:0;z-index:70;display:flex;flex-direction:column;justify-content:flex-end;background:rgba(10,12,8,.55);animation:moFade .18s ease-out both}
.mo-sheet{display:flex;flex-direction:column;max-height:min(94vh,780px);width:100%;max-width:560px;margin:0 auto;box-sizing:border-box;background:var(--mo-sheet);color:var(--mo-ink);border-radius:24px 24px 0 0;box-shadow:0 -1px 0 var(--mo-sline),0 -10px 30px rgba(0,0,0,.28);overflow:hidden;animation:moUp .3s cubic-bezier(.32,.72,0,1) both;font-family:'Inter',sans-serif}
.mo-eh{display:flex;align-items:center;justify-content:space-between;gap:8px;padding:10px 6px 2px 16px;flex:none}
.mo-eh h2{margin:0;font:800 19px/1.15 'Inter',sans-serif;min-width:0}
.mo-eh p{margin:2px 0 0;font:500 12.5px/1.3 'Inter',sans-serif;color:var(--mo-mu)}
.mo-x{width:44px;height:44px;border:0;border-radius:50%;background:rgba(127,127,127,.16);color:var(--mo-ink);display:grid;place-items:center;cursor:pointer;flex:none;padding:0}
.mo-trump{display:flex;align-items:center;gap:8px;padding:6px 14px 8px;flex:none}
.mo-trump>span{font:700 12.5px/1.2 'Inter',sans-serif;color:var(--mo-mu);margin-right:2px;flex:none}
.mo-tb{position:relative;flex:1;max-width:64px;height:60px;padding:0;border:1px solid var(--mo-sline);border-radius:12px;background:rgba(127,127,127,.1);cursor:pointer;display:grid;place-items:center;transition:transform .14s ease-out,box-shadow .16s ease}
.mo-tb img{height:48px;width:auto;display:block;filter:drop-shadow(0 2px 3px rgba(0,0,0,.3))}
.mo-tb:active{transform:scale(.96)}
.mo-tb[aria-pressed="true"]{box-shadow:inset 0 0 0 2px var(--mo-acc);background:rgba(127,127,127,.2)}
.mo-eb{flex:1 1 auto;min-height:0;overflow-y:auto;overscroll-behavior:contain;-webkit-overflow-scrolling:touch;padding:0 10px 6px}
.mo-ecap,.mo-er{display:grid;grid-template-columns:minmax(40px,1fr) var(--mo-cc);gap:5px;align-items:center}
.mo-ecap{padding:2px 8px 4px;font:700 11px/1.1 'Inter',sans-serif;color:var(--mo-mu);position:sticky;top:0;background:var(--mo-sheet);z-index:2}
.mo-ecap span{text-align:center;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.mo-er{padding:3px 8px;border-radius:14px;border:1px solid transparent;margin-bottom:3px;transition:background-color .15s ease,border-color .15s ease}
.mo-er.act{background:rgba(127,127,127,.12);border-color:var(--mo-acc)}
.mo-en{display:flex;flex-direction:column;min-width:0;justify-content:center}
.mo-en b{font:700 14px/1.2 'Inter',sans-serif;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.mo-en small{font:500 11.5px/1.2 'Inter',sans-serif;color:var(--mo-mu);min-height:14px;font-variant-numeric:tabular-nums}
.mo-cs{display:grid;gap:5px}
.mo-c{height:46px;min-width:0;padding:0 2px;border-radius:12px;border:1px solid var(--mo-sline);background:rgba(127,127,127,.1);color:var(--mo-mu);font:700 15px/1 'Inter',sans-serif;font-variant-numeric:tabular-nums;cursor:pointer;display:grid;place-items:center;transition:background-color .15s ease,transform .12s ease-out;overflow:hidden}
.mo-c:active{transform:scale(.96)}
.mo-c.ck{color:var(--mo-ink);font-size:19px;font-weight:800}
.mo-c.act{border-color:var(--mo-acc);box-shadow:inset 0 0 0 1.5px var(--mo-acc)}
.mo-c.on.mi{background:var(--mo-acc);border-color:var(--mo-acc);color:var(--mo-on)}
.mo-c.on.pl{background:#E5775A;border-color:#E5775A;color:#fff}
.mo-noir .mo-c.on.pl{background:#8A8A8A;border-color:#8A8A8A}
.mo-pad{flex:none;display:grid;grid-template-columns:repeat(3,1fr);gap:6px;padding:8px 12px calc(10px + env(safe-area-inset-bottom,0px));border-top:1px solid var(--mo-sline);background:var(--mo-sheet)}
.mo-pad button{height:46px;border:0;border-radius:12px;background:rgba(127,127,127,.16);color:var(--mo-ink);font:700 20px 'Inter',sans-serif;cursor:pointer;display:grid;place-items:center;font-variant-numeric:tabular-nums;transition:transform .1s ease-out}
.mo-pad button:active{transform:scale(.95)}
.mo-pad .nx{background:var(--mo-acc);color:var(--mo-on);font-size:15px}
.mo-pad-note{grid-column:1/-1;font:500 12px/1.3 'Inter',sans-serif;color:var(--mo-mu);text-align:center;min-height:16px}
@keyframes moFade{from{opacity:0}to{opacity:1}}
@keyframes moUp{from{transform:translateY(100%)}to{transform:none}}
@media (prefers-reduced-motion:reduce){.mo-sheet,.mo-ov{animation:none}.mo-tg::after,.mo-c,.mo-cta{transition:none}}
.gt-weis-ov.mo-wov{z-index:73}
.mo-wsum{font:700 13px/1.2 'Inter',sans-serif;color:var(--wy-pt);padding:2px 6px 6px}
/* Laptop: Tafel links, Rangliste rechts */
.gtL-content .mo-split{align-items:start}
.gtL-content .mo-main{width:min(560px,56vw)}
.gtL-content .mo-rank{display:flex;flex-direction:column;gap:6px}
.gtL-content .mo-rank h3{margin:0 0 4px;font:700 12px/1.2 'Inter',sans-serif;letter-spacing:.06em;color:var(--mo-mu)}
.gtL-content .mo-rk-row{display:grid;grid-template-columns:30px minmax(0,1fr) auto;gap:8px;align-items:center;min-height:48px;padding:0 14px;border-radius:14px;border:1px solid var(--mo-line);background:var(--mo-card)}
.gtL-content .mo-rk-row.lead{border-color:var(--mo-acc)}
.gtL-content .mo-rk-row b{font:700 15px/1.2 'Inter',sans-serif;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.gtL-content .mo-rk-row i{font:800 20px/1 'Inter',sans-serif;font-style:normal;font-variant-numeric:tabular-nums}
.gtL-content .mo-dock{position:static;margin:12px 0 0;padding:0;background:none}
[data-phone-landscape] .mo-main,[data-phone-landscape] .mo-board{max-width:none}
`;

function MoSuitLabel(t, s) { return t(MOL_SUIT_KEY[s]); }

/* ---------- Wyys-Auswahl (gleiche Kartenkacheln und Werte wie der Wyys-Dialog im Schieber) ---------- */
function MolWeisPicker({ open, kind, name, value, onSave, onClose, t, theme }) {
  const [items, setItems] = useState([]);
  const [more, setMore] = useState(false);
  const ref = useGtDialog({ open, onClose });
  useEffect(() => { if (open) { setItems(Array.isArray(value) ? value : []); setMore(false); } }, [open]);
  if (!open) return null;
  const sign = kind === "t" ? "+" : "−";
  const pts = molWeisSum(items);
  const count = k => items.filter(x => x === k).length;
  const toggle = k => setItems(a => a.includes(k) ? a.filter(x => x !== k) : a.length >= 8 ? a : [...a, k]);
  const step = (k, d) => setItems(a => { if (d > 0) return a.length >= 8 ? a : [...a, k]; const i = a.indexOf(k); return i < 0 ? a : a.filter((_, j) => j !== i); });
  const chk = <span className="gt-wy-chk" aria-hidden="true"><svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M5 12.5l4.5 4.5L19 7" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" /></svg></span>;
  const qty = k => <div className="gt-wy-qty"><button type="button" onClick={() => step(k, -1)} aria-label={t("weisLess") + ": " + t(WEIS_LBL[k])}>{"−"}</button><span aria-live="polite">{count(k)}</span><button type="button" onClick={() => step(k, 1)} aria-label={t("weisMoreQty") + ": " + t(WEIS_LBL[k])}>+</button></div>;
  const title = kind === "t" ? t("molTischOf")(name) : t("molWeisOf")(name);
  return <div ref={ref} role="dialog" aria-modal="true" aria-label={title} className="gt-weis-ov mo-wov" style={{ position: "fixed", inset: 0, display: "flex", flexDirection: "column", justifyContent: "flex-end", background: "rgba(20,16,10,0.46)" }} onClick={onClose}>
    <div className={"gt-weis-panel gt-wy" + (theme === "noir" ? " gt-wy-noir" : theme === "light" ? " gt-wy-light" : "")} onClick={e => e.stopPropagation()}>
      <div className="gt-wy-head"><h2>{title}</h2><button type="button" className="gt-wy-x" onClick={onClose} aria-label={t("weisClose")}><svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M5 5l14 14M19 5L5 19" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" /></svg></button></div>
      <div className="gt-wy-body">
        <div className="gt-wy-grid">{MOL_TILES.map(([k, c, s]) => {
          const n = count(k);
          return <div key={k} className={"gt-wy-tile" + (n > 0 ? " is-on" : "")}>
            <div role="button" tabIndex={0} className="gt-wy-tb" aria-pressed={n > 0} onClick={() => toggle(k)} onKeyDown={e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); toggle(k); } }}>{n > 0 && chk}<WyFan c={c} s={s} /><b>{t(WEIS_LBL[k])}</b><i>{t("weisPts")(MOL_WEIS_PTS[k])}</i></div>
            {n > 0 && qty(k)}
          </div>;
        })}</div>
        <button type="button" className="gt-wy-more" aria-expanded={more} onClick={() => setMore(m => !m)}>{t("weisMore")}<svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M9 5l7 7-7 7" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" /></svg></button>
        {more && <div className="gt-wy-list">{MOL_MORE.map(k => {
          const n = count(k);
          return <div key={k} className={"gt-wy-row" + (n > 0 ? " is-on" : "")}><button type="button" aria-pressed={n > 0} onClick={() => toggle(k)}><span>{t(WEIS_LBL[k])}</span><i>{MOL_WEIS_PTS[k]}</i></button>{n > 0 && qty(k)}</div>;
        })}</div>}
      </div>
      <div className="gt-wy-foot">
        <button type="button" data-gt-sound="1" className="gt-weis-save" onClick={() => onSave(items)}>{pts > 0 ? t("molApply")(sign + pts) : t("molApplyNone")}</button>
      </div>
    </div>
  </div>;
}

/* ---------- Eingabe-Blatt fuer eine Runde ---------- */
function MolRoundSheet({ idx, st, state, setCell, setTrump, onClose, t, theme }) {
  const players = st.players, noWeis = !!state.noWeis, tens = !!state.tens;
  const round = st.rounds[idx] || null;
  const firstOpen = () => { const p = players.find(q => molCell(round, q.id).k === null); return p ? p.id : (players[0] ? players[0].id : 0); };
  const [active, setActive] = useState(firstOpen);
  const [pick, setPick] = useState(null);
  const ref = useGtDialog({ open: true, onClose });
  const bodyRef = useRef(null);
  const cur = pid => molCell(round, pid);
  const addDigit = d => {
    const c = cur(active).k;
    const next = parseInt((c === null ? "" : String(c)) + d, 10);
    if (!isFinite(next) || next > MOL_MAX_CARD_PTS) return;
    try { hapticTap(); } catch (e) { /* ignore */ }
    setCell(idx, active, { k: next });
  };
  const del = () => { const c = cur(active).k; if (c === null) return; const s = String(c).slice(0, -1); setCell(idx, active, { k: s === "" ? null : parseInt(s, 10) }); };
  const next = () => {
    const i = players.findIndex(p => p.id === active);
    for (let j = 1; j <= players.length; j++) { const p = players[(i + j) % players.length]; if (cur(p.id).k === null) { setActive(p.id); return; } }
    const p = players[(i + 1) % players.length]; if (p) setActive(p.id);
  };
  const kb = useRef({});
  kb.current = { addDigit, del, pick };
  useEffect(() => {
    const h = e => {
      if (kb.current.pick || e.ctrlKey || e.metaKey || e.altKey) return;
      const tg = e.target && e.target.tagName;
      if (tg === "INPUT" || tg === "TEXTAREA") return;
      if (/^[0-9]$/.test(e.key)) { e.preventDefault(); kb.current.addDigit(e.key); }
      else if (e.key === "Backspace") { e.preventDefault(); kb.current.del(); }
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, []);
  useEffect(() => {
    const el = bodyRef.current && bodyRef.current.querySelector('[data-pid="' + active + '"]');
    if (el && el.scrollIntoView) el.scrollIntoView({ block: "nearest" });
  }, [active]);
  const missing = players.filter(p => cur(p.id).k === null).length;
  const starter = molStarter(players, state.startId, idx);
  const cols = noWeis ? "62px 52px" : "58px 50px 46px 50px";
  const pickPlayer = pick ? players.find(p => p.id === pick.pid) : null;
  return <div ref={ref} role="dialog" aria-modal="true" aria-label={t("molRoundOf")(idx + 1, st.rc)} className={"mo-ov gt-weis-ov mo-root" + (theme === "noir" ? " mo-noir" : "")} style={molVars(molTk(theme))} onClick={onClose}>
    <div className="mo-sheet" style={{ "--mo-cc": cols }} onClick={e => e.stopPropagation()}>
      <div className="mo-eh">
        <div style={{ minWidth: 0 }}><h2>{t("molRoundOf")(idx + 1, st.rc)}</h2>{starter && <p>{t("molBegins")(starter.name)}</p>}</div>
        <button type="button" className="mo-x" onClick={onClose} aria-label={t("weisClose")}><svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M5 5l14 14M19 5L5 19" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" /></svg></button>
      </div>
      <div className="mo-trump" role="group" aria-label={t("molTrump")}>
        <span>{t("molTrump")}</span>
        {MOL_SUITS.map(s => <button key={s} type="button" className="mo-tb" aria-pressed={!!round && round.trump === s} aria-label={MoSuitLabel(t, s)} title={MoSuitLabel(t, s)} onClick={() => setTrump(idx, round && round.trump === s ? null : s)}><img src={MOL_SUIT_IMG[s]} alt="" draggable={false} /></button>)}
      </div>
      <div className="mo-eb" ref={bodyRef}>
        <div className="mo-ecap" aria-hidden="true"><span style={{ textAlign: "left" }} /><div className="mo-cs" style={{ gridTemplateColumns: cols.split(" ").join(" ") }}><span>{t("molColCards")}</span>{!noWeis && <span>{t("molColWeis")}</span>}<span>{t("molColStoeck")}</span>{!noWeis && <span>{t("molColTisch")}</span>}</div></div>
        {players.map((p, i) => {
          const c = cur(p.id);
          const val = c.k === null ? "" : "= " + molFmt(molValue(c, noWeis, tens));
          const wsum = molWeisSum(c.w), tsum = molWeisSum(c.t);
          return <div key={p.id} data-pid={p.id} className={"mo-er" + (active === p.id ? " act" : "")} role="group" aria-label={p.name}>
            <div className="mo-en" title={p.name}><b>{p.name}</b><small>{val}</small></div>
            <div className="mo-cs" style={{ gridTemplateColumns: cols }}>
              <button type="button" className={"mo-c ck" + (active === p.id ? " act" : "")} aria-label={t("molColCards") + ": " + (c.k === null ? "-" : c.k)} onClick={() => setActive(p.id)}>{c.k === null ? "–" : c.k}</button>
              {!noWeis && <button type="button" className={"mo-c mi" + (wsum > 0 ? " on" : "")} aria-label={t("molColWeis") + ": " + (wsum > 0 ? wsum : "-")} onClick={() => setPick({ pid: p.id, kind: "w" })}>{wsum > 0 ? "−" + wsum : "–"}</button>}
              <button type="button" className={"mo-c mi" + (c.s ? " on" : "")} aria-pressed={c.s} aria-label={t("molColStoeck") + " −" + MOL_STOECK} onClick={() => setCell(idx, p.id, { s: !c.s })}>{c.s ? "−" + MOL_STOECK : "–"}</button>
              {!noWeis && <button type="button" className={"mo-c pl" + (tsum > 0 ? " on" : "")} aria-label={t("molColTisch") + ": " + (tsum > 0 ? tsum : "-")} onClick={() => setPick({ pid: p.id, kind: "t" })}>{tsum > 0 ? "+" + tsum : "–"}</button>}
            </div>
          </div>;
        })}
      </div>
      <div className="mo-pad" role="group" aria-label={t("molColCards")}>
        <div className="mo-pad-note" aria-live="polite">{missing > 0 ? t("molMissing")(missing) : t("molAllIn")}</div>
        {["1", "2", "3", "4", "5", "6", "7", "8", "9"].map(d => <button key={d} type="button" aria-label={d} onClick={() => addDigit(d)}>{d}</button>)}
        <button type="button" aria-label={t("molDelete")} onClick={del}><svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M9 5h11v14H9L3 12l6-7Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" /><path d="M12.5 9.5l5 5M17.5 9.5l-5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg></button>
        <button type="button" aria-label="0" onClick={() => addDigit("0")}>0</button>
        <button type="button" className="nx" onClick={missing === 0 ? onClose : next}>{missing === 0 ? t("molDone") : t("molNext")}</button>
      </div>
    </div>
    <MolWeisPicker open={!!pick} kind={pick ? pick.kind : "w"} name={pickPlayer ? pickPlayer.name : ""} value={pick && pickPlayer ? (pick.kind === "t" ? cur(pick.pid).t : cur(pick.pid).w) : []} onClose={() => setPick(null)} onSave={items => { setCell(idx, pick.pid, pick.kind === "t" ? { t: items } : { w: items }); setPick(null); }} t={t} theme={theme} />
  </div>;
}

/* ---------- Tafel ---------- */
function MolBoard({ st, state, onOpen, t, mk }) {
  const { players, rounds, rc, done, cur, totals, finished } = st;
  const n = players.length, noWeis = !!state.noWeis, tens = !!state.tens;
  const ranks = molRanks(players, totals);
  const anyDone = st.doneCount > 0;
  const minTot = anyDone ? Math.min(...players.map(p => totals[p.id])) : null;
  const curRound = cur >= 0 ? rounds[cur] : null;
  const dense = rc > 8;
  const style = { "--n": n };
  return <div className={"mo-board" + (n >= 6 ? " mo-n6" : "")} role="table" aria-label={t("gameMolotow")}>
    <div className="mo-frame"><div className={"mo-slate" + (dense ? " dense" : "")} style={style}><div className="mo-grid">
      <div className="mo-hrow" role="row"><span />{players.map((p, i) => <div key={p.id} className="mo-hc" role="columnheader" title={p.name}><span className="mo-bd" style={{ background: mk.hues[i % mk.hues.length] }}>{i + 1}</span><span className="mo-hn">{p.name}</span></div>)}</div>
      {Array.from({ length: rc }, (_, i) => {
        const r = rounds[i], isDone = done[i], isCur = i === cur;
        const fut = !isDone && !isCur;
        const trump = r && r.trump;
        return <button key={i} type="button" role="row" className={"mo-row" + (isCur ? " cur" : "") + (fut ? " fut" : "")} disabled={fut || finished && !isDone} onClick={() => onOpen(i)} aria-label={t("molEditRound")(i + 1)}>
          <span className={"mo-rn " + (trump || "")}><span>{i + 1}</span>{trump && <SuitGlyph s={trump} size={13} />}</span>
          {players.map(p => {
            const c = molCell(r, p.id);
            if (isDone) { const v = molValue(c, noWeis, tens); return <span key={p.id} role="cell" className={"mo-v" + (v < 0 ? " neg" : "")}>{molFmt(v)}</span>; }
            return <span key={p.id} role="cell" className={"mo-v part"}>{c.k === null ? "" : c.k}</span>;
          })}
        </button>;
      })}
      <div className="mo-div" />
      <div className="mo-trow mi" role="row"><span className="mo-sg" aria-label={t("molBoardMinus")}>{"−"}</span>{players.map(p => { const v = curRound && !finished ? molMinus(molCell(curRound, p.id), noWeis) : 0; return <span key={p.id} role="cell" className={"mo-v" + (v ? "" : " zero")} style={v ? undefined : { opacity: 0.35 }}>{v ? "−" + v : "·"}</span>; })}</div>
      <div className="mo-trow pl" role="row"><span className="mo-sg" aria-label={t("molBoardPlus")}>+</span>{players.map(p => { const v = curRound && !finished ? molPlus(molCell(curRound, p.id), noWeis) : 0; return <span key={p.id} role="cell" className="mo-v" style={v ? undefined : { opacity: 0.35 }}>{v ? "+" + v : "·"}</span>; })}</div>
      <div className="mo-trow mo-tot" role="row"><span className="mo-rn">{t("molTotal")}</span>{players.map(p => { const lead = anyDone && totals[p.id] === minTot; return <div key={p.id} role="cell" className={"mo-tc" + (lead ? " lead" : "")}><span className="mo-v">{molFmt(totals[p.id])}</span>{anyDone && <span className="mo-rk">{ranks[p.id]}.</span>}</div>; })}</div>
    </div></div></div>
    <div className="mo-legend"><span><b style={{ color: "var(--mo-acc)" }}>{"−"}</b>{t("molBoardMinus")}</span><span><b style={{ color: "var(--mo-pl)" }}>+</b>{t("molBoardPlus")}</span></div>
  </div>;
}

/* ---------- Einrichtung ---------- */
function MolotowSetup({ state, setState, onStart, theme, t }) {
  const mk = molTk(theme);
  const wt = { ...mk, gold: mk.acc, hues: mk.hues, pageBg: mk.bgSolid };
  const gtS = gtSkin(theme, wt, "molotow", { ink: mk.ink, acc: mk.acc, bg: mk.bgSolid, card: theme === "light" ? "#FFFCF6" : undefined });
  const players = state.players;
  const setPlayers = updater => setState(s => ({ ...s, players: typeof updater === "function" ? updater(s.players) : updater }));
  const rename = (idx, name) => setPlayers(ps => ps.map((p, i) => i === idx ? { ...p, name } : p));
  const addPlayer = () => setPlayers(ps => { const nextId = ps.length ? Math.max(...ps.map(p => p.id)) + 1 : 1; return [...ps, { id: nextId, name: t("defaultPlayerName")(ps.length + 1) }]; });
  const removePlayer = idx => setPlayers(ps => ps.filter((_, i) => i !== idx));
  const move = (idx, dir) => setPlayers(ps => { const nx = [...ps]; const tg = idx + dir; if (tg < 0 || tg >= nx.length) return ps; [nx[idx], nx[tg]] = [nx[tg], nx[idx]]; return nx; });
  const tooFew = players.length < 3;
  let sIdx = players.findIndex(p => p.id === state.startId); if (sIdx < 0) sIdx = 0;
  const sw = (key, on, label, hint) => <button type="button" role="switch" aria-checked={on} className="mo-sw" onClick={() => setState(s => ({ ...s, [key]: !s[key] }))}><span><b>{label}</b><small>{hint}</small></span><span className="mo-tg" aria-hidden="true" /></button>;
  return <div className="gt-ub-fill"><div className="gtL-split gtL-split-setup">
    <div className="gtL-col-main" style={{ gap: 8 }}>
      <GroupPicker getNames={() => players.map(p => p.name)} setNames={names => setPlayers(names.map((name, i) => ({ id: i + 1, name })))} t={t} tk={gtSkinTk(wt, gtS)} onStarter={nm => { const q = players.find(x => String(x.name || "").trim() === nm); if (q) setState(s => ({ ...s, startId: q.id })); }} />
      <GtPlayerList players={players} onRename={rename} onRemove={removePlayer} onAdd={addPlayer} skin={gtS} t={t} onMove={move} minPlayers={3} maxPlayers={6} hues={mk.hues} />
    </div>
    <div className="gtL-col-side" style={{ gap: 10 }}>
      <GtChips options={[4, 6, 8, 10, 12, 16]} value={state.roundCount} onChange={v => setState(s => ({ ...s, roundCount: molClampRounds(v) }))} skin={gtS} t={t} custom max={MOL_MAX_ROUNDS} label={t("molRoundsLbl") + " (" + MOL_MIN_ROUNDS + " " + t("molTo") + " " + MOL_MAX_ROUNDS + ")"} />
      {sw("tens", !!state.tens, t("molTens"), t("molTensHint"))}
      {sw("noWeis", !!state.noWeis, t("molNoWeis"), t("molNoWeisHint"))}
      <div><div className="mo-lbl">{t("molStarter")}</div><div className="mo-start" role="radiogroup" aria-label={t("molStarter")}>{players.map((p, i) => <button key={p.id} type="button" role="radio" aria-checked={i === sIdx} className={"mo-chip" + (i === sIdx ? " on" : "")} onClick={() => setState(s => ({ ...s, startId: p.id }))}>{p.name}</button>)}</div></div>
      <div className="mo-info">{t("molCardsInfo")(Math.max(players.length, 3))}</div>
      <GtStartBar onClick={onStart} disabled={tooFew} label={tooFew ? t("molNeedThree") : t("startGame")} skin={gtS} />
    </div>
  </div></div>;
}

/* ---------- Spielansicht ---------- */
function MolotowPlay({ state, setState, onBack, onHome, onEndGame, lang, theme }) {
  const t = useT(lang);
  const mk = molTk(theme);
  const st = molState(state);
  const { players, rounds, rc, cur, totals, anyDone, finished } = st;
  const hist = Array.isArray(state.hist) ? state.hist : [];
  const [editing, setEditing] = useState(null);
  const openRef = useRef(null);
  const [rulesOpen, setRulesOpen] = useState(false);
  const [podiumOpen, setPodiumOpen] = useState(false);
  const [confirmingEnd, setConfirmingEnd] = useState(false);
  const [confirmingSetup, setConfirmingSetup] = useState(false);
  const settled = finished && editing === null;
  const ranks = molRanks(players, totals);
  const minTot = anyDone ? Math.min(...players.map(p => totals[p.id])) : 0;
  const leaders = finished ? players.filter(p => totals[p.id] === minTot) : [];
  useGtRecord("molotow", settled, () => ({ participants: players.map(p => ({ name: p.name, score: totals[p.id] })), lowWins: true }));
  const celebration = useCelebration(settled);
  useEffect(() => { if (settled) setPodiumOpen(true); }, [settled]);
  const podiumRanked = settled ? rankedPodium(players, p => totals[p.id] || 0, true) : [];

  const mutate = (i, fn) => setState(s => {
    const len = Math.max(Array.isArray(s.rounds) ? s.rounds.length : 0, i + 1);
    const rs = Array.from({ length: len }, (_, k) => (s.rounds && s.rounds[k]) || null);
    const r0 = rs[i] || { trump: null, cells: {} };
    rs[i] = fn({ trump: r0.trump || null, cells: { ...(r0.cells || {}) } });
    return { ...s, rounds: rs };
  });
  const setCell = (i, pid, patch) => mutate(i, r => { const c = molCell(r, pid); r.cells[pid] = { ...c, ...patch }; return r; });
  const setTrump = (i, trump) => mutate(i, r => ({ ...r, trump }));
  const openEditor = i => { openRef.current = JSON.stringify(rounds[i] || null); setEditing(i); };
  const closeEditor = () => {
    const i = editing;
    if (i !== null) {
      const now = JSON.stringify(rounds[i] || null);
      if (now !== openRef.current) { let prev = null; try { prev = JSON.parse(openRef.current); } catch (e) { prev = null; } setState(s => ({ ...s, hist: [...(Array.isArray(s.hist) ? s.hist : []), { i, prev }].slice(-60) })); }
    }
    setEditing(null);
  };
  const undo = () => { globalThis.__gtUndoAt = Date.now(); setState(s => {
    const h = Array.isArray(s.hist) ? s.hist : [];
    if (!h.length) return { ...s, ended: false };
    const e = h[h.length - 1];
    const len = Math.max(Array.isArray(s.rounds) ? s.rounds.length : 0, e.i + 1);
    const rs = Array.from({ length: len }, (_, k) => (s.rounds && s.rounds[k]) || null);
    rs[e.i] = e.prev;
    return { ...s, rounds: rs, hist: h.slice(0, -1), ended: false };
  }); };
  const resetDone = () => setState(s => ({ ...s, rounds: [], hist: [], ended: false }));
  const toSetup = () => { if (!confirmingSetup) { setConfirmingSetup(true); setTimeout(() => setConfirmingSetup(false), 3000); return; } setState(s => ({ ...s, phase: "setup" })); setConfirmingSetup(false); };
  const endTap = () => { if (!confirmingEnd) { setConfirmingEnd(true); setTimeout(() => setConfirmingEnd(false), 3000); return; } setState(s => ({ ...s, ended: true })); setConfirmingEnd(false); };
  const undoable = hist.length > 0 || !!state.ended;
  const items = [
    undoable && { key: "undo", icon: "undo", label: t("mgUndo"), onClick: undo },
    anyDone && !finished && { key: "endscore", icon: "flag", label: t("wzEndScored"), onClick: endTap, confirming: confirmingEnd, confirmLabel: t("confirmAgain"), twoStep: true },
    finished && { key: "result", icon: "trophy", label: t("mgShowResult"), onClick: () => setPodiumOpen(true) },
    { key: "setup", icon: "users", label: t("molChangeSetup"), onClick: toSetup, confirming: confirmingSetup, confirmLabel: t("confirmAgain"), twoStep: true },
  ].filter(Boolean);
  const hk = { ...mk, mutedLight: mk.muted, gold: mk.acc, pageBg: mk.bgSolid, cardElevated: mk.card, bg: mk.bgSolid };
  const starter = cur >= 0 ? molStarter(players, state.startId, cur) : null;
  const curRound = cur >= 0 ? rounds[cur] : null;
  const partial = !!curRound && players.some(p => molCell(curRound, p.id).k !== null);
  const undoBtn = <button type="button" className="mo-ib" onClick={undo} disabled={!undoable} aria-label={t("mgUndo")} title={t("mgUndo")}><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M9 14 4 9l5-5" /><path d="M4 9h10.5a5.5 5.5 0 0 1 0 11H11" /></svg></button>;
  return <div className={"gtL-shellpage mo-root mo-land pl-page pl-head-compact" + (theme === "noir" ? " mo-noir" : "")} style={{ ...molShell(theme), paddingBottom: 14 }}>
    <style>{GLOBAL_STYLES}{SCHIEBER_PL_CSS}{MO_CSS}</style>
    {celebration}
    <PodiumOverlay gameId="molotow" gameLabel={t("gameMolotow")} open={podiumOpen} onClose={() => setPodiumOpen(false)} onRestart={resetDone} ranked={podiumRanked} tk={hk} t={t} theme={theme} />
    <GtCol accent={mk.acc} className="reveal-1 gtL-game mo-inner" style={{ maxWidth: 560, margin: "0 auto" }}>
      <RulesButton onClick={() => setRulesOpen(true)} onHome={onHome} onEndGame={onEndGame} moreItems={items} onMenuOpen={() => setEditing(null)} tokens={hk} />
      <GameHeader title={t("gameMolotow")} subtitle={t("molSubtitle")(rc)} onBack={onBack} backLabel={t("back")} tk={{ ...hk, ink: mk.muted }} accent={mk.acc} icon={<MolotowLogo theme={theme} />} />
      <div className="gtL-split gtL-e-fit mo-split">
        <div className="mo-main gtL-col-main">
          <MolBoard st={st} state={state} onOpen={openEditor} t={t} mk={mk} />
          <div className="mo-dock">
            {finished
              ? <Fragment>
                <div className="mo-win" aria-live="polite">{gtWinLine(t, "winnerWins", "winnersTie", leaders.map(q => q.name))}</div>
                <div className="mo-dk"><button type="button" className="mo-cta wide" data-gt-sound="1" onClick={() => setPodiumOpen(true)}>{t("wzShowPodium")}</button>{undoBtn}</div>
              </Fragment>
              : <Fragment>
                <div className="mo-dkinfo"><b>{t("molRoundOf")(cur + 1, rc)}</b>{starter && <span>{t("molBegins")(starter.name)}</span>}</div>
                <div className="mo-dk"><button type="button" className="mo-cta wide" data-gt-sound="1" onClick={() => openEditor(cur)}>{partial ? t("molContinue")(cur + 1) : t("molEnter")(cur + 1)}</button>{undoBtn}</div>
              </Fragment>}
          </div>
        </div>
        <div className="gtL-col-side">
          <div className="mo-rank">
            <h3>{t("molStand")}</h3>
            {[...players].sort((a, b) => totals[a.id] - totals[b.id]).map(p => <div key={p.id} className={"mo-rk-row" + (anyDone && totals[p.id] === minTot ? " lead" : "")}><span>{anyDone ? ranks[p.id] + "." : ""}</span><b title={p.name}>{p.name}</b><i>{molFmt(totals[p.id])}</i></div>)}
          </div>
        </div>
      </div>
    </GtCol>
    {editing !== null && <MolRoundSheet key={editing} idx={editing} st={st} state={state} setCell={setCell} setTrump={setTrump} onClose={closeEditor} t={t} theme={theme} />}
    <RulesSheet open={rulesOpen} onClose={() => setRulesOpen(false)} title={t("gameMolotow")} text={t("rulesMolotow")} tokens={hk} />
  </div>;
}

function MolotowGame({ state, setState, onBack, onHome, onEndGame, lang = "de", theme = "dark" }) {
  const t = useT(lang);
  const mk = molTk(theme);
  useEffect(() => {
    if (state.phase === "setup" && state.players.length < 3) setState(s => {
      if (s.phase !== "setup" || s.players.length >= 3) return s;
      const out = [...s.players];
      while (out.length < 3) { const id = out.length ? Math.max(...out.map(p => p.id)) + 1 : 1; out.push({ id, name: t("defaultPlayerName")(out.length + 1) }); }
      return { ...s, players: out };
    });
  }, [state.phase, state.players.length]);
  if (state.phase === "setup") {
    const startGame = () => setState(s => ({ ...s, phase: "play", rounds: [], hist: [], ended: false, startId: s.players.some(p => p.id === s.startId) ? s.startId : (s.players[0] ? s.players[0].id : 0), roundCount: molClampRounds(s.roundCount) }));
    return <div className={"gtL-shellpage mo-root" + (theme === "noir" ? " mo-noir" : "")} style={molShell(theme)}><style>{GLOBAL_STYLES}{MO_CSS}</style>
      <div className="gtL-page gtL-game" style={{ maxWidth: 380, margin: "0 auto", position: "relative", zIndex: 1 }}>
        <GtCol accent={mk.acc}>
          <GtUbStyle />
          <GameHeader title={t("gameMolotow")} subtitle={t("gtNewMatch")} onBack={onBack} backLabel={t("back")} tk={{ ...mk, ink: mk.muted }} accent={mk.acc} icon={<MolotowLogo theme={theme} />} onHome={onHome} rulesText={t("rulesMolotow")} />
          <div className="mo-fan" aria-hidden="true">{MOL_SUITS.map(s => <img key={s} src={MOL_SUIT_IMG[s]} alt="" draggable={false} />)}</div>
          <MolotowSetup state={state} setState={setState} onStart={startGame} theme={theme} t={t} />
        </GtCol>
      </div>
    </div>;
  }
  return <MolotowPlay state={state} setState={setState} onBack={onBack} onHome={onHome} onEndGame={onEndGame} lang={lang} theme={theme} />;
}
/*@gt-body-end*/
export { MolotowGame, MolotowPlay, MolotowSetup, MolBoard, MolRoundSheet, MolWeisPicker, DEFAULT_MOLOTOW, molCardsPer };
