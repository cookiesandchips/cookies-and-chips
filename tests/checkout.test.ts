import test from 'node:test';
import assert from 'node:assert/strict';
import {cart,cents,priceCart,subtotal,parcels,address} from '../src/lib/checkout/core';
const product={id:'0',title:'Cookie',active:true,price_cents:2000,package_count:12,product_type:'human-cookie'};
test('browser prices cannot alter authoritative order total',()=>{const lines=priceCart([{id:'0',quantity:2,unit_cents:1}],[product]);assert.equal(subtotal(lines),4000);});
test('duplicate, negative, fractional and excessive quantities fail',()=>{for(const value of [[{id:'0',quantity:1},{id:'0',quantity:1}],[{id:'0',quantity:-1}],[{id:'0',quantity:1.5}],[{id:'0',quantity:21}]])assert.throws(()=>cart(value));});
test('inactive and unknown products fail closed',()=>{assert.throws(()=>priceCart([{id:'0',quantity:1}],[{...product,active:false}]));assert.throws(()=>priceCart([{id:'x',quantity:1}],[product]));});
test('provider amounts use cents and reject precision loss',()=>{assert.equal(cents('20.01'),2001);assert.equal(cents('0'),0);for(const v of ['1.001','-1','NaN','1e3'])assert.throws(()=>cents(v));});
test('packing handles multiple boxes and rejects unsupported assortments',()=>{const lines=priceCart([{id:'0',quantity:4}],[product]);assert.equal(parcels(lines).length,2);assert.throws(()=>parcels([{...lines[0],product_type:'dog-treat'}]));});
test('checkout validates address country and zip',()=>{assert.throws(()=>address({name:'Test',street1:'123 Test St',city:'Buckeye',state:'AZ',zip:'bad',country:'US'}));});
import {captureEvidence} from '../src/lib/checkout/core';
test('capture verification rejects wrong order, amount, currency and pending payment',()=>{
 const order={id:'local',paypal_order_id:'paypal',total_cents:2000};
 const good={id:'paypal',status:'COMPLETED',purchase_units:[{reference_id:'local',custom_id:'local',amount:{currency_code:'USD',value:'20.00'},payments:{captures:[{id:'capture',status:'COMPLETED',amount:{currency_code:'USD',value:'20.00'}}]}}]};
 assert.equal(captureEvidence(good,order).id,'capture');
 for(const change of [(v:any)=>v.id='other',(v:any)=>v.status='APPROVED',(v:any)=>v.purchase_units[0].payments.captures[0].amount.value='1.00',(v:any)=>v.purchase_units[0].amount.currency_code='EUR',(v:any)=>v.purchase_units[0].custom_id='other']){const v=structuredClone(good);change(v);assert.throws(()=>captureEvidence(v,order));}
});
