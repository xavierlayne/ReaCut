import sqlite3, json

conn = sqlite3.connect(r'C:\Users\KARACA\AppData\Local\CapCut\User Data\Cache\ressdk_db\6737366863714562756\rp.db')
cur = conn.cursor()
cur.execute('SELECT url, response_body FROM http_cache')

all_effects = []
all_categories = {}

for url, body in cur.fetchall():
    try:
        data = json.loads(body)
        d = data.get('data', {})
        if not isinstance(d, dict):
            continue
        
        # categories
        for cat in d.get('categories', []):
            cid = cat.get('category_id')
            cname = cat.get('category_name')
            if cid and cname:
                all_categories[str(cid)] = cname
                
        # category_resources
        cat_res = d.get('category_resources', {})
        if isinstance(cat_res, dict):
            for cid, cdata in cat_res.items():
                items = cdata.get('effect_item_list', []) if isinstance(cdata, dict) else []
                for it in items:
                    all_effects.append(it)
        elif isinstance(cat_res, list):
            for cdata in cat_res:
                items = cdata.get('effect_item_list', []) if isinstance(cdata, dict) else []
                for it in items:
                    all_effects.append(it)
                    
        # direct effect_item_list
        for it in d.get('effect_item_list', []):
            all_effects.append(it)
            
        # collections
        for col in d.get('collections', []):
            for it in col.get('effects', []):
                all_effects.append(it)
    except Exception as e:
        pass

conn.close()

print('Total effects found:', len(all_effects))
print('Total categories found:', len(all_categories))

# Deduplicate effects by id or name
unique_effects = {}
for e in all_effects:
    name = e.get('name') or e.get('title')
    eid = e.get('id') or e.get('effect_id')
    key = eid or name
    if key and key not in unique_effects:
        unique_effects[key] = e

print('Unique effects:', len(unique_effects))

# Sample 10 unique effects
for key, e in list(unique_effects.items())[:20]:
    name = e.get('name') or e.get('title')
    cat = e.get('category_name') or all_categories.get(str(e.get('category_id')), '')
    panel = e.get('panel') or e.get('panel_id') or e.get('type') or ''
    icon = e.get('icon_url') or e.get('static_image_url') or e.get('cover_url') or ''
    print(f"- {name} | Cat: {cat} | Panel/Type: {panel} | Icon: {icon[:60]}")
