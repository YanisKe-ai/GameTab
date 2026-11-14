// Stadt Land Fluss: jede Person spielt auf dem eigenen Handy, die Handys sind nicht verbunden.
// Buchstabe wird aus der ersten Antwort erkannt, Kategorien teilt man per Kurzcode, QR-Code oder Link.
// Zustand: lokal in SlfGame, gebuendelt (300 ms) in den App-Zustand "slf" geschrieben (Weiterspielen, Sicherung).
import { React } from "../../vendor/react-globals.js";
import { useEffect, useMemo, useRef, useState } from "../../prelude.js";
import { GLOBAL_STYLES } from "../../styles/global.js";
import { useT } from "../../i18n/use-t.js";
import { GameHeader } from "../../shared/game-header.js";
import { GtCol, GtDock } from "../../shared/unit.js";
import { GtChips, GtStartBar, gtSkin } from "../../shared/setup-ui.js";
import { GtTimerRing, PodiumOverlay, useCelebration } from "../../shared/podium.js";
import { useGtRecord } from "../../stats/match-log.js";
import { rankedPodium } from "../../shared/ranking.js";
import { hapticTap, playTapSound, timeUpAlert } from "../../shared/sound.js";
import { useGtDialog } from "../../shared/dialog.js";
import { gtGetProfile } from "../../shared/profile.js";
import { gtToast } from "../../shared/toast.js";
import { SLF_CATS, SLF_GROUPS, slfCatName, slfGroupName } from "../../content/slf-categories.js";
import { cleanCustom, slfBuildLink, slfEncode, slfFormatCode, slfParseInput, slfParseLink } from "./code.js";
import { slfQr, slfQrPath } from "./qr-gen.js";
import { DEFAULT_SLF, LETTERS, SLF_MAX_CATS, SLF_MIN_CATS, SLF_POINTS, SLF_TIMERS, detectLetter, firstLetter, freshGame, freshRound, isOff, roundSum, slfNormalize, totalOf } from "./logic.js";
import { SlfLogo } from "./logo.js";
import { SLF_CSS, SLF_FONTS, slfTk, slfVars } from "./styles.js";
import "./text.js";

const ic = { fill: "none", stroke: "currentColor", strokeWidth: 2.2, strokeLinecap: "round", strokeLinejoin: "round" };
const IcX = () => <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" {...ic} /></svg>;
const IcCheck = () => <svg className="ck" width="16" height="16" viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7" {...ic} strokeWidth="3" /></svg>;
const IcPen = () => <svg width="15" height="15" viewBox="0 0 24 24" aria-hidden="true"><path d="M4 20l1-4L16.5 4.5a2.1 2.1 0 013 3L8 19l-4 1z" {...ic} /></svg>;
const IcShuffle = () => <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true"><path d="M3 7h3c5 0 6 10 11 10h4M3 17h3c1.6 0 2.7-.9 3.6-2.2M14.4 9.2C15.3 7.9 16.4 7 18 7h3M18 4l3 3-3 3M18 14l3 3-3 3" {...ic} /></svg>;
const IcQr = () => <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true"><path d="M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4zM14 14h3v3h-3zM20 14v6h-3M14 20h.01" {...ic} /></svg>;
const IcKey = () => <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true"><path d="M3 12h4M5 9v6M10 9h11v6H10zM14 12h.01M17.5 12h.01" {...ic} strokeWidth="2" /></svg>;
const IcStop = () => <svg width="34" height="34" viewBox="0 0 34 34" aria-hidden="true"><path d="M11 2h12l9 9v12l-9 9H11l-9-9V11z" fill="rgba(255,255,255,.18)" stroke="currentColor" strokeWidth="2.6" strokeLinejoin="round" /><rect x="10" y="10" width="14" height="14" rx="2" fill="currentColor" /></svg>;

// Sicherer Wert fuer React-Keys und Namen
const pad2 = (n) => String(n);

// Zeigt, wie viele Zeichen noch passen (iOS-Tastatur: 16 px Schrift gegen Zoom).
function useKbInset() {
  useEffect(() => {
    const vv = window.visualViewport;
    if (!vv) return undefined;
    const f = () => {
      const inset = Math.max(0, Math.round(window.innerHeight - vv.height - vv.offsetTop));
      document.documentElement.style.setProperty("--slf-kb", (inset > 80 ? inset : 0) + "px");
    };
    f();
    vv.addEventListener("resize", f);
    vv.addEventListener("scroll", f);
    return () => { vv.removeEventListener("resize", f); vv.removeEventListener("scroll", f); document.documentElement.style.removeProperty("--slf-kb"); };
  }, []);
}

