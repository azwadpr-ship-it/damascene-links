import { decodeBase64, encodeBase64 } from "jsr:@std/encoding/base64";
import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const cors={
  "Access-Control-Allow-Origin":"*",
  "Access-Control-Allow-Headers":"content-type, authorization, apikey, x-client-info",
  "Cache-Control":"no-store, no-cache, must-revalidate"
};

const ATOMIC_PATCH=String.raw`
<script id="maintenance-v32-atomic-update-script">
(function(){
  if(window.__maintenanceV32AtomicInstalled)return;
  window.__maintenanceV32AtomicInstalled=true;

  function adjustAtomicNoteMode(){
    var form=document.getElementById('updateForm');
    var statusSelect=document.getElementById('newStatus');
    var note=document.getElementById('updateNote');
    var label=document.getElementById('updateNoteLabel');
    var hint=document.getElementById('updateNoteHint');
    if(!form||!statusSelect||!note)return;
    var current=(window.__maintenanceRows||[]).find(function(x){return location.pathname.indexOf('/ticket/'+x.id)>=0});
    var oldStatus=current&&current.status;
    var quick=statusSelect.value==='received' && oldStatus!=='received';
    var complete=statusSelect.value==='completed' && oldStatus!=='completed';
    if(quick||complete){
      note.required=false;
      if(label)label.textContent='ملاحظة المتابعة (اختيارية)';
      if(hint)hint.textContent=quick?'يمكن تأكيد الاستلام مباشرة بدون كتابة ملاحظة.':'يمكن إتمام الطلب مباشرة بدون كتابة ملاحظة.';
    }
  }

  var obs=new MutationObserver(function(){setTimeout(adjustAtomicNoteMode,0)});
  obs.observe(document.documentElement,{childList:true,subtree:true});
  document.addEventListener('change',function(e){if(e.target&&e.target.id==='newStatus')setTimeout(adjustAtomicNoteMode,0)});

  window.submitUpdate=async function(e,r){
    e.preventDefault();
    var btn=e.submitter||e.currentTarget.querySelector('button[type="submit"]');
    if(btn){btn.disabled=true;btn.textContent='جاري الحفظ...'}
    try{
      var status=document.getElementById('newStatus').value;
      var noteEl=document.getElementById('updateNote');
      var note=noteEl.value.trim();
      var quickReceive=status==='received' && r.status!=='received';
      var completing=status==='completed' && r.status!=='completed';
      if(!quickReceive&&!completing&&!note){toast('اكتب ملاحظة المتابعة قبل الحفظ');noteEl.focus();return}
      var expected=document.getElementById('expectedAt').value;
      var external=document.getElementById('externalParty').value.trim();
      var payload={
        p_request_id:r.id,
        p_status:status,
        p_note:note||null,
        p_external_party:quickReceive?(r.external_party||null):(external||null),
        p_expected_completion_at:quickReceive?(r.expected_completion_at||null):(expected?riyadhDateTimeToIso(expected):(r.expected_completion_at||null))
      };
      var out=await api('/rest/v1/rpc/update_maintenance_request_atomic',{method:'POST',body:JSON.stringify(payload)});
      var updateId=out&&out.update_id;
      if(!updateId)throw new Error('لم يرجع سجل المتابعة من العملية الذرية');
      var files=[...document.getElementById('updateFiles').files];
      var kind=document.getElementById('attachmentKind').value;
      var failedUploads=0;
      for(var i=0;i<files.length;i++){try{await uploadAttachment(r,files[i],kind,updateId)}catch(_){failedUploads++}}
      if(failedUploads)toast('تم حفظ التحديث، لكن تعذر رفع '+failedUploads+' مرفق. لا تعِد حفظ نفس التحديث.');
      else toast(quickReceive?'تم تأكيد استلام الطلب':(completing?'تم تنفيذ الطلب':'تم حفظ تحديث الصيانة'));
      renderTicket(r.id);
    }catch(ex){toast('تعذر حفظ التحديث: '+ex.message)}
    finally{if(btn){btn.disabled=false;btn.textContent='حفظ تحديث الصيانة'}}
  };
  setTimeout(adjustAtomicNoteMode,200);
})();
</script>`;

let built:Promise<{b64:string,html:string,gzipLen:number}>|null=null;
async function build(){
  const U=Deno.env.get("SUPABASE_URL");
  if(!U)throw new Error("missing_supabase_url");
  const r=await fetch(`${U}/functions/v1/maintenance-app-bundle`,{cache:"no-store"});
  if(!r.ok)throw new Error(`base_bundle_${r.status}`);
  const b64=(await r.text()).trim();
  const compressed=decodeBase64(b64.replace(/[^A-Za-z0-9+/=]/g,""));
  const ds=new DecompressionStream("gzip");
  let html=await new Response(new Blob([compressed]).stream().pipeThrough(ds)).text();
  if(!html.includes('maintenance-v31-mobile-script'))throw new Error('base_v31_missing');
  if(!html.includes('maintenance-v32-atomic-update-script'))html=html.includes('</body>')?html.replace('</body>',ATOMIC_PATCH+'\n</body>'):html+ATOMIC_PATCH;
  const cs=new CompressionStream("gzip");
  const gz=new Uint8Array(await new Response(new Blob([new TextEncoder().encode(html)]).stream().pipeThrough(cs)).arrayBuffer());
  return {b64:encodeBase64(gz),html,gzipLen:gz.length};
}
async function release(){if(!built)built=build();return built}

Deno.serve(async req=>{
  if(req.method==='OPTIONS')return new Response('ok',{headers:cors});
  try{
    const out=await release(),u=new URL(req.url);
    if(u.searchParams.get('health')==='1'){
      const checks={
        baseV31:out.html.includes('maintenance-v31-mobile-script'),
        atomicPatch:out.html.includes('maintenance-v32-atomic-update-script'),
        atomicRpc:out.html.includes('/rest/v1/rpc/update_maintenance_request_atomic'),
        noLegacyPatchInsert:out.html.includes('window.submitUpdate=async function'),
        compactStats74:out.html.includes('height:74px'),
        completedGoldOnly:out.html.includes('m31-stat completed'),
        noStatIcons:!out.html.includes('class="ico"')
      };
      const ok=Object.values(checks).every(Boolean);
      return new Response(JSON.stringify({ok,version:32,source:'v31+atomic-rpc-v32',htmlLen:out.html.length,gzipLen:out.gzipLen,b64Len:out.b64.length,...checks}),{status:ok?200:500,headers:{...cors,'Content-Type':'application/json; charset=utf-8'}});
    }
    return new Response(out.b64,{status:200,headers:{...cors,'Content-Type':'text/plain; charset=utf-8','X-Maintenance-UI-Version':'32'}});
  }catch(e){built=null;return new Response(JSON.stringify({ok:false,version:32,error:String(e)}),{status:500,headers:{...cors,'Content-Type':'application/json; charset=utf-8'}})}
});