# -*- coding: utf-8 -*-
import json
import os
from datetime import datetime

from docx import Document
from docx.shared import Cm, Pt, RGBColor, Emu
from docx.enum.text import WD_ALIGN_PARAGRAPH, WD_LINE_SPACING, WD_TAB_ALIGNMENT
from docx.enum.table import WD_TABLE_ALIGNMENT, WD_ALIGN_VERTICAL
from docx.enum.section import WD_SECTION
from docx.oxml import OxmlElement
from docx.oxml.ns import qn
from docx.enum.text import WD_BREAK

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CHART = os.path.join(ROOT, 'research', 'charts')
SHOT = os.path.join(ROOT, 'research', 'shots')
OUT = os.path.join(ROOT, 'GoldLens_Google_Trends_应用机会调研与MVP报告.docx')

INK = RGBColor(0x1B, 0x1D, 0x18)
MUT = RGBColor(0x6F, 0x74, 0x68)
GOLD = RGBColor(0xB8, 0x89, 0x2E)
GOLD_LIGHT = RGBColor(0xE5, 0xC4, 0x6B)
CREAM = RGBColor(0xFB, 0xF9, 0xF3)
WHITE = RGBColor(0xFF, 0xFF, 0xFF)
RED = RGBColor(0xB4, 0x5F, 0x4D)
GREEN = RGBColor(0x5E, 0x7F, 0x63)

FONT_CN = '微软雅黑'
FONT_SERIF = '宋体'

rss = json.load(open(os.path.join(ROOT, 'data', 'trends_rss_raw.json'), encoding='utf-8'))
groups = json.load(open(os.path.join(ROOT, 'data', 'trends_groups.json'), encoding='utf-8'))
history = json.load(open(os.path.join(ROOT, 'data', 'gold_history.json'), encoding='utf-8'))
fallback = json.load(open(os.path.join(ROOT, 'mvp', 'data', 'fallback.json'), encoding='utf-8'))


def set_cn_font(run, name=FONT_CN, size=None, bold=None, color=None, italic=None):
    run.font.name = name
    run._element.get_or_add_rPr().rFonts.set(qn('w:eastAsia'), name)
    if size is not None:
        run.font.size = Pt(size)
    if bold is not None:
        run.font.bold = bold
    if italic is not None:
        run.font.italic = italic
    if color is not None:
        run.font.color.rgb = color


def shade(cell, hex_color):
    tc_pr = cell._tc.get_or_add_tcPr()
    shd = OxmlElement('w:shd')
    shd.set(qn('w:fill'), hex_color)
    tc_pr.append(shd)


def cell_margins(cell, top=80, bottom=80, left=100, right=100):
    tc = cell._tc
    tcPr = tc.get_or_add_tcPr()
    tcMar = tcPr.first_child_found_in('w:tcMar')
    if tcMar is None:
        tcMar = OxmlElement('w:tcMar')
        tcPr.append(tcMar)
    for tag, value in [('w:top', top), ('w:bottom', bottom), ('w:left', left), ('w:right', right)]:
        node = tcMar.find(qn(tag))
        if node is None:
            node = OxmlElement(tag)
            tcMar.append(node)
        node.set(qn('w:w'), str(value))
        node.set(qn('w:type'), 'dxa')


def set_cell_borders(cell, color='DED8C8', size=4):
    tc_pr = cell._tc.get_or_add_tcPr()
    borders = tc_pr.first_child_found_in('w:tcBorders')
    if borders is None:
        borders = OxmlElement('w:tcBorders')
        tc_pr.append(borders)
    for edge in ['top', 'left', 'bottom', 'right']:
        tag = 'w:{}'.format(edge)
        element = borders.find(qn(tag))
        if element is None:
            element = OxmlElement(tag)
            borders.append(element)
        element.set(qn('w:val'), 'single')
        element.set(qn('w:sz'), str(size))
        element.set(qn('w:space'), '0')
        element.set(qn('w:color'), color)


def keep_with_next(paragraph, value=True):
    paragraph.paragraph_format.keep_with_next = value


def add_hyperlink(paragraph, url, text, color='B8892E', underline=True):
    part = paragraph.part
    r_id = part.relate_to(url, 'http://schemas.openxmlformats.org/officeDocument/2006/relationships/hyperlink', is_external=True)
    hyperlink = OxmlElement('w:hyperlink')
    hyperlink.set(qn('r:id'), r_id)
    new_run = OxmlElement('w:r')
    rPr = OxmlElement('w:rPr')
    c = OxmlElement('w:color')
    c.set(qn('w:val'), color)
    rPr.append(c)
    if underline:
        u = OxmlElement('w:u')
        u.set(qn('w:val'), 'single')
        rPr.append(u)
    new_run.append(rPr)
    t = OxmlElement('w:t')
    t.text = text
    new_run.append(t)
    hyperlink.append(new_run)
    paragraph._p.append(hyperlink)


def add_page_number(paragraph):
    run = paragraph.add_run()
    fldChar = OxmlElement('w:fldChar')
    fldChar.set(qn('w:fldCharType'), 'begin')
    instrText = OxmlElement('w:instrText')
    instrText.set(qn('xml:space'), 'preserve')
    instrText.text = 'PAGE'
    fldCharSep = OxmlElement('w:fldChar')
    fldCharSep.set(qn('w:fldCharType'), 'separate')
    fldChar2 = OxmlElement('w:fldChar')
    fldChar2.set(qn('w:fldCharType'), 'end')
    run._r.append(fldChar)
    run._r.append(instrText)
    run._r.append(fldCharSep)
    run._r.append(fldChar2)


def add_header_footer(section):
    section.header.is_linked_to_previous = False
    section.footer.is_linked_to_previous = False
    header = section.header
    p = header.paragraphs[0]
    p.text = ''
    p.paragraph_format.tab_stops.clear_all()
    p.paragraph_format.tab_stops.add_tab_stop(Cm(16.6), WD_TAB_ALIGNMENT.RIGHT)
    r = p.add_run('GOLDLENS RESEARCH  /  GOOGLE TRENDS 应用机会研究  /  2026.10')
    set_cn_font(r, size=7.5, bold=True, color=GOLD)
    p.paragraph_format.space_after = Pt(0)

    footer = section.footer
    fp = footer.paragraphs[0]
    fp.text = ''
    fp.alignment = WD_ALIGN_PARAGRAPH.CENTER
    r = fp.add_run('Confidential · for discussion  ·  ')
    set_cn_font(r, size=7, color=MUT)
    add_page_number(fp)


def page_number_start(section, start=1):
    sectPr = section._sectPr
    pgNumType = sectPr.find(qn('w:pgNumType'))
    if pgNumType is None:
        pgNumType = OxmlElement('w:pgNumType')
        sectPr.append(pgNumType)
    pgNumType.set(qn('w:start'), str(start))


doc = Document()

# Page setup
sec = doc.sections[0]
sec.page_width = Cm(21)
sec.page_height = Cm(29.7)
sec.left_margin = Cm(0)
sec.right_margin = Cm(0)
sec.top_margin = Cm(0)
sec.bottom_margin = Cm(0)
sec.header_distance = Cm(0)
sec.footer_distance = Cm(0)

# Normal style
normal = doc.styles['Normal']
normal.font.name = FONT_CN
normal._element.get_or_add_rPr().rFonts.set(qn('w:eastAsia'), FONT_CN)
normal.font.size = Pt(10.5)
normal.font.color.rgb = INK
normal.paragraph_format.line_spacing = 1.5
normal.paragraph_format.space_after = Pt(6)

# Cover
cover_p = doc.add_paragraph()
cover_p.alignment = WD_ALIGN_PARAGRAPH.CENTER
cover_p.paragraph_format.space_before = Pt(0)
cover_p.paragraph_format.space_after = Pt(0)
cover_p.paragraph_format.line_spacing = 1
cover_run = cover_p.add_run()
cover_run.add_picture(os.path.join(SHOT, 'cover.png'), width=Cm(21.0), height=Cm(29.65))

# Body section
body = doc.add_section(WD_SECTION.NEW_PAGE)
body.page_width = Cm(21)
body.page_height = Cm(29.7)
body.left_margin = Cm(2.2)
body.right_margin = Cm(2.2)
body.top_margin = Cm(2.25)
body.bottom_margin = Cm(2.0)
body.header_distance = Cm(0.9)
body.footer_distance = Cm(0.9)
add_header_footer(body)
page_number_start(body, 1)

CONTENT_WIDTH = 16.6


def add_part(number, title, subtitle=None):
    p = doc.add_paragraph()
    p.paragraph_format.space_before = Pt(4)
    p.paragraph_format.space_after = Pt(2)
    r = p.add_run(number)
    set_cn_font(r, name='Georgia', size=10, bold=True, color=GOLD)
    p2 = doc.add_paragraph()
    p2.paragraph_format.space_before = Pt(0)
    p2.paragraph_format.space_after = Pt(4)
    r = p2.add_run(title)
    set_cn_font(r, name=FONT_SERIF, size=24, bold=True, color=INK)
    keep_with_next(p2)
    if subtitle:
        p3 = doc.add_paragraph()
        p3.paragraph_format.space_after = Pt(12)
        r = p3.add_run(subtitle)
        set_cn_font(r, size=10, color=MUT)
        keep_with_next(p3)
    # bottom rule
    pPr = p3._p.get_or_add_pPr() if subtitle else p2._p.get_or_add_pPr()
    pBdr = OxmlElement('w:pBdr')
    bottom = OxmlElement('w:bottom')
    bottom.set(qn('w:val'), 'single')
    bottom.set(qn('w:sz'), '6')
    bottom.set(qn('w:space'), '8')
    bottom.set(qn('w:color'), 'B8892E')
    pBdr.append(bottom)
    pPr.append(pBdr)


