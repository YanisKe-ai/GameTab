#!/usr/bin/env python3
"""Handy-Querformat: Testwerkzeug (Playwright, Python).

    $VENV tests/landscape.py                       # alle Querformat-Viewports, Nocturne, Startseite + Negativfaelle
    $VENV tests/landscape.py --vp 844x390 --theme Vitrum
    $VENV tests/landscape.py --vp all --theme all  # 7 Viewports x 4 Themes
    $VENV tests/landscape.py --only neg            # nur Negativfaelle (Attribut darf nicht gesetzt sein)
    $VENV tests/landscape.py --only start,rotate   # Startseite quer, Drehen hin und zurueck

Datei: GAMETAB_HTML (Standard docs/index.html). Screenshots: tests/out/landscape/.
Exit 0 = alles gut, 1 = Fehler (Attribut falsch, horizontaler Seitenueberlauf, Seitenfehler, Drehen veraendert Hochformat).
Touchflaechen < 44x44 werden gelistet (Hinweis, kein Fehler; mit --strict-touch als Fehler).

Simulation: Kontext mit is_mobile + has_touch (wie ein Handy). Ohne festes `screen` folgt in Chromium
screen und screen.orientation dem Viewport, d.h. rotate() = Viewport tauschen ohne Reload ist eine echte
Drehung aus Sicht der App. Tastatur im Hochformat = festes screen 393x852 und kleinerer Viewport
(visualViewport/innerHeight kleiner, Orientierung bleibt hochkant). Das ist KEIN Nachweis fuer echtes
iOS-Safari-Verhalten; echte Geraete separat pruefen.

Fuer andere Helfer importierbar:
    from landscape import new_phone, start, goto_game, rotate, check_page, shot, URL, VIEWPORTS
"""
import argparse
import os
import re
import sys
from pathlib import Path
from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "tests" / "out" / "landscape"
HTML_PATH = (ROOT / os.environ.get("GAMETAB_HTML", "docs/index.html")).resolve()
URL = HTML_PATH.as_uri()
VIEWPORTS = [(568, 320), (667, 375), (740, 360), (812, 375), (844, 390), (852, 393), (932, 430)]
THEMES = ["Nocturne", "Hell", "Vitrum", "Noir"]
ATTR = "data-phone-landscape"
CALM_CSS = ("*,*::before,*::after{animation:none!important;transition:none!important;"
            "caret-color:transparent!important;scroll-behavior:auto!important}")
WAIT = 500


def wait(page, ms=WAIT):
    page.wait_for_timeout(ms)


def new_phone(browser, w, h, screen=None, mobile=True):
    """Neuer Handy-Kontext (Touch, isMobile). screen=(w,h) fixiert den Bildschirm (fuer Tastatur-Simulation)."""
    opts = dict(viewport={"width": w, "height": h}, is_mobile=mobile, has_touch=mobile, device_scale_factor=2 if mobile else 1,
                reduced_motion="reduce")
    if screen:
        opts["screen"] = {"width": screen[0], "height": screen[1]}
    ctx = browser.new_context(**opts)
    page = ctx.new_page()
    page._pl_errors = []
    page.on("pageerror", lambda e: page._pl_errors.append("pageerror: " + str(e)[:200]))
    page.on("console", lambda m: page._pl_errors.append("console: " + m.text[:200]) if m.type == "error" else None)
    return ctx, page


def start(page, theme="Nocturne", mode="Handy", query=""):
    """Frischer Zustand (?reset=1), Onboarding ueberspringen, Modus und Theme setzen, Startseite laden.
    Laeuft im aktuellen Viewport; fuer Querformat vorher im Hochformat starten und danach rotate()."""
    page.goto(URL + "?reset=1")
    wait(page, 800)
    try:
        page.get_by_text("Überspringen").first.click(timeout=2000)
        wait(page)
    except Exception:
        pass
    page.locator('button[aria-label="Einstellungen"]').first.click()
    wait(page)
    page.get_by_role("button", name=mode, exact=True).first.click()
    wait(page)
    page.get_by_role("button", name=theme, exact=True).first.click()
    wait(page)
    page.goto(URL + (("?" + query) if query else ""))
    wait(page, 800)


def calm(page):
    try:
        page.add_style_tag(content=CALM_CSS)
    except Exception:
        pass


