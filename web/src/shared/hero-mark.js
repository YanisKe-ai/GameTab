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
  // Ryū-Startseite: Kacheln genau mittig zwischen «ALL-IN-ONE» und Suche (nur per transform, nichts anderes verschiebt sich)
  React.useEffect(() => {
    if (!isPlakat() || document.documentElement.classList.contains("gt-laptopmode")) return undefined;
    const page = document.querySelector(".gtL-start");
    if (!page) return undefined;
    // Mit Layout-Positionen (offsetTop) rechnen: Animationen und Zurückwischen (transform) verfälschen sonst die Werte
    const absTop = (el) => { let y = 0; while (el) { y += el.offsetTop; el = el.offsetParent; } return y; };
    const fit = () => {
      try {
        const sub = page.querySelector(".gt-hero-sub div"), search = page.querySelector('[data-onboard="search"]');
        const a = page.querySelector('[data-onboard="scorepads-tile"] .gtL-tile'), b = page.querySelector('[data-onboard="party-tile"] .gtL-tile');
        if (!sub || !search || !a || !b) return;
        // Logo-Band: sichtbare Lage (Hero ist skaliert), auf die Seite bezogen und um Seiten-Skalierung bereinigt
        const P = page.getBoundingClientRect(), k = page.offsetHeight ? P.height / page.offsetHeight : 1;
        const gapTop = (sub.getBoundingClientRect().bottom - P.top) / (k || 1);
        // Kacheln und Suche: Layout-Lage (unabhängig von Einblend-Animationen und der eigenen Verschiebung)
        const base = absTop(page), gapBot = absTop(search) - base;
        const top = absTop(a) - base - 5, bot = absTop(b) - base + b.offsetHeight + 9;
        // Versatz durch Transforms der Vorfahren (sichtbar minus Layout), an der Suche gemessen
        const dv = (search.getBoundingClientRect().top - P.top) / (k || 1) - gapBot;
        const shift = Math.round((gapTop + gapBot - top - bot - dv) / 2);
        const curS = parseFloat(page.style.getPropertyValue("--pk-tshift"));
        if (isNaN(curS) || Math.abs(curS - shift) >= 2) page.style.setProperty("--pk-tshift", shift + "px");
      } catch (e) { /* nur Optik */ }
    };
    fit();
    const tms = [120, 400, 900, 1600].map((ms) => setTimeout(fit, ms));
    let ro = null;
    if (window.ResizeObserver) { ro = new ResizeObserver(() => fit()); ro.observe(page); }
    window.addEventListener("resize", fit);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(fit).catch(() => {});
    return () => { tms.forEach(clearTimeout); if (ro) ro.disconnect(); window.removeEventListener("resize", fit); page.style.removeProperty("--pk-tshift"); };
  }, []);
  // Nocturne-Startseite (Handy): Kacheln etwas höher; Suche und «Alle Spiele» gleichmässig zwischen Kacheln und Tippkarte.
  React.useEffect(() => {
    if (theme !== "dark" || isPlakat()) return undefined;
    const root = document.documentElement;
    if (root.classList.contains("gt-laptopmode") || root.hasAttribute("data-phone-landscape")) return undefined;
    const page = document.querySelector(".gtL-start");
    if (!page) return undefined;
    const UP = 16;
    const els = () => ({
      tiles: [page.querySelector('[data-onboard="scorepads-tile"]'), page.querySelector('[data-onboard="party-tile"]')],
      party: page.querySelector('[data-onboard="party-tile"] .gtL-tile'),
      search: page.querySelector('[data-onboard="search"]'),
      show: page.querySelector(".gtL-showcase"),
      tip: page.querySelector(".gtL-tipcard"),
      resume: page.querySelector(".gt-resume"),
    });
    const set = (el, y) => { if (el) el.style.translate = y ? "0 " + y + "px" : ""; };
    const fit = () => {
      try {
        const e = els();
        if (!e.party || !e.search || !e.show || !e.tip || e.tiles.some((x) => !x)) return;
        e.tiles.forEach((x) => set(x, -UP));
        if (e.resume) { set(e.search, 0); set(e.show, 0); return; }
        // sichtbare Lage ohne eigene Verschiebung (Einblend-Animationen sind dann fertig)
        const tr = (el) => { const v = parseFloat(String(el.style.translate || "").split(" ")[1]); return isNaN(v) ? 0 : v; };
        const top = (el) => el.getBoundingClientRect().top - tr(el);
        const pr = e.party.getBoundingClientRect();
        const A = pr.bottom - tr(e.tiles[1]) - UP;
        const s0 = top(e.search), h = e.search.getBoundingClientRect().height;
        const l0 = top(e.show), H = e.show.getBoundingClientRect().height;
        const T = e.tip.getBoundingClientRect().top - tr(e.tip);
        const g = (T - A - h - H) / 3;
        if (g < 6) { set(e.search, 0); set(e.show, 0); return; }
        set(e.search, Math.round(A + g - s0));
        set(e.show, Math.round(A + g + h + g - l0));
      } catch (err) { /* nur Optik */ }
    };
    fit();
    const tms = [150, 500, 1200].map((ms) => setTimeout(fit, ms));
    window.addEventListener("resize", fit);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(fit).catch(() => {});
    return () => { tms.forEach(clearTimeout); window.removeEventListener("resize", fit); const e = els(); e.tiles.forEach((x) => set(x, 0)); set(e.search, 0); set(e.show, 0); };
  }, [theme]);
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