def h2(text, number=None):
    p = doc.add_paragraph()
    p.paragraph_format.space_before = Pt(14)
    p.paragraph_format.space_after = Pt(4)
    if number:
        r = p.add_run(f'{number}  ')
        set_cn_font(r, name='Georgia', size=10, bold=True, color=GOLD)
    r = p.add_run(str(text).replace('`', ''))
    set_cn_font(r, size=13, bold=True, color=INK)
    keep_with_next(p)
    return p


def body_text(text, lead=None, size=10.5, color=INK, space_after=6, italic=False):
    p = doc.add_paragraph()
    p.paragraph_format.space_after = Pt(space_after)
    p.paragraph_format.line_spacing = 1.55
    text = str(text).replace('`', '')
    if lead:
        r = p.add_run(lead)
        set_cn_font(r, size=size, bold=True, color=color)
    r = p.add_run(text)
    set_cn_font(r, size=size, color=color, italic=italic)
    return p


def small_note(text):
    p = doc.add_paragraph()
    p.paragraph_format.space_before = Pt(2)
    p.paragraph_format.space_after = Pt(8)
    r = p.add_run(text)
    set_cn_font(r, size=8, color=MUT)
    return p


def bullets(items, size=10.5, numbered=False):
    for idx, item in enumerate(items):
        item = str(item).replace('`', '')
        if numbered:
            p = doc.add_paragraph()
            p.paragraph_format.left_indent = Cm(0.75)
            p.paragraph_format.first_line_indent = Cm(-0.45)
            p.paragraph_format.space_after = Pt(3)
            p.paragraph_format.line_spacing = 1.45
            r = p.add_run(f'{idx + 1}.  ')
            set_cn_font(r, name='Georgia', size=size, bold=True, color=GOLD)
            r = p.add_run(item)
            set_cn_font(r, size=size, color=INK)
        else:
            p = doc.add_paragraph(style='List Bullet')
            p.paragraph_format.space_after = Pt(3)
            p.paragraph_format.line_spacing = 1.45
            r = p.add_run(item)
            set_cn_font(r, size=size, color=INK)


def callout(label, text, fill='F3EBD8', border='D9C48F'):
    table = doc.add_table(rows=1, cols=1)
    table.alignment = WD_TABLE_ALIGNMENT.CENTER
    table.autofit = False
    cell = table.cell(0, 0)
    cell.width = Cm(CONTENT_WIDTH)
    shade(cell, fill)
    set_cell_borders(cell, border, 6)
    cell_margins(cell, 140, 140, 180, 180)
    p = cell.paragraphs[0]
    p.paragraph_format.space_after = Pt(2)
    r = p.add_run(label)
    set_cn_font(r, size=8, bold=True, color=GOLD)
    p2 = cell.add_paragraph()
    p2.paragraph_format.space_after = Pt(0)
    p2.paragraph_format.line_spacing = 1.45
    r = p2.add_run(text)
    set_cn_font(r, size=10, color=INK)
    doc.add_paragraph().paragraph_format.space_after = Pt(2)


def table_caption(text):
    p = doc.add_paragraph()
    p.paragraph_format.space_before = Pt(2)
    p.paragraph_format.space_after = Pt(4)
    r = p.add_run(text)
    set_cn_font(r, size=8, color=MUT)
    keep_with_next(p)


def add_table(headers, rows, widths, font_size=8.5, header_fill='1B1D18', align_center=None, row_pad=55):
    table = doc.add_table(rows=1, cols=len(headers))
    table.alignment = WD_TABLE_ALIGNMENT.CENTER
    table.autofit = False
    table.allow_autofit = False
    # widths
    for i, width in enumerate(widths):
        table.columns[i].width = Cm(width)
    hdr = table.rows[0]
    for i, header in enumerate(headers):
        cell = hdr.cells[i]
        cell.width = Cm(widths[i])
        shade(cell, header_fill)
        cell_margins(cell, 70, 70, 80, 80)
        set_cell_borders(cell, '1B1D18', 4)
        p = cell.paragraphs[0]
        p.paragraph_format.space_after = Pt(0)
        p.alignment = WD_ALIGN_PARAGRAPH.LEFT if not align_center or i not in align_center else WD_ALIGN_PARAGRAPH.CENTER
        r = p.add_run(header)
        set_cn_font(r, size=font_size, bold=True, color=WHITE)
    for ridx, row in enumerate(rows):
        cells = table.add_row().cells
        for i, value in enumerate(row):
            cell = cells[i]
            cell.width = Cm(widths[i])
            cell_margins(cell, row_pad, row_pad, 80, 80)
            set_cell_borders(cell, 'E2DCCD', 3)
            if ridx % 2 == 1:
                shade(cell, 'F8F5EC')
            p = cell.paragraphs[0]
            p.paragraph_format.space_after = Pt(0)
            p.paragraph_format.line_spacing = 1.25
            p.alignment = WD_ALIGN_PARAGRAPH.LEFT if not align_center or i not in align_center else WD_ALIGN_PARAGRAPH.CENTER
            r = p.add_run(str(value).replace('`', ''))
            set_cn_font(r, size=font_size, color=INK)
    for row in table.rows:
        trPr = row._tr.get_or_add_trPr()
        cantSplit = OxmlElement('w:cantSplit')
        trPr.append(cantSplit)
    header_trPr = table.rows[0]._tr.get_or_add_trPr()
    tblHeader = OxmlElement('w:tblHeader')
    header_trPr.append(tblHeader)
    doc.add_paragraph().paragraph_format.space_after = Pt(2)
    return table


def add_image(filename, width=16.4, caption=None):
    p = doc.add_paragraph()
    p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p.paragraph_format.space_before = Pt(6)
    p.paragraph_format.space_after = Pt(3)
    p.add_run().add_picture(os.path.join(CHART if filename.startswith('chart:') else SHOT, filename.replace('chart:', '')), width=Cm(width))
    if caption:
        cp = doc.add_paragraph()
        cp.alignment = WD_ALIGN_PARAGRAPH.LEFT
        cp.paragraph_format.space_after = Pt(10)
        r = cp.add_run(caption)
        set_cn_font(r, size=8, color=MUT)


def source_line(text):
    p = doc.add_paragraph()
    p.paragraph_format.space_before = Pt(0)
    p.paragraph_format.space_after = Pt(5)
    r = p.add_run(str(text).replace('`', ''))
    set_cn_font(r, size=7.5, color=MUT)


def page_break():
    doc.add_page_break()


# ---------------- COVER / TOC ----------------
# Cover image is already inserted. Add TOC on page after cover.
p = doc.add_paragraph()
p.paragraph_format.space_before = Pt(0)
p.paragraph_format.space_after = Pt(14)
r = p.add_run('CONTENTS')
set_cn_font(r, name='Georgia', size=9, bold=True, color=GOLD)

p = doc.add_paragraph()
p.paragraph_format.space_after = Pt(18)
r = p.add_run('目录')
set_cn_font(r, name=FONT_SERIF, size=28, bold=True, color=INK)

toc_items = [
    ('摘要', '一个反直觉的结论：黄金不是最热，但最值得做', 2),
    ('01', '研究设计与数据口径', 4),
    ('02', 'Google Trends 热搜全景', 6),
    ('03', '从关键词到场景：10 个应用机会与评分', 9),
    ('04', '赛道选择：为什么是黄金购买决策', 12),
    ('05', '竞品对标：9 款产品，四个阵营', 15),
    ('06', '产品定义：GoldLens 金价透视', 18),
    ('07', '商业模式与增长路径', 20),
    ('08', 'MVP 实现与验证', 23),
    ('09', '风险、合规与边界', 27),
    ('10', '结论与下一步', 28),
    ('附录', '数据表、方法与来源', 29),
]
for num, title, page_no in toc_items:
    p = doc.add_paragraph()
    p.paragraph_format.space_after = Pt(5)
    p.paragraph_format.tab_stops.clear_all()
    p.paragraph_format.tab_stops.add_tab_stop(Cm(1.6), WD_TAB_ALIGNMENT.LEFT)
    p.paragraph_format.tab_stops.add_tab_stop(Cm(16.6), WD_TAB_ALIGNMENT.RIGHT)
    r = p.add_run(num)
    set_cn_font(r, name='Georgia', size=8.5, bold=True, color=GOLD)
    r = p.add_run('\t')
    set_cn_font(r, size=8.5)
    r = p.add_run(title)
    set_cn_font(r, size=10.5, color=INK)
    r = p.add_run('\t' + str(page_no))
    set_cn_font(r, name='Georgia', size=9, color=MUT)


p = doc.add_paragraph()
p.paragraph_format.space_before = Pt(24)
p.paragraph_format.space_after = Pt(4)
r = p.add_run('阅读说明')
set_cn_font(r, size=8, bold=True, color=GOLD)
p = doc.add_paragraph()
p.paragraph_format.space_after = Pt(4)
r = p.add_run('本报告的数据采样于 2026 年 10 月 23 日 13:19–13:40（Asia/Shanghai）。Google Trends 的数值为相对指数，不是绝对搜索量；金价、汇率、App 评分与排名会随时间变化。报告中的商业测算均为显式假设下的情景推演，不构成投资建议。')
set_cn_font(r, size=9, color=MUT)
p.paragraph_format.line_spacing = 1.5

