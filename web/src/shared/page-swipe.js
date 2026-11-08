// Seitenwischen wie in den iOS-Einstellungen.
//
// Zwei Wege, eine Bewegung:
//  A) Geste: Finger zieht vom linken Rand (<= 44 px) nach rechts. Die echte Seite (#root) folgt 1:1 mit
//     runder linker Ecke und Schatten, darunter liegt die vorige Seite (statische Kopie), 30 % nach links
//     versetzt und abgedunkelt. Abschluss loest den sichtbaren echten Zurueck-Knopf (.gt-gamehead .gt-hb)
//     aus, damit die App-Logik unveraendert bleibt.
//  B) Uebergang beim Tippen (nur Touch, nicht Laptop mit Maus): setView() ruft gtSwipeBefore/-After.
//
// Keine zweite React-Ansicht: die ausgehende Seite wird beim Wechsel als Kopie (cloneNode, inert,
// aria-hidden, mit Scrollposition) gemerkt, nur die letzten 4 liegen im Stapel.
// Waehrend der Bewegung wird nur transform und opacity gesetzt (direkt am Element, kein State).
// Waehrend die Seite bewegt wird, ist #root "eingefroren" (position:fixed, scrollTop statt Fensterscroll,
// body behaelt die Hoehe), damit position:fixed-Kinder (Eingabe unten) mitlaufen statt zu springen.
//
// Grenzen: nur in Chromium getestet. iOS-Safari/Home-Bildschirm: echtes Geraet noetig (Hoehe 873 vs 932,
// Safe Areas, Gefuehl der Kurve).
import { React } from "../vendor/react-globals.js";

const EASE = "cubic-bezier(.32,.72,0,1)";
const DUR = 320;
const PARALLAX = 0.3;
const DIM = 0.32;
const EDGE = 44;
const DECIDE = 10;
const COMPLETE_FRAC = 0.4;
const COMPLETE_V = 0.35;
const RADIUS = 22;
const MAX_STACK = 4;
const SHADOW = "-6px 0 26px rgba(0,0,0,.3)";

const S = { view: null, stack: [], armed: false, cur: null, g: null, suppress: false, navBack: false, noClickUntil: 0, installed: false, lastW: 0 };

function mq(q) { try { return !!(window.matchMedia && window.matchMedia(q).matches); } catch (_) { return false; } }
function reduced() { return mq("(prefers-reduced-motion: reduce)"); }
function standalone() { try { return navigator.standalone === true || mq("(display-mode: standalone)"); } catch (_) { return false; } }
function isIOS() {
  try {
    const ua = navigator.userAgent || "";
    return /iPhone|iPad|iPod/.test(ua) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
  } catch (_) { return false; }
}
// Safari im Browser geht selbst vom Rand zurueck: dort nicht aktiv. Home-Bildschirm und Android: aktiv.
function gestureEnabled() { return !(isIOS() && !standalone()); }
function isLaptop() { return !!document.querySelector(".gtL-sidebar"); }
function getRoot() { return isLaptop() ? document.querySelector(".gtL-content") : document.getElementById("root"); }
function vhCss() { return standalone() ? "100vh" : "100dvh"; }
function sig() { const d = document.documentElement; return (d.getAttribute("data-gt-theme") || "") + "|" + (d.lang || ""); }
function canSlide() { return !reduced() && mq("(pointer: coarse)") && !isLaptop() && !!getRoot(); }

function injectCss() {
  if (document.getElementById("gt-swipe-css")) return;
  const st = document.createElement("style");
  st.id = "gt-swipe-css";
  st.textContent = ".gt-swipe-snap,.gt-swipe-snap *{animation:none!important;transition:none!important;pointer-events:none!important}"
    + "html[data-gt-swiping],html[data-gt-swiping] *{-webkit-user-select:none;user-select:none}";
  document.head.appendChild(st);
}

function pageBgStyle(root) {
  const pg = root.firstElementChild || root;
  const cs = getComputedStyle(pg);
  let color = cs.backgroundColor;
  if (!color || color === "rgba(0, 0, 0, 0)" || color === "transparent") color = getComputedStyle(document.body).backgroundColor;
  if (!color || color === "rgba(0, 0, 0, 0)" || color === "transparent") color = getComputedStyle(document.documentElement).backgroundColor;
  return { backgroundColor: color, backgroundImage: cs.backgroundImage, backgroundSize: cs.backgroundSize, backgroundPosition: cs.backgroundPosition, backgroundRepeat: cs.backgroundRepeat, backgroundAttachment: cs.backgroundAttachment };
}

