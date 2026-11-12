// Gemeinsamer Bestaetigungsdialog (Paket U3): Titel, Text, bis zu drei Knoepfe mit Verb. Verhalten ueber useGtDialog
// (Fokusfalle, Escape, inert). Der Knopf mit autofocus:true bekommt den Startfokus (immer der harmlose, z. B. Abbrechen).
// actions: [{label, onClick, kind:"primary"|"danger"|"ghost", autofocus, keepOpen, attr}]. Bei mehr als zwei Knoepfen untereinander.
import { React } from "../vendor/react-globals.js";
import { useGtDialog } from "./dialog.js";
import { RADIUS_SM } from "../themes/palette.js";

let uid = 0;

function GtConfirm({ open, title, body, note, actions, onClose, tk, attr }) {
  const ref = useGtDialog({ open: !!open, onClose, outside: false });
  const id = React.useRef(null);
  if (id.current == null) id.current = ++uid;
  if (!open) return null;
  const stack = actions.length > 2;
  const btn = { flex: stack ? "none" : 1, minHeight: 44, borderRadius: RADIUS_SM, fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: "'Inter', sans-serif", padding: "10px 14px", width: stack ? "100%" : undefined };
  const kinds = {
    primary: { border: "none", background: tk.gold, color: "#1A1408" },
    danger: { border: "none", background: "#D6202A", color: "#FFFFFF" },
    ghost: { border: "1.5px solid " + tk.border, background: "transparent", color: tk.ink },
  };
  const extra = attr || {};
  return <div {...extra} style={{ position: "fixed", inset: 0, zIndex: 160, background: "rgba(8,9,12,0.72)", display: "flex", alignItems: "center", justifyContent: "center", padding: 16, boxSizing: "border-box" }}>
    <div ref={ref} role="dialog" aria-modal="true" aria-labelledby={"gt-cf-t" + id.current} aria-describedby={"gt-cf-d" + id.current} tabIndex={-1} className="podium-pop" style={{ width: "100%", maxWidth: 380, maxHeight: "100%", overflowY: "auto", boxSizing: "border-box", background: tk.card, color: tk.ink, border: "1.5px solid " + tk.border, borderRadius: 18, padding: 18, fontFamily: "'Inter', sans-serif", outline: "none", boxShadow: "0 18px 50px rgba(0,0,0,0.5)" }}>
      <h2 id={"gt-cf-t" + id.current} style={{ margin: "0 0 8px", fontSize: 17, fontWeight: 800, overflowWrap: "anywhere" }}>{title}</h2>
      <div id={"gt-cf-d" + id.current}>
        <p style={{ margin: 0, fontSize: 14, lineHeight: 1.5, color: tk.ink, overflowWrap: "anywhere" }}>{body}</p>
        {note ? <p role="status" style={{ margin: "10px 0 0", fontSize: 13, fontWeight: 700, color: tk.gold }}>{note}</p> : null}
      </div>
      <div style={{ display: "flex", flexDirection: stack ? "column" : "row", gap: 8, marginTop: 16 }}>
        {actions.map((a, i) => <button key={i} type="button" {...(a.autofocus ? { "data-gt-autofocus": "" } : {})} {...(a.attr || {})} className="press-fx" onClick={a.onClick} style={{ ...btn, ...(kinds[a.kind] || kinds.ghost) }}>{a.label}</button>)}
      </div>
    </div>
  </div>;
}

export { GtConfirm };
