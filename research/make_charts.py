import json, matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import matplotlib.dates as mdates
from matplotlib.ticker import FuncFormatter
from datetime import datetime
import numpy as np

plt.rcParams['font.sans-serif']=['Microsoft YaHei','SimHei']
plt.rcParams['axes.unicode_minus']=False
plt.rcParams['font.size']=10
BG='#FBF9F3'; INK='#1B1D18'; MUT='#6F7468'; GOLD='#B8892E'; GOLD2='#E1C27E'; DARK='#2C2F27'; RED='#B45F4D'; GREEN='#5E7F63'; GRID='#E4DFD2'
OUT='research/charts'
import os; os.makedirs(OUT,exist_ok=True)

def style(ax):
    ax.set_facecolor(BG)
    for s in ['top','right','left','bottom']: ax.spines[s].set_visible(False)
    ax.tick_params(colors=MUT, labelsize=9, length=0)
    ax.grid(axis='x', color=GRID, linewidth=.8, alpha=.8)
    ax.set_axisbelow(True)

# 1 theme frequency
themes=[('体育 / 篮球',36,19),('金融 / 宏观',30,16),('影视 / 明星',27,19),('天气 / 灾害',25,11),('足球',20,9),('健康 / 医疗',4,4),('AI / 科技',8,6),('黄金 / 贵金属',5,4),('iPhone / 折叠屏',5,5),('时区 / 夏令时',3,3)]
themes=sorted(themes,key=lambda x:x[1])
labels=[t[0] for t in themes]; hits=[t[1] for t in themes]; regs=[t[2] for t in themes]
fig,ax=plt.subplots(figsize=(10,5.4),dpi=200)
y=np.arange(len(labels)); h=.34
colors=[GOLD if '黄金' in l else '#C9C4B6' for l in labels]
colors2=[DARK if '黄金' in l else '#8C9083' for l in labels]
ax.barh(y+h/2,hits,height=h,color=colors,label='热搜条目数')
ax.barh(y-h/2,regs,height=h,color=colors2,alpha=.85,label='覆盖地区数')
for i,(a,b) in enumerate(zip(hits,regs)):
    ax.text(a+1,y[i]+h/2,str(a),va='center',fontsize=8,color=MUT)
    ax.text(b+1,y[i]-h/2,str(b),va='center',fontsize=8,color=MUT)
ax.set_yticks(y); ax.set_yticklabels(labels)
ax.set_xlim(0,42); ax.set_xlabel('数量（条 / 个地区）',color=MUT,fontsize=9)
ax.legend(loc='lower right',frameon=False,fontsize=9)
ax.set_title('330 条热搜里，体育和天气占据注意力，黄金是少数“高价值低频词”',loc='left',fontsize=14,color=INK,pad=16,fontweight='bold')
ax.text(0,1.02,'Google Trends Daily Search Trends · 33 个地区 · 2026-10-23 采样',transform=ax.transAxes,fontsize=9,color=MUT)
style(ax); ax.grid(axis='y',visible=False)
fig.tight_layout(); fig.savefig(f'{OUT}/themes.png',facecolor=BG,bbox_inches='tight'); plt.close(fig)

# 2 regional interest
reg=[('阿联酋',95),('卡塔尔',90),('黎巴嫩',85),('尼泊尔',76),('新加坡',75),('印度',70),('巴基斯坦',68),('沙特阿拉伯',37),('马来西亚',31),('美国',21)]
labels=[r[0] for r in reg][::-1]; vals=[r[1] for r in reg][::-1]
fig,ax=plt.subplots(figsize=(9,4.6),dpi=200)
bars=ax.barh(labels,vals,color=[GOLD if v>=68 else '#C9C4B6' for v in vals],height=.58)
for b,v in zip(bars,vals): ax.text(v+1.5,b.get_y()+b.get_height()/2,str(v),va='center',fontsize=9,color=MUT)
ax.set_xlim(0,108); ax.set_xlabel('Google Trends 相对热度（0–100）',color=MUT,fontsize=9)
ax.set_title('英文“gold price”搜索热度：海湾与南亚是密度最高的市场',loc='left',fontsize=14,color=INK,pad=16,fontweight='bold')
ax.text(0,1.02,'12 个月 · 全球 · 按国家/地区归一化；仅代表英文查询，未含本地语言词',transform=ax.transAxes,fontsize=9,color=MUT)
style(ax); ax.grid(axis='y',visible=False)
fig.tight_layout(); fig.savefig(f'{OUT}/regional.png',facecolor=BG,bbox_inches='tight'); plt.close(fig)

