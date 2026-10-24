#!/usr/bin/env python3
"""Pixelvergleich zweier GameTab-Builds (z.B. Wurzel-index.html gegen docs/index.html).

    python3 tools/pixcmp.py index.html docs/index.html [--out tests/out/pixcmp] [--quick] [--jobs 4] [--tol 0]

Ansichten: Startseite, beide Kategorien, Einstellungen, Statistik, 6 Spiele (Setup und laufend), Podest;
je 4 Themes (Nocturne/Hell/Vitrum/Noir) x Handy (393x852) / Laptop (1512x982).
Ruhe: reduced motion, CSS ohne Animationen/Transitions, feste Math.random, Wartezeit.
Bericht: <out>/report.txt, Diff-Bilder <out>/diff/*.png. Exit 0 = keine Abweichung, 1 = Abweichungen, 2 = Fehler.
Nutzt Playwright (Python) und Pillow."""
import argparse
import re
import sys
from concurrent.futures import ProcessPoolExecutor
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
VIEWS = {"handy": (393, 852, "Handy"), "laptop": (1512, 982, "Laptop")}
THEMES = ["Nocturne", "Hell", "Vitrum", "Noir"]
GAMES = [("Schreibunterlagen", "Skyjo"), ("Schreibunterlagen", "Flip 7"), ("Schreibunterlagen", "Yatzy"),
         ("Schreibunterlagen", "Tutto"), ("Partyspiele", "Impostor"), ("Partyspiele", "Tabu")]
WAIT = 600

CALM_CSS = ("*,*::before,*::after{animation:none!important;transition:none!important;"
            "caret-color:transparent!important;scroll-behavior:auto!important}")
SEED_JS = ("(()=>{let s=123456789;Math.random=function(){s=(s*1664525+1013904223)>>>0;return s/4294967296;};})();")


def slug(s):
    return re.sub(r"\W+", "", s)


def calm(pg):
    try:
        pg.add_style_tag(content=CALM_CSS)
    except Exception:
        pass


def shot(pg, path, log):
    pg.wait_for_timeout(WAIT)
    calm(pg)
    pg.mouse.move(0, 0)
    pg.wait_for_timeout(150)
    pg.screenshot(path=str(path))


def go_home(pg, url):
    pg.goto(url)
    pg.wait_for_timeout(700)
    calm(pg)


def open_game(pg, cat, name):
    pg.get_by_text(cat, exact=True).first.click(timeout=3000)
    pg.wait_for_timeout(500)
    pg.locator("button", has_text=re.compile(r"^\d*\s*" + re.escape(name))).first.click(timeout=3000)
    pg.wait_for_timeout(600)


def capture(job):
    """Ein Job = (html, outdir, view, theme, quick). Gibt Liste fehlender Ansichten zurueck."""
    from playwright.sync_api import sync_playwright
    html, outdir, view, theme, quick = job
    w, h, mode = VIEWS[view]
    url = Path(html).resolve().as_uri()
    out = Path(outdir)
    out.mkdir(parents=True, exist_ok=True)
    missing = []
    pre = f"{view}_{theme}_"
    with sync_playwright() as p:
        b = p.chromium.launch()
        ctx = b.new_context(viewport={"width": w, "height": h}, reduced_motion="reduce")
        ctx.add_init_script(SEED_JS)
        pg = ctx.new_page()
        pg.on("pageerror", lambda e: missing.append(f"{pre}pageerror: {str(e)[:150]}"))
        pg.goto(url + "?reset=1")
        pg.wait_for_timeout(800)
        try:
            pg.get_by_text("Überspringen").first.click(timeout=2000)
            pg.wait_for_timeout(500)
        except Exception:
            pass
        pg.locator('button[aria-label="Einstellungen"]').first.click()
        pg.wait_for_timeout(500)
        pg.get_by_role("button", name=mode, exact=True).first.click()
        pg.wait_for_timeout(500)
        pg.get_by_role("button", name=theme, exact=True).first.click()
        pg.wait_for_timeout(500)
        shot(pg, out / f"{pre}einstellungen.png", missing)
        pg.keyboard.press("Escape")
        pg.wait_for_timeout(400)

        def step(name, fn):
            try:
                fn()
                shot(pg, out / f"{pre}{name}.png", missing)
            except Exception as e:
                missing.append(f"{pre}{name}: {type(e).__name__}")

        def home():
            go_home(pg, url)
        step("start", home)
        if quick:
            b.close()
            return missing
        def podest():
            go_home(pg, url)
            open_game(pg, "Schreibunterlagen", "Skyjo")
            pg.get_by_role("button", name="Spiel starten", exact=True).first.click(timeout=3000)
            pg.wait_for_timeout(700)

            def numpad(row, val):
                pg.get_by_role("button", name=re.compile(r"^" + row + r"\s+(-?\d|Total)")).first.click()
                pg.wait_for_timeout(400)
                for ch in str(val):
                    pg.get_by_role("button", name="±" if ch == "-" else ch, exact=True).last.click()
                    pg.wait_for_timeout(120)
                pg.get_by_role("button", name="Bestätigen", exact=True).first.click()
                pg.wait_for_timeout(400)
            numpad("Spieler 1", 5)
            numpad("Spieler 2", 120)
            pg.get_by_role("button", name="Spieler 1", exact=True).first.click()
            pg.wait_for_timeout(300)
            pg.get_by_role("button", name="Runde speichern", exact=True).first.click()
            pg.wait_for_timeout(2500)
        step("podest", podest)
        for cat in ("Schreibunterlagen", "Partyspiele"):
            def f(cat=cat):
                go_home(pg, url)
                pg.get_by_text(cat, exact=True).first.click(timeout=3000)
                pg.wait_for_timeout(500)
            step("kat_" + slug(cat), f)

        def stat():
            go_home(pg, url)
            pg.get_by_text("Schreibunterlagen", exact=True).first.click(timeout=3000)
            pg.wait_for_timeout(500)
            pg.get_by_role("button", name="Statistiken").first.click(timeout=3000)
            pg.wait_for_timeout(600)
        step("statistik", stat)

        for cat, name in GAMES:
            def setup(cat=cat, name=name):
                go_home(pg, url)
                open_game(pg, cat, name)
            step("setup_" + slug(name), setup)

            def run():
                st = pg.get_by_role("button", name="Spiel starten", exact=True)
                if st.count():
                    st.first.click(timeout=3000)
                    pg.wait_for_timeout(700)
            step("lauf_" + slug(name), run)

        b.close()
    return missing


