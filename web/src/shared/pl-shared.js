// Handy-Querformat: gemeinsame Bausteine (Kopf, Regeln-Dialog, Ziffernfeld-Dialoge, Startleiste, Podest, Exportvorschau).
// Alles NUR unter [data-phone-landscape]. Hochformat und Laptop bleiben unveraendert.
// Das Stylesheet wird einmal beim Laden ins <head> gesetzt (idempotent), damit jeder Baustein es ohne eigenes <style> erbt.
import "./pl-names.js";
const PL_SHARED_ID = "gt-pl-shared-css";

const PL_SHARED_CSS = `
/* ---- GameHeader: kompakt (48 px), gilt fuer alle Spiele ---- */
[data-phone-landscape] .gt-gamehead { display: flex; align-items: center; gap: 10px; min-height: var(--pl-head, 48px); max-height: 52px; box-sizing: border-box; padding-top: 2px; padding-bottom: 2px; margin-bottom: 6px; }
[data-phone-landscape] .gt-gamehead > div:first-of-type { margin-bottom: 0 !important; min-height: 44px !important; flex: none; order: 0; }
[data-phone-landscape] .gt-gamehead > div:nth-of-type(n+2):not(.gt-headbtns) { flex: 1 1 auto; min-width: 0; order: 1; }
[data-phone-landscape] .gt-gamehead > .gt-headbtns { position: static !important; order: 2; flex: none; margin-left: auto; }
[data-phone-landscape] .gt-gamehead > .gt-headbtns ~ .gt-headbtns { margin-left: 0; }
[data-phone-landscape] .gt-gamehead h1 { font-size: 20px !important; line-height: 1.1 !important; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; overflow-wrap: normal !important; }
[data-phone-landscape] .gt-gamehead h1 + div { margin-top: 1px !important; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }

/* ---- Regeln-Dialog (RulesSheet): mittig, breit, eigenes Scrollen ---- */
[data-phone-landscape] div:has(> [role="dialog"][aria-labelledby^="gt-rs-"]) { align-items: center !important; justify-content: center; box-sizing: border-box; padding: max(8px, var(--pl-sat)) max(12px, var(--pl-sar)) max(8px, var(--pl-sab)) max(12px, var(--pl-sal)); }
[data-phone-landscape] [role="dialog"][aria-labelledby^="gt-rs-"] { max-width: min(640px, 100%) !important; margin: 0 !important; border-radius: 22px !important; padding: 14px 20px !important; max-height: calc(var(--pl-avail) - 16px - var(--pl-sat) - var(--pl-sab)) !important; }

/* ---- Ziffernfeld-Dialoge (gtL-padov / gtL-padsheet, z. B. Skyjo): links Name und Wert, rechts Tastenfeld ---- */
[data-phone-landscape] .gtL-padov { align-items: center !important; box-sizing: border-box; padding: max(8px, var(--pl-sat)) max(12px, var(--pl-sar)) max(8px, var(--pl-sab)) max(12px, var(--pl-sal)); overflow-y: auto; }
[data-phone-landscape] .gtL-padsheet { box-sizing: border-box; border-radius: 20px !important; max-width: min(640px, 100%) !important; padding: 12px 16px !important; max-height: calc(var(--pl-avail) - 16px - var(--pl-sat) - var(--pl-sab)) !important; overflow-y: auto !important; overscroll-behavior: contain; display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); grid-template-rows: auto auto 1fr; column-gap: 18px; align-content: start; }
[data-phone-landscape] .gtL-padsheet > :not([style*="repeat(3"]) { grid-column: 1; min-width: 0; }
[data-phone-landscape] .gtL-padsheet > [style*="repeat(3"] { grid-column: 2; grid-row: 1 / 4; align-self: start; margin-bottom: 0 !important; }
[data-phone-landscape] .gtL-padsheet > [style*="repeat(3"] > button { min-height: 44px; padding-top: 8px !important; padding-bottom: 8px !important; }
[data-phone-landscape] .gtL-padsheet > button:not([style*="repeat(3"]) { align-self: end; min-height: 48px; }
[data-phone-landscape] .gtL-padsheet > button[data-gt-sound="1"] { position: sticky; bottom: 0; z-index: 2; }
[data-phone-landscape] .gtL-padsheet button { min-height: 44px; }
[data-phone-landscape] .gtL-padsheet > :first-child { margin-bottom: 8px !important; }
[data-phone-landscape] .gtL-padsheet > :first-child > button { min-width: 44px; min-height: 44px; display: inline-flex; align-items: center; justify-content: center; margin: -6px -8px -6px 0; }
[data-phone-landscape] .gtL-padsheet > :nth-child(2) { margin-bottom: 8px !important; }

/* ---- Setup: Startleiste (GtStartBar) flacher ---- */
[data-phone-landscape] .gt-su-cta { padding: 12px 12px calc(8px + var(--pl-sab, 0px)); margin-top: 4px; }
[data-phone-landscape] .gt-su-btn { min-height: 48px; border-radius: 16px; }
[data-phone-landscape] .gt-su-ib, [data-phone-landscape] .gt-su-add { min-height: 44px; }
[data-phone-landscape] .gt-gm-sb { min-height: 44px !important; min-width: 44px; box-sizing: border-box; display: inline-flex; align-items: center; justify-content: center; }
[data-phone-landscape] .gt-gm-in { min-height: 44px; box-sizing: border-box; }
[data-phone-landscape] .gt-gm-head { flex-wrap: wrap; row-gap: 4px; }
[data-phone-landscape] .gt-gm-head > .gt-gm-in:first-child { flex: 1 1 100% !important; width: 100%; text-overflow: clip; }

/* ---- Podest (PodiumOverlay): links Sieger, rechts Rangliste und Aktionen ---- */
[data-phone-landscape] .gtsb-modal { max-width: min(760px, 100%) !important; display: grid; grid-template-columns: minmax(0, 1.05fr) minmax(0, 1fr); grid-template-rows: auto 1fr; column-gap: 18px; align-items: start; padding: 14px 16px 14px !important; border-radius: 24px !important; max-height: calc(var(--pl-avail) - 16px - var(--pl-sat) - var(--pl-sab)); }
[data-phone-landscape] .gtsb-hd { grid-column: 1; grid-row: 1; }
[data-phone-landscape] .gtsb-hd > div { padding: 0 !important; font-size: 20px !important; text-align: left !important; justify-content: flex-start !important; }
[data-phone-landscape] .gtsb-stage { grid-column: 1; grid-row: 2; align-self: end; margin-top: 8px !important; }
[data-phone-landscape] .gtsb-side { grid-column: 2; grid-row: 1 / 3; display: flex; flex-direction: column; min-height: 0; max-height: calc(var(--pl-avail) - 16px - var(--pl-sat) - var(--pl-sab) - 28px); padding-top: 38px; box-sizing: border-box; }
[data-phone-landscape] .gtsb-side .gtsb-list { margin-top: 0; flex: 0 1 auto; min-height: 0; overflow-y: auto; overscroll-behavior: contain; }
[data-phone-landscape] .gtsb-side .gtsb-acts { margin-top: auto; padding-top: 12px; flex: none; }
[data-phone-landscape] .gtsb-side .gtsb-acts > button { min-height: 48px; }

/* ---- Exportvorschau (ShareImagePreview, Bild links, Hinweis und Aktionen rechts) ---- */
[data-phone-landscape] .gtsp-ov { padding: max(10px, var(--pl-sat)) max(60px, calc(var(--pl-sar) + 16px)) max(10px, var(--pl-sab)) max(16px, var(--pl-sal)) !important; }
[data-phone-landscape] .gtsp-in { flex-direction: row !important; align-items: center !important; justify-content: center; gap: 24px !important; width: 100%; }
[data-phone-landscape] .gtsp-imgs { max-height: calc(var(--pl-avail) - 20px) !important; }
[data-phone-landscape] .gtsp-imgs img { max-height: calc(var(--pl-avail) - 24px) !important; }
[data-phone-landscape] .gtsp-side { display: flex; flex-direction: column; align-items: center; gap: 14px; flex: 0 1 260px; min-width: 0; }
[data-phone-landscape] .gtsp-x { top: calc(6px + var(--pl-sat)) !important; right: calc(6px + var(--pl-sar)) !important; }

/* ---- Turnier-Exportblatt (GtStExportSheet): links Auswahl, rechts Vorschau ---- */
[data-phone-landscape] .gtstx-ov { padding: max(8px, var(--pl-sat)) max(12px, var(--pl-sar)) max(8px, var(--pl-sab)) max(12px, var(--pl-sal)) !important; }
[data-phone-landscape] .gtstx-panel { max-width: min(860px, 100%) !important; display: grid !important; grid-template-columns: minmax(0, 0.9fr) minmax(0, 1fr); grid-template-rows: auto auto auto 1fr auto; }
[data-phone-landscape] .gtstx-head { grid-column: 1 / 3; grid-row: 1; }
[data-phone-landscape] .gtstx-design { grid-column: 1; grid-row: 2; }
[data-phone-landscape] .gtstx-status { grid-column: 1; grid-row: 3; }
[data-phone-landscape] .gtstx-pages { grid-column: 2; grid-row: 2 / 6; min-height: 0; }
[data-phone-landscape] .gtstx-foot { grid-column: 1; grid-row: 5; }
/* Huellen der Einrichtung ohne Laptop-Layout: ausserhalb Querformat unsichtbar */
.plsu-split, .plsu-main, .plsu-side { display: contents; }
/* ---- Einrichtung aller Spiele (gtL-split-setup): Teilnehmer links, Einstellungen und Start rechts, Spalten scrollen einzeln ---- */
[data-phone-landscape] :is(.gtL-split-setup, .plsu-split):not(.pld-split) { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); gap: var(--pl-gap) calc(var(--pl-gap) + 4px); align-items: stretch; width: 100%; box-sizing: border-box; max-height: max(160px, var(--pl-body)); }
[data-phone-landscape] :is(.gtL-split-setup, .plsu-split):not(.pld-split) > :is(.gtL-col-main, .gtL-col-side, .plsu-main, .plsu-side) { display: flex; flex-direction: column; gap: 10px; min-width: 0; min-height: 0; max-height: max(160px, var(--pl-body)); box-sizing: border-box; overflow-y: auto; overscroll-behavior: contain; -webkit-overflow-scrolling: touch; padding-bottom: 2px; }
[data-phone-landscape] :is(.gtL-split-setup, .plsu-split):not(.pld-split) > :is(.gtL-col-side, .plsu-side) > .gt-su-cta { position: sticky; bottom: 0; z-index: 6; margin: 4px 0 0; padding: 8px 0 2px; background: transparent; -webkit-backdrop-filter: blur(6px); backdrop-filter: blur(6px); }
[data-phone-landscape] :is(.gtL-split-setup, .plsu-split):not(.pld-split) > :is(.gtL-col-side, .plsu-side) > .gt-su-cta::before { display: none; }
[data-phone-landscape] :is(.gtL-split-setup, .plsu-split):not(.pld-split) > :is(.gtL-col-side, .plsu-side) > .gt-su-cta > button { box-shadow: none; }
@media (max-width: 640px) { [data-phone-landscape] :is(.gtL-split-setup, .plsu-split):not(.pld-split) { grid-template-columns: minmax(0, 1.3fr) minmax(0, 1fr); } [data-phone-landscape] :is(.gtL-split-setup, .plsu-split):not(.pld-split) > :is(.gtL-col-main, .plsu-main) button { font-size: 13px; } }
[data-phone-landscape] :is(.gtL-split-setup, .plsu-split):not(.pld-split) :is(button, input, select) { min-height: 44px; box-sizing: border-box; }
[data-phone-landscape] :is(.gtL-split-setup, .plsu-split):not(.pld-split) input { scroll-margin: 8px; }
[data-phone-landscape] .gtL-page:has(:is(.gtL-split-setup, .plsu-split)) { max-width: none !important; width: 100% !important; margin: 0 !important; box-sizing: border-box; padding-left: var(--pl-gutter-l) !important; padding-right: var(--pl-gutter-r) !important; }
[data-phone-landscape] .gtL-shellpage:has(:is(.gtL-split-setup, .plsu-split)) { padding-top: max(var(--pl-sat), 6px) !important; }

`;

function plInstallSharedCss() {
  if (typeof document === "undefined") return;
  try {
    if (document.getElementById(PL_SHARED_ID)) return;
    const s = document.createElement("style");
    s.id = PL_SHARED_ID;
    s.textContent = PL_SHARED_CSS;
    document.head.appendChild(s);
  } catch (_) {}
}
plInstallSharedCss();

export { PL_SHARED_CSS, plInstallSharedCss };
