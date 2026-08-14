(()=>{'use strict';
if(window.__reportV31Loaded)return;window.__reportV31Loaded=true;
const qsa=(s,r=document)=>Array.from(r.querySelectorAll(s));
const txt=e=>String(e?.textContent||'').trim();
const hasVal=e=>!!e&&e.value!==''&&e.value!==null&&e.value!==undefined;
const P={W:1080,H:1920,M:34,BOTTOM:1824,GAP:12,COLS:3,TOP:246,TOP_APP:314};
P.CW=(P.W-P.M*2-P.GAP*(P.COLS-1))/P.COLS;
const GCOLS=2,GGAP=18,GCW=(P.W-P.M*2-GGAP)/GCOLS;

function toast(msg,bad=false){
 let t=document.querySelector('.report-v31-toast');
 if(!t){
  t=document.createElement('div');
  t.className='report-v31-toast';
  Object.assign(t.style,{position:'fixed',left:'18px',bottom:'86px',zIndex:'99999',padding:'10px 14px',borderRadius:'10px',font:'700 12px Tahoma,Arial',color:'#fff',background:'#2f2a23',boxShadow:'0 8px 24px rgba(0,0,0,.18)',transition:'.18s',opacity:'0'});
  document.body.appendChild(t);
 }
 t.textContent=msg;t.style.background=bad?'#9f433b':'#2f2a23';t.style.opacity='1';
 clearTimeout(window.__rv31);window.__rv31=setTimeout(()=>t.style.opacity='0',2600);
}
function previousDay(iso){
 try{
  const d=new Date(iso+'T12:00:00+03:00');d.setDate(d.getDate()-1);
  return new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Riyadh',year:'numeric',month:'2-digit',day:'2-digit'}).format(d);
 }catch{return iso}
}
function dateParts(iso){
 try{
  const d=new Date(iso+'T12:00:00+03:00');
  return{
   weekday:new Intl.DateTimeFormat('ar-SA',{weekday:'long',timeZone:'Asia/Riyadh'}).format(d),
   hijri:new Intl.DateTimeFormat('ar-SA-u-ca-islamic-umalqura',{year:'numeric',month:'long',day:'numeric',timeZone:'Asia/Riyadh'}).format(d)
  };
 }catch{return{weekday:'',hijri:''}}
}
function simpleFromInput(input){
 if(!hasVal(input))return null;
 const card=input.closest('.item');
 let name=txt(card?.querySelector('.name')),unit=txt(card?.querySelector('.unit'));
 const aria=String(input.getAttribute('aria-label')||'').trim();
 if((!name||!unit)&&aria.startsWith('مخزون نهاية اليوم - ')){
  const p=aria.slice('مخزون نهاية اليوم - '.length).split(' - ');
  name=name||p[0]||'';unit=unit||p.slice(1).join(' - ');
 }
 return name?{name,value:String(input.value),unit}:null;
}
function reportNumber(v){
 const n=Number(String(v??'0').replace(',','.'));
 return Number.isFinite(n)?n:0;
}
function reportFormat(n){
 const x=Math.round((n+Number.EPSILON)*1000)/1000;
 return Number.isInteger(x)?String(x):String(x).replace(/\.?0+$/,'');
}
function regularSodaInfo(name,unit){
 let raw=String(name||'').trim().replace(/\s+/g,' ');
 if(!/(بيبسي|سفن|ميرندا|ديو|شاني|كوكا|كولا|مشروبات غازية)/.test(raw))return null;
 if(/(عائلي|عائلية|فاميلي)/.test(raw))return null;
 let carton=/كرتون/.test(String(unit||''));
 if(/^كرتون\s+/.test(raw)){carton=true;raw=raw.replace(/^كرتون\s+/,'').trim();}
 if(/\s*-\s*كرتون$/.test(raw)){carton=true;raw=raw.replace(/\s*-\s*كرتون$/,'').trim();}
 raw=raw.replace(/\s*-\s*(حبة|علبة)$/,'').trim();
 return raw?{base:raw,carton}:null;
}
function mergeRegularSodaUnits(sections){
 return sections.map(sec=>{
  if(!sec?.items?.length||!['simple','flow'].includes(sec.type))return sec;
  const groups=new Map();
  sec.items.forEach((it,index)=>{
   const info=regularSodaInfo(it.name,it.unit);if(!info)return;
   let g=groups.get(info.base);
   if(!g){g={base:info.base,first:index,rows:[]};groups.set(info.base,g)}
   g.rows.push({it,index,factor:info.carton?24:1,carton:info.carton});
  });
  if(!groups.size)return sec;
  const out=[];
  for(let i=0;i<sec.items.length;i++){
   const it=sec.items[i],info=regularSodaInfo(it.name,it.unit);
   if(!info){out.push(it);continue}
   const g=groups.get(info.base);
   if(!g||i!==g.first)continue;
   const hasCarton=g.rows.some(r=>r.carton);
   if(!hasCarton){out.push(it);continue}
   if(sec.type==='simple'){
    const value=g.rows.reduce((sum,r)=>sum+reportNumber(r.it.value)*r.factor,0);
    out.push({name:g.base,value:reportFormat(value),unit:'حبة'});
   }else{
    const opening=g.rows.reduce((sum,r)=>sum+reportNumber(r.it.opening)*r.factor,0);
    const incoming=g.rows.reduce((sum,r)=>sum+reportNumber(r.it.incoming)*r.factor,0);
    const closing=g.rows.reduce((sum,r)=>sum+reportNumber(r.it.closing)*r.factor,0);
    const sold=opening+incoming-closing;
    out.push({name:g.base,opening:reportFormat(opening),incoming:reportFormat(incoming),closing:reportFormat(closing),sold:reportFormat(sold),unit:'حبة'});
   }
  }
  return {...sec,items:out};
 });
}
function currentReport(){
 const branch=txt(document.querySelector('.head h2'))||'الفرع',
 notes=(document.querySelector('#notes')?.value||'').trim(),
 sourceDate=document.querySelector('#rd')?.value||new Date().toISOString().slice(0,10),
 reportDate=previousDay(sourceDate);
 let sections=qsa('.section').map(sec=>{
  const title=txt(sec.querySelector('.sectitle h3'))||'قسم',table=sec.querySelector('table.flow');
  if(table){
   const items=qsa('tbody tr',table).map(row=>{
    const closing=row.querySelector('input[data-key="closing"]');
    if(!hasVal(closing))return null;
    const cells=row.querySelectorAll('td');
    return{
     name:txt(cells[0]),
     opening:txt(row.querySelector('.ro'))||'0',
     incoming:String(row.querySelector('input[data-key="incoming"]')?.value||'0'),
     closing:String(closing.value),
     sold:txt(row.querySelector('.sold'))||'—',
     unit:txt(cells[cells.length-1])
    };
   }).filter(Boolean);
   return items.length?{title,type:'flow',items}:null;
  }
  const items=qsa('input[data-key="value"]',sec).map(simpleFromInput).filter(Boolean);
  return items.length?{title,type:'simple',items}:null;
 }).filter(Boolean);

 if(branch.includes('المذاق')&&!sections.some(s=>s.title!=='تقرير التطبيق'&&s.items?.length)){
  const seen=new Set(),items=[];
  qsa('input[data-key="value"]').forEach(input=>{
   if(!hasVal(input))return;
   const sec=input.closest('.section'),title=txt(sec?.querySelector('.sectitle h3'));
   if(title==='تقرير التطبيق')return;
   const it=simpleFromInput(input);if(!it)return;
   const k=input.dataset.id||it.name+'|'+it.unit;if(seen.has(k))return;
   seen.add(k);items.push(it);
  });
  if(items.length)sections.push({title:'مخزون نهاية اليوم',type:'simple',items});
 }
 sections=mergeRegularSodaUnits(sections);
 return{branch,notes,sections,reportDate};
}
function theme(r){
 return r.branch.includes('المذاق')
 ?{mode:'mazaq',paper:'#f8f8f7',surface:'#fff',accent:'#962733',dark:'#881520',text:'#26282b',muted:'#5d6064',line:'#d7d7da',stripe:'#f5f5f6',soft:'#f2f2f4'}
 :{mode:'grill',paper:'#fbf8f1',surface:'#fffdfa',accent:'#c39235',dark:'#a77a29',text:'#2e2922',muted:'#6f6557',line:'#e4d7c0',stripe:'#fcf8f0',soft:'#fffaf0'};
}
function round(c,x,y,w,h,r){
 const q=Math.min(r,w/2,h/2);
 c.beginPath();c.moveTo(x+q,y);c.arcTo(x+w,y,x+w,y+h,q);c.arcTo(x+w,y+h,x,y+h,q);c.arcTo(x,y+h,x,y,q);c.arcTo(x,y,x+w,y,q);c.closePath();
}
function box(c,x,y,w,h,r,fill,stroke,shadow=true){
 c.save();
 if(shadow){c.shadowColor='rgba(45,38,30,.07)';c.shadowBlur=8;c.shadowOffsetY=3;}
 round(c,x,y,w,h,r);c.fillStyle=fill;c.fill();c.restore();
 if(stroke){round(c,x,y,w,h,r);c.strokeStyle=stroke;c.lineWidth=1.2;c.stroke();}
}
function fit(c,text,max,size=23,min=16,weight='700'){
 let s=size;
 for(;s>min;s-=.5){c.font=`${weight} ${s}px Tahoma,Arial`;if(c.measureText(String(text)).width<=max)break;}
 return s;
}
function ell(c,s,max){
 s=String(s);
 if(c.measureText(s).width<=max)return s;
 while(s.length>2&&c.measureText(s+'…').width>max)s=s.slice(0,-1);
 return s+'…';
}
function rowH(s){return s.type==='flow'?58:s.type==='notes'?112:52;}
function cardH(s){return 56+s.items.length*rowH(s)+8;}
function mobileRowH(s){return s.type==='flow'?76:s.type==='notes'?142:68;}
function mobileCardH(s){return 66+s.items.length*mobileRowH(s)+10;}
function appInfo(r){
 const s=r.sections.find(x=>x.title==='تقرير التطبيق');
 if(!s?.items?.length)return null;
 const i=s.items[0];return{value:i.value,unit:i.unit||'طلب'};
}
function chunks(r){
 const app=r.sections.find(s=>s.title==='تقرير التطبيق'),src=r.sections.filter(s=>s!==app);
 if(r.notes)src.push({title:'ملاحظات',type:'notes',items:[{name:r.notes}]});
 return src;
}
function layout(r){
 const a=appInfo(r),pages=[];
 const preferred=['الملحمة','المقبلات','المقليات','الساخن','الحلا','ملاحظات'];
 const sorted=chunks(r).sort((aa,bb)=>{
   const ia=preferred.indexOf(aa.title), ib=preferred.indexOf(bb.title);
   return (ia===-1?999:ia)-(ib===-1?999:ib);
 });
 const maxFresh=P.BOTTOM-P.TOP;
 const source=[];
 for(const s of sorted){
  if(s.type==='notes'||mobileCardH(s)<=maxFresh){source.push(s);continue}
  const maxItems=Math.max(1,Math.floor((maxFresh-74)/mobileRowH(s)));
  for(let i=0;i<s.items.length;i+=maxItems){
   source.push({...s,title:i?`${s.title} — تابع`:s.title,items:s.items.slice(i,i+maxItems)});
  }
 }
 const fresh=first=>({ys:Array(GCOLS).fill(first&&a?P.TOP_APP:P.TOP),cards:[],app:first?a:null});
 let page=fresh(true);pages.push(page);
 for(const s of source){
  const h=mobileCardH(s);
  let slots=page.ys.map((y,i)=>({y,i})).sort((aa,bb)=>aa.y-bb.y);
  let slot=slots.find(z=>z.y+h<=P.BOTTOM);
  if(!slot){
   page=fresh(false);pages.push(page);
   slots=page.ys.map((y,i)=>({y,i})).sort((aa,bb)=>aa.y-bb.y);
   slot=slots.find(z=>z.y+h<=P.BOTTOM)||slots[0];
  }
  const col=slot.i,x=P.M+(GCOLS-1-col)*(GCW+GGAP),y=page.ys[col];
  page.cards.push({sec:s,x,y,w:GCW,h});page.ys[col]=y+h+P.GAP;
 }
 return pages;
}
function border(c,t){
 c.strokeStyle=t.accent;c.lineWidth=2;round(c,12,12,P.W-24,P.H-24,24);c.stroke();
 c.strokeStyle=t.mode==='mazaq'?'#d3d4d6':'#eadab8';c.lineWidth=1;round(c,21,21,P.W-42,P.H-42,19);c.stroke();
}
function header(c,r,pageNo,pageCount,app,t){
 const d=dateParts(r.reportDate);
 c.direction='rtl';c.textAlign='right';c.fillStyle=t.accent;c.font='900 54px Tahoma,Arial';c.fillText(r.branch,P.W-P.M,100);
 c.fillStyle=t.text;c.font='800 35px Tahoma,Arial';c.fillText('تقرير الجرد اليومي',P.W-P.M,150);
 c.textAlign='left';c.fillStyle=t.text;c.font='900 47px Tahoma,Arial';c.fillText(d.weekday,P.M,82);
 c.fillStyle=t.dark;c.font='900 42px Tahoma,Arial';c.fillText(r.reportDate,P.M,130);
 c.fillStyle=t.muted;c.font='700 24px Tahoma,Arial';c.fillText(d.hijri,P.M,165);
 c.strokeStyle=t.line;c.lineWidth=1.2;c.beginPath();c.moveTo(P.M,196);c.lineTo(P.W-P.M,196);c.stroke();
 if(app)appCard(c,app,t);
}
function appCard(c,app,t){
 const x=P.M,y=220,w=P.W-P.M*2,h=72;
 box(c,x,y,w,h,16,t.soft,t.line,false);
 c.fillStyle=t.accent;round(c,x+w-10,y+10,4,52,2);c.fill();
 c.direction='rtl';c.textAlign='right';
 const base=x+w-30,cy=y+47,label='عدد طلبات التطبيق';
 c.fillStyle=t.text;c.font='800 28px Tahoma,Arial';c.fillText(label,base,cy);
 const lw=c.measureText(label).width;let cursor=base-lw-14;
 c.fillStyle=t.accent;c.font='900 38px Tahoma,Arial';c.fillText(String(app.value),cursor,cy);
 const nw=c.measureText(String(app.value)).width;cursor-=nw+8;
 c.fillStyle=t.muted;c.font='700 20px Tahoma,Arial';c.fillText(app.unit||'طلب',cursor,cy);
}
function simpleRow(c,it,x,y,w,i,t,h=52){
 if(i%2){c.fillStyle=t.stripe;c.fillRect(x+6,y,w-12,h);}
 if(i){c.strokeStyle=t.line;c.beginPath();c.moveTo(x+8,y);c.lineTo(x+w-8,y);c.stroke();}
 c.direction='rtl';c.textAlign='right';c.fillStyle=t.text;
 fit(c,it.name,w-134,22.5,16.5,'700');c.fillText(ell(c,it.name,w-134),x+w-14,y+h/2+8);
 c.direction='ltr';c.textAlign='right';c.fillStyle=t.accent;c.font='800 23px Tahoma,Arial';c.fillText(String(it.value),x+108,y+h/2+8);
 c.textAlign='left';c.fillStyle=t.muted;c.font='700 16.5px Tahoma,Arial';c.fillText(String(it.unit||''),x+14,y+h/2+8);
}
function flowRow(c,it,x,y,w,i,t){
 if(i%2){c.fillStyle=t.stripe;c.fillRect(x+7,y,w-14,58);}
 if(i){c.strokeStyle=t.line;c.beginPath();c.moveTo(x+10,y);c.lineTo(x+w-10,y);c.stroke();}
 c.direction='rtl';c.textAlign='right';c.fillStyle=t.text;
 fit(c,it.name,w-24,21.5,16,'800');c.fillText(ell(c,it.name,w-24),x+w-12,y+23);
 c.fillStyle=t.muted;c.font='600 15px Tahoma,Arial';
 c.fillText(ell(c,`أول ${it.opening} | وارد ${it.incoming} | آخر ${it.closing} | مباع ${it.sold} ${it.unit}`,w-24),x+w-12,y+46);
}
function mobileSimpleRow(c,it,x,y,w,i,t,h=68){
 const z=Math.min(1.17,Math.max(1,h/68));
 if(i%2){c.fillStyle=t.stripe;c.fillRect(x+7,y,w-14,h);}
 if(i){c.strokeStyle=t.line;c.beginPath();c.moveTo(x+10,y);c.lineTo(x+w-10,y);c.stroke();}
 c.direction='rtl';c.textAlign='right';c.fillStyle=t.text;
 fit(c,it.name,w-164,29*z,21*z,'800');c.fillText(ell(c,it.name,w-164),x+w-16,y+h/2+10*z);
 c.direction='ltr';c.textAlign='right';c.fillStyle=t.accent;c.font=`900 ${31*z}px Tahoma,Arial`;c.fillText(String(it.value),x+134,y+h/2+10*z);
 c.textAlign='left';c.fillStyle=t.muted;c.font=`700 ${20*z}px Tahoma,Arial`;c.fillText(String(it.unit||''),x+16,y+h/2+9*z);
}
function mobileFlowRow(c,it,x,y,w,i,t,h=76){
 const z=Math.min(1.17,Math.max(1,h/76));
 if(i%2){c.fillStyle=t.stripe;c.fillRect(x+8,y,w-16,h);}
 if(i){c.strokeStyle=t.line;c.beginPath();c.moveTo(x+12,y);c.lineTo(x+w-12,y);c.stroke();}
 c.direction='rtl';c.textAlign='right';c.fillStyle=t.text;
 fit(c,it.name,w-28,29*z,21*z,'800');c.fillText(ell(c,it.name,w-28),x+w-14,y+31*z);
 c.fillStyle=t.muted;c.font=`700 ${20*z}px Tahoma,Arial`;
 c.fillText(ell(c,`أول ${it.opening} | وارد ${it.incoming} | آخر ${it.closing} | مباع ${it.sold} ${it.unit}`,w-28),x+w-14,y+h-18*z);
}
function flowSpreadRow(c,it,x,y,w,i,t,h){
 if(i%2){c.fillStyle=t.stripe;c.fillRect(x+8,y,w-16,h);}
 if(i){c.strokeStyle=t.line;c.beginPath();c.moveTo(x+12,y);c.lineTo(x+w-12,y);c.stroke();}
 c.direction='rtl';c.textAlign='right';c.fillStyle=t.text;
 fit(c,it.name,w-30,30,22,'800');c.fillText(ell(c,it.name,w-30),x+w-15,y+34);
 c.fillStyle=t.muted;c.font='800 24px Tahoma,Arial';
 c.fillText(ell(c,`أول ${it.opening} | وارد ${it.incoming} | آخر ${it.closing} | مباع ${it.sold} ${it.unit}`,w-28),x+w-14,y+h-18);
}
function drawFlowSpread(c,sec,t){
 const titleY=P.TOP,titleH=64,colGap=18,gridY=titleY+titleH+16;
 box(c,P.M,titleY,P.W-P.M*2,titleH,15,t.accent,null,false);
 c.direction='rtl';c.textAlign='center';c.fillStyle='#fff';c.font='800 35px Tahoma,Arial';
 c.fillText(sec.title,P.W/2,titleY+43);
 const items=sec.items||[],rows=Math.max(1,Math.ceil(items.length/2));
 const colW=(P.W-P.M*2-colGap)/2;
 const rh=Math.max(78,Math.min(96,Math.floor((P.BOTTOM-gridY-8)/rows)));
 for(let col=0;col<2;col++){
  const slice=items.slice(col*rows,(col+1)*rows);
  const x=col===0?P.W-P.M-colW:P.M;
  const h=Math.max(rh,slice.length*rh);
  box(c,x,gridY,colW,h,14,t.surface,t.line,true);
  slice.forEach((it,i)=>flowSpreadRow(c,it,x,gridY+i*rh,colW,i,t,rh));
 }
}
function balancePage(p){
 const start=p.app?P.TOP_APP:P.TOP;
 const out={...p,cards:[]};
 for(let col=0;col<GCOLS;col++){
  const x=P.M+(GCOLS-1-col)*(GCW+GGAP);
  const cards=p.cards.filter(b=>Math.abs(b.x-x)<2).sort((a,b)=>a.y-b.y);
  if(!cards.length)continue;
  const gapTotal=P.GAP*Math.max(0,cards.length-1);
  const natural=cards.reduce((sum,b)=>sum+b.h,0);
  const available=P.BOTTOM-start-gapTotal;
  const scale=Math.min(1.17,Math.max(1,available/natural));
  let y=start;
  cards.forEach(b=>{
   const h=Math.round(b.h*scale);
   out.cards.push({...b,y,h,scale});
   y+=h+P.GAP;
  });
 }
 return out;
}
function card(c,b,t){
 const {sec,x,y,w,h}=b,z=Math.min(1.17,Math.max(1,b.scale||1));
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
function drawMazaqStock(c,r,t){
 const stock=r.sections.filter(s=>s.title!=='تقرير التطبيق').flatMap(s=>s.items||[]);
 const seen=new Set(),items=[];
 stock.forEach(it=>{const k=it.name+'|'+it.unit;if(seen.has(k))return;seen.add(k);items.push(it);});
 const notesH=r.notes?120:0;
 const titleY=314,titleH=54;
 box(c,P.M,titleY,P.W-P.M*2,titleH,14,t.dark,null,false);
 c.direction='rtl';c.textAlign='center';c.fillStyle='#fff';c.font='800 31px Tahoma,Arial';c.fillText('مخزون نهاية اليوم',P.W/2,titleY+36);
 const gridY=titleY+titleH+12;
 const gridBottom=P.BOTTOM-(notesH?notesH+16:0);
 const rows=Math.max(1,Math.ceil(items.length/3));
 const rh=Math.max(54,Math.min(60,Math.floor((gridBottom-gridY)/rows)));
 const colH=rows*rh;
 for(let col=0;col<3;col++){
  const x=P.M+(P.COLS-1-col)*(P.CW+P.GAP);
  const slice=items.slice(col*rows,(col+1)*rows);
  box(c,x,gridY,P.CW,colH,13,t.surface,t.line,true);
  slice.forEach((it,i)=>simpleRow(c,it,x,gridY+i*rh,P.CW,i,t,rh));
 }
 if(r.notes){
  const y=P.BOTTOM-notesH;
  box(c,P.M,y,P.W-P.M*2,notesH,14,t.surface,t.line,false);
  c.direction='rtl';c.textAlign='right';c.fillStyle=t.accent;c.font='800 24px Tahoma,Arial';c.fillText('ملاحظات',P.W-P.M-18,y+34);
  c.fillStyle=t.text;c.font='600 20px Tahoma,Arial';
  const maxW=P.W-P.M*2-36,words=String(r.notes).split(' ');let line='',lines=[];
  for(const word of words){const n=line?line+' '+word:word;if(c.measureText(n).width>maxW&&line){lines.push(line);line=word}else line=n;}
  if(line)lines.push(line);lines.slice(0,3).forEach((ln,i)=>c.fillText(ln,P.W-P.M-18,y+70+i*28));
 }
}
function footer(c,n,total,t){
 c.strokeStyle=t.line;c.beginPath();c.moveTo(P.M,P.H-62);c.lineTo(P.W-P.M,P.H-62);c.stroke();
 c.fillStyle=t.muted;c.font='13px Tahoma,Arial';c.textAlign='center';c.direction='rtl';
 c.fillText(`نظام الجرد اليومي${total>1?` · ${n}/${total}`:''}`,P.W/2,P.H-34);
}
async function canvases(r){
 await document.fonts.ready;const t=theme(r),out=[];
 if(t.mode==='mazaq'){
  const cv=document.createElement('canvas');cv.width=P.W;cv.height=P.H;const c=cv.getContext('2d');
  c.fillStyle=t.paper;c.fillRect(0,0,P.W,P.H);border(c,t);header(c,r,1,1,appInfo(r),t);drawMazaqStock(c,r,t);footer(c,1,1,t);out.push(cv);return out;
 }
 const special=r.sections.find(s=>s.type==='flow'&&s.items?.length>16&&s.title.includes('العصير'));
 const base=special?{...r,sections:r.sections.filter(s=>s!==special)}:r;
 const pages=layout(base),total=pages.length+(special?1:0);
 pages.forEach((p,i)=>{
  const cv=document.createElement('canvas');cv.width=P.W;cv.height=P.H;const c=cv.getContext('2d');
  const dp=i===0?p:balancePage(p);
  c.fillStyle=t.paper;c.fillRect(0,0,P.W,P.H);border(c,t);header(c,r,i+1,total,dp.app,t);dp.cards.forEach(b=>card(c,b,t));footer(c,i+1,total,t);out.push(cv);
 });
 if(special){
  const cv=document.createElement('canvas');cv.width=P.W;cv.height=P.H;const c=cv.getContext('2d');
  c.fillStyle=t.paper;c.fillRect(0,0,P.W,P.H);border(c,t);header(c,r,total,total,null,t);drawFlowSpread(c,special,t);footer(c,total,total,t);out.push(cv);
 }
 return out;
}
const blob=cv=>new Promise((ok,no)=>cv.toBlob(b=>b?ok(b):no(new Error('تعذر إنشاء الصورة')),'image/jpeg',.95));
const PDF_ENC=new TextEncoder();
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
async function download(files){
 for(const f of files){
  const u=URL.createObjectURL(f),a=document.createElement('a');a.href=u;a.download=f.name;document.body.appendChild(a);a.click();a.remove();
  setTimeout(()=>URL.revokeObjectURL(u),2500);await new Promise(r=>setTimeout(r,120));
 }
}
async function make(share){
 const r=currentReport();
 if(!r.sections.length&&!r.notes)return toast('لا توجد بيانات مدخلة لإنشاء التقرير',true);
 try{
  toast('جاري تجهيز التقرير...');
  const cvs=await canvases(r),safe=r.branch.replace(/\s+/g,'-').replace(/[^\u0600-\u06FF\w-]/g,''),files=[],jpegBlobs=[];
  for(let i=0;i<cvs.length;i++){
   const b=await blob(cvs[i]),s=cvs.length>1?`-${i+1}`:'';
   jpegBlobs.push(b);
   files.push(new File([b],`جرد-${safe}-${r.reportDate}${s}.jpg`,{type:'image/jpeg'}));
  }
  const pdfBlob=await pdfFromJpegs(jpegBlobs);
  const pdfFile=new File([pdfBlob],`جرد-${safe}-${r.reportDate}.pdf`,{type:'application/pdf'});
  const allFiles=[...files,pdfFile];
  if(share&&navigator.share){
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
     await download([pdfFile]);
     return toast('تمت مشاركة الصور وتنزيل PDF لأن الجهاز لا يدعم إرساله معها');
    }catch(e){if(e?.name==='AbortError')return}
   }
  }
  if(share){
   await download(allFiles);
   setTimeout(()=>window.open('https://wa.me/?text='+encodeURIComponent(`تقرير الجرد اليومي - ${r.branch} - ${r.reportDate}`),'_blank'),250);
   toast('تم تنزيل الصور وPDF وفتح واتساب');
  }else{
   await download(files);
   toast(files.length>1?`تم إنشاء ${files.length} صور 9:16`:'تم إنشاء التقرير 9:16');
  }
 }catch(e){
  if(e?.name==='AbortError')return;
  toast(e.message||'تعذر إنشاء التقرير',true);
 }
}
document.addEventListener('click',e=>{
 const b=e.target.closest?.('#jpg,#share');if(!b)return;
 e.preventDefault();e.stopPropagation();e.stopImmediatePropagation();make(b.id==='share');
},true);
})();