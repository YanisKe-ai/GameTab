// Stadt Land Fluss: Kurzcode fuer die Auswahl vorgefertigter Kategorien (ohne Verbindung zwischen den Handys).
// Aufbau: Auswahl = Menge von 0 bis 10 Kategorie-IDs (Index in SLF_CATS, kleiner als SLF_N).
// Wert V = Anzahl aller kleineren Auswahlen (nach Groesse) + Rang der Auswahl (kombinatorisches Zahlensystem).
// V wird in Base32 (Crockford: ohne I, L, O, U) geschrieben, dahinter steht ein Pruefzeichen.
// Beim Eingeben gilt: O wird 0, I und L werden 1, U wird V. Leerzeichen, Striche und Kleinbuchstaben sind egal.
// SLF_N ist fest: Die Liste darf bis 128 Eintraege wachsen, ohne dass alte Codes ungueltig werden.
const SLF_N = 128;
const SLF_MAX_PICK = 10;
const ALPHA = "0123456789ABCDEFGHJKMNPQRSTVWXYZ";

let BIN = null;
function binom() {
  if (BIN) return BIN;
  const t = [];
  for (let n = 0; n <= SLF_N; n++) {
    t.push([]);
    for (let k = 0; k <= SLF_MAX_PICK; k++) {
      t[n][k] = k === 0 ? 1n : n === 0 ? 0n : t[n - 1][k] + (k > 0 ? t[n - 1][k - 1] : 0n);
    }
  }
  BIN = t;
  return t;
}
function offsets() {
  const b = binom();
  const off = [0n];
  for (let k = 0; k <= SLF_MAX_PICK; k++) off.push(off[k] + b[SLF_N][k]);
  return off;
}
function checkChar(body) {
  let s = 7;
  for (let i = 0; i < body.length; i++) s = (s * 3 + ALPHA.indexOf(body[i]) + 1) % 32;
  return ALPHA[s];
}

// ids: Array von Zahlen. Gibt den Code ohne Trennstriche zurueck oder null, wenn nicht kodierbar.
function slfEncode(ids) {
  try {
    const u = Array.from(new Set(ids)).filter((n) => Number.isInteger(n) && n >= 0 && n < SLF_N).sort((a, b) => a - b);
    if (u.length !== ids.length || u.length > SLF_MAX_PICK) return null;
    const b = binom();
    let rank = 0n;
    u.forEach((c, i) => { rank += b[c][i + 1]; });
    let v = offsets()[u.length] + rank;
    let body = "";
    if (v === 0n) body = "0";
    while (v > 0n) { body = ALPHA[Number(v % 32n)] + body; v /= 32n; }
    return body + checkChar(body);
  } catch (e) { return null; }
}

function slfNormalizeCode(raw) {
  return String(raw == null ? "" : raw).toUpperCase().replace(/[^0-9A-Z]/g, "").replace(/O/g, "0").replace(/[IL]/g, "1").replace(/U/g, "V");
}

// Gibt eine aufsteigende Liste von IDs zurueck oder null bei ungueltigem Code.
function slfDecode(raw) {
  try {
    const s = slfNormalizeCode(raw);
    if (s.length < 2 || s.length > 14) return null;
    const body = s.slice(0, -1);
    if ([...body].some((ch) => ALPHA.indexOf(ch) < 0)) return null;
    if (checkChar(body) !== s[s.length - 1]) return null;
    let v = 0n;
    for (const ch of body) v = v * 32n + BigInt(ALPHA.indexOf(ch));
    const off = offsets();
    let k = -1;
    for (let i = 0; i <= SLF_MAX_PICK; i++) if (v >= off[i] && v < off[i + 1]) { k = i; break; }
    if (k < 0) return null;
    let rank = v - off[k];
    const b = binom();
    const out = [];
    for (let i = k; i >= 1; i--) {
      let c = i - 1;
      while (c + 1 < SLF_N && b[c + 1][i] <= rank) c++;
      rank -= b[c][i];
      out.push(c);
    }
    out.reverse();
    return out;
  } catch (e) { return null; }
}

// Anzeige in Vierergruppen: "K7QM-2XPD-9".
function slfFormatCode(code) {
  return String(code || "").replace(/(.{4})(?=.)/g, "$1-");
}

const SLF_LINK_BASE = "https://yaniske-ai.github.io/GameTab/";
function cleanCustom(s) {
  return String(s == null ? "" : s).replace(/[\u0000-\u001f]/g, " ").replace(/\s+/g, " ").trim().slice(0, 32);
}
// Link mit Code und eigenen Kategorien.
function slfBuildLink(ids, custom, base) {
  const code = slfEncode(ids);
  const u = [];
  if (code) u.push("slf=" + code);
  (custom || []).map(cleanCustom).filter(Boolean).forEach((c) => u.push("slfc=" + encodeURIComponent(c)));
  return (base || SLF_LINK_BASE) + "?" + u.join("&");
}
// Liest "?slf=..&c=..&c=.." (aus Link oder Suchtext). Gibt {ids, custom} oder null.
function slfParseLink(input) {
  const str = String(input == null ? "" : input).trim();
  const q = str.indexOf("?") >= 0 ? str.slice(str.indexOf("?") + 1) : str.startsWith("slf=") ? str : null;
  if (q == null) return null;
  try {
    const p = new URLSearchParams(q.split("#")[0]);
    const code = p.get("slf");
    const custom = p.getAll("slfc").map(cleanCustom).filter(Boolean).slice(0, SLF_MAX_PICK);
    let ids = [];
    if (code) { ids = slfDecode(code); if (!ids) return null; }
    else if (!custom.length) return null;
    return { ids, custom };
  } catch (e) { return null; }
}
// Eingabefeld: Kurzcode ODER ganzer Link.
function slfParseInput(input) {
  const str = String(input == null ? "" : input).trim();
  if (!str) return null;
  if (/[?=]/.test(str)) return slfParseLink(str);
  const ids = slfDecode(str);
  return ids ? { ids, custom: [] } : null;
}

export { SLF_N, SLF_MAX_PICK, slfEncode, slfDecode, slfFormatCode, slfNormalizeCode, slfBuildLink, slfParseLink, slfParseInput, cleanCustom, SLF_LINK_BASE };
