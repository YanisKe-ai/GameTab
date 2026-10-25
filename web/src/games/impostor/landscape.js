// Handy-Querformat fuer Impostor, Werwolf, Mafia und Verraeter (gemeinsame Querformat-Styles).
// Alles NUR unter [data-phone-landscape]; Hochformat und Laptop bleiben unveraendert.
// Wurzelklasse "h1l" sitzt am Spielcontainer (gtL-game). Private Rollen werden hier nur umgeordnet, nie sichtbar gemacht.
const H1L = "[data-phone-landscape] .h1l";
const H1L_HEAD = ":is(.h1l .gt-gamehead, .gt-gamehead.h1l-head)";
export const H1_LANDSCAPE_CSS = `
[data-phone-landscape] .gtL-game.h1l { max-width: none !important; width: 100% !important; margin: 0 !important; box-sizing: border-box; padding: 0 var(--pl-gutter-r) calc(var(--pl-sab) + 8px) var(--pl-gutter-l); }
[data-phone-landscape] .gtL-shellpage:has(.h1l), [data-phone-landscape] .gtL-shellpage:has(.h1l-root) { padding: max(var(--pl-sat), 8px) 0 0 !important; }
[data-phone-landscape] .gtL-game:has(> .h1l-root) { max-width: none !important; width: 100% !important; margin: 0 !important; box-sizing: border-box; padding: 0 var(--pl-gutter-r) calc(var(--pl-sab) + 8px) var(--pl-gutter-l); }

/* Kompakter Kopf (nur falls der gemeinsame GameHeader noch nicht kompakt ist) */
[data-phone-landscape] .gtL-game:is(.h1l, :has(> .h1l-root)) .gt-gamehead { display: flex; align-items: center; gap: 10px; min-height: var(--pl-head); max-height: 52px; box-sizing: border-box; padding-top: 2px; padding-bottom: 2px; margin-bottom: 6px; }
[data-phone-landscape] .gtL-game:is(.h1l, :has(> .h1l-root)) .gt-gamehead > div:first-of-type { margin-bottom: 0 !important; flex: none; order: 0; }
[data-phone-landscape] .gtL-game:is(.h1l, :has(> .h1l-root)) .gt-gamehead > div:nth-of-type(n+2):not(.gt-headbtns) { flex: 1 1 auto; min-width: 0; order: 1; }
[data-phone-landscape] .gtL-game:is(.h1l, :has(> .h1l-root)) .gt-gamehead > .gt-headbtns { position: static !important; order: 2; flex: none; margin-left: auto; }
[data-phone-landscape] .gtL-game:is(.h1l, :has(> .h1l-root)) .gt-gamehead h1 { font-size: 20px !important; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }

/* Zweispalter (Setup, Verraeter Tag/Nacht): dieselben Wrapper wie im Laptop-Modus */
[data-phone-landscape] .h1l .gtL-split, [data-phone-landscape] .h1l-root .gtL-split { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); gap: var(--pl-gap) calc(var(--pl-gap) + 4px); align-items: start; }
[data-phone-landscape] .h1l .gtL-col-main, [data-phone-landscape] .h1l .gtL-col-side, [data-phone-landscape] .h1l-root .gtL-col-main, [data-phone-landscape] .h1l-root .gtL-col-side { display: flex; flex-direction: column; gap: 14px; min-width: 0; }

/* Private Uebergabe: links Name und Fortschritt, rechts die verdeckte Karte (Rolle bleibt bis zum Halten unsichtbar) */
[data-phone-landscape] .h1l .gt-handover, [data-phone-landscape] .h1l-root .gt-handover { display: grid !important; grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); column-gap: calc(var(--pl-gap) + 8px); row-gap: 8px; align-content: center; min-height: max(200px, calc(var(--pl-body) - 22px)) !important; text-align: center; }
[data-phone-landscape] .h1l .gt-handover > :not(:last-child), [data-phone-landscape] .h1l-root .gt-handover > :not(:last-child) { grid-column: 1; align-self: center; }
[data-phone-landscape] .h1l .gt-handover > div:not(:last-child):empty, [data-phone-landscape] .h1l-root .gt-handover > div:not(:last-child):empty { display: none; }
[data-phone-landscape] .h1l .gt-handover > :last-child, [data-phone-landscape] .h1l-root .gt-handover > :last-child { grid-column: 2; grid-row: 1 / span 6; align-self: center; min-height: 0; }
[data-phone-landscape] .gt-handover > :last-child > div:empty { display: none; }
[data-phone-landscape] :is(.h1l, .h1l-root) .gt-flip-face { min-height: 150px; }
[data-phone-landscape] :is(.h1l, .h1l-root) .gt-flip-front { padding: 12px; }
[data-phone-landscape] :is(.h1l, .h1l-root) .gt-hold-next { min-height: 48px !important; }

[data-phone-landscape] :is(.h1l, .h1l-root) .gt-flip-back { padding: 8px 10px; }
[data-phone-landscape] :is(.h1l, .h1l-root) .gt-flip-back > div { gap: 8px !important; }
[data-phone-landscape] .h1l .gt-flip-back .impostor-file { padding: 14px 16px !important; }
[data-phone-landscape] .h1l-disc .g-cat { display: flex; align-items: baseline; justify-content: center; gap: 10px; }
[data-phone-landscape] .h1l-disc .g-cat > div { margin-top: 0 !important; }
[data-phone-landscape] .h1l-disc .g-timer { padding: 10px !important; }

/* Flache Phasen-Raster: Kinder tragen g-cat/g-timer/g-list/g-btn/g-hint, im Hochformat display: contents (pl-split) */
[data-phone-landscape] .h1l-grid { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); gap: var(--pl-gap) calc(var(--pl-gap) + 4px); align-items: start; }
[data-phone-landscape] .h1l-grid .g-cat { grid-area: cat; }
[data-phone-landscape] .h1l-grid .g-timer { grid-area: timer; }
[data-phone-landscape] .h1l-grid .g-list { grid-area: list; min-height: 0; }
[data-phone-landscape] .h1l-grid .g-btn { grid-area: btn; }
[data-phone-landscape] .h1l-grid .g-hint { grid-area: hint; }
[data-phone-landscape] .h1l-disc { grid-template-areas: "cat list" "timer list" "btn hint"; }
[data-phone-landscape] .h1l-disc .g-list { overflow-y: auto; overscroll-behavior: contain; max-height: max(180px, calc(var(--pl-body) - 40px)); }
[data-phone-landscape] .h1l-vote { grid-template-areas: "cat list" "hint list"; }
[data-phone-landscape] .h1l-vote .g-list.pl-scroll { max-height: max(180px, calc(var(--pl-body) - 8px)); }

/* Mittige Einzelbildschirme (Ergebnis, Gleichstand, Morgen): weniger Luft, volle Breite nutzen */
[data-phone-landscape] .h1l-ctr { gap: 8px !important; padding-top: 4px !important; padding-bottom: 4px !important; }

/* Auswahl-Schritte (Nachtwahl Werwolf/Mafia, Abstimmung): Kopf und Bestaetigen links, Personenliste rechts */
[data-phone-landscape] .h1l-pick { display: grid !important; grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); grid-template-areas: "head list" "btn list"; align-content: start; align-items: start; gap: 10px calc(var(--pl-gap) + 4px) !important; }
[data-phone-landscape] .h1l-pick > :nth-child(1) { grid-area: head; }
[data-phone-landscape] .h1l-pick > :nth-child(2) { grid-area: list; max-height: max(180px, calc(var(--pl-body) - 8px)); overflow-y: auto; overscroll-behavior: contain; }
[data-phone-landscape] .h1l-pick > :nth-child(3) { grid-area: btn; }
[data-phone-landscape] .h1l-vote2 { display: grid !important; grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); grid-template-areas: "head list" "timer list" "timer btn"; align-content: start; align-items: start; gap: 10px calc(var(--pl-gap) + 4px) !important; }
[data-phone-landscape] .h1l-vote2 > :nth-child(1) { grid-area: head; }
[data-phone-landscape] .h1l-vote2 > :nth-child(2) { grid-area: timer; padding: 10px !important; }
[data-phone-landscape] .h1l-vote2 > :nth-child(3) { grid-area: list; max-height: max(180px, calc(var(--pl-body) - 70px)); overflow-y: auto; overscroll-behavior: contain; }
[data-phone-landscape] .h1l-vote2 > :nth-child(4) { grid-area: btn; }

/* Touchflaechen in den Partyspielen mindestens 44 px hoch */
[data-phone-landscape] :is(.h1l, .h1l-root) button { min-height: 44px; }

[data-phone-landscape] .h1l-plist > :last-child { grid-column: 1 / -1; }
/* Verraeter: Uebergabe-Schritt (Name links, verdeckte Karte rechts) */
[data-phone-landscape] .h1l-rev { display: grid !important; grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); grid-template-areas: "lab card" "name card" "note card"; grid-template-rows: auto auto 1fr; align-items: center; column-gap: calc(var(--pl-gap) + 8px); row-gap: 6px; min-height: max(200px, calc(var(--pl-body) - 22px)) !important; }
[data-phone-landscape] .h1l-rev > :nth-child(1) { grid-area: lab; align-self: end; }
[data-phone-landscape] .h1l-rev > :nth-child(2) { grid-area: name; align-self: start; }
[data-phone-landscape] .h1l-rev > :nth-child(3) { grid-area: card; align-self: center; }
[data-phone-landscape] .h1l-rev > :nth-child(4) { grid-area: note; align-self: start; }

/* Spielende: Sieger links, Rollenaufloesung rechts, Aktionen unter dem Titel */
[data-phone-landscape] .h1l-over { display: grid !important; grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); grid-template-areas: "icon box" "title box" "txt box" "btn box"; grid-template-rows: auto auto auto 1fr; align-items: center; justify-items: center; gap: 8px calc(var(--pl-gap) + 4px) !important; padding-top: 4px !important; }
[data-phone-landscape] .h1l-over > svg, [data-phone-landscape] .h1l-over > .g-icon { grid-area: icon; align-self: end; }
[data-phone-landscape] .h1l-over > .g-title { grid-area: title; align-self: center; }
[data-phone-landscape] .h1l-over > .g-txt { grid-area: txt; }
[data-phone-landscape] .h1l-over > .g-box { grid-area: box; max-width: none !important; width: 100%; box-sizing: border-box; max-height: max(180px, calc(var(--pl-body) - 8px)); overflow-y: auto; align-self: start; }
[data-phone-landscape] .h1l-over > .g-btn { grid-area: btn; align-self: start; margin-top: 0 !important; flex-wrap: wrap; justify-content: center; }

/* Zielauswahl der Geheimrollen (Seherin, Hexe, Detektiv, Arzt, Beschuetzer): Personen in zwei Spalten */
[data-phone-landscape] .h1l-plist { display: grid !important; grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); gap: 8px calc(var(--pl-gap) + 4px) !important; align-items: stretch; }
[data-phone-landscape] .h1l-plist > :first-child { grid-column: 1 / -1; }
`;
export { H1L, H1L_HEAD };
