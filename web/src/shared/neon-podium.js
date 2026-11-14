// Neon-Haengeschild als Siegesbildschirm (ersetzt die Bloecke, Entwurf "H-b Herabgelassen", 12.11.2026).
// Farben: Haupt- und Zweitroehre aus den Titel-Schriftzuegen (shared/game-header.js), in OKLCH auf Neon-Helligkeit gebracht.
// Hell bleibt Neon auf dunkler Wand; Noir leuchtet weiss (auch das Logo).
import { GtNeonDuel } from "./neon-duel.js";
import { React } from "../vendor/react-globals.js";
import { useEffect, useRef, useState } from "../prelude.js";
import GT_NEON_LOGO from "../assets/img/gt-logo-neon.webp";

// [Kern Hauptroehre, Gluehen Hauptroehre, Kern Zweitroehre, Gluehen Zweitroehre]
const GT_NEON_COL = {"skyjo":["#D8FEEE","#13DAA7","#EEF4FF","#6D9AFF"],"phase10":["#ECF4FF","#569FFF","#FFF2D6","#FBC100"],"romme":["#FFEEF3","#FB5C9E","#F6F0FF","#B97CF8"],"jass-differenzler":["#FFF9F3","#F0CA9B","#FFEFED","#FF6459"],"schieber":["#FDFAF1","#F0CA9B","#D9FEEB","#00BB85"],"schieber-turnier":["#FDFAF1","#F0CA9B","#D9FEEB","#00BB85"],"darts":["#FFEFEE","#FF635E","#FFF2D6","#E7C77B"],"cricket":["#DBFDE9","#18D188","#FFF3D2","#F2C535"],"shanghai":["#EAF5FF","#4FB0FF","#FFEFED","#FF6B5E"],"hiscore":["#DEF9FF","#00D4F0","#FFF2DC","#FFBE38"],"splitscore":["#F7F0FF","#BA7BFA","#DEF9FF","#00D4F0"],"wizard":["#FFF2DA","#F1B526","#F3F1FF","#A486FF"],"minigolf":["#E5FBDE","#7ADA4F","#FFEFEE","#FF6364"],"mafia":["#FFF2DC","#D99B00","#FFEFEE","#FF6362"],"impostor":["#FBEEFF","#DD5AFF","#FFF2D8","#F7C033"],"werwolf":["#FEF3D2","#F0C635","#F2F2FF","#958DFF"],"mostlikely":["#D3FEF6","#00D5BF","#FFEEF5","#FF6FB5"],"traitor":["#E7FBDD","#7CC054","#FFEFEF","#F07079"],"tabu":["#F6F1FF","#B47DFF","#FEF9F1","#F0CA9B"],"headsup":["#EFF3FF","#9DB4FF","#E6F6FF","#4AC9FF"],"fivesec":["#FFF0E6","#FF9640","#FEF9F1","#F0CA9B"],"flip7":["#FFF0EA","#FF7A3D","#FEF9F1","#F0CA9B"],"yatzy":["#F1F3FF","#8C90FF","#FEF9F1","#F0CA9B"],"tutto":["#FFEFEE","#FF6265","#FEF9F1","#F0CA9B"],"freeplay":["#FAEFFF","#C37DE1","#FCF8FF","#F0CA9B"],"jass":["#FFEFED","#FF6552","#DEFDE5","#39BA6E"]};
const GT_NEON_WHITE = ["#FFFFFF", "#E9E9E9", "#FFFFFF", "#D6D6D6"];

function gtNeonCol(gameId, theme) {
  if (theme === "noir") return GT_NEON_WHITE;
  const id = String(gameId || "");
  return GT_NEON_COL[id] || GT_NEON_COL[id.split("-")[0]] || GT_NEON_COL.skyjo;
}
function gtRgba(hex, a) { const n = parseInt(hex.slice(1), 16); return `rgba(${n >> 16 & 255},${n >> 8 & 255},${n & 255},${a})`; }
function gtNeonVars(core, glow) { return { "--c": core, "--g1": glow, "--g2": gtRgba(glow, 0.75) }; }

