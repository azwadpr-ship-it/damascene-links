(()=>{'use strict';
if(window.__branchReportStableV63)return;window.__branchReportStableV63=true;
let loading=null;
function loadReport(){
 if(window.__reportV31Loaded)return Promise.resolve();
 if(loading)return loading;
 loading=new Promise((resolve,reject)=>{
  const old=document.getElementById('report-v32-v63-js');
  if(old){old.addEventListener('load',resolve,{once:true});old.addEventListener('error',()=>reject(new Error('تعذر تحميل قالب التقرير')),{once:true});return}
  const s=document.createElement('script');s.id='report-v32-v63-js';s.src='/inventory/report-v32.js?v=63';s.async=false;s.onload=resolve;s.onerror=()=>reject(new Error('تعذر تحميل قالب التقرير'));document.body.appendChild(s)
 });
 return loading
}
document.addEventListener('click',async e=>{
 const b=e.target.closest?.('#jpg,#share,#pdfShare');if(!b)return;
 if(b.dataset.reportStablePass==='1'){delete b.dataset.reportStablePass;return}
 e.preventDefault();e.stopPropagation();e.stopImmediatePropagation();
 const oldText=b.textContent;b.disabled=true;b.textContent='جاري تجهيز التقرير...';
 try{
  await loadReport();
  b.disabled=false;b.textContent=oldText;b.dataset.reportStablePass='1';
  setTimeout(()=>b.click(),0)
 }catch(err){b.disabled=false;b.textContent=oldText;alert(err?.message||'تعذر تحميل التقرير')}
},true);
})();
