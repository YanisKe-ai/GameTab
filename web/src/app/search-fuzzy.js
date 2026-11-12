// Paket PS: Suche mit Tippfehler-Toleranz (ohne Bibliothek) und Datenzeilen fuer "Weiterspielen".
// Reine Funktionen ohne React und ohne Importe, damit tests/logic/test_search_fuzzy.js sie direkt laden kann.

// Normalisierung fuer Anfrage UND Spieltexte: klein, ss statt Eszett, Akzente weg, Sonderzeichen zu Leerzeichen.
function gtSNorm(s) {
  return String(s == null ? "" : s).toLowerCase().replace(/ß/g, "ss").normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9 ]+/g, " ").replace(/\s+/g, " ").trim();
}

// Damerau-Levenshtein (optimal string alignment): Vertauschung zweier Zeichen zaehlt 1.
function gtSDist(a, b) {
  const la = a.length, lb = b.length;
  if (!la) return lb;
  if (!lb) return la;
  const d = [];
  for (let i = 0; i <= la; i++) { d[i] = [i]; }
  for (let j = 1; j <= lb; j++) d[0][j] = j;
  for (let i = 1; i <= la; i++) {
    for (let j = 1; j <= lb; j++) {
      let v = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
      if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) v = Math.min(v, d[i - 2][j - 2] + 1);
      d[i][j] = v;
    }
  }
  return d[la][lb];
}

// Erlaubte Abweichung: bis 5 Zeichen 1, darueber 2. Unter 3 Zeichen keine Toleranz.
function gtSTol(q) {
  return q.length < 3 ? 0 : q.length <= 5 ? 1 : 2;
}

// Nur echte Zweitnamen und offizielle Schreibweisen (in der Vorarbeit als "belegt" markiert). Sprachen gemischt, Suchbegriffe.
const GT_SEARCH_VARIANTS = {
  yatzy: ["Kniffel", "Yams"],
  jass: ["Differenzler"],
  schieber: ["Schieberjass"],
  minigolf: ["Golf miniature"],
  darts: ["Fléchettes", "Freccette", "Dardos"],
  headsup: ["Stirnraten"],
  romme: ["Rummy", "Rami", "Ramino"],
};

// Woerter eines Textes (normalisiert) plus die zusammengezogene Form ("flip 7" -> "flip7").
function gtSWords(text) {
  const n = gtSNorm(text);
  if (!n) return [];
  const ws = n.split(" ");
  if (ws.length > 1) ws.push(ws.join(""));
  return ws;
}

// Abstand einer Anfrage zu einem Wort: ganzes Wort (<= tol) oder gleich langer Wortanfang (nur Abstand <= 1).
// Wichtig: Der Anfangsvergleich liefert bei Abstand > 1 "kein Treffer" (99), sonst passt "wizzard" zu "tutto".
function gtSWordDist(q, w) {
  const tol = gtSTol(q);
  let best = 99;
  const d1 = gtSDist(q, w);
  if (d1 <= tol) best = d1;
  if (w.length > q.length) {
    const d2 = gtSDist(q, w.slice(0, q.length));
    if (d2 <= 1 && d2 < best) best = d2;
  }
  return best;
}

// Stufe eines Spiels fuer eine normalisierte Anfrage q (kleiner = besser, 99 = kein Treffer).
// 0 Wortanfang (Name, Zusatz, Tags, Kategorien) | 1 enthaelt (ab 3 Zeichen) | 2 Variante | 3+d Tippfehler an Name oder Variante.
// info: {head:"Alle Texte inkl. Tags", names:"Name und Zusatz", variants:["..."]}
function gtSStage(q, info) {
  if (q === "") return 0;
  const head = gtSNorm(info.head);
  if (head.startsWith(q) || head.split(" ").some(w => w.startsWith(q))) return 0;
  if (q.length >= 3 && head.includes(q)) return 1;
  if (q.length < 3) return 99;
  const vars = (info.variants || []).map(gtSNorm).filter(Boolean);
  const qn = q.replace(/ /g, "");
  if (vars.some(v => v === q || v.startsWith(q) || v.split(" ").some(w => w.startsWith(q)) || v.replace(/ /g, "").startsWith(qn))) return 2;
  let best = 99;
  const words = gtSWords(info.names).concat(...vars.map(gtSWords));
  for (const w of words) {
    const d = gtSWordDist(qn, w);
    if (d < best) best = d;
  }
  return best <= gtSTol(qn) ? 3 + best : 99;
}

// Suche ueber eine Spieleliste. items[i] = {game, head, names}. Rueckgabe {hits:[game], suggest:{game, label}|null}.
// Treffer sortiert nach Stufe, innerhalb einer Stufe bleibt die Reihenfolge der Liste.
function gtSearch(query, items) {
  const q = gtSNorm(query);
  if (q === "") return { hits: items.map(it => it.game), suggest: null };
  const scored = [];
  items.forEach((it, i) => {
    const st = gtSStage(q, { head: it.head, names: it.names, variants: GT_SEARCH_VARIANTS[it.game.view] });
    if (st < 99) scored.push([st, i, it.game]);
  });
  scored.sort((a, b) => a[0] - b[0] || a[1] - b[1]);
  const hits = scored.map(x => x[2]);
  let suggest = null;
  if (!hits.length && q.length >= 3) {
    const qn = q.replace(/ /g, "");
    const limit = gtSTol(qn) + 1;
    let bd = 99;
    items.forEach(it => {
      const words = gtSWords(it.names).concat(...(GT_SEARCH_VARIANTS[it.game.view] || []).map(gtSWords));
      let m = 99;
      words.forEach(w => { const d = gtSDist(qn, w); if (d < m) m = d; });
      if (m < bd) { bd = m; suggest = { game: it.game, label: it.label || "" }; }
    });
    if (bd > limit) suggest = null;
  }
  return { hits, suggest };
}

