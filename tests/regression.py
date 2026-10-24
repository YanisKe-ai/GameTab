#!/usr/bin/env python3
"""GameTab Regressionstest (Playwright, Python).

Aufruf:
    python3 tests/regression.py                 # chromium, Handy+Laptop, alle Spiele
    python3 tests/regression.py all             # chromium + webkit, Handy+Laptop
    python3 tests/regression.py webkit
    python3 tests/regression.py chromium --quick   # nur Handy, Kernablauf (unter 4 Minuten)
    python3 tests/regression.py --only Skyjo --only Rommé   # nur bestimmte Tests (Teilstring)
    python3 tests/regression.py --jobs 1        # seriell (Standard: 4 parallele Prozesse)
    python3 tests/regression.py --theme Hell    # festes Theme statt Wechsel Nocturne/Hell/Vitrum/Noir

Pro Spiel ein kurzer echter Ablauf (Einrichtung, starten, Punkte/Rollen/Woerter, Neuladen,
wo moeglich bis Spielende mit Podium und Bildvorschau "Als Bild teilen").
Dazu feste Grenzfaelle (HeadsUp 3 Spieler, Podium-Gleichstand, Schieber-Turnier-Kern in node).
Ausgabe je Test: OK / FEHLER / XFAIL (bekannter Fehler) / XPASS (xfail ist jetzt gruen: Marker entfernen).
Exitcode 1 bei FEHLER (XPASS nur mit --strict-xfail).
Konsolenfehler und pageerror zaehlen als FEHLER.
"""
import re
import shutil
import subprocess
import sys
import time
import traceback
from pathlib import Path

from playwright.sync_api import sync_playwright

sys.path.insert(0, str(Path(__file__).resolve().parent))
import smoke  # noqa: E402  (nutzt ROOT, URL, start, set_theme)
from smoke import ROOT, URL, HTML_PATH, start, set_theme  # noqa: E402

OUT = ROOT / "tests" / "out" / "regression"
OUT.mkdir(parents=True, exist_ok=True)

ARGS = sys.argv[1:]
QUICK = "--quick" in ARGS
STRICT_XFAIL = "--strict-xfail" in ARGS
THEME = next((ARGS[i + 1] for i, a in enumerate(ARGS) if a == "--theme" and i + 1 < len(ARGS)), None)  # z.B. --theme Hell
JOBS = next((int(ARGS[i + 1]) for i, a in enumerate(ARGS) if a == "--jobs" and i + 1 < len(ARGS)), 4)
SHARD = next((tuple(int(x) for x in ARGS[i + 1].split("/")) for i, a in enumerate(ARGS) if a == "--shard" and i + 1 < len(ARGS)), None)
ONLY = [ARGS[i + 1] for i, a in enumerate(ARGS) if a == "--only" and i + 1 < len(ARGS)]
ENGINES = ["chromium"]
for a in ARGS:
    if a in ("chromium", "webkit"):
        ENGINES = [a]
    elif a == "all":
        ENGINES = ["chromium", "webkit"]
VIEWS = {"mobile": (393, 852, "Handy"), "laptop": (1512, 982, "Laptop")}
THEMES = ["Nocturne", "Hell", "Vitrum", "Noir"]
WAIT = 500  # nach Klicks mindestens 500 ms (CLAUDE.md)

# Meldungen, die keine App-Fehler sind
IGNORE_CONSOLE = [
    r"Origin null is not allowed by Access-Control-Allow-Origin",  # nur file://, WebKit laedt manifest.webmanifest nicht

    r"favicon", r"Failed to load resource.*(manifest|sw\.js|version\.json|\.woff|\.png|\.ico)",
    r"service ?worker", r"ServiceWorker", r"Autoplay", r"AudioContext", r"vibrat", r"DeviceOrientation",
    r"DeviceMotion", r"Permissions policy", r"was not allowed to start",
]


class Fail(Exception):
    pass


def check(cond, msg):
    if not cond:
        raise Fail(msg)


# ---------------------------------------------------------------- Helfer
def wait(pg, ms=WAIT):
    pg.wait_for_timeout(ms)


def click(pg, loc, ms=WAIT):
    """Klick plus Wartezeit (>= 500 ms, in Schleifen mit ms=... kuerzer)."""
    loc.click(timeout=5000)
    wait(pg, ms)


def btn(pg, name, exact=True):
    return pg.get_by_role("button", name=name, exact=exact)


def btn_re(pg, pattern):
    return pg.get_by_role("button", name=re.compile(pattern))


def body(pg):
    return pg.evaluate("document.body.innerText")


def has_text(pg, pattern, flags=re.I):
    return re.search(pattern, body(pg), flags) is not None


def expect_text(pg, pattern, msg, timeout=7000):
    """Wartet bis der Text erscheint (statt fester Pause), sonst Fehler."""
    t0 = time.time()
    while time.time() - t0 < timeout / 1000:
        if has_text(pg, pattern):
            return
        pg.wait_for_timeout(250)
    raise Fail(msg)


