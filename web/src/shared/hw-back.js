// Android- und Browser-Zurueck: eine Ansicht zurueck statt die App zu verlassen.
// Ein Fallen-Eintrag im Verlauf faengt "Zurueck" ab. Offene Dialoge werden zuerst
// mit Escape geschlossen, sonst wird der sichtbare Zurueck-Knopf gedrueckt.
// Auf der Startseite (kein Zurueck-Knopf) verlaesst Zurueck die App wie gewohnt.
// iPhone/iPad: aus, dort gibt es keine Zurueck-Taste und die Wischgeste hat eigene Logik.
import { useEffect } from "../prelude.js";

function isIOS() {
  try {
    const ua = navigator.userAgent || "";
    return /iPhone|iPad|iPod/.test(ua) || (/Macintosh/.test(ua) && navigator.maxTouchPoints > 1);
  } catch (e) { return false; }
}
function shown(el) {
  const r = el.getBoundingClientRect();
  return r.width > 0 && r.height > 0 && r.bottom > 0 && r.top < window.innerHeight;
}
function findBackBtn() {
  const list = document.querySelectorAll(".gt-gamehead .gt-hb,[data-gt-back]");
  for (const b of list) if (shown(b) && !b.disabled && !b.closest("[inert],[aria-hidden='true']")) return b;
  return null;
}
function openDialog() {
  return document.querySelector('[aria-modal="true"],[role="dialog"],[role="alertdialog"]');
}

export function useHardwareBack(loaded) {
  useEffect(() => {
    if (!loaded || isIOS() || !window.history || !history.pushState) return undefined;
    let leaving = false;
    try {
      if (!(history.state && history.state.gtTrap)) history.pushState({ gtTrap: 1 }, "");
    } catch (e) { return undefined; }
    const rearm = () => { try { history.pushState({ gtTrap: 1 }, ""); } catch (e) {} };
    const onPop = () => {
      if (leaving) return;
      if (openDialog()) {
        const ev = new KeyboardEvent("keydown", { key: "Escape", bubbles: true, cancelable: true });
        (document.activeElement || document.body).dispatchEvent(ev);
        rearm();
        return;
      }
      const btn = findBackBtn();
      if (btn) { btn.click(); rearm(); return; }
      // Startseite: App verlassen.
      leaving = true;
      try { history.back(); } catch (e) {}
    };
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, [loaded]);
}
