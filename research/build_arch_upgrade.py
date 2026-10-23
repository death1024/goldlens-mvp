# -*- coding: utf-8 -*-
import json
import os
import sys

sys.path.insert(0, os.path.dirname(__file__))

from tech_plan_lib import Plan, ROOT, render_docx, render_markdown
import arch_upgrade_content

P = Plan()
arch_upgrade_content.add(P)

page_map_path = os.path.join(ROOT, 'docs', '.arch_page_map.json')
page_map = {}
if os.path.exists(page_map_path):
    page_map = json.load(open(page_map_path, encoding='utf-8'))

docx_path = os.path.join(ROOT, 'docs', 'GoldLens_2.1_架构优化方案.docx')
md_path = os.path.join(ROOT, 'docs', 'ARCHITECTURE_UPGRADE_V1.1.md')

render_docx(
    P,
    docx_path,
    page_map,
    cover='arch-cover.png',
    header_text='GOLDLENS 2.1  /  EXPERIENCE-FIRST ARCHITECTURE  /  2026.10',
    toc_title='架构优化 · 目录',
    doc_title='GoldLens 2.1 体验优先架构方案',
)
render_markdown(
    P,
    md_path,
    title='GoldLens 2.1 架构优化方案',
    subtitle='从 MVP 到体验优先的现代黄金决策平台。',
    version='Version 1.1 · Proposed · 2026-10-23',
)
print('saved', docx_path)
print('saved', md_path)
print('sections', len(P.sections), 'blocks', len(P.blocks))
