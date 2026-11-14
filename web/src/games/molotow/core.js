// Molotow (Jass, jeder fuer sich): reine Logik ohne UI-Importe. Quelle der Regeln: jassverzeichnis.ch/molotow-jass (nach alten Regeln).
// Weis-Werte und Stoeck-Wert sind 1:1 die des Schiebers (web/src/games/schieber/game.js: WEIS_PTS, Stoeck 20).
const MOL_WEIS_PTS = { w3: 20, w4: 50, w5: 100, w6: 150, w7: 200, w8: 250, w9: 300, g4: 100, g4n: 150, g4b: 200 };
const MOL_STOECK = 20;
const MOL_SUITS = ["h", "d", "s", "c"];
const MOL_MIN_ROUNDS = 4;
const MOL_MAX_ROUNDS = 16;
const MOL_MAX_CARD_PTS = 257;

const DEFAULT_MOLOTOW = {
  phase: "setup",
  players: [{ id: 1, name: "Spieler 1" }, { id: 2, name: "Spieler 2" }, { id: 3, name: "Spieler 3" }],
  startId: 0,
  roundCount: 8,
  tens: false,
  noWeis: false,
  rounds: [],
  hist: [],
  ended: false,
};

function molCardsPer(n) { return n <= 3 ? 12 : n === 4 ? 9 : n === 5 ? 7 : 6; }
function molClampRounds(v) { const n = Math.round(Number(v)); return !isFinite(n) ? 8 : Math.max(MOL_MIN_ROUNDS, Math.min(MOL_MAX_ROUNDS, n)); }
function molWeisSum(list) { return (Array.isArray(list) ? list : []).reduce((s, k) => s + (MOL_WEIS_PTS[k] || 0), 0); }
function molCell(round, pid) {
  const c = round && round.cells && round.cells[pid];
  const k = c && typeof c.k === "number" && isFinite(c.k) ? c.k : null;
  return { k, w: c && Array.isArray(c.w) ? c.w.filter(x => MOL_WEIS_PTS[x]) : [], s: !!(c && c.s), t: c && Array.isArray(c.t) ? c.t.filter(x => MOL_WEIS_PTS[x]) : [] };
}
function molMinus(cell, noWeis) { return (noWeis ? 0 : molWeisSum(cell.w)) + (cell.s ? MOL_STOECK : 0); }
function molPlus(cell, noWeis) { return noWeis ? 0 : molWeisSum(cell.t); }
// Rundenwert pro Person: Kartenpunkte + Tischweis - Weis - Stoeck, bei "Nur Zehner" abgeschnitten (52 -> 5, 129 -> 12, 5 -> 0)
function molRaw(cell, noWeis) { return (cell.k || 0) + molPlus(cell, noWeis) - molMinus(cell, noWeis); }
function molValue(cell, noWeis, tens) { const r = molRaw(cell, noWeis); return tens ? Math.trunc(r / 10) : r; }
function molRoundDone(round, players) { return !!round && players.length > 0 && players.every(p => molCell(round, p.id).k !== null); }
function molState(s) {
  const players = Array.isArray(s.players) ? s.players : [];
  const rounds = Array.isArray(s.rounds) ? s.rounds : [];
  const rc = molClampRounds(s.roundCount);
  const done = [];
  let cur = -1;
  for (let i = 0; i < rc; i++) { const d = molRoundDone(rounds[i], players); done.push(d); if (!d && cur < 0) cur = i; }
  const doneCount = done.filter(Boolean).length;
  const totals = {};
  players.forEach(p => { totals[p.id] = 0; });
  done.forEach((d, i) => { if (d) players.forEach(p => { totals[p.id] += molValue(molCell(rounds[i], p.id), s.noWeis, s.tens); }); });
  const anyDone = doneCount > 0;
  const finished = players.length > 0 && (cur < 0 || (!!s.ended && anyDone));
  return { players, rounds, rc, done, cur: finished ? -1 : cur, doneCount, totals, anyDone, finished };
}
// Rang (1 = wenigste Punkte), Gleichstand teilt den Rang
function molRanks(players, totals) { const r = {}; players.forEach(p => { r[p.id] = 1 + players.filter(q => totals[q.id] < totals[p.id]).length; }); return r; }
// Fuer "Weiterspielen" und die Suche: { round, lead } oder null
function molotowResume(g) {
  if (!g || typeof g !== "object" || g.phase !== "play") return null;
  const st = molState(g);
  if (!st.doneCount) return null;
  const min = Math.min(...st.players.map(p => st.totals[p.id]));
  const names = st.players.filter(p => st.totals[p.id] === min).map(p => p.name);
  return { round: Math.min(st.doneCount + 1, st.rc), lead: names.length === 1 ? { name: names[0], total: min } : null };
}
function molStarter(players, startId, roundIdx) {
  if (!players.length) return null;
  let i = players.findIndex(p => p.id === startId);
  if (i < 0) i = 0;
  return players[(i + roundIdx) % players.length];
}
const molFmt = v => String(v).replace(/-/g, "−");

export { MOL_WEIS_PTS, MOL_STOECK, MOL_SUITS, MOL_MIN_ROUNDS, MOL_MAX_ROUNDS, MOL_MAX_CARD_PTS, DEFAULT_MOLOTOW, molCardsPer, molClampRounds, molWeisSum, molCell, molMinus, molPlus, molRaw, molValue, molRoundDone, molState, molRanks, molotowResume, molStarter, molFmt };
