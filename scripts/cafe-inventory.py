"""Refresh this cycle's inventory from current sources and explicit curatorial tags."""
from pathlib import Path
import json,re,collections
ROOT=Path(__file__).resolve().parents[1]
old=(ROOT/'docs/catalog-inventory-2026-11-02.md').read_text()
tags={}
for line in old.splitlines():
 if line.startswith('| ['):
  cells=[x.strip() for x in line.split('|')[1:-1]]
  id=re.search(r'\[([^]]+)\]',cells[0])[1]
  tags[id]=(cells[1],cells[5],cells[6])
new={
 'service-counter':('H,O,C','storage, support'),
 'refrigerator':('H,O,C','appliance, storage'),
 'espresso-machine':('H,O,C','machine'),
 'pastry-display':('H,O,C','storage, support'),
 'pedestal-table':('H,O,C','support'),
 'dining-chair':('H,O,C','seating'),
 'menu-board':('C','signage'),
 'sorting-bin':('H,O,C','storage, waste'),
 'queue-rail':('O,C','circulation'),
 'service-sink':('H,O,C','fixture'),
}
for id,(spaces,roles) in new.items():tags['cafe-'+id]=('independent',spaces,roles)
rows=[];scopes={};batches={};spacecounts=collections.Counter();rolecounts=collections.Counter();records=[]
paths=json.loads((ROOT/'assets/catalog.json').read_text())['assets']
assert len(paths)==len(set(paths))
for path in paths:
 a=json.loads((ROOT/'assets'/path).read_text());scope,spaces,roles=tags[a['id']];size='S' if max(a['dimensions'])<.5 else 'M' if max(a['dimensions'])<1 else 'L'
 scopes.setdefault(scope,collections.Counter())[size]+=1
 if scope=='independent':
  spacecounts.update(spaces.split(','));rolecounts.update(roles.split(', '))
 if a.get('batch'):batches.setdefault(a['batch'],collections.Counter())[size]+=1
 rows.append(f"| [{a['id']}](../assets/{path}) — {a['name']} | {scope} | {a.get('batch','original')} | {' × '.join(str(round(d,4)) for d in a['dimensions'])} | {size} | {spaces} | {roles} |")
 records.append(dict(id=a['id'],source=path,scope=scope,dimensions=a['dimensions'],size=size,spaces=spaces.split(','),roles=roles.split(', '),states=a.get('state',{}),batch=a.get('batch','original')))
recent=list(batches)[-10:];recentcounts=collections.Counter()
for b in recent:recentcounts.update(batches[b])
header=old[:old.index('| Asset/source')]
header=header.replace('2026-11-02','2026-11-03').replace('Updated after office production on base `6593ab4b52599b698aaec780a4599ce501d37b4e`. All 125','Updated after café production on base `b0adefaa189c1f93a1308f16bcf2f1ce671a9f97`. All 135')
header=header.replace('Metric sources describe authored rest geometry','Metric sources describe the union of authored poses')
header+='New café roles include appliance (refrigerator), machine (espresso illustration), fixture (sink), signage, waste and circulation. These are roles, not simulation claims. Menu signage uses C; queue guide uses O,C; other café anchors use H,O,C as candidate reuse. Dining chair adds the first independent human seat.\n\n'
(ROOT/'docs/catalog-inventory-2026-11-03.md').write_text(header+'| Asset/source | Scope | Batch | Dimensions (m) | Size | Spaces | Roles |\n| --- | --- | --- | --- | --- | --- | --- |\n'+'\n'.join(rows)+'\n')
result=dict(base='b0adefaa189c1f93a1308f16bcf2f1ce671a9f97',registrations=len(paths),scopes=scopes,independentCandidateSpaces=spacecounts,independentRoles=rolecounts,batches=batches,recentWindow=recent,recentSizes=recentcounts,records=records)
(ROOT/'docs/cafe-catalog-audit.json').write_text(json.dumps(result,indent=2)+'\n')
print(json.dumps({k:v for k,v in result.items() if k!='records'},indent=2))
