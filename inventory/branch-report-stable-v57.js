(()=>{'use strict';
if(window.__branchReportStableV65)return;window.__branchReportStableV65=true;
let loading=null;
function loadReport(){
 if(window.__reportV31Loaded)return Promise.resolve();
 if(loading)return loading;
 loading=new Promise((resolve,reject)=>{
  const old=document.getElementById('report-v32-v63-js');
  if(old){if(window.__reportV31Loaded){resolve();return}old.addEventListener('load',resolve,{once:true});old.addEventListener('error',()=>reject(new Error('تعذر تحميل قالب التقرير')),{once:true});return}
  const s=document.createElement('script');s.id='report-v32-v63-js';s.src='/inventory/report-v32.js?v=63';s.async=false;s.onload=resolve;s.onerror=()=>reject(new Error('تعذر تحميل قالب التقرير'));document.body.appendChild(s)
 });
 return loading
}
function arrangeShareButtons(){
 const share=document.getElementById('share'),pdf=document.getElementById('pdfShare');
 if(!share||!pdf)return;
 if(share.textContent!=='مشاركة كصور')share.textContent='مشاركة كصور';
 if(pdf.textContent!=='مشاركة PDF')pdf.textContent='مشاركة PDF';
 let stack=share.closest('.report-share-stack');
 if(!stack){
  stack=document.createElement('div');stack.className='report-share-stack';
  share.parentNode.insertBefore(stack,share);stack.appendChild(share);stack.appendChild(pdf);
 }
 if(!document.getElementById('report-share-stack-v64-css')){
  const st=document.createElement('style');st.id='report-share-stack-v64-css';
  st.textContent=`.report-share-stack{display:flex;flex-direction:column;gap:8px;min-width:145px}.report-share-stack .btn{width:100%;min-width:145px;margin:0}@media(max-width:620px){.report-share-stack{width:100%;min-width:0}.report-share-stack .btn{width:100%;min-width:0}}`;
  document.head.appendChild(st);
 }
}
arrangeShareButtons();
const app=document.getElementById('app');
if(app){new MutationObserver(()=>arrangeShareButtons()).observe(app,{childList:true})}
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
