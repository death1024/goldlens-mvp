# -*- coding: utf-8 -*-
import json
import os
import sys

sys.path.insert(0, os.path.dirname(__file__))

from pypdf import PdfReader
from tech_plan_lib import Plan, ROOT
import arch_upgrade_content

P = Plan()
arch_upgrade_content.add(P)

pdf_path = os.path.join(ROOT, 'docs', 'GoldLens_2.1_架构优化方案.pdf')
reader = PdfReader(pdf_path)
texts = [(page.extract_text() or '') for page in reader.pages]
page_map = {}
cursor = 2
for num, title in P.sections:
    needle = title.replace(' ', '')
    for index in range(cursor, len(texts)):
        text = texts[index]
        lines = [line.strip() for line in text.splitlines()]
        compact = text.replace(' ', '').replace('\n', '')
        if title in lines or needle in compact:
            page_map[title] = index
            cursor = index
            break

out = os.path.join(ROOT, 'docs', '.arch_page_map.json')
json.dump(page_map, open(out, 'w', encoding='utf-8'), ensure_ascii=False, indent=2)
print(json.dumps(page_map, ensure_ascii=False, indent=2))
print('pages', len(reader.pages))
