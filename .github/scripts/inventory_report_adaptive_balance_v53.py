from pathlib import Path

p=Path('inventory/report-v32.js')
s=p.read_text(encoding='utf-8')

# Scale row typography from the actual adaptive row height.
old="""function mobileSimpleRow(c,it,x,y,w,i,t,h=68){
 if(i%2){c.fillStyle=t.stripe;c.fillRect(x+7,y,w-14,h);}
 if(i){c.strokeStyle=t.line;c.beginPath();c.moveTo(x+10,y);c.lineTo(x+w-10,y);c.stroke();}
 c.direction='rtl';c.textAlign='right';c.fillStyle=t.text;
 fit(c,it.name,w-164,29,21,'800');c.fillText(ell(c,it.name,w-164),x+w-16,y+h/2+10);
 c.direction='ltr';c.textAlign='right';c.fillStyle=t.accent;c.font='900 31px Tahoma,Arial';c.fillText(String(it.value),x+134,y+h/2+10);
 c.textAlign='left';c.fillStyle=t.muted;c.font='700 20px Tahoma,Arial';c.fillText(String(it.unit||''),x+16,y+h/2+9);
}
function mobileFlowRow(c,it,x,y,w,i,t,h=76){
 if(i%2){c.fillStyle=t.stripe;c.fillRect(x+8,y,w-16,h);}
 if(i){c.strokeStyle=t.line;c.beginPath();c.moveTo(x+12,y);c.lineTo(x+w-12,y);c.stroke();}
 c.direction='rtl';c.textAlign='right';c.fillStyle=t.text;
 fit(c,it.name,w-28,29,21,'800');c.fillText(ell(c,it.name,w-28),x+w-14,y+31);
 c.fillStyle=t.muted;c.font='700 20px Tahoma,Arial';
 c.fillText(ell(c,`أول ${it.opening} | وارد ${it.incoming} | آخر ${it.closing} | مباع ${it.sold} ${it.unit}`,w-28),x+w-14,y+h-18);
}
"""
new="""function mobileSimpleRow(c,it,x,y,w,i,t,h=68){
 const z=Math.min(1.28,Math.max(1,h/68));
 if(i%2){c.fillStyle=t.stripe;c.fillRect(x+7,y,w-14,h);}
 if(i){c.strokeStyle=t.line;c.beginPath();c.moveTo(x+10,y);c.lineTo(x+w-10,y);c.stroke();}
 c.direction='rtl';c.textAlign='right';c.fillStyle=t.text;
 fit(c,it.name,w-164,29*z,21*z,'800');c.fillText(ell(c,it.name,w-164),x+w-16,y+h/2+10*z);
 c.direction='ltr';c.textAlign='right';c.fillStyle=t.accent;c.font=`900 ${31*z}px Tahoma,Arial`;c.fillText(String(it.value),x+134,y+h/2+10*z);
 c.textAlign='left';c.fillStyle=t.muted;c.font=`700 ${20*z}px Tahoma,Arial`;c.fillText(String(it.unit||''),x+16,y+h/2+9*z);
}
function mobileFlowRow(c,it,x,y,w,i,t,h=76){
 const z=Math.min(1.28,Math.max(1,h/76));
 if(i%2){c.fillStyle=t.stripe;c.fillRect(x+8,y,w-16,h);}
 if(i){c.strokeStyle=t.line;c.beginPath();c.moveTo(x+12,y);c.lineTo(x+w-12,y);c.stroke();}
 c.direction='rtl';c.textAlign='right';c.fillStyle=t.text;
 fit(c,it.name,w-28,29*z,21*z,'800');c.fillText(ell(c,it.name,w-28),x+w-14,y+31*z);
 c.fillStyle=t.muted;c.font=`700 ${20*z}px Tahoma,Arial`;
 c.fillText(ell(c,`أول ${it.opening} | وارد ${it.incoming} | آخر ${it.closing} | مباع ${it.sold} ${it.unit}`,w-28),x+w-14,y+h-18*z);
}
"""
if old not in s: raise SystemExit('mobile row block not found')
s=s.replace(old,new,1)

# Increase the movement line on the dedicated juice page.
s=s.replace("c.fillStyle=t.muted;c.font='700 21px Tahoma,Arial';\n c.fillText(ell(c,`أول ${it.opening} | وارد ${it.incoming} | آخر ${it.closing} | مباع ${it.sold} ${it.unit}`,w-28),x+w-14,y+h-17);",
            "c.fillStyle=t.muted;c.font='800 24px Tahoma,Arial';\n c.fillText(ell(c,`أول ${it.opening} | وارد ${it.incoming} | آخر ${it.closing} | مباع ${it.sold} ${it.unit}`,w-28),x+w-14,y+h-18);",1)

# Add adaptive balance helper before card renderer.
marker="function card(c,b,t){\n"
helper="""function balancePage(p){
 const start=p.app?P.TOP_APP:P.TOP;
 const out={...p,cards:[]};
 for(let col=0;col<GCOLS;col++){
  const x=P.M+(GCOLS-1-col)*(GCW+GGAP);
  const cards=p.cards.filter(b=>Math.abs(b.x-x)<2).sort((a,b)=>a.y-b.y);
  if(!cards.length)continue;
  const gapTotal=P.GAP*Math.max(0,cards.length-1);
  const natural=cards.reduce((sum,b)=>sum+b.h,0);
  const available=P.BOTTOM-start-gapTotal;
  const scale=Math.min(1.28,Math.max(1,available/natural));
  let y=start;
  cards.forEach(b=>{
   const h=Math.round(b.h*scale);
   out.cards.push({...b,y,h,scale});
   y+=h+P.GAP;
  });
 }
 return out;
}
"""
if marker not in s: raise SystemExit('card marker not found')
s=s.replace(marker,helper+marker,1)

