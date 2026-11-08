#!/usr/bin/env python3
"""Seitenwischen (web/src/shared/page-swipe.js): Touch-Emulation per CDP Input.dispatchTouchEvent.

    $VENV tests/swipe.py [--only abort,complete,flick,vertical,dialog,state,start,tap,fixed,ios,reduced,frames]

Datei: GAMETAB_HTML (Standard docs/index.html). Standalone wird per Stub nachgebaut (navigator.standalone=true),
sonst waere die Geste auf iOS-Safari im Browser aus. Screenshots in tests/out/swipe/.
Exit 0 = alles gut. Nur Chromium, KEIN Nachweis fuer echtes iPhone-Verhalten.
"""
import argparse
import os
import re
import sys
import time
from pathlib import Path
from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "tests" / "out" / "swipe"
URL = (ROOT / os.environ.get("GAMETAB_HTML", "docs/index.html")).resolve().as_uri()
STUB = "Object.defineProperty(navigator,'standalone',{get:()=>true});"
IPHONE_UA = ("Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 "
             "(KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1")
FAILS = []


def check(name, ok, info=""):
    print(("  ok   " if ok else "  FAIL ") + name + (("  [" + str(info) + "]") if info else ""))
    if not ok:
        FAILS.append(name)


def mk(browser, standalone=True, reduced="no-preference", ua=None):
    opts = dict(viewport={"width": 393, "height": 852}, is_mobile=True, has_touch=True, device_scale_factor=2,
                reduced_motion=reduced)
    if ua:
        opts["user_agent"] = ua
    ctx = browser.new_context(**opts)
    if standalone:
        ctx.add_init_script(STUB)
    page = ctx.new_page()
    page._errs = []
    page.on("pageerror", lambda e: page._errs.append(str(e)[:200]))
    page.on("console", lambda m: page._errs.append(m.text[:200]) if m.type == "error" else None)
    page._cdp = ctx.new_cdp_session(page)
    return ctx, page


def tp(page, typ, x=None, y=None):
    pts = [] if x is None else [{"x": x, "y": y, "id": 1}]
    page._cdp.send("Input.dispatchTouchEvent", {"type": typ, "touchPoints": pts})


def drag(page, x0, y0, x1, y1, steps=8, dt=16, release=True):
    tp(page, "touchStart", x0, y0)
    for i in range(1, steps + 1):
        tp(page, "touchMove", x0 + (x1 - x0) * i / steps, y0 + (y1 - y0) * i / steps)
        page.wait_for_timeout(dt)
    if release:
        tp(page, "touchEnd")


def skip_onboarding(page):
    page.goto(URL + "?reset=1")
    page.wait_for_timeout(1000)
    try:
        page.get_by_text("Überspringen").first.click(timeout=5000)
    except Exception:
        pass
    page.wait_for_timeout(2000)  # Geste ist erst nach ~1,2 s scharf


def enter(page, game="Impostor", cat="Partyspiele"):
    skip_onboarding(page)
    page.get_by_text(cat, exact=True).first.click(timeout=3000)
    page.wait_for_timeout(700)
    page.locator("button", has_text=re.compile(r"^\d*\s*" + re.escape(game))).first.click(timeout=3000)
    page.wait_for_timeout(800)


def state(page):
    return page.evaluate("""() => { const r = document.getElementById('root');
      return { snaps: document.querySelectorAll('.gt-swipe-snap').length, tf: r.style.transform, css: r.style.cssText,
               bodyH: document.body.style.height, sw: document.documentElement.hasAttribute('data-gt-swiping'),
               title: (r.querySelector('.gt-gamehead')||{}).innerText || '', hb: r.querySelectorAll('.gt-gamehead .gt-hb').length,
               sy: window.scrollY, tx: new DOMMatrixReadOnly(getComputedStyle(r).transform).m41 } }""")


