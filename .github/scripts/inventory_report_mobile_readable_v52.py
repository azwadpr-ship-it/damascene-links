from pathlib import Path

p=Path('inventory/report-v32.js')
s=p.read_text(encoding='utf-8')

# Two-column grill layout constants (Mazaq keeps its dedicated layout).
needle="P.CW=(P.W-P.M*2-P.GAP*(P.COLS-1))/P.COLS;\n"
repl=needle+"const GCOLS=2,GGAP=18,GCW=(P.W-P.M*2-GGAP)/GCOLS;\n"
if needle not in s: raise SystemExit('P.CW marker not found')
s=s.replace(needle,repl,1)

needle="function cardH(s){return 56+s.items.length*rowH(s)+8;}\n"
repl=needle+"function mobileRowH(s){return s.type==='flow'?76:s.type==='notes'?142:68;}\nfunction mobileCardH(s){return 66+s.items.length*mobileRowH(s)+10;}\n"
if needle not in s: raise SystemExit('cardH marker not found')
s=s.replace(needle,repl,1)

# Grill layout: 2 columns, larger row heights, more pages instead of squeezing.
s=s.replace("if(s.type==='notes'||cardH(s)<=maxFresh){source.push(s);continue}","if(s.type==='notes'||mobileCardH(s)<=maxFresh){source.push(s);continue}",1)
s=s.replace("Math.floor((maxFresh-64)/rowH(s))","Math.floor((maxFresh-74)/mobileRowH(s))",1)
s=s.replace("const fresh=first=>({ys:Array(P.COLS).fill(first&&a?P.TOP_APP:P.TOP),cards:[],app:first?a:null});","const fresh=first=>({ys:Array(GCOLS).fill(first&&a?P.TOP_APP:P.TOP),cards:[],app:first?a:null});",1)
s=s.replace("const h=cardH(s);","const h=mobileCardH(s);",1)
s=s.replace("const col=slot.i,x=P.M+(P.COLS-1-col)*(P.CW+P.GAP),y=page.ys[col];\n  page.cards.push({sec:s,x,y,w:P.CW,h});","const col=slot.i,x=P.M+(GCOLS-1-col)*(GCW+GGAP),y=page.ys[col];\n  page.cards.push({sec:s,x,y,w:GCW,h});",1)

# Insert larger row renderers for grill pages.
marker="function flowSpreadRow(c,it,x,y,w,i,t,h){\n"
helper="""function mobileSimpleRow(c,it,x,y,w,i,t,h=68){
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
if marker not in s: raise SystemExit('flowSpreadRow marker not found')
s=s.replace(marker,helper+marker,1)

# Enlarge dedicated juice page.
s=s.replace("fit(c,it.name,w-28,25,18,'800');c.fillText(ell(c,it.name,w-28),x+w-14,y+31);","fit(c,it.name,w-30,30,22,'800');c.fillText(ell(c,it.name,w-30),x+w-15,y+34);",1)
s=s.replace("c.fillStyle=t.muted;c.font='600 17px Tahoma,Arial';","c.fillStyle=t.muted;c.font='700 21px Tahoma,Arial';",1)
s=s.replace("const rh=Math.max(66,Math.min(84,Math.floor((P.BOTTOM-gridY-8)/rows)));","const rh=Math.max(78,Math.min(96,Math.floor((P.BOTTOM-gridY-8)/rows)));",1)
s=s.replace("c.fillText(sec.title,P.W/2,titleY+42);","c.fillText(sec.title,P.W/2,titleY+43);",1)
s=s.replace("c.font='800 32px Tahoma,Arial';","c.font='800 35px Tahoma,Arial';",1)

# Larger grill card headers and rows.
old="""function card(c,b,t){
 const {sec,x,y,w,h}=b;box(c,x,y,w,h,14,t.surface,t.line,true);
 c.save();round(c,x,y,w,56,14);c.clip();c.fillStyle=t.mode==='mazaq'?t.dark:t.accent;c.fillRect(x,y,w,56);
 if(t.mode==='mazaq'){c.fillStyle=t.accent;c.fillRect(x,y,w,4);}c.restore();
 c.direction='rtl';c.textAlign='center';c.fillStyle='#fff';
 const title=sec.title;
 fit(c,title,w-22,28,21,'800');c.fillText(ell(c,title,w-22),x+w/2,y+37);
 let yy=y+56;
 if(sec.type==='simple')sec.items.forEach((it,i)=>{simpleRow(c,it,x,yy,w,i,t,52);yy+=52;});
 else if(sec.type==='flow')sec.items.forEach((it,i)=>{flowRow(c,it,x,yy,w,i,t);yy+=58;});
 else{
  c.direction='rtl';c.textAlign='right';c.fillStyle=t.text;c.font='600 22px Tahoma,Arial';
  const words=String(sec.items[0]?.name||'').split(' ');let line='',lines=[];
  for(const word of words){const n=line?line+' '+word:word;if(c.measureText(n).width>w-30&&line){lines.push(line);line=word}else line=n;}
  if(line)lines.push(line);lines.slice(0,4).forEach((ln,i)=>c.fillText(ln,x+w-15,yy+32+i*30));
 }
}
"""
new="""function card(c,b,t){
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
if old not in s: raise SystemExit('card block not found')
s=s.replace(old,new,1)

p.write_text(s,encoding='utf-8')

# Version the outer loader so mobile devices cannot keep the old report script.
p=Path('inventory/index.html')
s=p.read_text(encoding='utf-8')
old="addScript(d,'branch-report-stable-v51-js','/inventory/branch-report-stable-v51.js?v=1')"
new="addScript(d,'branch-report-stable-v52-js','/inventory/branch-report-stable-v52.js?v=1')"
if old not in s: raise SystemExit('v51 loader hook not found')
s=s.replace(old,new)
if '/inventory/original.html?v=51' not in s: raise SystemExit('original v51 marker not found')
s=s.replace('/inventory/original.html?v=51','/inventory/original.html?v=52',1)
p.write_text(s,encoding='utf-8')
