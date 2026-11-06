// Gemeinsames Verhalten aller modalen Dialoge und Sheets (Muster: WAI-ARIA APG, Modal Dialog).
// Nutzung: const ref = useGtDialog({ open, onClose }); dann <div ref={ref} role="dialog" aria-modal="true" aria-labelledby=... tabIndex={-1}>.
// Macht: Startfokus ([data-gt-autofocus], sonst erstes Bedienelement, sonst der Dialog selbst), Tab-Schleife,
// Hintergrund inert, Escape schliesst (onClose fehlt oder escape:false = fachlich nicht erlaubt), Fokus zurueck auf den Ausloeser.
// Verschachtelte Dialoge: nur der oberste reagiert, beim Schliessen ist der darunter wieder bedienbar.
import { React } from "../vendor/react-globals.js";

const FOCUSABLE = 'a[href],button:not([disabled]),input:not([disabled]):not([type="hidden"]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"]),[contenteditable="true"]';
const stack = [];

function gtDialogFocusables(root) {
  return Array.from(root.querySelectorAll(FOCUSABLE)).filter((el) => !el.closest("[inert]") && el.getClientRects().length > 0);
}

// Setzt alle Geschwister auf dem Weg vom Dialog bis zu body inert. Gibt die Rueckgabe-Funktion zurueck.
function gtDialogInert(root) {
  const done = [];
  for (let el = root; el && el !== document.body && el.parentElement; el = el.parentElement) {
    Array.from(el.parentElement.children).forEach((sib) => {
      if (sib === el || sib.tagName === "SCRIPT" || sib.tagName === "STYLE" || sib.hasAttribute("inert")) return;
      sib.setAttribute("inert", "");
      done.push(sib);
    });
  }
  return () => done.forEach((n) => n.removeAttribute("inert"));
}

function useGtDialog({ open, onClose, escape = true }) {
  const ref = React.useRef(null);
  const latest = React.useRef({ onClose, escape });
  latest.current = { onClose, escape };
  React.useEffect(() => {
    const root = ref.current;
    if (!open || !root) return undefined;
    const trigger = document.activeElement;
    const entry = { root };
    stack.push(entry);
    const undoInert = gtDialogInert(root);
    if (!root.hasAttribute("tabindex")) root.setAttribute("tabindex", "-1");
    if (!root.contains(document.activeElement)) {
      const start = root.querySelector("[data-gt-autofocus]") || gtDialogFocusables(root)[0] || root;
      try { start.focus({ preventScroll: true }); } catch (_) { /* Fokus ist hier nur Komfort */ }
    }
    const onKey = (e) => {
      if (stack[stack.length - 1] !== entry) return;
      if (e.key === "Escape") {
        const l = latest.current;
        if (l.escape && l.onClose) { e.stopPropagation(); l.onClose(); }
        return;
      }
      if (e.key !== "Tab") return;
      const items = gtDialogFocusables(root);
      if (!items.length) { e.preventDefault(); root.focus(); return; }
      // Reihenfolge selbst steuern: Safari springt von Knopf zu Knopf nicht von allein (Tab nur auf Formularfeldern).
      const first = items[0], last = items[items.length - 1], cur = document.activeElement;
      const at = items.indexOf(cur);
      e.preventDefault();
      if (e.shiftKey) (at <= 0 ? last : items[at - 1]).focus();
      else (at < 0 || at === items.length - 1 ? first : items[at + 1]).focus();
    };
    document.addEventListener("keydown", onKey, true);
    return () => {
      document.removeEventListener("keydown", onKey, true);
      const i = stack.indexOf(entry);
      if (i >= 0) stack.splice(i, 1);
      undoInert();
      if (trigger && trigger.isConnected && trigger !== document.body) {
        try { trigger.focus({ preventScroll: true }); } catch (_) { /* Ausloeser ist nicht mehr fokussierbar */ }
      }
    };
  }, [open]);
  return ref;
}

export { useGtDialog, gtDialogFocusables };