def assert_alive(pg, where=""):
    """Keine weisse Seite, kein Haenger auf Laedt, kein React-Fehler."""
    info = pg.evaluate(
        "()=>{const r=document.getElementById('root')||document.body;"
        "return {kids:r.children.length,len:document.body.innerText.trim().length,"
        "txt:document.body.innerText.slice(0,200)}}"
    )
    check(info["kids"] > 0 and info["len"] > 15, f"weisse/leere Seite {where}")
    check(not re.match(r"^\s*L[äa]dt", info["txt"]), f"haengt auf 'Laedt' {where}")
    check(not re.search(r"Minified React error|Something went wrong|Error:", info["txt"]), f"Fehlertext {where}: {info['txt'][:80]}")


def reload_alive(pg, where="Neuladen"):
    pg.reload()
    wait(pg, 1200)
    assert_alive(pg, where)


_STATE = {}  # (Engine, Ansicht, Theme) -> gespeicherter Browser-Zustand (Onboarding uebersprungen, Modus, Theme)


def new_page(browser, w, h, mode, errors, theme=None, touch=False):
    key = (id(browser), w, h, mode, theme)
    if key not in _STATE:  # einmal einrichten wie smoke.py, danach nur noch Zustand wiederverwenden
        c0 = browser.new_context(viewport={"width": w, "height": h})
        p0 = c0.new_page()
        start(p0, w, h, mode)
        if theme:
            set_theme(p0, theme)
        p0.keyboard.press("Escape")
        wait(p0)
        _STATE[key] = p0.evaluate("JSON.stringify(Object.assign({}, localStorage))")
        c0.close()
    ctx = browser.new_context(viewport={"width": w, "height": h}, has_touch=touch)
    # file:// kennt kein storage_state: Zustand per Init-Skript einmalig pro Tab in localStorage setzen
    ctx.add_init_script(
        "try{if(!sessionStorage.getItem('__gt_seed')){const d=" + _STATE[key] + ";"
        "for(const k in d)localStorage.setItem(k,d[k]);sessionStorage.setItem('__gt_seed','1');}}catch(e){}"
    )
    # Web Share API abschalten (WebKit hat sie, headless gibt es aber kein Teilen-Blatt): so wird der Bildvorschau-Weg geprueft
    ctx.add_init_script("try{Object.defineProperty(navigator,'share',{value:undefined});Object.defineProperty(navigator,'canShare',{value:undefined});}catch(e){}")
    pg = ctx.new_page()
    pg.on("pageerror", lambda e: errors.append(f"pageerror: {str(e)[:220]}"))

    def on_console(m):
        if m.type == "error" and not any(re.search(p, m.text, re.I) for p in IGNORE_CONSOLE):
            errors.append(f"console: {m.text[:220]}")
    pg.on("console", on_console)
    pg.goto(URL)
    wait(pg, 700)
    return ctx, pg


def open_game(pg, cat, name, sub=None):
    """Startseite -> Kategorie -> Spiel (-> Variante)."""
    pg.goto(URL)
    wait(pg, 600)
    click(pg, pg.get_by_text(cat, exact=True).first)
    click(pg, pg.locator("button", has_text=re.compile(r"^\d*\s*" + re.escape(name))).first, 600)
    if sub:
        click(pg, pg.locator("button", has_text=re.compile(r"^[^A-Za-z]*" + re.escape(sub), re.I)).first, 600)


def press_start(pg, label="Spiel starten"):
    click(pg, btn(pg, label), 700)
    assert_alive(pg, "nach Start")


def set_players(pg, n):
    """Spieleranzahl in der Einrichtung auf n bringen (Button 'Spieler' fuegt einen hinzu)."""
    cur = pg.evaluate("[...document.querySelectorAll('input')].filter(i=>/^(Spieler|Team)/.test(i.value||i.placeholder)).length")
    while cur < n:
        click(pg, btn(pg, "Spieler"), 450)
        cur += 1


def numpad(pg, row_name, value):
    """Zeile antippen (per Name oder Locator), Zahl auf dem Ziffernblock tippen, bestaetigen."""
    if isinstance(row_name, str):
        row = pg.get_by_role("button", name=re.compile(r"^" + re.escape(row_name) + r"\s+(-?\d|Total|Rommé)")).first
    else:
        row = row_name
    click(pg, row, 500)
    for ch in str(value):
        click(pg, btn(pg, "±" if ch == "-" else ch).last, 150)
    click(pg, btn(pg, "Bestätigen"), 500)


def podium_ranks(pg):
    """Raenge auf dem Podest als sortierte Liste, z.B. ['1','2','2'].
    Podest-Text je Person: Name, Punkte, Rang (Zaehl-Animation der Punkte stoert nicht)."""
    wait(pg, 1500)
    t = body(pg)
    a = t.find("ENDSTAND")
    lines = [x.strip() for x in (t[a:t.find("Revanche", a)] if a >= 0 else t).split("\n") if x.strip()]
    ranks = []
    for i in range(len(lines) - 2):
        if not re.fullmatch(r"-?\d+", lines[i]) and re.fullmatch(r"-?\d+", lines[i + 1]) and re.fullmatch(r"[1-9]", lines[i + 2]):
            ranks.append(lines[i + 2])
    return sorted(ranks)


