// Ryū-Modus (intern «plakat») nur für Impostor: «Fahndungsakte».
// Idee: Absperrband, Fingerabdruck-Scanner, Akten mit Stempel, Beweisanhänger als Timer, Verdächtigen-Zeilen mit Fadenkreuz.
// Reine Deko und Formen, keine neuen Texte. Gilt nur im Wurzelelement .pkp-imp (Ryū-Zweig).
import { PK } from "../../themes/plakat.js";

const INK = PK.ink, CREAM = PK.cream, PAPER = PK.paper, RED = "#E4312B", CREAM2 = PK.cream2 || "#EADDC2";
const F = PK.font;
const R = ".pkp-imp";

// Fingerabdruck als SVG (konzentrische, unterbrochene Ellipsen)
function fpSvg(stroke, sw) {
  let g = "";
  for (let i = 1; i <= 9; i++) {
    const rx = 6 + i * 6, ry = 8 + i * 7.6;
    const dash = (10 + i * 4) + " " + (2.5 + (i % 4) * 1.8);
    g += `<ellipse cx="60" cy="76" rx="${rx}" ry="${ry}" transform="rotate(${i * 9 - 20} 60 76)" stroke-dasharray="${dash}"/>`;
  }
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 152"><g fill="none" stroke="${stroke}" stroke-width="${sw}" stroke-linecap="round">${g}</g></svg>`;
  return `url("data:image/svg+xml;utf8,${encodeURIComponent(svg)}")`;
}
// Fadenkreuz
function crossSvg(stroke) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" fill="none" stroke="${stroke}" stroke-width="2.6" stroke-linecap="round"><circle cx="16" cy="16" r="9"/><path d="M16 2v8M16 22v8M2 16h8M22 16h8"/></svg>`;
  return `url("data:image/svg+xml;utf8,${encodeURIComponent(svg)}")`;
}

