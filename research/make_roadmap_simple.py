import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
from matplotlib.patches import FancyBboxPatch, FancyArrowPatch
plt.rcParams['font.sans-serif']=['Microsoft YaHei','SimHei']
plt.rcParams['axes.unicode_minus']=False
BG='#FBFAF6'; INK='#1D211C'; MUT='#687066'; GOLD='#B8892E'
fig,ax=plt.subplots(figsize=(7.4,2.9),dpi=300)
fig.patch.set_facecolor(BG); ax.set_facecolor(BG); ax.axis('off'); ax.set_xlim(0,18.6); ax.set_ylim(0,6)
ax.text(0.1,5.55,'18 周交付路线 · 四段并行推进',fontsize=10.5,color=INK,fontweight='bold')
ax.text(0.1,5.05,'阶段有重叠；每个里程碑都有可验收的出口',fontsize=6.8,color=MUT)
phases=[
 (0.1,4.4,'P0 基础','W1–4','Monorepo · core · DB','#DDE4EA'),
 (4.7,4.4,'P1 消费端','W3–8','账户 · 同步 · 提醒','#E4EDE6'),
 (9.3,4.4,'P2 Dealer','W7–13','门户 · 报价 · 订阅','#F1EDE1'),
 (13.9,4.4,'P3 规模化','W11–18','UAE/India · 加固','#F2E5DF'),
]
for x,w,name,weeks,sub,c in phases:
    ax.add_patch(FancyBboxPatch((x,2.05),w,2.0,boxstyle='round,pad=0.03,rounding_size=0.12',facecolor=c,edgecolor='#CFC7B4',linewidth=0.8))
    ax.text(x+0.18,3.55,name,fontsize=9.2,color=INK,fontweight='bold',va='center')
    ax.text(x+w-0.18,3.55,weeks,fontsize=7.4,color=GOLD,ha='right',va='center')
    ax.text(x+0.18,2.75,sub,fontsize=6.9,color=MUT,va='center')
for i in range(3):
    arrow=FancyArrowPatch((phases[i][0]+phases[i][1]+0.02,3.05),(phases[i+1][0]-0.02,3.05),arrowstyle='-|>',mutation_scale=9,linewidth=1.0,color=GOLD)
    ax.add_patch(arrow)
ax.plot([0.2,18.4],[1.45,1.45],color='#D8D2C2',linewidth=0.8)
ax.text(0.2,0.75,'W6 账户+同步',fontsize=7.0,color=GOLD)
ax.text(4.9,0.75,'W10 Dealer 试点',fontsize=7.0,color=GOLD)
ax.text(9.4,0.75,'W14 支付 + Admin',fontsize=7.0,color=GOLD)
ax.text(14.2,0.75,'W18 公开发布',fontsize=7.0,color=GOLD)
fig.savefig('docs/diagrams/roadmap-simple.png',bbox_inches='tight',facecolor=BG); plt.close(fig)
print('roadmap simple')
