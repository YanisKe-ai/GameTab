// Persoenliche Statistik («Du»-Kacheln). Reine Rechnung, liest nichts aus dem Speicher.
// Erkennung: eigener Name und Aliase; Teams zaehlen, wenn ein Mitglied- oder Teamnamenteil ich bin
// («Martin & Yanis») oder das Team im Profil als meins markiert ist («Die Füchse»).
import { GT_STATS } from "./core.js";

/*GT_ME_BEGIN*/
const GT_ME_SPLIT = /\s+(?:&|\+|\/|und|and|et|e|y)\s+|\s*[&+\/]\s*/i;
const GT_ME_DEF = /^(Spieler|Player|Joueur|Giocatore|Jugador|Jogador|Team|Equipo|Squadra|Equipe|Équipe)\s*\d+$/i;
const GT_ME_DAY = 864e5;

function gtMeSplit(name) { return String(name || "").split(GT_ME_SPLIT).map((s) => s.trim()).filter(Boolean); }

function gtMeWeekStart(ts) { const d = new Date(ts); d.setHours(0, 0, 0, 0); const wd = (d.getDay() + 6) % 7; d.setDate(d.getDate() - wd); return d.getTime(); }

function gtMeIsoWeek(ts) {
  const d = new Date(ts); d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + 3 - ((d.getDay() + 6) % 7));
  const w1 = new Date(d.getFullYear(), 0, 4);
  return 1 + Math.round(((d - w1) / GT_ME_DAY - 3 + ((w1.getDay() + 6) % 7)) / 7);
}

// matches: Rohdaten aus dem Match-Log; prof: {name, aliases, teams, notTeams}; o: Filter wie GT_STATS.build
function gtMeModel(matches, prof, o) {
  if (!prof || !prof.name) return null;
  const N = GT_STATS.norm;
  const me = new Set([prof.name].concat(prof.aliases || []).map(N).filter(Boolean));
  const myTeams = new Set((prof.teams || []).map(N).filter(Boolean));
  const noTeams = new Set((prof.notTeams || []).map(N).filter(Boolean));
  const GAMES = GT_STATS.GAMES || {};
  const ms = GT_STATS.filter(matches, o || {});
  const now = o && o.now instanceof Date ? o.now.getTime() : (o && typeof o.now === "number" ? o.now : Date.now());

  // Welches Team in dieser Partie bin ich? Gibt das Teilnehmer-Objekt zurueck (oder null).
  const teamOf = (m) => m.teams.find((p) => (p.members && p.members.some((k) => me.has(k))) || gtMeSplit(p.name).some((x) => me.has(N(x))) || myTeams.has(p.key)) || null;

  let matchesN = 0, decided = 0, wins = 0;
  const perGame = {}, opp = {}, partners = {}, unknown = {};
  const mine = [];
  ms.forEach((m) => {
    const ind = m.ind.find((p) => me.has(p.key));
    const tm = ind ? null : teamOf(m);
    if (!ind && !tm) {
      // Kandidaten fuer die Teamfrage: Teams ohne erkennbare Mitglieder
      m.teams.forEach((p) => {
        if (p.members && p.members.length) return;
        if (gtMeSplit(p.name).length > 1 || GT_ME_DEF.test(p.name.trim()) || noTeams.has(p.key) || myTeams.has(p.key)) return;
        const u = unknown[p.key] || (unknown[p.key] = { key: p.key, name: p.name, n: 0, last: 0 });
        u.n++; if (m.ts && m.ts > u.last) u.last = m.ts;
      });
      return;
    }
    const myKey = ind ? ind.key : tm.key;
    const won = m.win.has(myKey);
    matchesN++; if (m.decided) { decided++; if (won) wins++; }
    mine.push({ ts: m.ts, game: m.game, team: !!tm });
    const g = perGame[m.game] || (perGame[m.game] = { game: m.game, matches: 0, team: 0, decided: 0, wins: 0 });
    g.matches++; if (tm) g.team++; if (m.decided) { g.decided++; if (won) g.wins++; }
    if (ind && m.decided) {
      m.ind.forEach((p) => {
        if (p.key === myKey) return;
        const x = opp[p.key] || (opp[p.key] = { key: p.key, name: p.name, together: 0, theyWon: 0, iWon: 0 });
        x.together++;
        const ow = m.win.has(p.key);
        if (ow && !won) x.theyWon++;
        if (won && !ow) x.iWon++;
      });
    }
    if (tm) {
      const others = tm.members && tm.members.length ? tm.members.filter((k) => !me.has(k)) : gtMeSplit(tm.name).filter((x) => !me.has(N(x))).map(N);
      const pk = others.length ? others.slice().sort().join("|") : "team:" + tm.key;
      const label = tm.name;
      const x = partners[pk] || (partners[pk] = { key: pk, name: label, matches: 0, decided: 0, wins: 0, games: {} });
      x.name = label; x.matches++; x.games[m.game] = 1; if (m.decided) { x.decided++; if (won) x.wins++; }
    }
  });
  if (!matchesN && !Object.keys(unknown).length) return { empty: true, name: prof.name };

  // Erzfeind: wie GT_STATS.profile (mind. 3 Niederlagen, mehr als die Haelfte der gemeinsamen Partien, eindeutig)
  let nemesis = null;
  const L = Object.values(opp).filter((x) => x.theyWon >= 3 && x.theyWon / x.together > 0.5).sort((a, b) => b.theyWon - a.theyWon || b.together - a.together);
  if (L.length && !(L[1] && L[1].theyWon === L[0].theyWon)) nemesis = L[0];

  const fav = Object.values(perGame).sort((a, b) => b.matches - a.matches || b.wins - a.wins)[0] || null;
  const partner = Object.values(partners).filter((x) => x.matches >= 2).sort((a, b) => b.wins - a.wins || b.matches - a.matches)[0] || null;
  const ask = Object.values(unknown).filter((u) => u.n >= 2).sort((a, b) => b.n - a.n || b.last - a.last)[0] || null;

  // Welle: letzte 8 Wochen bis heute, Schreibunterlagen und Partyspiele gestapelt
  const w0 = gtMeWeekStart(now) - 7 * 7 * GT_ME_DAY;
  const weeks = [];
  for (let i = 0; i < 8; i++) { const s = w0 + i * 7 * GT_ME_DAY; weeks.push({ start: s, kw: gtMeIsoWeek(s + 3 * GT_ME_DAY), score: 0, party: 0 }); }
  mine.forEach((x) => {
    if (!x.ts || x.ts < w0) return;
    const i = Math.floor((gtMeWeekStart(x.ts) - w0) / (7 * GT_ME_DAY) + 0.01);
    if (i < 0 || i > 7) return;
    const G = GAMES[x.game];
    if (G && G.party) weeks[i].party++; else weeks[i].score++;
  });
  const weekTotal = weeks.reduce((a, w) => a + w.score + w.party, 0);

  return {
    empty: !matchesN, name: prof.name, matches: matchesN, decided, wins, rate: decided ? wins / decided : 0,
    weeks, weekTotal,
    nemesis: nemesis ? { name: nemesis.name, theyWon: nemesis.theyWon, iWon: nemesis.iWon, together: nemesis.together } : null,
    fav: fav ? { game: fav.game, matches: fav.matches, team: fav.team, wins: fav.wins, decided: fav.decided, rate: fav.decided ? fav.wins / fav.decided : 0 } : null,
    partner: partner ? { name: partner.name, matches: partner.matches, wins: partner.wins, games: Object.keys(partner.games) } : null,
    ask: ask ? { name: ask.name, n: ask.n } : null
  };
}

