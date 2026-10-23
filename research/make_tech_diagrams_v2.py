import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
from matplotlib.patches import FancyBboxPatch, FancyArrowPatch
import os

plt.rcParams['font.sans-serif']=['Microsoft YaHei','SimHei']
plt.rcParams['axes.unicode_minus']=False
BG='#FBFAF6'; INK='#1D211C'; MUT='#687066'; GOLD='#B8892E'; LINE='#D8D2C2'
C1='#F1EDE1'; C2='#E4EDE6'; C3='#E3EAF0'; C4='#F2E5DF'
OUT='docs/diagrams'; os.makedirs(OUT,exist_ok=True)

def canvas(w=12,h=7):
    fig,ax=plt.subplots(figsize=(w,h),dpi=200)
    fig.patch.set_facecolor(BG); ax.set_facecolor(BG)
    ax.set_xlim(0,120); ax.set_ylim(0,70); ax.axis('off')
    return fig,ax

def box(ax,x,y,w,h,title,sub='',fill=C1,edge='#CFC7B4',tsize=10,ssize=7.8,title_color=INK):
    p=FancyBboxPatch((x,y),w,h,boxstyle='round,pad=0.25,rounding_size=1.2',linewidth=1,edgecolor=edge,facecolor=fill)
    ax.add_patch(p)
    ax.text(x+w/2,y+h*0.64 if sub else y+h/2,title,ha='center',va='center',fontsize=tsize,color=title_color,fontweight='bold')
    if sub:
        ax.text(x+w/2,y+h*0.30,sub,ha='center',va='center',fontsize=ssize,color=MUT,linespacing=1.35)

def arrow(ax,x1,y1,x2,y2,color=GOLD,lw=1.4,style='-|>',ls='-'):
    a=FancyArrowPatch((x1,y1),(x2,y2),arrowstyle=style,mutation_scale=13,linewidth=lw,color=color,linestyle=ls,shrinkA=3,shrinkB=3)
    ax.add_patch(a)

# ---------- architecture ----------
fig,ax=canvas(12.4,7.2)
ax.text(3,66.5,'GoldLens 2.0 · 目标架构',fontsize=17,color=INK,fontweight='bold')
ax.text(3,63.6,'模块化单体 + 独立数据 worker；先支撑 1–10 万 MAU，再拆服务',fontsize=8.5,color=MUT)
for x,t in [(3,'EXPERIENCE'),(32,'EDGE & APPLICATION'),(76,'DATA & ASYNC')]:
    ax.text(x,59.8,t,fontsize=7.5,color=GOLD,fontweight='bold')
box(ax,3,45,24,11.5,'Consumer Web / PWA','Next.js · React 19 · Tailwind',C1)
box(ax,3,31,24,11.5,'Dealer Portal','报价 · 线索 · 门店 · 分析',C1)
box(ax,3,17,24,11.5,'Admin Console','市场规则 · 数据源 · 审核 · 客服',C1)
box(ax,32,47,20,10.5,'Vercel Edge','CDN · WAF · A/B',C3)
box(ax,55,47,20,10.5,'Next.js BFF','RSC · Route Handlers · SSE',C3)
box(ax,32,33,20,10.5,'Auth.js + RBAC','Google/Apple/Email · Passkey',C3)
box(ax,55,33,20,10.5,'API v1','Zod · OpenAPI · Idempotency',C3)
box(ax,76,47,19,10.5,'PostgreSQL 17','Neon · Drizzle · PITR',C2)
box(ax,98,47,19,10.5,'Redis','Upstash · cache · rate limit',C2)
box(ax,76,33,19,10.5,'Queue','QStash / BullMQ · DLQ',C2)
box(ax,98,33,19,10.5,'Object Storage','Cloudflare R2 · 收据/报告',C2)
ax.text(32,28.8,'DOMAIN CORE & WORKERS',fontsize=7.5,color=GOLD,fontweight='bold')
box(ax,32,18,19,8.8,'@goldlens/core','单位 · 纯度 · 成本 · 回购',C4,tsize=8.8,ssize=7)
box(ax,53,18,19,8.8,'Quote service','请求 · 分发 · 排名',C4,tsize=8.8,ssize=7)
box(ax,74,18,19,8.8,'Alert service','调度 · 去重 · 通知',C4,tsize=8.8,ssize=7)
box(ax,95,18,22,8.8,'Ingestion worker','抓取 · 校验 · 归一化',C4,tsize=8.8,ssize=7)
ax.text(3,14.2,'INTEGRATIONS',fontsize=7.5,color=GOLD,fontweight='bold')
ints=[(3,'Gold / FX / GTA'),(22,'Dealer feeds / CSV'),(43,'Stripe / Omise'),(64,'Resend / LINE / WA'),(88,'Sentry / PostHog')]
for x,t in ints:
    box(ax,x,5,17,7.4,t,'',C1,tsize=7.8)