def clean(page):
    s = state(page)
    return s["snaps"] == 0 and s["tf"] == "" and s["css"] == "" and s["bodyH"] == "" and not s["sw"]


def sc_abort(b):
    print("abort")
    ctx, page = mk(b)
    enter(page)
    drag(page, 10, 400, 130, 410, release=False)
    s = state(page)
    check("mitten in der Geste: Seite folgt (tx ~ dx)", 100 < s["tx"] < 140, s["tx"])
    check("Kopie darunter vorhanden", s["snaps"] == 1, s["snaps"])
    tp(page, "touchEnd")
    page.wait_for_timeout(600)
    check("zurueckgefedert, nichts haengt", clean(page), state(page))
    check("noch im Spiel (Zurueck-Knopf da)", state(page)["hb"] >= 1)
    check("keine Seitenfehler", not page._errs, page._errs)
    ctx.close()


def sc_complete(b):
    print("complete")
    ctx, page = mk(b)
    enter(page)
    before = state(page)["title"]
    drag(page, 10, 400, 300, 410)
    page.wait_for_timeout(700)
    s = state(page)
    check("Abschluss ging zurueck (anderer Kopf)", s["title"] != before and "Partyspiele" in page.inner_text("#root"), s["title"][:30])
    check("nichts haengt", clean(page), s)
    check("keine Seitenfehler", not page._errs, page._errs)
    ctx.close()


def sc_flick(b):
    print("flick")
    ctx, page = mk(b)
    enter(page)
    before = state(page)["title"]
    drag(page, 8, 400, 90, 402, steps=3, dt=8)
    page.wait_for_timeout(700)
    check("Schnippen (kurz, schnell) geht zurueck", state(page)["title"] != before)
    check("nichts haengt", clean(page), state(page))
    # langsam und kurz: nicht
    page.get_by_role("button", name=re.compile("Impostor")).first.click(timeout=3000)
    page.wait_for_timeout(800)
    before = state(page)["title"]
    drag(page, 8, 400, 90, 402, steps=6, dt=90)
    page.wait_for_timeout(700)
    check("langsam und kurz: bleibt", state(page)["title"] == before)
    ctx.close()


def sc_vertical(b):
    print("vertical")
    ctx, page = mk(b)
    enter(page)
    drag(page, 20, 600, 22, 250, steps=10)
    page.wait_for_timeout(500)
    s = state(page)
    check("senkrechtes Wischen scrollt", s["sy"] > 50, s["sy"])
    check("keine Geste dabei", s["snaps"] == 0 and clean(page), s)
    ctx.close()


def sc_dialog(b):
    print("dialog")
    ctx, page = mk(b)
    enter(page)
    page.evaluate("""() => { const d = document.createElement('div'); d.id = 'tdlg'; d.setAttribute('role', 'dialog'); d.setAttribute('aria-modal', 'true');
      d.style.cssText = 'position:fixed;inset:200px 40px;background:#fff;z-index:9999'; document.body.appendChild(d); }""")
    before = state(page)["title"]
    drag(page, 10, 120, 330, 125)
    page.wait_for_timeout(600)
    s = state(page)
    check("offener Dialog sperrt: keine Geste, gleiche Seite", s["snaps"] == 0 and s["title"] == before and clean(page), s)
    ctx.close()


def sc_state(b):
    print("state")
    ctx, page = mk(b)
    enter(page)
    inp = page.locator("#root input[type=text], #root input:not([type])").first
    inp.fill("Wischtest")
    page.wait_for_timeout(300)
    page.evaluate("document.activeElement && document.activeElement.blur()")
    drag(page, 10, 300, 40, 305, release=False)  # Abbruch
    tp(page, "touchEnd")
    page.wait_for_timeout(600)
    check("Abbruch: Eingabe bleibt", page.locator("#root input").first.input_value() == "Wischtest")
    drag(page, 10, 300, 300, 305)
    page.wait_for_timeout(700)
    page.locator("button", has_text=re.compile(r"^\d*\s*Impostor")).first.click(timeout=3000)
    page.wait_for_timeout(800)
    vals = page.eval_on_selector_all("#root input", "els => els.map(e => e.value)")
    check("nach Abschluss und Wiedereintritt: Spielstand bleibt", "Wischtest" in vals, vals)
    ctx.close()


