import {test} from 'node:test';
import assert from 'node:assert/strict';
import {bootstrapIntegrations,validateReady} from '../src/lib/management/integration-policy';
import {encryptCredential,decryptCredential} from '../src/lib/management/integration-vault';
import {checkConnection} from '../src/lib/management/integration-checks';
const key='a'.repeat(64);
const legacy={enabled:true,paymentMode:'sandbox',shippingEnabled:true,shippingMode:'sandbox',origin:{name:'Bakery'}};
const env={PAYPAL_ENVIRONMENT:'sandbox',NEXT_PUBLIC_PAYPAL_CLIENT_ID:'example-id',PAYPAL_CLIENT_SECRET:'example-secret',PAYPAL_WEBHOOK_ID:'example-hook',SHIPPO_TEST_API_TOKEN:'shippo_test_example',TAXJAR_ENABLED:'false'};
const encrypt=(value:string)=>encryptCredential(value,key);
test('one-time migration encrypts environment credentials and preserves saved modes, packing, and admin credentials',()=>{
 const existing={config:{paymentMode:'sandbox',shippingMode:'sandbox',parcelProfiles:{'dog-treat':{maxItems:40}}},secrets:{paypalSandboxSecret:encrypt('admin-secret')}};
 const migrated=bootstrapIntegrations(existing,legacy,env,encrypt,'now','revision');
 assert.equal(migrated.source,'bakery-admin');assert.deepEqual(migrated.config,existing.config);
 assert.equal(decryptCredential(migrated.secrets.paypalSandboxSecret,key),'admin-secret');
 assert.equal(decryptCredential(migrated.secrets.paypalSandboxId,key),'example-id');
 assert.equal(decryptCredential(migrated.secrets.shippoSandboxToken,key),'shippo_test_example');
 assert.doesNotMatch(JSON.stringify(migrated),/example-secret|shippo_test_example/);
 assert.equal(migrated.secrets.paypalLiveId,undefined);
});
test('admin-owned state never rereads env, reenables disabled services, or resurrects removed credentials',()=>{
 const first=bootstrapIntegrations(null,legacy,env,encrypt,'now','revision');
 first.config.paymentEnabled=false;delete first.secrets.paypalSandboxSecret;
 const again=bootstrapIntegrations(first,{}, {...env,PAYPAL_ENVIRONMENT:'live',PAYPAL_CLIENT_SECRET:'replacement'},()=>{throw Error('must not encrypt');},'later','other');
 assert.equal(again,first);assert.equal(again.config.paymentEnabled,false);assert.equal(again.secrets.paypalSandboxSecret,undefined);assert.equal(again.secrets.paypalLiveSecret,undefined);
});
test('vault authenticates ciphertext and refuses a wrong or missing infrastructure key',()=>{
 const encrypted=encrypt('private');assert.equal(decryptCredential(encrypted,key),'private');
 assert.throws(()=>decryptCredential(encrypted,'b'.repeat(64)),/cannot be unlocked/);
 const parts=encrypted.split('.');parts[1]=Buffer.alloc(16).toString('base64');assert.throws(()=>decryptCredential(parts.join('.'),key));
 assert.throws(()=>encryptCredential('private',''),/encryption/i);
});
test('activation requires matching complete credentials and live enabled companion services',()=>{
 const config={paymentEnabled:true,paymentMode:'live',shippingEnabled:true,shippingMode:'sandbox',taxEnabled:false,taxMode:'sandbox'};
 const values={paypalLiveId:'id',paypalLiveSecret:'secret',paypalLiveWebhook:'hook',shippoSandboxToken:'test'};
 assert.throws(()=>validateReady(config,values),/shipping services to live/);
 assert.throws(()=>validateReady({...config,shippingMode:'live'},values),/Shippo live credentials/);
 assert.doesNotThrow(()=>validateReady({...config,shippingMode:'live'},{...values,shippoLiveToken:'live'}));
 assert.throws(()=>validateReady({taxEnabled:true,taxMode:'live'},{}),/TaxJar/);
 assert.doesNotThrow(()=>validateReady({taxEnabled:false,paymentEnabled:false,shippingEnabled:false},{}));
});
function fakeFetch(responses:any[],calls:any[]){return (async(url:any,options:any)=>{calls.push({url,options});const response=responses.shift();if(response instanceof Error)throw response;return new Response(JSON.stringify(response?.body||{}),{status:response?.status||200});}) as typeof fetch;}
test('PayPal test checks only authentication and the bakery capture webhook on the selected endpoint',async()=>{
 const calls:any[]=[];
 const result=await checkConnection('paypal','live',{paypalLiveId:'id',paypalLiveSecret:'secret',paypalLiveWebhook:'hook'},fakeFetch([{body:{access_token:'temporary'}},{body:{url:'https://www.cookiesandchips.com/api/paypal/webhook',event_types:[{name:'PAYMENT.CAPTURE.COMPLETED'}]}}],calls));
 assert.equal(result.ok,true);assert.equal(calls.length,2);assert.ok(calls.every(call=>call.url.startsWith('https://api-m.paypal.com/')));
 assert.equal(calls[1].url,'https://api-m.paypal.com/v1/notifications/webhooks/hook');assert.equal(calls[1].options.method,undefined);
 assert.doesNotMatch(JSON.stringify(result),/temporary|secret/);
});
test('wrong webhook cannot pass connection checks',async()=>{
 const result=await checkConnection('paypal','sandbox',{paypalSandboxId:'id',paypalSandboxSecret:'secret',paypalSandboxWebhook:'hook'},fakeFetch([{body:{access_token:'temporary'}},{body:{url:'https://elsewhere.test/webhook',event_types:[{name:'PAYMENT.CAPTURE.COMPLETED'}]}}],[]));assert.equal(result.ok,false);assert.match(result.message,/webhook/);
});
test('Shippo test cannot silently use test tokens for live mode and never creates a shipment',async()=>{
 const calls:any[]=[];
 assert.equal((await checkConnection('shippo','live',{shippoLiveToken:'shippo_test_wrong'},fakeFetch([],calls))).ok,false);assert.equal(calls.length,0);
 assert.equal((await checkConnection('shippo','sandbox',{shippoSandboxToken:'shippo_test_example'},fakeFetch([{body:{results:[]}}],calls))).ok,true);
 assert.equal(calls[0].url,'https://api.goshippo.com/carrier_accounts/?results=1');assert.equal(calls[0].options.method,undefined);
});
test('TaxJar uses the selected environment and failures expose no provider body or secrets',async()=>{
 const calls:any[]=[];
 assert.equal((await checkConnection('taxjar','sandbox',{taxjarSandboxToken:'private-token'},fakeFetch([{body:{regions:[]}}],calls))).ok,true);
 assert.equal(calls[0].url,'https://api.sandbox.taxjar.com/v2/nexus/regions');
 const fail=await checkConnection('taxjar','live',{taxjarLiveToken:'private-token'},fakeFetch([{status:401,body:{error:'private-token'}}],[]));
 assert.equal(fail.ok,false);assert.doesNotMatch(JSON.stringify(fail),/private-token/);
 const timeout=await checkConnection('shippo','live',{shippoLiveToken:'shippo_live_private'},fakeFetch([new Error('private exception')],[]));assert.equal(timeout.ok,false);assert.doesNotMatch(JSON.stringify(timeout),/private/);
});
test('missing credentials return actionable results without provider requests',async()=>{
 const calls:any[]=[];const result=await checkConnection('paypal','live',{},fakeFetch([],calls));assert.equal(result.ok,false);assert.equal(calls.length,0);
 assert.equal(result.message,'Missing Live PayPal configuration:\n- Client ID\n- Client Secret\n- Webhook ID');
 const webhookOnly=await checkConnection('paypal','live',{paypalLiveId:'public-id',paypalLiveSecret:'do-not-print'},fakeFetch([],[]));
 assert.equal(webhookOnly.message,'Missing Live PayPal configuration:\n- Webhook ID');
 assert.doesNotMatch(webhookOnly.message,/do-not-print|public-id/);
 assert.throws(()=>validateReady({paymentEnabled:true,paymentMode:'live',taxEnabled:false,shippingEnabled:false},{paypalLiveId:'public-id'}),/Missing Live PayPal configuration:\n- Client Secret\n- Webhook ID/);
});