function rectOf(root) {
  if (isLaptop()) { const r = root.getBoundingClientRect(); return { left: r.left, top: r.top, width: r.width, height: r.height }; }
  return { left: 0, top: 0, width: window.innerWidth, height: window.innerHeight };
}

function placeBox(box, rect) {
  const s = box.style;
  s.position = "fixed"; s.left = rect.left + "px"; s.top = rect.top + "px"; s.width = rect.width + "px";
  s.height = isLaptop() ? rect.height + "px" : vhCss();
  s.overflow = "hidden"; s.transform = ""; s.opacity = ""; s.boxShadow = ""; s.borderRadius = "";
  s.margin = "0"; s.pointerEvents = "none";
}

// Statische Kopie der Seite (oder nur Hintergrund, wenn clone=false).
function capture(root, withClone) {
  const rect = rectOf(root);
  const box = document.createElement("div");
  box.className = "gt-swipe-snap";
  box.setAttribute("inert", ""); box.setAttribute("aria-hidden", "true");
  Object.assign(box.style, pageBgStyle(root));
  placeBox(box, rect);
  if (withClone) {
    try {
      const laptop = isLaptop();
      const off = laptop ? root.scrollTop : (window.scrollY || 0);
      const clone = root.cloneNode(true);
      clone.removeAttribute("id");
      clone.querySelectorAll("[id]").forEach(n => n.removeAttribute("id"));
      clone.querySelectorAll("[autofocus]").forEach(n => n.removeAttribute("autofocus"));
      const srcC = root.querySelectorAll("canvas"), dstC = clone.querySelectorAll("canvas");
      srcC.forEach((c, i) => { try { const d = dstC[i]; if (d) { d.width = c.width; d.height = c.height; d.getContext("2d").drawImage(c, 0, 0); } } catch (_) {} });
      const srcI = root.querySelectorAll("input,textarea,select"), dstI = clone.querySelectorAll("input,textarea,select");
      srcI.forEach((n, i) => { try { const d = dstI[i]; if (d) d.value = n.value; } catch (_) {} });
      const cs = clone.style;
      cs.position = "absolute"; cs.left = "0"; cs.top = "0"; cs.width = rect.width + "px";
      cs.display = "flex"; cs.flexDirection = "column"; cs.minHeight = "0"; cs.height = "auto"; cs.margin = "0";
      cs.transform = "translateY(" + (-off) + "px)"; cs.overflow = "visible";
      const pg = root.firstElementChild, cpg = clone.firstElementChild;
      if (pg && cpg) { const h = pg.getBoundingClientRect().height; cpg.style.boxSizing = "border-box"; cpg.style.height = h + "px"; cpg.style.minHeight = h + "px"; cpg.style.flex = "none"; }
      box.appendChild(clone);
    } catch (_) {}
  }
  return box;
}

// ---- Einfrieren der echten Seite waehrend der Bewegung ----
function freeze(root) {
  if (isLaptop()) return { restore() {}, scrollTop(v) { try { root.scrollTop = v; } catch (_) {} } };
  const y = window.scrollY || 0;
  const body = document.body, de = document.documentElement;
  const docH = Math.max(de.scrollHeight, body.scrollHeight);
  const prevBodyH = body.style.height;
  const prevCss = root.style.cssText;
  body.style.height = docH + "px";
  const s = root.style;
  s.position = "fixed"; s.top = "0"; s.left = "0"; s.width = "100%"; s.height = vhCss(); s.minHeight = "0"; s.overflow = "hidden";
  s.willChange = "transform";
  root.scrollTop = y;
  const fixed = [];
  if (y > 0) {
    root.querySelectorAll("*").forEach(el => {
      try { if (getComputedStyle(el).position === "fixed") { fixed.push([el, el.style.translate]); el.style.translate = "0 " + y + "px"; } } catch (_) {}
    });
  }
  return {
    scrollTop(v) { root.scrollTop = v; },
    restore() {
      root.style.cssText = prevCss;
      body.style.height = prevBodyH;
      fixed.forEach(([el, t]) => { el.style.translate = t || ""; });
    },
  };
}

