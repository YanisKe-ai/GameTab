// Logiktests Minigolf Greenline (Entwurf, Speichern, Rueckgaengig, Zwischenstand).
// Aufruf: GAMETAB_SRC=web node tests/logic/test_minigolf.js
const assert = require("assert");
// Quelle: zusammengesetzter App-Code, sonst direkt web/src/games/minigolf/logic.js (reines JS ohne Importe)
let src = require("../lib/source.js").getSource(process.argv[2]);
if (src.indexOf("/*MG_LOGIC_BEGIN*/") < 0) src = require("fs").readFileSync(require("path").join(__dirname, "..", "..", "web", "src", "games", "minigolf", "logic.js"), "utf8");
const a = src.indexOf("/*MG_LOGIC_BEGIN*/"), b = src.indexOf("/*MG_LOGIC_END*/");
if (a < 0 || b < 0) throw Error("Marker MG_LOGIC fehlen");
const NAMES = ["MINIGOLF_HOLES", "MINIGOLF_MAX_STROKES", "MG_UNDO_MAX", "mgOk", "mgSaved", "mgUi", "mgEff", "mgHoleInfo", "mgSetDraft", "mgStep", "mgGoto", "mgSave", "mgSavableHoles", "mgSaveAll", "mgUndo", "mgFreshUi", "mgStandings", "mgNextOpen", "mgHoleComplete"];
const L = new Function(src.slice(a, b) + "\nreturn {" + NAMES.join(",") + "};")();

let ok = 0, bad = 0;
function T(name, fn) {
  try { fn(); ok++; } catch (e) { bad++; console.log("FEHLER: " + name + "\n  " + (e && e.message)); }
}
const card = (vals) => Array.from({ length: 18 }, (_, i) => (vals[i] === undefined ? null : vals[i]));
const P = (n) => Array.from({ length: n }, (_, i) => ({ id: i + 1, name: "S" + (i + 1) }));
const game = (players, cards, extra) => ({ phase: "play", players, scores: Object.fromEntries(players.map((p, i) => [p.id, card(cards[i] || [])])), ...(extra || {}) });
// Speichern und Laden wie localStorage (JSON macht Zahlen-Schluessel zu Strings)
const roundtrip = (s) => JSON.parse(JSON.stringify(s));

T("Alte Partie ohne neue Felder: Standardwerte, aktive Bahn = erste offene", () => {
  const s = game(P(2), [[3, 2, 4], [2, 3]]);
  const ui = L.mgUi(s);
  assert.equal(ui.hole, 2);
  assert.equal(ui.tab, "hole");
  assert.deepEqual(ui.drafts, {});
  assert.deepEqual(ui.undo, []);
  const all = game(P(1), [Array(18).fill(2)]);
  assert.equal(L.mgUi(all).hole, 17);
});

T("Leer ist nicht 0 und nicht 1; erstes Plus ergibt 1; Minus nie unter 1", () => {
  let s = game(P(2), [[], []]);
  assert.equal(L.mgEff(L.mgUi(s), 1, 0), null);
  assert.strictEqual(L.mgStep(s, 1, 0, -1), s, "Minus auf leer aendert nichts");
  s = L.mgStep(s, 1, 0, +1);
  assert.equal(L.mgEff(L.mgUi(s), 1, 0), 1);
  s = L.mgStep(s, 1, 0, -1);
  assert.equal(L.mgEff(L.mgUi(s), 1, 0), 1);
  for (let i = 0; i < 12; i++) s = L.mgStep(s, 1, 0, +1);
  assert.equal(L.mgEff(L.mgUi(s), 1, 0), L.MINIGOLF_MAX_STROKES, "Maximum wird nicht ueberschritten");
  assert.equal(s.scores[1][0], null, "Entwurf veraendert keine gespeicherten Werte");
});

T("Ungueltige Werte werden nicht als Zahl gespeichert, null markiert wieder offen", () => {
  let s = game(P(1), [[]]);
  s = L.mgSetDraft(s, 1, 0, 0);
  assert.equal(L.mgEff(L.mgUi(s), 1, 0), null);
  s = L.mgSetDraft(s, 1, 0, 99);
  assert.equal(L.mgEff(L.mgUi(s), 1, 0), null);
  s = L.mgSetDraft(s, 1, 0, 3);
  assert.equal(L.mgEff(L.mgUi(s), 1, 0), 3);
  s = L.mgSetDraft(s, 1, 0, null);
  assert.equal(L.mgEff(L.mgUi(s), 1, 0), null);
  assert.deepEqual(L.mgUi(s).drafts, {}, "Leerer Entwurf auf neuer Bahn verschwindet");
});

