// Handy-Querformat: Erkennung und Root-Attribut `data-phone-landscape` auf <html>.
//
// Aktiv NUR, wenn ALLE Bedingungen gelten (siehe decidePhoneLandscape):
//  1. Ansicht ist nicht "laptop" (selbst gewaehlt). Bei "auto" gilt: Querformat-Handy hat Vorrang vor der Breitenregel.
//  2. Geraet mit Touch (navigator.maxTouchPoints > 0 oder any-pointer: coarse). Schliesst kleine
//     Desktop-Fenster aus. Allein reicht Touch nicht (Tablets, Touch-Laptops), darum zusaetzlich 3.
//  3. Handy-Abmessungen: kurze Bildschirmseite (screen.width/height, sonst Fenster) <= 500 CSS px.
//     iPhone Pro Max 430, grosse Android-Handys ~412 bis 480; iPad mini 744, Tablets >= 600: aus.
//  4. Echte Drehung ins Querformat, Quelle in dieser Reihenfolge:
//     screen.orientation.type (Chrome, Safari ab 16.4) -> window.orientation +-90 (aeltere iOS-Safari)
//     -> screen.width > screen.height (Android dreht screen mit) -> matchMedia(orientation: landscape).
//     Alle ausser dem letzten Rueckfall sind unabhaengig von der Bildschirmtastatur. Eine Tastatur im
//     Hochformat (Fenster dadurch breiter als hoch) loest darum NICHT aus; Drehen mit offenem
//     Eingabefeld schon, weil sich die Orientierung selbst aendert.
//  5. Das Layout-Fenster ist tatsaechlich breiter als hoch (innerWidth > innerHeight). Schliesst z.B.
//     Split-Screen im Querformat mit hochkantem Fenster aus.
// visualViewport wird NICHT fuer die Entscheidung benutzt, nur fuer die verfuegbare Hoehe (--pl-vvh).
//
// Grenzen: keine perfekte Geraeteerkennung. Ein Handy mit kurzer Seite > 500 px (selten, z.B. sehr
// grosse Foldables aufgeklappt) gilt als Tablet. Echte Geraete (Safari, Chrome, PWA) noch pruefen.
//
// Test-Uebersteuerung (nur fuer Tests, nie fuer Nutzer): URL `?pl=1` / `?pl=0` oder
// localStorage `gametab-pl-force` = "1" / "0". URL hat Vorrang. Laptop-Modus bleibt immer aus.
//
// Erster Paint: das Inline-Script in web/index.html setzt das Attribut schon vor React mit derselben
// Regel (Spiegel zwischen den Markern pl-decide-begin/-end, beide werden in
// tests/logic/test_phone_landscape.js mit denselben Faellen geprueft).
import { React } from "../vendor/react-globals.js";

const PL_ATTR = "data-phone-landscape";
const PL_MAX_SHORT = 500;
// Ansicht: "mobile" | "laptop" | "auto". Bei "auto" (Standard, solange die Person nie selbst gewaehlt hat)
// entscheidet die echte Fensterbreite: ab LAYOUT_MEDIUM_MIN CSS px Laptop-Layout (Seitenleiste plus
// Inhaltsflaeche), darunter Handy. Ein Handy im Querformat (Regel unten) bleibt immer im Handy-Layout.
// Layoutklassen: kompakt < 600, mittel 600 bis 1023, erweitert ab 1024 (data-layout auf <html>).
// Der Viewport bleibt immer device-width, es gibt keine kuenstliche Vergroesserung.
const LAYOUT_MEDIUM_MIN = 600;
const LAYOUT_EXPANDED_MIN = 1024;
function layoutClass(w) { return w >= LAYOUT_EXPANDED_MIN ? "expanded" : w >= LAYOUT_MEDIUM_MIN ? "medium" : "compact"; }
// pref: gespeicherte Ansicht, plActive: Handy-Querformat aktiv, w: Fensterbreite in CSS px.
/*vm-resolve-begin*/function resolveViewMode(pref, plActive, w) {
  if (pref === "laptop") return "laptop";
  if (pref === "mobile") return "mobile";
  return !plActive && w >= LAYOUT_MEDIUM_MIN ? "laptop" : "mobile";
}/*vm-resolve-end*/
const PL_FORCE_KEY = "gametab-pl-force";
const PL_STATE_KEY = "spieleblock-app-state-v1";