def podium_and_share(pg, where):
    """Spielende: Podium/Endstand sichtbar, 'Als Bild teilen' zeigt eine Bildvorschau (renderResultCanvas)."""
    check(has_text(pg, r"gewinnt|Sieger|Endstand|Ergebnis|Rangliste|Podest"), f"{where}: kein Spielende/Podium sichtbar")
    share = pg.get_by_role("button", name=re.compile(r"Bild teilen"))
    check(share.count() > 0, f"{where}: Knopf 'Als Bild teilen' fehlt")
    click(pg, share.first, 1500)
    ok = pg.evaluate(
        "()=>[...document.querySelectorAll('img')].some(i=>i.naturalWidth>50&&(i.src.startsWith('data:image')||i.src.startsWith('blob:')))"
    )
    check(ok, f"{where}: Bildvorschau (img) nicht gerendert")
    check(pg.get_by_text("Bild herunterladen").count() > 0, f"{where}: 'Bild herunterladen' fehlt")
    pg.screenshot(path=str(OUT / (re.sub(r"\W+", "_", where) + "_share.png")))
    assert_alive(pg, where + " nach Bildvorschau")


# ---------------------------------------------------------------- Testregister
TESTS = []


def test(name, quick=True, xfail=None, matrix=True, kind="ui"):
    def deco(fn):
        TESTS.append(dict(name=name, fn=fn, quick=quick, xfail=xfail, matrix=matrix, kind=kind))
        return fn
    return deco


class Env:
    def __init__(self, quick, view, engine):
        self.quick, self.view, self.engine = quick, view, engine


def finish(pg, name, env, podium=False):
    """Spielende pruefen (optional) und Neuladen: App muss weiter laufen."""
    if podium:
        podium_and_share(pg, name)
    reload_alive(pg, f"{name}: Neuladen")


def deal_roles(pg, maxn=14):
    """Rollen verteilen: pro Person gedrueckt halten zum Ansehen, dann weiter."""
    n = 0
    while n < maxn:
        el = pg.get_by_text("Gedrückt halten zum Ansehen").first
        if el.count() == 0 or not el.is_visible():
            break
        hold(pg, el, 700)
        click(pg, pg.get_by_role("button", name=re.compile("Verstanden")).first, 600)
        n += 1
    return n


def advance(pg, env, ms):
    """Zeit vorspulen. WebKit: die Fake-Uhr greift in der App nicht, dort wird echt gewartet (Zeiten auf 30s gestellt)."""
    if env.engine == "webkit":
        pg.wait_for_timeout(ms)
    else:
        pg.clock.run_for(ms)
    wait(pg, 600)


def hold(pg, el, ms=1200):
    bb = el.bounding_box()
    pg.mouse.move(bb["x"] + bb["width"] / 2, bb["y"] + bb["height"] / 2)
    pg.mouse.down()
    wait(pg, ms)
    pg.mouse.up()
    wait(pg, 600)


FAST = 130  # Wartezeit in Eintrags-Schleifen


# ---------------------------------------------------------------- Schreibunterlagen
@test("Skyjo")
def t_skyjo(pg, env):
    open_game(pg, "Schreibunterlagen", "Skyjo"); press_start(pg)
    numpad(pg, "Spieler 1", 5); numpad(pg, "Spieler 2", 120)
    click(pg, btn(pg, "Spieler 1")); click(pg, btn(pg, "Runde speichern"), 900)
    expect_text(pg, r"Spieler 1 gewinnt", "Skyjo: Sieger nicht angezeigt")
    check(podium_ranks(pg) == ["1", "2"], f"Skyjo: Podest {podium_ranks(pg)}")
    finish(pg, "Skyjo", env, True)


@test("Flip 7")
def t_flip7(pg, env):
    open_game(pg, "Schreibunterlagen", "Flip 7"); press_start(pg)
    numpad(pg, "Spieler 1", 210); numpad(pg, "Spieler 2", 30)
    click(pg, btn(pg, "Runde speichern"), 900)
    expect_text(pg, r"Spieler 1 gewinnt", "Flip 7: Sieger nicht angezeigt")
    finish(pg, "Flip 7", env, True)