# Make card internals respect adaptive scale.
old="""function card(c,b,t){
 const {sec,x,y,w,h}=b;box(c,x,y,w,h,14,t.surface,t.line,true);
 c.save();round(c,x,y,w,66,14);c.clip();c.fillStyle=t.mode==='mazaq'?t.dark:t.accent;c.fillRect(x,y,w,66);
 if(t.mode==='mazaq'){c.fillStyle=t.accent;c.fillRect(x,y,w,4);}c.restore();
 c.direction='rtl';c.textAlign='center';c.fillStyle='#fff';
 const title=sec.title;
 fit(c,title,w-26,33,24,'800');c.fillText(ell(c,title,w-26),x+w/2,y+44);
 let yy=y+66;
 if(sec.type==='simple')sec.items.forEach((it,i)=>{mobileSimpleRow(c,it,x,yy,w,i,t,68);yy+=68;});
 else if(sec.type==='flow')sec.items.forEach((it,i)=>{mobileFlowRow(c,it,x,yy,w,i,t,76);yy+=76;});
 else{
  c.direction='rtl';c.textAlign='right';c.fillStyle=t.text;c.font='700 27px Tahoma,Arial';
  const words=String(sec.items[0]?.name||'').split(' ');let line='',lines=[];
  for(const word of words){const n=line?line+' '+word:word;if(c.measureText(n).width>w-36&&line){lines.push(line);line=word}else line=n;}
  if(line)lines.push(line);lines.slice(0,4).forEach((ln,i)=>c.fillText(ln,x+w-18,yy+40+i*36));
 }
}
"""
new="""function card(c,b,t){
 const {sec,x,y,w,h}=b,z=Math.min(1.28,Math.max(1,b.scale||1));
 const headH=Math.round(66*z),simpleH=Math.round(68*z),flowH=Math.round(76*z);
 box(c,x,y,w,h,14,t.surface,t.line,true);
 c.save();round(c,x,y,w,headH,14);c.clip();c.fillStyle=t.mode==='mazaq'?t.dark:t.accent;c.fillRect(x,y,w,headH);
 if(t.mode==='mazaq'){c.fillStyle=t.accent;c.fillRect(x,y,w,4);}c.restore();
 c.direction='rtl';c.textAlign='center';c.fillStyle='#fff';
 const title=sec.title;
 fit(c,title,w-26,33*z,24*z,'800');c.fillText(ell(c,title,w-26),x+w/2,y+44*z);
 let yy=y+headH;
 if(sec.type==='simple')sec.items.forEach((it,i)=>{mobileSimpleRow(c,it,x,yy,w,i,t,simpleH);yy+=simpleH;});
 else if(sec.type==='flow')sec.items.forEach((it,i)=>{mobileFlowRow(c,it,x,yy,w,i,t,flowH);yy+=flowH;});
 else{
  c.direction='rtl';c.textAlign='right';c.fillStyle=t.text;c.font=`700 ${27*z}px Tahoma,Arial`;
  const words=String(sec.items[0]?.name||'').split(' ');let line='',lines=[];
  for(const word of words){const n=line?line+' '+word:word;if(c.measureText(n).width>w-36&&line){lines.push(line);line=word}else line=n;}
  if(line)lines.push(line);lines.slice(0,4).forEach((ln,i)=>c.fillText(ln,x+w-18,yy+40*z+i*36*z));
 }
}
"""
if old not in s: raise SystemExit('adaptive card block not found')
s=s.replace(old,new,1)

# Only pages after the first get adaptive stretching. Page 1 stays exactly as approved.
old=""" pages.forEach((p,i)=>{
  const cv=document.createElement('canvas');cv.width=P.W;cv.height=P.H;const c=cv.getContext('2d');
  c.fillStyle=t.paper;c.fillRect(0,0,P.W,P.H);border(c,t);header(c,r,i+1,total,p.app,t);p.cards.forEach(b=>card(c,b,t));footer(c,i+1,total,t);out.push(cv);
 });
"""
new=""" pages.forEach((p,i)=>{
  const cv=document.createElement('canvas');cv.width=P.W;cv.height=P.H;const c=cv.getContext('2d');
  const dp=i===0?p:balancePage(p);
  c.fillStyle=t.paper;c.fillRect(0,0,P.W,P.H);border(c,t);header(c,r,i+1,total,dp.app,t);dp.cards.forEach(b=>card(c,b,t));footer(c,i+1,total,t);out.push(cv);
 });
"""
if old not in s: raise SystemExit('pages render block not found')
s=s.replace(old,new,1)
p.write_text(s,encoding='utf-8')

# Version outer loader/index.
p=Path('inventory/index.html')
s=p.read_text(encoding='utf-8')
old="addScript(d,'branch-report-stable-v52-js','/inventory/branch-report-stable-v52.js?v=1')"
new="addScript(d,'branch-report-stable-v53-js','/inventory/branch-report-stable-v53.js?v=1')"
if old not in s: raise SystemExit('v52 loader hook not found')
s=s.replace(old,new)
if '/inventory/original.html?v=52' not in s: raise SystemExit('original v52 marker not found')
s=s.replace('/inventory/original.html?v=52','/inventory/original.html?v=53',1)
p.write_text(s,encoding='utf-8')
