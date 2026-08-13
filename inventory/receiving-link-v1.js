(()=>{'use strict';
const RAPI='https://wnknxjxipkvioegskefd.supabase.co/functions/v1/daily-inventory-receiving';
const IAPI='https://wnknxjxipkvioegskefd.supabase.co/functions/v1/daily-inventory';
const q=(s,r=document)=>r.querySelector(s),qa=(s,r=document)=>Array.from(r.querySelectorAll(s));
let mainUser=null,userBusy=null,dashKey='',reportKey='',timer=0;
const token=()=>localStorage.getItem('inventory_token')||'';
async function post(url,action,p={}){const t=token();if(!t)throw Error('no-token');const r=await fetch(url,{method:'POST',headers:{'content-type':'application/json',authorization:'Bearer '+t},body:JSON.stringify({action,...p})});const d=await r.json().catch(()=>({}));if(!r.ok||d.ok===false)throw Error(d.error||'request-failed');return d}
async function getUser(){if(mainUser)return mainUser;if(userBusy)return userBusy;userBusy=post(IAPI,'bootstrap').then(d=>(mainUser=d.user||null)).catch(()=>null).finally(()=>userBusy=null);return userBusy}
function fmt(n){const x=Number(n||0);return Number.isInteger(x)?String(x):String(Math.round(x*100)/100)}
function time(v){try{return new Intl.DateTimeFormat('ar-SA',{hour:'2-digit',minute:'2-digit',timeZone:'Asia/Riyadh'}).format(new Date(v))}catch{return''}}
async function enhanceDashboard(){
 const root=q('.pro-manager-dashboard'),dash=q('#dash');if(!root||!dash)return false;
 const date=q('#md')?.value||q('.manager-hero input[type=date]')?.value;if(!date)return true;
 const key=date+'|'+qa('.dash',dash).length;if(key===dashKey&&qa('.morning-status',dash).length)return true;dashKey=key;
 try{const d=await post(RAPI,'manager_summary',{date}),rows=d.rows||[];qa('.dash',dash).forEach(card=>{const name=(q('h3',card)?.textContent||'').trim(),r=rows.find(x=>x.branch_name===name);let el=q('.morning-status',card);if(!el){el=document.createElement('div');el.className='morning-status';(q('.manager-card-meta',card)||q('.meta',card)||q('.manager-card-head',card))?.insertAdjacentElement('afterend',el)}if(!el)return;if(r?.batch_count){el.classList.add('has-morning');el.innerHTML=`<b>الاستلام الصباحي:</b> ${r.batch_count} دفعة · ${r.item_count} صنف${r.last_at?` · آخر استلام ${time(r.last_at)}`:''}`}else{el.classList.remove('has-morning');el.innerHTML='<b>الاستلام الصباحي:</b> لم يُسجّل بعد'}})}catch(e){}
 return true
}
async function enhanceReport(){
 const incoming=qa('input.report-input[data-key="incoming"],input[data-key="incoming"]'),stock=qa('input.report-input[data-key="value"],input[data-key="value"]');if(!incoming.length&&!stock.length)return false;
 const u=await getUser();if(!u||u.role==='manager')return true;
 const date=q('#rd')?.value||q('.head input[type=date]')?.value||q('input[type=date]')?.value;if(!date||!u.branch_id)return true;
 const key=u.branch_id+'|'+date+'|'+incoming.length+'|'+stock.length;if(key===reportKey&&(incoming.some(x=>x.dataset.morningChecked==='1')||stock.some(x=>x.dataset.morningChecked==='1')))return true;reportKey=key;
 try{
  const d=await post(RAPI,'inventory_totals',{date}),tot=d.totals||{},morningActive=Number(d.batch_count||0)>0;let linked=0,stockLinked=0;
  incoming.forEach(inp=>{const id=inp.dataset.id,total=Number(tot[id]||0),parent=inp.parentElement;if(morningActive){if(total>0)linked++;if(Number(inp.value)!==total){inp.value=fmt(total);inp.dispatchEvent(new Event('input',{bubbles:true}))}inp.readOnly=true;inp.classList.add('auto-incoming');inp.dataset.morningChecked='1';let note=parent?.querySelector('.morning-linked');if(!note&&parent){note=document.createElement('small');note.className='morning-linked';parent.appendChild(note)}if(note)note.textContent=total>0?'من الاستلام الصباحي':'لا يوجد استلام صباحي'}else{inp.readOnly=false;inp.classList.remove('auto-incoming');inp.dataset.morningChecked='1';parent?.querySelector('.morning-linked')?.remove()}});
  stock.forEach(inp=>{const total=Number(tot[inp.dataset.id]||0),card=inp.closest('.item')||inp.parentElement;inp.dataset.morningChecked='1';let note=card?.querySelector('.morning-stock-info');if(morningActive&&total>0){stockLinked++;if(!note&&card){note=document.createElement('div');note.className='morning-stock-info';card.appendChild(note)}if(note){const unit=(q('.unit',card)?.textContent||'').trim();note.textContent=`استلام صباحي: ${fmt(total)}${unit?' '+unit:''}`}}else note?.remove()});
  let banner=q('.morning-link-banner');if(morningActive){if(!banner){banner=document.createElement('div');banner.className='morning-link-banner';const anchor=q('.note')||q('.section');anchor?.parentElement?.insertBefore(banner,anchor)}if(banner){if(incoming.length)banner.textContent=`الوارد مربوط تلقائيًا باستلامات الصباح لهذا اليوم${linked?` · ${linked} صنف بقيمة مستلمة`:''}. لإضافة وارد جديد استخدم صفحة الاستلام الصباحي.`;else banner.textContent=`تم ربط سجل استلامات الصباح بهذا التقرير${stockLinked?` · ${stockLinked} صنف تم استلامه اليوم`:''}. كمية آخر اليوم تبقى جردًا مستقلًا.`}}else banner?.remove();
 }catch(e){}
 return true
}
async function run(){if(await enhanceDashboard())return;await enhanceReport()}
function schedule(){clearTimeout(timer);timer=setTimeout(run,120)}
new MutationObserver(schedule).observe(document.documentElement,{subtree:true,childList:true});
document.addEventListener('change',e=>{if(e.target?.matches?.('input[type=date]')){dashKey='';reportKey='';schedule()}});
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',schedule);else schedule();
})();