// Link ?slf=CODE (und &slfc=Eigene) beim Start der App: Einrichtung mit diesen Kategorien oeffnen.
function useGtSlfLink(loaded, slf, setSlf, setView) {
  const done = useRef(false);
  useEffect(() => {
    if (!loaded || done.current) return;
    done.current = true;
    try {
      const u = new URL(window.location.href);
      if (!u.searchParams.has("slf")) return;
      const parsed = slfParseLink(u.search);
      u.searchParams.delete("slf"); u.searchParams.delete("slfc");
      window.history.replaceState(null, "", u.toString());
      if (!parsed) return;
      setSlf((prev) => {
        const p = slfNormalize(prev);
        const busy = p.phase === "play" && (p.rounds.length > 0 || p.answers.some((a) => a.trim()));
        if (busy) return p;
        return slfNormalize({ ...DEFAULT_SLF, timer: p.timer, cats: parsed.ids, custom: parsed.custom, joined: true });
      });
      setView("slf");
    } catch (e) { /* Link unlesbar: ignorieren */ }
  }, [loaded]);
}

// ---------------------------------------------------------------- Bausteine

function Sheet({ open, onClose, title, children, label }) {
  const ref = useGtDialog({ open, onClose });
  const idRef = useRef("slf-sh-" + Math.random().toString(36).slice(2, 7));
  if (!open) return null;
  return <div className="slf-ov" onClick={onClose}>
    <div ref={ref} role="dialog" aria-modal="true" aria-labelledby={idRef.current} className="slf-box" onClick={(e) => e.stopPropagation()}>
      <div className="slf-boxh"><h2 id={idRef.current}>{title}</h2><button type="button" className="slf-x" onClick={onClose} aria-label={label}><IcX /></button></div>
      {children}
    </div>
  </div>;
}

function AlphaStrip({ used, cur, t }) {
  const usedList = LETTERS.filter((l) => used.includes(l));
  return <div className="slf-strip" role="img" aria-label={usedList.length ? usedList.join(", ") + " " + t("slfUsedLetter") : "A bis Z"}>
    {LETTERS.map((l) => <span key={l} className={(used.includes(l) ? "is-used " : "") + (cur === l ? "is-cur" : "")}>{l}</span>)}
  </div>;
}

function RoundsTable({ cols, rounds, t, lang }) {
  const n = cols.length;
  const colTot = cols.map((_, i) => rounds.reduce((s, r) => s + (r.pts[i] || 0), 0));
  const all = totalOf(rounds);
  return <div className="slf-tw"><table className="slf-table">
    <thead><tr>
      <th className="l" scope="col"><span className="slf-sr">{t("slfRoundSum")}</span></th>
      {cols.map((c) => <th key={c.k} scope="col"><div className="th" title={c.name}>{c.name}</div></th>)}
      <th className="s" scope="col"><div className="th" style={{ color: "var(--s-ink)" }}>{t("slfTotal")}</div></th>
    </tr></thead>
    <tbody>
      {rounds.map((r, ri) => <tr key={ri}>
        <td className="l" scope="row">{r.letter}</td>
        {Array.from({ length: n }, (_, i) => <td key={i} className={r.pts[i] ? "" : "z"}>{r.pts[i] || 0}</td>)}
        <td className="s">{r.sum}</td>
      </tr>)}
    </tbody>
    {rounds.length > 1 && <tfoot><tr>
      <td className="l">Σ</td>
      {colTot.map((v, i) => <td key={i}>{v}</td>)}
      <td className="s">{all}</td>
    </tr></tfoot>}
  </table></div>;
}

function QrView({ link, t }) {
  const qr = useMemo(() => slfQr(link), [link]);
  if (!qr) return null;
  const { d, box } = slfQrPath(qr, 3);
  return <svg className="slf-qr" viewBox={`0 0 ${box} ${box}`} role="img" aria-label="QR" shapeRendering="crispEdges"><rect width={box} height={box} fill="#fff" /><path d={d} fill="#000" /></svg>;
}

function ShareSheet({ open, onClose, S, t }) {
  const ids = S.cats, custom = S.custom;
  const code = slfEncode(ids);
  const link = slfBuildLink(ids, custom);
  const qrOk = useMemo(() => !!slfQr(link), [link]);
  const qrLink = qrOk ? link : slfBuildLink(ids, []);
  const copy = () => {
    const done = () => gtToast(t("slfLinkCopied"), { ms: 2500 });
    try { navigator.clipboard.writeText(link).then(done, done); } catch (e) { done(); }
  };
  return <Sheet open={open} onClose={onClose} title={t("slfShareTitle")} label={t("slfClose")}>
    <p className="slf-hint" style={{ margin: "0 0 4px" }}>{t("slfShareHow")}</p>
    <div className="slf-h" style={{ textAlign: "center", marginTop: 10, marginBottom: 0 }}>{t("slfCodeLabel")}</div>
    <span className="slf-code" aria-label={code ? String(code).split("").join(" ") : ""}>{slfFormatCode(code || "")}</span>
    <QrView link={qrLink} t={t} />
    {custom.length > 0 && <p className="slf-status">{t("slfCustomNote")}</p>}
    {!qrOk && <p className="slf-status bad" role="status">{t("slfQrLong")}</p>}
    <div className="slf-btns"><button type="button" className="slf-btn" onClick={copy}>{t("slfCopyLink")}</button></div>
  </Sheet>;
}

