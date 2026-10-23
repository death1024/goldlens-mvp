import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
from matplotlib.patches import FancyBboxPatch, FancyArrowPatch
import os
plt.rcParams['font.sans-serif']=['Microsoft YaHei','SimHei']
plt.rcParams['axes.unicode_minus']=False
BG='#FBFAF6'; INK='#1D211C'; MUT='#687066'; GOLD='#B8892E'
C1='#F1EDE1'; C2='#E4EDE6'; C3='#E3EAF0'; C4='#F2E5DF'; C5='#E8E4D8'
OUT='docs/diagrams'; os.makedirs(OUT,exist_ok=True)

def box(ax,x,y,w,h,title,sub='',c=C1,ts=8.4,ss=6.6):
    ax.add_patch(FancyBboxPatch((x,y),w,h,boxstyle='round,pad=0.18,rounding_size=0.9',facecolor=c,edgecolor='#CFC7B4',linewidth=0.8))
    ax.text(x+w/2,y+h*0.64 if sub else y+h/2,title,ha='center',va='center',fontsize=ts,color=INK,fontweight='bold')
    if sub: ax.text(x+w/2,y+h*0.28,sub,ha='center',va='center',fontsize=ss,color=MUT)

def arrow(ax,x1,y1,x2,y2,color=GOLD,lw=1.0,ls='-'):
    ax.add_patch(FancyArrowPatch((x1,y1),(x2,y2),arrowstyle='-|>',mutation_scale=9,linewidth=lw,color=color,linestyle=ls,shrinkA=2,shrinkB=2))

# architecture v1.1 layered
fig,ax=plt.subplots(figsize=(12.4,7.3),dpi=220)
fig.patch.set_facecolor(BG); ax.set_facecolor(BG); ax.set_xlim(0,120); ax.set_ylim(0,70); ax.axis('off')
ax.text(2,67.2,'GoldLens 2.1 · Experience-first 架构',fontsize=17,color=INK,fontweight='bold')
ax.text(6,64.3,'用 PPR/RSC、Local-first、AI Gateway 与 durable workflows，把“快、稳、聪明”做成默认能力',fontsize=7.8,color=MUT)
# band labels
for y,label in [(57,'EXPERIENCE'),(41,'APPLICATION'),(25,'DATA'),(8,'ASYNC & INTEGRATIONS')]:
    ax.text(2,y+0.3,label,fontsize=6.6,color=GOLD,fontweight='bold',rotation=90,va='bottom')
# experience
box(ax,8,54.5,24,7.5,'Consumer Web / PWA','Next.js 16 · RSC · PPR · View Transitions',C3,ts=8.8)
box(ax,34,54.5,20,7.5,'Native Shell','Expo · 共享 core',C3,ts=8.8)
box(ax,56,54.5,20,7.5,'Dealer Portal','报价 · 线索 · 履约',C1,ts=8.8)
box(ax,78,54.5,18,7.5,'Admin','规则 · 审核 · 客服',C1,ts=8.8)
box(ax,98,54.5,19,7.5,'AI Copilot','自然语言 · 扫描',C4,ts=8.8)
# application
box(ax,8,38.5,21,7.5,'Vercel Edge','CDN · WAF · Turnstile',C3)
box(ax,31,38.5,26,7.5,'Next.js RSC / PPR','Server Components · Cache',C3)
box(ax,59,38.5,22,7.5,'Server Actions / API','Zod 4 · OpenAPI · idempotency',C3)
box(ax,83,38.5,17,7.5,'AI Gateway','SDK 6 · fallback · cache',C4)
box(ax,102,38.5,15,7.5,'Auth / Passkeys','WebAuthn · RBAC',C3)
# data
box(ax,8,22.5,22,7.5,'PostgreSQL 18','Neon · Drizzle · PITR',C2)
box(ax,32,22.5,22,7.5,'ElectricSQL','shape sync · read model',C2)
box(ax,56,22.5,18,7.5,'Redis','cache · rate limit · SSE',C2)
box(ax,76,22.5,18,7.5,'R2','receipts · exports',C2)
box(ax,96,22.5,21,7.5,'Analytics / Events','PostHog · OTel',C5)
# async integrations
box(ax,8,5,23,7.5,'Inngest','durable workflows · cron',C4,ts=8.8)
box(ax,33,5,20,7.5,'Market feeds','Gold · FX · GTA',C1)
box(ax,55,5,20,7.5,'Dealer feeds','portal · CSV · API',C1)
box(ax,77,5,18,7.5,'Stripe / Omise','subscriptions',C1)
box(ax,97,5,21,7.5,'Resend / LINE / WA','notifications',C1)
# arrows
arrow(ax,60,54.2,60,46.3,lw=1.6)
arrow(ax,60,38.2,60,30.3,lw=1.6)
arrow(ax,60,22.2,60,12.8,color='#8C9083',lw=1.0,ls='--')
ax.text(61,50.0,'HTTPS · RSC · Server Actions',fontsize=6.2,color=MUT)
ax.text(61,34.0,'SQL · cache · shape',fontsize=6.2,color=MUT)
ax.text(61,17.3,'events / cron / webhooks',fontsize=6.2,color=MUT)
# Inngest to app/data
arrow(ax,19.5,12.7,19.5,22.3,color='#8C9083',lw=0.8,ls='--')
arrow(ax,31,12.7,31,22.3,color='#8C9083',lw=0.8,ls='--')
fig.savefig(f'{OUT}/architecture-v11.png',bbox_inches='tight',facecolor=BG); plt.close(fig)

