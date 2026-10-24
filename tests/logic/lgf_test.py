#!/usr/bin/env python3
"""lgF Regressionstests: Ergebnisquelle, Statistik-Synchronisierung, Freies Spiel, Export-Optionen, Migration.
Aufruf: <venv>/python tests/lgf_test.py   (testet index.html im Elternordner)"""
import json
import re
import sys
from pathlib import Path

from playwright.sync_api import sync_playwright

sys.path.insert(0, str(Path(__file__).resolve().parent))
from smoke import ROOT, URL, start  # noqa: E402

OUT = ROOT / "tests" / "out" / "lgf"
OUT.mkdir(parents=True, exist_ok=True)
RES = []
ERR = []


def ok(cond, msg):
    RES.append((bool(cond), msg))
    print(("OK    " if cond else "FEHLER") + "  " + msg)


def ev(pg, js, arg=None):
    return pg.evaluate(js, arg)


def unit(pg):
    # ---------- rankedPodium
    r = ev(pg, "()=>{const P=[{id:1,name:'A',s:100},{id:2,name:'B',s:40}];return [rankedPodium(P,p=>p.s).map(e=>e.name+e.rk),rankedPodium(P,p=>p.s,true).map(e=>e.name+e.rk),rankedPodium(P,p=>p.s,{lowWins:true}).map(e=>e.name+e.rk)]}")
    ok(r[0] == ["A1", "B2"], f"Podest hoch A=100 B=40: A Platz 1 {r[0]}")
    ok(r[1] == ["B1", "A2"] and r[2] == ["B1", "A2"], f"Podest tief (alt bool + neu opts): B Platz 1 {r[1]} {r[2]}")
    r = ev(pg, "()=>rankedPodium([{name:'X',s:5},{name:'Y',s:9},{name:'Z',s:9},{name:'W',s:-3}],p=>p.s).map(e=>e.name+e.rk)")
    ok(r == ["Y1", "Z1", "X3", "W4"], f"Gleichstand 1,1,3 ohne Bevorzugung, negative Werte {r}")
    r = ev(pg, "()=>rankedPodium([{name:'X',s:5},{name:'Y',s:9},{name:'Z',s:9}],p=>p.s,true).map(e=>e.name+e.rk)")
    ok(r == ["X1", "Y2", "Z2"], f"tief mit Gleichstand hinten {r}")
    for a, b, c, lab in [(18, 12, 0, "weniger"), (12, 12, 0, "gleich"), (5, 30, 12, "mehr")]:
        r = ev(pg, "([a,b,c])=>{const P=[{id:1,name:'A',s:a},{id:2,name:'B',s:b},{id:3,name:'C',s:c===0?b:c}];const x=rankedPodium(P,p=>p.s,{winners:[2],reason:'shanghai'});return {n:x.map(e=>e.name+e.rk+':'+e.score),r:x.reason,why:x[0].why}}", [a, b, c])
        ok(r["n"][0].startswith("B1") and all(not s.startswith(("A1", "C1")) for s in r["n"][1:]) and r["r"] == "shanghai" and r["why"] == "shanghai",
           f"Shanghai-Sieger mit {lab} Punkten eindeutig Platz 1, punktgleicher kein Co-Sieger {r['n']}")
    r = ev(pg, "()=>rankedPodium([{id:1,name:'A',s:18},{id:2,name:'B',s:12}],p=>p.s,{winners:null}).map(e=>e.name+e.rk)")
    ok(r == ["A1", "B2"], f"ohne Shanghai normale Punktewertung {r}")

    # ---------- gtEcModel (Export)
    m = ev(pg, "()=>{const x=rankedPodium([{id:1,name:'A',s:18},{id:2,name:'B',s:12},{id:3,name:'C',s:12}],p=>p.s,{winners:[2],reason:'shanghai'});const m=gtEcModel('shanghai','Shanghai',x,useT('de'));return {d:m.detail,h:m.heroNames,r:m.rows.map(r=>r.name+r.rank+':'+r.value)}}")
    ok(m["d"] == "Sieg durch Shanghai" and m["h"] == ["B"] and m["r"][0].startswith("B1") and not any(s.startswith(("A1", "C1")) for s in m["r"]), f"Export Shanghai: Hinweis statt Vorsprung, B einziger Sieger {m}")
    m = ev(pg, "()=>{const x=rankedPodium([{name:'A',s:100},{name:'B',s:40},{name:'C',s:40}],p=>p.s,{lowWins:true});const m=gtEcModel('freeplay','Frei',x,useT('de'));return {d:m.detail,h:m.heroNames,r:m.rows.map(r=>r.name+r.rank)}}")
    ok(m["h"] == ["B", "C"] and m["r"] == ["B1", "C1", "A3"], f"Export tief + Gleichstand {m}")
    m = ev(pg, "()=>{const x=rankedPodium([{name:'A',s:100},{name:'B',s:40}],p=>p.s);return gtEcModel('freeplay','Frei',x,useT('de')).detail}")
    ok("60" in m, f"Export normaler Vorsprung bleibt ({m})")
    m = ev(pg, "()=>['de','en','fr','it','es','pt'].map(l=>[TRANSLATIONS[l].ecWinShanghai,TRANSLATIONS[l].freeLowHint])")
    ok(all(isinstance(a, str) and a and isinstance(b, str) and b and a != "ecWinShanghai" for a, b in m), f"Texte in 6 Sprachen {m}")

    # ---------- Freies Spiel Abschlussregel
    cases = [([0, 0], 100, False), ([10, 0], 100, False), ([99, 40], 100, False), ([100, 40], 100, True), ([120, 40], 100, True),
             ([50, 10], 0, False), ([-20, -50], 100, False), (None, 100, False)]
    for sc, tg, exp in cases:
        r = ev(pg, "([sc,tg])=>gtFreeDone(sc?sc.map((v,i)=>({id:i,name:'P'+i,entries:v===0&&false?[]:[v]})):[{id:1,name:'A',entries:[]},{id:2,name:'B',entries:[]}],tg)", [sc, tg])
        ok(r == exp, f"Freies Spiel Ende {sc} Ziel {tg}: {exp}")

    # ---------- recordMatch: Idempotenz, Korrekturen, Status, Loeschen
    r = ev(pg, """()=>{localStorage.removeItem('gt_matchLog');localStorage.removeItem('gt_matchIds');gtDoneSet=null;
      const L=()=>JSON.parse(localStorage.getItem('gt_matchLog')||'[]');const out={};
      GT_MATCH_IDS['tutto']='mTEST1';
      recordMatch('tutto',[{name:'A',score:6000},{name:'B',score:1000}],false);
      recordMatch('tutto',[{name:'A',score:6000},{name:'B',score:1000}],false);
      out.n1=L().length;
      recordMatch('tutto',[{name:'A',score:6100},{name:'B',score:1000}],false);
      out.p=L()[0].participants.map(p=>p.score);out.n2=L().length;
      recordMatch('tutto',[{name:'A',score:6100},{name:'B',score:1200}],false);out.lp=L()[0].participants[1].score;
      recordMatch('tutto',[{name:'A',score:5000},{name:'B',score:6000}],false);out.w=L()[0].winner;
      recordMatch('tutto',[{name:'A',score:6000},{name:'B',score:6000}],false);out.tie=L()[0].winners;out.n3=L().length;
      recordMatch('tutto',[{name:'A',score:6100},{name:'B',score:6000}],false);out.untie=[L()[0].winner,L()[0].winners===undefined];
      recordMatch('tutto',[{name:'Anna',score:6100},{name:'B',score:6000}],false);out.ren=[L().length,L()[0].winner];
      out.reopen=gtReopenMatch('tutto');out.st=L()[0].status;out.vis=loadMatchLog().length;out.all=loadMatchLog(true).length;
      recordMatch('tutto',[{name:'Anna',score:6100},{name:'B',score:6000}],false);out.st2=L()[0].status;out.vis2=loadMatchLog().length;out.n4=L().length;
      deleteMatch(L()[0].id);recordMatch('tutto',[{name:'Anna',score:6100},{name:'B',score:6000}],false);out.del=L().length;
      GT_MATCH_IDS['tutto']='mTEST2';recordMatch('tutto',[{name:'A',score:6000},{name:'B',score:1}],false);out.rev=L().length;
      GT_MATCH_IDS['shanghai']='mSH';recordMatch('shanghai',[{name:'A',score:18},{name:'B',score:12},{name:'C',score:12}],false,{winners:['B'],reason:'shanghai'});
      const s=L().find(m=>m.matchId==='mSH');out.sh=[s.winner,s.winners,s.reason,s.participants.map(p=>p.name+p.rank+':'+p.score)];
      recordMatch('shanghai',[{name:'A',score:18},{name:'B',score:12},{name:'C',score:12}],false);const s2=L().find(m=>m.matchId==='mSH');out.sh2=[s2.winner,s2.reason===undefined];
      GT_MATCH_IDS['schieber']='mSC';recordMatch('schieber',[{name:'T1',score:1000},{name:'T2',score:800}],false,{weis:[{pts:20}]});
      recordMatch('schieber',[{name:'T1',score:1000},{name:'T2',score:820}],false,{weis:[{pts:20},{pts:20}]});const w=L().filter(m=>m.matchId==='mSC');out.weis=[w.length,w[0].weis.length];
      delete GT_MATCH_IDS['tutto'];delete GT_MATCH_IDS['shanghai'];delete GT_MATCH_IDS['schieber'];
      localStorage.removeItem('gt_matchLog');localStorage.removeItem('gt_matchIds');gtDoneSet=null;return out;}""")
    ok(r["n1"] == 1, f"gleiches Ergebnis zweimal: 1 Eintrag ({r['n1']})")
    ok(r["p"] == [6100, 1000] and r["n2"] == 1, f"Sieger gleich, Punkte geaendert: derselbe Eintrag aktualisiert {r['p']}")
    ok(r["lp"] == 1200, "Verliererpunkte geaendert")
    ok(r["w"] == "B", "Siegerwechsel")
    ok(r["tie"] == ["A", "B"] and r["n3"] == 1, f"Einzelsieg wird Gleichstand {r['tie']}")
    ok(r["untie"] == ["A", True], f"Gleichstand wird Einzelsieg {r['untie']}")
    ok(r["ren"] == [1, "Anna"], f"Namenswechsel ohne Zusatzeintrag {r['ren']}")
    ok(r["reopen"] and r["st"] == "open" and r["vis"] == 0 and r["all"] == 1, f"Abschluss rueckgaengig: offen, zaehlt nicht {r}")
    ok(r["st2"] == "done" and r["vis2"] == 1 and r["n4"] == 1, "erneuter Abschluss aktualisiert dieselbe Partie")
    ok(r["del"] == 0, "geloeschte Partie bleibt geloescht")
    ok(r["rev"] == 1, "Revanche (neue matchId) neuer Eintrag")
    ok(r["sh"][0] == "B" and r["sh"][1] is None and r["sh"][2] == "shanghai" and r["sh"][3] == ["A2:18", "B1:12", "C3:12"], f"Statistik Shanghai {r['sh']}")
    ok(r["sh2"] == ["A", True], f"Undo Shanghai -> Punktewertung, reason entfernt {r['sh2']}")
    ok(r["weis"] == [1, 2], f"Schieber Weis-Korrektur im selben Eintrag {r['weis']}")

    # ---------- gtAutoReopen (Abschluss rueckgaengig ueber Spielzustand)
    r = ev(pg, """()=>{localStorage.removeItem('gt_matchLog');gtDoneSet=null;const L=()=>JSON.parse(localStorage.getItem('gt_matchLog')||'[]');
      GT_MATCH_IDS['tutto']='mR1';recordMatch('tutto',[{name:'A',score:6000},{name:'B',score:0}],false);
      const st={phase:'play',target:6000,matchId:'mR1',players:[{id:1,name:'A',entries:[5900]},{id:2,name:'B',entries:[]}]};
      gtAutoReopen({tutto:{...st,players:[{id:1,name:'A',entries:[6000]},{id:2,name:'B',entries:[]}]}});const a=L()[0].status;
      gtAutoReopen({tutto:st});const b=L()[0].status;
      gtAutoReopen({tutto:{...st,players:st.players.map(p=>({...p,entries:[]}))}});
      delete GT_MATCH_IDS['tutto'];localStorage.removeItem('gt_matchLog');gtDoneSet=null;return [a,b];}""")
    ok(r == ["done", "open"], f"Spielzustand unter Ziel -> Eintrag offen; fertig bleibt fertig {r}")