page_break()

# ---------------- EXEC SUMMARY ----------------
p = doc.add_paragraph()
p.paragraph_format.space_after = Pt(2)
r = p.add_run('EXECUTIVE SUMMARY')
set_cn_font(r, name='Georgia', size=9, bold=True, color=GOLD)
p = doc.add_paragraph()
p.paragraph_format.space_after = Pt(6)
r = p.add_run('一个反直觉的结论：\n黄金不是最热，但最值得做')
set_cn_font(r, name=FONT_SERIF, size=26, bold=True, color=INK)
p.paragraph_format.line_spacing = 1.12

body_text('我们抓取了 33 个地区、330 条 Google Trends 日热搜，并用 12 个月搜索兴趣、9 款竞品、泰国黄金交易协会（GTA）实时价和世界黄金协会（WGC）需求数据做了交叉验证。结论不是“哪个词最热”，而是“哪个热词背后有一个高频、可算清、可收费的任务”。')

body_text('黄金不是日热搜里最显眼的词：它只出现在 5 条热搜、4 个地区。但它是少数同时具备“高客单、强决策、可本地化、可反复查询”的消费场景。泰国单条“ราคาทองวันนี้”热度 20,000+；阿联酋的英文“gold price”相对热度 95，印度 70。用户不是想看一条曲线，而是想知道：现在买，到底有没有买贵。')

callout('核心判断', '黄金赛道缺的不是又一个行情 App，而是一层“购买决策层”：把金料、工费、税费、回购折价和回本点放进同一张账单。GoldLens 就做这一层。')

h2('五个关键发现', '01')
bullets([
    '热搜的注意力在体育、天气和娱乐，但这些都是“新闻脉冲”，不是创业机会。NBA 相关词出现在 36 条热搜、19 个地区；天气 25 条、11 个地区；黄金只有 5 条、4 个地区。',
    '黄金是“高价值、低频、强决策”的词。2025 年全球金饰需求 1,542.3 吨、价值 1,720 亿美元；销量下降 18%，价值却上升 18%。价格越高，消费者越需要“怎么买才不亏”的工具。',
    '现有产品分四个阵营：行情（Kitco、Gold Price Live）、持仓（Gold Wallet）、交易（GOLD NOW）、估价（True Gold、Gemmo）。没有一款把“到手价 + 即时回购 + 回本点 + 跨市场单位”做成消费级决策工具。',
    '最接近的 True Gold 已经验证了“baht / tola / tael + 对比门店价”的需求，但 0 个评分、功能早期；GOLD NOW 有 4.71 分和 224 个评分，却绑定单一经销商。空白不在“价格”，在“跨店、跨市场、可解释的账单”。',
    '我们把这个切口做成了可运行的 MVP：实时金价、GTA 泰国参考价、四市场换算、四单位、真实成本拆解、回购/回本点、持仓和价格提醒。默认泰国 1 个单位金饰：标价 65,000 THB，即时回购 62,717 THB，隐形成本 2,283 THB（3.5%），回本需金价上涨 3.6%。',
])

h2('建议的起手式', '02')
body_text('先做泰国，不做“全球黄金平台”。泰国同时具备三个条件：GTA 公开的 96.5% 金条/金饰参考价、baht 重量单位带来的本地知识门槛、以及大量跨境买金与旅居人群。用“泰国金价计算器 + 中文/英文双语 + SEO/LINE 分发”验证三个指标：计算完成率、回购价查看率、提醒创建率。30 天内不碰交易、不碰托管、不做预测。')

source_line('数据来源：Google Trends Daily Search Trends（33 个地区，2026-10-23）；Google Trends Explore（12 个月）；World Gold Council《Gold Demand Trends FY2025》；GTA 2026-10-23 12:11 公告价；App Store 美国区公开评分。详见附录 C。')

h2('关键数字速览', '03')
body_text('如果只带走一页，带走这张表。它是整份报告的最小证据集。')
add_table(
    ['指标', '数值', '指标', '数值'],
    [
        ['采样地区', '33 个', '日热搜条目', '330 条'],
        ['黄金相关条目', '5 条 / 4 个地区', '泰国单条热度', '20,000+'],
        ['阿联酋英文热度', '95 / 100', '全球金饰需求', '1,542.3 吨'],
        ['全球金饰价值', '1,720 亿美元', '泰国金饰隐形成本', '2,283 THB（3.5%）'],
    ],
    [3.2, 5.1, 3.2, 5.1],
    font_size=8.4
)
small_note('注：Google Trends 为相对指数；金饰需求为 2025 年数据；隐形成本按 2026-10-23 GTA 价格计算。')

page_break()

# ---------------- 01 METHOD ----------------
add_part('01', '研究设计与数据口径', '先把“热”定义清楚，再谈机会。')

h2('研究问题', '1.1')
body_text('这份报告不试图回答“最近什么词最火”，而是回答三个更接近产品决策的问题：')
bullets([
    '哪些热词对应一个真实、重复发生的用户任务，而不是一条新闻？',
    '这个任务是否已经有人在做？他们做得好不好？空白在哪里？',
    '以现有数据和技术，能否在 4 周内做出一个可验证的 MVP？',
], numbered=True)

h2('数据来源与采样', '1.2')
table_caption('表 1 · 数据源与用途')
add_table(
    ['数据', '口径', '用途'],
    [
        ['Google Trends Daily Search Trends', '33 个地区 × 10 条 = 330 条；2026-10-23 13:19–13:40 抓取', '识别当日注意力与跨地区主题'],
        ['Google Trends Explore', '12 个月；17 个种子词；6 个本地市场；related queries', '验证趋势形状、地区密度、关联需求'],
        ['World Gold Council', 'Gold Demand Trends FY2025（2026-01-29 发布）', '金饰需求吨数、价值、区域结构'],
        ['GTA Thailand', '2026-10-23 12:11 公告；96.5% 金条/金饰买卖价', '泰国本地价格锚与回购折价'],
        ['Hua Seng Heng', '官网产品与 GOLD NOW App 信息', '泰国经销商侧竞品'],
        ['Apple App Store', '美国区评分与评论数；iTunes Lookup API；2026-10-23', '竞品热度与定位'],
        ['Yahoo Finance / gold-api / open.er-api', 'COMEX GC=F、XAU/USD、USD/THB/AED/INR', 'MVP 实时数据与历史区间'],
    ],
    [4.4, 7.2, 5.0],
    font_size=8.2
)

page_break()

h2('从关键词到机会的筛选框架', '1.3')
body_text('我们把每个热词还原成一个“用户任务”，再用五个维度打分。权重不是真理，而是把判断显性化：')
table_caption('表 2 · 机会评分模型')
add_table(
    ['维度', '权重', '问题', '评分依据'],
    [
        ['需求强度', '30%', '多少人、多频繁地遇到这个任务？', '热搜热度、地区覆盖、关联词'],
        ['持续性', '25%', '是新闻脉冲、季节性，还是结构性需求？', '12 个月曲线、是否每年重复'],
        ['竞争空隙', '20%', '现有产品解决了哪一段？还缺哪一段？', '竞品功能矩阵、评分、定位'],
        ['可构建性', '15%', '4 周内能否做出可验证的 MVP？', '数据可得性、技术复杂度'],
        ['变现能力', '10%', '谁愿意付钱？客单和频次够不够？', '订阅、导购、B2B、广告'],
    ],
    [3.0, 1.6, 6.0, 6.0],
    font_size=8.2,
    align_center={1}
)

h2('边界与局限', '1.4')
bullets([
    '日热搜是新闻驱动的样本，不等于搜索量。Google Trends 只给 0–100 的相对指数，不能直接换算人数。',
    '英文“gold price”会低估泰国、越南、阿拉伯语市场的真实需求；本地语言查询在采集时遇到 429 限流，因此本报告用“英文区域热度 + 本地热搜条目 + 本地关联词”三角验证，而不是单看一个数。',
    'App Store 评分取美国区，不能代表泰国、阿联酋、印度本地商店；但它能反映产品定位和成熟度。',
    'WGC 为 2025 年年度数据，不是 2026 年实时数据；它的价值在于结构，而不是当天价格。',
    'MVP 使用公开接口与公开页面，未取得商业 SLA；生产化需要数据授权、缓存与监控。',
])

page_break()

# ---------------- 02 TRENDS ----------------
add_part('02', 'Google Trends 热搜全景', '330 条热搜里，注意力在哪里，价值又在哪里。')

body_text('2026 年 10 月 23 日的日热搜，被三件事主导：体育赛果、极端天气、娱乐八卦。它们是注意力的“高频噪声”，不是产品的“高频任务”。真正值得看的是那些在噪声里反复出现、并且能指向一个消费决策的词。')

add_image('chart:themes.png', 16.4, '图 1 · 330 条热搜的主题分布：体育/篮球 36 条、覆盖 19 个地区；黄金只有 5 条、4 个地区。')
source_line('数据来源：Google Trends Daily Search Trends RSS，33 个地区，2026-10-23 采样；主题归类为分析师手工映射。')

