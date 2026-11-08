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
import { GtCol } from "../../shared/unit.js";
import { GtUbStyle } from "../../shared/unit-boards.js";
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
const MG_UNIT_CSS = `
.spieleblock-laptop-frame .mg-inner > .gt-gamehead { align-self: stretch; width: 100%; }
.spieleblock-laptop-frame .mg-split > .mg-main { display: flex !important; flex-direction: column; min-height: calc(100dvh - 150px) !important; }
.spieleblock-laptop-frame .mg-split > .mg-main > .mgBar { margin-top: auto !important; }

.gt-u-col .mgBar{margin-top:auto!important}
.gtL-content .gt-u-col .mgBar,[data-phone-landscape] .gt-u-col .mgBar{margin-top:2px!important}
.mgStar{display:flex;flex-direction:column;gap:0}
`;
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
const MG_ANTON = "'Anton', 'Space Grotesk', sans-serif";
const MG_CSS = `
.mgGL button { -webkit-tap-highlight-color: transparent; touch-action: manipulation; }
.mgGL .mgPress { min-height: 44px; transition: transform 140ms var(--gt-ease-out), background-color 160ms ease, border-color 160ms ease, color 160ms ease, opacity 160ms ease, box-shadow 160ms ease; }
.mgGL .mgPress:active:not(:disabled) { transform: scale(0.97); }
.mgGL .mgPress:disabled { cursor: default; }
@media (hover: hover) and (pointer: fine) { .mgGL .mgPress:hover:not(:disabled) { filter: brightness(1.07); } }
@font-face{font-family:'Anton';font-style:normal;font-weight:400;font-display:swap;src:url("./fonts/Anton-Regular.woff2") format('woff2');}
.mgGL .mgTile { position: relative; display: inline-flex; align-items: center; justify-content: center; width: 38px; height: 50px; border-radius: 7px; font-family: 'Anton', 'Space Grotesk', sans-serif; font-size: 34px; line-height: 1; overflow: hidden; box-shadow: inset 0 -3px 0 rgba(0,0,0,0.13), 0 2px 0 rgba(0,0,0,0.38); }
.mgGL .mgTile::after { content: ""; position: absolute; left: 0; right: 0; top: 50%; height: 1.5px; background: rgba(0,0,0,0.24); }
.mgGL .mgFlip { display: block; padding-top: 3px; animation: mgFlip 300ms var(--gt-ease-out); }
@keyframes mgFlip { from { transform: perspective(120px) rotateX(-75deg); opacity: 0.15; } to { transform: none; opacity: 1; } }
.mgGL .mgBallG { transition: transform 450ms cubic-bezier(0.23, 1, 0.32, 1); }
.mgGL .mgKeys { display: grid; grid-template-columns: repeat(7, minmax(0, 1fr)); gap: 4px; }
.mgGL .mgKey { display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 44px; padding: 0; border-radius: 12px; font-family: 'Anton', 'Space Grotesk', sans-serif; font-size: 20px; cursor: pointer; transition: transform 140ms var(--gt-ease-out), background-color 140ms ease, border-color 140ms ease, color 140ms ease; }
.mgGL .mgPc { transition: border-color 160ms ease; }
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
  .mgGL .mgBallG { transition: none; }
  .mgGL .mgFlip { animation: none; }
  .mgGL .mgKey, .mgGL .mgKey:active:not(:disabled) { transition: none; transform: none; }
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
function MinigolfTopBar({ subtitle, onBack, theme, t, onHome, rulesText, onEndGame, moreItems, onMenuOpen }) {
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
      moreItems={moreItems}
      onMenuOpen={onMenuOpen}
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
    <div className="gt-ub-fill">
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
          <span style={{ fontFamily: MINIGOLF_FONT, fontSize: 17, fontWeight: 700, color: mg.ink, minWidth: 0, overflowWrap: "break-word" }}>
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
function MgSegmented({ tab, onTab, mg, t, segOn, segInk }) {
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
          borderRadius: 12,
          background: on ? segOn : "transparent",
          color: on ? segInk : mg.muted,
          fontFamily: MINIGOLF_FONT,
          fontWeight: 700,
          fontSize: 15,
          cursor: "pointer",
          boxShadow: on ? "0 1px 2px rgba(0,0,0,0.12)" : "none",
        }}
      >
        {label}
      </button>
    );
  };
  return (
    <div role="tablist" aria-label={t("mgViewLabel")} className="mg-seg" style={{ display: "flex", gap: 2, padding: 2, borderRadius: 14, background: mg.surf, border: `1px solid ${mg.line}`, marginBottom: 8 }}>
      {item("hole", t("mgTabHole"))}
      {item("table", t("mgTabTable"))}
    </div>
  );
}
// Anzeigetafel: Farben des Objekts (Holzrahmen, Rasengruen). Im Hell-Theme bleibt die Tafel dunkelgruen, Noir graustufig.
function mgBoardTk(theme) {
  const noir = theme === "noir";
  return {
    frame: noir ? "#4A4A4A" : "#7A4E2A",
    inner: noir ? "#141414" : "#123A27",
    tile: noir ? "#DADADA" : "#F3EBD3",
    tileInk: noir ? "#111111" : "#123A27",
    lime: noir ? "#EDEDED" : "#D6F23A",
    ink: noir ? "#EDEDED" : "#F3EBD3",
    muted: noir ? "#A5A5A5" : "#A9C2B0",
    grass: noir ? "#262626" : "#1B4F33",
    grassHi: noir ? "#313131" : "#2C6644",
    dim: noir ? "rgba(237,237,237,0.34)" : "rgba(243,235,211,0.34)",
    flag: noir ? "#BDBDBD" : "#E5484D",
    pole: noir ? "#D6D6D6" : "#F3EBD3",
    hole: noir ? "#050505" : "#06140C",
    btn: noir ? "rgba(237,237,237,0.10)" : "rgba(243,235,211,0.12)",
  };
}
// Spielerkarten und Schlagtasten je Theme
function mgCardTk(theme, mg) {
  if (theme === "light") return { card: mg.surf, keyBg: mg.surf2, keyLine: mg.ctrlLine, keyOn: mg.acc, keyOnInk: "#FFFFFF" };
  if (theme === "noir") return { card: mg.surf, keyBg: "transparent", keyLine: mg.ctrlLine, keyOn: "#EDEDED", keyOnInk: "#0A0A0A" };
  return { card: "#163126", keyBg: "#1D3F32", keyLine: "#33594C", keyOn: "#D6F23A", keyOnInk: "#0B1411" };
}
function MgTile({ ch, b }) {
  return (
    <span className="mgTile" style={{ background: b.tile, color: b.tileInk }}>
      <span key={ch} className="mgFlip">
        {ch}
      </span>
    </span>
  );
}
// Live-Rangliste: gleicher Rang bei Gleichstand, vor der ersten gespeicherten Bahn Strich statt Rang
function MgRankList({ st, b, className, big }) {
  const n = st.rows.length;
  const two = !big && n > 4;
  return (
    <ol className={className} style={{ flex: "1 1 auto", minWidth: 0, margin: 0, padding: 0, listStyle: "none", display: "grid", gridTemplateColumns: two ? "minmax(0,1fr) minmax(0,1fr)" : "minmax(0,1fr)", gridTemplateRows: two ? `repeat(${Math.ceil(n / 2)}, auto)` : undefined, gridAutoFlow: two ? "column" : "row", columnGap: 12, rowGap: big ? 4 : 2, alignContent: "center" }}>
      {st.rows.map((r) => (
        <li key={r.id} data-mg-rank={r.id} style={{ display: "flex", alignItems: "center", gap: 8, minHeight: big ? 34 : 22, minWidth: 0 }}>
          <span style={{ fontFamily: MG_ANTON, fontSize: big ? 22 : 16, color: b.lime, minWidth: big ? 22 : 15, lineHeight: 1, fontVariantNumeric: "tabular-nums" }}>{r.rank == null ? "–" : r.rank}</span>
          <span title={r.name} style={{ flex: "1 1 auto", minWidth: 0, fontFamily: MG_UI, fontWeight: 700, fontSize: big ? 17 : 14, color: b.ink, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {r.name}
          </span>
          <span style={{ fontFamily: MG_ANTON, fontSize: big ? 24 : 17, color: b.lime, lineHeight: 1, fontVariantNumeric: "tabular-nums" }}>{r.sum}</span>
        </li>
      ))}
    </ol>
  );
}
const MG_TRACK_W = 340;
const MG_X0 = 20;
const MG_XH = 304;
const mgX = (i) => MG_X0 + (i * (MG_XH - MG_X0)) / (MINIGOLF_HOLES - 1);
// Bahnspur: Rasenstreifen mit 18 Markierungen, Bahn 18 ist das Loch mit Fahne. Der Ball rollt per CSS-Transition zur neuen Markierung.
function MgTrack({ hole, done, b, t }) {
  const last = hole >= MINIGOLF_HOLES - 1;
  const bx = last ? MG_XH - 16 : mgX(hole);
  const nDone = done.filter(Boolean).length;
  return (
    <svg className="mgTrackSvg" viewBox={`0 0 ${MG_TRACK_W} 58`} width="100%" role="img" aria-label={t("mgProgress")(nDone, MINIGOLF_HOLES)} focusable="false" style={{ display: "block", flex: "1 1 auto", minWidth: 0, maxHeight: 76 }}>
      <defs>
        <pattern id="mgGrassPat" width="28" height="12" patternUnits="userSpaceOnUse">
          <rect width="14" height="12" fill={b.grass} />
          <rect x="14" width="14" height="12" fill={b.grassHi} opacity="0.55" />
        </pattern>
        <clipPath id="mgTrailClip">
          <rect x={MG_X0} y="40" width={MG_XH - MG_X0} height="16" />
        </clipPath>
      </defs>
      <rect x="4" y="42" width="332" height="12" rx="6" fill="url(#mgGrassPat)" />
      <g clipPath="url(#mgTrailClip)">
        <g className="mgBallG" style={{ transform: `translateX(${bx}px)` }}>
          <line x1="-320" y1="48" x2="0" y2="48" stroke={b.lime} strokeWidth="2.6" strokeLinecap="round" strokeDasharray="0.1 6" />
        </g>
      </g>
      {Array.from({ length: MINIGOLF_HOLES - 1 }, (_, i) => {
        const x = mgX(i);
        return done[i] ? <circle key={i} cx={x} cy="48" r="3.2" fill={b.lime} /> : <circle key={i} cx={x} cy="48" r="2.1" fill={b.dim} />;
      })}
      <circle cx={mgX(Math.min(hole, MINIGOLF_HOLES - 2))} cy="48" r="5" fill="none" stroke={b.lime} strokeWidth="1.4" opacity={last ? 0 : 1} />
      <ellipse cx={MG_XH} cy="47" rx="12.5" ry="4.4" fill={b.grassHi} />
      <ellipse cx={MG_XH} cy="47" rx="8" ry="2.9" fill={b.hole} />
      <path d={`M${MG_XH} 47V7`} stroke={b.pole} strokeWidth="2.2" strokeLinecap="round" />
      <path d={`M${MG_XH + 1.1} 7.6l17 6.6-17 6.6z`} fill={b.flag} />
      <g className="mgBallG" style={{ transform: `translateX(${bx}px)` }}>
        <ellipse cx="0" cy="42.4" rx="5" ry="1.5" fill="#000" opacity="0.28" />
        <circle cx="0" cy="36.6" r="5.6" fill="#FFFFFF" />
        <circle cx="-1.7" cy="34.8" r="1.1" fill="#D9E2D6" />
        <circle cx="1.8" cy="38" r="0.9" fill="#D9E2D6" />
      </g>
    </svg>
  );
}
function MgBoard({ hole, done, st, onGo, b, t }) {
  const nav = (dir) => {
    const dis = dir < 0 ? hole <= 0 : hole >= MINIGOLF_HOLES - 1;
    return (
      <button
        className="mgPress mgNav"
        data-mg-nav={dir < 0 ? "prev" : "next"}
        onClick={() => !dis && onGo(hole + dir)}
        disabled={dis}
        aria-label={dir < 0 ? t("mgPrevHole") : t("mgNextHole")}
        style={{ width: 44, height: 44, borderRadius: "50%", border: "none", background: b.btn, color: b.ink, display: "grid", placeItems: "center", cursor: "pointer", opacity: dis ? 0.32 : 1, flexShrink: 0, padding: 0 }}
      >
        <MgSvg size={20} sw={2.4}>
          <path d={dir < 0 ? "M15 5l-7 7 7 7" : "M9 5l7 7-7 7"} />
        </MgSvg>
      </button>
    );
  };
  const num = String(hole + 1).padStart(2, "0");
  return (
    <section className="mgBoard" aria-label={t("mgHoleOf")(hole + 1, MINIGOLF_HOLES)} style={{ background: b.inner, border: `6px solid ${b.frame}`, borderRadius: 18, padding: "10px 8px 6px 12px", boxShadow: "0 12px 26px -16px rgba(0,0,0,0.65), inset 0 0 28px rgba(0,0,0,0.38)", marginBottom: 10 }}>
      <span className="mgSr" aria-live="polite" aria-atomic="true">
        {t("mgHoleOf")(hole + 1, MINIGOLF_HOLES)}
      </span>
      <div style={{ display: "flex", alignItems: "center", gap: 14, paddingRight: 4 }}>
        <div aria-hidden="true" data-mg-hole={hole + 1} style={{ flexShrink: 0, textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", gap: 3 }}>
          <span style={{ fontFamily: MG_UI, fontSize: 11, fontWeight: 800, letterSpacing: "0.2em", color: b.muted, textIndent: "0.2em", textTransform: "uppercase" }}>{t("mgTabHole")}</span>
          <div style={{ display: "flex", gap: 4 }}>
            <MgTile ch={num[0]} b={b} />
            <MgTile ch={num[1]} b={b} />
          </div>
          <span style={{ fontFamily: MG_UI, fontSize: 12, fontWeight: 600, color: b.muted }}>{t("mgOf")(MINIGOLF_HOLES)}</span>
        </div>
        <MgRankList className="mgPhoneOnly mgRank" st={st} b={b} />
        <span className="gtL-e-only" style={{ marginLeft: "auto", fontFamily: MG_UI, fontSize: 14, fontWeight: 600, color: b.muted }}>
          {t("mgProgress")(done.filter(Boolean).length, MINIGOLF_HOLES)}
        </span>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 0, marginTop: 4 }}>
        {nav(-1)}
        <MgTrack hole={hole} done={done} b={b} t={t} />
        {nav(1)}
      </div>
    </section>
  );
}
function MgPlayerCard({ p, val, missing, sofar, onKey, mg, c, t }) {
  const name = p.name || "";
  return (
    <div data-mg-card={p.id} className="mgPc" style={{ background: c.card, border: `1.5px ${missing ? "dashed" : "solid"} ${missing ? mg.accLine : "transparent"}`, borderRadius: 16, padding: "8px 8px 8px 10px", boxShadow: mg.shadow }}>
      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 10, marginBottom: 6, paddingRight: 2 }}>
        <span style={{ fontFamily: MINIGOLF_FONT, fontWeight: 700, fontSize: 17, color: mg.ink, lineHeight: 1.2, minWidth: 0, overflowWrap: "break-word", letterSpacing: "-0.01em" }}>{name}</span>
        <span style={{ flexShrink: 0, fontFamily: MG_UI, fontSize: 13, fontWeight: 600, color: mg.muted, whiteSpace: "nowrap" }}>
          {t("mgTotal")}{" "}
          <span data-mg-total={p.id} style={{ fontFamily: MG_ANTON, fontSize: 17, color: mg.ink, fontVariantNumeric: "tabular-nums", letterSpacing: "0.01em" }}>
            {sofar}
          </span>
        </span>
      </div>
      <div role="group" aria-label={t("strokesPlaceholder") + ", " + name} className="mgKeys">
        {Array.from({ length: MINIGOLF_MAX_STROKES }, (_, k) => k + 1).map((n) => {
          const on = val === n;
          const isMax = n === MINIGOLF_MAX_STROKES;
          return (
            <button
              key={n}
              className="mgPress mgKey"
              data-gt-sound="1"
              data-mg-key={p.id + "-" + n}
              data-mg-giveup={isMax ? "1" : undefined}
              onClick={() => onKey(on ? null : n)}
              aria-pressed={on ? "true" : "false"}
              aria-label={isMax ? t("mgStrokesFor")(name, n) + ", " + t("mgMaxHint")(MINIGOLF_MAX_STROKES) : t("mgStrokesFor")(name, n)}
              style={{ background: on ? c.keyOn : c.keyBg, color: on ? c.keyOnInk : mg.ink, border: `${isMax ? "1.5px dashed" : "1px solid"} ${on ? c.keyOn : c.keyLine}` }}
            >
              <span style={{ lineHeight: 1 }}>{n}</span>
              {isMax && <span style={{ fontFamily: MG_UI, fontSize: 8.5, fontWeight: 800, letterSpacing: "0.04em", textTransform: "uppercase", lineHeight: 1, marginTop: 2, color: on ? c.keyOnInk : mg.muted }}>{t("mgMaxShort")}</span>}
            </button>
          );
        })}
      </div>
    </div>
  );
}
// Rangliste als eigene Tafel (Laptop rechts, Handy quer): Titel oeffnet die Tabelle
function MgRankBoard({ st, onOpen, b, t, className }) {
  const title = st.common === 0 ? t("mgStandNone") : st.uniform ? t("mgStandAfter")(st.common) : t("mgStandCommon")(st.common);
  return (
    <section className={className} aria-label={title} style={{ background: b.inner, border: `6px solid ${b.frame}`, borderRadius: 18, padding: "2px 12px 10px", marginTop: 8, boxShadow: "0 12px 26px -16px rgba(0,0,0,0.65), inset 0 0 28px rgba(0,0,0,0.38)" }}>
      <button
        className="mgPress"
        onClick={onOpen}
        aria-label={title + ". " + t("mgOpenTable")}
        style={{ width: "100%", minHeight: 44, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, border: "none", background: "transparent", color: b.muted, fontFamily: MG_UI, fontSize: 13, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", padding: "0 2px", cursor: "pointer", textAlign: "left" }}
      >
        <span>{title}</span>
        <MgSvg size={18}>
          <path d="M9 5l7 7-7 7" />
        </MgSvg>
      </button>
      <MgRankList st={st} b={b} big />
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
    <div ref={wrapRef} className="mgTableWrap" role="region" aria-label={t("mgTabTable")} tabIndex={0} style={{ background: mg.surf, border: `1px solid ${mg.line}`, borderRadius: 20, boxShadow: mg.shadow }}>
      <table style={{ borderCollapse: "separate", borderSpacing: 0, width: "100%", minWidth: 52 + ps.length * 60 }}>
        <thead>
          <tr>
            <th scope="col" className="mgSticky" style={{ ...thBase, background: mg.solid, textAlign: "left", paddingLeft: 10, color: mg.muted, width: 52, borderTopLeftRadius: 20, ...(pl ? { zIndex: 3 } : null) }}>
              {t("mgTabHole")}
            </th>
            {ps.map((p) => (
              <th key={p.id} scope="col" title={p.name} style={thBase}>
                <span style={{ display: "block", maxWidth: 110, margin: "0 auto", overflowWrap: "break-word", hyphens:"none", lineHeight: 1.2 }}>{p.name}</span>
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
  const [nudge, setNudge] = useState(false);
  const t = useT(lang);
  const mg = minigolfTokens(theme);
  const bt = mgBoardTk(theme);
  const ct = mgCardTk(theme, mg);
  const segOn = theme === "light" ? mg.acc : mg.segBg;
  const segInk = theme === "light" ? "#FFFFFF" : mg.segInk;
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
  const doneHoles = Array.from({ length: MINIGOLF_HOLES }, (_, h) => mgHoleComplete(players, scores, h));
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
  const resetDone = () => {
    onResetSheet();
    setConfirmingReset(false);
  };
  const resetTap = () => {
    reset();
  };
  const teamsTap = () => {
    editPlayers();
  };
  const mgItems = [
    { key: "new", icon: "restart", label: t("newRound"), hold: resetDone },
    { key: "teams", icon: "users", label: t("changePlayers"), onClick: teamsTap, confirming: confirmingSetup, confirmLabel: t("confirmAgain"), twoStep: true },
  ];
  const names = (list) => gtJoinNames(list.map((p) => p.name), t);
  const holesTxt = (hs) => hs.map((h) => h + 1).join(", ");
  // Gesperrte Hauptaktion bleibt antippbar: markiert die Karten ohne Wert, kein automatisches Scrollen
  const showMissing = () => {
    const m = info.missing[0];
    setNudge(true);
    setTimeout(() => setNudge(false), 1400);
    const el = m && document.querySelector(`[data-mg-card="${m.id}"] button`);
    if (el) el.focus({ preventScroll: true });
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
    main = info.canSave ? { label: info.isNew ? t("mgSaveHoleN")(hole + 1) : t("mgSaveChanges"), onClick: () => upd((s) => mgSave(s, hole)) } : { label: t("mgSaveHoleN")(hole + 1), sub: t("mgOpenCount")(info.missing.length), blocked: true, onClick: showMissing };
    status = info.isNew && info.missing.length ? t("mgStillOpen")(names(info.missing)) : t("mgUnsaved");
  } else if (finished) {
    main = { label: t("mgShowResult"), onClick: () => setPodiumOpen(true), icon: "trophy" };
  } else if (info.done) {
    const nx = mgNextOpen(players, scores, hole);
    main = nx >= 0 ? { label: t("mgGoNext")(nx + 1), sub: t("mgSaved"), onClick: () => upd((s) => mgGoto(s, nx)), icon: "next" } : null;
    status = t("mgSaved");
    statusOk = true;
  } else {
    main = { label: info.isNew ? t("mgSaveHoleN")(hole + 1) : t("mgSaveChanges"), sub: t("mgOpenCount")(info.missing.length), blocked: true, onClick: showMissing };
    status = info.missing.length === players.length ? t("mgEnterHint") : t("mgStillOpen")(names(info.missing));
  }
  const barBtn = { width: 56, height: 56, minHeight: 56, flexShrink: 0, borderRadius: 18, display: "grid", placeItems: "center", padding: 0, cursor: "pointer" };
  const bar = (
    <div className="mgBar" style={{ margin: "10px 0 0", padding: "0 0 calc(4px + env(safe-area-inset-bottom))" }}>
      {status && (
        <div id="mg-status" role="status" aria-live="polite" className={tab === "table" ? undefined : "mgSr"} style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, textAlign: "center", fontSize: 13.5, fontWeight: 600, color: statusOk ? mg.accInk : mg.muted, fontFamily: MG_UI, margin: "0 4px 8px", lineHeight: 1.35 }}>
          {statusOk && <CheckMark />}
          <span>{status}</span>
        </div>
      )}
      <div className="mgBarRow" style={{ display: "flex", alignItems: "stretch", gap: 8 }}>
        <button
          className="mgPress"
          data-mg-undo="1"
          onClick={() => lastUndo && upd((s) => mgUndo(s))}
          disabled={!lastUndo}
          aria-label={lastUndo ? t("mgUndoAria")(holesTxt(lastUndo.holes)) : t("mgUndo")}
          title={t("mgUndo")}
          style={{ ...barBtn, border: `1px solid ${mg.ctrlLine}`, background: mg.surf, color: mg.ink, opacity: lastUndo ? 1 : 0.4, cursor: lastUndo ? "pointer" : "default" }}
        >
          <MgSvg size={22} sw={2}>
            <path d="M9 7L5 11l4 4" />
            <path d="M5 11h9a5 5 0 0 1 0 10h-2" />
          </MgSvg>
          <span className="mgSr mg-undo-txt">{t("mgUndo") + (lastUndo ? " " + t("holeLabel")(holesTxt(lastUndo.holes)) : "")}</span>
        </button>
        {main && (
          <button
            className="mgPress"
            data-mg-main="1"
            onClick={main.disabled ? undefined : main.onClick}
            disabled={!!main.disabled}
            aria-disabled={main.blocked ? "true" : undefined}
            aria-describedby={status ? "mg-status" : undefined}
            style={{
              flex: "1 1 auto",
              minWidth: 0,
              minHeight: 56,
              border: "none",
              borderRadius: 18,
              background: main.disabled || main.blocked ? mg.track : mg.acc,
              color: main.disabled || main.blocked ? mg.muted : mg.onAcc,
              fontFamily: MINIGOLF_FONT,
              fontWeight: 700,
              fontSize: 18,
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
            <span style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", lineHeight: 1.15, minWidth: 0 }}>
              <span>{main.label}</span>
              {main.sub && <span style={{ fontFamily: MG_UI, fontSize: 12.5, fontWeight: 600, opacity: 0.85 }}>{main.sub}</span>}
            </span>
          </button>
        )}
      </div>
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
    <div className={"gtL-shellpage mgGL mg-land pl-page pl-head-compact"} style={{ ...minigolfPageShellStyle(theme), position: "relative", overflowX: "clip", paddingBottom: editing ? 290 : 24 }}>
      <style>
        {GLOBAL_STYLES}
        {MG_CSS}
        {MG_LAND_CSS}
        {MG_UNIT_CSS}
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
        shareExtra={() => ({ players: players.map((p, i) => ({ name: p.name, total: totals[i], strokes: Array.from({ length: MINIGOLF_HOLES }, (_, h) => { const v = (scores[p.id] || [])[h]; return v == null || v === "" ? null : Number(v); }) })) })}
      />
      <GtCol accent={mg.acc} className="gtL-page gtL-game mg-inner" style={{ maxWidth: 520, margin: "0 auto" }}>
        <MinigolfTopBar subtitle={t("minigolfSubtitle")} onBack={onBack} theme={theme} t={t} onHome={onHome} onEndGame={onEndGame} moreItems={mgItems} onMenuOpen={() => setEditing(null)} rulesText={t("rulesMinigolf")} />
        <div className={"gtL-split gtL-e-block mg-split mg-tab-" + tab}>
          <div className="gtL-col-main mg-main">
            {winBanner}
            <MgSegmented tab={tab} onTab={(v) => upd((s) => ({ ...s, tab: v }))} mg={mg} t={t} segOn={segOn} segInk={segInk} />
            <div id="mg-panel" className="mg-panel" role="tabpanel" aria-labelledby={"mg-tab-" + tab}>
              {tab === "hole" ? (
                <React.Fragment>
                  <MgBoard hole={hole} done={doneHoles} st={st} onGo={(h) => upd((s) => mgGoto(s, h))} b={bt} t={t} />
                  <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                    {players.map((p) => {
                      const r = st.rows.find((x) => x.id === p.id);
                      const v = mgEff(ui, p.id, hole);
                      return <MgPlayerCard key={p.id} p={p} val={v} missing={nudge && v === null} sofar={r ? r.total : 0} onKey={(n) => upd((s) => mgSetDraft(s, p.id, hole, n))} mg={mg} c={ct} t={t} />;
                    })}
                  </div>
                </React.Fragment>
              ) : (
                <MgTable ui={ui} hole={hole} onCell={(pid, h) => setEditing({ playerId: pid, holeIdx: h })} mg={mg} t={t} />
              )}
            </div>
            {bar}
          </div>
          <div className="gtL-col-side mg-side">
            <div className="gtL-e-only">
              <MgRankBoard st={st} onOpen={() => upd((s) => ({ ...s, tab: "table" }))} b={bt} t={t} />
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
          </div>
        </div>
      </GtCol>
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
      <div className={"gtL-shellpage"} style={minigolfPageShellStyle(theme)}>
        <style>{GLOBAL_STYLES}</style>
        <div className="gtL-page gtL-game" style={{ maxWidth: 380, margin: "0 auto", position: "relative", zIndex: 1 }}>
          <GtCol accent={minigolfTokens(theme).acc}>
            <GtUbStyle />
            <MinigolfTopBar subtitle={t("gtNewMatch")} onBack={onBack} theme={theme} t={t} onHome={onHome} rulesText={t("rulesMinigolf")} />
            <MinigolfSetup players={state.players} setPlayers={setPlayers} onStart={startGame} theme={theme} t={t} />
          </GtCol>
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
