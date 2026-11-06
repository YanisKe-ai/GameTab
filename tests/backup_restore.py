#!/usr/bin/env python3
"""Sicherung/Wiederherstellen und Teilen (Mocks), alles in eigenen Wegwerf-Browserkontexten.
Aufruf: GAMETAB_HTML=docs/index.html $VENV tests/backup_restore.py [chromium|webkit] [--only backup|share]
Sicherung: Dateiname, Inhalt, Meldung. Wiederherstellen: gueltig, aelter (ohne Version), kaputt, falscher Typ, neuer, beschaedigt,
abgebrochen (Escape/Abbrechen) -> bei allem ausser Bestaetigen bleibt der Speicher unveraendert.
Teilen: Erfolg, Abbruch, Fehler, haengt (Zeitlimit) mit Testdouble fuer navigator.share.
"""
import json, os, re, sys, tempfile
os.environ.setdefault("GAMETAB_HTML", "docs/index.html")
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import regression as R  # noqa: E402
import ergebnisbild_app as A  # noqa: E402
import export_save as E  # noqa: E402
from playwright.sync_api import sync_playwright  # noqa: E402

OUT = R.ROOT / "tests" / "out" / "backup"
OUT.mkdir(parents=True, exist_ok=True)
TMP = tempfile.mkdtemp(prefix="gt-backup-")
MARK = {"gt_playerGroups": json.dumps([{"id": "g-alt", "name": "Alt", "players": ["Alt1", "Alt2"]}])}
KEYS = ["gt_playerGroups", "gt_matchLog", "gametab-test-marker"]


def snap(pg):
    return pg.evaluate("(ks)=>JSON.stringify(ks.map(k=>localStorage.getItem(k)))", KEYS)


def fixture(name, obj, raw=None):
    p = os.path.join(TMP, name)
    with open(p, "w", encoding="utf-8") as f:
        f.write(raw if raw is not None else json.dumps(obj))
    return p


def fixtures():
    entry = {"id": "m1", "game": "skyjo", "date": "2026-01-02T10:00:00.000Z", "players": [{"name": "Neu1", "score": 5}, {"name": "Neu2", "score": 9}]}
    grp = [{"id": "g-neu", "name": "Neu", "players": ["Neu1", "Neu2"]}]
    valid = {"type": "gametab-backup", "version": 2, "appBuild": "test", "exportedAt": "2026-01-03T09:30:00.000Z", "schieberTournaments": [],
             "matchLog": [entry, dict(entry, id="m2")], "groups": grp,
             "storage": {"gt_playerGroups": json.dumps(grp), "gametab-test-marker": "neu"}}
    return {
        "valid": fixture("valid.json", valid),
        "old": fixture("old-v1.json", {"matchLog": [entry], "groups": grp}),
        "broken": fixture("broken.json", None, raw=json.dumps(valid)[:120]),
        "empty": fixture("empty.json", None, raw=""),
        "notbackup": fixture("other.json", {"foo": 1}),
        "wrongtype": fixture("wrongtype.json", dict(valid, type="etwas-anderes")),
        "newer": fixture("newer.json", dict(valid, version=99)),
        "damaged": fixture("damaged.json", dict(valid, matchLog="kaputt")),
        "damaged2": fixture("damaged2.json", dict(valid, storage={"gt_playerGroups": 5})),
    }


def settings(pg):
    pg.goto(R.URL); R.wait(pg, 900)
    pg.evaluate("(m)=>{for(const k in m)localStorage.setItem(k,m[k]);localStorage.setItem('gametab-test-marker','alt');}", MARK)
    R.click(pg, pg.locator('button[aria-label="Einstellungen"]').first, 900)


def status(pg):
    return " ".join(pg.locator("p[role=status]").all_inner_texts())


def pick(pg, path):
    with pg.expect_file_chooser() as fc:
        pg.get_by_role("button", name="Aus Datei wiederherstellen").click()
    fc.value.set_files(path); R.wait(pg, 600)


