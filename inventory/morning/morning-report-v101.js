(()=>{'use strict';
if(window.__morningReceivingOnlyRuntimeV101)return;window.__morningReceivingOnlyRuntimeV101=true;
const nativeFetch=window.fetch.bind(window);
(async()=>{try{
  const r=await nativeFetch('/inventory/morning/morning-report-v1.js?v=19',{cache:'no-store'});
  if(!r.ok)throw new Error('تعذر تحميل مولّد تقرير الاستلام');
  let src=await r.text();
  if(!src.includes('__morningReportWrapperV94'))throw new Error('نسخة مولّد الاستلام غير متوقعة');
  src=src.replace(/__morningReportWrapperV94/g,'__morningReportWrapperV101');

  const anchor=" code=code.replace(needle,repl);";
  if(!src.includes(anchor))throw new Error('تعذر تثبيت حماية تقرير الاستلام');

  const patch=`
 const fallbackDay="async function loadDay(date){const st=window.__morningReceivingState;if(st&&st.date===date&&st.data)return {ok:true,data:st.data};const delay=ms=>new Promise(resolve=>setTimeout(()=>resolve(null),ms));const snapP=Promise.race([snapshot(date),delay(4000)]).catch(()=>null);const loadP=Promise.race([post('receiving_load',{date}),delay(4000)]).catch(()=>null);const [snap,loaded]=await Promise.all([snapP,loadP]);if(loaded?.data){loaded.data.inventory_snapshot=snap||loaded.data.inventory_snapshot||null;if((loaded.data.batches||[]).length||!snap?.count)return loaded}if(snap?.count&&st?.data?.items){return {ok:true,data:{branch_id:st.data.branch_id||st.branch?.id||'',date,items:st.data.items,totals:{},batches:[],inventory_snapshot:snap}}}if(loaded?.data)return loaded;throw new Error('تعذر تحميل بيانات التقرير المحفوظ')}";
 const receivingDay="async function loadDay(date){const st=window.__morningReceivingState;if(st&&st.date===date&&st.data&&(st.data.batches||[]).length)return {ok:true,data:st.data};return await post('receiving_load',{date})}";
 if(!code.includes(fallbackDay))throw Error('تعذر إلغاء بديل الجرد من مصدر التقرير');
 code=code.replace(fallbackDay,receivingDay);

 const oldCount="function reportItemCount(data){const batches=(data?.batches||[]).length;if(batches)return Object.values(data?.totals||{}).filter(v=>Number(v)>0).length;return Number(data?.inventory_snapshot?.count||0)}";
 const newCount="function reportItemCount(data){const batches=(data?.batches||[]).length;if(!batches)return 0;return Object.values(data?.totals||{}).filter(v=>Number(v)>0).length}";
 if(!code.includes(oldCount))throw Error('تعذر تثبيت عداد أصناف الاستلام');
 code=code.replace(oldCount,newCount);

 const oldGroups="function groupTotals(data){const bySec=new Map(),hasBatches=(data.batches||[]).length>0,tot=hasBatches?(data.totals||{}):(data.inventory_snapshot?.values||{});(data.items||[]).forEach(i=>{const raw=tot[i.id];if(raw===undefined||raw===null||raw==='')return;const qty=Number(raw);if(!Number.isFinite(qty))return;if(!hasBatches&&qty===0)return;if(hasBatches&&!(qty>0))return;if(!bySec.has(i.section))bySec.set(i.section,[]);bySec.get(i.section).push({name:i.name,unit:i.unit,qty})});return Array.from(bySec,([section,rows])=>({section,rows}))}";
 const newGroups="function groupTotals(data){const bySec=new Map(),tot=data.totals||{};(data.items||[]).forEach(i=>{const raw=tot[i.id];if(raw===undefined||raw===null||raw==='')return;const qty=Number(raw);if(!Number.isFinite(qty)||!(qty>0))return;if(!bySec.has(i.section))bySec.set(i.section,[]);bySec.get(i.section).push({name:i.name,unit:i.unit,qty})});return Array.from(bySec,([section,rows])=>({section,rows}))}";
 if(!code.includes(oldGroups))throw Error('تعذر تثبيت أصناف الاستلام');
 code=code.replace(oldGroups,newGroups);

 const oldPrepare="if(hint){const count=(r.data?.batches||[]).length,itemCount=reportItemCount(r.data),fallback=!count&&itemCount>0;hint.textContent=fallback?`تقرير الحالة الصباحية — آخر جرد ${r.data.inventory_snapshot?.date||''} / ${itemCount} صنف — جاهز للمشاركة`:`تقرير اليوم الكامل — ${count} دفعة / ${itemCount} صنف — ${ddmmyyyy(date)} — جاهز للمشاركة`}";
 const newPrepare="if(hint){const count=(r.data?.batches||[]).length,itemCount=reportItemCount(r.data);hint.textContent=`تقرير الاستلام الصباحي — ${count} دفعة / ${itemCount} صنف — ${ddmmyyyy(date)} — جاهز للمشاركة`}";
 if(!code.includes(oldPrepare))throw Error('تعذر تثبيت حالة تجهيز تقرير الاستلام');
 code=code.replace(oldPrepare,newPrepare);

 const oldRefresh="async function refreshReportState(){injectActions();const card=$('#morningReportActions');if(!card)return;const date=reportDate(),seq=++reportCheckSeq,hint=$('#morningReportHint'),images=$('#morningShareImages'),pdf=$('#morningSharePdf');if(images)images.disabled=true;if(pdf)pdf.disabled=true;card.classList.add('morning-report-empty');if(hint)hint.textContent='جاري التحقق من التقرير المحفوظ...';try{const loaded=await loadDay(date);if(seq!==reportCheckSeq)return;const count=(loaded.data?.batches||[]).length,itemCount=reportItemCount(loaded.data),fallback=!count&&itemCount>0,pending=pendingDraftCount(),disabled=!count&&!fallback&&!pending;preparedReport=null;prepareSeq++;if(images)images.disabled=true;if(pdf)pdf.disabled=true;card.classList.toggle('morning-report-empty',disabled);if(disabled){if(hint)hint.textContent=date===today()?'لا توجد دفعات استلام أو جرد محفوظ لهذا اليوم حتى الآن.':`لا توجد بيانات محفوظة بتاريخ ${ddmmyyyy(date)}.`}else if(pending){if(images)images.disabled=false;if(pdf)pdf.disabled=false;if(hint)hint.textContent=`${pending} صنف جديد غير محفوظ — عند المشاركة سيتم حفظ الدفعة تلقائيًا ثم إرسال تقرير اليوم الكامل.`}else if(fallback){if(hint)hint.textContent=`لا توجد دفعات استلام بعد — سيتم إنشاء تقرير حالة صباحية من آخر جرد محفوظ بتاريخ ${loaded.data.inventory_snapshot?.date||''} (${itemCount} صنف).`;prepareReport(date)}else{if(hint)hint.textContent=`جاري تجهيز تقرير اليوم الكامل — ${count} دفعة / ${itemCount} صنف...`;prepareReport(date)}}catch(e){if(seq!==reportCheckSeq)return;if(hint)hint.textContent=e?.message||'تعذر التحقق من التقرير'}}";
 const newRefresh="async function refreshReportState(){injectActions();const card=$('#morningReportActions');if(!card)return;const date=reportDate(),seq=++reportCheckSeq,hint=$('#morningReportHint'),images=$('#morningShareImages'),pdf=$('#morningSharePdf');if(images)images.disabled=true;if(pdf)pdf.disabled=true;card.classList.add('morning-report-empty');if(hint)hint.textContent='جاري التحقق من دفعات الاستلام الصباحي...';try{const loaded=await loadDay(date);if(seq!==reportCheckSeq)return;const count=(loaded.data?.batches||[]).length,itemCount=reportItemCount(loaded.data),pending=pendingDraftCount(),disabled=!count&&!pending;preparedReport=null;prepareSeq++;card.classList.toggle('morning-report-empty',disabled);if(disabled){if(hint)hint.textContent=date===today()?'لا توجد دفعات استلام صباحي محفوظة لهذا اليوم حتى الآن.':`لا توجد دفعات استلام صباحي محفوظة بتاريخ ${ddmmyyyy(date)}.`;return}if(images)images.disabled=false;if(pdf)pdf.disabled=false;if(pending){if(hint)hint.textContent=`${pending} صنف جديد غير محفوظ — عند المشاركة سيتم حفظ دفعة الاستلام أولًا ثم إرسال تقرير الاستلام الصباحي فقط.`}else{if(hint)hint.textContent=`جاري تجهيز تقرير الاستلام الصباحي — ${count} دفعة / ${itemCount} صنف...`;prepareReport(date)}}catch(e){if(seq!==reportCheckSeq)return;if(hint)hint.textContent=e?.message||'تعذر التحقق من دفعات الاستلام الصباحي'}}";
 if(!code.includes(oldRefresh))throw Error('تعذر تثبيت حالة تقرير الاستلام');
 code=code.replace(oldRefresh,newRefresh);

 const oldBuild=",groups=groupTotals(data),fallback=!(data.batches||[]).length&&Number(data.inventory_snapshot?.count||0)>0;if(!(data.batches||[]).length&&!fallback)throw Error('لا توجد دفعات استلام أو جرد محفوظ لهذا اليوم');if(!groups.length)throw Error(fallback?'لا توجد قيم محفوظة في آخر جرد':'لا توجد كميات مستلمة في التقرير');const cols=balancedColumns(groups)";
 const newBuild=",groups=groupTotals(data);if(!(data.batches||[]).length)throw Error('لا توجد دفعات استلام صباحي محفوظة لهذا اليوم');if(!groups.length)throw Error('لا توجد كميات مستلمة في تقرير الاستلام');const cols=balancedColumns(groups)";
 if(!code.includes(oldBuild))throw Error('تعذر إلغاء بديل الجرد من بناء التقرير');
 code=code.replace(oldBuild,newBuild);
`;

  src=src.replace(anchor,anchor+patch);
  (0,eval)(src+'\n//# sourceURL=morning-report-wrapper-v101.js');
}catch(e){console.error('morning v101',e);const h=document.getElementById('morningReportHint');if(h)h.textContent=e.message}})();
})();
