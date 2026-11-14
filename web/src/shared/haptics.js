// Haptik app-weit.
// Android und andere: navigator.vibrate (kurze Ticks).
// iPhone (Safari kennt navigator.vibrate nicht): Safari gibt beim Umlegen eines echten
// Schalters (<input type="checkbox" switch>) einen Haptik-Tick, seit iOS 26.5 aber nur
// durch ein echtes Tippen. Ein Schalter direkt unter dem Finger verhindert jedoch das
// Scrollen. Lösung (am iPhone mit iOS 27.2.1 geprüft, Testseite Liste K): In jedem Knopf
// liegt ein durchsichtiges <label>, verbunden mit EINEM Schalter ausserhalb. Auf einem
// Label kann man wischen und scrollen; ein Tippen legt über das Label den Schalter um
// (Haptik) und steigt normal zum Knopf auf (onClick feuert einmal).
import { hapticEnabled } from "./sound.js";

const SW_ID = "gt-hx-sw";
const TARGETS = 'button,[role="button"],[data-gt-sound]';
const INTERACTIVE = 'button,[role="button"],a[href],input,select,textarea,label,[contenteditable="true"],[data-gt-sound]';
const HX_CSS = ".gt-hx{position:absolute!important;inset:0!important;margin:0!important;padding:0!important;border:0!important;border-radius:inherit;background:transparent!important;cursor:pointer;z-index:2147483646;-webkit-tap-highlight-color:transparent;-webkit-user-select:none;user-select:none;}html.gt-hx-off .gt-hx{display:none!important}#" + SW_ID + "{position:fixed;left:0;bottom:0;width:40px;height:24px;margin:0;opacity:0.011;pointer-events:none;z-index:-1}";

function isTouchIOSWithoutVibrate() {
  try {
    if (typeof navigator === "undefined" || typeof window === "undefined") return false;
    if (typeof navigator.vibrate === "function") return false;
    return (navigator.maxTouchPoints || 0) > 0 && "ontouchstart" in window;
  } catch (e) { return false; }
}

function isLeafTarget(el) {
  if (!el || el.nodeType !== 1) return false;
  if (el.closest("[data-gt-nohaptic]")) return false;
  if (el.disabled || el.getAttribute("aria-disabled") === "true") return false;
  if (el.querySelector(INTERACTIVE)) return false; // innere Knöpfe (z. B. Stern) nicht zudecken
  return true;
}

function addLabel(el) {
  // React ersetzt bei reinem Text manchmal den ganzen Inhalt (textContent): dann neu einsetzen.
  if (el.__gtHx && el.__gtHx.parentNode === el) return;
  el.__gtHx = null;
  if (!isLeafTarget(el)) return;
  let pos = "";
  try { pos = getComputedStyle(el).position; } catch (e) {}
  if (pos === "static" || pos === "") el.style.position = "relative";
  const l = document.createElement("label");
  l.htmlFor = SW_ID;
  l.className = "gt-hx";
  l.setAttribute("aria-hidden", "true");
  el.appendChild(l);
  el.__gtHx = l;
}

function scan(root) {
  if (!root || root.nodeType !== 1) return;
  if (root.matches && root.matches(TARGETS)) addLabel(root);
  root.querySelectorAll && root.querySelectorAll(TARGETS).forEach(addLabel);
}

function syncOff() {
  try { document.documentElement.classList.toggle("gt-hx-off", !hapticEnabled()); } catch (e) {}
}

let started = false;
export function gtHapticsInit() {
  if (started || typeof document === "undefined") return;
  started = true;
  syncOff();
  // Nach jedem Tippen (z. B. Schalter in den Einstellungen) den Zustand neu lesen.
  document.addEventListener("click", () => setTimeout(syncOff, 0), true);
  if (!isTouchIOSWithoutVibrate()) {
    // Android: kurzer Tick für alle Knöpfe ohne eigenen Ton (die haben schon hapticTap).
    document.addEventListener("click", (e) => {
      const el = e.target && e.target.closest && e.target.closest('button,[role="button"]');
      if (!el || el.closest("[data-gt-sound]") || el.closest("[data-gt-nohaptic]")) return;
      if (!hapticEnabled()) return;
      try { navigator.vibrate && navigator.vibrate(8); } catch (err) {}
    }, true);
    return;
  }
  const st = document.createElement("style");
  st.textContent = HX_CSS;
  document.head.appendChild(st);
  const sw = document.createElement("input");
  sw.type = "checkbox";
  sw.setAttribute("switch", "");
  sw.id = SW_ID;
  sw.tabIndex = -1;
  sw.setAttribute("aria-hidden", "true");
  sw.setAttribute("data-gt-keep", "");
  document.body.appendChild(sw);
  let pending = new Set(), raf = 0;
  const flush = () => { raf = 0; const list = pending; pending = new Set(); list.forEach(scan); };
  const mo = new MutationObserver((muts) => {
    for (const m of muts) {
      m.addedNodes.forEach((n) => { if (n.nodeType === 1 && !(n.classList && n.classList.contains("gt-hx"))) pending.add(n); });
      // Ein Knopf, dessen Inhalt React ersetzt hat, bekommt sein Label zurück.
      if (m.target && m.target.nodeType === 1 && m.target.closest) { const t = m.target.closest(TARGETS); if (t) pending.add(t); }
    }
    if (!raf) raf = requestAnimationFrame(flush);
  });
  mo.observe(document.body, { childList: true, subtree: true });
  scan(document.body);
}
