// Stand-Ansichten der Punktespiele (Design-Einheit, 06.11.2026): Skyjo (Strecke), Flip 7 (Kacheln), Phase 10 (Leiter), Romme (Balken).
// Alles echte Spieldaten. Die Stand-Bloecke (gt-ug-po) gibt es nur im Handy-Hochformat: im Laptop und im Querformat zeigt die Seitenspalte den Stand.
// Bewegung nur per transform und opacity, unter 300 ms, Reduced Motion beachtet.
import { React } from "../vendor/react-globals.js";
import { GtCount, gtLeader } from "./fx.js";
import { GameIcon } from "../assets/icons.js";
import { playerHue } from "../themes/palette.js";
import { gtFill } from "./setup-ui.js";
const GT_UG_CSS = `
.gt-ug.gt-u-col{gap:10px}.gt-ug.gt-u-col>.gt-headbtns+.gt-gamehead{margin-top:-16px}
.gtL-content .gt-ug.gt-u-col,[data-phone-landscape] .gt-ug.gt-u-col{gap:0}
.gt-ug-ent{display:contents}
.gtL-content .gt-ug-ent{display:flex;flex-direction:column;gap:10px}
.gt-ug-fill{display:contents}
.gtL-content .gt-ug-fill,[data-phone-landscape] .gt-ug-fill{display:flex;flex-direction:column;gap:14px}
.gtL-content .gt-ug-g8,[data-phone-landscape] .gt-ug-g8{gap:8px}
.plsu-split,.plsu-main,.plsu-side{display:contents}
.gtL-content .plsu-split,.gtL-content .plsu-main,.gtL-content .plsu-side,[data-phone-landscape] .plsu-split,[data-phone-landscape] .plsu-main,[data-phone-landscape] .plsu-side{display:block}
.gtL-content .gt-ug-po,[data-phone-landscape] .gt-ug-po{display:none!important}
.gt-u-col .gt-su-cta{margin-top:auto}
.gtL-content .gt-u-col .gt-su-cta,[data-phone-landscape] .gt-u-col .gt-su-cta{margin-top:6px}
html .gt-u-col .gt-u-dock{margin-top:auto}
html .gtL-content .gt-u-col .gt-u-dock{margin-top:16px}
html[data-phone-landscape] .gt-u-col .gt-u-dock{margin-top:10px}
.gt-ug .gt-u-dock::before{content:'';position:absolute;left:-12px;right:-12px;top:-26px;bottom:-12px;z-index:-1;pointer-events:none;background:linear-gradient(to bottom,transparent 0,rgba(10,12,20,.9) 34%);-webkit-backdrop-filter:blur(8px);backdrop-filter:blur(8px);-webkit-mask-image:linear-gradient(to bottom,transparent 0,#000 34%);mask-image:linear-gradient(to bottom,transparent 0,#000 34%)}
html[data-gt-theme="light"] .gt-ug .gt-u-dock::before{background:linear-gradient(to bottom,transparent 0,rgba(250,247,240,.94) 34%)}
html[data-gt-theme="noir"] .gt-ug .gt-u-dock::before{background:linear-gradient(to bottom,transparent 0,rgba(0,0,0,.92) 34%)}
.gtL-content .gt-ug .gt-u-dock::before,[data-phone-landscape] .gt-ug .gt-u-dock::before{display:none}
.gt-ug-dock-hint{font-size:13px;text-align:center;line-height:1.3}
.gt-ug-lab{font-size:12px;font-weight:600;letter-spacing:.09em;text-transform:uppercase;font-family:'Inter',sans-serif}
.gt-ug-race,.gt-ug-bars{border-radius:20px;padding:14px 16px;box-sizing:border-box}
.gt-ug-rl{position:relative;margin-top:8px}
.gt-ug-rl>i{position:absolute;left:0;right:46px;top:14px;height:3px;border-radius:2px}
.gt-ug-rt{position:absolute;left:0;right:46px;top:0;bottom:0}
.gt-ug-rt>b{position:absolute;width:24px;height:24px;border-radius:12px;font:800 12px/24px 'Inter',sans-serif;text-align:center;color:#0b0e18}
.gt-ug-rl>u{position:absolute;right:0;top:0;width:44px;text-align:right;text-decoration:none;font-weight:700;font-size:16px;line-height:30px}
.gt-ug-tiles{display:grid;gap:8px}
.gt-ug-tile{position:relative;overflow:hidden;border-radius:20px;min-height:104px;padding:12px 14px;box-sizing:border-box;display:flex;flex-direction:column;justify-content:space-between}
.gt-ug-tile>.gt-ug-tf{position:absolute;left:0;right:0;bottom:0;height:100%;transform-origin:50% 100%;transition:transform .28s cubic-bezier(.23,1,.32,1);pointer-events:none}
.gt-ug-tile>*:not(.gt-ug-tf){position:relative}
.gt-ug-tn{display:flex;align-items:center;gap:5px;font-size:15px;font-weight:600;font-family:'Inter',sans-serif;min-width:0}
.gt-ug-tn>span{min-width:0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.gt-ug-tv{font-size:44px;font-weight:800;line-height:1;font-variant-numeric:tabular-nums}
.gt-ug-tt{font-size:13px;font-weight:600;font-family:'Inter',sans-serif;margin-left:4px}
.gt-ug-br{display:grid;grid-template-columns:minmax(0,1fr) auto;align-items:baseline;column-gap:10px;padding:10px 0}
.gt-ug-br+.gt-ug-br{border-top:1px solid rgba(127,127,127,.18)}
.gt-ug-bn{font-size:19px;font-weight:600;font-family:'Inter',sans-serif;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.gt-ug-bv{font-size:36px;font-weight:800;line-height:1.05;font-variant-numeric:tabular-nums}
.gt-ug-bt{font-size:13px;font-weight:600;font-family:'Inter',sans-serif;margin-left:4px}
.gt-ug-bb{grid-column:1/-1;height:8px;border-radius:4px;overflow:hidden;margin-top:6px;background:rgba(127,127,127,.2)}
.gt-ug-bb>i{display:block;height:100%;border-radius:4px;transform-origin:0 50%;transition:transform .28s cubic-bezier(.23,1,.32,1)}
.gt-ug-lad{display:grid;grid-template-columns:repeat(10,minmax(0,1fr));gap:3px;margin-top:2px}
.gt-ug-lad>span{height:30px;border-radius:8px;display:flex;align-items:center;justify-content:center;font:700 12px 'Inter',sans-serif;background:rgba(127,127,127,.16);color:inherit;box-sizing:border-box}
.gt-ug-row{min-height:88px}
.gt-ug-many .gt-ug-row{min-height:64px}
.gtL-content .gt-ug-row,[data-phone-landscape] .gt-ug-row{min-height:0}
.gt-ug-hide-total .gtL-entrytotal{position:absolute;width:1px;height:1px;margin:-1px!important;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap}
.gtL-content .gt-ug-hide-total .gtL-entrytotal,[data-phone-landscape] .gt-ug-hide-total .gtL-entrytotal{position:static;width:auto;height:auto;margin:0!important;overflow:visible;clip:auto;white-space:normal}
@media (prefers-reduced-motion: reduce){.gt-ug-tile>.gt-ug-tf,.gt-ug-bb>i{transition:none}}
`;
function ugSurf(theme) { return theme === "light" ? "rgba(24,22,32,0.06)" : theme === "noir" ? "rgba(255,255,255,0.08)" : "rgba(255,255,255,0.06)"; }
function ugLine(theme) { return theme === "light" ? "rgba(24,22,32,0.16)" : "rgba(255,255,255,0.18)"; }

