// Modus Hell «Schwarz auf Creme» (Wahl Yanis 16.11.2026): wie Noir, nur hell.
// Hintergrund und Flächen hell (Creme wie bisher), Schrift, Umrahmungen, Titel, Symbole und Deko schwarz.
// Farbig bleiben nur Spiel-Icons in Listen und die zwei roten Lösch-Einträge der Einstellungen.
// Gilt nur für Hell, nie für Ryū (Ryū hat intern Hell als Basis).
import { curSkin, curThemeBase } from "./theme-id.js";

const HELL = {
  page: "#F6F1E7",
  start: "#EDE5D5",
  card: "#FFFCF6",
  ink: "#1E1A15",
  muted: "#4A443A",
  soft: "#E4DCCB",   // helle neutrale Fläche (gesperrt, Zwischenzeilen)
  mid: "#B5AC9A",    // mittleres Grau (Linien, Fortschritt)
};

function isHell() { return curThemeBase() === "light" && curSkin() !== "plakat"; }

function parse(c) {
  let m = /^#([0-9a-f]{3,8})$/i.exec(c);
  if (m) {
    let h = m[1];
    if (h.length === 3 || h.length === 4) h = h.split("").map((x) => x + x).join("");
    const a = h.length === 8 ? parseInt(h.slice(6, 8), 16) / 255 : 1;
    return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16), a];
  }
  m = /^rgba?\(([^)]+)\)$/i.exec(c);
  if (m) {
    const v = m[1].split(/[ ,/]+/).filter(Boolean).map(Number);
    return [v[0], v[1], v[2], v.length > 3 ? v[3] : 1];
  }
  return null;
}
const hexOf = (r, g, b) => "#" + [r, g, b].map((x) => Math.round(x).toString(16).padStart(2, "0")).join("");
const rgbaOf = (hex, a) => {
  const v = parse(hex);
  return a >= 1 ? hex : `rgba(${v[0]},${v[1]},${v[2]},${+a.toFixed(3)})`;
};

const memo = new Map();
// Eine einzelne Farbe: Neutrales bleibt, Farbiges wird je nach Helligkeit Schwarz, helles Grau oder Creme.
function hellOne(c) {
  const k = c.trim().toLowerCase();
  if (memo.has(k)) return memo.get(k);
  const v = parse(k);
  let out = c;
  if (v) {
    const [r, g, b, a] = v;
    const mx = Math.max(r, g, b), mn = Math.min(r, g, b);
    const sat = mx ? (mx - mn) / mx : 0;
    if (sat > 0.16 && mx - mn > 22) {
      const L = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
      const t = L > 0.82 ? HELL.card : L > 0.62 ? HELL.soft : HELL.ink;
      out = rgbaOf(t, a);
    }
  }
  memo.set(k, out);
  return out;
}
const COLOR_RE = /#[0-9a-f]{3,8}\b|rgba?\([^)]+\)/gi;
// Beliebiger Farbwert, auch Verläufe und Schatten: jede enthaltene Farbe wird umgerechnet.
function hellColor(v) {
  if (typeof v !== "string" || !v) return v;
  return v.replace(COLOR_RE, (m) => hellOne(m));
}
// Nur im Hell-Modus umrechnen, sonst unverändert (für Inline-Farben in Spielen).
function hc(v) { return isHell() ? hellColor(v) : v; }

const ACCENT_KEYS = /^(accent|accent2|gold|gold2|goldSoft|goldDim|accentGold|primary|btn|btnFrom|btnTo|hl|highlight|win|lead)$/i;
// Token-Objekt eines Spiels in Hell umrechnen (alle Farbwerte, Akzente schwarz).
const HELL_PAGE_KEYS = /^(pageBg|bg|pageBg2|bg2|pageBackground)$/;
function hellMap(r) {
  if (!r || typeof r !== "object" || Array.isArray(r)) return r;
  const o = { ...r };
  // Seiten-Hülle (minHeight/background/padding): überall das Hell-Creme
  if (typeof o.background === "string" && ("minHeight" in o || "padding" in o)) o.background = HELL.page;
  for (const k of Object.keys(o)) {
    const v = o[k];
    if (k === "background" && o[k] === HELL.page) continue;
    if (typeof v === "string" && HELL_PAGE_KEYS.test(k)) { o[k] = HELL.page; continue; }
    if (typeof v === "string") o[k] = ACCENT_KEYS.test(k) && parse(v.trim()) ? HELL.ink : hellColor(v);
    else if (Array.isArray(v)) o[k] = v.map((x) => (typeof x === "string" ? hellColor(x) : x));
    else if (v && typeof v === "object" && !React_isElement(v)) o[k] = hellMap(v);
  }
  return o;
}
function React_isElement(v) { return v && v.$$typeof; }

// Hülle für Token-Funktionen, die nicht über pkWrap laufen
function hellWrap(fn) {
  return function (theme, ...rest) {
    const r = fn(theme, ...rest);
    return theme === "light" && isHell() ? hellMap(r) : r;
  };
}

export { HELL, isHell, hellColor, hc, hellMap, hellWrap };
