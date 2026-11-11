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
.gtL-content .gtL-game:has(> .gtL-party-su) .gt-gamehead{margin-bottom:6px}
.gtL-content .gtL-game:has(> .gtL-party-su) .gt-gamehead > h1.gt-wm{margin:-54px 0 0;pointer-events:none}
.gtL-content .gtL-party-su.gtP-su-top > .gtL-split.gtL-split-setup{grid-template-columns:minmax(0,1fr) minmax(0,1fr);max-width:880px;width:100%;margin-left:auto;margin-right:auto}
.gtL-content div.gtL-party-su.gtP-su-top:has(> .gtL-split-setup){padding-top:28px}
`;
