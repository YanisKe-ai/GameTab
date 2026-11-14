// Startseiten-Logo: Monoton-Schriftzug «GAMETAB» mit liegendem Drachen (Konzept C, 2026-11-14).
// Drache als Maske, damit er pro Theme frei eingefärbt werden kann (keine Verzerrung: aspect-ratio fix).
import { React } from "../vendor/react-globals.js";
import DRAGON_MASK from "../assets/img/gt-dragon-mask.webp";

const HM_COLORS = {
  dark: { game: "#B48CFF", tab: "#FFD27A", dragon: "#FFECC8", dragonOpacity: 0.9, glow: 3 },
  light: { game: "#111111", tab: "#111111", dragon: "#111111", dragonOpacity: 1, glow: 0 },
  noir: { game: "#F2F2F2", tab: "#F2F2F2", dragon: "#F2F2F2", dragonOpacity: 0.85, glow: 3 },
};

const HM_CSS = ".gt-hero-mark{position:relative;width:var(--hm-w,330px);padding-top:calc(var(--hm-w,330px)*0.19);margin:0 auto}" +
  ".gt-hero-mark svg{display:block;width:100%;height:auto;position:relative;z-index:1;overflow:visible}" +
  ".gt-hero-mark .gt-hm-dragon{position:absolute;left:50%;top:0;width:91%;aspect-ratio:820/235;transform:translateX(-50%);z-index:2;pointer-events:none;" +
  "-webkit-mask:var(--hm-mask) center/contain no-repeat;mask:var(--hm-mask) center/contain no-repeat}"+
  ".gt-hm-solo{display:block;aspect-ratio:820/235;-webkit-mask:var(--hm-mask) center/contain no-repeat;mask:var(--hm-mask) center/contain no-repeat}"+
  ".gtL-sidebar:not(.is-collapsed) .gtL-side-dragon{display:none!important}";

let hmUid = 0;

function GtHeroMark({ theme, width, className, style, markRef }) {
  const c = HM_COLORS[theme] || HM_COLORS.dark;
  const idRef = React.useRef(null);
  if (idRef.current === null) { hmUid += 1; idRef.current = "gthm" + hmUid; }
  const fid = idRef.current;
  const glow = c.glow ? "url(#" + fid + ")" : undefined;
  return (
    <div ref={markRef} className={"gt-hero-mark" + (className ? " " + className : "")} style={{ "--hm-w": width || "330px", ...style }}>
      <style>{HM_CSS}</style>
      <svg viewBox="0 0 600 130" role="img" aria-label="GameTab">
        {c.glow ? (
          <defs>
            <filter id={fid} x="-20%" y="-60%" width="140%" height="220%">
              <feGaussianBlur stdDeviation={c.glow} result="b" />
              <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
            </filter>
          </defs>
        ) : null}
        <text x="300" y="100" textAnchor="middle" fontFamily="'Monoton', sans-serif" fontSize="96" letterSpacing="2" filter={glow}>
          <tspan fill={c.game}>GAME</tspan>
          <tspan fill={c.tab}>TAB</tspan>
        </text>
      </svg>
      <span className="gt-hm-dragon" aria-hidden="true" style={{ "--hm-mask": "url(" + DRAGON_MASK + ")", background: c.dragon, opacity: c.dragonOpacity }} />
    </div>
  );
}

// Nur der Drache (z. B. eingeklappte Laptop-Seitenleiste)
function GtHeroDragon({ theme, width, className }) {
  const c = HM_COLORS[theme] || HM_COLORS.dark;
  return <span className={"gt-hm-solo" + (className ? " " + className : "")} aria-hidden="true" style={{ width: width || 56, "--hm-mask": "url(" + DRAGON_MASK + ")", background: c.dragon }} />;
}

export { GtHeroMark, GtHeroDragon, HM_COLORS };
