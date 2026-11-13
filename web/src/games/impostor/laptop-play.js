// Laptop-Ansicht der Partyspiele (Spiel, Rollen verteilen, Ergebnis): nutzt die Breite, ordnet in Spalten an.
// Alles unter .gtL-content (nur Laptop-Modus), die Handy-Ansicht bleibt unberuehrt.
// Inhalt fliesst von oben nach unten (keine Knoepfe an den unteren Rand gedrueckt), damit der Auto-Fit
// (shared/laptop-fit.js) den Platz selbst fuellt. Wird einmal beim Laden in den Kopf der Seite eingefuegt.
const G = ".gtL-content .gtL-shellpage .gtL-game";
const S = ".gtL-content .gtL-shellpage :is(.gtL-game.h1l,.h1l-root)";
export const LAPTOP_PLAY_CSS = `
/* Breite Seite fuer die Spiele mit Weitergeben-Ablauf */
${G}:is(.h1l,:has(> .h1l-root)){max-width:min(1060px,calc(100% - 32px)) !important}

/* Weitergeben-Screen (Impostor, Werwolf, Mafia, Verraeter): links Name, rechts die verdeckte Karte */
${S} .gt-pass{max-width:none;margin:0;flex:none;display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1.05fr);grid-template-rows:auto 1fr auto 1fr;column-gap:44px;row-gap:0;align-items:center}
${S} .gt-pass > .gt-pass-bar{grid-column:1 / -1;grid-row:1;margin:4px 0 14px}
${S} .gt-pass > .gt-pass-label{grid-column:1;grid-row:2;align-self:end;margin:0}
${S} .gt-pass > .gt-pass-name{grid-column:1;grid-row:3;align-self:start;font-size:calc(var(--gt-p-fs) * 1.12);margin:8px 0 0}
${S} .gt-pass > .gt-pass-wrap{grid-column:2;grid-row:2 / span 3;flex:none;gap:12px}
${S} .gt-pass-wrap > .gt-flip{flex:none;min-height:340px}
${S} .gt-pass-wrap .gt-u-dock{margin-top:4px}

/* Impostor: Diskussion und Abstimmung zweispaltig */
${S} .h1l-grid{display:grid !important;grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:20px 40px;align-items:start}
${S} .h1l-grid > .g-cat{grid-area:cat}
${S} .h1l-grid > .g-timer{grid-area:timer}
${S} .h1l-grid > .g-list{grid-area:list}
${S} .h1l-grid > .g-btn{grid-area:btn;margin:0;max-width:none !important}
${S} .h1l-grid > .g-hint{grid-area:hint;margin:0}
${S} .h1l-disc{grid-template-areas:"cat list" "timer list" "btn btn" "hint hint"}
${S} .h1l-grid > .g-list{align-self:center}
${S} .h1l-disc > .g-btn{justify-self:center;width:100%;max-width:520px !important}
${S} .h1l-disc > .g-hint{text-align:center}
${S} .h1l-vote{grid-template-areas:"cat list" "hint list";align-items:center}

/* Schritte sind kurz: Inhalt etwas grosszeichnen, den Rest fuellt der Auto-Fit */
${S} :is(.h1l-ctr,.h1l-pick,.h1l-plist,.h1l-vote2,.h1l-over,.h1l-grid){zoom:var(--gtp-z,1.15)}
${S} .gtL-split .h1l-plist{zoom:1}
${S} :is(.h1l-ctr,.h1l-pick,.h1l-plist){margin-top:clamp(0px,5vh,60px)}

/* Zentrierte Schritte: Hauptknopf nicht ueber die ganze Breite */
${S} .h1l-ctr{gap:18px}
${S} .h1l-ctr > .gt-stk{max-width:520px !important;align-self:center}

/* Opfer waehlen: Titel links, Personen in zwei Spalten rechts, Knopf darunter */
${S} .h1l-pick{display:grid !important;grid-template-columns:minmax(0,5fr) minmax(0,7fr);grid-template-areas:"head list" "head btn";align-items:center;gap:16px 40px}
${S} .h1l-pick > :nth-child(1){grid-area:head}
${S} .h1l-pick > :nth-child(2){grid-area:list;display:grid !important;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px}
${S} .h1l-pick > :nth-child(3){grid-area:btn;margin:0;max-width:none !important}

/* Personenlisten (Seherin, Hexe, Arzt, Verraeter-Opfer): Titel oben, Personen in zwei Spalten */
${S} .h1l-plist{display:grid !important;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px 16px !important;align-items:stretch}
${S} .h1l-plist > :first-child{grid-column:1 / -1}
${S} .h1l-plist > button:not(.gt-row){grid-column:1 / -1;justify-self:center}

/* Dorfversammlung / Stadtrat: Titel links, Personen rechts, Knopf unten */
${S} .h1l-vote2{display:grid !important;grid-template-columns:minmax(0,5fr) minmax(0,7fr);grid-template-areas:"head list" "timer list" "btn btn";gap:16px 40px !important;align-items:start;max-width:none !important;margin-left:0 !important}
${S} .h1l-vote2 > :nth-child(1){grid-area:head}
${S} .h1l-vote2 > :nth-child(2){grid-area:timer}
${S} .h1l-vote2 > :nth-child(3){grid-area:list;display:grid !important;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px}
${S} .h1l-vote2 > :nth-child(4){grid-area:btn;max-width:none !important}

/* Spielende: Sieger links, Rollenaufloesung rechts */
${S} .h1l-over{display:grid !important;grid-template-columns:minmax(0,1fr) minmax(0,1fr);grid-template-areas:"icon box" "title box" "txt box" "btn box";grid-template-rows:auto auto auto 1fr;align-items:center;justify-items:center;gap:10px 40px !important;padding-top:4px !important}
${S} .h1l-over > svg,${S} .h1l-over > .g-icon{grid-area:icon;align-self:end}
${S} .h1l-over > .g-title{grid-area:title;align-self:center}
${S} .h1l-over > .g-txt{grid-area:txt}
${S} .h1l-over > .g-box{grid-area:box;max-width:none !important;width:100%;box-sizing:border-box;align-self:center}
${S} .h1l-over > .g-btn{grid-area:btn;align-self:start;margin-top:0 !important;flex-wrap:wrap;justify-content:center}

/* Tabu und HeadsUp: breite Seite, Uebergabe/Zusammenfassung/Ende zweispaltig */
${G}:is(:has(.tb-intro),:has(.tb-play),:has(.tb-sum),:has(.tb-over),:has(.hu-intro),:has(.hu-over),:has(.gtL-headsup-play)){max-width:min(1060px,calc(100% - 32px)) !important}
.gtL-content .tb-intro{display:grid !important;grid-template-columns:minmax(0,1fr) minmax(0,1fr);grid-template-areas:"stand main";gap:8px 44px !important;min-height:0 !important;flex:none !important;align-items:center}
.gtL-content .tb-intro > .tb-stand{grid-area:stand;align-self:center}
.gtL-content .tb-intro > .tb-main{grid-area:main;display:flex !important;flex-direction:column;align-items:center;justify-content:center;gap:14px;text-align:center}
.gtL-content .tb-intro:not(:has(.tb-stand)){grid-template-columns:minmax(0,1fr);grid-template-areas:"main"}
.gtL-content .tb-intro .tb-sp{display:none !important}
.gtL-content .tb-intro .tb-main button{width:100%}
.gtL-content .tb-sum,.gtL-content .tb-over{display:grid !important;grid-template-columns:minmax(0,1fr) minmax(0,1fr);grid-template-areas:"a b";gap:12px 44px !important;min-height:0 !important;flex:none !important;align-items:center;justify-items:center}
.gtL-content .tb-sum-a,.gtL-content .tb-over-a{grid-area:a;display:flex !important;flex-direction:column;align-items:center;gap:12px}
.gtL-content .tb-sum-b,.gtL-content .tb-over-b{grid-area:b;display:flex !important;flex-direction:column;align-items:center;gap:14px;width:100%}
.gtL-content .tb-over-b .reveal-3{max-width:none !important}
.gtL-content .tb-over-b .reveal-4{margin-top:0 !important;flex-wrap:wrap;justify-content:center}
.gtL-content .hu-intro,.gtL-content .hu-over{display:grid !important;grid-template-columns:minmax(0,1fr) minmax(0,1fr);grid-template-areas:"a b";gap:12px 44px !important;min-height:0 !important;flex:none !important;align-items:center;justify-items:center}
.gtL-content .hu-a{grid-area:a;display:flex !important;flex-direction:column;align-items:center;gap:12px}
.gtL-content .hu-b{grid-area:b;display:flex !important;flex-direction:column;align-items:center;gap:14px;width:100%}
.gtL-content .hu-over .hu-b .reveal-3{max-width:none !important}
.gtL-content .hu-over .hu-b .reveal-4{margin-top:0 !important;flex-wrap:wrap;justify-content:center}
.gtL-content .hu-a > :first-child{margin-top:0 !important}
.gtL-content :is(.tb-intro,.tb-sum,.tb-over,.hu-intro,.hu-over){zoom:var(--gtp-z,1.15);margin-top:clamp(0px,5vh,60px)}

/* Eigene Vergroesserung der kurzen Ansichten, nach Fensterhoehe gestaffelt (den Rest fuellt der Auto-Fit) */
.gtL-content{--gtp-z:1.15}
@media (min-height:880px){.gtL-content{--gtp-z:1.3}}
@media (min-height:1000px){.gtL-content{--gtp-z:1.45}}
/* 5 Sekunden und Am ehesten: Spielansicht gross */
.gtL-content .gtL-game:has(.fs-play,.fs-intro,.fs-over,.ml-play,.ml-result,.ml-pick) .gtL-split:not(.gtL-split-setup){zoom:var(--gtp-z,1.15)}
`;
if (typeof document !== "undefined" && !document.getElementById("gt-laptop-play-css")) {
  const st = document.createElement("style");
  st.id = "gt-laptop-play-css";
  st.textContent = LAPTOP_PLAY_CSS;
  document.head.appendChild(st);
}
