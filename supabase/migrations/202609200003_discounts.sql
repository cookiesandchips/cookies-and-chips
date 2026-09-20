begin;
create table if not exists public.commerce_discounts(code text primary key,percent integer not null check(percent between 1 and 90),minimum_cents integer not null default 0 check(minimum_cents>=0),active boolean not null default true);
alter table public.commerce_discounts enable row level security;
revoke all on public.commerce_discounts from anon,authenticated;
grant all on public.commerce_discounts to service_role;
create or replace function public.set_commerce_markup(p_ids text[],p_kind text,p_value numeric) returns void language plpgsql security definer set search_path=public,pg_temp as $$ begin
if p_kind not in ('fixed','percent') or p_value<0 or p_value>10000 or cardinality(p_ids)>100 or cardinality(p_ids)<1 then raise exception 'Invalid markup'; end if;
if exists(select 1 from commerce_products where id=any(p_ids) and round(base_cents+case when p_kind='fixed' then p_value*100 else base_cents*p_value/100 end)>100000) then raise exception 'Price exceeds limit'; end if;
update commerce_products set markup_type=p_kind,markup_value=p_value,price_cents=round(base_cents+case when p_kind='fixed' then p_value*100 else base_cents*p_value/100 end) where id=any(p_ids);
end; $$;
revoke all on function public.set_commerce_markup(text[],text,numeric) from public,anon,authenticated;
grant execute on function public.set_commerce_markup(text[],text,numeric) to service_role;
commit;