const CHAIN_URI = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='24'%3E%3Cdefs%3E%3ClinearGradient id='m' x1='0' x2='1'%3E%3Cstop offset='0' stop-color='%23545060'/%3E%3Cstop offset='.45' stop-color='%23C9C5D2'/%3E%3Cstop offset='1' stop-color='%23403C4A'/%3E%3C/linearGradient%3E%3C/defs%3E%3Cellipse cx='6' cy='6' rx='3.7' ry='5.6' fill='none' stroke='url(%23m)' stroke-width='2.2'/%3E%3Crect x='4.9' y='10.5' width='2.2' height='13' rx='1.1' fill='url(%23m)'/%3E%3C/svg%3E";
const NOISE_URI = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.75' numOctaves='3'/%3E%3CfeColorMatrix values='0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 .55 0'/%3E%3C/filter%3E%3Crect width='160' height='160' filter='url(%23n)'/%3E%3C/svg%3E";
const LIT = "color:var(--c);text-shadow:0 0 3px #fff,0 0 9px var(--g1),0 0 22px var(--g2),0 0 44px var(--g2)";
const GT_NEON_CSS = `
.gtn-l{display:inline-block;color:#34313A;text-shadow:0 1px 0 rgba(255,255,255,.07),0 -1px 0 rgba(0,0,0,.6)}
.gtn-lit .gtn-l{${LIT}}
.gtn-w{white-space:nowrap}
.gtn-num::before{content:attr(data-n)}
[data-gt-podium] .gtsb-name{font:inherit;letter-spacing:inherit}
@keyframes gtnOn{0%{color:#34313A;text-shadow:0 1px 0 rgba(255,255,255,.07)}5%{${LIT}}8%{color:#4A4650;text-shadow:0 0 6px var(--g2)}15%{${LIT}}18%{color:#34313A;text-shadow:none}24%{color:#4A4650;text-shadow:0 0 6px var(--g2)}30%,100%{${LIT}}}
@keyframes gtnBuzz{0%,90%{${LIT}}91%{color:#4A4650;text-shadow:0 0 6px var(--g2)}92.5%{${LIT}}94%{color:#4A4650;text-shadow:0 0 6px var(--g2)}95.5%,100%{${LIT}}}
@keyframes gtnWall{0%{opacity:0}6%{opacity:.5}9%{opacity:.1}16%{opacity:.6}20%{opacity:.15}35%{opacity:.8}100%{opacity:1}}
@keyframes gtnLogoF{0%{filter:none}5%{filter:drop-shadow(0 0 2px var(--g1)) drop-shadow(0 0 10px var(--g2))}9%{filter:none}16%{filter:drop-shadow(0 0 2px var(--g1)) drop-shadow(0 0 10px var(--g2))}19%{filter:none}30%,100%{filter:drop-shadow(0 0 2px var(--g1)) drop-shadow(0 0 9px var(--g2)) drop-shadow(0 0 22px var(--g2))}}
@keyframes gtnLogoB{0%{background:#3A3640}5%{background:var(--c)}9%{background:#4A4650}16%{background:var(--c)}19%{background:#3A3640}30%,100%{background:var(--c)}}
@keyframes gtnFade{0%{opacity:0}100%{opacity:1}}
.gtn-run .gtn-l{animation:gtnOn .9s linear both}
.gtn-run .gtn-buzz{animation:gtnOn .9s linear both,gtnBuzz 5.2s linear infinite}
.gtn-lit .gtn-buzz{animation:gtnBuzz 5.2s linear 2s infinite}
.gtn-logo{-webkit-mask:url(${GT_NEON_LOGO}) center/contain no-repeat;mask:url(${GT_NEON_LOGO}) center/contain no-repeat;background:#3A3640}
.gtn-lit .gtn-logo{background:var(--c)}
.gtn-lit .gtn-logof{filter:drop-shadow(0 0 2px var(--g1)) drop-shadow(0 0 9px var(--g2)) drop-shadow(0 0 22px var(--g2))}
.gtn-btn{min-height:52px;border-radius:26px;font:400 20px/1 'Tilt Neon','Inter',sans-serif;cursor:pointer;-webkit-tap-highlight-color:transparent}
.gtn-btn:active{transform:scale(.97)}
.gtn-btn:focus-visible,.gtn-x:focus-visible{outline:2px solid #fff;outline-offset:3px}
html[data-gt-podium-open] .gt-gamehead,html[data-gt-podium-open] .gt-headbtns{visibility:hidden!important}
.gtn-sr{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap}
.gtn-ranks::-webkit-scrollbar{display:none}
@media (prefers-reduced-motion: reduce){.gtn-run .gtn-l,.gtn-run .gtn-buzz{animation:none;${LIT}}}
`;

