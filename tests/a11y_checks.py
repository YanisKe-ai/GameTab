#!/usr/bin/env python3
"""Paket U1 Barrierefreiheit Grundlagen: eigene DOM-Pruefungen (kein neues Paket).

    ~/.gametab-venv/bin/python tests/a11y_checks.py

Start, Einstellungen, Statistik, Skyjo-Setup, Freies Spiel: jedes input/select/textarea hat label, aria-label oder
aria-labelledby (versteckte ausgenommen). Startseite: genau ein main, genau ein h1, Abschnitte als h2, Handy und Laptop.
document.title passt je Ansicht. Ansage-Regionen (polite und alert) sind da und melden Text (gtAnnounce).
Nach dem Wiederherstellen erscheint «Sicherung geladen: n Partien, g Gruppen.».
Auch von tests/regression.py aufrufbar: run(pg). Kein Ton: Chromium mit --mute-audio.
"""
import json
import re
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from landscape import new_phone, start, goto_game, wait, URL  # noqa: E402

MUTE = 'try{localStorage.setItem("gt_soundEnabled","false")}catch(e){}'

JS_UNLABELED = """() => [...document.querySelectorAll('input,select,textarea')].filter(el => {
  if (el.type === 'hidden') return false;
  if (el.closest('[aria-hidden="true"]') || el.closest('[inert]')) return false;
  if (el.getAttribute('aria-hidden') === 'true') return false;
  const named = el.getAttribute('aria-label') || el.getAttribute('aria-labelledby') || (el.labels && el.labels.length) || el.closest('label');
  return !named;
}).map(el => el.tagName + ':' + (el.getAttribute('placeholder') || el.type || '') )"""

JS_LANDMARKS = """() => ({
  main: document.querySelectorAll('main,[role="main"]').length,
  h1: document.querySelectorAll('h1').length,
  h2: document.querySelectorAll('h2').length,
  h1First: (() => { const hs = [...document.querySelectorAll('h1,h2')]; return hs.length ? hs[0].tagName : ''; })(),
  polite: document.querySelectorAll('[data-gt-live="polite"][aria-live="polite"]').length,
  alert: document.querySelectorAll('[data-gt-live="alert"][role="alert"]').length,
})"""


def _fail(msg):
    raise AssertionError(msg)


def check_labels(pg, name):
    bad = pg.evaluate(JS_UNLABELED)
    if bad:
        _fail(f"{name}: Felder ohne Beschriftung {bad[:4]}")
    print("OK    ", f"{name}: alle Felder beschriftet")


def check_title(pg, name, pattern):
    wait(pg, 400)
    title = pg.title()
    if not re.fullmatch(pattern, title):
        _fail(f"{name}: Seitentitel {title!r} passt nicht zu {pattern!r}")
    print("OK    ", f"{name}: Titel {title!r}")


def check_live(pg, name):
    lm = pg.evaluate(JS_LANDMARKS)
    if lm["polite"] != 1 or lm["alert"] != 1:
        _fail(f"{name}: Ansage-Regionen fehlen {lm}")
    print("OK    ", f"{name}: Ansage-Regionen vorhanden")


def check_start_structure(pg, name):
    lm = pg.evaluate(JS_LANDMARKS)
    if lm["main"] != 1:
        _fail(f"{name}: main-Landmarke {lm['main']} statt 1")
    if lm["h1"] != 1:
        _fail(f"{name}: h1 {lm['h1']} statt 1")
    if lm["h2"] < 1:
        _fail(f"{name}: keine Abschnitts-Ueberschriften (h2)")
    if lm["h1First"] != "H1":
        _fail(f"{name}: erste Ueberschrift ist {lm['h1First']}, nicht H1")
    print("OK    ", f"{name}: 1 main, 1 h1, {lm['h2']} h2")


def goto_start(pg):
    pg.goto(URL)
    wait(pg, 900)