# 3 gold price 1y
d=json.load(open('data/gold_history.json'))
rows=d['rows']; dates=[datetime.strptime(x['date'],'%Y-%m-%d') for x in rows]; vals=[x['close'] for x in rows]
fig,ax=plt.subplots(figsize=(10,4.8),dpi=200)
ax.plot(dates,vals,color=GOLD,linewidth=1.8)
ax.fill_between(dates,vals,min(vals)-80,color=GOLD,alpha=.10)
imax=int(np.argmax(vals)); imin=int(np.argmin(vals)); ilast=len(vals)-1
for idx,label,color,off,ha in [(imax,'52 周收盘高 '+f'{vals[imax]:,.0f}',DARK,(18,24),'left'),(ilast,'当前 '+f'{vals[ilast]:,.0f}',GOLD,(-10,30),'right')]:
    ax.scatter([dates[idx]],[vals[idx]],s=28,color=color,zorder=5)
    ax.annotate(label,(dates[idx],vals[idx]),xytext=off,textcoords='offset points',ha=ha,fontsize=8.5,color=color)
ax.scatter([dates[imin]],[vals[imin]],s=28,color=DARK,zorder=5)
ax.set_ylim(min(vals)-140,max(vals)+260)
ax.yaxis.set_major_formatter(FuncFormatter(lambda x,p:f'{x:,.0f}'))
ax.xaxis.set_major_locator(mdates.MonthLocator(interval=2)); ax.xaxis.set_major_formatter(mdates.DateFormatter('%m/%y'))
ax.set_ylabel('USD / oz',color=MUT,fontsize=9)
ax.set_title('黄金不是一条直线：过去一年从 3,961 走到 5,318，再回落 24%',loc='left',fontsize=14,color=INK,pad=16,fontweight='bold')
ax.text(0,1.02,'COMEX 黄金主力连续合约日收盘 · 2025-10-23 至 2026-10-23',transform=ax.transAxes,fontsize=9,color=MUT)
style(ax)
fig.tight_layout(); fig.savefig(f'{OUT}/gold_price.png',facecolor=BG,bbox_inches='tight'); plt.close(fig)

# 4 opportunity matrix
items=[
 ('黄金购买决策',3,4.5,5,'gold'),
 ('天气 / 灾害',1,3.6,5,'gray'),
 ('体育比分',1,3.6,5,'gray'),
 ('膳食计划',2,3.5,4,'gray'),
 ('蛋白 / 健康追踪',2,3.2,3,'gray'),
 ('WhatsApp 兼容工具',4,3.1,4,'gray'),
 ('时区 / 睡眠',3,3.05,3,'gray'),
 ('AI 室内设计 / 试穿',2,2.9,3,'gray'),
 ('AI 职业头像',2,2.8,3,'gray'),
 ('折叠屏适配',3,2.65,3,'gray'),
]
fig,ax=plt.subplots(figsize=(9.6,6.2),dpi=200)
for name,x,y,size,kind in items:
    color=GOLD if kind=='gold' else '#A8AC9F'
    ax.scatter(x,y,s=size*95,color=color,alpha=.95 if kind=='gold' else .7,edgecolor=BG,linewidth=2,zorder=4)
    offsets={
        '黄金购买决策':(0.16,0.03,'left'),
        '天气 / 灾害':(-0.15,0.12,'right'),
        '体育比分':(-0.15,-0.17,'right'),
        '膳食计划':(0.15,0.06,'left'),
        '蛋白 / 健康追踪':(-0.15,0.0,'right'),
        'WhatsApp 兼容工具':(-0.15,-0.20,'right'),
        '时区 / 睡眠':(0.15,0.05,'left'),
        'AI 室内设计 / 试穿':(-0.15,0.12,'right'),
        'AI 职业头像':(-0.15,-0.10,'right'),
        '折叠屏适配':(0.15,-0.12,'left'),
    }
    dx,dy,ha=offsets[name]
    ax.annotate(name,(x,y),xytext=(x+dx,y+dy),fontsize=8.5,color=INK if kind=='gold' else MUT,fontweight='bold' if kind=='gold' else 'normal',ha=ha)