@test("Phase 10")
def t_phase10(pg, env):
    open_game(pg, "Schreibunterlagen", "Phase 10"); press_start(pg)
    rounds = 2 if env.quick else 10
    for _ in range(rounds):
        pts = pg.get_by_role("button", name=re.compile(r"^punkte", re.I))
        numpad(pg, pts.nth(0), 0); numpad(pg, pts.nth(1), 25)
        click(pg, btn_re(pg, r"Phase \d+ geschafft").first, 400)
        click(pg, btn(pg, "Runde speichern"), 800)
    if env.quick:
        check(has_text(pg, r"RUNDE 3"), "Phase 10: Runde 3 nicht erreicht")
        finish(pg, "Phase 10", env)
    else:
        expect_text(pg, r"Spieler 1 gewinnt", "Phase 10: Sieger nicht angezeigt")
        finish(pg, "Phase 10", env, True)


@test("Rommé")
def t_romme(pg, env):
    open_game(pg, "Schreibunterlagen", "Rommé"); press_start(pg)
    click(pg, btn(pg, "Spieler 1")); numpad(pg, "Spieler 2", 600)
    click(pg, btn(pg, "Runde speichern"), 900)
    expect_text(pg, r"Spieler 1 gewinnt", "Rommé: Sieger nicht angezeigt")
    finish(pg, "Rommé", env, True)


@test("Jass Differenzler")
def t_differenzler(pg, env):
    open_game(pg, "Schreibunterlagen", "Jass", "Differenzler"); press_start(pg)
    cells = 4 if env.quick else 20
    for i in range(cells):
        click(pg, btn(pg, "·").first, 350)
        pg.get_by_placeholder("Meine Punkte").fill(str(40 + i * 7)); pg.keyboard.press("Enter"); wait(pg, 350)
    if env.quick:
        check(btn(pg, "·").count() == 16, "Differenzler: Felder nicht eingetragen")
        finish(pg, "Differenzler", env)
    else:
        expect_text(pg, r"gewinnt mit", "Differenzler: Sieger nicht angezeigt")
        finish(pg, "Differenzler", env, True)


@test("Jass Schieber")
def t_schieber(pg, env):
    open_game(pg, "Schreibunterlagen", "Jass", "Schieber"); press_start(pg)
    click(pg, pg.get_by_label("Taschenrechner öffnen").first)
    check(has_text(pg, r"TASCHENRECHNER"), "Schieber: Taschenrechner fehlt")
    click(pg, pg.get_by_text("TASCHENRECHNER").locator("xpath=..").locator("button").first)  # Schliessen-Kreuz
    check(not has_text(pg, r"TASCHENRECHNER"), "Schieber: Taschenrechner schliesst nicht")
    for _ in range(2):
        click(pg, btn_re(pg, "Weis und Stöck"))
        click(pg, pg.get_by_role("button", name=re.compile("^Neunblatt")))
        click(pg, btn(pg, "×3"))
        click(pg, btn_re(pg, "Punkte eintragen").last, 1500)
    expect_text(pg, r"Team 1 gewinnt", "Schieber: Sieger nicht angezeigt")
    finish(pg, "Schieber", env, True)


@test("Schieber-Turnier")
def t_schieber_turnier(pg, env):
    open_game(pg, "Schreibunterlagen", "Jass", "Schieber-Turnier")
    inp = pg.get_by_placeholder("Name eingeben")
    for n in ["Anna", "Ben", "Cora", "Dino"]:
        inp.fill(n); pg.keyboard.press("Enter"); wait(pg, 400)
    click(pg, btn(pg, "Turnier anlegen"), 1200)
    click(pg, btn(pg, "Partie starten"), 900)
    for n in ["Anna", "Ben", "Cora", "Dino"]:
        click(pg, pg.get_by_role("button", name=re.compile(n)).last, 400)
    click(pg, btn(pg, "Partie starten").last, 900)
    click(pg, btn(pg, "Ergebnis eintragen"), 900)
    pg.locator(".gtst-toast").wait_for(state="detached", timeout=15000)  # Hinweis ueberdeckt sonst den Knopf
    click(pg, btn_re(pg, "Team A gewinnt"), 700)
    click(pg, btn(pg, "Ergebnis speichern"), 1000)
    check(has_text(pg, r"1 Partie"), "Turnier: Partie nicht gezaehlt")
    check(has_text(pg, r"Anna\s+\+1", re.I), "Turnier: Rangliste ohne Punkte")
    reload_alive(pg, "Turnier: Neuladen")


@test("Yatzy")
def t_yatzy(pg, env):
    open_game(pg, "Schreibunterlagen", "Yatzy"); press_start(pg)
    limit = 4 if env.quick else 40
    n = 0
    while btn(pg, "·").count() > 0 and n < limit:
        click(pg, btn(pg, "·").first, FAST + 80)
        if btn_re(pg, "^Erreicht").count():
            click(pg, btn_re(pg, "^Erreicht").last, FAST)
        elif pg.get_by_placeholder("Punkte").count():
            click(pg, btn(pg, "Streichen").last, FAST)
        else:
            click(pg, btn(pg, "–").last.locator("xpath=following-sibling::button").first, FAST)
        n += 1
    wait(pg, 1000)
    if env.quick:
        finish(pg, "Yatzy", env)
    else:
        expect_text(pg, r"gewinnt mit|gewinnen", "Yatzy: Sieger nicht angezeigt")
        finish(pg, "Yatzy", env, True)


