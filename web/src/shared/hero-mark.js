// Startseiten-Logo: «GAMETAB» in Bagel Fat One mit Drache dahinter (gewählt 2026-11-14).
// Drache mittig über dem Schriftzug, Halsende genau auf der Oberkante des «M», liegt hinter der Schrift.
// Drache als Maske, damit er pro Theme eingefärbt werden kann (Seitenverhältnis fix, keine Verzerrung).
import { React } from "../vendor/react-globals.js";
import { isPlakat } from "../themes/plakat.js";
import DRAGON_MASK from "../assets/img/gt-dragon-mask.webp";
import DRAGON_PLAKAT from "../assets/img/gt-dragon-plakat.webp";

const HM_COLORS = {
  plakat: { game: "#1A1716", tab: "#1A1716", dragon: "#1A1716", stroke: "#F3EAD3" },
  dark: { game: "#B48CFF", tab: "#FFD27A", dragon: "#FFECC8" },
  light: { game: "#111111", tab: "#111111", dragon: "#111111" },
  noir: { game: "#F2F2F2", tab: "#F2F2F2", dragon: "#F2F2F2" },
};

// Geometrie (gemessen mit Bagel Fat One): Schriftzug 376 breit, Schrift 79.4px, Grundlinie 146, M-Oberkante 88.2.
// Drache 820x235, Halsende bei 201/235 der Bildhöhe.
const HM_FONT = 79.4;
const HM_BASE = 146;
const HM_MTOP = 88.2;
const HM_DW = 330;
const HM_DH = HM_DW * 235 / 820;
const HM_DX = 320 - HM_DW / 2;
const HM_DY = HM_MTOP - HM_DH * 201 / 235;
const HM_VY = Math.floor(HM_DY - 2);
const HM_VB = "126 " + HM_VY + " 388 " + Math.ceil(166 - HM_VY);
// Plakat (2026-11-15, Entwurf S1): Drache mit Hals und Armen, 104 % der Schriftbreite, Unterkante 0.415em unter der Versalhöhe.
const PK_DW = 391, PK_DH = PK_DW * 235 / 769, PK_DX = 320 - PK_DW / 2, PK_DY = HM_MTOP + 0.415 * HM_FONT - PK_DH;
const PK_VB = "120 " + Math.floor(PK_DY - 4) + " 404 " + Math.ceil(176 - PK_DY);

const HM_CSS = ".gt-hero-mark{position:relative;width:var(--hm-w,330px);margin:0 auto}" +
  ".gt-hero-mark svg{display:block;width:100%;height:auto;overflow:visible}" +
  ".gt-hm-solo{display:block;aspect-ratio:820/235;-webkit-mask:var(--hm-mask) center/contain no-repeat;mask:var(--hm-mask) center/contain no-repeat}" +
  ".gtL-sidebar:not(.is-collapsed) .gtL-side-dragon{display:none!important}";

let hmUid = 0;

function GtHeroMark({ theme, width, className, style, markRef }) {
  const c = (isPlakat() ? HM_COLORS.plakat : HM_COLORS[theme]) || HM_COLORS.dark;
  const idRef = React.useRef(null);
  if (idRef.current === null) { hmUid += 1; idRef.current = "gthm" + hmUid; }
  const mid = idRef.current;
  if (isPlakat()) {
    return (
      <div ref={markRef} className={"gt-hero-mark gt-hero-mark-pk" + (className ? " " + className : "")} style={{ "--hm-w": width || "330px", ...style }}>
        <style>{HM_CSS}</style>
        <svg viewBox={PK_VB} role="img" aria-label="GameTab" style={{ transform: "rotate(-3deg)" }}>
          <defs>
            <mask id={mid} maskUnits="userSpaceOnUse" x={PK_DX} y={PK_DY} width={PK_DW} height={PK_DH}>
              <image href={DRAGON_PLAKAT} x={PK_DX} y={PK_DY} width={PK_DW} height={PK_DH} />
            </mask>
          </defs>
          <rect x={PK_DX} y={PK_DY} width={PK_DW} height={PK_DH} fill={c.dragon} mask={"url(#" + mid + ")"} />
          <text x="320" y={HM_BASE} textAnchor="middle" fontFamily="'Bagel Fat One', sans-serif" fontSize={HM_FONT} fill={c.game} stroke={c.stroke} strokeWidth={13} strokeLinejoin="round" paintOrder="stroke fill" style={{ filter: "drop-shadow(3.5px 3.5px 0 #1A1716) drop-shadow(3.5px 3.5px 0 #1A1716)" }}>GAMETAB</text>
        </svg>
      </div>
    );
  }
  return (
    <div ref={markRef} className={"gt-hero-mark" + (className ? " " + className : "")} style={{ "--hm-w": width || "330px", ...style }}>
      <style>{HM_CSS}</style>
      <svg viewBox={HM_VB} role="img" aria-label="GameTab">
        <defs>
          <mask id={mid} maskUnits="userSpaceOnUse" x={HM_DX} y={HM_DY} width={HM_DW} height={HM_DH}>
            <image href={DRAGON_MASK} x={HM_DX} y={HM_DY} width={HM_DW} height={HM_DH} />
          </mask>
        </defs>
        <rect x={HM_DX} y={HM_DY} width={HM_DW} height={HM_DH} fill={c.dragon} mask={"url(#" + mid + ")"} />
        <text x="320" y={HM_BASE} textAnchor="middle" fontFamily="'Bagel Fat One', sans-serif" fontSize={HM_FONT} stroke={c.stroke || undefined} strokeWidth={c.stroke ? 5 : undefined} paintOrder="stroke fill" style={c.stroke ? { filter: "drop-shadow(4px 5px 0 #141414)" } : undefined}>
          <tspan fill={c.game}>GAME</tspan>
          <tspan fill={c.tab}>TAB</tspan>
        </text>
      </svg>
    </div>
  );
}

// Nur der Drache (eingeklappte Laptop-Seitenleiste)
function GtHeroDragon({ theme, width, className }) {
  const c = (isPlakat() ? HM_COLORS.plakat : HM_COLORS[theme]) || HM_COLORS.dark;
  return <span className={"gt-hm-solo" + (className ? " " + className : "")} aria-hidden="true" style={{ width: width || 56, "--hm-mask": "url(" + DRAGON_MASK + ")", background: c.dragon }} />;
}

export { GtHeroMark, GtHeroDragon, HM_COLORS };
