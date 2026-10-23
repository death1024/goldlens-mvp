from PIL import Image, ImageDraw, ImageFont
W,H=1240,1754
img=Image.new('RGB',(W,H),'#0a0c0b')
d=ImageDraw.Draw(img)
for y in range(0,H,80):
    d.line((0,y,W,y),fill=(18,20,17),width=1)
# subtle gold glow
for r in range(560,10,-6):
    a=max(0,int(18*(1-r/560)**2))
    d.ellipse((W-180-r,300-r,W-180+r,300+r),outline=(10+a,9+int(a*.75),7+int(a*.35)),width=2)
# diamond logo
cx,cy,s=150,150,34
d.polygon([(cx,cy-s),(cx+s,cy),(cx,cy+s),(cx-s,cy)],outline='#e5c46b',width=2)
d.line((cx-s,cy,cx+s,cy),fill='#e5c46b',width=1)
d.line((cx,cy-s,cx,cy+s),fill='#e5c46b',width=1)
msyh='C:/Windows/Fonts/msyh.ttc'; msyhbd='C:/Windows/Fonts/msyhbd.ttc'
def text(x,y,t,size,fill,font=msyh,anchor='la',bold=False):
    f=ImageFont.truetype(msyhbd if bold else font,size)
    d.text((x,y),t,font=f,fill=fill,anchor=anchor)
text(200,126,'GOLDLENS  /  TECHNICAL PLAN  /  2026',18,'#e5c46b',bold=True)
text(80,360,'GoldLens 2.0',84,'#f4f0e6',bold=True)
text(80,460,'技术方案',84,'#e5c46b',bold=True)
text(84,590,'从 MVP 到可用的现代黄金决策平台',30,'#b9b6a8')
d.line((84,680,1150,680),fill=(70,68,55),width=1)
text(84,720,'Architecture   ·   Data   ·   Experience   ·   Delivery',18,'#a9a99c')
text(84,760,'Version 1.0  ·  Proposed  ·  2026-10-23',18,'#74786c')
text(84,1370,'设计原则',18,'#e5c46b',bold=True)
text(84,1412,'先把身份、数据与报价网络补齐，',36,'#f4f0e6',bold=True)
text(84,1462,'再把界面做漂亮。',36,'#e5c46b',bold=True)
text(84,1530,'模块化单体 · 纯领域核心 · 可追溯价格 · 本地优先同步',22,'#a9a99c')
text(84,1620,'Prepared for founder / engineering / design review',16,'#74786c')
img.save('docs/diagrams/tech-cover.png')
print('cover done')
