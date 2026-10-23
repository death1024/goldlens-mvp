# -*- coding: utf-8 -*-
import json
import os
import sys

sys.path.insert(0, os.path.dirname(__file__))

from tech_plan_lib import Plan, ROOT, render_docx, render_markdown
import tech_plan_part1
import tech_plan_part2
import tech_plan_part3

P = Plan()
tech_plan_part1.add(P)
tech_plan_part2.add(P)
tech_plan_part3.add(P)

page_map_path = os.path.join(ROOT, 'docs', '.tech_page_map.json')
page_map = {}
if os.path.exists(page_map_path):
    page_map = json.load(open(page_map_path, encoding='utf-8'))

docx_path = os.path.join(ROOT, 'docs', 'GoldLens_2.0_技术方案.docx')
md_path = os.path.join(ROOT, 'docs', 'TECHNICAL_PLAN.md')

render_docx(P, docx_path, page_map)
render_markdown(P, md_path)
print('saved', docx_path)
print('saved', md_path)
print('sections', len(P.sections), 'blocks', len(P.blocks))
