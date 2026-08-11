const SUPABASE_URL = 'https://vvkrladsjicbvopvszsb.supabase.co';
const SUPABASE_KEY = 'sb_publishable_--CowMEeq8KL2dLwB3ctwg_Sz4sc8S6';
const SESSION_KEY = 'damascene_maintenance_session_v1';
const BOOTSTRAP_FN = `${SUPABASE_URL}/functions/v1/bootstrap-admin`;
const MANAGE_USER_FN = `${SUPABASE_URL}/functions/v1/manage-maintenance-user`;

const PRIORITY = {
  emergency: { label: 'طارئ الآن', icon: '🔴' },
  urgent: { label: 'عاجل اليوم', icon: '🟠' },
  normal: { label: 'عادي', icon: '🟡' },
  improvement: { label: 'تحسين / تجميل', icon: '🔵' },
};
const STATUS = {
  new: 'طلب جديد',
  received: 'تم استلام الطلب',
  in_progress: 'تحت الإجراء',
  waiting_part: 'بانتظار قطعة',
  waiting_external: 'بانتظار فني / مورد خارجي',
  postponed: 'مؤجل',
  completed: 'تم التنفيذ',
  cancelled: 'ملغي',
};
const ROLE = { supervisor: 'مشرف قسم', maintenance: 'مسؤول الصيانة', admin: 'إدارة النظام' };

let state = {
  session: readSession(),
  user: null,
  profile: null,
  departments: [],
  categories: [],
};

