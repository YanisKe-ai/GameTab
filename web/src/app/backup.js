// Sicherung und Wiederherstellen (Einstellungen). Reine Funktionen ohne Oberflaeche, geprueft in tests/backup_restore.py.
// Ablauf Wiederherstellen: gtBkInspect (Datei lesen, validieren, Version erkennen, nichts aendern) -> Vorschau und Bestaetigung
// in backup-dialog.js -> gtBkApply (schreiben, bei Fehler alles zurueck). Ohne Bestaetigung wird nie etwas ueberschrieben.
import { gtIsObj } from "./storage.js";
import { MATCH_LOG_KEY } from "../stats/match-log.js";
import { GT_ST, GT_ST_STORE } from "../games/schieber/tournament-core.js";
import { APP_BUILD } from "./build.js";

const GT_BK_TYPE = "gametab-backup";
const GT_BK_VERSION = 2; /* Format-Version. Dateien mit 1, 2 oder ohne Angabe (aelteste) werden gelesen, hoehere abgewiesen. */
const GT_BK_KEY_RE = /^(gt_|gametab-|spieleblock-)/;
const GT_BK_STATE_KEY = "spieleblock-app-state-v1";
const GT_BK_MAX_BYTES = 40 * 1024 * 1024;

function gtBkPad(n) { return String(n).padStart(2, "0"); }

/* gametab-backup-v2-2026-11-06-2035.json: Format-Version, lokales Datum und Uhrzeit */
function gtBkFileName(d) {
  const x = d || new Date();
  return "gametab-backup-v" + GT_BK_VERSION + "-" + x.getFullYear() + "-" + gtBkPad(x.getMonth() + 1) + "-" + gtBkPad(x.getDate()) + "-" + gtBkPad(x.getHours()) + gtBkPad(x.getMinutes()) + ".json";
}

function gtBkParse(raw, fb) { try { return raw ? JSON.parse(raw) : fb; } catch (_) { return fb; } }

/* Baut die Sicherung aus dem aktuellen Speicher. Wirft bei Fehlern. Gibt {text, fileName} zurueck. */
function gtBkBuild(now) {
  const d = now || new Date();
  const storage = {};
  for (let i = 0; i < localStorage.length; i++) {
    const k = localStorage.key(i);
    if (k && GT_BK_KEY_RE.test(k)) storage[k] = localStorage.getItem(k);
  }
  const payload = {
    type: GT_BK_TYPE, version: GT_BK_VERSION, appBuild: APP_BUILD, exportedAt: d.toISOString(),
    schieberTournaments:(()=>{ try { return GT_ST_STORE.forSave().schieberTournaments; } catch (_e) { return []; } })(),
    matchLog: gtBkParse(localStorage.getItem(MATCH_LOG_KEY), []),
    groups: gtBkParse(localStorage.getItem("gt_playerGroups"), []),
    storage,
  };
  const text = JSON.stringify(payload, null, 2);
  if (!text || text.length < 20) throw new Error("empty");
  return { text, fileName: gtBkFileName(d) };
}

