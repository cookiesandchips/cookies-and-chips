import 'server-only';
import {createHmac,randomUUID} from 'node:crypto';
import {db} from '@/lib/checkout/server';
import {CheckoutError,address} from '@/lib/checkout/core';
import {validateParcel} from '@/lib/checkout/packaging';
import {mergeIntegrationSection,type IntegrationSection} from './integration-sections';
import {bootstrapIntegrations,secretNames,requiredSecrets,providerForSection,modeKey,enabledKey,validateReady,type Provider,type Mode} from './integration-policy';
import {encryptCredential,decryptCredential} from './integration-vault';
import {checkConnection,type ConnectionCheck} from './integration-checks';
export {secretNames} from './integration-policy';
const encryptionKey=()=>process.env.INTEGRATION_ENCRYPTION_KEY||'';
const encrypt=(value:string)=>encryptCredential(value,encryptionKey());
const decrypt=(value:string)=>decryptCredential(value,encryptionKey());
async function readStored(){const {data,error}=await db().from('commerce_settings').select('value').eq('key','integrations').maybeSingle();if(error)throw error;return data?.value||null;}
async function replace(old:any,next:any){
 if(old){const {data,error}=await db().from('commerce_settings').update({value:next}).eq('key','integrations').eq('value',JSON.stringify(old)).select('key').maybeSingle();if(error)throw error;return !!data;}
 const {error}=await db().from('commerce_settings').insert({key:'integrations',value:next});if(error?.code==='23505')return false;if(error)throw error;return true;
}
const conflict=()=>new CheckoutError('Configuration changed in another window. Reload and review the latest settings before saving.',409);
export async function storedIntegrations(){
 for(let attempt=0;attempt<3;attempt++){
  const old=await readStored();
  if(old?.source==='bakery-admin')return old;
  const {data,error}=await db().from('commerce_settings').select('value').eq('key','checkout').single();if(error)throw error;
  // Persist all existing settings and credentials atomically before retiring environment fallbacks.
  // No key values are returned to the browser or included in logs.
  if(!/^[a-f0-9]{64}$/i.test(encryptionKey()))throw new CheckoutError('Integration migration requires the dedicated encryption key in Vercel.',503);
  const next=bootstrapIntegrations(old,data.value,process.env,encrypt,new Date().toISOString(),randomUUID());
  if(await replace(old,next))return next;
 }
 throw conflict();
}
export async function integrationConfig(){return (await storedIntegrations()).config;}
function unlocked(stored:any):Record<string,string>{return Object.fromEntries(secretNames.map(name=>[name,stored.secrets?.[name]?decrypt(stored.secrets[name]):'']));}
export async function credentials(){return unlocked(await storedIntegrations());}
function fingerprint(provider:Provider,mode:Mode,values:Record<string,string>){return createHmac('sha256',encryptionKey()).update(JSON.stringify([provider,mode,...requiredSecrets(provider,mode).map(name=>values[name]||'')])).digest('hex');}
function publicChecks(stored:any,values:Record<string,string>){
 return Object.fromEntries(Object.entries(stored.checks||{}).map(([name,value])=>{
  const {fingerprint:testedFingerprint,...check}=value as ConnectionCheck&{fingerprint:string};
  return [name,{...check,current:testedFingerprint===fingerprint(check.provider,check.mode,values)}];
 }));
}
export async function integrationSummary(){
 const stored=await storedIntegrations();const values=unlocked(stored);
 const {data:products,error}=await db().from('commerce_products').select('product_type');if(error)throw error;
 return {source:'bakery-admin',revision:stored.revision,migratedAt:stored.migratedAt,config:stored.config,
  productTypes:[...new Set((products||[]).map(p=>p.product_type))].sort(),encryptionReady:true,
  configured:Object.fromEntries(secretNames.map(name=>[name,stored.secrets?.[name]?'Saved securely in bakery admin':'Not configured'])),
  checks:publicChecks(stored,values),
  active:Object.fromEntries((['paypal','taxjar','shippo'] as const).map(provider=>[provider,{enabled:stored.config[enabledKey[provider]],mode:stored.config[modeKey[provider]],ready:requiredSecrets(provider,stored.config[modeKey[provider]]).every(name=>!!values[name])}]))};
}
function candidate(old:any,input:any){
 if(input.revision!==old.revision)throw conflict();
 const c=mergeIntegrationSection(old.config,input);
 if(!['paypal','none'].includes(c.paymentProvider)||!['sandbox','live'].includes(c.paymentMode)||!['sandbox','live'].includes(c.taxMode)||!['sandbox','live'].includes(c.shippingMode))throw new CheckoutError('Choose valid providers and modes.');
 const secrets={...old.secrets},values=unlocked(old);
 const removals=input.removeSecrets||[];
 if(!Array.isArray(removals)||removals.some(name=>!secretNames.includes(name)))throw new CheckoutError('Invalid credential removal.');
 for(const name of secretNames){
  const value=input.secrets?.[name];
  if(value!==undefined&&typeof value!=='string')throw new CheckoutError('Invalid credential.');
  if((value?.trim()||removals.includes(name))&&!name.startsWith(providerForSection[input.section as IntegrationSection]||'invalid'))throw new CheckoutError('Manage credentials from their matching integration section.');
  if(removals.includes(name)){delete secrets[name];values[name]='';}
  if(value?.trim()){
   if(removals.includes(name))throw new CheckoutError('Choose either replacement or removal for a credential.');
   if(value.length>4096)throw new CheckoutError('Credential is too long.');
   values[name]=value.trim();secrets[name]=encrypt(value.trim());
  }
 }
 return {config:c,secrets,values};
}
export async function testIntegration(input:any){
 const old=await storedIntegrations();const {config,values}=candidate(old,input);
 const provider=providerForSection[input.section as IntegrationSection];if(!provider)throw new CheckoutError('Choose a payment, tax, or shipping integration to test.');
 const mode=config[modeKey[provider]] as Mode,check=await checkConnection(provider,mode,values);
 // Tests may use unsaved credentials, but never persist those credentials or activate a mode.
 const next={...old,revision:randomUUID(),checks:{...old.checks,[provider+'.'+mode]:{...check,fingerprint:fingerprint(provider,mode,values)}}};
 if(!await replace(old,next))throw conflict();
 return check;
}
export async function saveIntegrations(input:any){
 const old=await storedIntegrations();const {config:c,secrets,values}=candidate(old,input);
 if(c.paymentEnabled&&c.paymentProvider==='none')throw new CheckoutError('Choose a supported payment provider before enabling payments.');
 if(input.section==='Payment processing'&&c.paymentEnabled&&c.paymentMode==='live'&&input.confirmLive!==true)throw new CheckoutError('Confirm that you intend to accept real payments before saving live mode.');
 const parcel=validateParcel(c.parcel),parcelProfiles:Record<string,ReturnType<typeof validateParcel>>={};
 if(c.parcelProfiles!==undefined&&(!c.parcelProfiles||typeof c.parcelProfiles!=='object'||Array.isArray(c.parcelProfiles)||Object.keys(c.parcelProfiles).length>100))throw new CheckoutError('Invalid shipping packing rules.');
 for(const [type,profile] of Object.entries(c.parcelProfiles||{})){if(!type.trim()||type.length>100||['__proto__','constructor','prototype'].includes(type))throw new CheckoutError('Invalid product type.');parcelProfiles[type]=validateParcel(profile);}
 const config={paymentProvider:c.paymentProvider,paymentEnabled:c.paymentEnabled===true,paymentMode:c.paymentMode,taxEnabled:c.taxEnabled===true,taxMode:c.taxMode,shippingEnabled:c.shippingEnabled===true,shippingMode:c.shippingMode,origin:address(c.origin),parcel,parcelProfiles};
 validateReady(config,values);
 const provider=providerForSection[input.section as IntegrationSection],checks={...old.checks};
 if(provider&&config[enabledKey[provider]]){
  const mode=config[modeKey[provider]] as Mode;
  const changed=!old.config[enabledKey[provider]]||old.config[modeKey[provider]]!==mode||fingerprint(provider,mode,unlocked(old))!==fingerprint(provider,mode,values);
  if(changed){
   const prior=checks[provider+'.'+mode];
   const verified=prior?.ok&&prior.fingerprint===fingerprint(provider,mode,values)&&Date.now()-Date.parse(prior.checkedAt)<15*60*1000;
   if(!verified){const check=await checkConnection(provider,mode,values);if(!check.ok)throw new CheckoutError(check.message,400);checks[provider+'.'+mode]={...check,fingerprint:fingerprint(provider,mode,values)};}
  }
 }
 if(!await replace(old,{...old,config,secrets,checks,revision:randomUUID(),updatedAt:new Date().toISOString()}))throw conflict();
}
export async function paymentCredentials(mode:string){const values=await credentials(),suffix=mode==='live'?'Live':'Sandbox';return {id:values['paypal'+suffix+'Id'],secret:values['paypal'+suffix+'Secret'],webhook:values['paypal'+suffix+'Webhook']};}
