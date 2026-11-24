"""Convert only licensed source coordinates; never invent boundary vertices.
Usage: python scripts/generate_maps.py /path/to/US_AtlasHCB_StateTerr_Gen01.zip
"""
import sys, zipfile, tempfile, pathlib, datetime, json, hashlib
import shapefile
from shapely.geometry import shape, mapping
from shapely.geometry.polygon import orient
ROOT=pathlib.Path(__file__).resolve().parents[1]
archive=pathlib.Path(sys.argv[1])
work=pathlib.Path(tempfile.mkdtemp(prefix='america-atlas-'))
zipfile.ZipFile(archive).extractall(work)
r=shapefile.Reader(str(next(work.rglob('*.shp'))))
def serial(x):
 if isinstance(x,datetime.date): return x.isoformat()
 return x
rows=[]
for sr in r.iterShapeRecords():
 p={k:serial(v) for k,v in sr.record.as_dict().items()}
 if p['NAME']=='Gadsden Purchase': p['DISPLAY_START']='1854-06-30'
 g=shape(sr.shape.__geo_interface__)
 # D3 spherical geometry expects clockwise exteriors for small polygons.
 if g.geom_type=='Polygon': g=orient(g,sign=-1)
 else:
  from shapely.geometry import MultiPolygon
  g=MultiPolygon([orient(a,sign=-1) for a in g.geoms])
 rows.append({'type':'Feature','properties':p,'geometry':mapping(g)})
end='1959-08-21'
# These dates change only the legend category (pending agreement -> mapped jurisdiction).
status_dates=['1803-12-20','1821-02-22','1846-07-17','1854-06-30','1867-10-18','1898-08-12']
dates=sorted({f['properties']['START_DATE'] for f in rows if '1783-09-03'<=f['properties']['START_DATE']<=end and f['properties']['START_DATE']!='1853-12-30'}|set(status_dates)-{'1853-12-30'})
out=ROOT/'public/data';out.mkdir(parents=True,exist_ok=True)
for old in out.glob('snapshot-*.json'): old.unlink()
manifest=[]
for date in dates:
 fs=[f for f in rows if f['properties'].get('DISPLAY_START',f['properties']['START_DATE'])<=date<=f['properties']['END_DATE']]
 file=f'snapshot-{date}.json'
 (out/file).write_text(json.dumps({'type':'FeatureCollection','date':date,'source':'newberry-state-terr-gen01','features':fs},separators=(',',':')))
 manifest.append({'date':date,'file':file,'count':len(fs)})
modern=[f for f in rows if f['properties']['START_DATE']<='2000-12-31'<=f['properties']['END_DATE'] and f['properties']['TERR_TYPE'] in ['State','District of Columbia']]
(out/'modern.json').write_text(json.dumps({'type':'FeatureCollection','date':'2000-12-31','features':modern},separators=(',',':')))
(out/'manifest.json').write_text(json.dumps({'source':'newberry-state-terr-gen01','snapshots':manifest},separators=(',',':')))
meta=next(work.rglob('*Metadata1.htm'))
(ROOT/'docs/licenses/newberry-original-metadata.html').write_bytes(meta.read_bytes())
(ROOT/'docs/DATA-PROVENANCE.json').write_text(json.dumps({'retrieved':'2026-11-24','url':'https://publications.newberry.org/ahcb/downloads/gis/US_AtlasHCB_StateTerr_Gen01.zip','sha256':hashlib.sha256(archive.read_bytes()).hexdigest(),'features':len(rows),'snapshots':len(dates),'displayOverrides':[{'record':'Gadsden Purchase','originalStart':'1853-12-30','displayStart':'1854-06-30','reason':'Final approved footprint differs from original proposal. No 1853 proposal geometry supplied.','source':'https://avalon.law.yale.edu/19th_century/mx1853.asp'}],'generalization':'Source generalized to 0.01 degree. Source coordinates converted deterministically, with no hand-drawn shapes or temporal interpolation. Winding reversed for D3; source properties preserved. See encoding field for quantization details.','licenseEvidence':['https://publications.newberry.org/ahcb/downloads/states.html','https://www.loc.gov/item/2018487899/']},indent=2))
print(f'{len(dates)} snapshots; {len(rows)} source features; {len(modern)} modern reference features')