@test("Tutto")
def t_tutto(pg, env):
    open_game(pg, "Schreibunterlagen", "Tutto"); press_start(pg)
    pg.get_by_placeholder("Punkte").first.fill("7000"); pg.keyboard.press("Enter"); wait(pg, 900)
    expect_text(pg, r"Spieler 1 gewinnt", "Tutto: Sieger nicht angezeigt")
    finish(pg, "Tutto", env, True)


SEG = 'svg path[style*="cursor: pointer"]'


def dart(pg, i):
    click(pg, pg.locator(SEG).nth(i), 250)


@test("Darts Standard")
def t_darts_standard(pg, env):
    open_game(pg, "Schreibunterlagen", "Darts", "STANDARD")
    click(pg, btn(pg, "301")); click(pg, btn(pg, "1").first); press_start(pg)
    # Wer anfaengt ist ausgelost: egal, wer zuerst dran ist, wirft in Aufnahme 1 und 3, der andere daneben
    expect_text(pg, r"Darts\s+Spieler \d+\s+301", "Darts: keine Anzeige der laufenden Person")
    dart(pg, 1); dart(pg, 1); dart(pg, 1); click(pg, btn(pg, "✓"), 700)  # 3x T20
    for _ in range(3):
        click(pg, btn(pg, "Daneben"), 250)
    click(pg, btn(pg, "✓"), 700)
    dart(pg, 1); dart(pg, 1); dart(pg, 4); click(pg, btn(pg, "✓"), 1200)  # T20 T20 1 = Finish
    expect_text(pg, r"gewinnt das Match", "Darts: Sieger nicht angezeigt")
    finish(pg, "Darts Standard", env, True)


DARTS_VARIANTS = ["CRICKET", "SHANGHAI", "CUT THROAT", "MASTERS", "HI SCORE", "SPLIT SCORE"]
for _v in DARTS_VARIANTS:
    def _mk(v):
        @test("Darts " + v.title())
        def t(pg, env):
            open_game(pg, "Schreibunterlagen", "Darts", v); press_start(pg)
            dart(pg, 1); click(pg, btn(pg, "✓"), 800)
            assert_alive(pg, "Darts " + v)
            reload_alive(pg, f"Darts {v}: Neuladen")
        return t
    _mk(_v)


def wizard_cell(pg, r, ansage, stiche):
    """Zelle oeffnen und Ansage/Stiche waehlen. Das Blatt hat je 0..r Knoepfe (Ansage, Stiche) und am Ende 'Speichern'."""
    click(pg, btn(pg, "·").first, 400)
    ins = pg.locator("input:visible")
    if ins.count() >= 2:  # ab Runde 11 gibt es Eingabefelder statt Knoepfe
        ins.nth(-2).fill(str(ansage)); ins.nth(-1).fill(str(stiche)); wait(pg, 200)
    else:
        c = pg.get_by_role("button").count()
        click(pg, pg.get_by_role("button").nth(c - 3 - 2 * r + ansage), FAST)
        click(pg, pg.get_by_role("button").nth(c - 2 - r + stiche), FAST)
    click(pg, btn(pg, "Speichern"), 400)


@test("Wizard")
def t_wizard(pg, env):
    open_game(pg, "Schreibunterlagen", "Wizard"); press_start(pg)
    rounds = 2 if env.quick else 30
    for r in range(1, rounds + 1):
        wizard_cell(pg, r, 0, r)  # Spieler 1 macht alle Stiche, Spieler 2 keinen (Summe = Rundenzahl)
        wizard_cell(pg, r, 0, 0)
    wait(pg, 1000)
    if env.quick:
        check(has_text(pg, r"GESAMTRESULTAT"), "Wizard: Gesamtresultat fehlt")
        finish(pg, "Wizard", env)
    else:
        expect_text(pg, r"gewinnt", "Wizard: Sieger nicht angezeigt")
        finish(pg, "Wizard", env, True)


@test("Minigolf")
def t_minigolf(pg, env):
    open_game(pg, "Schreibunterlagen", "Minigolf"); press_start(pg)
    limit = 4 if env.quick else 40
    n = 0
    cells = pg.locator("button:text-is('·')")
    while cells.count() > 0 and n < limit:
        click(pg, cells.first, FAST + 80); click(pg, btn(pg, "3").last, FAST); n += 1
    wait(pg, 1200)
    if env.quick:
        finish(pg, "Minigolf", env)
    else:
        expect_text(pg, r"gewinnt mit|gewinnen", "Minigolf: Sieger nicht angezeigt")
        finish(pg, "Minigolf", env, True)


@test("Freies Spiel")
def t_freeplay(pg, env):
    open_game(pg, "Schreibunterlagen", "Freies Spiel")
    pg.get_by_placeholder("offen").fill("20"); wait(pg, 400)
    click(pg, btn(pg, "25").first, 900)
    expect_text(pg, r"Spieler 1 gewinnt", "Freies Spiel: Sieger nicht angezeigt")
    finish(pg, "Freies Spiel", env, True)


