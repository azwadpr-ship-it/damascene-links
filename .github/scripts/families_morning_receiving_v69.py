from pathlib import Path

ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Indua254anhpcGt2aW9lZ3NrZWZkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODY0NTgxMjMsImV4cCI6MjEwMjAzNDEyM30.KV_P5zHGaVzRiJ8tD8VkMiPaMKFrw8HHyKwbqUVktZ4'
LOAD_RPC = 'https://wnknxjxipkvioegskefd.supabase.co/rest/v1/rpc/inventory_family_morning_load_v1'
POST_RPC = 'https://wnknxjxipkvioegskefd.supabase.co/rest/v1/rpc/inventory_family_morning_post_v1'

# 1) Main morning receiving page
p = Path('inventory/morning/index.html')
s = p.read_text(encoding='utf-8')
constants = "const API='https://wnknxjxipkvioegskefd.supabase.co/functions/v1/daily-inventory-receiving',SNAPSHOT_API='https://wnknxjxipkvioegskefd.supabase.co/functions/v1/daily-inventory-morning-snapshot',KEY='inventory_receiving_token';"
if 'FAMILY_LOAD_RPC=' not in s:
    if constants not in s:
        raise SystemExit('morning index constants marker missing')
    s = s.replace(constants, constants + "\nconst FAMILY_LOAD_RPC='" + LOAD_RPC + "',FAMILY_POST_RPC='" + POST_RPC + "',FAMILY_ANON='" + ANON + "';", 1)

old_api = "async function api(action,p={}){const h={'content-type':'application/json'};if(S.token)h.authorization='Bearer '+S.token;const r=await fetch(API,{method:'POST',headers:h,body:JSON.stringify({action,...p})}),d=await r.json().catch(()=>({ok:false,error:'تعذر قراءة الرد'}));if(r.status===401&&action!=='login'){signOut(false);throw Error(d.error||'انتهت الجلسة')}if(!r.ok||d.ok===false)throw Error(d.error||'حدث خطأ');return d}"
new_api = """async function api(action,p={}){
 if(S.branch?.id==='families'&&(action==='receiving_load'||action==='receiving_post')){
  const endpoint=action==='receiving_load'?FAMILY_LOAD_RPC:FAMILY_POST_RPC;
  const payload=action==='receiving_load'?{p_token:S.token,p_date:p.date}:{p_token:S.token,p_date:p.date,p_note:p.note||'',p_entries:p.entries||{}};
  const r=await fetch(endpoint,{method:'POST',headers:{'content-type':'application/json',apikey:FAMILY_ANON,authorization:'Bearer '+FAMILY_ANON},body:JSON.stringify(payload)}),d=await r.json().catch(()=>({ok:false,error:'تعذر قراءة الرد'}));
  if(!r.ok||d.ok===false){const raw=String(d.error||d.message||'حدث خطأ');if(raw.includes('UNAUTHORIZED')){signOut(false);throw Error('انتهت الجلسة، سجّل الدخول من جديد')}if(raw.includes('REPORT_SUBMITTED'))throw Error('تم اعتماد جرد هذا اليوم، لا يمكن تعديل استلامات الصباح بعد الاعتماد');if(raw.includes('ITEM_FORBIDDEN'))throw Error('يوجد صنف غير تابع لهذا المطعم');if(raw.includes('EMPTY_BATCH'))throw Error('أدخل كمية مستلمة واحدة على الأقل');if(raw.includes('INVALID_QTY'))throw Error('إحدى الكميات غير صحيحة');throw Error(raw)}
  return d
 }
 const h={'content-type':'application/json'};if(S.token)h.authorization='Bearer '+S.token;const r=await fetch(API,{method:'POST',headers:h,body:JSON.stringify({action,...p})}),d=await r.json().catch(()=>({ok:false,error:'تعذر قراءة الرد'}));if(r.status===401&&action!=='login'){signOut(false);throw Error(d.error||'انتهت الجلسة')}if(!r.ok||d.ok===false)throw Error(d.error||'حدث خطأ');return d
}"""
if 'FAMILY_LOAD_RPC' in s and old_api in s:
    s = s.replace(old_api, new_api, 1)
