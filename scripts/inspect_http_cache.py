import sqlite3, json

dbpath = r'C:\Users\KARACA\AppData\Local\CapCut\User Data\Cache\ressdk_db\6737366863714562756\rp.db'
conn = sqlite3.connect(dbpath)
cur = conn.cursor()
cur.execute("SELECT id, url, substr(response_body, 1, 300) FROM http_cache LIMIT 20;")
for r in cur.fetchall():
    print('URL:', r[1][:120])
    print('  SNIPPET:', r[2][:150])
    print('---')
conn.close()
