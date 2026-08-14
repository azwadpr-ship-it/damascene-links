from pathlib import Path

report=Path('inventory/report-v32.js')
s=report.read_text(encoding='utf-8')
old="""  if(share&&navigator.share){
   const canAll=!navigator.canShare||navigator.canShare({files:allFiles});
   if(canAll){
    try{
     await navigator.share({files:allFiles,title:'تقرير الجرد اليومي',text:`${r.branch} - ${r.reportDate}`});
     return toast('تم تجهيز الصور وملف PDF للمشاركة');
    }catch(e){if(e?.name==='AbortError')return}
   }
   const canImages=!navigator.canShare||navigator.canShare({files});
   if(canImages){
    try{
     await navigator.share({files,title:'تقرير الجرد اليومي',text:`${r.branch} - ${r.reportDate}`});
     return toast('تمت مشاركة الصور؛ لإرسال PDF استخدم زر مشاركة PDF');
    }catch(e){if(e?.name==='AbortError')return}
   }
  }"""
new="""  if(share&&navigator.share){
   const canImages=!navigator.canShare||navigator.canShare({files});
   if(canImages){
    try{
     await navigator.share({files});
     return toast('تم تجهيز صور التقرير للمشاركة');
    }catch(e){if(e?.name==='AbortError')return}
   }
  }"""
if old not in s:
    raise SystemExit('mixed share block not found')
s=s.replace(old,new,1)
report.write_text(s,encoding='utf-8')

loader=Path('inventory/branch-report-stable-v57.js')
l=loader.read_text(encoding='utf-8')
l=l.replace('__branchReportStableV60','__branchReportStableV62')
l=l.replace("report-v32-v60-js","report-v32-v62-js")
l=l.replace("/inventory/report-v32.js?v=60","/inventory/report-v32.js?v=62")
loader.write_text(l,encoding='utf-8')

idx=Path('inventory/index.html')
i=idx.read_text(encoding='utf-8')
if '/inventory/branch-report-stable-v57.js?v=2' not in i:
    raise SystemExit('branch loader cache marker not found')
i=i.replace('/inventory/branch-report-stable-v57.js?v=2','/inventory/branch-report-stable-v57.js?v=3')
if '/inventory/original.html?v=61' not in i:
    raise SystemExit('original v61 marker not found')
i=i.replace('/inventory/original.html?v=61','/inventory/original.html?v=62',1)
idx.write_text(i,encoding='utf-8')
