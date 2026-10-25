// Minigolf Greenline: reine Spiellogik ohne React (Entwurf, Speichern, Rueckgaengig, Zwischenstand).
// Gespeicherte Werte liegen wie bisher in state.scores[id] (18 Felder, null = offen).
// Neu und rueckwaertskompatibel: state.hole (aktive Bahn, 0-basiert), state.tab ("hole" | "table"),
// state.drafts ({ [bahn]: { [spielerId]: zahl | null } }) und state.undo (Liste von Momentaufnahmen).
/*MG_LOGIC_BEGIN*/
const MINIGOLF_HOLES = 18;
const MINIGOLF_MAX_STROKES = 7;
const MG_UNDO_MAX = 12;
function mgOk(v) {
  return typeof v === "number" && Number.isInteger(v) && v >= 1 && v <= MINIGOLF_MAX_STROKES;
}
function mgIsObj(o) {
  return !!o && typeof o === "object" && !Array.isArray(o);
}
function mgCard(scores, id) {
  const c = mgIsObj(scores) ? scores[id] : null;
  return Array.isArray(c) ? c : [];
}
function mgSaved(scores, id, h) {
  const v = mgCard(scores, id)[h];
  return v === null || v === undefined ? null : v;
}
// Entwuerfe bereinigen: nur bekannte Bahnen und Spieler, gueltige Zahlen oder null, keine leeren Bahnen.
function mgCleanDrafts(drafts, players, scores) {
  const out = {};
  if (!mgIsObj(drafts)) return out;
  Object.keys(drafts).forEach((hk) => {
    const h = Number(hk);
    if (!Number.isInteger(h) || h < 0 || h >= MINIGOLF_HOLES || !mgIsObj(drafts[hk])) return;
    const row = {};
    players.forEach((p) => {
      if (!Object.prototype.hasOwnProperty.call(drafts[hk], p.id)) return;
      const raw = drafts[hk][p.id];
      const v = mgOk(raw) ? raw : null;
      if (v !== mgSaved(scores, p.id, h)) row[p.id] = v;
    });
    if (Object.keys(row).length) out[h] = row;
  });
  return out;
}
function mgHoleComplete(players, scores, h) {
  return players.length > 0 && players.every((p) => mgSaved(scores, p.id, h) !== null);
}
// Erste nicht vollstaendig gespeicherte Bahn nach "from" (ohne Umlauf), sonst die erste offene ueberhaupt, sonst -1.
function mgNextOpen(players, scores, from) {
  for (let h = from + 1; h < MINIGOLF_HOLES; h++) if (!mgHoleComplete(players, scores, h)) return h;
  for (let h = 0; h <= Math.min(from, MINIGOLF_HOLES - 1); h++) if (!mgHoleComplete(players, scores, h)) return h;
  return -1;
}
// Oberflaechenzustand aus (auch alten) Spielstaenden ableiten.
function mgUi(state) {
  const s = mgIsObj(state) ? state : {};
  const players = Array.isArray(s.players) ? s.players : [];
  const scores = mgIsObj(s.scores) ? s.scores : {};
  let hole = Number.isInteger(s.hole) && s.hole >= 0 && s.hole < MINIGOLF_HOLES ? s.hole : -1;
  if (hole < 0) {
    const n = mgNextOpen(players, scores, -1);
    hole = n < 0 ? MINIGOLF_HOLES - 1 : n;
  }
  const tab = s.tab === "table" ? "table" : "hole";
  const drafts = mgCleanDrafts(s.drafts, players, scores);
  const undo = Array.isArray(s.undo) ? s.undo.filter((u) => mgIsObj(u) && mgIsObj(u.vals) && Array.isArray(u.holes)) : [];
  return { players, scores, hole, tab, drafts, undo };
}
function mgHasDraft(drafts, h, id) {
  return mgIsObj(drafts) && mgIsObj(drafts[h]) && Object.prototype.hasOwnProperty.call(drafts[h], id);
}
// Angezeigter Wert: Entwurf vor gespeichertem Wert.
function mgEff(ui, id, h) {
  return mgHasDraft(ui.drafts, h, id) ? ui.drafts[h][id] : mgSaved(ui.scores, id, h);
}
function mgHoleInfo(ui, h) {
  const saved = ui.players.filter((p) => mgSaved(ui.scores, p.id, h) !== null).length;
  const missing = ui.players.filter((p) => mgEff(ui, p.id, h) === null);
  const dirty = mgIsObj(ui.drafts[h]) && Object.keys(ui.drafts[h]).length > 0;
  const isNew = saved === 0;
  const complete = ui.players.length > 0 && missing.length === 0;
  const done = ui.players.length > 0 && saved === ui.players.length;
  return { saved, missing, dirty, isNew, complete, done, canSave: dirty && (isNew ? complete : true) };
}
// Entwurf fuer einen Spieler setzen. v = null markiert den Wert wieder als offen.
function mgSetDraft(state, id, h, v) {
  const ui = mgUi(state);
  if (!Number.isInteger(h) || h < 0 || h >= MINIGOLF_HOLES || !ui.players.some((p) => p.id === id)) return state;
  const val = mgOk(v) ? v : null;
  const drafts = { ...ui.drafts, [h]: { ...(ui.drafts[h] || {}) } };
  if (val === mgSaved(ui.scores, id, h)) delete drafts[h][id];
  else drafts[h][id] = val;
  if (!Object.keys(drafts[h]).length) delete drafts[h];
  return { ...state, drafts };
}
// Plus/Minus: leer + Plus ergibt 1, Minus nie unter 1, Plus nie ueber das Maximum.
function mgStep(state, id, h, dir) {
  const ui = mgUi(state);
  const cur = mgEff(ui, id, h);
  let next;
  if (cur === null) {
    if (dir <= 0) return state;
    next = 1;
  } else next = Math.max(1, Math.min(MINIGOLF_MAX_STROKES, cur + (dir > 0 ? 1 : -1)));
  if (next === cur) return state;
  return mgSetDraft(state, id, h, next);
}
function mgGoto(state, h) {
  const n = Math.max(0, Math.min(MINIGOLF_HOLES - 1, Number(h) || 0));
  return { ...state, hole: n };
}
function mgApply(ui, holes) {
  const scores = { ...ui.scores };
  ui.players.forEach((p) => {
    const card = Array.from({ length: MINIGOLF_HOLES }, (_, k) => mgSaved(ui.scores, p.id, k));
    let changed = false;
    holes.forEach((h) => {
      if (mgHasDraft(ui.drafts, h, p.id)) {
        card[h] = ui.drafts[h][p.id];
        changed = true;
      }
    });
    if (changed || !Array.isArray(scores[p.id])) scores[p.id] = card;
  });
  const drafts = { ...ui.drafts };
  holes.forEach((h) => delete drafts[h]);
  return { scores, drafts };
}
// Momentaufnahme nur der betroffenen Bahnen: spaetere Entwuerfe auf anderen Bahnen bleiben beim Zuruecknehmen erhalten.
function mgSnap(ui, holes) {
  const vals = {}, drafts = {};
  holes.forEach((h) => {
    vals[h] = {};
    ui.players.forEach((p) => (vals[h][p.id] = mgSaved(ui.scores, p.id, h)));
    if (ui.drafts[h]) drafts[h] = { ...ui.drafts[h] };
  });
  return { holes, hole: ui.hole, vals, drafts };
}
// Eine Bahn genau einmal uebernehmen. Ein zweiter Aufruf ohne neuen Entwurf aendert nichts.
function mgSave(state, h) {
  const ui = mgUi(state);
  if (!mgHoleInfo(ui, h).canSave) return state;
  const { scores, drafts } = mgApply(ui, [h]);
  const undo = [...ui.undo, mgSnap(ui, [h])].slice(-MG_UNDO_MAX);
  let hole = h;
  if (mgHoleComplete(ui.players, scores, h)) {
    const n = mgNextOpen(ui.players, scores, h);
    if (n >= 0) hole = n;
  }
  return { ...state, scores, drafts, undo, hole };
}
// Alle speicherbaren Entwuerfe (Tabellenansicht) in einem Schritt uebernehmen.
function mgSavableHoles(state) {
  const ui = mgUi(state);
  return Object.keys(ui.drafts).map(Number).sort((a, b) => a - b).filter((h) => mgHoleInfo(ui, h).canSave);
}
function mgSaveAll(state) {
  const ui = mgUi(state);
  const holes = mgSavableHoles(state);
  if (!holes.length) return state;
  const { scores, drafts } = mgApply(ui, holes);
  const undo = [...ui.undo, mgSnap(ui, holes)].slice(-MG_UNDO_MAX);
  return { ...state, scores, drafts, undo };
}
// Letzten Speicherschritt zuruecknehmen: Werte, Entwuerfe und aktive Bahn kehren gemeinsam zurueck.
function mgUndo(state) {
  const ui = mgUi(state);
  if (!ui.undo.length) return state;
  const last = ui.undo[ui.undo.length - 1];
  const holes = last.holes.filter((h) => Number.isInteger(h) && h >= 0 && h < MINIGOLF_HOLES);
  const scores = { ...ui.scores };
  ui.players.forEach((p) => {
    const card = Array.from({ length: MINIGOLF_HOLES }, (_, k) => mgSaved(ui.scores, p.id, k));
    holes.forEach((h) => {
      const row = mgIsObj(last.vals) && mgIsObj(last.vals[h]) ? last.vals[h] : {};
      card[h] = mgOk(row[p.id]) ? row[p.id] : null;
    });
    scores[p.id] = card;
  });
  const merged = { ...ui.drafts };
  holes.forEach((h) => {
    if (mgIsObj(last.drafts) && mgIsObj(last.drafts[h])) merged[h] = last.drafts[h];
    else delete merged[h];
  });
  const hole = Number.isInteger(last.hole) && last.hole >= 0 && last.hole < MINIGOLF_HOLES ? last.hole : ui.hole;
  return { ...state, scores, drafts: mgCleanDrafts(merged, ui.players, scores), hole, undo: ui.undo.slice(0, -1) };
}
// Frischer Oberflaechenzustand fuer eine neue Partie.
function mgFreshUi() {
  return { hole: 0, tab: "hole", drafts: {}, undo: [] };
}
// Zwischenstand: Rangliste nur ueber gemeinsam vollstaendig gespeicherte Bahnen. Fehlende Werte zaehlen nie als 0.
function mgStandings(players, scores) {
  const common = [];
  for (let h = 0; h < MINIGOLF_HOLES; h++) if (mgHoleComplete(players, scores, h)) common.push(h);
  const rows = players.map((p, i) => {
    let count = 0, total = 0, sum = 0;
    for (let h = 0; h < MINIGOLF_HOLES; h++) {
      const v = mgSaved(scores, p.id, h);
      if (v !== null) {
        count++;
        total += v;
      }
    }
    common.forEach((h) => (sum += mgSaved(scores, p.id, h)));
    return { id: p.id, name: p.name, idx: i, count, total, sum };
  });
  const uniform = rows.every((r) => r.count === common.length);
  rows.forEach((r) => (r.rank = common.length ? 1 + rows.filter((x) => x.sum < r.sum).length : null));
  const sorted = common.length ? [...rows].sort((a, b) => a.rank - b.rank || a.idx - b.idx) : rows;
  return { common: common.length, uniform, rows: sorted };
}
/*MG_LOGIC_END*/
export {
  MINIGOLF_HOLES,
  MINIGOLF_MAX_STROKES,
  MG_UNDO_MAX,
  mgOk,
  mgSaved,
  mgCleanDrafts,
  mgHoleComplete,
  mgNextOpen,
  mgUi,
  mgHasDraft,
  mgEff,
  mgHoleInfo,
  mgSetDraft,
  mgStep,
  mgGoto,
  mgSave,
  mgSavableHoles,
  mgSaveAll,
  mgUndo,
  mgFreshUi,
  mgStandings,
};
