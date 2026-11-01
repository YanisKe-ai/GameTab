// Ergebnisbild pro Spiel: Registry gameId -> Vorlage. Wird in main.js einmal importiert und haengt sich in shareResultImage ein (GT_EC_TPL).
// Spiele ohne Vorlage (oder bei Fehlern) bekommen weiter das bisherige Bild aus result-card.js.
// Neue Vorlage: Datei ./<spiel>.js nach dem Muster von yatzy.js anlegen und unten in TEMPLATES eintragen (eine Zeile).
import { GT_EC_TPL } from "../result-card.js";
import * as kit from "./kit.js";
import yatzy from "./yatzy.js";
import schieber from "./schieber.js";
import wizard from "./wizard.js";
import minigolf from "./minigolf.js";
import phase10 from "./phase10.js";
import romme from "./romme.js";
import differenzler from "./differenzler.js";

/* Jede Vorlage: { games:[gameId...], fonts:[CSS-Schriftangaben], texts?(d)->[String], accepts?(d)->bool, render(d, kit)->[canvas...] } */
const TEMPLATES = [yatzy, schieber, wizard, minigolf, phase10, romme, differenzler];

const GT_TPL = {};
TEMPLATES.forEach((tp) => tp.games.forEach((g) => { GT_TPL[g] = tp; }));

/* Liefert Canvas-Seiten (1080 x 1350) oder null (keine Vorlage, Daten passen nicht). Fehler werfen: der Aufrufer faellt dann zurueck. */
async function gtTplRender(gameId, gameLabel, ranked, t, extra) {
  const tp = GT_TPL[gameId];
  if (!tp || !Array.isArray(ranked) || !ranked.length) return null;
  const ex = typeof extra === "function" ? extra() : extra;
  const d = kit.tplData(gameId, gameLabel, ranked, t, ex);
  if (tp.accepts && !tp.accepts(d)) return null;
  const text = [d.gameLabel, d.date, d.rows.map((r) => r.name + r.value).join(""), d.up(d.rows.map((r) => r.name).join("") + d.gameLabel)].concat(tp.texts ? tp.texts(d) : []).join(" ");
  const [, img] = await Promise.all([kit.tplFonts(tp.fonts, text), kit.tplLogo()]);
  d.logo = img;
  const pages = tp.render(d, kit);
  if (!Array.isArray(pages) || !pages.length) return null;
  return pages;
}
function gtTplWarm(gameId) { const tp = GT_TPL[gameId]; if (tp) kit.tplWarm(tp.fonts); }

GT_EC_TPL.render = gtTplRender;
GT_EC_TPL.warm = gtTplWarm;
GT_EC_TPL.has = (id) => !!GT_TPL[id];

export { GT_TPL, gtTplRender, gtTplWarm };