def goto_game(page, cat, name):
    """Von der Startseite in Kategorie ('Schreibunterlagen'/'Partyspiele') und Spiel (Name wie auf der Karte)."""
    page.get_by_text(cat, exact=True).first.click(timeout=3000)
    wait(page)
    page.locator("button", has_text=re.compile(r"^\d*\s*" + re.escape(name))).first.click(timeout=3000)
    wait(page, 700)


def rotate(page, to="landscape"):
    """Viewport tauschen ohne Reload. to='landscape' | 'portrait' | 'toggle'."""
    vs = page.viewport_size
    w, h = vs["width"], vs["height"]
    land = w > h
    if to == "toggle" or (to == "landscape" and not land) or (to == "portrait" and land):
        page.set_viewport_size({"width": h, "height": w})
    wait(page)


def keyboard_portrait(page, w=393, h=852, visible_h=300):
    """Simuliert offene Bildschirmtastatur im Hochformat (Chromium/CDP): Bildschirm und Orientierung bleiben
    hochkant, das Fenster wird niedriger als breit. Playwright selbst koppelt screen an den Viewport, darum CDP."""
    cdp = page.context.new_cdp_session(page)
    cdp.send("Emulation.setDeviceMetricsOverride", {"width": w, "height": visible_h, "deviceScaleFactor": 2, "mobile": True,
             "screenWidth": w, "screenHeight": h, "screenOrientation": {"type": "portraitPrimary", "angle": 0}})
    page.evaluate("window.dispatchEvent(new Event('resize'))")
    wait(page)
    return cdp


def has_attr(page):
    return page.evaluate(f"document.documentElement.hasAttribute('{ATTR}')")


def overflow_x(page):
    """Horizontaler Seitenueberlauf in px (0 = gut)."""
    return page.evaluate("Math.max(0, document.documentElement.scrollWidth - window.innerWidth, document.body.scrollWidth - window.innerWidth)")


TOUCH_JS = r"""(min) => {
  const vw = innerWidth, vh = innerHeight, out = [];
  for (const el of document.querySelectorAll('button, [role=button], a[href], input:not([type=hidden]), select, summary')) {
    const r = el.getBoundingClientRect();
    if (!r.width || !r.height) continue;
    const cs = getComputedStyle(el);
    if (cs.visibility === 'hidden' || cs.display === 'none' || el.closest('[aria-hidden=true],[inert]')) continue;
    if (r.right <= 0 || r.bottom <= 0 || r.left >= vw || r.top >= vh) continue;
    let w = r.width, h = r.height;
    if (el.classList.contains('gt-hit')) { const b = getComputedStyle(el, '::before');
      w = Math.max(w, w - 2 * (parseFloat(b.left) || 0)); h = Math.max(h, h - 2 * (parseFloat(b.top) || 0)); }
    if (w + 0.5 < min || h + 0.5 < min) {
      const name = (el.getAttribute('aria-label') || el.textContent || el.getAttribute('title') || el.tagName).trim().replace(/\s+/g, ' ').slice(0, 40);
      out.push({ name, w: Math.round(w), h: Math.round(h), x: Math.round(r.left), y: Math.round(r.top) });
    }
  }
  return out;
}"""


def small_targets(page, min_px=44):
    """Bedienelemente im Viewport mit Touchflaeche < min_px (Liste)."""
    return page.evaluate(TOUCH_JS, min_px)


def scroll_reach(page):
    """Kann die Seite (oder ein Scrollbereich) bis zum Ende gescrollt werden? Liefert (scrollbar, erreicht_ende)."""
    return page.evaluate("""() => { const se = document.scrollingElement; const max = se.scrollHeight - innerHeight;
      if (max <= 1) return [false, true]; window.scrollTo(0, max); const ok = Math.abs(se.scrollTop - max) <= 2 || scrollY >= max - 2;
      window.scrollTo(0, 0); return [true, ok]; }""")


def shot(page, name):
    OUT.mkdir(parents=True, exist_ok=True)
    calm(page)
    wait(page, 150)
    p = OUT / (re.sub(r"[^\w.-]+", "_", name) + ".png")
    page.screenshot(path=str(p))
    return p


