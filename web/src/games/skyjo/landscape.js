// Handy-Querformat fuer Gruppe D (Skyjo, Flip 7, Tutto, Phase 10, Romme, Freies Spiel).
// Alles NUR unter [data-phone-landscape]; ausserhalb (Hochformat, Laptop) sind die Huellen display: contents,
// das Layout bleibt pixelgleich. Doku: CLAUDE.md "Querformat".
// Bausteine: .pld (Seitencontainer), .pld-shell (Seitenhintergrund), .pld-split (Zweispalter, Uebersicht links, Eingabe rechts),
// .pld-setup (Einrichtung: Spieler links, Ziel und Start rechts), .pld-entry (Rundeneingabe mit festem Fuss), .pld-body / .pld-foot.
const PLD_CSS = `
.pld-body, .pld-foot { display: contents; }
[data-phone-landscape] .pld-shell { padding: calc(var(--pl-sat) + 4px) 0 0 !important; min-height: 0 !important; }
[data-phone-landscape] .pld { display: flex; flex-direction: column; height: calc(var(--pl-avail) - var(--pl-sat) - 4px - var(--pl-sab)); min-height: 0; }
[data-phone-landscape] .pld .gt-gamehead { position: relative !important; top: auto !important; flex: none; }
[data-phone-landscape] .pld > div:has(> .pld-split) { flex: 1 1 0; min-height: 0; box-sizing: border-box; padding-bottom: 4px; }
[data-phone-landscape] .pld-split { display: grid; grid-template-columns: minmax(0, var(--pld-l, 5fr)) minmax(0, var(--pld-r, 6fr)); grid-template-rows: minmax(0, 1fr); gap: var(--pl-gap); align-items: stretch; width: 100%; box-sizing: border-box; flex: 1 1 0; min-height: 0; }
[data-phone-landscape] .pld-split > :is(.gtL-col-main, .gtL-col-side) { display: block; min-width: 0; min-height: 0; box-sizing: border-box; overflow-y: auto; overscroll-behavior: contain; -webkit-overflow-scrolling: touch; }
[data-phone-landscape] .pld-split > .gtL-col-side2 { display: block; min-width: 0; box-sizing: border-box; }
[data-phone-landscape] .pld-split:not(.pld-setup) > .gtL-col-side { order: -1; }
[data-phone-landscape] .pld-split > .gtL-col-main:has(.pld-entry) { display: flex; flex-direction: column; overflow: visible; }
[data-phone-landscape] .pld-split > .gtL-col-main:has(.pld-entry) > div { flex: 1 1 auto; min-height: 0; display: flex; flex-direction: column; }
[data-phone-landscape] .pld-setup { --pld-l: 1fr; --pld-r: 1fr; }
[data-phone-landscape] .pld-split.pld-rows { grid-template-rows: minmax(0, 1fr) auto; }
[data-phone-landscape] .pld-split.pld-rows > .gtL-col-side { grid-column: 1; grid-row: 1; order: 0; }
[data-phone-landscape] .pld-split.pld-rows > .gtL-col-main { grid-column: 2; grid-row: 1 / span 2; }
[data-phone-landscape] .pld-split.pld-rows > .gtL-col-side2 { grid-column: 1; grid-row: 2; max-height: 42vh; max-height: calc(var(--pl-avail) * 0.42); overflow-y: auto; overscroll-behavior: contain; }
[data-phone-landscape] .pld-split.pld-rows > .gtL-col-side2 > div:first-child { margin-top: 6px !important; }
[data-phone-landscape] .pld-wordmark { display: none; }
[data-phone-landscape] .pld-split.pld-free { grid-template-rows: auto minmax(0, 1fr); }
[data-phone-landscape] .pld-split.pld-free > .gtL-col-side { overflow: visible; }
[data-phone-landscape] .pld-split.pld-free > .gtL-col-side2 { max-height: none; min-height: 0; }
[data-phone-landscape] .pld-split > .gtL-col-main:has(.tutto-card) { padding: 0 10px 14px 0; }
[data-phone-landscape] .pld .tutto-card button.gt-hit { min-width: 44px; }
[data-phone-landscape] .pld .tutto-card input { min-height: 44px; box-sizing: border-box; }
[data-phone-landscape] .pld .gtL-standings, [data-phone-landscape] .pld .gtL-e-only { display: block !important; padding: 10px 12px 6px !important; margin: 0 0 10px !important; }
[data-phone-landscape] .pld .gtL-standings li { padding-top: 6px !important; padding-bottom: 6px !important; }
[data-phone-landscape] .pld-entry { display: flex; flex-direction: column; flex: 1 1 auto; min-height: 0; }
[data-phone-landscape] .pld-entry > .pld-body { display: flex; flex-direction: column; gap: 8px; flex: 1 1 auto; min-height: 0; overflow-y: auto; overscroll-behavior: contain; -webkit-overflow-scrolling: touch; padding-bottom: 2px; }
[data-phone-landscape] .pld-entry > .pld-foot { display: grid; grid-template-columns: minmax(0, 1fr); align-items: center; column-gap: 10px; row-gap: 4px; flex: none; padding-bottom: 4px; }
[data-phone-landscape] .pld-entry > .pld-foot:has(> div:nth-child(2)) { grid-template-columns: minmax(0, 1.4fr) minmax(0, 1fr); }
[data-phone-landscape] .pld-entry > .pld-foot > div:not(:first-child) { text-align: left !important; font-size: 12px !important; line-height: 1.25; }
[data-phone-landscape] .pld-entry .pld-body button[aria-pressed] { min-height: 44px; }
[data-phone-landscape] .pld-entry .gtL-entryrow { padding: 6px 14px !important; }
[data-phone-landscape] .pld-entry .gtL-entryval { font-size: 28px !important; }
[data-phone-landscape] .pld-entry .pld-foot button { min-height: 48px; }
[data-phone-landscape] .pld-entry .pld-foot > div:not(:first-child) { margin-top: 0 !important; }
[data-phone-landscape] .pld-hide { display: none; }
[data-phone-landscape] .pld-p10row { display: grid !important; grid-template-columns: minmax(0, 1fr) auto auto; column-gap: 10px; align-items: center; padding: 8px 12px !important; }
[data-phone-landscape] .pld-p10row > div:first-child { display: contents; }
[data-phone-landscape] .pld-p10row > div:first-child > div { grid-column: 1; grid-row: 1; }
[data-phone-landscape] .pld-p10row > div:first-child > button { grid-column: 2; grid-row: 1; }
[data-phone-landscape] .pld-p10row > button { grid-column: 3; grid-row: 1; min-height: 44px; align-self: center; }
@media (prefers-reduced-motion: reduce) { [data-phone-landscape] .pld * { scroll-behavior: auto !important; } }
`;
export { PLD_CSS };