# sync flow
fig,ax=plt.subplots(figsize=(10.2,4.4),dpi=240)
fig.patch.set_facecolor(BG); ax.set_facecolor(BG); ax.set_xlim(0,110); ax.set_ylim(0,42); ax.axis('off')
ax.text(2,39,'Local-first 读写路径 · 读即时、写可回放、离线可用',fontsize=12.5,color=INK,fontweight='bold')
ax.text(2,36.2,'公有价格/报价走 Electric shape；私有持仓/提醒走 Server Action + outbox',fontsize=6.8,color=MUT)
# read row
ax.text(2,29.5,'READ',fontsize=6.6,color=GOLD,fontweight='bold')
read=[(10,25,'Postgres','source of truth'),(30,25,'ElectricSQL','shape sync'),(50,25,'IndexedDB','local cache'),(70,25,'UI','instant render'),(90,25,'SSE / Redis','live ticks')]
for x,y,t,s in read:
    box(ax,x,y,17,6.2,t,s,C2,ts=8.0,ss=6.0)
for i in range(len(read)-1):
    arrow(ax,read[i][0]+17,28.1,read[i+1][0]-0.2,28.1)
# write row
ax.text(2,17.5,'WRITE',fontsize=6.6,color=GOLD,fontweight='bold')
write=[(10,13,'User action','tap/save'),(30,13,'Optimistic UI','local update'),(50,13,'Outbox','IndexedDB queue'),(70,13,'Server Action','validate + idempotency'),(90,13,'Postgres','commit')]
for x,y,t,s in write:
    box(ax,x,y,17,6.2,t,s,C4,ts=8.0,ss=6.0)
for i in range(len(write)-1):
    arrow(ax,write[i][0]+17,16.1,write[i+1][0]-0.2,16.1)
# loop back
arrow(ax,98.5,19.2,98.5,25.0,color='#8C9083',lw=0.9,ls='--')
ax.text(2,4.5,'离线：outbox 排队 → 网络恢复重放；冲突以服务端版本为准；私有数据不进入公共 shape',fontsize=6.6,color=MUT)
fig.savefig(f'{OUT}/sync-flow.png',bbox_inches='tight',facecolor=BG); plt.close(fig)

# cover
W,H=1240,1754
from PIL import Image, ImageDraw, ImageFont
img=Image.new('RGB',(W,H),'#0a0c0b'); d=ImageDraw.Draw(img)
for y in range(0,H,80): d.line((0,y,W,y),fill=(18,20,17),width=1)
for r in range(560,10,-6):
    a=max(0,int(18*(1-r/560)**2)); d.ellipse((W-180-r,300-r,W-180+r,300+r),outline=(10+a,9+int(a*.75),7+int(a*.35)),width=2)
cx,cy,s=150,150,34
d.polygon([(cx,cy-s),(cx+s,cy),(cx,cy+s),(cx-s,cy)],outline='#e5c46b',width=2)
d.line((cx-s,cy,cx+s,cy),fill='#e5c46b',width=1); d.line((cx,cy-s,cx,cy+s),fill='#e5c46b',width=1)
msyh='C:/Windows/Fonts/msyh.ttc'; msyhbd='C:/Windows/Fonts/msyhbd.ttc'
def tx(x,y,t,size,fill,anchor='la',bold=False):
    d.text((x,y),t,font=ImageFont.truetype(msyhbd if bold else msyh,size),fill=fill,anchor=anchor)
tx(200,126,'GOLDLENS  /  ARCHITECTURE  /  2026',18,'#e5c46b',bold=True)
tx(80,360,'GoldLens 2.1',84,'#f4f0e6',bold=True)
tx(80,460,'体验优先架构',84,'#e5c46b',bold=True)
tx(84,590,'用最先进的 Web、Local-first 与 AI 技术，把“快、稳、聪明”做成默认能力',24,'#b9b6a8')
d.line((84,680,1150,680),fill=(70,68,55),width=1)
tx(84,720,'Experience   ·   Local-first   ·   AI-native   ·   Durable',18,'#a9a99c')
tx(84,760,'Version 1.1  ·  Proposed  ·  2026-10-23',18,'#74786c')
tx(84,1370,'优化原则',18,'#e5c46b',bold=True)
tx(84,1412,'先进技术不是堆栈，',36,'#f4f0e6',bold=True)
tx(84,1462,'是让用户感觉不到技术。',36,'#e5c46b',bold=True)
tx(84,1530,'PPR · React Compiler · ElectricSQL · Inngest · AI Gateway · Base UI',22,'#a9a99c')
tx(84,1620,'Prepared for founder / engineering / design review',16,'#74786c')
img.save(f'{OUT}/arch-cover.png')
print('arch diagrams done')