# primary request path
arrow(ax,27,51,32,51); arrow(ax,27,37,32,37); arrow(ax,27,23,32,23)
arrow(ax,52,52,55,52); arrow(ax,52,38,55,38)
arrow(ax,75,52,76,52); arrow(ax,75,38,76,38)
# domain / async links (dashed = async/event)
arrow(ax,64.5,33,64.5,27,color='#8C9083',lw=1.1,ls='--')
arrow(ax,95,23,98,33,color='#8C9083',lw=1.1,ls='--')
arrow(ax,20,12.4,100,18,color='#8C9083',lw=1.1,ls='--')
arrow(ax,100,18,30,12.4,color='#8C9083',lw=1.1,ls='--')
ax.text(44,15.2,'数据接入 / 通知 / 支付',fontsize=7.2,color=MUT)
fig.savefig(f'{OUT}/architecture.png',bbox_inches='tight',facecolor=BG); plt.close(fig)

# ---------- data model ----------
fig,ax=canvas(12.4,7.6)
ax.text(3,66.5,'核心数据模型 · 以“可追溯的价格”为中心',fontsize=17,color=INK,fontweight='bold')
ax.text(3,63.6,'价格快照保留来源、时间、置信度；报价保留有效期与验证状态',fontsize=8.5,color=MUT)
# top
box(ax,40,50,20,9,'users','id · email · locale',C3,tsize=9,ssize=6.8)
box(ax,64,50,19,9,'profiles','user_id · market · goal',C3,tsize=9,ssize=6.8)
box(ax,88,50,19,9,'subscriptions','user_id · plan · status',C3,tsize=9,ssize=6.8)
# market/price
box(ax,3,37,18,9,'markets','code · currency · tax_rule',C1,tsize=9,ssize=6.8)
box(ax,24,37,20,9,'price_snapshots','market · source · price · at',C2,tsize=9,ssize=6.8)
# dealers
box(ax,48,37,19,9,'dealers','name · status · city',C1,tsize=9,ssize=6.8)
box(ax,70,37,19,9,'dealer_branches','dealer_id · geo · hours',C1,tsize=9,ssize=6.8)
# quote
box(ax,24,23,19,9,'quote_requests','user · market · weight',C4,tsize=9,ssize=6.8)
box(ax,48,23,19,9,'dealer_quotes','purity · buy/sell · expires',C4,tsize=9,ssize=6.8)
box(ax,70,23,19,9,'quote_rankings','quote_id · score · reasons',C4,tsize=9,ssize=6.8)
# bottom
box(ax,40,9,19,9,'holdings','user · grams · cost · dealer',C2,tsize=9,ssize=6.8)
box(ax,64,9,19,9,'alerts','user · metric · threshold',C2,tsize=9,ssize=6.8)
box(ax,88,9,19,9,'audit_logs','actor · action · before/after',C1,tsize=9,ssize=6.8)
box(ax,3,9,18,9,'content_pages','slug · locale · SEO',C1,tsize=9,ssize=6.8)
# arrows
arrow(ax,60,54.5,64,54.5)
arrow(ax,83,54.5,88,54.5)
arrow(ax,21,41.5,24,41.5)
arrow(ax,67,41.5,70,41.5)
arrow(ax,57.5,37,57.5,32)
arrow(ax,43,27.5,48,27.5)
arrow(ax,67,27.5,70,27.5)
ax.text(30,33.5,'1 request → N quotes',fontsize=6.8,color=MUT)
ax.text(74,32.0,'ranked / refreshed',fontsize=6.8,color=MUT)
ax.text(3,2.0,'省略部分外键连线：holdings.user_id / alerts.user_id / dealer_quotes.dealer_id',fontsize=6.4,color=MUT)
fig.savefig(f'{OUT}/data-model.png',bbox_inches='tight',facecolor=BG); plt.close(fig)

