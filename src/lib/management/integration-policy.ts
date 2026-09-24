import {CheckoutError} from '../checkout/errors';
import type {IntegrationSection} from './integration-sections';
export const secretNames=['paypalSandboxId','paypalSandboxSecret','paypalSandboxWebhook','paypalLiveId','paypalLiveSecret','paypalLiveWebhook','taxjarSandboxToken','taxjarLiveToken','shippoSandboxToken','shippoLiveToken'] as const;
export type SecretName=typeof secretNames[number];
export type Mode='sandbox'|'live';
export type Provider='paypal'|'taxjar'|'shippo';
export const providerForSection:Partial<Record<IntegrationSection,Provider>>={'Payment processing':'paypal','Sales tax':'taxjar','Shipping':'shippo'};
export const modeKey={paypal:'paymentMode',taxjar:'taxMode',shippo:'shippingMode'} as const;
export const enabledKey={paypal:'paymentEnabled',taxjar:'taxEnabled',shippo:'shippingEnabled'} as const;
export function requiredSecrets(provider:Provider,mode:Mode):SecretName[]{
 const suffix=mode==='live'?'Live':'Sandbox';
 return (provider==='paypal'?['Id','Secret','Webhook'].map(field=>'paypal'+suffix+field):[provider+suffix+'Token']) as SecretName[];
}
const paypalFieldLabels={Id:'Client ID',Secret:'Client Secret',Webhook:'Webhook ID'} as const;
export function missingPayPalFields(mode:Mode,values:Record<string,string>){
 const suffix=mode==='live'?'Live':'Sandbox';
 return (['Id','Secret','Webhook'] as const).filter(field=>!values['paypal'+suffix+field]).map(field=>paypalFieldLabels[field]);
}
export function missingPayPalMessage(mode:Mode,values:Record<string,string>){
 const missing=missingPayPalFields(mode,values);
 if(!missing.length)return '';
 const title=mode==='live'?'Live':'Sandbox';
 return `Missing ${title} PayPal configuration:\n${missing.map(name=>'- '+name).join('\n')}`;
}
function envMode(value:string|undefined):Mode{
 const mode=(value||'sandbox').trim().toLowerCase();
 if(['live','production'].includes(mode))return 'live';
 if(['sandbox','test'].includes(mode))return 'sandbox';
 throw new CheckoutError('The legacy provider environment must be sandbox or live before migration.',503);
}
// Only used for the first encrypted snapshot. Admin-owned records never read these defaults again.
export function bootstrapIntegrations(previous:any,legacy:any,env:Record<string,string|undefined>,encrypt:(value:string)=>string,now:string,revision:string){
 if(previous?.source==='bakery-admin')return previous;
 const paypalMode=envMode(env.PAYPAL_ENVIRONMENT)==='live'?'Live':'Sandbox';
 const environment:Record<string,string|undefined>={
  ['paypal'+paypalMode+'Id']:env.NEXT_PUBLIC_PAYPAL_CLIENT_ID,
  ['paypal'+paypalMode+'Secret']:env.PAYPAL_CLIENT_SECRET,
  ['paypal'+paypalMode+'Webhook']:env.PAYPAL_WEBHOOK_ID,
  taxjarSandboxToken:env.TAXJAR_SANDBOX_API_TOKEN,taxjarLiveToken:env.TAXJAR_LIVE_API_TOKEN,
  shippoSandboxToken:env.SHIPPO_TEST_API_TOKEN,shippoLiveToken:env.SHIPPO_LIVE_API_TOKEN,
 };
 const secrets={...previous?.secrets};
 for(const name of secretNames)if(!Object.hasOwn(secrets,name)&&environment[name]?.trim())secrets[name]=encrypt(environment[name]!.trim());
 return {...previous,source:'bakery-admin',revision,migratedAt:now,secrets,checks:{},config:previous?.config||{
  paymentProvider:'paypal',paymentEnabled:legacy.enabled,paymentMode:legacy.paymentMode||'sandbox',
  taxEnabled:env.TAXJAR_ENABLED==='true',taxMode:envMode(env.TAXJAR_ENVIRONMENT),
  shippingEnabled:legacy.shippingEnabled,shippingMode:legacy.shippingMode||'sandbox',origin:legacy.origin,
  parcel:{length:12,width:9,height:4,emptyWeight:12,itemWeight:2,maxItems:24},parcelProfiles:{},
 }};
}
export function validateReady(config:any,values:Record<string,string>){
 for(const provider of ['paypal','taxjar','shippo'] as const){
  if(!config[enabledKey[provider]])continue;
  const names=requiredSecrets(provider,config[modeKey[provider]]);
  if(names.some(name=>!values[name])){
   if(provider==='paypal')throw new CheckoutError(missingPayPalMessage(config[modeKey[provider]],values)+'\nAdd the missing fields here or disable payments before saving.');
   throw new CheckoutError(`${{taxjar:'TaxJar',shippo:'Shippo'}[provider]} ${config[modeKey[provider]]} credentials are incomplete. Add them here or disable this service before saving.`);
  }
 }
 if(config.paymentEnabled&&config.paymentMode==='live'&&((config.taxEnabled&&config.taxMode!=='live')||(config.shippingEnabled&&config.shippingMode!=='live')))throw new CheckoutError('Set enabled tax and shipping services to live before activating live payments.');
}
