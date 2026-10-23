import json, os
from PIL import Image, ImageDraw

# API-shaped static snapshot for GitHub Pages / offline demo
base=json.load(open('mvp/data/fallback.json',encoding='utf-8'))
data={
  'ok': True,
  'updatedAt': base.get('spot',{}).get('updatedAt') or base.get('generatedAt'),
  'fetchedAt': base.get('generatedAt'),
  'spot': base.get('spot'),
  'fx': {'rates': base.get('fx',{}), 'updatedAt': base.get('fxUpdatedAt'), 'source':'open.er-api.com'},
  'futures': {**base.get('futures',{}), 'history': base.get('history',[])},
  'thai': base.get('thai'),
  'degraded': ['static'],
  'cacheSeconds': 0,
  'demo': True
}
os.makedirs('mvp/public/data',exist_ok=True)
json.dump(data,open('mvp/public/data/market.json','w',encoding='utf-8'),ensure_ascii=False,indent=2)
print('market.json',len(data['futures']['history']),'history points')

# Icons
os.makedirs('mvp/public/icons',exist_ok=True)
def icon(size, path, pad_ratio=0.18):
    img=Image.new('RGBA',(size,size),(0,0,0,0))
    d=ImageDraw.Draw(img)
    r=int(size*0.22)
    d.rounded_rectangle((0,0,size-1,size-1),radius=r,fill='#0a0c0b')
    # subtle gold glow
    for i in range(12,0,-1):
        alpha=int(5*i/12)
        d.ellipse((size*0.55-i*size*0.03,size*0.10-i*size*0.03,size*0.95+i*size*0.02,size*0.50+i*size*0.02),fill=(229,196,107,alpha))
    cx,cy=size/2,size/2
    s=size*(0.5-pad_ratio)
    pts=[(cx,cy-s),(cx+s,cy),(cx,cy+s),(cx-s,cy)]
    d.line(pts+[pts[0]],fill='#e5c46b',width=max(2,int(size*0.014)),joint='curve')
    d.line((cx-s,cy,cx+s,cy),fill='#e5c46b',width=max(1,int(size*0.006)))
    d.line((cx,cy-s,cx,cy+s),fill='#e5c46b',width=max(1,int(size*0.006)))
    # small center dot
    rr=max(2,int(size*0.016))
    d.ellipse((cx-rr,cy-rr,cx+rr,cy+rr),fill='#e5c46b')
    img.save(path)
icon(192,'mvp/public/icons/icon-192.png')
icon(512,'mvp/public/icons/icon-512.png')
icon(180,'mvp/public/icons/apple-touch-icon.png')
icon(512,'mvp/public/icons/icon-maskable-512.png',pad_ratio=0.26)
print('icons written')