function readSession() {
  try { return JSON.parse(localStorage.getItem(SESSION_KEY) || 'null'); } catch { return null; }
}
function saveSession(session) {
  state.session = session;
  if (session) localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  else localStorage.removeItem(SESSION_KEY);
}
function toast(message) {
  const el = document.getElementById('toast');
  if (!el) return;
  el.textContent = message;
  el.classList.add('show');
  clearTimeout(toast.t);
  toast.t = setTimeout(() => el.classList.remove('show'), 2600);
}
function esc(v = '') {
  return String(v).replace(/[&<>'"]/g, s => ({ '&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;' }[s]));
}
function ticketNumber(v = '') { const n=String(v).replace(/^ص-?/,'').replace(/\D/g,''); return n ? String(Number(n)) : ''; }
function toRiyadhDateTimeInput(v=''){if(!v)return'';const parts=new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Riyadh',year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',hourCycle:'h23'}).formatToParts(new Date(v));const o=Object.fromEntries(parts.map(x=>[x.type,x.value]));return `${o.year}-${o.month}-${o.day}T${o.hour}:${o.minute}`;}
function riyadhDateTimeToIso(v=''){return v?new Date(`${v}:00+03:00`).toISOString():null;}
function fmtDate(v, withTime = true) {
  if (!v) return '—';
  const d = new Date(v);
  return new Intl.DateTimeFormat('ar-SA-u-ca-gregory', withTime ? {
    timeZone: 'Asia/Riyadh', year:'numeric', month:'2-digit', day:'2-digit', hour:'2-digit', minute:'2-digit'
  } : { timeZone:'Asia/Riyadh', year:'numeric', month:'2-digit', day:'2-digit' }).format(d);
}
function todayRiyadhRange() {
  const parts = new Intl.DateTimeFormat('en-CA', {timeZone:'Asia/Riyadh',year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(new Date());
  const o = Object.fromEntries(parts.map(p => [p.type,p.value]));
  const y=Number(o.year), m=Number(o.month), d=Number(o.day);
  const start = `${o.year}-${o.month}-${o.day}T00:00:00+03:00`;
  const next = new Date(Date.UTC(y, m-1, d+1));
  const ny = next.getUTCFullYear(), nm = String(next.getUTCMonth()+1).padStart(2,'0'), nd = String(next.getUTCDate()).padStart(2,'0');
  const end = `${ny}-${nm}-${nd}T00:00:00+03:00`;
  return { start, end, label:`${o.year}-${o.month}-${o.day}` };
}

async function refreshSession() {
  if (!state.session?.refresh_token) return false;
  const r = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=refresh_token`, {
    method:'POST', headers:{apikey:SUPABASE_KEY,'Content-Type':'application/json'},
    body:JSON.stringify({refresh_token:state.session.refresh_token})
  });
  if (!r.ok) { saveSession(null); return false; }
  const s = await r.json(); saveSession(s); return true;
}
async function api(path, opts = {}, retry = true) {
  const headers = new Headers(opts.headers || {});
  headers.set('apikey', SUPABASE_KEY);
  if (state.session?.access_token) headers.set('Authorization', `Bearer ${state.session.access_token}`);
  if (!(opts.body instanceof Blob) && !(opts.body instanceof File) && opts.body !== undefined && !headers.has('Content-Type')) headers.set('Content-Type','application/json');
  const res = await fetch(`${SUPABASE_URL}${path}`, { ...opts, headers });
  if (res.status === 401 && retry && await refreshSession()) return api(path, opts, false);
  if (!res.ok) {
    let detail = '';
    try { const j = await res.json(); detail = j.message || j.error_description || j.error || JSON.stringify(j); } catch { detail = await res.text(); }
    throw new Error(detail || `HTTP ${res.status}`);
  }
  if (res.status === 204) return null;
  const type = res.headers.get('content-type') || '';
  return type.includes('application/json') ? res.json() : res.text();
}
async function apiBlob(path) {
  const headers = { apikey:SUPABASE_KEY, Authorization:`Bearer ${state.session.access_token}` };
  let res = await fetch(`${SUPABASE_URL}${path}`, {headers});
  if (res.status === 401 && await refreshSession()) res = await fetch(`${SUPABASE_URL}${path}`, {headers:{apikey:SUPABASE_KEY,Authorization:`Bearer ${state.session.access_token}`}});
  if (!res.ok) throw new Error('تعذر تحميل الصورة');
  return res.blob();
}
async function login(email, password) {
  const r = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
    method:'POST', headers:{apikey:SUPABASE_KEY,'Content-Type':'application/json'}, body:JSON.stringify({email,password})
  });
  const data = await r.json();
  if (!r.ok) throw new Error(data.error_description || data.msg || 'بيانات الدخول غير صحيحة');
  saveSession(data);
  await hydrateIdentity();
}
async function logout() {
  try { await api('/auth/v1/logout',{method:'POST'}); } catch {}
  saveSession(null); state.user=null; state.profile=null; navigate('/login');
}
async function hydrateIdentity() {
  if (!state.session?.access_token) return false;
  try {
    state.user = await api('/auth/v1/user');
    const profiles = await api(`/rest/v1/profiles?id=eq.${encodeURIComponent(state.user.id)}&select=*`);
    state.profile = profiles?.[0] || null;
    if (!state.profile?.is_active) throw new Error('الحساب غير فعال');
    return true;
  } catch (e) {
    if (!(await refreshSession())) { saveSession(null); state.user=null; state.profile=null; return false; }
    try {
      state.user = await api('/auth/v1/user');
      const profiles = await api(`/rest/v1/profiles?id=eq.${encodeURIComponent(state.user.id)}&select=*`);
      state.profile = profiles?.[0] || null;
      return Boolean(state.profile?.is_active);
    } catch { saveSession(null); return false; }
  }
}
async function loadMasterData() {
  if (state.departments.length && state.categories.length) return;
  const [d,c] = await Promise.all([
    api('/rest/v1/departments?is_active=eq.true&select=name&order=sort_order.asc'),
    api('/rest/v1/maintenance_categories?is_active=eq.true&select=name&order=sort_order.asc')
  ]);
  state.departments=d||[]; state.categories=c||[];
}

function navigate(path) {
  history.pushState({},'',path); render();
}
window.addEventListener('popstate', render);

document.addEventListener('click', e => {
  const a = e.target.closest('[data-nav]');
  if (a) { e.preventDefault(); navigate(a.getAttribute('href')); }
});

function hero() {
  return `<section class="hero">
    <img src="/maintenance-banner.jpg" alt="طلبات الصيانة" onerror="this.style.display='none';this.nextElementSibling.style.display='flex'" />
    <div class="hero-fallback" style="display:none">
      <div><h1>طلبات الصيانة</h1><p>منصة استقبال ومتابعة طلبات الصيانة</p><div class="line"></div></div>
    </div>
  </section>`;
}
function navActive(path, target) { return path.startsWith(target) ? 'active' : ''; }
function layout(content) {
  const path=location.pathname;
  const p=state.profile;
  const nav=[];
  if (p?.role==='supervisor' || p?.role==='maintenance' || p?.role==='admin') nav.push(`<a data-nav href="/request" class="${navActive(path,'/request') || navActive(path,'/my-requests') ? 'active':''}">طلب صيانة</a>`);
  if (p?.role==='maintenance' || p?.role==='admin') nav.push(`<a data-nav href="/maintenance" class="${navActive(path,'/maintenance') || navActive(path,'/ticket') ? 'active':''}">متابعة الصيانة</a>`);
  if (p?.role==='maintenance' || p?.role==='admin') nav.push(`<a data-nav href="/dashboard" class="${navActive(path,'/dashboard')}">التقرير اليومي</a>`);
  if (p?.role==='admin') nav.push(`<a data-nav href="/users" class="${navActive(path,'/users')}">المستخدمون</a>`);
  return `<div class="shell">
    <header class="topbar"><div class="topbar-inner">
      <div class="brand-mini"><div class="brand-mark">🔧</div><span>نظام الصيانة</span></div>
      <nav class="nav">${nav.join('')}<button class="logout" id="logoutBtn">خروج</button></nav>
    </div></header>
    ${hero()}
    <main class="container">${content}<div class="footer">نظام متابعة طلبات الصيانة</div></main>
  </div>`;
}
function priorityBadge(v) { const p=PRIORITY[v]||{label:v||'—',icon:''}; return `<span class="badge ${esc(v)}">${p.icon} ${esc(p.label)}</span>`; }
function statusBadge(v) { return `<span class="badge ${esc(v)}">${esc(STATUS[v]||v||'—')}</span>`; }
function loading() { document.getElementById('app').innerHTML = `<div class="login-wrap"><div><div class="loader"></div><div class="hint">جاري التحميل...</div></div></div>`; }
function deny(message='ليس لديك صلاحية لفتح هذه الصفحة') { return layout(`<div class="card"><div class="alert error">${esc(message)}</div></div>`); }

async function render() {
  const app=document.getElementById('app');
  const path=location.pathname;
  if (path==='/login') return renderLogin();
  if (path==='/setup') return navigate('/login');
  if (!state.profile) {
    loading();
    const ok=await hydrateIdentity();
    if (!ok) { if(path!='/login') sessionStorage.setItem('maintenance_after_login',path); return navigate('/login'); }
  }
  if (path==='/' || path==='') {
    return navigate(state.profile.role==='supervisor' ? '/request' : state.profile.role==='maintenance' ? '/maintenance' : '/dashboard');
  }
  if (path==='/request') return renderRequestPage();
  if (path==='/my-requests') return renderMyRequests();
  if (path==='/maintenance') return renderMaintenancePage();
  if (path==='/dashboard') return renderDashboard();
  if (path==='/users') return renderUsers();
  if (path.startsWith('/t/')) return renderTicketByCode(path.split('/')[2]);
  if (path.startsWith('/ticket/')) return renderTicket(path.split('/')[2]);
  app.innerHTML=layout(`<div class="card"><div class="empty">الصفحة غير موجودة.</div></div>`);
  bindCommon();
}
function bindCommon(){ document.getElementById('logoutBtn')?.addEventListener('click',logout); }
