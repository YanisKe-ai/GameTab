// Globaler Toast mit "Rueckgaengig" (Paket U3). Aufruf von ueberall: gtToast(text, { undo, undoLabel, ms = 8000 }).
// Ein Toast zugleich: ein neuer ersetzt den alten (der alte gilt damit als bestaetigt). Gemountet wird GtToastHost im GtLive-Root
// (data-gt-keep: bleibt bei inert-Dialogen bedienbar). Eintritt 200 ms, Austritt 150 ms (nur transform + opacity, ease-out),
// bei reduzierter Bewegung nur opacity. Pausiert bei Hover und Fokus (WCAG 2.2.1).
import { React } from "../vendor/react-globals.js";
import { TRANSLATIONS } from "../i18n/translations.js";

const OUT_MS = 150;
let sink = null;
let pending = null;
let seq = 0;

function dict() { return TRANSLATIONS[document.documentElement.lang] || TRANSLATIONS.de; }

function gtToast(text, opts) {
  const o = opts || {};
  const item = { id: ++seq, text: String(text == null ? "" : text), undo: typeof o.undo === "function" ? o.undo : null, label: o.undoLabel || dict().gtUndo || "Undo", ms: o.ms > 0 ? o.ms : 8000 };
  if (!item.text) return () => {};
  if (sink) sink(item); else pending = item;
  return () => { if (sink) sink({ close: item.id }); };
}

const CSS = "@keyframes gtToastIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}@keyframes gtToastOut{from{opacity:1;transform:none}to{opacity:0;transform:translateY(8px)}}@keyframes gtToastInR{from{opacity:0}to{opacity:1}}@keyframes gtToastOutR{from{opacity:1}to{opacity:0}}.gt-toast-card{animation:gtToastIn 200ms cubic-bezier(.23,1,.32,1) both}.gt-toast-card.is-out{animation:gtToastOut 150ms cubic-bezier(.23,1,.32,1) forwards}.gt-toast-btn{transition:transform 120ms ease-out}.gt-toast-btn:active{transform:scale(.96)}.gt-toast-btn:focus-visible{outline:2px solid currentColor;outline-offset:2px}@media (prefers-reduced-motion:reduce){.gt-toast-card{animation-name:gtToastInR}.gt-toast-card.is-out{animation-name:gtToastOutR}.gt-toast-btn{transition:none}.gt-toast-btn:active{transform:none}}";

function palette() {
  let th = "dark";
  try { th = document.documentElement.getAttribute("data-gt-theme") || "dark"; } catch (_) { /* Standard */ }
  if (th === "noir") return { bg: "#EDEDED", fg: "#000000", line: "rgba(0,0,0,.45)" };
  if (th === "light") return { bg: "#1B2235", fg: "#F3F4F8", line: "rgba(255,255,255,.4)" };
  return { bg: "#1E202C", fg: "#F3F4F8", line: "rgba(255,255,255,.4)" };
}

function GtToastHost({ announce }) {
  const [cur, setCur] = React.useState(null);
  const [out, setOut] = React.useState(false);
  const timer = React.useRef(null);
  const outTimer = React.useRef(null);
  const left = React.useRef(0);
  const startedAt = React.useRef(0);
  const curRef = React.useRef(null);
  const used = React.useRef(false);

  const clear = () => { clearTimeout(timer.current); clearTimeout(outTimer.current); };
  const close = React.useCallback(() => {
    clearTimeout(timer.current);
    setOut(true);
    clearTimeout(outTimer.current);
    outTimer.current = setTimeout(() => { curRef.current = null; setCur(null); setOut(false); }, OUT_MS);
  }, []);
  const run = (ms) => { clearTimeout(timer.current); left.current = ms; startedAt.current = Date.now(); timer.current = setTimeout(close, ms); };

  React.useEffect(() => {
    const show = (item) => {
      if (item.close != null) { if (curRef.current && curRef.current.id === item.close) close(); return; }
      clear();
      used.current = false;
      curRef.current = item;
      setOut(false);
      setCur(item);
      run(item.ms);
      if (announce) announce(item.undo ? item.text + " " + item.label : item.text, "polite");
    };
    sink = show;
    if (pending) { const p = pending; pending = null; show(p); }
    return () => { sink = null; clear(); };
  }, []);

  const pause = () => { if (!curRef.current || out) return; clearTimeout(timer.current); left.current = Math.max(2000, left.current - (Date.now() - startedAt.current)); };
  const resume = () => { if (!curRef.current || out) return; run(left.current); };
  const doUndo = () => {
    const it = curRef.current;
    if (!it || used.current) return;
    used.current = true;
    close();
    try { if (it.undo) it.undo(); } catch (_) { /* Rueckgaengig darf die App nie stoeren */ }
    if (announce) announce(dict().gtToastUndone || "", "polite");
  };

  if (!cur) return null;
  const c = palette();
  return <div data-gt-toast-host="" style={{ position: "fixed", left: 16, right: 16, bottom: "calc(14px + env(safe-area-inset-bottom))", margin: "0 auto", maxWidth: 420, zIndex: 2147482000, pointerEvents: "none" }}>
    <style>{CSS}</style>
    <div key={cur.id} role="status" data-gt-toast="" className={"gt-toast-card" + (out ? " is-out" : "")} onPointerEnter={pause} onPointerLeave={resume} onFocus={pause} onBlur={resume} style={{ pointerEvents: "auto", display: "flex", alignItems: "center", gap: 12, boxSizing: "border-box", padding: "6px 8px 6px 16px", minHeight: 52, borderRadius: 16, background: c.bg, color: c.fg, border: "1px solid " + c.line, boxShadow: "0 10px 30px rgba(0,0,0,.35)", fontFamily: "'Inter', sans-serif", fontSize: 14, fontWeight: 600, lineHeight: 1.35 }}>
      <span style={{ flex: 1, minWidth: 0, overflowWrap: "anywhere" }}>{cur.text}</span>
      {cur.undo && <button type="button" data-gt-toast-undo="" className="gt-toast-btn" onClick={doUndo} style={{ flex: "none", minHeight: 44, minWidth: 44, padding: "0 14px", borderRadius: 12, border: "1px solid " + c.line, background: "transparent", color: c.fg, font: "700 14px 'Inter', sans-serif", cursor: "pointer" }}>{cur.label}</button>}
    </div>
  </div>;
}

export { gtToast, GtToastHost };
