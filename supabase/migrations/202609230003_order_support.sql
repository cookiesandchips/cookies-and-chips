begin;
alter table public.commerce_orders add column if not exists donation_cents integer not null default 0 check (donation_cents in (0,100));
-- PostgreSQL may give a multi-column check a table-level generated name.
-- Replace only the aggregate total check, retaining all per-column bounds.
do $$
declare existing record;
begin
 for existing in
  select conname from pg_constraint
  where conrelid='public.commerce_orders'::regclass and contype='c'
    and conkey @> array(select attnum from pg_attribute
      where attrelid='public.commerce_orders'::regclass
        and attname in ('total_cents','subtotal_cents','shipping_cents','tax_cents'))::smallint[]
 loop
  execute format('alter table public.commerce_orders drop constraint %I',existing.conname);
 end loop;
end $$;
alter table public.commerce_orders add constraint commerce_orders_total_cents_check check (total_cents=subtotal_cents+shipping_cents+tax_cents+donation_cents);
comment on column public.commerce_orders.donation_cents is 'Optional CureSearch support collected by merchant, separate from products, tax, shipping and tips. Full refunds include this amount. Not a tax-deductibility representation.';
commit;