ax.axvline(3,color=GRID,linewidth=1,linestyle='--'); ax.axhline(3.3,color=GRID,linewidth=1,linestyle='--')
ax.text(4.85,4.62,'优先进入',ha='right',fontsize=9,color=GOLD)
ax.text(1.1,4.62,'高需求但红海',ha='left',fontsize=9,color=MUT)
ax.text(1.1,2.45,'不建议作为创业切口',ha='left',fontsize=9,color=MUT)
ax.text(4.85,2.45,'可观察 / 工具型',ha='right',fontsize=9,color=MUT)
ax.set_xlim(.6,5.2); ax.set_ylim(2.3,4.8)
ax.set_xlabel('竞争空隙（1 = 红海，5 = 空白）',color=MUT,fontsize=9)
ax.set_ylabel('机会分（需求 30% / 持续性 25% / 竞争 20% / 可构建 15% / 变现 10%）',color=MUT,fontsize=8.5)
ax.set_title('机会矩阵：黄金不是最热的关键词，却是最适合切进去的',loc='left',fontsize=14,color=INK,pad=16,fontweight='bold')
ax.text(0,1.02,'气泡大小 = 需求强度；评分为分析师打分，非市场预测',transform=ax.transAxes,fontsize=9,color=MUT)
style(ax); ax.grid(True,color=GRID,linewidth=.7,alpha=.7)
fig.tight_layout(); fig.savefig(f'{OUT}/matrix.png',facecolor=BG,bbox_inches='tight'); plt.close(fig)

# 5 waterfall
labels=['金料\n64,200','金饰溢价\n+800','柜台标价\n65,000','回购折价\n−2,283','即时回购\n62,717']
fig,ax=plt.subplots(figsize=(10,4.6),dpi=200)
# manual waterfall
ax.bar(0,64200,color=GOLD,width=.62)
ax.bar(1,800,bottom=64200,color='#8C9083',width=.62)
ax.bar(2,65000,color=DARK,width=.62)
ax.bar(3,-2283,bottom=65000,color=RED,width=.62)
ax.bar(4,62717,color=GREEN,width=.62)
for i,(lab,val) in enumerate(zip(labels,[64200,800,65000,-2283,62717])):
    ypos=65000+1200 if i in (0,1,2) else 63500
    if i==3: ypos=62100
    if i==4: ypos=63500
    ax.text(i,ypos,lab,ha='center',va='bottom',fontsize=8.5,color=INK)
ax.plot([-.4,1.4],[64200,64200],color=GOLD,linewidth=.8,linestyle=':')
ax.plot([1.6,2.4],[65000,65000],color=DARK,linewidth=.8,linestyle=':')
ax.plot([2.6,3.4],[65000,65000],color=RED,linewidth=.8,linestyle=':')
ax.plot([3.6,4.4],[62717,62717],color=GREEN,linewidth=.8,linestyle=':')
ax.annotate('隐形成本 2,283 THB\n占标价 3.5%',xy=(3,63800),xytext=(3.0,67000),ha='center',fontsize=9,color=RED,arrowprops=dict(arrowstyle='->',color=RED,lw=1))
ax.set_ylim(58000,69000); ax.set_xticks([]); ax.set_ylabel('THB / 单位（15.244g）',color=MUT,fontsize=9)
ax.yaxis.set_major_formatter(FuncFormatter(lambda x,p:f'{x:,.0f}'))
ax.set_title('泰国 1 单位金饰的真实账单：标价 65,000，转身只值 62,717',loc='left',fontsize=14,color=INK,pad=16,fontweight='bold')
ax.text(0,1.02,'GTA 2026-10-23 12:11 公告价 · 96.5% 金饰 · 未计佩戴损耗',transform=ax.transAxes,fontsize=9,color=MUT)
style(ax); ax.grid(axis='y',color=GRID,linewidth=.7,alpha=.8); ax.grid(axis='x',visible=False)
fig.tight_layout(); fig.savefig(f'{OUT}/breakdown.png',facecolor=BG,bbox_inches='tight'); plt.close(fig)
print('charts done')
