// lgD: Logiktests Darts (Zugreihenfolge, Shanghai-Vorrang). Aufruf: node test_darts.js <index.html>
const fs = require("fs");
const html = fs.readFileSync(process.argv[2] || __dirname + "/index.html", "utf8");
function lineOf(marker) { const i = html.indexOf(marker); if (i < 0) throw Error("fehlt: " + marker); const a = html.lastIndexOf("\n", i) + 1, b = html.indexOf("\n", i); return html.slice(a, b); }
function fromTo(marker) { const i = html.indexOf(marker); if (i < 0) throw Error("fehlt: " + marker); return html.slice(i, html.indexOf("\n", i)); }
const parts = [
  lineOf("const MATCH_LOG_KEY="), lineOf("const GT_MATCH_IDS="), lineOf("function gtIsObj("), fromTo("function gtWon("),
  lineOf("function rankedPodium("), lineOf("function shanghaiHitInfo("), lineOf("function splitScoreHitValue("),
  lineOf("const SPLIT_SCORE_TARGETS="), lineOf("function dartsScoreEnd("),
  lineOf("function HiScoreGame("), lineOf("function SplitScoreGame("), lineOf("function ShanghaiGame("),
];
for (const n of ["function gtDsStart(", "function gtDsOutcome(", "function gtDsApi(", "function gtDsBuild(", "function useGtDsRecord(", "function gtDsTx(", "function useGtRecord(", "function gtReopenMatch("]) if (html.includes(n)) parts.push(lineOf(n));
if (process.env.MOCKAPI) parts.push(`function rankedPodium(players,scoreFn,o){const opts=typeof o==="object"&&o?o:{lowWins:!!o};const lw=!!opts.lowWins;const W=opts.winners&&opts.winners.length?opts.winners.map(w=>typeof w==="object"?w.id:w):[];const isW=p=>W.includes(p.id)||W.includes(p.name);const arr=players.map(p=>({name:p.name,score:scoreFn(p),w:isW(p)}));const cmp=(a,b)=>lw?a.score-b.score:b.score-a.score;const ws=arr.filter(x=>x.w),rs=arr.filter(x=>!x.w).sort(cmp);const out=[...ws,...rs].map(x=>({name:x.name,score:x.score,rk:x.w?1:1+ws.length+rs.filter(o=>cmp(o,x)<0).length}));out.reason=opts.reason||"points";if(out.reason!=="points"&&out[0])out[0].why=out.reason;return out;}
function gtReopenMatch(g){REOPEN.push(g);}
function useGtRecord(game,done,build){if(done){const b=build();if(b.extra&&b.extra.winners){const log=loadMatchLogRaw().filter(m=>m.game!==game);log.push({game,participants:b.participants.map(p=>({...p,norm:normalizeName(p.name),rank:b.extra.winners.includes(p.name)?1:2})),winner:b.extra.winners[0],winners:b.extra.winners,reason:b.extra.reason});saveMatchLog(log);}else recordMatch(game,b.participants,b.lowWins,b.extra);}else gtReopenMatch(game);}`);
const REOPEN = [];
const API = !!process.env.MOCKAPI || (html.includes("function useGtRecord(") && html.includes("function gtReopenMatch("));
const store = {};
const localStorage = { getItem: k => (k in store ? store[k] : null), setItem: (k, v) => { store[k] = String(v); }, removeItem: k => { delete store[k]; } };
const effects = [];
const React = { createElement: (type, props, ...ch) => ({ type, props: props || {}, ch }), Fragment: "F" };
const mkT = () => k => { const f = (...a) => k + "(" + a.join(",") + ")"; f.toString = () => k; f.toUpperCase = () => String(k).toUpperCase(); return f; };
const stubs = { REOPEN, React, localStorage, useState: i => [typeof i === "function" ? i() : i, () => {}], useEffect: f => effects.push(f), useRef: v => ({ current: v }), useT: mkT, useCelebration: () => null, GLOBAL_STYLES: "" };
if (!API) stubs.gtReopenMatch = undefined;
if (!API) stubs.useGtRecord = undefined;
const sandbox = new Proxy(stubs, { has: (o, k) => !(k in globalThis) || k in o, get: (o, k) => (k in o ? o[k] : (k === Symbol.unscopables ? undefined : function stub() { return { type: "stub", props: {}, ch: [] }; })) });
const names = "HiScoreGame,SplitScoreGame,ShanghaiGame,dartsScoreEnd,recordMatch,loadMatchLog,loadMatchLogRaw,gtWon,GT_MATCH_IDS" + (html.includes("function gtDsOutcome(") ? ",gtDsOutcome" : "");
const L = new Function("sandbox", "with(sandbox){return (function(){" + [...new Set(parts)].join("\n") + "\nreturn {" + names + "};})();}")(sandbox);

