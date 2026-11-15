// Modus «Plakat»: gemeinsame Bausteine für alle Spiele (2026-11-15).
// Nur im Plakat-Modus verwenden (usePlakat()). Keine Spiel-Importe.
import { React } from "../../vendor/react-globals.js";
import { PK } from "../../themes/plakat.js";

// Lesbare Textfarbe auf einer Fläche (Kontrast nach WCAG, Schwarz oder Creme)
function pkLum(hex) {
  const h = String(hex || "").replace("#", "");
  if (h.length !== 6) return 1;
  const c = [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16) / 255).map((v) => (v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4)));
  return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
}
function pkContrast(a, b) { const x = pkLum(a), y = pkLum(b); return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05); }
function pkOn(bg) { return pkContrast(bg, PK.ink) >= pkContrast(bg, PK.cream) ? PK.ink : PK.cream; }

// Seitenhülle: Spielfarbe mit feinem Punktraster
function pkPage(bg, extra) {
  return Object.assign({ "--pk-bg": bg, minHeight: "100vh", background: `radial-gradient(rgba(20,20,20,.10) 1.2px, transparent 1.4px) 0 0/14px 14px, ${bg}`, padding: "20px 12px 32px" }, extra || {});
}
// Karte: Papier, schwarzer Rand, harter Schatten
function pkCard(bg, extra) {
  return Object.assign({ background: bg || PK.paper, outline: PK.border, outlineOffset: -2.5, borderRadius: 22, boxShadow: PK.shadow, color: pkOn(bg || PK.paper) }, extra || {});
}
// Knopf-Stil (Hauptknopf)
function pkBtn(bg, extra) {
  return Object.assign({ background: bg, color: pkOn(bg), outline: PK.border, outlineOffset: -2.5, borderRadius: 18, boxShadow: PK.shadowLg, fontFamily: PK.font, fontWeight: 400, letterSpacing: ".02em" }, extra || {});
}
// Titel im Plakat-Stil (gleich gross auf jeder Spielseite)
function pkTitle(fill, size, extra) {
  const s = size || 54;
  return Object.assign({ fontFamily: PK.font, fontWeight: 400, fontSize: s, lineHeight: 1.02, color: fill, WebkitTextStroke: Math.max(3, Math.round(s * 0.08)) + "px " + PK.ink, paintOrder: "stroke fill", textShadow: Math.round(s * 0.05) + "px " + Math.round(s * 0.065) + "px 0 " + PK.ink, whiteSpace: "nowrap", textAlign: "center", letterSpacing: 0 }, extra || {});
}

// Schräges Band mit Kerben (wie auf den Plakaten). Das Band liegt absolut hinter dem Text
// und nimmt keinen Platz: die Zeile ist so hoch wie der ersetzte Text (fontSize/lineHeight).
function PkRibbon({ children, bg, color, style, fontSize, lineHeight }) {
  return <div style={{ display: "flex", justifyContent: "center", ...style }}><div style={{ position: "relative", isolation: "isolate", padding: "0 22px", color: color || pkOn(bg || PK.ink), fontFamily: PK.font, fontSize: fontSize || 14, lineHeight: lineHeight || "normal", letterSpacing: ".05em", whiteSpace: "nowrap", transform: "rotate(-2deg)" }}><span aria-hidden="true" style={{ position: "absolute", inset: "-5px 0", zIndex: -1, clipPath: "polygon(0 0,100% 0,96% 50%,100% 100%,0 100%,4% 50%)", background: bg || PK.ink }} />{children}</div></div>;
}

// Briefmarkenrand (Lochrand oben und unten) als className-Hilfe
const PK_STAMP_CSS = ".pk-stamp{-webkit-mask:radial-gradient(circle 5px at 50% 0,#0000 98%,#000) 0 0/16px 51% repeat-x,radial-gradient(circle 5px at 50% 100%,#0000 98%,#000) 0 100%/16px 51% repeat-x;mask:radial-gradient(circle 5px at 50% 0,#0000 98%,#000) 0 0/16px 51% repeat-x,radial-gradient(circle 5px at 50% 100%,#0000 98%,#000) 0 100%/16px 51% repeat-x}";

export { pkOn, pkContrast, pkPage, pkCard, pkBtn, pkTitle, PkRibbon, PK_STAMP_CSS };
