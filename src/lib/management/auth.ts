import 'server-only';
import {cookies} from 'next/headers';
import {customerName,type HeaderSession} from '@/lib/account-menu';
import {defaultSaleTerms} from '@/lib/checkout/terms';
import {serverClient} from '@/lib/supabase/server';
import {db} from '@/lib/checkout/server';
import {CheckoutError} from '@/lib/checkout/core';
export async function customer(){const client=await serverClient();const {data:{user}}=await client.auth.getUser();if(!user?.email_confirmed_at)throw new CheckoutError('Please sign in with a confirmed email address.',401);return user;}
export async function headerAccount():Promise<HeaderSession|null>{try{const user=await customer();const [{data:addresses},{data:orders},{data:role,error}]=await Promise.all([db().from('commerce_addresses').select('address').eq('user_id',user.id).limit(1),db().from('commerce_orders').select('customer_name').eq('customer_id',user.id).order('created_at',{ascending:false}).limit(1),db().from('commerce_admins').select('user_id').eq('user_id',user.id).maybeSingle()]);return {name:customerName(user,addresses?.[0]?.address?.name,orders?.[0]?.customer_name),email:user.email||'',isAdmin:!error&&!!role};}catch{return null;}}
export async function rememberHeaderAccount(session:HeaderSession|null){const jar=await cookies();if(!session){jar.set('cc-account','',{path:'/',maxAge:0});return;}jar.set('cc-account',JSON.stringify({name:session.name,email:session.email,isAdmin:session.isAdmin}),{path:'/',maxAge:60*60*24*30,sameSite:'lax',secure:process.env.NODE_ENV==='production',httpOnly:false});}
export async function admin(){const user=await customer();const {data,error}=await db().from('commerce_admins').select('user_id').eq('user_id',user.id).maybeSingle();if(error||!data)throw new CheckoutError('Administrator access is required.',403);return user;}
export async function audit(actor:string,action:string,id?:string){await db().from('commerce_audit').insert({actor_id:actor,action,record_id:id});}
export async function publicSite(){const {data,error}=await db().from('commerce_settings').select('value').eq('key','public_site').single();if(error)throw error;// Owner approved Census address checks on 2026-09-22. Persist the initial choice
// without overwriting settings saved concurrently by an administrator.
if(data.value.deliveryGeocodingEnabled===undefined){const {data:initialized,error:writeError}=await db().from('commerce_settings').update({value:{...data.value,deliveryGeocodingEnabled:true}}).eq('key','public_site').eq('value',JSON.stringify(data.value)).select('value').maybeSingle();if(writeError)throw writeError;if(initialized)return {saleTerms:defaultSaleTerms,...initialized.value};const {data:latest,error:readError}=await db().from('commerce_settings').select('value').eq('key','public_site').single();if(readError)throw readError;return {saleTerms:defaultSaleTerms,...latest.value};}
return {saleTerms:defaultSaleTerms,...data.value};}
export async function cartOwner(){const {session}=await import('@/lib/checkout/server');const hash=await session(true);const client=await serverClient();const {data:{user}}=await client.auth.getUser();if(user?.email_confirmed_at){const key='user:'+user.id;const {error}=await db().rpc('commerce_merge_cart',{p_guest:'guest:'+hash,p_user:key});if(error)throw error;return key;}return 'guest:'+hash;}