def dialog(pg):
    return pg.locator('[data-gt-backup-dialog] [role=dialog]')


def run_backup(b, eng):
    bad = 0
    fx = fixtures()
    errors = []

    def one(tag, body):
        nonlocal bad
        ctx, pg = R.new_page(b, 393, 852, "Handy", errors)
        try:
            settings(pg)
            body(pg)
            print("OK    ", eng, tag)
        except Exception as e:  # noqa: BLE001
            bad += 1
            print("FEHLER", eng, tag, str(e)[:400])
            pg.screenshot(path=str(OUT / f"{eng}_{tag}_fehler.png"))
        finally:
            ctx.close()

    def t_export(pg):
        with pg.expect_download(timeout=8000) as d:
            R.click(pg, R.btn(pg, "Als Datei exportieren"), 500)
        f = d.value
        R.check(re.fullmatch(r"gametab-backup-v2-\d{4}-\d\d-\d\d-\d{4}\.json", f.suggested_filename), f.suggested_filename)
        data = json.load(open(f.path(), encoding="utf-8"))
        R.check(data["type"] == "gametab-backup" and data["version"] == 2 and data["exportedAt"] and data["appBuild"], "Kopfdaten fehlen")
        R.check(data["storage"].get("gametab-test-marker") == "alt", "Speicherstand fehlt in Sicherung")
        R.check(json.loads(data["storage"]["gt_playerGroups"])[0]["name"] == "Alt", "Gruppen fehlen")
        R.check(f.suggested_filename in status(pg), f"Erfolgsmeldung fehlt: {status(pg)!r}")
        pg.screenshot(path=str(OUT / f"{eng}_export.png"))

    def t_export_fail(pg):
        pg.evaluate("()=>{URL.createObjectURL=()=>{throw new Error('x');};}")
        R.click(pg, R.btn(pg, "Als Datei exportieren"), 500)
        R.check("konnte nicht erstellt werden" in status(pg), f"Fehlermeldung fehlt: {status(pg)!r}")

    def rejected(key, expect):
        def f(pg):
            before = snap(pg)
            pick(pg, fx[key])
            R.check(dialog(pg).count() == 0, f"{key}: Dialog duerfte nicht erscheinen")
            R.check(expect in status(pg), f"{key}: Meldung {status(pg)!r} ohne {expect!r}")
            R.check("Es wurde nichts geändert" in status(pg), f"{key}: 'nichts geändert' fehlt")
            R.check(snap(pg) == before, f"{key}: Speicher veraendert")
        return f

    def accepted(key, version, matches):
        def f(pg):
            before = snap(pg)
            pick(pg, fx[key])
            R.check(dialog(pg).count() == 1, f"{key}: Vorschau fehlt")
            txt = dialog(pg).inner_text()
            R.check(f"Version {version}" in txt, f"{key}: Version nicht erkannt: {txt!r}")
            R.check(f"{matches} Partien in der Statistik" in txt, f"{key}: Zaehler: {txt!r}")
            R.check("0 Partien in der Statistik, 1 Spielergruppen" in txt, f"{key}: aktueller Stand fehlt: {txt!r}")
            R.check("ersetzt" in txt, "Warnung fehlt")
            R.check(snap(pg) == before, f"{key}: Speicher schon vor Bestaetigung veraendert")
            pg.screenshot(path=str(OUT / f"{eng}_vorschau_{key}.png"))
            # Fokus bleibt im Dialog, Hintergrund inert
            for _ in range(4):
                pg.keyboard.press("Tab")
                R.check(pg.evaluate("document.activeElement.closest('[role=dialog]')!==null"), f"{key}: Tab verlaesst den Dialog")
            R.check(pg.evaluate("document.querySelector('#root')?.hasAttribute('inert')||[...document.body.children].some(n=>n.hasAttribute('inert'))||!!document.querySelector('[inert]')"), "Hintergrund nicht inert")
            pg.keyboard.press("Escape"); R.wait(pg, 400)
            R.check(dialog(pg).count() == 0, "Escape schliesst nicht")
            R.check("nichts geändert" in status(pg), f"Abbruch ohne Meldung: {status(pg)!r}")
            R.check(snap(pg) == before, f"{key}: Abbruch hat Speicher veraendert")
            R.check(pg.evaluate("document.activeElement.textContent").strip() == "Aus Datei wiederherstellen", "Fokus kehrt nicht zum Ausloeser zurueck")
        return f

    def t_cancel_button(pg):
        before = snap(pg)
        pick(pg, fx["valid"])
        R.click(pg, dialog(pg).get_by_role("button", name="Abbrechen"), 500)
        R.check(dialog(pg).count() == 0 and snap(pg) == before, "Abbrechen-Knopf aendert Speicher oder schliesst nicht")

    def t_confirm(pg):
        pick(pg, fx["valid"])
        R.click(pg, dialog(pg).get_by_role("button", name="Wiederherstellen"), 100)
        pg.wait_for_function("()=>localStorage.getItem('gametab-test-marker')==='neu'", timeout=5000)
        R.wait(pg, 1800)  # Neuladen
        s = json.loads(pg.evaluate("()=>localStorage.getItem('gt_matchLog')"))
        R.check(len(s) == 2 and s[0]["id"] == "m1", f"matchLog nach Restore {s}")
        R.check(json.loads(pg.evaluate("()=>localStorage.getItem('gt_playerGroups')"))[0]["name"] == "Neu", "Gruppen nicht ersetzt")

    def t_confirm_old(pg):
        pick(pg, fx["old"])
        R.check("Version 1" in dialog(pg).inner_text(), "alte Datei: Version 1 erwartet")
        R.click(pg, dialog(pg).get_by_role("button", name="Wiederherstellen"), 100)
        pg.wait_for_function("()=>JSON.parse(localStorage.getItem('gt_matchLog')).length===1", timeout=5000)
        R.wait(pg, 1800)
        R.check(json.loads(pg.evaluate("()=>localStorage.getItem('gt_playerGroups')"))[0]["name"] == "Neu", "alte Datei: Gruppen nicht uebernommen")

    def t_write_fail(pg):
        before = snap(pg)
        pg.evaluate("()=>{const o=Storage.prototype.setItem;Storage.prototype.setItem=function(k,v){if(k==='gt_matchLog'&&v.length>2&&!window.__ok){const e=new Error('q');e.name='QuotaExceededError';throw e;}return o.call(this,k,v);};}")
        pick(pg, fx["valid"])
        R.click(pg, dialog(pg).get_by_role("button", name="Wiederherstellen"), 600)
        R.check(snap(pg) == before, "Schreibfehler: Speicher nicht zurueckgesetzt")
        R.check("nichts geändert" in status(pg), f"Schreibfehler ohne Meldung: {status(pg)!r}")

    one("export", t_export)
    one("export_fehler", t_export_fail)
    one("kaputt", rejected("broken", "gelesen"))
    one("leer", rejected("empty", "gelesen"))
    one("kein_backup", rejected("notbackup", "keine GameTab-Sicherung"))
    one("falscher_typ", rejected("wrongtype", "keine GameTab-Sicherung"))
    one("neuer", rejected("newer", "neueren Version"))
    one("beschaedigt", rejected("damaged", "beschädigt"))
    one("beschaedigt2", rejected("damaged2", "beschädigt"))
    one("vorschau_gueltig_abbruch_escape", accepted("valid", 2, 2))
    one("vorschau_alt_abbruch_escape", accepted("old", 1, 1))
    one("abbrechen_knopf", t_cancel_button)
    one("bestaetigen_gueltig", t_confirm)
    one("bestaetigen_alt", t_confirm_old)
    one("schreibfehler_rollback", t_write_fail)
    return bad


