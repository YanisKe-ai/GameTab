// «Du»-Kacheln oben in der Statistik (Bento B5, Bewegung M1 «Sanft»).
// Werte zaehlen erst hoch, wenn die Kachel sichtbar wird. Reduced Motion: alles sofort fertig.
import { React } from "../vendor/react-globals.js";
import { useEffect, useMemo, useRef, useState } from "../prelude.js";
import { GT_STATS } from "./core.js";
import { gtMeModel, gtMeWave, gtMeSplit } from "./me.js";
import { useGtProfile, gtProfileTeam } from "../shared/profile.js";
import { gtAnnounce } from "../shared/gt-live.js";

const FF = "'Inter', sans-serif";
const FD = "'Baloo 2', sans-serif";
const VW = 326, VH = 150;

const GT_ME_CSS = `
@property --gtme-n{syntax:'<integer>';inherits:false;initial-value:0}
@keyframes gtMeTick{from{--gtme-n:0}to{--gtme-n:var(--to)}}
@keyframes gtMeBlur{from{opacity:0;filter:blur(8px);transform:translateY(10px)}to{opacity:1;filter:none;transform:none}}
@keyframes gtMeRise{from{transform:scaleY(.02)}to{transform:scaleY(1)}}
@keyframes gtMeDraw{from{stroke-dashoffset:1000}to{stroke-dashoffset:0}}
@keyframes gtMeRing{from{stroke-dashoffset:176}}
@keyframes gtMeShine{0%{background-position:0% 0%}50%{background-position:100% 100%}100%{background-position:0% 0%}}
.gtMe-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px;margin-bottom:12px}
.gtMe-tile{position:relative;overflow:hidden;border-radius:20px;padding:14px;box-sizing:border-box;min-width:0}
.gtMe-full{grid-column:1/-1}
.gtMe-tile::after{content:"";position:absolute;inset:0;border-radius:inherit;pointer-events:none;background:radial-gradient(220px circle at var(--mx,50%) var(--my,-40%),var(--gtme-spot),transparent 60%)}
.gtMe-shine::before{content:"";position:absolute;inset:0;border-radius:inherit;padding:1.5px;background:linear-gradient(120deg,transparent 30%,var(--gtme-beam) 50%,transparent 70%);background-size:300% 300%;animation:gtMeShine 6s linear infinite;-webkit-mask:linear-gradient(#000 0 0) content-box,linear-gradient(#000 0 0);-webkit-mask-composite:xor;mask-composite:exclude;pointer-events:none;z-index:1}
.gtMe-n{counter-reset:gtmen var(--gtme-n);--gtme-n:var(--to)}
.gtMe-n::after{content:counter(gtmen)}
.gtMe-tile:not(.on){opacity:0}
.gtMe-tile:not(.on) .gtMe-n{--gtme-n:0}
.gtMe-tile:not(.on) .gtMe-area{transform:scaleY(.02)}
.gtMe-tile:not(.on) .gtMe-line{stroke-dashoffset:1000}
.gtMe-tile:not(.on) .gtMe-ring{stroke-dashoffset:176}
.gtMe-tile.on{animation:gtMeBlur .7s cubic-bezier(.23,1,.32,1) both}
.gtMe-tile.on .gtMe-n{animation:gtMeTick 1.4s cubic-bezier(.23,1,.32,1) .15s both}
.gtMe-area{transform-origin:50% 100%}
.gtMe-tile.on .gtMe-area{animation:gtMeRise 1.1s cubic-bezier(.23,1,.32,1) .1s both}
.gtMe-line{stroke-dasharray:1000}
.gtMe-tile.on .gtMe-line{animation:gtMeDraw 1.4s cubic-bezier(.3,.7,.2,1) .25s both}
.gtMe-tile.on .gtMe-ring{animation:gtMeRing 1.3s cubic-bezier(.23,1,.32,1) .2s both}
.gtMe-dot,.gtMe-cross,.gtMe-tip{transition:left .3s cubic-bezier(.23,1,.32,1),top .3s cubic-bezier(.23,1,.32,1)}
.gtMe-hit{position:absolute;top:0;height:${VH}px;border:0;padding:0;background:transparent;cursor:pointer;-webkit-tap-highlight-color:transparent}
.gtMe-hit:focus-visible,.gtMe-btn:focus-visible{outline:2px solid var(--gtme-ring);outline-offset:-2px;border-radius:8px}
.gtMe-btn{min-height:44px;border-radius:12px;border:0;padding:0 16px;font:700 14px ${FF};cursor:pointer;transition:transform 160ms cubic-bezier(.23,1,.32,1)}
.gtMe-btn:active{transform:scale(.97)}
.gtMe-sr{position:absolute!important;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0}
@media (prefers-reduced-motion: reduce){.gtMe-tile,.gtMe-tile *{animation:none!important;transition:none!important}.gtMe-tile:not(.on){opacity:1}.gtMe-shine::before{animation:none}}
`;

