import sqlite3, json

dbpath = r'C:\Users\KARACA\AppData\Local\CapCut\User Data\Cache\ressdk_db\6737366863714562756\rp.db'
conn = sqlite3.connect(dbpath)
cur = conn.cursor()
cur.execute("SELECT url, response_body FROM http_cache")

panels = []
effects_by_panel = {}
transitions = []
text_templates = []
video_effects = []

for url, body in cur.fetchall():
    try:
        data = json.loads(body)
        d = data.get('data', {})
        # check for panel info
        if 'get_panel_info' in url:
            categories = d.get('categories', [])
            for c in categories:
                cat_name = c.get('name')
                key = c.get('key')
                panels.append((cat_name, key, c.get('id')))
        # check for resources
        effects = d.get('effects', []) or d.get('resource_list', []) or d.get('items', [])
        for eff in effects:
            name = eff.get('name') or eff.get('title')
            icon = eff.get('icon_url') or eff.get('static_image_url') or eff.get('icon_uri') or eff.get('cover_url')
            cat_name = eff.get('category_name') or ''
            panel = eff.get('panel') or eff.get('panel_id') or ''
            extra = eff.get('extra')
            if name:
                effects_by_panel.setdefault(panel or 'general', []).append({
                    'name': name,
                    'icon': icon,
                    'category': cat_name,
                    'id': eff.get('id') or eff.get('effect_id')
                })
    except Exception as e:
        pass

conn.close()

print('Found panels/categories in panel info:', len(panels))
for p in panels[:15]:
    print(' ', p)

print('Total categorized effect collections:', {k: len(v) for k, v in effects_by_panel.items()})
for k, v in list(effects_by_panel.items())[:5]:
    print(f'=== Panel {k} (first 5 of {len(v)}):')
    for item in v[:5]:
        print('  ', item['name'], '| cat:', item['category'], '| icon:', (item['icon'] or '')[:60])
