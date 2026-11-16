// Laptop-Startseite «N3 Bühne + Leiste» (Wahl Yanis 16.11.2026, ersetzt E1).
// Oben das Logo gross mittig, darunter vier gleich hohe Karten (Weiterspielen/Zuletzt gespielt + Suche, Schreibunterlagen,
// Partyspiele, Tipp), unten alle Spiele als waagrecht scrollbare Reihe wie am Handy. Nur im Laptop-Modus eingehängt.
// Unter 900 px Inhaltsbreite (iPad hoch) zweispaltig gestapelt.
const GT_N3_SEL = ".gtL-content .gtL-start .gtL-n3";
const GT_N3_RYU = 'html[data-gt-skin="plakat"] .gtL-content .gtL-start .gtL-n3';

const GT_LAPTOP_START_CSS = `
${GT_N3_SEL}{flex:1 1 auto;display:flex;flex-direction:column;gap:clamp(14px,2.8vh,28px);width:100%;max-width:1600px;margin:0 auto;padding:clamp(14px,3vh,30px) clamp(24px,3vw,44px) clamp(14px,3vh,28px);box-sizing:border-box;min-height:0;justify-content:stretch!important;overflow:visible!important}
/* Bühne: Logo gross und mittig */
${GT_N3_SEL} .gtL-n3-top{flex:1 1 auto;min-height:0;display:flex;align-items:center;justify-content:center}
${GT_N3_SEL} .gtL-startheadpad{padding:0!important}
${GT_N3_SEL} .gtL-headwrap{max-width:none!important;width:auto!important;margin:0!important;padding:0!important}
${GT_N3_SEL} .gtL-headwrap>*{max-width:none!important}
${GT_N3_SEL} .gtL-e1-sub{font-size:11px!important;letter-spacing:.34em!important;margin-top:8px!important}
/* Vier gleich hohe Karten */
${GT_N3_SEL} .gtL-n3-mid{flex:none;height:clamp(168px,29vh,270px);display:grid;grid-template-columns:minmax(0,.92fr) minmax(0,1fr) minmax(0,1fr) minmax(0,.92fr);gap:clamp(14px,2vw,26px)}
${GT_N3_SEL} .gtL-n3-mid>*{min-width:0;min-height:0}
${GT_N3_SEL} .gtL-n3-card{border-radius:28px;box-sizing:border-box}
${GT_N3_SEL} .gtL-n3-side{display:flex;flex-direction:column;justify-content:center;gap:clamp(10px,1.8vh,16px);padding:clamp(12px,2vh,20px);overflow:hidden}
${GT_N3_SEL} .gtL-n3-side>*{margin:0!important;max-width:none!important;width:100%!important}
${GT_N3_SEL} .gtL-resumerow>div{display:flex!important;flex-direction:column;gap:10px!important}
${GT_N3_SEL} .gtL-resumerow button:not([aria-label]){padding:9px 14px!important}
${GT_N3_SEL} .gtL-resumerow>div>*,${GT_N3_SEL} .gtL-resumerow button:not([aria-label]){width:100%!important;box-sizing:border-box}
/* Läuft ein Spiel, zeigt die Karte nur Weiterspielen (Zuletzt gespielt wäre doppelt und zu eng) */
${GT_N3_SEL} .gtL-resumerow:has(.gt-resume)>div>div:not(.gt-resume){display:none!important}
${GT_N3_SEL} .gtL-tiles{display:contents!important}
${GT_N3_SEL} .gtL-tiles>*{height:100%;min-height:0;margin:0!important}
${GT_N3_SEL} .gtL-tile{height:100%!important;width:100%!important;margin:0!important;flex-direction:column!important;align-items:center!important;justify-content:center!important;gap:clamp(10px,2.2vh,22px)!important;padding:0 16px!important;border-radius:28px!important;box-sizing:border-box;text-align:center}
${GT_N3_SEL} .gtL-tile>div:nth-child(2){flex:none!important}
${GT_N3_SEL} .gtL-tile-chevron{display:none!important}
${GT_N3_SEL} .gtL-tile-iconwrap{width:clamp(54px,9vh,84px)!important;height:clamp(54px,9vh,84px)!important}
${GT_N3_SEL} .gtL-tile-iconwrap svg{width:clamp(28px,4.8vh,44px)!important;height:clamp(28px,4.8vh,44px)!important}
${GT_N3_SEL} .gtL-tile-title{font-size:clamp(19px,3.2vh,30px)!important}
${GT_N3_SEL} .gtL-n3-tip .gtL-tipcard{height:100%;margin:0!important;max-width:none!important;width:100%!important;gap:0!important}
${GT_N3_SEL} .gtL-n3-tip .gtL-tipcard>button{display:none!important}
${GT_N3_SEL} .gtL-n3-tip .gtL-tipcard-body{height:100%;box-sizing:border-box;flex-direction:column!important;align-items:flex-start!important;justify-content:center!important;gap:8px!important;padding:clamp(12px,2.2vh,22px)!important;border-radius:28px!important}
${GT_N3_SEL} .gtL-n3-tip .gtL-tipcard-body>div{height:auto!important;min-height:0!important}
${GT_N3_SEL} .gtL-n3-tip .gtL-tipcard-text{font-size:clamp(13px,2vh,16px)!important;line-height:1.45!important;height:auto!important}
/* Spielreihe unten, waagrecht scrollbar mit Pfeilen */
${GT_N3_SEL} .gtL-n3-shelf{flex:none;padding:clamp(10px,1.8vh,18px) clamp(14px,2vw,24px) clamp(8px,1.4vh,14px)}
${GT_N3_SEL} .gtL-showcase{max-width:none!important;width:100%!important;margin:0!important}
${GT_N3_SEL} .gtL-showcase-row{display:flex!important;flex-wrap:nowrap!important;justify-content:flex-start!important;overflow-x:auto!important;gap:clamp(6px,1.2vw,16px)!important;padding:4px 2px 2px!important;scroll-snap-type:x mandatory;scrollbar-width:none}
${GT_N3_SEL} .gtL-showcase-row::-webkit-scrollbar{display:none}
${GT_N3_SEL} .gtL-showcase-item{flex:none!important;width:clamp(80px,10.5vh,112px)!important;min-width:0!important;gap:8px!important;scroll-snap-align:start}
${GT_N3_SEL} .gtL-showcase-icon{width:clamp(54px,8.6vh,80px)!important;height:clamp(54px,8.6vh,80px)!important}
${GT_N3_SEL} .gtL-showcase-icon svg{width:clamp(30px,4.8vh,44px)!important;height:clamp(30px,4.8vh,44px)!important}
${GT_N3_SEL} .gtL-showcase-label{font-size:clamp(12px,1.7vh,14.5px)!important}
${GT_N3_SEL} .gtL-showcase-arrow{display:flex!important}
${GT_N3_SEL} .gtL-showcase-fade{display:none!important}
${GT_N3_SEL} .gtL-showcase-hint{display:none!important}
/* Ryū: Seitenkarten als schwarze Sticker, Spielreihe auf Schwarz */
${GT_N3_RYU} .gtL-n3-card{background:#1A1716!important;border:2.5px solid #1A1716!important;box-shadow:5px 6px 0 #1A1716}
${GT_N3_RYU} .gtL-n3-shelf .gtL-seclabel,${GT_N3_RYU} .gtL-n3-shelf .gtL-showcase-label{color:#F3EAD3!important}
${GT_N3_RYU} .gtL-n3-side .gtL-seclabel{color:#F3EAD3!important}
${GT_N3_RYU} .gtL-n3-shelf .gtL-showcase-arrow{color:#F3EAD3!important}
${GT_N3_RYU} .gtL-showcase .gtL-showcase-hint{display:none!important}
/* Schmal (iPad hoch): zweispaltig gestapelt */
@container gtl (max-width: 899px){
  ${GT_N3_SEL} .gtL-n3-top{flex:none;padding-top:40px}
  ${GT_N3_SEL} .gtL-n3-mid{height:auto;grid-template-columns:repeat(2,minmax(0,1fr))}
  ${GT_N3_SEL} .gtL-n3-side,${GT_N3_SEL} .gtL-n3-tip{grid-column:1/-1}
  ${GT_N3_SEL} .gtL-tiles>*{height:150px}
}
`;

export { GT_LAPTOP_START_CSS };