// Schriftzeichen einzeln, Woerter bleiben ganz (Umbruch nur zwischen Woertern)
function NeonText({ text, start, step, run, buzzLast }) {
  const words = String(text == null ? "" : text).split(/\s+/).filter(Boolean);
  let k = 0;
  return words.map((w, wi) => {
    const chars = Array.from(w);
    const span = <span key={wi} className="gtn-w">{chars.map((ch, ci) => {
      const d = start + (k++) * step;
      const last = buzzLast && wi === words.length - 1 && ci === chars.length - 1;
      return <span key={ci} className={"gtn-l" + (last ? " gtn-buzz" : "")} style={run ? { animationDelay: last ? `${d.toFixed(2)}s,${(d + 2.6).toFixed(2)}s` : `${d.toFixed(2)}s` } : undefined}>{ch}</span>;
    })}</span>;
    return wi < words.length - 1 ? [span, " "] : span;
  });
}

// Herablassen: Motor (smootherstep) bis 2.8 s, dann kurzer Ruck und kleines Auspendeln (gerechnet wie im Entwurf)
function gtNeonDrop() {
  const fr = [], FPS = 30, DUR = 6;
  const motor = t => { const u = Math.min(1, t / 2.8); return u * u * u * (u * (6 * u - 15) + 10); };
  for (let i = 0; i <= DUR * FPS; i++) {
    const t = i / FPS; let y = -640 * (1 - motor(t)), th = 0;
    if (t > 2.8) { const u = t - 2.8; y += 9 * Math.exp(-1.6 * u) * Math.sin(2 * Math.PI * 2.4 * u); th = 1.4 * Math.exp(-0.55 * u) * Math.sin(2 * Math.PI * u / 1.5); }
    th += 0.3 * Math.sin(2 * Math.PI * t / 1.5) * (1 - motor(t));
    fr.push({ transform: `translateY(${y.toFixed(1)}px) rotate(${th.toFixed(2)}deg)` });
  }
  return { fr, ms: DUR * 1000 };
}