def migration(pg):
    seed = [
        {"id": "a1", "ts": 1, "game": "skyjo", "participants": [{"name": "A", "score": 10, "rank": 1}, {"name": "B", "score": 10, "rank": 1}], "winner": "A"},
        {"id": "a2", "ts": 2, "game": "freeplay", "participants": [{"name": "A", "score": 0, "rank": 1}, {"name": "B", "score": 0, "rank": 1}], "winner": "A"},
        {"id": "a3", "ts": 3, "game": "tutto", "participants": [{"name": "A", "score": 6000, "rank": 1}, {"name": "B", "score": 10, "rank": 2}], "winner": "A"},
        {"id": "a4", "ts": 4, "game": "freeplay", "participants": [{"name": "A", "score": 30, "rank": 1}, {"name": "B", "score": 0, "rank": 2}], "winner": "A"},
    ]
    pg.evaluate("(s)=>{localStorage.setItem('gt_matchLog',JSON.stringify(s));localStorage.removeItem('gt_matchLogMig');}", seed)
    pg.reload(); pg.wait_for_timeout(1200)
    r = pg.evaluate("()=>{loadMatchLog();return [JSON.parse(localStorage.getItem('gt_matchLog')),localStorage.getItem('gt_matchLogMig'),loadMatchLog().map(m=>m.id)]}")
    lg, v, vis = r
    ok(len(lg) == 4, "Migration loescht nichts")
    ok(lg[0].get("winners") == ["A", "B"], f"Migration: alter Gleichstand bekommt beide Sieger {lg[0].get('winners')}")
    ok(lg[1].get("status") == "open" and lg[1].get("gtMig") == "fp-0", "Migration: Freies Spiel 0:0 (ungespielt) zaehlt nicht mehr, bleibt gespeichert")
    ok(lg[2].get("winners") is None and lg[3].get("status") is None, "Migration: eindeutige Eintraege unveraendert")
    ok(v == "1" and vis == ["a1", "a3", "a4"], f"Migration versioniert {v}, sichtbar {vis}")
    pg.evaluate("()=>{const l=JSON.parse(localStorage.getItem('gt_matchLog'));l[1].status='done';localStorage.setItem('gt_matchLog',JSON.stringify(l));}")
    pg.reload(); pg.wait_for_timeout(1000)
    ok(pg.evaluate("()=>{loadMatchLog();return JSON.parse(localStorage.getItem('gt_matchLog'))[1].status}") == "done", "Migration laeuft nur einmal (idempotent, Version)")
    pg.evaluate("()=>{localStorage.removeItem('gt_matchLog')}")


