import sqlite3, json, glob, os

image_files = set(os.path.basename(p) for p in glob.glob(r'C:\Users\KARACA\AppData\Local\CapCut\User Data\Cache\image\*.png'))

conn = sqlite3.connect(r'C:\Users\KARACA\AppData\Local\CapCut\User Data\Cache\ressdk_db\6737366863714562756\rp.db')
cur = conn.cursor()
cur.execute('SELECT response_body FROM http_cache')

matches = {}

for (body,) in cur.fetchall():
    for fn in image_files:
        stem = fn.split('.')[0]
        if stem in body:
            try:
                data = json.loads(body).get('data', {})
                items = data.get('effect_item_list', [])
                for it in items:
                    c = it.get('common_attr', {})
                    cover = c.get('cover_url', {})
                    if stem in str(cover):
                        matches[fn] = {
                            'title': c.get('title'),
                            'id': c.get('id'),
                            'type': c.get('effect_type'),
                            'cover': cover
                        }
            except Exception:
                pass

conn.close()

print(f"Matched {len(matches)} images directly to CapCut effect metadata:")
for fn, info in list(matches.items())[:20]:
    print(f"  {fn} -> {info['title']} (type: {info['type']})")
