// Ryū: Bildsprache für Werwolf und Mafia (nur im Ryū-Zweig benutzen).
// Rollen-Symbole als eigene SVGs (eine Farbe, Löcher per evenodd) und Deko als Daten-URL-Hintergründe.
// Farben nur Schwarz #1A1716 und Creme #F3EAD3 (Rot kommt von der Seite).
import { React } from "../../vendor/react-globals.js";
import { isPlakat } from "../../themes/plakat.js";
import { GameIcon } from "../../assets/icons.js";

const INK = "#1A1716", CREAM = "#F3EAD3";
const uri = (svg) => 'url("data:image/svg+xml,' + encodeURIComponent(svg) + '")';

const HEART = "M24 41C8 29 4 21 4 15C4 9 9 5 14 5C19 5 22 8 24 12C26 8 29 5 34 5C39 5 44 9 44 15C44 21 40 29 24 41Z";
const STAR5 = "M24 3L30 17L45 18L33 28L37 43L24 35L11 43L15 28L3 18L18 17Z";
// Alle Symbole auf 48x48, Füllung currentColor
const G = {
  werwolf: <path fillRule="evenodd" d="M8 5L20 13H28L40 5L41 24C41 34 34 43 24 45C14 43 7 34 7 24ZM13 23L21 26L20 30L13 27ZM35 23L27 26L28 30L35 27ZM19 36H29L24 41Z" />,
  dorfbewohner: <g><path fillRule="evenodd" d="M24 4L45 22H40V44H8V22H3ZM20 44V30H28V44Z" /><path d="M33 8H39V19L33 14Z" /></g>,
  seherin: <g><path fillRule="evenodd" d="M2 25C9 13 39 13 46 25C39 37 9 37 2 25ZM24 16A9 9 0 1 0 24.01 16Z" /><circle cx="24" cy="25" r="4.6" /><path d="M24 3V9M10 8L13 12.5M38 8L35 12.5" stroke="currentColor" strokeWidth="3.4" strokeLinecap="round" fill="none" /></g>,
  hexe: <g><path fillRule="evenodd" d="M24 2C28 6 28 12 31 31H15C18 23 18 9 24 2ZM17.4 25H29.6L30.2 29.4H16.8Z" /><path d="M3 40C3 35 12 32 24 32C36 32 45 35 45 40C45 43 38 45 24 45C10 45 3 43 3 40Z" /></g>,
  jaeger: <g><circle cx="24" cy="24" r="15" fill="none" stroke="currentColor" strokeWidth="4.2" /><path d="M24 2V14M24 34V46M2 24H14M34 24H46" stroke="currentColor" strokeWidth="4.2" strokeLinecap="round" fill="none" /><circle cx="24" cy="24" r="3.6" /></g>,
  amor: <path fillRule="evenodd" d={HEART + "M5 41L37 9L40 12L8 44ZM45 3V16L32 3Z"} />,
  dieb: <path fillRule="evenodd" d="M2 15C9 10 17 12 24 15C31 12 39 10 46 15C46 29 39 37 31 37C27 37 26 32 24 32C22 32 21 37 17 37C9 37 2 29 2 15ZM10 20C13 17 19 19 21 23C18 27 12 28 10 25ZM38 20C35 17 29 19 27 23C30 27 36 28 38 25Z" />,
  maedchen: <g><path fillRule="evenodd" d="M24 10A13 13 0 1 0 24.01 10ZM18 24A2.4 2.4 0 1 1 18.01 24ZM30 24A2.4 2.4 0 1 1 30.01 24ZM17.5 31C21 35 27 35 30.5 31C27 32.5 21 32.5 17.5 31Z" /><circle cx="7" cy="33" r="5.6" /><circle cx="41" cy="33" r="5.6" /><path d="M24 10L14 2V15ZM24 10L34 2V15Z" /></g>,
  hauptmann: <path d={STAR5} />,
  starCustom: <path d={STAR5} />,
  sun: <g><circle cx="24" cy="24" r="10" /><path d="M24 3V9M24 39V45M3 24H9M39 24H45M9 9L13 13M35 35L39 39M39 9L35 13M13 35L9 39" stroke="currentColor" strokeWidth="4" strokeLinecap="round" fill="none" /></g>,
  sunrise: <g><path d="M9 36A15 15 0 0 1 39 36Z" /><path d="M2 41H46M24 5V13M7 17L12 22M41 17L36 22" stroke="currentColor" strokeWidth="4" strokeLinecap="round" fill="none" /></g>,
  lovers: <g><path transform="translate(-2 6) scale(.78)" d={HEART} /><path transform="translate(15 -2) scale(.78)" d={HEART} /></g>,
  trophy: <g><path fillRule="evenodd" d="M13 4H35V18C35 25 30 30 24 30C18 30 13 25 13 18ZM21 30H27V36H34V43H14V36H21Z" /><path d="M13 9H6C6 17 9 21 15 22M35 9H42C42 17 39 21 33 22" stroke="currentColor" strokeWidth="3.4" fill="none" /></g>,
  // Mafia
  fedora: <path fillRule="evenodd" d="M11 27C11 14 16 7 24 7C28 7 30 10 32 10C36 10 37 15 37 27ZM11.6 21H36.4L36.8 25.5H11.2ZM3 34C3 29 13 27 24 27C35 27 45 29 45 34C45 39 35 41 24 41C13 41 3 39 3 34Z" />,
  mafioso: <path fillRule="evenodd" d="M11 27C11 14 16 7 24 7C28 7 30 10 32 10C36 10 37 15 37 27ZM11.6 21H36.4L36.8 25.5H11.2ZM3 34C3 29 13 27 24 27C35 27 45 29 45 34C45 39 35 41 24 41C13 41 3 39 3 34Z" />,
  godfather: <path fillRule="evenodd" d="M11 27C11 14 16 7 24 7C28 7 30 10 32 10C36 10 37 15 37 27ZM11.6 21H36.4L36.8 25.5H11.2ZM3 34C3 29 13 27 24 27C35 27 45 29 45 34C45 39 35 41 24 41C13 41 3 39 3 34ZM29 13.6A3.4 3.4 0 1 0 29.01 13.6Z" />,
  detective: <g><circle cx="20" cy="20" r="13" fill="none" stroke="currentColor" strokeWidth="5.2" /><path d="M30.5 30.5L43 43" stroke="currentColor" strokeWidth="7.4" strokeLinecap="round" fill="none" /><path d="M13 17C15 12 20 11 24 13" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" fill="none" /></g>,
  doctor: <path fillRule="evenodd" d="M12 4H36A8 8 0 0 1 44 12V36A8 8 0 0 1 36 44H12A8 8 0 0 1 4 36V12A8 8 0 0 1 12 4ZM20 11H28V20H37V28H28V37H20V28H11V20H20Z" />,
  heal: <path fillRule="evenodd" d="M12 4H36A8 8 0 0 1 44 12V36A8 8 0 0 1 36 44H12A8 8 0 0 1 4 36V12A8 8 0 0 1 12 4ZM20 11H28V20H37V28H28V37H20V28H11V20H20Z" />,
  vigilante: <path fillRule="evenodd" d="M2 13H32V11H40L43 14V21H33V24C33 29 30 32 25 32L22 45H9L13 32H10C5 32 2 29 2 24ZM17 17A4.6 4.6 0 1 0 17.01 17Z" />,
  revolver: <path fillRule="evenodd" d="M2 13H32V11H40L43 14V21H33V24C33 29 30 32 25 32L22 45H9L13 32H10C5 32 2 29 2 24ZM17 17A4.6 4.6 0 1 0 17.01 17Z" />,
  civilian: <path fillRule="evenodd" d="M24 4A9 9 0 1 0 24.01 4ZM5 44C5 31 13 25 24 25C35 25 43 31 43 44ZM24 27L28.5 32L26.5 44H21.5L19.5 32Z" />,
  citizen: <path fillRule="evenodd" d="M24 4A9 9 0 1 0 24.01 4ZM5 44C5 31 13 25 24 25C35 25 43 31 43 44ZM24 27L28.5 32L26.5 44H21.5L19.5 32Z" />,
  scale: <g><path d="M24 5V40M10 41H38M7 12H41" stroke="currentColor" strokeWidth="3.6" strokeLinecap="round" fill="none" /><path d="M2 25H16C16 30.5 12.5 33 9 33C5.5 33 2 30.5 2 25ZM32 25H46C46 30.5 42.5 33 39 33C35.5 33 32 30.5 32 25Z" /></g>,
};
// kleine Symbole (Text-Zeilen, Knöpfe) bleiben bei den App-Symbolen, damit sie in der Zeilenhöhe sauber sitzen
const SMALL_OK = { werwolf: 1, dorfbewohner: 1, seherin: 1, hexe: 1, jaeger: 1, amor: 1, dieb: 1, maedchen: 1, mafioso: 1, godfather: 1, detective: 1, doctor: 1, vigilante: 1, civilian: 1 };