def ui_freeplay(pg):
    pg.goto(URL); pg.wait_for_timeout(700)
    pg.get_by_text("Schreibunterlagen", exact=True).first.click(); pg.wait_for_timeout(600)
    pg.locator("button", has_text=re.compile(r"^\d*\s*Freies Spiel")).first.click(); pg.wait_for_timeout(700)
    pg.get_by_role("button", name="Niedrigste gewinnt").first.click(); pg.wait_for_timeout(500)
    pg.get_by_placeholder("offen").fill("100"); pg.wait_for_timeout(600)
    log = lambda: json.loads(pg.evaluate("localStorage.getItem('gt_matchLog')||'[]'"))
    ok(pg.locator("[data-gt-podium]").count() == 0 and len(log()) == 0, "UI Freies Spiel tief, Ziel 100, 0:0: kein Abschluss, kein Eintrag")
    ok(pg.locator("[data-gt-freehint]").count() == 1, "UI Hinweistext sichtbar")
    pg.screenshot(path=str(OUT / "fp_low_open.png"))
    # Spieler 1 bekommt 100 (4x 25) -> Spieler 2 (0) gewinnt
    for _ in range(4):
        pg.locator('[data-gt-flip="1"]').get_by_role("button", name="25", exact=True).last.click(); pg.wait_for_timeout(700)
    pg.wait_for_timeout(1500)
    lg = log()
    ok(pg.locator("[data-gt-podium]").count() == 1, "UI 100:0 -> Podest offen")
    ok(len(lg) == 1 and lg[0]["winner"] == "Spieler 2" and lg[0].get("lowWins") is True, f"UI Statistik: Spieler 2 gewinnt (tief) {[(m['winner'], m.get('lowWins')) for m in lg]}")
    txt = pg.locator("[data-gt-podium]").inner_text()
    ok(re.search(r"1\.\s*Spieler 2", txt) and re.search(r"2\.\s*Spieler 1", txt), "UI Podest tief: Spieler 2 Platz 1, Spieler 1 Platz 2")
    pg.screenshot(path=str(OUT / "fp_low_podium.png"))
    pg.get_by_role("button", name=re.compile("Bild teilen")).first.click(); pg.wait_for_timeout(2500)
    src = pg.evaluate("()=>{const i=[...document.querySelectorAll('img')].find(i=>i.naturalWidth>=1000&&i.src.startsWith('data:image'));return i?i.src:null}")
    imgs = pg.locator("img[src^='data:image']")
    if src:
        import base64
        (OUT / "fp_low_export.png").write_bytes(base64.b64decode(src.split(",", 1)[1]))
    ok(bool(src), "UI Export-Bild erzeugt")
    pg.reload(); pg.wait_for_timeout(1500)
    ok(len(log()) == 1, "UI Neuladen: keine Doppelzaehlung")
    # Revanche
    pg.keyboard.press("Escape"); pg.wait_for_timeout(400)
    if pg.locator("[data-gt-podium]").count():
        pg.get_by_role("button", name=re.compile("Revanche")).first.click(); pg.wait_for_timeout(1200)
    ok(pg.locator("[data-gt-podium]").count() == 0 and len(log()) == 1, "UI Revanche: kein Sofortsieg, kein Zusatzeintrag")


