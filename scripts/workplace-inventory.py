"""Refresh this cycle's inventory from current sources and explicit curatorial tags."""
from pathlib import Path
import json,re,collections
ROOT=Path(__file__).resolve().parents[1]
old=(ROOT/'docs/catalog-inventory-2026-11-08.md').read_text()
tags={}
for line in old.splitlines():
 if line.startswith('| ['):
  cells=[x.strip() for x in line.split('|')[1:-1]]
  id=re.search(r'\[([^]]+)\]',cells[0])[1]
  tags[id]=(cells[1],cells[5],cells[6])
new={id:(spaces,roles) for id,spaces,roles in [('desk','H,O,C','support, workstation'),('task-chair','H,O,C','seating'),('terminal','H,O,C','computing'),('tower','H,O,C','computing'),('whiteboard','O,C','collaboration'),('lockers','O,C','storage'),('shredder','H,O,C','machine'),('water-dispenser','H,O,C','appliance'),('meeting-table','O,C','support, collaboration'),('flat-file','O,C','storage, support')]}
for id,(spaces,roles) in new.items():tags["workplace-"+id]=("independent",spaces,roles)
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
header="# Complete catalog inventory — 2026-11-09\n\nUpdated after workplace production on base `117d9f7`. All 195 current entries, read from source. Size bins: max dimension <0.5 m S, <1 m M, otherwise L. Dimensions include union of fixed authored poses, not swept clearance. Independent objects, original compound groups and the original whole room are separated. H/O/C are overlapping candidate home/office/commercial use tags, not furnished-room counts. Dimensions estimated; immutable prior versions are not additional objects.\n\n"
(ROOT/'docs/catalog-inventory-2026-11-09.md').write_text(header+'| Asset/source | Scope | Batch | Dimensions (m) | Size | Spaces | Roles |\n| --- | --- | --- | --- | --- | --- | --- |\n'+'\n'.join(rows)+'\n')
result=dict(base='117d9f7',registrations=len(paths),scopes=scopes,independentCandidateSpaces=spacecounts,independentRoles=rolecounts,batches=batches,recentWindow=recent,recentSizes=recentcounts,records=records)
(ROOT/'docs/workplace-catalog-audit.json').write_text(json.dumps(result,indent=2)+'\n')
print(json.dumps({k:v for k,v in result.items() if k!='records'},indent=2))
