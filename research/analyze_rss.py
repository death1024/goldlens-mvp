import json,re,collections
d=json.load(open('data/trends_rss_raw.json',encoding='utf-8'))
rows=[]
for geo,items in d['regions'].items():
    if isinstance(items,dict): continue
    for x in items:
        rows.append((geo,x['term'],x['traffic'],(x['news'][0]['title'] if x['news'] else '')))
print('total rows',len(rows),'geos',len(d['regions']))
def num(t):
    m=re.match(r'([\d,]+)',t or '')
    return int(m.group(1).replace(',','')) if m else 0
# exact repeated terms
c=collections.Counter(t.lower().strip() for _,t,_,_ in rows)
print('\n== repeated exact terms ==')
for term,n in c.most_common(20):
    if n>1:
        geos=sorted(set(g for g,t,_,_ in rows if t.lower().strip()==term))
        mx=max(num(tr) for g,t,tr,_ in rows if t.lower().strip()==term)
        print(f"{term} | regions={n} | {','.join(geos)} | maxTraffic={mx}")
print('\n== top traffic items ==')
for g,t,tr,n in sorted(rows,key=lambda r:num(r[2]),reverse=True)[:25]:
    print(f"{num(tr):>7} | {g} | {t} | {n[:80]}")
print('\n== manual theme counts ==')
themes={
 'NBA/篮球':r'\b(nba|thunder|nuggets|cavaliers|76ers|lakers|celtics|basketball)\b',
 '足球':r'\b(flamengo|libertadores|football|soccer|premier league|real madrid|barcelona|arsenal|chelsea)\b',
 '天气/灾害':r'(weather|meteo|météo|clima|hava|погода|الطقس|storm|typhoon|bão|earthquake|flood|rain)',
 '黄金/贵金属':r'(gold|ذهب|ทอง|vàng|emas|silver|xau)',
 'iPhone/折叠屏':r'(iphone|foldable|duo|apple)',
 '影视/明星':r'(jenna|roberts|waititi|skerritt|mirren|kardashian|miley|duru|film|movie|series|season)',
 'AI/科技':r'\b(ai|chatgpt|gemini|openai|tech|cyber|5g|fortinet|kddi)\b',
 '时区/夏令时':r'(time change|changement d.heure|cambio de hora|zeitumstellung|daylight)',
 '金融/宏观':r'(stock|share|ipo|tax|loan|bank|inflation|oil price|gasoline|bitcoin|nba)',
 '健康/医疗':r'(virus|health|fda|recall|doctor|hospital|cancer|diet|protein)',
}
for name,pat in themes.items():
    hit=[(g,t,tr) for g,t,tr,n in rows if re.search(pat,(t+' '+n).lower(),re.I)]
    print(f"{name}: {len(hit)} hits, {len(set(g for g,_,_ in hit))} regions")