function LetterSheet({ open, onClose, cur, manual, used, onPick, onAuto, t }) {
  return <Sheet open={open} onClose={onClose} title={t("slfPickLetter")} label={t("slfClose")}>
    <div className="slf-lgrid" role="group" aria-label={t("slfPickLetter")}>
      {LETTERS.map((l) => <button key={l} type="button" className={"slf-lb" + (used.includes(l) ? " is-used" : "")} aria-pressed={cur === l} aria-label={l + (used.includes(l) ? ", " + t("slfUsedLetter") : "")} onClick={() => onPick(l)}>{l}</button>)}
    </div>
    {manual && <div className="slf-btns"><button type="button" className="slf-ghost is-block" onClick={onAuto}>{t("slfAutoLetter")}</button></div>}
  </Sheet>;
}

function EndSheet({ open, onClose, total, hasOpen, onSolo, onShow, t }) {
  const prof = useMemo(() => { try { const p = gtGetProfile(); return p ? p.name : ""; } catch (e) { return ""; } }, []);
  const [me, setMe] = useState(prof);
  const [rows, setRows] = useState([{ name: "", pts: "" }, { name: "", pts: "" }]);
  const valid = rows.filter((r) => r.name.trim() && r.pts !== "" && Number.isFinite(Number(r.pts)));
  const needName = valid.length > 0 && !me.trim();
  const setRow = (i, k, v) => setRows((rs) => rs.map((r, j) => (j === i ? { ...r, [k]: v } : r)));
  const show = () => {
    if (!valid.length || !me.trim()) return;
    const seen = new Set([me.trim().toLowerCase()]);
    const others = [];
    valid.forEach((r) => { const k = r.name.trim().toLowerCase(); if (seen.has(k)) return; seen.add(k); others.push({ name: r.name.trim().slice(0, 24), pts: Math.max(0, Math.round(Number(r.pts))) }); });
    if (others.length) onShow(me.trim().slice(0, 24), others);
  };
  return <Sheet open={open} onClose={onClose} title={t("slfEndTitle")} label={t("slfClose")}>
    <p className="slf-hint" style={{ margin: "0 0 10px", fontSize: 14 }}>{t("slfEndText")}</p>
    {hasOpen && <p className="slf-status" style={{ margin: "0 0 10px" }}>{t("slfEndOpenRound")}</p>}
    <div className="slf-h">{t("slfYourScore")(total)}</div>
    <input className="slf-input" style={{ width: "100%", marginBottom: 14 }} value={me} maxLength={24} onChange={(e) => setMe(e.target.value)} placeholder={t("slfYourName")} aria-label={t("slfYourName")} autoCapitalize="words" autoCorrect="off" enterKeyHint="next" />
    {rows.map((r, i) => <div className="slf-rowin" key={i}>
      <input className="slf-input nm" value={r.name} maxLength={24} onChange={(e) => setRow(i, "name", e.target.value)} placeholder={t("slfOtherName")} aria-label={t("slfOtherName") + " " + (i + 1)} autoCapitalize="words" autoCorrect="off" enterKeyHint="next" />
      <input className="slf-input pt" value={r.pts} inputMode="numeric" pattern="[0-9]*" maxLength={5} onChange={(e) => setRow(i, "pts", e.target.value.replace(/[^0-9]/g, ""))} placeholder={t("slfOtherPts")} aria-label={t("slfOtherPts") + " " + (i + 1)} enterKeyHint="done" />
      {rows.length > 1 ? <button type="button" data-gt-nohaptic="1" className="x" aria-label={t("slfRemove")(r.name || String(i + 1))} onClick={() => setRows((rs) => rs.filter((_, j) => j !== i))}><IcX /></button> : <span className="x" />}
    </div>)}
    {rows.length < 12 && <button type="button" data-gt-nohaptic="1" className="slf-ghost" onClick={() => setRows((rs) => [...rs, { name: "", pts: "" }])}>{t("slfAddPerson")}</button>}
    {needName && <p className="slf-status bad" role="status">{t("slfNameNeeded")}</p>}
    <div className="slf-btns">
      <button type="button" className="slf-btn" disabled={!valid.length || !me.trim()} onClick={show}>{t("slfShowResult")}</button>
      <button type="button" className="slf-ghost is-block" onClick={onSolo}>{t("slfEndSolo")}</button>
      <button type="button" className="slf-ghost is-block" onClick={onClose}>{t("slfCancel")}</button>
    </div>
  </Sheet>;
}

// ---------------------------------------------------------------- Einrichtung