function pkImpCss() {
  const FP_INK = fpSvg("rgba(20,20,20,.5)", 2.2);
  const FP_BG = fpSvg("rgba(243,234,211,.17)", 2.6);
  const CROSS = crossSvg(INK);
  const css = `
/* Wasserzeichen: grosser Fingerabdruck, fest im Hintergrund */
${R}.gtL-shellpage::before{content:"";position:fixed;right:-70px;bottom:-40px;width:420px;height:530px;background:${FP_BG} center/contain no-repeat;transform:rotate(-14deg);pointer-events:none;z-index:0}
${R} .gtL-game{position:relative;z-index:1}

/* Absperrband unter dem Kopf */
${R} .imp-tape{height:15px;margin:2px -8px 12px;border-radius:3px;outline:2.5px solid ${INK};outline-offset:-2.5px;transform:rotate(-1.2deg);background:repeating-linear-gradient(-45deg,${INK} 0 13px,${CREAM} 13px 26px);box-shadow:0 3px 0 ${INK}}

/* Kleine Grossbuchstaben-Beschriftungen auf Rot: schwarzes Etikett */
html[data-gt-skin="plakat"] ${R} .gt-su-label,
${R} [style*="text-transform: uppercase"]:not(.gt-wm):not(.gt-wm-sub):not(:has(.gt-wm)){display:block;width:fit-content;background:${INK};color:${CREAM}!important;padding:4px 10px 3px;border-radius:6px;font-weight:700!important;letter-spacing:.1em!important;transform:rotate(-1.4deg);line-height:1.25}
${R} .g-cat>div[style*="text-transform: uppercase"],${R} .imp-res-cap,${R} .imp-c-civ [style*="text-transform: uppercase"]{margin-left:auto;margin-right:auto}
${R} .gt-su-label{font-family:'Inter',sans-serif;font-size:11px}
${R} .gt-pass-label{display:block;width:fit-content;background:${INK};color:${CREAM}!important;padding:5px 12px 4px;border-radius:6px;transform:rotate(-1.4deg)}

/* Weitergeben: Fingerabdruck-Scanner */
${R} .gt-pass .gt-pass-wrap .gt-flip-front{position:relative;overflow:hidden;background:${FP_INK} center 42%/auto 74% no-repeat,${PAPER}!important}
${R} .gt-pass .gt-flip-front::before{content:"";position:absolute;inset:14px;border-radius:14px;pointer-events:none;background:
 linear-gradient(${INK},${INK}) top left/26px 4px no-repeat,linear-gradient(${INK},${INK}) top left/4px 26px no-repeat,
 linear-gradient(${INK},${INK}) top right/26px 4px no-repeat,linear-gradient(${INK},${INK}) top right/4px 26px no-repeat,
 linear-gradient(${INK},${INK}) bottom left/26px 4px no-repeat,linear-gradient(${INK},${INK}) bottom left/4px 26px no-repeat,
 linear-gradient(${INK},${INK}) bottom right/26px 4px no-repeat,linear-gradient(${INK},${INK}) bottom right/4px 26px no-repeat}
${R} .gt-pass .gt-flip-front::after{content:"";position:absolute;left:12%;right:12%;top:16%;height:5px;border-radius:3px;background:${RED};box-shadow:0 0 0 2px ${INK};animation:imp-scan 2.1s ease-in-out infinite alternate;pointer-events:none}
${R} .gt-pass .gt-flip-front svg{position:relative;z-index:1;background:${PAPER};border-radius:50%;padding:13px;width:78px;height:78px;box-sizing:border-box;outline:2.5px solid ${INK};box-shadow:0 4px 0 ${INK}}
${R} .gt-pass .gt-flip-front p{position:relative;z-index:1;background:${PAPER};padding:7px 14px 6px;border-radius:10px;outline:2.5px solid ${INK};outline-offset:-2.5px;box-shadow:0 3px 0 ${INK};transform:rotate(-1.5deg)}
@keyframes imp-scan{from{top:16%}to{top:76%}}
${R} .gt-pass .gt-flip-back{background:repeating-linear-gradient(45deg,rgba(20,20,20,.07) 0 9px,transparent 9px 18px),${CREAM}!important}
${R} .gt-pass-note{flex:none;display:inline-block;background:${PAPER};padding:6px 12px;border-radius:10px;outline:2px solid ${INK};outline-offset:-2px;font-weight:600}
${R} .gt-pass-name{font-size:min(var(--gt-p-fs),58px)}

/* Akten */
${R} .impostor-file{transform:rotate(-1.4deg);padding-top:46px!important;padding-bottom:34px!important;border-radius:20px!important}
${R} .impostor-file .impostor-stamp{background:${INK};color:${CREAM}!important;border:0!important;border-radius:6px;padding:4px 9px 3px;font-size:11px!important;letter-spacing:.12em;top:14px;right:14px;transform:rotate(8deg);box-shadow:0 0 0 2px ${PAPER},0 0 0 4.5px ${INK}}
${R} .impostor-file::after{content:"";position:absolute;left:0;right:0;bottom:0;height:20px;border-top:2.5px solid ${INK};z-index:1;pointer-events:none}
${R} .imp-c-civ::after{background:repeating-linear-gradient(-45deg,${INK} 0 11px,${PAPER} 11px 22px)}
${R} .imp-c-civ [style*="text-transform: uppercase"]{display:flex!important;align-items:center;gap:6px;justify-content:center}
${R} .imp-c-civ [style*="text-transform: uppercase"] svg{filter:invert(1)}
${R} .imp-c-civ>div:nth-child(3){color:${INK}!important;text-decoration:underline;text-decoration-color:${RED};text-decoration-thickness:.13em;text-underline-offset:.16em;text-decoration-skip-ink:none;margin-top:14px!important}
${R} .impostor-file.imp-c-imp{background:${INK}!important;outline-color:${INK}!important}
${R} .imp-c-imp,${R} .imp-c-imp *{color:${CREAM}!important}
${R} .imp-c-imp svg{filter:invert(1)}
${R} .imp-c-imp>div:nth-child(2) svg{width:44px;height:44px}${R} .imp-c-imp>div:nth-child(4){margin-top:6px!important;font-size:13px!important}
${R} .imp-c-imp::after{background:repeating-linear-gradient(-45deg,${RED} 0 11px,${INK} 11px 22px);border-top-color:${CREAM}}
${R} .imp-c-imp .impostor-stamp{background:${CREAM};color:${INK}!important;box-shadow:0 0 0 2px ${INK},0 0 0 4.5px ${CREAM}}
${R} .imp-c-imp>div:nth-child(3){font-size:34px!important;margin-top:4px}
${R} .impostor-file.imp-c-mw{background:${CREAM2}!important;outline:2.5px dashed ${INK}!important}
${R} .imp-c-mw::after{background:repeating-linear-gradient(-45deg,${INK} 0 11px,${CREAM2} 11px 22px)}
${R} .imp-c-mw>div:nth-child(3){color:${INK}!important}

/* Diskussion: Beweisanhänger als Timer */
${R} .g-cat>div:nth-child(2){display:flex!important;width:fit-content;margin-left:auto!important;margin-right:auto!important;align-items:center;gap:8px;background:${PAPER};padding:7px 16px 6px;border-radius:12px;outline:2.5px solid ${INK};outline-offset:-2.5px;box-shadow:0 4px 0 ${INK};transform:rotate(-1.6deg);margin-top:10px!important}
${R} .h1l-vote .g-cat>div:nth-child(2){display:block!important;background:none;outline:0;box-shadow:none;padding:0;transform:none;margin-top:8px!important}
${R} .g-timer{position:relative;padding-top:38px!important;margin-top:14px;transform:rotate(-.9deg)}
${R} .g-timer::before{content:"";position:absolute;top:11px;left:50%;width:20px;height:20px;margin-left:-10px;border-radius:50%;background:${RED};outline:2.5px solid ${INK};outline-offset:-2.5px;box-shadow:inset 0 2px 0 rgba(0,0,0,.25)}
${R} .g-timer::after{content:"";position:absolute;top:-18px;left:50%;width:0;height:30px;border-left:2.5px solid ${INK};transform:rotate(14deg);transform-origin:bottom}
${R} .g-timer .gt-ring-num,${R} .g-timer [style*="tabular-nums"]{color:${INK}}

/* Hinweisreihenfolge: Startnummern */
${R} [data-pk-rowc]{gap:12px!important;padding:6px 12px 6px 7px!important}
${R} [data-pk-rowc]:nth-child(odd){transform:rotate(-.7deg)}
${R} [data-pk-rowc]:nth-child(even){transform:rotate(.7deg)}
${R} [data-pk-rowc]>span:first-child{width:32px!important;height:32px;flex:0 0 32px;display:grid;place-items:center;background:${INK};color:${CREAM}!important;border-radius:9px;font-size:16px!important}
${R} [data-pk-rowc]>span:last-child{font-family:${F};font-weight:400!important;font-size:19px!important}

/* Hinweiszeilen auf Rot: Notizzettel */
${R} .g-hint{display:block;background:${PAPER};padding:9px 14px!important;border-radius:12px;outline:2px dashed ${INK};outline-offset:-2px;font-size:12.5px!important;font-weight:600;color:${INK}!important;line-height:1.4}
${R} .h1l-vote .g-cat>div:nth-child(3){display:inline-block;background:${PAPER};color:${INK}!important;padding:3px 12px;border-radius:99px;outline:2px solid ${INK};outline-offset:-2px;margin-top:8px!important;font-weight:600}

/* Abstimmung: Verdächtigen-Karten mit Fadenkreuz */
${R} .g-list .gt-row{background:${PAPER} ${CROSS} no-repeat right 14px center/28px!important;padding-right:56px!important;text-align:left}
${R} .g-list .gt-row:nth-child(odd){transform:rotate(-.5deg)}
${R} .g-list .gt-row:nth-child(even){transform:rotate(.5deg)}
${R} .g-list .gt-row:active{background-color:${INK}!important;color:${CREAM}!important}
${R} .g-list.h1l-ctr>div:nth-child(2){display:inline-block;background:${INK};color:${CREAM}!important;padding:4px 12px 3px;border-radius:6px;transform:rotate(-1.4deg);font-weight:700}
${R} .g-list.h1l-ctr>div:nth-child(3){background:${PAPER};padding:6px 20px 3px;border-radius:14px;outline:2.5px solid ${INK};outline-offset:-2.5px;box-shadow:0 5px 0 ${INK};transform:rotate(1.4deg)}

/* Ergebnis: Plakat mit Siegel */
${R} .imp-res-ico{display:grid;place-items:center;width:92px;height:92px;border-radius:50%;background:${PAPER};outline:2.5px solid ${INK};outline-offset:-2.5px;box-shadow:0 6px 0 ${INK};transform:rotate(-4deg);position:relative}
${R} .imp-res-ico::after{content:"";position:absolute;inset:7px;border-radius:50%;border:2px dashed ${INK};pointer-events:none}
${R} .imp-res-title{display:inline-block;background:${INK};color:${CREAM}!important;padding:12px 20px 8px;border-radius:14px;outline:3px solid ${INK};outline-offset:3px;box-shadow:0 0 0 3px ${CREAM};transform:rotate(-2deg);font-size:clamp(24px,8vw,32px)!important;line-height:1.1;max-width:100%;box-sizing:border-box;margin:8px 0}
${R} .imp-res-note{background:${PAPER};padding:9px 14px;border-radius:12px;outline:2px solid ${INK};outline-offset:-2px;color:${INK}!important;font-weight:600;line-height:1.4;font-size:13px!important;margin:0}
${R} .imp-res .imp-res-note:first-child{display:inline-block}
${R} .imp-res-box{background:${PAPER}!important;outline:2.5px solid ${INK}!important;outline-offset:-2.5px!important;border:0!important;box-shadow:0 5px 0 ${INK};border-radius:6px!important;color:${INK}!important;font-weight:600;font-size:13px!important;line-height:1.7;padding:14px 18px!important;position:relative;transform:rotate(1deg)}
${R} .imp-res-box strong{display:block;font-family:${F};font-weight:400;font-size:28px;line-height:1.1;margin:2px 0 4px;color:${INK};text-decoration:underline;text-decoration-color:${RED};text-decoration-thickness:.12em;text-underline-offset:.15em;text-decoration-skip-ink:none}
${R} .imp-res-box::before{content:"";position:absolute;top:-9px;left:50%;width:64px;height:18px;margin-left:-32px;background:${INK};opacity:.9;transform:rotate(-2deg)}

/* Reduced motion */
@media (prefers-reduced-motion:reduce){${R} .gt-pass .gt-flip-front::after{animation:none;top:46%}}
@media (max-width:359px){${R} .imp-res-title{padding:10px 14px 6px}}
@media (max-height:620px){${R} .impostor-file{padding-top:40px!important;padding-bottom:30px!important}${R} .impostor-file .impostor-stamp{top:8px;right:8px;font-size:9.5px!important}${R} .imp-tape{margin-bottom:6px}${R} .gt-pass .gt-flip-front svg{width:60px;height:60px;padding:10px}}
`;
  return css;
}
export { pkImpCss, fpSvg, crossSvg };