def run(pg):
    start(pg)
    goto_start(pg)
    check_start_structure(pg, "Start")
    check_title(pg, "Start", r"GameTab · All-in-One")
    check_labels(pg, "Start")
    check_live(pg, "Start")

    # Einstellungen, dazu Gruppenfelder
    pg.locator('button[aria-label="Einstellungen"]').first.click()
    wait(pg, 700)
    check_title(pg, "Einstellungen", r"Einstellungen · GameTab")
    pg.get_by_role("button", name="Spielergruppen").first.click()
    wait(pg, 500)
    pg.get_by_role("button", name=re.compile(r"Neue Gruppe")).first.click()
    wait(pg, 500)
    pg.get_by_role("button", name="+ Spieler").first.click()
    wait(pg, 400)
    check_labels(pg, "Einstellungen mit Gruppenfeldern")
    n = pg.locator('input[aria-label="Gruppenname"]').count()
    if n < 1:
        _fail("Einstellungen: Gruppenname hat kein aria-label")
    if pg.locator('input[aria-label="Name 1"]').count() < 1:
        _fail("Einstellungen: Spielerfeld 'Name 1' fehlt")
    f = pg.locator('input[type="file"]').first
    if f.get_attribute("tabindex") != "-1" or f.get_attribute("aria-hidden") != "true":
        _fail("Einstellungen: Datei-Eingabe ohne tabindex=-1 und aria-hidden")
    print("OK    ", "Einstellungen: Gruppen- und Datei-Eingabe richtig ausgezeichnet")
    check_live(pg, "Einstellungen")

    # Ansage: erster Tipp auf Alle Ergebnisse loeschen sagt den Hinweis an
    pg.get_by_role("button", name=re.compile(r"Alle Ergebnisse|Statistik.*l(ö|oe)schen", re.I)).first.click()
    wait(pg, 400)
    txt = pg.locator('[data-gt-live="polite"]').inner_text()
    if len(txt.strip()) < 5:
        _fail("Einstellungen: Ansage-Region bleibt leer nach Rueckfrage")
    print("OK    ", f"Einstellungen: Ansage gelesen ({txt[:40]!r})")

    # Statistik
    goto_start(pg)
    pg.get_by_text("Schreibunterlagen", exact=True).first.click()
    wait(pg, 700)
    pg.get_by_label("Statistiken").first.click()
    wait(pg, 900)
    check_title(pg, "Statistik", r"Statistiken · GameTab")
    check_labels(pg, "Statistik")
    check_live(pg, "Statistik")

    # Skyjo-Setup
    goto_start(pg)
    goto_game(pg, "Schreibunterlagen", "Skyjo")
    check_title(pg, "Skyjo-Setup", r"Skyjo · GameTab")
    check_labels(pg, "Skyjo-Setup")
    check_live(pg, "Skyjo-Setup")

    # Freies Spiel
    goto_start(pg)
    goto_game(pg, "Schreibunterlagen", "Freies Spiel")
    check_title(pg, "Freies Spiel", r"Freies Spiel · GameTab")
    check_labels(pg, "Freies Spiel")
    check_live(pg, "Freies Spiel")

    # Zurueck zur Startseite: Titel wieder Standard
    goto_start(pg)
    check_title(pg, "Start (zurueck)", r"GameTab · All-in-One")


def run_restore(pg):
    """UX-10: Flag aus dem Wiederherstellen erzeugt nach dem Neuladen die Meldung (Ansage und sichtbare Zeile)."""
    start(pg)
    pg.goto(URL)
    pg.evaluate("sessionStorage.setItem('gt_restored', JSON.stringify({m:12,g:3}))")
    pg.reload()
    wait(pg, 2200)
    vis = pg.locator("[data-gt-restored]")
    if vis.count() != 1 or "Sicherung geladen: 12 Partien, 3 Gruppen." not in vis.inner_text():
        _fail("UX-10: sichtbare Zeile 'Sicherung geladen: 12 Partien, 3 Gruppen.' fehlt")
    if pg.evaluate("sessionStorage.getItem('gt_restored')") is not None:
        _fail("UX-10: Flag bleibt nach dem Anzeigen stehen")
    polite = pg.locator('[data-gt-live="polite"]').inner_text()
    if "Sicherung geladen: 12 Partien, 3 Gruppen." not in polite:
        _fail(f"UX-10: Ansage fehlt ({polite!r})")
    print("OK    ", "UX-10: Meldung nach Wiederherstellen (Zeile und Ansage), Flag entfernt")


def run_laptop(pg):
    start(pg, mode="Laptop")
    goto_start(pg)
    check_start_structure(pg, "Start Laptop")
    check_title(pg, "Start Laptop", r"GameTab · All-in-One")


def main():
    from playwright.sync_api import sync_playwright
    with sync_playwright() as p:
        b = p.chromium.launch(args=["--mute-audio"])
        try:
            for fn, w, h in ((run, 393, 852), (run_restore, 393, 852), (run_laptop, 1280, 800)):
                ctx, pg = new_phone(b, w, h, mobile=(w < 600))
                ctx.add_init_script(MUTE)
                try:
                    fn(pg)
                    errs = [e for e in pg._pl_errors if "manifest" not in e and "sw.js" not in e and "favicon" not in e and "Failed to load resource" not in e]
                    if errs:
                        _fail(f"Seitenfehler: {errs[:2]}")
                finally:
                    ctx.close()
            print("a11y_checks OK")
            return 0
        except AssertionError as e:
            print("a11y_checks FEHLER:", e)
            return 1
        finally:
            b.close()


if __name__ == "__main__":
    sys.exit(main())
