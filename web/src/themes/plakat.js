// Modus «Plakat» (2026-11-15): Design-Tokens und Grundzuordnung.
// Keine Importe aus Spieldateien (keine Kreisabhängigkeiten).
import { curSkin } from "./theme-id.js";
import { React } from "../vendor/react-globals.js";

const PK = {
  cream: "#F4EAD5",
  cream2: "#EADDC2",
  paper: "#FFFDF7",
  white: "#FFFFFF",
  ink: "#141414",
  muted: "#4A4236",
  line: "#141414",
  shadow: "0 4px 0 #141414",
  shadowLg: "0 6px 0 #141414",
  border: "2.5px solid #141414",
  font: "'Bagel Fat One', 'Bowlby One', sans-serif",
  dots: "radial-gradient(rgba(20,20,20,.09) 1.2px, transparent 1.4px) 0 0/14px 14px",
};

// Spielfarben (aus den bestehenden Spiel-Tokens), für Plakat-Seiten pro Spiel
// Ryū (2026-11-15, Entscheid Yanis): alle Spielseiten rot, Akzent schwarz. Frühere Spielfarben siehe Git.
const PK_GAME = {
  tutto: { bg: "#E4312B", acc: "#1A1716", on: "#1A1716" },
  yatzy: { bg: "#E4312B", acc: "#1A1716", on: "#1A1716" },
  slf: { bg: "#E4312B", acc: "#1A1716", on: "#1A1716" },
  schieber: { bg: "#E4312B", acc: "#1A1716", on: "#1A1716" },
  jass: { bg: "#E4312B", acc: "#1A1716", on: "#1A1716" },
  coiffeur: { bg: "#E4312B", acc: "#1A1716", on: "#1A1716" },
  molotow: { bg: "#E4312B", acc: "#1A1716", on: "#1A1716" },
  skyjo: { bg: "#E4312B", acc: "#1A1716", on: "#1A1716" },
  flip7: { bg: "#E4312B", acc: "#1A1716", on: "#1A1716" },
  phase10: { bg: "#E4312B", acc: "#1A1716", on: "#1A1716" },
  romme: { bg: "#E4312B", acc: "#1A1716", on: "#1A1716" },
  darts: { bg: "#E4312B", acc: "#1A1716", on: "#1A1716" },
  wizard: { bg: "#E4312B", acc: "#1A1716", on: "#1A1716" },
  minigolf: { bg: "#E4312B", acc: "#1A1716", on: "#1A1716" },
  freeplay: { bg: "#E4312B", acc: "#1A1716", on: "#1A1716" },
  impostor: { bg: "#E4312B", acc: "#1A1716", on: "#1A1716" },
  werwolf: { bg: "#E4312B", acc: "#1A1716", on: "#1A1716" },
  mafia: { bg: "#E4312B", acc: "#1A1716", on: "#1A1716" },
  traitor: { bg: "#E4312B", acc: "#1A1716", on: "#1A1716" },
  mostlikely: { bg: "#E4312B", acc: "#1A1716", on: "#1A1716" },
  tabu: { bg: "#E4312B", acc: "#1A1716", on: "#1A1716" },
  headsup: { bg: "#E4312B", acc: "#1A1716", on: "#1A1716" },
  fivesec: { bg: "#E4312B", acc: "#1A1716", on: "#1A1716" },
};

const PK_PAGE_BG = `${PK.dots}, ${PK.cream}`;

function isPlakat() { return curSkin() === "plakat"; }

// Grundzuordnung: hell-Tokens -> Plakat (Creme-Papier, schwarze Linien, Spielfarben bleiben).
const INK_KEYS = /^(ink|headerInk|parch|text|fg)$/;
const MUTED_KEYS = /^(muted|headerMuted|mutedLight|sub|soft)$/;
const PAGE_KEYS = /^(pageBg|bg)$/;
const PAGE2_KEYS = /^(pageBg2|bg2)$/;
const CARD_KEYS = /^(card|headerBg|cellEmptyBg|surface)$/;
const CARD2_KEYS = /^(cardElevated|cardAlt|cellFilledBg|subheadBg)$/;
const LINE_KEYS = /^(border|groupLine)$/;
const GOLD_KEYS = /^(gold|gold2|goldSoft|goldDim|accentGold|star|starOn)$/;

