import 'server-only';
import {db,type Order} from './server';
import {credentials,integrationConfig} from '@/lib/management/integrations';
import {configuredParcels} from './packaging';
import {readShippoTracking,shippoOrderBody,trackingSteps,trackingUrl} from './tracking';
const KIND='shippo_order';
function shippoMode(order:Order,fallback:'sandbox'|'live'){if(order.mode==='sandbox')return 'sandbox';return order.fulfillment.mode==='live'||order.fulfillment.mode==='sandbox'?order.fulfillment.mode:fallback;}
async function tokenFor(mode:'sandbox'|'live'){const keys=await credentials();const token=keys[mode==='live'?'shippoLiveToken':'shippoSandboxToken'];if(!token?.startsWith(mode==='live'?'shippo_live_':'shippo_test_'))throw new Error('Shippo token missing');return token;}
async function shippoFetch(path:string,token:string,body?:unknown){const response=await fetch('https://api.goshippo.com'+path,{method:body?'POST':'GET',headers:{Authorization:'ShippoToken '+token,'Content-Type':'application/json','SHIPPO-API-VERSION':'2018-02-08'},...(body?{body:JSON.stringify(body)}:{}),cache:'no-store',redirect:'error',signal:AbortSignal.timeout(15000)});if(!response.ok)throw new Error('Shippo request failed');return response.json();}
export async function ensureShippoOrder(order:Order){
 if(order.status!=='paid')return false;
 if(order.fulfillment.method!=='shipping')return true;
 if(order.fulfillment.shippo?.orderId)return true;
 const database=db();
 const {data:existing}=await database.from('commerce_notifications').select('state,attempts,claimed_at').eq('order_id',order.id).eq('kind',KIND).maybeSingle();
 if(existing?.state==='sent')return true;
 if(existing&&existing.attempts>=5&&existing.state==='failed')return false;
 if(existing?.state==='sending'&&Date.now()-Date.parse(existing.claimed_at||'')<5*60*1000)return false;
 if(existing?.state==='sending')await database.from('commerce_notifications').update({state:'failed',last_error:'Shippo order send was interrupted.'}).eq('order_id',order.id).eq('kind',KIND).eq('state','sending');
 if(!existing){const {error}=await database.from('commerce_notifications').insert({order_id:order.id,kind:KIND});if(error&&error.code!=='23505')return false;}
 const {data:claimed}=await database.from('commerce_notifications').update({state:'sending',attempts:(existing?.attempts||0)+1,claimed_at:new Date().toISOString()}).eq('order_id',order.id).eq('kind',KIND).in('state',['pending','failed']).lt('attempts',5).select('id');
 if(!claimed?.length){const {data:current}=await database.from('commerce_notifications').select('state').eq('order_id',order.id).eq('kind',KIND).maybeSingle();return current?.state==='sent';}
 try{
  const config=await integrationConfig();
  const mode=shippoMode(order,config.shippingMode);
  if(order.mode==='live'&&mode!=='live')throw new Error('Live shipping order requires the live Shippo token');
  const token=await tokenFor(mode);
  let parcels:ReturnType<typeof configuredParcels>=[];
  try{parcels=configuredParcels(order.items,config.parcel,config.parcelProfiles);}catch{parcels=[];}
  const rate=order.fulfillment.rate;
  const body=shippoOrderBody({id:order.id,email:order.email,customerName:order.customer_name,paidAt:order.paid_at,items:order.items,subtotal_cents:order.subtotal_cents,shipping_cents:order.shipping_cents,tax_cents:order.tax_cents,total_cents:order.total_cents,origin:config.origin,destination:order.fulfillment.address,service:rate?`${rate.provider} ${rate.service}`:undefined,parcels});
  const created=await shippoFetch('/orders/',token,body);
  if(typeof created?.object_id!=='string'||!/^[A-Za-z0-9]{10,64}$/.test(created.object_id))throw new Error('Shippo order id missing');
  const shippo={orderId:created.object_id,orderNumber:body.order_number,mode};
  const {error}=await database.from('commerce_orders').update({fulfillment:{...order.fulfillment,shippo}}).eq('id',order.id).eq('status','paid');
  if(error)throw error;
  await database.from('commerce_notifications').update({state:'sent',provider_id:created.object_id,last_error:null}).eq('order_id',order.id).eq('kind',KIND);
  order.fulfillment={...order.fulfillment,shippo};
  return true;
 }catch{await database.from('commerce_notifications').update({state:'failed',last_error:'Shippo did not accept the order.'}).eq('order_id',order.id).eq('kind',KIND);return false;}
}
async function refreshTracking(order:Order){
 const saved=order.fulfillment.shippo;
 if(!saved?.orderId||(saved.checkedAt&&Date.now()-Date.parse(saved.checkedAt)<60*1000))return order;
 try{
  const token=await tokenFor(saved.mode==='live'?'live':'sandbox');
  const remote=await shippoFetch('/orders/'+encodeURIComponent(saved.orderId),token);
  const transactions=Array.isArray(remote?.transactions)?remote.transactions:[];
  let payload=remote;
  if(transactions.every((item:unknown)=>typeof item==='string')){
   const loaded=await Promise.all(transactions.slice(0,4).map((id:string)=>shippoFetch('/transactions/'+encodeURIComponent(id),token)));
   payload={transactions:loaded};
  }
  const tracking=readShippoTracking(payload,order.fulfillment.rate?.provider||'');
  const shippo={...saved,checkedAt:new Date().toISOString(),...(tracking?{trackingNumber:tracking.trackingNumber,trackingUrl:tracking.trackingUrl,status:tracking.status}:{})};
  await db().from('commerce_orders').update({fulfillment:{...order.fulfillment,shippo}}).eq('id',order.id);
  return {...order,fulfillment:{...order.fulfillment,shippo}};
 }catch{return order;}
}
export async function publicTracking(id:string){
 if(!trackingUrl(id))return null;
 const {data,error}=await db().from('commerce_orders').select('id,status,mode,paid_at,customer_name,email,items,fulfillment,subtotal_cents,shipping_cents,tax_cents,total_cents').eq('id',id).maybeSingle();
 if(error||!data)return null;
 const order=data as Order;
 if(!['paid','refunded'].includes(order.status)||order.fulfillment?.method!=='shipping')return null;
 if(order.status==='paid')await ensureShippoOrder(order);
 const current=await refreshTracking(order);
 const shippo=current.fulfillment.shippo;
 const address=current.fulfillment.address;
 return {id:current.id,paidAt:current.paid_at,city:address?.city||'',state:address?.state||'',items:(current.items||[]).map(item=>({title:item.title,quantity:item.quantity})),trackingNumber:shippo?.trackingNumber||'',trackingUrl:shippo?.trackingUrl||'',status:shippo?.status||'',steps:trackingSteps({trackingNumber:shippo?.trackingNumber,status:shippo?.status}),sandbox:current.mode==='sandbox'};
}