h2('三个反常识', '2.1')
body_text('热搜条数不等于商业价值。', '反常识一：')
body_text('NBA 相关词在 36 条热搜、19 个地区出现，但用户的任务是“看比分/看结果”，已经被 ESPN、Sofascore、联盟官方和平台级产品占满。天气同理：法国“météo”单条 100,000+，但 Apple Weather、Windy、AccuWeather 已经把“看天气”变成系统能力。')
body_text('黄金的词少，但每条都靠近钱。', '反常识二：')
body_text('泰国“ราคาทองวันนี้”单条 20,000+；阿联酋“gold rate dubai”500+、沙特本地金价词 100+、越南“giá vàng hiện tại”500+。这些不是“看一眼”的新闻，而是“买/卖/换”的前置动作。')
body_text('越贵的时候，越需要“算清楚”。', '反常识三：')
body_text('WGC 的数据很说明问题：2025 年全球金饰销量下降 18%，但消费价值上升 18%，达到 1,720 亿美元。消费者没有消失，而是在高金价下变得更挑剔：更轻的克重、更低的纯度、更多的以旧换新。挑剔，正是决策工具的入口。')

h2('三类热词，三种命运', '2.2')
table_caption('表 3 · 热词的三种类型')
add_table(
    ['类型', '例子', '半衰期', '产品含义'],
    [
        ['新闻脉冲', 'WhatsApp SIM 绑定、台风 Champi、NBA 揭幕战、演员去世', '数小时到数天', '适合做内容/流量，不适合做产品'],
        ['季节性', '万圣节服装、夏令时切换、黑五、排灯节', '每年一次，窗口 2–6 周', '适合做 campaign/工具页，难做留存'],
        ['结构性', 'gold price、meal planner、protein tracker、time change', '全年重复', '适合做工具/订阅/导购'],
    ],
    [2.6, 6.8, 2.8, 4.4],
    font_size=8.3
)

body_text('黄金属于第三类，但它比 meal planner、protein tracker 更“值钱”：一次交易客单高，用户对“买贵了”的痛感强，且本地价格体系复杂。这三点决定了它更适合做“决策工具”，而不是“内容社区”。')

h2('热搜里的黄金信号', '2.3')
body_text('把英文“gold price”的 12 个月区域热度拉出来，海湾和南亚的密度最高：阿联酋 95、卡塔尔 90、黎巴嫩 85、尼泊尔 76、新加坡 75、印度 70、巴基斯坦 68。沙特 37、马来西亚 31、美国 21。')
add_image('chart:regional.png', 15.6, '图 2 · 英文“gold price”的区域相对热度：海湾与南亚是密度最高的市场。')
source_line('数据来源：Google Trends Explore，12 个月，全球，按国家/地区归一化；仅代表英文查询。')
body_text('但英文词只是冰山一角。泰国本地热搜直接是“ราคาทองวันนี้”（今日金价），越南是“giá vàng hiện tại”，阿联酋的关联词第一名是“dubai gold price”（87），印度是“today gold price”（100）。本地语言和本地单位，才是这个赛道的进入门槛。')

h2('从“热”到“可做”的四道筛子', '2.4')
bullets([
    '任务是否重复：用户会不会在下一次买金/换金时回来？新闻词不会。',
    '决策是否有钱：一次错判的代价是否足够高？黄金一次买卖的隐形成本可以是 3%–20%。',
    '数据是否有壁垒：公开行情谁都能拿；本地柜台价、单位、税费、回购政策才有壁垒。',
    '竞争是否有空隙：巨头的强项在行情/交易，不在“跨店比价 + 到手价解释”。',
])

page_break()

# ---------------- 03 SCENARIOS ----------------
add_part('03', '从关键词到场景', '10 个应用机会，只有一个进入“优先”象限。')

body_text('我们把热搜映射成 10 个可落地的应用场景，并用同一套五维模型打分。分数不是市场预测，而是把“为什么不做”也写清楚。')

table_caption('表 4 · 10 个应用场景的机会评分（权重见表 2）')
add_table(
    ['场景', '用户任务', '产品形态', '需求', '持续', '空隙', '构建', '变现', '加权'],
    [
        ['黄金购买决策', '买之前算清到手价、回购价、回本点', '计算器 + 比价 + 持仓', 5, 5, 3, 5, 4, '4.50'],
        ['天气/灾害', '看预警、降雨、台风路径', '天气 App / 推送', 5, 5, 1, 3, 2, '3.60'],
        ['体育比分', '看实时比分、赛程、数据', '比分 App / 社区', 5, 5, 1, 3, 2, '3.60'],
        ['膳食计划', '按预算/口味/目标生成一周菜单', 'AI meal planner', 4, 4, 2, 4, 3, '3.50'],
        ['蛋白/健康追踪', '记录蛋白质、热量、训练', '健康记录 App', 3, 4, 2, 4, 3, '3.20'],
        ['WhatsApp 兼容工具', '检查手机能否继续用 WhatsApp', '检测工具 / 内容页', 4, 1, 4, 5, 1, '3.10'],
        ['时区/睡眠', '夏令时/ jet lag 的睡眠调整', '睡眠计划 App', 3, 3, 3, 4, 2, '3.05'],
        ['AI 室内设计/试穿', '上传房间/照片，生成设计方案', '图像生成 App', 3, 4, 2, 2, 3, '2.90'],
        ['AI 职业头像', '上传自拍，生成职业头像', '图像生成 App', 3, 3, 2, 3, 3, '2.80'],
        ['折叠屏适配', '让 App/内容适配折叠屏', '工具/配件', 3, 2, 3, 3, 2, '2.65'],
    ],
    [2.8, 4.6, 3.4, 0.9, 0.9, 0.9, 0.9, 0.9, 1.3],
    font_size=7.6,
    align_center={3, 4, 5, 6, 7, 8}
)

add_image('chart:matrix.png', 15.8, '图 3 · 机会矩阵：黄金在“高机会 + 中等竞争空隙”的位置；天气/体育需求大，但处于红海。')
source_line('注：气泡大小代表需求强度；评分为分析师打分，权重公开，可复算。')

h2('为什么不是天气、体育、AI 头像？', '3.1')
body_text('天气和体育的分数高，是因为“需求”和“持续性”都满分；但它们的“竞争空隙”只有 1。苹果、Google、ESPN、Sofascore 等平台级产品已经占据了默认入口，创业公司很难让用户多装一个 App。它们适合做流量内容，不适合做独立产品。')
body_text('AI 头像、AI 室内设计、虚拟试穿的需求真实，但供给已经高度同质化：模型能力外购、生成效果可复制、获客靠投放。没有本地数据或工作流壁垒，最后会变成“谁买量更便宜”的游戏。')
body_text('黄金不一样：它的“难”不在模型，而在本地知识——baht 重量、96.5% 纯度、GTA 公告、工费、VAT/GST、回购折价、以旧换新损耗。这些知识可以被产品化，也可以被持续积累成数据资产。')

h2('为什么黄金能过“4 周 MVP”这一关？', '3.2')
bullets([
    '价格数据可得：XAU/USD、FX、GTA 公开页面，足以支撑一个可用的计算器。',
    '计算逻辑确定：金料 = 金价 × 重量 × 纯度；到手价 = 金料 + 工费 + 税；回购 = 金料 − 折价。',
    '用户价值可感知：不需要教育“为什么要算”，只要把 65,000 和 62,717 放在一起，用户就懂了。',
    '商业路径清晰：订阅（提醒/持仓/多币种）、导购（到店/线上成交）、B2B（门店白标计算器）。',
])

h2('筛选结论：为什么是黄金', '3.3')
body_text('把五个维度放在一起，黄金的胜出不是因为“更热”，而是因为它同时满足四个“可”：')
bullets([
    '可防守：本地单位、税制、工费和回购政策，是通用行情 App 不会做的“脏活”。',
    '可收费：一次交易省下的钱，远高于一个月 99 THB 的订阅费，价值锚清晰。',
    '可扩展：泰国 96.5% → 阿联酋 22K → 印度 10 克/GST，同一套“账单”可以复用。',
    '可验证：4 周内能用公开数据做出可交互 MVP，不需要牌照、模型或供应链。',
])
body_text('反过来，天气、体育、AI 头像、膳食计划也有需求，但它们分别被平台入口、模型供给或低客单锁死。黄金是那个“词不大、但每一笔都值得算”的例外。')

page_break()

# ---------------- 04 WHY GOLD ----------------
add_part('04', '赛道选择', '为什么是黄金购买决策，而不是又一个金价 App。')

h2('需求证据：不是“想看”，是“怕买贵”', '4.1')
body_text('Google Trends 的区域热度只说明“有人在搜”，真正的需求强度要看“搜的人处于什么决策阶段”。黄金的关联词几乎都指向交易：')
table_caption('表 5 · 黄金关联词与决策阶段')
add_table(
    ['市场', '代表性查询', '关联强度', '决策阶段'],
    [
        ['阿联酋', 'dubai gold price / uae gold price / gold price in dubai', '87 / 70 / 51', '到店前比价'],
        ['印度', 'today gold price / gold rate / 22 carat gold price', '100 / 20 / 6', '婚嫁/节庆购买'],
        ['沙特', 'gold price ksa / gold price in saudi / saudi gold price today', '78 / 58 / 34', '到店前比价'],
        ['越南', 'price gold today / gold price vietnam / gold price forecast', '100 / 40 / 25', '本地金店比价'],
        ['泰国', 'ราคาทองวันนี้（今日金价）', '20,000+（日热搜）', '每日查看/到店'],
    ],
    [2.4, 7.2, 3.4, 3.6],
    font_size=8.3
)
source_line('数据来源：Google Trends Explore related queries（12 个月，按市场）；泰国为 Daily Search Trends 热度。关联强度为 Google Trends 的相对值。')

body_text('这些词不是“投资研究”，而是“购买前检查”。用户想知道的是：今天多少、22K 还是 24K、每克多少、工费多少、买完能不能退/回购。行情 App 只回答了第一个问题。')

