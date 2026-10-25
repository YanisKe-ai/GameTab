// Handy-Querformat: gekuerzte Namen (Ellipsis) muessen per Tap voll lesbar sein (Hover gibt es auf dem Handy nicht).
// - In Tasten/Zeilen mit Aktion (button, role=button) wird im Querformat umgebrochen statt gekuerzt (CSS unten).
// - Sonst (Tabellenkoepfe, Listen): Tap auf den gekuerzten Text zeigt den ganzen Namen in einer kleinen Blase (role=status).
// Nur aktiv bei [data-phone-landscape]; Hochformat und Laptop unveraendert. Keine Speicherung, kein Einfluss auf Spielzustand.
const POP_ID = "gt-pl-fullname";
const CSS_ID = "gt-pl-names-css";
const PL_NAMES_CSS = `
[data-phone-landscape] :is(button, [role="button"]) [style*="text-overflow: ellipsis"],
[data-phone-landscape] :is(button, [role="button"])[style*="text-overflow: ellipsis"] { white-space: normal !important; overflow: visible !important; text-overflow: clip !important; overflow-wrap: anywhere; min-width: 0; }
#${POP_ID} { position: fixed; z-index: 100000; max-width: min(78vw, 420px); box-sizing: border-box; padding: 8px 12px; border-radius: 12px; background: rgba(18,18,24,0.97); color: #fff; border: 1px solid rgba(255,255,255,0.28); box-shadow: 0 6px 24px rgba(0,0,0,0.45); font: 600 15px/1.3 'Inter', system-ui, sans-serif; overflow-wrap: anywhere; pointer-events: none; }
`;

let timer = null;

function plHideFullName() {
  if (timer) { clearTimeout(timer); timer = null; }
  const el = document.getElementById(POP_ID);
  if (el) el.remove();
}

function plTruncatedAt(target) {
  let el = target && target.nodeType === 1 ? target : target && target.parentElement;
  for (let i = 0; i < 4 && el && el !== document.body; i++, el = el.parentElement) {
    if (el.closest(".gt-gamehead") || el.closest("button, [role=button], a, input, select, textarea")) return null;
    const cs = getComputedStyle(el);
    if (cs.textOverflow === "ellipsis" && el.scrollWidth > el.clientWidth + 1) return el;
  }
  return null;
}

function plShowFullName(el) {
  const text = (el.textContent || "").replace(/\s+/g, " ").trim();
  if (!text) return;
  plHideFullName();
  const pop = document.createElement("div");
  pop.id = POP_ID;
  pop.setAttribute("role", "status");
  pop.textContent = text;
  document.body.appendChild(pop);
  const r = el.getBoundingClientRect();
  const pr = pop.getBoundingClientRect();
  const vw = window.innerWidth, vh = window.innerHeight;
  let left = Math.min(Math.max(8, r.left), vw - pr.width - 8);
  let top = r.bottom + 6;
  if (top + pr.height > vh - 8) top = Math.max(8, r.top - pr.height - 6);
  pop.style.left = left + "px";
  pop.style.top = top + "px";
  timer = setTimeout(plHideFullName, 5000);
}

function plNamesInstall() {
  if (typeof document === "undefined" || window.__gtPlNames) return;
  window.__gtPlNames = true;
  if (!document.getElementById(CSS_ID)) {
    const st = document.createElement("style");
    st.id = CSS_ID;
    st.textContent = PL_NAMES_CSS;
    document.head.appendChild(st);
  }
  document.addEventListener("click", (e) => {
    if (!document.documentElement.hasAttribute("data-phone-landscape")) { plHideFullName(); return; }
    const had = !!document.getElementById(POP_ID);
    const el = plTruncatedAt(e.target);
    if (el) plShowFullName(el);
    else if (had) plHideFullName();
  }, true);
  window.addEventListener("resize", plHideFullName);
  window.addEventListener("scroll", plHideFullName, true);
}

plNamesInstall();

export { PL_NAMES_CSS, plNamesInstall, plHideFullName };
