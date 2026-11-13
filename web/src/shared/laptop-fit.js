// Laptop-Modus: Inhalt füllt das Fenster («scale to fit»). Setzt --gtL-fit (1 bis GT_FIT_MAX) auf
// .gtL-content; das CSS zoomt damit die Seite. Nur Laptop, das Handy ist nie betroffen.
// Rechnet neu bei Ansichtswechsel, Fenstergrösse und deutlicher Inhaltsänderung (z. B. Einrichtung -> Spiel),
// nicht bei jeder kleinen Eingabe (Hysterese), damit nichts springt.
import { useEffect } from "../prelude.js";

const GT_FIT_MAX = 1.5;

// Natürliche Höhe des Inhalts (ohne min-height:100vh der Seite): tiefster Punkt der sichtbaren Elemente im Fluss
function gtFitNatural(page) {
  const top = page.getBoundingClientRect().top;
  let bottom = 0;
  const LEAF = /^(BUTTON|INPUT|SELECT|TEXTAREA|IMG|SVG|CANVAS|VIDEO|svg)$/;
  const all = page.querySelectorAll("*");
  for (let k = 0; k < all.length; k++) {
    const el = all[k];
    if (el.tagName === "STYLE" || el.tagName === "SCRIPT") continue;
    const leaf = LEAF.test(el.tagName) || (!el.firstElementChild && (el.textContent || "").trim());
    if (!leaf) continue;
    if (el.closest("svg") && el.tagName.toLowerCase() !== "svg") continue;
    const r = el.getBoundingClientRect();
    if (!r.height || !r.width) continue;
    // Elemente in fest oder absolut positionierten Ebenen (Overlays, Deko) zählen nicht
    let x = el, skip = false;
    while (x && x !== page) { const ps = getComputedStyle(x).position; if (ps === "fixed" || ps === "absolute" && x !== el) { skip = true; break; } x = x.parentElement; }
    if (skip) continue;
    bottom = Math.max(bottom, r.bottom);
  }
  const z = parseFloat(getComputedStyle(page).zoom) || 1;
  return Math.max(0, (bottom - top) / z) + 28;
}

function gtFitMeasure(root) {
  const page = root.firstElementChild;
  if (!page) return 1;
  root.style.setProperty("--gtL-fit", "1");
  root.classList.add("gtL-measure");
  const avail = root.clientHeight;
  const natW = page.scrollWidth, availW = root.clientWidth;
  const need0 = gtFitNatural(page);
  if (!avail || !need0) { root.classList.remove("gtL-measure"); return 1; }
  let need = need0;
  const zMinG = 1;
  // Grosse Laptops (ab 1400x880) wie bisher mindestens 14 % grösser
  const zMin = window.innerWidth >= 1400 && window.innerHeight >= 880 ? 1.14 : 1;
  let z = Math.min(GT_FIT_MAX, avail / need);
  if (z < zMin + 0.04) { root.classList.remove("gtL-measure"); return zMin; }
  for (let i = 0; i < 4; i++) {
    root.style.setProperty("--gtL-fit", z.toFixed(3));
    const h = gtFitNatural(page) * z;
    const w = page.scrollWidth;
    if (h <= avail + 1 && w <= availW + 1) break;
    z = Math.max(zMin, z * Math.min(avail / h, availW / Math.max(w, 1)) * 0.995);
  }
  root.classList.remove("gtL-measure");
  return Math.max(zMin, Math.floor(z * 100) / 100);
}

export function useLaptopFit(active, key) {
  useEffect(() => {
    const root = document.querySelector(".gtL-content");
    if (!active || !root) { if (root) root.style.removeProperty("--gtL-fit"); return; }
    let cur = 1, raf = 0, tm = 0, busy = false;
    const run = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        busy = true;
        const z = gtFitMeasure(root);
        cur = z;
        root.style.setProperty("--gtL-fit", String(z));
        root.toggleAttribute("data-gtl-fit", z > 1);
        requestAnimationFrame(() => { busy = false; });
      });
    };
    run();
    const onResize = () => { clearTimeout(tm); tm = setTimeout(run, 120); };
    window.addEventListener("resize", onResize);
    // Inhaltswechsel (Einrichtung -> Spiel, neue Phase): DOM-Änderungen gebündelt prüfen
    let mo = null, mt = 0;
    const check = () => {
      if (busy) return;
      const pg = root.firstElementChild;
      if (!pg) return;
      const nat = gtFitNatural(pg) * cur, av = root.clientHeight;
      if (nat > av + 2 || nat < av * 0.82) run();
    };
    try {
      mo = new MutationObserver(() => { clearTimeout(mt); mt = setTimeout(check, 260); });
      mo.observe(root, { childList: true, subtree: true });
    } catch (e) { mo = null; }
    return () => { cancelAnimationFrame(raf); clearTimeout(tm); clearTimeout(mt); window.removeEventListener("resize", onResize); if (mo) mo.disconnect(); };
  }, [active, key]);
}