def check_page(page, label, expect_attr=True, strict_touch=False, report=None):
    """Standardpruefung: Attribut, horizontaler Ueberlauf, Touchflaechen. Gibt Liste von Fehlern zurueck."""
    errs = []
    a = has_attr(page)
    if a != expect_attr:
        errs.append(f"{label}: Attribut {'fehlt' if expect_attr else 'gesetzt'}")
    ox = overflow_x(page)
    if ox > 0:
        errs.append(f"{label}: horizontaler Seitenueberlauf {ox}px")
    if expect_attr:
        small = small_targets(page)
        if small:
            msg = f"{label}: {len(small)} Touchflaechen < 44px: " + ", ".join(f"{s['name']!r} {s['w']}x{s['h']}" for s in small[:8])
            (errs if strict_touch else (report if report is not None else [])).append(msg)
    errs += [f"{label}: {e}" for e in getattr(page, "_pl_errors", [])]
    if hasattr(page, "_pl_errors"):
        page._pl_errors.clear()
    return errs


def img_diff(a, b):
    try:
        from PIL import Image, ImageChops
    except Exception:
        return -1
    ia, ib = Image.open(a).convert("RGB"), Image.open(b).convert("RGB")
    if ia.size != ib.size:
        return ia.size[0] * ia.size[1]
    bbox = ImageChops.difference(ia, ib).getbbox()
    if not bbox:
        return 0
    d = ImageChops.difference(ia, ib).convert("L").point(lambda v: 255 if v > 0 else 0)
    return sum(1 for v in d.getdata() if v)


# ---------- Szenarien ----------

def sc_start(b, vps, themes, strict, notes):
    """Startseite im Querformat: Attribut, kein Ueberlauf, scrollbar bis zum Ende."""
    errs = []
    for theme in themes:
        for (w, h) in vps:
            ctx, page = new_phone(b, h, w)  # Hochformat-Basis
            try:
                start(page, theme)
                rotate(page, "landscape")
                lab = f"start {w}x{h} {theme}"
                errs += check_page(page, lab, True, strict, notes)
                scr, end = scroll_reach(page)
                if not end:
                    errs.append(f"{lab}: Seitenende nicht erreichbar")
                shot(page, f"start_{w}x{h}_{theme}")
                if scr:
                    page.evaluate("window.scrollTo(0, document.scrollingElement.scrollHeight)")
                    shot(page, f"start_{w}x{h}_{theme}_ende")
                    page.evaluate("window.scrollTo(0, 0)")
            except Exception as e:
                errs.append(f"start {w}x{h} {theme}: Ausnahme {str(e)[:160]}")
            ctx.close()
    return errs


def sc_rotate(b, vps, themes, strict, notes):
    """Hochformat -> quer -> zurueck: Attribut folgt, Hochformat danach pixelgleich; Drehen mit offenem Eingabefeld."""
    errs = []
    w, h = vps[0]
    for theme in themes[:1]:
        ctx, page = new_phone(b, h, w)
        try:
            start(page, theme)
            lab = f"rotate {w}x{h} {theme}"
            if has_attr(page):
                errs.append(f"{lab}: Attribut im Hochformat gesetzt")
            a = shot(page, f"rotate_{theme}_1_portrait")
            rotate(page, "landscape")
            if not has_attr(page):
                errs.append(f"{lab}: Attribut nach Drehen nicht gesetzt")
            shot(page, f"rotate_{theme}_2_landscape")
            rotate(page, "portrait")
            if has_attr(page):
                errs.append(f"{lab}: Attribut nach Zurueckdrehen noch gesetzt")
            page.evaluate("window.scrollTo(0,0)")
            bb = shot(page, f"rotate_{theme}_3_portrait_back")
            n = img_diff(a, bb)
            if n > 0:
                errs.append(f"{lab}: Hochformat nach Hin-und-zurueck-Drehen {n} px anders ({bb.name})")
            # Drehen mit offenem Eingabefeld (Tastatur offen): muss ausloesen
            inp = page.locator("input:visible").first
            if inp.count():
                inp.focus()
                rotate(page, "landscape")
                if not has_attr(page):
                    errs.append(f"{lab}: Drehen mit fokussiertem Eingabefeld loest nicht aus")
                rotate(page, "portrait")
            else:
                notes.append(f"{lab}: kein Eingabefeld auf der Startseite, Fokus-Drehung uebersprungen")
            errs += check_page(page, lab + " (zurueck)", False)
        except Exception as e:
            errs.append(f"rotate: Ausnahme {str(e)[:160]}")
        ctx.close()
    return errs


