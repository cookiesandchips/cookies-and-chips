import 'server-only';
import {defaultSaleTerms} from '@/lib/checkout/terms';
import {serverClient} from '@/lib/supabase/server';
import {db} from '@/lib/checkout/server';
import {CheckoutError} from '@/lib/checkout/core';
export async function customer(){const client=await serverClient();const {data:{user}}=await client.auth.getUser();if(!user?.email_confirmed_at)throw new CheckoutError('Please sign in with a confirmed email address.',401);return user;}
export async function admin(){const user=await customer();const {data,error}=await db().from('commerce_admins').select('user_id').eq('user_id',user.id).maybeSingle();if(error||!data)throw new CheckoutError('Administrator access is required.',403);return user;}
export async function audit(actor:string,action:string,id?:string){await db().from('commerce_audit').insert({actor_id:actor,action,record_id:id});}
export async function publicSite(){const {data,error}=await db().from('commerce_settings').select('value').eq('key','public_site').single();if(error)throw error;// Owner approved Census address checks on 2026-09-22. Persist the initial choice
// without overwriting settings saved concurrently by an administrator.
if(data.value.deliveryGeocodingEnabled===undefined){const {data:initialized,error:writeError}=await db().from('commerce_settings').update({value:{...data.value,deliveryGeocodingEnabled:true}}).eq('key','public_site').eq('value',JSON.stringify(data.value)).select('value').maybeSingle();if(writeError)throw writeError;if(initialized)return {saleTerms:defaultSaleTerms,...initialized.value};const {data:latest,error:readError}=await db().from('commerce_settings').select('value').eq('key','public_site').single();if(readError)throw readError;return {saleTerms:defaultSaleTerms,...latest.value};}
return {saleTerms:defaultSaleTerms,...data.value};}
export async function cartOwner(){const {session}=await import('@/lib/checkout/server');const hash=await session(true);const client=await serverClient();const {data:{user}}=await client.auth.getUser();if(user?.email_confirmed_at){const key='user:'+user.id;const {error}=await db().rpc('commerce_merge_cart',{p_guest:'guest:'+hash,p_user:key});if(error)throw error;return key;}return 'guest:'+hash;}
