// Laptop-Seitenleiste «Spielerbank» (2026-11-16): schmale, immer sichtbare Leiste mit runden Knöpfen.
// Oben Drache (Startseite), dann Start, Schreibunterlagen, Partyspiele, Statistik; darunter die laufenden Spiele als
// runde Sticker mit Status-Punkt (nur dieser Bereich scrollt); unten Einstellungen. Namen erscheinen als Fähnchen
// rechts neben dem Knopf (Maus und Tastaturfokus), für Hilfsmittel stehen sie als aria-label am Knopf.
// Nur im Laptop-Modus eingebunden, die Handy-Ansicht ist nicht betroffen.
import { React } from "../vendor/react-globals.js";
import { GameIcon } from "../assets/icons.js";
import { GtHeroDragon } from "../shared/hero-mark.js";

const RAIL_W = 92;

function railTipShow(e) {
  const el = e.target && e.target.closest ? e.target.closest("[data-tip]") : null;
  const tip = document.getElementById("gtL-tip");
  if (!tip || !el) return;
  const r = el.getBoundingClientRect();
  tip.textContent = el.getAttribute("data-tip");
  tip.style.top = r.top + r.height / 2 + "px";
  tip.style.left = r.right + 10 + "px";
  tip.setAttribute("data-on", "1");
}
function railTipHide() {
  const tip = document.getElementById("gtL-tip");
  if (tip) tip.removeAttribute("data-on");
}

function railIcon(id, size) {
  const st = { flexShrink: 0 };
  if (id === "stats") return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.9} strokeLinecap="round" strokeLinejoin="round" style={st} aria-hidden="true"><path d="M5 20V11M12 20V5M19 20v-7" /></svg>;
  if (id === "start") return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.9} strokeLinecap="round" strokeLinejoin="round" style={st} aria-hidden="true"><path d="M3.5 10.5 12 3.5l8.5 7" /><path d="M5.5 9v11h4.5v-6h4v6h4.5V9" /></svg>;
  const name = id === "category-scorepads" ? "catPencil" : id === "category-party" ? "catMask" : "settingsGear";
  return <GameIcon name={name} size={size} color="currentColor" />;
}

function GtRail({ theme, lt, nav, activeNav, running, view, goTo, goToV }) {
  const btn = (id, label, extra) => {
    const active = activeNav === id;
    return <button key={id} type="button" onClick={() => goTo(id)} data-tip={label} aria-label={label} aria-current={active ? "page" : undefined} data-onboard={id === "settings" ? "settings" : undefined} className={"gtL-rb press-fx" + (extra ? " " + extra : "")}>{railIcon(id, 26)}</button>;
  };
  return <nav className="gtL-sidebar" aria-label={lt("mainMenu")} data-rail="1" onMouseOver={railTipShow} onMouseLeave={railTipHide} onFocus={railTipShow} onBlur={railTipHide}>
    <button type="button" onClick={() => goTo("start")} className="gtL-side-brand gtL-rb press-fx" aria-label="GameTab" data-tip="GameTab"><GtHeroDragon theme={theme} width={128} className="gtL-side-dragon" /></button>
    <div className="gtL-rail-main">{nav.map(item => btn(item.id, item.label))}</div>
    {running.length > 0 && <div className="gtL-rail-run" role="group" aria-label={lt("runningGames")}>
      <div className="gtL-rail-runlist">{running.map(g => {
        const on = view === g.id || (g.id === "cricket-run" && view === "cricket");
        return <button key={g.id} type="button" onClick={() => goToV(g.id)} data-tip={g.label} aria-label={g.label} aria-current={on ? "page" : undefined} className="gtL-rb gtL-rb-run press-fx">
          <span className="gtL-rb-logo">{g.logo}</span>
          <span className="gtL-rb-dot" aria-hidden="true" style={{ "--dot": g.accent }} />
        </button>;
      })}</div>
    </div>}
    <div className="gtL-rail-gap" />
    {btn("settings", lt("settings"), "gtL-rb-foot")}
    <span id="gtL-tip" className="gtL-tip" role="presentation" />
  </nav>;
}

export { GtRail, RAIL_W };