def sc_neg(b, vps, themes, strict, notes):
    """Negativfaelle: Attribut darf nicht gesetzt sein."""
    errs = []
    theme = themes[0]
    cases = [
        ("Hochformat 393x852", dict(w=393, h=852), None),
        ("Hochformat + Tastatur 393x300", dict(w=393, h=852), "kbd"),
        ("Tablet quer 1024x768", dict(w=768, h=1024), (1024, 768)),
        ("Laptop-Modus 1512x982", dict(w=1512, h=982, mobile=False, mode="Laptop"), None),
        ("Laptop-Modus 900x600", dict(w=900, h=600, mobile=False, mode="Laptop"), None),
        ("Laptop-Modus Handy quer 844x390 + ?pl=1", dict(w=390, h=844, mode="Laptop", query="pl=1"), (844, 390)),
        ("Desktop 1512x982 Handy-Modus", dict(w=1512, h=982, mobile=False), None),
    ]
    for label, o, after in cases:
        ctx, page = new_phone(b, o["w"], o["h"], screen=o.get("screen"), mobile=o.get("mobile", True))
        try:
            start(page, theme, o.get("mode", "Handy"), o.get("query", ""))
            if after == "kbd":
                keyboard_portrait(page)
            elif after:
                page.set_viewport_size({"width": after[0], "height": after[1]})
                wait(page)
            if label.startswith("Hochformat + Tastatur"):
                # Plausibilitaet der Simulation: Fenster ist breiter als hoch, Orientierung bleibt hochkant
                info = page.evaluate("[innerWidth, innerHeight, screen.orientation && screen.orientation.type]")
                if not (info[0] > info[1] and str(info[2]).startswith("portrait")):
                    notes.append(f"neg {label}: Simulation unplausibel {info}")
            errs += check_page(page, "neg " + label, False)
            shot(page, "neg_" + label)
        except Exception as e:
            errs.append(f"neg {label}: Ausnahme {str(e)[:160]}")
        ctx.close()
    # Uebersteuerung ?pl=0 im Querformat
    ctx, page = new_phone(b, 390, 844)
    try:
        start(page, theme, "Handy", "pl=0")
        rotate(page, "landscape")
        errs += check_page(page, "neg ?pl=0 quer", False)
    except Exception as e:
        errs.append(f"neg ?pl=0: Ausnahme {str(e)[:160]}")
    ctx.close()
    return errs


SCENARIOS = {"start": sc_start, "rotate": sc_rotate, "neg": sc_neg}


def parse_vps(s):
    if not s or s == "all":
        return VIEWPORTS
    out = []
    for p in s.split(","):
        m = re.match(r"^(\d+)x(\d+)$", p.strip())
        if not m:
            raise SystemExit(f"--vp: ungueltig {p!r} (z.B. 844x390)")
        out.append((int(m.group(1)), int(m.group(2))))
    return out


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--vp", default="all", help="Viewports quer, z.B. 844x390,568x320 oder all")
    ap.add_argument("--theme", default="Nocturne", help="Nocturne|Hell|Vitrum|Noir|all, kommagetrennt")
    ap.add_argument("--only", default="start,rotate,neg", help="Szenarien: " + ",".join(SCENARIOS))
    ap.add_argument("--strict-touch", action="store_true", help="Touchflaechen < 44px als Fehler werten")
    a = ap.parse_args()
    themes = THEMES if a.theme == "all" else [t.strip() for t in a.theme.split(",")]
    vps = parse_vps(a.vp)
    if not HTML_PATH.exists():
        raise SystemExit(f"Datei fehlt: {HTML_PATH} (npm run build?)")
    errs, notes = [], []
    with sync_playwright() as p:
        b = p.chromium.launch()
        for name in [s.strip() for s in a.only.split(",") if s.strip()]:
            if name not in SCENARIOS:
                raise SystemExit(f"--only: unbekannt {name!r}")
            e = SCENARIOS[name](b, vps, themes, a.strict_touch, notes)
            print(f"[{name}] {'OK' if not e else str(len(e)) + ' Fehler'}")
            errs += e
        b.close()
    for n in notes:
        print("HINWEIS", n)
    for e in errs:
        print("FEHLER", e)
    print(("FEHLER: " + str(len(errs))) if errs else "ALLES GUT", f"(Screenshots: {OUT})")
    sys.exit(1 if errs else 0)


if __name__ == "__main__":
    main()
