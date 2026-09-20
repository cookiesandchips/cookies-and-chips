begin;
-- Move a session bag into the verified customer's bag once, atomically.
create or replace function public.commerce_merge_cart(p_guest text,p_user text) returns void language plpgsql security definer set search_path=public,pg_temp as $$
declare guest_items jsonb; user_items jsonb; merged jsonb;
begin
if p_guest not like 'guest:%' or p_user not like 'user:%' then raise exception 'Invalid cart owner'; end if;
perform pg_advisory_xact_lock(hashtextextended(p_user,0));
select items into guest_items from commerce_carts where owner_key=p_guest for update;
if guest_items is null or guest_items='[]'::jsonb then return; end if;
select items into user_items from commerce_carts where owner_key=p_user for update;
select jsonb_agg(jsonb_build_object('id',id,'quantity',quantity) order by id) into merged from (
select item->>'id' as id,least(20,sum((item->>'quantity')::integer)) as quantity
from jsonb_array_elements(coalesce(user_items,'[]'::jsonb)||guest_items) item group by item->>'id'
) grouped;
if jsonb_array_length(merged)>20 then raise exception 'Too many different products in combined bag'; end if;
insert into commerce_carts(owner_key,items) values(p_user,merged) on conflict(owner_key) do update set items=excluded.items,updated_at=now();
update commerce_carts set items='[]'::jsonb,updated_at=now() where owner_key=p_guest;
end; $$;
revoke all on function public.commerce_merge_cart(text,text) from public,anon,authenticated;
grant execute on function public.commerce_merge_cart(text,text) to service_role;
commit;
