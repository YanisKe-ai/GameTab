// Modus «Plakat» für die Partyspiele Impostor, Verräter und Am ehesten (gemeinsame Bausteine).
// Nur im Plakat-Zweig verwenden. Keine Änderung an anderen Spielen.
import { PK, PK_GAME } from "../../themes/plakat.js";
import { pkOn } from "../../shared/plakat/kit.js";

const INK = PK.ink, CREAM = PK.cream, PAPER = PK.paper;
const F = PK.font;

// Token-Überschreibung: Akzent überall Schwarz, Flächen Papier, Text Schwarz, Linien Schwarz
function pkPartyTk(tk) {
  return {
    ...tk, pk: true, bg: CREAM, bg2: PK.cream2, card: PAPER, ink: INK, muted: INK, border: INK,
    red: INK, teal: INK, gold: INK, purple: INK, pink: INK,
    btnFrom: INK, btnTo: INK, dangerFrom: INK, dangerTo: INK, tealFrom: INK, tealTo: INK,
    onAccent: CREAM, onTeal: CREAM, onDanger: CREAM,
  };
}
// Hauptknopf (Schwarz, Creme-Schrift, harter Schatten)
function pkPrim(extra) {
  return { border: PK.border, borderRadius: 18, background: INK, color: CREAM, boxShadow: PK.shadowLg, fontFamily: F, fontWeight: 400, letterSpacing: ".02em", cursor: "pointer", ...(extra || {}) };
}
// Zweitknopf (Papier, schwarzer Rand)
function pkGhost(extra) {
  return { border: PK.border, borderRadius: 18, background: PAPER, color: INK, boxShadow: PK.shadow, fontFamily: F, fontWeight: 400, cursor: "pointer", ...(extra || {}) };
}
// Karte (Papier, schwarzer Rand, harter Schatten)
function pkBox(extra) {
  return { background: PAPER, border: PK.border, borderRadius: 22, boxShadow: PK.shadow, color: INK, ...(extra || {}) };
}

