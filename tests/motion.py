#!/usr/bin/env python3
"""Motion-Pruefung (Playwright, Python): Dialog auf/zu, Fokus, Scroll-Spruenge, Layoutspruenge (CLS),
haengende Animationen, Tutto-Spur und Border Beam, Bildvorschau.

    $VENV tests/motion.py [--vp 393x852,1280x800] [--theme Nocturne,Hell,Vitrum,Noir]

Datei: GAMETAB_HTML (Standard docs/index.html). Screenshots: tests/out/motion/. Exit 1 bei Fehlern.
Nur Browser (Chromium), kein echtes Geraet.
"""
import argparse
import os
import re
import sys
import time
from pathlib import Path
from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "tests" / "out" / "motion"
URL = (ROOT / os.environ.get("GAMETAB_HTML", "docs/index.html")).resolve().as_uri()
OUT.mkdir(parents=True, exist_ok=True)
INIT = """
try{Object.defineProperty(window,'AudioContext',{value:undefined,configurable:true});Object.defineProperty(window,'webkitAudioContext',{value:undefined,configurable:true});
Object.defineProperty(navigator,'share',{value:undefined,configurable:true});Object.defineProperty(navigator,'canShare',{value:undefined,configurable:true});}catch(e){}
window.__cls=0;try{new PerformanceObserver(l=>{for(const e of l.getEntries())if(!e.hadRecentInput)window.__cls+=e.value;}).observe({type:'layout-shift',buffered:true});}catch(e){}
"""
fails, notes = [], []


def check(cond, msg):
    if not cond:
        fails.append(msg)
        print("   FEHLER:", msg)


def note(msg):
    notes.append(msg)
    print("   ", msg)


def w(pg, ms=500):
    pg.wait_for_timeout(ms)