function plakatMap(r) {
  if (!r || typeof r !== "object") return r;
  const o = { ...r };
  for (const k of Object.keys(o)) {
    const v = o[k];
    if (typeof v !== "string") continue;
    if (INK_KEYS.test(k)) o[k] = PK.ink;
    else if (MUTED_KEYS.test(k)) o[k] = PK.muted;
    else if (PAGE_KEYS.test(k)) o[k] = /gradient|url\(/.test(v) ? PK_PAGE_BG : PK.cream;
    else if (PAGE2_KEYS.test(k)) o[k] = PK.cream2;
    else if (CARD_KEYS.test(k)) o[k] = PK.paper;
    else if (CARD2_KEYS.test(k)) o[k] = PK.white;
    else if (LINE_KEYS.test(k)) o[k] = PK.line;
    else if (GOLD_KEYS.test(k)) o[k] = "#E4312B"; // Ryū: kein Gold, nur Rot, Schwarz, Creme
  }
  // Seiten-Hülle (minHeight/background/padding)
  if (typeof o.background === "string" && ("minHeight" in o || "padding" in o)) o.background = PK_PAGE_BG;
  return o;
}

// Hülle für exportierte Token-Funktionen: nur im Plakat-Modus und nur auf Hell-Basis.
function pkWrap(fn) {
  return function (theme, ...rest) {
    const r = fn(theme, ...rest);
    return theme === "light" && isPlakat() ? plakatMap(r) : r;
  };
}


// Ryū: Spiel-Icons in Rot, Schwarz, Creme (Entwurf «A hell», 2026-11-15).
// Warme Farben -> Rot, kühle -> Schwarz, hell -> Creme, dunkel -> Schwarz. Nur im Ryū-Modus aktiv.
const RYU_R = "#E4312B", RYU_K = "#1A1716", RYU_C = "#F3EAD3";
const ryuMemo = new Map();
function ryuColor(c) {
  if (typeof c !== "string") return c;
  const key = c.trim().toLowerCase();
  if (ryuMemo.has(key)) return ryuMemo.get(key);
  let h = key;
  if (h === "white") h = "#ffffff"; else if (h === "black") h = "#000000";
  let m = /^#([0-9a-f]{3})$/.exec(h);
  if (m) h = "#" + m[1].split("").map((x) => x + x).join("");
  m = /^#([0-9a-f]{6})/.exec(h);
  let out = c;
  if (m) {
    const r = parseInt(m[1].slice(0, 2), 16) / 255, g = parseInt(m[1].slice(2, 4), 16) / 255, b = parseInt(m[1].slice(4, 6), 16) / 255;
    const mx = Math.max(r, g, b), mn = Math.min(r, g, b), l = (mx + mn) / 2, d = mx - mn;
    const s = d === 0 ? 0 : d / (1 - Math.abs(2 * l - 1));
    let hue = 0;
    if (d) { if (mx === r) hue = ((g - b) / d) % 6; else if (mx === g) hue = (b - r) / d + 2; else hue = (r - g) / d + 4; hue *= 60; if (hue < 0) hue += 360; }
    if (l < 0.22) out = RYU_K;
    else if (l > 0.85) out = RYU_C;
    else if (s > 0.25) out = (hue < 70 || hue >= 280) ? RYU_R : RYU_K;
    else out = l < 0.6 ? RYU_K : RYU_C;
  }
  ryuMemo.set(key, out);
  return out;
}
const RYU_PROPS = ["fill", "stroke", "stopColor", "color"];
const RYU_STYLE = ["fill", "stroke", "stopColor", "color", "background", "backgroundColor"];
function ryuTree(n) {
  if (Array.isArray(n)) return n.map(ryuTree);
  if (!React.isValidElement(n)) return n;
  const p = n.props || {};
  const np = {};
  for (const k of RYU_PROPS) if (typeof p[k] === "string") np[k] = ryuColor(p[k]);
  if (p.style && typeof p.style === "object") {
    const st = { ...p.style };
    for (const k of RYU_STYLE) if (typeof st[k] === "string") st[k] = ryuColor(st[k]);
    np.style = st;
  }
  if (p.children === undefined) return React.cloneElement(n, np);
  const ch = ryuTree(p.children);
  return Array.isArray(ch) ? React.cloneElement(n, np, ...ch) : React.cloneElement(n, np, ch);
}
// Hülle für Logo-Bausteine: im Ryū-Modus umgefärbt, sonst unverändert
function ryuLogo(Comp) {
  const W = function RyuLogo(props) { const el = Comp(props); return isPlakat() ? ryuTree(el) : el; };
  return W;
}

export { PK, PK_GAME, PK_PAGE_BG, isPlakat, plakatMap, pkWrap, ryuLogo, ryuColor };
