// Tutto Plus/Minus (±1000): node tests/logic/test_tutto_steal.js
const assert = require("assert/strict");
const src = require("./../lib/source.js").getSource(process.argv[2]);
const a = src.indexOf("/*GT_TT_STEAL_BEGIN*/"), b = src.indexOf("/*GT_TT_STEAL_END*/");
assert(a >= 0 && b > a, "Marker GT_TT_STEAL fehlen");
const ttSteal = new Function(src.slice(a, b) + ";return ttSteal;")();
const P = (...tots) => tots.map((t, i) => ({ id: i + 1, name: "P" + (i + 1), entries: t ? [t] : [] }));
const sum = (p) => p.entries.reduce((s, e) => s + e, 0);
let n = 0; const T = (m, f) => { f(); n++; };
T("Führender verliert 1000, Werfender bekommt 1000", () => { const r = ttSteal(P(2000, 5000, 1000), 2); assert.deepEqual(r.players.map(sum), [2000, 4000, 2000]); assert.deepEqual(r.losers, [1]); });
T("Gleichstand: alle Führenden verlieren", () => { const r = ttSteal(P(5000, 5000, 1000), 2); assert.deepEqual(r.players.map(sum), [4000, 4000, 2000]); });
T("Werfender führt allein: niemand verliert", () => { const r = ttSteal(P(6000, 2000), 0); assert.deepEqual(r.players.map(sum), [7000, 2000]); assert.deepEqual(r.losers, []); });
T("Werfender teilt die Führung: nur der andere verliert", () => { const r = ttSteal(P(3000, 3000, 100), 0); assert.deepEqual(r.players.map(sum), [4000, 2000, 100]); });
T("Eintrag als eigene Zeile (Rückgängig/Verlauf möglich)", () => { const r = ttSteal(P(1000, 3000), 0); assert.deepEqual(r.players[0].entries, [1000, 1000]); assert.deepEqual(r.players[1].entries, [3000, -1000]); });
T("Ohne Auswahl nichts", () => { assert.equal(ttSteal(P(1, 2), -1), null); });
console.log("GRUEN " + n + " Tests (Tutto Plus/Minus)");
