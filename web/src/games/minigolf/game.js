// Minigolf "Greenline": Bahnansicht mit Schlagzaehlern, Tabelle, Zwischenstand. Logik in ./logic.js.
import { React } from "../../vendor/react-globals.js";
import { useEffect, useRef, useState } from "../../prelude.js";
import { GtHoldLabel, gtHold } from "../../shared/fx.js";
import { GLOBAL_STYLES } from "../../styles/global.js";
import { useT } from "../../i18n/use-t.js";
import { minigolfPageShellStyle, minigolfTokens, shellTokens } from "../../themes/tokens.js";
import { rankedPodium } from "../../shared/ranking.js";
import { useGtRecord, usePersonalBest } from "../../stats/match-log.js";
import { gtJoinNames, gtWinLine } from "../../shared/game-helpers.js";
import { PodiumOverlay, useCelebration } from "../../shared/podium.js";
import { CheckMark, GameIcon, XMark } from "../../assets/icons.js";
import { MinigolfLogo } from "../../assets/logos.js";
import { GameHeader } from "../../shared/game-header.js";
import { usePhoneLandscape } from "../../shared/phone-landscape.js";
import { GtRoundChart } from "../../shared/standings.js";
import { GroupPicker, GtPlayerList, GtStartBar, gtSkin, gtSkinTk, gtSoftTk } from "../../shared/setup-ui.js";
import {
  MINIGOLF_HOLES,
  MINIGOLF_MAX_STROKES,
  mgEff,
  mgFreshUi,
  mgGoto,
  mgHasDraft,
  mgHoleComplete,
  mgHoleInfo,
  mgNextOpen,
  mgSavableHoles,
  mgSave,
  mgSaveAll,
  mgSetDraft,
  mgStandings,
  mgStep,
  mgUi,
  mgUndo,
} from "./logic.js";
/*@gt-body-begin*/
function emptyMinigolfCard() {
  return Array(MINIGOLF_HOLES).fill(null);
}
function minigolfTotal(card) {
  return card.reduce((s, v) => s + (v || 0), 0);
}
function minigolfOutSum(card) {
  return card.slice(0, 9).reduce((s, v) => s + (v || 0), 0);
}
function minigolfInSum(card) {
  return card.slice(9, 18).reduce((s, v) => s + (v || 0), 0);
}
function minigolfFilledCount(card) {
  return card.filter((v) => v !== null).length;
}
const MG_LAND_CSS = `
[data-phone-landscape] .mg-land { padding-top: calc(var(--pl-sat) + 6px) !important; padding-bottom: calc(var(--pl-sab) + 6px) !important; --mg-edw: clamp(280px, 40vw, 360px); }
[data-phone-landscape] .mg-inner { max-width: none !important; margin: 0 !important; width: 100% !important; }
[data-phone-landscape] .mg-split { display: grid; grid-template-columns: minmax(0, 1.2fr) minmax(0, 1fr); grid-template-rows: auto auto minmax(0, 1fr) auto auto; column-gap: 12px; row-gap: 0; height: max(230px, calc(var(--pl-body) - 6px)); margin-top: 6px; }
[data-phone-landscape] .mg-split.mg-tab-table { grid-template-columns: minmax(0, 1.6fr) minmax(0, 1fr); }
[data-phone-landscape] .mg-main { display: contents; }
[data-phone-landscape] .mg-banner { grid-column: 1 / -1; grid-row: 1; margin-bottom: 8px !important; padding: 8px 12px !important; }
[data-phone-landscape] .mg-seg { grid-column: 1; grid-row: 2; margin-bottom: 8px !important; }
[data-phone-landscape] .mg-panel { grid-column: 1; grid-row: 3 / span 3; min-height: 0; overflow-y: auto; overscroll-behavior: contain; -webkit-overflow-scrolling: touch; padding-bottom: 2px; }
[data-phone-landscape] .mg-split.mg-tab-table .mg-panel { overflow: hidden; }
[data-phone-landscape] .mg-split.mg-tab-table .mgTableWrap { height: 100%; box-sizing: border-box; overflow: auto; overscroll-behavior: contain; }
[data-phone-landscape] .mg-side { display: block; grid-column: 2; grid-row: 2 / span 2; min-height: 0; overflow-y: auto; overscroll-behavior: contain; -webkit-overflow-scrolling: touch; }
[data-phone-landscape] .mg-side > .gtL-e-only:first-child { display: block; }
[data-phone-landscape] .mg-side > .gtL-e-only:first-child > section { margin-top: 0 !important; }
[data-phone-landscape] .mg-land .mgPhoneOnly { display: none !important; }
[data-phone-landscape] .mg-land .mgBar { grid-column: 2; grid-row: 4; position: static !important; margin: 8px 0 0 !important; padding: 0 !important; background: transparent !important; backdrop-filter: none !important; -webkit-backdrop-filter: none !important; border: 0 !important; border-radius: 0 !important; box-shadow: none !important; display: flex; flex-wrap: wrap; align-items: center; gap: 6px; }
[data-phone-landscape] .mg-land .mgBar #mg-status { flex: 1 0 100%; margin: 0 !important; justify-content: flex-start !important; text-align: left !important; font-size: 13px !important; line-height: 1.3 !important; }
[data-phone-landscape] .mg-land .mgBar [data-mg-main] { width: auto !important; flex: 1 1 140px; min-height: 48px !important; font-size: 17px !important; }
[data-phone-landscape] .mg-land .mgBar [data-mg-undo] { margin: 0 !important; min-height: 44px !important; min-width: 44px; padding: 0 12px !important; flex: 0 0 auto; }
[data-phone-landscape] .mg-side2 { display: block; grid-column: 2; grid-row: 5; }
[data-phone-landscape] .mg-split .mgTableWrap td button { min-height: 44px !important; }
[data-phone-landscape] .mg-side > .gtL-e-only:first-child > section > button { min-height: 44px !important; }
[data-phone-landscape] .mg-side2 > div { margin-top: 6px !important; }
[data-phone-landscape] .mg-side2 button { min-height: 44px !important; }
[data-phone-landscape] .mg-editor { left: auto !important; right: 0 !important; bottom: 0 !important; top: calc(var(--pl-sat) + var(--pl-head) + 6px) !important; width: calc(var(--mg-edw) + var(--pl-sar)) !important; box-sizing: border-box; border-radius: 22px 0 0 0 !important; padding: 12px calc(14px + var(--pl-sar)) calc(10px + var(--pl-sab)) 14px !important; overflow-y: auto; overscroll-behavior: contain; box-shadow: -10px 0 28px rgba(0,0,0,0.35) !important; border-top: 2px solid var(--mg-edacc, currentColor); }
@media (max-width: 700px) { [data-phone-landscape] .mg-land .mgBar .mg-undo-txt { display: none; } }
@media (max-width: 700px) { [data-phone-landscape] .mg-split { grid-template-columns: minmax(0, 1.5fr) minmax(0, 1fr); } [data-phone-landscape] .mg-split.mg-tab-table { grid-template-columns: minmax(0, 1.7fr) minmax(0, 1fr); } }
@media (max-height: 360px) { [data-phone-landscape] .mg-editor .mg-edhint { display: none; } }
`;
const MINIGOLF_FONT = "'Space Grotesk', sans-serif";
const MG_UI = "'Inter', sans-serif";
const MG_CSS = `
.mgGL button { -webkit-tap-highlight-color: transparent; touch-action: manipulation; }
.mgGL .mgPress { transition: transform 140ms var(--gt-ease-out), background-color 160ms ease, border-color 160ms ease, color 160ms ease, opacity 160ms ease, box-shadow 160ms ease; }
.mgGL .mgPress:active:not(:disabled) { transform: scale(0.97); }
.mgGL .mgPress:disabled { cursor: default; }
@media (hover: hover) and (pointer: fine) { .mgGL .mgPress:hover:not(:disabled) { filter: brightness(1.07); } }
.mgGL .mgHoleNum { animation: mgIn 220ms var(--gt-ease-out); }
@keyframes mgIn { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: none; } }
.mgGL .mgSr { position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0 0 0 0); clip-path: inset(50%); white-space: nowrap; }
.mgGL .mgTableWrap { overflow-x: auto; -webkit-overflow-scrolling: touch; overscroll-behavior-x: contain; }
.mgGL .mgSticky { position: sticky; left: 0; z-index: 1; }
.mgGL .mgCard { display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 10px 12px; }
.gtL-content .mgPhoneOnly { display: none !important; }
.gtL-content .mgGL .mgBar { border-radius: 0; }
@media (prefers-reduced-motion: reduce) {
  .mgGL .mgPress, .mgGL .mgPress:active:not(:disabled) { transition: none; transform: none; }
  .mgGL .mgHoleNum { animation: none; }
}
`;
function MgSvg({ size = 20, sw = 2.2, children }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
      {children}
    </svg>
  );
}
function MgFlag({ mg, size = 44 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" aria-hidden="true" focusable="false" style={{ flexShrink: 0 }}>
      <ellipse cx="21" cy="40" rx="15" ry="4.6" fill={mg.accSoft} stroke={mg.line} strokeWidth="1" />
      <ellipse cx="21" cy="40" rx="3.4" ry="1.4" fill={mg.ink} opacity="0.5" />
      <path d="M21 40V9" stroke={mg.ink} strokeWidth="2.4" strokeLinecap="round" />
      <path d="M22.2 9.6l14.8 5.9-14.8 5.9z" fill={mg.flag} />
    </svg>
  );
}
function MinigolfTopBar({ subtitle, onBack, theme, t, onHome, rulesText, onEndGame }) {
  const mg = minigolfTokens(theme);
  return (
    <GameHeader
      title={t("gameMinigolf")}
      subtitle={subtitle}
      onBack={onBack}
      backLabel={t("back")}
      tk={mg}
      accent={mg.accInk}
      titleFont={MINIGOLF_FONT}
      icon={<MinigolfLogo color={mg.accInk} />}
      onHome={onHome}
      onEndGame={onEndGame}
      rulesText={rulesText}
    />
  );
}
function MinigolfSetup({ players, setPlayers, onStart, theme, t }) {
  const mg = gtSoftTk(minigolfTokens(theme), theme);
  const gtS = gtSkin(theme, mg, "minigolf", theme === "noir" ? { font: MINIGOLF_FONT } : { font: MINIGOLF_FONT, acc: mg.acc });
  const rename = (idx, name) => setPlayers((ps) => ps.map((p, i) => (i === idx ? { ...p, name } : p)));
  const addPlayer = () =>
    setPlayers((ps) => {
      const nextId = ps.length ? Math.max(...ps.map((p) => p.id)) + 1 : 1;
      return [...ps, { id: nextId, name: t("defaultPlayerName")(ps.length + 1) }];
    });
  const removePlayer = (idx) => setPlayers((ps) => ps.filter((_, i) => i !== idx));
  const move = (idx, dir) =>
    setPlayers((ps) => {
      const next = [...ps];
      const target = idx + dir;
      if (target < 0 || target >= next.length) return ps;
      [next[idx], next[target]] = [next[target], next[idx]];
      return next;
    });
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      <div className="plsu-split">
        <div className="plsu-main">
          <GroupPicker getNames={() => players.map((p) => p.name)} setNames={(names) => setPlayers(names.map((name, i) => ({ id: i + 1, name })))} t={t} tk={gtSkinTk(mg, gtS)} />
          <GtPlayerList players={players} onRename={rename} onRemove={removePlayer} onAdd={addPlayer} skin={gtS} t={t} onMove={move} minPlayers={1} maxPlayers={8} hues={mg.hues} />
        </div>
        <div className="plsu-side">
          <GtStartBar onClick={onStart} disabled={false} label={t("startGame")} skin={gtS} />
        </div>
      </div>
    </div>
  );
}
// Direkter Zahleneditor (Bottom-Sheet). Schreibt nur einen Entwurf, gespeichert wird mit "Bahn speichern".
function MinigolfEditorPanel({ editing, players, value: cur, onSave, onClose, t, mg }) {
  const [value, setValue] = useState("");
  const boxRef = useRef(null);
  useEffect(() => {
    if (editing) {
      setValue(cur !== null && cur !== undefined ? String(cur) : "");
      if (boxRef.current) boxRef.current.focus({ preventScroll: true });
    }
  }, [editing]);
  useEffect(() => {
    if (!editing) return;
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [editing]);
  if (!editing) return null;
  const MAX = MINIGOLF_MAX_STROKES;
  const player = players.find((p) => p.id === editing.playerId);
  const commit = (v) => onSave(editing.playerId, editing.holeIdx, v);
  const num = /^\d+$/.test(value) ? parseInt(value, 10) : NaN;
  const ok = num >= 1 && num <= MAX;
  const bad = value !== "" && !ok;
  const btnBase = { border: `1px solid ${mg.ctrlLine}`, borderRadius: 14, background: mg.ctrl, color: mg.ink, cursor: "pointer", fontFamily: MINIGOLF_FONT, minHeight: 48, minWidth: 0 };
  return (
    <div
      ref={boxRef}
      tabIndex={-1}
      data-mg-panel="1"
      className="mg-editor"
      role="dialog"
      aria-label={(player ? player.name : "") + ", " + t("holeLabel")(editing.holeIdx + 1)}
      style={{
        position: "fixed",
        left: 0,
        right: 0,
        bottom: 0,
        background: mg.solid,
        borderRadius: "22px 22px 0 0",
        boxShadow: "0 -12px 32px rgba(0,0,0,0.35)",
        padding: "14px 14px calc(16px + env(safe-area-inset-bottom))",
        zIndex: 70,
        borderTop: `2px solid ${mg.acc}`,
        outline: "none",
        "--mg-edacc": mg.acc,
      }}
    >
      <div style={{ maxWidth: 520, margin: "0 auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10, marginBottom: 12 }}>
          <span style={{ fontFamily: MINIGOLF_FONT, fontSize: 17, fontWeight: 700, color: mg.ink, minWidth: 0, overflowWrap: "anywhere" }}>
            {player?.name}
            <span style={{ color: mg.muted, fontWeight: 600 }}>
              {" · "}
              {t("holeLabel")(editing.holeIdx + 1)}
            </span>
          </span>
          <button className="mgPress" onClick={onClose} aria-label={t("mgClose")} style={{ border: `1px solid ${mg.ctrlLine}`, background: mg.ctrl, borderRadius: "50%", width: 44, height: 44, flexShrink: 0, color: mg.ink, cursor: "pointer", display: "grid", placeItems: "center" }}>
            <XMark />
          </button>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(44px, 1fr))", gap: 4, marginBottom: 6 }}>
          {Array.from({ length: MAX }, (_, k) => k + 1).map((n) => {
            const isMax = n === MAX;
            const isCur = cur === n;
            return (
              <button
                className="mgPress"
                data-gt-sound="1"
                key={n}
                onClick={() => commit(n)}
                data-mg-giveup={isMax ? "1" : undefined}
                aria-label={isMax ? n + ", " + t("mgMaxHint")(MAX) : String(n)}
                aria-pressed={isCur ? "true" : "false"}
                style={{
                  ...btnBase,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 1,
                  padding: "6px 0",
                  fontSize: 19,
                  fontWeight: 700,
                  background: isCur ? mg.segBg : mg.ctrl,
                  color: isCur ? mg.segInk : mg.ink,
                  borderColor: isCur ? mg.segBg : mg.ctrlLine,
                }}
              >
                <span style={{ lineHeight: 1 }}>{n}</span>
                {isMax && <span style={{ fontSize: 10, fontWeight: 700, color: isCur ? mg.segInk : mg.muted, fontFamily: MG_UI, lineHeight: 1, letterSpacing: "0.02em" }}>{t("mgMaxShort")}</span>}
              </button>
            );
          })}
        </div>
        <div className="mg-edhint" style={{ fontSize: 12, color: mg.muted, fontFamily: MG_UI, marginBottom: 10, lineHeight: 1.35 }}>{t("mgMaxHint")(MAX)}</div>
        <div style={{ display: "flex", gap: 6 }}>
          <input
            data-mg-input="1"
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength={2}
            placeholder={t("strokesPlaceholder")}
            aria-label={t("strokesPlaceholder")}
            aria-invalid={bad ? "true" : "false"}
            aria-describedby={bad ? "mg-range-hint" : undefined}
            value={value}
            onChange={(e) => {
              const v = e.target.value;
              if (/^\d{0,2}$/.test(v)) setValue(v);
            }}
            onKeyDown={(e) => e.key === "Enter" && ok && commit(num)}
            style={{ flex: 1, minWidth: 0, border: `1px solid ${bad ? mg.err : mg.ctrlLine}`, borderRadius: 14, padding: "12px", fontSize: 16, fontFamily: MG_UI, background: mg.ctrl, color: mg.ink }}
          />
          {cur !== null && cur !== undefined && (
            <button className="mgPress" onClick={() => commit(null)} style={{ ...btnBase, fontSize: 13, fontWeight: 700, padding: "0 14px", fontFamily: MG_UI }}>
              {t("mgClear")}
            </button>
          )}
          <button
            className="mgPress"
            onClick={() => ok && commit(num)}
            disabled={!ok}
            aria-label={t("strokesPlaceholder") + " " + t("mgOk")}
            style={{ border: "none", borderRadius: 14, background: ok ? mg.acc : mg.track, color: ok ? mg.onAcc : mg.muted, fontSize: 14, fontWeight: 700, padding: "0 18px", minWidth: 52, minHeight: 48, cursor: ok ? "pointer" : "default" }}
          >
            <CheckMark />
          </button>
        </div>
        {bad && (
          <div id="mg-range-hint" role="alert" style={{ fontSize: 12.5, fontWeight: 600, color: mg.err, fontFamily: MG_UI, marginTop: 6 }}>
            {t("mgStrokesRange")(MAX)}
          </div>
        )}
      </div>
    </div>
  );
}
function MgSegmented({ tab, onTab, mg, t }) {
  const item = (id, label) => {
    const on = tab === id;
    return (
      <button
        key={id}
        role="tab"
        id={"mg-tab-" + id}
        aria-selected={on ? "true" : "false"}
        aria-controls="mg-panel"
        tabIndex={on ? 0 : -1}
        className="mgPress"
        onClick={() => onTab(id)}
        onKeyDown={(e) => {
          if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
            e.preventDefault();
            const nx = id === "hole" ? "table" : "hole";
            onTab(nx);
            const el = document.getElementById("mg-tab-" + nx);
            if (el) el.focus();
          }
        }}
        style={{
          flex: "1 1 0",
          minHeight: 44,
          border: "none",
          borderRadius: 14,
          background: on ? mg.segBg : "transparent",
          color: on ? mg.segInk : mg.muted,
          fontFamily: MINIGOLF_FONT,
          fontWeight: 700,
          fontSize: 16,
          cursor: "pointer",
          boxShadow: on ? "0 1px 2px rgba(0,0,0,0.12)" : "none",
        }}
      >
        {label}
      </button>
    );
  };
  return (
    <div role="tablist" aria-label={t("mgViewLabel")} className={"mg-seg" + (mg.glass ? " gtL-glass-soft" : "")} style={{ display: "flex", gap: 4, padding: 4, borderRadius: 18, background: mg.surf, border: `1px solid ${mg.line}`, marginBottom: 12 }}>
      {item("hole", t("mgTabHole"))}
      {item("table", t("mgTabTable"))}
    </div>
  );
}
function MgHoleCard({ ui, hole, onGo, mg, t }) {
  const done = Array.from({ length: MINIGOLF_HOLES }, (_, h) => mgHoleComplete(ui.players, ui.scores, h));
  const nDone = done.filter(Boolean).length;
  const nav = (dir) => {
    const dis = dir < 0 ? hole <= 0 : hole >= MINIGOLF_HOLES - 1;
    return (
      <button
        className="mgPress"
        onClick={() => !dis && onGo(hole + dir)}
        disabled={dis}
        aria-label={dir < 0 ? t("mgPrevHole") : t("mgNextHole")}
        style={{ width: 44, height: 44, borderRadius: "50%", border: `1px solid ${mg.ctrlLine}`, background: mg.ctrl, color: mg.ink, display: "grid", placeItems: "center", cursor: "pointer", opacity: dis ? 0.38 : 1, flexShrink: 0 }}
      >
        <MgSvg size={20}>{dir < 0 ? <path d="M15 5l-7 7 7 7" /> : <path d="M9 5l7 7-7 7" />}</MgSvg>
      </button>
    );
  };
  return (
    <section aria-label={t("mgHoleOf")(hole + 1, MINIGOLF_HOLES)} className={mg.glass ? "gtL-glass" : undefined} style={{ background: mg.surf, border: `1px solid ${mg.line}`, borderRadius: 22, padding: "10px 12px 10px 10px", boxShadow: mg.shadow, marginBottom: 8 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <MgFlag mg={mg} size={36} />
        <div style={{ flex: "1 1 auto", minWidth: 0 }} aria-live="polite" aria-atomic="true">
          <span className="mgSr">{t("mgHoleOf")(hole + 1, MINIGOLF_HOLES)}</span>
          <div aria-hidden="true" style={{ fontSize: 15, fontWeight: 700, color: mg.ink, fontFamily: MG_UI, lineHeight: 1.1 }}>
            {t("mgTabHole")}
          </div>
          <div aria-hidden="true" style={{ display: "flex", flexWrap: "wrap", alignItems: "baseline", columnGap: 8 }}>
            <span key={hole} className="mgHoleNum" data-mg-hole={hole + 1} style={{ fontFamily: MINIGOLF_FONT, fontWeight: 700, fontSize: 44, lineHeight: 1, color: mg.accInk, letterSpacing: "-0.04em", fontVariantNumeric: "tabular-nums" }}>
              {String(hole + 1).padStart(2, "0")}
            </span>
            <span style={{ fontSize: 17, color: mg.muted, fontFamily: MG_UI, fontWeight: 600, whiteSpace: "nowrap" }}>{t("mgOf")(MINIGOLF_HOLES)}</span>
          </div>
        </div>
        <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
          {nav(-1)}
          {nav(1)}
        </div>
      </div>
      <div role="img" aria-label={t("mgProgress")(nDone, MINIGOLF_HOLES)} style={{ display: "grid", gridTemplateColumns: `repeat(${MINIGOLF_HOLES}, minmax(0, 1fr))`, gap: 3, marginTop: 12, padding: "0 2px" }}>
        {done.map((d, h) => (
          <span key={h} style={{ height: 5, borderRadius: 3, background: d ? mg.acc : mg.track, outline: h === hole ? `1.5px solid ${mg.muted}` : "none", outlineOffset: 1.5 }} />
        ))}
      </div>
    </section>
  );
}
function MgPlayerCard({ p, val, isDraft, missing, sofar, countNote, leads, onStep, onPick, mg, t }) {
  const name = p.name || "";
  const has = val !== null && val !== undefined;
  const round = { width: 44, height: 44, borderRadius: "50%", border: `1px solid ${mg.ctrlLine}`, background: mg.ctrl, color: mg.ink, display: "grid", placeItems: "center", cursor: "pointer", flexShrink: 0 };
  const minusDis = !has || val <= 1;
  const plusDis = has && val >= MINIGOLF_MAX_STROKES;
  return (
    <div
      data-mg-card={p.id}
      className={"mgCard" + (mg.glass ? " gtL-glass-soft" : "")}
      style={{ background: leads ? `linear-gradient(${mg.accSoft}, ${mg.accSoft}), ${mg.surf}` : mg.surf, border: `1px solid ${leads ? mg.accLine : mg.line}`, borderRadius: 18, padding: "8px 10px 8px 14px", boxShadow: mg.shadow }}
    >
      <div style={{ flex: "1 1 128px", minWidth: 0 }}>
        <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "2px 8px" }}>
          <span style={{ fontFamily: MINIGOLF_FONT, fontWeight: 700, fontSize: 19, color: mg.ink, lineHeight: 1.2, overflowWrap: "anywhere", letterSpacing: "-0.01em" }}>{name}</span>
          {leads && (
            <span style={{ fontFamily: MG_UI, fontSize: 11, fontWeight: 700, letterSpacing: "0.05em", textTransform: "uppercase", padding: "2px 8px", borderRadius: 999, color: mg.accInk, border: `1px solid ${mg.accLine}`, lineHeight: 1.4 }}>{t("mgLeads")}</span>
          )}
        </div>
        <div style={{ fontSize: 14, color: mg.muted, fontFamily: MG_UI, marginTop: 2 }}>
          {t("mgSoFar")} <span style={{ color: mg.ink, fontWeight: 700, fontFamily: MINIGOLF_FONT, fontSize: 17, fontVariantNumeric: "tabular-nums" }}>{sofar}</span>
          {countNote ? <span>{" · " + countNote}</span> : null}
        </div>
      </div>
      <div role="group" aria-label={t("strokesPlaceholder") + ", " + name} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4, marginLeft: "auto" }}>
        
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <button className="mgPress" data-mg-minus={p.id} onClick={() => !minusDis && onStep(-1)} disabled={minusDis} aria-label={t("mgSub")(name)} style={{ ...round, opacity: minusDis ? 0.38 : 1 }}>
            <MgSvg size={18}>
              <path d="M6 12h12" />
            </MgSvg>
          </button>
          <button
            className="mgPress"
            data-mg-val={p.id}
            onClick={onPick}
            aria-label={t("mgPick")(name, has ? val : null) + (isDraft ? ", " + t("mgUnsaved") : "")}
            style={{
              minWidth: 58,
              height: 46,
              borderRadius: 14,
              border: has ? `${isDraft ? 1.5 : 1}px solid ${isDraft ? mg.acc : mg.ctrlLine}` : `1.5px dashed ${missing ? mg.acc : mg.ctrlLine}`,
              background: has ? mg.surf2 : "transparent",
              color: mg.ink,
              fontFamily: MINIGOLF_FONT,
              fontWeight: 700,
              fontSize: 24,
              fontVariantNumeric: "tabular-nums",
              cursor: "pointer",
              padding: 0,
            }}
          >
            {has ? val : <span style={{ fontFamily: MG_UI, fontSize: 11.5, fontWeight: 600, color: missing ? mg.accInk : mg.muted, letterSpacing: "0.01em" }}>{t("mgOpen")}</span>}
          </button>
          <button className="mgPress" data-mg-plus={p.id} onClick={() => !plusDis && onStep(1)} disabled={plusDis} aria-label={t("mgAdd")(name)} style={{ ...round, opacity: plusDis ? 0.38 : 1 }}>
            <MgSvg size={18}>
              <path d="M12 6v12M6 12h12" />
            </MgSvg>
          </button>
        </div>
      </div>
    </div>
  );
}
function MgStandingsBox({ st, onOpen, finished, mg, t, className }) {
  const title = st.common === 0 ? t("mgStandNone") : st.uniform ? t("mgStandAfter")(st.common) : t("mgStandCommon")(st.common);
  const allTied = st.rows.every((r) => r.rank === 1);
  return (
    <section className={className} aria-label={title} style={{ background: mg.surf2, border: `1px solid ${mg.line}`, borderRadius: 18, padding: "2px 10px 8px", marginTop: 8 }}>
      <button
        className="mgPress"
        onClick={onOpen}
        aria-label={title + ". " + t("mgOpenTable")}
        style={{ width: "100%", minHeight: 40, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, border: "none", background: "transparent", color: mg.muted, fontFamily: MG_UI, fontSize: 14, fontWeight: 600, padding: "0 4px 0 6px", cursor: "pointer", textAlign: "left" }}
      >
        <span>{title}</span>
        <MgSvg size={18}>
          <path d="M9 5l7 7-7 7" />
        </MgSvg>
      </button>
      {st.common > 0 && (
        <ol style={{ listStyle: "none", margin: 0, padding: 0, display: "grid", gridTemplateColumns: st.rows.every((r) => String(r.name || "").length <= 11) ? "repeat(auto-fill, minmax(min(100%, 148px), 1fr))" : "1fr", gap: 6 }}>
          {st.rows.map((r) => {
            const top = r.rank === 1 && !allTied && !finished;
            return (
              <li key={r.id} style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 12px", borderRadius: 12, border: `1px solid ${top ? mg.accLine : mg.line}`, background: top ? mg.accSoft : "transparent", minWidth: 0 }}>
                <span style={{ color: top ? mg.accInk : mg.muted, fontWeight: 700, fontFamily: MINIGOLF_FONT, fontSize: 15, minWidth: 20, fontVariantNumeric: "tabular-nums" }}>{r.rank}.</span>
                <span style={{ flex: "1 1 auto", minWidth: 0, color: mg.ink, fontFamily: MG_UI, fontWeight: 600, fontSize: 15, overflowWrap: "anywhere", lineHeight: 1.25 }}>
                  {r.name}
                  {top && <span className="mgSr">{", " + t("mgLeads")}</span>}
                  {!st.uniform && <span style={{ display: "block", fontSize: 12, fontWeight: 500, color: mg.muted }}>{t("mgHolesN")(r.count) + " · " + t("minigolfTotalRow") + " " + r.total}</span>}
                </span>
                <span style={{ fontFamily: MINIGOLF_FONT, fontWeight: 700, fontSize: 18, color: mg.ink, fontVariantNumeric: "tabular-nums" }}>{r.sum}</span>
              </li>
            );
          })}
        </ol>
      )}
    </section>
  );
}
function MgTable({ ui, hole, onCell, mg, t }) {
  const ps = ui.players;
  const pl = usePhoneLandscape();
  const wrapRef = useRef(null);
  useEffect(() => {
    // Querformat: Tabelle oeffnet mit der aktuellen Bahn im Blick (nur im eigenen Scrollbereich)
    const w = wrapRef.current;
    if (!pl || !w) return;
    const row = w.querySelector('tr[aria-current="true"]');
    if (row) w.scrollTop = Math.max(0, row.offsetTop - w.clientHeight / 2 + row.offsetHeight / 2);
  }, [pl]);
  const cellBtn = { width: "100%", minWidth: 44, minHeight: 40, border: "none", borderRadius: 10, background: "transparent", fontFamily: MINIGOLF_FONT, fontSize: 16, fontWeight: 700, cursor: "pointer", fontVariantNumeric: "tabular-nums", position: "relative", padding: "0 4px" };
  const stickyBg = (cur) => (cur ? `linear-gradient(${mg.accSoft}, ${mg.accSoft}), ${mg.solid}` : mg.solid);
  const thBase = { padding: "10px 4px", fontFamily: MG_UI, fontSize: 12.5, fontWeight: 700, color: mg.ink, textAlign: "center", borderBottom: `1px solid ${mg.line}`, verticalAlign: "bottom", ...(pl ? { position: "sticky", top: 0, zIndex: 2, background: mg.solid, fontSize: 14 } : null) };
  const sumRow = (label, fn, strong) => (
    <tr>
      <th scope="row" className="mgSticky" style={{ background: mg.solid, padding: "8px 10px", textAlign: "left", fontFamily: MG_UI, fontSize: 12, fontWeight: 700, color: strong ? mg.accInk : mg.muted, textTransform: "uppercase", letterSpacing: "0.04em", borderTop: `1px solid ${mg.line}`, whiteSpace: "nowrap" }}>
        {label}
      </th>
      {ps.map((p) => (
        <td key={p.id} style={{ textAlign: "center", padding: "8px 4px", borderTop: `1px solid ${mg.line}`, fontFamily: MINIGOLF_FONT, fontWeight: 700, fontSize: strong ? 18 : 15, color: strong ? mg.ink : mg.muted, fontVariantNumeric: "tabular-nums" }}>
          {fn(ui.scores[p.id] || [])}
        </td>
      ))}
    </tr>
  );
  const holeRow = (h) => {
    const cur = h === hole;
    return (
      <tr key={h} aria-current={cur ? "true" : undefined} style={{ background: cur ? mg.accSoft : undefined }}>
        <th scope="row" className="mgSticky" style={{ background: stickyBg(cur), padding: "2px 10px", textAlign: "left", fontFamily: MINIGOLF_FONT, fontSize: 14, fontWeight: 700, color: cur ? mg.accInk : mg.muted, fontVariantNumeric: "tabular-nums", boxShadow: cur ? `inset 3px 0 0 ${mg.acc}` : "none" }}>
          {h + 1}
          {cur && <span className="mgSr">{", " + t("mgCurrentHole")}</span>}
        </th>
        {ps.map((p) => {
          const v = mgEff(ui, p.id, h);
          const d = mgHasDraft(ui.drafts, h, p.id);
          return (
            <td key={p.id} style={{ padding: "2px 2px", textAlign: "center" }}>
              <button
                className="mgPress"
                data-mg-cell={p.id + "-" + h}
                onClick={() => onCell(p.id, h)}
                aria-label={p.name + ", " + t("holeLabel")(h + 1) + ": " + (v === null ? t("mgOpen") : v) + (d ? ", " + t("mgUnsaved") : "")}
                style={{ ...cellBtn, color: v === null ? mg.muted : d ? mg.accInk : mg.ink, fontWeight: v === null ? 400 : 700, boxShadow: d ? `inset 0 0 0 1.5px ${mg.acc}` : "none" }}
              >
                {v === null ? "·" : v}
              </button>
            </td>
          );
        })}
      </tr>
    );
  };
  return (
    <div ref={wrapRef} className={"mgTableWrap" + (mg.glass ? " gtL-glass" : "")} role="region" aria-label={t("mgTabTable")} tabIndex={0} style={{ background: mg.surf, border: `1px solid ${mg.line}`, borderRadius: 20, boxShadow: mg.shadow }}>
      <table style={{ borderCollapse: "separate", borderSpacing: 0, width: "100%", minWidth: 52 + ps.length * 60 }}>
        <thead>
          <tr>
            <th scope="col" className="mgSticky" style={{ ...thBase, background: mg.solid, textAlign: "left", paddingLeft: 10, color: mg.muted, width: 52, borderTopLeftRadius: 20, ...(pl ? { zIndex: 3 } : null) }}>
              {t("mgTabHole")}
            </th>
            {ps.map((p) => (
              <th key={p.id} scope="col" title={p.name} style={thBase}>
                <span style={{ display: "block", maxWidth: 110, margin: "0 auto", overflowWrap: "anywhere", hyphens: "auto", lineHeight: 1.2 }}>{p.name}</span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: 9 }, (_, h) => holeRow(h))}
          {sumRow(t("minigolfOutRow"), minigolfOutSum)}
          {Array.from({ length: 9 }, (_, k) => holeRow(9 + k))}
          {sumRow(t("minigolfInRow"), minigolfInSum)}
          {sumRow(t("minigolfTotalRow"), minigolfTotal, true)}
        </tbody>
      </table>
    </div>
  );
}
function MinigolfPlay({ state, setState, onResetSheet, onEditPlayers, onBack, onHome, onEndGame, lang = "de", theme = "dark" }) {
  const players = state.players;
  const scores = state.scores;
  const [editing, setEditing] = useState(null);
  const [confirmingReset, setConfirmingReset] = useState(false);
  const [confirmingSetup, setConfirmingSetup] = useState(false);
  const t = useT(lang);
  const mg = minigolfTokens(theme);
  const tk = shellTokens(theme);
  const filledCounts = players.map((p) => minigolfFilledCount(scores[p.id]));
  const finished = players.length > 0 && filledCounts.every((c) => c === MINIGOLF_HOLES);
  const totals = players.map((p) => minigolfTotal(scores[p.id]));
  const anyFilled = filledCounts.some((c) => c > 0);
  const minTotal = anyFilled ? Math.min(...totals) : null;
  const winnerIdx = finished ? totals.findIndex((tot) => tot === minTotal) : -1;
  const { isNew: golfIsNew } = usePersonalBest("minigolf", finished, winnerIdx !== -1 ? players[winnerIdx].name : "", winnerIdx !== -1 ? minTotal : null, true);
  useGtRecord("minigolf", winnerIdx !== -1, () => {
    const aces = players.filter((p) => (scores[p.id] || []).some((v) => v === 1)).map((p) => p.name);
    return { participants: players.map((p, i) => ({ name: p.name, score: totals[i] })), lowWins: true, extra: aces.length ? { aces } : undefined };
  });
  const celebration = useCelebration(winnerIdx !== -1);
  const [podiumOpen, setPodiumOpen] = useState(false);
  useEffect(() => {
    if (winnerIdx !== -1) setPodiumOpen(true);
  }, [winnerIdx]);
  const podiumRanked = winnerIdx !== -1 ? rankedPodium(players, (p) => minigolfTotal(scores[p.id]), true) : [];
  const ui = mgUi(state);
  const hole = ui.hole;
  const tab = ui.tab;
  const upd = (fn) => setState((s) => fn(s));
  const st = mgStandings(players, scores);
  const lead = new Set(!finished && st.common > 0 && !st.rows.every((r) => r.rank === 1) ? st.rows.filter((r) => r.rank === 1).map((r) => r.id) : []);
  const info = mgHoleInfo(ui, hole);
  const saveDraft = (playerId, holeIdx, v) => {
    upd((s) => mgSetDraft(s, playerId, holeIdx, v));
    setEditing(null);
  };
  const reset = () => {
    if (!confirmingReset) {
      setConfirmingReset(true);
      setTimeout(() => setConfirmingReset(false), 3000);
      return;
    }
    onResetSheet();
    setConfirmingReset(false);
  };
  const editPlayers = () => {
    if (!confirmingSetup) {
      setConfirmingSetup(true);
      setTimeout(() => setConfirmingSetup(false), 3000);
      return;
    }
    onEditPlayers();
    setConfirmingSetup(false);
  };
  const names = (list) => gtJoinNames(list.map((p) => p.name), t);
  const holesTxt = (hs) => hs.map((h) => h + 1).join(", ");
  // Gesperrte Hauptaktion bleibt antippbar und fuehrt zur ersten fehlenden Person
  const showMissing = () => {
    const m = info.missing[0];
    const el = m && document.querySelector(`[data-mg-plus="${m.id}"]`);
    if (!el) return;
    const rm = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    el.scrollIntoView({ block: "center", behavior: rm ? "auto" : "smooth" });
    el.focus({ preventScroll: true });
  };
  const lastUndo = ui.undo.length ? ui.undo[ui.undo.length - 1] : null;
  // Hauptaktion je nach Zustand der Bahn bzw. der Tabelle
  let main = null,
    status = null,
    statusOk = false;
  if (tab === "table") {
    const dirtyHoles = Object.keys(ui.drafts).map(Number).sort((a, b) => a - b);
    const savable = mgSavableHoles(state);
    if (dirtyHoles.length) {
      main = { label: t("mgSaveChanges"), disabled: !savable.length, onClick: () => upd((s) => mgSaveAll(s)) };
      const blocked = dirtyHoles.filter((h) => !savable.includes(h));
      status = blocked.length ? blocked.map((h) => t("holeLabel")(h + 1) + ": " + t("mgStillOpen")(names(mgHoleInfo(ui, h).missing))).join(" · ") : t("mgDirtyHoles")(holesTxt(dirtyHoles));
    } else status = t("mgTableHint");
  } else if (info.dirty) {
    main = info.canSave ? { label: info.isNew ? t("mgSaveHole") : t("mgSaveChanges"), onClick: () => upd((s) => mgSave(s, hole)) } : { label: t("mgSaveHole"), blocked: true, onClick: showMissing };
    status = info.isNew && info.missing.length ? t("mgStillOpen")(names(info.missing)) : t("mgUnsaved");
  } else if (finished) {
    main = { label: t("mgShowResult"), onClick: () => setPodiumOpen(true), icon: "trophy" };
  } else if (info.done) {
    const nx = mgNextOpen(players, scores, hole);
    main = nx >= 0 ? { label: t("mgGoNext")(nx + 1), onClick: () => upd((s) => mgGoto(s, nx)), icon: "next" } : null;
    status = t("mgSaved");
    statusOk = true;
  } else {
    main = { label: info.isNew ? t("mgSaveHole") : t("mgSaveChanges"), blocked: true, onClick: showMissing };
    status = info.missing.length === players.length ? t("mgEnterHint") : t("mgStillOpen")(names(info.missing));
  }
  const glassBar = theme === "vitrum";
  const bar = (
    <div className="mgBar" style={{ position: "sticky", bottom: 0, zIndex: 5, margin: "2px -12px 0", padding: "8px 12px calc(6px + env(safe-area-inset-bottom))", ...(glassBar ? { background: "rgba(13,20,46,0.72)", backdropFilter: "blur(16px) saturate(1.4)", WebkitBackdropFilter: "blur(16px) saturate(1.4)", borderRadius: "22px 22px 0 0", borderTop: `1px solid ${mg.line}` } : { background: `linear-gradient(180deg, ${mg.bg}00, ${mg.bg}F2 14px, ${mg.bg} 30%)` }) }}>
      {status && (
        <div id="mg-status" role="status" aria-live="polite" style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, textAlign: "center", fontSize: 13.5, fontWeight: 600, color: statusOk ? mg.accInk : mg.muted, fontFamily: MG_UI, margin: "0 4px 8px", lineHeight: 1.35 }}>
          {statusOk && <CheckMark />}
          <span>{status}</span>
        </div>
      )}
      {main && (
        <button
          className="mgPress"
          data-mg-main="1"
          onClick={main.disabled ? undefined : main.onClick}
          disabled={!!main.disabled}
          aria-disabled={main.blocked ? "true" : undefined}
          aria-describedby={status ? "mg-status" : undefined}
          style={{
            width: "100%",
            minHeight: 52,
            border: "none",
            borderRadius: 18,
            background: main.disabled || main.blocked ? mg.track : mg.acc,
            color: main.disabled || main.blocked ? mg.muted : mg.onAcc,
            fontFamily: MINIGOLF_FONT,
            fontWeight: 700,
            fontSize: 19,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 10,
            cursor: main.disabled ? "default" : "pointer",
            boxShadow: main.disabled || main.blocked ? "none" : mg.ctaShadow,
          }}
        >
          {main.icon === "trophy" ? (
            <GameIcon name="trophy" size={20} color="currentColor" />
          ) : main.icon === "next" ? (
            <MgSvg size={20}>
              <path d="M5 12h14M13 6l6 6-6 6" />
            </MgSvg>
          ) : (
            <MgSvg size={20} sw={2}>
              <path d="M5 4h11l3 3v12a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1z" />
              <path d="M8 4v5h7V4M8 20v-6h8v6" />
            </MgSvg>
          )}
          <span>{main.label}</span>
        </button>
      )}
      <button
        className="mgPress"
        data-mg-undo="1"
        onClick={() => lastUndo && upd((s) => mgUndo(s))}
        disabled={!lastUndo}
        aria-label={lastUndo ? t("mgUndoAria")(holesTxt(lastUndo.holes)) : t("mgUndo")}
        style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, margin: "2px auto 0", minHeight: 40, padding: "0 16px", border: "none", background: "transparent", color: mg.muted, fontFamily: MG_UI, fontSize: 14.5, fontWeight: 600, cursor: lastUndo ? "pointer" : "default", opacity: lastUndo ? 1 : 0.45 }}
      >
        <MgSvg size={18} sw={2}>
          <path d="M9 7L5 11l4 4" />
          <path d="M5 11h9a5 5 0 0 1 0 10h-2" />
        </MgSvg>
        <span className="mg-undo-txt">{t("mgUndo") + (lastUndo ? " · " + t("holeLabel")(holesTxt(lastUndo.holes)) : "")}</span>
      </button>
    </div>
  );
  const winBanner = winnerIdx !== -1 && (
    <div className="reveal-1 mg-banner" role="status" style={{ color: mg.onAcc, borderRadius: 18, padding: "13px 14px", marginBottom: 12, fontSize: 15, fontWeight: 700, textAlign: "center", fontFamily: MINIGOLF_FONT, background: mg.acc }}>
      <GameIcon name="party" size={15} color="currentColor" style={{ verticalAlign: "-2px", marginRight: 6 }} />
      {gtWinLine(
        t,
        "minigolfWinsWith",
        "mgWinsTie",
        players.filter((_, i) => totals[i] === minTotal).map((q) => q.name),
        minTotal,
      )}
    </div>
  );
  const sideBtn = (on, onColor, onInk) => ({
    flex: 1,
    border: `1px solid ${on ? onColor : mg.line}`,
    borderRadius: 16,
    background: on ? onColor : mg.surf,
    color: on ? onInk : mg.muted,
    fontSize: 12,
    fontWeight: 700,
    letterSpacing: "0.03em",
    textTransform: "uppercase",
    padding: "10px 6px",
    minHeight: 48,
    cursor: "pointer",
    fontFamily: MG_UI,
  });
  return (
    <div className={"gtL-shellpage mgGL mg-land pl-page pl-head-compact" + (theme === "vitrum" ? " vitrum-active" : "")} style={{ ...minigolfPageShellStyle(theme), position: "relative", overflowX: "clip", paddingBottom: editing ? 290 : 24 }}>
      <style>
        {GLOBAL_STYLES}
        {MG_CSS}
        {MG_LAND_CSS}
      </style>
      {celebration}
      <PodiumOverlay
        gameId="minigolf"
        gameLabel={t("gameMinigolf")}
        open={podiumOpen}
        onClose={() => setPodiumOpen(false)}
        onRestart={onResetSheet}
        ranked={podiumRanked}
        tk={tk}
        t={t}
        bestRecord={{ isNew: golfIsNew }}
        theme={theme}
      />
      <div className="gtL-page gtL-game mg-inner" style={{ maxWidth: 520, margin: "0 auto", position: "relative" }}>
        <MinigolfTopBar subtitle={t("minigolfSubtitle")} onBack={onBack} theme={theme} t={t} onHome={onHome} onEndGame={onEndGame} rulesText={t("rulesMinigolf")} />
        <div className={"gtL-split gtL-e-block mg-split mg-tab-" + tab}>
          <div className="gtL-col-main mg-main">
            {winBanner}
            <MgSegmented tab={tab} onTab={(v) => upd((s) => ({ ...s, tab: v }))} mg={mg} t={t} />
            <div id="mg-panel" className="mg-panel" role="tabpanel" aria-labelledby={"mg-tab-" + tab}>
              {tab === "hole" ? (
                <React.Fragment>
                  <MgHoleCard ui={ui} hole={hole} onGo={(h) => upd((s) => mgGoto(s, h))} mg={mg} t={t} />
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {players.map((p) => {
                      const r = st.rows.find((x) => x.id === p.id);
                      return (
                        <MgPlayerCard
                          key={p.id}
                          p={p}
                          val={mgEff(ui, p.id, hole)}
                          isDraft={mgHasDraft(ui.drafts, hole, p.id)}
                          missing={info.isNew && info.dirty && mgEff(ui, p.id, hole) === null}
                          sofar={r ? r.total : 0}
                          countNote={r && !st.uniform ? t("mgHolesN")(r.count) : ""}
                          leads={lead.has(p.id)}
                          onStep={(dir) => upd((s) => mgStep(s, p.id, hole, dir))}
                          onPick={() => setEditing({ playerId: p.id, holeIdx: hole })}
                          mg={mg}
                          t={t}
                        />
                      );
                    })}
                  </div>
                  <MgStandingsBox className="mgPhoneOnly" st={st} finished={finished} onOpen={() => upd((s) => ({ ...s, tab: "table" }))} mg={mg} t={t} />
                </React.Fragment>
              ) : (
                <MgTable ui={ui} hole={hole} onCell={(pid, h) => setEditing({ playerId: pid, holeIdx: h })} mg={mg} t={t} />
              )}
            </div>
            {bar}
          </div>
          <div className="gtL-col-side mg-side">
            <div className="gtL-e-only">
              <MgStandingsBox st={st} finished={finished} onOpen={() => upd((s) => ({ ...s, tab: "table" }))} mg={mg} t={t} />
            </div>
            <div style={{ marginTop: 12 }} className="gtL-e-only">
              <GtRoundChart
                series={(() => {
                  const last = Math.max(
                    0,
                    ...players.map((p) => {
                      const c = scores[p.id] || [];
                      for (let k = c.length - 1; k >= 0; k--) if (c[k] !== null && c[k] !== undefined) return k + 1;
                      return 0;
                    }),
                  );
                  return players.map((p, i) => ({ id: p.id, name: p.name, color: mg.hues[i % mg.hues.length], vals: (scores[p.id] || []).slice(0, last) }));
                })()}
                ink={mg.ink}
                muted={mg.muted}
                card={mg.surf}
                border={mg.line}
                title={t("gtChartTitle")}
                theme={theme}
              />
            </div>
          </div>
          <div className="gtL-col-side2 mg-side2">
            <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
              <button
                className="mgPress"
                {...gtHold(() => {
                  onResetSheet();
                  setConfirmingReset(false);
                }, reset)}
                style={sideBtn(confirmingReset, mg.err, "#FFFFFF")}
              >
                {confirmingReset ? t("confirmAgain") : <GtHoldLabel label={t("newRound")} hint={t("gtHoldHint")} again={t("confirmAgain")} />}
              </button>
              <button className="mgPress" onClick={editPlayers} style={sideBtn(confirmingSetup, mg.acc, mg.onAcc)}>
                {confirmingSetup ? t("confirmAgain") : t("changePlayers")}
              </button>
            </div>
          </div>
        </div>
      </div>
      <MinigolfEditorPanel editing={editing} players={players} value={editing ? mgEff(ui, editing.playerId, editing.holeIdx) : null} onSave={saveDraft} onClose={() => setEditing(null)} t={t} mg={mg} />
    </div>
  );
}
function MinigolfGame({ state, setState, onBack, onHome, onEndGame, lang = "de", theme = "dark" }) {
  const t = useT(lang);
  const setPlayers = (updater) => setState((s) => ({ ...s, players: typeof updater === "function" ? updater(s.players) : updater }));
  const freshScores = (s) => {
    const scores = {};
    s.players.forEach((p) => (scores[p.id] = emptyMinigolfCard()));
    return scores;
  };
  const startGame = () => setState((s) => ({ ...s, ...mgFreshUi(), phase: "play", scores: freshScores(s) }));
  const resetSheet = () => setState((s) => ({ ...s, ...mgFreshUi(), scores: freshScores(s) }));
  const goToSetup = () => setState((s) => ({ ...s, phase: "setup" }));
  if (state.phase === "setup") {
    return (
      <div className={"gtL-shellpage" + (theme === "vitrum" ? " vitrum-active" : "")} style={minigolfPageShellStyle(theme)}>
        <style>{GLOBAL_STYLES}</style>
        <div className="gtL-page gtL-game" style={{ maxWidth: 380, margin: "0 auto", position: "relative", zIndex: 1 }}>
          <MinigolfTopBar subtitle={t("gtNewMatch")} onBack={onBack} theme={theme} t={t} onHome={onHome} rulesText={t("rulesMinigolf")} />
          <MinigolfSetup players={state.players} setPlayers={setPlayers} onStart={startGame} theme={theme} t={t} />
        </div>
      </div>
    );
  }
  return <MinigolfPlay state={state} setState={setState} onResetSheet={resetSheet} onEditPlayers={goToSetup} onBack={onBack} onHome={onHome} onEndGame={onEndGame} lang={lang} theme={theme} />;
} /*@gt-body-end*/
export {
  MINIGOLF_HOLES,
  MINIGOLF_MAX_STROKES,
  emptyMinigolfCard,
  minigolfTotal,
  minigolfOutSum,
  minigolfInSum,
  minigolfFilledCount,
  MINIGOLF_FONT,
  MinigolfTopBar,
  MinigolfSetup,
  MinigolfEditorPanel,
  MinigolfPlay,
  MinigolfGame,
};
