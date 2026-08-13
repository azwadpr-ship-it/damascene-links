(()=>{'use strict';
let raf=0;
const q=(s,r=document)=>r.querySelector(s),qa=(s,r=document)=>Array.from(r.querySelectorAll(s));
function isText(el,t){return (el?.textContent||'').trim()===t}
function markTop(){const top=q('.top');if(!top)return;top.classList.add('pro-clean-top');q('.logo',top)?.remove();const user=q('.userlabel',top);if(user&&isText(user,'المدير'))user.remove()}
function ensureUnifiedSkeleton(card){
 const title=q('h3',card),status=q('.status',card),meta=q('.manager-card-meta,.meta',card),open=q('.manager-open-report,.open',card);if(!title)return;
 let head=q('.manager-card-head',card);
 if(!head){head=document.createElement('div');head.className='manager-card-head';title.before(head);head.appendChild(title);if(status)head.appendChild(status)}
 let flow=q('.unified-workflow',card);
 if(!flow){flow=document.createElement('div');flow.className='unified-workflow';head.insertAdjacentElement('afterend',flow);flow.innerHTML='<section class="workflow-pane morning-pane"><div class="workflow-label">الاستلام الصباحي</div><div class="morning-body"><div class="morning-state wait">جاري التحميل</div><div class="morning-empty">يتم التحقق من استلامات هذا التاريخ...</div></div></section><section class="workflow-pane final-pane"><div class="workflow-label">الجرد النهائي</div><div class="final-status-slot"></div><div class="final-meta-slot"></div><div class="final-action-slot"></div></section>'}
 const final=q('.final-pane',flow),statusSlot=q('.final-status-slot',final),metaSlot=q('.final-meta-slot',final),actionSlot=q('.final-action-slot',final);
 if(status&&statusSlot&&!statusSlot.contains(status))statusSlot.appendChild(status);
 if(meta&&metaSlot&&!metaSlot.contains(meta))metaSlot.appendChild(meta);
 if(open&&actionSlot&&!actionSlot.contains(open)){open.textContent='فتح الجرد النهائي';open.classList.add('manager-open-report');actionSlot.appendChild(open)}
 if(!q('.morning-inline-details',card)){const details=document.createElement('div');details.className='morning-inline-details';flow.insertAdjacentElement('afterend',details)}
 card.classList.add('unified-manager-card')
}
function enhanceManager(){const h2=qa('.head h2').find(x=>isText(x,'لوحة المدير'));if(!h2)return false;document.body.classList.add('pro-manager-dashboard','unified-manager-ready');document.body.classList.remove('pro-admin-page');const shell=h2.closest('.shell');shell?.classList.add('manager-shell');const head=h2.closest('.head');head?.classList.add('manager-hero');const dash=q('#dash');if(!dash)return true;dash.classList.add('manager-grid');qa('.dash',dash).forEach(card=>{card.dataset.managerReady='1';card.classList.add('manager-branch-card');const status=q('.status',card);if(status){card.classList.remove('report-ok','report-draft','report-miss');if(status.classList.contains('ok'))card.classList.add('report-ok');else if(status.classList.contains('draft'))card.classList.add('report-draft');else card.classList.add('report-miss')}
 const title=q('h3',card),meta=q('.meta',card),open=q('.open',card);if(title&&status&&!q('.manager-card-head',card)){const wrap=document.createElement('div');wrap.className='manager-card-head';title.before(wrap);wrap.append(title,status)}if(open)open.classList.add('manager-open-report');if(meta)meta.classList.add('manager-card-meta');ensureUnifiedSkeleton(card)});
 const cards=qa('.dash',dash);if(cards.length&&!q('.manager-summary',shell)){const ok=cards.filter(c=>c.classList.contains('report-ok')).length,draft=cards.filter(c=>c.classList.contains('report-draft')).length,miss=cards.filter(c=>c.classList.contains('report-miss')).length;const s=document.createElement('div');s.className='manager-summary';s.innerHTML=`<span><b>${cards.length}</b> فروع</span><span class="sum-ok"><b>${ok}</b> معتمد</span><span class="sum-wait"><b>${draft+miss}</b> بانتظار الإكمال</span>`;head?.insertAdjacentElement('afterend',s)}else if(cards.length){const s=q('.manager-summary',shell),vals=s?qa('b',s):[];if(vals.length>=3){vals[0].textContent=cards.length;vals[1].textContent=cards.filter(c=>c.classList.contains('report-ok')).length;vals[2].textContent=cards.filter(c=>!c.classList.contains('report-ok')).length}}
 return true}
function enhanceAdmin(){const table=q('.admin-accordion')||q('.admintable,.admin-table');const form=q('.adminform,.admin-form');if(!table&&!form)return false;const h2=qa('.head h2').find(x=>(x.textContent||'').includes('إدارة'));if(!h2)return false;document.body.classList.add('pro-admin-page');document.body.classList.remove('pro-manager-dashboard','unified-manager-ready');h2.closest('.shell')?.classList.add('admin-shell');h2.closest('.head')?.classList.add('admin-page-head');return true}
function run(){markTop();if(!enhanceManager())enhanceAdmin()}
function schedule(){cancelAnimationFrame(raf);raf=requestAnimationFrame(run)}
new MutationObserver(schedule).observe(document.documentElement,{subtree:true,childList:true});
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',run);else run();
})();