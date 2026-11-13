// Spiel beenden aus dem Siegesschild heraus: App.js stellt pro Ansicht bereit, wie das Spiel
// zurückgesetzt wird und wohin es danach geht (Spieleliste). Ohne Anbieter: null.
import { React } from "../vendor/react-globals.js";
export const GtExitCtx = typeof React !== "undefined" && React && React.createContext ? React.createContext(null) : null;
