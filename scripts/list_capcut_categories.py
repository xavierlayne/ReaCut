import sqlite3, json

conn = sqlite3.connect(r'C:\Users\KARACA\AppData\Local\CapCut\User Data\Cache\ressdk_db\6737366863714562756\rp.db')
cur = conn.cursor()
cur.execute('SELECT url, response_body FROM http_cache')

categories_by_key = {}
effects_samples = {}

for url, body in cur.fetchall():
    try:
        data = json.loads(body).get('data', {})
        if not isinstance(data, dict):
            continue
        cats = data.get('categories', [])
        for c in cats:
            name = c.get('category_name')
            key = c.get('category_key')
            cid = c.get('category_id')
            if name and key:
                categories_by_key[name] = key
                
        # also check items
        for it in data.get('effect_item_list', []):
            title = it.get('common_attr', {}).get('title')
            cat_ids = it.get('common_attr', {}).get('category_ids', [])
            etype = it.get('common_attr', {}).get('effect_type')
            cover = it.get('common_attr', {}).get('cover_url', {})
            img = cover.get('small') or cover.get('static_img')
            if title:
                effects_samples.setdefault(etype, []).append((title, img))
    except Exception as e:
        pass

conn.close()

print('=== Unique Category Names in CapCut Cache (count:', len(categories_by_key), '):')
for name, key in list(categories_by_key.items())[:60]:
    print(f"  {name} ({key})")

print('\n=== Effects sample count by effect_type:')
for etype, sample in effects_samples.items():
    print(f"  Type {etype}: {len(sample)} items. Examples: {[s[0] for s in sample[:6]]}")
