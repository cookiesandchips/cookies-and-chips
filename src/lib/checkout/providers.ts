import 'server-only';
import {integrationConfig,credentials,paymentCredentials} from '@/lib/management/integrations';
import {createHmac,timingSafeEqual} from 'node:crypto';
import {CheckoutError,cents,money,parcels,digest,type Address,type Line,subtotal} from './core';
import {configuredParcels} from './packaging';
import type {Settings,Order} from './server';
const timeout=()=>AbortSignal.timeout(15000);
export async function paypal(path:string,mode:'sandbox'|'live',method='GET',payload?:unknown,idempotency?:string){
 const {id,secret}=await paymentCredentials(mode);
 if(!id||!secret)throw new CheckoutError('Payment service is not configured.',503);
 const base=mode==='live'?'https://api-m.paypal.com':'https://api-m.sandbox.paypal.com';
 const auth=await fetch(base+'/v1/oauth2/token',{method:'POST',headers:{Authorization:'Basic '+Buffer.from(id+':'+secret).toString('base64'),'Content-Type':'application/x-www-form-urlencoded'},body:'grant_type=client_credentials',signal:timeout(),cache:'no-store'});
 if(!auth.ok)throw new CheckoutError('PayPal is temporarily unavailable. Please try again.',502);
 const token=await auth.json();const response=await fetch(base+path,{method,headers:{Authorization:'Bearer '+token.access_token,'Content-Type':'application/json',Prefer:'return=representation',...(idempotency?{'PayPal-Request-Id':idempotency}:{})},...(payload?{body:JSON.stringify(payload)}:{}),signal:timeout(),cache:'no-store'});
 const result=await response.json();if(!response.ok)throw new CheckoutError('PayPal could not complete this request. Your payment status will be checked before retrying.',502);return result;
}
export {paymentBody} from './payment-body';
export {captureEvidence} from './core';
export async function calculateTax(s:Settings,lines:Line[],destination:Address,shipping:number){const config=await integrationConfig(),keys=await credentials();const enabled=config.taxEnabled,mode=config.taxMode,token=keys[mode==='sandbox'?'taxjarSandboxToken':'taxjarLiveToken'];
 if(!enabled)return {amount:0,details:{collection:'manual',mode:'disabled'}};
 if(!token||!['sandbox','live'].includes(mode))throw new CheckoutError('Tax configuration needs attention. Please contact us before paying.',503);
 if(s.paymentMode==='live'&&mode!=='live')throw new CheckoutError('Live orders require live tax configuration or an explicitly disabled tax service.',503);
 const from=s.origin;const payload={from_country:'US',from_zip:from.zip,from_state:from.state,from_city:from.city,from_street:from.street1,to_country:'US',to_zip:destination.zip,to_state:destination.state,to_city:destination.city,to_street:destination.street1,amount:Number(money(subtotal(lines)+shipping)),shipping:Number(money(shipping)),line_items:lines.map(l=>({id:l.id,quantity:l.quantity,unit_price:Number(money(l.unit_cents)),...(l.tax_code?{product_tax_code:l.tax_code}:{})}))};
 const response=await fetch((mode==='sandbox'?'https://api.sandbox.taxjar.com':'https://api.taxjar.com')+'/v2/taxes',{method:'POST',headers:{Authorization:'Bearer '+token,'Content-Type':'application/json'},body:JSON.stringify(payload),signal:timeout(),cache:'no-store'});
 if(!response.ok)throw new CheckoutError('Tax could not be calculated. Please try again before paying.',502);const data=await response.json();return {amount:cents(data.tax?.amount_to_collect),details:{collection:'taxjar',mode,rate:data.tax?.rate,has_nexus:data.tax?.has_nexus}};
}
type Rate={id:string;provider:string;service:string;amount_cents:number;estimated_days:number|null};
function signingKey(){const key=process.env.SUPABASE_SECRET_KEY;if(!key)throw new CheckoutError('Checkout unavailable.',503);return key;}
function sign(value:string){return createHmac('sha256',signingKey()).update('cc-shipping-v1:'+value).digest('hex');}
export function rateFingerprint(lines:Line[],address:Address,origin:Address,parcels:ReturnType<typeof configuredParcels>){return digest({lines,address,origin,parcels});}
export async function shippingRates(s:Settings,lines:Line[],destination:Address,sessionHash:string){if(!s.shippingEnabled)throw new CheckoutError('Shipping is not enabled. Please choose pickup.');if(s.paymentMode==='live'&&s.shippingMode!=='live')throw new CheckoutError('Test shipping rates cannot be used for a real order.',503);const keys=await credentials(),config=await integrationConfig();const token=keys[s.shippingMode==='live'?'shippoLiveToken':'shippoSandboxToken'];if(!token)throw new CheckoutError('Shipping is not configured.',503);
 const parcelPlan=configuredParcels(lines,config.parcel,config.parcelProfiles);
 const response=await fetch('https://api.goshippo.com/shipments/',{method:'POST',headers:{Authorization:'ShippoToken '+token,'Content-Type':'application/json'},body:JSON.stringify({address_from:{...s.origin,street1:s.origin.street1,street2:s.origin.street2},address_to:destination,parcels:parcelPlan,async:false}),signal:timeout(),cache:'no-store'});
 if(!response.ok)throw new CheckoutError('Shipping rates are unavailable. Please retry or choose pickup.',502);const data=await response.json();const rates=(data.rates||[]).filter((r:any)=>r.currency==='USD'&&r.object_id&&r.amount).map((r:any)=>({id:String(r.object_id),provider:String(r.provider),service:String(r.servicelevel?.name||'Shipping'),amount_cents:cents(r.amount),estimated_days:Number.isInteger(r.estimated_days)?r.estimated_days:null})).sort((a:Rate,b:Rate)=>a.amount_cents-b.amount_cents).slice(0,8) as Rate[];
 if(!rates.length)throw new CheckoutError('No shipping services are available for that address. Please choose pickup.');return rates.map(rate=>{const value=Buffer.from(JSON.stringify({rate,mode:s.shippingMode,fingerprint:rateFingerprint(lines,destination,s.origin,parcelPlan),sessionHash,expires:Date.now()+600000})).toString('base64url');return {...rate,token:value+'.'+sign(value)};});
}
export async function verifyRate(token:unknown,s:Settings,lines:Line[],destination:Address,sessionHash:string):Promise<Rate>{if(typeof token!=='string'||token.length>8000)throw new CheckoutError('Choose a shipping service.');const [value,mac]=token.split('.');if(!mac||!/^[a-f0-9]{64}$/.test(mac)||!timingSafeEqual(Buffer.from(mac),Buffer.from(sign(value))))throw new CheckoutError('Shipping selection is invalid. Get new rates.');const payload=JSON.parse(Buffer.from(value,'base64url').toString());const config=await integrationConfig();if(payload.expires<Date.now()||payload.fingerprint!==rateFingerprint(lines,destination,s.origin,configuredParcels(lines,config.parcel,config.parcelProfiles))||payload.sessionHash!==sessionHash||payload.mode!==s.shippingMode)throw new CheckoutError('Your shipping quote expired or the bag or packing details changed. Get new rates.');return payload.rate;}