// Reine Entscheidungsfunktion. e: {viewMode, force, touch, screenW, screenH, orientationType,
// windowOrientation, mqLandscape, innerW, innerH}. Fehlende Werte = unbekannt.
function decidePhoneLandscape(e) {
  if (!e || e.viewMode === "laptop") return false;
  if (e.force === true) return true;
  if (e.force === false) return false;
  if (!e.touch) return false;
  const iw = e.innerW || 0, ih = e.innerH || 0;
  const sw = e.screenW || 0, sh = e.screenH || 0;
  const short = sw && sh ? Math.min(sw, sh) : Math.min(iw, ih);
  if (!short || short > PL_MAX_SHORT) return false;
  let land;
  if (typeof e.orientationType === "string" && e.orientationType) land = e.orientationType.indexOf("landscape") === 0;
  else if (typeof e.windowOrientation === "number") land = Math.abs(e.windowOrientation) === 90;
  else if (sw && sh && sw !== sh) land = sw > sh;
  else land = !!e.mqLandscape;
  if (!land) return false;
  return iw > ih;
}

function plReadForce() {
  try {
    const m = /[?&]pl=([01])\b/.exec(window.location.search || "");
    if (m) return m[1] === "1";
  } catch (_) {}
  try {
    const v = window.localStorage.getItem(PL_FORCE_KEY);
    if (v === "1") return true;
    if (v === "0") return false;
  } catch (_) {}
  return null;
}

// Gespeicherte Praeferenz: nur eine selbst gewaehlte Ansicht zaehlt. Aeltere Staende ohne Feld
// viewModeChosen: "laptop" gilt als gewaehlt (Standard war Handy), "mobile" als nie gewaehlt (auto).
function plReadSavedViewMode() {
  try {
    const s = JSON.parse(window.localStorage.getItem(PL_STATE_KEY) || "{}") || {};
    const chosen = s.viewModeChosen === true || (s.viewModeChosen === undefined && s.viewMode === "laptop");
    return chosen ? (s.viewMode === "laptop" ? "laptop" : "mobile") : "auto";
  } catch (_) { return "auto"; }
}

function plMQ(q) { try { return !!(window.matchMedia && window.matchMedia(q).matches); } catch (_) { return false; } }

function plEnv(viewMode, force) {
  const w = window, s = w.screen || {};
  let ot = null;
  try { ot = s.orientation && s.orientation.type ? String(s.orientation.type) : null; } catch (_) {}
  return {
    viewMode, force,
    touch: (w.navigator && w.navigator.maxTouchPoints > 0) || plMQ("(any-pointer: coarse)"),
    screenW: s.width || 0, screenH: s.height || 0,
    orientationType: ot,
    windowOrientation: typeof w.orientation === "number" ? w.orientation : null,
    mqLandscape: plMQ("(orientation: landscape)"),
    innerW: w.innerWidth || 0, innerH: w.innerHeight || 0,
  };
}

// Modulzustand (eine Quelle fuer Attribut und Hook).
let plViewMode = null, plMode = "mobile", plLayout = "compact", plForce, plActive = null, plBound = false, plTimer = 0, plRefs = 0;
const plSubs = new Set();

function plApply(v) {
  const root = document.documentElement;
  if (v) root.setAttribute(PL_ATTR, ""); else root.removeAttribute(PL_ATTR);
  plActive = v;
  plNotify();
}
function plNotify() {
  plSubs.forEach(f => { try { f(); } catch (_) {} });
}

function plSetVvh() {
  const root = document.documentElement, vv = window.visualViewport;
  if (plActive && vv) root.style.setProperty("--pl-vvh", Math.round(vv.height) + "px");
  else root.style.removeProperty("--pl-vvh");
}

