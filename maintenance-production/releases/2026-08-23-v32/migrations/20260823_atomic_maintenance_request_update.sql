create or replace function public.update_maintenance_request_atomic(
  p_request_id uuid,
  p_status public.request_status,
  p_note text default null,
  p_external_party text default null,
  p_expected_completion_at timestamptz default null
)
returns jsonb
language plpgsql
security definer
set search_path = 'public', 'auth', 'pg_temp'
as $$
declare
  v_before public.maintenance_requests%rowtype;
  v_after public.maintenance_requests%rowtype;
  v_note text;
  v_update_id uuid;
  v_quick_receive boolean;
  v_role public.app_role;
  v_active boolean;
begin
  if auth.uid() is null then
    raise exception 'authentication_required' using errcode = '42501';
  end if;

  select p.role, p.is_active into v_role, v_active
  from public.profiles p
  where p.id = auth.uid();

  if coalesce(v_active,false) is not true or v_role not in ('maintenance'::public.app_role,'admin'::public.app_role) then
    raise exception 'maintenance_management_required' using errcode = '42501';
  end if;

  select * into v_before
  from public.maintenance_requests
  where id = p_request_id
  for update;

  if not found then
    raise exception 'maintenance_request_not_found' using errcode = 'P0002';
  end if;

  v_quick_receive := (p_status = 'received'::public.request_status and v_before.status <> 'received'::public.request_status);
  v_note := nullif(btrim(coalesce(p_note,'')), '');

  if v_note is null then
    if v_quick_receive then
      v_note := 'تم استلام الطلب وجاري مراجعته.';
    elsif p_status = 'completed'::public.request_status and v_before.status <> 'completed'::public.request_status then
      v_note := 'تم تنفيذ الطلب.';
    else
      raise exception 'maintenance_update_note_required' using errcode = '22023';
    end if;
  end if;

  update public.maintenance_requests
     set status = p_status,
         external_party = case
           when v_quick_receive then v_before.external_party
           else nullif(btrim(coalesce(p_external_party,'')), '')
         end,
         expected_completion_at = case
           when v_quick_receive then v_before.expected_completion_at
           else coalesce(p_expected_completion_at, v_before.expected_completion_at)
         end
   where id = p_request_id
   returning * into v_after;

  insert into public.request_updates(request_id, created_by, note, from_status, to_status)
  values (p_request_id, auth.uid(), v_note, v_before.status, p_status)
  returning id into v_update_id;

  return jsonb_build_object(
    'request_id', v_after.id,
    'update_id', v_update_id,
    'from_status', v_before.status,
    'to_status', v_after.status,
    'completed_at', v_after.completed_at,
    'expected_completion_at', v_after.expected_completion_at
  );
end;
$$;

revoke all on function public.update_maintenance_request_atomic(uuid, public.request_status, text, text, timestamptz) from public, anon;
grant execute on function public.update_maintenance_request_atomic(uuid, public.request_status, text, text, timestamptz) to authenticated;

comment on function public.update_maintenance_request_atomic(uuid, public.request_status, text, text, timestamptz)
is 'Atomically updates a maintenance request status/details and writes the matching request_updates audit row in one database transaction.';