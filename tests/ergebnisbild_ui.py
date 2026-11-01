#!/usr/bin/env python3
"""Ergebnisbild Gruppe C: Endpanels mit "Als Bild teilen" in allen Themes und Layouts ansehen.

Aufruf (nach npm run build): GAMETAB_HTML=docs/index.html $VENV tests/ergebnisbild_ui.py [--only Impostor]
Screenshots: tests/out/ergebnisbild/ui_<spiel>_<theme>_<layout>.png. Prueft: Knopf sichtbar, mindestens 44 px hoch, nichts ragt seitlich heraus.
Layouts: Handy 393x852, Querformat 852x393 (Touch), Tablet 820x1180.
"""
import os
import re
import sys

os.environ.setdefault("GAMETAB_HTML", "docs/index.html")
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import regression as R  # noqa: E402
import ergebnisbild_app as A  # noqa: E402
from playwright.sync_api import sync_playwright  # noqa: E402

ONLY = [sys.argv[i + 1] for i, a in enumerate(sys.argv) if a == "--only" and i + 1 < len(sys.argv)]
THEMES = ["Nocturne", "Hell", "Vitrum", "Noir"]
LAYOUTS = [("hoch", 393, 852, False), ("quer", 852, 393, True), ("tablet", 820, 1180, False)]
FLOWS = {"Impostor": A.flow_impostor, "Verraeter": A.flow_verraeter, "Werwolf": A.flow_werwolf, "Mafia": A.flow_mafia, "Am ehesten": A.flow_amehesten}


def main():
    fails = []
    with sync_playwright() as p:
        b = A.launch(p, "chromium")
        for name, fn in FLOWS.items():
            if ONLY and not any(o.lower() in name.lower() for o in ONLY):
                continue
            for th in THEMES:
                for lay, w, h, touch in LAYOUTS:
                    if th != "Nocturne" and lay != "hoch":
                        continue
                    errs = []
                    ctx, pg = R.new_page(b, w, h, "Handy", errs, theme=th, touch=touch)
                    tag = f"{name}_{th}_{lay}".replace(" ", "_")
                    try:
                        # Ende des Ablaufs: bei den Spielleiter-Spielen bis "Bild teilen", bei Am ehesten bis zum Ergebnisfenster
                        orig = A.share_png
                        fn(pg)
                        pg.wait_for_timeout(500)
                        sh = pg.get_by_role("button", name=re.compile("Bild teilen"))
                        R.check(sh.count() > 0, f"{tag}: Knopf fehlt")
                        bb = sh.first.bounding_box()
                        R.check(bb and bb["height"] >= 43.5, f"{tag}: Knopf zu niedrig {bb}")
                        ov = pg.evaluate("document.documentElement.scrollWidth - window.innerWidth")
                        R.check(ov <= 1, f"{tag}: seitlich {ov}px zu breit")
                        sh.first.scroll_into_view_if_needed()
                        pg.screenshot(path=str(A.OUT / f"ui_{tag}.png"))
                        print("OK    ", tag)
                    except Exception as e:  # noqa: BLE001
                        fails.append(f"{tag}: {str(e)[:200]}")
                        print("FEHLER", tag, str(e)[:200])
                        pg.screenshot(path=str(A.OUT / f"ui_{tag}_fehler.png"))
                    ctx.close()
        b.close()
    print(f"\n{len(fails)} Fehler")
    return 1 if fails else 0


if __name__ == "__main__":
    sys.exit(main())
