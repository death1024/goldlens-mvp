p='research/tech_plan_lib.py'
s=open(p,encoding='utf-8').read()
s=s.replace("def render_markdown(plan, output):\n    lines = [\n        '# GoldLens 2.0 技术方案',\n        '',\n        '> 从 MVP 到可用的现代黄金决策平台。',\n        '',\n        '**Version 1.0 · Proposed · 2026-10-23**',",
"def render_markdown(plan, output, title='GoldLens 2.0 技术方案', subtitle='从 MVP 到可用的现代黄金决策平台。', version='Version 1.0 · Proposed · 2026-10-23'):\n    lines = [\n        f'# {title}',\n        '',\n        f'> {subtitle}',\n        '',\n        f'**{version}**',")
open(p,'w',encoding='utf-8').write(s)

p='research/build_arch_upgrade.py'
s=open(p,encoding='utf-8').read()
s=s.replace("render_markdown(P, md_path)", "render_markdown(\n    P,\n    md_path,\n    title='GoldLens 2.1 架构优化方案',\n    subtitle='从 MVP 到体验优先的现代黄金决策平台。',\n    version='Version 1.1 · Proposed · 2026-10-23',\n)")
open(p,'w',encoding='utf-8').write(s)
print('markdown metadata patched')
