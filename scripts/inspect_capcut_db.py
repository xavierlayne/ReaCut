import sqlite3

dbpath = r'C:\Users\KARACA\AppData\Local\CapCut\User Data\Cache\ressdk_db\6737366863714562756\rp.db'
conn = sqlite3.connect(dbpath)
cur = conn.cursor()
cur.execute("SELECT name FROM sqlite_master WHERE type='table';")
tables = [r[0] for r in cur.fetchall()]
print('Tables in rp.db:', tables)
for t in tables:
    try:
        cur.execute(f'SELECT count(*) FROM "{t}"')
        cnt = cur.fetchone()[0]
        cur.execute(f'PRAGMA table_info("{t}")')
        cols = [c[1] for c in cur.fetchall()]
        print(f'  {t}: {cnt} rows | cols: {cols}')
    except Exception as ex:
        print(f'  {t}: error {ex}')
conn.close()
