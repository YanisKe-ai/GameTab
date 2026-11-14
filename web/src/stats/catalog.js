// Statistik › «Alle Partien»: Katalog mit Datum, einzeln oder mehrere löschen (mit Rückgängig).
import { React } from "../vendor/react-globals.js";
import { useMemo, useState } from "../prelude.js";
import { deleteMatchUndo, restoreMatch, statsGameLabel } from "./match-log.js";
import { gtIsDefName } from "../shared/recent-names.js";
import { gtToast } from "../shared/toast.js";
import { gtAnnounce } from "../shared/gt-live.js";
import { GtConfirm } from "../shared/confirm.js";
import { GameIcon } from "../assets/icons.js";

const FF = "'Inter', sans-serif";
const LOC = { de: "de-CH", en: "en-GB", fr: "fr-CH", it: "it-CH", es: "es-ES", pt: "pt-PT" };
function fmt(s, o) { return String(s || "").replace(/\{(\w+)\}/g, (m, k) => (o && o[k] != null ? o[k] : "")); }

function gtCatJoin(a, t) { const and = t("st2And"); return a.length < 2 ? a.join("") : a.slice(0, -1).join(", ") + " " + and + " " + a[a.length - 1]; }

function GtMatchCatalog({ matches, t, tk, lk, theme, lang, onChanged, Mark }) {
  const loc = LOC[lang] || "de-CH";
  const L = theme === "light", N = theme === "noir";
  const list = useMemo(() => (matches || []).filter((m) => m && m.status !== "open" && m.id != null).slice().sort((a, b) => (b.ts || 0) - (a.ts || 0)), [matches]);
  const noName = (m) => (m.participants || []).every((p) => !p || gtIsDefName(p.name));
  const [load, setLoad] = useState(40);
  const [sel, setSel] = useState(null);
  const [ask, setAsk] = useState(false);
  const day = (ts) => { try { return new Date(ts).toLocaleDateString(loc, { weekday: "long", day: "numeric", month: "long", year: "numeric" }); } catch (e) { return ""; } };
  const shortDay = (ts) => { try { return new Date(ts).toLocaleDateString(loc, { day: "numeric", month: "numeric" }); } catch (e) { return "-"; } };
  const time = (ts) => { try { return new Date(ts).toLocaleTimeString(loc, { hour: "2-digit", minute: "2-digit" }); } catch (e) { return ""; } };
  const shown = list.slice(0, load);
  const groups = [];
  shown.forEach((m) => { const d = day(m.ts); const g = groups[groups.length - 1]; if (g && g.d === d) g.items.push(m); else groups.push({ d, items: [m] }); });
  const noNames = list.filter(noName);

  const delOne = (m) => {
    const u = deleteMatchUndo(m.id);
    onChanged();
    if (!u) return;
    gtToast(t("gtToastMatchDeleted")(shortDay(m.ts)), { undoLabel: t("gtUndo"), undo: () => { restoreMatch(u); onChanged(); } });
  };
  const delMany = () => {
    const ids = Array.from(sel || []);
    const us = [];
    ids.forEach((id) => { const u = deleteMatchUndo(id); if (u) us.push(u); });
    setAsk(false); setSel(null); onChanged();
    if (!us.length) return;
    const msg = fmt(t("catDeletedN"), { n: us.length });
    try { gtAnnounce(msg, "polite"); } catch (e) {}
    gtToast(msg, { undoLabel: t("gtUndo"), undo: () => { us.slice().reverse().forEach((u) => restoreMatch(u)); onChanged(); } });
  };
  const toggle = (id) => setSel((s) => { const n = new Set(s || []); if (n.has(id)) n.delete(id); else n.add(id); return n; });
  const pill = (on) => ({ minHeight: 44, padding: "0 14px", borderRadius: 12, border: N || L ? `1px solid ${tk.border}` : 0, background: on ? tk.gold : tk.card, color: on ? (L ? "#FFFFFF" : N ? "#000000" : "#1A1408") : tk.ink, font: `600 14px ${FF}`, cursor: "pointer" });

  if (!list.length) return <p style={{ margin: "16px 4px", color: tk.muted, fontFamily: FF, fontSize: ".875rem" }}>{t("catEmpty")}</p>;
  const selN = sel ? sel.size : 0;
  return <div>
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, flexWrap: "wrap", margin: "4px 2px 12px" }}>
      <span style={{ fontSize: ".875rem", color: tk.muted, fontFamily: FF }}>{fmt(t("catCount"), { n: list.length })}</span>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        {sel && noNames.length > 0 && <button type="button" className="gtSt2-btn" style={pill(false)} onClick={() => setSel(new Set(noNames.map((m) => String(m.id))))}>{fmt(t("catPickNoNames"), { n: noNames.length })}</button>}
        <button type="button" className="gtSt2-btn" aria-pressed={!!sel} style={pill(!!sel)} onClick={() => setSel(sel ? null : new Set())}>{sel ? t("catDone") : t("catSelect")}</button>
      </div>
    </div>
    {groups.map((g) => <section key={g.d} aria-label={g.d} style={{ marginBottom: 14 }}>
      <h2 style={{ margin: "0 4px 6px", fontSize: ".8125rem", fontWeight: 600, color: tk.muted, fontFamily: FF }}>{g.d}</h2>
      <ul style={{ listStyle: "none", margin: 0, padding: 0, background: tk.card, border: `1px solid ${tk.border}`, borderRadius: 18, overflow: "hidden" }}>
        {g.items.map((m, i) => {
          const id = String(m.id);
          const game = statsGameLabel(m.game, t);
          const names = (m.participants || []).map((p) => p && p.name).filter(Boolean);
          const win = Array.isArray(m.winners) && m.winners.length ? gtCatJoin(m.winners, t) : m.winner || "";
          const on = !!(sel && sel.has(id));
          const nn = noName(m);
          const body = <React.Fragment>
            <span aria-hidden="true" style={{ flex: "none", display: "flex" }}>{Mark ? <Mark game={m.game} theme={theme} size={30} /> : null}</span>
            <span style={{ flex: 1, minWidth: 0, textAlign: "left" }}>
              <span style={{ display: "flex", alignItems: "baseline", gap: 8, minWidth: 0 }}>
                <b style={{ fontSize: ".9375rem", color: tk.ink, fontFamily: FF, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{game}</b>
                <span style={{ fontSize: ".75rem", color: tk.muted, fontFamily: FF, flex: "none" }}>{time(m.ts)}</span>
                {nn && <span style={{ flex: "none", fontSize: ".6875rem", fontWeight: 700, color: tk.muted, border: `1px solid ${tk.border}`, borderRadius: 99, padding: "1px 7px", fontFamily: FF }}>{t("catNoNames")}</span>}
              </span>
              <span dir="auto" style={{ display: "block", fontSize: ".8125rem", color: tk.muted, fontFamily: FF, lineHeight: 1.35, overflowWrap: "anywhere" }}>{names.join(" · ")}</span>
              <span style={{ display: "block", fontSize: ".75rem", fontWeight: 700, color: win ? tk.ink : tk.muted, fontFamily: FF }}>{win ? fmt(t("catWinner"), { name: win }) : t("catNoWinner")}</span>
            </span>
          </React.Fragment>;
          const row = { width: "100%", display: "flex", alignItems: "center", gap: 12, padding: "10px 6px 10px 14px", minHeight: 64, boxSizing: "border-box", background: on ? (lk.hover || "rgba(128,128,128,.12)") : "transparent", border: 0, color: tk.ink, cursor: sel ? "pointer" : "default" };
          return <li key={id} style={{ borderTop: i ? `1px solid ${lk.line || tk.border}` : "none" }}>
            {sel ? <button type="button" role="checkbox" aria-checked={on} aria-label={fmt(t("catSelectOne"), { game, d: shortDay(m.ts), t: time(m.ts) })} className="gtSt2-btn" onClick={() => toggle(id)} style={row}>
              {body}
              <span aria-hidden="true" style={{ flex: "none", width: 44, height: 44, display: "flex", alignItems: "center", justifyContent: "center" }}><span style={{ width: 24, height: 24, borderRadius: 7, border: `2px solid ${on ? tk.gold : tk.muted}`, background: on ? tk.gold : "transparent", color: L ? "#FFFFFF" : N ? "#000000" : "#1A1408", display: "flex", alignItems: "center", justifyContent: "center", font: `800 14px ${FF}` }}>{on ? <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M5 12.5l4.5 4.5L19 7.5" stroke="currentColor" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round" /></svg> : null}</span></span>
            </button> : <div style={row}>
              {body}
              <button type="button" className="gtSt2-btn" aria-label={fmt(t("catDeleteOne"), { game, d: shortDay(m.ts), t: time(m.ts) })} onClick={() => delOne(m)} style={{ flex: "none", width: 44, height: 44, border: 0, background: "transparent", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}><GameIcon name="trashCan" size={18} color={L ? "#B3141D" : "#E39A9F"} /></button>
            </div>}
          </li>;
        })}
      </ul>
    </section>)}
    {list.length > load && <div style={{ display: "flex", justifyContent: "center" }}><button type="button" className="gtSt2-btn" style={pill(false)} onClick={() => setLoad((n) => n + 40)}>{t("catMore")}</button></div>}
    {sel && <div style={{ position: "sticky", bottom: 0, zIndex: 5, margin: "8px -4px 0", padding: "10px 4px calc(10px + env(safe-area-inset-bottom))", background: tk.pageBg, display: "flex", justifyContent: "center" }}>
      <button type="button" className="gtSt2-btn" disabled={!selN} onClick={() => setAsk(true)} style={{ width: "100%", maxWidth: 380, minHeight: 50, borderRadius: 14, border: 0, background: selN ? "#D6202A" : tk.card, color: selN ? "#FFFFFF" : tk.muted, font: `700 15px ${FF}`, textAlign: "center", cursor: selN ? "pointer" : "default" }}>{fmt(t("catDeleteN"), { n: selN })}</button>
    </div>}
    <GtConfirm open={ask} onClose={() => setAsk(false)} tk={tk} title={fmt(t("catAskTitle"), { n: selN })} body={t("catAskBody")} actions={[{ label: t("catAskNo"), onClick: () => setAsk(false), kind: "ghost", autofocus: true }, { label: t("catAskYes"), onClick: delMany, kind: "danger" }]} />
  </div>;
}

export { GtMatchCatalog };