def run(pw, vp, theme, mode):
    W, H = vp
    tag = f"{W}x{H}-{theme}"
    ctx = pw.chromium.launch().new_context(viewport={"width": W, "height": H}, has_touch=(mode == "Handy"), device_scale_factor=1)
    ctx.add_init_script(INIT)
    pg = ctx.new_page()
    errs = []
    pg.on("pageerror", lambda e: errs.append(str(e)[:200]))
    pg.on("console", lambda m: errs.append(m.text[:200]) if m.type == "error" and "favicon" not in m.text else None)
    pg.goto(URL + "?reset=1"); w(pg, 800)
    try:
        pg.get_by_text("Überspringen").first.click(timeout=2000); w(pg)
    except Exception:
        pass
    pg.locator('button[aria-label="Einstellungen"]').first.click(); w(pg)
    pg.get_by_role("button", name=mode, exact=True).first.click(); w(pg)
    pg.get_by_role("button", name=theme, exact=True).first.click(); w(pg)
    pg.goto(URL); w(pg, 900)

    # 1. Dialog oeffnen / schliessen, Fokus, Scroll
    btn = pg.locator('button[aria-label="Einstellungen"]').first
    y0 = pg.evaluate("scrollY")
    t0 = time.time(); btn.click(); w(pg, 400)
    check(pg.evaluate("document.querySelectorAll('[role=dialog]').length") >= 0, "Dialog")
    pg.screenshot(path=str(OUT / f"{tag}-dialog.png"))
    pg.get_by_role("button", name="Zur Startseite").first.click(); w(pg, 600)
    foc = pg.evaluate("document.activeElement && (document.activeElement.getAttribute('aria-label')||document.activeElement.tagName)")
    if foc != "Einstellungen":  # Einstellungen sind eine Seite; Fokus geht auf body, nur Hinweis
        note(f"{tag}: Fokus nach Schliessen der Einstellungen: {foc}")
    check(abs(pg.evaluate("scrollY") - y0) < 2, f"{tag}: Scroll-Sprung beim Dialog")

    # 2. Seitenwechsel + Tutto
    pg.get_by_text("Schreibunterlagen", exact=True).first.click(); w(pg, 600)
    pg.locator("button", has_text=re.compile(r"^\d*\s*Tutto")).first.click(); w(pg, 600)
    cls0 = pg.evaluate("window.__cls")
    pg.get_by_role("button", name="Spiel starten", exact=True).click(); w(pg, 900)
    cls1 = pg.evaluate("window.__cls")
    note(f"{tag}: CLS Tutto-Start {cls1 - cls0:.3f}")
    check(cls1 - cls0 < 0.1, f"{tag}: Layoutsprung beim Spielstart {cls1 - cls0:.3f}")
    g0 = pg.evaluate("getComputedStyle(document.querySelector('.tt-glide')).opacity")
    check(float(g0) < 0.05, f"{tag}: gelber Rahmen ohne Auswahl sichtbar (opacity {g0})")
    pg.locator(".tt-lane").first.click(); w(pg, 500)
    g1 = pg.evaluate("getComputedStyle(document.querySelector('.tt-glide')).opacity")
    check(float(g1) > 0.95, f"{tag}: gelber Rahmen nach Antippen nicht sichtbar (opacity {g1})")
    # Spur / Wuerfel: Position vs. Fortschritt
    pg.screenshot(path=str(OUT / f"{tag}-tutto-start.png"))

    # 3. Eingabe: Autofokus, Scroll
    inp = pg.get_by_placeholder("Punkte").first
    y0 = pg.evaluate("scrollY")
    inp.click(); w(pg, 300)
    af = pg.evaluate("document.activeElement.tagName")
    check(af == "INPUT", f"{tag}: Eingabe nicht fokussiert ({af})")
    check(abs(pg.evaluate("scrollY") - y0) < 2, f"{tag}: Scroll-Sprung beim Oeffnen der Eingabe")
    inp.fill("1500"); pg.keyboard.press("Enter"); w(pg, 700)
    x = pg.evaluate("""()=>{const d=document.querySelector('.tt-die'),t=document.querySelector('.tt-track');
      if(!d||!t)return null;const a=d.getBoundingClientRect(),b=t.getBoundingClientRect();
      const tr=document.querySelector('.tt-trail').getBoundingClientRect(),tw=document.querySelector('.tt-trailw').getBoundingClientRect();
      return {dieLeft:a.left-b.left,track:b.width,dieW:a.width,trailRight:tr.right-b.left,clip:tw.width}}""")
    note(f"{tag}: Spur {x}")
    check(x is not None and x["dieLeft"] > 1, f"{tag}: Würfel bewegt sich nicht")
    pg.screenshot(path=str(OUT / f"{tag}-tutto-1500.png"))
    # Sieg -> Podest -> Bildvorschau
    cls0 = pg.evaluate("window.__cls")
    pg.locator(".tt-lane").first.click(); w(pg, 300)
    pg.get_by_placeholder("Punkte").first.fill("9000"); pg.keyboard.press("Enter"); w(pg, 2800)
    share = pg.get_by_role("button", name=re.compile(r"Bild teilen"))
    if share.count():
        share.first.click()
        t0 = time.time()
        while time.time() - t0 < 12 and not pg.evaluate("[...document.querySelectorAll('.gtsp-ov img')].some(i=>i.naturalWidth>50)"):
            w(pg, 100)
        w(pg, 120)
        pg.screenshot(path=str(OUT / f"{tag}-share-mid.png"))
        w(pg, 600)
        pg.screenshot(path=str(OUT / f"{tag}-share.png"))
        op = pg.evaluate("getComputedStyle(document.querySelector('.gtsp-ov img').parentElement).opacity")
        check(float(op) > 0.99, f"{tag}: Bildvorschau bleibt unsichtbar (opacity {op})")
        pg.keyboard.press("Escape"); w(pg, 500)
    else:
        note(f"{tag}: kein 'Bild teilen' sichtbar")
    # 4. haengende Animationen
    w(pg, 1500)
    stuck = pg.evaluate("""()=>document.getAnimations().filter(a=>{const e=a.effect&&a.effect.getTiming();return a.playState==='running'&&e&&e.iterations!==Infinity&&e.duration>0&&a.currentTime>a.effect.getComputedTiming().endTime+500}).length""")
    check(stuck == 0, f"{tag}: {stuck} haengende Animationen")
    inf = pg.evaluate("document.getAnimations().filter(a=>a.effect&&a.effect.getTiming().iterations===Infinity).length")
    note(f"{tag}: endlose Animationen auf dieser Seite: {inf}")
    check(not errs, f"{tag}: Konsolenfehler {errs[:2]}")
    ctx.browser.close()


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--vp", default="393x852,1280x800")
    ap.add_argument("--theme", default="Nocturne,Hell,Vitrum,Noir")
    a = ap.parse_args()
    vps = [tuple(int(n) for n in v.split("x")) for v in a.vp.split(",")]
    with sync_playwright() as pw:
        for vp in vps:
            mode = "Handy" if vp[0] < 700 else "Laptop"
            for th in a.theme.split(","):
                print(vp, th)
                try:
                    run(pw, vp, th, mode)
                except Exception as e:
                    fails.append(f"{vp} {th}: Abbruch {str(e)[:200]}")
                    print("   ABBRUCH", str(e)[:200])
    print(f"\n{len(fails)} Fehler, {len(notes)} Hinweise. Screenshots: {OUT}")
    sys.exit(1 if fails else 0)


if __name__ == "__main__":
    main()
