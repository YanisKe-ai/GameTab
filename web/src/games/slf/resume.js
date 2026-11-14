// Stadt Land Fluss: Laufendes Spiel fuer "Weiterspielen" und Startseite (ohne Abhaengigkeit zu App.js, damit es keine Importschleife gibt).
import { React } from "../../vendor/react-globals.js";
import { showcaseAccent } from "../../app/start.js";
import { SlfLogo, SLF_ACC_DARK } from "./logo.js";

// App.js setzt "on" bei jedem Rendern (wie GT_S8P bei Phase 10, Romme und Verraeter).
const GT_SLF_P = { on: false };

function gtSlfResume(t, theme) {
  if (!GT_SLF_P.on) return [];
  const a = showcaseAccent("slf", SLF_ACC_DARK, theme);
  return [{ id: "slf", label: t("gameSlf"), accent: a, logo: <SlfLogo color={a} /> }];
}
export { GT_SLF_P, gtSlfResume };
