begin;
create table if not exists public.commerce_request_limits(bucket text primary key,started_at timestamptz not null default now(),hits integer not null default 1);
alter table public.commerce_request_limits enable row level security;
revoke all on public.commerce_request_limits from anon,authenticated;
grant all on public.commerce_request_limits to service_role;
create or replace function public.commerce_allow_request(p_bucket text,p_limit integer) returns boolean language plpgsql security definer set search_path=public,pg_temp as $$ declare n integer; begin
insert into commerce_request_limits(bucket) values(p_bucket) on conflict(bucket) do update set hits=case when commerce_request_limits.started_at<now()-interval '1 hour' then 1 else commerce_request_limits.hits+1 end,started_at=case when commerce_request_limits.started_at<now()-interval '1 hour' then now() else commerce_request_limits.started_at end returning hits into n;
return n<=p_limit; end; $$;
revoke all on function public.commerce_allow_request(text,integer) from public,anon,authenticated;
grant execute on function public.commerce_allow_request(text,integer) to service_role;
commit;
