// Modus Hell «Schwarz auf Creme» (16.11.2026): Sicherheitsnetz für Rahmen und Spiele.
// Nur eingehängt, wenn Hell aktiv ist (App.js), nie im Ryū. Farben aus themes/hell.js.
import { HELL } from "../themes/hell.js";

const H = 'html[data-gt-theme="light"]:not([data-gt-skin])';
const INK = HELL.ink, CARD = HELL.card;

const HELL_CSS = `
/* Umrahmungen schwarz (transparente Abstandsränder ausgenommen) */
${H} body *:not(svg):not(svg *):not([style*="transparent"]){border-color:${INK}!important}
${H} body *:is(input,textarea,select){border-color:${INK}!important;caret-color:${INK}}
/* Spieltitel und Schriftzüge: schwarz, ohne Farbschatten */
${H} body :is(h1.gt-wm,.yz-word,.tt-word,.f7-word,.sk-word,.gt-wm-sub){color:${INK}!important;-webkit-text-fill-color:${INK}!important;background:none!important;text-shadow:none!important;-webkit-text-stroke:0!important;filter:none!important}
/* Schwebende Hintergrund-Deko schwarz */
${H} .gtL-shellpage::before,${H} body::after{filter:grayscale(1) brightness(0)!important;opacity:.32!important}
/* Fokusrahmen schwarz */
${H} :focus-visible{outline-color:${INK}!important}
/* Startkacheln: Bleistift und Maske schwarz im Kreis */
${H} .gtL-tile-iconwrap{background:${CARD}!important;box-shadow:0 0 0 1.5px ${INK}!important}
${H} .gtL-tile-iconwrap svg{color:${INK}!important}
`;

export { HELL_CSS };
