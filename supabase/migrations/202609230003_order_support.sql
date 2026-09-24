begin;
alter table public.commerce_orders add column if not exists donation_cents integer not null default 0 check (donation_cents in (0,100));
alter table public.commerce_orders drop constraint if exists commerce_orders_total_cents_check;
alter table public.commerce_orders add constraint commerce_orders_total_cents_check check (total_cents=subtotal_cents+shipping_cents+tax_cents+donation_cents);
comment on column public.commerce_orders.donation_cents is 'Optional CureSearch support collected by merchant, separate from products, tax, shipping and tips. Full refunds include this amount. Not a tax-deductibility representation.';
commit;
