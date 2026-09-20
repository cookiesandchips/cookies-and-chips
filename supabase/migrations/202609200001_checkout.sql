begin;
create table if not exists public.commerce_products (
 id text primary key, slug text unique not null, title text not null,
 price_cents integer not null check(price_cents>0), package_count integer not null check(package_count>0),
 product_type text not null, tax_code text, active boolean not null default true
);
alter table public.commerce_products enable row level security;
revoke all on public.commerce_products from anon, authenticated;
grant all on public.commerce_products to service_role;
create table if not exists public.commerce_settings (
 key text primary key, value jsonb not null
);
alter table public.commerce_settings enable row level security;
revoke all on public.commerce_settings from anon, authenticated;
grant all on public.commerce_settings to service_role;
create table if not exists public.commerce_orders (
 id uuid primary key default gen_random_uuid(), created_at timestamptz not null default now(),
 expires_at timestamptz not null default (now()+interval '15 minutes'),
 session_hash text not null, customer_id uuid references auth.users(id),
 email text not null, customer_name text not null, create_account boolean not null default false,
 mode text not null check(mode in ('sandbox','live')),
 status text not null default 'quoted' check(status in ('quoted','awaiting_payment','paid','refunded','cancelled')),
 items jsonb not null, fulfillment jsonb not null, tax_details jsonb not null,
 subtotal_cents integer not null check(subtotal_cents>0), shipping_cents integer not null check(shipping_cents>=0),
 tax_cents integer not null check(tax_cents>=0), total_cents integer not null check(total_cents=subtotal_cents+shipping_cents+tax_cents),
 currency text not null default 'USD' check(currency='USD'),
 paypal_order_id text unique, paypal_capture_id text unique, paid_at timestamptz
);
alter table public.commerce_orders enable row level security;
revoke all on public.commerce_orders from anon, authenticated;
grant all on public.commerce_orders to service_role;
create index if not exists commerce_orders_customer_idx on public.commerce_orders(customer_id,created_at desc);
create table if not exists public.commerce_notifications (
 id uuid primary key default gen_random_uuid(), order_id uuid not null references public.commerce_orders(id),
 kind text not null default 'order_confirmation', state text not null default 'pending' check(state in ('pending','sending','sent','failed')),
 attempts integer not null default 0, claimed_at timestamptz, provider_id text, last_error text,
 created_at timestamptz not null default now(), unique(order_id,kind)
);
alter table public.commerce_notifications enable row level security;
revoke all on public.commerce_notifications from anon, authenticated;
grant all on public.commerce_notifications to service_role;
create or replace function public.complete_commerce_order(p_order_id uuid,p_paypal_id text,p_capture_id text,p_total_cents integer)
returns void language plpgsql security definer set search_path=public,pg_temp as $$
declare o public.commerce_orders;
begin
 select * into o from public.commerce_orders where id=p_order_id for update;
 if not found or o.paypal_order_id is distinct from p_paypal_id or o.total_cents<>p_total_cents then raise exception 'Payment mismatch'; end if;
 if o.status='paid' then
  if o.paypal_capture_id is distinct from p_capture_id then raise exception 'Capture mismatch'; end if;
  return;
 end if;
 if o.status<>'awaiting_payment' then raise exception 'Order not payable'; end if;
 update public.commerce_orders set status='paid',paypal_capture_id=p_capture_id,paid_at=now() where id=p_order_id;
 insert into public.commerce_notifications(order_id) values(p_order_id) on conflict(order_id,kind) do nothing;
end; $$;
revoke all on function public.complete_commerce_order(uuid,text,text,integer) from public,anon,authenticated;
grant execute on function public.complete_commerce_order(uuid,text,text,integer) to service_role;
create or replace function public.claim_commerce_notification(p_order_id uuid)
returns setof public.commerce_notifications language sql security definer set search_path=public,pg_temp as $$
 update public.commerce_notifications set state='sending',attempts=attempts+1,claimed_at=now()
 where order_id=p_order_id and kind='order_confirmation' and attempts<5 and
 (state in ('pending','failed') or (state='sending' and claimed_at<now()-interval '5 minutes'))
 returning *;
$$;
revoke all on function public.claim_commerce_notification(uuid) from public,anon,authenticated;
grant execute on function public.claim_commerce_notification(uuid) to service_role;
insert into public.commerce_products(id,slug,title,price_cents,package_count,product_type) values
('0','alis-classic','Ali’s Classic',2000,12,'human-cookie'),
('1','the-cozy-oat','The Cozy Oat',2000,12,'human-cookie'),
('2','crinkle-crush','Crinkle Crush',2000,12,'human-cookie'),
('3','macadamia-dream','Macadamia Dream',2000,12,'human-cookie'),
('4','cinnamon-kiss','Cinnamon Kiss',2000,12,'human-cookie'),
('5','pumpkin-patch','Pumpkin Patch',2000,12,'human-cookie'),
('6','sandies-treats','Sandie’s Treats',800,10,'dog-treat') on conflict(id) do nothing;
-- Fail closed until the owner-selected mode and origin are configured privately.
insert into public.commerce_settings(key,value) values ('checkout','{"enabled":false,"paymentMode":"sandbox","shippingEnabled":false,"shippingMode":"sandbox","pickupEnabled":true}') on conflict(key) do nothing;
commit;