h2('市场结构：量跌、价升、决策更难', '4.2')
table_caption('表 6 · 2025 年主要市场金饰需求')
add_table(
    ['市场', '2025 金饰需求（吨）', '同比', '2025 金饰消费价值', '含义'],
    [
        ['全球', '1,542.3', '−18%', '1,720 亿美元（+18%）', '量跌价升，消费者更挑剔'],
        ['印度', '430.5', '−24%', '490 亿美元', '婚嫁/节庆刚需，价格敏感'],
        ['中国', '360.1', '−25%', '390 亿美元', '轻克重、硬足金、以旧换新'],
        ['阿联酋', '29.4', '−15%', '—', '投资型产品占比上升'],
        ['泰国', '7.8', '−14%', '—', 'baht 重量、96.5% 体系'],
        ['美国', '117.3', '−11%', '130 亿美元（+28%）', '高客单/高端韧性'],
    ],
    [2.4, 3.2, 2.2, 4.4, 4.4],
    font_size=8.2,
    align_center={1, 2}
)
source_line('数据来源：World Gold Council, Gold Demand Trends FY2025 — Jewellery（2026-01-29）。')
body_text('这组数据解释了一个关键现象：金价越高，消费者越不会“随便买”。他们会更频繁地查价、更仔细地比较工费、更在意回购条款、更倾向于以旧换新。对工具型产品来说，这是顺风，不是逆风。')

h2('用户不是一类人，是三种任务', '4.3')
table_caption('表 7 · 四类用户与付费动机')
add_table(
    ['人群', '典型场景', '最痛的点', '愿意为什么付费'],
    [
        ['首次买金者', '旅游/结婚/送礼，在曼谷、迪拜、印度门店', '不知道 baht/tola/克怎么换算，不知道工费和税是否合理', '一次性的“陪买/比价”报告'],
        ['攒金/定投者', '每月买 1–5 克，长期持有', '不知道每次买入的溢价，回购价不透明', '持仓、提醒、历史成本'],
        ['以旧换新者', '旧金饰换新，补工费/差价', '损耗、折旧、工费叠加，算不清是否划算', '换新计算器 + 门店比价'],
        ['跨境比价者', '在泰国/阿联酋/印度之间比较', '单位、纯度、税制不同，无法直接比', '跨市场统一账单'],
    ],
    [2.5, 5.2, 5.2, 3.7],
    font_size=8.2
)

body_text('GoldLens 的首发人群不是“所有买金的人”，而是“第一次在泰国买金、且习惯用中文/英文搜索的人”。他们信息缺口最大、决策最焦虑、对一次性的解释服务最有付费意愿。', '首发切口：')

h2('为什么是现在', '4.4')
bullets([
    '金价处于高波动区间：过去一年 COMEX 主力从 3,961 走到 5,318，又回落到 4,030，距高点 −24%。波动越大，用户越频繁查价。',
    '高金价改变消费结构：WGC 显示 2025 年销量 −18%、价值 +18%；轻克重、低纯度、以旧换新成为主流，决策更复杂。',
    '本地数据可获取：GTA 公开 96.5% 金条/金饰买卖价；泰国门店价格体系相对透明，适合做第一个“可信锚点”。',
    '现有产品错位：行情 App 强在“看”，经销商 App 强在“买”，估价 App 强在“单件”，没人强在“买之前的整张账单”。',
    '技术成本下降：一个 Node 服务 + 原生前端 + SVG 图表即可跑通；不需要训练模型，也不需要金融牌照。',
])

h2('为什么是泰国，而不是印度或阿联酋', '4.5')
body_text('泰国不是最大的黄金市场，但它是“最适合做第一个账单”的市场：')
bullets([
    '数据透明：GTA 每个交易日公布 96.5% 金条/金饰的卖出与回购价，给了一个可信的本地锚。',
    '单位独特：baht 重量（15.244g）是本地知识门槛，通用行情 App 通常只做克/盎司。',
    '人群匹配：跨境买金、旅居、旅游人群同时使用中文/英文搜索，信息缺口最大。',
    '竞争错位：GOLD NOW 强在交易但绑定单一经销商；泰国行情 App 强在看价但不做“到手价”。',
])
body_text('扩张顺序建议：泰国（96.5% / baht）→ 阿联酋（22K / 迪拉姆 / 5% VAT）→ 印度（22K / 10 克 / 3% GST）。每进入一个市场，先补“本地价格 schema”，再做增长。')

page_break()

# ---------------- 05 COMPETITION ----------------
add_part('05', '竞品对标', '9 款产品，四个阵营，一个空白。')

body_text('我们把竞品分成四个阵营：行情、持仓、交易、估价。每个阵营都解决了一部分问题，但没有一款把“到手价—回购价—回本点”连起来。')

h2('竞品地图', '5.1')
table_caption('表 8 · 竞品四阵营')
add_table(
    ['阵营', '代表产品', '强项', '缺失', '对 GoldLens 的含义'],
    [
        ['行情', 'Kitco Gold Live! / Gold Price Live', '实时报价、图表、新闻、提醒', '本地单位、工费、税、回购', '不跟它比“快”，跟它比“算得清”'],
        ['持仓', 'Gold Wallet', '持仓成本、盈亏、组合', '购买决策、本地价、回购', '持仓是留存功能，不是获客入口'],
        ['交易', 'GOLD NOW（Hua Seng Heng）', '泰国买卖、存金、提金', '跨店比价、独立立场', '不做交易，做交易前的“比价层”'],
        ['估价', 'True Gold / Gemmo / Easy Gold Calculator', '单位换算、熔值、门店对比、AI 识别', '税费/工费全链路、跨市场、提醒', '最接近，但都停在“估值”'],
    ],
    [2.0, 4.4, 3.6, 3.4, 3.2],
    font_size=8.0
)

h2('功能矩阵', '5.2')
table_caption('表 9 · 功能覆盖对比（强/部分/弱为分析师判断）')
add_table(
    ['能力', 'Kitco', 'Gold Price', 'Gold Wallet', 'True Gold', 'GOLD NOW', 'Thai app', 'Gemmo', 'GoldLens'],
    [
        ['实时金价', '强', '强', '强', '强', '强', '强', '强', '强'],
        ['本地柜台价', '弱', '弱', '弱', '部分', '强', '强', '弱', '强'],
        ['baht/tola/tael', '弱', '弱', '弱', '强', '部分', '强', '部分', '强'],
        ['工费/税费拆解', '弱', '弱', '弱', '部分', '部分', '弱', '弱', '强'],
        ['即时回购/回本点', '弱', '弱', '弱', '部分', '部分', '部分', '部分', '强'],
        ['持仓', '部分', '弱', '强', '弱', '强', '部分', '强', '强'],
        ['跨市场比较', '弱', '部分', '弱', '部分', '弱', '弱', '弱', '强'],
    ],
    [3.0, 1.6, 1.7, 1.7, 1.7, 1.7, 1.6, 1.6, 1.6],
    font_size=7.3,
    align_center={1, 2, 3, 4, 5, 6, 7, 8},
    row_pad=34
)

h2('关键竞品拆解', '5.3')
body_text('Kitco Gold Live! 是该品类的“信任锚”。4.76 分、8,391 个美国区评分，实时报价、图表、新闻、提醒俱全。它的优势是品牌和数据，弱势是“全球行情”视角——它不会告诉你曼谷一家金店的 1 baht 金饰今天该付多少、明天能回购多少。', '① ')
body_text('Gold Price Live 是典型的“行情工具”：3.87 分、63 个评分，支持 10 种语言和长周期图表。它证明多语言需求存在，但也说明单靠行情很难形成差异化。', '② ')
body_text('Gold Wallet 是“持仓工具”：3.54 分、48 个评分，记录买入、计算盈亏。它解决的是“买完之后”，而 GoldLens 要解决“买之前”。两者可以互补，而不是正面竞争。', '③ ')
body_text('True Gold 是最危险的“近邻”：支持 gram / ounce / tola / baht / Luong / tael，提供 live Thai gold、按纯度估价和“Comparison Price”。它已经验证了“单位 + 门店比价”的需求，但 0 个评分、功能早期，且没有把工费、税费、回购折价、回本点做成完整账单。', '④ ')
body_text('GOLD NOW 是“交易方”的代表：4.71 分、224 个评分，泰国买卖、存金、提金、实时报价。它的强势是交易闭环，弱势是“单一经销商立场”——用户无法用它比较不同门店。', '⑤ ')
body_text('ราคาทองวันนี้ GoldPrice Update 是“本地行情”的代表：4.71 分、199 个评分，泰国金价、提醒、盈亏、分享。它离 GoldLens 最近，但仍是“看价格”，不是“算到手价”。', '⑥ ')
body_text('Giá Vàng 是“越南本地行情”的代表：4.62 分、1,076 个评分，SJC/DOJI 价格、图表、汇率、新闻。它说明本地化行情可以做到很大，但也说明“只做行情”会陷入区域割据。', '⑦ ')
body_text('Gemmo 是“AI 估价”的新变量：拍照识别首饰、读 hallmarks、按熔值估价，订阅 $5.99/周或 $39.99/年。它验证了“用户愿意为估价付费”，但解决的是“我手里这是什么”，不是“我现在买这笔划不划算”。', '⑧ ')

