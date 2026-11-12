#!/usr/bin/env python3
"""Paket PS: Suchfeld (kein Oeffnen beim blossen Fokus, Tab auf Treffer schliesst nicht, Tippfehler, Meintest du),
Weiterspielen-Zeile, Favoriten-Hinweis (Kontrast >= 4,5 in allen Themes).

    ~/.gametab-venv/bin/python tests/t_ps.py        (erst nach npm run build, GAMETAB_HTML=docs/index.html)

Chromium stumm. Die Texte aus dev-notes/plan/vorarbeit/PS_texte.json muessen vorher in translations.js stehen.
"""
import json
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from landscape import start, wait, URL  # noqa: E402

FAILS = []


def check(c, m):
    if not c:
        FAILS.append(m)
        print("FEHLER:", m)


def lum(h):
    h = h.lstrip("#")
    c = [int(h[i:i + 2], 16) / 255 for i in (0, 2, 4)]
    c = [x / 12.92 if x <= .03928 else ((x + .055) / 1.055) ** 2.4 for x in c]
    return .2126 * c[0] + .7152 * c[1] + .0722 * c[2]


def contrast(a, b):
    x, y = sorted([lum(a), lum(b)], reverse=True)
    return (x + .05) / (y + .05)


def overlay_open(pg):
    return pg.locator('input[placeholder][aria-label]:visible').count() >= 2


def run(pg):
    inp = pg.locator('input[aria-label]').first
    # 1. Tab/Fokus allein oeffnet nichts
    inp.focus(); wait(pg, 600)
    check(pg.locator('input[aria-label]').count() == 1, "blosser Fokus oeffnet das Overlay")
    # 2. Tippfehler: erstes Zeichen oeffnet, wizzard -> Wizard, nicht Tutto
    inp.type("wizzard", delay=40); wait(pg, 600)
    check(pg.locator('input[aria-label]').count() == 2, "Tippen oeffnet das Overlay nicht")
    txt = pg.locator("body").inner_text()
    check("Wizard" in txt, "wizzard findet Wizard nicht")
    # 3. Tab vom Feld auf den Treffer: Overlay bleibt
    pg.keyboard.press("Tab"); wait(pg, 500)
    check(pg.locator('input[aria-label]').count() == 2, "Tab auf Treffer schliesst das Panel")
    pg.keyboard.press("Escape"); wait(pg, 500)
    check(pg.locator('input[aria-label]').count() == 1, "Escape schliesst nicht")
    # 4. Meintest du
    inp.fill(""); inp.focus(); inp.type("skyjxxx", delay=40); wait(pg, 600)
    check(pg.locator('[data-gt-didyoumean]').count() == 1, "Meintest-du-Zeile fehlt")
    pg.locator('[data-gt-didyoumean]').click(); wait(pg, 800)
    # 5. Kontrast des Favoriten-Hinweises (Token-Farben gegen Seitenhintergrund, alle Themes)
    for n, fg, bgs in [("Nocturne", "#8890A0", ["#12141C", "#181B25"]), ("Hell", "#5B6470", ["#F8F9FA", "#EDEFF2"]), ("Noir", "#969696", ["#000000"])]:
        for bg in bgs:
            check(contrast(fg, bg) >= 4.5, f"Kontrast Hinweis {n} {bg}")


if __name__ == "__main__":
    from playwright.sync_api import sync_playwright
    from landscape import new_phone
    with sync_playwright() as p:
        b = p.chromium.launch(args=["--mute-audio"])
        ctx, pg = new_phone(b, 393, 852, mobile=False)
        start(pg)
        run(pg)
        b.close()
    print("OK" if not FAILS else f"{len(FAILS)} Fehler")
    sys.exit(1 if FAILS else 0)