T("Neue Bahn: Speichern erst, wenn alle Werte da sind; fehlende Personen benannt", () => {
  let s = game(P(3), [[], [], []]);
  s = L.mgSetDraft(s, 1, 0, 3);
  s = L.mgSetDraft(s, 2, 0, 2);
  const info = L.mgHoleInfo(L.mgUi(s), 0);
  assert.equal(info.canSave, false);
  assert.deepEqual(info.missing.map((p) => p.name), ["S3"]);
  assert.strictEqual(L.mgSave(s, 0), s, "Unvollstaendige neue Bahn wird nicht gespeichert");
  s = L.mgSetDraft(s, 3, 0, 4);
  assert.equal(L.mgHoleInfo(L.mgUi(s), 0).canSave, true);
});

T("Speichern genau einmal (Doppelklick), Totale aus Bahnwerten, naechste offene Bahn", () => {
  let s = game(P(2), [[], []]);
  s = L.mgSetDraft(L.mgSetDraft(s, 1, 0, 3), 2, 0, 2);
  const s1 = L.mgSave(s, 0);
  const s2 = L.mgSave(s1, 0);
  assert.strictEqual(s2, s1, "zweiter Klick ist wirkungslos");
  assert.deepEqual([s1.scores[1][0], s1.scores[2][0]], [3, 2]);
  assert.equal(s1.undo.length, 1);
  assert.equal(s1.hole, 1);
  assert.deepEqual(L.mgUi(s1).drafts, {});
});

T("Entwurf zaehlt eine leere Bahn nicht als gespielt; Bahnwechsel behaelt Entwurf ohne 0", () => {
  let s = game(P(2), [[3], [2]], { hole: 1 });
  s = L.mgSetDraft(s, 1, 1, 4);
  s = L.mgGoto(s, 2);
  s = roundtrip(s);
  const st = L.mgStandings(s.players, s.scores);
  assert.equal(st.common, 1);
  assert.equal(L.mgEff(L.mgUi(s), 1, 1), 4, "Entwurf ueberlebt Wechsel und Neuladen");
  assert.equal(L.mgEff(L.mgUi(s), 2, 1), null, "fehlender Wert bleibt offen, nicht 0");
  assert.equal(s.scores[1][1], null);
});

T("Randbahnen: kein Umlauf von 18 auf 1", () => {
  const s = game(P(1), [[]]);
  assert.equal(L.mgGoto(s, 18).hole, 17);
  assert.equal(L.mgGoto(s, -1).hole, 0);
});

T("Korrektur ersetzt Werte statt neuer Runde; Undo bringt Werte und Summen zurueck", () => {
  let s = game(P(2), [[3, 2], [2, 2]], { hole: 0 });
  s = L.mgSetDraft(s, 1, 0, 5);
  const info = L.mgHoleInfo(L.mgUi(s), 0);
  assert.equal(info.isNew, false);
  assert.equal(info.canSave, true);
  const c = L.mgSave(s, 0);
  assert.equal(c.scores[1][0], 5);
  assert.equal(c.scores[1].filter((v) => v !== null).length, 2, "keine zusaetzliche Runde");
  assert.equal(L.mgStandings(c.players, c.scores).rows.find((r) => r.id === 1).total, 7);
  const u = L.mgUndo(roundtrip(c));
  assert.equal(u.scores[1][0], 3);
  assert.equal(L.mgStandings(u.players, u.scores).rows.find((r) => r.id === 1).total, 5);
  assert.equal(L.mgEff(L.mgUi(u), 1, 0), 5, "Entwurf vor dem Speichern kehrt zurueck");
  assert.equal(u.undo.length, 0);
  assert.strictEqual(L.mgUndo(u), u, "leerer Verlauf: nichts passiert");
});

T("Undo laesst spaetere Entwuerfe auf anderen Bahnen stehen", () => {
  let s = game(P(1), [[]]);
  s = L.mgSave(L.mgSetDraft(s, 1, 0, 2), 0);
  s = L.mgSetDraft(s, 1, 1, 4);
  const u = L.mgUndo(s);
  assert.equal(u.scores[1][0], null);
  assert.equal(L.mgEff(L.mgUi(u), 1, 1), 4);
  assert.equal(u.hole, 0);
});

