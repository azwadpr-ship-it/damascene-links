(()=>{'use strict';
if(window.__individualsSupervisorBrandV1)return;window.__individualsSupervisorBrandV1=true;
const LOGO='/inventory/individuals-brand-logo.svg?v=1';
const q=(s,r=document)=>r.querySelector(s),qa=(s,r=document)=>Array.from(r.querySelectorAll(s));
function ensureStyle(){
 if(document.getElementById('individuals-supervisor-brand-style'))return;
 const s=document.createElement('style');s.id='individuals-supervisor-brand-style';
 s.textContent=`
html.individuals-identity{--gold:#df9022!important;--gold2:#3d3f41!important;--accent:#df9022!important;--primary:#df9022!important;--bg:#f2f3f3!important;--card:#ffffff!important;--ink:#3b3d3f!important;--muted:#717477!important;--line:#d3d4d5!important;--soft:#f7efe4!important}
html.individuals-identity,html.individuals-identity body{background:#f2f3f3!important;color:#3b3d3f!important}
html.individuals-identity .top{background:rgba(250,250,250,.98)!important;border-bottom-color:#d7d8d9!important}
html.individuals-identity .brand b,html.individuals-identity .head h2,html.individuals-identity .sectitle h3{color:#3b3d3f!important}
html.individuals-identity .brand small,html.individuals-identity .muted,html.individuals-identity .unit{color:#717477!important}
html.individuals-identity .btn.primary,html.individuals-identity #share,html.individuals-identity #pdfShare{background:#df9022!important;border-color:#df9022!important;color:#fff!important}
html.individuals-identity .btn,html.individuals-identity #draft,html.individuals-identity #jpg{border-color:#d3d4d5!important;background:#fff!important;color:#3b3d3f!important}
html.individuals-identity #submit{background:#3d3f41!important;border-color:#3d3f41!important;color:#fff!important}
html.individuals-identity .section{background:#fff!important;border-color:#d7d8d9!important}
html.individuals-identity .sectitle{background:linear-gradient(90deg,#f7efe4,#fff)!important;border-bottom-color:#dedfe0!important}
html.individuals-identity .sectitle h3{color:#3b3d3f!important}
html.individuals-identity .sectitle small{background:#f3e4cf!important;color:#7f581c!important}
html.individuals-identity .item,html.individuals-identity .flow td{background:#fff!important;border-color:#dedfe0!important}
html.individuals-identity .qty,html.individuals-identity .input,html.individuals-identity .select,html.individuals-identity .textarea{border-color:#cfd1d2!important;color:#3b3d3f!important}
html.individuals-identity .qty:focus,html.individuals-identity .input:focus,html.individuals-identity .select:focus,html.individuals-identity .textarea:focus{border-color:#df9022!important;box-shadow:0 0 0 2px rgba(223,144,34,.15)!important}
html.individuals-identity .note{background:#fbf4ea!important;border-color:#e6c994!important;color:#684b20!important}
html.individuals-identity .bottom{background:rgba(250,250,250,.98)!important;border-top-color:#d5d6d7!important}
.individuals-brand-strip{display:flex;align-items:center;gap:12px;direction:rtl;background:linear-gradient(135deg,#fff,#f5f5f5);border:1px solid #d1d2d3;border-right:5px solid #df9022;border-radius:14px;padding:8px 12px;margin:0 0 10px;box-shadow:0 7px 22px rgba(55,57,59,.07)}
.individuals-brand-strip img{width:54px;height:54px;object-fit:contain;border-radius:7px;background:#fff;flex:0 0 54px}
.individuals-brand-strip .individuals-brand-title{font-size:16px;font-weight:900;color:#3b3d3f;line-height:1.35}
.individuals-brand-strip .individuals-brand-title b{color:#df9022}
.individuals-branch-card{position:relative!important;border-color:#d0d1d2!important;border-top:4px solid #df9022!important;background:linear-gradient(145deg,#fff,#f6f6f6)!important}
.individuals-branch-card .individuals-card-logo{position:absolute;top:8px;right:8px;width:36px;height:36px;object-fit:contain;border-radius:6px;background:#fff;z-index:2}
.individuals-branch-card h3{padding-right:43px!important;color:#3b3d3f!important}
.individuals-branch-card .manager-open-report,.individuals-branch-card .morning-details-btn{border-color:#df9022!important;color:#3b3d3f!important}
@media(max-width:650px){.individuals-brand-strip{padding:7px 9px}.individuals-brand-strip img{width:46px;height:46px;flex-basis:46px}.individuals-brand-strip .individuals-brand-title{font-size:14px}}
`;
 document.head.appendChild(s);
}
function outerBrand(){
 try{
  const pd=window.parent?.document;if(!pd||pd===document)return;
  pd.documentElement.classList.remove('individuals-shell');
  pd.getElementById('individualsShellTitle')?.remove();
  const img=pd.querySelector('.brandBar img');
  if(img){img.src='/inventory/inventory-brands-banner.webp?v=9';img.alt='شعارات مطاعم الدمشقية'}
 }catch{}
}
function closestCard(el){let n=el;for(let i=0;i<7&&n&&n!==document.body;i++,n=n.parentElement){const c=String(n.className||'');if(/manager-final-row|manager-morning-row|dash|card|branch|panel|tile|box/i.test(c)||['SECTION','ARTICLE'].includes(n.tagName))return n}return el.parentElement||el}
let busy=false,queued=false;
function apply(){if(busy)return;busy=true;try{
 ensureStyle();
 const title=(q('.head h2')?.textContent||'').trim();
 const branchView=title.includes('المشويات أفراد')&&title!=='لوحة المدير';
 const managerView=title==='لوحة المدير';
 document.documentElement.classList.toggle('individuals-identity',branchView);
 outerBrand();
 q('#individualsBrandStrip')?.remove();
 if(!managerView){
  qa('.individuals-card-logo').forEach(x=>x.remove());
  qa('.individuals-branch-card').forEach(x=>x.classList.remove('individuals-branch-card'));
  return;
 }
 qa('.individuals-card-logo').forEach(x=>{if(!x.closest('.manager-final-row,.manager-morning-row'))x.remove()});
 qa('.individuals-branch-card').forEach(x=>{if(!x.matches('.manager-final-row,.manager-morning-row'))x.classList.remove('individuals-branch-card')});
 qa('#dash .manager-final-row h3,#managerMorningPanel .manager-morning-row h3').filter(el=>(el.textContent||'').trim()==='المشويات أفراد').forEach(el=>{
  const card=closestCard(el);if(!card)return;card.classList.add('individuals-branch-card');
  if(!card.querySelector('.individuals-card-logo')){const img=document.createElement('img');img.src=LOGO;img.alt='المشويات أفراد';img.className='individuals-card-logo';card.appendChild(img)}
 })
}finally{busy=false}}
function schedule(){if(queued)return;queued=true;requestAnimationFrame(()=>{queued=false;apply()})}
new MutationObserver(ms=>{if(ms.some(m=>m.addedNodes?.length||m.removedNodes?.length))schedule()}).observe(document.body,{childList:true,subtree:true});
document.addEventListener('click',()=>setTimeout(schedule,0),true);document.addEventListener('change',()=>setTimeout(schedule,0),true);schedule();
})();
