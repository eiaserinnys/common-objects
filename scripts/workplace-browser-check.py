"""Actual Chromium inspection, interaction and saved-state evidence for the workplace suite."""
import os,shutil,json
from pathlib import Path
from functools import partial
from http.server import SimpleHTTPRequestHandler,ThreadingHTTPServer
from threading import Thread
from playwright.sync_api import sync_playwright
from PIL import Image,ImageDraw
ROOT=Path(__file__).resolve().parents[1];OUT=ROOT/'docs/screenshots/workplace-2026-11-09';OUT.mkdir(parents=True,exist_ok=True)
class Quiet(SimpleHTTPRequestHandler):
 def log_message(self,*args):pass
server=ThreadingHTTPServer(('127.0.0.1',0),partial(Quiet,directory=str(ROOT)));Thread(target=server.serve_forever,daemon=True).start()
errors=[];checks=[];dynamic=[]
try:
 with sync_playwright() as p:
  browser=p.chromium.launch(executable_path=os.environ.get('CHROMIUM_PATH') or shutil.which('chromium'),headless=True,args=['--no-sandbox'])
  page=browser.new_page(viewport={'width':1440,'height':1000});page.on('pageerror',lambda e:errors.append(str(e)));page.on('response',lambda r:errors.append(str(r.status)+' '+r.url) if r.status>=400 else None)
  page.goto(f'http://127.0.0.1:{server.server_port}/dist/preview/workplace.html');page.wait_for_function('document.documentElement.dataset.ready === "true"')
  page.screenshot(path=str(OUT/'set-desktop.png'),full_page=True);page.locator('#scene').screenshot(path=str(OUT/'representative-interior.png'))
  page.locator('#save').click();initial=page.evaluate('JSON.parse(localStorage.getItem("common-objects.workplace.v1")).instances')
  page.locator('#toggle').click();page.locator('#save').click();raised=page.evaluate('JSON.parse(localStorage.getItem("common-objects.workplace.v1")).instances')
  for n in [2,10]:assert abs(raised[n]['position'][1]-initial[n]['position'][1]-.35)<1e-8
  page.locator('#rotation').evaluate('(e)=>{e.value=90;e.dispatchEvent(new Event("input"))}')
  page.locator('#x').fill('-1.3');page.locator('#x').dispatch_event('change');page.locator('#save').click()
  moved=page.evaluate('JSON.parse(localStorage.getItem("common-objects.workplace.v1")).instances')
  for n in [2,10]:assert abs(moved[n]['rotation'][1]-1.570796326795)<1e-8 and abs(moved[n]['position'][0]+1.3)<1e-8
  page.locator('#scene').screenshot(path=str(OUT/'attached-desk-raised-rotated.png'))
  snapshot=page.evaluate('localStorage.getItem("common-objects.workplace.v1")');page.reload();page.wait_for_function('document.documentElement.dataset.ready === "true"');page.locator('#restore').click();page.locator('#save').click();assert page.evaluate('localStorage.getItem("common-objects.workplace.v1")')==snapshot
  page.locator('#selected').select_option('object-3');assert page.locator('#rotation').is_disabled() and page.locator('#x').is_disabled();page.locator('#detach-support').click();assert page.locator('#x').is_enabled()
  checks.append('support binding: desk raises children .35m, yaw/translation follow, relation round-trips, attached controls lock and detach works')
  page.reload();page.wait_for_function('document.documentElement.dataset.ready === "true"')
  for n in range(1,11):
   page.locator('#selected').select_option(f'object-{n}')
   if page.locator('#toggle').is_enabled():page.locator('#toggle').click();dynamic.append(n)
  page.locator('#scene').screenshot(path=str(OUT/'interior-operating.png'))
  page.locator('#scene').scroll_into_view_if_needed()
  rect=page.locator('#scene').bounding_box();page.mouse.move(rect['x']+200,rect['y']+200);page.mouse.down();page.mouse.move(rect['x']+514,rect['y']+70,steps=10);page.mouse.up();page.locator('#scene').screenshot(path=str(OUT/'interior-reverse.png'))
  page.reload();page.wait_for_function('document.documentElement.dataset.ready === "true"')
  for n in range(1,17):
   page.locator('#selected').select_option(f'object-{n}');
   if page.locator('#detach-support').count():page.locator('#detach-support').click()
   page.locator('#focus').click();before=page.locator('#scene').inner_html();active=page.locator('#toggle').is_enabled()
   if active:
    page.locator('#toggle').click();assert before!=page.locator('#scene').inner_html(),f'object {n} invisible action';page.locator('#toggle').click()
   if n<=10:
    states=['rest','alternate'] if active else ['rest']
    if page.locator('#extra-actions button').count():states+=['both','secondary']
    for state in states:
     if state=='alternate':page.locator('#toggle').click()
     if state=='both':page.locator('#extra-actions button').click()
     if state=='secondary':page.locator('#toggle').click()
     for angle in [0,90,180,-90]:
      page.locator('#rotation').evaluate('(e,v)=>{e.value=v;e.dispatchEvent(new Event("input"))}',angle)
      page.locator('#scene').screenshot(path=str(OUT/f'object-{n}-{state}-{angle}.png'))
   assert 'NaN' not in page.locator('#scene').inner_html()
   page.locator('#duplicate').click()
   if active:page.locator('#toggle').click()
   page.locator('#save').click();saved=page.evaluate('JSON.parse(localStorage.getItem("common-objects.workplace.v1")).instances');orig=next(i for i in saved if i['id']==f'object-{n}')
   if active:assert orig['state']!=saved[-1]['state']
   assert orig['position']!=saved[-1]['position'];assert all(i['scale']==[1,1,1] for i in saved)
   checks.append(f'object-{n}: select, focus, independent duplicate'+(', visible action' if active else ', fixed furniture')+(', four sides in all states' if n<=10 else ', reused source'))
  assert len(saved)==32
  page.locator('#x').fill('0.42');page.locator('#x').dispatch_event('change');page.locator('#z').fill('0.33');page.locator('#z').dispatch_event('change')
  page.locator('#zoom').evaluate('(e)=>{e.value=2.1;e.dispatchEvent(new Event("input"))}')
  page.locator('#save').click();saved=page.evaluate('localStorage.getItem("common-objects.workplace.v1")')
  page.reload();page.wait_for_function('document.documentElement.dataset.ready === "true"');page.locator('#restore').click();page.locator('#save').click();assert page.evaluate('localStorage.getItem("common-objects.workplace.v1")')==saved
  checks.append('32 mixed instances: transforms, versions and states restored exactly after reload')
  page.set_viewport_size({'width':390,'height':844});page.reload();page.wait_for_function('document.documentElement.dataset.ready === "true"');page.screenshot(path=str(OUT/'set-mobile.png'),full_page=True);assert page.evaluate('document.documentElement.scrollWidth <= innerWidth')
  before=page.locator('#scene').inner_html();page.locator('#scene').scroll_into_view_if_needed();rect=page.locator('#scene').bounding_box();page.mouse.move(rect['x']+120,rect['y']+80);page.mouse.down();page.mouse.move(rect['x']+190,rect['y']+130,steps=5);page.mouse.up();assert before!=page.locator('#scene').inner_html()
  page.locator('#selected').select_option('object-2');page.locator('#focus').click();page.locator('#toggle').click();page.screenshot(path=str(OUT/'mobile-detail.png'),full_page=True)
  checks.append('390px viewport: no overflow, pointer orbit, selection, focus, chair height operation');assert not errors,errors;browser.close()
finally:server.shutdown();server.server_close()
(ROOT/'docs/workplace-browser-result.json').write_text(json.dumps(dict(checks=checks,operatingObjects=dynamic,errors=errors),indent=2)+'\n')
for state in ['rest','alternate']:
 sheet=Image.new('RGB',(1400,2100),'#f0eee5');draw=ImageDraw.Draw(sheet)
 for n in range(1,11):
  for j,angle in enumerate([0,90,180,-90]):
   f=OUT/f'object-{n}-{state}-{angle}.png'
   if not f.exists():f=OUT/f'object-{n}-alternate-{angle}.png'
   if not f.exists():f=OUT/f'object-{n}-rest-{angle}.png'
   im=Image.open(f).convert('RGB');im.thumbnail((345,180));sheet.paste(im,(j*350,(n-1)*210+24));draw.text((j*350+8,(n-1)*210+4),f'{n} / {state if n in dynamic else "fixed"} / {angle}',fill='black')
 sheet.save(OUT/f'{state}-contact-sheet.jpg')
print(json.dumps(dict(checks=len(checks),operatingObjects=dynamic,errors=errors)))
