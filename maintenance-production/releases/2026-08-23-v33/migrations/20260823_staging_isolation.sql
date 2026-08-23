create sequence if not exists public.staging_maintenance_ticket_seq start with 1 increment by 1;

create table if not exists public.staging_maintenance_requests (
  id uuid primary key default gen_random_uuid(),
  ticket_no bigint not null default nextval('public.staging_maintenance_ticket_seq'::regclass),
  ticket_code text unique,
  department text not null,
  location text,
  category text,
  description text not null,
  priority public.request_priority not null default 'normal'::public.request_priority,
  status public.request_status not null default 'new'::public.request_status,
  requested_by uuid not null references public.profiles(id),
  assigned_to uuid references public.profiles(id),
  external_party text,
  expected_completion_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.staging_request_updates (
  id uuid primary key default gen_random_uuid(),
  request_id uuid not null references public.staging_maintenance_requests(id) on delete cascade,
  created_by uuid not null references public.profiles(id),
  note text not null,
  from_status public.request_status,
  to_status public.request_status,
  created_at timestamptz not null default now()
);

create table if not exists public.staging_request_attachments (
  id uuid primary key default gen_random_uuid(),
  request_id uuid not null references public.staging_maintenance_requests(id) on delete cascade,
  update_id uuid references public.staging_request_updates(id) on delete set null,
  uploaded_by uuid not null references public.profiles(id),
  kind public.attachment_kind not null default 'request'::public.attachment_kind,
  storage_path text not null,
  file_name text,
  mime_type text,
  created_at timestamptz not null default now()
);

create index if not exists staging_requests_status_idx on public.staging_maintenance_requests(status);
create index if not exists staging_requests_created_at_idx on public.staging_maintenance_requests(created_at desc);
create index if not exists staging_updates_request_idx on public.staging_request_updates(request_id,created_at);
create index if not exists staging_attachments_request_idx on public.staging_request_attachments(request_id);

create or replace function private.set_staging_ticket_code()
returns trigger
language plpgsql
set search_path='public'
as $$
begin
  if new.ticket_code is null or btrim(new.ticket_code)='' then
    new.ticket_code := lpad(new.ticket_no::text,4,'0');
  end if;
  return new;
end;
$$;

drop trigger if exists staging_requests_set_ticket_code on public.staging_maintenance_requests;
create trigger staging_requests_set_ticket_code before insert on public.staging_maintenance_requests for each row execute function private.set_staging_ticket_code();
drop trigger if exists staging_requests_protect_dates on public.staging_maintenance_requests;
create trigger staging_requests_protect_dates before update on public.staging_maintenance_requests for each row execute function private.protect_maintenance_dates();
drop trigger if exists staging_requests_set_updated_at on public.staging_maintenance_requests;
create trigger staging_requests_set_updated_at before update on public.staging_maintenance_requests for each row execute function private.set_updated_at();

alter table public.staging_maintenance_requests enable row level security;
alter table public.staging_request_updates enable row level security;
alter table public.staging_request_attachments enable row level security;

drop policy if exists staging_requests_insert on public.staging_maintenance_requests;
create policy staging_requests_insert on public.staging_maintenance_requests for insert to authenticated
with check (
  requested_by=(select auth.uid()) and (
    private.current_role() in ('maintenance'::public.app_role,'admin'::public.app_role)
    or (private.current_role()='supervisor'::public.app_role and (
      (select p.department from public.profiles p where p.id=(select auth.uid())) is null
      or department=(select p.department from public.profiles p where p.id=(select auth.uid()))
    ))
  )
);

drop policy if exists staging_requests_read on public.staging_maintenance_requests;
create policy staging_requests_read on public.staging_maintenance_requests for select to authenticated
using (requested_by=(select auth.uid()) or (select private.can_manage_maintenance()));

drop policy if exists staging_requests_update on public.staging_maintenance_requests;
create policy staging_requests_update on public.staging_maintenance_requests for update to authenticated
using ((select private.can_manage_maintenance())) with check ((select private.can_manage_maintenance()));

drop policy if exists staging_updates_insert on public.staging_request_updates;
create policy staging_updates_insert on public.staging_request_updates for insert to authenticated
with check ((select private.can_manage_maintenance()) and created_by=(select auth.uid()));

drop policy if exists staging_updates_read on public.staging_request_updates;
create policy staging_updates_read on public.staging_request_updates for select to authenticated
using ((select private.can_manage_maintenance()) or exists(select 1 from public.staging_maintenance_requests r where r.id=staging_request_updates.request_id and r.requested_by=(select auth.uid())));

drop policy if exists staging_attachments_insert on public.staging_request_attachments;
create policy staging_attachments_insert on public.staging_request_attachments for insert to authenticated
with check (uploaded_by=(select auth.uid()) and ((select private.can_manage_maintenance()) or (kind='request'::public.attachment_kind and exists(select 1 from public.staging_maintenance_requests r where r.id=staging_request_attachments.request_id and r.requested_by=(select auth.uid())))));

drop policy if exists staging_attachments_read on public.staging_request_attachments;
create policy staging_attachments_read on public.staging_request_attachments for select to authenticated
using ((select private.can_manage_maintenance()) or exists(select 1 from public.staging_maintenance_requests r where r.id=staging_request_attachments.request_id and r.requested_by=(select auth.uid())));

drop policy if exists staging_attachments_delete on public.staging_request_attachments;
create policy staging_attachments_delete on public.staging_request_attachments for delete to authenticated
using ((select private.can_manage_maintenance()) or exists(select 1 from public.staging_maintenance_requests r where r.id=staging_request_attachments.request_id and r.requested_by=(select auth.uid())));

create or replace view public.staging_maintenance_requests_enriched with (security_invoker=true) as
select r.*,p.full_name as requester_name from public.staging_maintenance_requests r join public.profiles p on p.id=r.requested_by;

create or replace view public.staging_daily_maintenance_activity with (security_invoker=true) as
select u.id as update_id,r.id as request_id,r.ticket_code,r.department,r.location,r.description,r.priority,u.from_status,u.to_status,u.note,u.created_by,u.created_at
from public.staging_request_updates u join public.staging_maintenance_requests r on r.id=u.request_id;

create or replace function public.update_staging_maintenance_request_atomic(
  p_request_id uuid,
  p_status public.request_status,
  p_note text default null,
  p_external_party text default null,
  p_expected_completion_at timestamptz default null
)
returns jsonb
language plpgsql
security definer
set search_path='public','auth','pg_temp'
as $$
declare
  v_before public.staging_maintenance_requests%rowtype;
  v_after public.staging_maintenance_requests%rowtype;
  v_note text;
  v_update_id uuid;
  v_quick_receive boolean;
  v_role public.app_role;
  v_active boolean;
begin
  if auth.uid() is null then raise exception 'authentication_required' using errcode='42501'; end if;
  select p.role,p.is_active into v_role,v_active from public.profiles p where p.id=auth.uid();
  if coalesce(v_active,false) is not true or v_role not in ('maintenance'::public.app_role,'admin'::public.app_role) then
    raise exception 'maintenance_management_required' using errcode='42501';
  end if;
  select * into v_before from public.staging_maintenance_requests where id=p_request_id for update;
  if not found then raise exception 'staging_maintenance_request_not_found' using errcode='P0002'; end if;
  v_quick_receive := (p_status='received'::public.request_status and v_before.status<>'received'::public.request_status);
  v_note := nullif(btrim(coalesce(p_note,'')),'');
  if v_note is null then
    if v_quick_receive then v_note:='تم استلام الطلب وجاري مراجعته.';
    elsif p_status='completed'::public.request_status and v_before.status<>'completed'::public.request_status then v_note:='تم تنفيذ الطلب.';
    else raise exception 'maintenance_update_note_required' using errcode='22023'; end if;
  end if;
  update public.staging_maintenance_requests
  set status=p_status,
      external_party=case when v_quick_receive then v_before.external_party else nullif(btrim(coalesce(p_external_party,'')),'') end,
      expected_completion_at=case when v_quick_receive then v_before.expected_completion_at else coalesce(p_expected_completion_at,v_before.expected_completion_at) end
  where id=p_request_id returning * into v_after;
  insert into public.staging_request_updates(request_id,created_by,note,from_status,to_status)
  values(p_request_id,auth.uid(),v_note,v_before.status,p_status) returning id into v_update_id;
  return jsonb_build_object('request_id',v_after.id,'update_id',v_update_id,'from_status',v_before.status,'to_status',v_after.status,'completed_at',v_after.completed_at,'expected_completion_at',v_after.expected_completion_at,'staging',true);
end;
$$;

revoke all on function public.update_staging_maintenance_request_atomic(uuid,public.request_status,text,text,timestamptz) from public,anon;
grant execute on function public.update_staging_maintenance_request_atomic(uuid,public.request_status,text,text,timestamptz) to authenticated;

grant usage,select on sequence public.staging_maintenance_ticket_seq to authenticated;
grant select,insert on public.staging_maintenance_requests to authenticated;
grant update(status,assigned_to,external_party,expected_completion_at,completed_at) on public.staging_maintenance_requests to authenticated;
grant select,insert on public.staging_request_updates to authenticated;
grant select,insert,delete on public.staging_request_attachments to authenticated;
grant select on public.staging_maintenance_requests_enriched,public.staging_daily_maintenance_activity to authenticated;

insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
values('maintenance-staging-images','maintenance-staging-images',false,26214400,array['image/jpeg','image/png','image/webp','video/mp4','video/quicktime','video/webm','application/pdf']::text[])
on conflict(id) do update set public=false,file_size_limit=excluded.file_size_limit,allowed_mime_types=excluded.allowed_mime_types;

drop policy if exists maintenance_staging_storage_insert on storage.objects;
create policy maintenance_staging_storage_insert on storage.objects for insert to authenticated
with check (bucket_id='maintenance-staging-images' and ((select private.can_manage_maintenance()) or exists(select 1 from public.staging_maintenance_requests r where r.id::text=(storage.foldername(name))[1] and r.requested_by=(select auth.uid()))));

drop policy if exists maintenance_staging_storage_read on storage.objects;
create policy maintenance_staging_storage_read on storage.objects for select to authenticated
using (bucket_id='maintenance-staging-images' and ((select private.can_manage_maintenance()) or exists(select 1 from public.staging_maintenance_requests r where r.id::text=(storage.foldername(name))[1] and r.requested_by=(select auth.uid()))));

drop policy if exists maintenance_staging_storage_delete on storage.objects;
create policy maintenance_staging_storage_delete on storage.objects for delete to authenticated
using (bucket_id='maintenance-staging-images' and ((select private.can_manage_maintenance()) or exists(select 1 from public.staging_maintenance_requests r where r.id::text=(storage.foldername(name))[1] and r.requested_by=(select auth.uid()))));

create table if not exists public.staging_maintenance_push_subscriptions (
  id bigint generated by default as identity primary key,
  user_id uuid not null references public.profiles(id) on delete cascade,
  endpoint text not null unique,
  p256dh text not null,
  auth text not null,
  user_agent text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.staging_maintenance_push_subscriptions enable row level security;

drop policy if exists staging_push_own_select on public.staging_maintenance_push_subscriptions;
create policy staging_push_own_select on public.staging_maintenance_push_subscriptions for select to authenticated using (user_id=(select auth.uid()) or (select private.can_manage_maintenance()));
drop policy if exists staging_push_own_insert on public.staging_maintenance_push_subscriptions;
create policy staging_push_own_insert on public.staging_maintenance_push_subscriptions for insert to authenticated with check (user_id=(select auth.uid()));
drop policy if exists staging_push_own_update on public.staging_maintenance_push_subscriptions;
create policy staging_push_own_update on public.staging_maintenance_push_subscriptions for update to authenticated using (user_id=(select auth.uid())) with check (user_id=(select auth.uid()));
drop policy if exists staging_push_own_delete on public.staging_maintenance_push_subscriptions;
create policy staging_push_own_delete on public.staging_maintenance_push_subscriptions for delete to authenticated using (user_id=(select auth.uid()));

drop trigger if exists staging_push_set_updated_at on public.staging_maintenance_push_subscriptions;
create trigger staging_push_set_updated_at before update on public.staging_maintenance_push_subscriptions for each row execute function private.set_push_subscription_updated_at();

grant select,insert,update,delete on public.staging_maintenance_push_subscriptions to authenticated;