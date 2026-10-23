from pytrends.request import TrendReq
import json, time, traceback, datetime
seeds = [
 ("gold_price","gold price"),
 ("gold_rate","gold rate"),
 ("ai_outfit","ai outfit planner"),
 ("virtual_try_on","virtual try on"),
 ("ai_interior","ai interior design"),
 ("protein_tracker","protein tracker"),
 ("sleep_cycle","sleep cycle"),
 ("whatsapp","whatsapp"),
 ("iphone_fold","foldable phone"),
 ("halloween_costume","halloween costume"),
 ("ai_headshot","ai headshot"),
 ("meal_planner","meal planner"),
 ("budget_planner","budget planner"),
 ("posture","posture"),
 ("language_learning","language learning"),
]
pt=TrendReq(hl='en-US', tz=480, timeout=(10,40), retries=0, backoff_factor=0)
out={"fetched_at":datetime.datetime.now(datetime.timezone.utc).isoformat(),"timeframe":"today 12-m","geo":"worldwide","series":{}}
for key,q in seeds:
    try:
        pt.build_payload([q], timeframe='today 12-m', geo='')
        df=pt.interest_over_time()
        vals=[] if df.empty else [{"date":str(i.date()),"value":int(r[q])} for i,r in df.iterrows()]
        rq=pt.related_queries().get(q,{})
        top=[] if rq.get('top') is None else rq['top'].head(15).to_dict('records')
        rising=[] if rq.get('rising') is None else rq['rising'].head(15).to_dict('records')
        out["series"][key]={"query":q,"interest":vals,"top":top,"rising":rising}
        avg=sum(v['value'] for v in vals)/len(vals) if vals else 0
        print(key, len(vals), round(avg,1), 'top', len(top), 'rising', len(rising), flush=True)
    except Exception as e:
        out["series"][key]={"query":q,"error":str(e)}
        print(key,'ERR',e, flush=True)
    time.sleep(3)
json.dump(out,open('data/trends_keywords.json','w',encoding='utf-8'),ensure_ascii=False,indent=2)
print('saved')
