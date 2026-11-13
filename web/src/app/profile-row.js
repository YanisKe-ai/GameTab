// Einstellungen: Zeile «Ich bin» (lokales Profil). Sieht aus wie die anderen Listenzeilen und klappt wie «Spielergruppen» auf.
import { React } from "../vendor/react-globals.js";
import { useMemo, useState, useEffect, useRef } from "../prelude.js";
import { getAllKnownNames, getNameSuggestions, normalizeName } from "../stats/match-log.js";
import { gtIsDefName } from "../shared/recent-names.js";
import { gtSetProfile, gtClearProfile, useGtProfile } from "../shared/profile.js";

function ProfileRow({ t, tk, theme, rowBase, sepLine, chev, track, selBg, onFill, dangerInk, say }) {
  const L = theme === "light", N = theme === "noir";
  const prof = useGtProfile();
  const [open, setOpen] = useState(false);
  const [val, setVal] = useState(prof ? prof.name : "");
  const [al, setAl] = useState(prof ? prof.aliases : []);
  const [err, setErr] = useState("");
  const inputRef = useRef(null);
  useEffect(() => { if (open) { setVal(prof ? prof.name : ""); setAl(prof ? prof.aliases : []); setErr(""); } }, [open]);
  const vk = normalizeName(val);
  const known = useMemo(() => { try { return getAllKnownNames().filter((n) => !gtIsDefName(n.name)); } catch (e) { return []; } }, [open]);
  // Vorschläge: ohne Eingabe die häufigsten Namen, mit Eingabe passende Namen.
  const picks = useMemo(() => {
    if (!vk) return known.slice(0, 4).map((n) => n.name);
    return [];
  }, [vk, known]);
  // «Das bin auch ich»: ähnliche Namen aus der Statistik plus bereits gewählte Aliase.
  const alsoList = useMemo(() => {
    if (!vk) return [];
    let sim = [];
    try { sim = getNameSuggestions(val, 4).filter((n) => !gtIsDefName(n.name)).map((n) => n.name); } catch (e) {}
    const out = [], seen = new Set([vk]);
    al.concat(sim).forEach((n) => { const k = normalizeName(n); if (k && !seen.has(k)) { seen.add(k); out.push(n); } });
    return out.slice(0, 6);
  }, [vk, al, known]);
  const toggleAlias = (n) => { const k = normalizeName(n); setAl((a) => a.some((x) => normalizeName(x) === k) ? a.filter((x) => normalizeName(x) !== k) : a.concat([n])); };
  const save = () => {
    const name = val.trim();
    if (!name || gtIsDefName(name)) { setErr(t("profileInvalid")); try { inputRef.current && inputRef.current.focus(); } catch (e) {} return; }
    const keep = al.filter((a) => normalizeName(a) !== normalizeName(name));
    if (!gtSetProfile(name, keep)) { setErr(t("profileInvalid")); return; }
    setErr(""); setOpen(false);
    say("ok", t("profileSaved").replace("{name}", name), 6000);
  };
  const remove = () => { gtClearProfile(); setVal(""); setAl([]); setOpen(false); say("ok", t("profileRemoved"), 6000); };
  const chip = (label, on, onClick, key) => (
    <button key={key} type="button" onClick={onClick} aria-pressed={on === null ? undefined : on} className="st-btn st-chip"
      style={{ minHeight: 44, padding: "0 14px", borderRadius: 10, border: on && L ? `1.5px solid ${tk.gold}` : (N ? `1px solid ${tk.border}` : "none"), boxShadow: on && L ? "0 1px 3px rgba(70,48,12,0.18)" : undefined, background: on ? selBg : track, color: on ? onFill : tk.ink, fontSize: 14, fontWeight: on ? 700 : 600, fontFamily: "'Inter', sans-serif", cursor: "pointer", maxWidth: "100%", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
      {label}
    </button>
  );
  const lbl = { fontSize: "0.78125rem", fontWeight: 600, color: tk.muted, padding: "2px 2px 6px", fontFamily: "'Inter', sans-serif" };
  const btnOn = L ? "#FFFFFF" : N ? "#000000" : "#1A1408";
  return (
    <>
      <button type="button" aria-expanded={open} onClick={() => setOpen((o) => !o)} data-gt-profile-row="" className="st-btn st-row"
        style={{ ...rowBase, background: "transparent", cursor: "pointer", border: "none", borderTop: sepLine }}>
        <span>{t("profileLabel")}</span>
        <span style={{ display: "flex", alignItems: "center", gap: 6, color: tk.muted, fontSize: 15, minWidth: 0 }}>
          <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 170, color: prof ? tk.ink : tk.muted, fontWeight: prof ? 600 : 500 }}>{prof ? prof.name : t("profileSet")}</span>
          {chev(open)}
        </span>
      </button>
      {open && (
        <div data-gt-profile-panel="" style={{ borderTop: sepLine, padding: "12px 12px 12px", display: "flex", flexDirection: "column", gap: 10 }}>
          <input ref={inputRef} type="text" value={val} maxLength={24} autoComplete="off" autoCapitalize="words" spellCheck={false} enterKeyHint="done"
            aria-label={t("profileLabel")} aria-invalid={err ? true : undefined} aria-describedby="gt-profile-hint"
            placeholder={t("profilePlaceholder")} onChange={(e) => { setVal(e.target.value); if (err) setErr(""); }}
            onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); save(); } }}
            className="st-input" style={{ height: 46, boxSizing: "border-box", width: "100%", padding: "0 14px", borderRadius: 12, border: `1px solid ${err ? dangerInk : tk.border}`, background: track, color: tk.ink, fontSize: 16, fontWeight: 600, fontFamily: "'Inter', sans-serif" }} />
          <div id="gt-profile-hint" style={{ fontSize: "0.78125rem", color: err ? dangerInk : tk.muted, fontFamily: "'Inter', sans-serif", fontWeight: err ? 600 : 500, lineHeight: 1.4, padding: "0 2px" }} aria-live="polite">{err || t("profileHint")}</div>
          {picks.length > 0 && (
            <div role="group" aria-label={t("profileKnown")}>
              <div style={lbl}>{t("profileKnown")}</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>{picks.map((n) => chip(n, null, () => setVal(n), "p" + n))}</div>
            </div>
          )}
          {alsoList.length > 0 && (
            <div role="group" aria-label={t("profileAlso")}>
              <div style={lbl}>{t("profileAlso")}</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>{alsoList.map((n) => chip(n, al.some((x) => normalizeName(x) === normalizeName(n)), () => toggleAlias(n), "a" + n))}</div>
            </div>
          )}
          <div style={{ display: "flex", gap: 8, alignItems: "center", justifyContent: "space-between", flexWrap: "wrap" }}>
            {prof ? <button type="button" onClick={remove} className="st-btn gtL-danger" style={{ minHeight: 44, padding: "0 6px", border: "none", background: "transparent", color: dangerInk, fontSize: 14, fontWeight: 500, fontFamily: "'Inter', sans-serif", cursor: "pointer" }}>{t("profileRemove")}</button> : <span />}
            <button type="button" onClick={save} className="st-btn" style={{ minHeight: 44, padding: "0 22px", borderRadius: 12, border: "none", background: tk.gold, color: btnOn, fontSize: 15, fontWeight: 700, fontFamily: "'Inter', sans-serif", cursor: "pointer" }}>{t("profileSave")}</button>
          </div>
        </div>
      )}
    </>
  );
}

export { ProfileRow };
