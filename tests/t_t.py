#!/usr/bin/env python3
"""Paket T Texte und Menue: UX-6/UX-7 und UX-12.

    ~/.gametab-venv/bin/python tests/t_t.py [Screenshot-Ordner]

Skyjo: Menue zeigt "Spiel verwerfen", der erste Tipp zeigt den Bestaetigungstext, nach 3 s ist er weg.
Freies Spiel: Rueckgaengig hat ein anderes Symbol als Neues Spiel, Verwerfen (Papierkorb) ein anderes als
"Mit Wertung beenden" (Flagge). Einstellungen zeigen die Version exakt wie version.json.
Auch von tests/regression.py aufrufbar: run(pg). Kein Ton: Chromium mit --mute-audio.
"""
import json
import re
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from landscape import new_phone, start, goto_game, wait  # noqa: E402

ROOT = Path(__file__).resolve().parent.parent
MUTE = 'try{localStorage.setItem("gt_soundEnabled","false")}catch(e){}'


def _icon(pg, name):
    """innerHTML des Symbols der Menuezeile (Name als Regex)."""
    row = pg.get_by_role("menuitem", name=re.compile(name)).first
    return row.locator(".gt-hm-ic").inner_html()


def _open_menu(pg):
    pg.get_by_role("button", name="Menü", exact=True).first.click()
    wait(pg, 500)


def _close_menu(pg):
    pg.keyboard.press("Escape")
    wait(pg, 400)


def run(pg, shots=None, tag=""):
    start(pg)
    # Skyjo: Verwerfen mit Bestaetigung
    goto_game(pg, "Schreibunterlagen", "Skyjo")
    pg.get_by_role("button", name="Spiel starten", exact=True).first.click()
    wait(pg, 700)
    _open_menu(pg)
    row = pg.get_by_role("menuitem", name=re.compile(r"^Spiel verwerfen"))
    assert row.count() == 1, "Menue: 'Spiel verwerfen' fehlt"
    assert not pg.get_by_role("menuitem", name=re.compile("Spiel beenden")).count(), "Menue: alter Text 'Spiel beenden' noch da"
    if shots:
        pg.screenshot(path=str(shots / f"menu_skyjo{tag}.png"))
    row.first.click()
    wait(pg, 400)
    conf = pg.get_by_role("menuitem", name=re.compile(r"Partie verwerfen\? Der Stand geht verloren\. Nochmal tippen"))
    assert conf.count() == 1, "Menue: Bestaetigungstext nach erstem Tipp fehlt"
    if shots:
        pg.screenshot(path=str(shots / f"menu_skyjo_bestaetigung{tag}.png"))
    wait(pg, 3300)
    assert pg.get_by_role("menuitem", name=re.compile(r"^Spiel verwerfen")).count() == 1, "Bestaetigung faellt nach 3 s nicht zurueck"
    _close_menu(pg)
    # Freies Spiel: Symbole
    pg.goto(pg.url)
    start(pg)
    goto_game(pg, "Schreibunterlagen", "Freies Spiel")
    pg.get_by_role("button", name="5", exact=True).first.click()
    wait(pg, 500)
    _open_menu(pg)
    undo, neu = _icon(pg, r"^Rückgängig"), _icon(pg, r"^Neues Spiel")
    flag, trash = _icon(pg, r"^Mit Wertung beenden"), _icon(pg, r"^Spiel verwerfen")
    assert undo != neu, "Rueckgaengig hat dasselbe Symbol wie Neues Spiel"
    assert flag != trash, "Verwerfen hat dasselbe Symbol wie Mit Wertung beenden"
    assert len({undo, neu, flag, trash}) == 4, "Symbole nicht eindeutig"
    if shots:
        pg.screenshot(path=str(shots / f"menu_freeplay{tag}.png"))
    _close_menu(pg)
    # Version in den Einstellungen
    build = json.loads((ROOT / "version.json").read_text())["build"]
    pg.goto(pg.url)
    wait(pg, 1200)
    try:
        pg.get_by_text("Überspringen").first.click(timeout=1500)
    except Exception:
        pass
    pg.locator('button[aria-label="Einstellungen"]').first.click()
    wait(pg, 700)
    txt = pg.evaluate("document.body.innerText")
    assert re.search(r"(?<![\d.])" + re.escape(build) + r"(?![\d-])", txt), f"Version {build} fehlt in den Einstellungen"
    assert not re.search(r"v?\d{2}\.\d{2}\.2026-", txt), "Altes Versionsformat sichtbar"
    if shots:
        pg.evaluate("document.querySelectorAll('*').forEach(e=>{if(e.scrollHeight>e.clientHeight+20)e.scrollTop=e.scrollHeight})")
        wait(pg, 300)
        pg.screenshot(path=str(shots / f"einstellungen_version{tag}.png"))


def main():
    from playwright.sync_api import sync_playwright
    shots = Path(sys.argv[1]) if len(sys.argv) > 1 else None
    if shots:
        shots.mkdir(parents=True, exist_ok=True)
    with sync_playwright() as p:
        b = p.chromium.launch(args=["--mute-audio"])
        ctx, pg = new_phone(b, 393, 852)
        ctx.add_init_script(MUTE)
        try:
            run(pg, shots)
            errs = [e for e in pg._pl_errors if "manifest" not in e and "sw.js" not in e and "favicon" not in e and "Failed to load resource" not in e]
            assert not errs, f"Seitenfehler: {errs[:2]}"
            print("t_t OK")
            return 0
        except AssertionError as e:
            print("t_t FEHLER:", e)
            return 1
        finally:
            b.close()


if __name__ == "__main__":
    sys.exit(main())
