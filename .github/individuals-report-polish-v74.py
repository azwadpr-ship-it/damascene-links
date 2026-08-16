from pathlib import Path

p=Path('inventory/report-v32.js')
s=p.read_text()

old="""function loadIndividualsReportLogo(){
 if(individualsReportLogo)return Promise.resolve(individualsReportLogo);
 if(individualsReportLogoLoading)return individualsReportLogoLoading;
 individualsReportLogoLoading=new Promise(resolve=>{const img=new Image();img.onload=()=>{individualsReportLogo=img;resolve(img)};img.onerror=()=>resolve(null);img.src=INDIVIDUALS_REPORT_LOGO});
 return individualsReportLogoLoading;
}
"""
new="""function cleanIndividualsReportLogo(img){
 try{
  const w=img.naturalWidth||img.width||250,h=img.naturalHeight||img.height||250;
  const src=document.createElement('canvas');src.width=w;src.height=h;const x=src.getContext('2d');x.drawImage(img,0,0,w,h);
  const im=x.getImageData(0,0,w,h),d=im.data;let minX=w,minY=h,maxX=-1,maxY=-1;
  for(let yy=0;yy<h;yy++)for(let xx=0;xx<w;xx++){const k=(yy*w+xx)*4,r=d[k],g=d[k+1],b=d[k+2];if(r>236&&g>236&&b>236)d[k+3]=0;else if(r>226&&g>226&&b>226)d[k+3]=Math.round(d[k+3]*.38);if(d[k+3]>14){if(xx<minX)minX=xx;if(xx>maxX)maxX=xx;if(yy<minY)minY=yy;if(yy>maxY)maxY=yy}}
  x.putImageData(im,0,0);if(maxX<minX||maxY<minY)return img;
  const pad=Math.max(2,Math.round(Math.min(w,h)*.015)),sx=Math.max(0,minX-pad),sy=Math.max(0,minY-pad),sw=Math.min(w-sx,maxX-minX+1+pad*2),sh=Math.min(h-sy,maxY-minY+1+pad*2);
  const out=document.createElement('canvas');out.width=sw;out.height=sh;out.getContext('2d').drawImage(src,sx,sy,sw,sh,0,0,sw,sh);return out;
 }catch{return img}
}
function loadIndividualsReportLogo(){
 if(individualsReportLogo)return Promise.resolve(individualsReportLogo);
 if(individualsReportLogoLoading)return individualsReportLogoLoading;
 individualsReportLogoLoading=new Promise(resolve=>{const img=new Image();img.onload=()=>{individualsReportLogo=cleanIndividualsReportLogo(img);resolve(individualsReportLogo)};img.onerror=()=>resolve(null);img.src=INDIVIDUALS_REPORT_LOGO});
 return individualsReportLogoLoading;
}
"""
if old not in s: raise SystemExit('individuals logo loader marker missing')
s=s.replace(old,new,1)

old=""" if(branded){
  c.drawImage(logo,P.W-P.M-92,42,82,82);
  c.fillStyle=t.accent;c.font='900 48px Tahoma,Arial';c.fillText(r.branch,P.W-P.M-112,94);
  c.fillStyle=t.text;c.font='800 31px Tahoma,Arial';c.fillText('تقرير الجرد اليومي',P.W-P.M-112,140);
 }else{
"""
new=""" if(branded){
  if(t.mode==='individuals'){
   const lw=118,lh=118,lx=P.W-P.M-lw,ly=31,tx=lx-22;
   c.drawImage(logo,lx,ly,lw,lh);
   c.fillStyle=t.accent;c.font='900 48px Tahoma,Arial';c.fillText(r.branch,tx,88);
   c.fillStyle=t.text;c.font='800 30px Tahoma,Arial';c.fillText('تقرير الجرد اليومي',tx,130);
   c.fillStyle=t.accent;round(c,tx-148,154,148,4,2);c.fill();
  }else{
   c.drawImage(logo,P.W-P.M-92,42,82,82);
   c.fillStyle=t.accent;c.font='900 48px Tahoma,Arial';c.fillText(r.branch,P.W-P.M-112,94);
   c.fillStyle=t.text;c.font='800 31px Tahoma,Arial';c.fillText('تقرير الجرد اليومي',P.W-P.M-112,140);
  }
 }else{
"""
if old not in s: raise SystemExit('header branded marker missing')
s=s.replace(old,new,1)