# ---------- quote flow ----------
fig,ax=canvas(11.6,7.4)
ax.text(3,67,'报价请求流程 · 从“算一笔”到“拿到可比较的报价”',fontsize=17,color=INK,fontweight='bold')
ax.text(3,64,'所有报价带有效期、来源与验证状态；排名不按佣金',fontsize=8.5,color=MUT)
steps=[
 ('1','用户选择市场 / 纯度 / 重量','Web / PWA'),
 ('2','POST /v1/quote-requests','Next.js BFF'),
 ('3','校验 + 写入 + 入队','Postgres / Queue'),
 ('4','按城市/品类分发给已验证 dealer','Worker'),
 ('5','Dealer 在门户提交报价','Dealer Portal'),
 ('6','归一化 + 排名 + 过期检查','Quote service'),
 ('7','用户看到对比，选择到店/联系','Web / LINE'),
]
y=58.5
for i,(num,title,sub) in enumerate(steps):
    box(ax,14,y-5.2,84,4.6,f'{num}  {title}',sub,C3 if i%2==0 else C1,tsize=9.2,ssize=7.4)
    if i<len(steps)-1:
        arrow(ax,56,y-5.5,56,y-7.0,style='-|>')
    y-=7.0
for yy,label in [(56,'USER'),(49,'WEB'),(42,'API/DB'),(35,'WORKER'),(28,'DEALER'),(21,'SERVICE'),(14,'USER')]:
    ax.text(4,yy+1.4,label,fontsize=6.8,color=GOLD,fontweight='bold')
fig.savefig(f'{OUT}/quote-flow.png',bbox_inches='tight',facecolor=BG); plt.close(fig)

# ---------- roadmap ----------
fig,ax=plt.subplots(figsize=(12.6,5.4),dpi=200)
fig.patch.set_facecolor(BG); ax.set_facecolor(BG)
ax.set_xlim(0,24); ax.set_ylim(0,8.6); ax.axis('off')
ax.text(0.2,8.2,'18 周交付路线 · 先可用，再联网，再规模化',fontsize=17,color=INK,fontweight='bold')
ax.text(0.2,7.8,'第 6 / 10 / 14 / 18 周为关键门槛；每条泳道都有可验收的出口',fontsize=8.5,color=MUT)
start=5.6; weekw=0.9
rows=[
 ('Foundation',6.0,1,4,'P0 基础','#DDE4EA'),
 ('Consumer V1',5.0,3,8,'P1 消费端 V1','#E4EDE6'),
 ('Dealer Network',4.0,7,13,'P2 Dealer 网络','#F1EDE1'),
 ('Localization',3.0,11,16,'P3 本地化','#F2E5DF'),
 ('Hardening',2.0,14,18,'P4 加固','#E8E4D8'),
]
for label,y,s,e,phase,c in rows:
    ax.text(0.2,y+0.3,label,fontsize=8.2,color=INK,va='center')
    x0=start+(s-1)*weekw; x1=start+e*weekw
    ax.add_patch(FancyBboxPatch((x0,y),x1-x0,0.58,boxstyle='round,pad=0.02,rounding_size=0.08',facecolor=c,edgecolor='#CFC7B4',linewidth=0.8))
    ax.text(x0+0.12,y+0.29,phase,fontsize=7.2,color=INK,va='center',fontweight='bold')
# week ticks
for w in range(1,19):
    x=start+(w-1)*weekw
    ax.plot([x,x],[1.3,7.15],color='#ECE6D8',lw=0.6,zorder=0)
    if w in (1,4,7,10,13,16,18):
        ax.text(x,7.35,f'W{w}',fontsize=6.6,color=MUT,ha='center')
# milestones
for w,label in [(6,'账户+同步'),(10,'Dealer 试点'),(14,'支付+Admin'),(18,'公开发布')]:
    x=start+(w-0.5)*weekw
    ax.plot([x],[1.55],marker='D',color=GOLD,ms=6)
    ax.text(x,1.05,label,fontsize=6.6,color=GOLD,ha='center')
ax.plot([start,start+18*weekw],[1.8,1.8],color=LINE,lw=0.8)
fig.savefig(f'{OUT}/roadmap.png',bbox_inches='tight',facecolor=BG); plt.close(fig)
print('diagrams v2 done')
