#!/usr/bin/env python3
"""Paket A2 (Statistik-Zahlen stimmig): eine Zahl, "Noch wenig Daten", Fehlerkarte (ST-2, ST-4).

    ~/.gametab-venv/bin/python tests/t_a2.py

Chromium immer stumm (--mute-audio), Ton in der App aus (gt_soundEnabled=false). Auch von tests/regression.py
aufrufbar: run(pg) legt eigene Kontexte an. Screenshots: Umgebungsvariable GT_A2_SHOTS=<Ordner>.
Daten: 4 Freies-Spiel-Partien mit Anna, Ben, Cleo (Cleo nur 2 Partien, eine mit Gleichstand Anna und Ben).
"""
import json
import os
import re
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from landscape import new_phone, wait, URL  # noqa: E402

MUTE = "try{localStorage.setItem('gt_soundEnabled','false')}catch(e){}"
SHOTS = os.environ.get("GT_A2_SHOTS")


def _m(i, ps, winners):
    return {"id": f"a2_{i}", "ts": 1760000000000 + i * 3600000, "game": "freeplay", "status": "done", "lowWins": False,
            "participants": [{"name": n, "norm": n.lower(), "score": s, "rank": r} for n, s, r in ps],
            "winner": winners[0], **({"winners": winners} if len(winners) > 1 else {})}


LOG = [
    _m(1, [("Anna", 10, 1), ("Ben", 5, 2), ("Cleo", 1, 3)], ["Anna"]),
    _m(2, [("Anna", 8, 1), ("Ben", 8, 1), ("Cleo", 1, 3)], ["Anna", "Ben"]),
    _m(3, [("Ben", 9, 1), ("Anna", 3, 2)], ["Ben"]),
    _m(4, [("Anna", 7, 1), ("Ben", 6, 2)], ["Anna"]),
]


def _ctx(b, w=393, h=852):
    ctx, pg = new_phone(b, w, h)
    ctx.add_init_script(MUTE + "try{if(!sessionStorage.getItem('__gt_a2')){localStorage.setItem('gt_matchLog'," + json.dumps(json.dumps(LOG)) + ");localStorage.setItem('gametab-onboarded','1');sessionStorage.setItem('__gt_a2','1');}}catch(e){}")
    return ctx, pg


def _open_stats(pg):
    pg.goto(URL)
    wait(pg, 1200)
    try:
        pg.get_by_text("Überspringen").first.click(timeout=1200)
        wait(pg)
    except Exception:
        pass
    pg.get_by_text("Schreibunterlagen", exact=True).first.click()
    wait(pg, 800)
    pg.get_by_label("Statistiken").first.click()
    wait(pg, 1200)


def _shot(pg, name):
    if SHOTS:
        Path(SHOTS).mkdir(parents=True, exist_ok=True)
        pg.screenshot(path=str(Path(SHOTS) / name))


def run_numbers(b):
    ctx, pg = _ctx(b)
    try:
        _open_stats(pg)
        txt = pg.evaluate("document.body.innerText")
        assert "3 von 4 gewonnen" in txt, "Anna: 3 von 4 fehlt"
        assert "2 von 4 gewonnen" in txt, "Ben: 2 von 4 fehlt"
        assert "75%" in txt.replace(" %", "%") and "50%" in txt.replace(" %", "%"), "Prozent passen nicht zu x von y"
        assert "davon 1 geteilt" in txt, "Hinweis geteilter Sieg fehlt"
        assert "Noch wenig Daten" in txt, "Cleo ohne Hinweis"
        for bad in ("vorläufig", "Faire Quote"):
            assert bad not in txt, f"unerwartet: {bad}"
        assert not re.search(r"(?<!\d)0\s?%", txt), "0 % darf nicht stehen"
        # Cleo steht nicht in der Rangliste: Reihenfolge Anna (3 Siege) vor Ben (2 Siege)
        assert pg.get_by_role("button", name=re.compile(r"^Platz 1: Anna, 75 Prozent")).count() == 1, "Platz 1 ist nicht Anna mit 75 Prozent"
        assert pg.get_by_role("button", name=re.compile(r"^Platz 2: Ben, 50 Prozent")).count() == 1, "Platz 2 ist nicht Ben"
        _shot(pg, "a2_stats_393.png")
        pg.get_by_role("button", name=re.compile(r"^Cleo")).first.click()
        wait(pg, 900)
        ptxt = pg.evaluate("document.body.innerText")
        assert "Noch wenig Daten" in ptxt and "%" not in ptxt.split("Cleo", 1)[1][:200], "Profil Cleo zeigt Prozent"
        _shot(pg, "a2_profile_cleo_393.png")
        errs = [e for e in pg._pl_errors if "manifest" not in e and "sw.js" not in e and "favicon" not in e and "Failed to load resource" not in e]
        assert not errs, f"Seitenfehler: {errs[:2]}"
    finally:
        ctx.close()


def run_error(b):
    ctx, pg = _ctx(b)
    try:
        pg.add_init_script("window.__gtStatsFail=true")
        _open_stats(pg)
        card = pg.locator("[data-gt-stats-error]")
        assert card.count() == 1, "Fehlerkarte fehlt"
        txt = pg.evaluate("document.body.innerText")
        assert "Statistik nicht verfügbar" in txt and "Deine Partien sind noch gespeichert." in txt, txt[:200]
        assert "Sicherung speichern" in txt and "Nochmal versuchen" in txt
        assert "Noch keine Partien" not in txt, "Fehler darf nicht als leer erscheinen"
        assert pg.locator('[data-gt-live="alert"]').inner_text().startswith("Statistik nicht verfügbar"), "Ansage fehlt"
        assert any("Berechnung fehlgeschlagen" in e for e in pg._pl_errors), "console.error fehlt"
        _shot(pg, "a2_error_393.png")
        with pg.expect_download() as dl:
            pg.get_by_role("button", name="Sicherung speichern", exact=True).click()
        assert dl.value.suggested_filename.endswith(".json")
        pg.evaluate("window.__gtStatsFail=false")
        pg.get_by_role("button", name="Nochmal versuchen", exact=True).click()
        wait(pg, 800)
        assert pg.locator("[data-gt-stats-error]").count() == 0, "Karte bleibt nach Retry"
        assert "3 von 4 gewonnen" in pg.evaluate("document.body.innerText")
    finally:
        ctx.close()


def run(pg=None):
    if pg is not None:  # innerhalb der Regression: vorhandenen Browser nutzen
        b = pg.context.browser
        run_numbers(b)
        run_error(b)
        return
    from playwright.sync_api import sync_playwright
    with sync_playwright() as p:
        b = p.chromium.launch(args=["--mute-audio"])
        try:
            run_numbers(b)
            run_error(b)
        finally:
            b.close()


def main():
    try:
        run()
        print("t_a2 OK")
        return 0
    except AssertionError as e:
        print("t_a2 FEHLER:", e)
        return 1


if __name__ == "__main__":
    sys.exit(main())
