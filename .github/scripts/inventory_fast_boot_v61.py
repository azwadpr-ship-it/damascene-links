from pathlib import Path

p=Path('inventory/index.html')
s=p.read_text(encoding='utf-8')

old="""#systemScreen{position:fixed;inset:0;background:var(--bg)}.brandBar{height:72px;background:#fff;border-bottom:1px solid var(--line);display:flex;align-items:center;justify-content:center;padding:0 8px;position:relative;z-index:3;overflow:hidden}.brandBar img{display:block;width:min(350px,72vw);height:auto;object-fit:contain}#inventoryApp{position:absolute;top:72px;right:0;bottom:0;left:0;width:100%;height:calc(100% - 72px);border:0;background:var(--bg);visibility:hidden}"""
new="""#systemScreen{position:fixed;inset:0;background:var(--bg)}.brandBar{height:72px;background:#fff;border-bottom:1px solid var(--line);display:flex;align-items:center;justify-content:center;padding:0 8px;position:relative;z-index:3;overflow:hidden}.brandBar img{display:block;width:min(350px,72vw);height:auto;object-fit:contain}#inventoryApp{position:absolute;top:72px;right:0;bottom:0;left:0;width:100%;height:calc(100% - 72px);border:0;background:var(--bg);visibility:visible}.frameLoading{position:absolute;top:72px;right:0;bottom:0;left:0;z-index:2;display:flex;align-items:flex-start;justify-content:center;padding-top:46px;background:var(--bg);color:var(--muted);font-size:14px;font-weight:700;transition:opacity .16s ease}.frameLoading.hide{opacity:0;pointer-events:none}"""
if old not in s: raise SystemExit('css marker not found')
s=s.replace(old,new,1)

old="""@media(max-width:720px){.brandBar{height:60px;padding:0 5px}.brandBar img{width:min(300px,84vw)}#inventoryApp{top:60px;height:calc(100% - 60px)}.loginCard{width:min(280px,91vw)}.loginBrands{height:68px}.loginBrands img{width:225px}}"""
new="""@media(max-width:720px){.brandBar{height:60px;padding:0 5px}.brandBar img{width:min(300px,84vw)}#inventoryApp{top:60px;height:calc(100% - 60px)}.frameLoading{top:60px;padding-top:38px}.loginCard{width:min(280px,91vw)}.loginBrands{height:68px}.loginBrands img{width:225px}}"""
if old not in s: raise SystemExit('media marker not found')
s=s.replace(old,new,1)

old='<section id="systemScreen" class="hidden"><div class="brandBar"><img src="/inventory/inventory-brands-banner.webp?v=9" alt="شعارات مطاعم الدمشقية"></div><iframe id="inventoryApp" title="نظام الجرد اليومي"></iframe></section>'
new='<section id="systemScreen" class="hidden"><div class="brandBar"><img src="/inventory/inventory-brands-banner.webp?v=9" alt="شعارات مطاعم الدمشقية"></div><div id="frameLoading" class="frameLoading">جاري فتح الجرد...</div><iframe id="inventoryApp" title="نظام الجرد اليومي"></iframe></section>'
if old not in s: raise SystemExit('system marker not found')
s=s.replace(old,new,1)

old="const loginScreen=document.getElementById('loginScreen'),systemScreen=document.getElementById('systemScreen'),frame=document.getElementById('inventoryApp'),form=document.getElementById('loginForm'),btn=document.getElementById('loginBtn'),err=document.getElementById('err');\n const revealFrame=()=>{frame.style.visibility='visible'};"
new="const loginScreen=document.getElementById('loginScreen'),systemScreen=document.getElementById('systemScreen'),frame=document.getElementById('inventoryApp'),frameLoading=document.getElementById('frameLoading'),form=document.getElementById('loginForm'),btn=document.getElementById('loginBtn'),err=document.getElementById('err');\n const revealFrame=()=>{frame.style.visibility='visible';frameLoading?.classList.add('hide')};\n const showFrameLoading=()=>{frame.style.visibility='visible';frameLoading?.classList.remove('hide')};"
if old not in s: raise SystemExit('const marker not found')
s=s.replace(old,new,1)

old="frame.addEventListener('load',enhanceWhenReady);"
new="frame.addEventListener('load',()=>{revealFrame();enhanceWhenReady()});"
if old not in s: raise SystemExit('load marker not found')
s=s.replace(old,new,1)

old="function showSystem(){loginScreen.classList.add('hidden');systemScreen.classList.remove('hidden');frame.style.visibility='hidden';if(!frame.getAttribute('src'))frame.src='/inventory/original.html?v=60'}"
new="function showSystem(){loginScreen.classList.add('hidden');systemScreen.classList.remove('hidden');showFrameLoading();if(!frame.getAttribute('src'))frame.src='/inventory/original.html?v=61'}"
if old not in s: raise SystemExit('showSystem marker not found')
s=s.replace(old,new,1)

p.write_text(s,encoding='utf-8')
