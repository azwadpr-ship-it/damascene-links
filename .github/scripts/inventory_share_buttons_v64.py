from pathlib import Path

# 1) Stable branch report loader: stack share buttons and keep them together.
p = Path('inventory/branch-report-stable-v57.js')
s = p.read_text(encoding='utf-8')
s = s.replace('window.__branchReportStableV63', 'window.__branchReportStableV64')
anchor = "document.addEventListener('click',async e=>{\n"
insert = """function arrangeShareButtons(){
 const share=document.getElementById('share'),pdf=document.getElementById('pdfShare');
 if(!share||!pdf)return;
 share.textContent='مشاركة كصور';pdf.textContent='مشاركة PDF';
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
new MutationObserver(arrangeShareButtons).observe(document.body,{childList:true,subtree:true});
""" + anchor
if 'function arrangeShareButtons()' not in s:
    if anchor not in s: raise SystemExit('branch loader click anchor not found')
    s = s.replace(anchor, insert, 1)
p.write_text(s, encoding='utf-8')

# 2) Base page label, so even initial render says the requested wording.
o = Path('inventory/original.html')
t = o.read_text(encoding='utf-8')
t = t.replace('<button class="btn primary" id="share">مشاركة الصور</button>', '<button class="btn primary" id="share">مشاركة كصور</button>', 1)
o.write_text(t, encoding='utf-8')

# 3) Bust loader cache and bump the inner page version.
i = Path('inventory/index.html')
x = i.read_text(encoding='utf-8')
x = x.replace('/inventory/branch-report-stable-v57.js?v=4', '/inventory/branch-report-stable-v57.js?v=5')
x = x.replace('/inventory/original.html?v=63', '/inventory/original.html?v=64')
i.write_text(x, encoding='utf-8')

print('v64 share buttons patch applied')
