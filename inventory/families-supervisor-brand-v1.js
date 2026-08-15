(()=>{'use strict';
if(window.__familiesSupervisorBrandV1)return;window.__familiesSupervisorBrandV1=true;
const LOGO='/inventory/families-brand-logo.jpg?v=1';
const q=(s,r=document)=>r.querySelector(s),qa=(s,r=document)=>Array.from(r.querySelectorAll(s));
function ensureStyle(){
 if(document.getElementById('families-supervisor-brand-style'))return;
 const s=document.createElement('style');s.id='families-supervisor-brand-style';
 s.textContent=`
html.families-identity{--gold:#b1740a!important;--gold2:#6b4310!important;--accent:#b1740a!important;--primary:#b1740a!important;--bg:#f8f4ed!important;--card:#fffdf9!important;--ink:#3d3021!important;--muted:#7a6a57!important;--line:#e4d3b8!important;--soft:#f4eadb!important}
html.families-identity,html.families-identity body{background:#f8f4ed!important;color:#3d3021!important}
html.families-identity .top{background:rgba(255,253,249,.98)!important;border-bottom-color:#e4d3b8!important}
html.families-identity .brand b,html.families-identity .head h2,html.families-identity .sectitle h3{color:#4b351c!important}
html.families-identity .brand small,html.families-identity .muted,html.families-identity .unit{color:#7a6a57!important}
html.families-identity .btn.primary,html.families-identity #share,html.families-identity #pdfShare{background:#b1740a!important;border-color:#b1740a!important;color:#fff!important}
html.families-identity .btn,html.families-identity #draft,html.families-identity #jpg{border-color:#dfcfb4!important;background:#fffdf9!important;color:#4b351c!important}
html.families-identity #submit{background:#6b4310!important;border-color:#6b4310!important;color:#fff!important}
html.families-identity .section{background:#fffdf9!important;border-color:#e4d3b8!important}
html.families-identity .sectitle{background:linear-gradient(90deg,#f4eadb,#fffdf9)!important;border-bottom-color:#e4d3b8!important}
html.families-identity .sectitle small{background:#efe0c7!important;color:#6b4310!important}
html.families-identity .item,html.families-identity .flow td{background:#fffdf9!important;border-color:#eadfcd!important}
html.families-identity .qty,html.families-identity .input,html.families-identity .select,html.families-identity .textarea{border-color:#dac8aa!important;color:#3d3021!important;background:#fff!important}
html.families-identity .qty:focus,html.families-identity .input:focus,html.families-identity .select:focus,html.families-identity .textarea:focus{border-color:#b1740a!important;box-shadow:0 0 0 2px rgba(177,116,10,.14)!important}
html.families-identity .note{background:#f8efe2!important;border-color:#dec39a!important;color:#5f411a!important}
html.families-identity .bottom{background:rgba(255,253,249,.98)!important;border-top-color:#e4d3b8!important}
.families-brand-strip{display:flex;align-items:center;gap:12px;direction:rtl;background:linear-gradient(135deg,#fffdf9,#f7f0e5);border:1px solid #dfcfb4;border-right:5px solid #b1740a;border-radius:14px;padding:8px 12px;margin:0 0 10px;box-shadow:0 7px 22px rgba(90,58,18,.07)}
.families-brand-strip img{width:54px;height:54px;object-fit:contain;border-radius:7px;background:#fff;flex:0 0 54px}
.families-brand-strip .families-brand-title{font-size:16px;font-weight:900;color:#4b351c;line-height:1.35}.families-brand-strip .families-brand-title b{color:#b1740a}
.families-branch-card{position:relative!important;border-color:#dfcfb4!important;border-top:4px solid #b1740a!important;background:linear-gradient(145deg,#fffdf9,#f7f0e5)!important}
.families-branch-card .families-card-logo{position:absolute;top:8px;right:8px;width:36px;height:36px;object-fit:contain;border-radius:6px;background:#fff;z-index:2}
.families-branch-card h3{padding-right:43px!important;color:#4b351c!important}.families-branch-card .manager-open-report,.families-branch-card .morning-details-btn{border-color:#b1740a!important;color:#5b3b16!important}
@media(max-width:650px){.families-brand-strip{padding:7px 9px}.families-brand-strip img{width:46px;height:46px;flex-basis:46px}.families-brand-strip .families-brand-title{font-size:14px}}
`;document.head.appendChild(s)}
function outerBrand(on){
 try{const pd=window.parent?.document;if(!pd||pd===document)return;let st=pd.getElementById('families-outer-brand-style');if(!st){st=pd.createElement('style');st.id='families-outer-brand-style';st.textContent=`
html.families-shell{--gold:#b1740a!important;--ink:#3d3021!important;--muted:#7a6a57!important;--line:#e4d3b8!important;--bg:#f8f4ed!important}
html.families-shell #systemScreen,html.families-shell .frameLoading{background:#f8f4ed!important}
html.families-shell .brandBar{background:#fffdf9!important;border-bottom-color:#e4d3b8!important;justify-content:center!important;gap:13px!important;direction:rtl!important}
html.families-shell .brandBar img{width:64px!important;height:64px!important;object-fit:contain!important;flex:0 0 64px!important;border-radius:7px}
#familiesShellTitle{font:900 16px Tahoma,Arial;color:#4b351c;text-align:right;white-space:nowrap}#familiesShellTitle b{color:#b1740a}
@media(max-width:720px){html.families-shell .brandBar img{width:52px!important;height:52px!important;flex-basis:52px!important}#familiesShellTitle{font-size:13px}}
`;pd.head.appendChild(st)}pd.documentElement.classList.toggle('families-shell',on);const img=pd.querySelector('.brandBar img');if(img){if(!img.dataset.defaultSrc)img.dataset.defaultSrc=img.getAttribute('src')||'/inventory/inventory-brands-banner.webp?v=9';if(on){img.src=LOGO;img.alt='المشويات الدمشقية عوائل'}else if(!pd.documentElement.classList.contains('individuals-shell')){img.src=img.dataset.defaultSrc;img.alt='شعارات مطاعم الدمشقية'}}let t=pd.getElementById('familiesShellTitle');if(on){if(!t){t=pd.createElement('div');t.id='familiesShellTitle';img?.after(t)}t.innerHTML='<b>المشويات عوائل</b> - الجرد اليومي'}else t?.remove()}catch{}
}
function closestCard(el){let n=el;for(let i=0;i<7&&n&&n!==document.body;i++,n=n.parentElement){const c=String(n.className||'');if(/manager-final-row|manager-morning-row|dash|card|branch|panel|tile|box/i.test(c)||['SECTION','ARTICLE'].includes(n.tagName))return n}return el.parentElement||el}
let busy=false,queued=false;
function apply(){if(busy)return;busy=true;try{ensureStyle();const title=(q('.head h2')?.textContent||'').trim();const branchView=title.includes('المشويات عوائل')&&title!=='لوحة المدير';document.documentElement.classList.toggle('families-identity',branchView);outerBrand(branchView);let strip=q('#familiesBrandStrip');if(branchView){if(!strip){strip=document.createElement('div');strip.id='familiesBrandStrip';strip.className='families-brand-strip';strip.innerHTML=`<img src="${LOGO}" alt="المشويات الدمشقية عوائل"><div class="families-brand-title"><b>المشويات عوائل</b> - الجرد اليومي</div>`;const shell=q('.shell')||document.body,head=q('.head',shell);shell.insertBefore(strip,head||shell.firstChild)}}else strip?.remove();qa('h3,h2,strong,b,span').filter(el=>(el.textContent||'').trim()==='المشويات عوائل').slice(0,12).forEach(el=>{const card=closestCard(el);if(!card)return;card.classList.add('families-branch-card');if(!card.querySelector('.families-card-logo')){const img=document.createElement('img');img.src=LOGO;img.alt='المشويات الدمشقية عوائل';img.className='families-card-logo';card.appendChild(img)}})}finally{busy=false}}
function schedule(){if(queued)return;queued=true;requestAnimationFrame(()=>{queued=false;apply()})}
new MutationObserver(ms=>{if(ms.some(m=>m.addedNodes?.length||m.removedNodes?.length))schedule()}).observe(document.body,{childList:true,subtree:true});document.addEventListener('click',()=>setTimeout(schedule,0),true);document.addEventListener('change',()=>setTimeout(schedule,0),true);schedule();
})();
