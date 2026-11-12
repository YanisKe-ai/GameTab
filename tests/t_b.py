#!/usr/bin/env python3
"""Paket B (Speicher sicher): kaputter Hauptspeicher (SI-1), Fehlerprotokoll (SI-4), Sicherungs-Zeile (SI-3).

    ~/.gametab-venv/bin/python tests/t_b.py

Chromium immer stumm (--mute-audio), Ton in der App aus (gt_soundEnabled=false). Auch von tests/regression.py
aufrufbar: run(pg) legt eigene Kontexte an (der absichtliche Fehler stoert die Konsolenpruefung dort nicht).
Screenshots: Umgebungsvariable GT_B_SHOTS=<Ordner>.
"""
import json
import os
import re
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from landscape import new_phone, wait, URL  # noqa: E402

MUTE = "try{localStorage.setItem('gt_soundEnabled','false')}catch(e){}"
SHOTS = os.environ.get("GT_B_SHOTS")


def _seed(ctx, items):
    """Setzt Schluessel einmalig pro Tab, bevor die App laeuft."""
    ctx.add_init_script(
        MUTE + "try{if(!sessionStorage.getItem('__gt_b')){const d=" + json.dumps(items) + ";"
        "for(const k in d)localStorage.setItem(k,d[k]);sessionStorage.setItem('__gt_b','1');}}catch(e){}"
    )


def _entries(n, status="done"):
    return [{"matchId": f"mb{i}", "game": "skyjo", "status": status, "ts": 1700000000000 + i,
             "players": [{"name": "Anna", "norm": "anna", "score": 10, "rank": 1}, {"name": "Ben", "norm": "ben", "score": 20, "rank": 2}]}
            for i in range(n)]


def _skip_onb(pg):
    try:
        pg.get_by_text("Überspringen").first.click(timeout=1500)
        wait(pg)
    except Exception:
        pass


def _shot(pg, name):
    if SHOTS:
        Path(SHOTS).mkdir(parents=True, exist_ok=True)
        pg.screenshot(path=str(Path(SHOTS) / name))


def run_corrupt(b):
    ctx, pg = new_phone(b, 393, 852)
    _seed(ctx, {"spieleblock-app-state-v1": "{kaputt"})
    try:
        pg.goto(URL)
        wait(pg, 1500)
        keys = pg.evaluate("Object.keys(localStorage).filter(k=>k.indexOf('spieleblock-app-state-corrupt-')===0)")
        assert len(keys) == 1, f"Kopie-Schluessel: {keys}"
        assert pg.evaluate(f"localStorage.getItem({json.dumps(keys[0])})") == "{kaputt", "Kopie hat anderen Text"
        flag = pg.evaluate("window.__gtStateCorrupt")
        assert flag and flag["key"] == keys[0] and flag["len"] == 7, f"__gtStateCorrupt: {flag}"
        banner = pg.get_by_text("Gespeicherte Daten waren beschädigt. Eine Kopie liegt vor.")
        assert banner.count() == 1 and banner.is_visible(), "Banner nicht sichtbar"
        _shot(pg, "b_banner_393.png")
        with pg.expect_download() as dl:
            pg.get_by_role("button", name="Kopie sichern", exact=True).click()
        assert dl.value.suggested_filename.endswith(".json")
        p = dl.value.path()
        assert Path(p).read_text() == "{kaputt", "Download-Inhalt"
        pg.get_by_role("button", name="Schliessen", exact=True).first.click()
        wait(pg, 400)
        assert banner.count() == 0, "Banner nach Schliessen noch da"
        # App normal benutzbar: Onboarding, Einstellungen, Startseite
        _skip_onb(pg)
        pg.locator('button[aria-label="Einstellungen"]').first.click()
        wait(pg)
        assert pg.get_by_role("button", name="Nocturne", exact=True).count() >= 1, "Einstellungen nicht benutzbar"
        pg.get_by_role("button", name="Hell", exact=True).first.click()
        wait(pg, 600)
        # danach darf normal gespeichert werden, die Kopie bleibt
        st = pg.evaluate("localStorage.getItem('spieleblock-app-state-v1')")
        assert st and json.loads(st), "Hauptspeicher nach Benutzung nicht neu geschrieben"
        assert pg.evaluate(f"localStorage.getItem({json.dumps(keys[0])})") == "{kaputt", "Kopie verschwunden"
        # nicht im normalen Backup
        errs = [e for e in pg._pl_errors if "manifest" not in e and "sw.js" not in e and "favicon" not in e and "Failed to load resource" not in e]
        assert not errs, f"Seitenfehler: {errs[:2]}"
    finally:
        ctx.close()