function PkGlyph({ name, size, style }) {
  const s = size || 40;
  return <svg className="pk-gl" viewBox="0 0 48 48" width={s} height={s} fill="currentColor" aria-hidden="true" focusable="false" style={{ display: "block", flexShrink: 0, ...(style || {}) }}>{G[name]}</svg>;
}
// Ersatz für GameIcon: im Ryū-Modus die eigenen Symbole, sonst unverändert das App-Symbol
function PkIco(props) {
  const { disc, ...rest } = props;
  const { name, size } = rest;
  if (isPlakat() && G[name] && (size >= 30 || SMALL_OK[name])) {
    const st = rest.style || {};
    const gl = <PkGlyph name={name} size={size} style={{ ...st, display: st.verticalAlign ? "inline-block" : "block" }} />;
    return disc ? <div className={"ww-ic" + (disc === "s" ? " ww-ic-s" : "")}>{gl}</div> : gl;
  }
  return <GameIcon {...rest} />;
}

// ---------- Deko (Daten-URLs) ----------
const claws = (fill, op) => uri(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120"><g fill="${fill}" fill-opacity="${op}"><path d="M6 2L16 0Q44 54 112 100Q60 74 6 2Z"/><path d="M34 0L45 0Q68 44 118 74Q80 58 34 0Z"/><path d="M0 34L9 28Q30 70 84 112Q40 98 0 34Z"/></g></svg>`);
const paw = (fill, op) => uri(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48"><g fill="${fill}" fill-opacity="${op}"><path d="M24 24C31 24 37 31 37 37C37 42 33 43 29 41C26 40 22 40 19 41C15 43 11 42 11 37C11 31 17 24 24 24Z"/><ellipse cx="9" cy="22" rx="4.4" ry="5.8" transform="rotate(-20 9 22)"/><ellipse cx="18.5" cy="12" rx="4.6" ry="6" transform="rotate(-6 18.5 12)"/><ellipse cx="30" cy="12" rx="4.6" ry="6" transform="rotate(6 30 12)"/><ellipse cx="39.5" cy="22" rx="4.4" ry="5.8" transform="rotate(20 39.5 22)"/></g></svg>`);
const stars = (fill, op) => uri(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 160"><g fill="${fill}" fill-opacity="${op}"><path d="M22 18L24 26L32 28L24 30L22 38L20 30L12 28L20 26Z"/><path d="M118 44L119.6 49.4L125 51L119.6 52.6L118 58L116.4 52.6L111 51L116.4 49.4Z"/><path d="M70 112L72 120L80 122L72 124L70 132L68 124L60 122L68 120Z"/><path d="M142 126L143.2 130L147 131L143.2 132L142 136L140.8 132L137 131L140.8 130Z"/><circle cx="84" cy="22" r="1.8"/><circle cx="48" cy="76" r="1.5"/><circle cx="136" cy="88" r="1.8"/><circle cx="20" cy="124" r="1.5"/><circle cx="100" cy="146" r="1.5"/></g></svg>`);
const moonDisc = uri(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="44" fill="${CREAM}" stroke="${INK}" stroke-width="4.5"/><g fill="${INK}" fill-opacity=".22"><circle cx="34" cy="36" r="9"/><circle cx="62" cy="58" r="12"/><circle cx="40" cy="68" r="5"/><circle cx="68" cy="30" r="4"/></g></svg>`);
const sunDisc = uri(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><g stroke="${INK}" stroke-width="5" stroke-linecap="round"><path d="M50 5V16M50 84V95M5 50H16M84 50H95M18 18L26 26M74 74L82 82M82 18L74 26M26 74L18 82"/></g><circle cx="50" cy="50" r="26" fill="${CREAM}" stroke="${INK}" stroke-width="4.5"/></svg>`);
// Skyline: schwarze Häuser mit erleuchteten Fenstern (Creme), unten an der Seite
const SKY_BLD = [[0, 38, 26], [24, 70, 22], [44, 52, 30], [72, 84, 20], [90, 46, 26], [114, 64, 24], [136, 32, 30], [164, 76, 22], [184, 50, 28], [210, 62, 24], [232, 40, 26]];
const skyline = (bld, win) => {
  let r = "";
  SKY_BLD.forEach(([x, h, w], i) => {
    r += `<rect x="${x}" y="${100 - h}" width="${w}" height="${h}" fill="${bld}"/>`;
    for (let yy = 100 - h + 8; yy < 94; yy += 12) for (let xx = x + 5; xx < x + w - 6; xx += 9) if ((xx * 7 + yy * 3 + i * 5) % 5 > 1) r += `<rect x="${xx}" y="${yy}" width="4" height="6" fill="${win}"/>`;
  });
  r += `<rect x="52" y="${100 - 52 - 14}" width="3" height="14" fill="${bld}"/><rect x="146" y="${100 - 32 - 10}" width="3" height="10" fill="${bld}"/>`;
  return uri(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 260 100" preserveAspectRatio="none">${r}</svg>`);
};
const finger = (stroke, op) => uri(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 120"><g fill="none" stroke="${stroke}" stroke-opacity="${op}" stroke-width="3.2" stroke-linecap="round"><path d="M50 14C28 14 14 32 14 58C14 78 20 96 30 108"/><path d="M50 24C34 24 24 38 24 58C24 76 28 92 36 104"/><path d="M50 34C40 34 33 44 33 58C33 72 36 86 42 98"/><path d="M50 44C46 44 42 50 42 58C42 68 44 80 48 92"/><path d="M50 14C72 14 86 32 86 58C86 70 84 82 80 92"/><path d="M50 24C66 24 76 38 76 58C76 68 74 78 71 88"/><path d="M50 34C60 34 67 44 67 58C67 66 65 74 62 82"/><path d="M50 44C54 44 58 50 58 58C58 64 57 70 55 76"/></g></svg>`);
const stampRing = (c) => uri(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120"><g fill="none" stroke="${c}" stroke-width="4"><circle cx="60" cy="60" r="54"/><circle cx="60" cy="60" r="44" stroke-width="2" stroke-dasharray="3 5"/></g><path fill="${c}" d="M60 30L67 48L87 49L71 61L77 80L60 69L43 80L49 61L33 49L53 48Z"/></svg>`);

// ---------- CSS ----------
function pkArtCss() {
  return `
.pkw .pk-gl{overflow:visible}
.pkw .pk-cap{outline:none!important}
.pkw .pk-role .pk-cap{outline:none!important;color:${INK}!important;font-weight:500!important;font-size:12px!important;line-height:1.3}
.pkw .pk-role:disabled .pk-cap{color:#4A4236!important}
.pkw .pk-role{border-radius:18px!important;padding:10px 12px!important;gap:12px!important;position:relative}
.pkw .pk-role>span:first-child{width:46px;height:46px;border-radius:50%;background:${INK};color:${CREAM};display:inline-flex!important;align-items:center;justify-content:center;transform:rotate(-5deg);outline:2.5px solid ${INK};outline-offset:2px;opacity:1!important}
.pkw .pk-role>span:first-child svg{width:27px;height:27px;color:${CREAM}}
.pkw .pk-role[aria-pressed="true"]>span:first-child{background:#E4312B;color:${CREAM};box-shadow:inset 0 0 0 2px ${INK}}
.pkw .pk-role:disabled>span:first-child{background:transparent;color:#4A4236;outline-style:dashed;outline-color:#4A4236}
.pkw .pk-role:disabled>span:first-child svg{color:#4A4236}
.pkw .pk-role div:first-child{font-size:17px!important;line-height:1.1;margin-bottom:2px}
.pkw .pk-role[aria-pressed="true"]{box-shadow:0 4px 0 ${INK},inset 0 0 0 4px #E4312B!important}
.pkw .gt-su-label,.pkw .pk-lab{background:${INK};color:${CREAM}!important;display:inline-block;border-radius:8px;padding:4px 10px;transform:rotate(-1.5deg);letter-spacing:.1em!important;box-shadow:0 2px 0 rgba(20,20,20,.35)}
html[data-gt-skin="plakat"] .pkw .gt-su-label,html[data-gt-skin="plakat"] .pkw .pk-lab{color:${CREAM}!important}
.pkw .gt-pass-wrap .gt-flip-back{padding:14px 12px}
.pkw .ww-night .gt-row,.pkw .ww-day .gt-row{font-size:17px!important;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
@media (max-width:1100px){.pkw.pkw-ww .h1l-over.ww-end,.pkw.pkw-mf .h1l-over.ww-end{display:flex!important;flex-direction:column;align-items:center;gap:12px!important;max-width:520px;margin-left:auto;margin-right:auto}.pkw .h1l-over.ww-end .g-box{max-width:100%!important;width:100%}}

.pkw .gt-pass .gt-flip-face:has(.pk-rc){background:transparent!important;outline:none!important;box-shadow:none!important}

`;
}

// ---------- Werwolf ----------
function pkWwCss() {
  const dot = INK;
  return `
.pkw-ww{position:relative;overflow-x:clip}
.pkw.pkw-ww>.gtL-game{position:relative;z-index:1}
.pkw-ww::before{content:"";position:absolute;pointer-events:none;z-index:0;top:-86px;right:-96px;width:270px;height:270px;border-radius:50%;
 background:radial-gradient(circle at 36% 38%,rgba(20,20,20,.10) 0 9%,transparent 9.5%),radial-gradient(circle at 62% 60%,rgba(20,20,20,.10) 0 13%,transparent 13.5%),radial-gradient(circle at 70% 28%,rgba(20,20,20,.08) 0 5%,transparent 5.5%),rgba(243,234,211,.20);
 box-shadow:0 0 0 2.5px rgba(20,20,20,.55),0 0 0 22px rgba(243,234,211,.07),0 0 0 44px rgba(243,234,211,.05)}
.pkw-ww::after{content:"";position:fixed;pointer-events:none;z-index:0;left:-14px;bottom:-8px;width:200px;height:200px;background:${claws(dot, 0.45)} center/contain no-repeat;transform:scaleX(-1)}
.pkw.pkw-ww .gt-wm{filter:drop-shadow(0 0 0 transparent)}

/* Rollenkarte (Handy weitergeben, Rolle ansehen) */
.pkw.pkw-ww .pk-rc{position:relative;width:min(100%,300px);box-sizing:border-box;padding:28px 20px 22px!important;border-radius:22px!important;background:${CREAM}!important;color:${INK}!important;outline:2.5px solid ${INK};outline-offset:-2.5px;border:0!important;box-shadow:0 5px 0 ${INK}!important;overflow:hidden}
.pkw.pkw-ww .pk-rc::before{content:"";position:absolute;inset:7px;border-radius:15px;border:2px dashed rgba(20,20,20,.5);pointer-events:none}
.pkw.pkw-ww .pk-rc>*{position:relative}
.pkw.pkw-ww .pk-rc .pk-rc-ic{width:92px;height:92px;margin:0 auto 10px;border-radius:50%;background:${INK};color:${CREAM};display:flex;align-items:center;justify-content:center;transform:rotate(-4deg);outline:2.5px solid ${INK};outline-offset:3px;box-shadow:0 4px 0 rgba(20,20,20,.25)}
.pkw.pkw-ww .pk-rc .pk-rc-ic svg{width:56px;height:56px;color:${CREAM}}
.pkw.pkw-ww .pk-rc .pk-rc-nm{font-family:var(--pkf)!important;font-weight:400!important;font-size:31px!important;color:${INK}!important;line-height:1.05}
.pkw.pkw-ww .pk-rc .pk-rc-ds{color:${INK}!important;font-weight:500;font-size:14px!important}
.pkw.pkw-ww .pk-rc-wolf{background:${INK}!important;color:${CREAM}!important;outline-color:${CREAM}}
.pkw.pkw-ww .pk-rc-wolf::before{border-color:rgba(243,234,211,.45)}
.pkw.pkw-ww .pk-rc-wolf::after{content:"";position:absolute;right:-4px;top:-4px;width:128px;height:128px;background:${claws("#E4312B", 1)} center/contain no-repeat;pointer-events:none}
.pkw.pkw-ww .pk-rc-wolf .pk-rc-ic{background:${CREAM};color:${INK};outline-color:${CREAM}}
.pkw.pkw-ww .pk-rc-wolf .pk-rc-ic svg{color:${INK}}
.pkw.pkw-ww .pk-rc-wolf .pk-rc-nm,.pkw.pkw-ww .pk-rc-wolf .pk-rc-ds{color:${CREAM}!important}
.pkw.pkw-ww .pk-rc-wolf .pk-rc-pk{color:${CREAM}!important;background:#E4312B;outline:2px solid ${CREAM};outline-offset:-2px;border-radius:10px;padding:5px 10px;margin-top:12px!important;font-weight:700;font-size:12px!important}
.pkw.pkw-ww .pk-rc .pk-rc-pk{color:${INK}!important}
.pkw.pkw-ww .gt-pass .gt-flip-front{background:${paw(dot, 0.10)} center 84%/76px no-repeat,${CREAM}!important}
.pkw.pkw-ww .gt-pass .gt-flip-front svg{color:${INK}}

/* Einrichtung */
.pkw.pkw-ww .ww-stats{background:transparent!important;outline:none!important;box-shadow:none!important;padding:2px 0 6px!important;gap:10px!important}
.pkw.pkw-ww .ww-stats>div{background:${CREAM};outline:2.5px solid ${INK};outline-offset:-2.5px;border-radius:16px;padding:8px 4px 8px!important;box-shadow:0 4px 0 ${INK};color:${INK}}
.pkw.pkw-ww .ww-stats>div:nth-child(1){transform:rotate(-2deg);background:${INK};color:${CREAM}}
.pkw.pkw-ww .ww-stats>div:nth-child(2){transform:rotate(1.5deg)}
.pkw.pkw-ww .ww-stats>div:nth-child(3){transform:rotate(-1deg)}
.pkw.pkw-ww .ww-stats>div>div:first-child{font-family:var(--pkf)!important;font-weight:400!important;font-size:30px!important;line-height:1;color:inherit!important}
.pkw.pkw-ww .ww-stats>div>div:last-child{color:inherit!important;font-weight:700;opacity:1}

/* Nacht: schwarze Karte mit Sternen und Mond */
.pkw.pkw-ww .ww-night,.pkw.pkw-ww .ww-nightdone{justify-content:center;position:relative;margin-top:26px;border-radius:26px;padding:56px 16px 20px!important;background:${stars(CREAM, 0.55)} 0 0/170px 170px,${INK};box-shadow:0 0 0 2.5px ${INK},inset 0 0 0 2.5px ${INK},inset 0 0 0 6px rgba(243,234,211,.28),0 6px 0 rgba(20,20,20,.5);color:${CREAM}}
.pkw.pkw-ww .ww-night::before,.pkw.pkw-ww .ww-nightdone::before{content:"";position:absolute;top:-22px;left:50%;width:72px;height:72px;margin-left:-36px;background:${moonDisc} center/contain no-repeat;transform:rotate(-14deg);filter:drop-shadow(0 4px 0 ${INK})}
.pkw.pkw-ww .ww-night .ww-t,.pkw.pkw-ww .ww-nightdone .ww-t{color:${CREAM}!important;font-family:var(--pkf)!important;font-weight:400!important;font-size:27px!important;line-height:1.1!important;text-shadow:3px 3px 0 #E4312B;-webkit-text-stroke:0}
.pkw.pkw-ww .ww-night .ww-ic,.pkw.pkw-ww .ww-nightdone .ww-ic,.pkw.pkw-ww .ww-day .ww-ic{width:96px;height:96px;margin:2px auto 6px;border-radius:50%;background:${CREAM};color:${INK};display:flex!important;align-items:center;justify-content:center;transform:rotate(-4deg);outline:2.5px solid ${INK};outline-offset:3px;box-shadow:0 0 0 5.5px ${CREAM},0 8px 0 5.5px ${INK}}
.pkw.pkw-ww .ww-night .ww-ic svg,.pkw.pkw-ww .ww-nightdone .ww-ic svg,.pkw.pkw-ww .ww-day .ww-ic svg{width:58px;height:58px;color:${INK}}
.pkw.pkw-ww .ww-night .ww-ic.ww-ic-s{width:64px;height:64px}
.pkw.pkw-ww .ww-night .ww-ic.ww-ic-s svg{width:38px;height:38px}
.pkw.pkw-ww .ww-night .ww-t:not(.ww-t-r){margin-top:12px!important}
.pkw.pkw-ww .ww-night .gt-row{outline-color:${CREAM}!important;box-shadow:0 4px 0 rgba(243,234,211,.4)}
.pkw.pkw-ww .ww-night .gt-row[aria-pressed="true"]{background:#E4312B!important;box-shadow:0 4px 0 ${CREAM}}
.pkw.pkw-ww .ww-night .pk-prim,.pkw.pkw-ww .ww-nightdone .pk-prim{outline-color:${CREAM}!important;box-shadow:0 5px 0 ${CREAM}!important}
.pkw.pkw-ww .ww-night .pk-gh,.pkw.pkw-ww .ww-night button:not(.gt-row):not(.pk-prim){outline-color:${CREAM}!important;box-shadow:0 4px 0 rgba(243,234,211,.4)!important}
.pkw.pkw-ww .ww-night .pk-prim:disabled{background:rgba(243,234,211,.16)!important;color:rgba(243,234,211,.6)!important;outline-color:rgba(243,234,211,.4)!important;box-shadow:none!important}
.pkw.pkw-ww .ww-night .pk-prim::after,.pkw.pkw-ww .ww-nightdone .pk-prim::after{display:none}
.pkw.pkw-ww .ww-night .pk-cap{transform:rotate(-1.2deg)}

/* Tag: Creme-Karte mit Sonne */
.pkw.pkw-ww .ww-day:not(.h1l-vote2),.pkw.pkw-ww .ww-dawn{justify-content:center}
.pkw.pkw-ww .ww-day,.pkw.pkw-ww .ww-dawn{position:relative;margin-top:26px;border-radius:26px;padding:50px 16px 20px!important;background:${CREAM};box-shadow:0 0 0 2.5px ${INK},0 6px 0 2.5px ${INK}}
.pkw.pkw-ww .ww-dawn::before{content:"";position:absolute;top:-30px;left:50%;width:84px;height:84px;margin-left:-42px;background:${sunDisc} center/contain no-repeat;filter:drop-shadow(0 4px 0 ${INK});animation:ww-sun 9s linear infinite}
@keyframes ww-sun{to{transform:rotate(360deg)}}
.pkw.pkw-ww .ww-day{padding-top:24px!important}
.pkw.pkw-ww .ww-day .ww-t,.pkw.pkw-ww .ww-dawn .ww-t{color:${INK}!important;font-family:var(--pkf)!important;font-weight:400!important}
.pkw.pkw-ww .ww-day .ww-ic{background:${INK};box-shadow:0 0 0 5.5px ${CREAM},0 8px 0 5.5px ${INK};outline-color:${CREAM}}
.pkw.pkw-ww .ww-day .ww-ic svg{color:${CREAM}}
.pkw.pkw-ww .ww-day .ww-ic.ww-ic-s{width:64px;height:64px}
.pkw.pkw-ww .ww-day .ww-ic.ww-ic-s svg{width:34px;height:34px}
.pkw.pkw-ww .ww-day .gt-row,.pkw.pkw-ww .ww-dawn .gt-row{background:${"#FFFDF7"}!important}
.pkw.pkw-ww .ww-day .gt-row[aria-pressed="true"]{background:#E4312B!important}
.pkw.pkw-ww .ww-day .pk-box,.pkw.pkw-ww .ww-dawn .pk-box{position:relative;overflow:hidden;background:#FFFDF7!important;text-align:left}
.pkw.pkw-ww .ww-dawn .pk-box::after{content:"";position:absolute;right:0;top:0;width:70px;height:70px;background:${claws(dot, 0.9)} center/contain no-repeat}
.pkw.pkw-ww .ww-dawn .pk-box>*{position:relative;z-index:1}
.pkw.pkw-ww .ww-dawn .pk-cap{transform:rotate(-1deg)}
.pkw.pkw-ww .ww-day .ww-p,.pkw.pkw-ww .ww-dawn .ww-p{color:${INK}!important}

/* Endseite: Dorfblatt */
.pkw.pkw-ww .ww-end{position:relative;border-radius:8px;padding:30px 16px 20px!important;background:${CREAM};box-shadow:0 0 0 2.5px ${INK},0 7px 0 2.5px ${INK};transform:rotate(-.6deg);width:100%;box-sizing:border-box;max-width:100%}
.pkw.pkw-ww .ww-end::before{content:"";position:absolute;left:8px;right:8px;top:8px;height:8px;border-top:2.5px solid ${INK};border-bottom:1px solid ${INK};pointer-events:none}
.pkw.pkw-ww .ww-end .g-icon{width:82px;height:82px;border-radius:50%;background:${INK};color:${CREAM};display:flex;align-items:center;justify-content:center;transform:rotate(-5deg);outline:2.5px solid ${INK};outline-offset:3px;margin-top:4px}
.pkw.pkw-ww .ww-end .g-icon svg{width:50px;height:50px;color:${CREAM}}
.pkw.pkw-ww .ww-end .g-title{font-family:var(--pkf)!important;font-weight:400!important;font-size:31px!important;line-height:1.05;text-align:center;color:${INK}!important;border-top:2px solid ${INK};border-bottom:2px solid ${INK};padding:8px 0;width:100%}
.pkw.pkw-ww .ww-end .g-box{background:transparent!important;border:0!important;outline:none!important;box-shadow:none!important;max-width:100%!important;padding:0!important;gap:0!important;border-radius:0!important;color:${INK}}
.pkw.pkw-ww .ww-end .g-box>span{padding:9px 0;border-bottom:1.5px dashed rgba(20,20,20,.55)}
.pkw.pkw-ww .ww-end .g-box>span:nth-child(odd){padding-right:12px;font-family:var(--pkf);font-weight:400!important;font-size:16px!important;color:${INK}!important}
.pkw.pkw-ww .ww-end .g-box>span:nth-child(even){font-weight:700;font-size:13px;color:${INK};justify-content:flex-end}
.pkw.pkw-ww .ww-end .g-box svg{width:19px;height:19px;color:${INK}}
.pkw.pkw-ww .ww-end .g-box .ww-dead{text-decoration:line-through;text-decoration-thickness:2.5px;opacity:.55}
.pkw.pkw-ww .ww-end[data-w="wolf"]{background:${INK};color:${CREAM}}
.pkw.pkw-ww .ww-end[data-w="wolf"]::before{border-color:${CREAM}}
.pkw.pkw-ww .ww-end[data-w="wolf"] .g-icon{background:${CREAM};color:${INK};outline-color:${CREAM}}
.pkw.pkw-ww .ww-end[data-w="wolf"] .g-icon svg{color:${INK}}
.pkw.pkw-ww .ww-end[data-w="wolf"] .g-title{color:${CREAM}!important;border-color:${CREAM};text-shadow:3px 3px 0 #E4312B}
.pkw.pkw-ww .ww-end[data-w="wolf"] .g-box>span{border-color:rgba(243,234,211,.5)}
.pkw.pkw-ww .ww-end[data-w="wolf"] .g-box>span,.pkw.pkw-ww .ww-end[data-w="wolf"] .g-box>span:nth-child(odd),.pkw.pkw-ww .ww-end[data-w="wolf"] .g-box>span:nth-child(even){color:${CREAM}!important}
.pkw.pkw-ww .ww-end[data-w="wolf"] .g-box svg{color:${CREAM}}
.pkw.pkw-ww .ww-end[data-w="wolf"]::after{content:"";position:absolute;right:0;top:0;width:150px;height:150px;background:${claws("#E4312B", 1)} center/contain no-repeat;pointer-events:none}
.pkw.pkw-ww .ww-end .g-btn{flex-wrap:wrap;justify-content:center}
.pkw.pkw-ww .ww-end .pk-prim,.pkw.pkw-ww .ww-end .pk-gh{margin-top:2px}
.pkw.pkw-ww .ww-end[data-w="wolf"] .pk-prim{background:#E4312B!important;color:${CREAM}!important;outline-color:${CREAM}!important;box-shadow:0 5px 0 ${CREAM}!important}
.pkw.pkw-ww .ww-end[data-w="wolf"] .pk-gh,.pkw.pkw-ww .ww-end[data-w="wolf"] button:not(.pk-prim){outline-color:${CREAM}!important;box-shadow:0 4px 0 rgba(243,234,211,.45)!important}
.pkw.pkw-ww .ww-end .pk-prim::after{display:none}

/* Bewegung: Mond atmet, Kratzer sind ruhig */
@keyframes ww-moon{0%,100%{transform:rotate(-14deg) translateY(0)}50%{transform:rotate(-10deg) translateY(-3px)}}
.pkw.pkw-ww .ww-night::before,.pkw.pkw-ww .ww-nightdone::before{animation:ww-moon 5s ease-in-out infinite}
@keyframes ww-pop{0%{transform:rotate(-4deg) scale(.7)}60%{transform:rotate(-4deg) scale(1.08)}100%{transform:rotate(-4deg) scale(1)}}
.pkw.pkw-ww .ww-ic,.pkw.pkw-ww .pk-rc-ic{animation:ww-pop .45s cubic-bezier(.23,1,.32,1) both}
@media (prefers-reduced-motion:reduce){.pkw.pkw-ww .ww-night::before,.pkw.pkw-ww .ww-nightdone::before,.pkw.pkw-ww .ww-ic,.pkw.pkw-ww .pk-rc-ic,.pkw.pkw-ww .ww-dawn::before{animation:none}}
@media (max-height:640px){.pkw.pkw-ww .ww-ic,.pkw.pkw-ww .pk-rc-ic{width:72px!important;height:72px!important}.pkw.pkw-ww .ww-ic svg,.pkw.pkw-ww .pk-rc-ic svg{width:42px!important;height:42px!important}}
`;
}

// ---------- Mafia ----------
function pkMfCss() {
  return `
.pkw-mf{position:relative;overflow-x:clip}
.pkw.pkw-mf>.gtL-game{position:relative;z-index:1}
/* Jalousie-Licht: schräge dunkle Streifen wie Licht durch Rollos */
.pkw-mf::before{content:"";position:absolute;inset:0;pointer-events:none;z-index:0;background:repeating-linear-gradient(168deg,transparent 0 46px,rgba(20,20,20,.13) 46px 70px)}
/* Skyline am Seitenende */
.pkw-mf::after{content:"";position:fixed;pointer-events:none;z-index:0;left:0;right:0;bottom:0;height:72px;background:${skyline(INK, CREAM)} 0 100%/ 220px 72px repeat-x}
.pkw.pkw-mf>.gtL-game{padding-bottom:92px}

/* Rollenkarte als Akte */
.pkw.pkw-mf .pk-rc{position:relative;width:min(100%,300px);box-sizing:border-box;padding:34px 20px 22px!important;border-radius:6px 18px 18px 18px!important;background:${CREAM}!important;color:${INK}!important;outline:2.5px solid ${INK};outline-offset:-2.5px;border:0!important;box-shadow:0 5px 0 ${INK}!important;margin-top:16px}
.pkw.pkw-mf .pk-rc::before{content:"";position:absolute;left:-1px;top:-17px;width:96px;height:18px;background:${CREAM};border-radius:10px 10px 0 0;outline:2.5px solid ${INK};outline-offset:-2.5px;border-bottom:0}
.pkw.pkw-mf .pk-rc::after{content:"";position:absolute;right:6px;bottom:4px;width:92px;height:110px;background:${finger(INK, 0.16)} center/contain no-repeat;pointer-events:none}
.pkw.pkw-mf .pk-rc>*{position:relative;z-index:1}
.pkw.pkw-mf .pk-rc .pk-rc-ic{width:84px;height:84px;margin:0 auto 10px;border-radius:18px;background:${INK};color:${CREAM};display:flex;align-items:center;justify-content:center;transform:rotate(3deg);outline:2.5px solid ${INK};outline-offset:3px}
.pkw.pkw-mf .pk-rc .pk-rc-ic svg{width:54px;height:54px;color:${CREAM}}
.pkw.pkw-mf .pk-rc .pk-rc-nm{font-family:var(--pkf)!important;font-weight:400!important;font-size:31px!important;color:${INK}!important;line-height:1.05}
.pkw.pkw-mf .pk-rc .pk-rc-ds{color:${INK}!important;font-weight:500;font-size:14px!important}
.pkw.pkw-mf .pk-rc-mafia{background:${INK}!important;color:${CREAM}!important;outline-color:${CREAM}}
.pkw.pkw-mf .pk-rc-mafia::before{background:${INK};outline-color:${CREAM}}
.pkw.pkw-mf .pk-rc-mafia::after{background:${finger(CREAM, 0.16)} center/contain no-repeat}
.pkw.pkw-mf .pk-rc-mafia .pk-rc-ic{background:${CREAM};color:${INK};outline-color:${CREAM}}
.pkw.pkw-mf .pk-rc-mafia .pk-rc-ic svg{color:${INK}}
.pkw.pkw-mf .pk-rc-mafia .pk-rc-nm,.pkw.pkw-mf .pk-rc-mafia .pk-rc-ds{color:${CREAM}!important}
.pkw.pkw-mf .pk-rc-mafia .pk-rc-pk{color:${CREAM}!important;background:#E4312B;outline:2px solid ${CREAM};outline-offset:-2px;border-radius:10px;padding:5px 10px;margin-top:12px!important;font-weight:700;font-size:12px!important}
.pkw.pkw-mf .pk-rc .pk-rc-pk{color:${INK}!important}
.pkw.pkw-mf .gt-pass .gt-flip-back{overflow:visible}
.pkw.pkw-mf .gt-pass .gt-flip-front{background:${finger(INK, 0.12)} center 60%/76px no-repeat,${CREAM}!important}

/* Einrichtung */
.pkw.pkw-mf .ww-stats{background:transparent!important;outline:none!important;box-shadow:none!important;padding:2px 0 6px!important;gap:10px!important;justify-content:space-between!important}
.pkw.pkw-mf .ww-stats>div{flex:1 1 0;background:${CREAM};outline:2.5px solid ${INK};outline-offset:-2.5px;border-radius:6px 14px 14px 14px;padding:8px 4px!important;box-shadow:0 4px 0 ${INK};color:${INK}}
.pkw.pkw-mf .ww-stats>div:nth-child(1){background:${INK};color:${CREAM}}
.pkw.pkw-mf .ww-stats>div>div:first-child{font-family:var(--pkf)!important;font-weight:400!important;font-size:30px!important;line-height:1;color:inherit!important}
.pkw.pkw-mf .ww-stats>div>div:last-child{color:inherit!important;font-weight:700;font-size:10px!important;letter-spacing:.04em!important}
.pkw.pkw-mf .pk-role{border-radius:6px 18px 18px 18px!important}
.pkw.pkw-mf .pk-role>span:first-child{border-radius:12px!important;transform:rotate(3deg)}

/* Nacht: schwarze Karte, Strassenlaterne, Fenster */
.pkw.pkw-mf .ww-night,.pkw.pkw-mf .ww-nightdone{justify-content:center;position:relative;border-radius:6px 24px 24px 24px;margin-top:14px;padding:30px 16px 26px!important;color:${CREAM};
 background:linear-gradient(180deg,rgba(243,234,211,.20),rgba(243,234,211,0) 46%) ,${skyline(INK, CREAM)} 0 100%/ 220px 46px repeat-x,#0E0C0B;box-shadow:0 0 0 2.5px ${INK},inset 0 0 0 2.5px ${INK},inset 0 0 0 6px rgba(243,234,211,.25),0 6px 0 rgba(20,20,20,.5)}
.pkw.pkw-mf .ww-night{padding-bottom:62px!important}
.pkw.pkw-mf .ww-night::before,.pkw.pkw-mf .ww-nightdone::before{content:"";position:absolute;left:-1px;top:-17px;width:96px;height:18px;background:#0E0C0B;border-radius:10px 10px 0 0;box-shadow:0 0 0 2.5px ${INK}}
.pkw.pkw-mf .ww-nightdone{padding-bottom:62px!important}
.pkw.pkw-mf .ww-night .ww-t,.pkw.pkw-mf .ww-nightdone .ww-t{color:${CREAM}!important;font-family:var(--pkf)!important;font-weight:400!important;font-size:27px!important;line-height:1.1!important;text-shadow:3px 3px 0 #E4312B}
.pkw.pkw-mf .ww-night .ww-ic,.pkw.pkw-mf .ww-nightdone .ww-ic,.pkw.pkw-mf .ww-day .ww-ic{width:92px;height:92px;margin:0 auto 6px;border-radius:20px;background:${CREAM};color:${INK};display:flex!important;align-items:center;justify-content:center;transform:rotate(-3deg);outline:2.5px solid ${INK};outline-offset:3px;box-shadow:0 0 0 5.5px ${CREAM},0 8px 0 5.5px ${INK}}
.pkw.pkw-mf .ww-night .ww-ic svg,.pkw.pkw-mf .ww-nightdone .ww-ic svg,.pkw.pkw-mf .ww-day .ww-ic svg{width:56px;height:56px;color:${INK}}
.pkw.pkw-mf .ww-night .ww-ic.ww-ic-s{width:62px;height:62px}
.pkw.pkw-mf .ww-night .ww-ic.ww-ic-s svg{width:36px;height:36px}
.pkw.pkw-mf .ww-night .gt-row{outline-color:${CREAM}!important;box-shadow:0 4px 0 rgba(243,234,211,.4)}
.pkw.pkw-mf .ww-night .gt-row[aria-pressed="true"]{background:#E4312B!important;box-shadow:0 4px 0 ${CREAM}}
.pkw.pkw-mf .ww-night .pk-prim,.pkw.pkw-mf .ww-nightdone .pk-prim{outline-color:${CREAM}!important;box-shadow:0 5px 0 ${CREAM}!important}
.pkw.pkw-mf .ww-night .pk-gh,.pkw.pkw-mf .ww-night button:not(.gt-row):not(.pk-prim){outline-color:${CREAM}!important;box-shadow:0 4px 0 rgba(243,234,211,.4)!important}
.pkw.pkw-mf .ww-night .pk-prim:disabled{background:rgba(243,234,211,.16)!important;color:rgba(243,234,211,.6)!important;outline-color:rgba(243,234,211,.4)!important;box-shadow:none!important}
.pkw.pkw-mf .ww-night .pk-prim::after,.pkw.pkw-mf .ww-nightdone .pk-prim::after{display:none}

/* Tag: Creme-Akte mit Reiter */
.pkw.pkw-mf .ww-day:not(.h1l-vote2),.pkw.pkw-mf .ww-dawn{justify-content:center}
.pkw.pkw-mf .ww-day,.pkw.pkw-mf .ww-dawn{position:relative;border-radius:6px 24px 24px 24px;margin-top:14px;padding:26px 16px 20px!important;background:${CREAM};box-shadow:0 0 0 2.5px ${INK},0 6px 0 2.5px ${INK}}
.pkw.pkw-mf .ww-day::before,.pkw.pkw-mf .ww-dawn::before{content:"";position:absolute;left:0;top:-17px;width:96px;height:18px;background:${CREAM};border-radius:10px 10px 0 0;box-shadow:0 0 0 2.5px ${INK}}
.pkw.pkw-mf .ww-day .ww-t,.pkw.pkw-mf .ww-dawn .ww-t{color:${INK}!important;font-family:var(--pkf)!important;font-weight:400!important}
.pkw.pkw-mf .ww-day .ww-ic{background:${INK};box-shadow:0 0 0 5.5px ${CREAM},0 8px 0 5.5px ${INK};outline-color:${CREAM}}
.pkw.pkw-mf .ww-day .ww-ic svg{color:${CREAM}}
.pkw.pkw-mf .ww-day .ww-ic.ww-ic-s{width:62px;height:62px}
.pkw.pkw-mf .ww-day .ww-ic.ww-ic-s svg{width:34px;height:34px}
.pkw.pkw-mf .ww-day .gt-row,.pkw.pkw-mf .ww-dawn .gt-row{background:#FFFDF7!important}
.pkw.pkw-mf .ww-day .gt-row[aria-pressed="true"]{background:#E4312B!important}
.pkw.pkw-mf .ww-day .pk-box,.pkw.pkw-mf .ww-dawn .pk-box{position:relative;overflow:hidden;background:#FFFDF7!important;text-align:left}
.pkw.pkw-mf .ww-dawn .pk-box::after{content:"";position:absolute;right:4px;top:2px;width:46px;height:56px;background:${finger(INK, 0.22)} center/contain no-repeat}
.pkw.pkw-mf .ww-dawn .pk-box>*{position:relative;z-index:1}
.pkw.pkw-mf .ww-day .ww-p,.pkw.pkw-mf .ww-dawn .ww-p{color:${INK}!important}

/* Endseite: Akte mit Stempel */
.pkw.pkw-mf .ww-end{position:relative;margin-top:14px;border-radius:6px 22px 22px 22px;padding:30px 16px 20px!important;background:${CREAM};box-shadow:0 0 0 2.5px ${INK},0 7px 0 2.5px ${INK};width:100%;box-sizing:border-box;max-width:100%}
.pkw.pkw-mf .ww-end::before{content:"";position:absolute;left:0;top:-17px;width:96px;height:18px;background:${CREAM};border-radius:10px 10px 0 0;box-shadow:0 0 0 2.5px ${INK}}
.pkw.pkw-mf .ww-end::after{content:"";position:absolute;right:6px;top:8px;width:86px;height:86px;background:${stampRing(INK)} center/contain no-repeat;opacity:.5;transform:rotate(14deg);pointer-events:none}
.pkw.pkw-mf .ww-end .g-title{font-family:var(--pkf)!important;font-weight:400!important;font-size:31px!important;line-height:1.05;text-align:center;color:${INK}!important;border-top:2px solid ${INK};border-bottom:2px solid ${INK};padding:8px 0;width:100%}
.pkw.pkw-mf .ww-end .g-box{background:transparent!important;border:0!important;outline:none!important;box-shadow:none!important;max-width:100%!important;padding:0!important;gap:0!important;border-radius:0!important;color:${INK}}
.pkw.pkw-mf .ww-end .g-box>span{padding:9px 0;border-bottom:1.5px dotted rgba(20,20,20,.7)}
.pkw.pkw-mf .ww-end .g-box>span:nth-child(odd){padding-right:12px;font-family:var(--pkf);font-weight:400!important;font-size:16px!important;color:${INK}!important}
.pkw.pkw-mf .ww-end .g-box>span:nth-child(even){font-weight:700;font-size:13px;color:${INK};text-align:right}
.pkw.pkw-mf .ww-end .g-box .ww-dead{text-decoration:line-through;text-decoration-thickness:2.5px;opacity:.55}
.pkw.pkw-mf .ww-end .g-icon{width:84px;height:84px;border-radius:18px;background:${INK};color:${CREAM};display:flex;align-items:center;justify-content:center;transform:rotate(-3deg);outline:2.5px solid ${INK};outline-offset:3px}
.pkw.pkw-mf .ww-end .g-icon svg{width:54px;height:54px;color:${CREAM}}
.pkw.pkw-mf .ww-end[data-w="mafia"]{background:${INK};color:${CREAM}}
.pkw.pkw-mf .ww-end[data-w="mafia"]::before{background:${INK};box-shadow:0 0 0 2.5px ${CREAM}}
.pkw.pkw-mf .ww-end[data-w="mafia"]::after{background:${stampRing(CREAM)} center/contain no-repeat;opacity:.5}
.pkw.pkw-mf .ww-end[data-w="mafia"] .g-icon{background:${CREAM};color:${INK};outline-color:${CREAM}}
.pkw.pkw-mf .ww-end[data-w="mafia"] .g-icon svg{color:${INK}}
.pkw.pkw-mf .ww-end[data-w="mafia"] .g-title{color:${CREAM}!important;border-color:${CREAM};text-shadow:3px 3px 0 #E4312B}
.pkw.pkw-mf .ww-end[data-w="mafia"] .g-box>span,.pkw.pkw-mf .ww-end[data-w="mafia"] .g-box>span:nth-child(odd),.pkw.pkw-mf .ww-end[data-w="mafia"] .g-box>span:nth-child(even){color:${CREAM}!important;border-color:rgba(243,234,211,.6)}
.pkw.pkw-mf .ww-end[data-w="mafia"] .pk-prim{background:#E4312B!important;color:${CREAM}!important;outline-color:${CREAM}!important;box-shadow:0 5px 0 ${CREAM}!important}
.pkw.pkw-mf .ww-end[data-w="mafia"] button:not(.pk-prim){outline-color:${CREAM}!important;box-shadow:0 4px 0 rgba(243,234,211,.45)!important}
.pkw.pkw-mf .ww-end .g-btn{flex-wrap:wrap;justify-content:center}
.pkw.pkw-mf .ww-end .pk-prim::after{display:none}

@keyframes mf-pop{0%{transform:rotate(-3deg) scale(.7)}60%{transform:rotate(-3deg) scale(1.08)}100%{transform:rotate(-3deg) scale(1)}}
.pkw.pkw-mf .ww-ic,.pkw.pkw-mf .pk-rc-ic{animation:mf-pop .45s cubic-bezier(.23,1,.32,1) both}
@keyframes mf-stamp{0%{transform:rotate(14deg) scale(1.9);opacity:0}70%{transform:rotate(14deg) scale(.94);opacity:.6}100%{transform:rotate(14deg) scale(1);opacity:.5}}
.pkw.pkw-mf .ww-end::after{animation:mf-stamp .5s .25s cubic-bezier(.23,1,.32,1) both}
@media (prefers-reduced-motion:reduce){.pkw.pkw-mf .ww-ic,.pkw.pkw-mf .pk-rc-ic,.pkw.pkw-mf .ww-end::after{animation:none}}
@media (max-height:640px){.pkw.pkw-mf .ww-ic,.pkw.pkw-mf .pk-rc-ic{width:68px!important;height:68px!important}.pkw.pkw-mf .ww-ic svg,.pkw.pkw-mf .pk-rc-ic svg{width:40px!important;height:40px!important}}
`;
}

export { PkGlyph, PkIco, pkArtCss, pkWwCss, pkMfCss };