# ---------------------------------------------------------------- Partyspiele
@test("Impostor")
def t_impostor(pg, env):
    open_game(pg, "Partyspiele", "Impostor"); press_start(pg)
    check(deal_roles(pg) == 3, "Impostor: Rollenverteilung")
    check(has_text(pg, r"DISKUSSION"), "Impostor: keine Diskussion nach der Verteilung")
    click(pg, btn(pg, "Zur Abstimmung"), 700)
    for _ in range(3):
        click(pg, pg.get_by_role("button", name=re.compile(r"^Spieler \d$")).first, 500)
        click(pg, btn_re(pg, "Bestätigen"), 900)
    wait(pg, 600)
    check(has_text(pg, r"ERGEBNIS"), "Impostor: kein Ergebnis nach der Abstimmung")
    if btn(pg, "Aufgeben").count():
        click(pg, btn(pg, "Aufgeben"), 1000)
    expect_text(pg, r"gewinnen|gewinnt|Revanche", "Impostor: kein Spielende")
    finish(pg, "Impostor", env)


@test("Werwolf")
def t_werwolf(pg, env):
    open_game(pg, "Partyspiele", "Werwolf"); press_start(pg)
    check(deal_roles(pg) == 5, "Werwolf: Rollenverteilung")
    click(pg, btn_re(pg, "Ich bin Spieler"), 700)
    check(has_text(pg, r"SPIELLEITER"), "Werwolf: Spielleiter fehlt")
    finish(pg, "Werwolf", env)


@test("Mafia")
def t_mafia(pg, env):
    open_game(pg, "Partyspiele", "Mafia"); press_start(pg)
    check(deal_roles(pg) == 6, "Mafia: Rollenverteilung")
    click(pg, pg.get_by_role("button", name=re.compile(r"^Spieler \d$")).first, 500)
    click(pg, btn(pg, "Bestätigen"), 900)
    check(has_text(pg, r"SPIELLEITER"), "Mafia: Spielleiter fehlt")
    finish(pg, "Mafia", env)


@test("Verräter")
def t_verraeter(pg, env):
    open_game(pg, "Partyspiele", "Verräter"); press_start(pg)
    check(deal_roles(pg) == 4, "Verräter: Rollenverteilung")
    hold(pg, btn_re(pg, "Verräter: Opfer"), 1500)
    check(has_text(pg, r"Wen ermordet ihr"), "Verräter: Opferwahl fehlt")
    click(pg, pg.get_by_role("button", name=re.compile(r"^Spieler \d$")).first, 500)
    click(pg, btn(pg, "Opfer bestätigen"), 900)
    finish(pg, "Verräter", env)


@test("Am ehesten")
def t_amehesten(pg, env):
    open_game(pg, "Partyspiele", "Am ehesten"); press_start(pg)
    click(pg, btn(pg, "Spieler 1"), 800)
    check(has_text(pg, r"1 AUSSAGEN GESPIELT"), "Am ehesten: Stimme nicht gezaehlt")
    click(pg, btn_re(pg, "Überspringen"), 800)
    check(has_text(pg, r"2 AUSSAGEN GESPIELT"), "Am ehesten: naechste Aussage fehlt")
    finish(pg, "Am ehesten", env)


@test("Tabu")
def t_tabu(pg, env):
    pg.clock.install()
    open_game(pg, "Partyspiele", "Tabu")
    click(pg, btn(pg, "30s")); press_start(pg)
    click(pg, btn_re(pg, "Bereit"), 800)
    click(pg, btn(pg, "Richtig"), 500)
    advance(pg, env, 32000)
    check(has_text(pg, r"Zeit abgelaufen"), "Tabu: Rundenende fehlt")
    check(has_text(pg, r"\+1"), "Tabu: Punkt nicht gezaehlt")
    click(pg, btn_re(pg, "Verstanden"), 800)
    finish(pg, "Tabu", env)


@test("HeadsUp")
def t_headsup(pg, env):
    pg.clock.install()
    open_game(pg, "Partyspiele", "HeadsUp"); set_players(pg, 2)
    click(pg, btn(pg, "30s")); press_start(pg)
    click(pg, btn_re(pg, "Bereit"), 600)
    pg.set_viewport_size({"width": 852, "height": 393}); wait(pg)
    click(pg, btn_re(pg, "Richtig"), 400)
    advance(pg, env, 32000)
    pg.set_viewport_size({"width": 393, "height": 852}); wait(pg)
    check(has_text(pg, r"Zeit abgelaufen"), "HeadsUp: Rundenende fehlt")
    finish(pg, "HeadsUp", env)


