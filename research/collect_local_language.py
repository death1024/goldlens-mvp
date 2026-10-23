from pytrends.request import TrendReq
import json,time,datetime
terms=[("th_gold","ราคาทองวันนี้","TH"),("ar_gold","سعر الذهب اليوم","AE"),("vi_gold","giá vàng hôm nay","VN"),("hi_gold","सोने का भाव","IN"),("zh_gold","黄金价格","HK"),("ms_gold","harga emas hari ini","MY"),("id_gold","harga emas hari ini","ID")]
pt=TrendReq(hl='en-US',tz=480,timeout=(10,40),retries=0,backoff_factor=0)
out={"fetched_at":datetime.datetime.now(datetime.timezone.utc).isoformat(),"terms":{}}
for key,q,geo in terms:
    try:
        pt.build_payload([q],timeframe='today 12-m',geo=geo)
        df=pt.interest_over_time()
        vals=[] if df.empty else [{"date":str(i.date()),"value":int(r[q])} for i,r in df.iterrows()]
        rq=pt.related_queries().get(q,{})
        top=[] if rq.get('top') is None else rq['top'].head(12).to_dict('records')
        rising=[] if rq.get('rising') is None else rq['rising'].head(10).to_dict('records')
        out["terms"][key]={"query":q,"geo":geo,"interest":vals,"top":top,"rising":rising}
        print(key,len(vals),sum(v['value'] for v in vals)/len(vals) if vals else 0,len(top),len(rising),flush=True)
    except Exception as e:
        print(key,'ERR',e,flush=True); out["terms"][key]={"query":q,"geo":geo,"error":str(e)}
    time.sleep(4)
json.dump(out,open('data/trends_local_language.json','w',encoding='utf-8'),ensure_ascii=False,indent=2)
print('saved')