// ---------- Weiterspielen: sichere Daten fuer die zweite Zeile ----------
// Gibt {round:n|null, lead:Name|null} oder null. Nur Felder, die der Spielstand sicher hergibt. Gleichstand: keine Fuehrung.
function gtSNum(v) { return typeof v === "number" && isFinite(v); }
function gtSLeader(rows, lowWins) {
  // rows: [{name,total}] mit endlichen Summen. Eindeutiger Fuehrender, sonst null.
  if (!rows.length) return null;
  let best = null, tie = false;
  for (const r of rows) {
    if (!gtSNum(r.total) || typeof r.name !== "string" || !r.name.trim()) return null;
    if (best === null || (lowWins ? r.total < best.total : r.total > best.total)) { best = r; tie = false; }
    else if (r.total === best.total) tie = true;
  }
  return tie ? null : best.name.trim();
}
function gtSSum(a) {
  if (!Array.isArray(a)) return null;
  let s = 0;
  for (const e of a) { if (!gtSNum(e)) return null; s += e; }
  return s;
}
function gtResumeInfo(id, st) {
  try {
    if (!st || typeof st !== "object") return null;
    const g = st[id === "cricket-run" ? "cricket" : id];
    if (!g || typeof g !== "object") return null;
    if (id === "skyjo") {
      const ps = Array.isArray(g.players) ? g.players : [];
      if (!ps.length || ps.some(p => !Array.isArray(p.rounds))) return null;
      const n = Math.max(...ps.map(p => p.rounds.length));
      if (n < 1) return null;
      const rows = ps.map(p => ({ name: p.name, total: gtSSum(p.rounds.map(r => r && r.score)) }));
      return { round: n + 1, lead: gtSLeader(rows, true) };
    }
    if (id === "flip7") {
      const h = Array.isArray(g.history) ? g.history : [];
      const ps = Array.isArray(g.players) ? g.players : [];
      if (!h.length || !ps.length) return null;
      if (h.some(r => !r || typeof r.scores !== "object" || r.scores === null)) return { round: h.length + 1, lead: null };
      const rows = ps.map(p => ({ name: p.name, total: h.reduce((s, r) => s + (gtSNum(r.scores[p.id]) ? r.scores[p.id] : 0), 0) }));
      return { round: h.length + 1, lead: gtSLeader(rows, false) };
    }
    if (id === "phase10" || id === "romme") {
      const h = Array.isArray(g.history) ? g.history : [];
      return h.length ? { round: h.length + 1, lead: null } : null;
    }
    if (id === "tutto") {
      const ps = Array.isArray(g.players) ? g.players : [];
      if (!ps.some(p => Array.isArray(p.entries) && p.entries.length)) return null;
      const lead = gtSLeader(ps.map(p => ({ name: p.name, total: gtSSum(p.entries) })), false);
      return lead ? { round: null, lead } : null;
    }
    if (id === "schieber") {
      const ts = Array.isArray(g.teams) ? g.teams : [];
      if (!ts.some(p => Array.isArray(p.entries) && p.entries.length)) return null;
      const lead = gtSLeader(ts.map(p => ({ name: p.name, total: gtSSum(p.entries) })), false);
      return lead ? { round: null, lead } : null;
    }
    if (id === "freeplay") {
      if (g.mode !== "rounds") return null;
      const ps = Array.isArray(g.players) ? g.players : [];
      if (!ps.length || ps.some(p => !Array.isArray(p.entries))) return null;
      const n = Math.max(...ps.map(p => p.entries.length));
      if (n < 1) return null;
      return { round: n + 1, lead: gtSLeader(ps.map(p => ({ name: p.name, total: gtSSum(p.entries) })), !!g.lowWins) };
    }
    if (id === "hiscore" || id === "shanghai" || id === "splitscore") {
      const r = g.currentRound;
      if (!Number.isInteger(r) || r < 1) return null;
      if (id === "splitscore") return r > 1 ? { round: r, lead: null } : null;
      const ps = Array.isArray(g.players) ? g.players : [];
      const sc = g.scores && typeof g.scores === "object" ? g.scores : {};
      const rows = ps.map(p => ({ name: p.name, total: sc[p.id] == null ? 0 : sc[p.id] }));
      const any = rows.some(x => gtSNum(x.total) && x.total !== 0);
      return { round: r, lead: any ? gtSLeader(rows, false) : null };
    }
  } catch (e) { /* unsicher: keine Zeile */ }
  return null;
}

export { GT_SEARCH_VARIANTS, gtSNorm, gtSDist, gtSTol, gtSStage, gtSearch, gtResumeInfo };