old=""" c.textAlign='left';c.fillStyle=t.text;c.font='900 47px Tahoma,Arial';c.fillText(d.weekday,P.M,82);
 c.fillStyle=t.dark;c.font='900 42px Tahoma,Arial';c.fillText(r.reportDate,P.M,130);
 c.fillStyle=t.muted;c.font='700 24px Tahoma,Arial';c.fillText(d.hijri,P.M,165);
 c.strokeStyle=t.line;c.lineWidth=1.2;c.beginPath();c.moveTo(P.M,196);c.lineTo(P.W-P.M,196);c.stroke();
"""
new=""" c.textAlign='left';
 if(t.mode==='individuals'){
  box(c,P.M,38,286,132,16,t.surface,t.line,false);c.fillStyle=t.accent;round(c,P.M,38,5,132,2);c.fill();
  c.fillStyle=t.dark;c.font='900 32px Tahoma,Arial';c.fillText(d.weekday,P.M+18,75);
  c.fillStyle=t.text;c.font='900 36px Tahoma,Arial';c.fillText(r.reportDate,P.M+18,119);
  c.fillStyle=t.muted;c.font='700 19px Tahoma,Arial';c.fillText(d.hijri,P.M+18,150);
 }else{
  c.fillStyle=t.text;c.font='900 47px Tahoma,Arial';c.fillText(d.weekday,P.M,82);
  c.fillStyle=t.dark;c.font='900 42px Tahoma,Arial';c.fillText(r.reportDate,P.M,130);
  c.fillStyle=t.muted;c.font='700 24px Tahoma,Arial';c.fillText(d.hijri,P.M,165);
 }
 c.strokeStyle=t.line;c.lineWidth=1.2;c.beginPath();c.moveTo(P.M,196);c.lineTo(P.W-P.M,196);c.stroke();
"""
if old not in s: raise SystemExit('date block marker missing')
s=s.replace(old,new,1)

old=""" box(c,P.M,titleY,P.W-P.M*2,titleH,15,t.accent,null,false);
 c.direction='rtl';c.textAlign='center';c.fillStyle='#fff';c.font='800 35px Tahoma,Arial';
"""
new=""" const flowHead=t.mode==='individuals'?t.dark:t.accent;
 box(c,P.M,titleY,P.W-P.M*2,titleH,15,flowHead,null,false);
 if(t.mode==='individuals'){c.fillStyle=t.accent;round(c,P.M,titleY,P.W-P.M*2,5,2);c.fill()}
 c.direction='rtl';c.textAlign='center';c.fillStyle='#fff';c.font='800 35px Tahoma,Arial';
"""
if old not in s: raise SystemExit('flow header marker missing')
s=s.replace(old,new,1)

old="const dp=i===0?p:balancePage(p);"
new="const dp=t.mode==='individuals'?balancePage(p):(i===0?p:balancePage(p));"
if old not in s: raise SystemExit('first page balance marker missing')
s=s.replace(old,new,1)

for marker in ['cleanIndividualsReportLogo',"t.mode==='individuals'?t.dark:t.accent","box(c,P.M,38,286,132",'const lw=118']:
    if marker not in s: raise SystemExit('verification missing '+marker)
p.write_text(s)

p=Path('inventory/branch-report-stable-v57.js');s=p.read_text()
if "report-v32-v66-js" not in s or "/inventory/report-v32.js?v=66" not in s: raise SystemExit('report loader v66 marker missing')
s=s.replace('report-v32-v66-js','report-v32-v67-js').replace('/inventory/report-v32.js?v=66','/inventory/report-v32.js?v=67')
p.write_text(s)

p=Path('inventory/index.html');s=p.read_text()
if '/inventory/branch-report-stable-v57.js?v=7' not in s: raise SystemExit('index loader v7 marker missing')
s=s.replace('/inventory/branch-report-stable-v57.js?v=7','/inventory/branch-report-stable-v57.js?v=8')
p.write_text(s)

assert 'https://damascene-links.vercel.app/inventory/whatsapp-preview.jpg' in Path('inventory/index.html').read_text()
print('Individuals report polish v74 verification PASS')
