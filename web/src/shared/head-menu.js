// Spielkopf rechts: zwei runde Knoepfe (Erscheinungsbild, Menue). Das Menue klappt direkt unter dem Knopf auf.
// Inhalt: Gruppe "Partie" (Aktionen des Spiels aus `items`, dann "Spiel beenden"), Trennlinie, "Regeln", "Startseite".
// items: [{ key, icon, label, onClick, hold, confirming, confirmLabel, twoStep }]
//   hold: Gedrueckt-halten-Aktion (gtHold, Tastatur: zweimal innert 3 s). onClick: normales Tippen.
//   twoStep: erstes Tippen fragt nur nach (confirming), das Menue schliesst erst beim zweiten Tippen.
// Dialogverhalten (Escape, Tippen ausserhalb, Fokus, Hintergrund inert) kommt von useGtDialog.
import { React, ReactDOM } from "../vendor/react-globals.js";
import { useGtDialog } from "./dialog.js";
import { GtHoldLabel, gtHold } from "./fx.js";

const GT_HM_CSS = `.gt-hmt-dark{--hm-btn:#1B2235;--hm-ring:#ffffff1f;--hm-ink:#E9ECF4;--hm-on-bg:#E9ECF4;--hm-on-ink:#0D1220;--hm-panel:#161C2E;--hm-line:rgba(255,255,255,.11);--hm-muted:#9AA4BE;--hm-hover:rgba(255,255,255,.08);--hm-shadow:0 18px 44px rgba(0,0,0,.55),0 0 0 1px rgba(255,255,255,.1);--hm-dim:rgba(4,8,18,.5);--hm-danger:#FF7B7F}
.gt-hmt-light{--hm-btn:#FFFFFF;--hm-ring:rgba(27,34,53,.18);--hm-ink:#1B2235;--hm-on-bg:#1B2235;--hm-on-ink:#FFFFFF;--hm-panel:#FFFFFF;--hm-line:rgba(27,34,53,.1);--hm-muted:#5C6580;--hm-hover:rgba(27,34,53,.06);--hm-shadow:0 18px 40px rgba(20,28,50,.22),0 0 0 1px rgba(27,34,53,.1);--hm-dim:rgba(20,26,44,.34);--hm-danger:#C9302C}
.gt-hmt-noir{--hm-btn:#1C1C1C;--hm-ring:rgba(255,255,255,.18);--hm-ink:#EDEDED;--hm-on-bg:#EDEDED;--hm-on-ink:#0A0A0A;--hm-panel:#141414;--hm-line:rgba(255,255,255,.13);--hm-muted:#A3A3A3;--hm-hover:rgba(255,255,255,.09);--hm-shadow:0 18px 44px rgba(0,0,0,.7),0 0 0 1px rgba(255,255,255,.14);--hm-dim:rgba(0,0,0,.6);--hm-danger:#FF8F8F}
.gt-hb.gt-hbn>.gt-hf{width:40px;height:40px;min-width:40px;padding:0;border:none;background:var(--hm-btn);color:var(--hm-ink);box-shadow:inset 0 0 0 1px var(--hm-ring);-webkit-backdrop-filter:none;backdrop-filter:none}
.gt-hb.gt-hbn[aria-expanded="true"]>.gt-hf{background:var(--hm-on-bg)!important;color:var(--hm-on-ink)!important;box-shadow:none!important}
.gt-hm-dim{position:fixed;inset:0;z-index:95;background:var(--hm-dim);animation:gtHmFade .17s ease-out}
.gt-hm-panel{position:fixed;box-sizing:border-box;width:min(250px,calc(100vw - 16px));padding:6px;border-radius:16px;background:var(--hm-panel);box-shadow:var(--hm-shadow);overflow-y:auto;overscroll-behavior:contain;font-family:'Inter',sans-serif;color:var(--hm-ink);transform-origin:top right;animation:gtHmIn .17s cubic-bezier(.23,1,.32,1)}
.gt-hm-panel:focus{outline:none}
.gt-hm-ghost{position:fixed;display:flex;align-items:center;justify-content:center;box-sizing:border-box;border-radius:999px;background:var(--hm-on-bg);color:var(--hm-on-ink)}
.gt-hm-h{padding:8px 12px 4px;font-size:11px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:var(--hm-muted)}
.gt-hm-sep{height:1px;margin:6px 8px;background:var(--hm-line)}
.gt-hm-row{position:relative;display:flex;align-items:center;gap:12px;width:100%;box-sizing:border-box;min-height:48px;margin:0;padding:6px 12px;border:0;border-radius:11px;background:transparent;color:var(--hm-ink);font:600 15px/1.2 'Inter',sans-serif;letter-spacing:0;text-align:left;text-transform:none;cursor:pointer;-webkit-tap-highlight-color:transparent;touch-action:manipulation;transition:background-color .15s ease,color .15s ease}
@media (hover:hover) and (pointer:fine){.gt-hm-row:hover{background:var(--hm-hover)}}
.gt-hm-row:active{background:var(--hm-hover)}
.gt-hm-row:focus{outline:none}
.gt-hm-row:focus-visible{outline:2px solid currentColor;outline-offset:-2px}
.gt-hm-ic{position:relative;display:flex;align-items:center;justify-content:center;flex:none;width:28px;height:28px;border-radius:9px;color:var(--ic);background:color-mix(in srgb,var(--ic) 17%,transparent)}
.gt-hm-txt{position:relative;min-width:0;flex:1;overflow-wrap:anywhere}
.gt-hm-row .gt-hold-lbl{display:flex;flex-direction:column;align-items:flex-start}
.gt-hm-row .gt-hold-hint{font-size:11px;font-weight:600;margin-top:1px;color:var(--hm-muted);opacity:1}
.gt-hm-row.is-danger{color:var(--hm-danger)}
.gt-hm-row.is-confirm{background:#C9302C;color:#FFFFFF}
.gt-hm-row.is-confirm .gt-hm-ic{color:#FFFFFF;background:rgba(255,255,255,.2)}
.gt-hm-row.is-confirm.is-warm{background:var(--hm-on-bg);color:var(--hm-on-ink)}
.gt-hm-row.is-confirm.is-warm .gt-hm-ic{color:var(--hm-on-ink);background:rgba(128,128,128,.22)}
@keyframes gtHmIn{from{opacity:0;transform:scale(.96)}to{opacity:1;transform:none}}
@keyframes gtHmFade{from{opacity:0}to{opacity:1}}
@media (prefers-reduced-motion:reduce){.gt-hm-panel,.gt-hm-dim{animation:none}.gt-hm-row{transition:none}}`;