def run_all(html, outdir, quick, jobs):
    jl = [(str(html), str(outdir), v, t, quick) for v in VIEWS for t in THEMES]
    miss = []
    with ProcessPoolExecutor(max_workers=jobs) as ex:
        for m in ex.map(capture, jl):
            miss.extend(m)
    return miss


def compare(a_dir, b_dir, diff_dir, tol, noise=0):
    from PIL import Image, ImageChops
    diff_dir.mkdir(parents=True, exist_ok=True)
    rows = []
    names = sorted({p.name for p in a_dir.glob("*.png")} | {p.name for p in b_dir.glob("*.png")})
    for n in names:
        pa, pb = a_dir / n, b_dir / n
        if not pa.exists() or not pb.exists():
            rows.append((n, "FEHLT in " + ("B" if pa.exists() else "A"), 0, 0.0))
            continue
        ia, ib = Image.open(pa).convert("RGB"), Image.open(pb).convert("RGB")
        if ia.size != ib.size:
            rows.append((n, f"GROESSE {ia.size} vs {ib.size}", 0, 0.0))
            continue
        d = ImageChops.difference(ia, ib).convert("L").point(lambda v: 255 if v > tol else 0)
        bbox = d.getbbox()
        if not bbox:
            continue
        cnt = sum(d.histogram()[255:])
        if cnt <= noise:
            continue
        pct = 100.0 * cnt / (ia.size[0] * ia.size[1])
        # Diff-Bild: A abgedunkelt, Abweichung rot
        base = Image.blend(ia, Image.new("RGB", ia.size, (0, 0, 0)), 0.6)
        base.paste(Image.new("RGB", ia.size, (255, 0, 0)), mask=d)
        base.save(diff_dir / n)
        rows.append((n, f"bbox {bbox}", cnt, pct))
    return names, rows


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("a", help="Baseline-HTML (z.B. index.html)")
    ap.add_argument("b", help="Vergleichs-HTML (z.B. docs/index.html)")
    ap.add_argument("--out", default=str(ROOT / "tests" / "out" / "pixcmp"))
    ap.add_argument("--quick", action="store_true", help="nur Startseite und Einstellungen")
    ap.add_argument("--jobs", type=int, default=4)
    ap.add_argument("--tol", type=int, default=0, help="Kanal-Toleranz 0..255 je Pixel")
    ap.add_argument("--noise", type=int, default=16, help="Abweichungen bis zu so vielen Pixeln je Bild gelten als Rauschen")
    ap.add_argument("--reuse-a", action="store_true", help="vorhandene Baseline-Bilder in <out>/a wiederverwenden")
    args = ap.parse_args()
    out = Path(args.out)
    a_html, b_html = (ROOT / args.a).resolve(), (ROOT / args.b).resolve()
    for f in (a_html, b_html):
        if not f.exists():
            print("Datei fehlt:", f)
            return 2
    miss = []
    if not (args.reuse_a and (out / "a").exists()):
        miss += run_all(a_html, out / "a", args.quick, args.jobs)
    miss += run_all(b_html, out / "b", args.quick, args.jobs)
    names, rows = compare(out / "a", out / "b", out / "diff", args.tol, args.noise)
    lines = [f"Pixelvergleich {args.a} gegen {args.b}: {len(names)} Bilder, {len(rows)} mit Abweichung"]
    for n, info, cnt, pct in rows:
        lines.append(f"  {n}: {info}, {cnt} px ({pct:.3f}%)")
    if miss:
        lines.append(f"Nicht erfasst/Fehler ({len(miss)}):")
        lines += ["  " + m for m in sorted(set(miss))]
    rep = "\n".join(lines)
    (out / "report.txt").write_text(rep + "\n")
    print(rep)
    print("Bericht:", out / "report.txt", "| Diff-Bilder:", out / "diff")
    return 1 if rows else 0


if __name__ == "__main__":
    sys.exit(main())
