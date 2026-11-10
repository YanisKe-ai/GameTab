import sys, os, math
from playwright.sync_api import sync_playwright
from PIL import Image, ImageDraw
OUT = os.path.expanduser('~/Desktop/Gametab/tests/out/szenen')
only = sys.argv[1].split(',') if len(sys.argv) > 1 else None
URL = 'file://' + os.path.expanduser('~/Desktop/Gametab/dev-notes/entwuerfe/motion/szenen.html')
with sync_playwright() as p:
    b = p.chromium.launch()
    pg = b.new_page(viewport={'width': 1100, 'height': 900})
    errs = []
    pg.on('console', lambda m: errs.append(m.text) if m.type in ('error', 'warning') else None)
    pg.on('pageerror', lambda e: errs.append(str(e)))
    pg.goto(URL)
    pg.wait_for_timeout(300)
    ids = pg.evaluate('GTScenes.ids')
    for id in ids:
        if only and id not in only: continue
        el = pg.locator('.row[data-id=%s] .s300 .gt-scene' % id)
        el.scroll_into_view_if_needed()
        d = pg.evaluate("""(id)=>{const e=document.querySelector('.row[data-id='+id+'] .s300 .gt-scene');e.classList.remove('paused');e.style.setProperty('--o','0s');return parseFloat(getComputedStyle(e).getPropertyValue('--d'))}""", id)
        n = int(d / 0.4)
        frames = []
        for i in range(n):
            t = i * 0.4
            pg.evaluate("""([id,t])=>{const e=document.querySelector('.row[data-id='+id+'] .s300 .gt-scene');e.getAnimations({subtree:true}).forEach(a=>{a.pause();a.currentTime=t*1000})}""", [id, t])
            pg.wait_for_timeout(40)
            path = '%s/%s_%02d.png' % (OUT, id, i)
            el.screenshot(path=path)
            frames.append(path)
        cols = 7; th = 190
        rows = math.ceil(len(frames) / cols)
        sheet = Image.new('RGB', (cols * th, rows * (th + 14)), (17, 19, 27))
        dr = ImageDraw.Draw(sheet)
        for i, f in enumerate(frames):
            im = Image.open(f).convert('RGB').resize((th, th), Image.LANCZOS)
            x, y = (i % cols) * th, (i // cols) * (th + 14)
            sheet.paste(im, (x, y + 14)); dr.text((x + 4, y + 1), '%.1fs' % (i * 0.4), fill=(200, 200, 220))
        sheet.save('%s/%s_kontakt.png' % (OUT, id))
        print(id, n, 'frames')
    print('CONSOLE:', errs)
    b.close()
