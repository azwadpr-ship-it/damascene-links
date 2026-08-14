from pathlib import Path

report = Path('inventory/report-v32.js')
s = report.read_text(encoding='utf-8')

needle = "function reportFormat(n){\n const x=Math.round((n+Number.EPSILON)*1000)/1000;\n return Number.isInteger(x)?String(x):String(x).replace(/\\.?0+$/,'');\n}\n"
insert = needle + "function shareDate(iso){\n const p=String(iso||'').split('-');\n return p.length===3?`${p[2]}-${p[1]}-${p[0]}`:String(iso||'');\n}\n"
if 'function shareDate(iso)' not in s:
    if needle not in s: raise SystemExit('reportFormat anchor not found')
    s = s.replace(needle, insert, 1)

old = "const cvs=await canvases(r),safe=r.branch.replace(/\\s+/g,'-').replace(/[^\\u0600-\\u06FF\\w-]/g,''),files=[],jpegBlobs=[];"
new = "const cvs=await canvases(r),dateLabel=shareDate(r.reportDate),caption=`${r.branch} - ${dateLabel}`,cleanBranch=r.branch.replace(/[^\\u0600-\\u06FF\\w ]/g,'').replace(/\\s+/g,' ').trim(),files=[],jpegBlobs=[];"
if old not in s: raise SystemExit('make anchor not found')
s = s.replace(old, new, 1)

old = "files.push(new File([b],`جرد-${safe}-${r.reportDate}${s}.jpg`,{type:'image/jpeg'}));"
new = "files.push(new File([b],`${cleanBranch} ${dateLabel}${s?` ${i+1}`:''}.jpg`,{type:'image/jpeg'}));"
if old not in s: raise SystemExit('jpg filename anchor not found')
s = s.replace(old, new, 1)

old = "const pdfFile=new File([pdfBlob],`جرد-${safe}-${r.reportDate}.pdf`,{type:'application/pdf'});"
new = "const pdfFile=new File([pdfBlob],`${cleanBranch} ${dateLabel}.pdf`,{type:'application/pdf'});"
if old not in s: raise SystemExit('pdf filename anchor not found')
s = s.replace(old, new, 1)

old = "await navigator.share({files:onlyPdf,title:'تقرير الجرد اليومي',text:`${r.branch} - ${r.reportDate}`});"
new = "await navigator.share({files:onlyPdf,title:'تقرير الجرد اليومي',text:caption});"
if old not in s: raise SystemExit('pdf share anchor not found')
s = s.replace(old, new, 1)

old = "await navigator.share({files});"
new = "await navigator.share({files,text:caption});"
if old not in s: raise SystemExit('image share anchor not found')
s = s.replace(old, new, 1)

report.write_text(s, encoding='utf-8')

loader = Path('inventory/branch-report-stable-v57.js')
l = loader.read_text(encoding='utf-8')
l = l.replace('window.__branchReportStableV62', 'window.__branchReportStableV63')
l = l.replace("report-v32-v62-js", "report-v32-v63-js")
l = l.replace("/inventory/report-v32.js?v=62", "/inventory/report-v32.js?v=63")
loader.write_text(l, encoding='utf-8')

index = Path('inventory/index.html')
i = index.read_text(encoding='utf-8')
i = i.replace("/inventory/branch-report-stable-v57.js?v=3", "/inventory/branch-report-stable-v57.js?v=4")
i = i.replace("/inventory/original.html?v=62", "/inventory/original.html?v=63")
index.write_text(i, encoding='utf-8')

print('v63 caption patch applied')
