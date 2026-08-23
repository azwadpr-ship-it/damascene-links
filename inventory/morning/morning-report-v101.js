(()=>{'use strict';
if(window.__morningReportV101)return;window.__morningReportV101=true;
const nativeFetch=window.fetch.bind(window);
function branchKey(b){const r=String(b?.id||b?.branch_id||'').toLowerCase(),n=String(b?.name||b?.branch_name||'');if(r.includes('mazaq')||n.includes('المذاق'))return'mazaq';if(r.includes('individual')||n.includes('أفراد'))return'individuals';if(r.includes('famil')||n.includes('عوائل'))return'families';return r}
function normalizeState(){try{const s=window.__morningReceivingState;if(s?.branch)s.branch={...s.branch,id:branchKey(s.branch)}}catch{}}
normalizeState();
window.fetch=async function(input,init){const r=await nativeFetch(input,init);try{const u=typeof input==='string'?input:(input?.url||'');if(u.includes('/functions/v1/daily-inventory-receiving')&&String(init?.method||'GET').toUpperCase()==='POST'){const body=typeof init?.body==='string'?JSON.parse(init.body):null;if(body?.action==='bootstrap'){const d=await r.clone().json();if(d?.branch)d.branch={...d.branch,id:branchKey(d.branch)};return new Response(JSON.stringify(d),{status:r.status,statusText:r.statusText,headers:r.headers})}}}catch{}return r};
function surface(){try{const p=document.querySelector('.morning-report-actions'),c=document.getElementById('content');if(!p||!c)return;const a=c.querySelector('.snapshot-note')||c.querySelector('.hero');if(a&&a.nextElementSibling!==p)a.insertAdjacentElement('afterend',p)}catch{}}
function fireState(){normalizeState();const s=window.__morningReceivingState;if(s)window.dispatchEvent(new CustomEvent('morning-receiving-state',{detail:s}));surface()}
(async()=>{try{
 const r=await nativeFetch('/inventory/morning/morning-report-v1-base-v12.js?v=10',{cache:'no-store'});if(!r.ok)throw Error('تعذر تحميل قالب تقرير الاستلام');
 let code=await r.text();

 const oldLogo="function loadMazaqReportLogo(){return new Promise(resolve=>{const i=new Image();i.onload=()=>resolve(i);i.onerror=()=>resolve(null);i.src=MAZAQ_REPORT_LOGO})}";
 const newLogo="function loadMazaqReportLogo(){return nativeMazaqLogo()}";
 if(!code.includes(oldLogo))throw Error('تعذر تثبيت شعار المذاق');
 code=code.replace(oldLogo,newLogo);
 code="const nativeMazaqLogo=()=>fetch(MAZAQ_REPORT_LOGO,{cache:'no-store'}).then(r=>{if(!r.ok)throw Error('تعذر تحميل شعار المذاق');return r.blob()}).then(b=>new Promise((resolve,reject)=>{const u=URL.createObjectURL(b),i=new Image();i.onload=()=>{URL.revokeObjectURL(u);resolve(i)};i.onerror=()=>{URL.revokeObjectURL(u);reject(Error('تعذر فك شعار المذاق'))};i.src=u}));\n"+code;

 const oldDay="async function loadDay(date){const loaded=await post('receiving_load',{date});try{loaded.data.inventory_snapshot=await snapshot(date)}catch(e){console.error('morning report snapshot',e)}return loaded}";
 const newDay="async function loadDay(date){const st=window.__morningReceivingState;if(st&&st.date===date&&st.data&&(st.data.batches||[]).length)return {ok:true,data:st.data};return await post('receiving_load',{date})}";
 if(!code.includes(oldDay))throw Error('تعذر تثبيت قراءة دفعات الاستلام');
 code=code.replace(oldDay,newDay);

 const oldCount="function reportItemCount(data){const batches=(data?.batches||[]).length;if(batches)return Object.values(data?.totals||{}).filter(v=>Number(v)>0).length;return Number(data?.inventory_snapshot?.count||0)}";
 const newCount="function reportItemCount(data){const batches=(data?.batches||[]).length;if(!batches)return 0;return Object.values(data?.totals||{}).filter(v=>Number(v)>0).length}";
 if(!code.includes(oldCount))throw Error('تعذر تثبيت عداد أصناف الاستلام');
 code=code.replace(oldCount,newCount);

 const oldPrepare="if(hint){const count=(r.data?.batches||[]).length,itemCount=reportItemCount(r.data),fallback=!count&&itemCount>0;hint.textContent=fallback?`تقرير الحالة الصباحية — آخر جرد ${r.data.inventory_snapshot?.date||''} / ${itemCount} صنف — جاهز للمشاركة`:`تقرير اليوم الكامل — ${count} دفعة / ${itemCount} صنف — ${ddmmyyyy(date)} — جاهز للمشاركة`}";
 const newPrepare="if(hint){const count=(r.data?.batches||[]).length,itemCount=reportItemCount(r.data);hint.textContent=`تقرير الاستلام الصباحي — ${count} دفعة / ${itemCount} صنف — ${ddmmyyyy(date)} — جاهز للمشاركة`}";
 if(!code.includes(oldPrepare))throw Error('تعذر تثبيت حالة تجهيز تقرير الاستلام');
 code=code.replace(oldPrepare,newPrepare);

 const oldRefresh="async function refreshReportState(){injectActions();const card=$('#morningReportActions');if(!card)return;const date=reportDate(),seq=++reportCheckSeq,hint=$('#morningReportHint'),images=$('#morningShareImages'),pdf=$('#morningSharePdf');if(images)images.disabled=true;if(pdf)pdf.disabled=true;card.classList.add('morning-report-empty');if(hint)hint.textContent='جاري التحقق من التقرير المحفوظ...';try{const loaded=await loadDay(date);if(seq!==reportCheckSeq)return;const count=(loaded.data?.batches||[]).length,itemCount=reportItemCount(loaded.data),fallback=!count&&itemCount>0,pending=pendingDraftCount(),disabled=!count&&!fallback&&!pending;preparedReport=null;prepareSeq++;if(images)images.disabled=true;if(pdf)pdf.disabled=true;card.classList.toggle('morning-report-empty',disabled);if(disabled){if(hint)hint.textContent=date===today()?'لا توجد دفعات استلام أو جرد محفوظ لهذا اليوم حتى الآن.':`لا توجد بيانات محفوظة بتاريخ ${ddmmyyyy(date)}.`}else if(pending){if(images)images.disabled=false;if(pdf)pdf.disabled=false;if(hint)hint.textContent=`${pending} صنف جديد غير محفوظ — عند المشاركة سيتم حفظ الدفعة تلقائيًا ثم إرسال تقرير اليوم الكامل.`}else if(fallback){if(hint)hint.textContent=`لا توجد دفعات استلام بعد — سيتم إنشاء تقرير حالة صباحية من آخر جرد محفوظ بتاريخ ${loaded.data.inventory_snapshot?.date||''} (${itemCount} صنف).`;prepareReport(date)}else{if(hint)hint.textContent=`جاري تجهيز تقرير اليوم الكامل — ${count} دفعة / ${itemCount} صنف...`;prepareReport(date)}}catch(e){if(seq!==reportCheckSeq)return;if(hint)hint.textContent=e?.message||'تعذر التحقق من التقرير'}}";
 const newRefresh="async function refreshReportState(){injectActions();const card=$('#morningReportActions');if(!card)return;const date=reportDate(),seq=++reportCheckSeq,hint=$('#morningReportHint'),images=$('#morningShareImages'),pdf=$('#morningSharePdf');if(images)images.disabled=true;if(pdf)pdf.disabled=true;card.classList.add('morning-report-empty');if(hint)hint.textContent='جاري التحقق من دفعات الاستلام الصباحي...';try{const loaded=await loadDay(date);if(seq!==reportCheckSeq)return;const count=(loaded.data?.batches||[]).length,itemCount=reportItemCount(loaded.data),pending=pendingDraftCount(),disabled=!count&&!pending;preparedReport=null;prepareSeq++;card.classList.toggle('morning-report-empty',disabled);if(disabled){if(hint)hint.textContent=date===today()?'لا توجد دفعات استلام صباحي محفوظة لهذا اليوم حتى الآن.':`لا توجد دفعات استلام صباحي محفوظة بتاريخ ${ddmmyyyy(date)}.`;return}if(images)images.disabled=false;if(pdf)pdf.disabled=false;if(pending){if(hint)hint.textContent=`${pending} صنف جديد غير محفوظ — عند المشاركة سيتم حفظ دفعة الاستلام أولًا ثم إرسال تقرير الاستلام الصباحي فقط.`}else{if(hint)hint.textContent=`جاري تجهيز تقرير الاستلام الصباحي — ${count} دفعة / ${itemCount} صنف...`;prepareReport(date)}}catch(e){if(seq!==reportCheckSeq)return;if(hint)hint.textContent=e?.message||'تعذر التحقق من دفعات الاستلام الصباحي'}}";
 if(!code.includes(oldRefresh))throw Error('تعذر تثبيت حالة تقرير الاستلام');
 code=code.replace(oldRefresh,newRefresh);

 const oldGroups="function groupTotals(data){const bySec=new Map(),hasBatches=(data.batches||[]).length>0,tot=hasBatches?(data.totals||{}):(data.inventory_snapshot?.values||{});(data.items||[]).forEach(i=>{const raw=tot[i.id];if(raw===undefined||raw===null||raw==='')return;const qty=Number(raw);if(!Number.isFinite(qty))return;if(!hasBatches&&qty===0)return;if(hasBatches&&!(qty>0))return;if(!bySec.has(i.section))bySec.set(i.section,[]);bySec.get(i.section).push({name:i.name,unit:i.unit,qty})});return Array.from(bySec,([section,rows])=>({section,rows}))}";
 const newGroups="function groupTotals(data){const bySec=new Map(),tot=data.totals||{};(data.items||[]).forEach(i=>{const raw=tot[i.id];if(raw===undefined||raw===null||raw==='')return;const qty=Number(raw);if(!Number.isFinite(qty)||!(qty>0))return;if(!bySec.has(i.section))bySec.set(i.section,[]);bySec.get(i.section).push({name:i.name,unit:i.unit,qty})});return Array.from(bySec,([section,rows])=>({section,rows}))}";
 if(!code.includes(oldGroups))throw Error('تعذر تثبيت أصناف الاستلام');
 code=code.replace(oldGroups,newGroups);

 const oldBuild=",groups=groupTotals(data),fallback=!(data.batches||[]).length&&Number(data.inventory_snapshot?.count||0)>0;if(!(data.batches||[]).length&&!fallback)throw Error('لا توجد دفعات استلام أو جرد محفوظ لهذا اليوم');if(!groups.length)throw Error(fallback?'لا توجد قيم محفوظة في آخر جرد':'لا توجد كميات مستلمة في التقرير');const cols=balancedColumns(groups)";
 const newBuild=",groups=groupTotals(data);if(!(data.batches||[]).length)throw Error('لا توجد دفعات استلام صباحي محفوظة لهذا اليوم');if(!groups.length)throw Error('لا توجد كميات مستلمة في تقرير الاستلام');const cols=balancedColumns(groups)";
 if(!code.includes(oldBuild))throw Error('تعذر إلغاء بديل الجرد من بناء التقرير');
 code=code.replace(oldBuild,newBuild);

 const needle="reportLogo=reportBranchId==='mazaq'?await loadMazaqReportLogo():reportBranchId==='individuals'?await loadIndividualsReportLogo():reportBranchId==='families'?await loadFamiliesReportLogo():null;const raw=";
 const repl="reportLogo=reportBranchId==='mazaq'?await loadMazaqReportLogo():reportBranchId==='individuals'?await loadIndividualsReportLogo():reportBranchId==='families'?await loadFamiliesReportLogo():null;if(reportBranchId==='mazaq'&&!reportLogo)throw new Error('تعذر تحميل شعار المذاق.');const raw=";
 if(!code.includes(needle))throw Error('تعذر تثبيت شرط الشعار');
 code=code.replace(needle,repl);

 (0,eval)(code+'\n//# sourceURL=morning-report-runtime-v101.js');
 fireState();setTimeout(fireState,80);setTimeout(fireState,300);setTimeout(fireState,800);
}catch(e){console.error('morning report v101',e);const h=document.getElementById('morningReportHint');if(h)h.textContent=e.message}})();
new MutationObserver(surface).observe(document.body,{childList:true,subtree:true});
})();
