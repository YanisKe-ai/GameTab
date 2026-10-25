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

/* Startseite */
[data-phone-landscape] .gtL-startmain { overflow: visible !important; justify-content: flex-start !important; flex: 0 0 auto !important; }
[data-phone-landscape] .gtL-startheadpad { padding: calc(var(--pl-sat) + 6px) calc(var(--pl-gutter-r) + 52px) 0 var(--pl-gutter-l) !important; }
[data-phone-landscape] .gtL-headwrap { max-width: none !important; padding-top: 0 !important; }
[data-phone-landscape] .gtL-headwrap > div { flex-direction: row !important; align-items: center !important; justify-content: flex-start !important; text-align: left !important; gap: 14px; }
[data-phone-landscape] .gtL-headwrap > div > div:first-child { margin-bottom: 0 !important; flex: none; }
[data-phone-landscape] .gtL-headwrap .gt-hero-logo { transform: none !important; }
[data-phone-landscape] .gtL-headwrap .gt-hero-logo > div { width: 92px !important; }
[data-phone-landscape] .gtL-headwrap > div > div:last-child { transform: none !important; }
[data-phone-landscape] .gtL-headwrap > div > div:last-child > div:first-child { justify-content: flex-start !important; font-size: 26px !important; }
[data-phone-landscape] .gtL-headwrap > div > div:last-child > div:first-child > span:nth-child(1), [data-phone-landscape] .gtL-headwrap > div > div:last-child > div:first-child > span:nth-child(3) { font-size: 36px !important; }
[data-phone-landscape] .gtL-start .gtL-start-gear { top: calc(var(--pl-sat) + 8px) !important; right: calc(var(--pl-gutter-r) - 2px) !important; width: 44px !important; height: 44px !important; }
[data-phone-landscape] .gtL-startcol { max-width: none !important; margin: 0 !important; width: 100% !important; box-sizing: border-box; padding: 6px var(--pl-gutter-r) 0 var(--pl-gutter-l) !important; display: grid !important; grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); column-gap: 16px; align-items: start; }
[data-phone-landscape] .gtL-startcol > .gtL-startmain-tiles { grid-column: 1; grid-row: 1; transform: none !important; }
[data-phone-landscape] .gtL-startcol > [data-onboard="showcase"] { grid-column: 1 / -1; grid-row: 2; margin-top: 10px !important; }
[data-phone-landscape] .gtL-startcol > .gt-resume, [data-phone-landscape] .gtL-startcol > .gtL-tipcard { grid-column: 2; grid-row: 1; margin-top: 0 !important; }
[data-phone-landscape] .gtL-startcol .gtL-tiles { display: grid; grid-template-columns: minmax(0, 1fr); gap: 8px; margin-top: 0 !important; }
[data-phone-landscape] .gtL-startcol .gtL-tile { margin-bottom: 0 !important; min-height: 56px; padding-top: 6px !important; padding-bottom: 6px !important; }
[data-phone-landscape] .gtL-startcol .gtL-tile-title { font-size: 20px !important; }
[data-phone-landscape] .gtL-startcol .gtL-showcase { margin-top: 6px !important; }
[data-phone-landscape] .gtL-showcase-row { display: grid !important; grid-template-columns: repeat(auto-fill, minmax(88px, 1fr)); gap: 10px 8px !important; overflow: visible !important; scroll-snap-type: none !important; }
[data-phone-landscape] .gtL-showcase-item { width: auto !important; min-height: 76px; padding: 4px 2px !important; }
[data-phone-landscape] .gtL-showcase-label { font-size: 12px !important; opacity: 1 !important; overflow-wrap: anywhere; }
[data-phone-landscape] .gtL-showcase-arrow { display: none !important; }
[data-phone-landscape] .gtL-startfoot { max-width: none !important; padding: 10px var(--pl-gutter-r) calc(var(--pl-sab) + 14px) var(--pl-gutter-l) !important; }
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
[data-phone-landscape] .pl-app .gtL-set-split .gtL-toggle-row > button { flex: 1 1 128px !important; min-width: 0; }
[data-phone-landscape] .pl-app .gtL-set-split { display: grid !important; grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); gap: 0 28px; align-items: start; }
[data-phone-landscape] .pl-app .gtL-set-split > .gtL-col-main, [data-phone-landscape] .pl-app .gtL-set-split > .gtL-col-side { display: block !important; min-width: 0; }

/* Statistik */
[data-phone-landscape] .pl-app .gt-gamehead { position: relative !important; top: auto !important; }
[data-phone-landscape] .pl-app .gtSt2-hl { display: grid !important; grid-template-columns: repeat(2, minmax(0, 1fr)); overflow: visible !important; margin: 0 !important; padding: 0 !important; scroll-snap-type: none; }
[data-phone-landscape] .pl-app .gtSt2-hl > * { min-width: 0; flex: none; }
[data-phone-landscape] .pl-app .gtSt2-seg button { min-height: 44px; }
[data-phone-landscape] .pl-app .gtSt2-sel { min-height: 44px; }
[data-phone-landscape] .pl-app .gtL-split.pl-st-split { display: grid !important; grid-template-columns: minmax(0, 1.15fr) minmax(0, 1fr); gap: 0 22px; align-items: start; }
[data-phone-landscape] .pl-app .pl-st-split > .gtL-col-main, [data-phone-landscape] .pl-app .pl-st-split > .gtL-col-side { display: flex !important; flex-direction: column; min-width: 0; }
`;
