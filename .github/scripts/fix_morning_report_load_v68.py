from pathlib import Path

p = Path('inventory/morning/morning-report-v1.js')
s = p.read_text(encoding='utf-8')

old = "async function loadDay(date){const loaded=await loadDay(date);try{loaded.data.inventory_snapshot=await snapshot(date)}catch(e){console.error('morning report snapshot',e)}return loaded}"
new = "async function loadDay(date){const loaded=await post('receiving_load',{date});try{loaded.data.inventory_snapshot=await snapshot(date)}catch(e){console.error('morning report snapshot',e)}return loaded}"
if old not in s:
    raise SystemExit('recursive loadDay marker missing')
s = s.replace(old, new, 1)

old = "try{const loaded=await post('receiving_load',{date});if(seq!==reportCheckSeq)return;const count="
new = "try{const loaded=await loadDay(date);if(seq!==reportCheckSeq)return;const count="
if old not in s:
    raise SystemExit('refresh loader marker missing')
s = s.replace(old, new, 1)

old = "if(window.__morningReportV7)return;window.__morningReportV7=true;"
new = "if(window.__morningReportV8)return;window.__morningReportV8=true;"
if old not in s:
    raise SystemExit('report guard marker missing')
s = s.replace(old, new, 1)

p.write_text(s, encoding='utf-8')

shell = Path('inventory/morning-shell.html')
h = shell.read_text(encoding='utf-8')
if 'morning-report-v1.js?v=6' not in h:
    raise SystemExit('report cache marker missing')
h = h.replace('morning-report-v1.js?v=6', 'morning-report-v1.js?v=7', 1)
shell.write_text(h, encoding='utf-8')
