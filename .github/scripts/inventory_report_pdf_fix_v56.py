from pathlib import Path

p=Path('inventory/report-v32.js')
s=p.read_text(encoding='utf-8')
start=s.find('async function pdfFromJpegs')
end=s.find('async function download(files)', start)
if start<0 or end<0:
    raise SystemExit('PDF function markers not found')
segment=s[start:end]
if '\\\\n' not in segment:
    raise SystemExit('expected double-escaped PDF newlines not found')
segment=segment.replace('\\\\n','\\n')
s=s[:start]+segment+s[end:]
p.write_text(s,encoding='utf-8')

p=Path('inventory/index.html')
s=p.read_text(encoding='utf-8')
old="addScript(d,'branch-report-stable-v55-js','/inventory/branch-report-stable-v55.js?v=1')"
new="addScript(d,'branch-report-stable-v56-js','/inventory/branch-report-stable-v56.js?v=1')"
if old not in s:
    raise SystemExit('v55 loader hook not found')
s=s.replace(old,new)
if '/inventory/original.html?v=55' not in s:
    raise SystemExit('original v55 marker not found')
s=s.replace('/inventory/original.html?v=55','/inventory/original.html?v=56',1)
p.write_text(s,encoding='utf-8')
