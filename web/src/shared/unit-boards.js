// Ergaenzung zum Geruest unit.js fuer die Schreibunterlagen-Spiele (Yatzy, Wizard, Darts, Minigolf, Freies Spiel).
// GT_UB_CSS: .gt-ub-fill macht den Einrichtungs-Wrapper "durchsichtig" (display: contents), damit der Start-Knopf
// (GtStartBar, liegt im Wrapper .plsu-side) direkt zum Flex-Kind der Spalte GtCol wird und unten steht.
// GtUbStyle: bindet das CSS einmal pro Seite ein.
import { React } from "../vendor/react-globals.js";
const GT_UB_CSS = `
.gt-ub-fill{display:contents}
.gt-u-col .gt-su-cta{margin-top:auto}
.gt-ub-title{font-family:'Space Grotesk',sans-serif;font-weight:700;letter-spacing:-.01em}
@media (prefers-reduced-motion: reduce){.gt-ub-anim{transition:none!important;animation:none!important}}
`;
function GtUbStyle() {
  return <style>{GT_UB_CSS}</style>;
}
export { GT_UB_CSS, GtUbStyle };
