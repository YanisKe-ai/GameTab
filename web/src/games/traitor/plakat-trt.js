// Ryū-Modus (intern «plakat») nur für Verräter: «Geheimbund».
// Idee: Wachssiegel und versiegelter Umschlag, Dolch-Trenner, Nacht als schwarze Tafel mit Sternen, Dekret-Rolle als Timer,
// Stimmzettel mit schwarzem Rand, Rollenkarten (Verräter schwarz mit Dolch, Getreue Papier mit rotem Siegel).
// Reine Deko, keine neuen Texte. Gilt nur im Ryū-Zweig (Wurzel .trt-pk).
import { PK } from "../../themes/plakat.js";

const INK = PK.ink, CREAM = PK.cream, PAPER = PK.paper, RED = "#E4312B", CREAM2 = PK.cream2 || "#EADDC2";
const F = PK.font;
const R = ".gtL-shellpage:has(.trt-pk)";

const uri = svg => `url("data:image/svg+xml;utf8,${encodeURIComponent(svg)}")`;
// Dolch (Spitze oben)
function dagger(fill) {
  return `<g fill="${fill}"><path d="M50 2 L60 62 L40 62 Z"/><rect x="26" y="62" width="48" height="8" rx="4"/><rect x="45" y="70" width="10" height="24" rx="3"/><circle cx="50" cy="98" r="6"/></g>`;
}
function crossedDaggers(fill) {
  return uri(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 160"><g transform="translate(80 80) rotate(38) translate(-50 -52)">${dagger(fill)}</g><g transform="translate(80 80) rotate(-38) translate(-50 -52)">${dagger(fill)}</g></svg>`);
}
function oneDagger(fill) {
  return uri(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 104">${dagger(fill)}</svg>`);
}
// Wachssiegel: gewellter Rand, Innenring
function sealPath(cx, cy, r0, amp, n) {
  let d = "";
  for (let i = 0; i <= 72; i++) {
    const a = (i / 72) * Math.PI * 2, r = r0 + amp * Math.sin(a * n);
    d += (i ? "L" : "M") + (cx + r * Math.cos(a)).toFixed(1) + " " + (cy + r * Math.sin(a)).toFixed(1);
  }
  return d + "Z";
}
function seal(fill, ring) {
  return uri(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><path d="${sealPath(50, 50, 40, 4.2, 12)}" fill="${fill}" stroke="${INK}" stroke-width="3" stroke-linejoin="round"/><circle cx="50" cy="50" r="30" fill="none" stroke="${ring}" stroke-width="2.5"/></svg>`);
}

function pkTrtCss() {
  const WM = crossedDaggers("rgba(243,234,211,.15)");
  const SEAL = seal(RED, "rgba(20,20,20,.45)");
  const SEAL_INK = seal(INK, "rgba(243,234,211,.55)");
  const DAG_CREAM = oneDagger("rgba(243,234,211,.16)");
  const ring = (inner) => `radial-gradient(circle,${inner} 0 6px,transparent 6px 8.5px,${INK} 8.5px 11px,transparent 11.5px) no-repeat right 14px center/26px 26px`;
  const css = `
/* Wasserzeichen: gekreuzte Dolche */
${R}::before{content:"";position:fixed;right:-60px;bottom:-30px;width:400px;height:400px;background:${WM} center/contain no-repeat;pointer-events:none;z-index:0;transform:rotate(-8deg)}
${R} .h1l-root{position:relative;z-index:1}

/* Trenner: Linie mit Raute */
${R} .trt-rule{position:relative;height:20px;margin:0 0 12px}
${R} .trt-rule::before{content:"";position:absolute;left:0;right:0;top:50%;border-top:2.5px solid ${INK};box-shadow:0 5px 0 ${INK};margin-top:-4px}
${R} .trt-rule::after{content:"";position:absolute;left:50%;top:50%;width:16px;height:16px;margin:-8px 0 0 -8px;background:${INK};transform:rotate(45deg);box-shadow:0 0 0 5px #E4312B,0 0 0 7.5px ${INK}}

/* Kleine Grossbuchstaben auf Rot: schwarzes Etikett */
html[data-gt-skin="plakat"] ${R} .gt-su-label,
${R} [style*="text-transform: uppercase"]:not(.gt-wm):not(.gt-wm-sub):not(:has(.gt-wm)){display:block;width:fit-content;background:${INK};color:${CREAM}!important;padding:4px 10px 3px;border-radius:6px;font-weight:700!important;letter-spacing:.1em!important;transform:rotate(-1.4deg);line-height:1.25}
${R} .h1l-ctr [style*="text-transform: uppercase"],${R} .trt-morning-panel [style*="text-transform: uppercase"]{margin-left:auto;margin-right:auto}
${R} .gt-su-label{font-family:'Inter',sans-serif;font-size:11px}
${R} .gt-pass-label{display:block;width:fit-content;background:${INK};color:${CREAM}!important;padding:5px 12px 4px;border-radius:6px;transform:rotate(-1.4deg)}
${R} .gt-pass-note{flex:none;display:inline-block;background:${PAPER};padding:6px 12px;border-radius:10px;outline:2px solid ${INK};outline-offset:-2px;font-weight:600}
${R} .gt-pass-name{font-size:min(var(--gt-p-fs),58px)}

/* Weitergeben: versiegelter Umschlag */
${R} .gt-pass .gt-pass-wrap .gt-flip-front{position:relative;overflow:hidden;
 background:linear-gradient(to bottom right,transparent calc(50% - 1.5px),${INK} calc(50% - 1.5px) calc(50% + 1.5px),transparent calc(50% + 1.5px)) top left/50% 50% no-repeat,
 linear-gradient(to bottom left,transparent calc(50% - 1.5px),${INK} calc(50% - 1.5px) calc(50% + 1.5px),transparent calc(50% + 1.5px)) top right/50% 50% no-repeat,${PAPER}!important}
${R} .gt-pass .gt-flip-front::before{content:"";position:absolute;left:50%;top:50%;width:112px;height:112px;margin:-56px 0 0 -56px;background:${SEAL} center/contain no-repeat;filter:drop-shadow(0 4px 0 ${INK});transform:rotate(-8deg);animation:trt-seal 2.6s ease-in-out infinite alternate}
${R} .gt-pass .gt-flip-front svg{position:absolute;left:50%;top:50%;width:54px!important;height:54px!important;margin:-27px 0 0 -27px;z-index:1}
${R} .gt-pass .gt-flip-front p{position:absolute;left:50%;bottom:16px;transform:translateX(-50%) rotate(-1.2deg);width:max-content;max-width:88%;background:${PAPER};padding:7px 14px 6px;border-radius:10px;outline:2.5px solid ${INK};outline-offset:-2.5px;box-shadow:0 3px 0 ${INK};z-index:1}
@keyframes trt-seal{from{transform:rotate(-8deg) scale(1)}to{transform:rotate(-4deg) scale(1.05)}}
${R} .gt-pass .gt-flip-back{background:repeating-linear-gradient(45deg,rgba(20,20,20,.07) 0 9px,transparent 9px 18px),${CREAM}!important}

/* Rollenkarten */
${R} .trt-card{position:relative;overflow:hidden;border-radius:20px;outline:2.5px solid ${INK};outline-offset:-2.5px;box-shadow:0 5px 0 ${INK};transform:rotate(-1.2deg);min-height:200px!important;padding:26px 18px!important}
${R} .trt-card>*{position:relative;z-index:1}
${R} .trt-card>div:nth-child(2){font-family:${F};font-weight:400!important;font-size:34px!important;letter-spacing:.01em!important;color:${INK}}
${R} .trt-card>div:nth-child(3){font-size:13.5px!important;font-weight:500;color:${INK}!important}
${R} .trt-f{background:${PAPER}}
${R} .trt-f::before{content:"";position:absolute;right:8px;top:8px;width:58px;height:58px;background:${SEAL} center/contain no-repeat;transform:rotate(12deg);z-index:0}
${R} .trt-t{background:${INK};box-shadow:0 5px 0 ${INK},inset 0 0 0 6px ${INK},inset 0 0 0 8px rgba(243,234,211,.55)}
${R} .trt-t::before{content:"";position:absolute;right:-8px;top:-6px;bottom:-6px;width:96px;background:${DAG_CREAM} center/contain no-repeat;transform:rotate(18deg);z-index:0}
${R} .trt-t,${R} .trt-t *{color:${CREAM}!important}
${R} .trt-t svg{filter:invert(1)}
${R} .trt-t>div:nth-child(2){color:${CREAM}!important}
${R} .trt-card svg{width:46px;height:46px}
${R} .gt-pass .gt-flip-back .trt-card,${R} .trt-banish-card .trt-card{width:100%;box-sizing:border-box}
${R} .reveal-1.trt-banish-card{margin-bottom:14px;background:none!important;outline:0!important;box-shadow:none!important;border:0!important}

/* Nacht: schwarze Tafel mit Sternen */
${R} .trt-night-panel{position:relative;width:100%;box-sizing:border-box;display:flex;flex-direction:column;align-items:center;gap:14px;padding:34px 22px 28px;border-radius:26px;background:
 radial-gradient(circle,${CREAM} 0 1.6px,transparent 2px) 14% 18%/90px 80px,radial-gradient(circle,${CREAM} 0 1.2px,transparent 1.6px) 61% 36%/70px 90px,radial-gradient(circle,${CREAM} 0 2.2px,transparent 2.6px) 83% 12%/140px 120px,${INK};
 box-shadow:0 0 0 3px ${CREAM},0 8px 0 3px ${INK};color:${CREAM}}
${R} .trt-night-panel *{color:${CREAM}!important}
${R} .trt-night-panel svg{filter:invert(1);width:60px;height:60px}
${R} .trt-night-panel .reveal-2{font-family:${F};font-weight:400!important;font-size:36px!important}

/* Morgen: Zeitungsblatt mit Sonnenstrahlen */
${R} .trt-morning-panel{position:relative;width:100%;box-sizing:border-box;display:flex;flex-direction:column;align-items:center;gap:12px;padding:30px 20px 26px;border-radius:26px;outline:2.5px solid ${INK};outline-offset:-2.5px;box-shadow:0 6px 0 ${INK};transform:rotate(-1deg);
 background:repeating-conic-gradient(from 0deg at 50% 24%,${CREAM} 0 7.5deg,${PAPER} 7.5deg 15deg)}
${R} .trt-morning-panel .reveal-1{display:grid;place-items:center;width:84px;height:84px;border-radius:50%;background:${PAPER};outline:2.5px solid ${INK};outline-offset:-2.5px;box-shadow:0 5px 0 ${INK}}
${R} .trt-morning-panel .reveal-3:nth-of-type(3){font-family:${F};font-weight:400!important;font-size:27px!important;line-height:1.15;color:${INK}!important}
${R} .trt-morning-panel *{color:${INK}!important}
${R} .trt-morning-panel [style*="text-transform: uppercase"]{color:${CREAM}!important}

/* Tag: Dekret-Rolle als Timer */
${R} .trt-timer{position:relative;border-radius:6px!important;border-top:18px solid ${INK}!important;border-bottom:18px solid ${INK}!important;border-left:0!important;border-right:0!important;outline:0!important;box-shadow:0 6px 0 ${INK}!important;background:${PAPER}!important;margin:26px 0 30px;transform:rotate(.6deg)}
${R} .trt-timer::before,${R} .trt-timer::after{content:"";position:absolute;left:-3px;right:-3px;height:11px;border-radius:6px;background:${INK};box-shadow:0 0 0 2.5px ${CREAM}}
${R} .trt-timer::before{top:-24px}
${R} .trt-timer::after{bottom:-24px}

/* Stimmzettel */
${R} .gt-row{border-left:16px solid ${INK}!important;border-radius:10px!important;background:${PAPER} ${ring("transparent")}!important;padding-right:52px!important}
${R} .gt-row:nth-child(odd){transform:rotate(-.5deg)}
${R} .gt-row:nth-child(even){transform:rotate(.5deg)}
${R} .gt-row[aria-pressed="true"]{background:${CREAM} ${ring(INK)}!important}
${R} .gt-row:active{background-color:${INK}!important}
${R} .trt-pk [style*="font-size: 11px"][style*="text-align"]{margin-left:auto;margin-right:auto}

/* Hinweiszeilen auf Rot */
${R} .h1l-ctr>p,${R} .h1l-root p[style*="font-size: 11px"],${R} .h1l-root p[style*="font-size: 12px"],${R} .h1l-root p[style*="font-size: 13px"]{background:${PAPER};padding:9px 14px;border-radius:12px;outline:2px dashed ${INK};outline-offset:-2px;color:${INK}!important;font-weight:600;line-height:1.45;font-size:12.5px!important}
${R} .trt-night-panel p,${R} .trt-morning-panel p{background:none!important;outline:0!important;padding:0!important}
${R} .trt-night-panel p{color:${CREAM}!important;font-size:14px!important;font-weight:500}

/* Ende */
${R} .g-icon{display:grid;place-items:center;width:92px;height:92px;border-radius:50%;background:${PAPER};outline:2.5px solid ${INK};outline-offset:-2.5px;box-shadow:0 6px 0 ${INK};transform:rotate(-4deg)}
${R} .g-title{display:inline-block;background:${INK};color:${CREAM}!important;padding:14px 38px 10px;clip-path:polygon(0 0,100% 0,96% 50%,100% 100%,0 100%,4% 50%);font-size:clamp(22px,7.4vw,30px)!important;line-height:1.1;max-width:100%;box-sizing:border-box;margin:6px 0}
${R} .g-txt{background:${PAPER};padding:9px 14px;border-radius:12px;outline:2px solid ${INK};outline-offset:-2px;color:${INK}!important;font-weight:600;line-height:1.45;font-size:13px!important}
${R} .g-box{background:${PAPER}!important;outline:2.5px solid ${INK};outline-offset:-2.5px;border:0!important;box-shadow:0 5px 0 ${INK};border-radius:8px!important;color:${INK}!important;font-weight:600;transform:rotate(.8deg);padding:14px 18px!important}
${R} .g-box strong{font-family:${F};font-weight:400;font-size:22px;color:${INK}!important;text-decoration:underline;text-decoration-color:${RED};text-decoration-thickness:.12em;text-underline-offset:.15em;text-decoration-skip-ink:none}

/* Abstimmung: Kleintext auf Rot als Papierstreifen */
${R} .h1l-ctr [style*="font-size: 11px"]:not([style*="uppercase"]),${R} .h1l-ctr div[style*="font-size: 13px"]:not(:has(*)){display:block;width:fit-content;margin-left:auto;margin-right:auto;background:${PAPER};color:${INK}!important;padding:3px 12px;border-radius:99px;outline:2px solid ${INK};outline-offset:-2px;font-weight:600}
${R} .h1l-ctr>div[style*="font-size: 22px"]{background:${PAPER};padding:6px 22px 3px;border-radius:14px;outline:2.5px solid ${INK};outline-offset:-2.5px;box-shadow:0 5px 0 ${INK};transform:rotate(1.2deg);font-size:28px!important}
/* Tie */
${R} .h1l-ctr>div[style*="font-size: 15px"]{background:${PAPER};padding:6px 16px;border-radius:99px;outline:2.5px solid ${INK};outline-offset:-2.5px}

@media (prefers-reduced-motion:reduce){${R} .gt-pass .gt-flip-front::before{animation:none}}
@media (max-height:620px){${R} .trt-night-panel{padding:20px 18px}${R} .trt-morning-panel{padding:18px 16px}${R} .trt-card{padding:16px 14px!important;min-height:0!important}}
`;
  return css;
}
export { pkTrtCss };
