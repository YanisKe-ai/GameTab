// Gemeinsamer Weitergeben-Screen (Design-Einheit, 06.11.2026) fuer Impostor, Werwolf, Mafia und Verraeter.
// Fortschritt als Balken, sehr grosser Name, grosse Halten-Flaeche bis nach unten (Akzentfarbe des Spiels), Weiter-Knopf im Dock.
// Logik wie vorher in GtRoleHold: Flaeche gedrueckt halten zeigt die Rolle (peek), Loslassen verdeckt sie, danach "Verstanden".
// Das Wurzelelement traegt weiter die Klasse gt-handover: die Querformat-Regeln (H1_LANDSCAPE_CSS) greifen darauf.
import { React } from "../vendor/react-globals.js";
import { useState } from "../prelude.js";
import { GameIcon } from "../assets/icons.js";

const GT_PASS_CSS = `
.gt-pass{display:flex;flex-direction:column;align-items:center;text-align:center;flex:1 1 auto;min-height:0;width:100%}
.gt-pass-bar{display:flex;gap:6px;width:100%;margin-top:2px}
.gt-pass-bar i{flex:1;height:4px;border-radius:2px;background:color-mix(in oklab,var(--gt-p-ink) 16%,transparent);transition:background-color .2s ease}
.gt-pass-bar i.on{background:var(--gt-p-acc)}
.gt-pass-bar i.past{background:color-mix(in oklab,var(--gt-p-acc) 45%,transparent)}
.gt-pass-sr{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap}
.gt-pass-label{font:600 12px/1.2 'Inter',sans-serif;letter-spacing:.16em;text-transform:uppercase;color:var(--gt-p-muted);margin-top:clamp(18px,4.5vh,44px)}
.gt-pass-name{font-size:var(--gt-p-fs);font-weight:700;line-height:1.05;margin:10px 0 clamp(16px,3.4vh,30px);max-width:100%;overflow-wrap:normal;word-break:normal;hyphens:none}
.gt-pass-wrap{flex:1 1 auto;display:flex;flex-direction:column;align-items:center;gap:10px;width:100%;min-height:0}
.gt-pass-wrap>.gt-flip{width:100%;flex:1 1 auto;display:flex;min-height:220px;perspective:none}
.gt-pass-wrap .gt-flip-inner{flex:1;display:grid;min-height:0}
.gt-pass-wrap .gt-flip-face{border:0 !important;border-radius:28px;min-height:0;box-sizing:border-box;box-shadow:inset 0 0 0 2px color-mix(in oklab,var(--gt-p-acc) 62%,transparent);background:color-mix(in oklab,var(--gt-p-acc) 17%,var(--gt-p-card)) !important;color:var(--gt-p-ink)}
.gt-pass-wrap .gt-flip-front{gap:14px;color:var(--gt-p-ink)}
.gt-pass-wrap .gt-flip-front p{margin:0;font:600 18px/1.25 'Inter',sans-serif}
.gt-pass-wrap .gt-flip-back{padding:18px 14px;display:flex;align-items:center;justify-content:center;overflow:visible}
@media (max-height:700px){.gt-pass-wrap .gt-u-dock{position:static}.gt-pass-name{font-size:min(var(--gt-p-fs),50px);margin-bottom:12px}.gt-pass-label{margin-top:14px}.gt-pass-wrap>.gt-flip{min-height:170px}.gt-pass-wrap .gt-flip-back{padding:12px 10px}}
.gt-pass-wrap .gt-flip-back>div{width:100%}
.gt-pass-note{font:500 13px/1.35 'Inter',sans-serif;color:var(--gt-p-muted);max-width:300px;margin:2px 0 0}
.gt-pass-wrap .gt-u-dock{align-self:stretch;margin-top:6px}
.gt-pass-next{border:0;border-radius:20px;font:700 17px/1 'Inter',sans-serif;padding:0 24px;cursor:pointer;transition:transform .16s cubic-bezier(.23,1,.32,1),opacity .16s ease,background-color .16s ease;background:var(--gt-p-acc);color:var(--gt-p-on)}
.gt-pass-next:active:not(:disabled){transform:scale(.97)}
.gt-pass-next:disabled{cursor:default;background:color-mix(in oklab,var(--gt-p-ink) 9%,transparent);color:var(--gt-p-muted)}
@media (prefers-reduced-motion:reduce){.gt-pass-bar i,.gt-pass-next{transition:none}}
.gtL-content .gt-pass{max-width:520px;margin:0 auto}
[data-phone-landscape] .gt-pass-name{font-size:min(var(--gt-p-fs),34px)}
[data-phone-landscape] .gt-pass-label{margin-top:0}
[data-phone-landscape] .gt-pass-wrap>.gt-flip{min-height:150px}
[data-phone-landscape] .gt-pass-wrap .gt-flip-front{gap:8px}
[data-phone-landscape] .gt-pass-wrap .gt-flip-front p{font-size:15px}
[data-phone-landscape] .gt-pass-wrap .gt-u-dock{margin-top:0}
`;

