begin;
update public.commerce_products set details=jsonb_set(details,'{defaultImage}','"/brand/products/pumpkin-patch-v2.png"') where id='5';
update public.commerce_products set details=jsonb_set(details,'{defaultImage}','"/brand/products/peanut-butter-bliss-v1.png"') where id='7';
commit;