let fails = 0, oks = 0;
function ok(c, m) { if (c) oks++; else { fails++; console.log("FEHLER: " + m); } }
function find(node, pred) { if (!node || typeof node !== "object") return null; if (pred(node)) return node; for (const c of [].concat(node.ch || [], node.props && node.props.children || [])) { const r = find(c, pred); if (r) return r; } return null; }
function texts(node, out = []) { if (node == null) return out; if (typeof node === "string" || typeof node === "number") { out.push(String(node)); return out; } if (typeof node === "function") { out.push(String(node)); return out; } if (Array.isArray(node)) { node.forEach(n => texts(n, out)); return out; } if (node.ch) texts(node.ch, out); return out; }

const GAMES = { hiscore: L.HiScoreGame, splitscore: L.SplitScoreGame, shanghai: L.ShanghaiGame };
function mkGame(game, n, rounds) {
  let state = { phase: "setup", players: Array.from({ length: n }, (_, i) => ({ id: i + 1, name: "P" + (i + 1) })), roundsTarget: rounds, currentIdx: 0, currentRound: 1, scores: {}, history: [], winner: null };
  const api = {
    get state() { return state; }, set state(s) { state = s; },
    setState: u => { state = typeof u === "function" ? u(state) : u; },
    render() { effects.length = 0; const el = GAMES[game]({ state, setState: api.setState, onBack() {}, onHome() {}, onEndGame() {}, lang: "de", theme: "dark" }); return el; },
    props() { const el = api.render(); return find(el, x => x.props && (x.props.onConfirmTurn || x.props.onStart)).props; },
    start(startIdx) { const r = Math.random; Math.random = () => (startIdx + 0.5) / n; const pr = find(api.render(), x => x.props && (x.props.onStart || x.props.onRestart)).props; (pr.onStart || pr.onRestart)(); Math.random = r; },
    turn(darts) { api.props().onConfirmTurn(darts); },
    undo() { const real = state; state = { ...real, phase: "play" }; const pr = api.props(); state = real; pr.onUndoTurn(); },
    runEffects() { L.GT_MATCH_IDS[game] = "mid_" + MID; api.render(); effects.splice(0).forEach(f => f()); },
  };
  return api;
}
const miss = [{ v: 0, l: "0" }, { v: 0, l: "0" }, { v: 0, l: "0" }];
const D = v => ({ v, l: String(v) });

