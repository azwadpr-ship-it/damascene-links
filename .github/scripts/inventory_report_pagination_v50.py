from pathlib import Path

p = Path('inventory/report-v32.js')
s = p.read_text(encoding='utf-8')
old = """function layout(r){
 const a=appInfo(r),pages=[];
 const source=chunks(r);
 let page={ys:Array(P.COLS).fill(a?P.TOP_APP:P.TOP),cards:[],app:a};
 pages.push(page);
 const preferred=['الملحمة','المقبلات','المقليات','الساخن','الحلا','ملاحظات'];
 source.sort((aa,bb)=>{
   const ia=preferred.indexOf(aa.title), ib=preferred.indexOf(bb.title);
   return (ia===-1?999:ia)-(ib===-1?999:ib);
 });
 for(const s of source){
  const h=cardH(s);
  let slots=page.ys.map((y,i)=>({y,i})).sort((a,b)=>a.y-b.y),slot=slots.find(z=>z.y+h<=P.BOTTOM);
  if(!slot) slot=slots[0];
  const col=slot.i,x=P.M+(P.COLS-1-col)*(P.CW+P.GAP),y=page.ys[col];
  page.cards.push({sec:s,x,y,w:P.CW,h});page.ys[col]=y+h+P.GAP;
 }
 return pages;
}
"""
new = """function layout(r){
 const a=appInfo(r),pages=[];
 const preferred=['الملحمة','المقبلات','المقليات','الساخن','الحلا','ملاحظات'];
 const sorted=chunks(r).sort((aa,bb)=>{
   const ia=preferred.indexOf(aa.title), ib=preferred.indexOf(bb.title);
   return (ia===-1?999:ia)-(ib===-1?999:ib);
 });
 const maxFresh=P.BOTTOM-P.TOP;
 const source=[];
 for(const s of sorted){
  if(s.type==='notes'||cardH(s)<=maxFresh){source.push(s);continue}
  const maxItems=Math.max(1,Math.floor((maxFresh-64)/rowH(s)));
  for(let i=0;i<s.items.length;i+=maxItems){
   source.push({...s,title:i?`${s.title} — تابع`:s.title,items:s.items.slice(i,i+maxItems)});
  }
 }
 const fresh=first=>({ys:Array(P.COLS).fill(first&&a?P.TOP_APP:P.TOP),cards:[],app:first?a:null});
 let page=fresh(true);pages.push(page);
 for(const s of source){
  const h=cardH(s);
  let slots=page.ys.map((y,i)=>({y,i})).sort((aa,bb)=>aa.y-bb.y);
  let slot=slots.find(z=>z.y+h<=P.BOTTOM);
  if(!slot){
   page=fresh(false);pages.push(page);
   slots=page.ys.map((y,i)=>({y,i})).sort((aa,bb)=>aa.y-bb.y);
   slot=slots.find(z=>z.y+h<=P.BOTTOM)||slots[0];
  }
  const col=slot.i,x=P.M+(P.COLS-1-col)*(P.CW+P.GAP),y=page.ys[col];
  page.cards.push({sec:s,x,y,w:P.CW,h});page.ys[col]=y+h+P.GAP;
 }
 return pages;
}
"""
if old not in s:
    raise SystemExit('old layout block not found')
s = s.replace(old, new, 1)
needle = 'const pages=layout(r).slice(0,1);'
if needle not in s:
    raise SystemExit('single-page clamp not found')
s = s.replace(needle, 'const pages=layout(r);', 1)
p.write_text(s, encoding='utf-8')

p = Path('inventory/index.html')
s = p.read_text(encoding='utf-8')
old = "addScript(d,'branch-report-stable-v45-js','/inventory/branch-report-stable-v45.js?v=1')"
new = "addScript(d,'branch-report-stable-v50-js','/inventory/branch-report-stable-v50.js?v=1')"
if old not in s:
    raise SystemExit('old report loader hook not found')
s = s.replace(old, new)
if '/inventory/original.html?v=49' not in s:
    raise SystemExit('v49 marker not found')
s = s.replace('/inventory/original.html?v=49', '/inventory/original.html?v=50', 1)
p.write_text(s, encoding='utf-8')
