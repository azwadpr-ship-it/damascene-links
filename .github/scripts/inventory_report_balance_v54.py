from pathlib import Path

# Tighten adaptive scaling only; first report page remains natural scale (=1),
# and the dedicated juice spread page does not use this adaptive factor.
p=Path('inventory/report-v32.js')
s=p.read_text(encoding='utf-8')
count=s.count('1.28')
if count < 4:
    raise SystemExit(f'expected at least 4 adaptive 1.28 markers, found {count}')
s=s.replace('1.28','1.17')
p.write_text(s,encoding='utf-8')

# Version the outer loader so phones do not keep the v53 report script.
p=Path('inventory/index.html')
s=p.read_text(encoding='utf-8')
old="addScript(d,'branch-report-stable-v53-js','/inventory/branch-report-stable-v53.js?v=1')"
new="addScript(d,'branch-report-stable-v54-js','/inventory/branch-report-stable-v54.js?v=1')"
if old not in s:
    raise SystemExit('v53 loader hook not found')
s=s.replace(old,new)
if '/inventory/original.html?v=53' not in s:
    raise SystemExit('original v53 marker not found')
s=s.replace('/inventory/original.html?v=53','/inventory/original.html?v=54',1)
p.write_text(s,encoding='utf-8')
