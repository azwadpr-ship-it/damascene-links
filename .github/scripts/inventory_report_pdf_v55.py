from pathlib import Path

p=Path('inventory/report-v32.js')
s=p.read_text(encoding='utf-8')

blob_line="const blob=cv=>new Promise((ok,no)=>cv.toBlob(b=>b?ok(b):no(new Error('تعذر إنشاء الصورة')),'image/jpeg',.95));\n"
if blob_line not in s:
    raise SystemExit('blob marker not found')
if 'async function pdfFromJpegs' not in s:
    pdf_code=r'''const PDF_ENC=new TextEncoder();
function pdfText(s){return PDF_ENC.encode(s)}
async function pdfFromJpegs(jpegs){
 const chunks=[],offsets=[0];let pos=0;
 const push=v=>{const b=typeof v==='string'?pdfText(v):v;chunks.push(b);pos+=b.length};
 const n=jpegs.length,total=2+n*3;
 const obj=id=>{offsets[id]=pos;push(`${id} 0 obj\n`)};
 push('%PDF-1.4\n%DMG1\n');
 obj(1);push('<< /Type /Catalog /Pages 2 0 R >>\nendobj\n');
 const kids=Array.from({length:n},(_,i)=>`${3+i*3} 0 R`).join(' ');
 obj(2);push(`<< /Type /Pages /Kids [${kids}] /Count ${n} >>\nendobj\n`);
 for(let i=0;i<n;i++){
  const pageId=3+i*3,imgId=pageId+1,contentId=pageId+2,name=`Im${i}`;
  obj(pageId);push(`<< /Type /Page /Parent 2 0 R /MediaBox [0 0 540 960] /Resources << /XObject << /${name} ${imgId} 0 R >> >> /Contents ${contentId} 0 R >>\nendobj\n`);
  const img=new Uint8Array(await jpegs[i].arrayBuffer());
  obj(imgId);push(`<< /Type /XObject /Subtype /Image /Width 1080 /Height 1920 /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${img.length} >>\nstream\n`);push(img);push('\nendstream\nendobj\n');
  const content=pdfText(`q\n540 0 0 960 0 0 cm\n/${name} Do\nQ\n`);
  obj(contentId);push(`<< /Length ${content.length} >>\nstream\n`);push(content);push('endstream\nendobj\n');
 }
 const xref=pos;push(`xref\n0 ${total+1}\n0000000000 65535 f \n`);
 for(let id=1;id<=total;id++)push(`${String(offsets[id]).padStart(10,'0')} 00000 n \n`);
 push(`trailer\n<< /Size ${total+1} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF`);
 return new Blob(chunks,{type:'application/pdf'});
}
'''
    s=s.replace(blob_line,blob_line+pdf_code,1)

old_start="const cvs=await canvases(r),safe=r.branch.replace(/\\s+/g,'-').replace(/[^\\u0600-\\u06FF\\w-]/g,''),files=[];"
new_start="const cvs=await canvases(r),safe=r.branch.replace(/\\s+/g,'-').replace(/[^\\u0600-\\u06FF\\w-]/g,''),files=[],jpegBlobs=[];"
if old_start not in s:
    raise SystemExit('make start marker not found')
s=s.replace(old_start,new_start,1)

old_push="""   const b=await blob(cvs[i]),s=cvs.length>1?`-${i+1}`:'';\n   files.push(new File([b],`جرد-${safe}-${r.reportDate}${s}.jpg`,{type:'image/jpeg'}));\n  }\n  if(share&&navigator.share&&(!navigator.canShare||navigator.canShare({files}))){\n   await navigator.share({files,title:'تقرير الجرد اليومي',text:`${r.branch} - ${r.reportDate}`});\n   return toast('تم تجهيز التقرير للمشاركة');\n  }\n  await download(files);\n  if(share){\n   setTimeout(()=>window.open('https://wa.me/?text='+encodeURIComponent(`تقرير الجرد اليومي - ${r.branch} - ${r.reportDate}`),'_blank'),250);\n   toast('تم تنزيل التقرير وفتح واتساب');\n  }else toast(files.length>1?`تم إنشاء ${files.length} صور 9:16`:'تم إنشاء التقرير 9:16');"""
new_push="""   const b=await blob(cvs[i]),s=cvs.length>1?`-${i+1}`:'';\n   jpegBlobs.push(b);\n   files.push(new File([b],`جرد-${safe}-${r.reportDate}${s}.jpg`,{type:'image/jpeg'}));\n  }\n  const pdfBlob=await pdfFromJpegs(jpegBlobs);\n  const pdfFile=new File([pdfBlob],`جرد-${safe}-${r.reportDate}.pdf`,{type:'application/pdf'});\n  const allFiles=[...files,pdfFile];\n  if(share&&navigator.share){\n   const canAll=!navigator.canShare||navigator.canShare({files:allFiles});\n   if(canAll){\n    try{\n     await navigator.share({files:allFiles,title:'تقرير الجرد اليومي',text:`${r.branch} - ${r.reportDate}`});\n     return toast('تم تجهيز الصور وملف PDF للمشاركة');\n    }catch(e){if(e?.name==='AbortError')return}\n   }\n   const canImages=!navigator.canShare||navigator.canShare({files});\n   if(canImages){\n    try{\n     await navigator.share({files,title:'تقرير الجرد اليومي',text:`${r.branch} - ${r.reportDate}`});\n     await download([pdfFile]);\n     return toast('تمت مشاركة الصور وتنزيل PDF لأن الجهاز لا يدعم إرساله معها');\n    }catch(e){if(e?.name==='AbortError')return}\n   }\n  }\n  if(share){\n   await download(allFiles);\n   setTimeout(()=>window.open('https://wa.me/?text='+encodeURIComponent(`تقرير الجرد اليومي - ${r.branch} - ${r.reportDate}`),'_blank'),250);\n   toast('تم تنزيل الصور وPDF وفتح واتساب');\n  }else{\n   await download(files);\n   toast(files.length>1?`تم إنشاء ${files.length} صور 9:16`:'تم إنشاء التقرير 9:16');\n  }"""
if old_push not in s:
    raise SystemExit('share block marker not found')
s=s.replace(old_push,new_push,1)
p.write_text(s,encoding='utf-8')

p=Path('inventory/index.html')
s=p.read_text(encoding='utf-8')
old="addScript(d,'branch-report-stable-v54-js','/inventory/branch-report-stable-v54.js?v=1')"
new="addScript(d,'branch-report-stable-v55-js','/inventory/branch-report-stable-v55.js?v=1')"
if old not in s:
    raise SystemExit('v54 loader hook not found')
s=s.replace(old,new)
if '/inventory/original.html?v=54' not in s:
    raise SystemExit('original v54 marker not found')
s=s.replace('/inventory/original.html?v=54','/inventory/original.html?v=55',1)
p.write_text(s,encoding='utf-8')
