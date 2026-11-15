// Modus «Plakat» für Werwolf und Mafia (Bausteine, nur im Plakat-Zweig benutzen).
// Eigene Datei, damit keine Abhängigkeit zu anderen Partyspielen entsteht.
import { PK, PK_GAME } from "../../themes/plakat.js";
import { pkOn } from "../../shared/plakat/kit.js";

const INK = PK.ink, CREAM = PK.cream, PAPER = PK.paper;
const F = PK.font;

// Token-Überschreibung: Akzente überall Schwarz, Flächen Papier, Linien Schwarz
function pkWolfTk(tk) {
  return {
    ...tk, pk: true, bg: CREAM, bg2: PK.cream2, card: PAPER, ink: INK, muted: INK, border: INK,
    blood: INK, moon: INK, forest: INK, gold: INK,
    btnFrom: INK, btnTo: INK, onAccent: CREAM,
  };
}
function pkPrim(extra) {
  return { outline: PK.border, outlineOffset: -2.5, borderRadius: 18, background: INK, color: CREAM, boxShadow: PK.shadowLg, fontFamily: F, fontWeight: 400, letterSpacing: ".02em", cursor: "pointer", ...(extra || {}) };
}
function pkGhost(extra) {
  return { outline: PK.border, outlineOffset: -2.5, borderRadius: 18, background: PAPER, color: INK, boxShadow: PK.shadow, fontFamily: F, fontWeight: 400, cursor: "pointer", ...(extra || {}) };
}