// Weiche Kurve (Catmull-Rom) ohne Ueberschwingen: Steuerpunkte bleiben zwischen den Nachbarpunkten.
function gtMeCtrl(P) {
  const C = [];
  const cl = (v, a, b) => Math.min(Math.max(v, Math.min(a, b)), Math.max(a, b));
  for (let i = 0; i < P.length - 1; i++) {
    const p0 = P[i - 1] || P[i], p1 = P[i], p2 = P[i + 1], p3 = P[i + 2] || p2;
    C.push([p1[0] + (p2[0] - p0[0]) / 6, cl(p1[1] + (p2[1] - p0[1]) / 6, p1[1], p2[1]), p2[0] - (p3[0] - p1[0]) / 6, cl(p2[1] - (p3[1] - p1[1]) / 6, p1[1], p2[1])]);
  }
  return C;
}
function gtMeCurve(P, C) {
  if (!P.length) return "";
  C = C || gtMeCtrl(P);
  let d = "M" + P[0][0].toFixed(1) + " " + P[0][1].toFixed(1);
  for (let i = 0; i < P.length - 1; i++) d += "C" + C[i].map((v) => v.toFixed(1)).join(" ") + " " + P[i + 1][0].toFixed(1) + " " + P[i + 1][1].toFixed(1);
  return d;
}
function gtMeRev(P, C) {
  const R = P.slice().reverse();
  let d = "";
  for (let k = 0; k < R.length - 1; k++) { const c = C[R.length - 2 - k]; d += "C" + c[2].toFixed(1) + " " + c[3].toFixed(1) + " " + c[0].toFixed(1) + " " + c[1].toFixed(1) + " " + R[k + 1][0].toFixed(1) + " " + R[k + 1][1].toFixed(1); }
  return "L" + R[0][0].toFixed(1) + " " + R[0][1].toFixed(1) + d;
}

// Geometrie der gestapelten Welle in einem W x H Feld
function gtMeWave(weeks, W, H) {
  const n = weeks.length, top = 10;
  const max = Math.max(4, ...weeks.map((w) => w.score + w.party));
  const X = weeks.map((_, i) => (n < 2 ? W / 2 : (i * W) / (n - 1)));
  const y = (v) => H - (v / max) * (H - top);
  const PB = weeks.map((w, i) => [X[i], y(w.score)]);
  const PT = weeks.map((w, i) => [X[i], y(w.score + w.party)]);
  const CB = gtMeCtrl(PB);
  const CT = gtMeCtrl(PT).map((c, i) => [c[0], Math.min(c[1], CB[i][1]), c[2], Math.min(c[3], CB[i][3])]);
  const lineB = gtMeCurve(PB, CB), lineT = gtMeCurve(PT, CT);
  const areaB = lineB + "L" + W + " " + H + "L0 " + H + "Z";
  const areaT = lineT + gtMeRev(PB, CB) + "Z";
  return { X, YB: PB.map((p) => p[1]), YT: PT.map((p) => p[1]), lineB, lineT, areaB, areaT };
}
/*GT_ME_END*/

export { gtMeModel, gtMeWave, gtMeCurve, gtMeSplit, gtMeIsoWeek };