def ui_tutto(pg):
    pg.goto(URL); pg.wait_for_timeout(700)
    pg.get_by_text("Schreibunterlagen", exact=True).first.click(); pg.wait_for_timeout(600)
    pg.locator("button", has_text=re.compile(r"^\d*\s*Tutto")).first.click(); pg.wait_for_timeout(700)
    pg.get_by_role("button", name="Spiel starten").click(); pg.wait_for_timeout(800)
    pg.get_by_placeholder("Punkte").first.fill("6000"); pg.keyboard.press("Enter"); pg.wait_for_timeout(1500)
    log = lambda: [m for m in json.loads(pg.evaluate("localStorage.getItem('gt_matchLog')||'[]'")) if m.get("game") == "tutto"]
    lg = log()
    ok(len(lg) == 1 and lg[0]["participants"][0]["score"] == 6000, "UI Tutto Abschluss 6000 erfasst")
    pg.keyboard.press("Escape"); pg.wait_for_timeout(500)
    if pg.locator("[data-gt-podium]").count():
        pg.locator(".gtsb-x").first.click(); pg.wait_for_timeout(600)
    pg.get_by_placeholder("Punkte").first.fill("100"); pg.keyboard.press("Enter"); pg.wait_for_timeout(1200)
    lg = log()
    ok(len(lg) == 1 and lg[0]["participants"][0]["score"] == 6100, f"UI Tutto Korrektur +100 nach Abschluss: Statistik 6100 {[p['score'] for p in lg[0]['participants']] if lg else lg}")
    pg.screenshot(path=str(OUT / "tutto_corr.png"))
    pg.reload(); pg.wait_for_timeout(1500)
    ok(len(log()) == 1, "UI Tutto Neuladen: keine Doppelzaehlung")