// Skyjo: Spielermarken auf der Strecke zum Spielende (Ziel)
function GtRace({ players, target, tk, theme, accent, font, label }) {
  const T = Math.max(1, target || 1);
  const ms = [];
  players.forEach((p, i) => {
    const f = Math.min(1, Math.max(0, (p.total || 0) / T));
    let r = 0;
    while (ms.some(q => q.r === r && Math.abs(q.f - f) < 0.07 + q.r * 0.07)) r++;
    ms.push({ p, i, f, r: Math.min(r, 5) });
  });
  return <section className={"gt-ug-race gt-ug-po"} aria-label={label} style={{ background: ugSurf(theme) }}>
    <div className="gt-ug-lab" style={{ color: tk.muted }}>{label}</div>
    <div className="gt-ug-rl" style={{ height: 30 }}>
      <i style={{ background: ugLine(theme) }} />
      <div className="gt-ug-rt">{ms.map(m => <b key={m.p.id} title={m.p.name + " " + m.p.total} style={{ left: `calc((100% - 24px) * ${m.f} ${m.f > 0.5 ? "-" : "+"} ${m.r * 22}px)`, top: 3, zIndex: 10 - m.r, background: gtFill(playerHue(m.i, theme)).bg, color: gtFill(playerHue(m.i, theme)).fg }}>{m.i + 1}</b>)}</div>
      <u style={{ color: accent, fontFamily: font }}>{target}</u>
    </div>
  </section>;
}