function gtBkDownload(text, fileName) {
  const blob = new Blob([text], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = fileName;
  document.body.appendChild(a); a.click(); document.body.removeChild(a);
  setTimeout(() => { try { URL.revokeObjectURL(url); } catch (_) {} }, 60000);
}

/* Prueft eine Sicherungsdatei, ohne etwas zu aendern.
   Erfolg: {ok:true, version, exportedAt, appBuild, counts:{matches, groups, tournaments, keys}, entries:[[key, wert]]}
   Fehler: {ok:false, reason:"empty"|"big"|"notjson"|"notbackup"|"newer"|"damaged", version?} */
function gtBkInspect(text) {
  if (typeof text !== "string" || !text.trim()) return { ok: false, reason: "empty" };
  if (text.length > GT_BK_MAX_BYTES) return { ok: false, reason: "big" };
  let data;
  try { data = JSON.parse(text); } catch (_) { return { ok: false, reason: "notjson" }; }
  if (!gtIsObj(data)) return { ok: false, reason: "notbackup" };
  if (data.type !== undefined && data.type !== GT_BK_TYPE) return { ok: false, reason: "notbackup" };
  const hasShape = Array.isArray(data.matchLog) || Array.isArray(data.groups) || gtIsObj(data.storage);
  if (!hasShape) return { ok: false, reason: "notbackup" };
  const version = typeof data.version === "number" && isFinite(data.version) ? data.version : (data.version === undefined ? 1 : NaN);
  if (!(version >= 1)) return { ok: false, reason: "damaged" };
  if (version > GT_BK_VERSION) return { ok: false, reason: "newer", version };
  try {
    if (!Array.isArray(data.matchLog) || !Array.isArray(data.groups)) throw new Error("invalid");
    let stSt = null;
    if (data.storage !== undefined && !gtIsObj(data.storage)) throw new Error("invalid");
    if (gtIsObj(data.storage)) {
      Object.keys(data.storage).forEach((k) => { if (GT_BK_KEY_RE.test(k) && typeof data.storage[k] !== "string") throw new Error("invalid"); });
      if (typeof data.storage[GT_BK_STATE_KEY] === "string") {
        stSt = JSON.parse(data.storage[GT_BK_STATE_KEY]);
        if (!gtIsObj(stSt)) throw new Error("invalid");
      }
    }
    if (data.schieberTournaments !== undefined && data.schieberTournaments !== null && !Array.isArray(data.schieberTournaments)) throw new Error("invalid-st");
    if (Array.isArray(data.schieberTournaments) && !GT_ST.validateImport(data.schieberTournaments).ok) throw new Error("invalid-st");
    if (stSt && stSt.schieberTournaments !== undefined && stSt.schieberTournaments !== null && (!Array.isArray(stSt.schieberTournaments) || !GT_ST.validateImport(stSt.schieberTournaments).ok)) throw new Error("invalid-st");
    const storage = Object.assign({}, gtIsObj(data.storage) ? data.storage : {});
    if (Array.isArray(data.schieberTournaments) && data.schieberTournaments.length && !(stSt && Array.isArray(stSt.schieberTournaments) && stSt.schieberTournaments.length)) {
      stSt = Object.assign({}, stSt || {}, { schieberTournaments: data.schieberTournaments });
      storage[GT_BK_STATE_KEY] = JSON.stringify(stSt);
    }
    const entries = [];
    Object.keys(storage).forEach((k) => { const v = storage[k]; if (GT_BK_KEY_RE.test(k) && typeof v === "string") entries.push([k, v]); });
    entries.push([MATCH_LOG_KEY, JSON.stringify(data.matchLog)]);
    entries.push(["gt_playerGroups", JSON.stringify(data.groups)]);
    const tn = stSt && Array.isArray(stSt.schieberTournaments) ? stSt.schieberTournaments.length : 0;
    return {
      ok: true, version,
      exportedAt: typeof data.exportedAt === "string" ? data.exportedAt : "",
      appBuild: typeof data.appBuild === "string" ? data.appBuild : "",
      counts: { matches: data.matchLog.length, groups: data.groups.length, tournaments: tn, keys: entries.length },
      entries,
    };
  } catch (_) { return { ok: false, reason: "damaged", version }; }
}

/* Was gerade auf diesem Geraet liegt (fuer die Vorschau: was wird ersetzt). */
function gtBkCurrent() {
  let tn = 0;
  try { const s = gtBkParse(localStorage.getItem(GT_BK_STATE_KEY), null); if (gtIsObj(s) && Array.isArray(s.schieberTournaments)) tn = s.schieberTournaments.length; } catch (_) {}
  const ml = gtBkParse(localStorage.getItem(MATCH_LOG_KEY), []);
  const gr = gtBkParse(localStorage.getItem("gt_playerGroups"), []);
  return { matches: Array.isArray(ml) ? ml.length : 0, groups: Array.isArray(gr) ? gr.length : 0, tournaments: tn };
}

/* Schreibt die geprueften Eintraege. Bei einem Fehler wird der alte Stand voll zurueckgeschrieben.
   Rueckgabe {ok:true} oder {ok:false, quota:boolean}. Die Seite muss danach neu laden (ok). */
function gtBkApply(entries, isQuota) {
  window.__gtImporting = true;
  const prev = {};
  entries.forEach((en) => { if (!(en[0] in prev)) prev[en[0]] = localStorage.getItem(en[0]); });
  try {
    entries.forEach((en) => localStorage.setItem(en[0], en[1]));
    return { ok: true };
  } catch (err) {
    Object.keys(prev).forEach((k) => { try { if (prev[k] === null) localStorage.removeItem(k); else localStorage.setItem(k, prev[k]); } catch (_r) {} });
    window.__gtImporting = false;
    return { ok: false, quota: !!(isQuota && isQuota(err)) };
  }
}

export { GT_BK_TYPE, GT_BK_VERSION, gtBkFileName, gtBkBuild, gtBkDownload, gtBkInspect, gtBkCurrent, gtBkApply };
