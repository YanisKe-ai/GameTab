// Paket NM: zuletzt gespielte Namen fuer die Chip-Zeile im GroupPicker.
import { loadMatchLog, normalizeName } from "../stats/match-log.js";
import { STORAGE_KEY } from "../app/storage.js";
const KEY = "gt_lastRound";
export const GT_DEF_NAME_RE = /^(Spieler|Player|Joueur|Giocatore|Jugador|Jogador|Team|Equipo|Squadra|Equipe|Équipe)\s*\d+$/i;
export const gtIsDefName = (n) => { const s = String(n == null ? "" : n).trim(); return !s || GT_DEF_NAME_RE.test(s); };
function clean(list) {
  const seen = new Set(), out = [];
  (list || []).forEach((n) => {
    const s = String(n == null ? "" : n).trim();
    if (!s || gtIsDefName(s) || /\s\(\d+\)$/.test(s)) return;
    const k = normalizeName(s);
    if (seen.has(k)) return;
    seen.add(k); out.push(s);
  });
  return out;
}
export function gtRememberRound(names) {
  try { const c = clean(names); if (c.length >= 2) localStorage.setItem(KEY, JSON.stringify({ ts: Date.now(), names: c })); } catch (e) {}
}
export function gtLastRound() {
  try { const v = JSON.parse(localStorage.getItem(KEY) || "null"); if (v && Array.isArray(v.names)) { const c = clean(v.names); if (c.length >= 2) return c; } } catch (e) {}
  try {
    const log = loadMatchLog();
    for (let i = log.length - 1; i >= 0; i--) {
      const c = clean(log[i].participants.filter((p) => p.isTeam !== true).map((p) => p.name));
      if (c.length >= 2) return c;
    }
  } catch (e) {}
  return [];
}
export function gtRecentNames(limit = 8) {
  const out = [], seen = new Set();
  const add = (n) => { const k = normalizeName(n); if (seen.has(k)) return; seen.add(k); out.push(n); };
  gtLastRound().forEach(add);
  try {
    const log = loadMatchLog();
    for (let i = log.length - 1; i >= 0 && out.length < limit * 3; i--) clean(log[i].participants.filter((p) => p.isTeam !== true).map((p) => p.name)).forEach(add);
  } catch (e) {}
  try {
    const st = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
    Object.keys(st || {}).forEach((k) => {
      const g = st[k];
      if (g && typeof g === "object" && g.phase && g.phase !== "setup" && Array.isArray(g.players)) clean(g.players.map((p) => p && p.name)).forEach(add);
    });
  } catch (e) {}
  return out.slice(0, limit);
}