T("Gespeicherten Wert leeren ist als Korrektur moeglich", () => {
  let s = game(P(2), [[3], [2]]);
  s = L.mgSetDraft(s, 2, 0, null);
  assert.equal(L.mgHoleInfo(L.mgUi(s), 0).canSave, true);
  s = L.mgSave(s, 0);
  assert.equal(s.scores[2][0], null);
});

T("Tabelle: alle speicherbaren Entwuerfe in einem Schritt, unvollstaendige neue Bahn bleibt Entwurf", () => {
  let s = game(P(2), [[3, 3], [2, 2]]);
  s = L.mgSetDraft(s, 1, 1, 4);
  s = L.mgSetDraft(s, 1, 5, 2);
  assert.deepEqual(L.mgSavableHoles(s), [1]);
  const r = L.mgSaveAll(s);
  assert.equal(r.scores[1][1], 4);
  assert.equal(r.scores[1][5], null);
  assert.equal(L.mgEff(L.mgUi(r), 1, 5), 2);
  assert.equal(r.undo.length, 1);
  const only = L.mgSetDraft(game(P(2), [[], []]), 1, 3, 2);
  assert.strictEqual(L.mgSaveAll(only), only, "nichts Speicherbares: Zustand bleibt gleich");
});

T("Zwischenstand: gemeinsame Bahnen, Gleichstand 1,1,3, fehlende Werte nicht als 0", () => {
  const ps = P(4);
  const s = game(ps, [[3, 2, 4, 2, 3, 4], [2, 3, 3, 2, 3, 3], [4, 3, 4, 3, 3, 4], [3, 3, 3, 4, 3, 3]]);
  const st = L.mgStandings(s.players, s.scores);
  assert.equal(st.common, 6);
  assert.equal(st.uniform, true);
  assert.deepEqual(st.rows.map((r) => [r.name, r.sum, r.rank]), [["S2", 16, 1], ["S1", 18, 2], ["S4", 19, 3], ["S3", 21, 4]]);
  const tie = L.mgStandings(P(3), game(P(3), [[2], [2], [3]]).scores);
  assert.deepEqual(tie.rows.map((r) => r.rank), [1, 1, 3]);
  const uneven = L.mgStandings(P(2), game(P(2), [[3, 3, 3], [2]]).scores);
  assert.equal(uneven.common, 1);
  assert.equal(uneven.uniform, false);
  assert.deepEqual(uneven.rows.map((r) => [r.id, r.sum, r.total, r.count]), [[2, 2, 2, 1], [1, 3, 9, 3]]);
  const none = L.mgStandings(P(2), game(P(2), [[], [4]]).scores);
  assert.equal(none.common, 0);
  assert.ok(none.rows.every((r) => r.rank === null), "ohne gemeinsame Bahn kein Rang und kein Sieger");
});

T("Gleiche Namen, verschiedene IDs bleiben getrennt", () => {
  const ps = [{ id: 1, name: "Yanis" }, { id: 2, name: "Yanis" }];
  let s = game(ps, [[], []]);
  s = L.mgSetDraft(L.mgSetDraft(s, 1, 0, 2), 2, 0, 5);
  s = L.mgSave(s, 0);
  assert.deepEqual([s.scores[1][0], s.scores[2][0]], [2, 5]);
});

T("Kaputte Entwuerfe aus dem Speicher werden verworfen", () => {
  const s = game(P(1), [[]], { drafts: { 0: { 1: "x", 9: 3 }, 40: { 1: 2 }, foo: 1 }, undo: [null, { a: 1 }], hole: 99, tab: "zzz" });
  const ui = L.mgUi(s);
  assert.deepEqual(ui.drafts, {}, "unbekannte Spieler und Bahnen weg, ungueltiger Wert = offen = gespeicherter Zustand");
  assert.deepEqual(ui.undo, []);
  assert.equal(ui.tab, "hole");
  assert.equal(ui.hole, 0);
});

T("Undo-Verlauf ist begrenzt", () => {
  let s = game(P(1), [[]]);
  for (let h = 0; h < 18; h++) s = L.mgSave(L.mgSetDraft(s, 1, h, 2), h);
  assert.equal(s.undo.length, L.MG_UNDO_MAX);
  assert.ok(L.mgHoleComplete(s.players, s.scores, 17));
  assert.equal(L.mgNextOpen(s.players, s.scores, 17), -1);
});

console.log(ok + " bestanden, " + bad + " fehlgeschlagen");
process.exit(bad ? 1 : 0);
