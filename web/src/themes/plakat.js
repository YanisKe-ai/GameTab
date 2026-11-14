// Modus «Plakat» (2026-11-15): Design-Tokens und Grundzuordnung.
// Keine Importe aus Spieldateien (keine Kreisabhängigkeiten).
import { curSkin } from "./theme-id.js";

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
const PK_GAME = {
  tutto: { bg: "#F9C22E", acc: "#D6202A", on: "#141414" },
  yatzy: { bg: "#3D5E8C", acc: "#B3372F", on: "#F4EAD5" },
  slf: { bg: "#8B6CFF", acc: "#5B3FD6", on: "#141414" },
  schieber: { bg: "#2F6B52", acc: "#071743", on: "#F4EAD5" },
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

export { PK, PK_GAME, PK_PAGE_BG, isPlakat, plakatMap, pkWrap };
