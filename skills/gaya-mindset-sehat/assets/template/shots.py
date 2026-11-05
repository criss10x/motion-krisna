# python shots.py t1 t2 ... -> qa/sheet.jpg (contact sheet)
import sys, asyncio, pathlib, subprocess
from playwright.async_api import async_playwright
async def main(ts):
    pathlib.Path('qa').mkdir(exist_ok=True)
    for old in pathlib.Path('qa').glob('q[0-9]*.jpg'): old.unlink()  # ponytail: sheet hanya dari run ini
    async with async_playwright() as p:
        b = await p.chromium.launch()
        pg = await b.new_page(viewport={'width':1080,'height':1920})
        errs = []; pg.on('pageerror', lambda e: errs.append(str(e))); pg.on('console', lambda m: m.type=='error' and errs.append(m.text))
        await pg.goto(pathlib.Path('preview.html').resolve().as_uri()+'?render')
        await pg.wait_for_function('window.READY===true', timeout=60000)
        print('fonts', await pg.evaluate("[document.fonts.check('italic 800 64px Fraunces'),document.fonts.check('800 40px \"Plus Jakarta Sans\"')]"))
        for k,t in enumerate(ts):
            await pg.evaluate(f'window.seek({t})'); await pg.screenshot(path=f'qa/q{k:02d}.jpg', type='jpeg', quality=80)
        print('errors', errs[:5]); await b.close()
ts=[float(x) for x in sys.argv[1:]]
asyncio.run(main(ts))
n=len(ts); cols=6 if n>6 else n
subprocess.run(['ffmpeg','-v','error','-y','-i','qa/q%02d.jpg','-vf',f'scale=360:-1,tile={cols}x{(n+cols-1)//cols}:padding=6','-frames:v','1','qa/sheet.jpg'],check=True)
