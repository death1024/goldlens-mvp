from pytrends.request import TrendReq
import json, time, datetime
pt=TrendReq(hl='en-US', tz=480, timeout=(10,40), retries=0, backoff_factor=0)
groups={
 "consumer_ai":["gold price","ai headshot","virtual try on","meal planner","protein tracker"],
 "lifestyle":["ai interior design","sleep cycle","budget planner","posture","language learning"],
 "emerging":["foldable phone","whatsapp","halloween costume","gold rate","daylight saving time"],
}
out={"fetched_at":datetime.datetime.now(datetime.timezone.utc).isoformat(),"timeframe":"today 12-m","geo":"worldwide","groups":{},"regional":{},"local_queries":{}}
for g,queries in groups.items():
    try:
        pt.build_payload(queries, timeframe='today 12-m', geo='')
        df=pt.interest_over_time()
        rows=[] if df.empty else [{"date":str(i.date()),**{q:int(r[q]) for q in queries}} for i,r in df.iterrows()]
        out["groups"][g]={"queries":queries,"series":rows}
        print('group',g,len(rows),flush=True)
    except Exception as e:
        print('group',g,'ERR',e,flush=True); out["groups"][g]={"queries":queries,"error":str(e)}
    time.sleep(4)
# regional interest for gold price
try:
    pt.build_payload(["gold price"], timeframe='today 12-m', geo='')
    reg=pt.interest_by_region(resolution='COUNTRY', inc_low_vol=True)
    reg=reg.sort_values('gold price',ascending=False).head(40)
    out["regional"]["gold_price"]=[{"country":i,"score":int(r["gold price"])} for i,r in reg.iterrows()]
    print('regional',len(reg),flush=True)
except Exception as e:
    print('regional ERR',e,flush=True); out["regional"]["error"]=str(e)
time.sleep(4)
for geo in ['TH','AE','IN','SA','VN','US']:
    try:
        pt.build_payload(["gold price"], timeframe='today 12-m', geo=geo)
        rq=pt.related_queries().get('gold price',{})
        top=[] if rq.get('top') is None else rq['top'].head(12).to_dict('records')
        rising=[] if rq.get('rising') is None else rq['rising'].head(12).to_dict('records')
        out["local_queries"][geo]={"top":top,"rising":rising}
        print('local',geo,len(top),len(rising),flush=True)
    except Exception as e:
        print('local',geo,'ERR',e,flush=True); out["local_queries"][geo]={"error":str(e)}
    time.sleep(4)
json.dump(out,open('data/trends_groups.json','w',encoding='utf-8'),ensure_ascii=False,indent=2)
print('saved')