// ---- Schichten: oben (bewegt sich nach rechts), unten (Parallax + Abdunkelung) ----
// p = 0: oben bei 0, unten bei -30 %. p = 1: oben ausserhalb rechts, unten bei 0.
function makeLayers(aboveEl, belowEl, root, aboveIsRoot, rect) {
  const W = rect.width;
  const dim = document.createElement("div");
  Object.assign(dim.style, { position: "fixed", left: rect.left + "px", top: rect.top + "px", width: rect.width + "px", height: isLaptop() ? rect.height + "px" : vhCss(), background: "#000", opacity: String(DIM), pointerEvents: "none", zIndex: "2" });
  dim.setAttribute("aria-hidden", "true");
  const frz = freeze(root);
  const liveIsAbove = aboveIsRoot;
  const attached = [];
  [aboveEl, belowEl].forEach(el => { if (el !== root && !el.parentNode) { document.body.appendChild(el); attached.push(el); } });
  document.body.appendChild(dim);
  aboveEl.style.zIndex = "3"; belowEl.style.zIndex = "1";
  if (isLaptop()) { [aboveEl, belowEl].forEach(el => { if (el === root) { el.style.position = "relative"; } }); }
  aboveEl.style.boxShadow = SHADOW;
  aboveEl.style.borderRadius = RADIUS + "px 0 0 " + RADIUS + "px";
  aboveEl.style.overflow = "hidden";
  aboveEl.style.willChange = "transform";
  belowEl.style.willChange = "transform";
  const txA = p => "translate3d(" + (p * W) + "px,0,0)";
  const txB = p => "translate3d(" + (-PARALLAX * W * (1 - p)) + "px,0,0)";
  let anims = [];
  const L = {
    W, frz, dim, aboveEl, belowEl,
    setP(p) {
      p = Math.max(0, Math.min(1, p));
      aboveEl.style.transform = txA(p); belowEl.style.transform = txB(p); dim.style.opacity = String(DIM * (1 - p));
    },
    readP() {
      try {
        const m = new DOMMatrixReadOnly(getComputedStyle(aboveEl).transform);
        return Math.max(0, Math.min(1, m.m41 / W));
      } catch (_) { return 0; }
    },
    stop() { anims.forEach(a => { try { a.cancel(); } catch (_) {} }); anims = []; },
    animateTo(p1, p0, dur, done) {
      L.stop();
      const finish = () => { L.stop(); L.setP(p1); done && done(); };
      const opt = { duration: dur, easing: EASE, fill: "forwards" };
      try {
        L.setP(p0);
        const a = aboveEl.animate([{ transform: txA(p0) }, { transform: txA(p1) }], opt);
        const b = belowEl.animate([{ transform: txB(p0) }, { transform: txB(p1) }], opt);
        const c = dim.animate([{ opacity: DIM * (1 - p0) }, { opacity: DIM * (1 - p1) }], opt);
        anims = [a, b, c];
        a.onfinish = finish;
      } catch (_) { finish(); }
    },
    destroy() {
      L.stop();
      frz.restore();
      [aboveEl, belowEl].forEach(el => {
        el.style.transform = ""; el.style.zIndex = ""; el.style.boxShadow = ""; el.style.borderRadius = ""; el.style.willChange = "";
        if (el === root) { el.style.overflow = ""; if (isLaptop()) el.style.position = ""; }
      });
      attached.forEach(el => { if (el.parentNode) el.parentNode.removeChild(el); placeBox(el, rect); });
      if (dim.parentNode) dim.parentNode.removeChild(dim);
    },
  };
  return L;
}

function finishRunning() {
  const c = S.cur;
  if (c) { S.cur = null; try { c.abort(); } catch (_) {} }
}

// ---- Uebergang beim Tippen ----
export function gtSwipeBefore(from, to) {
  if (S.suppress) { if (S.navBack) S.stack.pop(); return { skip: true }; }
  if (!S.armed || from === to || !canSlide()) return null;
  finishRunning();
  const root = getRoot();
  const top = S.stack[S.stack.length - 1];
  const back = to === "start" || !!(top && top.from === to);
  return { snap: capture(root, true), back, from, to, theme: sig() };
}

export function gtSwipeAfter(plan) {
  if (!plan || plan.skip) return;
  const root = getRoot();
  if (!root) return;
  const rect = rectOf(root);
  let L;
  if (plan.back) {
    S.stack.pop();
    L = makeLayers(plan.snap, root, root, false, rect);
    L.setP(0);
  } else {
    S.stack.push({ from: plan.from, to: plan.to, box: plan.snap, theme: plan.theme, w: window.innerWidth });
    while (S.stack.length > MAX_STACK) S.stack.shift();
    L = makeLayers(root, plan.snap, root, true, rect);
    L.setP(1);
  }
  const back = plan.back;
  const cur = { abort() { L.destroy(); } };
  S.cur = cur;
  // Ein Frame abwarten, damit der Startzustand gemalt ist, dann animieren.
  L.animateTo(back ? 1 : 0, back ? 0 : 1, DUR, () => { if (S.cur === cur) S.cur = null; L.destroy(); });
}

