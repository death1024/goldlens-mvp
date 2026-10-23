from PIL import Image, ImageDraw, ImageFont, ImageFilter
import os, math
os.makedirs('research/shots',exist_ok=True)
# crop hero from full screenshot
im=Image.open('research/mvp_full.png')
print('full',im.size)
hero=im.crop((0,0,1440,950))
hero.save('research/shots/hero.png')
# cover
W,H=1240,1754
img=Image.new('RGB',(W,H),'#0a0c0b')
d=ImageDraw.Draw(img)
# radial gold glow
glow=Image.new('RGB',(W,H),'#0a0c0b')
gd=ImageDraw.Draw(glow)
for r in range(700,20,-8):
    a=int(28*(1-r/700)**2)
    gd.ellipse((W-220-r,H*0.18-r,W-220+r,H*0.18+r),fill=(10+a,10+int(a*.75),8+int(a*.35)))
img=Image.blend(img,glow,0.9)
d=ImageDraw.Draw(img)
# subtle lines
for y in range(0,H,80):
    d.line((0,y,W,y),fill=(18,20,17),width=1)
# diamond
cx,cy,s=150,150,34
d.polygon([(cx,cy-s),(cx+s,cy),(cx,cy+s),(cx-s,cy)],outline='#e5c46b',width=2)
d.line((cx-s,cy,cx+s,cy),fill='#e5c46b',width=1)
d.line((cx,cy-s,cx,cy+s),fill='#e5c46b',width=1)
# fonts
msyh='C:/Windows/Fonts/msyh.ttc'; msyhbd='C:/Windows/Fonts/msyhbd.ttc'; msyhl='C:/Windows/Fonts/msyhl.ttc'
f_small=ImageFont.truetype(msyh,20)
f_kicker=ImageFont.truetype(msyhbd,18)
f_title=ImageFont.truetype(msyhbd,78)
f_title2=ImageFont.truetype(msyhbd,78)
f_sub=ImageFont.truetype(msyh,28)
f_meta=ImageFont.truetype(msyh,18)
f_num=ImageFont.truetype(msyhbd,22)
def text(x,y,s,font,fill='#f4f0e6',anchor='la'):
    d.text((x,y),s,font=font,fill=fill,anchor=anchor)
text(200,126,'GOLDLENS RESEARCH  /  2026',f_kicker,'#e5c46b')
text(80,360,'从热搜到买单',f_title,'#f4f0e6')
text(80,455,'黄金购买决策的机会与 MVP',f_title2,'#e5c46b')
text(84,590,'Google Trends 应用机会研究 · 泰国 / 阿联酋 / 印度',f_sub,'#b9b6a8')
d.line((84,680,1150,680),fill=(70,68,55),width=1)
text(84,720,'33 个地区   ·   330 条热搜   ·   9 款竞品   ·   1 个可运行 MVP',f_meta,'#a9a99c')
text(84,760,'数据采样：2026-10-23 13:19–13:40（Asia/Shanghai）',f_meta,'#74786c')
# bottom block
d.rectangle((84,1330,1150,1332),fill=(70,68,55))
text(84,1370,'核心判断',f_kicker,'#e5c46b')
text(84,1412,'黄金不是最热的关键词，却是最值得做的“决策工具”。',ImageFont.truetype(msyhbd,34),'#f4f0e6')
text(84,1462,'用户不缺一个看价格的 App，缺的是一张把工费、税费和回购折价算清楚的账单。',ImageFont.truetype(msyh,22),'#a9a99c')
text(84,1620,'2026 年 10 月 23 日',f_meta,'#74786c')
text(1150,1620,'Prepared for founding team / product review',f_meta,'#74786c',anchor='ra')
img.save('research/shots/cover.png')
print('cover',img.size)