// Gemeinsame CSS-Schicht (Klasse .pkp am Wurzelelement des Spiels)
function pkPartyCss(game, sel) {
  const bg = PK_GAME[game].bg;
  const css = `
.pkp{--pkf:${F};--pk-bg:${bg}}
.pkp .gt-pass-bar i{background:rgba(20,20,20,.28);height:6px;border-radius:3px}
.pkp .gt-pass-bar i.on{background:${INK}}
.pkp .gt-pass-bar i.past{background:${INK}}
.pkp .gt-pass-label{color:${INK};font-family:${F};font-weight:400;font-size:14px;letter-spacing:.08em}
.pkp .gt-pass-name{font-family:${F}!important;font-weight:400;color:${CREAM}!important;-webkit-text-stroke:.07em ${INK};paint-order:stroke fill;text-shadow:.05em .07em 0 ${INK}}
.pkp .gt-pass .gt-pass-wrap .gt-flip-face{border:2.5px solid ${INK}!important;box-shadow:0 6px 0 ${INK}!important;background:${PAPER}!important;color:${INK}}
.pkp .gt-pass .gt-pass-wrap .gt-flip-front p{font-family:${F};font-weight:400;font-size:19px}
.pkp .gt-pass-note{color:${INK};font-weight:600}
.pkp .gt-pass .gt-pass-next{background:${INK};color:${CREAM};border:2.5px solid ${INK};box-shadow:0 5px 0 ${INK};font-family:${F};font-weight:400;font-size:18px;position:relative;overflow:hidden;min-height:56px}
.pkp .gt-pass .gt-pass-next:active:not(:disabled){transform:translateY(3px);box-shadow:0 2px 0 ${INK}}
.pkp .gt-pass .gt-pass-next:disabled{background:${PK.cream2};color:${PK.muted};border-color:${PK.muted};box-shadow:0 3px 0 ${PK.muted}}
.pkp .gt-pass .gt-pass-next:not(:disabled)::after{content:"";position:absolute;top:0;bottom:0;left:0;width:35%;background:linear-gradient(90deg,transparent,rgba(255,255,255,.32),transparent);animation:pk-shine 3.2s ease-in-out infinite;pointer-events:none}
.pkp .pk-prim{position:relative;overflow:hidden}
.pkp .pk-prim::after{content:"";position:absolute;top:0;bottom:0;left:0;width:35%;background:linear-gradient(90deg,transparent,rgba(255,255,255,.32),transparent);animation:pk-shine 3.2s ease-in-out infinite;pointer-events:none}
.pkp .pk-prim:active,.pkp .pk-gh:active{transform:translateY(3px)!important;box-shadow:0 2px 0 ${INK}!important}
.pkp .pk-prim:disabled{background:${PK.cream2}!important;color:${PK.muted}!important;border-color:${PK.muted}!important;box-shadow:0 3px 0 ${PK.muted}!important}
.pkp .pk-prim:disabled::after{display:none}
.pkp .pk-rowb{font-family:${F};font-weight:400!important;font-size:18px!important;box-shadow:0 4px 0 ${INK}}
.pkp .pk-rowb:active{transform:translateY(2px);box-shadow:0 2px 0 ${INK}}
.pkp [style*="Space Grotesk"]{font-family:${F}!important;font-weight:400!important}
.pkp .pk-prim{background:${INK}!important;color:${CREAM}!important;border:2.5px solid ${INK}!important;border-radius:18px!important;box-shadow:0 5px 0 ${INK}!important;font-family:${F}!important;font-weight:400!important;letter-spacing:.02em}
.pkp .pk-gh{background:${PAPER}!important;color:${INK}!important;border:2.5px solid ${INK}!important;border-radius:18px!important;box-shadow:0 4px 0 ${INK}!important;font-family:${F}!important;font-weight:400!important}
.pkp .pk-gh:disabled{opacity:.6}
.pkp .pk-chip{border:2.5px solid ${INK}!important;box-shadow:0 3px 0 ${INK};font-family:${F}!important;font-weight:400!important;font-size:15px!important}
.pkp .pk-chip:disabled{background:${PAPER}!important;opacity:.55}
.pkp .h1l-ctr div[style*="border-radius: 22px"]{border:2.5px solid ${INK}!important;box-shadow:0 4px 0 ${INK}}
.pkp .pk-chip:active{transform:translateY(2px);box-shadow:0 1px 0 ${INK}}
.pkp [data-pk-rowc]{border:2.5px solid ${INK}!important;box-shadow:0 3px 0 ${INK};border-radius:16px!important}
.pkp .g-timer{background:${PAPER}!important;border:2.5px solid ${INK}!important;box-shadow:0 5px 0 ${INK};border-radius:24px!important}
.pkp .gt-row{border:2.5px solid ${INK}!important;box-shadow:0 4px 0 ${INK};background:${PAPER}!important;font-family:${F}!important;font-weight:400!important;font-size:19px!important}
.pkp .gt-row:active{transform:translateY(2px);box-shadow:0 2px 0 ${INK}}
.pkp .pk-in{border:2.5px solid ${INK}!important;background:${PAPER}!important;color:${INK}!important;box-shadow:0 3px 0 ${INK};font-weight:600}
.pkp .impostor-file{background:${PAPER}!important;border:2.5px solid ${INK}!important;box-shadow:0 6px 0 ${INK}!important}
.pkp .impostor-stamp{color:${INK}!important;border-color:${INK}!important;font-family:${F}!important;font-weight:400!important;border-width:2.5px}
.pkp div[style*="border-radius: 24px"],.pkp div[style*="border-radius: 22px"],.pkp div[style*="border-radius: 20px"][style*="padding: 12px 14px"]{background:${PAPER}!important;border:2.5px solid ${INK}!important;box-shadow:0 4px 0 ${INK}!important}
.pkp li[style*="border-radius: 14px"]{border:2px solid ${INK}!important;box-shadow:0 2px 0 ${INK}}
.pkp div[style*="border-radius: 26px"]{background:${PAPER}!important;border:2.5px solid ${INK}!important;box-shadow:0 6px 0 ${INK}!important}
.pkp .gt-row[aria-pressed="true"]{background:${bg}!important}
.pkp .gt-row[aria-pressed="true"] *{color:${INK}!important}
.pkp .ml-card{background:${PAPER}!important;border:2.5px solid ${INK}!important;box-shadow:0 6px 0 ${INK}}
.pkp .ml-card>div{font-family:${F}!important;font-weight:400!important}
.pkp .ml-pick>button{border:2.5px solid ${INK}!important;box-shadow:0 4px 0 ${INK};font-family:${F}!important;font-weight:400!important;font-size:19px!important}
.pkp .ml-pick>button:active{transform:translateY(2px);box-shadow:0 2px 0 ${INK}}
.pkp .ml-skip{background:${PAPER}!important;border:2.5px solid ${INK}!important;box-shadow:0 4px 0 ${INK}!important;font-family:${F}!important;font-weight:400!important}
.pkp .ml-row{border:2px solid ${INK}!important;box-shadow:0 3px 0 ${INK}!important}
.pkp .ml-row span{font-family:${F}!important;font-weight:400!important}
.pkp [data-ml-result-panel]{background:${CREAM}!important;border:2.5px solid ${INK}!important;box-shadow:0 6px 0 ${INK}}
.pkp [data-ml-result-panel] div[style*="border-radius: 20px"]{background:${PAPER}!important;border:2.5px solid ${INK}!important}
.pkp .gt-su-num{background:${INK}!important;color:${CREAM}!important}
.pkp .h1l-plist{padding-top:10px}
.pkp .gt-wm{color:${CREAM}!important;font-size:clamp(34px,12vw,48px)!important;white-space:nowrap!important;word-break:keep-all!important}
.pkp button:focus-visible{outline:3px solid ${CREAM};outline-offset:2px}
@media (prefers-reduced-motion:reduce){.pkp .gt-pass .gt-pass-next::after,.pkp .pk-prim::after{animation:none}}
`;
  if (!sel) return css;
  return css.replace(/\.pkp/g, sel) + `${sel}{background:radial-gradient(rgba(20,20,20,.10) 1.2px,transparent 1.4px) 0 0/14px 14px,${bg}!important}`;
}
export { pkPartyTk, pkPrim, pkGhost, pkBox, pkPartyCss, pkOn, PK, PK_GAME };