def sc_start(b):
    print("start")
    ctx, page = mk(b)
    skip_onboarding(page)
    drag(page, 8, 400, 300, 405, release=False)
    s = state(page)
    check("Startseite: keine Geste", s["snaps"] == 0 and not s["sw"] and s["tx"] == 0, s)
    tp(page, "touchEnd")
    ctx.close()


def sc_tap(b):
    print("tap")
    ctx, page = mk(b)
    enter(page, game="Impostor")
    page.get_by_role("button").filter(has_text=re.compile("Partyspiele|Zurück|Back", re.I)).first.evaluate("e=>e")  # sicherstellen, dass da was ist
    # Tippen auf Zurueck: Uebergang laeuft, Eingaben frei
    page.locator(".gt-gamehead .gt-hb").first.click()
    page.wait_for_timeout(120)
    mid = page.evaluate("() => ({ snaps: document.querySelectorAll('.gt-swipe-snap').length, tx: new DOMMatrixReadOnly(getComputedStyle(document.querySelector('.gt-swipe-snap')||document.body).transform).m41 })")
    check("Tippen auf Zurueck: Uebergang laeuft (Kopie da)", mid["snaps"] == 1, mid)
    page.wait_for_timeout(500)
    check("danach sauber", clean(page), state(page))
    page.locator("button", has_text=re.compile(r"^\d*\s*Impostor")).first.click()
    page.wait_for_timeout(120)
    mid = state(page)
    check("Tippen auf Karte: Seite gleitet (transform gesetzt)", mid["snaps"] == 1 and 0 < mid["tx"] < 393, mid["tx"])
    page.wait_for_timeout(500)
    check("danach sauber", clean(page), state(page))
    check("keine Seitenfehler", not page._errs, page._errs)
    ctx.close()


def sc_fixed(b):
    print("fixed")
    ctx, page = mk(b)
    enter(page)
    page.evaluate("""() => { const pg = document.querySelector('#root > div'); const f = document.createElement('div'); f.id = 'fx';
      f.style.cssText = 'position:fixed;bottom:0;left:0;width:120px;height:40px;background:red;z-index:50'; pg.appendChild(f); }""")
    page.evaluate("window.scrollTo(0, 300)")
    page.wait_for_timeout(300)
    r0 = page.evaluate("(() => { const r = document.getElementById('fx').getBoundingClientRect(); return [r.top, r.left]; })()")
    drag(page, 10, 400, 130, 405, release=False)
    r1 = page.evaluate("(() => { const r = document.getElementById('fx').getBoundingClientRect(); return [r.top, r.left]; })()")
    s = state(page)
    check("fixe Eingabe springt nicht (gleiche Hoehe, folgt nach rechts)", abs(r1[0] - r0[0]) < 1.5 and 100 < r1[1] < 140, (r0, r1))
    check("Scrollposition bleibt waehrend der Geste", abs(s["sy"] - 300) < 2, s["sy"])
    tp(page, "touchEnd")
    page.wait_for_timeout(600)
    r2 = page.evaluate("(() => { const r = document.getElementById('fx').getBoundingClientRect(); return [r.top, r.left]; })()")
    check("danach wieder an alter Stelle", abs(r2[0] - r0[0]) < 1.5 and abs(r2[1] - r0[1]) < 1.5 and abs(state(page)["sy"] - 300) < 2, (r2, state(page)["sy"]))
    check("nichts haengt", clean(page), state(page))
    ctx.close()


