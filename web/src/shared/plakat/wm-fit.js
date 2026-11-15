// Ryū: Spieltitel (Molotow-Form) passen immer auf eine Zeile. Zu breite Titel werden verkleinert.
import { React } from "../../vendor/react-globals.js";

const SEL = ".gt-wm, .tt-word, .yz-word, .f7-word";
const MAX = 47, MIN = 22;

function fitAll() {
  try {
    document.querySelectorAll(SEL).forEach((el) => {
      if (!el.isConnected || !el.getClientRects().length) return;
      el.style.removeProperty("--pk-wmfs");
      const host = el.parentElement;
      if (!host) return;
      const avail = Math.min(host.clientWidth || el.clientWidth, el.clientWidth || host.clientWidth);
      if (!avail) return;
      let fs = parseFloat(getComputedStyle(el).fontSize) || MAX;
      const need = el.scrollWidth;
      if (need > avail + 1) {
        fs = Math.max(MIN, Math.floor(fs * (avail - 6) / need));
        el.style.setProperty("--pk-wmfs", fs + "px");
      }
    });
  } catch (e) { /* nur Optik */ }
}

function PkWmFit() {
  React.useEffect(() => {
    let raf = 0;
    const run = () => { if (!raf) raf = requestAnimationFrame(() => { raf = 0; fitAll(); }); };
    run();
    const mo = new MutationObserver(run);
    mo.observe(document.body, { childList: true, subtree: true });
    window.addEventListener("resize", run);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(run).catch(() => {});
    return () => { mo.disconnect(); window.removeEventListener("resize", run); if (raf) cancelAnimationFrame(raf);
      document.querySelectorAll(SEL).forEach((el) => el.style.removeProperty("--pk-wmfs")); };
  }, []);
  return null;
}

export { PkWmFit };
