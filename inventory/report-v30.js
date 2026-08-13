(()=>{'use strict';
if(window.__reportV30Loaded)return;window.__reportV30Loaded=true;
const qsa=(s,r=document)=>Array.from(r.querySelectorAll(s));
const txt=e=>String(e?.textContent||'').trim();
const hasVal=e=>!!e&&e.value!==''&&e.value!==null&&e.value!==undefined;
const P={W:1080,H:1920,M:42,BOTTOM:1832,GAP:14,COLS:3,TOP:252,TOP_APP:326};
P.CW=(P.W-P.M*2-P.GAP*(P.COLS-1))/P.COLS;

function toast(msg,bad=false){
 let t=document.querySelector('.report-v30-toast');
 if(!t){
  t=document.createElement('div');
  t.className='report-v30-toast';
  Object.assign(t.style,{position:'fixed',left:'18px',bottom:'86px',zIndex:'99999',padding:'10px 14px',borderRadius:'10px',font:'700 12px Tahoma,Arial',color:'#fff',background:'#2f2a23',boxShadow:'0 8px 24px rgba(0,0,0,.18)',transition:'.18s',opacity:'0'});
  document.body.appendChild(t)
 }
 t.textContent=msg;t.style.background=bad?'#9f433b':'#2f2a23';t.style.opacity='1';
 clearTimeout(window.__rv30);window.__rv30=setTimeout(()=>t.style.opacity='0',2600)
}
function previousDay(iso){
 try{
  const d=new Date(iso+'T12:00:00+03:00');d.setDate(d.getDate()-1);
  return new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Riyadh',year:'numeric',month:'2-digit',day:'2-digit'}).format(d)
 }catch{return iso}
}
function dateParts(iso){
 try{
  const d=new Date(iso+'T12:00:00+03:00');
  return{
   weekday:new Intl.DateTimeFormat('ar-SA',{weekday:'long',timeZone:'Asia/Riyadh'}).format(d),
   hijri:new Intl.DateTimeFormat('ar-SA-u-ca-islamic-umalqura',{year:'numeric',month:'long',day:'numeric',timeZone:'Asia/Riyadh'}).format(d)
  }
 }catch{return{weekday:'',hijri:''}}
}
function simpleFromInput(input){
 if(!hasVal(input))return null;
 const card=input.closest('.item');
 let name=txt(card?.querySelector('.name')),unit=txt(card?.querySelector('.unit'));
 const aria=String(input.getAttribute('aria-label')||'').trim();
 if((!name||!unit)&&aria.startsWith('مخزون نهاية اليوم - ')){
  const p=aria.slice('مخزون نهاية اليوم - '.length).split(' - ');
  name=name||p[0]||'';unit=unit||p.slice(1).join(' - ')
 }
 return name?{name,value:String(input.value),unit}:null
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
    }
   }).filter(Boolean);
   return items.length?{title,type:'flow',items}:null
  }
  const items=qsa('input[data-key="value"]',sec).map(simpleFromInput).filter(Boolean);
  return items.length?{title,type:'simple',items}:null
 }).filter(Boolean);

 if(branch.includes('المذاق')&&!sections.some(s=>s.title!=='تقرير التطبيق'&&s.items?.length)){
  const seen=new Set(),items=[];
  qsa('input[data-key="value"]').forEach(input=>{
   if(!hasVal(input))return;
   const sec=input.closest('.section'),title=txt(sec?.querySelector('.sectitle h3'));
   if(title==='تقرير التطبيق')return;
   const it=simpleFromInput(input);if(!it)return;
   const k=input.dataset.id||it.name+'|'+it.unit;if(seen.has(k))return;
   seen.add(k);items.push(it)
  });
  if(items.length)sections.push({title:'مخزون نهاية اليوم',type:'simple',items})
 }
 return{branch,notes,sections,reportDate}
}
function theme(r){
 return r.branch.includes('المذاق')
 ?{mode:'mazaq',paper:'#f7f7f6',surface:'#fff',accent:'#98242c',dark:'#6f171d',text:'#26282b',muted:'#5d6064',line:'#d5d6d8',stripe:'#f4f4f5',soft:'#f1f1f2'}
 :{mode:'grill',paper:'#fbf7ef',surface:'#fffdfa',accent:'#b88932',dark:'#8e6524',text:'#2f2922',muted:'#6e6252',line:'#e2d4bc',stripe:'#fcf7ee',soft:'#fff8eb'}
}
function round(c,x,y,w,h,r){
 const q=Math.min(r,w/2,h/2);
 c.beginPath();c.moveTo(x+q,y);c.arcTo(x+w,y,x+w,y+h,q);c.arcTo(x+w,y+h,x,y+h,q);c.arcTo(x,y+h,x,y,q);c.arcTo(x,y,x+w,y,q);c.closePath()
}
function box(c,x,y,w,h,r,fill,stroke,shadow=true){
 c.save();
 if(shadow){c.shadowColor='rgba(45,38,30,.075)';c.shadowBlur=8;c.shadowOffsetY=3}
 round(c,x,y,w,h,r);c.fillStyle=fill;c.fill();c.restore();
 if(stroke){round(c,x,y,w,h,r);c.strokeStyle=stroke;c.lineWidth=1.2;c.stroke()}
}
function fit(c,text,max,size=23,min=16,weight='700'){
 let s=size;
 for(;s>min;s-=.5){c.font=`${weight} ${s}px Tahoma,Arial`;if(c.measureText(String(text)).width<=max)break}
 return s
}
function ell(c,s,max){
 s=String(s);
 if(c.measureText(s).width<=max)return s;
 while(s.length>2&&c.measureText(s+'…').width>max)s=s.slice(0,-1);
 return s+'…'
}
function rowH(s){return s.type==='flow'?66:s.type==='notes'?116:60}
function cardH(s){return 66+s.items.length*rowH(s)+10}
function appInfo(r){
 const s=r.sections.find(x=>x.title==='تقرير التطبيق');
 if(!s?.items?.length)return null;
 const i=s.items[0];return{value:i.value,unit:i.unit||'طلب'}
}
function chunks(r){
 const app=r.sections.find(s=>s.title==='تقرير التطبيق'),src=r.sections.filter(s=>s!==app);
 if(r.notes)src.push({title:'ملاحظات',type:'notes',items:[{name:r.notes}]});
 const out=[],firstTop=app?P.TOP_APP:P.TOP;
 for(const s of src){
  const max=Math.max(1,Math.floor((P.BOTTOM-firstTop-88)/rowH(s)));
  for(let i=0;i<s.items.length;i+=max)out.push({title:s.title,type:s.type,items:s.items.slice(i,i+max),part:i?Math.floor(i/max)+1:0})
 }
 return out
}
function layout(r){
 const a=appInfo(r),pages=[];let page,first=true;
 const fresh=()=>{page={ys:Array(P.COLS).fill(first&&a?P.TOP_APP:P.TOP),cards:[],app:first?a:null};pages.push(page);first=false};
 fresh();
 for(const s of chunks(r)){
  const h=cardH(s);
  let slots=page.ys.map((y,i)=>({y,i})).sort((a,b)=>a.y-b.y),slot=slots.find(z=>z.y+h<=P.BOTTOM);
  if(!slot){fresh();slots=page.ys.map((y,i)=>({y,i})).sort((a,b)=>a.y-b.y);slot=slots[0]}
  const col=slot.i,x=P.M+(P.COLS-1-col)*(P.CW+P.GAP),y=page.ys[col];
  page.cards.push({sec:s,x,y,w:P.CW,h});page.ys[col]=y+h+P.GAP
 }
 return pages
}
function border(c,t){
 c.strokeStyle=t.accent;c.lineWidth=2;round(c,12,12,P.W-24,P.H-24,24);c.stroke();
 c.strokeStyle=t.mode==='mazaq'?'#d3d4d6':'#ead8b4';c.lineWidth=1;round(c,21,21,P.W-42,P.H-42,19);c.stroke()
}
function header(c,r,pageNo,pageCount,app,t){
 const d=dateParts(r.reportDate);
 c.direction='rtl';c.textAlign='right';c.fillStyle=t.accent;c.font='900 52px Tahoma,Arial';c.fillText(r.branch,P.W-P.M,98);
 c.fillStyle=t.text;c.font='800 34px Tahoma,Arial';c.fillText('تقرير الجرد اليومي',P.W-P.M,148);
 c.textAlign='left';c.fillStyle=t.text;c.font='900 43px Tahoma,Arial';c.fillText(d.weekday,P.M,83);
 c.fillStyle=t.dark;c.font='900 37px Tahoma,Arial';c.fillText(r.reportDate,P.M,130);
 c.fillStyle=t.muted;c.font='700 23px Tahoma,Arial';c.fillText(d.hijri,P.M,164);
 c.strokeStyle=t.line;c.lineWidth=1.2;c.beginPath();c.moveTo(P.M,194);c.lineTo(P.W-P.M,194);c.stroke();
 if(app)appCard(c,app,t);
 if(pageCount>1){c.textAlign='left';c.fillStyle=t.muted;c.font='700 13px Tahoma,Arial';c.fillText(`صفحة ${pageNo} من ${pageCount}`,P.M,210)}
}
function appCard(c,app,t){
 const x=P.M,y=218,w=P.W-P.M*2,h=72;
 box(c,x,y,w,h,14,t.soft,t.line,false);
 c.fillStyle=t.accent;round(c,x+w-11,y+12,4,48,2);c.fill();
 c.direction='rtl';c.textAlign='right';
 const base=x+w-30,cy=y+47,label='عدد طلبات التطبيق';
 c.fillStyle=t.text;c.font='800 29px Tahoma,Arial';c.fillText(label,base,cy);
 const lw=c.measureText(label).width;let cursor=base-lw-15;
 c.fillStyle=t.accent;c.font='900 32px Tahoma,Arial';c.fillText(String(app.value),cursor,cy);
 const nw=c.measureText(String(app.value)).width;cursor-=nw+8;
 c.fillStyle=t.muted;c.font='700 19px Tahoma,Arial';c.fillText(app.unit||'طلب',cursor,cy)
}
function simpleRow(c,it,x,y,w,i,t,h=60){
 if(i%2){c.fillStyle=t.stripe;c.fillRect(x+7,y,w-14,h)}
 if(i){c.strokeStyle=t.line;c.beginPath();c.moveTo(x+10,y);c.lineTo(x+w-10,y);c.stroke()}
 c.direction='rtl';c.textAlign='right';c.fillStyle=t.text;
 fit(c,it.name,w-138,23,16.5,'700');c.fillText(ell(c,it.name,w-138),x+w-14,y+h/2+8);
 c.direction='ltr';c.textAlign='right';c.fillStyle=t.accent;c.font='800 24px Tahoma,Arial';c.fillText(String(it.value),x+110,y+h/2+8);
 c.textAlign='left';c.fillStyle=t.muted;c.font='700 17.5px Tahoma,Arial';c.fillText(String(it.unit||''),x+14,y+h/2+8)
}
function flowRow(c,it,x,y,w,i,t){
 if(i%2){c.fillStyle=t.stripe;c.fillRect(x+7,y,w-14,66)}
 if(i){c.strokeStyle=t.line;c.beginPath();c.moveTo(x+10,y);c.lineTo(x+w-10,y);c.stroke()}
 c.direction='rtl';c.textAlign='right';c.fillStyle=t.text;
 fit(c,it.name,w-24,22.5,17,'800');c.fillText(ell(c,it.name,w-24),x+w-12,y+26);
 c.fillStyle=t.muted;c.font='600 16px Tahoma,Arial';
 c.fillText(ell(c,`أول ${it.opening} | وارد ${it.incoming} | آخر ${it.closing} | مباع ${it.sold} ${it.unit}`,w-24),x+w-12,y+53)
}
function card(c,b,t){
 const {sec,x,y,w,h}=b;box(c,x,y,w,h,14,t.surface,t.line,true);
 c.save();round(c,x,y,w,64,14);c.clip();c.fillStyle=t.mode==='mazaq'?t.dark:t.accent;c.fillRect(x,y,w,64);
 if(t.mode==='mazaq'){c.fillStyle=t.accent;c.fillRect(x,y,w,5)}c.restore();
 c.direction='rtl';c.textAlign='center';c.fillStyle='#fff';
 const title=sec.title;
 fit(c,title,w-22,29,21,'800');c.fillText(ell(c,title,w-22),x+w/2,y+42);
 let yy=y+66;
 if(sec.type==='simple')sec.items.forEach((it,i)=>{simpleRow(c,it,x,yy,w,i,t,60);yy+=60});
 else if(sec.type==='flow')sec.items.forEach((it,i)=>{flowRow(c,it,x,yy,w,i,t);yy+=66});
 else{
  c.direction='rtl';c.textAlign='right';c.fillStyle=t.text;c.font='600 21px Tahoma,Arial';
  const words=String(sec.items[0]?.name||'').split(' ');let line='',lines=[];
  for(const word of words){const n=line?line+' '+word:word;if(c.measureText(n).width>w-30&&line){lines.push(line);line=word}else line=n}
  if(line)lines.push(line);lines.slice(0,4).forEach((ln,i)=>c.fillText(ln,x+w-15,yy+36+i*32))
 }
}
function drawMazaqStock(c,r,t){
 const stock=r.sections.filter(s=>s.title!=='تقرير التطبيق').flatMap(s=>s.items||[]);
 const seen=new Set(),items=[];
 stock.forEach(it=>{const k=it.name+'|'+it.unit;if(seen.has(k))return;seen.add(k);items.push(it)});
 const titleY=322,titleH=58;
 box(c,P.M,titleY,P.W-P.M*2,titleH,14,t.dark,null,false);
 c.direction='rtl';c.textAlign='center';c.fillStyle='#fff';c.font='800 30px Tahoma,Arial';c.fillText('مخزون نهاية اليوم',P.W/2,titleY+39);

 const notesH=r.notes?126:0;
 const gridY=titleY+titleH+14;
 const gridBottom=P.BOTTOM-(notesH?notesH+18:0);
 const maxRows=Math.max(1,Math.ceil(items.length/3));
 const adaptive=Math.floor((gridBottom-gridY)/maxRows);
 const rh=Math.max(58,Math.min(68,adaptive));
 const colH=maxRows*rh;

 for(let col=0;col<3;col++){
  const x=P.M+(P.COLS-1-col)*(P.CW+P.GAP);
  const slice=items.slice(col*maxRows,(col+1)*maxRows);
  box(c,x,gridY,P.CW,colH,13,t.surface,t.line,true);
  slice.forEach((it,i)=>simpleRow(c,it,x,gridY+i*rh,P.CW,i,t,rh))
 }
 if(r.notes){
  const y=P.BOTTOM-notesH;
  box(c,P.M,y,P.W-P.M*2,notesH,14,t.surface,t.line,false);
  c.direction='rtl';c.textAlign='right';c.fillStyle=t.accent;c.font='800 24px Tahoma,Arial';c.fillText('ملاحظات',P.W-P.M-18,y+35);
  c.fillStyle=t.text;c.font='600 20px Tahoma,Arial';
  const maxW=P.W-P.M*2-36,words=String(r.notes).split(' ');let line='',lines=[];
  for(const word of words){const n=line?line+' '+word:word;if(c.measureText(n).width>maxW&&line){lines.push(line);line=word}else line=n}
  if(line)lines.push(line);lines.slice(0,2).forEach((ln,i)=>c.fillText(ln,P.W-P.M-18,y+72+i*29))
 }
}
function footer(c,n,total,t){
 c.strokeStyle=t.line;c.beginPath();c.moveTo(P.M,P.H-62);c.lineTo(P.W-P.M,P.H-62);c.stroke();
 c.fillStyle=t.muted;c.font='13px Tahoma,Arial';c.textAlign='center';c.direction='rtl';
 c.fillText(`نظام الجرد اليومي${total>1?` · ${n}/${total}`:''}`,P.W/2,P.H-34)
}
async function canvases(r){
 await document.fonts.ready;const t=theme(r),out=[];
 if(t.mode==='mazaq'){
  const cv=document.createElement('canvas');cv.width=P.W;cv.height=P.H;const c=cv.getContext('2d');
  c.fillStyle=t.paper;c.fillRect(0,0,P.W,P.H);border(c,t);header(c,r,1,1,appInfo(r),t);drawMazaqStock(c,r,t);footer(c,1,1,t);out.push(cv);return out
 }
 const pages=layout(r);
 pages.forEach((p,i)=>{
  const cv=document.createElement('canvas');cv.width=P.W;cv.height=P.H;const c=cv.getContext('2d');
  c.fillStyle=t.paper;c.fillRect(0,0,P.W,P.H);border(c,t);header(c,r,i+1,pages.length,p.app,t);p.cards.forEach(b=>card(c,b,t));footer(c,i+1,pages.length,t);out.push(cv)
 });
 return out
}
const blob=cv=>new Promise((ok,no)=>cv.toBlob(b=>b?ok(b):no(new Error('تعذر إنشاء الصورة')),'image/jpeg',.95));
async function download(files){
 for(const f of files){
  const u=URL.createObjectURL(f),a=document.createElement('a');a.href=u;a.download=f.name;document.body.appendChild(a);a.click();a.remove();
  setTimeout(()=>URL.revokeObjectURL(u),2500);await new Promise(r=>setTimeout(r,120))
 }
}
async function make(share){
 const r=currentReport();
 if(!r.sections.length&&!r.notes)return toast('لا توجد بيانات مدخلة لإنشاء التقرير',true);
 try{
  toast('جاري تجهيز التقرير...');
  const cvs=await canvases(r),safe=r.branch.replace(/\s+/g,'-').replace(/[^\u0600-\u06FF\w-]/g,''),files=[];
  for(let i=0;i<cvs.length;i++){
   const b=await blob(cvs[i]),s=cvs.length>1?`-${i+1}`:'';
   files.push(new File([b],`جرد-${safe}-${r.reportDate}${s}.jpg`,{type:'image/jpeg'}))
  }
  if(share&&navigator.share&&(!navigator.canShare||navigator.canShare({files}))){
   await navigator.share({files,title:'تقرير الجرد اليومي',text:`${r.branch} - ${r.reportDate}`});
   return toast('تم تجهيز التقرير للمشاركة')
  }
  await download(files);
  if(share){
   setTimeout(()=>window.open('https://wa.me/?text='+encodeURIComponent(`تقرير الجرد اليومي - ${r.branch} - ${r.reportDate}`),'_blank'),250);
   toast('تم تنزيل التقرير وفتح واتساب')
  }else toast(files.length>1?`تم إنشاء ${files.length} صور 9:16`:'تم إنشاء التقرير 9:16')
 }catch(e){
  if(e?.name==='AbortError')return;
  toast(e.message||'تعذر إنشاء التقرير',true)
 }
}
document.addEventListener('click',e=>{
 const b=e.target.closest?.('#jpg,#share');if(!b)return;
 e.preventDefault();e.stopPropagation();e.stopImmediatePropagation();make(b.id==='share')
},true);
})();