// «Du»-Statistik (stats/me.js): Erkennung per Name, Akzent, Alias, Teamname und Profil-Team.
// Aufruf: node tests/logic/test_me_stats.js [pfad/zu/index.html]
const assert = require("assert/strict");
const src = require("./../lib/source.js").getSource(process.argv[2]);
const blk = (a, b) => { const i = src.indexOf(a), j = src.indexOf(b); assert(i >= 0 && j > i, "Marker fehlen: " + a); return src.slice(i, j); };
const F = new Function(blk("/*GT_STATS_BEGIN*/", "/*GT_STATS_END*/") + ";" + blk("/*GT_ME_BEGIN*/", "/*GT_ME_END*/") + ";return{gtMeModel,gtMeWave,gtMeIsoWeek};")();
let n = 0; const fails = [];
function T(name, fn) { try { fn(); n++; } catch (e) { fails.push(name + ": " + (e.message || e).split("\n")[0]); } }
const NOW = new Date(2026, 10, 13, 20, 0).getTime();
let id = 0;
function M(game, ps, winners, daysAgo) {
  return { id: "m" + (++id), ts: NOW - (daysAgo || 1) * 864e5, game, winners,
    participants: ps.map((x) => (typeof x === "string" ? { name: x } : x)) };
}
const team = (name, members) => Object.assign({ name, isTeam: true }, members ? { members } : {});
const O = { now: new Date(NOW) };

