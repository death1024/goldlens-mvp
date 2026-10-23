import urllib.request, xml.etree.ElementTree as ET, json, datetime, time, re, html
geos = ["US","GB","CA","AU","IN","JP","KR","TW","HK","SG","DE","FR","BR","MX","ID","VN","TH","PH","MY","NL","ES","IT","PL","TR","AE","SA","ZA","NG","KE","AR","CL","CO","PE"]
ns = {"ht":"https://trends.google.com/trending/rss"}
out = {"collected_at": datetime.datetime.now(datetime.timezone.utc).isoformat(), "source": "https://trends.google.com/trending/rss", "regions": {}}
for geo in geos:
    url = f"https://trends.google.com/trending/rss?geo={geo}"
    try:
        req = urllib.request.Request(url, headers={"User-Agent":"Mozilla/5.0"})
        raw = urllib.request.urlopen(req, timeout=30).read()
        root = ET.fromstring(raw)
        items = []
        for it in root.findall("./channel/item"):
            title = (it.findtext("title") or "").strip()
            traffic = (it.findtext("ht:approx_traffic", namespaces=ns) or "").strip()
            pub = (it.findtext("pubDate") or "").strip()
            news = []
            for n in it.findall("ht:news_item", ns):
                news.append({
                    "title": (n.findtext("ht:news_item_title", namespaces=ns) or "").strip(),
                    "url": (n.findtext("ht:news_item_url", namespaces=ns) or "").strip(),
                    "source": (n.findtext("ht:news_item_source", namespaces=ns) or "").strip(),
                })
            items.append({"term": title, "traffic": traffic, "pubDate": pub, "news": news})
        out["regions"][geo] = items
        print(geo, len(items))
    except Exception as e:
        out["regions"][geo] = {"error": str(e)}
        print(geo, "ERR", e)
    time.sleep(0.3)
with open("data/trends_rss_raw.json","w",encoding="utf-8") as f:
    json.dump(out,f,ensure_ascii=False,indent=2)
print("saved")
