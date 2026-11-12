// Zentrale Ansage-Region (AX-5): eine einmal gemountete aria-live="polite"-Region und eine role="alert"-Region,
// beide visuell versteckt. Aufruf von ueberall: gtAnnounce(text, "polite" | "assertive").
// Gemountet wird sie in boot.js als eigener kleiner Root (data-gt-keep: bleibt bei inert-Dialogen bedienbar/hoerbar).
// Zusatz (UX-10): nach dem Wiederherstellen liest sie das sessionStorage-Flag "gt_restored" und zeigt kurz eine Zeile.
import { React } from "../vendor/react-globals.js";
import { TRANSLATIONS } from "../i18n/translations.js";
import { GtToastHost } from "./toast.js";

const SR = { position: "absolute", width: 1, height: 1, margin: -1, padding: 0, overflow: "hidden", clip: "rect(0 0 0 0)", whiteSpace: "nowrap", border: 0 };
const RESTORED_KEY = "gt_restored";
let sink = null;
let pending = [];

function gtAnnounce(text, mode) {
  const item = { text: String(text == null ? "" : text), mode: mode === "assertive" ? "assertive" : "polite" };
  if (!item.text) return;
  if (sink) sink(item); else pending.push(item);
}

function gtNoteRestored(matches, groups) {
  try { sessionStorage.setItem(RESTORED_KEY, JSON.stringify({ m: matches | 0, g: groups | 0 })); } catch (_) { /* nur Komfort */ }
}

function restoredText() {
  let raw = null;
  try { raw = sessionStorage.getItem(RESTORED_KEY); sessionStorage.removeItem(RESTORED_KEY); } catch (_) { return ""; }
  if (!raw) return "";
  try {
    const o = JSON.parse(raw);
    const dict = TRANSLATIONS[document.documentElement.lang] || TRANSLATIONS.de;
    const fn = dict.gtBackupLoaded || TRANSLATIONS.de.gtBackupLoaded;
    return fn(o.m | 0, o.g | 0);
  } catch (_) { return ""; }
}

function GtLive() {
  const [polite, setPolite] = React.useState("");
  const [alertText, setAlertText] = React.useState("");
  const [line, setLine] = React.useState("");
  React.useEffect(() => {
    const timers = [];
    const later = (fn, ms) => { timers.push(setTimeout(fn, ms)); };
    const put = (item) => {
      const set = item.mode === "assertive" ? setAlertText : setPolite;
      set("");
      later(() => set(item.text), 60);
      later(() => set(""), 8000);
    };
    sink = put;
    const q = pending; pending = [];
    q.forEach(put);
    later(() => {
      const tx = restoredText();
      if (!tx) return;
      setLine(tx);
      put({ text: tx, mode: "polite" });
      later(() => setLine(""), 8000);
    }, 700);
    return () => { sink = null; timers.forEach(clearTimeout); };
  }, []);
  return <React.Fragment>
    <div style={SR} aria-live="polite" aria-atomic="true" data-gt-live="polite">{polite}</div>
    <div style={SR} role="alert" aria-atomic="true" data-gt-live="alert">{alertText}</div>
    {line && <div aria-hidden="true" data-gt-restored="" style={{ position: "fixed", left: 16, right: 16, bottom: "calc(14px + env(safe-area-inset-bottom))", margin: "0 auto", maxWidth: 420, boxSizing: "border-box", padding: "12px 16px", borderRadius: 16, background: "#1E202C", color: "#F3F4F8", border: "1px solid rgba(255,255,255,.2)", fontFamily: "'Inter', sans-serif", fontSize: 14, fontWeight: 600, lineHeight: 1.35, textAlign: "center", zIndex: 2147482000, pointerEvents: "none" }}>{line}</div>}
    <GtToastHost announce={gtAnnounce} />
  </React.Fragment>;
}

export { GtLive, gtAnnounce, gtNoteRestored };