// Neu bewerten und Attribut setzen/entfernen. Gibt den neuen Zustand zurueck.
function updatePhoneLandscape() {
  if (typeof window === "undefined") return false;
  if (plViewMode == null) plViewMode = plReadSavedViewMode();
  if (plForce === undefined) plForce = plReadForce();
  const v = decidePhoneLandscape(plEnv(plViewMode === "laptop" ? "laptop" : "mobile", plForce));
  const iw = window.innerWidth || 0;
  const mode = resolveViewMode(plViewMode, v, iw), lc = layoutClass(iw);
  const root = document.documentElement;
  root.setAttribute("data-layout", lc);
  const changed = mode !== plMode || lc !== plLayout;
  plMode = mode; plLayout = lc;
  if (v !== plActive) plApply(v); else if (changed) plNotify();
  plSetVvh();
  return v;
}

function plOnChange() {
  updatePhoneLandscape();
  // iOS meldet neue Masse nach orientationchange teils erst verspaetet: einmal nachpruefen.
  clearTimeout(plTimer);
  plTimer = setTimeout(updatePhoneLandscape, 350);
}

function plBind() {
  if (plBound || typeof window === "undefined") return;
  plBound = true;
  window.addEventListener("resize", plOnChange);
  window.addEventListener("orientationchange", plOnChange);
  try { if (screen.orientation && screen.orientation.addEventListener) screen.orientation.addEventListener("change", plOnChange); } catch (_) {}
  if (window.visualViewport) window.visualViewport.addEventListener("resize", plSetVvh);
}

function plUnbind() {
  if (!plBound) return;
  plBound = false;
  clearTimeout(plTimer);
  window.removeEventListener("resize", plOnChange);
  window.removeEventListener("orientationchange", plOnChange);
  try { if (screen.orientation && screen.orientation.removeEventListener) screen.orientation.removeEventListener("change", plOnChange); } catch (_) {}
  if (window.visualViewport) window.visualViewport.removeEventListener("resize", plSetVvh);
}

// Von App aufgerufen, sobald der gespeicherte Zustand geladen ist und bei jedem Wechsel Handy/Laptop.
function setPhoneLandscapeViewMode(mode) {
  plViewMode = mode === "laptop" || mode === "mobile" ? mode : "auto";
  return updatePhoneLandscape();
}

// Listener nur solange gebunden, wie App-Wurzel oder ein Hook sie braucht (Referenzzaehler).
function plRetain() { plRefs++; plBind(); return () => { plRefs = Math.max(0, plRefs - 1); if (!plRefs) plUnbind(); }; }

function plSubscribe(cb) {
  plSubs.add(cb);
  const rel = plRetain();
  if (plActive == null) updatePhoneLandscape();
  return () => { plSubs.delete(cb); rel(); };
}
function plSnapshot() { if (plActive == null) updatePhoneLandscape(); return !!plActive; }

// Hook fuer Komponenten: true im Handy-Querformat. Bei Drehung neu gerendert, ohne Remount.
// Nie als React-key an State-Containern verwenden.
function usePhoneLandscape() {
  return React.useSyncExternalStore(plSubscribe, plSnapshot, () => false);
}

// App-Hook: haelt viewMode synchron (useLayoutEffect = vor dem Paint, kein Flackern).
// Gibt die wirksame Ansicht zurueck ("mobile" oder "laptop"); bei "auto" folgt sie live der Fensterbreite
// (Split View, Drehen) ohne Neuladen. viewMode: "mobile" | "laptop" | "auto".
function plModeSnapshot() { return plMode; }
function plLayoutSnapshot() { return plLayout; }
function usePhoneLandscapeRoot(viewMode, loaded) {
  React.useLayoutEffect(() => plRetain(), []);
  React.useLayoutEffect(() => { if (loaded) setPhoneLandscapeViewMode(viewMode); }, [viewMode, loaded]);
  return React.useSyncExternalStore(plSubscribe, plModeSnapshot, () => "mobile");
}
// Layoutklasse fuer Komponenten: "compact" | "medium" | "expanded".
function useLayoutClass() {
  return React.useSyncExternalStore(plSubscribe, plLayoutSnapshot, () => "compact");
}

export { PL_ATTR, PL_MAX_SHORT, LAYOUT_MEDIUM_MIN, LAYOUT_EXPANDED_MIN, layoutClass, resolveViewMode, useLayoutClass, decidePhoneLandscape, updatePhoneLandscape, setPhoneLandscapeViewMode, usePhoneLandscape, usePhoneLandscapeRoot, plUnbind };
