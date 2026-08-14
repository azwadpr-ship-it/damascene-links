from pathlib import Path

report=Path('inventory/report-v32.js')
s=report.read_text(encoding='utf-8')
marker="function currentReport(){\n"
if marker not in s:
    raise SystemExit('currentReport marker not found')
helper=r'''function reportNumber(v){
 const n=Number(String(v??'0').replace(',','.'));
 return Number.isFinite(n)?n:0;
}
function reportFormat(n){
 const x=Math.round((n+Number.EPSILON)*1000)/1000;
 return Number.isInteger(x)?String(x):String(x).replace(/\.?0+$/,'');
}
function regularSodaInfo(name,unit){
 let raw=String(name||'').trim().replace(/\s+/g,' ');
 if(!/(بيبسي|سفن|ميرندا|ديو|شاني|كوكا|كولا|مشروبات غازية)/.test(raw))return null;
 if(/(عائلي|عائلية|فاميلي)/.test(raw))return null;
 let carton=/كرتون/.test(String(unit||''));
 if(/^كرتون\s+/.test(raw)){carton=true;raw=raw.replace(/^كرتون\s+/,'').trim();}
 if(/\s*-\s*كرتون$/.test(raw)){carton=true;raw=raw.replace(/\s*-\s*كرتون$/,'').trim();}
 raw=raw.replace(/\s*-\s*(حبة|علبة)$/,'').trim();
 return raw?{base:raw,carton}:null;
}
function mergeRegularSodaUnits(sections){
 return sections.map(sec=>{
  if(!sec?.items?.length||!['simple','flow'].includes(sec.type))return sec;
  const groups=new Map();
  sec.items.forEach((it,index)=>{
   const info=regularSodaInfo(it.name,it.unit);if(!info)return;
   let g=groups.get(info.base);
   if(!g){g={base:info.base,first:index,rows:[]};groups.set(info.base,g)}
   g.rows.push({it,index,factor:info.carton?24:1,carton:info.carton});
  });
  if(!groups.size)return sec;
  const out=[];
  for(let i=0;i<sec.items.length;i++){
   const it=sec.items[i],info=regularSodaInfo(it.name,it.unit);
   if(!info){out.push(it);continue}
   const g=groups.get(info.base);
   if(!g||i!==g.first)continue;
   const hasCarton=g.rows.some(r=>r.carton);
   if(!hasCarton){out.push(it);continue}
   if(sec.type==='simple'){
    const value=g.rows.reduce((sum,r)=>sum+reportNumber(r.it.value)*r.factor,0);
    out.push({name:g.base,value:reportFormat(value),unit:'حبة'});
   }else{
    const opening=g.rows.reduce((sum,r)=>sum+reportNumber(r.it.opening)*r.factor,0);
    const incoming=g.rows.reduce((sum,r)=>sum+reportNumber(r.it.incoming)*r.factor,0);
    const closing=g.rows.reduce((sum,r)=>sum+reportNumber(r.it.closing)*r.factor,0);
    const sold=opening+incoming-closing;
    out.push({name:g.base,opening:reportFormat(opening),incoming:reportFormat(incoming),closing:reportFormat(closing),sold:reportFormat(sold),unit:'حبة'});
   }
  }
  return {...sec,items:out};
 });
}
'''
if 'function mergeRegularSodaUnits' not in s:
    s=s.replace(marker,helper+marker,1)
old=" return{branch,notes,sections,reportDate};\n}"
new=" sections=mergeRegularSodaUnits(sections);\n return{branch,notes,sections,reportDate};\n}"
if old not in s:
    raise SystemExit('currentReport return marker not found')
s=s.replace(old,new,1)
report.write_text(s,encoding='utf-8')

idx=Path('inventory/index.html')
s=idx.read_text(encoding='utf-8')
old="addScript(d,'branch-report-stable-v55-js','/inventory/branch-report-stable-v55.js?v=1')"
new="addScript(d,'branch-report-stable-v57-js','/inventory/branch-report-stable-v57.js?v=1')"
if old not in s:
    raise SystemExit('v55 loader hook not found')
s=s.replace(old,new)
if '/inventory/original.html?v=55' not in s:
    raise SystemExit('original v55 marker not found')
s=s.replace('/inventory/original.html?v=55','/inventory/original.html?v=57',1)
idx.write_text(s,encoding='utf-8')