h2('竞品评分与定价', '5.4')
table_caption('表 10 · 竞品评分与定价（美国区 App Store，2026-10-23）')
add_table(
    ['产品', '公司', '美国区评分', '评论数', '价格', '定位'],
    [
        ['Gold Live! Gold Price, Silver', 'Kitco Metals', '4.76', '8,391', '免费', '行情/新闻/提醒'],
        ['Gold Price Live', 'Gold Price Group', '3.87', '63', '免费', '多语言行情'],
        ['Gold Wallet - Bullion Tracker', 'Jefferson Coin', '3.54', '48', '免费', '持仓'],
        ['True Gold', 'Tilo Delau', '—', '0', '免费', '单位换算/门店对比'],
        ['GOLD NOW', 'Hua Seng Heng', '4.71', '224', '免费', '泰国交易/存金'],
        ['GoldPrice Update（泰国）', 'Gostar', '4.71', '199', '免费', '泰国行情/提醒'],
        ['Giá Vàng - Tỷ Giá Ngoại Tệ', 'Phuoc Nguyen', '4.62', '1,076', '免费', '越南行情/汇率'],
        ['Gemmo: Gold Calculator & Scan', 'Zigmas Vadapalas', '—', '0', '周 $5.99 / 年 $39.99', 'AI 识别/熔值'],
        ['Easy Gold Calculator', 'Interwebs Group', '4.45', '40', '免费', 'B2B 熔值计算'],
    ],
    [4.4, 2.6, 2.0, 1.6, 2.8, 3.2],
    font_size=7.8,
    align_center={2, 3}
)
source_line('数据来源：Apple iTunes Lookup API；评分为美国区样本，不代表全球或本地表现。')

h2('空白：不是“价格”，是“决策”', '5.5')
body_text('把竞品放回用户旅程，会发现一个明显的断点：用户在“看到价格”和“做出购买”之间，缺一层解释。行情 App 给的是“市场价”，经销商给的是“我的价”，估价 App 给的是“这件值多少”，但没有人把三者放在一起，告诉用户：')
bullets([
    '这个柜台价里，金料、工费、税各占多少？',
    '如果我明天就卖回同一家店，能拿回多少？',
    '金价要涨多少，我才不亏？',
    '同样一克，在曼谷、迪拜、孟买差多少？',
])
body_text('这就是 GoldLens 的定位：不做行情，不做交易，做“购买决策层”。')

page_break()

# ---------------- 06 PRODUCT ----------------
add_part('06', '产品定义', 'GoldLens 金价透视：把一张金店小票拆开。')

h2('一句话', '6.1')
p = doc.add_paragraph()
p.paragraph_format.space_before = Pt(2)
p.paragraph_format.space_after = Pt(10)
r = p.add_run('“买金之前，先看清真实成本。”')
set_cn_font(r, name=FONT_SERIF, size=20, bold=True, color=GOLD)

body_text('GoldLens 是面向消费者的黄金购买决策工具。它把国际金价、本地柜台价、工费、税费、回购折价和回本点，放进同一张可交互的账单。它不是行情终端，也不是交易平台。')

h2('价值主张', '6.2')
table_caption('表 11 · 价值主张与界面映射')
add_table(
    ['用户问题', 'GoldLens 的回答', '界面证据'],
    [
        ['今天金价多少？', '实时 XAU/USD + 本地 GTA 参考价', '首页大价格 + 泰国四格价'],
        ['1 baht 是多少克？', 'baht / g / tola / oz 四单位互换', '重量输入 + 单位切换'],
        ['这家店贵不贵？', '金料 + 工费 + 税费拆解，给出市场溢价', '账单堆叠条 + 公平徽章'],
        ['买完能卖多少？', '按今日回购价计算即时回购与回本点', '回购卡 + 回本需上涨'],
        ['我手里的金值多少？', '按回购价估值，折合美元汇总', '持仓表 + 浮动盈亏'],
        ['什么时候买？', '只给价格位置，不给预测', '30D/90D/1Y 区间 + 提醒'],
    ],
    [4.4, 8.0, 4.0],
    font_size=8.2
)

h2('MVP 范围', '6.3')
table_caption('表 12 · MVP 的做与不做')
add_table(
    ['做', '不做（至少现在不做）'],
    [
        ['实时金价 + 汇率 + GTA 泰国参考价', '真实交易/下单/支付'],
        ['四市场（泰/阿联酋/印度/美国）换算', 'KYC、托管、金库、保险'],
        ['四单位（baht/g/tola/oz）+ 四纯度', 'AI 金价预测/荐股'],
        ['到手价、工费、税费、回购、回本点', '全量门店实时库存/报价'],
        ['30D/90D/1Y 走势与区间位置', '原生 iOS/Android App'],
        ['本地持仓 + 浮动盈亏', '账户体系/云同步'],
        ['浏览器内价格提醒', '后台推送/短信'],
        ['移动端优先的响应式 Web', '多语言全量本地化'],
    ],
    [8.2, 8.2],
    font_size=8.4
)

h2('核心流程', '6.4')
bullets([
    '选市场：泰国 / 阿联酋 / 印度 / 美国。默认泰国，因为 GTA 有公开的本地参考价。',
    '选纯度与重量：96.5% / 24K / 22K / 18K；baht / 克 / tola / 盎司。',
    '调工费与税费：泰国默认 0（GTA 金饰价已含标准工费），阿联酋默认 12% + 5%，印度 12% + 3%，美国 8% + 0%。',
    '读账单：到手价、金料、工费、税费、市场溢价、即时回购、回本点、隐形成本。',
    '做动作：加入持仓、设价格提醒、切换 30D/90D/1Y 看位置。',
], numbered=True)

h2('关键公式', '6.5')
body_text('MVP 的所有数字来自这四行公式。它们不复杂，难的是每个市场的单位、税率和回购政策。')
p = doc.add_paragraph()
p.paragraph_format.space_before = Pt(2)
p.paragraph_format.space_after = Pt(8)
p.paragraph_format.left_indent = Cm(0.6)
for line in [
    '金料价值 = 金价(USD/oz) ÷ 31.1034768 × 汇率 × 克重 × 纯度',
    '到手价 = 金料价值 + 工费/溢价 + 税费',
    '即时回购 = 本地回购价 × 重量（或 金料价值 × (1 − 回购折价)）',
    '回本涨幅 = 到手价 ÷ 即时回购 − 1',
]:
    r = p.add_run(line + '\n')
    set_cn_font(r, name='Consolas', size=9, color=INK)
p.paragraph_format.line_spacing = 1.6

h2('差异化与护城河', '6.6')
bullets([
    '本地价格 schema：每个市场的单位、纯度、税率、工费习惯、回购折价，是一条条“脏活”堆出来的。',
    '门店报价语料：用户上传/输入的门店报价，会形成“某店某日某品类”的价格样本，越用越准。',
    'SEO 资产：每个市场 × 纯度 × 单位 × 场景，都可以生成一个可被搜索到的落地页。',
    '信任品牌：明确标注数据源、时间戳、口径和“不构成投资建议”，比“AI 预测”更能建立长期信任。',
])
body_text('这不是模型壁垒，是“本地知识 + 数据 + 信任”的复合壁垒。模型可以买，本地价格体系买不到。')

h2('成功指标', '6.7')
table_caption('表 13 · MVP 验证指标')
add_table(
    ['层级', '指标', 'MVP 目标', '为什么'],
    [
        ['激活', '完成一次计算 / 访问', '≥ 45%', '计算器是核心价值'],
        ['价值', '查看回购价 / 完成计算', '≥ 60%', '回购是差异化的“啊哈”'],
        ['留存', '7 日内再次查价', '≥ 20%', '金价是重复需求'],
        ['变现', '创建提醒 / 月活', '≥ 8%', '提醒是订阅的前置'],
        ['导购', '点击“去门店/比价” / 月活', '≥ 5%', '验证 affiliate 意向'],
    ],
    [2.2, 6.0, 3.4, 4.6],
    font_size=8.2,
    align_center={2}
)

# ---------------- 07 BUSINESS ----------------
add_part('07', '商业模式与增长', '先卖“确定性”，再卖“便利”。')

h2('收入结构', '7.1')
table_caption('表 14 · 收入结构')
add_table(
    ['收入', '内容', '定价', '启动时点', '风险'],
    [
        ['Pro 订阅', '多币种、无限提醒、持仓历史、报价导出、跨市场对比', '99 THB/月；799 THB/年', 'MVP 后 30 天', '付费意愿需验证'],
        ['导购/线索', '把高意向用户导给独立金店/合规平台，按到店或成交收费', '成交额的 0.5%–1.5%', '第 2 个月', '门店履约与归因'],
        ['B2B 白标', '给金店/旅游平台提供计算器与比价页', '月费 3,000–15,000 THB', '第 3 个月', '销售周期'],
        ['数据/API', '本地金价、门店溢价指数（脱敏聚合）', '按调用/订阅', '6 个月后', '数据授权与合规'],
    ],
    [2.4, 6.0, 3.2, 2.4, 2.6],
    font_size=8.0
)

body_text('订阅卖的是“确定性”：提醒、持仓、跨市场对比。导购卖的是“便利”：把已经算清楚的人，送到能履约的门店。B2B 卖的是“工具”：门店也需要一个可信的计算器来降低沟通成本。')

