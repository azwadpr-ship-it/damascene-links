(()=>{'use strict';
if(window.__branchReportLazyV44)return;window.__branchReportLazyV44=true;
const IDS=['jpg','share'];
let loading=null;
function loadScript(src,id){return new Promise((resolve,reject)=>{if(document.getElementById(id))return resolve();const s=document.createElement('script');s.id=id;s.src=src;s.async=false;s.onload=()=>resolve();s.onerror=()=>reject(new Error('تعذر تحميل قالب التقرير'));document.body.appendChild(s)})}
async function ensureReport(){if(window.__reportV31Loaded)return;loading ||= loadScript('/inventory/report-v32.js?v=32','report-v32-js');return loading}
function stripCoreHandler(id){const old=document.getElementById(id);if(!old||old.dataset.lazyV44==='1')return;const fresh=old.cloneNode(true);fresh.dataset.lazyV44='1';old.replaceWith(fresh);
 const handler=async e=>{e.preventDefault();e.stopPropagation();e.stopImmediatePropagation();fresh.disabled=true;const originalText=fresh.textContent;fresh.textContent='جاري تجهيز التقرير...';try{await ensureReport();fresh.removeEventListener('click',handler,true);const current=document.getElementById(id);if(current){current.disabled=false;if(current===fresh&&current.textContent==='جاري تجهيز التقرير...')current.textContent=originalText;setTimeout(()=>current.click(),0)}}catch(err){fresh.disabled=false;fresh.textContent=originalText;alert(err?.message||'تعذر تحميل التقرير')}};
 fresh.addEventListener('click',handler,true)
}
function init(){IDS.forEach(stripCoreHandler)}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();