T("Name mit Akzent und Grossschreibung zählt", () => {
  const r = F.gtMeModel([M("skyjo", ["YANÍS", "Ben"], ["YANÍS"]), M("skyjo", ["yanis", "Ben"], ["Ben"])], { name: "Yanis" }, O);
  assert.equal(r.matches, 2); assert.equal(r.wins, 1);
});
T("Alias zählt mit", () => {
  const r = F.gtMeModel([M("skyjo", ["Jannis", "Ben"], ["Jannis"]), M("yatzy", ["Yanis", "Ben"], ["Ben"])], { name: "Yanis", aliases: ["Jannis"] }, O);
  assert.equal(r.matches, 2); assert.equal(r.wins, 1);
});
T("Erzfeind ab 3 Niederlagen und mehr als die Hälfte", () => {
  const L = [];
  for (let i = 0; i < 4; i++) L.push(M("skyjo", ["Yanis", "Ben"], ["Ben"]));
  L.push(M("skyjo", ["Yanis", "Ben"], ["Yanis"]));
  L.push(M("skyjo", ["Yanis", "Lena"], ["Lena"]));
  const r = F.gtMeModel(L, { name: "Yanis" }, O);
  assert.equal(r.nemesis.name, "Ben"); assert.equal(r.nemesis.theyWon, 4); assert.equal(r.nemesis.iWon, 1);
});
T("Kein Erzfeind bei Gleichstand", () => {
  const L = [];
  for (let i = 0; i < 3; i++) { L.push(M("skyjo", ["Yanis", "Ben"], ["Ben"])); L.push(M("skyjo", ["Yanis", "Lena"], ["Lena"])); }
  assert.equal(F.gtMeModel(L, { name: "Yanis" }, O).nemesis, null);
});
T("Team «Martin & Yanis» zählt, Partner Martin", () => {
  const L = [M("schieber", [team("Martin & Yanis"), team("Ben & Lena")], ["Martin & Yanis"]), M("schieber", [team("Yanis und Martin"), team("Ben & Lena")], ["Ben & Lena"]), M("schieber", [team("Martin + Yanis"), team("Ben & Lena")], ["Martin + Yanis"])];
  const r = F.gtMeModel(L, { name: "Yanis" }, O);
  assert.equal(r.matches, 3); assert.equal(r.wins, 2);
  assert.equal(r.partner.matches, 3); assert.equal(r.partner.wins, 2);
  assert.equal(r.fav.game, "schieber"); assert.equal(r.fav.team, 3);
});
T("Team mit Mitgliederliste zählt", () => {
  const r = F.gtMeModel([M("tabu", [team("Blau", ["yanis", "mia"]), team("Rot", ["ben", "noah"])], ["Blau"])], { name: "Yanis" }, O);
  assert.equal(r.matches, 1); assert.equal(r.wins, 1);
});
T("Team ohne Namen: Frage ab 2 Partien, nach Ja zählt es", () => {
  const L = [M("schieber", [team("Die Füchse"), team("Ben & Lena")], ["Die Füchse"]), M("schieber", [team("Die Füchse"), team("Ben & Lena")], ["Ben & Lena"])];
  const a = F.gtMeModel(L, { name: "Yanis" }, O);
  assert.equal(a.ask.name, "Die Füchse"); assert.equal(a.ask.n, 2); assert.equal(a.matches, 0);
  const b = F.gtMeModel(L, { name: "Yanis", teams: ["Die Füchse"] }, O);
  assert.equal(b.ask, null); assert.equal(b.matches, 2); assert.equal(b.wins, 1);
  const c = F.gtMeModel(L, { name: "Yanis", notTeams: ["die füchse"] }, O);
  assert.equal(c.empty, true); assert(!c.ask);
});
T("Fremdes Team mit zwei Namen und «Team 1» lösen keine Frage aus", () => {
  const L = [M("schieber", [team("Ben & Lena"), team("Team 1")], ["Team 1"]), M("schieber", [team("Ben & Lena"), team("Team 1")], ["Team 1"])];
  assert.equal(F.gtMeModel(L, { name: "Yanis" }, O).empty, true);
});
T("Welle: 8 Wochen, Partyspiele getrennt, alte Partien ausserhalb", () => {
  const L = [M("skyjo", ["Yanis", "Ben"], ["Ben"], 1), M("tabu", [team("Yanis & Mia"), team("Ben & Lena")], ["Ben & Lena"], 2), M("skyjo", ["Yanis", "Ben"], ["Ben"], 90)];
  const r = F.gtMeModel(L, { name: "Yanis" }, O);
  assert.equal(r.weeks.length, 8); assert.equal(r.weekTotal, 2);
  const last = r.weeks[7]; assert.equal(last.score + last.party, 2); assert.equal(last.party, 1);
  assert.equal(r.weeks[7].kw, F.gtMeIsoWeek(NOW));
  const g = F.gtMeWave(r.weeks, 326, 150); assert.equal(g.X.length, 8); assert(g.areaT.endsWith("Z"));
});
T("Welle schwingt nicht unter die Grundlinie", () => {
  const wk = [4, 0, 0, 4, 0, 6, 0, 1].map((v, i) => ({ score: v, party: i % 2 ? 3 : 0 }));
  const g = F.gtMeWave(wk, 326, 150);
  [g.lineB, g.lineT, g.areaT].forEach((d) => { const ys = d.replace(/[MCLZ]/g, " ").trim().split(/\s+/).map(Number).filter((_, i) => i % 2 === 1); ys.forEach((y) => assert(y >= 0 && y <= 150.01, "y ausserhalb: " + y)); });
});
T("Langer Teamname wird erkannt", () => {
  const nm = "Die unschlagbaren Weltmeister aus Basel";
  const L = [M("schieber", [team(nm), team("Ben & Lena")], [nm]), M("schieber", [team(nm), team("Ben & Lena")], ["Ben & Lena"])];
  assert.equal(F.gtMeModel(L, { name: "Yanis", teams: [nm] }, O).matches, 2);
});
T("Ohne Profil kein Modell", () => { assert.equal(F.gtMeModel([], null, O), null); });
T("ISO-Woche 13.11.2026 ist KW46", () => { assert.equal(F.gtMeIsoWeek(NOW), 46); });

if (fails.length) { console.log("ROT " + fails.length + " von " + (n + fails.length)); fails.forEach((f) => console.log("  - " + f)); process.exit(1); }
console.log("GRUEN " + n + " Tests (Du-Statistik)");