h2('单位经济模型（情景推演）', '7.2')
table_caption('表 15 · 单位经济模型（显式假设，不构成承诺）')
add_table(
    ['假设 / 结果', '保守', '基准', '进取'],
    [
        ['MAU', '50,000', '150,000', '400,000'],
        ['Pro 转化率', '1.5%', '2.5%', '4.0%'],
        ['Pro 月收入（$4.99）', '$3,743', '$18,713', '$79,840'],
        ['每月导购线索', '1,000', '3,000', '8,000'],
        ['平均成交额', '$600', '$600', '$600'],
        ['佣金率', '1.0%', '1.0%', '1.0%'],
        ['导购月收入', '$6,000', '$18,000', '$48,000'],
        ['合计 MRR', '$9,743', '$36,713', '$127,840'],
        ['折合 ARR', '$116,916', '$440,556', '$1,534,080'],
    ],
    [6.0, 3.4, 3.4, 3.4],
    font_size=8.2,
    align_center={1, 2, 3}
)
source_line('假设：Pro $4.99/月；导购按成交额 1% 计；未计退款、税费、渠道分成与获客成本。')

h2('获客：用搜索词打搜索词', '7.3')
bullets([
    'SEO 落地页：每个市场 × 纯度 × 单位 × 场景，生成“今日金价 + 计算器”页面；标题直接对应“ราคาทองวันนี้”“dubai gold price”“gold price thailand”。',
    '分享卡：用户算完生成一张“标价 vs 回购价”的卡片，适配 LINE/WhatsApp/小红书/X，天然适合泰国、阿联酋、印度。',
    '短视频：15 秒讲清“为什么标价 65,000，转身只值 62,717”，用真实 GTA 数据做每日更新。',
    '合作：独立金店、导游/地接、外派社群、跨境旅游平台；先做“到店前检查”，不做“成交承诺”。',
    'ASO：如果做原生 App，优先“gold price thailand”“baht gold calculator”“dubai gold rate”。',
])

h2('90 天路线图', '7.4')
table_caption('表 16 · 90 天验证路线图')
add_table(
    ['阶段', '目标', '关键动作', '验收'],
    [
        ['0–30 天', '验证“算账”需求', '泰国 GTA + 计算器 + 20 个用户访谈 + 3 个 SEO 页', '计算完成率 ≥ 45%；10 个回购价查看'],
        ['31–60 天', '验证“提醒/持仓”留存', 'LINE 提醒、持仓、分享卡、独立店合作 2 家', '7 日回访 ≥ 20%；提醒创建 ≥ 8%'],
        ['61–90 天', '验证“导购/订阅”付费', 'Pro 订阅、报价上传、阿联酋/印度本地化', '付费转化 ≥ 1.5%；导购 CTR ≥ 5%'],
    ],
    [2.4, 4.0, 6.2, 4.0],
    font_size=8.2
)

h2('增长漏斗与预算', '7.5')
table_caption('表 16A · 90 天增长漏斗（假设）')
add_table(
    ['阶段', '目标', '主要渠道', '预算', '核心指标'],
    [
        ['0–30 天', '1,000 次计算', '3 个 SEO 落地页 + 泰国社群 + 导游合作', '15,000 THB', '计算完成率 ≥ 45%'],
        ['31–60 天', '10 条到店线索', '2 家独立金店 + LINE 提醒 + 分享卡', '30,000 THB', '到店率 / 线索成本'],
        ['61–90 天', '100 个 Pro 订阅', '短视频 + 分享卡 + ASO + 转介绍', '80,000 THB', 'CAC ≤ 150 THB'],
    ],
    [2.2, 3.2, 6.6, 2.2, 2.4],
    font_size=8.0
)
body_text('90 天预算合计 125,000 THB（约 3,700 美元），只含内容、投放与门店合作，不含人力。这个预算足够验证“有没有人愿意算、愿意回访、愿意为提醒付费”，但不足以打全国广告。')

page_break()

# ---------------- 08 MVP ----------------
add_part('08', 'MVP 实现与验证', '一个能跑、能算、能看的 Web MVP。')

body_text('MVP 的目标不是“功能齐全”，而是验证一个核心假设：当用户看到“标价—金料—工费—税—回购—回本点”放在一起时，会不会更愿意做决定、更愿意留下、更愿意为提醒/持仓付费。')

h2('产品截图', '8.1')
body_text('以下截图为 2026-10-23 13:51 的测试时点，价格已随 GTA 盘中更新；正文的基准数字以 12:11 公告为准。')
add_image('hero.png', 16.2, '图 4 · 首页：实时金价、泰国 GTA 四格价、金饰价差与 30 天走势（13:51 测试时点）。')
add_image('calc.png', 16.2, '图 5 · 计算器：市场/纯度/重量/工费/税费 → 到手价、回购价、回本点与谈判提示（13:51 测试时点）。')
add_image('portfolio.png', 16.2, '图 6 · 持仓：按即时回购价估值，直接显示一买一卖的浮动亏损（13:51 测试时点）。')

h2('技术架构', '8.2')
table_caption('表 17 · MVP 技术架构')
add_table(
    ['层', '实现', '为什么这样选'],
    [
        ['服务端', 'Node.js 24 内置 http，无运行时依赖', '启动快、易部署、4 周可维护'],
        ['数据聚合', '/api/market 并行拉取 gold-api、open.er-api、Yahoo、GTA', '单点失败可降级，前端只认一个接口'],
        ['缓存', '60 秒内存缓存 + 最近快照 fallback', '避免打爆公开接口，保证演示可用'],
        ['前端', '原生 HTML/CSS/JS + SVG 图表', '无构建链、加载快、移动端可控'],
        ['存储', 'localStorage（持仓/提醒）', 'MVP 不做账户，降低隐私与后端成本'],
        ['测试', 'Playwright + Edge，覆盖桌面/移动', '验证真实交互与响应式，不靠手点'],
    ],
    [2.6, 8.0, 6.0],
    font_size=8.2
)

h2('数据管线', '8.3')
body_text('服务端把四个来源聚合成一个 JSON：')
bullets([
    'gold-api.com：XAU/USD 现货，约每 10 秒更新。',
    'open.er-api.com：USD/THB、AED、INR、CNY 等每日中间价。',
    'Yahoo Finance：COMEX GC=F 的 1 年日线，用于 30D/90D/1Y 区间。',
    'GTA Thailand：96.5% 金条/金饰的卖出与回购价，来自经典版页面。',
])
body_text('任一来源失败时，服务端返回最近快照，并在 `degraded` 字段标注；前端把对应数据源标为“快照”，不会假装实时。这个“诚实降级”是产品可信度的一部分。')

h2('计算与呈现', '8.4')
body_text('泰国 96.5% 金饰使用 GTA 金饰卖出价作为“到手价”锚，金条卖出价作为“金料”锚，差额即金饰溢价；回购使用 GTA 金饰回购价。阿联酋、印度、美国使用国际金料价 + 可调工费 + 可调税费的估算，明确标注“不代表门店报价”。')
body_text('结果是三层：第一层“到手价”，第二层“钱花在哪”，第三层“如果现在卖”。第三层是差异化的核心：它把“买”与“卖”放在同一个时间点，让用户看到隐形成本和回本点。')

h2('验证结果', '8.5')
table_caption('表 18 · MVP 端到端验证（Playwright + Edge，2026-10-23）')
add_table(
    ['测试', '结果', '结论'],
    [
        ['首页实时价格渲染', 'XAU/USD 4,024.80；泰国 GTA 64,200 / 65,000', '通过'],
        ['泰国默认计算', '1 baht 96.5% → 65,000 THB；回购 62,717；隐形成本 2,283（3.5%）', '通过'],
        ['阿联酋切换', '1 g 22K → AED 512；工费 12%、税 5%', '通过'],
        ['印度 24K / 10g', '₹141,523；工费 12%、税 3%', '通过'],
        ['图表悬停', 'Tooltip 可见，日期/价格正确', '通过'],
        ['添加持仓', '1 行；估值 $1,859.43；浮亏 −$67.69（−3.5%）', '通过'],
        ['创建提醒', '1 条；显示距当前 −13.0%', '通过'],
        ['移动端 390px', 'scrollWidth = 390 = viewport，无横向溢出', '通过'],
        ['控制台/页面错误', '0', '通过'],
    ],
    [4.8, 8.6, 3.2],
    font_size=8.2
)
source_line('注：正文基准为 2026-10-23 12:11 GTA 公告；表内为当时的计算结果，截图时间为 13:51，价格随市场更新。')

h2('MVP 的局限', '8.6')
bullets([
    'GTA 只覆盖泰国 96.5% 体系；阿联酋/印度/美国为估算，不是门店实时报价。',
    '没有账户体系，持仓/提醒只存在浏览器；换设备会丢。',
    '提醒只在页面打开时检查，没有后台推送。',
    '没有真实门店报价语料，无法做“跨店比价”的完整闭环。',
    'Yahoo 历史数据在部分网络环境下会被限流，服务端用快照降级。',
])

h2('运行方式', '8.7')
p = doc.add_paragraph()
p.paragraph_format.left_indent = Cm(0.5)
p.paragraph_format.space_after = Pt(8)
for line in [
    'cd mvp',
    'node server.mjs',
    '# open http://127.0.0.1:5188',
]:
    r = p.add_run(line + '\n')
    set_cn_font(r, name='Consolas', size=9, color=INK)
p.paragraph_format.line_spacing = 1.6
body_text('无 npm 依赖；Node 24+ 即可。市场数据接口为 `/api/market`，健康检查为 `/health`。')

page_break()

# ---------------- 09 RISK ----------------
add_part('09', '风险、合规与边界', '不做交易、不做托管、不做预测。')