def sc_ios(b):
    print("ios (Safari im Browser: keine Geste)")
    ctx, page = mk(b, standalone=False, ua=IPHONE_UA)
    enter(page)
    drag(page, 10, 400, 130, 405, release=False)
    check("iOS-Safari-Browser: keine Geste", state(page)["snaps"] == 0 and state(page)["tx"] == 0, state(page))
    tp(page, "touchEnd")
    ctx.close()


def sc_reduced(b):
    print("reduced motion (Sprung am Ende)")
    ctx, page = mk(b, reduced="reduce")
    enter(page)
    before = state(page)["title"]
    drag(page, 10, 400, 130, 405, release=False)
    s = state(page)
    check("waehrend der Geste kein Slide", s["tx"] == 0 and s["snaps"] == 0, s)
    tp(page, "touchEnd")
    page.wait_for_timeout(400)
    check("kurzer Weg: bleibt", state(page)["title"] == before)
    drag(page, 10, 400, 300, 405)
    page.wait_for_timeout(500)
    check("langer Weg: Sprung zurueck", state(page)["title"] != before and clean(page), state(page))
    ctx.close()


def sc_frames(b):
    print("frames (Einzelbilder)")
    from PIL import Image
    OUT.mkdir(parents=True, exist_ok=True)
    ctx, page = mk(b)
    enter(page)
    shots = []
    tp(page, "touchStart", 10, 420)
    x = 10
    for target in (40, 110, 200, 290):
        while x < target:
            x += 10
            tp(page, "touchMove", x, 424)
            page.wait_for_timeout(16)
        page.wait_for_timeout(60)
        p = OUT / f"f{target}.png"
        page.screenshot(path=str(p))
        shots.append(p)
    tp(page, "touchEnd")
    page.wait_for_timeout(120)
    p = OUT / "f_end.png"
    page.screenshot(path=str(p))
    shots.append(p)
    page.wait_for_timeout(600)
    p = OUT / "f_done.png"
    page.screenshot(path=str(p))
    shots.append(p)
    ims = [Image.open(s).convert("RGB") for s in shots]
    w, h = ims[0].size
    sheet = Image.new("RGB", (w * len(ims) // 2 + 10 * len(ims), h // 2), (30, 30, 30))
    for i, im in enumerate(ims):
        sheet.paste(im.resize((w // 2, h // 2)), (i * (w // 2 + 10), 0))
    sheet.save(OUT / "swipe.png")
    check("Einzelbilder gespeichert", (OUT / "swipe.png").exists(), str(OUT / "swipe.png"))
    ctx.close()


def sc_settings(b):
    print("settings")
    ctx, page = mk(b)
    skip_onboarding(page)
    page.locator('button[aria-label="Einstellungen"]').first.click(timeout=3000)
    page.wait_for_timeout(900)
    check("Einstellungen offen", "Einstellungen" in page.inner_text("#root"))
    drag(page, 10, 400, 300, 410)
    page.wait_for_timeout(800)
    txt = page.inner_text("#root")
    check("Wischen fuehrt zur Startseite", "Schreibunterlagen" in txt and "Als Datei exportieren" not in txt, txt[:40])
    check("nichts haengt", clean(page), state(page))
    check("keine Seitenfehler", not page._errs, page._errs)
    ctx.close()


ALL = {"abort": sc_abort, "complete": sc_complete, "flick": sc_flick, "vertical": sc_vertical, "dialog": sc_dialog,
       "state": sc_state, "start": sc_start, "tap": sc_tap, "fixed": sc_fixed, "ios": sc_ios, "reduced": sc_reduced, "frames": sc_frames, "settings": sc_settings}


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--only", default=",".join(ALL))
    a = ap.parse_args()
    with sync_playwright() as p:
        b = p.chromium.launch()
        for n in a.only.split(","):
            ALL[n.strip()](b)
        b.close()
    print("\n" + ("ALLES GUT" if not FAILS else "FEHLER: " + "; ".join(FAILS)))
    sys.exit(1 if FAILS else 0)


if __name__ == "__main__":
    main()