// Flip 7: Kacheln mit grosser Zahl, die Kachel fuellt sich von unten Richtung Ziel
function GtTiles({ players, target, tk, theme, accent, font, label }) {
  const T = Math.max(1, target || 1);
  const lead = players.length > 1 ? gtLeader(players.map(p => [p.id, p.total]), false) : null;
  const n = players.length;
  const cols = n <= 2 || n === 4 ? 2 : 3;
  return <section className="gt-ug-po" aria-label={label}>
    <div className="gt-ug-tiles" style={{ gridTemplateColumns: `repeat(${cols},minmax(0,1fr))` }}>{players.map(p => {
      const f = Math.min(1, Math.max(0, (p.total || 0) / T));
      return <div key={p.id} className={"gt-ug-tile"} style={{ background: ugSurf(theme) }}>
        <span className="gt-ug-tf" aria-hidden="true" style={{ background: `color-mix(in oklab, ${accent} ${theme === "light" ? 30 : 34}%, transparent)`, transform: `scaleY(${f})` }} />
        <div className="gt-ug-tn" style={{ color: tk.ink }}>{p.id === lead && (p.total || 0) > 0 && <GameIcon name="crown" size={14} color={tk.gold || accent} style={{ flexShrink: 0 }} />}<span>{p.name}</span></div>
        <div><span className="gt-ug-tv" style={{ color: tk.ink, fontFamily: font }}><GtCount value={p.total} mem={"ug-t" + p.id} good="high" dpos="r" /></span><span className="gt-ug-tt" style={{ color: tk.muted }}>/ {target}</span></div>
      </div>;
    })}</div>
  </section>;
}

// Romme: Minuspunkte als grosse Zahl mit Balken Richtung Spielende
function GtBars({ players, target, tk, theme, accent, font, label }) {
  const T = Math.max(1, target || 1);
  return <section className={"gt-ug-bars gt-ug-po"} aria-label={label} style={{ background: ugSurf(theme) }}>
    <div className="gt-ug-lab" style={{ color: tk.muted }}>{label}</div>
    {players.map(p => {
      const f = Math.min(1, Math.max(0, (p.total || 0) / T));
      return <div key={p.id} className="gt-ug-br">
        <div className="gt-ug-bn" style={{ color: tk.ink }}>{p.name}</div>
        <div><span className="gt-ug-bv" style={{ color: tk.ink, fontFamily: font }}><GtCount value={p.total} mem={"ug-b" + p.id} good="low" dpos="l" /></span><span className="gt-ug-bt" style={{ color: tk.muted }}>/ {target}</span></div>
        <div className="gt-ug-bb" aria-hidden="true"><i style={{ background: accent, transform: `scaleX(${f})` }} /></div>
      </div>;
    })}
  </section>;
}

// Phase 10: Leiter mit den 10 Phasen, erledigt gefuellt, aktuelle betont
function GtLadder({ done, cur, tk, theme, accent, label }) {
  return <div className="gt-ug-lad" role="img" aria-label={label} style={{ color: tk.muted }}>{Array.from({ length: 10 }, (_, k) => {
    const d = k < done;
    const c = !d && k + 1 === cur;
    return <span key={k} style={d ? { background: accent, color: tk.onAccent || "#07110e" } : c ? { boxShadow: `inset 0 0 0 2px ${accent}`, background: "transparent", color: tk.ink, fontSize: 14 } : undefined}>{k + 1}</span>;
  })}</div>;
}
export { GT_UG_CSS, GtRace, GtTiles, GtBars, GtLadder, ugSurf };
