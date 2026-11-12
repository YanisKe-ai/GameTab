// Logiktest Paket PS: Tippfehler-Suche und Weiterspielen-Zeile (web/src/app/search-fuzzy.js, reine Funktionen).
// Aufruf: node tests/logic/test_search_fuzzy.js
const path = require("path"), { pathToFileURL } = require("url");
let fails = 0;
const ok = (c, m) => { if (!c) { fails++; console.log("FEHLER:", m); } };

const NAMES = [["tutto", "Tutto"], ["yatzy", "Yatzy"], ["wizard", "Wizard"], ["jass", "Coiffeur"], ["schieber", "Schieber Turnier Tournament"], ["skyjo", "Skyjo"], ["flip7", "Flip 7"], ["minigolf", "Minigolf"], ["darts", "Darts Standard 301 501 701"], ["cricket", "Cricket Cut Throat Masters"], ["shanghai", "Shanghai"], ["hiscore", "Hi Score"], ["splitscore", "Split Score"], ["freeplay", "Freies Spiel"], ["impostor", "Impostor"], ["werewolf", "Werwolf"], ["mafia", "Mafia"], ["tabu", "Tabu"], ["headsup", "Heads Up"], ["fivesec", "5 Sekunden"], ["mostlikely", "Am ehesten"], ["phase10", "Phase 10"], ["romme", "Rommé"], ["traitor", "Verräter"]];

(async () => {
  const m = await import(pathToFileURL(path.resolve(__dirname, "../../web/src/app/search-fuzzy.js")).href);
  const items = NAMES.map(([view, n]) => ({ game: { view }, names: n, head: n + " Schreibunterlagen", label: n.split(" ")[0] }));
  const s = q => m.gtSearch(q, items);
  const first = q => { const h = s(q).hits; return h.length ? h[0].view : null; };
  const has = (q, v) => s(q).hits.some(g => g.view === v);

  ok(m.gtSNorm("Größe Rommé-Ä") === "grosse romme a", "Normalisierung");
  ok(m.gtSDist("darst", "darts") === 1, "Vertauschung zaehlt 1");
  for (const [q, v] of [["skijo", "skyjo"], ["skyo", "skyjo"], ["wizzard", "wizard"], ["yatzi", "yatzy"], ["kniffel", "yatzy"], ["tuto", "tutto"], ["darst", "darts"], ["mafiaa", "mafia"], ["tabo", "tabu"], ["impostr", "impostor"], ["romee", "romme"], ["flip7", "flip7"], ["coifeur", "jass"], ["schiber", "schieber"], ["yams", "yatzy"], ["differenzler", "jass"], ["fleche", "darts"], ["stirnraten", "headsup"], ["rummy", "romme"]]) {
    ok(first(q) === v, `${q} -> ${v} (war ${first(q)})`);
  }
  ok(!has("wizzard", "tutto"), "wizzard darf Tutto nicht treffen");
  ok(first("wizzard") === "wizard" && s("wizzard").hits.length === 1, "wizzard nur Wizard");
  // Bestehende Treffer zuerst: Kategorie und Wortanfang unveraendert
  ok(s("schreib").hits.length === NAMES.length, "Kategorie findet alle");
  ok(first("ta") === "tabu", "kurze Anfrage nur Wortanfang");
  ok(s("zz").hits.length === 0 && s("zz").suggest === null, "2 Zeichen: keine Tippfehler, kein Vorschlag");
  ok(s("").hits.length === NAMES.length, "leer: alle");
  // Wortanfang vor Tippfehler
  const r = s("sky").hits.map(g => g.view); ok(r[0] === "skyjo", "sky -> Skyjo zuerst");
  // Meintest du
  ok(s("skijoo").hits.length === 1 || s("skijoo").suggest === null, "skijoo findet Skyjo direkt");
  const z = s("xqzvbn"); ok(z.hits.length === 0 && z.suggest === null, "Unsinn: kein Vorschlag");
  const z2 = m.gtSearch("skyjxxx", items); ok(z2.hits.length === 0 && z2.suggest && z2.suggest.game.view === "skyjo", "Vorschlag Skyjo bei 2 Fehlern am Ende");
  // Variantentabelle nur belegt
  ok(!("freeplay" in m.GT_SEARCH_VARIANTS) && !("werewolf" in m.GT_SEARCH_VARIANTS) && !("mafia" in m.GT_SEARCH_VARIANTS), "keine ungeprueften Varianten");

  // Weiterspielen
  const R = m.gtResumeInfo;
  const sk = { skyjo: { phase: "play", players: [{ id: 1, name: "Anna", total: 0, rounds: [{ score: 10 }, { score: 5 }] }, { id: 2, name: "Ben", total: 0, rounds: [{ score: 20 }, { score: 9 }] }] } };
  let x = R("skyjo", sk); ok(x && x.round === 3 && x.lead === "Anna", "Skyjo Runde 3, Anna fuehrt (niedrigster)");
  sk.skyjo.players[1].rounds = [{ score: 8 }, { score: 7 }]; x = R("skyjo", sk); ok(x && x.round === 3 && x.lead === null, "Skyjo Gleichstand: keine Fuehrung");
  ok(R("skyjo", { skyjo: { players: [{ name: "A", rounds: [] }] } }) === null, "Skyjo ohne Runde: null");
  const f7 = { flip7: { players: [{ id: 1, name: "A" }, { id: 2, name: "B" }], history: [{ scores: { 1: 30, 2: 10 } }] } };
  x = R("flip7", f7); ok(x && x.round === 2 && x.lead === "A", "Flip7");
  ok(R("phase10", { phase10: { history: [{}, {}] } }).round === 3 && R("phase10", { phase10: { history: [{}] } }).lead === null, "Phase 10 nur Runde");
  x = R("tutto", { tutto: { players: [{ name: "A", entries: [100] }, { name: "B", entries: [] }] } }); ok(x && x.lead === "A" && x.round === null, "Tutto nur Fuehrender");
  ok(R("tutto", { tutto: { players: [{ name: "A", entries: [] }] } }) === null, "Tutto ohne Eintrag: null");
  ok(R("tutto", { tutto: { players: [{ name: "A", entries: ["x"] }] } }) === null, "kaputte Werte: null");
  x = R("hiscore", { hiscore: { currentRound: 4, players: [{ id: 1, name: "A" }, { id: 2, name: "B" }], scores: { 1: 5, 2: 9 } } }); ok(x.round === 4 && x.lead === "B", "Hi Score");
  x = R("shanghai", { shanghai: { currentRound: 1, players: [{ id: 1, name: "A" }], scores: {} } }); ok(x.round === 1 && x.lead === null, "Shanghai ohne Punkte");
  ok(R("freeplay", { freeplay: { mode: "count", players: [{ name: "A", entries: [1] }] } }) === null, "Freies Spiel Zaehlen: null");
  ok(R("mafia", { mafia: {} }) === null && R("wizard", {}) === null && R("skyjo", null) === null, "unsichere Spiele: null");

  console.log(fails ? `${fails} Fehler` : "OK: Suche und Weiterspielen");
  process.exit(fails ? 1 : 0);
})();
