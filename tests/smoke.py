#!/usr/bin/env python3
"""GameTab Smoke-Test (Playwright). Aufruf:

    python3 tests/smoke.py            # volle Matrix
    python3 tests/smoke.py --quick    # nur Startseite, 3 Viewports x 3 Themes

Macht Screenshots nach tests/out/ und meldet Konsolenfehler und Seitenfehler.
Exit-Code 0 = keine Fehler, 1 = Fehler.
"""
import sys
from pathlib import Path
from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "tests" / "out"
OUT.mkdir(parents=True, exist_ok=True)
URL = (ROOT / "index.html").as_uri()
QUICK = "--quick" in sys.argv

VIEWPORTS = {"mobile": (393, 852), "laptop-1512": (1512, 982), "laptop-1280": (1280, 800)}
THEMES = ["Dunkel", "Hell", "Vitrum"]
CATEGORIES = ["Schreibunterlagen", "Partyspiele"]
GAMES = ["Skyjo", "Flip 7", "Jass", "Yatzy", "Tutto", "Darts", "Wizard", "Minigolf", "Freeplay",
         "Impostor", "Werwolf", "Mafia", "Am Ehesten", "Tabu", "HeadsUp", "5 Sekunden"]


def start(page, w, h, mode):
    page.set_viewport_size({"width": w, "height": h})
    page.goto(URL + "?reset=1")
    page.wait_for_timeout(800)
    try:
        page.get_by_text("Überspringen").first.click(timeout=2000)
        page.wait_for_timeout(500)
    except Exception:
        pass
    page.locator('button[aria-label="Einstellungen"]').first.click()
    page.wait_for_timeout(500)
    page.get_by_role("button", name=mode, exact=True).first.click()
    page.wait_for_timeout(500)


def set_theme(page, theme):
    page.get_by_role("button", name=theme, exact=True).first.click()
    page.wait_for_timeout(500)


def main():
    errors = []
    with sync_playwright() as p:
        b = p.chromium.launch()
        for vname, (w, h) in VIEWPORTS.items():
            mode = "Handy" if vname == "mobile" else "Laptop"
            for theme in THEMES:
                ctx = b.new_context(viewport={"width": w, "height": h})
                page = ctx.new_page()
                page.on("pageerror", lambda e, v=vname, t=theme: errors.append(f"[{v}/{t}] pageerror: {str(e)[:200]}"))
                page.on("console", lambda m, v=vname, t=theme: errors.append(f"[{v}/{t}] console: {m.text[:200]}") if m.type == "error" else None)
                try:
                    start(page, w, h, mode)
                    set_theme(page, theme)
                    page.keyboard.press("Escape")
                    page.wait_for_timeout(400)
                    page.screenshot(path=str(OUT / f"{vname}_{theme}_start.png"))
                    if not QUICK:
                        for g in GAMES:
                            try:
                                page.goto(URL)
                                page.wait_for_timeout(700)
                                for c in CATEGORIES:
                                    try:
                                        page.get_by_text(c).first.click(timeout=1500)
                                        page.wait_for_timeout(500)
                                    except Exception:
                                        pass
                                    loc = page.get_by_text(g, exact=False).first
                                    if loc.count() and loc.is_visible():
                                        loc.click()
                                        page.wait_for_timeout(700)
                                        page.screenshot(path=str(OUT / f"{vname}_{theme}_{g.replace(' ', '')}.png"))
                                        break
                                    page.goto(URL)
                                    page.wait_for_timeout(500)
                            except Exception as e:
                                errors.append(f"[{vname}/{theme}/{g}] {str(e)[:150]}")
                except Exception as e:
                    errors.append(f"[{vname}/{theme}] Setup: {str(e)[:200]}")
                ctx.close()
        b.close()
    if errors:
        print("FEHLER:")
        for e in dict.fromkeys(errors):
            print(" -", e)
        return 1
    print(f"ALLES GUT. Screenshots in {OUT}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
