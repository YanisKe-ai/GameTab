#!/usr/bin/env python3
"""Heads Up Querformat: Kopf darf nach dem Drehen (auch mit altem Hochformat-Wert --gt-sat 47px) nicht
unter die HUD-Zeile rutschen (Selbstverriegelung des sticky Kopfes in game-header.js).

    ~/.gametab-venv/bin/python tests/t_hu.py        (erst nach npm run build)

Chromium stumm.
"""
import re
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from landscape import new_phone, start, goto_game, rotate, wait  # noqa: E402

FAILS = []
JS = """()=>{const t=s=>{const e=document.querySelector(s);return e?Math.round(e.getBoundingClientRect().top):null};
return {head:t('.gt-gamehead'),hud:t('.gtL-headsup-hud'),top:(document.querySelector('.gt-gamehead')||{style:{}}).style.top}}"""


def check(c, m):
    if not c:
        FAILS.append(m)
        print("FEHLER:", m)


def run(pg):
    b = pg.context.browser
    ctx, p2 = new_phone(b, 393, 852)
    ctx.add_init_script("try{localStorage.setItem('gt_soundEnabled','false')}catch(e){}")
    try:
        start(p2, "Nocturne")
        p2.evaluate("document.documentElement.style.setProperty('--gt-sat','47px')")
        goto_game(p2, "Partyspiele", "HeadsUp")
        for nm in [r"Spiel starten", r"Starten"]:
            l = p2.get_by_role("button", name=re.compile(nm))
            if l.count():
                l.last.click()
                break
        wait(p2, 700)
        l = p2.get_by_role("button", name=re.compile("Bereit"))
        if l.count():
            l.first.click()
            wait(p2, 700)
        tops = []
        for w, h in [(393, 852), (852, 393), (393, 852), (852, 393)]:
            p2.set_viewport_size({"width": w, "height": h})
            wait(p2, 900)
            if w > h:
                p2.evaluate("document.documentElement.style.setProperty('--gt-sat','0px')")
                p2.set_viewport_size({"width": w - 1, "height": h})
                wait(p2, 700)
                i = p2.evaluate(JS)
                tops.append(i["head"])
                check(i["head"] is not None and i["hud"] is not None and i["head"] < i["hud"],
                      f"Kopf ({i['head']}) nicht ueber HUD ({i['hud']}) im Querformat")
                check(i["head"] is not None and i["head"] <= 20, f"Kopf zu tief: {i['head']}")
                p2.evaluate("document.documentElement.style.setProperty('--gt-sat','47px')")
        check(len(tops) == 2 and abs(tops[0] - tops[1]) <= 2, f"Kopf wandert zwischen Drehungen: {tops}")
    finally:
        ctx.close()


if __name__ == "__main__":
    from playwright.sync_api import sync_playwright
    with sync_playwright() as p:
        b = p.chromium.launch(args=["--mute-audio"])
        ctx, pg = new_phone(b, 393, 852)
        run(pg)
        b.close()
    print("OK" if not FAILS else f"{len(FAILS)} Fehler")
    sys.exit(1 if FAILS else 0)