elif "S.branch?.id==='families'&&(action==='receiving_load'||action==='receiving_post')" not in s:
    raise SystemExit('morning index api marker missing')
p.write_text(s, encoding='utf-8')

# 2) Morning report sharing script
p = Path('inventory/morning/morning-report-v1.js')
s = p.read_text(encoding='utf-8')
if '__morningReportV9' not in s:
    if "if(window.__morningReportV8)return;window.__morningReportV8=true;" not in s:
        raise SystemExit('morning report guard marker missing')
    s = s.replace("if(window.__morningReportV8)return;window.__morningReportV8=true;", "if(window.__morningReportV9)return;window.__morningReportV9=true;", 1)
api_marker = "const API='https://wnknxjxipkvioegskefd.supabase.co/functions/v1/daily-inventory-receiving';"
if 'FAMILY_LOAD_RPC=' not in s:
    if api_marker not in s:
        raise SystemExit('morning report api marker missing')
    s = s.replace(api_marker, api_marker + "\nconst FAMILY_LOAD_RPC='" + LOAD_RPC + "',FAMILY_ANON='" + ANON + "';", 1)
old_post = "async function post(action,p={}){const token=localStorage.getItem(KEY)||'';if(!token)throw Error('سجّل الدخول أولًا');const r=await fetch(API,{method:'POST',headers:{'content-type':'application/json',authorization:'Bearer '+token},body:JSON.stringify({action,...p})});const d=await r.json().catch(()=>({ok:false,error:'تعذر قراءة الرد'}));if(!r.ok||d.ok===false)throw Error(d.error||'تعذر تحميل تقرير الاستلام');return d}"
new_post = """async function post(action,p={}){const token=localStorage.getItem(KEY)||'';if(!token)throw Error('سجّل الدخول أولًا');if(window.__morningReceivingState?.branch?.id==='families'&&action==='receiving_load'){const r=await fetch(FAMILY_LOAD_RPC,{method:'POST',headers:{'content-type':'application/json',apikey:FAMILY_ANON,authorization:'Bearer '+FAMILY_ANON},body:JSON.stringify({p_token:token,p_date:p.date})});const d=await r.json().catch(()=>({ok:false,error:'تعذر قراءة الرد'}));if(!r.ok||d.ok===false){const raw=String(d.error||d.message||'تعذر تحميل تقرير الاستلام');if(raw.includes('UNAUTHORIZED'))throw Error('انتهت الجلسة، سجّل الدخول من جديد');throw Error(raw)}return d}const r=await fetch(API,{method:'POST',headers:{'content-type':'application/json',authorization:'Bearer '+token},body:JSON.stringify({action,...p})});const d=await r.json().catch(()=>({ok:false,error:'تعذر قراءة الرد'}));if(!r.ok||d.ok===false)throw Error(d.error||'تعذر تحميل تقرير الاستلام');return d}"""
if old_post in s:
    s = s.replace(old_post, new_post, 1)
elif "window.__morningReceivingState?.branch?.id==='families'" not in s:
    raise SystemExit('morning report post marker missing')
p.write_text(s, encoding='utf-8')

# 3) Cache bust outer shell
p = Path('inventory/morning-shell.html')
s = p.read_text(encoding='utf-8')
if 'index.html?inner=11' not in s:
    if 'index.html?inner=10' not in s:
        raise SystemExit('morning shell inner cache marker missing')
    s = s.replace('index.html?inner=10', 'index.html?inner=11', 1)
if 'morning-report-v1.js?v=8' not in s:
    if 'morning-report-v1.js?v=7' not in s:
        raise SystemExit('morning shell report cache marker missing')
    s = s.replace('morning-report-v1.js?v=7', 'morning-report-v1.js?v=8', 1)
p.write_text(s, encoding='utf-8')

print('families morning receiving patch ready')
