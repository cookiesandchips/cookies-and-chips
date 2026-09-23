import {test} from 'node:test';
import assert from 'node:assert/strict';
import {configuredParcels,validateParcel} from '../src/lib/checkout/packaging';
import {mergeIntegrationSection} from '../src/lib/management/integration-sections';
const cookie={id:'cookie',title:'Cookies',quantity:1,unit_cents:100,package_count:12,product_type:'human-cookie'};
const treat={...cookie,id:'treat',title:'Sandie’s Treats',package_count:10,product_type:'dog-treat'};
const cookieBox={length:12,width:9,height:4,emptyWeight:12,itemWeight:2,maxItems:24};
const treatBox={length:9,width:6,height:3,emptyWeight:8,itemWeight:0.5,maxItems:40};
test('treat rule uses package quantities and actual contents weight in each box',()=>{
 const boxes=configuredParcels([{...treat,quantity:5}],cookieBox,{'dog-treat':treatBox});
 assert.deepEqual(boxes.map(b=>b.weight),['28','13']);assert.equal(boxes[0].length,'9');
});
test('mixed orders use separate applicable boxes and preserve existing cookie rules',()=>{
 const boxes=configuredParcels([cookie,treat],cookieBox,{'dog-treat':treatBox});
 assert.deepEqual(boxes.map(b=>b.weight),['36','13']);assert.deepEqual(boxes.map(b=>b.length),['12','9']);
 assert.equal(configuredParcels([cookie],cookieBox)[0].weight,'36');
 assert.equal(configuredParcels([cookie])[0].weight,'32');
});
test('missing rules identify the product and arbitrary configured product types can ship',()=>{
 assert.throws(()=>configuredParcels([cookie,treat],cookieBox),/Sandie’s Treats/);
 assert.equal(configuredParcels([{...treat,product_type:'seasonal-bites'}],cookieBox,{'seasonal-bites':treatBox}).length,1);
});
test('invalid packing cannot loop forever, return empty parcels, or exceed the order limit',()=>{
 for(const maxItems of [0,-1,1.5,Infinity,NaN])assert.throws(()=>validateParcel({...cookieBox,maxItems}));
 assert.throws(()=>configuredParcels([],cookieBox));
 assert.throws(()=>configuredParcels([{...cookie,package_count:0}],cookieBox));
 assert.throws(()=>configuredParcels([{...cookie,quantity:21}],cookieBox));
 assert.throws(()=>configuredParcels([cookie],{...cookieBox,maxItems:0}));
});
test('saving shipping cannot revert live payments from an old admin tab',()=>{
 const current={paymentMode:'live',paymentEnabled:true,taxMode:'live',origin:{zip:'85326'},shippingMode:'sandbox'};
 const result=mergeIntegrationSection(current,{section:'Shipping',config:{paymentMode:'sandbox',taxMode:'sandbox',origin:{zip:'bad'},shippingMode:'live',shippingEnabled:true,parcel:cookieBox,parcelProfiles:{'dog-treat':treatBox}}});
 assert.equal(result.paymentMode,'live');assert.equal(result.taxMode,'live');assert.deepEqual(result.origin,current.origin);assert.equal(result.shippingMode,'live');
});
test('payment saves preserve unrelated settings and invalid sections cannot overwrite configuration',()=>{
 const current={paymentMode:'sandbox',shippingMode:'live',parcelProfiles:{'dog-treat':treatBox}};
 const result=mergeIntegrationSection(current,{section:'Payment processing',config:{paymentMode:'live',paymentEnabled:true,paymentProvider:'paypal',shippingMode:'sandbox'}});
 assert.equal(result.shippingMode,'live');assert.deepEqual(result.parcelProfiles,current.parcelProfiles);
 for(const section of [undefined,'all','__proto__'])assert.throws(()=>mergeIntegrationSection(current,{section,config:{}}));
});