table_caption('表 19 · 主要风险与缓解')
add_table(
    ['风险', '影响', '缓解'],
    [
        ['数据准确性', '用户按错误价格做决策，信任崩塌', '标注来源/时间戳；GTA 与行情分开展示；估算值明确写“估算”'],
        ['数据授权', '公开页面抓取可能违反条款', '上线前取得授权/合作；优先使用官方 API；控制频率并缓存'],
        ['监管', '被认定为投资建议/交易服务', '不做预测、不代客交易、不托管；显著免责声明；地区合规审查'],
        ['竞争', 'Kitco/GOLD NOW 复制功能', '不拼行情速度，拼本地账单与门店语料；先做深泰国'],
        ['信任', '用户怀疑“你是不是收了店家的钱”', '广告/导购标注；排序不按佣金；公开数据口径'],
        ['汇率/税制变化', '估算失真', '参数可调；显示更新时间；按市场维护规则'],
        ['留存', '查价是低频，用户用完即走', '提醒、持仓、换新计算器、节庆/婚嫁内容'],
    ],
    [3.4, 5.8, 7.4],
    font_size=8.2
)

body_text('最重要的边界是：GoldLens 不碰钱。不做交易、不做托管、不做代购，也不给“涨跌预测”。它只做三件事：把价格说清楚、把成本拆开、把选择摆在用户面前。这既降低监管复杂度，也让产品更容易建立信任。')

h2('上线前的五个合规问题', '9.1')
bullets([
    '数据授权是否覆盖“抓取、缓存、展示、再分发”？公开可访问不等于可商用。',
    '文案里是否出现“建议买入/卖出/必涨”等投资建议表述？如果有，删掉。',
    '估算值与门店报价是否清晰区分？是否标了时间戳、来源和“仅供参考”？',
    '导购排序是否受佣金影响？如果受，是否在页面显著披露？',
    '用户上传的门店报价/持仓数据，是否有删除、导出和隐私说明？',
], numbered=True)
body_text('这五个问题没有全部回答“是”之前，不要开放真实交易线索，也不要做付费投放。')

# ---------------- 10 CONCLUSION ----------------
add_part('10', '结论与下一步', '先做一张账单，再做一门生意。')

p = doc.add_paragraph()
p.paragraph_format.space_before = Pt(4)
p.paragraph_format.space_after = Pt(12)
r = p.add_run('黄金不是最热的关键词，\n但它是少数“热得有价值”的关键词。')
set_cn_font(r, name=FONT_SERIF, size=23, bold=True, color=INK)
p.paragraph_format.line_spacing = 1.15

body_text('Google Trends 告诉我们，注意力在体育、天气和娱乐；但真正的商业机会，在那些“词不大、客单高、决策难”的地方。黄金正好符合：用户怕买贵、怕卖亏、怕算不清，而现有产品只解决了“看价格”。')
body_text('GoldLens 的切口很小：先把泰国 1 baht 金饰的账单算清楚。但这个切口可以自然扩展到阿联酋的 22K、印度的 10 克、以旧换新、跨境比价、门店导购。它的护城河不是模型，而是本地价格 schema、门店报价语料和搜索入口。')

h2('接下来 30 天，只做三件事', '10.1')
bullets([
    '找 20 个在泰国买过金/准备买金的人，做 30 分钟访谈，验证“回购价/回本点”是不是最强触发点。',
    '把泰国计算器做成可分享的 SEO 页面，跑 3 个关键词，观察计算完成率与回访。',
    '谈 2 家独立金店，验证“到店前检查”是否能带来真实线索；不承诺成交，只测意向。',
], numbered=True)

callout('一句话总结', '用户不缺一个看金价的 App，缺的是一张把“买贵了没有”算清楚的账单。GoldLens 先做这张账单，再把它变成入口。')

page_break()

# ---------------- APPENDIX ----------------
add_part('附录', '数据表、方法与来源', '可复算，可追溯。')

h2('日热搜 Top 15（按热度）', 'A.1')

def traffic_num(value):
    import re
    m = re.match(r'([\d,]+)', value or '')
    return int(m.group(1).replace(',', '')) if m else 0

rows = []
for geo, items in rss['regions'].items():
    if not isinstance(items, list):
        continue
    for item in items:
        news = item.get('news') or []
        rows.append((geo, item['term'], item['traffic'], (news[0]['title'] if news else '')[:80]))
rows.sort(key=lambda r: traffic_num(r[2]), reverse=True)
top_rows = [[g, t, tr, n] for g, t, tr, n in rows[:15]]
table_caption('表 A1 · 2026-10-23 Google Trends 日热搜 Top 15')
add_table(['地区', '关键词', '热度', '关联新闻'], top_rows, [1.8, 5.4, 2.2, 7.2], font_size=7.7)

h2('Google Trends 查询与口径', 'B.1')
body_text('日热搜：`https://trends.google.com/trending/rss?geo={geo}`，33 个地区，每条最多 10 个 item；热度为 Google 的 approx_traffic，非精确量。')
body_text('12 个月兴趣：`pytrends` 调用 Google Trends Explore，timeframe=`today 12-m`，geo 为空（全球）或指定市场；数值为 0–100 相对指数。关联词取 top 与 rising 各前 10–15 条。')
body_text('地区热度：`interest_by_region(resolution="COUNTRY")`，按“gold price”英文查询归一化；仅代表英文查询。')
body_text('本地语言查询（泰语/阿拉伯语/越南语/印地语/中文）在采集时遇到 429 限流，未纳入定量图表；报告用日热搜条目与英文区域热度做三角验证。')

h2('主要来源', 'C.1')
sources = [
    ('Google Trends Daily Search Trends RSS', 'https://trends.google.com/trending/rss?geo=US'),
    ('Google Trends Explore（gold price，12 个月）', 'https://trends.google.com/trends/explore?date=today%2012-m&q=gold%20price'),
    ('World Gold Council, Gold Demand Trends FY2025 — Jewellery', 'https://www.gold.org/goldhub/research/gold-demand-trends/gold-demand-trends-full-year-2025/jewellery'),
    ('Gold Traders Association of Thailand', 'https://www.goldtraders.or.th/'),
    ('GTA classic price page（MVP 抓取源）', 'https://classic.goldtraders.or.th/'),
    ('Hua Seng Heng（GOLD NOW / 泰国金价）', 'https://www.huasengheng.com/'),
    ('Kitco Gold Live!（App Store）', 'https://apps.apple.com/us/app/gold-live-gold-price-silver/id1444886741'),
    ('Gold Price Live（App Store）', 'https://apps.apple.com/us/app/gold-price-live/id410177268'),
    ('Gold Wallet - Bullion Tracker（App Store）', 'https://apps.apple.com/us/app/gold-wallet-bullion-tracker/id1482556283'),
    ('True Gold（App Store）', 'https://apps.apple.com/us/app/true-gold/id6753170564'),
    ('GOLD NOW by Hua Seng Heng（App Store）', 'https://apps.apple.com/us/app/gold-now-by-hua-seng-heng/id1577898799'),
    ('ราคาทองวันนี้ GoldPrice Update（App Store）', 'https://apps.apple.com/us/app/id1058221513'),
    ('Giá Vàng - Tỷ Giá Ngoại Tệ（App Store）', 'https://apps.apple.com/us/app/id1202159809'),
    ('Gemmo: Gold Calculator & Scan（App Store）', 'https://apps.apple.com/us/app/gemmo-gold-calculator-scan/id6782878832'),
    ('Easy Gold Calculator（App Store）', 'https://apps.apple.com/us/app/easy-gold-calculator/id6499059320'),
    ('Yahoo Finance GC=F', 'https://finance.yahoo.com/quote/GC=F/'),
    ('gold-api.com XAU/USD', 'https://gold-api.com/'),
    ('open.er-api.com FX', 'https://open.er-api.com/'),
]
for idx, (name, url) in enumerate(sources, start=1):
    p = doc.add_paragraph()
    p.paragraph_format.space_after = Pt(3)
    p.paragraph_format.left_indent = Cm(0.5)
    p.paragraph_format.first_line_indent = Cm(-0.5)
    r = p.add_run(f'[{idx}] ')
    set_cn_font(r, size=8, bold=True, color=GOLD)
    r = p.add_run(name + ' — ')
    set_cn_font(r, size=8, color=INK)
    add_hyperlink(p, url, url, color='B8892E')
    r = p.add_run('（访问于 2026-10-23）')
    set_cn_font(r, size=7.5, color=MUT)

h2('MVP 文件与复现', 'D.1')
body_text('运行：cd mvp && node server.mjs，打开 http://127.0.0.1:5188。无需安装依赖。')

table_caption('表 D1 · 交付文件')
add_table(
    ['路径', '内容'],
    [
        ['mvp/server.mjs', 'Node 服务：静态文件、/api/market、/health、60s 缓存、fallback'],
        ['mvp/public/index.html / styles.css / app.js', '页面、视觉、计算逻辑、图表、持仓、提醒'],
        ['mvp/data/fallback.json', '最近市场快照（接口失败时降级）'],
        ['research/collect_trends.py / collect_groups.py', '日热搜与 12 个月兴趣采集'],
        ['research/make_charts.py', '报告图表生成'],
        ['research/e2e/test.cjs', 'Playwright 端到端验证'],
    ],
    [6.4, 10.0],
    font_size=7.9
)

# Document properties
doc.core_properties.title = '从热搜到买单：Google Trends 黄金购买决策机会与 MVP'
doc.core_properties.author = 'GoldLens Research'
doc.core_properties.subject = 'Google Trends 应用机会研究、竞品对标与 MVP'
doc.core_properties.keywords = 'Google Trends, 黄金, GoldLens, MVP, 竞品分析'
doc.core_properties.comments = 'Data sampled 2026-10-23. For discussion only.'

doc.save(OUT)
print('saved', OUT, os.path.getsize(OUT))