def run_errlog(b):
    ctx, pg = new_phone(b, 393, 852)
    _seed(ctx, {})
    try:
        pg.goto(URL)
        wait(pg, 1000)
        pg.evaluate("setTimeout(()=>{throw new Error('x-test-fehler')})")
        wait(pg, 400)
        pg.evaluate("setTimeout(()=>{Promise.reject(new Error('y-test-reject'))})")
        wait(pg, 400)
        pg.evaluate("setTimeout(()=>{throw new Error('ResizeObserver loop completed with undelivered notifications.')})")
        wait(pg, 300)
        log = json.loads(pg.evaluate("localStorage.getItem('gt_errlog')") or "[]")
        msgs = [e["msg"] for e in log]
        assert any("x-test-fehler" in m for m in msgs), f"gt_errlog: {log}"
        assert any("y-test-reject" in m for m in msgs), f"gt_errlog (Promise): {log}"
        assert not any("ResizeObserver" in m for m in msgs), "ResizeObserver nicht ausgefiltert"
        assert all(set(e) == {"t", "msg", "src", "line"} for e in log), f"Felder: {log}"
        # Ring 20
        pg.evaluate("for(let i=0;i<30;i++){setTimeout(()=>{throw new Error('r'+i)})}")
        wait(pg, 600)
        log = json.loads(pg.evaluate("localStorage.getItem('gt_errlog')"))
        assert len(log) == 20, f"Ring: {len(log)}"
    finally:
        ctx.close()


def run_hint(b):
    # 3 Eintraege: keine Zeile
    ctx, pg = new_phone(b, 393, 852)
    _seed(ctx, {"gt_matchLog": json.dumps(_entries(3)), "gametab-onboarded": "1"})
    try:
        pg.goto(URL)
        wait(pg, 1200)
        _skip_onb(pg)
        assert pg.get_by_text("Noch keine Sicherung").count() == 0, "Zeile bei 3 Partien"
        _shot(pg, "b_start_ohne_393.png")
    finally:
        ctx.close()
    # 12 Eintraege: Zeile
    ctx, pg = new_phone(b, 393, 852)
    _seed(ctx, {"gt_matchLog": json.dumps(_entries(12))})
    try:
        pg.goto(URL)
        wait(pg, 1200)
        _skip_onb(pg)
        assert pg.get_by_text("Noch keine Sicherung").count() == 1, "Zeile fehlt bei 12 Partien"
        for name in ("Sichern", "Später"):
            bb = pg.get_by_role("button", name=name, exact=True).first.bounding_box()
            assert bb and bb["height"] >= 43.5 and bb["width"] >= 43.5, f"Touchziel {name}: {bb}"
        _shot(pg, "b_start_mit_393.png")
        pg.get_by_role("button", name="Später", exact=True).first.click()
        wait(pg, 400)
        assert pg.get_by_text("Noch keine Sicherung").count() == 0, "Zeile nach Später noch da"
        assert pg.evaluate("localStorage.getItem('gt_backupHintSnooze')"), "Snooze nicht gespeichert"
        pg.goto(URL)
        wait(pg, 1200)
        assert pg.get_by_text("Noch keine Sicherung").count() == 0, "Zeile nach Neuladen wieder da"
        # Snooze abgelaufen (31 Tage): wieder da; dann Sichern speichert Zeitstempel und blendet aus
        pg.evaluate("localStorage.setItem('gt_backupHintSnooze', String(Date.now()-31*86400000))")
        pg.goto(URL)
        wait(pg, 1200)
        assert pg.get_by_text("Noch keine Sicherung").count() == 1, "Zeile nach Ablauf des Snooze fehlt"
        with pg.expect_download() as dl:
            pg.get_by_role("button", name="Sichern", exact=True).first.click()
        assert dl.value.suggested_filename.startswith("gametab-backup-")
        assert pg.evaluate("localStorage.getItem('gt_lastBackupAt')"), "gt_lastBackupAt fehlt"
        wait(pg, 5600)
        assert pg.get_by_text("Noch keine Sicherung").count() == 0
        pg.goto(URL)
        wait(pg, 1200)
        assert pg.get_by_role("button", name="Sichern", exact=True).count() == 0, "Zeile nach frischer Sicherung"
        # alte Sicherung (40 Tage): Zeile mit Tagen
        pg.evaluate("localStorage.setItem('gt_lastBackupAt', String(Date.now()-40*86400000));localStorage.removeItem('gt_backupHintSnooze')")
        pg.goto(URL)
        wait(pg, 1200)
        assert pg.get_by_text("Letzte Sicherung vor 40 Tagen").count() == 1, "Zeile mit Tagen fehlt"
        # offene Partien zaehlen nicht
    finally:
        ctx.close()
    ctx, pg = new_phone(b, 393, 852)
    _seed(ctx, {"gt_matchLog": json.dumps(_entries(12, "open"))})
    try:
        pg.goto(URL)
        wait(pg, 1200)
        _skip_onb(pg)
        assert pg.get_by_text("Noch keine Sicherung").count() == 0, "offene Partien zaehlen"
    finally:
        ctx.close()


def run(pg):
    b = pg.context.browser
    run_corrupt(b)
    run_errlog(b)
    run_hint(b)


def main():
    from playwright.sync_api import sync_playwright
    with sync_playwright() as p:
        b = p.chromium.launch(args=["--mute-audio"])
        try:
            run_corrupt(b)
            run_errlog(b)
            run_hint(b)
            print("t_b OK")
            return 0
        except AssertionError as e:
            print("t_b FEHLER:", e)
            return 1
        finally:
            b.close()


if __name__ == "__main__":
    sys.exit(main())
