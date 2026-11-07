// Mehr-Menue: Fussknoepfe einer Partie (Neues Spiel, Spieler aendern ...) liegen im Handy-Modus in diesem Fenster,
// geoeffnet ueber die drei Punkte im Kopf (GameHeader onMore/moreLabel). Im Laptop-Modus bleiben sie sichtbar in der Seite.
// Nutzung: const acts=<...Knoepfe...>; in der Seite <div className="gt-foot-acts">{acts}</div>, dazu <GtMoreSheet open onClose label tk theme>{acts}</GtMoreSheet>.
import { React } from "../vendor/react-globals.js";
import { useGtDialog } from "./dialog.js";

const GT_MORE_CSS = `.gt-foot-acts{display:none}
.gtL-content .gt-foot-acts{display:block}
.gtL-content .gt-hb-more{display:none}
.gt-more-sheet button{min-height:48px}`;

function GtMoreSheet({ open, onClose, label, tk, theme, children }) {
  const dlgRef = useGtDialog({ open, onClose });
  return <React.Fragment><style>{GT_MORE_CSS}</style>{open && <div ref={dlgRef} role="dialog" aria-modal="true" aria-label={label} className="gt-more-sheet" style={{ position: "fixed", inset: 0, zIndex: 72, display: "flex", flexDirection: "column", justifyContent: "flex-end", background: "rgba(0,0,0,0.38)" }} onClick={onClose}><div onClick={(e) => e.stopPropagation()} style={{ background: theme === "light" ? "#FFFFFF" : theme === "noir" ? "#111111" : "#1A1D27", borderTop: `1px solid ${tk.border}`, borderRadius: "16px 16px 0 0", boxShadow: "0 -8px 28px rgba(0,0,0,0.3)", padding: "4px 16px calc(16px + env(safe-area-inset-bottom))" }}><div style={{ maxWidth: 480, margin: "0 auto" }}>{children}</div></div></div>}</React.Fragment>;
}

export { GtMoreSheet };