SHARE = """(mode)=>{const d=(k,v)=>Object.defineProperty(navigator,k,{value:v,configurable:true});
if(mode==='none'){d('share',undefined);d('canShare',undefined);return;}
d('canShare',()=>true);window.__calls=0;d('share',(x)=>{window.__calls++;
if(mode==='ok')return Promise.resolve();
if(mode==='abort'){const e=new Error('x');e.name='AbortError';return Promise.reject(e);}
if(mode==='fail'){const e=new Error('x');e.name='NotAllowedError';return Promise.reject(e);}
return new Promise(()=>{});});}"""


def run_share(b, eng):
    bad = 0
    errors = []

    def one(tag, mode, body, dev="Laptop"):
        nonlocal bad
        w, h = (1512, 982) if dev == "Laptop" else (393, 852)
        ctx, pg = R.new_page(b, w, h, dev, errors)
        try:
            A.flow_freeplay(pg)
            if mode == "hang":
                pg.clock.install()
            pg.evaluate(SHARE, mode)
            E.open_preview(pg)
            body(pg)
            pg.screenshot(path=str(OUT / f"{eng}_teilen_{tag}.png"))
            R.check(not errors, f"Seitenfehler: {errors[:2]}")
            print("OK    ", eng, "teilen", tag)
        except Exception as e:  # noqa: BLE001
            bad += 1
            print("FEHLER", eng, "teilen", tag, str(e)[:400])
            pg.screenshot(path=str(OUT / f"{eng}_teilen_{tag}_fehler.png"))
        finally:
            ctx.close()

    ov = lambda pg: pg.locator(".gtsp-ov")  # noqa: E731
    share_btn = lambda pg: ov(pg).get_by_role("button", name="Bild teilen")  # noqa: E731
    enabled = lambda pg: all(x.is_enabled() for x in ov(pg).get_by_role("button").all() if x.inner_text().strip() not in ("", "✕"))  # noqa: E731

    def t_ok(pg):
        R.click(pg, share_btn(pg), 500)
        R.check(pg.evaluate("window.__calls") == 1, "share nicht aufgerufen")
        R.check("Geteilt." in status(pg), f"Erfolgsmeldung fehlt: {pg.locator('.gtsp-ov p').all_inner_texts()}")
        R.check(enabled(pg), "Knoepfe nach Erfolg gesperrt")

    def t_abort(pg):
        R.click(pg, share_btn(pg), 500)
        R.check(ov(pg).locator("p").count() == 0, f"Abbruch muss leise sein: {ov(pg).locator('p').all_inner_texts()}")
        R.check(enabled(pg), "Knoepfe nach Abbruch gesperrt")

    def t_fail(pg):
        R.click(pg, share_btn(pg), 500)
        txt = " ".join(ov(pg).locator("p").all_inner_texts())
        R.check("Teilen hat nicht geklappt" in txt, f"Fehlermeldung fehlt: {txt!r}")
        R.check(enabled(pg) and ov(pg).get_by_role("button", name="Bild speichern").count() == 1, "kein Ausweg nach Fehler")

    def t_hang(pg):
        share_btn(pg).click(); R.wait(pg, 400)
        R.check(not enabled(pg), "waehrend des Teilens muessen die Knoepfe gesperrt sein")
        pg.clock.run_for(30000); R.wait(pg, 300)
        R.check(not enabled(pg), "zu frueh freigegeben")
        pg.clock.run_for(31000); R.wait(pg, 500)
        txt = " ".join(ov(pg).locator("p").all_inner_texts())
        R.check(enabled(pg), "haengendes Teilen sperrt die Knoepfe dauerhaft")
        R.check("Keine Antwort" in txt, f"Erklaerung fehlt: {txt!r}")

    def t_dialog(pg):
        R.check(pg.evaluate("document.activeElement.closest('.gtsp-ov')!==null"), "Startfokus nicht im Dialog")
        for _ in range(5):
            pg.keyboard.press("Tab")
            R.check(pg.evaluate("document.activeElement.closest('.gtsp-ov')!==null"), "Tab verlaesst die Vorschau")
        R.check(pg.evaluate("!!document.querySelector('[inert]')"), "Hintergrund nicht inert")
        pg.keyboard.press("Escape"); R.wait(pg, 300)
        R.check(ov(pg).count() == 0, "Escape schliesst nicht")
        R.check("teilen" in pg.evaluate("document.activeElement.textContent").lower(), "Fokus kehrt nicht zum Ausloeser zurueck")
        R.check(not pg.evaluate("!!document.querySelector('[inert]')"), "inert bleibt haengen")

    def t_noshare(pg):
        R.check(share_btn(pg).count() == 0, "Teilen-Knopf trotz fehlender Funktion")
        with pg.expect_download(timeout=8000) as d:
            R.click(pg, ov(pg).get_by_role("button", name="Bild speichern"), 500)
        R.check(d.value.suggested_filename == "gametab-ergebnis.png", d.value.suggested_filename)

    one("erfolg", "ok", t_ok)
    one("abbruch", "abort", t_abort)
    one("fehler", "fail", t_fail)
    one("haengt", "hang", t_hang)
    one("dialog", "ok", t_dialog)
    one("nicht_teilbar", "none", t_noshare)
    return bad


