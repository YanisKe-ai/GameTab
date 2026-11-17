// Ergebnisbild pro Spiel: Registry gameId -> Vorlage. Wird in main.js einmal importiert und haengt sich in shareResultImage ein (GT_EC_TPL).
// Spiele ohne Vorlage (oder bei Fehlern) bekommen weiter das bisherige Bild aus result-card.js.
// Neue Vorlage: Datei ./<spiel>.js nach dem Muster von yatzy.js anlegen und unten in TEMPLATES eintragen (eine Zeile).
import { GT_EC_TPL } from "../result-card.js";
import * as kit from "./kit.js";
import { GT_RYU_KIT } from "./ryu-kit.js";
import { isPlakatDom } from "../../themes/theme-id.js";
import yatzy from "./yatzy.js";
import schieber from "./schieber.js";
import skyjo from "./skyjo.js";
import flip7 from "./flip7.js";
import tutto from "./tutto.js";
import freeplay from "./freeplay.js";
import headsup from "./headsup.js";
import fivesec from "./fivesec.js";
import mostlikely from "./mostlikely.js";
import verraeter from "./verraeter.js";
import mafia from "./mafia.js";
import werwolf from "./werwolf.js";
import impostor from "./impostor.js";
import wizard from "./wizard.js";
import minigolf from "./minigolf.js";
import phase10 from "./phase10.js";
import romme from "./romme.js";
import differenzler from "./differenzler.js";
import tabu from "./tabu.js";
import darts from "./darts.js";
import molotow from "./molotow.js";
import slf from "./slf.js";

/* Jede Vorlage: { games:[gameId...], fonts:[CSS-Schriftangaben], texts?(d)->[String], accepts?(d)->bool, render(d, kit)->[canvas...] } */
const TEMPLATES = [yatzy, schieber, skyjo, flip7, tutto, freeplay, headsup, fivesec, wizard, minigolf, phase10, romme, differenzler, tabu, darts, impostor, werwolf, mafia, verraeter, mostlikely, molotow, slf];

const GT_TPL = {};
TEMPLATES.forEach((tp) => tp.games.forEach((g) => { GT_TPL[g] = tp; }));

/* Liefert Canvas-Seiten (1080 x 1350) oder null (keine Vorlage, Daten passen nicht). Fehler werfen: der Aufrufer faellt dann zurueck. */
async function gtTplRender(gameId, gameLabel, ranked, t, extra) {
  const tp = GT_TPL[gameId];
  if (!tp || !Array.isArray(ranked) || !ranked.length) return null;
  const ex = typeof extra === "function" ? extra() : extra;
  const d = kit.tplData(gameId, gameLabel, ranked, t, ex);
  if (tp.accepts && !tp.accepts(d)) return null;
  const text = [d.gameLabel, d.date, d.rows.map((r) => r.name + r.value).join(""), d.up(d.rows.map((r) => r.name).join("") + d.gameLabel)].concat([d.tr("ecContinued", "Fortsetzung"), "GameTab/"], tp.texts ? tp.texts(d) : []).join(" ");
  /* Ryū: eigene Fassung (renderRyu), bei Fehler oder ohne Fassung das heutige Bild */
  const ryu = !!(tp.renderRyu && isPlakatDom());
  const fonts = ryu ? tp.fonts.concat(GT_RYU_KIT.RYU_FONTS) : tp.fonts;
  const [, img] = await Promise.all([kit.tplFonts(fonts, text), kit.tplLogo()]);
  d.logo = img;
  if (tp.prepare) d.img = await tp.prepare(kit);
  let pages = null;
  if (ryu) { try { pages = tp.renderRyu(d, kit, GT_RYU_KIT); } catch (e) { try { console.warn("Ryū-Vorlage", gameId, e); } catch (_) { /* weich */ } pages = null; } }
  if (!Array.isArray(pages) || !pages.length) pages = tp.render(d, kit);
  if (!Array.isArray(pages) || !pages.length) return null;
  return pages;
}
function gtTplWarm(gameId) { const tp = GT_TPL[gameId]; if (tp) kit.tplWarm(tp.renderRyu && isPlakatDom() ? tp.fonts.concat(GT_RYU_KIT.RYU_FONTS) : tp.fonts); }

GT_EC_TPL.render = gtTplRender;
GT_EC_TPL.warm = gtTplWarm;
GT_EC_TPL.has = (id) => !!GT_TPL[id];

export { GT_TPL, gtTplRender, gtTplWarm };
