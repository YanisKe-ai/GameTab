// Stadt Land Fluss: reine Logik ohne React (Buchstabenerkennung, Zustand pruefen, Summen). Von Node aus testbar.
import { SLF_CATS } from "../../content/slf-categories.js";
import { cleanCustom, SLF_MAX_PICK } from "./code.js";

const SLF_MIN_CATS = 5;
const SLF_MAX_CATS = 10;
const SLF_TIMERS = [0, 60, 90, 120];
const SLF_POINTS = [20, 10, 5, 0];
const LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

const DEFAULT_SLF = {
  phase: "setup", // setup | play | done
  cats: [0, 1, 2, 3, 4, 5], // vorgefertigte Kategorien (IDs, aufsteigend)
  custom: [], // eigene Kategorien (Text)
  timer: 0, // 0 = aus, sonst Sekunden pro Runde
  grp: 0, // gewaehlte Gruppe in der Einrichtung
  joined: false, // Kategorien kamen per Code oder Link
  stage: "write", // ready | write | stopped | score
  answers: [],
  pts: [], // null = noch offen
  manual: "", // von Hand gewaehlter Buchstabe
  lead: "", // Anfangsbuchstabe der zuerst getippten Antwort
  endsAt: 0, // Ende der Zeit (ms) oder 0
  stopWhy: "", // stop | time
  rounds: [], // [{letter, ans:[], pts:[], sum}]
  result: null, // {me, others:[{name, pts}]} nach "Spiel beenden"
};

// Anfangsbuchstabe: Akzente weg (Ä wird A), erster Buchstabe a bis z.
function firstLetter(s) {
  let x = String(s == null ? "" : s);
  try { x = x.normalize("NFD").replace(/[̀-ͯ]/g, ""); } catch (e) { /* alte Browser */ }
  const m = x.match(/[A-Za-z]/);
  return m ? m[0].toUpperCase() : "";
}

// Mehrheit der Anfangsbuchstaben. Bei Gleichstand gilt der Buchstabe der zuerst getippten Antwort, sonst der erste im Alphabet.
function detectLetter(answers, lead) {
  const c = {};
  (answers || []).forEach((a) => { const l = firstLetter(a); if (l) c[l] = (c[l] || 0) + 1; });
  const keys = Object.keys(c);
  if (!keys.length) return "";
  const mx = Math.max(...keys.map((k) => c[k]));
  const top = keys.filter((k) => c[k] === mx).sort();
  if (lead && top.includes(lead)) return lead;
  return top[0];
}

function isOff(ans, letter) {
  const l = firstLetter(ans);
  return !!(letter && l && l !== letter);
}

function roundSum(pts) { return (pts || []).reduce((s, v) => s + (typeof v === "number" ? v : 0), 0); }
function totalOf(rounds) { return (rounds || []).reduce((s, r) => s + roundSum(r.pts), 0); }

const isObj = (v) => v !== null && typeof v === "object" && !Array.isArray(v);
const okPt = (v) => v === 0 || v === 5 || v === 10 || v === 20;

// Prueft einen gespeicherten oder uebergebenen Zustand und macht ihn benutzbar.
function slfNormalize(raw) {
  const d = DEFAULT_SLF;
  const s = { ...d, ...(isObj(raw) ? raw : {}) };
  const cats = Array.from(new Set((Array.isArray(s.cats) ? s.cats : []).filter((n) => Number.isInteger(n) && n >= 0 && n < SLF_CATS.length))).sort((a, b) => a - b).slice(0, SLF_MAX_CATS);
  const custom = (Array.isArray(s.custom) ? s.custom : []).map(cleanCustom).filter(Boolean).slice(0, Math.max(0, SLF_MAX_CATS - cats.length));
  const n = cats.length + custom.length;
  s.cats = cats; s.custom = custom;
  s.phase = ["setup", "play", "done"].includes(s.phase) ? s.phase : "setup";
  s.stage = ["ready", "write", "stopped", "score"].includes(s.stage) ? s.stage : "write";
  s.timer = SLF_TIMERS.includes(s.timer) ? s.timer : 0;
  s.grp = Number.isInteger(s.grp) && s.grp >= 0 && s.grp < 9 ? s.grp : 0;
  s.joined = !!s.joined;
  s.manual = typeof s.manual === "string" && /^[A-Z]$/.test(s.manual) ? s.manual : "";
  s.lead = typeof s.lead === "string" && /^[A-Z]$/.test(s.lead) ? s.lead : "";
  s.stopWhy = s.stopWhy === "time" ? "time" : s.stopWhy === "stop" ? "stop" : "";
  s.endsAt = typeof s.endsAt === "number" && isFinite(s.endsAt) ? s.endsAt : 0;
  const fit = (a, mk) => Array.from({ length: n }, (_, i) => mk(Array.isArray(a) ? a[i] : undefined));
  s.answers = fit(s.answers, (v) => (typeof v === "string" ? v.slice(0, 60) : ""));
  s.pts = fit(s.pts, (v) => (okPt(v) ? v : null));
  s.rounds = (Array.isArray(s.rounds) ? s.rounds : []).filter((r) => isObj(r) && /^[A-Z]$/.test(r.letter)).slice(0, 60).map((r) => {
    const ans = fit(r.ans, (v) => (typeof v === "string" ? v.slice(0, 60) : ""));
    const pts = fit(r.pts, (v) => (okPt(v) ? v : 0));
    return { letter: r.letter, ans, pts, sum: roundSum(pts) };
  });
  const r = s.result;
  s.result = isObj(r) && typeof r.me === "string" && Array.isArray(r.others)
    ? { me: r.me.slice(0, 24), others: r.others.filter((o) => isObj(o) && typeof o.name === "string" && o.name.trim() && Number.isFinite(o.pts)).slice(0, 20).map((o) => ({ name: o.name.trim().slice(0, 24), pts: Math.max(0, Math.min(99999, Math.round(o.pts))) })) }
    : null;
  if (s.phase === "play" && (n < SLF_MIN_CATS || n > SLF_MAX_CATS)) s.phase = "setup";
  if (s.phase === "done" && !s.result) s.phase = "setup";
  return s;
}

// Neue leere Runde (Antworten, Punkte, Buchstabe, Zeit).
function freshRound(s) {
  const n = s.cats.length + s.custom.length;
  return { ...s, stage: s.timer ? "ready" : "write", answers: Array(n).fill(""), pts: Array(n).fill(null), manual: "", lead: "", endsAt: 0, stopWhy: "" };
}

// Zustand fuer ein neues Spiel mit denselben Kategorien und derselben Zeit.
function freshGame(s) {
  return freshRound({ ...DEFAULT_SLF, cats: s.cats, custom: s.custom, timer: s.timer, grp: s.grp, phase: "play", rounds: [], result: null });
}

export { SLF_MIN_CATS, SLF_MAX_CATS, SLF_TIMERS, SLF_POINTS, LETTERS, DEFAULT_SLF, firstLetter, detectLetter, isOff, roundSum, totalOf, slfNormalize, freshRound, freshGame, SLF_MAX_PICK };
