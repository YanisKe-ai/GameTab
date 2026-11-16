// Laptop-Startseite «E1 Zwei Spalten» (Wahl Yanis 16.11.2026).
// Links: Logo oben, darunter Zuletzt gespielt, Suche, Tippkarte (Tippkarte beginnt auf Höhe der untersten Icon-Reihe rechts,
// per --e1-pb aus start.js). Rechts: Schreibunterlagen und Partyspiele gross übereinander, darunter alle Spiele in 6 Spalten.
// Nur im Laptop-Modus eingehängt. Unter 900 px Inhaltsbreite (iPad hoch) wieder einspaltig.
const E = ".gtL-content .gtL-start .gtL-e1";

const GT_LAPTOP_START_CSS = `
${E}{flex:1 1 auto;display:grid;grid-template-columns:minmax(0,41fr) minmax(0,59fr);column-gap:clamp(32px,4.5vw,72px);width:100%;max-width:1480px;margin:0 auto;padding:26px clamp(28px,4vw,64px) 28px;box-sizing:border-box;min-height:0;align-items:stretch;justify-content:stretch!important;overflow:visible!important}
${E} .gtL-e1-l{display:flex;flex-direction:column;min-width:0}
${E} .gtL-e1-r{display:flex;flex-direction:column;gap:clamp(18px,2.6vh,26px);min-width:0;padding-top:64px}
/* Logo: gross und oben */
${E} .gtL-startheadpad{padding:0!important;flex:none}
${E} .gtL-headwrap{max-width:none!important;width:100%!important;margin:0!important;padding:4px 0 0!important}
${E} .gtL-headwrap>*{max-width:none!important}
${E} .gtL-e1-sub{font-size:11px!important;letter-spacing:.34em!important;margin-top:10px!important}
/* Gruppe unten links: gleichmässige Abstände, nach unten geschoben */
${E} .gtL-e1-group{margin-top:auto;padding-top:28px;margin-bottom:var(--e1-pb,0px);display:flex;flex-direction:column;gap:30px}
${E} .gtL-e1-group>*{margin:0!important;max-width:none!important;width:100%!important}
${E} .gtL-resumerow>div{grid-template-columns:minmax(0,1fr)!important;gap:16px!important}
${E} .gtL-e1-tip .gtL-tipcard{margin:0!important;max-width:none!important;width:100%!important}
${E} .gtL-e1-tip>*{margin-top:0!important}
/* Kategorien gross übereinander */
${E} .gtL-tiles{display:grid!important;grid-template-columns:minmax(0,1fr)!important;gap:clamp(16px,2.4vh,24px)!important;max-width:none!important;margin:0!important}
${E} .gtL-tile{padding:clamp(18px,2.8vh,28px) 32px!important;gap:24px!important;border-radius:28px!important}
${E} .gtL-tile-iconwrap{width:clamp(56px,8.4vh,76px)!important;height:clamp(56px,8.4vh,76px)!important}
${E} .gtL-tile-iconwrap svg{width:clamp(28px,4.2vh,38px)!important;height:clamp(28px,4.2vh,38px)!important}
${E} .gtL-tile-title{font-size:clamp(22px,3.4vh,32px)!important}
${E} .gtL-tile-chevron{font-size:32px!important}
/* Alle Spiele: 6 Spalten, grössere Icons */
${E} .gtL-showcase{max-width:none!important;width:100%!important;margin:0!important}
${E} .gtL-showcase-row{display:grid!important;grid-template-columns:repeat(6,minmax(0,1fr))!important;gap:clamp(12px,1.8vh,18px) 8px!important;justify-items:center!important;padding:0!important}
${E} .gtL-showcase-item{width:auto!important;min-width:0!important;gap:8px!important}
${E} .gtL-showcase-icon{width:clamp(56px,7.8vh,70px)!important;height:clamp(56px,7.8vh,70px)!important}
${E} .gtL-showcase-icon svg{width:clamp(32px,4.5vh,40px)!important;height:clamp(32px,4.5vh,40px)!important}
${E} .gtL-showcase-label{font-size:13.5px!important}
/* Niedrige Fenster (z. B. 1000x625): kompakter, Spiele in 8 Spalten (3 Reihen statt 4) */
@media (max-height: 760px){
  ${E}{padding-top:18px;padding-bottom:18px}
  ${E} .gtL-e1-r{padding-top:58px;gap:14px}
  ${E} .gtL-e1-group{gap:18px;padding-top:18px}
  ${E} .gtL-tiles{gap:14px!important}
  ${E} .gtL-tile{padding:14px 26px!important}
  ${E} .gtL-showcase-row{grid-template-columns:repeat(8,minmax(0,1fr))!important;gap:12px 4px!important}
  ${E} .gtL-showcase-icon{width:54px!important;height:54px!important}
  ${E} .gtL-showcase-icon svg{width:30px!important;height:30px!important}
  ${E} .gtL-showcase-label{font-size:12px!important}
  ${E} .gtL-tipcard-body{padding:12px 18px!important}
  ${E} .gtL-tipcard-text{font-size:14px!important;line-height:1.45!important}
}
/* Schmal (iPad hoch): eine Spalte, gewohnte Reihenfolge */
@container gtl (max-width: 899px){
  ${E}{display:flex!important;flex-direction:column;gap:20px;padding-top:20px}
  ${E} .gtL-e1-l,${E} .gtL-e1-r,${E} .gtL-e1-group{display:contents}
  ${E} .gtL-startheadpad{order:1;padding-top:30px!important}
  ${E} .gtL-resumerow{order:2}
  ${E} .gtL-tiles{order:3;grid-template-columns:repeat(2,minmax(0,1fr))!important}
  ${E} [data-onboard="search"]{order:4}
  ${E} .gtL-showcase{order:5}
  ${E} .gtL-e1-tip{order:6}
  ${E} .gtL-showcase-row{grid-template-columns:repeat(auto-fill,minmax(92px,1fr))!important}
}
`;

export { GT_LAPTOP_START_CSS };
