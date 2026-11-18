// Handy-Querformat (Gruppe B): Startseite, Kategorie- und Variantenauswahl, Einstellungen, Statistik.
// Alles NUR unter [data-phone-landscape]; Hochformat und Laptop bleiben unveraendert.
// Marker-Klassen: pl-app (Seitenhuelle dieser Gruppe), pl-grid2 (zweispaltige Kartenliste), gtL-start* (Startseite).
export const APP_LANDSCAPE_CSS = `
[data-phone-landscape] .pl-app { padding: calc(var(--pl-sat) + 6px) var(--pl-gutter-r) calc(var(--pl-sab) + 20px) var(--pl-gutter-l) !important; min-height: var(--pl-vh) !important; box-sizing: border-box; }
[data-phone-landscape] .pl-app > .gtL-page { max-width: none !important; width: 100% !important; margin: 0 !important; }
[data-phone-landscape] .pl-app .gtL-cards, [data-phone-landscape] .pl-app .pl-grid2 { display: grid !important; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 10px !important; align-items: stretch; }
[data-phone-landscape] .pl-app .gtL-cards > *, [data-phone-landscape] .pl-app .pl-grid2 > * { min-width: 0; }
[data-phone-landscape] .pl-app .gtL-cards > button, [data-phone-landscape] .pl-app .gtL-cards > a, [data-phone-landscape] .pl-app .pl-grid2 > button { min-height: 64px; height: 100%; box-sizing: border-box; }
@media (max-width: 600px) { [data-phone-landscape] .pl-app .gtL-cards, [data-phone-landscape] .pl-app .pl-grid2 { gap: 8px !important; } }

/* Startseite: Entwurf S10 «Mittelachse» (Wahl Yanis, 2026-11-18). Logo mittig, Kategorien als Flügel, darunter Suche mit Zahnrad/Modus, dann Spielreihe. */
[data-phone-landscape] .gtL-start { --s10-sw: min(400px, 48vw); }
[data-phone-landscape] .gtL-startmain { display: grid !important; grid-template-columns: minmax(0, 1fr) minmax(240px, 1.25fr) minmax(0, 1fr); grid-template-rows: minmax(130px, 236px) 44px auto; align-content: center; column-gap: 16px; row-gap: 10px; height: var(--pl-avail, 100vh); padding: calc(var(--pl-sat) + 8px) var(--pl-gutter-r) calc(var(--pl-sab) + 8px) var(--pl-gutter-l) !important; box-sizing: border-box; overflow: visible !important; justify-content: stretch !important; flex: 0 0 auto !important; }
[data-phone-landscape] .gtL-startmain > .pl-hide { display: none !important; }
[data-phone-landscape] .gtL-startheadpad { grid-column: 2; grid-row: 1; padding: 0 !important; display: flex; align-items: center; justify-content: center; min-width: 0; }
[data-phone-landscape] .gtL-headwrap { max-width: none !important; padding-top: 0 !important; width: 100%; }
[data-phone-landscape] .gtL-headwrap > div { flex-direction: column !important; align-items: center !important; justify-content: center !important; text-align: center !important; gap: 4px; }
[data-phone-landscape] .gtL-headwrap > div > div:first-child { margin-bottom: 0 !important; flex: none; width: auto !important; }
[data-phone-landscape] .gtL-headwrap .gt-hero-logo { --hm-w: clamp(200px, 30vw, 300px) !important; margin: 0 !important; }
[data-phone-landscape] .gtL-headwrap .gt-hero-wrap { transform: none !important; }
[data-phone-landscape] .gtL-headwrap > div > div:last-child { transform: none !important; }
[data-phone-landscape] .gtL-startcol, [data-phone-landscape] .gtL-startmain-tiles, [data-phone-landscape] .gtL-startcol .gtL-tiles { display: contents !important; }
[data-phone-landscape] .gtL-startcol .gtL-tiles > div { min-width: 0; height: 100%; }
[data-phone-landscape] .gtL-startcol .gtL-tiles > div:nth-child(1) { grid-column: 1; grid-row: 1; }
[data-phone-landscape] .gtL-startcol .gtL-tiles > div:nth-child(2) { grid-column: 3; grid-row: 1; }
[data-phone-landscape] .gtL-startcol .gtL-tile { height: 100% !important; min-height: 0 !important; width: 100% !important; margin: 0 !important; box-sizing: border-box; flex-direction: column !important; justify-content: center !important; align-items: center !important; gap: 10px !important; padding: 12px 10px !important; text-align: center !important; }
[data-phone-landscape] .gtL-startcol .gtL-tile-iconwrap { margin: 0 !important; }
[data-phone-landscape] .gtL-startcol .gtL-tile > div:not([class]) { flex: none !important; }
[data-phone-landscape] .gtL-startcol .gtL-tile-title { font-size: 19px !important; text-align: center !important; white-space: normal !important; flex: none !important; }
[data-phone-landscape] .gtL-startcol .gtL-tile-chevron { margin: 0 !important; position: static !important; }
[data-phone-landscape] .gtL-startmain-tiles > div:nth-child(2) { grid-column: 1 / -1; grid-row: 2; justify-self: center; width: var(--s10-sw); margin: 0 !important; transform: translateX(52px); }
[data-phone-landscape] .gtL-startcol > .gtL-tipcard, [data-phone-landscape] .gtL-startcol > .gt-resume { display: none !important; }
[data-phone-landscape] .gtL-startcol > [data-onboard="showcase"] { grid-column: 1 / -1; grid-row: 3; margin: 2px 0 0 !important; min-width: 0; }
[data-phone-landscape] .gtL-start .gtL-start-gear { top: var(--s10-gy, -200px) !important; right: auto !important; left: calc(var(--s10-gx, 0px) - 54px) !important; width: 44px !important; height: 44px !important; }
[data-phone-landscape] .gtL-start .gtL-start-gear.gtL-start-theme { display: flex !important; left: calc(var(--s10-gx, 0px) - 106px) !important; }
[data-phone-landscape] .gtL-startcol .gtL-showcase { margin-top: 0 !important; }
[data-phone-landscape] .gtL-showcase .gtL-seclabel { justify-content: center !important; text-align: center; }
[data-phone-landscape] .gtL-showcase-row { display: flex !important; flex-wrap: nowrap !important; gap: 4px !important; -webkit-mask-image: linear-gradient(90deg, #000 calc(100% - 44px), transparent); mask-image: linear-gradient(90deg, #000 calc(100% - 44px), transparent); padding-right: 30px !important; overflow-x: auto !important; overflow-y: hidden !important; scroll-snap-type: x proximity !important; scrollbar-width: none; }
[data-phone-landscape] .gtL-showcase-row::-webkit-scrollbar { display: none; }
[data-phone-landscape] .gtL-showcase-item { flex: 0 0 78px !important; width: 78px !important; min-height: 76px; padding: 4px 2px !important; scroll-snap-align: start; }
[data-phone-landscape] .gtL-showcase-label { font-size: 12px !important; opacity: 1 !important; overflow-wrap: normal !important; word-break: keep-all !important; }
[data-phone-landscape] .gtL-startfoot { max-width: none !important; padding: 0 var(--pl-gutter-r) 0 var(--pl-gutter-l) !important; }
[data-phone-landscape] .gtL-startfoot:empty { display: none !important; }
[data-phone-landscape] .gtL-startfoot p { font-size: 12px !important; }

/* Kopfknopf Statistiken (Kategorieseiten) */
[data-phone-landscape] .pl-app .gtL-statsbtn { margin-top: 0 !important; height: 44px !important; }

/* Einfuehrung (Portal) */
[data-phone-landscape] .gt-onb-overlay { align-items: flex-start !important; overflow-y: auto; overscroll-behavior: contain; padding: calc(var(--pl-sat) + 8px) var(--pl-gutter-r) calc(var(--pl-sab) + 8px) var(--pl-gutter-l) !important; box-sizing: border-box; }
[data-phone-landscape] .gt-onb-card { width: min(560px, 100%) !important; margin: auto !important; }
[data-phone-landscape] .gt-onb-card button { min-height: 44px; }
[data-phone-landscape] .gt-onb-cats { flex-direction: row !important; align-items: stretch; }
[data-phone-landscape] .gt-onb-cats > * { flex: 1 1 0; min-width: 0; }

/* Jahresrueckblick (Portal) */
[data-phone-landscape] .gtYR-card { width: 100% !important; height: 100% !important; aspect-ratio: auto !important; border-radius: 0 !important; box-shadow: none !important; padding-left: var(--pl-sal); padding-right: var(--pl-sar); box-sizing: border-box; }
[data-phone-landscape] .gtYR-card > div[aria-hidden="true"]:not(.gtYR-glow) { padding-top: calc(var(--pl-sat) + 6px) !important; }
[data-phone-landscape] .gtYR-body { padding: 0 var(--pl-gutter-r) calc(var(--pl-sab) + 10px) var(--pl-gutter-l) !important; gap: 6px !important; }
[data-phone-landscape] .gtYR-val { font-size: min(22vh, 96px) !important; margin: 0 !important; }
[data-phone-landscape] .gtYR-val > span { font-size: min(22vh, 96px) !important; }
[data-phone-landscape] .gtYR-body .gtYR-in:not(.gtYR-val):not(.gtYR-big):not(.gtYR-acts) { max-width: none !important; }
[data-phone-landscape] .gtYR-body .gtYR-in[style*="line-height: 1.42"] { font-size: 16px !important; }
[data-phone-landscape] .gtYR-big { font-size: min(9vh, 34px) !important; }
[data-phone-landscape] .gtYR-acts { flex-direction: row !important; margin-top: 4px !important; }
[data-phone-landscape] .gtYR-acts > button { flex: 1 1 0; min-height: 48px !important; }

/* Einstellungen */
[data-phone-landscape] .pl-app .gtL-settings button { min-height: 44px; }
[data-phone-landscape] .pl-app .gtL-set-split .gtL-toggle-row { flex-wrap: wrap; }
[data-phone-landscape] .pl-app .gtL-set-split .gtL-toggle-row > button { flex: 1 1 104px !important; min-width: 0; }
[data-phone-landscape] .pl-app .gtL-set-split { display: grid !important; grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); gap: 0 28px; align-items: start; }
[data-phone-landscape] .pl-app .gtL-set-split > .gtL-col-main, [data-phone-landscape] .pl-app .gtL-set-split > .gtL-col-side { display: block !important; min-width: 0; }

/* Statistik */
[data-phone-landscape] .pl-app .gt-gamehead { position: relative !important; top: auto !important; }
[data-phone-landscape] .pl-app .gtSt2-hl { display: grid !important; grid-template-columns: repeat(2, minmax(0, 1fr)); overflow: visible !important; margin: 0 !important; padding: 0 !important; scroll-snap-type: none; }
[data-phone-landscape] .pl-app .gtSt2-hl > * { min-width: 0; flex: none; }
[data-phone-landscape] .pl-app .gtSt2-seg button { min-height: 44px; }
[data-phone-landscape] .pl-app .gtSt2-sel { min-height: 44px !important; height: auto; }
[data-phone-landscape] .pl-app .gtSt2-sel > * { min-height: 44px; box-sizing: border-box; }
[data-phone-landscape] [data-onboard="search"] input { min-height: 44px; box-sizing: border-box; }
[data-phone-landscape] .pl-app .gtL-split.pl-st-split { display: grid !important; grid-template-columns: minmax(0, 1.15fr) minmax(0, 1fr); gap: 0 22px; align-items: start; }
[data-phone-landscape] .pl-app .pl-st-split > .gtL-col-main, [data-phone-landscape] .pl-app .pl-st-split > .gtL-col-side { display: flex !important; flex-direction: column; min-width: 0; }

/* Statistik: Touchziele, volle Namen ohne Abschneiden (Handy hat kein Hover) */
[data-phone-landscape] .pl-app .gtSt2-btn { min-height: 44px !important; }
[data-phone-landscape] .pl-app .gtSt2-nm { white-space: normal !important; overflow: visible !important; text-overflow: clip !important; overflow-wrap: break-word; }
[data-phone-landscape] .pl-app .gtSt2-pod div[dir="auto"] { -webkit-line-clamp: 4 !important; }
[data-phone-landscape] .pl-app .gtSt2-achv { grid-template-columns: repeat(auto-fill, minmax(104px, 1fr)) !important; }

/* Regel-/Datenschutz-Blatt (RulesSheet) */
[data-phone-landscape] .gt-rules-box { max-height: calc(var(--pl-vh) - var(--pl-sat) - 8px) !important; width: min(620px, calc(100% - var(--pl-sal) - var(--pl-sar))) !important; max-width: none !important; padding-left: 22px !important; padding-right: 22px !important; }
/* Sehr kurze Handys im Hochformat (z. B. 320x568): Tipp-Karte weglassen, bei laufender Partie auch die Spieleleiste, sonst ragen sie unter die Fusszeile. */
/* Sehr schmale Handys: Knopf Statistiken nur als Symbol, sonst verdeckt er den Titel der Kategorieseite. */
@media (max-width: 360px) { .gtL-statsbtn-txt { display: none; } .gtL-statsbtn { padding: 0 11px !important; } }
@media (max-height: 600px) and (max-width: 480px) { html:not([data-phone-landscape]) .gtL-startcol > .gtL-tipcard, html:not([data-phone-landscape]) .gtL-startcol:has(.gt-resume) .gtL-showcase { display: none !important; } }
`;

// Einmal ins <head> setzen (idempotent), damit kein <style> im App-Baum die Geschwister-Reihenfolge veraendert.
try {
  if (typeof document !== "undefined" && !document.getElementById("gt-pl-app-css")) {
    const el = document.createElement("style");
    el.id = "gt-pl-app-css";
    el.textContent = APP_LANDSCAPE_CSS;
    document.head.appendChild(el);
  }
} catch (_) {}
