# Render frame JPEG dari preview.html (window.seek) dengan beberapa worker paralel, lalu simpan SFX.
import asyncio, json, math, pathlib, sys
from playwright.async_api import async_playwright
FPS, W = 30, int(sys.argv[1]) if len(sys.argv) > 1 else 4
URL = pathlib.Path('preview.html').resolve().as_uri() + '?render'
pathlib.Path('frames').mkdir(exist_ok=True)
async def worker(b, idx, n):
    pg = await b.new_page(viewport={'width': 1080, 'height': 1920})
    await pg.goto(URL); await pg.wait_for_function('window.READY===true', timeout=60000)
    for i in range(idx, n, W):
        await pg.evaluate(f'window.seek({i / FPS})')
        await pg.screenshot(path=f'frames/f{i:05d}.jpg', type='jpeg', quality=95)
    return await pg.evaluate('window.SFX') if idx == 0 else None
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch()
        pg = await b.new_page(); await pg.goto(URL); await pg.wait_for_function('window.READY===true', timeout=60000)
        n = math.ceil(await pg.evaluate('window.DURATION') * FPS); await pg.close()
        res = await asyncio.gather(*[worker(b, k, n) for k in range(W)])
        json.dump(res[0], open('sfx.json', 'w')); print('frames', n, 'sfx', len(res[0])); await b.close()
asyncio.run(main())