// CSS-Schicht, Klasse .pkw am Wurzelelement des Spiels
function pkWolfCss(game) {
  const bg = PK_GAME[game].bg;
  const on = pkOn(bg);
  return `
.pkw{--pkf:${F};--pk-bg:${bg}}
.pkw .gt-pass-bar i{background:rgba(20,20,20,.28);height:6px;border-radius:3px}
.pkw .gt-pass-bar i.on,.pkw .gt-pass-bar i.past{background:${INK}}
.pkw .gt-pass-label{color:${on};font-family:${F};font-weight:400;font-size:14px;letter-spacing:.08em}
.pkw .gt-pass-name{font-family:${F}!important;font-weight:400;color:${CREAM}!important;-webkit-text-stroke:.07em ${INK};paint-order:stroke fill;text-shadow:.05em .07em 0 ${INK}}
.pkw .gt-pass .gt-pass-wrap .gt-flip-face{outline:2.5px solid ${INK}!important;outline-offset:-2.5px!important;box-shadow:0 6px 0 ${INK}!important;background:${PAPER}!important;color:${INK}}
.pkw .gt-pass .gt-pass-wrap .gt-flip-front p{font-family:${F};font-weight:400;font-size:19px}
.pkw .gt-pass-note{color:${INK};font-weight:700;background:${PAPER};outline:2px solid ${INK};outline-offset:-2px;border-radius:14px;padding:6px 12px;box-shadow:0 3px 0 ${INK}}
.pkw .gt-pass .gt-pass-next{background:${INK};color:${CREAM};outline:2.5px solid ${INK};outline-offset:-2.5px;box-shadow:0 5px 0 ${INK};font-family:${F};font-weight:400;font-size:18px;position:relative;overflow:hidden;min-height:56px}
.pkw .gt-pass .gt-pass-next:active:not(:disabled){transform:translateY(3px);box-shadow:0 2px 0 ${INK}}
.pkw .gt-pass .gt-pass-next:disabled{background:${PK.cream2};color:${PK.muted};border-color:${PK.muted};box-shadow:0 3px 0 ${PK.muted}}
.pkw .gt-pass .gt-pass-next:not(:disabled)::after,.pkw .pk-prim::after{content:"";position:absolute;top:0;bottom:0;left:0;width:35%;background:linear-gradient(90deg,transparent,rgba(255,255,255,.32),transparent);animation:pk-shine 3.2s ease-in-out infinite;pointer-events:none}
.pkw .pk-prim{position:relative;overflow:hidden;background:${INK}!important;color:${CREAM}!important;outline:2.5px solid ${INK}!important;outline-offset:-2.5px!important;border-radius:18px!important;box-shadow:0 5px 0 ${INK}!important;font-family:${F}!important;font-weight:400!important;letter-spacing:.02em;min-height:48px}
.pkw .pk-prim:active,.pkw .pk-gh:active{transform:translateY(3px)!important;box-shadow:0 2px 0 ${INK}!important}
.pkw .pk-prim:disabled{background:${PK.cream2}!important;color:${PK.muted}!important;border-color:${PK.muted}!important;box-shadow:0 3px 0 ${PK.muted}!important}
.pkw .pk-prim:disabled::after{display:none}
.pkw .pk-gh{background:${PAPER}!important;color:${INK}!important;outline:2.5px solid ${INK}!important;outline-offset:-2.5px!important;border-radius:18px!important;box-shadow:0 4px 0 ${INK}!important;font-family:${F}!important;font-weight:400!important;min-height:44px}
.pkw .pk-gh:disabled{opacity:.6}
.pkw .pk-chip{outline:2.5px solid ${INK}!important;outline-offset:-2.5px!important;box-shadow:0 3px 0 ${INK};font-family:${F}!important;font-weight:400!important;font-size:15px!important}
.pkw .pk-chip div{font-family:${F}!important;font-weight:400!important}
.pkw .pk-chip:disabled{background:${PAPER}!important;opacity:.55}
.pkw .pk-chip:active{transform:translateY(2px);box-shadow:0 1px 0 ${INK}}
.pkw .pk-chip[aria-pressed="true"]{background:${bg}!important}
.pkw .gt-row{outline:2.5px solid ${INK}!important;outline-offset:-2.5px!important;box-shadow:0 4px 0 ${INK};background:${PAPER}!important;color:${INK}!important;font-family:${F}!important;font-weight:400!important;font-size:19px!important}
.pkw .gt-row:active{transform:translateY(2px);box-shadow:0 2px 0 ${INK}}
.pkw .gt-row:disabled{opacity:.5}
.pkw .gt-row[aria-pressed="true"]{background:${bg}!important}
.pkw .gt-row[aria-pressed="true"] *{color:${on}!important}
.pkw .pk-box,.pkw div[style*="border-radius: 24px"],.pkw div[style*="border-radius: 22px"]{background:${PAPER}!important;outline:2.5px solid ${INK}!important;outline-offset:-2.5px!important;box-shadow:0 4px 0 ${INK}!important;color:${INK}}
.pkw div[style*="border-radius: 26px"]{background:${PAPER}!important;outline:2.5px solid ${INK}!important;outline-offset:-2.5px!important;box-shadow:0 6px 0 ${INK}!important}
.pkw .h1l-ctr p,.pkw .h1l-pick p,.pkw .h1l-over p,.pkw .h1l-vote2 p,.pkw .h1l-plist p{background:${PAPER};color:${INK}!important;font-weight:700;outline:2px solid ${INK};outline-offset:-2px;border-radius:14px;padding:6px 12px;box-shadow:0 3px 0 ${INK}}
.pkw .pk-cap{background:${PAPER};color:${INK}!important;font-weight:700;outline:2px solid ${INK};outline-offset:-2px;border-radius:12px;padding:4px 10px;box-shadow:0 3px 0 ${INK}}
.pkw .pk-role .pk-cap,.pkw .pk-box .pk-cap{background:none;border:0;box-shadow:none;padding:0;border-radius:0}
.pkw .pk-big{font-family:${F}!important;font-weight:400!important;color:${CREAM}!important;-webkit-text-stroke:.07em ${INK};paint-order:stroke fill;text-shadow:.05em .07em 0 ${INK}}
.pkw [style*="Baloo 2"]{font-family:${F}!important;font-weight:400!important}
.pkw .pk-big-p{font-family:${F}!important;font-weight:400!important}
.pkw .pk-tog{background:rgba(20,20,20,.28)!important;outline:2px solid ${INK};outline-offset:-2px}
.pkw .pk-tog[data-on="1"]{background:${bg}!important}
.pkw .pk-tog>span{background:${PAPER}!important;outline:2px solid ${INK};outline-offset:-2px;box-sizing:border-box}
.pkw .pk-role{outline:2.5px solid ${INK}!important;outline-offset:-2.5px!important;box-shadow:0 4px 0 ${INK};background:${PAPER}!important}
.pkw .pk-role[aria-pressed="true"]{box-shadow:0 4px 0 ${INK},inset 0 0 0 4px ${bg}}
.pkw .pk-role:disabled{opacity:1;background:${PK.cream2}!important;box-shadow:0 3px 0 ${PK.muted};border-color:${PK.muted}!important}
.pkw .pk-role:disabled *{color:${PK.muted}!important}
.pkw .pk-role:active:not(:disabled){transform:translateY(2px);box-shadow:0 2px 0 ${INK}}
.pkw .pk-role div{font-family:${F};font-weight:400}
.pkw .pk-lab{color:${on}!important;font-family:${F}!important;font-weight:400!important;font-size:13px!important;letter-spacing:.08em!important}
.pkw .h1l-vote2 button.pk-prim,.pkw .h1l-vote2 button.pk-gh{font-size:16px!important}
.pkw .gt-wm{color:${CREAM}!important;font-size:clamp(34px,12vw,48px)!important;white-space:nowrap!important;word-break:keep-all!important}
.pkw button:focus-visible{outline:3px solid ${CREAM};outline-offset:2px}
@media (prefers-reduced-motion:reduce){.pkw .gt-pass .gt-pass-next::after,.pkw .pk-prim::after{animation:none}}
`;
}
export { pkWolfTk, pkPrim, pkGhost, pkWolfCss, pkOn, PK, PK_GAME };
