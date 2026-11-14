// Laptop-Modus: Inhalt füllt das Fenster («scale to fit»). Setzt --gtL-fit (1 bis GT_FIT_MAX) auf
// .gtL-content; das CSS zoomt damit die Seite. Nur Laptop, das Handy ist nie betroffen.
// Rechnet neu bei Ansichtswechsel, Fenstergrösse und deutlicher Inhaltsänderung (z. B. Einrichtung -> Spiel),
// nicht bei jeder kleinen Eingabe (Hysterese), damit nichts springt.
import { useEffect } from "../prelude.js";

const GT_FIT_MAX = 1.25;

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
  const set = (v) => root.style.setProperty("--gtL-fit", String(v));
  set(1);
  const avail = root.clientHeight;
  const nat = gtFitNatural(page);
  if (!avail || !nat) return 1;
  // Grosse Laptops (ab 1400x880) wie bisher mindestens 14 % grösser
  const zBig = window.innerWidth >= 1400 && window.innerHeight >= 880 ? 1.14 : 1;
  const z0 = avail / nat;
  // Lange Seiten (Tabellen) scrollen wie bisher; knapp zu hohe Seiten (bis 13 %) werden leicht verkleinert, damit nichts abgeschnitten ist
  if (z0 < 0.87) return zBig;
  const lo = z0 < 1 ? 0.88 : 1;
  let z = Math.min(GT_FIT_MAX, Math.max(z0 < 1 ? lo : zBig, z0));
  // Kontrolle am echten Ergebnis: läuft die Seite nach dem Zoom über (z. B. absolut platzierte Teile), schrittweise verkleinern
  const over = () => root.scrollHeight - root.clientHeight;
  for (let i = 0; i < 6; i++) {
    set(z.toFixed(3));
    const o = over();
    if (o <= 2) break;
    if (z <= lo) break;
    z = Math.max(lo, z * (root.clientHeight / (root.clientHeight + o)) * 0.995);
  }
  // Läuft es danach immer noch über: knapp (bis 13 %) leicht verkleinern, sonst normale Grösse und scrollen (lange Tabellen)
  let o = over();
  if (o > 2) {
    const k = root.clientHeight / (root.clientHeight + o);
    if (z * k >= 0.87) {
      z = Math.max(0.88, z * k * 0.99);
      set(z.toFixed(3));
      // Bleibt ein Rest durch innere Bildschirmhöhen-Flächen (wachsen mit dem Zoom), zählt der sichtbare Inhalt
      if (over() > 2) z = z0 < 1 ? Math.max(0.88, z0 * 0.995) : zBig;
    } else z = z0 < 1 ? Math.max(0.88, z0 * 0.995) : zBig;
  }
  return Math.floor(z * 100) / 100;
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
      if (nat > av + 2 || nat < av * 0.82 || (root.scrollHeight > av + 2 && root.scrollHeight < av * 1.14)) run();
    };
    try {
      mo = new MutationObserver(() => { clearTimeout(mt); mt = setTimeout(check, 260); });
      mo.observe(root, { childList: true, subtree: true });
    } catch (e) { mo = null; }
    return () => { cancelAnimationFrame(raf); clearTimeout(tm); clearTimeout(mt); window.removeEventListener("resize", onResize); if (mo) mo.disconnect(); };
  }, [active, key]);
}
