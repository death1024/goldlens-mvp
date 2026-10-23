import json,urllib.request,datetime,re
def get(url):
    req=urllib.request.Request(url,headers={'User-Agent':'Mozilla/5.0'})
    return urllib.request.urlopen(req,timeout=30).read().decode('utf-8','replace')
spot=json.loads(get('https://api.gold-api.com/price/XAU'))
fx=json.loads(get('https://open.er-api.com/v6/latest/USD'))
y=json.loads(get('https://query1.finance.yahoo.com/v8/finance/chart/GC=F?range=1y&interval=1d'))
meta=y['chart']['result'][0]['meta']
hist=json.load(open('data/gold_history.json'))['rows']
html=get('https://classic.goldtraders.or.th/')
def field(name):
    m=re.search(r'id="[^"]*'+re.escape(name)+r'"[^>]*>(?:<[^>]+>)*([^<]*)',html)
    return m.group(1).strip() if m else None
def num(s):
    try: return float(s.replace(',',''))
    except: return None
fallback={
 'generatedAt':datetime.datetime.now(datetime.timezone.utc).isoformat(),
 'spot':{'usdOz':spot['price'],'updatedAt':spot['updatedAt'],'source':'gold-api.com'},
 'futures':{'price':meta.get('regularMarketPrice'),'previousClose':meta.get('chartPreviousClose'),'changePct':meta.get('regularMarketChangePercent'),'dayHigh':meta.get('regularMarketDayHigh'),'dayLow':meta.get('regularMarketDayLow'),'source':'Yahoo Finance GC=F'},
 'fx':{k:fx['rates'][k] for k in ['THB','AED','INR','CNY','USD','SGD','EUR']},
 'fxUpdatedAt':fx.get('time_last_update_utc'),
 'thai':{'barSell':num(field('lblBLSell')),'barBuy':num(field('lblBLBuy')),'ornamentSell':num(field('lblOMSell')),'ornamentBuy':num(field('lblOMBuy')),'asOf':field('lblAsTime'),'source':'Gold Traders Association (GTA)'},
 'history':hist
}
json.dump(fallback,open('mvp/data/fallback.json','w',encoding='utf-8'),ensure_ascii=False,indent=2)
print(json.dumps({k:v for k,v in fallback.items() if k!='history'},ensure_ascii=False,indent=2))
print('history',len(hist))
