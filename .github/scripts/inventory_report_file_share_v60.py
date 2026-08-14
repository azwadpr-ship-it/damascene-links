from pathlib import Path

report=Path('inventory/report-v32.js')
s=report.read_text(encoding='utf-8')

old="async function make(share){"
new="async function make(mode){\n const share=mode===true||mode==='images';\n const pdfOnly=mode==='pdf';"
if old not in s:
    raise SystemExit('make signature marker not found')
s=s.replace(old,new,1)

marker="  const allFiles=[...files,pdfFile];"
insert="""  const allFiles=[...files,pdfFile];
  if(pdfOnly){
   if(navigator.share){
    const onlyPdf=[pdfFile];
    const canPdf=!navigator.canShare||navigator.canShare({files:onlyPdf});
    if(canPdf){
     try{
      await navigator.share({files:onlyPdf,title:'تقرير الجرد اليومي',text:`${r.branch} - ${r.reportDate}`});
      return toast('تم تجهيز ملف PDF للمشاركة');
     }catch(e){if(e?.name==='AbortError')return}
    }
   }
   await download([pdfFile]);
   return toast('المتصفح لا يدعم إرفاق PDF مباشرة؛ تم تنزيل الملف',true);
  }"""
if marker not in s:
    raise SystemExit('allFiles marker not found')
s=s.replace(marker,insert,1)

old_images="""   const canImages=!navigator.canShare||navigator.canShare({files});
   if(canImages){
    try{
     await navigator.share({files,title:'تقرير الجرد اليومي',text:`${r.branch} - ${r.reportDate}`});
     await download([pdfFile]);
     return toast('تمت مشاركة الصور وتنزيل PDF لأن الجهاز لا يدعم إرساله معها');
    }catch(e){if(e?.name==='AbortError')return}
   }"""
new_images="""   const canImages=!navigator.canShare||navigator.canShare({files});
   if(canImages){
    try{
     await navigator.share({files,title:'تقرير الجرد اليومي',text:`${r.branch} - ${r.reportDate}`});
     return toast('تمت مشاركة الصور؛ لإرسال PDF استخدم زر مشاركة PDF');
    }catch(e){if(e?.name==='AbortError')return}
   }"""
if old_images not in s:
    raise SystemExit('image share block not found')
s=s.replace(old_images,new_images,1)

old_fallback="""  if(share){
   await download(allFiles);
   setTimeout(()=>window.open('https://wa.me/?text='+encodeURIComponent(`تقرير الجرد اليومي - ${r.branch} - ${r.reportDate}`),'_blank'),250);
   toast('تم تنزيل الصور وPDF وفتح واتساب');
  }else{"""
new_fallback="""  if(share){
   await download(allFiles);
   return toast('المتصفح لا يدعم إرفاق ملفات التقرير مباشرة؛ تم تنزيل الصور وPDF',true);
  }else{"""
if old_fallback not in s:
    raise SystemExit('text WhatsApp fallback not found')
s=s.replace(old_fallback,new_fallback,1)

old_event="""document.addEventListener('click',e=>{
 const b=e.target.closest?.('#jpg,#share');if(!b)return;
 e.preventDefault();e.stopPropagation();e.stopImmediatePropagation();make(b.id==='share');
},true);"""
new_event="""document.addEventListener('click',e=>{
 const b=e.target.closest?.('#jpg,#share,#pdfShare');if(!b)return;
 e.preventDefault();e.stopPropagation();e.stopImmediatePropagation();
 const mode=b.id==='pdfShare'?'pdf':b.id==='share'?'images':'download';
 make(mode);
},true);"""
if old_event not in s:
    raise SystemExit('report click handler not found')
s=s.replace(old_event,new_event,1)
report.write_text(s,encoding='utf-8')

orig=Path('inventory/original.html')
o=orig.read_text(encoding='utf-8')
old_buttons='<button class="btn" id="jpg">إنشاء JPG</button><button class="btn primary" id="share">مشاركة واتساب</button>'
new_buttons='<button class="btn" id="jpg">إنشاء JPG</button><button class="btn primary" id="share">مشاركة الصور</button><button class="btn" id="pdfShare">مشاركة PDF</button>'
if old_buttons not in o:
    raise SystemExit('original report buttons marker not found')
o=o.replace(old_buttons,new_buttons,1)
orig.write_text(o,encoding='utf-8')

idx=Path('inventory/index.html')
i=idx.read_text(encoding='utf-8')
if "/inventory/branch-report-stable-v57.js?v=1" not in i:
    raise SystemExit('loader version marker not found')
i=i.replace('/inventory/branch-report-stable-v57.js?v=1','/inventory/branch-report-stable-v57.js?v=2')
if '/inventory/original.html?v=59' not in i:
    raise SystemExit('original version marker not found')
i=i.replace('/inventory/original.html?v=59','/inventory/original.html?v=60',1)
idx.write_text(i,encoding='utf-8')
