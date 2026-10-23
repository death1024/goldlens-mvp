import json, urllib.request, datetime
url='https://query1.finance.yahoo.com/v8/finance/chart/GC=F?range=1y&interval=1d'
req=urllib.request.Request(url,headers={'User-Agent':'Mozilla/5.0'})
d=json.load(urllib.request.urlopen(req,timeout=30))
r=d['chart']['result'][0]
ts=r['timestamp']; q=r['indicators']['quote'][0]
rows=[]
for i,t in enumerate(ts):
    c=q['close'][i]
    if c is not None:
        rows.append({'date':datetime.datetime.fromtimestamp(t,datetime.timezone.utc).strftime('%Y-%m-%d'),'close':round(c,2)})
json.dump({'symbol':'GC=F','fetched_at':datetime.datetime.now(datetime.timezone.utc).isoformat(),'rows':rows},open('data/gold_history.json','w'),indent=2)
print(len(rows),rows[0],rows[-1])
print('52w high',max(x['close'] for x in rows),'low',min(x['close'] for x in rows))
