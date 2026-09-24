import {test} from 'node:test';
import assert from 'node:assert/strict';
import {paymentBody} from '../src/lib/checkout/payment-body';
import {paidReceipt} from '../src/lib/checkout/receipt';
import {address} from '../src/lib/checkout/core';
import {US_STATES,normalizeState} from '../src/lib/us-states';
const order:any={id:'order',status:'paid',mode:'sandbox',customer_name:'Test',email:'test@example.com',paypal_capture_id:'capture',items:[{id:'6',title:'Treats',quantity:2,package_count:10,unit_cents:50}],subtotal_cents:100,shipping_cents:800,tax_cents:8,total_cents:1008,donation_cents:100,tax_details:{},fulfillment:{method:'shipping',address:{name:'Test',street1:'350 Fifth Ave',city:'New York',state:'NY',zip:'10118',country:'US'}}};
test('support remains a dedicated exact dollar and PayPal breakdown reconciles with capture total',()=>{
 const body=paymentBody(order,'https://www.cookiesandchips.com',true),unit=body.purchase_units[0];
 assert.equal(unit.amount.value,'10.08');assert.equal(unit.amount.breakdown.item_total.value,'2.00');
 assert.equal(unit.items.length,2);assert.deepEqual(unit.items[1],{name:'CureSearch support',quantity:'1',unit_amount:{currency_code:'USD',value:'1.00'}});
 assert.equal(unit.items.reduce((sum,l)=>sum+Number(l.quantity)*Number(l.unit_amount.value),0),Number(unit.amount.breakdown.item_total.value));
 assert.equal('payment_source' in body,false);assert.ok('application_context' in body);assert.equal(body.application_context.shipping_preference,'SET_PROVIDED_ADDRESS');
 const receipt=paidReceipt(order);assert.match(receipt.text,/CureSearch support: \$1.00/);assert.match(receipt.html,/CureSearch support/);assert.doesNotMatch(receipt.text,/tax.deductible/i);
});
test('no support is added to ordinary or legacy orders and pickup requests no shipping',()=>{
 const body=paymentBody({...order,donation_cents:undefined,total_cents:908,fulfillment:{...order.fulfillment,method:'pickup'}},'https://www.cookiesandchips.com',true);
 assert.equal(body.purchase_units[0].items.length,1);assert.equal(body.purchase_units[0].amount.breakdown.item_total.value,'1.00');assert.ok('application_context' in body);assert.equal(body.application_context.shipping_preference,'NO_SHIPPING');assert.equal('shipping' in body.purchase_units[0],false);
});
test('USPS states normalize legacy names and reject made-up codes',()=>{
 assert.equal(new Set(US_STATES.map(s=>s.code)).size,US_STATES.length);
 for(const code of ['AZ','PR','VI','GU','AS','MP','FM','MH','PW','AA','AE','AP'])assert.equal(normalizeState(code.toLowerCase()),code);
 assert.equal(normalizeState(' New York '),'NY');assert.equal(address({...order.fulfillment.address,state:'new york'}).state,'NY');
 assert.throws(()=>address({...order.fulfillment.address,state:'ZZ'}));assert.throws(()=>address({...order.fulfillment.address,state:'Canada'}));
});
