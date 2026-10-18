import sqlite3, json

conn = sqlite3.connect(r'C:\Users\KARACA\AppData\Local\CapCut\User Data\Cache\ressdk_db\6737366863714562756\rp.db')
cur = conn.cursor()
cur.execute('SELECT url, response_body FROM http_cache')

items_by_type = {}

for url, body in cur.fetchall():
    try:
        data = json.loads(body).get('data', {})
        if not isinstance(data, dict):
            continue
        items = data.get('effect_item_list', [])
        for it in items:
            c = it.get('common_attr', {})
            title = c.get('title') or c.get('name')
            if not title:
                continue
            etype = c.get('effect_type')
            cover = c.get('cover_url', {})
            img = cover.get('small') or cover.get('static_img') or ''
            sdk_extra = c.get('sdk_extra') or ''
            cat_ids = c.get('category_ids') or []
            
            anim = it.get('animation', {})
            anim_type = anim.get('animation_type') if anim else None
            
            key = f"type_{etype}"
            if anim_type:
                key += f"_{anim_type}"
            
            items_by_type.setdefault(key, []).append({
                'title': title,
                'id': c.get('id'),
                'img': img,
                'extra': sdk_extra[:100]
            })
    except Exception as e:
        pass

conn.close()

print('Item types found:')
for k, v in items_by_type.items():
    print(f"=== {k}: {len(v)} items. Sample 5:")
    for it in v[:5]:
        print(f"   - {it['title']} | img: {bool(it['img'])} | extra: {it['extra'][:50]}")