function gtFmt(v) {
  if (v == null || v === "") return "";
  const s = String(v);
  if (!/^-?\d{1,9}(\.\d{1,2})?$/.test(s)) return s;
  const d = s.indexOf(".") < 0 ? 0 : s.length - s.indexOf(".") - 1;
  try { return Intl.NumberFormat("de-CH", { minimumFractionDigits: d, maximumFractionDigits: d }).format(Number(s)).replace(/'/g, "’").replace(/^-/, "−"); } catch (e) { return s; }
}

// Name passt sich der Breite an: zuerst einzeilig gross, sonst bis zwei Zeilen, nie im Wort getrennt
function useFitName(ref, deps) {
  React.useLayoutEffect(() => {
    const el = ref.current; if (!el) return;
    const fit = () => {
      const w = el.clientWidth; if (!w) return;
      let fs = 92; el.style.fontSize = fs + "px";
      const words = Array.from(el.querySelectorAll(".gtn-w"));
      const tooWide = () => words.some(x => x.offsetWidth > w + 0.5);
      const lines = () => Math.round(el.scrollHeight / (fs * 1.06));
      while (fs > 56 && (tooWide() || lines() > 1)) { fs -= 2; el.style.fontSize = fs + "px"; }
      while (fs > 30 && (tooWide() || lines() > 2)) { fs -= 2; el.style.fontSize = fs + "px"; }
    };
    fit();
    let ro = null; try { ro = new ResizeObserver(fit); ro.observe(el); } catch (e) { ro = null; }
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(fit, () => {});
    return () => { if (ro) ro.disconnect(); };
  }, deps);
}

export function GtNeonPodium({ phase, ranked, ranks, gameId, gameLabel, theme, t, play, onClose, onEnd, onSkip, onRestart, extraAct, onShare, isSharing, playCount, hideCount, bestRecord, noteEl, achvEl, dlgRef }) {
  const [pc, pg, sc, sg] = gtNeonCol(gameId, theme);
  const P = gtNeonVars(pc, pg), S = gtNeonVars(sc, sg);
  const rigRef = useRef(null), nameRef = useRef(null), wrapRef = useRef(null), boardRef = useRef(null);
  const [rt, setRt] = useState(470);
  const run = !!play;
  const [k, setK] = useState(1);
  const [land, setLand] = useState(false);
  const [fh, setFh] = useState(800);
  const winners = ranked.filter((e, i) => ranks[i] === 1);
  const others = ranked.map((e, i) => ({ e, i })).filter(o => ranks[o.i] !== 1);
  const T0 = 2.75;
  // Spielkopf ausblenden, solange das Schild offen ist (sonst liegt er ueber dem Schild und ist nicht klickbar)
  React.useLayoutEffect(() => {
    const root = document.documentElement;
    const n = (+root.getAttribute("data-gt-podium-open") || 0) + 1;
    root.setAttribute("data-gt-podium-open", String(n));
    return () => { const m = (+root.getAttribute("data-gt-podium-open") || 1) - 1; if (m > 0) root.setAttribute("data-gt-podium-open", String(m)); else root.removeAttribute("data-gt-podium-open"); };
  }, []);
  // Bereich unter dem Schild scrollt in sich: weicher Rand oben/unten, wo noch Inhalt ist
  const scrRef = useRef(null);
  const [fade, setFade] = useState({ t: false, b: false });
  React.useLayoutEffect(() => {
    const el = scrRef.current; if (!el) return;
    const u = () => { const t2 = el.scrollTop > 2, b2 = el.scrollTop + el.clientHeight < el.scrollHeight - 2; setFade(f => (f.t === t2 && f.b === b2 ? f : { t: t2, b: b2 })); };
    u(); el.addEventListener("scroll", u, { passive: true });
    let ro = null; try { ro = new ResizeObserver(u); ro.observe(el); Array.from(el.children).forEach(c => ro.observe(c)); } catch (e) { ro = null; }
    const mo = new MutationObserver(u); mo.observe(el, { childList: true, subtree: true });
    return () => { el.removeEventListener("scroll", u); if (ro) ro.disconnect(); mo.disconnect(); };
  }, []);
  useFitName(nameRef, [winners.map(w => w && w.name).join("|")]);
  React.useLayoutEffect(() => {
    if (!run || !rigRef.current || typeof rigRef.current.animate !== "function") return;
    const { fr, ms } = gtNeonDrop();
    const a = rigRef.current.animate(fr, { duration: ms, easing: "linear", fill: "backwards" });
    return () => { try { a.cancel(); } catch (e) {} };
  }, [run]);
  React.useLayoutEffect(() => {
    const el = boardRef.current; if (!el) return;
    const m = () => setRt(Math.min(560, 140 + el.offsetHeight + 46));
    m(); let ro = null; try { ro = new ResizeObserver(m); ro.observe(el); } catch (e) { ro = null; }
    return () => { if (ro) ro.disconnect(); };
  }, []);
  React.useLayoutEffect(() => {
    const fit = () => { const vh = window.innerHeight || 800; const vw = window.innerWidth || 390; const ld = vw > vh && vh < 560; setLand(ld); const kk = ld ? Math.max(0.4, Math.min(1, (vh - 8) / 800)) : Math.max(0.55, Math.min(1, (vh - 8) / 800, vw / 390)); setK(kk); setFh(Math.max(800, Math.round(vh / kk))); };
    fit(); window.addEventListener("resize", fit); return () => window.removeEventListener("resize", fit);
  }, []);
  const wsc = winners.length ? gtFmt(winners[0].score) : "";
  const label = (gameLabel ? gameLabel + " " : "") + t("podiumTitle");
  const glow = pg;
  const anim = (name, dur, delay) => run ? { animation: `${name} ${dur}s linear ${delay}s both` } : undefined;
  return <div onClick={() => { if (onSkip()) return; if (!onEnd) onClose(); }} className="gt-scrim-in" style={{ position: "fixed", inset: 0, zIndex: 130, background: "linear-gradient(180deg,#1B1722 0%,#141119 64%,#0F0D13 100%)", overflow: "hidden" }}>
    <style>{GT_NEON_CSS}</style>
    <div aria-hidden style={{ position: "absolute", inset: 0, opacity: 0.5, background: `url("${NOISE_URI}")` }} />
    <div ref={wrapRef} style={{ position: "absolute", left: "50%", top: 0, width: 390, height: fh, marginLeft: -195, transform: `scale(${k})`, transformOrigin: "50% 0" }}>
      <div ref={dlgRef} data-gt-podium="1" role="dialog" aria-modal="true" aria-label={label} onClick={e => { e.stopPropagation(); onSkip(); }} className={(run ? "gtn-run" : "gtn-lit") + " gtsb-" + (phase || "done")} style={{ position: "absolute", inset: 0, fontFamily: "'Tilt Neon','Inter',sans-serif", color: "#FFF4E6" }}>
        <div ref={rigRef} style={{ position: "absolute", left: 0, right: 0, top: 0, height: 800, transformOrigin: "195px -420px" }}>
          {[92, 298].map(x => <div key={x} aria-hidden style={{ position: "absolute", left: x - 6, top: -760, width: 12, height: 900, background: `url("${CHAIN_URI}") 0 0/12px 24px repeat-y`, filter: "drop-shadow(0 2px 2px rgba(0,0,0,.5))" }} />)}
          <div aria-hidden style={{ position: "absolute", left: 306, top: -760, width: 3, height: 900, borderRadius: 2, background: "linear-gradient(90deg,#1C1A21,#3A3743,#1C1A21)" }} />
          <div style={{ position: "absolute", left: 34, right: 34, top: 140 }}>
            <div aria-hidden style={{ position: "absolute", left: -70, right: -70, top: -60, height: 420, background: `radial-gradient(48% 44% at 50% 50%,${gtRgba(glow, 0.3)},${gtRgba(glow, 0.07)} 60%,transparent 76%)`, pointerEvents: "none", ...(anim("gtnWall", 1.6, 3) || {}) }} />
            {[58, 264].map(x => <div key={x} aria-hidden style={{ position: "absolute", left: x - 6, top: -6, width: 12, height: 12, borderRadius: "50%", border: "2.5px solid #A9A5B3", boxSizing: "border-box" }} />)}
            <div ref={boardRef} style={{ position: "relative", padding: "20px 16px 24px", borderRadius: 20, background: "linear-gradient(180deg,rgba(58,52,68,.62),rgba(28,24,34,.86))", border: "1px solid rgba(255,255,255,.13)", boxShadow: "inset 0 1px 0 rgba(255,255,255,.16),inset 0 -2px 0 rgba(0,0,0,.4),0 6px 0 -1px #0B0A0E,0 38px 60px rgba(0,0,0,.55)", textAlign: "center" }}>
              <div aria-hidden style={{ position: "absolute", inset: 0, borderRadius: "inherit", background: "linear-gradient(115deg,rgba(255,255,255,.10),transparent 32%,transparent 70%,rgba(255,255,255,.05))", pointerEvents: "none" }} />
              {["left:12px;top:12px", "right:12px;top:12px", "left:12px;bottom:12px", "right:12px;bottom:12px"].map(p => { const o = {}; p.split(";").forEach(kv => { const [a, b] = kv.split(":"); o[a] = b; }); return <div key={p} aria-hidden style={{ position: "absolute", ...o, width: 9, height: 9, borderRadius: "50%", background: "radial-gradient(circle at 35% 30%,#E9E6F0,#6E6A78 60%,#3A3741)" }} />; })}
              <div aria-hidden className="gtn-logof" style={{ ...P, width: 150, height: 63, margin: "0 auto", ...(anim("gtnLogoF", 0.9, T0) || {}) }}><div className="gtn-logo" style={{ width: "100%", height: "100%", ...(anim("gtnLogoB", 0.9, T0) || {}) }} /></div>
              <span className="gtn-sr">{label}</span>
              {gameLabel && <div style={{ ...S, font: "400 22px/1 'Tilt Neon','Inter',sans-serif", marginTop: 10 }}><NeonText text={gameLabel} start={T0 + 0.25} step={0.04} run={run} /></div>}
              <div ref={nameRef} dir="auto" style={{ ...P, font: "400 96px/1.06 'Tilt Neon','Inter',sans-serif", marginTop: 8, letterSpacing: "-.01em", overflowWrap: "normal", wordBreak: "keep-all", hyphens: "manual" }}>
                {winners.map((w, wi) => <div key={wi} className="gtsb-name"><span className="gtsb-sr gtn-sr">{"1. "}</span><NeonText text={w && w.name} start={T0 + 0.55 + wi * 0.4} step={0.14} run={run} /></div>)}
              </div>
              {wsc !== "" && <div dir="ltr" style={{ ...S, font: "400 40px/1 'Tilt Neon','Inter',sans-serif", marginTop: 8 }}><NeonText text={wsc} start={T0 + 1.4} step={0.05} run={run} /></div>}
            </div>
          </div>
        </div>
        <div ref={scrRef} data-gt-podium-scroll="" style={{ position: "absolute", left: 22, right: 22, top: rt, bottom: onEnd && !land ? "calc(env(safe-area-inset-bottom, 0px) + 134px)" : "calc(env(safe-area-inset-bottom, 0px) + 92px)", display: "flex", flexDirection: "column", alignItems: "center", overflowY: "auto", overscrollBehavior: "contain", scrollbarWidth: "none", paddingBottom: 6, ...((fade.t || fade.b) ? (m => ({ WebkitMaskImage: m, maskImage: m }))(`linear-gradient(180deg,${fade.t ? "transparent 0,#000 16px" : "#000 0"},${fade.b ? "#000 calc(100% - 22px),transparent 100%" : "#000 100%"})`) : null) }}>
          {others.length > 0 && <ol className="gtn-ranks" style={{ listStyle: "none", margin: 0, padding: 0, width: "100%", flexShrink: 0, maxHeight: 170, overflowY: "auto", scrollbarWidth: "none", pointerEvents: "auto", ...S }}>
            {others.map(({ e, i }, n) => { const r = ranks[i]; const d = 4.4 + n * 0.22; return <li key={i} style={{ display: "flex", justifyContent: "center", alignItems: "baseline", gap: 10, font: "400 22px/1.2 'Tilt Neon','Inter',sans-serif", marginTop: n ? 8 : 0 }}>
              <span>{i < 3 ? <span className="gtsb-name"><span className="gtsb-sr gtn-sr">{r + ". "}</span><span aria-hidden className="gtn-l gtn-num" data-n={r + "."} style={run ? { animationDelay: `${d.toFixed(2)}s` } : undefined} /></span> : <span aria-hidden className="gtn-l gtn-num" data-n={r + "."} style={run ? { animationDelay: `${d.toFixed(2)}s` } : undefined} />}</span>
              <span dir="auto" style={{ minWidth: 0, overflowWrap: "normal" }}><NeonText text={e && e.name} start={d + 0.05} step={0.035} run={run} /></span>
              {gtFmt(e && e.score) !== "" && <span aria-hidden style={{ opacity: 0.55 }}>·</span>}<span dir="ltr" style={{ opacity: 0.85 }}><NeonText text={gtFmt(e && e.score)} start={d + 0.25} step={0.04} run={run} /></span>
            </li>; })}
          </ol>}
          {(playCount > 0 && !hideCount) && <div style={{ flexShrink: 0, marginTop: 14, font: "400 15px/1.3 'Inter',sans-serif", color: "#9E97A8", ...(anim("gtnFade", 0.6, 5) || {}) }}>{t("gamesPlayedTogether")(playCount)}</div>}
          <GtNeonDuel ranked={ranked} ranks={ranks} gameId={gameId} t={t} run={run} col={pg} theme={theme} />
          {bestRecord && bestRecord.isNew && <div style={{ marginTop: 6, font: "700 13px/1.3 'Inter',sans-serif", color: sc }}>{t("newPersonalBest")}</div>}
          {noteEl && <div style={{ marginTop: 8, font: "400 14px/1.4 'Inter',sans-serif", color: "#E8E2EE", textAlign: "center", pointerEvents: "auto" }}>{noteEl}</div>}
          {achvEl && <div style={{ flexShrink: 0, pointerEvents: "auto", marginTop: 8 }}>{achvEl}</div>}
        </div>
        {!onEnd && <button onClick={e => { e.stopPropagation(); onClose(); }} className="gtn-x gtsb-x press-fx" aria-label={t("stxClose")} style={{ position: "absolute", right: 18, top: "calc(env(safe-area-inset-top, 0px) + 14px)", width: 44, height: 44, borderRadius: 22, border: "1.5px solid rgba(255,244,230,.3)", background: "rgba(20,17,25,.5)", color: "#FFF4E6", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}><svg width={20} height={20} viewBox="0 0 24 24" fill="none" aria-hidden><path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth={2.6} strokeLinecap="round" /></svg></button>}
        <div style={land ? { position: "absolute", left: 404, bottom: 24, width: 210, display: "flex", flexDirection: "column", gap: 10, transform: `scale(${(1 / k).toFixed(4)})`, transformOrigin: "0 100%" } : { position: "absolute", left: 22, right: 22, bottom: "calc(env(safe-area-inset-bottom, 0px) + 22px)", display: "flex", flexWrap: "wrap", gap: 12 }}>
          {(onRestart || extraAct) && <button onClick={e => { e.stopPropagation(); if (extraAct) { extraAct.onClick(); return; } onRestart(); onClose(); }} className="gtn-btn" style={{ flex: land ? "none" : (onEnd ? "1 1 40%" : 1), border: `2px solid ${pg}`, background: gtRgba(pg, 0.08), color: pc, textShadow: `0 0 8px ${gtRgba(pg, 0.9)}`, boxShadow: `0 0 14px ${gtRgba(pg, 0.45)},inset 0 0 12px ${gtRgba(pg, 0.25)}` }}>{extraAct ? extraAct.label : t("rematch")}</button>}
          {onEnd && <button onClick={e => { e.stopPropagation(); onEnd(); }} className="gtn-btn" data-gt-podium-end="" style={{ flex: land ? "none" : "1 1 40%", border: "2px solid rgba(255,244,230,.55)", background: "rgba(20,17,25,.4)", color: "#FFF4E6" }}>{t("apEnd")}</button>}
          <button onClick={e => { e.stopPropagation(); onShare(); }} disabled={isSharing} aria-label={t("shareResultAria")} className="gtn-btn" style={onEnd && !land ? { flex: "1 1 100%", minHeight: 44, border: "none", background: "transparent", color: "#CFC6D6", fontSize: 17, textDecoration: "underline", textUnderlineOffset: 4 } : { flex: land ? "none" : 1, border: "2px solid rgba(255,244,230,.55)", background: "rgba(20,17,25,.4)", color: "#FFF4E6" }}>{t("shareResultLabel")}</button>
        </div>
      </div>
    </div>
  </div>;
}