// ---------- A: Zugreihenfolge ----------
for (const game of Object.keys(GAMES)) {
  for (const n of [2, 3, 4, 8]) {
    for (let s = 0; s < n; s++) {
      const R = game === "splitscore" ? 9 : 7;
      const g = mkGame(game, n, R); g.start(s);
      ok(g.state.currentIdx === s && g.state.startIdx === s, `${game} n=${n} s=${s}: Start nicht gesetzt`);
      const seen = [];
      let guard = 0;
      while (g.state.phase === "play" && guard++ < 500) {
        const r = g.state.currentRound, p = g.state.currentIdx;
        seen.push([r, p]);
        g.turn(miss);
        // Reload-Simulation: JSON-Rundreise
        g.state = JSON.parse(JSON.stringify(g.state));
      }
      ok(g.state.phase === "done", `${game} n=${n} s=${s}: nicht beendet`);
      ok(seen.length === n * R, `${game} n=${n} s=${s}: ${seen.length} Zuege statt ${n * R}`);
      for (let r = 1; r <= R; r++) {
        const inR = seen.filter(x => x[0] === r).map(x => x[1]);
        ok(inR.length === n && new Set(inR).size === n, `${game} n=${n} s=${s}: Runde ${r} hat ${inR.length} Zuege`);
        ok(inR[0] === s, `${game} n=${n} s=${s}: Runde ${r} beginnt mit ${inR[0]}`);
      }
      ok(g.state.endReason === "points", `${game}: endReason fehlt`);
    }
  }
}
// Undo vor/nach Rundenwechsel und nach letztem Zug (Hi-Score, 3 Personen, Start 2)
{
  const g = mkGame("hiscore", 3, 2); g.start(2);
  g.turn([D(20), D(20), D(20)]); // P3 60
  g.turn([D(5), D(5), D(5)]);    // P1 15
  const before = JSON.stringify(g.state);
  g.turn([D(1), D(1), D(1)]);    // P2 3 -> Rundenwechsel
  ok(g.state.currentRound === 2 && g.state.currentIdx === 2, "Undo-Test: Rundenwechsel falsch " + g.state.currentRound + "/" + g.state.currentIdx);
  g.undo();
  const a = g.state, b = JSON.parse(before);
  ok(a.currentRound === b.currentRound && a.currentIdx === b.currentIdx && JSON.stringify(a.scores) === JSON.stringify(b.scores) && a.history.length === b.history.length, "Undo ueber Rundenwechsel stellt Zustand nicht her");
  g.turn([D(1), D(1), D(1)]); g.turn(miss); g.turn(miss);
  ok(g.state.phase === "play" && g.state.currentIdx === 1, "Runde 2 vorzeitig beendet");
  g.turn(miss);
  ok(g.state.phase === "done", "Ende nach letzter Runde fehlt");
  g.undo();
  ok(g.state.phase === "play" && g.state.currentRound === 2 && g.state.currentIdx === 1 && g.state.endReason == null && g.state.winner == null, "Undo nach letztem Zug falsch");
}
// Bestandsdaten ohne startIdx: aus Historie abgeleitet
{
  const g = mkGame("hiscore", 3, 2); g.start(1);
  g.turn(miss);
  const st = { ...g.state }; delete st.startIdx; g.state = st;
  g.turn(miss); g.turn(miss);
  ok(g.state.currentRound === 2 && g.state.currentIdx === 1 && g.state.startIdx === 1, "Bestandsstand: Start nicht aus Historie abgeleitet");
}
// Revanche: neuer Start, Reset
{
  const g = mkGame("shanghai", 3, 7); g.start(1); g.turn([{ v: 1, l: "1" }, { v: 2, l: "D1" }, { v: 3, l: "T1" }]);
  ok(g.state.phase === "done" && g.state.endReason === "shanghai", "Shanghai-Sofortsieg fehlt");
  g.start(2);
  ok(g.state.phase === "play" && g.state.startIdx === 2 && g.state.endReason == null && g.state.history.length === 0, "Revanche setzt nicht zurueck");
}

