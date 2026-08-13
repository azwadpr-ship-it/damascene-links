(()=>{'use strict';
const RAPI='https://wnknxjxipkvioegskefd.supabase.co/functions/v1/daily-inventory-receiving';
const IAPI='https://wnknxjxipkvioegskefd.supabase.co/functions/v1/daily-inventory';
const q=(s,r=document)=>r.querySelector(s),qa=(s,r=document)=>Array.from(r.querySelectorAll(s));
let mainUser=null,userBusy=null,dashKey='',reportKey='',timer=0;
const token=()=>localStorage.getItem('inventory_token')||'';
const esc=s=>String(s??'').replace(/[&<>\"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;'}[c]));
async function post(url,action,p={}){const t=token();if(!t)throw Error('no-token');const r=await fetch(url,{method:'POST',headers:{'content-type':'application/json',authorization:'Bearer '+t},body:JSON.stringify({action,...p})});const d=await r.json().catch(()=>({}));if(!r.ok||d.ok===false)throw Error(d.error||'request-failed');return d}
async function getUser(){if(mainUser)return mainUser;if(userBusy)return userBusy;userBusy=post(IAPI,'bootstrap').then(d=>(mainUser=d.user||null)).catch(()=>null).finally(()=>userBusy=null);return userBusy}
function fmt(n){const x=Number(n||0);return Number.isInteger(x)?String(x):String(Math.round(x*100)/100)}
function time(v){try{return new Intl.DateTimeFormat('ar-SA',{hour:'2-digit',minute:'2-digit',timeZone:'Asia/Riyadh'}).format(new Date(v))}catch{return''}}
function isManagerPage(){const h=qa('.head h2').find(x=>(x.textContent||'').trim()==='لوحة المدير');return h||null}
function prepareManagerScaffold(){
 const h2=isManagerPage(),dash=q('#dash');if(!h2||!dash)return null;
 document.body.classList.add('pro-manager-dashboard');document.body.classList.remove('pro-admin-page');
 const shell=h2.closest('.shell');shell?.classList.add('manager-shell');
 const head=h2.closest('.head');head?.classList.add('manager-hero');
 dash.classList.add('manager-grid');
 qa('.dash',dash).forEach(card=>{
  card.dataset.managerReady='1';card.classList.add('manager-branch-card');
  const status=q('.status',card);if(status){card.classList.remove('report-ok','report-draft','report-miss');if(status.classList.contains('ok'))card.classList.add('report-ok');else if(status.classList.contains('draft'))card.classList.add('report-draft');else card.classList.add('report-miss')}
  const title=q('h3',card);let cardHead=q('.manager-card-head',card);
  if(title&&!cardHead){cardHead=document.createElement('div');cardHead.className='manager-card-head';title.before(cardHead);cardHead.appendChild(title);if(status)cardHead.appendChild(status)}
  const meta=q('.meta',card);if(meta)meta.classList.add('manager-card-meta');
  const open=q('.open',card);if(open)open.classList.add('manager-open-report');
 });
 const cards=qa('.dash',dash);let summary=q('.manager-summary',shell);
 if(cards.length&&!summary){summary=document.createElement('div');summary.className='manager-summary';head?.insertAdjacentElement('afterend',summary)}
 if(summary&&cards.length){const ok=cards.filter(c=>c.classList.contains('report-ok')).length;summary.innerHTML=`<span><b>${cards.length}</b> فروع</span><span class="sum-ok"><b>${ok}</b> معتمد</span><span class="sum-wait"><b>${cards.length-ok}</b> بانتظار الإكمال</span>`}
 return{h2,dash,shell,head};
}
function managerHeader(){q('#morningAdminBtn')?.remove();const sub=q('.manager-hero .muted')||q('.head .muted');if(sub)sub.textContent='الاستلام الصباحي والجرد النهائي في شاشة واحدة'}
function ensureOverview(rows){const shell=q('.manager-shell')||q('.shell'),dash=q('#dash');if(!shell||!dash)return;let el=q('.morning-overview',shell);if(!el){el=document.createElement('div');el.className='morning-overview';dash.before(el)}const done=rows.filter(r=>Number(r.batch_count)>0).length,total=rows.length,last=rows.filter(r=>r.last_at).sort((a,b)=>new Date(b.last_at)-new Date(a.last_at))[0];el.innerHTML=`<span><b>${done}/${total}</b> فروع سجّلت الاستلام الصباحي</span><span>${last?.last_at?'آخر استلام '+time(last.last_at):'لا توجد استلامات لهذا اليوم'}</span>`}
function finalStatusText(card){const s=q('.status',card);return s?String(s.textContent||'').trim():'الجرد النهائي'}
function makeWorkflow(card,row,date){
 const title=q('h3',card),status=q('.status',card),meta=q('.manager-card-meta,.meta',card),open=q('.manager-open-report,.open',card);if(!title)return;
 let head=q('.manager-card-head',card);if(!head){head=document.createElement('div');head.className='manager-card-head';title.before(head);head.appendChild(title);if(status)head.appendChild(status)}
 let flow=q('.unified-workflow',card);if(!flow){flow=document.createElement('div');flow.className='unified-workflow';head.insertAdjacentElement('afterend',flow);flow.innerHTML='<section class="workflow-pane morning-pane"><div class="workflow-label">الاستلام الصباحي</div><div class="morning-body"></div></section><section class="workflow-pane final-pane"><div class="workflow-label">الجرد النهائي</div><div class="final-status-slot"></div><div class="final-meta-slot"></div><div class="final-action-slot"></div></section>'}
 const final=q('.final-pane',flow),statusSlot=q('.final-status-slot',final),metaSlot=q('.final-meta-slot',final),actionSlot=q('.final-action-slot',final);
 if(status&&statusSlot&&!statusSlot.contains(status))statusSlot.appendChild(status);
 if(meta&&metaSlot&&!metaSlot.contains(meta))metaSlot.appendChild(meta);
 if(open&&actionSlot&&!actionSlot.contains(open)){open.textContent='فتح الجرد النهائي';open.classList.add('manager-open-report');actionSlot.appendChild(open)}
 const body=q('.morning-body',flow),has=Number(row?.batch_count||0)>0;
 body.innerHTML=has?`<div class="morning-state ok">تم التسجيل</div><div class="morning-numbers"><span><b>${row.batch_count}</b> دفعة</span><span><b>${row.item_count}</b> صنف</span></div><div class="morning-last">آخر استلام ${row.last_at?time(row.last_at):'—'}</div><button class="btn morning-details-btn" type="button">تفاصيل الاستلام</button>`:`<div class="morning-state wait">لم يُسجّل بعد</div><div class="morning-empty">لا توجد دفعات صباحية لهذا التاريخ</div>`;
 const btn=q('.morning-details-btn',body);if(btn)btn.onclick=()=>toggleDetails(card,row,date,btn);
 let details=q('.morning-inline-details',card);if(!details){details=document.createElement('div');details.className='morning-inline-details';flow.insertAdjacentElement('afterend',details)}details.dataset.branch=row?.branch_id||'';details.dataset.date=date||'';
 card.classList.add('unified-manager-card');card.dataset.finalStatus=finalStatusText(card)
}
async function toggleDetails(card,row,date,btn){const box=q('.morning-inline-details',card);if(!box)return;if(box.classList.contains('open')){box.classList.remove('open');box.innerHTML='';btn.textContent='تفاصيل الاستلام';return}btn.disabled=true;btn.textContent='جاري التحميل...';try{const d=await post(RAPI,'manager_batches',{date,branch_id:row.branch_id}),bs=d.batches||[];box.innerHTML=`<div class="morning-detail-head"><b>دفعات الاستلام الصباحي</b><span>${bs.length} دفعة في السجل</span></div>${bs.length?bs.map(renderBatch).join(''):'<div class="morning-detail-empty">لا توجد دفعات</div>'}`;box.classList.add('open');btn.textContent='إغلاق التفاصيل';qa('.morning-void',box).forEach(b=>b.onclick=()=>voidBatch(b.dataset.id,card,row,date,btn))}catch(e){box.innerHTML=`<div class="morning-detail-empty">${esc(e.message)}</div>`;box.classList.add('open');btn.textContent='إغلاق التفاصيل'}finally{btn.disabled=false}}
function renderBatch(b){const posted=b.status==='posted',who=b.receiver?.display_name||b.receiver?.username||'مشرف صباحي';return `<article class="morning-batch ${posted?'':'voided'}"><div class="morning-batch-top"><div><b>${esc(who)}</b><small>${time(b.created_at)} · ${b.entries?.length||0} صنف</small></div><span class="morning-badge ${posted?'posted':'voided'}">${posted?'فعالة':'ملغاة'}</span></div>${b.note?`<div class="morning-batch-note">${esc(b.note)}</div>`:''}<div class="morning-batch-items">${(b.entries||[]).map(e=>`<span>${esc(e.name)} <b>${fmt(e.qty)}</b> ${esc(e.unit)}</span>`).join('')}</div>${posted?`<button class="btn morning-void" data-id="${esc(b.id)}" type="button">إلغاء الدفعة</button>`:`<div class="morning-void-reason">${b.void_reason?'سبب الإلغاء: '+esc(b.void_reason):'دفعة ملغاة'}</div>`}</article>`}
async function voidBatch(id,card,row,date,detailsBtn){const reason=prompt('سبب إلغاء الدفعة؟\nسيُحفظ السبب في السجل.','تصحيح إدخال');if(reason===null)return;if(!confirm('تأكيد إلغاء هذه الدفعة؟\nسيُعاد احتساب الوارد المسائي تلقائيًا.'))return;try{await post(RAPI,'manager_void',{batch_id:id,reason});dashKey='';await enhanceDashboard(true);const newRow=(await post(RAPI,'manager_summary',{date})).rows?.find(x=>x.branch_id===row.branch_id)||row;const box=q('.morning-inline-details',card);if(box){box.classList.remove('open');box.innerHTML=''}const b=q('.morning-details-btn',card)||detailsBtn;if(b)await toggleDetails(card,newRow,date,b)}catch(e){alert(e.message||'تعذر إلغاء الدفعة')}}
async function enhanceDashboard(force=false){
 const scaffold=prepareManagerScaffold();if(!scaffold)return false;managerHeader();
 const date=q('#md')?.value||q('.manager-hero input[type=date]')?.value;if(!date)return true;
 const cards=qa('.dash',scaffold.dash),key=date+'|'+cards.length;
 if(!force&&key===dashKey&&qa('.unified-workflow',scaffold.dash).length===cards.length){document.body.classList.add('unified-manager-ready');return true}
 dashKey=key;
 try{const d=await post(RAPI,'manager_summary',{date}),rows=d.rows||[];ensureOverview(rows);cards.forEach(card=>{const name=(q('h3',card)?.textContent||'').trim(),r=rows.find(x=>x.branch_name===name);if(r)makeWorkflow(card,r,date)});document.body.classList.add('unified-manager-ready')}catch(e){dashKey=''}
 return true
}
async function enhanceReport(){const incoming=qa('input.report-input[data-key="incoming"],input[data-key="incoming"]'),stock=qa('input.report-input[data-key="value"],input[data-key="value"]');if(!incoming.length&&!stock.length)return false;const u=await getUser();if(!u||u.role==='manager')return true;const date=q('#rd')?.value||q('.head input[type=date]')?.value||q('input[type=date]')?.value;if(!date||!u.branch_id)return true;const key=u.branch_id+'|'+date+'|'+incoming.length+'|'+stock.length;if(key===reportKey&&(incoming.some(x=>x.dataset.morningChecked==='1')||stock.some(x=>x.dataset.morningChecked==='1')))return true;reportKey=key;try{const d=await post(RAPI,'inventory_totals',{date}),tot=d.totals||{},morningActive=Number(d.batch_count||0)>0;let linked=0,stockLinked=0;incoming.forEach(inp=>{const id=inp.dataset.id,total=Number(tot[id]||0),parent=inp.parentElement;if(morningActive){if(total>0)linked++;if(Number(inp.value)!==total){inp.value=fmt(total);inp.dispatchEvent(new Event('input',{bubbles:true}))}inp.readOnly=true;inp.classList.add('auto-incoming');inp.dataset.morningChecked='1';let note=parent?.querySelector('.morning-linked');if(!note&&parent){note=document.createElement('small');note.className='morning-linked';parent.appendChild(note)}if(note)note.textContent=total>0?'من الاستلام الصباحي':'لا يوجد استلام صباحي'}else{inp.readOnly=false;inp.classList.remove('auto-incoming');inp.dataset.morningChecked='1';parent?.querySelector('.morning-linked')?.remove()}});stock.forEach(inp=>{const total=Number(tot[inp.dataset.id]||0),card=inp.closest('.item')||inp.parentElement;inp.dataset.morningChecked='1';let note=card?.querySelector('.morning-stock-info');if(morningActive&&total>0){stockLinked++;if(!note&&card){note=document.createElement('div');note.className='morning-stock-info';card.appendChild(note)}if(note){const unit=(q('.unit',card)?.textContent||'').trim();note.textContent=`استلام صباحي: ${fmt(total)}${unit?' '+unit:''}`}}else note?.remove()});let banner=q('.morning-link-banner');if(morningActive){if(!banner){banner=document.createElement('div');banner.className='morning-link-banner';const anchor=q('.note')||q('.section');anchor?.parentElement?.insertBefore(banner,anchor)}if(banner){if(incoming.length)banner.textContent=`الوارد مربوط تلقائيًا باستلامات الصباح لهذا اليوم${linked?` · ${linked} صنف بقيمة مستلمة`:''}. لإضافة وارد جديد استخدم صفحة الاستلام الصباحي.`;else banner.textContent=`تم ربط سجل استلامات الصباح بهذا التقرير${stockLinked?` · ${stockLinked} صنف تم استلامه اليوم`:''}. كمية آخر اليوم تبقى جردًا مستقلًا.`}}else banner?.remove()}catch(e){reportKey=''}return true}
async function run(){if(await enhanceDashboard())return;await enhanceReport()}
function schedule(){clearTimeout(timer);timer=setTimeout(run,80)}
function forceRefresh(){dashKey='';reportKey='';schedule()}
new MutationObserver(schedule).observe(document.documentElement,{subtree:true,childList:true,attributes:true,attributeFilter:['class']});
document.addEventListener('change',e=>{if(e.target?.matches?.('input[type=date]'))forceRefresh()});
window.addEventListener('focus',forceRefresh);setInterval(forceRefresh,60000);
[0,50,150,350,800,1500].forEach(ms=>setTimeout(forceRefresh,ms));
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',schedule);else schedule();
})();