const IC = { fill: "none", stroke: "currentColor", strokeWidth: 2, strokeLinecap: "round", strokeLinejoin: "round" };
const ICONS = {
  trophy: [<path key="a" d="M7 4h10v5a5 5 0 0 1-10 0V4z" {...IC} />, <path key="b" d="M7 6H4.5a2.5 2.5 0 0 0 2.6 3.6M17 6h2.5a2.5 2.5 0 0 1-2.6 3.6" {...IC} />, <path key="c" d="M12 14v3.5M8.5 20.5h7M9.5 17.5h5v3h-5z" {...IC} />],
  restart: [<path key="a" d="M3.5 12a8.5 8.5 0 1 0 2.6-6.1" {...IC} />, <path key="b" d="M3.5 4.5v4.6h4.6" {...IC} />],
  users: [<circle key="a" cx="9" cy="8.5" r="3.2" {...IC} />, <path key="b" d="M3 19.5a6 6 0 0 1 12 0" {...IC} />, <path key="c" d="M15.6 5.6a3.2 3.2 0 0 1 0 5.8M18.2 19.5a6 6 0 0 0-2.6-5" {...IC} />],
  flag: [<path key="m" d="M6 21V4" {...IC} />, <path key="f" d="M6 4.5h11.5l-2.4 4 2.4 4H6" {...IC} />],
  rules: [<circle key="a" cx="12" cy="12" r="9" {...IC} />, <path key="b" d="M9.6 9.4a2.5 2.5 0 1 1 3.6 2.2c-.8.5-1.2 1-1.2 1.8" {...IC} />, <circle key="c" cx="12" cy="17" r=".6" fill="currentColor" stroke="currentColor" strokeWidth="1" />],
  gear: [<circle key="a" cx="12" cy="12" r="3" {...IC} />, <path key="b" d="M12 2.8v2.4M12 18.8v2.4M2.8 12h2.4M18.8 12h2.4M5.5 5.5l1.7 1.7M16.8 16.8l1.7 1.7M5.5 18.5l1.7-1.7M16.8 7.2l1.7-1.7" {...IC} />],
  home: [<path key="r" d="M3 11.5 12 4l9 7.5" {...IC} />, <path key="h" d="M5.5 10v9.5a1 1 0 0 0 1 1H9.5v-6h5v6H18a1 1 0 0 0 1-1V10" {...IC} />],
  plus: [<path key="a" d="M12 5v14M5 12h14" {...IC} />],
  table: [<path key="a" d="M3 9h18M5 9v10M19 9v10M4 5h16v4H4z" {...IC} />],
  share: [<path key="a" d="M12 15V4M8 8l4-4 4 4M5 13v6h14v-6" {...IC} />],
  copy: [<path key="a" d="M9 9h10v10H9zM5 15V5h10" {...IC} />],
  trash: [<path key="a" d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3" {...IC} />],
};
const COLORS = {
  dark: { restart: "#F0A63A", users: "#3FB8A6", flag: "#FF7B7F", rules: "#8C9AFF", gear: "#9AA4BE", home: "#5FB38C", plus: "#8C9AFF", table: "#3FB8A6", share: "#8C9AFF", copy: "#F0A63A", trash: "#FF7B7F" },
  light: { restart: "#B86F00", users: "#12806F", flag: "#C9302C", rules: "#4353D6", gear: "#5C6580", home: "#2A7F5A", plus: "#4353D6", table: "#12806F", share: "#4353D6", copy: "#B86F00", trash: "#C9302C" },
  noir: { restart: "#D2D2D2", users: "#D2D2D2", flag: "#FF8F8F", rules: "#D2D2D2", gear: "#D2D2D2", home: "#D2D2D2", plus: "#D2D2D2", table: "#D2D2D2", share: "#D2D2D2", copy: "#D2D2D2", trash: "#FF8F8F" },
};

function GtHmRow({ icon, color, danger, confirming, warm, onClick, children, extra, ...rest }) {
  return (
    <button type="button" role="menuitem" className={"gt-hm-row" + (danger ? " is-danger" : "") + (confirming ? " is-confirm" : "") + (confirming && warm ? " is-warm" : "")} onClick={onClick} {...rest} {...extra}>
      <span className="gt-hm-ic" aria-hidden style={{ "--ic": color }}><svg width="18" height="18" viewBox="0 0 24 24" aria-hidden>{ICONS[icon] || ICONS.plus}</svg></span>
      <span className="gt-hm-txt">{children}</span>
    </button>
  );
}

function GtHeadButtons({ theme, css, L, onRules, onHome, onEndGame, items, onOpen }) {
  const th = theme === "light" ? "light" : theme === "noir" ? "noir" : "dark";
  const col = COLORS[th];
  const list = Array.isArray(items) ? items.filter(Boolean) : [];
  const [open, setOpen] = React.useState(false);
  const [pos, setPos] = React.useState(null);
  const [confirmEnd, setConfirmEnd] = React.useState(false);
  const faceRef = React.useRef(null);
  const endT = React.useRef(0);
  const close = React.useCallback(() => { clearTimeout(endT.current); setConfirmEnd(false); setOpen(false); }, []);
  const dlgRef = useGtDialog({ open, onClose: close });
  React.useEffect(() => {
    if (!open) return undefined;
    const on = () => close();
    window.addEventListener("resize", on);
    return () => window.removeEventListener("resize", on);
  }, [open]);
  React.useEffect(() => () => clearTimeout(endT.current), []);
  const hasMenu = list.length > 0 || !!onEndGame || !!onRules || !!onHome;
  const toggle = () => {
    if (open) { close(); return; }
    if (onOpen) onOpen();
    const el = faceRef.current;
    const r = el ? el.getBoundingClientRect() : { bottom: 52, right: window.innerWidth - 8 };
    setPos({ top: Math.round(r.bottom + 8), right: Math.max(8, Math.round(window.innerWidth - r.right)), gl: Math.round(r.left), gt: Math.round(r.top), gw: Math.round(r.width || 40), gh: Math.round(r.height || 40) });
    setOpen(true);
  };
  const onKey = (e) => {
    const k = e.key;
    if (k !== "ArrowDown" && k !== "ArrowUp" && k !== "Home" && k !== "End") return;
    const rows = Array.from(e.currentTarget.querySelectorAll('[role="menuitem"]'));
    if (!rows.length) return;
    e.preventDefault();
    const at = rows.indexOf(document.activeElement);
    const next = k === "Home" ? 0 : k === "End" ? rows.length - 1 : k === "ArrowDown" ? (at + 1) % rows.length : (at <= 0 ? rows.length - 1 : at - 1);
    rows[next].focus();
  };
  const endTap = () => {
    if (!confirmEnd) {
      setConfirmEnd(true);
      clearTimeout(endT.current);
      endT.current = setTimeout(() => setConfirmEnd(false), 3000);
      return;
    }
    close();
    onEndGame();
  };
  const itemRow = (it) => {
    const label = it.confirming && it.confirmLabel ? it.confirmLabel : it.label;
    const common = { icon: it.icon || "plus", color: col[it.icon] || col.plus, confirming: !!(it.confirming && it.twoStep), warm: true, danger: !!it.danger };
    if (it.hold) {
      const hp = gtHold(() => { close(); it.hold(); });
      return (
        <GtHmRow key={it.key || it.label} {...common} confirming={false} extra={hp} style={{ "--gt-hold-c": th === "light" ? "rgba(184,111,0,0.22)" : "rgba(240,166,58,0.28)" }}>
          <GtHoldLabel label={it.label} hint={L.hold} again={L.again} />
        </GtHmRow>
      );
    }
    return (
      <GtHmRow key={it.key || it.label} {...common} onClick={() => { if (!it.twoStep || it.confirming) close(); if (it.onClick) it.onClick(); }}>
        <span aria-live="polite">{label}</span>
      </GtHmRow>
    );
  };
  const showGroup = list.length > 0 || !!onEndGame;
  const showTail = true;
  const panel = open && pos && ReactDOM.createPortal(
    <div className={"gt-hm-dim gt-hmt-" + th} onClick={close}>
      <div ref={dlgRef} role="menu" aria-label={L.menu} className="gt-hm-panel" style={{ top: pos.top, right: pos.right, maxHeight: `calc(100vh - ${pos.top + 10}px)` }} onClick={(e) => e.stopPropagation()} onKeyDown={onKey}>
        {showGroup && <div className="gt-hm-h" role="presentation">{L.group}</div>}
        {list.map(itemRow)}
        {onEndGame && (
          <GtHmRow icon="flag" color={col.flag} danger={!confirmEnd} confirming={confirmEnd} onClick={endTap}>
            <span aria-live="polite">{confirmEnd ? L.endConfirm : L.end}</span>
          </GtHmRow>
        )}
        {showGroup && showTail && <div className="gt-hm-sep" role="separator" />}
        {onRules && <GtHmRow icon="rules" color={col.rules} onClick={() => { close(); onRules(); }}>{L.rules}</GtHmRow>}
        <GtHmRow icon="gear" color={col.gear} onClick={() => { close(); window.dispatchEvent(new CustomEvent("gt-open-settings")); }}>{L.settings}</GtHmRow>
        {onHome && <GtHmRow icon="home" color={col.home} onClick={() => { close(); onHome(); }}>{L.home}</GtHmRow>}
      </div>
      <div className="gt-hm-ghost" aria-hidden style={{ left: pos.gl, top: pos.gt, width: pos.gw, height: pos.gh }}><svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg></div>
    </div>,
    document.body
  );
  const sp = { stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", fill: "none" };
  return (
    <div className={"gt-headbtns gt-hmt-" + th} style={{ position: "absolute", top: 0, right: -4, display: "flex", gap: 0, zIndex: 5 }}>
      <style>{css}{GT_HM_CSS}</style>
      <button type="button" onClick={() => window.dispatchEvent(new CustomEvent("gt-cycle-theme"))} className="gt-hb gt-hbn gt-hb-theme" aria-label={L.theme} title={L.theme}>
        <span className="gt-hf"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden><circle cx="12" cy="12" r="8" {...sp} /><path d="M12 4a8 8 0 0 1 0 16Z" fill="currentColor" /></svg></span>
      </button>
      {hasMenu && (
        <button type="button" onClick={toggle} className="gt-hb gt-hbn gt-hb-menu" aria-label={L.menu} title={L.menu} aria-haspopup="menu" aria-expanded={open ? "true" : "false"}>
          <span className="gt-hf" ref={faceRef}><svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden><path d="M4 7h16M4 12h16M4 17h16" {...sp} /></svg></span>
        </button>
      )}
      {panel}
    </div>
  );
}

export { GtHeadButtons, GT_HM_CSS };