function Setup({ S, upd, t, lang, theme, tk, onStart, onShow }) {
  const [codeIn, setCodeIn] = useState("");
  const [msg, setMsg] = useState(null);
  const [own, setOwn] = useState("");
  const gtS = gtSkin(theme, { pageBg: tk.pageBg, card: tk.card, ink: tk.ink, muted: tk.muted, gold: tk.acc }, "slf", { acc: tk.acc, font: "'Inter', sans-serif" });
  const total = S.cats.length + S.custom.length;
  const full = total >= SLF_MAX_CATS;
  const items = [...S.cats.map((id) => ({ k: "p" + id, name: slfCatName(id, lang), rm: () => upd((s) => ({ ...s, cats: s.cats.filter((x) => x !== id), joined: false })) })), ...S.custom.map((c, i) => ({ k: "c" + i, name: c, rm: () => upd((s) => ({ ...s, custom: s.custom.filter((_, j) => j !== i), joined: false })) }))];
  const toggle = (id) => upd((s) => {
    if (s.cats.includes(id)) return { ...s, cats: s.cats.filter((x) => x !== id), joined: false };
    if (s.cats.length + s.custom.length >= SLF_MAX_CATS) return s;
    return { ...s, cats: [...s.cats, id].sort((a, b) => a - b), joined: false };
  });
  const addOwn = () => {
    const c = cleanCustom(own);
    if (!c || full || S.custom.some((x) => x.toLowerCase() === c.toLowerCase())) return;
    upd((s) => ({ ...s, custom: [...s.custom, c], joined: false }));
    setOwn("");
  };
  const mix = () => upd((s) => {
    const want = Math.min(SLF_MAX_CATS - s.custom.length, Math.max(SLF_MIN_CATS - s.custom.length, 7 - s.custom.length));
    const pool = SLF_CATS.map((_, i) => i);
    for (let i = pool.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [pool[i], pool[j]] = [pool[j], pool[i]]; }
    return { ...s, cats: pool.slice(0, Math.max(0, want)).sort((a, b) => a - b), joined: false };
  });
  const apply = () => {
    const p = slfParseInput(codeIn);
    if (!p || (!p.ids.length && !p.custom.length)) { setMsg({ ok: false, text: t("slfCodeBad") }); return; }
    const ids = p.ids.slice(0, SLF_MAX_CATS);
    upd((s) => ({ ...s, cats: ids, custom: p.custom.slice(0, Math.max(0, SLF_MAX_CATS - ids.length)), joined: false }));
    setMsg({ ok: true, text: t("slfCodeOk")(ids.length + p.custom.length) });
    setCodeIn("");
  };
  const grp = SLF_GROUPS[S.grp] ? S.grp : 0;
  const inGroup = SLF_CATS.map((c, i) => ({ c, i })).filter((x) => x.c.g === grp);
  const countIn = (g) => S.cats.filter((id) => SLF_CATS[id] && SLF_CATS[id].g === g).length;
  const need = SLF_MIN_CATS - total;

  return <React.Fragment>
    <div className="gtL-split gtL-split-setup"><div className="gtL-col-main slf-body">
      <div className="slf-paper">
        <div className="slf-mini-wrap">
          <div className="slf-mini-head"><b>{t("slfSheet")}</b><span aria-live="polite">{t("slfCatsCount")(total)}</span></div>
          {items.length === 0 ? <p className="slf-empty">{t("slfSheetEmpty")}</p> : <ul className="slf-mini-list">
            {items.map((it) => <li key={it.k} className={it.name.length > 14 ? "wide" : undefined}><span className="nm" title={it.name}>{it.name}</span><button type="button" className="x" aria-label={t("slfRemove")(it.name)} onClick={it.rm}><IcX /></button></li>)}
          </ul>}
          <div className="slf-mini-actions">
            <button type="button" className="slf-ghost" onClick={mix}><IcShuffle />{t("slfMix")}</button>
            {items.length > 0 && <button type="button" className="slf-ghost" onClick={() => upd((s) => ({ ...s, cats: [], custom: [], joined: false }))}>{t("slfClear")}</button>}
          </div>
        </div>
      </div>
      {S.joined && <p className="slf-status ok" role="status" style={{ margin: "-6px 2px 0" }}>{t("slfCodeOk")(total)}</p>}

      <div>
        <div className="slf-h">{t("slfCats")}</div>
        <div className="slf-groups" role="group" aria-label={t("slfCats")}>
          {SLF_GROUPS.map((g, gi) => <button key={g.id} type="button" className="slf-chip" aria-pressed={gi === grp} onClick={() => upd((s) => ({ ...s, grp: gi }))}>{slfGroupName(gi, lang)}{countIn(gi) > 0 && <span className="n">{countIn(gi)}</span>}</button>)}
        </div>
        <div className="slf-chips" style={{ marginTop: 10 }}>
          {inGroup.map(({ i }) => { const on = S.cats.includes(i); const dis = !on && full; return <button key={i} type="button" className="slf-chip" aria-pressed={on} aria-disabled={dis ? "true" : undefined} onClick={() => { if (!dis) toggle(i); }}>{on && <IcCheck />}{slfCatName(i, lang)}</button>; })}
        </div>
        {full && <p className="slf-status" role="status">{t("slfMaxHint")}</p>}
      </div>

      <div>
        <div className="slf-h">{t("slfOwn")}</div>
        <div className="slf-own">
          <input className="slf-input" value={own} maxLength={32} onChange={(e) => setOwn(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addOwn(); } }} placeholder={t("slfOwnPlaceholder")} aria-label={t("slfOwn")} enterKeyHint="done" autoCapitalize="sentences" autoCorrect="off" />
          <button type="button" data-gt-nohaptic="1" className="slf-ghost" disabled={!cleanCustom(own) || full} onClick={addOwn}>{t("slfAdd")}</button>
        </div>
      </div>
    </div><div className="gtL-col-side slf-body">
      <div><div className="slf-h">{t("slfTimer")}</div><GtChips options={SLF_TIMERS} value={S.timer} onChange={(v) => upd((s) => ({ ...s, timer: v }))} skin={gtS} t={t} fmt={(v) => (v === 0 ? t("slfTimerOff") : t("slfSec")(v))} /></div>
      <div className="slf-card">
        <div className="slf-h">{t("slfShare")}</div>
        <button type="button" className="slf-ghost is-block" disabled={total < 1} onClick={onShow}><IcQr />{t("slfShowCode")}</button>
        <div className="slf-own is-stack" style={{ marginTop: 10 }}>
          <input className="slf-input" value={codeIn} onChange={(e) => { setCodeIn(e.target.value); setMsg(null); }} onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); apply(); } }} placeholder={t("slfCodePh")} aria-label={t("slfEnterCode")} enterKeyHint="go" autoCapitalize="characters" autoCorrect="off" spellCheck={false} />
          <button type="button" className="slf-ghost" disabled={!codeIn.trim()} onClick={apply}><IcKey />{t("slfCodeApply")}</button>
        </div>
        {msg && <p className={"slf-status " + (msg.ok ? "ok" : "bad")} role="status">{msg.text}</p>}
      </div>
    </div></div>
    <GtStartBar onClick={onStart} disabled={need > 0 || total > SLF_MAX_CATS} label={need > 0 ? t("slfNeed")(need) : t("slfStart")} skin={gtS} />
  </React.Fragment>;
}

