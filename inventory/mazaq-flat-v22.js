(()=>{'use strict';
const ID='mazaq-flat-v23';
if(window.__mazaqFlatV23)return;window.__mazaqFlatV23=true;
function qsa(s,r=document){return Array.from(r.querySelectorAll(s))}
function txt(el){return String(el?.textContent||'').trim()}
function isMazaq(){return txt(document.querySelector('.head h2')).includes('المذاق الدمشقي')}
function addStyle(){if(document.getElementById(ID+'-style'))return;const st=document.createElement('style');st.id=ID+'-style';st.textContent=`
html.mazaq-flat-mode .report-tools{display:none!important}
html.mazaq-flat-mode .mazaq-stock-section,html.mazaq-flat-mode .mazaq-app-section{margin:10px 0 16px;border-radius:16px;overflow:hidden}
html.mazaq-flat-mode .mazaq-stock-section .sectitle,html.mazaq-flat-mode .mazaq-app-section .sectitle{cursor:default!important;padding:12px 15px;border-bottom:1px solid #e2d3b7}
html.mazaq-flat-mode .mazaq-stock-section .sectitle{background:#f7edda}
html.mazaq-flat-mode .mazaq-app-section .sectitle{background:linear-gradient(90deg,#b88935,#9e7127);color:#fff}
html.mazaq-flat-mode .mazaq-stock-section .sectitle h3{font-size:17px!important;color:#72531e}
html.mazaq-flat-mode .mazaq-app-section .sectitle h3{font-size:19px!important;color:#fff!important}
html.mazaq-flat-mode .mazaq-stock-section .sectitle small,html.mazaq-flat-mode .mazaq-app-section .sectitle small,
html.mazaq-flat-mode .mazaq-stock-section .sec-progress,html.mazaq-flat-mode .mazaq-app-section .sec-progress,
html.mazaq-flat-mode .mazaq-stock-section .sec-save,html.mazaq-flat-mode .mazaq-app-section .sec-save,
html.mazaq-flat-mode .mazaq-stock-section .sec-chevron,html.mazaq-flat-mode .mazaq-app-section .sec-chevron{display:none!important}
html.mazaq-flat-mode .mazaq-stock-section .section-content,html.mazaq-flat-mode .mazaq-app-section .section-content{display:block!important;max-height:none!important;height:auto!important;opacity:1!important;overflow:visible!important}
html.mazaq-flat-mode .mazaq-stock-section .cards{display:block!important;padding:5px 10px 10px!important}
html.mazaq-flat-mode .mazaq-stock-section .item{display:flex!important;align-items:center!important;justify-content:space-between!important;gap:12px!important;min-height:52px!important;padding:7px 10px!important;margin:0!important;border:0!important;border-bottom:1px solid #eee3d1!important;border-radius:0!important;background:#fff!important;box-shadow:none!important}
html.mazaq-flat-mode .mazaq-stock-section .item:last-child{border-bottom:0!important}
html.mazaq-flat-mode .mazaq-stock-section .item:nth-child(even){background:#fdfaf4!important}
html.mazaq-flat-mode .mazaq-stock-section .item .name{flex:1!important;margin:0!important;font-size:14px!important;font-weight:800!important;line-height:1.35!important;color:#2f2921!important}
html.mazaq-flat-mode .mazaq-stock-section .item .qtyrow{display:flex!important;align-items:center!important;gap:7px!important;flex:0 0 auto!important}
html.mazaq-flat-mode .mazaq-stock-section .item .qty{width:92px!important;height:38px!important;padding:5px 7px!important;font-size:15px!important;border-radius:9px!important}
html.mazaq-flat-mode .mazaq-stock-section .item .unit{min-width:46px!important;text-align:right!important;font-size:11px!important;color:#7e7467!important}
html.mazaq-flat-mode .mazaq-app-section .cards{display:grid!important;grid-template-columns:repeat(3,minmax(0,1fr))!important;gap:8px!important;padding:10px!important}
html.mazaq-flat-mode .mazaq-app-section .item{padding:9px 10px!important;border-radius:10px!important;box-shadow:none!important}
html.mazaq-flat-mode .mazaq-app-section .item .name{font-size:13px!important;margin-bottom:6px!important}
html.mazaq-flat-mode .mazaq-app-section .item .qty{height:36px!important;font-size:14px!important}
@media(max-width:620px){
 html.mazaq-flat-mode .shell{padding-left:8px!important;padding-right:8px!important}
 html.mazaq-flat-mode .mazaq-stock-section .item{min-height:49px!important;padding:6px 8px!important;gap:8px!important}
 html.mazaq-flat-mode .mazaq-stock-section .item .name{font-size:13px!important}
 html.mazaq-flat-mode .mazaq-stock-section .item .qty{width:78px!important;height:36px!important;font-size:14px!important}
 html.mazaq-flat-mode .mazaq-stock-section .item .unit{min-width:40px!important;font-size:10px!important}
 html.mazaq-flat-mode .mazaq-app-section .cards{grid-template-columns:repeat(2,minmax(0,1fr))!important}
}`;document.head.appendChild(st)}
function cleanVariantName(card){const name=card.querySelector('.name'),unit=card.querySelector('.unit');if(!name||!unit)return;const u=txt(unit);let n=txt(name);if(!u)return;const escaped=u.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');n=n.replace(new RegExp('\\s*-\\s*'+escaped+'\\s*$'),'').trim();name.textContent=n;const inp=card.querySelector('input[data-key="value"]');if(inp)inp.setAttribute('aria-label',`مخزون نهاية اليوم - ${n} - ${u}`)}
function lockOpen(sec,type){sec.classList.add('pro-open',type);const title=sec.querySelector('.sectitle');if(!title)return;title.querySelectorAll('small,.sec-progress,.sec-save,.sec-chevron').forEach(x=>x.remove());if(title.dataset.mazaqFlat!=='1'){const clone=title.cloneNode(true);clone.dataset.mazaqFlat='1';title.replaceWith(clone)}}
function apply(){if(!isMazaq()){document.documentElement.classList.remove('mazaq-flat-mode');return}addStyle();document.documentElement.classList.add('mazaq-flat-mode');let appSec=null,stockSec=null;qsa('.section').forEach(sec=>{const title=txt(sec.querySelector('.sectitle h3'));sec.classList.remove('mazaq-stock-section','mazaq-app-section');if(title==='تقرير التطبيق'){appSec=sec;lockOpen(sec,'mazaq-app-section');return}if(title==='مخزون نهاية اليوم'||title==='المخزون المتبقي'){stockSec=sec;const h=sec.querySelector('.sectitle h3');if(h)h.textContent='مخزون نهاية اليوم';lockOpen(sec,'mazaq-stock-section');qsa('.item',sec).forEach(cleanVariantName)}});if(appSec&&stockSec&&appSec.parentElement===stockSec.parentElement&&appSec.nextElementSibling!==stockSec)stockSec.before(appSec)}
let timer;function schedule(){clearTimeout(timer);timer=setTimeout(apply,60)}
new MutationObserver(schedule).observe(document.documentElement,{childList:true,subtree:true});
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>{apply();setTimeout(apply,250)});else{apply();setTimeout(apply,250)}
})();