// ---- Geste ----
function visible(el) {
  const r = el.getBoundingClientRect();
  return r.width > 0 && r.height > 0 && r.bottom > 0 && r.top < window.innerHeight;
}
function findBack(root) {
  const list = root.querySelectorAll(".gt-gamehead .gt-hb,[data-gt-back]");
  for (const b of list) if (visible(b) && !b.disabled && !b.closest("[inert],[aria-hidden='true']")) return b;
  return null;
}
function blocked(target) {
  if (document.querySelector('[aria-modal="true"],[role="dialog"],[role="alertdialog"]')) return true;
  for (const n of document.querySelectorAll("[inert]")) if (!n.closest(".gt-swipe-snap")) return true;
  if (S.view === "headsup" && document.documentElement.hasAttribute("data-phone-landscape")) return true;
  const ae = document.activeElement;
  if (ae && /^(INPUT|TEXTAREA|SELECT)$/.test(ae.tagName) && ae.type !== "button" && ae.type !== "checkbox" && ae.type !== "radio") return true;
  if (target && target.closest && target.closest('input,textarea,select,[contenteditable="true"],[role="slider"],[draggable="true"],[data-gt-noswipe],canvas')) return true;
  return false;
}

function sigOf(root) { return root.innerHTML.length + "|" + (document.querySelector('[aria-modal="true"],[role="dialog"]') ? "m" : ""); }

function raf2(fn) { requestAnimationFrame(() => requestAnimationFrame(fn)); }

function onStart(e) {
  if (!gestureEnabled()) return;
  const g0 = S.g;
  if (e.touches.length > 1) { if (g0 && !g0.active) S.g = null; return; }
  const t = e.touches[0];
  const root = getRoot();
  if (!root) return;
  // Greifen waehrend die Seite noch gleitet (nur vor dem Zurueck-Klick): weiter ziehen.
  const cur = S.cur;
  if (cur && cur.grab && !S.suppress) {
    const base = cur.grab();
    if (base != null) { S.g = { id: t.identifier, sx: t.clientX, sy: t.clientY, active: true, base, L: cur.L, back: cur.back, noClick: true, samples: [{ t: performance.now(), x: base * cur.L.W }], root, grabbed: true, fromCur: cur }; document.documentElement.setAttribute("data-gt-swiping", ""); return; }
  }
  const rect = rectOf(root);
  const lx = t.clientX - rect.left;
  if (lx < 0 || lx > EDGE) return;
  if (S.cur) return;
  if (blocked(e.target)) return;
  const back = findBack(root);
  if (!back) return;
  S.g = { id: t.identifier, sx: t.clientX, sy: t.clientY, active: false, back, root, samples: [], rect };
}

function activate(g) {
  const root = g.root, rect = g.rect;
  const navBack = g.back.hasAttribute("data-gt-nav");
  const top = S.stack[S.stack.length - 1];
  const okSnap = navBack && top && top.to === S.view && top.theme === sig() && top.w === window.innerWidth && top.box;
  const under = okSnap ? top.box : capture(root, false);
  if (under.parentNode) under.parentNode.removeChild(under);
  placeBox(under, rect);
  g.navBack = navBack;
  g.L = makeLayers(root, under, root, true, rect);
  g.L.setP(0);
  g.base = 0;
  g.active = true;
  g.under = under;
  document.documentElement.setAttribute("data-gt-swiping", "");
  const cur = {
    L: g.L, back: g.back, abort() { g.L.destroy(); S.g = null; document.documentElement.removeAttribute("data-gt-swiping"); },
    grab() { if (!g.L) return null; const p = g.L.readP(); g.L.stop(); g.L.setP(p); g.releasing = false; return p; },
  };
  g.cur = cur; S.cur = cur;
}

function onMove(e) {
  const g = S.g;
  if (!g) return;
  let t = null;
  for (const x of e.touches) if (x.identifier === g.id) t = x;
  if (!t) return;
  if (e.touches.length > 1 && !g.active) { S.g = null; return; }
  const dx = t.clientX - g.sx, dy = t.clientY - g.sy;
  if (!g.active) {
    if (Math.abs(dx) < DECIDE && Math.abs(dy) < DECIDE) return;
    if (dx > 0 && dx > Math.abs(dy)) {
      if (reduced()) { g.active = true; g.reducedMode = true; g.dx = dx; }
      else activate(g);
    } else { S.g = null; return; }
  }
  if (e.cancelable) e.preventDefault();
  if (g.reducedMode) { g.dx = dx; return; }
  const W = g.L.W;
  const x = Math.max(0, Math.min(W, g.base * W + dx));
  g.L.setP(x / W);
  const now = performance.now();
  g.samples.push({ t: now, x });
  while (g.samples.length > 2 && now - g.samples[0].t > 120) g.samples.shift();
}

