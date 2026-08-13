(()=>{'use strict';
const MARK='pro-v13-ready';
const DELETE_API='https://wnknxjxipkvioegskefd.supabase.co/functions/v1/daily-inventory-delete';
let timer=null;
function qsa(s,r=document){return Array.from(r.querySelectorAll(s))}
function valFilled(inp){return inp&&inp.value!==''&&inp.value!==null&&inp.value!==undefined}
function flashToast(msg,bad=false){let t=document.querySelector('.pro-admin-toast');if(!t){t=document.createElement('div');t.className='pro-admin-toast';document.body.appendChild(t)}t.textContent=msg;t.classList.toggle('bad',!!bad);t.classList.add('show');clearTimeout(window.__proAdminToast);window.__proAdminToast=setTimeout(()=>t.classList.remove('show'),2600)}
function sectionStats(sec){const closing=qsa('input[data-key="closing"]',sec);if(closing.length)return{done:closing.filter(valFilled).length,total:closing.length};const simple=qsa('input[data-key="value"]',sec);return{done:simple.filter(valFilled).length,total:simple.length}}
function keyFor(sec){const title=sec.querySelector('.sectitle h3')?.textContent?.trim()||'section';const branch=document.querySelector('.head h2')?.textContent?.trim()||'branch';const date=document.querySelector('#rd')?.value||'';return `inv-acc:${branch}:${date}:${title}`}
function setOpen(sec,open){sec.classList.toggle('pro-open',!!open);try{sessionStorage.setItem(keyFor(sec),open?'1':'0')}catch{} }
function updateSection(sec){const st=sectionStats(sec),chip=sec.querySelector('.sec-progress');if(chip)chip.textContent=`${st.done}/${st.total}`;updateOverall()}
function updateOverall(){const secs=qsa('.section');let d=0,t=0;secs.forEach(s=>{const x=sectionStats(s);d+=x.done;t+=x.total});const label=document.querySelector('.report-progress strong'),fill=document.querySelector('.progress-fill');if(label)label.textContent=`الإنجاز ${d}/${t}`;if(fill)fill.style.width=(t?Math.round(d/t*100):0)+'%'}
function saveSection(sec,btn){const global=document.querySelector('#draft');if(!global)return;btn.disabled=true;btn.textContent='حفظ...';setOpen(sec,false);global.click()}
function prepSection(sec,index){if(sec.dataset.proDone==='1')return;sec.dataset.proDone='1';const title=sec.querySelector('.sectitle');if(!title)return;
 const existing=Array.from(sec.childNodes).filter(n=>n!==title);const wrap=document.createElement('div');wrap.className='section-content';existing.forEach(n=>wrap.appendChild(n));sec.appendChild(wrap);
 const oldSmall=title.querySelector('small');if(oldSmall)oldSmall.remove();
 const stats=document.createElement('span');stats.className='sec-progress';title.appendChild(stats);
 const save=document.createElement('button');save.type='button';save.className='sec-save';save.textContent='حفظ القسم';save.addEventListener('click',e=>{e.stopPropagation();saveSection(sec,save)});title.appendChild(save);
 const chev=document.createElement('span');chev.className='sec-chevron';chev.textContent='⌄';title.appendChild(chev);
 title.addEventListener('click',e=>{if(e.target.closest('.sec-save'))return;setOpen(sec,!sec.classList.contains('pro-open'))});
 qsa('.ri',sec).forEach(inp=>inp.addEventListener('input',()=>updateSection(sec)));
 let stored=null;try{stored=sessionStorage.getItem(keyFor(sec))}catch{}
 setOpen(sec,stored===null?index===0:stored==='1');updateSection(sec)
}
function addTools(){if(document.querySelector('.report-tools')||!document.querySelector('.section'))return;const head=document.querySelector('.head');if(!head)return;const tools=document.createElement('div');tools.className='report-tools';tools.innerHTML='<div class="report-progress"><strong>الإنجاز 0/0</strong><span class="progress-track"><span class="progress-fill"></span></span></div><button type="button" class="mini-action" data-act="open">فتح الكل</button><button type="button" class="mini-action" data-act="close">طي الكل</button>';
 head.insertAdjacentElement('afterend',tools);tools.addEventListener('click',e=>{const b=e.target.closest('[data-act]');if(!b)return;const open=b.dataset.act==='open';qsa('.section').forEach(s=>setOpen(s,open))})
}
async function permanentDelete(id,name,btn,row){
 const ok=confirm(`حذف الصنف «${name}» نهائيًا؟\n\nتنبيه: الحذف نهائي، وإذا كان للصنف بيانات في تقارير سابقة فسيتم حذف بيانات هذا الصنف منها أيضًا.\n\nهل تريد المتابعة؟`);if(!ok)return;
 const token=localStorage.getItem('inventory_token')||'';if(!token){flashToast('انتهت الجلسة، سجل الدخول من جديد',true);return}
 btn.disabled=true;btn.textContent='حذف...';
 try{const r=await fetch(DELETE_API,{method:'POST',headers:{'content-type':'application/json','authorization':'Bearer '+token},body:JSON.stringify({id})});const d=await r.json().catch(()=>({}));if(!r.ok||d.ok===false)throw new Error(d.error||'تعذر حذف الصنف');row?.remove();flashToast(`تم حذف «${name}» نهائيًا`);const sel=document.querySelector('#ab,#itemsBranch');if(sel)setTimeout(()=>sel.dispatchEvent(new Event('change',{bubbles:true})),250)}catch(e){btn.disabled=false;btn.textContent='حذف';flashToast(e.message||'تعذر حذف الصنف',true)}
}
function enhanceAdmin(){const table=document.querySelector('.admintable,.admin-table');if(!table)return;qsa('tbody tr',table).forEach(row=>{if(row.dataset.proDelete==='1')return;const edit=row.querySelector('.edit,.ai-edit');if(!edit)return;row.dataset.proDelete='1';const id=edit.dataset.id;const cells=row.querySelectorAll('td');const name=(cells[1]?.textContent||'الصنف').trim();const cell=edit.closest('td');if(!cell)return;cell.classList.add('pro-admin-actions');const del=document.createElement('button');del.type='button';del.className='btn admin-delete';del.dataset.id=id;del.textContent='حذف';del.addEventListener('click',()=>permanentDelete(id,name,del,row));cell.appendChild(del)})}
function enhance(){enhanceAdmin();if(!document.querySelector('.section')||!document.querySelector('.bottom'))return;document.documentElement.classList.add(MARK);addTools();qsa('.section').forEach(prepSection);updateOverall()}
function schedule(){clearTimeout(timer);timer=setTimeout(enhance,35)}
new MutationObserver(schedule).observe(document.documentElement,{childList:true,subtree:true});
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',enhance);else enhance();
})();
