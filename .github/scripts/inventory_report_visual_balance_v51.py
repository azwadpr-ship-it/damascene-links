from pathlib import Path

p=Path('inventory/report-v32.js')
s=p.read_text(encoding='utf-8')

old=""" if(pageCount>1){c.textAlign='left';c.fillStyle=t.muted;c.font='700 14px Tahoma,Arial';c.fillText(`صفحة ${pageNo} من ${pageCount}`,P.M,216);}\n"""
if old not in s:
    raise SystemExit('top page counter marker not found')
s=s.replace(old,'',1)

marker="""function card(c,b,t){\n"""
if marker not in s:
    raise SystemExit('card marker not found')
helper="""function flowSpreadRow(c,it,x,y,w,i,t,h){
 if(i%2){c.fillStyle=t.stripe;c.fillRect(x+8,y,w-16,h);}
 if(i){c.strokeStyle=t.line;c.beginPath();c.moveTo(x+12,y);c.lineTo(x+w-12,y);c.stroke();}
 c.direction='rtl';c.textAlign='right';c.fillStyle=t.text;
 fit(c,it.name,w-28,25,18,'800');c.fillText(ell(c,it.name,w-28),x+w-14,y+31);
 c.fillStyle=t.muted;c.font='600 17px Tahoma,Arial';
 c.fillText(ell(c,`أول ${it.opening} | وارد ${it.incoming} | آخر ${it.closing} | مباع ${it.sold} ${it.unit}`,w-28),x+w-14,y+h-17);
}
function drawFlowSpread(c,sec,t){
 const titleY=P.TOP,titleH=64,colGap=18,gridY=titleY+titleH+16;
 box(c,P.M,titleY,P.W-P.M*2,titleH,15,t.accent,null,false);
 c.direction='rtl';c.textAlign='center';c.fillStyle='#fff';c.font='800 32px Tahoma,Arial';
 c.fillText(sec.title,P.W/2,titleY+42);
 const items=sec.items||[],rows=Math.max(1,Math.ceil(items.length/2));
 const colW=(P.W-P.M*2-colGap)/2;
 const rh=Math.max(66,Math.min(84,Math.floor((P.BOTTOM-gridY-8)/rows)));
 for(let col=0;col<2;col++){
  const slice=items.slice(col*rows,(col+1)*rows);
  const x=col===0?P.W-P.M-colW:P.M;
  const h=Math.max(rh,slice.length*rh);
  box(c,x,gridY,colW,h,14,t.surface,t.line,true);
  slice.forEach((it,i)=>flowSpreadRow(c,it,x,gridY+i*rh,colW,i,t,rh));
 }
}
"""
s=s.replace(marker,helper+marker,1)

old=""" const pages=layout(r);
 pages.forEach((p,i)=>{
  const cv=document.createElement('canvas');cv.width=P.W;cv.height=P.H;const c=cv.getContext('2d');
  c.fillStyle=t.paper;c.fillRect(0,0,P.W,P.H);border(c,t);header(c,r,i+1,pages.length,p.app,t);p.cards.forEach(b=>card(c,b,t));footer(c,i+1,pages.length,t);out.push(cv);
 });
 return out;
"""
new=""" const special=r.sections.find(s=>s.type==='flow'&&s.items?.length>16&&s.title.includes('العصير'));
 const base=special?{...r,sections:r.sections.filter(s=>s!==special)}:r;
 const pages=layout(base),total=pages.length+(special?1:0);
 pages.forEach((p,i)=>{
  const cv=document.createElement('canvas');cv.width=P.W;cv.height=P.H;const c=cv.getContext('2d');
  c.fillStyle=t.paper;c.fillRect(0,0,P.W,P.H);border(c,t);header(c,r,i+1,total,p.app,t);p.cards.forEach(b=>card(c,b,t));footer(c,i+1,total,t);out.push(cv);
 });
 if(special){
  const cv=document.createElement('canvas');cv.width=P.W;cv.height=P.H;const c=cv.getContext('2d');
  c.fillStyle=t.paper;c.fillRect(0,0,P.W,P.H);border(c,t);header(c,r,total,total,null,t);drawFlowSpread(c,special,t);footer(c,total,total,t);out.push(cv);
 }
 return out;
"""
if old not in s:
    raise SystemExit('grill canvas block not found')
s=s.replace(old,new,1)
p.write_text(s,encoding='utf-8')

p=Path('inventory/index.html')
s=p.read_text(encoding='utf-8')
old="addScript(d,'branch-report-stable-v50-js','/inventory/branch-report-stable-v50.js?v=1')"
new="addScript(d,'branch-report-stable-v51-js','/inventory/branch-report-stable-v51.js?v=1')"
if old not in s:
    raise SystemExit('v50 loader hook not found')
s=s.replace(old,new)
if '/inventory/original.html?v=50' not in s:
    raise SystemExit('original v50 marker not found')
s=s.replace('/inventory/original.html?v=50','/inventory/original.html?v=51',1)
p.write_text(s,encoding='utf-8')