function gtMeLook(theme, tk) {
  const L = theme === "light", N = theme === "noir";
  if (N) return { L, N, top: "#D6D6D6", base: "#6B6B6B", lt: "#FFFFFF", lb: "#A8A8A8", erz: tk.ink, fav: tk.ink, team: tk.ink, erzBg: "#EBEBEB", erzInk: "#000000", av1: "#5F5F5F", av2: "#8A8A8A", avInk: "#FFFFFF", beam: "#FFFFFF", spot: "rgba(255,255,255,.07)", tipBg: "#000000", tipBd: "#5F5F5F", tipInk: "#EBEBEB", btnInk: "#000000", chip: "#2E2E2E", ring: tk.card };
  if (L) return { L, N, top: "#982DB3", base: "#3071CD", lt: "#6E1F84", lb: "#1F56A8", erz: "#A8461A", fav: "#1F7A40", team: "#2A4FB0", erzBg: "#C2521D", erzInk: "#FFFFFF", av1: "#2C62E0", av2: "#6B4FD0", avInk: "#FFFFFF", beam: "#C2521D", spot: "rgba(110,75,10,.07)", tipBg: "#17130F", tipBd: "#17130F", tipInk: "#FFFFFF", btnInk: "#FFFFFF", chip: tk.pageBg2 || "#E0D5BF", ring: tk.card };
  return { L, N, top: "#C042E0", base: "#4FA8F5", lt: "#DE96F2", lb: "#A9D3FA", erz: "#F0A27A", fav: "#7CD8A0", team: "#9DB8FF", erzBg: "#E0662B", erzInk: "#1A0E08", av1: "#2C62E0", av2: "#6B4FD0", avInk: "#FFFFFF", beam: "#E0662B", spot: "rgba(157,184,255,.12)", tipBg: "#0F1522", tipBd: "#2C3A55", tipInk: "#EEF2F8", btnInk: "#1A1408", chip: "rgba(255,255,255,.08)", ring: tk.card };
}

function fmt(s, o) { return String(s || "").replace(/\{(\w+)\}/g, (m, k) => (o && o[k] != null ? o[k] : "")); }
function initial(n) { return (String(n || "?").trim().charAt(0) || "?").toUpperCase(); }

function Num({ v, size, color }) {
  return <span style={{ font: `800 ${size || 24}px/1.1 ${FD}`, color, fontVariantNumeric: "tabular-nums" }}><span className="gtMe-n" aria-hidden="true" style={{ "--to": v }} /><span className="gtMe-sr">{v}</span></span>;
}

