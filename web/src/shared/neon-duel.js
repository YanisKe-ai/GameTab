// Siegesschild: Duell-Bilanz im Stil P5 (zwei Namen, Neon-Blitz dazwischen).
// Nur mit Profil («Ich bin»), nur wenn ich mitgespielt habe und wir dieses Spiel mindestens 2-mal zusammen gespielt haben.
// Verloren: ich gegen den Sieger. Gewonnen: ich gegen den Zweiten.
import { React } from "../vendor/react-globals.js";
import { useMemo } from "../prelude.js";
import { GT_STATS } from "../stats/core.js";
import { loadMatchLog } from "../stats/match-log.js";
import { gtGetProfile, gtMeKeys } from "./profile.js";

/*GT_DUEL_BEGIN*/
// ms: vorbereitete Partien (GT_STATS.filter); me: Set eigener Schluessel; opp: Schluessel des Gegners
function gtDuelCount(ms, me, opp) {
  let together = 0, mine = 0, theirs = 0, first = null;
  ms.forEach((m) => {
    const a = m.ind.find((p) => me.has(p.key));
    const b = m.ind.find((p) => p.key === opp);
    if (!a || !b || a.key === opp) return;
    together++;
    if (m.ts && (first === null || m.ts < first)) first = m.ts;
    if (!m.decided) return;
    const wa = m.win.has(a.key), wb = m.win.has(opp);
    if (wa && !wb) mine++;
    else if (wb && !wa) theirs++;
  });
  return { together, mine, theirs, first };
}
// ranked: [{name}], ranks: Plaetze; gibt {meIdx, oppIdx} oder null
function gtDuelPick(ranked, ranks, isMe) {
  const meIdx = ranked.findIndex((e) => e && isMe(e.name));
  if (meIdx < 0) return null;
  let oppIdx = -1;
  if (ranks[meIdx] === 1) {
    oppIdx = ranked.findIndex((e, i) => i !== meIdx && ranks[i] === 1);
    if (oppIdx < 0) oppIdx = ranked.findIndex((e, i) => i !== meIdx && ranks[i] === 2);
    if (oppIdx < 0) oppIdx = ranked.findIndex((e, i) => i !== meIdx);
  } else oppIdx = ranked.findIndex((e, i) => i !== meIdx && ranks[i] === 1);
  return oppIdx < 0 ? null : { meIdx, oppIdx };
}
/*GT_DUEL_END*/

const LOC = { de: "de-CH", en: "en-GB", fr: "fr-CH", it: "it-CH", es: "es-ES", pt: "pt-PT" };
const CY = "#7FE7FF";
const DUEL_CSS = `
@keyframes gtdIn{from{opacity:0;filter:blur(6px);transform:translateY(10px)}to{opacity:1;filter:none;transform:none}}
@keyframes gtdZap{0%,100%{opacity:1}40%{opacity:.3}45%{opacity:1}52%{opacity:.45}58%{opacity:1}}
.gtd{animation:gtdIn .8s cubic-bezier(.23,1,.32,1) var(--d,0s) both}
.gtd-zap{animation:gtdZap 2.4s ease-in-out calc(var(--d,0s) + .6s) 3}
@media (prefers-reduced-motion: reduce){.gtd,.gtd-zap{animation:none}}
`;

function glow(c) { return { color: "#FFF8FB", textShadow: `0 0 4px ${c},0 0 14px ${c}cc,0 0 28px ${c}66` }; }

export function GtNeonDuel({ ranked, ranks, gameId, t, run, col, lang, theme }) {
  const noir = theme === "noir";
  const mc = noir ? "#FFFFFF" : CY;
  const data = useMemo(() => {
    try {
      const prof = gtGetProfile();
      if (!prof || !Array.isArray(ranked) || !ranked.length) return null;
      const keys = new Set(gtMeKeys(prof));
      const N = GT_STATS.norm;
      const pick = gtDuelPick(ranked, ranks || [], (n) => keys.has(N(n)));
      if (!pick) return null;
      const opp = ranked[pick.oppIdx];
      const ms = GT_STATS.filter(loadMatchLog(), { game: gameId });
      const c = gtDuelCount(ms, keys, N(opp.name));
      if (c.together < 2) return null;
      return { me: ranked[pick.meIdx].name, opp: opp.name, ...c };
    } catch (e) { return null; }
  }, [ranked, ranks, gameId]);
  if (!data) return null;
  const tx = (k, o) => String(t(k) || "").replace(/\{(\w+)\}/g, (m, x) => (o && o[x] != null ? o[x] : ""));
  let since = "";
  try { since = data.first ? new Date(data.first).toLocaleDateString(LOC[lang || (typeof document !== "undefined" && document.documentElement.lang)] || "de-CH", { day: "numeric", month: "long" }) : ""; } catch (e) { since = ""; }
  const lead = data.mine === data.theirs ? tx("duelTie") : tx("duelLeads", { name: data.mine > data.theirs ? data.me : data.opp });
  const line = [since ? tx("duelSince", { d: since }) : "", tx("duelGames", { n: data.together }), lead].filter(Boolean).join(" · ");
  const oc = noir ? "#BDBDBD" : (col || "#FF9DB5");
  const d = run ? "5.6s" : "0s";
  const nm = { font: "400 23px/1.1 'Tilt Neon','Inter',sans-serif", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: "100%" };
  const num = { font: "400 38px/1 'Tilt Neon','Inter',sans-serif", fontVariantNumeric: "tabular-nums", marginTop: 4 };
  return <div className="gtd" role="group" aria-label={tx("duelAria", { a: data.me, b: data.opp, x: data.mine, y: data.theirs })} data-gt-duel="" style={{ "--d": d, flexShrink: 0, marginTop: 14, width: "100%", maxWidth: 340, boxSizing: "border-box", padding: "10px 12px 10px", borderRadius: 18, background: "rgba(255,255,255,.035)", border: `1px solid ${oc}55`, boxShadow: `0 0 22px ${oc}22`, textAlign: "center", pointerEvents: "auto" }}>
    <style>{DUEL_CSS}</style>
    <div aria-hidden="true" style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) auto minmax(0,1fr)", alignItems: "center", gap: 6 }}>
      <div style={{ minWidth: 0 }}><div dir="auto" style={{ ...nm, ...glow(mc) }}>{data.me}</div><div style={{ ...num, ...glow(mc) }}>{data.mine}</div></div>
      <svg className="gtd-zap" width="30" height="54" viewBox="0 0 40 70" style={{ "--d": d, filter: noir ? "drop-shadow(0 0 8px #FFFFFF)" : "drop-shadow(0 0 8px #FFE7A0)" }}><path d="M24 2 6 40h12l-4 28 20-40H22z" fill="none" stroke={noir ? "#FFFFFF" : "#FFF1C4"} strokeWidth="2.6" strokeLinejoin="round" /></svg>
      <div style={{ minWidth: 0 }}><div dir="auto" style={{ ...nm, ...glow(oc) }}>{data.opp}</div><div style={{ ...num, ...glow(oc) }}>{data.theirs}</div></div>
    </div>
    <div style={{ marginTop: 8, font: "400 13px/1.35 'Inter',sans-serif", color: "#C9C1D0" }}>{line}</div>
  </div>;
}

export { gtDuelCount, gtDuelPick };
