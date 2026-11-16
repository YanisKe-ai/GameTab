// Hell «Schwarz auf Creme» für die Partyspiele (Gruppe 3): gemeinsame Hilfen.
// Nur im Hell-Modus aktiv (nie Ryū, Nocturne, Noir).
import { HELL, hellMap, isHell } from "../../themes/hell.js";

export function hellOn(theme) { return theme === "light" && isHell(); }

// Token-Objekt eines Partyspiels auf die Hell-Palette: Akzente und Rollenfarben schwarz, Flächen Creme.
export function hellTk(tk, theme, extra) {
  if (!hellOn(theme)) return tk;
  return { ...hellMap(tk), bg: HELL.page, bg2: HELL.soft, card: HELL.card, ink: HELL.ink, muted: HELL.muted, border: HELL.ink, onAccent: HELL.card, ...(extra || {}) };
}