function GtMeBento({ matches, opts, t, tk, lk, theme }) {
  const prof = useGtProfile();
  const c = gtMeLook(theme, tk);
  const model = useMemo(() => { try { return prof ? gtMeModel(matches, prof, opts) : null; } catch (e) { try { console.error(e); } catch (_) {} return null; } }, [matches, prof, opts]);
  const rm = useMemo(() => { try { return window.matchMedia("(prefers-reduced-motion: reduce)").matches; } catch (e) { return false; } }, []);
  const gridRef = useRef(null);
  const [seen, setSeen] = useState({});
  const [sel, setSel] = useState(7);
  const [askDone, setAskDone] = useState(null);
  useEffect(() => {
    const g = gridRef.current;
    if (!g) return;
    const els = Array.from(g.querySelectorAll("[data-gtme]"));
    const all = () => { const s = {}; els.forEach((el) => { s[el.getAttribute("data-gtme")] = 1; }); setSeen(s); };
    if (rm || typeof IntersectionObserver === "undefined") { all(); return; }
    const io = new IntersectionObserver((es) => {
      const hit = es.filter((e) => e.isIntersecting);
      if (!hit.length) return;
      hit.forEach((e) => io.unobserve(e.target));
      const add = hit.map((e) => e.target.getAttribute("data-gtme"));
      setSeen((s) => { const n = Object.assign({}, s); add.forEach((k) => { n[k] = 1; }); return n; });
    }, { threshold: 0.3 });
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [model && !model.empty, model && !!model.partner, model && !!model.ask, askDone]);
  useEffect(() => { if (!askDone) return; const id = setTimeout(() => setAskDone(null), 4000); return () => clearTimeout(id); }, [askDone]);
  if (!model || (model.empty && !model.ask)) return null;

  const move = (e) => {
    if (e.pointerType === "touch") return;
    const g = gridRef.current; if (!g) return;
    g.querySelectorAll(".gtMe-tile").forEach((el) => { const r = el.getBoundingClientRect(); el.style.setProperty("--mx", Math.round(e.clientX - r.left) + "px"); el.style.setProperty("--my", Math.round(e.clientY - r.top) + "px"); });
  };
  const tile = (key, full, extra) => ({ "data-gtme": key, className: "gtMe-tile" + (full ? " gtMe-full" : "") + (extra ? " " + extra : "") + (seen[key] ? " on" : "") });
  const box = { background: tk.card, border: (c.L || c.N) ? `1px solid ${tk.border}` : "none", boxShadow: c.L ? "0 1px 3px rgba(70,48,12,0.10)" : "none", color: tk.ink, fontFamily: FF };
  const lab = (txt, col) => <div style={{ fontSize: 12, fontWeight: 700, color: col, fontFamily: FF }}>{txt}</div>;
  const sm = (txt) => <div style={{ fontSize: 12, color: tk.muted, fontFamily: FF, lineHeight: 1.35 }}>{txt}</div>;

  // Welle
  const W = gtMeWave(model.weeks, VW, VH);
  const S = Math.min(sel, model.weeks.length - 1);
  const wk = model.weeks[S];
  const nW = model.weeks.length;
  const kw = (w, i) => { const ago = nW - 1 - i; return ago === 0 ? t("meWeekNow") : ago === 1 ? t("meWeekLast") : fmt(t("meWeekAgo"), { n: ago }); };
  const pct = (x) => (x / VW) * 100 + "%";
  const tipP = (W.X[S] / VW) * 100;
  const tipX = tipP > 62 ? "calc(-100% + 4px)" : tipP < 38 ? "-4px" : "-50%";
  const legend = <div style={{ display: "flex", flexDirection: "column", gap: 3, fontSize: 12, color: tk.muted, flex: "none" }}>
    <span style={{ display: "flex", alignItems: "center", gap: 5 }}><i aria-hidden="true" style={{ width: 10, height: 10, borderRadius: 3, background: c.base }} />{t("scorepadsTitle")}</span>
    <span style={{ display: "flex", alignItems: "center", gap: 5 }}><i aria-hidden="true" style={{ width: 10, height: 10, borderRadius: 3, background: c.top }} />{t("partyGamesTitle")}</span></div>;

  const fav = model.fav, nem = model.nemesis, pa = model.partner;
  const favPct = fav && fav.decided ? Math.round(fav.rate * 100) : null;
  const favOff = favPct == null ? 176 : 176 - (176 * favPct) / 100;
  const paParts = pa ? gtMeSplit(pa.name) : [];
  const meK = new Set([prof.name].concat(prof.aliases || []).map(GT_STATS.norm));
  const paOther = paParts.filter((x) => !meK.has(GT_STATS.norm(x)));
  const paInit = [initial(paOther[0] || (pa && pa.name)), initial(model.name)];

  const answer = (yes) => {
    if (!model.ask) return;
    const team = model.ask.name;
    if (gtProfileTeam(team, yes)) { const msg = yes ? fmt(t("meAskDoneYes"), { team }) : t("meAskDoneNo"); setAskDone(msg); try { gtAnnounce(msg, "polite"); } catch (e) {} }
  };

  return <section aria-labelledby="gtMe-h" style={{ "--gtme-spot": c.spot, "--gtme-beam": c.beam, "--gtme-ring": tk.ink }}>
    <style>{GT_ME_CSS}</style>
    <h2 id="gtMe-h" className="gtMe-sr">{fmt(t("meSection"), { name: model.name })}</h2>
    <div ref={gridRef} className="gtMe-grid" onPointerMove={move}>
      {!model.empty && <div {...tile("wave", true)} style={box}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", gap: 8, marginBottom: 8 }}>
          <div style={{ minWidth: 0 }}>{sm(t("meWeeks"))}<Num v={model.weekTotal} size={32} color={tk.ink} /></div>{legend}
        </div>
        <div style={{ position: "relative", height: VH + 6 }}>
          <svg width="100%" height={VH} viewBox={`0 0 ${VW} ${VH}`} preserveAspectRatio="none" role="img" aria-label={t("meChartLabel")} style={{ display: "block", overflow: "visible" }}>
            {[10, 60, 110].map((y) => <line key={y} x1="0" y1={y} x2={VW} y2={y} stroke={lk.line || tk.border} strokeWidth="1" vectorEffect="non-scaling-stroke" />)}
            <path className="gtMe-area" d={W.areaB} fill={c.base} />
            <path className="gtMe-area" d={W.areaT} fill={c.top} style={{ animationDelay: ".22s" }} />
            <path className="gtMe-line" pathLength="1000" d={W.lineT} fill="none" stroke={c.lt} strokeWidth="2.2" vectorEffect="non-scaling-stroke" />
            <path className="gtMe-line" pathLength="1000" d={W.lineB} fill="none" stroke={c.lb} strokeWidth="2.2" vectorEffect="non-scaling-stroke" />
          </svg>
          <div aria-hidden="true" className="gtMe-cross" style={{ position: "absolute", top: 0, height: VH, width: 1, background: tk.ink, opacity: 0.4, left: pct(W.X[S]) }} />
          <div aria-hidden="true" className="gtMe-dot" style={{ position: "absolute", width: 10, height: 10, margin: "-5px 0 0 -5px", borderRadius: "50%", background: c.top, boxShadow: `0 0 0 2px ${c.ring}`, left: pct(W.X[S]), top: W.YT[S] }} />
          <div aria-hidden="true" className="gtMe-dot" style={{ position: "absolute", width: 10, height: 10, margin: "-5px 0 0 -5px", borderRadius: "50%", background: c.base, boxShadow: `0 0 0 2px ${c.ring}`, left: pct(W.X[S]), top: W.YB[S] }} />
          <div aria-hidden="true" className="gtMe-tip" style={{ position: "absolute", padding: "6px 10px", borderRadius: 10, background: c.tipBg, border: `1px solid ${c.tipBd}`, color: c.tipInk, fontSize: 12, whiteSpace: "nowrap", transform: `translate(${tipX},-115%)`, left: pct(W.X[S]), top: W.YT[S] }}><b>{kw(wk, S)}</b> · {fmt(t("meTip"), { a: wk.score, b: wk.party })}</div>
          {model.weeks.map((w, i) => { const step = VW / (model.weeks.length - 1); return <button key={i} type="button" className="gtMe-hit" aria-pressed={i === S} aria-label={fmt(t("meWeekAria"), { w: kw(w, i), a: w.score, b: w.party })} onClick={() => setSel(i)} style={{ left: `calc(${pct(W.X[i])} - max(22px, ${pct(step / 2)}))`, width: `max(44px, ${pct(step)})` }} />; })}
        </div>
      </div>}

      {!model.empty && <div {...tile("erz", false, nem ? "gtMe-shine" : "")} style={box}>
        {lab(t("meNemesis"), c.erz)}
        {nem ? <React.Fragment>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 8, minWidth: 0 }}><span aria-hidden="true" style={{ width: 32, height: 32, flex: "none", borderRadius: 11, background: c.erzBg, color: c.erzInk, display: "flex", alignItems: "center", justifyContent: "center", font: `800 15px ${FF}` }}>{initial(nem.name)}</span><span dir="auto" style={{ font: `800 21px/1.1 ${FD}`, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", minWidth: 0 }}>{nem.name}</span></div>
          <div style={{ display: "flex", alignItems: "baseline", gap: 5, marginTop: 8 }}><Num v={nem.theyWon} size={24} color={c.erz} /><span aria-hidden="true" style={{ color: tk.muted }}>:</span><Num v={nem.iWon} size={24} color={tk.ink} /></div>
          {sm(fmt(t("meNemSub"), { name: nem.name }))}
        </React.Fragment> : <React.Fragment><div style={{ font: `800 18px/1.2 ${FD}`, marginTop: 8 }}>{t("meNoNemesis")}</div>{sm(t("meNoNemesisSub"))}</React.Fragment>}
      </div>}

      {!model.empty && fav && <div {...tile("fav")} style={box}>
        {lab(t("meFav"), c.fav)}
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 8, minWidth: 0 }}>
          <svg width="58" height="58" viewBox="0 0 64 64" aria-hidden="true" style={{ flex: "none" }}>
            <circle cx="32" cy="32" r="28" fill="none" stroke={lk.line || tk.border} strokeWidth="7" />
            {favPct != null && <circle className="gtMe-ring" cx="32" cy="32" r="28" fill="none" stroke={c.top} strokeWidth="7" strokeLinecap="round" strokeDasharray="176" strokeDashoffset={favOff} transform="rotate(-90 32 32)" />}
            <text x="32" y="37" textAnchor="middle" fill={tk.ink} fontFamily="Inter" fontWeight="800" fontSize="14">{favPct != null ? favPct + "%" : ""}</text>
          </svg>
          <div style={{ minWidth: 0 }}>
            <div style={{ font: `800 19px/1.1 ${FD}`, overflow: "hidden", textOverflow: "ellipsis" }}>{GT_STATS.gameLabel(fav.game, t)}</div>
            {sm(fmt(t("meFavN"), { n: fav.matches }))}
            {fav.team > 0 && sm(fmt(t("meFavTeam"), { n: fav.team }))}
            {favPct != null && <span className="gtMe-sr">{fmt(t("meFavAria"), { p: favPct })}</span>}
          </div>
        </div>
      </div>}

      {!model.empty && pa && <div {...tile("team", true)} style={{ ...box, display: "flex", alignItems: "center", gap: 12 }}>
        <span aria-hidden="true" style={{ display: "flex", flex: "none" }}>
          <span style={{ width: 34, height: 34, borderRadius: "50%", background: c.av2, color: c.avInk, display: "flex", alignItems: "center", justifyContent: "center", font: `800 12px ${FF}`, boxShadow: `0 0 0 2px ${tk.card}` }}>{paInit[0]}</span>
          <span style={{ width: 34, height: 34, borderRadius: "50%", background: c.av1, color: c.avInk, display: "flex", alignItems: "center", justifyContent: "center", font: `800 12px ${FF}`, marginLeft: -8, boxShadow: `0 0 0 2px ${tk.card}` }}>{paInit[1]}</span>
        </span>
        <div style={{ flex: 1, minWidth: 0 }}>
          {lab(t("mePartner"), c.team)}
          <div dir="auto" style={{ font: `800 19px/1.15 ${FD}`, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{pa.name}</div>
          {sm(fmt(t("mePartnerSub"), { n: pa.matches, games: pa.games.map((g) => GT_STATS.gameLabel(g, t)).join(", ") }))}
        </div>
        <div style={{ textAlign: "right", flex: "none" }}><Num v={pa.wins} size={26} color={tk.ink} />{sm(t("meWins"))}</div>
      </div>}

      {model.ask && !askDone && <div {...tile("ask", true)} style={{ ...box, background: tk.card }}>
        <div style={{ fontSize: 14, fontWeight: 700 }}>{fmt(t("meAskQ"), { team: model.ask.name })}</div>
        {sm(fmt(t("meAskSub"), { n: model.ask.n }))}
        <div style={{ display: "flex", gap: 8, marginTop: 10, flexWrap: "wrap" }}>
          <button type="button" className="gtMe-btn" onClick={() => answer(true)} style={{ background: tk.gold, color: c.btnInk }}>{t("meAskYes")}</button>
          <button type="button" className="gtMe-btn" onClick={() => answer(false)} style={{ background: c.chip, color: tk.ink, border: c.N ? `1px solid ${tk.border}` : 0 }}>{t("meAskNo")}</button>
        </div>
      </div>}
      {askDone && <div role="status" className="gtMe-full" style={{ fontSize: 13, color: tk.muted, padding: "0 4px", fontFamily: FF }}>{askDone}</div>}
    </div>
  </section>;
}

export { GtMeBento };
