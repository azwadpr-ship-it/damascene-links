(()=>{'use strict';
if(window.__receivingReportStableV40)return;window.__receivingReportStableV40=true;
const RAPI='https://wnknxjxipkvioegskefd.supabase.co/functions/v1/daily-inventory-receiving';
const IAPI='https://wnknxjxipkvioegskefd.supabase.co/functions/v1/daily-inventory';
const q=(s,r=document)=>r.querySelector(s),qa=(s,r=document)=>Array.from(r.querySelectorAll(s));
const token=()=>localStorage.getItem('inventory_token')||'';
let user=null,busy=false,lastKey='',timer=0;
async function post(url,action,p={}){const t=token();if(!t)throw Error('no-token');const r=await fetch(url,{method:'POST',headers:{'content-type':'application/json',authorization:'Bearer '+t},body:JSON.stringify({action,...p})});const d=await r.json().catch(()=>({}));if(!r.ok||d.ok===false)throw Error(d.error||'request-failed');return d}
function fmt(n){const x=Number(n||0);return Number.isInteger(x)?String(x):String(Math.round(x*100)/100)}
async function getUser(){if(user)return user;const d=await post(IAPI,'bootstrap');user=d.user||null;return user}
function ensureNote(parent,text,cls='morning-linked'){if(!parent)return;let n=parent.querySelector('.'+cls);if(!n){n=document.createElement('small');n.className=cls;parent.appendChild(n)}n.textContent=text}
function removeNote(parent,cls='morning-linked'){parent?.querySelector('.'+cls)?.remove()}
async function apply(){
 if(busy)return;
 const title=(q('.head h2')?.textContent||'').trim();
 if(!title||title==='لوحة المدير')return;
 const incoming=qa('input.report-input[data-key="incoming"],input[data-key="incoming"]');
 const stock=qa('input.report-input[data-key="value"],input[data-key="value"]');
 if(!incoming.length&&!stock.length)return;
 const date=q('#rd')?.value||q('.head input[type=date]')?.value||q('input[type=date]')?.value;
 if(!date)return;
 busy=true;
 try{
  const u=await getUser();if(!u||u.role==='manager'||!u.branch_id)return;
  const key=u.branch_id+'|'+date+'|'+incoming.length+'|'+stock.length;
  if(lastKey===key)return;
  const d=await post(RAPI,'inventory_totals',{date}),tot=d.totals||{},morningActive=Number(d.batch_count||0)>0;
  let linked=0,stockLinked=0;
  incoming.forEach(inp=>{
   const total=Number(tot[inp.dataset.id]||0),parent=inp.parentElement;
   if(morningActive&&total>0){
    linked++;
    if(Number(inp.value)!==total){inp.value=fmt(total);inp.dispatchEvent(new Event('input',{bubbles:true}))}
    inp.readOnly=true;inp.classList.add('auto-incoming');ensureNote(parent,'من الاستلام الصباحي');
   }else{
    inp.readOnly=false;inp.classList.remove('auto-incoming');
    if(morningActive)ensureNote(parent,'لا يوجد استلام صباحي — يمكن الإدخال يدويًا');else removeNote(parent);
   }
  });
  stock.forEach(inp=>{
   const total=Number(tot[inp.dataset.id]||0),card=inp.closest('.item')||inp.parentElement;
   let note=card?.querySelector('.morning-stock-info');
   if(morningActive&&total>0){
    stockLinked++;
    if(!note&&card){note=document.createElement('div');note.className='morning-stock-info';card.appendChild(note)}
    if(note){const unit=(q('.unit',card)?.textContent||'').trim();note.textContent=`استلام صباحي: ${fmt(total)}${unit?' '+unit:''}`}
   }else note?.remove();
  });
  let banner=q('.morning-link-banner');
  if(morningActive){
   if(!banner){banner=document.createElement('div');banner.className='morning-link-banner';const anchor=q('.note')||q('.section');anchor?.parentElement?.insertBefore(banner,anchor)}
   if(banner)banner.textContent=incoming.length?`تم ربط الوارد الصباحي تلقائيًا${linked?` · ${linked} صنف مرتبط`:''}. الأصناف غير المستلمة صباحًا تبقى قابلة للإدخال اليدوي.`:`تم ربط سجل استلامات الصباح بهذا التقرير${stockLinked?` · ${stockLinked} صنف تم استلامه اليوم`:''}. كمية آخر اليوم تبقى جردًا مستقلًا.`;
  }else banner?.remove();
  lastKey=key;
 }catch(e){console.warn('receiving-report-v40',e)}finally{busy=false}
}
function schedule(reset=false){if(reset)lastKey='';clearTimeout(timer);timer=setTimeout(apply,140)}
new MutationObserver(ms=>{if(ms.some(m=>Array.from(m.addedNodes||[]).some(n=>n.nodeType===1)))schedule(false)}).observe(document.body,{childList:true,subtree:true});
document.addEventListener('change',e=>{if(e.target?.matches?.('input[type=date]'))schedule(true)});
document.addEventListener('visibilitychange',()=>{if(!document.hidden)schedule(true)});
[80,250,700,1500].forEach(ms=>setTimeout(()=>schedule(false),ms));
})();
