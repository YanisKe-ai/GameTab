// Laptop-Einrichtung der Partyspiele: kompakter, damit sie bei 1280x800 ohne Scrollen passt.
// Alles unter .gtL-content (nur Laptop-Modus), Handy-Ansicht bleibt unberuehrt.
export const LAPTOP_SU_CSS = `
.gtL-content div.gtL-party-su:has(> .gtL-split-setup){min-height:0;padding-top:0;padding-bottom:12px;gap:0}
.gtL-content .gtL-party-su > .gtL-split-setup{margin-top:0}
.gtL-content .gtL-party-su .gtL-split-setup > .gtL-col-main,.gtL-content .gtL-party-su .gtL-split-setup > .gtL-col-side{padding:12px 20px;gap:8px}
.gtL-content .gtL-party-su > .gtL-split.gtL-split-setup{grid-template-columns:minmax(0,1fr) clamp(400px,54%,620px)}
.gtL-content .gtL-party-su .gt-gp-row{flex-wrap:nowrap;gap:6px}
.gtL-content .gtL-party-su .gt-gp-row > button{padding-left:8px !important;padding-right:8px !important;font-size:12.5px !important;white-space:nowrap}
.gtL-content .gtL-party-su .gtP-cats{grid-template-columns:repeat(3,minmax(0,1fr)) !important}
.gtL-content .gtL-party-su .gtL-split-setup > .imp-side{display:grid !important;grid-template-columns:minmax(0,1fr) minmax(0,1fr);column-gap:14px;row-gap:6px;align-content:start}
.gtL-content .gtL-party-su .imp-side > *{grid-column:1 / -1}
.gtL-content .gtL-party-su .imp-side > :nth-child(2){grid-column:1;grid-row:2}
.gtL-content .gtL-party-su .imp-side > :nth-child(4){grid-column:2;grid-row:2}
.gtL-content .gtL-party-su .imp-side > :nth-child(4) .gt-su-chips{flex-wrap:nowrap !important;gap:6px !important}
.gtL-content .gtL-party-su .imp-side > :nth-child(4) .gt-su-chip{flex:1 1 0 !important;min-width:0 !important;padding-left:0 !important;padding-right:0 !important}
.gtL-content .gtL-party-su .ww-roles{display:grid !important;grid-template-columns:repeat(2,minmax(0,1fr))}
.gtL-content .gtL-party-su .gtP-cats{gap:5px !important}
.gtL-content .gtL-party-su .gtL-split-setup > .gtL-col-side{gap:6px;padding-top:10px;padding-bottom:10px}
.gtL-content .gtL-party-su.gtP-su-top > .gtL-split.gtL-split-setup{grid-template-columns:minmax(0,1fr) minmax(0,1fr);max-width:880px;width:100%;margin-left:auto;margin-right:auto}
.gtL-content div.gtL-party-su.gtP-su-top:has(> .gtL-split-setup){padding-top:28px}
`;
