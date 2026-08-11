let deferredInstallPrompt=null;
const MAINTENANCE_VAPID_PUBLIC_KEY='BIgeqHk1a0UkimLlKLJn0OWEyASbTaE5ykjw36HIvnm6hW7COzXBvODsn8nW0leEVvKBZV_sw4eiV0r8aKurEiw';
function isStandaloneApp(){return window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone===true;}
function refreshInstallButton(){const b=document.getElementById('installMaintenanceApp');if(!b)return;if(isStandaloneApp()){b.closest('.tool-panel')?.remove();return;}b.textContent=deferredInstallPrompt?'📲 تثبيت تطبيق إدارة الصيانة':'📲 تثبيت تطبيق إدارة الصيانة';}
window.addEventListener('beforeinstallprompt',e=>{e.preventDefault();deferredInstallPrompt=e;refreshInstallButton();});
window.addEventListener('appinstalled',()=>{deferredInstallPrompt=null;toast('تم تثبيت تطبيق إدارة الصيانة');refreshInstallButton();});
function installPanelHtml(){if(state.profile?.role!=='maintenance'||isStandaloneApp())return'';return `<div class="tool-panel" id="installPanel"><div><strong>📲 تطبيق إدارة الصيانة</strong><p>ثبّته على شاشة الجوال لفتح متابعة الصيانة مباشرة مثل أي تطبيق.</p></div><div class="tool-panel-actions"><button class="btn gold" id="installMaintenanceApp">📲 تثبيت تطبيق إدارة الصيانة</button></div></div>`;}
async function registerMaintenanceServiceWorker(){if(!('serviceWorker'in navigator))return null;try{return await navigator.serviceWorker.register('/manager-sw.js',{scope:'/'});}catch(e){console.warn(e);return null;}}
async function installMaintenanceApp(){
  await registerMaintenanceServiceWorker();
  if(deferredInstallPrompt){
    deferredInstallPrompt.prompt();
    const choice=await deferredInstallPrompt.userChoice.catch(()=>null);
    if(choice?.outcome==='accepted') toast('جاري تثبيت إدارة الصيانة');
    deferredInstallPrompt=null;
    return;
  }
  const isAndroid=/Android/i.test(navigator.userAgent);
  const msg=isAndroid?'إذا لم تظهر نافذة التثبيت تلقائيًا: من قائمة ⋮ في Chrome اختر «إضافة إلى الشاشة الرئيسية» ثم «تثبيت».':'من قائمة المشاركة في المتصفح اختر «إضافة إلى الشاشة الرئيسية».';
  toast(msg);
  const panel=document.getElementById('installPanel');
  if(panel && !panel.querySelector('.install-help')) panel.insertAdjacentHTML('beforeend',`<div class="install-help" style="width:100%;font-size:12px;color:#6d5d42;line-height:1.7">${msg}</div>`);
}
function notificationPanelHtml(){if(state.profile?.role!=='maintenance')return'';if(!('serviceWorker'in navigator)||!('PushManager'in window)||!('Notification'in window))return'<div class="tool-panel"><div><strong>🔕 إشعارات الجوال غير مدعومة</strong><p>استخدم Chrome أو Edge محدثًا.</p></div></div>';const denied=Notification.permission==='denied';return `<div class="tool-panel"><div><strong>🔔 إشعارات طلبات الصيانة</strong><p>${denied?'الإشعارات محظورة من إعدادات المتصفح.':'فعّلها مرة واحدة ليصلك تنبيه عند وصول طلب جديد.'}</p></div><div class="tool-panel-actions"><button class="btn ${denied?'ghost':'gold'}" id="enableNotifications" ${denied?'disabled':''}>${denied?'الإشعارات محظورة':'تفعيل إشعارات الجوال'}</button></div></div>`;}
function urlBase64ToUint8Array(s){const p='='.repeat((4-s.length%4)%4),b=(s+p).replace(/-/g,'+').replace(/_/g,'/'),r=atob(b);return Uint8Array.from([...r].map(c=>c.charCodeAt(0)));}
function arrayBufferToBase64Url(buffer){let x='';new Uint8Array(buffer).forEach(v=>x+=String.fromCharCode(v));return btoa(x).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'');}
async function savePushSubscription(subscription){const j=subscription.toJSON(),p=j.keys?.p256dh||arrayBufferToBase64Url(subscription.getKey('p256dh')),a=j.keys?.auth||arrayBufferToBase64Url(subscription.getKey('auth'));await api('/rest/v1/maintenance_push_subscriptions?on_conflict=endpoint',{method:'POST',headers:{Prefer:'resolution=merge-duplicates,return=minimal'},body:JSON.stringify({user_id:state.user.id,endpoint:subscription.endpoint,p256dh:p,auth:a,user_agent:navigator.userAgent})});}
async function enableMaintenancePush(){const btn=document.getElementById('enableNotifications');try{await registerMaintenanceServiceWorker();if(await Notification.requestPermission()!=='granted')throw Error('لم يتم السماح بالإشعارات');const reg=await navigator.serviceWorker.ready;let sub=await reg.pushManager.getSubscription();if(!sub)sub=await reg.pushManager.subscribe({userVisibleOnly:true,applicationServerKey:urlBase64ToUint8Array(MAINTENANCE_VAPID_PUBLIC_KEY)});await savePushSubscription(sub);if(btn){btn.textContent='الإشعارات مفعّلة';btn.disabled=true;btn.className='btn soft';}toast('تم تفعيل إشعارات الصيانة');}catch(e){toast('تعذر تفعيل الإشعارات');}}
function bindMaintenanceTools(){document.getElementById('installMaintenanceApp')?.addEventListener('click',installMaintenanceApp);const n=document.getElementById('enableNotifications');if(n&&!n.disabled)n.addEventListener('click',enableMaintenancePush);refreshInstallButton();}
async function notifyMaintenanceNewRequest(requestId){if(!requestId||!state.session?.access_token)return;const res=await fetch(`${SUPABASE_URL}/functions/v1/send-maintenance-push`,{method:'POST',headers:{apikey:SUPABASE_KEY,Authorization:`Bearer ${state.session.access_token}`,'Content-Type':'application/json'},body:JSON.stringify({request_id:requestId})});if(!res.ok)throw Error(`Push HTTP ${res.status}`);return res.json();}
