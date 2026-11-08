// Handy-Querformat fuer Gruppe D (Skyjo, Flip 7, Tutto, Phase 10, Romme, Freies Spiel).
// Alles NUR unter [data-phone-landscape]; ausserhalb (Hochformat, Laptop) sind die Huellen display: contents,
// das Layout bleibt pixelgleich. Doku: CLAUDE.md "Querformat".
// Bausteine: .pld (Seitencontainer), .pld-shell (Seitenhintergrund), .pld-split (Zweispalter, Uebersicht links, Eingabe rechts),
// .pld-setup (Einrichtung: Spieler links, Ziel und Start rechts), .pld-entry (Rundeneingabe mit festem Fuss), .pld-body / .pld-foot.
const PLD_CSS = `
.pld-body, .pld-foot, .pld-padL, .pld-padR { display: contents; }
[data-phone-landscape] .pld-shell { padding: calc(var(--pl-sat) + 4px) 0 0 !important; min-height: 0 !important; }
[data-phone-landscape] .pld { display: flex; flex-direction: column; height: calc(var(--pl-avail) - var(--pl-sat) - 4px - var(--pl-sab)); min-height: 0; }
[data-phone-landscape] .pld .gt-gamehead { position: relative !important; top: auto !important; flex: none; }
[data-phone-landscape] .pld > .gt-u-col { flex: 1 1 0; min-height: 0; display: flex; flex-direction: column; }
[data-phone-landscape] .gt-ug-ent { gap: 10px; }
[data-phone-landscape] .pld > div:has(> .pld-split), [data-phone-landscape] .pld > .gt-u-col > div:has(> .pld-split) { flex: 1 1 0; min-height: 0; box-sizing: border-box; padding-bottom: 4px; display: flex; flex-direction: column; }
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
/* Romme: Hinweis ausgeblendet (steht in den Regeln), Spielerzeilen zweispaltig, damit 2 Spieler ohne Scrollen passen */
[data-phone-landscape] .rom-body .rom-hint { display: none; }
[data-phone-landscape] .rom-body .rom-hand { padding: 6px 12px !important; }
[data-phone-landscape] .rom-body .rom-hand > span > div:nth-child(2) { font-size: 11px !important; line-height: 1.2; }
[data-phone-landscape] .rom-body .rom-chips button { padding: 6px 12px !important; }
[data-phone-landscape] .rom-body .rom-rows { display: grid !important; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 6px !important; }
[data-phone-landscape] .rom-body .rom-rows > button, [data-phone-landscape] .rom-body .rom-rows > div { min-width: 0; }
[data-phone-landscape] .pld-entry .pld-foot > div:not(:first-child) { margin-top: 0 !important; }
[data-phone-landscape] .pld-hide { display: none; }
[data-phone-landscape] .pld-p10row { display: grid !important; grid-template-columns: minmax(0, 1fr) auto auto; column-gap: 10px; align-items: center; padding: 8px 12px !important; }
[data-phone-landscape] .pld-p10row > div:first-child { display: contents; }
[data-phone-landscape] .pld-p10row > div:first-child > div { grid-column: 1; grid-row: 1; }
[data-phone-landscape] .pld-p10row > div:first-child > button { grid-column: 2; grid-row: 1; }
[data-phone-landscape] .pld-p10row > button { grid-column: 3; grid-row: 1; min-height: 44px; align-self: center; }
[data-phone-landscape] .gtL-padsheet.pld-pad { grid-template-rows: auto auto auto auto; max-width: min(740px, 100%) !important; align-content: start; row-gap: 0; }
[data-phone-landscape] .gtL-padsheet.pld-pad > :first-child { grid-column: 1 / -1; grid-row: 1; }
[data-phone-landscape] .gtL-padsheet.pld-pad > .pld-padL > button:first-child { grid-column: 1 / -1; grid-row: 1; justify-self: center; width: min(44%, 300px) !important; margin: 0 !important; padding-top: 8px !important; padding-bottom: 8px !important; z-index: 1; }
[data-phone-landscape] .gtL-padsheet.pld-pad > .pld-padL > div:nth-of-type(1) { grid-column: 1; grid-row: 2; margin-bottom: 4px !important; }
[data-phone-landscape] .gtL-padsheet.pld-pad > .pld-padL > div:nth-of-type(2) { grid-column: 1; grid-row: 3; margin-bottom: 8px !important; }
[data-phone-landscape] .gtL-padsheet.pld-pad > .pld-padL > div:nth-of-type(3) { grid-column: 1; grid-row: 4; gap: 5px !important; margin-bottom: 0 !important; }
[data-phone-landscape] .gtL-padsheet.pld-pad > .pld-padL > div:nth-of-type(3) > button { padding: 8px 0 !important; }
[data-phone-landscape] .gtL-padsheet.pld-pad > .pld-padR { display: flex; flex-direction: column; grid-column: 2; grid-row: 2 / span 3; min-width: 0; }
[data-phone-landscape] .pld-pad .pld-padR > * { margin-bottom: 8px !important; }
[data-phone-landscape] .pld-pad .pld-padR > button[data-gt-sound="1"] { margin-top: auto; margin-bottom: 0 !important; position: sticky; bottom: 0; }
@media (prefers-reduced-motion: reduce) { [data-phone-landscape] .pld * { scroll-behavior: auto !important; } }
`;
/* Skyjo (neues Layout): Querformat. Links Zeilen, rechts Zahlenblock; Logo und Seitenspalte entfallen. */
const SKL_CSS = `
[data-phone-landscape] .sk-hero { display: none; }
[data-phone-landscape] .sk-split { display: flex; flex-direction: column; flex: 1 1 0; min-height: 0; }
[data-phone-landscape] .sk-split > .gtL-col-main { display: flex; flex-direction: column; gap: 8px; flex: 1 1 0; min-height: 0; }
[data-phone-landscape] .sk-split > .gtL-col-side { display: none; }
[data-phone-landscape] .sk-seg { width: min(300px, 100%); align-self: center; flex: none; }
[data-phone-landscape] .sk-seg button { height: 36px; }
[data-phone-landscape] .sk-entry.gt-ug-ent { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 0.9fr); gap: 12px; flex: 1 1 0; min-height: 0; align-items: stretch; }
[data-phone-landscape] .sk-entry.gt-ug-ent > .sk-body { display: flex; flex-direction: column; gap: 6px; min-height: 0; overflow-y: auto; overscroll-behavior: contain; -webkit-overflow-scrolling: touch; padding-bottom: 4px; }
[data-phone-landscape] .sk-entry.gt-ug-ent > .sk-dock { align-self: end; margin-top: 0 !important; padding-top: 0; gap: 6px; }
[data-phone-landscape] .sk-row { min-height: 56px; padding: 4px 10px; }
[data-phone-landscape] .sk-key { height: 38px; }
[data-phone-landscape] .sk-save, [data-phone-landscape] .sk-ghost { min-height: 46px; }
[data-phone-landscape] .sk-split > .gtL-col-main > .sk-tbl { flex: 1 1 0; min-height: 0; overflow: auto; }
[data-phone-landscape] .sk-flow{display:grid;gap:8px 12px;flex:1 1 0;min-height:0;grid-template-columns:minmax(0,1fr) minmax(0,1fr)}
[data-phone-landscape] .sk-flow .sk-hero{display:none}
[data-phone-landscape] .sk-s1{grid-template-areas:"card tiles" "none tiles" "foot foot";grid-template-rows:auto minmax(0,1fr) auto}
[data-phone-landscape] .sk-s1 .sk-tiles{grid-template-rows:repeat(var(--rows,2),minmax(44px,64px));align-content:start}
[data-phone-landscape] .sk-s1 .sk-card{padding:8px 12px}
[data-phone-landscape] .sk-s1 .sk-q{font-size:18px;margin:3px 0 4px}
[data-phone-landscape] .sk-s1 .sk-qh{font-size:12px;line-height:1.3}
[data-phone-landscape] .sk-s1 .sk-none{align-self:start}
[data-phone-landscape] .sk-s2{grid-template-areas:"strip strip" "who pad" "disp pad" "gbtn pad" "foot foot";grid-template-rows:auto auto auto minmax(0,1fr) auto;grid-template-columns:minmax(0,1fr) minmax(0,0.9fr)}
[data-phone-landscape] .sk-s2 .sk-chip{height:44px}
[data-phone-landscape] .sk-s2 .sk-wl{display:block;font-size:11.5px}
[data-phone-landscape] .sk-s2 .sk-wn{font-size:20px}
[data-phone-landscape] .sk-s2 .sk-dv{font-size:40px}
[data-phone-landscape] .sk-s2 .sk-disp{padding:4px 10px 5px}
[data-phone-landscape] .sk-s2 .sk-gbtn{align-self:start;min-height:44px}
[data-phone-landscape] .sk-s2 .sk-pad3{grid-template-rows:repeat(4,minmax(38px,1fr));gap:5px;align-self:stretch;min-height:0}
[data-phone-landscape] .sk-s2 .sk-pad3 .sk-key{height:auto;min-height:0}
[data-phone-landscape] .sk-flow .sk-foot{margin-top:0}
[data-phone-landscape] .sk-flow .sk-save,[data-phone-landscape] .sk-flow .sk-ghost{min-height:44px}
[data-phone-landscape] .sk-tview{flex:1 1 0;min-height:0}
[data-phone-landscape] .sk-tview .sk-tbl{flex:1 1 0;min-height:0;overflow:auto}
[data-phone-landscape] .sk-sheet { max-width: min(560px, 100%); }
[data-phone-landscape] .sk-slot, [data-phone-landscape] .sk-pick { height: 40px; }
`;
export { PLD_CSS, SKL_CSS };
