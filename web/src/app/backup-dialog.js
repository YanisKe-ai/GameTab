// Vorschau und Bestaetigung vor dem Wiederherstellen (Dialog mit gemeinsamem Verhalten useGtDialog).
// Zeigt, was die Datei enthaelt und was auf diesem Geraet dafuer ersetzt wird. Abbrechen ist der Standard-Startfokus.
import { React } from "../vendor/react-globals.js";
import { useGtDialog } from "../shared/dialog.js";
import { RADIUS_SM } from "../themes/palette.js";

function BackupRestoreDialog({ plan, current, onConfirm, onCancel, t, tk }) {
  const ref = useGtDialog({ open: !!plan, onClose: onCancel, outside: false });
  if (!plan) return null;
  const info = plan.info;
  const fill = (s, v) => Object.keys(v).reduce((a, k) => a.split("{" + k + "}").join(String(v[k])), s);
  let when = "";
  if (info.exportedAt) { try { when = new Date(info.exportedAt).toLocaleString(document.documentElement.lang || undefined, { dateStyle: "medium", timeStyle: "short" }); } catch (_) { when = info.exportedAt.slice(0, 10); } }
  const row = { margin: "0 0 4px", fontSize: 13, lineHeight: 1.45, color: tk.ink };
  const btn = { flex: 1, minHeight: 44, borderRadius: RADIUS_SM, fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: "'Inter', sans-serif", padding: "10px 14px" };
  return <div data-gt-backup-dialog="" style={{ position: "fixed", inset: 0, zIndex: 160, background: "rgba(8,9,12,0.72)", display: "flex", alignItems: "center", justifyContent: "center", padding: 16, boxSizing: "border-box" }}>
    <div ref={ref} role="dialog" aria-modal="true" aria-labelledby="gt-bk-title" aria-describedby="gt-bk-desc" tabIndex={-1} className="podium-pop" style={{ width: "100%", maxWidth: 380, maxHeight: "100%", overflowY: "auto", boxSizing: "border-box", background: tk.card, color: tk.ink, border: "1.5px solid " + tk.border, borderRadius: 18, padding: 18, fontFamily: "'Inter', sans-serif", outline: "none", boxShadow: "0 18px 50px rgba(0,0,0,0.5)" }}>
      <h2 id="gt-bk-title" style={{ margin: "0 0 8px", fontSize: 17, fontWeight: 800 }}>{t("backupRestoreTitle")}</h2>
      <div id="gt-bk-desc">
        <p style={{ ...row, color: tk.muted }}>{fill(t("backupRestoreFile"), { name: plan.name, v: info.version, date: when || "-" })}</p>
        <p style={{ ...row, fontWeight: 700, marginTop: 10 }}>{t("backupRestoreContains")}</p>
        <p style={row}>{fill(t("backupRestoreCounts"), { m: info.counts.matches, g: info.counts.groups, t: info.counts.tournaments })}</p>
        <p style={row}>{fill(t("backupRestoreKeys"), { k: info.counts.keys })}</p>
        <p style={{ ...row, fontWeight: 700, marginTop: 10 }}>{t("backupRestoreNowTitle")}</p>
        <p style={row}>{fill(t("backupRestoreCounts"), { m: current.matches, g: current.groups, t: current.tournaments })}</p>
        <p style={{ ...row, marginTop: 10, fontWeight: 600 }}>{t("backupRestoreWarn")}</p>
      </div>
      <div style={{ display: "flex", gap: 8, marginTop: 14 }}>
        <button type="button" data-gt-autofocus="" className="press-fx" onClick={onCancel} style={{ ...btn, border: "1.5px solid " + tk.border, background: "transparent", color: tk.ink }}>{t("backupRestoreCancel")}</button>
        <button type="button" className="press-fx" onClick={onConfirm} style={{ ...btn, border: "none", background: tk.gold, color: "#1A1408" }}>{t("backupRestoreConfirm")}</button>
      </div>
    </div>
  </div>;
}

export { BackupRestoreDialog };