@test("5 Sekunden")
def t_5sek(pg, env):
    open_game(pg, "Partyspiele", "5 Sekunden"); press_start(pg)
    click(pg, btn(pg, "Kategorie aufdecken"), 800)
    click(pg, btn_re(pg, "Geschafft"), 800)
    check(has_text(pg, r"PUNKTE"), "5 Sekunden: Punkteliste fehlt")
    finish(pg, "5 Sekunden", env)


# ---------------------------------------------------------------- feste Grenzfaelle
@test("Grenzfall HeadsUp 3 Spieler: alle kommen dran", matrix=False)
def t_headsup3(pg, env):
    pg.clock.install()
    # Der Anfang ist ausgelost und nicht waehlbar: bis zu 8 Anlaeufe, bis jemand anderes als Spieler 1 beginnt
    # (beginnt Spieler 1, laeuft die Reihe zufaellig fehlerfrei durch).
    for attempt in range(8):
        # laufende Runde aus dem vorigen Anlauf verwerfen (sonst setzt die App sie korrekt fort)
        pg.evaluate("(()=>{try{const k=Object.keys(localStorage);for(const x of k){const v=localStorage.getItem(x);if(v&&v.indexOf('headsup')>=0&&x.indexOf('state')>=0){const o=JSON.parse(v);if(o&&o.headsup){delete o.headsup;localStorage.setItem(x,JSON.stringify(o));}}}}catch(e){}})()")
        pg.reload(); wait(pg, 600)
        open_game(pg, "Partyspiele", "HeadsUp"); set_players(pg, 3)
        click(pg, btn(pg, "30s")); press_start(pg)
        m = re.search(r"Spieler (\d+) rät", body(pg), re.I)
        check(m is not None, "HeadsUp: kein 'Spieler N raet' auf dem Wechselbild")
        if m.group(1) != "1":
            break
    seen = []
    for _ in range(8):
        t = body(pg)
        if re.search(r"ERGEBNIS", t) and btn(pg, "Revanche").count():
            break
        m = re.search(r"Spieler (\d+) rät", t, re.I)
        check(m is not None, "HeadsUp: kein 'Spieler N raet' auf dem Wechselbild")
        seen.append(m.group(1))
        click(pg, btn_re(pg, "Bereit"), 600)
        pg.set_viewport_size({"width": 852, "height": 393}); wait(pg)
        click(pg, btn_re(pg, "Richtig"), 400)
        advance(pg, env, 32000)
        pg.set_viewport_size({"width": 393, "height": 852}); wait(pg)
        click(pg, btn_re(pg, "Verstanden"), 700)
    check(btn(pg, "Revanche").count() > 0, "HeadsUp: Spiel endet nicht")
    check(len(set(seen)) == 3, f"HeadsUp: nur {sorted(set(seen))} waren dran (erwartet 3 von 3), Reihenfolge {seen}")


@test("Grenzfall Podium Gleichstand Rommé (Platz 2 und 2)", matrix=False)
def t_romme_tie(pg, env):
    open_game(pg, "Schreibunterlagen", "Rommé"); set_players(pg, 3); press_start(pg)
    click(pg, btn(pg, "Spieler 1"))
    numpad(pg, "Spieler 2", 600); numpad(pg, "Spieler 3", 600)
    click(pg, btn(pg, "Runde speichern"), 1500)
    check(podium_ranks(pg) == ["1", "2", "2"], f"Podest zeigt {podium_ranks(pg)} statt ['1','2','2']")
    podium_and_share(pg, "Romme Gleichstand")


def run_node_core():
    """Schieber-Turnier Rechenkern (Node). Gibt (status, text) zurueck."""
    node = shutil.which("node")
    script = ROOT / "tests" / "test_core.js"
    if not node:
        return "SKIP", "node nicht installiert"
    if not script.exists():
        return "SKIP", "tests/test_core.js fehlt"
    r = subprocess.run([node, str(script), str(HTML_PATH)], capture_output=True, text=True, timeout=120)
    out = (r.stdout + r.stderr).strip().splitlines()
    return ("OK" if r.returncode == 0 else "FEHLER"), (out[-1] if out else "")


# ---------------------------------------------------------------- Runner
def selected(t):
    if ONLY and not any(o.lower() in t["name"].lower() for o in ONLY):
        return False
    return True