def sha(path):
    import hashlib
    return hashlib.sha256(open(path, "rb").read()).hexdigest()


def run_repro(b, eng):
    """Dateiname, MIME-Typ und Inhalt (Hash) zweimal erzeugt: Am ehesten und Schieber-Turnier in beiden Designs, hoch und quer."""
    bad = 0
    errors = []

    def one(tag, body):
        nonlocal bad
        ctx, pg = R.new_page(b, 1280, 800, "Laptop", errors)
        try:
            body(pg)
            R.check(not errors, f"Seitenfehler: {errors[:2]}")
            print("OK    ", eng, tag)
        except Exception as e:  # noqa: BLE001
            bad += 1
            print("FEHLER", eng, tag, str(e)[:400])
            pg.screenshot(path=str(OUT / f"{eng}_{tag}_fehler.png"))
        finally:
            ctx.close()

    def save_twice(pg, scope, label, closer, opener):
        hashes, names = [], []
        for i in range(2):
            with pg.expect_download(timeout=8000) as d:
                scope().get_by_role("button", name=label).first.click()
            raw = open(d.value.path(), "rb").read()
            R.check(raw[:8] == b"\x89PNG\r\n\x1a\n", "keine PNG-Datei")
            hashes.append(sha(d.value.path())); names.append(d.value.suggested_filename)
            if i == 0:
                import shutil; shutil.copy(d.value.path(), OUT / f"{eng}_{d.value.suggested_filename}")
            if i == 0:
                closer(); opener()
        R.check(names[0] == names[1], f"Dateiname nicht reproduzierbar: {names}")
        R.check(hashes[0] == hashes[1], "Bildinhalt nicht reproduzierbar")
        return names[0]

    def t_ml(pg):
        A.flow_amehesten(pg)
        opn = lambda: (R.click(pg, pg.get_by_role("button", name=re.compile("Bild teilen")).first, 500), pg.locator(".gtsp-ov img").first.wait_for(timeout=20000), R.wait(pg, 500))  # noqa: E731
        opn()
        mime = pg.evaluate("async()=>{const u=document.querySelector('.gtsp-ov img').src;const r=await fetch(u);return (await r.blob()).type;}")
        R.check(mime == "image/png", f"MIME {mime}")
        pg.screenshot(path=str(OUT / f"{eng}_amehesten_laptop.png"))
        n = save_twice(pg, lambda: pg.locator(".gtsp-ov"), "Bild speichern", lambda: (pg.keyboard.press("Escape"), R.wait(pg, 400)), opn)
        R.check(n == "gametab-ergebnis.png", n)
        pg.keyboard.press("Escape"); R.wait(pg, 300)
        for tag, vp in (("hoch", (393, 852)), ("quer", (852, 393))):
            pg.set_viewport_size({"width": vp[0], "height": vp[1]}); R.wait(pg, 500)
            opn(); pg.screenshot(path=str(OUT / f"{eng}_amehesten_{tag}.png"))
            R.check(pg.evaluate("document.documentElement.scrollWidth<=window.innerWidth+1"), f"{tag}: Seite scrollt seitlich")
            pg.keyboard.press("Escape"); R.wait(pg, 300)

    def t_tour(pg):
        R.open_game(pg, "Schreibunterlagen", "Jass", "Schieber-Turnier")
        inp = pg.get_by_placeholder("Name eingeben")
        for n in ["Maximiliane Huber-Brunner", "Ölçü Zoë Alexandra von Hohenberg", "Cora", "Dino Karl-Heinz Superlangername"]:
            inp.fill(n); pg.keyboard.press("Enter"); R.wait(pg, 300)
        R.click(pg, R.btn(pg, "Turnier anlegen"), 1200)
        R.click(pg, pg.get_by_role("button", name=re.compile("Turniermenü")).first, 700)
        R.click(pg, pg.get_by_role("button", name=re.compile("Exportieren|als Bild", re.I)).first, 900)
        cand = pg.get_by_role("button", name=re.compile("Bild", re.I))
        if pg.locator(".gtstx-panel").count() == 0 and cand.count():
            R.click(pg, cand.first, 900)
        for k, label in (("grandslam", "Grand Slam"), ("strichliste", "Strichliste")):
            R.click(pg, pg.locator(".gtstx-panel").get_by_role("button", name=re.compile(label)).first, 600)
            pg.locator(".gtstx-pages img").first.wait_for(timeout=20000); R.wait(pg, 800)
            def again(label=label):
                other = "Strichliste" if label == "Grand Slam" else "Grand Slam"
                R.click(pg, pg.locator(".gtstx-panel").get_by_role("button", name=re.compile(other)).first, 600)
                R.wait(pg, 1200)
                R.click(pg, pg.locator(".gtstx-panel").get_by_role("button", name=re.compile(label)).first, 600)
                pg.locator(".gtstx-pages img").first.wait_for(timeout=20000); R.wait(pg, 800)
            pg.screenshot(path=str(OUT / f"{eng}_turnier_{k}_laptop.png"))
            n = save_twice(pg, lambda: pg.locator(".gtstx-foot"), re.compile("speichern"), lambda: None, again)
            R.check(k in n and n.endswith(".png"), f"Dateiname {n}")
            # Bilder selbst: Originalgroesse ablegen und pruefen
            for tag, vp in (("hoch", (393, 852)), ("quer", (852, 393))):
                pg.set_viewport_size({"width": vp[0], "height": vp[1]}); R.wait(pg, 500)
                pg.screenshot(path=str(OUT / f"{eng}_turnier_{k}_{tag}.png"))
                R.check(pg.evaluate("document.documentElement.scrollWidth<=window.innerWidth+1"), f"{k} {tag}: seitlicher Ueberlauf")
            pg.set_viewport_size({"width": 1280, "height": 800}); R.wait(pg, 400)
            src = pg.evaluate("document.querySelector('.gtstx-pages img').src")
            data = pg.evaluate("async(u)=>{const r=await fetch(u);const b=await r.arrayBuffer();return [r.headers.get('content-type')||'',Array.from(new Uint8Array(b)).length]}", src)
            R.check(data[1] > 20000, "Bild zu klein")

    one("amehesten_repro", t_ml)
    one("turnier_repro", t_tour)
    return bad


def main():
    args = sys.argv[1:]
    eng = "webkit" if "webkit" in args else "chromium"
    only = args[args.index("--only") + 1] if "--only" in args else "all"
    bad = 0
    with sync_playwright() as p:
        b = A.launch(p, eng)
        A.CUR["eng"] = eng
        if only in ("all", "backup"):
            bad += run_backup(b, eng)
        if only in ("all", "share"):
            bad += run_share(b, eng)
        if only in ("all", "repro"):
            bad += run_repro(b, eng)
        b.close()
    print(f"\n{bad} Fehler")
    return 1 if bad else 0


if __name__ == "__main__":
    sys.exit(main())
