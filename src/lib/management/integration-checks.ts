import {CheckoutError} from '../checkout/errors';
import {missingPayPalMessage,requiredSecrets,type Mode,type Provider} from './integration-policy';
export type ConnectionCheck={provider:Provider;mode:Mode;ok:boolean;checkedAt:string;message:string};
export async function checkConnection(provider:Provider,mode:Mode,values:Record<string,string>,request:typeof fetch=fetch):Promise<ConnectionCheck>{
 const label={paypal:'PayPal',taxjar:'TaxJar',shippo:'Shippo'}[provider];
 const result=(ok:boolean,message:string)=>({provider,mode,ok,checkedAt:new Date().toISOString(),message});
 if(!['sandbox','live'].includes(mode))throw new CheckoutError('Choose sandbox or live.');
 const names=requiredSecrets(provider,mode);
 if(names.some(name=>!values[name]))return result(false,provider==='paypal'?missingPayPalMessage(mode,values):`${label} ${mode} credentials are incomplete. Fill in the required fields before testing.`);
 async function read(url:string,options:RequestInit){
  const response=await request(url,{...options,cache:'no-store',redirect:'error',signal:AbortSignal.timeout(10000)});
  if(!response.ok)throw new Error('provider-request-failed');
  return response.json();
 }
 try{
  if(provider==='paypal'){
   const [id,secret,webhook]=names.map(name=>values[name]);
   const environment=mode==='live'?'Live':'Sandbox';
   if(webhook.includes('/')||webhook.includes('http'))return result(false,`The ${environment} Webhook ID must be the ID from PayPal’s webhook list, not the webhook URL. The active configuration has not changed.`);
   const base=mode==='live'?'https://api-m.paypal.com':'https://api-m.sandbox.paypal.com';
   let token;
   try{token=await read(base+'/v1/oauth2/token',{method:'POST',headers:{Authorization:'Basic '+Buffer.from(id+':'+secret).toString('base64'),'Content-Type':'application/x-www-form-urlencoded'},body:'grant_type=client_credentials'});}catch{return result(false,`PayPal rejected the ${environment} Client ID and Client secret. Use the pair from the ${environment} app, not the other environment. The active configuration has not changed.`);}
   if(typeof token.access_token!=='string'||!token.access_token)return result(false,`PayPal rejected the ${environment} Client ID and Client secret. Use the pair from the ${environment} app, not the other environment. The active configuration has not changed.`);
   let hook;
   try{hook=await read(base+'/v1/notifications/webhooks/'+encodeURIComponent(webhook),{headers:{Authorization:'Bearer '+token.access_token}});}catch{return result(false,`PayPal accepted the Client ID and secret, but that Webhook ID is not on the ${environment} app. Paste the ID from that app’s webhook list. The active configuration has not changed.`);}
   if(!['https://www.cookiesandchips.com/api/paypal/webhook','https://cookiesandchips.com/api/paypal/webhook'].includes(hook.url)||!hook.event_types?.some((event:any)=>['PAYMENT.CAPTURE.COMPLETED','*'].includes(event.name)))return result(false,'PayPal credentials work, but the webhook must point to this bakery’s /api/paypal/webhook and include PAYMENT.CAPTURE.COMPLETED.');
  }else if(provider==='shippo'){
   const token=values[names[0]];
   if(!token.startsWith(mode==='live'?'shippo_live_':'shippo_test_'))return result(false,`Use a Shippo ${mode==='live'?'live':'test'} token for the selected environment.`);
   const data=await read('https://api.goshippo.com/carrier_accounts/?results=1',{headers:{Authorization:'ShippoToken '+token}});
   if(!Array.isArray(data.results))throw new Error('invalid-response');
  }else{
   const base=mode==='live'?'https://api.taxjar.com':'https://api.sandbox.taxjar.com';
   const data=await read(base+'/v2/nexus/regions',{headers:{Authorization:'Bearer '+values[names[0]]}});
   if(!Array.isArray(data.regions))throw new Error('invalid-response');
  }
  return result(true,`${label} ${mode} connection verified.${provider==='paypal'?' Webhook configuration verified.':''} No payment, tax transaction, or postage purchase was created.`);
 }catch{return result(false,`${label} ${mode} connection failed. Check the selected credentials and provider availability, then retry. The active configuration has not changed.`);}
}
