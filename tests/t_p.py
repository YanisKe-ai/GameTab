#!/usr/bin/env python3
"""Paket P (Podest und Wiedereinstieg, E6): Podest und Feier nur beim ersten Beenden; beim Wiederoeffnen
sieht man die Endansicht (keine Zeile). Eigene Leiste "Endstand zeigen" oeffnet das Podest sofort im Endzustand.

    ~/.gametab-venv/bin/python tests/t_p.py

Chromium immer stumm (--mute-audio), Ton in der App aus (gt_soundEnabled=false). Auch von tests/regression.py
aufrufbar: run(pg) legt einen eigenen Kontext an (Bewegung NICHT reduziert, damit die Podest-Sequenz echt laeuft).
Screenshots: Umgebungsvariable GT_P_SHOTS=<Ordner>.
"""
import os
import re
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from landscape import start, goto_game, wait, URL  # noqa: E402

MUTE = "try{localStorage.setItem('gt_soundEnabled','false')}catch(e){}"
SHOTS = os.environ.get("GT_P_SHOTS")
POD = "[data-gt-podium]"
ROW = "[data-gt-podium-row]"


def _btn(pg, name):
    return pg.get_by_role("button", name=name, exact=True)


def _shot(pg, name):
    if SHOTS:
        Path(SHOTS).mkdir(parents=True, exist_ok=True)
        pg.screenshot(path=str(Path(SHOTS) / name))


def _tap_digits(pg, s):
    for ch in s:
        _btn(pg, ch).first.click()
        wait(pg, 120)


def play_skyjo(pg, fresh=True):
    """Skyjo bis zum Ende: Spieler 1 mit 5, Spieler 2 mit 120."""
    if fresh:
        _btn(pg, "Spiel starten").first.click()
        wait(pg, 700)
    pg.get_by_role("button", name=re.compile(r"^Spieler 1, Total")).first.click()
    wait(pg, 300)
    _btn(pg, "Weiter: Punkte eintragen").click()
    wait(pg)
    _tap_digits(pg, "5")
    pg.get_by_role("button", name=re.compile(r"^Weiter zu ")).first.click()
    wait(pg, 400)
    _tap_digits(pg, "120")
    pg.get_by_role("button", name=re.compile(r"^Runde \d+ speichern$")).first.click()
    wait(pg, 900)


def play_freeplay(pg):
    pg.get_by_placeholder("offen").fill("20")
    wait(pg, 400)
    _btn(pg, "25").first.click()
    wait(pg, 900)


def _podium_open(pg, timeout=4000):
    pg.wait_for_selector(POD, timeout=timeout)


def _close_podium(pg):
    pg.locator(POD + " .gtsb-x").first.click()
    wait(pg, 500)
    assert pg.locator(POD).count() == 0, "Podest nach Schliessen noch da"


def _reopen(pg, cat, name):
    pg.goto(URL)
    wait(pg, 1200)
    goto_game(pg, cat, name)
    wait(pg, 1800)


def _wins(pg):
    return pg.evaluate("window.__gtWinCount||0")


def flow(pg, name, label, play, again, own_bar=False):
    start(pg)
    goto_game(pg, "Schreibunterlagen", name)
    play(pg)
    _podium_open(pg)
    assert _wins(pg) >= 1, f"{label}: erste Feier lief nicht"
    _shot(pg, f"{label}_podest_erst.png")
    wait(pg, 4300)  # Sequenz laeuft zu Ende, Erfolgs-Hinweis
    _close_podium(pg)
    _reopen(pg, "Schreibunterlagen", name)
    # Wiederoeffnen: keine Feier, keine feste Zeile
    assert pg.locator(ROW).count() == 0, f"{label}: feste Zeile vorhanden"
    if own_bar:  # Rueckweg vorhanden: Podest bleibt zu
        assert pg.locator(POD).count() == 0, f"{label}: Podest erschien beim Wiederoeffnen"
    else:  # kein Rueckweg: Podest wie bisher, aber sofort fertig (Teilen bleibt erreichbar)
        pg.wait_for_selector(POD + ".gtsb-done", timeout=500)
        assert pg.locator(POD).get_by_role("button", name=re.compile("Bild teilen")).count() == 1, f"{label}: Teilen fehlt"
        _shot(pg, f"{label}_wiederoeffnen_podest.png")
    assert _wins(pg) == 0, f"{label}: Feier (Sieg-Ton/Haptik) lief beim Wiederoeffnen"
    assert pg.locator("[data-gt-fx-layer]").count() == 0, f"{label}: Effekt im DOM"
    _shot(pg, f"{label}_wiederoeffnen.png")
    if not own_bar:
        _close_podium(pg)
    if own_bar:
        bar = pg.get_by_role("button", name="Endstand zeigen", exact=True)
        assert bar.count() == 1 and bar.is_visible(), f"{label}: eigene Leiste fehlt"
        bar.click()
        pg.wait_for_selector(POD + ".gtsb-done", timeout=500)  # sofort im Endzustand
        _shot(pg, f"{label}_podest_instant.png")
        wait(pg, 300)
        again(pg, label)
    else:
        again(pg, label)


def again_skyjo(pg, label):
    # Revanche aus der Endansicht, danach zeigt die naechste beendete Partie das Podest wieder (mit Feier)
    pg.get_by_role("button", name="Revanche", exact=True).first.click()
    wait(pg, 900)
    assert pg.locator(POD).count() == 0 and pg.locator(ROW).count() == 0, f"{label}: Revanche zeigt Podest/Zeile"
    play_skyjo(pg, fresh=False)
    _podium_open(pg)
    assert _wins(pg) >= 1, f"{label}: Feier der naechsten Partie fehlt"
    wait(pg, 4300)
    _close_podium(pg)


def again_freeplay(pg, label):
    _close_podium(pg)
    nb = pg.get_by_role("button", name="Neues Spiel", exact=True)
    assert nb.count() == 1, f"{label}: Neues Spiel (Leiste) fehlt"
    nb.click()
    wait(pg, 900)
    assert pg.locator(ROW).count() == 0 and pg.locator(POD).count() == 0, f"{label}: Neues Spiel laesst Zeile/Podest stehen"
    play_freeplay(pg)
    _podium_open(pg)
    wait(pg, 4300)
    _close_podium(pg)


def run(pg):
    b = pg.context.browser
    ctx = b.new_context(viewport={"width": 393, "height": 852}, is_mobile=True, has_touch=True, device_scale_factor=2)
    ctx.add_init_script(MUTE)
    p = ctx.new_page()
    errs = []
    p.on("pageerror", lambda e: errs.append(str(e)[:200]))
    try:
        flow(p, "Skyjo", "skyjo", play_skyjo, again_skyjo)
        print("   skyjo ok")
        flow(p, "Freies Spiel", "freeplay", play_freeplay, again_freeplay, own_bar=True)
        print("   freeplay ok")
        assert not errs, f"Seitenfehler: {errs}"
    finally:
        ctx.close()


def main():
    from playwright.sync_api import sync_playwright
    with sync_playwright() as pw:
        br = pw.chromium.launch(args=["--mute-audio"])
        ctx, pg = br.new_context(), None
        pg = ctx.new_page()
        try:
            run(pg)
        finally:
            br.close()
    print("t_p: ok")
    return 0


if __name__ == "__main__":
    sys.exit(main())