def run_one(browser, t, view, theme, env):
    w, h, mode = VIEWS[view]
    errors = []
    ctx = pg = None
    t0 = time.time()
    status, msg = "OK", ""
    is_assert = False
    try:
        ctx, pg = new_page(browser, w, h, mode, errors, theme)
        pg.set_default_timeout(8000)
        t["fn"](pg, env)
        assert_alive(pg, "Ende")
    except Exception as e:  # noqa: BLE001
        status = "FEHLER"
        is_assert = isinstance(e, Fail)
        msg = (str(e).splitlines() or [repr(e)])[0][:200] if isinstance(e, Fail) else f"{type(e).__name__}: {str(e).splitlines()[0][:180] if str(e) else ''}"
        if not isinstance(e, Fail):
            fr = [f for f in traceback.extract_tb(e.__traceback__) if f.filename == __file__]
            if fr:
                f2 = fr[-2] if len(fr) > 1 else fr[-1]
                msg += f" @ Zeile {f2.lineno}: {(f2.line or '')[:90]}"
            w = re.search(r"waiting for (.{0,110})", str(e))
            if w:
                msg += f" | wartet auf {w.group(1)}"
        try:
            pg.screenshot(path=str(OUT / (re.sub(r"\W+", "_", f"{env.engine}_{view}_{t['name']}") + "_fail.png")))
        except Exception:  # noqa: BLE001
            pass
    finally:
        if ctx:
            ctx.close()
    uniq = list(dict.fromkeys(errors))
    if status == "OK" and uniq:
        status, msg = "FEHLER", "Konsole: " + uniq[0]
    elif status == "FEHLER" and uniq:
        msg += " | Konsole: " + uniq[0][:100]
    if t["xfail"]:
        if status == "FEHLER" and not is_assert:
            msg = "Testablauf kaputt (kein bekannter Fehler): " + msg
        elif status == "FEHLER":
            status, msg = "XFAIL", f"bekannt ({t['xfail']}): {msg}"
        else:
            status, msg = "XPASS", f"xfail ist jetzt gruen, Marker entfernen ({t['xfail']})"
    return status, msg, time.time() - t0


def main_parallel():
    """Startet JOBS Kindprozesse (--shard i/N), sammelt deren Ausgabe und Ergebnis."""
    t_start = time.time()
    base = [sys.executable, str(Path(__file__).resolve())] + [a for a in ARGS if a not in ("--jobs",) and not a.isdigit() or a in ONLY]
    procs = []
    for i in range(JOBS):
        procs.append(subprocess.Popen(base + ["--jobs", "1", "--shard", f"{i}/{JOBS}"], stdout=subprocess.PIPE, stderr=subprocess.STDOUT, text=True))
    counts = dict(OK=0, FEHLER=0, XFAIL=0, XPASS=0, SKIP=0)
    for pr in procs:
        for line in pr.stdout:
            first = line.split(" ", 1)[0].strip()
            if first in counts and re.match(r"^\S+\s+\S+/", line + " x") or first in ("SKIP",):
                counts[first] += 1
                print(line.rstrip(), flush=True)
            elif line.strip() and not line.startswith(("\n",)) and "Laufzeit" not in line:
                print(line.rstrip(), flush=True)
        pr.wait()
    bad = counts["FEHLER"] + (counts["XPASS"] if STRICT_XFAIL else 0)
    print(f"\n{counts['OK']} OK, {counts['FEHLER']} FEHLER, {counts['XFAIL']} XFAIL, {counts['XPASS']} XPASS, "
          f"{counts['SKIP']} uebersprungen. Laufzeit {time.time() - t_start:.0f}s. Screenshots: {OUT}")
    return 1 if bad or any(pr.returncode not in (0, 1) for pr in procs) else 0


def main():
    if JOBS > 1 and SHARD is None:
        return main_parallel()
    t_start = time.time()
    rows = []
    idx = 0

    def report(status, label, msg, dt):
        rows.append(status)
        print(f"{status:7} {label:52} {dt:5.1f}s  {msg}", flush=True)

    with sync_playwright() as p:
        for engine in ENGINES:
            try:
                browser = getattr(p, engine).launch()
            except Exception as e:  # noqa: BLE001
                report("FEHLER", f"{engine} starten", f"{str(e).splitlines()[0][:150]}", 0)
                continue
            views = ["mobile"] if QUICK else ["mobile", "laptop"]
            for view in views:
                for t in TESTS:
                    if not selected(t):
                        continue
                    if not t["matrix"] and view != "mobile":
                        continue
                    theme = THEME or (None if QUICK else THEMES[idx % len(THEMES)])
                    idx += 1
                    if SHARD and (idx - 1) % SHARD[1] != SHARD[0]:
                        continue
                    status, msg, dt = run_one(browser, t, view, theme, Env(QUICK, view, engine))
                    report(status, f"{engine}/{view}/{t['name']}" + (f" [{theme}]" if theme else ""), msg, dt)
            browser.close()
    if (not SHARD or SHARD[0] == 0) and (not ONLY or any(o.lower() in "schieber-turnier kern node" for o in ONLY)):
        t0 = time.time()
        st, msg = run_node_core()
        report(st, "node/Schieber-Turnier Rechenkern", msg, time.time() - t0)
    bad = rows.count("FEHLER") + (rows.count("XPASS") if STRICT_XFAIL else 0)
    print(f"\n{rows.count('OK')} OK, {bad} FEHLER, {rows.count('XFAIL')} XFAIL, {rows.count('XPASS')} XPASS, "
          f"{rows.count('SKIP')} uebersprungen. Laufzeit {time.time() - t_start:.0f}s. Screenshots: {OUT}")
    return 1 if bad else 0


if __name__ == "__main__":
    sys.exit(main())
