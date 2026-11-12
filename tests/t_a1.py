#!/usr/bin/env python3
"""A1 Statistik-Daten sicher: Geisterpartie nach Rueckgaengig (ST-1) und Zaehler (ST-3).

    ~/.gametab-venv/bin/python tests/t_a1.py

Skyjo mit 2 Personen bis Spielende: Statistik-Log hat 1 done. Dann Rueckgaengig bis leer, neu laden:
gt_matchLog hat keinen done-Eintrag mehr, die Statistik zeigt keine Partie. Der Zaehler zaehlt nur das echte Ende.
Auch von tests/regression.py (t_stats_ghost) aufrufbar: run(pg).
"""
import json
import re
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from landscape import new_phone, start, goto_game, wait, URL  # noqa: E402


def _log(pg):
    return json.loads(pg.evaluate("localStorage.getItem('gt_matchLog')") or "[]")


def _count(pg):
    return int(pg.evaluate("localStorage.getItem('gt_totalGamesPlayed')") or 0)


def _btn(pg, name):
    return pg.get_by_role("button", name=name, exact=True)


def _stats_text(pg):
    """Text der Statistik-Seite (leer, wenn es keinen Einstieg gibt)."""
    pg.goto(URL)
    wait(pg, 1000)
    pg.get_by_text("Schreibunterlagen", exact=True).first.click()
    wait(pg, 800)
    pg.get_by_label("Statistik", exact=True).first.click()
    wait(pg, 1000)
    return pg.evaluate("document.body.innerText")


def _skyjo_round(pg):
    """Eine Runde: Spieler 1 beendet mit 5, Spieler 2 hat 120 (Ziel 100 erreicht)."""
    pg.get_by_role("button", name=re.compile(r"^Spieler 1, Total")).first.click()
    wait(pg, 300)
    _btn(pg, "Weiter: Punkte eintragen").click()
    wait(pg)
    _btn(pg, "5").first.click()
    wait(pg, 200)
    pg.get_by_role("button", name=re.compile(r"^Weiter zu ")).first.click()
    wait(pg, 500)
    for ch in "120":
        _btn(pg, ch).first.click()
        wait(pg, 200)
    pg.get_by_role("button", name=re.compile(r"^Runde \d+ speichern$")).first.click()
    wait(pg, 1500)


def run_revanche(pg):
    """Revanche darf die fertige Partie nicht aus der Statistik nehmen."""
    start(pg)
    goto_game(pg, "Schreibunterlagen", "Skyjo")
    _btn(pg, "Spiel starten").first.click()
    wait(pg, 700)
    _skyjo_round(pg)
    assert [m.get("status") for m in _log(pg)] == ["done"], f"Ende: {_log(pg)}"
    _btn(pg, "Revanche").first.click()
    wait(pg, 1500)
    st = [m.get("status") for m in _log(pg)]
    assert st == ["done"], f"Revanche nimmt Partie aus der Statistik: {st}"
    pg.reload()
    wait(pg, 1500)
    st = [m.get("status") for m in _log(pg)]
    assert st == ["done"], f"Nach Neuladen: {st}"


def run(pg):
    start(pg)
    goto_game(pg, "Schreibunterlagen", "Skyjo")
    _btn(pg, "Spiel starten").first.click()
    wait(pg, 700)
    # Runde 1: Spieler 1 beendet mit 5, Spieler 2 hat 120 -> Ziel 100 erreicht, Spielende
    _skyjo_round(pg)
    log = _log(pg)
    assert len(log) == 1 and log[0]["status"] == "done", f"Skyjo-Ende: Log {log}"
    assert _count(pg) == 1, f"Zaehler nach Ende: {_count(pg)}"
    # Podest schliessen, wieder oeffnen ("Endstand") zaehlt nicht doppelt: Neuladen der Seite
    if _btn(pg, "Schliessen").count():
        _btn(pg, "Schliessen").first.click()
        wait(pg, 700)
    pg.reload()
    wait(pg, 1200)
    assert _count(pg) == 1, f"Zaehler nach Neuladen: {_count(pg)}"
    txt = _stats_text(pg)
    assert "Spieler 1" in txt, "Kontrolle: Statistik zeigt die fertige Partie nicht (Pruefung waere wertlos)"
    # Zurueck ins Spiel und Rueckgaengig bis leer
    pg.goto(URL)
    wait(pg, 1000)
    pg.get_by_text("Schreibunterlagen", exact=True).first.click()
    wait(pg, 800)
    pg.locator("button", has_text=re.compile(r"^\d*\s*Skyjo")).first.click()
    wait(pg, 900)
    for _ in range(6):
        if _btn(pg, "Schliessen").count():  # Podest beim Wiederbetreten
            _btn(pg, "Schliessen").first.click()
            wait(pg, 700)
        r = _btn(pg, "Rückgängig")
        if not r.count():
            break
        r.last.click()
        wait(pg, 900)
    pg.reload()
    wait(pg, 1500)
    done = [m for m in _log(pg) if m.get("status") != "open"]
    assert not done, f"Geisterpartie: done-Eintrag nach Rueckgaengig bis leer: {done}"
    txt = _stats_text(pg)
    assert "Spieler 1" not in txt, "Statistik zeigt die zurueckgenommene Partie"


def main():
    from playwright.sync_api import sync_playwright
    with sync_playwright() as p:
        b = p.chromium.launch(args=["--mute-audio"])
        ctx, pg = new_phone(b, 393, 852)
        try:
            run(pg)
            ctx.close()
            ctx, pg = new_phone(b, 393, 852)
            run_revanche(pg)
            errs = [e for e in pg._pl_errors if "manifest" not in e and "sw.js" not in e and "favicon" not in e and "Failed to load resource" not in e]
            assert not errs, f"Seitenfehler: {errs[:2]}"
            print("t_a1 OK")
            return 0
        except AssertionError as e:
            print("t_a1 FEHLER:", e)
            return 1
        finally:
            b.close()


if __name__ == "__main__":
    sys.exit(main())
