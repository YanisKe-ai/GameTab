// Lokales Profil («Ich bin»): nur auf diesem Geraet, Schluessel gt_profile (kommt dadurch in die Sicherung).
// Das Match-Log bleibt unveraendert, erkannt wird nur beim Anzeigen.
import { normalizeName } from "../stats/match-log.js";
import { gtIsDefName } from "./recent-names.js";
import { useEffect, useState } from "../prelude.js";

export const GT_PROFILE_KEY = "gt_profile";
const EVT = "gt-profile";

function clean(s) { return String(s == null ? "" : s).replace(/\s+/g, " ").trim().slice(0, 24); }

export function gtGetProfile() {
  try {
    const v = JSON.parse(localStorage.getItem(GT_PROFILE_KEY) || "null");
    if (!v || typeof v !== "object") return null;
    const name = clean(v.name);
    if (!name || gtIsDefName(name)) return null;
    const aliases = Array.isArray(v.aliases) ? v.aliases.map(clean).filter((a) => a && normalizeName(a) !== normalizeName(name)) : [];
    return { name, aliases, since: typeof v.since === "string" ? v.since : "" };
  } catch (e) { return null; }
}

// Gibt false zurueck, wenn der Name nicht erlaubt ist (leer oder Platzhalter wie «Spieler 1»).
export function gtSetProfile(name, aliases) {
  const n = clean(name);
  if (!n || gtIsDefName(n)) return false;
  const old = gtGetProfile();
  const seen = new Set([normalizeName(n)]);
  const al = [];
  (aliases || []).forEach((a) => { const c = clean(a); const k = normalizeName(c); if (c && !seen.has(k)) { seen.add(k); al.push(c); } });
  const since = old && old.since ? old.since : new Date().toISOString().slice(0, 10);
  try { localStorage.setItem(GT_PROFILE_KEY, JSON.stringify({ name: n, aliases: al, since })); } catch (e) { return false; }
  try { window.dispatchEvent(new Event(EVT)); } catch (e) {}
  return true;
}

export function gtClearProfile() {
  try { localStorage.removeItem(GT_PROFILE_KEY); } catch (e) {}
  try { window.dispatchEvent(new Event(EVT)); } catch (e) {}
}

// Liste der normalisierten Namen, die «ich» bin.
export function gtMeKeys(p) {
  const pr = p === undefined ? gtGetProfile() : p;
  if (!pr) return [];
  return [pr.name].concat(pr.aliases || []).map(normalizeName).filter(Boolean);
}

export function gtIsMe(name, p) {
  const k = normalizeName(name);
  return !!k && gtMeKeys(p).indexOf(k) >= 0;
}

export function gtOnProfile(fn) {
  try { window.addEventListener(EVT, fn); window.addEventListener("storage", fn); } catch (e) {}
  return () => { try { window.removeEventListener(EVT, fn); window.removeEventListener("storage", fn); } catch (e) {} };
}

// React-Hook: aktuelles Profil, rendert neu, wenn es sich aendert (auch in anderem Tab).
export function useGtProfile() {
  const [p, setP] = useState(() => gtGetProfile());
  useEffect(() => gtOnProfile(() => setP(gtGetProfile())), []);
  return p;
}