// ---------------------------------------------------------------- Runde schreiben

function Play({ S, upd, cols, eff, t, left, tk, onLetter, onStartRound, firstRef }) {
  const locked = S.stage !== "write";
  const ready = S.stage === "ready";
  const used = S.rounds.map((r) => r.letter);
  const inputs = useRef([]);
  const focusNext = (i) => {
    if (i + 1 < cols.length) { const el = inputs.current[i + 1]; if (el) el.focus(); } else { const el = inputs.current[i]; if (el) el.blur(); }
  };
  const set = (i, v) => upd((s) => {
    const answers = s.answers.map((a, j) => (j === i ? v : a));
    let lead = s.lead;
    if (!lead) lead = firstLetter(v);
    if (!answers.some((a) => firstLetter(a))) lead = "";
    return { ...s, answers, lead };
  });
  const onFocus = (e) => {
    const el = e.target;
    setTimeout(() => { try { el.scrollIntoView({ block: "center", behavior: window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" }); } catch (err) { /* egal */ } }, 320);
  };
  return <React.Fragment>
    <div className="gtL-split"><div className="gtL-col-main slf-body">
      <div className="slf-top">
        <button type="button" className={"slf-letter" + (eff ? "" : " is-unknown")} onClick={onLetter} aria-label={t("slfLetterBtn") + (eff ? ": " + eff : "")}>
          <span className="ch" key={eff || "?"}>{eff || "?"}</span><span className="pen" aria-hidden="true"><IcPen /></span>
        </button>
        <div className="slf-side">
          <div className="slf-round">{t("slfRound")(S.rounds.length + 1)}</div>
          {S.stage === "write" && S.timer > 0 && <div className="slf-ring">
            <GtTimerRing left={left} total={S.timer} size={56} stroke={5} color={tk.acc}><span style={{ font: "800 18px 'Space Grotesk',sans-serif" }}>{left}</span></GtTimerRing>
          </div>}
          {S.stage === "write" && !eff && <p className="slf-hint">{t("slfLetterHint")}</p>}
          {ready && <p className="slf-hint">{t("slfReady")}</p>}
          {S.stage === "stopped" && <p className="slf-hint" role="status" style={{ color: "var(--s-ink)", fontWeight: 700 }}>{S.stopWhy === "time" ? t("slfTimeUp") : t("slfLocked")}</p>}
        </div>
      </div>
      <AlphaStrip used={used} cur={eff} t={t} />
      <div className="slf-paper" style={{ position: "relative" }}>
        {S.stage === "stopped" && <div className="slf-stampbar" aria-hidden="true"><span className="slf-stamp">{t("slfStop")}</span></div>}
        <ol className="slf-sheet">
          {cols.map((c, i) => {
            const off = isOff(S.answers[i], eff);
            const fl = firstLetter(S.answers[i]);
            return <li key={c.k} className={"slf-row" + (off ? " is-off" : "") + (locked ? " is-locked" : "")}>
              <label className="slf-lab" htmlFor={"slf-in-" + i}>{c.name}</label>
              <input id={"slf-in-" + i} ref={(el) => { inputs.current[i] = el; if (i === 0) firstRef.current = el; }} className="slf-in" type="text" value={S.answers[i] || ""} readOnly={locked} aria-readonly={locked ? "true" : undefined}
                maxLength={60} autoComplete="off" autoCorrect="off" autoCapitalize="words" spellCheck={false} enterKeyHint={i + 1 < cols.length ? "next" : "done"}
                aria-label={t("slfAnswerFor")(c.name)} aria-describedby={off ? "slf-off-" + i : undefined}
                onChange={(e) => set(i, e.target.value)} onFocus={onFocus} onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); focusNext(i); } }} />
              {off && <span className="slf-off" id={"slf-off-" + i} aria-label={t("slfOffLetter")(eff)}>{fl}{"≠"}{eff}</span>}
            </li>;
          })}
        </ol>
      </div>
    </div><div className="gtL-col-side slf-body">
      {S.rounds.length > 0 && <div className="slf-card"><div className="slf-h">{t("slfTable")}</div><RoundsTable cols={cols} rounds={S.rounds} t={t} /></div>}
    </div></div>
  </React.Fragment>;
}

// ---------------------------------------------------------------- Punkte vergeben

function Score({ S, upd, cols, eff, t }) {
  const sum = roundSum(S.pts);
  const total = totalOf(S.rounds) + sum;
  return <div className="slf-body" style={{ paddingBottom: 20 }}>
    <p className="slf-hint" style={{ margin: "0 2px" }}>{t("slfScoreHint")}</p>
    <div className="slf-legend"><span><b>20</b>{t("slfL20")}</span><span><b>10</b>{t("slfL10")}</span><span><b>5</b>{t("slfL5")}</span><span><b>0</b>{t("slfL0")}</span></div>
    <div className="slf-paper">
      <div style={{ position: "relative" }} className="slf-sheet">
        {cols.map((c, i) => {
          const a = (S.answers[i] || "").trim();
          const off = isOff(a, eff);
          return <div className="slf-srow" key={c.k}>
            <span className="slf-lab">{c.name}</span>
            <div className={"slf-ans" + (a ? "" : " is-empty")}>{a || t("slfEmpty")}{off && <span style={{ font: "800 12px 'Space Grotesk',sans-serif", color: "var(--s-off)", marginLeft: 8 }}>{firstLetter(a)}{"≠"}{eff}</span>}</div>
            <div className="slf-pts" role="radiogroup" aria-label={c.name}>
              {SLF_POINTS.map((p) => <button key={p} type="button" role="radio" aria-checked={S.pts[i] === p} aria-label={t("slfPtsAria")(p)} className={"slf-pt" + (p === 0 ? " z" : "")}
                onClick={() => { hapticTap(); upd((s) => ({ ...s, pts: s.pts.map((v, j) => (j === i ? p : v)) })); }}>{p}</button>)}
            </div>
          </div>;
        })}
        <div className="slf-sum"><span>{t("slfRoundSum")} {S.rounds.length + 1}</span><b>{sum}</b></div>
        <div className="slf-sum" style={{ paddingTop: 0 }}><span>{t("slfTotal")}</span><b>{total}</b></div>
      </div>
    </div>
  </div>;
}

// ---------------------------------------------------------------- Ende

function Done({ S, cols, t, lang, tk, onNew, solo }) {
  const total = totalOf(S.rounds);
  const best = S.rounds.reduce((b, r) => (!b || r.sum > b.sum ? r : b), null);
  return <div className="slf-body">
    <div className="slf-card" style={{ padding: 0 }}>
      <div className="slf-h" style={{ padding: "14px 16px 0", margin: 0 }}>{t("slfSummary")}</div>
      <div className="slf-big"><span className="v">{total}</span><span className="l">{S.result ? S.result.me : t("slfTotal")}</span></div>
      <div className="slf-facts">
        <div className="slf-fact"><b>{t("slfRoundsPlayed")(S.rounds.length)}</b><span>{t("slfTable")}</span></div>
        {best && <div className="slf-fact"><b>{best.letter}: {best.sum}</b><span>{t("slfBestRound")}</span></div>}
      </div>
    </div>
    {S.rounds.length > 0 && <div className="slf-card"><div className="slf-h">{t("slfTable")}</div><RoundsTable cols={cols} rounds={S.rounds} t={t} /></div>}
    {solo && <p className="slf-status" style={{ margin: 0 }}>{t("slfNoStat")}</p>}
    <GtDock><button type="button" className="slf-btn" onClick={onNew}>{t("slfNewGame")}</button></GtDock>
  </div>;
}

// ---------------------------------------------------------------- Hauptteil

function SlfGame({ state, setState, onBack, onHome, onEndGame, lang = "de", theme = "dark" }) {
  const t = useT(lang);
  const tk = slfTk(theme);
  const [S, setS] = useState(() => slfNormalize(state));
  const sRef = useRef(S);
  sRef.current = S;
  const dirty = useRef(false);
  const first = useRef(true);
  const firstRef = useRef(null);
  const upd = (fn) => setS((p) => { const n = fn(p); return n === p ? p : slfNormalize(n); });
  const [left, setLeft] = useState(0);
  const [letterOpen, setLetterOpen] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [endOpen, setEndOpen] = useState(false);
  const [podiumOpen, setPodiumOpen] = useState(false);
  useKbInset();

  // In den App-Zustand schreiben (gebuendelt) und beim Verlassen nachholen.
  useEffect(() => {
    if (first.current) { first.current = false; return undefined; }
    dirty.current = true;
    const id = setTimeout(() => { dirty.current = false; setState(sRef.current); }, 300);
    return () => clearTimeout(id);
  }, [S]);
  useEffect(() => {
    const fl = () => { if (dirty.current) { dirty.current = false; setState(sRef.current); } };
    const vis = () => { if (document.visibilityState === "hidden") fl(); };
    document.addEventListener("visibilitychange", vis);
    window.addEventListener("pagehide", fl);
    return () => { document.removeEventListener("visibilitychange", vis); window.removeEventListener("pagehide", fl); fl(); };
  }, []);

  const cols = useMemo(() => [...S.cats.map((id) => ({ k: "p" + id, name: slfCatName(id, lang) })), ...S.custom.map((c, i) => ({ k: "c" + i, name: c }))], [S.cats, S.custom, lang]);
  const eff = S.manual || detectLetter(S.answers, S.lead);
  const used = S.rounds.map((r) => r.letter);
  const playing = S.phase === "play";

  // Zeit: laeuft nach Datum, nicht nach Zaehler (auch nach Ausschalten des Bildschirms richtig)
  useEffect(() => {
    if (!playing || S.stage !== "write" || !S.endsAt) return undefined;
    let id = 0;
    const tick = () => {
      const rem = Math.ceil((S.endsAt - Date.now()) / 1000);
      setLeft(Math.max(0, rem));
      if (rem <= 0) {
        clearInterval(id);
        timeUpAlert();
        try { if (document.activeElement && document.activeElement.blur) document.activeElement.blur(); } catch (e) { /* egal */ }
        setS((p) => (p.stage === "write" ? { ...p, stage: "stopped", stopWhy: "time", endsAt: 0 } : p));
      }
    };
    tick();
    id = setInterval(tick, 250);
    return () => clearInterval(id);
  }, [playing, S.stage, S.endsAt]);

  // Beim Wechsel der Stufe nach oben scrollen
  useEffect(() => { try { window.scrollTo({ top: 0 }); } catch (e) { /* egal */ } }, [S.phase, S.stage]);

  const hasOthers = S.phase === "done" && !!S.result && S.result.others.length > 0;
  const total = totalOf(S.rounds);
  const doneList = hasOthers ? [{ name: S.result.me, score: total }, ...S.result.others.map((o) => ({ name: o.name, score: o.pts }))] : [];
  useGtRecord("slf", hasOthers, () => ({ participants: doneList.map((p) => ({ name: p.name, score: p.score })), lowWins: false }));
  const ranked = hasOthers ? rankedPodium(doneList, (p) => p.score) : [];
  const celebration = useCelebration(hasOthers && podiumOpen, undefined, theme);
  const openedPodium = useRef(false);
  useEffect(() => { if (hasOthers && !openedPodium.current) { openedPodium.current = true; setPodiumOpen(true); } if (!hasOthers) openedPodium.current = false; }, [hasOthers]);

  const start = () => { hapticTap(); playTapSound(); upd((s) => freshGame(s)); };
  const startRound = () => {
    hapticTap();
    upd((s) => ({ ...s, stage: "write", endsAt: Date.now() + s.timer * 1000 }));
    setTimeout(() => { try { if (firstRef.current) firstRef.current.focus(); } catch (e) { /* egal */ } }, 60);
  };
  const stop = () => {
    hapticTap(); playTapSound();
    try { if (document.activeElement && document.activeElement.blur) document.activeElement.blur(); } catch (e) { /* egal */ }
    upd((s) => (s.stage === "write" ? { ...s, stage: "stopped", stopWhy: "stop", endsAt: 0 } : s));
  };
  const toScore = () => { hapticTap(); upd((s) => { const l = s.manual || detectLetter(s.answers, s.lead); return { ...s, stage: "score", pts: s.answers.map((a, i) => (!a.trim() || isOff(a, l) ? 0 : (s.pts[i] === null || s.pts[i] === undefined ? null : s.pts[i]))) }; }); };
  const openCount = S.pts.filter((v) => v === null).length;
  const finishRound = () => {
    hapticTap(); playTapSound();
    upd((s) => {
      const l = s.manual || detectLetter(s.answers, s.lead) || "A";
      const pts = s.pts.map((v) => (v === null ? 0 : v));
      const r = { letter: l, ans: s.answers.slice(), pts, sum: roundSum(pts) };
      return freshRound({ ...s, rounds: [...s.rounds, r] });
    });
  };
  const undoRound = () => upd((s) => {
    const r = s.rounds[s.rounds.length - 1];
    if (!r) return s;
    return { ...s, rounds: s.rounds.slice(0, -1), stage: "score", answers: r.ans.slice(), pts: r.pts.slice(), manual: r.letter, lead: "", endsAt: 0, stopWhy: "stop" };
  });
  const endGame = (me, others) => { setEndOpen(false); upd((s) => ({ ...s, phase: "done", result: { me, others } })); };
  const newGame = () => { setPodiumOpen(false); upd((s) => freshGame({ ...s, phase: "setup" })); };
  const goBack = () => {
    if (S.phase === "done") {
      dirty.current = false;
      setState(slfNormalize({ ...DEFAULT_SLF, cats: S.cats, custom: S.custom, timer: S.timer, grp: S.grp }));
    }
    onBack();
  };
  const hasTyped = S.answers.some((a) => a.trim());

  const items = playing ? [
    { key: "finish", icon: "flag", label: t("slfFinish"), onClick: () => setEndOpen(true) },
    S.rounds.length > 0 && S.stage !== "score" && { key: "undo", icon: "undo", label: t("slfUndo"), onClick: undoRound },
    { key: "code", icon: "share", label: t("slfShowCode"), onClick: () => setShareOpen(true) },
  ].filter(Boolean) : [];

  const rulesTitle = t("gameSlf");
  const subtitle = S.phase === "setup" ? t("gtNewMatch") : S.phase === "done" ? t("slfSummary") : t("slfRound")(S.rounds.length + 1);
  const headTk = { border: tk.border, card: tk.card, ink: tk.ink, muted: tk.muted };
  const podTk = { bg2: tk.bg2, border: tk.border, card: tk.card, gold: tk.acc, ink: tk.ink, muted: tk.muted };

  let body = null, dock = null;
  if (S.phase === "setup") {
    body = <Setup S={S} upd={upd} t={t} lang={lang} theme={theme} tk={tk} onStart={start} onShow={() => setShareOpen(true)} />;
  } else if (S.phase === "done") {
    body = <Done S={S} cols={cols} t={t} lang={lang} tk={tk} onNew={newGame} solo={!hasOthers} />;
  } else {
    const stage = S.stage;
    body = stage === "score"
      ? <Score S={S} upd={upd} cols={cols} eff={eff} t={t} />
      : <Play S={S} upd={upd} cols={cols} eff={eff} t={t} left={left} tk={tk} onLetter={() => { if (stage === "write" || stage === "stopped") setLetterOpen(true); }} onStartRound={startRound} firstRef={firstRef} />;
    dock = <GtDock>
      {stage === "ready" && <button type="button" className="slf-btn" onClick={startRound}>{t("slfStartRound")}</button>}
      {stage === "write" && <button type="button" className="slf-stop" onClick={stop}><IcStop />{t("slfStop")}</button>}
      {stage === "stopped" && <button type="button" className="slf-btn" onClick={toScore}>{t("slfToScore")}</button>}
      {stage === "score" && <button type="button" className="slf-btn" onClick={finishRound}>{openCount > 0 ? t("slfDoneRoundOpen")(openCount) : t("slfDoneRound")}</button>}
    </GtDock>;
  }

  const wordmark = S.phase === "setup";
  return <div className="gtL-shellpage slf-root" style={{ minHeight: "100vh", background: tk.pageBg, padding: "20px 12px 32px", ...slfVars(tk) }}>
    <style>{GLOBAL_STYLES}{SLF_FONTS}{SLF_CSS}</style>
    {celebration}
    <div className="gtL-game pl-wide pl-page pl-head-compact slf-wrap" style={{ maxWidth: 440, margin: "0 auto", position: "relative" }}>
      <GtCol accent={tk.acc} style={{ gap: 14 }}>
        <GameHeader title={rulesTitle} subtitle={subtitle} onBack={goBack} backLabel={t("back")} tk={headTk} accent={tk.acc} icon={wordmark ? undefined : <SlfLogo color={tk.acc} />}
          onHome={onHome} onEndGame={playing ? onEndGame : undefined} onRules={undefined} rulesText={t("rulesSlf")} rulesTitle={rulesTitle} moreItems={items} onMenuOpen={() => { try { if (document.activeElement && document.activeElement.blur) document.activeElement.blur(); } catch (e) { /* egal */ } }} />
        {body}
        {dock}
      </GtCol>
    </div>
    <ShareSheet open={shareOpen} onClose={() => setShareOpen(false)} S={S} t={t} />
    <LetterSheet open={letterOpen} onClose={() => setLetterOpen(false)} cur={eff} manual={S.manual} used={used} t={t}
      onPick={(l) => { setLetterOpen(false); upd((s) => ({ ...s, manual: l })); }} onAuto={() => { setLetterOpen(false); upd((s) => ({ ...s, manual: "" })); }} />
    <EndSheet open={endOpen} onClose={() => setEndOpen(false)} total={total} hasOpen={hasTyped && S.stage !== "score" ? true : S.stage === "score"} t={t} onSolo={() => endGame("", [])} onShow={endGame} />
    <PodiumOverlay gameId="slf" gameLabel={t("gameSlf")} open={podiumOpen && hasOthers} onClose={() => setPodiumOpen(false)} onRestart={newGame} ranked={ranked} tk={podTk} t={t} theme={theme} />
  </div>;
}

export { SlfGame, DEFAULT_SLF, useGtSlfLink, pad2 };
