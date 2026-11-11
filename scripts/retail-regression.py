"""Regression of established metric previews and atomic attachment refusal, Chromium."""
import json,os,shutil
from pathlib import Path
from functools import partial
from http.server import SimpleHTTPRequestHandler,ThreadingHTTPServer
from threading import Thread
from playwright.sync_api import sync_playwright
ROOT=Path(__file__).resolve().parents[1]
class Quiet(SimpleHTTPRequestHandler):
 def log_message(self,*args):pass
server=ThreadingHTTPServer(('127.0.0.1',0),partial(Quiet,directory=str(ROOT)));Thread(target=server.serve_forever,daemon=True).start()
errors=[];checks=[]
try:
 with sync_playwright() as p:
  browser=p.chromium.launch(executable_path=os.environ.get('CHROMIUM_PATH') or shutil.which('chromium'),headless=True,args=['--no-sandbox'])
  page=browser.new_page(viewport={'width':1280,'height':900});page.on('pageerror',lambda e:errors.append(str(e)))
  page.on('response',lambda r:errors.append(str(r.status)+' '+r.url) if r.status>=400 else None)
  base=f'http://127.0.0.1:{server.server_port}/dist/preview/'
  for f in sorted((ROOT/'dist/preview').glob('*.html')):
   if f.stem=='retail' or 'id="selected"' not in f.read_text():continue
   page.goto(base+f.name);page.wait_for_function('document.documentElement.dataset.ready === "true"')
   batch=page.locator('html').get_attribute('data-batch') or f.stem;count=page.locator('#selected option').count()
   for n in range(count):
    page.locator('#selected').select_option(index=n)
    if page.locator('#toggle').is_enabled():break
   if page.locator('#toggle').is_enabled():page.locator('#toggle').click()
   page.locator('#duplicate').click();page.locator('#save').click();key='common-objects.scene.v1' if batch=='desk-lamp' else 'common-objects.'+batch+'.v1';saved=page.evaluate('(k)=>localStorage.getItem(k)',key)
   assert len(json.loads(saved)['instances'])==count+1
   if batch=='workplace':
    assert len([i for i in json.loads(saved)['instances'] if 'attachment' in i])==5
    assert abs(json.loads(saved)['instances'][2]['position'][1]-1.10)<1e-8
   elif batch=='architecture':
    assert len([i for i in json.loads(saved)['instances'] if 'attachment' in i])==3
    assert len([i for i in json.loads(saved)['instances'] if 'mount' in i])==6
   else:assert all('attachment' not in i for i in json.loads(saved)['instances'])
   page.reload();page.wait_for_function('document.documentElement.dataset.ready === "true"');page.locator('#restore').click();page.locator('#save').click();assert page.evaluate('(k)=>localStorage.getItem(k)',key)==saved
   checks.append(f'{f.name}: {count} existing instances; action, independent duplicate, save/reload/restore unchanged')
  # Deliberately unavailable standing support, injected only in this test browser.
  desk=json.loads((ROOT/'assets/workplace-desk/asset.json').read_text());desk['supportSurfaces']=[s for s in desk['supportSurfaces'] if not s.get('availableWhen',{}).get('high')]
  page.route('**/assets/workplace-desk/asset.json',lambda route:route.fulfill(status=200,content_type='application/json',body=json.dumps(desk)))
  page.goto(base+'workplace.html');page.wait_for_function('document.documentElement.dataset.ready === "true"');page.locator('#save').click();before=page.evaluate('localStorage.getItem("common-objects.workplace.v1")')
  page.locator('#toggle').click();assert 'unavailable' in page.locator('#status').inner_text();page.locator('#save').click();assert page.evaluate('localStorage.getItem("common-objects.workplace.v1")')==before
  checks.append('unavailable desk support rejects action atomically: saved parent state, child poses and bindings unchanged')
  page.locator('#selected').select_option('object-3');page.locator('#duplicate').click();page.locator('#save').click();copied=json.loads(page.evaluate('localStorage.getItem("common-objects.workplace.v1")'))['instances'];assert 'attachment' not in copied[-1];assert copied[2]['attachment']['parentId']=='object-1'
  checks.append('duplicating an attached terminal creates a detached copy and preserves the original binding')
  page.unroute('**/assets/workplace-desk/asset.json')
  blind=json.loads((ROOT/'assets/architecture-blind/asset.json').read_text());blind['mountAnchors'][0]['availableWhen']={'raised':False}
  page.route('**/assets/architecture-blind/asset.json',lambda route:route.fulfill(status=200,content_type='application/json',body=json.dumps(blind)))
  page.goto(base+'architecture.html');page.wait_for_function('document.documentElement.dataset.ready === "true"');page.locator('#selected').select_option('object-9');page.locator('#save').click();before=page.evaluate('localStorage.getItem("common-objects.architecture.v1")')
  page.locator('#toggle').click();assert 'unavailable' in page.locator('#status').inner_text();page.locator('#save').click();assert page.evaluate('localStorage.getItem("common-objects.architecture.v1")')==before
  checks.append('unavailable mounting anchor rejects blind action atomically without changing poses, states or bindings')
  page.locator('#selected').select_option('object-5');page.locator('#duplicate').click();page.locator('#save').click();copied=json.loads(page.evaluate('localStorage.getItem("common-objects.architecture.v1")'))['instances'];assert len(copied)==16 and 'mount' not in copied[-1] and 'attachment' not in copied[-1];assert copied[4]['mount']['parentId']=='object-1' and copied[14]['attachment']['parentId']=='object-5'
  checks.append('duplicating mounted shelf detaches only copy; original mount and nested teapot support stay intact')
  assert not errors,errors;browser.close()
finally:server.shutdown();server.server_close()
result=dict(checks=checks,errors=errors)
(ROOT/'docs/retail-regression-result.json').write_text(json.dumps(result,indent=2)+'\n');print(json.dumps(result))
