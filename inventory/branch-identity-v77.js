(()=>{'use strict';
if(window.__branchIdentityV77)return;window.__branchIdentityV77=true;
const BRANDS={
 individuals:{name:'المشويات أفراد',logo:'/inventory/individuals-brand-logo.svg?v=2',accent:'#df9022',dark:'#3d3f41',bg:'#f2f3f3',card:'#ffffff',ink:'#3b3d3f',muted:'#717477',line:'#d3d4d5',soft:'#f7efe4'},
 families:{name:'المشويات عوائل',logo:'/inventory/families-brand-logo.jpg?v=2',accent:'#b1740a',dark:'#6b4310',bg:'#f8f4ed',card:'#fffdf9',ink:'#3d3021',muted:'#7a6a57',line:'#e4d3b8',soft:'#f4eadb'},
 mazaq:{name:'المذاق الدمشقي',logo:'/inventory/mazaq-brand-logo.png?v=2',accent:'#b51f2e',dark:'#181818',bg:'#f1f1f1',card:'#ffffff',ink:'#202020',muted:'#666666',line:'#d6d6d6',soft:'#f3e8ea'}
};
const q=(s,r=document)=>r.querySelector(s),qa=(s,r=document)=>Array.from(r.querySelectorAll(s));
function brandByName(name){return Object.entries(BRANDS).find(([,b])=>String(name||'').trim()===b.name)||null}
function brandByTitle(title){return Object.entries(BRANDS).find(([,b])=>String(title||'').includes(b.name))||null}
function ensureStyle(){if(q('#branch-identity-v77-style'))return;const s=document.createElement('style');s.id='branch-identity-v77-style';s.textContent=`
html.branch-individuals{--gold:#df9022!important;--gold2:#3d3f41!important;--accent:#df9022!important;--primary:#df9022!important;--bg:#f2f3f3!important;--card:#fff!important;--ink:#3b3d3f!important;--muted:#717477!important;--line:#d3d4d5!important;--soft:#f7efe4!important}
html.branch-families{--gold:#b1740a!important;--gold2:#6b4310!important;--accent:#b1740a!important;--primary:#b1740a!important;--bg:#f8f4ed!important;--card:#fffdf9!important;--ink:#3d3021!important;--muted:#7a6a57!important;--line:#e4d3b8!important;--soft:#f4eadb!important}
html.branch-mazaq{--gold:#b51f2e!important;--gold2:#181818!important;--accent:#b51f2e!important;--primary:#b51f2e!important;--bg:#f1f1f1!important;--card:#fff!important;--ink:#202020!important;--muted:#666!important;--line:#d6d6d6!important;--soft:#f3e8ea!important}
html[class*="branch-"] body{background:var(--bg)!important;color:var(--ink)!important}
html[class*="branch-"] .top{background:rgba(255,255,255,.97)!important;border-bottom-color:var(--line)!important}
html[class*="branch-"] .logo{width:50px!important;height:50px!important;border-radius:10px!important;background:transparent!important;padding:0!important;overflow:visible!important;display:flex!important;align-items:center!important;justify-content:center!important}
html[class*="branch-"] .logo img.branch-top-logo{display:block!important;width:100%!important;height:100%!important;object-fit:contain!important;border-radius:8px!important}
html[class*="branch-"] .brand b,html[class*="branch-"] .head h2,html[class*="branch-"] .sectitle h3{color:var(--ink)!important}
html[class*="branch-"] .brand small,html[class*="branch-"] .muted,html[class*="branch-"] .unit{color:var(--muted)!important}
html[class*="branch-"] .section{background:var(--card)!important;border-color:var(--line)!important}
html[class*="branch-"] .sectitle{background:linear-gradient(90deg,var(--soft),var(--card))!important;border-bottom-color:var(--line)!important}
html[class*="branch-"] .item,html[class*="branch-"] .flow td{background:var(--card)!important;border-color:var(--line)!important}
html[class*="branch-"] .qty,html[class*="branch-"] .input,html[class*="branch-"] .select,html[class*="branch-"] .textarea{border-color:var(--line)!important;color:var(--ink)!important;background:#fff!important}
html[class*="branch-"] .btn.primary,html[class*="branch-"] #share,html[class*="branch-"] #pdfShare{background:var(--accent)!important;border-color:var(--accent)!important;color:#fff!important}
html[class*="branch-"] #submit{background:var(--dark)!important;border-color:var(--dark)!important;color:#fff!important}
html[class*="branch-"] .note{background:var(--soft)!important;border-color:var(--line)!important;color:var(--ink)!important}
.manager-brand-card{position:relative!important;overflow:hidden!important}
.manager-brand-card::before{content:'';position:absolute!important;right:0!important;top:0!important;bottom:0!important;width:5px!important;background:var(--branch-accent)!important}
.manager-brand-card .final-branch-info,.manager-brand-card .morning-row-info{position:relative!important;padding-right:52px!important;min-height:42px!important;display:flex!important;flex-direction:column!important;justify-content:center!important}
.manager-brand-card .manager-card-logo{position:absolute!important;right:0!important;top:50%!important;transform:translateY(-50%)!important;width:40px!important;height:40px!important;object-fit:contain!important;border-radius:7px!important;background:transparent!important;padding:0!important}
.manager-brand-card.branch-card-individuals{--branch-accent:#df9022!important;border-top:3px solid #df9022!important}
.manager-brand-card.branch-card-families{--branch-accent:#b1740a!important;border-top:3px solid #b1740a!important}
.manager-brand-card.branch-card-mazaq{--branch-accent:#b51f2e!important;border-top:3px solid #b51f2e!important}
.manager-brand-card.branch-card-individuals h3{color:#3b3d3f!important}.manager-brand-card.branch-card-families h3{color:#4b351c!important}.manager-brand-card.branch-card-mazaq h3{color:#202020!important}
.latest-report-note{font-size:11px!important;font-weight:700!important;color:#756753!important;margin-top:3px!important;line-height:1.45!important}
@media(max-width:650px){html[class*="branch-"] .logo{width:44px!important;height:44px!important}.manager-brand-card .final-branch-info,.manager-brand-card .morning-row-info{padding-right:46px!important}.manager-brand-card .manager-card-logo{width:35px!important;height:35px!important}}
`;document.head.appendChild(s)}
function setBranchClass(key){['individuals','families','mazaq'].forEach(k=>document.documentElement.classList.toggle('branch-'+k,k===key))}
function decorateBranch(key,b){setBranchClass(key);const logo=q('.top .logo');if(logo){let img=q('img.branch-top-logo',logo);if(!img){logo.textContent='';img=document.createElement('img');img.className='branch-top-logo';logo.appendChild(img)}if(img.src!==new URL(b.logo,location.href).href)img.src=b.logo;img.alt=b.name}const small=q('.top .brand small');if(small)small.textContent=b.name}
function clearBranch(){setBranchClass('');const logo=q('.top .logo');if(logo&&q('img.branch-top-logo',logo)){logo.innerHTML='د'}const small=q('.top .brand small');if(small)small.textContent='مطاعم الدمشقية'}
function decorateManager(){clearBranch();qa('.manager-brand-card').forEach(c=>{if(!c.matches('.manager-final-row,.manager-morning-row'))c.classList.remove('manager-brand-card','branch-card-individuals','branch-card-families','branch-card-mazaq')});qa('#dash .manager-final-row,#managerMorningPanel .manager-morning-row').forEach(card=>{const name=(q('h3',card)?.textContent||'').trim(),hit=brandByName(name);if(!hit)return;const [key,b]=hit;card.classList.add('manager-brand-card','branch-card-'+key);const info=q('.final-branch-info,.morning-row-info',card);if(!info)return;let img=q('.manager-card-logo',info);if(!img){img=document.createElement('img');img.className='manager-card-logo';info.prepend(img)}if(img.src!==new URL(b.logo,location.href).href)img.src=b.logo;img.alt=b.name})}
let queued=false;function apply(){ensureStyle();const title=(q('.head h2')?.textContent||'').trim();if(title==='لوحة المدير'){decorateManager();return}const hit=brandByTitle(title);if(hit){decorateBranch(hit[0],hit[1]);return}clearBranch()}
function schedule(){if(queued)return;queued=true;requestAnimationFrame(()=>{queued=false;apply()})}
new MutationObserver(ms=>{if(ms.some(m=>m.addedNodes?.length||m.removedNodes?.length))schedule()}).observe(document.body,{childList:true,subtree:true});document.addEventListener('change',schedule,true);document.addEventListener('click',()=>setTimeout(schedule,0),true);schedule();
})();