// Lesbare Schriftfarbe auf der Akzentflaeche
function gtPassOn(hex) {
  const m = /^#([0-9a-f]{6})$/i.exec(String(hex || "").trim());
  if (!m) return "#111111";
  const n = parseInt(m[1], 16);
  const lin = c => { c /= 255; return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4); };
  const L = 0.2126 * lin((n >> 16) & 255) + 0.7152 * lin((n >> 8) & 255) + 0.0722 * lin(n & 255);
  return L > 0.3 ? "#111111" : "#FFFFFF";
}
// Namensgroesse: lange Woerter verkleinern, nie mitten im Wort trennen
function gtPassFs(name, base, avail, min) {
  const L = String(name == null ? "" : name).split(/\s+/).reduce((m, w) => Math.max(m, w.length), 1);
  return Math.max(min, Math.min(base, Math.floor(avail / (L * 0.58))));
}

function GtPassScreen({ idx, n, name, font, tk, accent, nameColor, t, peek, front, onPeek, onNext, nextLabel, hint, note }) {
  const [held, setHeld] = useState(false);
  const [seen, setSeen] = useState(false);
  const down = e => {
    if (e && e.button > 0) return;
    try { if (e && e.pointerId != null && e.currentTarget.setPointerCapture) e.currentTarget.setPointerCapture(e.pointerId); } catch (_) {}
    setHeld(true);
    if (!seen) { setSeen(true); if (onPeek) onPeek(); }
  };
  const up = () => setHeld(false);
  const fs = gtPassFs(name, 62, 340, 26);
  const style = { "--gt-p-acc": accent, "--gt-p-ink": tk.ink, "--gt-p-muted": tk.muted, "--gt-p-card": tk.card, "--gt-p-on": gtPassOn(accent), "--gt-p-fs": fs + "px" };
  const bars = [];
  for (let k = 0; k < n; k++) bars.push(<i key={k} className={k === idx ? "on" : k < idx ? "past" : ""} />);
  return <div className="gt-handover gt-pass" style={style}>
    <style>{GT_PASS_CSS}</style>
    <div className="gt-pass-bar" aria-hidden="true">{bars}</div>
    <div className="gt-pass-sr" aria-live="polite">{t("handoverProgress")(idx + 1, n)}</div>
    <div className="gt-pass-label">{t("passPhoneTo")}</div>
    <div className="gt-pass-name" style={{ color: nameColor || tk.ink, fontFamily: font }}>{name}</div>
    <div className="gt-pass-wrap">
      <div className={"gt-flip" + (held ? " is-held" : "")} role="button" tabIndex={0} aria-pressed={held} aria-label={hint} data-gt-hold={held ? "open" : "closed"}
        onPointerDown={down} onPointerUp={up} onPointerCancel={up} onLostPointerCapture={up} onContextMenu={e => e.preventDefault()}
        onKeyDown={e => { if ((e.key === " " || e.key === "Enter") && !e.repeat) { e.preventDefault(); down(e); } }}
        onKeyUp={e => { if (e.key === " " || e.key === "Enter") up(); }} onBlur={up}>
        <div className="gt-flip-inner">
          <div className="gt-flip-face gt-flip-front">{front || <React.Fragment><GameIcon name="lock" size={56} color={tk.ink} /><p>{hint}</p></React.Fragment>}</div>
          <div className="gt-flip-face gt-flip-back" aria-hidden={held ? "false" : "true"}>{peek}</div>
        </div>
      </div>
      <div className="gt-pass-note">{note}</div>
      <div className="gt-u-dock">
        <button className="press-fx gt-hold-next gt-pass-next" data-gt-sound="1" disabled={!seen || held} onClick={onNext}>{nextLabel}</button>
      </div>
    </div>
  </div>;
}
// Hauptknopf im Dock: voll breit, mindestens 56 px hoch, Radius 20 (gleiche Form in allen Partyspielen)
function gtDockBtn({ from, to, on, font, glow, ghost, border, color }) {
  return {
    border: ghost ? `1px solid ${border}` : "none", borderRadius: 20, minHeight: 56, width: "100%", cursor: "pointer",
    background: ghost ? "transparent" : `linear-gradient(135deg, ${from}, ${to || from})`,
    color: ghost ? color : on, fontSize: 17, fontWeight: 800, fontFamily: font || "'Inter', sans-serif", padding: "0 24px",
    boxShadow: ghost || !glow ? "none" : `0 10px 24px -12px ${glow}`,
  };
}
export { GtPassScreen, GT_PASS_CSS, gtPassOn, gtPassFs, gtDockBtn };