def main():
    with sync_playwright() as p:
        b = p.chromium.launch()
        for (w, h, mode) in [(393, 852, "Handy"), (1512, 982, "Laptop")]:
            ctx = b.new_context(viewport={"width": w, "height": h})
            ctx.add_init_script("try{Object.defineProperty(navigator,'share',{value:undefined});Object.defineProperty(navigator,'canShare',{value:undefined});}catch(e){}")
            pg = ctx.new_page()
            pg.on("pageerror", lambda e: ERR.append("pageerror " + str(e)[:200]))
            pg.on("console", lambda m: ERR.append("console " + m.text[:200]) if m.type == "error" and not re.search(r"sw\.js|favicon|manifest|Failed to load", m.text) else None)
            start(pg, w, h, mode)
            pg.keyboard.press("Escape"); pg.wait_for_timeout(400)
            print(f"--- {mode}")
            if mode == "Handy" and "--ui-only" not in sys.argv:
                unit(pg)
                migration(pg)
            ui_freeplay(pg)
            ui_tutto(pg)
            ctx.close()
        b.close()
    ok(not ERR, f"keine Konsolen-/Seitenfehler {ERR[:5]}")
    bad = [m for c, m in RES if not c]
    print(f"\n{len(RES) - len(bad)}/{len(RES)} OK")
    sys.exit(1 if bad else 0)


if __name__ == "__main__":
    main()