function velocity(g) {
  const s = g.samples;
  if (s.length < 2) return 0;
  const a = s[0], b = s[s.length - 1];
  const dt = b.t - a.t;
  return dt > 0 ? (b.x - a.x) / dt : 0;
}

function swallowClick() { S.noClickUntil = performance.now() + 450; }

function onEnd(e, cancelled) {
  const g = S.g;
  if (!g) return;
  let found = false;
  for (const x of e.changedTouches) if (x.identifier === g.id) found = true;
  if (!found) return;
  S.g = null;
  document.documentElement.removeAttribute("data-gt-swiping");
  if (!g.active) return;
  swallowClick();
  if (g.reducedMode) {
    const W = window.innerWidth;
    if (!cancelled && (g.dx > COMPLETE_FRAC * W)) clickBack(g, true);
    return;
  }
  const L = g.L, W = L.W;
  const p = L.readP ? Math.max(0, Math.min(1, (g.samples.length ? g.samples[g.samples.length - 1].x : g.base * W) / W)) : 0;
  const v = velocity(g);
  const complete = !cancelled && (p > COMPLETE_FRAC || v > COMPLETE_V);
  const p1 = complete ? 1 : 0;
  const rem = Math.abs(p1 - p);
  const dur = Math.round(DUR * (0.6 + 0.4 * rem));
  const cur = g.cur || g.fromCur;
  if (g.fromCur) { g.cur = g.fromCur; }
  L.animateTo(p1, p, dur, () => {
    if (complete) clickBack(g, false);
    else { if (S.cur === cur) S.cur = null; L.destroy(); }
  });
}

// Echten Zurueck-Knopf ausloesen; war die Seite danach unveraendert (z. B. Rueckfrage), federt sie zurueck.
function clickBack(g, noLayers) {
  const root = g.root;
  const btn = g.back && g.back.isConnected ? g.back : findBack(root);
  const L = g.L;
  if (!btn) { if (L) { S.cur = null; L.destroy(); } return; }
  if (S.cur && S.cur.grab) S.cur.grab = null;
  const before = sigOf(root);
  const navBack = btn.hasAttribute("data-gt-nav");
  S.suppress = true; S.navBack = navBack;
  try { btn.click(); } finally { S.suppress = false; S.navBack = false; }
  raf2(() => {
    const changed = sigOf(root) !== before;
    if (noLayers) return;
    if (changed) {
      try { L.frz.scrollTop(0); } catch (_) {}
      if (S.cur) S.cur = null;
      L.destroy();
      try { window.scrollTo(0, 0); } catch (_) {}
    } else {
      // Nichts passiert (z. B. Bestaetigungsdialog): sanft zurueck. Stapel wieder auffuellen.
      L.animateTo(0, 1, DUR, () => { if (S.cur) S.cur = null; L.destroy(); });
    }
  });
}

function onClickCapture(e) {
  if (performance.now() < S.noClickUntil && e.isTrusted) { e.preventDefault(); e.stopPropagation(); }
}

function onResize() {
  if (window.innerWidth !== S.lastW) { S.lastW = window.innerWidth; S.stack = []; }
}

function install() {
  if (S.installed) return () => {};
  S.installed = true;
  injectCss();
  S.lastW = window.innerWidth;
  const o1 = { passive: true }, o2 = { passive: false };
  const ts = e => onStart(e), tm = e => onMove(e), te = e => onEnd(e, false), tc = e => onEnd(e, true);
  document.addEventListener("touchstart", ts, o1);
  document.addEventListener("touchmove", tm, o2);
  document.addEventListener("touchend", te, o1);
  document.addEventListener("touchcancel", tc, o1);
  document.addEventListener("click", onClickCapture, true);
  window.addEventListener("resize", onResize);
  return () => {
    S.installed = false;
    document.removeEventListener("touchstart", ts);
    document.removeEventListener("touchmove", tm);
    document.removeEventListener("touchend", te);
    document.removeEventListener("touchcancel", tc);
    document.removeEventListener("click", onClickCapture, true);
    window.removeEventListener("resize", onResize);
  };
}

export function usePageSwipe(view, loaded) {
  React.useEffect(() => { S.view = view; }, [view]);
  React.useEffect(() => {
    if (!loaded) return undefined;
    const off = install();
    const tm = setTimeout(() => { S.armed = true; }, 1200);
    return () => { clearTimeout(tm); off(); finishRunning(); };
  }, [loaded]);
}