// ---------- B: Shanghai-Vorrang ----------
let MID = 0;
function shanghaiCase(label, aPts) {
  // P1 startet, Runde 1: P1 trifft aPts (als Einser), P2 nichts; Runde 2: P1 nichts, P2 Shanghai auf 2 (12 Punkte)
  for (const k in store) delete store[k]; MID++;
  const g = mkGame("shanghai", 3, 7); g.start(0);
  const ones = Array.from({ length: 3 }, (_, i) => (i < aPts ? { v: 1, l: "1" } : { v: 0, l: "0" }));
  g.turn(ones); g.turn(miss); g.turn(miss);
  // Runde 2
  const twoHits = { 0: [{ v: 2, l: "2" }, { v: 0, l: "0" }, { v: 0, l: "0" }] };
  g.turn(twoHits[0]);
  if (label === "mehr") { /* P1 hat 3+2=5 */ }
  g.turn([{ v: 2, l: "2" }, { v: 4, l: "D2" }, { v: 6, l: "T2" }]);
  const st = g.state;
  ok(st.phase === "done" && st.endReason === "shanghai" && st.winner === 2, `Shanghai ${label}: kein Sofortsieg`);
  ok(st.scores[2] === 12, `Shanghai ${label}: Punkte veraendert`);
  const props = g.props ? null : null;
  const el = g.render();
  const pod = find(el, x => x.props && x.props.gameId === "shanghai" && "ranked" in x.props).props;
  ok(pod.ranked[0].name === "P2" && pod.ranked[0].score === 12, `Shanghai ${label}: Podest-Platz 1 ist ${pod.ranked[0].name}`);
  ok(pod.ranked.slice(1).every(e => e.rk !== pod.ranked[0].rk), `Shanghai ${label}: Co-Sieger moeglich`);
  if (API) ok(pod.ranked.reason === "shanghai", `Shanghai ${label}: reason fehlt am Podest-Array`);
  const tx = texts(el).join(" ");
  ok(/shanghaiInstantWin\(P2\)/.test(tx), `Shanghai ${label}: Siegmeldung falsch`);
  ok(!/yatzyWinsWith\(P1/.test(tx), `Shanghai ${label}: P1 als Sieger in Endansicht`);
  g.runEffects();
  const log = L.loadMatchLog().filter(m => m.game === "shanghai");
  ok(log.length === 1, `Shanghai ${label}: ${log.length} Statistikeintraege`);
  const m = log[log.length - 1];
  ok(m && L.gtWon(m, "p2") && !L.gtWon(m, "p1") && !L.gtWon(m, "p3"), `Shanghai ${label}: Statistik-Sieger falsch (${m && m.winner}/${m && JSON.stringify(m.winners)})`);
  ok(m && m.participants.find(p => p.name === "P2").rank === 1 && m.participants.find(p => p.name === "P1").rank === 2, `Shanghai ${label}: Statistik-Raenge falsch`);
  ok(m && m.participants.find(p => p.name === "P2").score === 12, `Shanghai ${label}: Statistik-Punkte veraendert`);
  // Reload nach Abschluss
  g.state = JSON.parse(JSON.stringify(g.state));
  const pod2 = find(g.render(), x => x.props && x.props.gameId === "shanghai" && "ranked" in x.props).props;
  ok(pod2.ranked[0].name === "P2", `Shanghai ${label}: nach Reload anderer Sieger`);
  // Undo des Shanghai-Zuges
  g.undo();
  ok(g.state.phase === "play" && g.state.currentIdx === 1 && g.state.currentRound === 2 && g.state.scores[2] === 0 && g.state.endReason == null, `Shanghai ${label}: Undo stellt nicht her`);
  return g;
}
shanghaiCase("weniger", 3); // P1: 3+2=5 < 12
{ // gleich: P1 erreicht 12 Punkte vorher (Runde 1: T1+T1+T1=9? Einser max 3*3=9, Runde 2: 3 Punkte)
  for (const k in store) delete store[k]; MID++;
  const g = mkGame("shanghai", 2, 7); g.start(0);
  g.turn([{ v: 3, l: "T1" }, { v: 3, l: "T1" }, { v: 3, l: "T1" }]); g.turn(miss);
  g.turn([{ v: 2, l: "2" }, { v: 0, l: "0" }, { v: 0, l: "0" }]); // P1 11
  ok(g.state.scores[1] === 11, "gleich: Aufbau");
  // P1 12 machen: Runde 2 noch 1 Punkt fehlt; stattdessen B hat 12 und A 11 -> zusaetzlich A=12 testen per Stand
  g.state = { ...g.state, scores: { ...g.state.scores, 1: 12 } };
  g.turn([{ v: 2, l: "2" }, { v: 4, l: "D2" }, { v: 6, l: "T2" }]);
  const pod = find(g.render(), x => x.props && x.props.gameId === "shanghai" && "ranked" in x.props).props;
  ok(pod.ranked[0].name === "P2" && pod.ranked[1].score === 12 && pod.ranked[0].rk !== pod.ranked[1].rk, "Shanghai gleich: punktgleicher P1 ist Co-Sieger");
  g.runEffects(); const m = L.loadMatchLog().filter(x => x.game === "shanghai").pop();
  ok(m && L.gtWon(m, "p2") && !L.gtWon(m, "p1"), "Shanghai gleich: Statistik Co-Sieger");
}
{ // mehr: Shanghai-Sieger mit mehr Punkten
  for (const k in store) delete store[k]; MID++;
  const g = mkGame("shanghai", 2, 7); g.start(1);
  g.turn([{ v: 1, l: "1" }, { v: 0, l: "0" }, { v: 0, l: "0" }]); g.turn(miss); // P2 1, P1 0
  g.turn([{ v: 2, l: "2" }, { v: 4, l: "D2" }, { v: 6, l: "T2" }]);
  const pod = find(g.render(), x => x.props && x.props.gameId === "shanghai" && "ranked" in x.props).props;
  ok(g.state.winner === 2 && pod.ranked[0].name === "P2" && pod.ranked[0].score === 13, "Shanghai mehr: falsch");
}
{ // Normaler Abschluss mit Gleichstand: beide Sieger, kein Shanghai-Hinweis
  for (const k in store) delete store[k]; MID++;
  const g = mkGame("shanghai", 2, 1); g.start(0);
  g.turn([{ v: 1, l: "1" }, { v: 0, l: "0" }, { v: 0, l: "0" }]); g.turn([{ v: 1, l: "1" }, { v: 0, l: "0" }, { v: 0, l: "0" }]);
  ok(g.state.phase === "done" && g.state.endReason === "points", "Normal: kein Ende");
  const el = g.render(); const pod = find(el, x => x.props && x.props.gameId === "shanghai" && "ranked" in x.props).props;
  ok(!(pod.ranked.reason && pod.ranked.reason !== "points") && pod.ranked[0].rk === pod.ranked[1].rk && pod.ranked[0].score === pod.ranked[1].score, "Normal Gleichstand: Podest nicht gleichrangig");
  ok(/P1 & P2/.test(texts(el).join(" ")), "Normal Gleichstand: Endansicht nennt nicht beide");
  g.runEffects(); const m = L.loadMatchLog().filter(x => x.game === "shanghai").pop();
  ok(m && L.gtWon(m, "p1") && L.gtWon(m, "p2"), "Normal Gleichstand: Statistik nicht beide");
}
{ // Normaler Abschluss, Einzelsieger
  for (const k in store) delete store[k]; MID++;
  const g = mkGame("shanghai", 2, 1); g.start(1);
  g.turn([{ v: 1, l: "1" }, { v: 0, l: "0" }, { v: 0, l: "0" }]); g.turn([{ v: 3, l: "T1" }, { v: 0, l: "0" }, { v: 0, l: "0" }]);
  const pod = find(g.render(), x => x.props && x.props.gameId === "shanghai" && "ranked" in x.props).props;
  ok(pod.ranked[0].name === "P1" && pod.ranked[0].score === 3, "Normal: Sieger falsch");
  g.runEffects(); const m = L.loadMatchLog().filter(x => x.game === "shanghai").pop();
  ok(m && L.gtWon(m, "p1") && !L.gtWon(m, "p2"), "Normal: Statistik falsch");
}
{ // Bestandspartie ohne endReason, letzter Zug Shanghai: aus Historie abgeleitet
  const g = mkGame("shanghai", 2, 7); g.start(0);
  g.turn([{ v: 3, l: "T1" }, { v: 3, l: "T1" }, { v: 3, l: "T1" }]);
  g.turn([{ v: 1, l: "1" }, { v: 2, l: "D1" }, { v: 3, l: "T1" }]);
  const st = { ...g.state }; delete st.endReason; g.state = st;
  const pod = find(g.render(), x => x.props && x.props.gameId === "shanghai" && "ranked" in x.props).props;
  ok(pod.ranked[0].name === "P2", "Bestand Shanghai: nicht erkannt");
}
console.log(`Darts-Logik: ${oks} OK, ${fails} Fehler`);
process.exit(fails ? 1 : 0);
