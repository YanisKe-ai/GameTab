// Zentrale Liste aller Erscheinungsbilder (Modus Plakat seit 2026-11-15).
// Der gespeicherte Wert ist der echte Modus. Für Code, der den Plakat-Stil noch nicht kennt,
// liefert themeBase() das Basis-Theme ("plakat" -> "light"), damit nichts in Nocturne-Farben kippt.
// Der Plakat-Stil selbst hängt am Attribut data-gt-skin="plakat" auf <html> und an usePlakat().
import { React } from "../vendor/react-globals.js";

const THEMES = ["dark", "light", "noir", "plakat"];
const THEME_BASE = { dark: "dark", light: "light", noir: "noir", plakat: "light" };
// Farbe der Statusleiste / des Seitenrands pro Modus
const THEME_BAR = { dark: "#12141C", light: "#EDE5D5", noir: "#000000", plakat: "#F4EAD5" };

function isValidTheme(t) { return THEMES.indexOf(t) >= 0; }
function themeBase(t) { return THEME_BASE[t] || "dark"; }
function themeSkin(t) { return t === "plakat" ? "plakat" : ""; }
function themeBar(t) { return THEME_BAR[t] || THEME_BAR.dark; }
function nextTheme(t) { const i = THEMES.indexOf(t); return THEMES[(i + 1) % THEMES.length]; }

// Kontext: true, wenn der Modus Plakat aktiv ist. Umgestaltete Seiten lesen ihn.
const GtSkinCtx = (typeof React !== "undefined" && React && React.createContext) ? React.createContext("") : null;
// Kontext ist eine Modulkonstante, die Hook-Reihenfolge bleibt in jedem Render gleich.
// eslint-disable-next-line react-hooks/rules-of-hooks
function usePlakat() { return GtSkinCtx ? React.useContext(GtSkinCtx) === "plakat" : false; }
// Ausserhalb von React (Overlays, Effekte): Attribut auf <html>
function isPlakatDom() { try { return document.documentElement.getAttribute("data-gt-skin") === "plakat"; } catch (e) { return false; } }

// Synchron gesetzter Merker (wie GT_CUR_THEME): App setzt ihn beim Rendern, bevor Kinder rendern.
let GT_SKIN = "";
function setSkinNow(s) { GT_SKIN = s || ""; }
function curSkin() { return GT_SKIN; }

export { setSkinNow, curSkin, THEMES, isValidTheme, themeBase, themeSkin, themeBar, nextTheme, GtSkinCtx, usePlakat, isPlakatDom };
