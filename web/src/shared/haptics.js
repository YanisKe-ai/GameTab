// Haptik app-weit.
// Android und andere: navigator.vibrate (kurze Ticks).
// iPhone (Safari kennt navigator.vibrate nicht): Safari gibt beim Umlegen eines echten
// Schalters (<input type="checkbox" switch>) einen Haptik-Tick. Seit iOS 26.5 nur noch,
// wenn der Finger den Schalter wirklich trifft. Darum liegt in jedem Knopf ein
// unsichtbarer Schalter über der ganzen Fläche. Der Klick landet auf dem Schalter und
// steigt danach normal zum Knopf auf (onClick feuert einmal). Am iPhone mit iOS 27.2.1
// geprüft (Haptik-Testseite, Knöpfe C, E und F).
import { hapticEnabled } from "./sound.js";

const TARGETS = 'button,[role="button"],[data-gt-sound]';
const INTERACTIVE = 'button,[role="button"],a[href],input,select,textarea,label,[contenteditable="true"],[data-gt-sound]';
const HX_CSS = ".gt-hx{position:absolute!important;inset:0!important;width:100%!important;height:100%!important;margin:0!important;padding:0!important;opacity:0.011!important;border:0!important;border-radius:inherit;cursor:pointer;z-index:2147483646;-webkit-appearance:none;appearance:none;background:transparent;-webkit-tap-highlight-color:transparent;}html.gt-hx-off .gt-hx{display:none!important}";

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

function addSwitch(el) {
  // React ersetzt bei reinem Text manchmal den ganzen Inhalt (textContent): dann neu einsetzen.
  if (el.__gtHx && el.__gtHx.parentNode === el) return;
  el.__gtHx = null;
  if (!isLeafTarget(el)) return;
  let pos = "";
  try { pos = getComputedStyle(el).position; } catch (e) {}
  if (pos === "static" || pos === "") el.style.position = "relative";
  const i = document.createElement("input");
  i.type = "checkbox";
  i.setAttribute("switch", "");
  i.className = "gt-hx";
  i.tabIndex = -1;
  i.setAttribute("aria-hidden", "true");
  el.appendChild(i);
  el.__gtHx = i;
}

function scan(root) {
  if (!root || root.nodeType !== 1) return;
  if (root.matches && root.matches(TARGETS)) addSwitch(root);
  root.querySelectorAll && root.querySelectorAll(TARGETS).forEach(addSwitch);
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
  let pending = new Set(), raf = 0;
  const flush = () => { raf = 0; const list = pending; pending = new Set(); list.forEach(scan); };
  const mo = new MutationObserver((muts) => {
    for (const m of muts) {
      m.addedNodes.forEach((n) => { if (n.nodeType === 1 && !(n.classList && n.classList.contains("gt-hx"))) pending.add(n); });
      // Ein Knopf, der jetzt keine inneren Knöpfe mehr hat, bekommt ebenfalls einen Schalter.
      if (m.target && m.target.nodeType === 1 && m.target.closest) { const t = m.target.closest(TARGETS); if (t) pending.add(t); }
    }
    if (!raf) raf = requestAnimationFrame(flush);
  });
  mo.observe(document.body, { childList: true, subtree: true });
  scan(document.body);
}
