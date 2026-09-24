import 'server-only';
import {db,type Order} from './server';
import {paypal,captureEvidence} from './providers';
import {CheckoutError,money} from './core';
import {paidReceipt} from './receipt';
export async function notifyOrder(o:Order){
 if(o.status!=='paid')return false;
 const database=db();
 const {data:existing}=await database.from('commerce_notifications').select('state,created_at').eq('order_id',o.id).single();
 if(existing?.state==='sent')return true;
 // Avoid replaying a provider request beyond its idempotency retention window.
 if(existing&&Date.now()-Date.parse(existing.created_at)>23*3600000)return false;
 const {data,error}=await database.rpc('claim_commerce_notification',{p_order_id:o.id});
 if(error||!data?.length)return false;
 try{
 const key=process.env.EMAIL_PROVIDER_API_KEY,from=process.env.EMAIL_FROM;
 if(!key||!from)throw new Error('Email configuration missing');
 const receipt=paidReceipt(o);
 const response=await fetch('https://api.resend.com/emails',{method:'POST',headers:{Authorization:'Bearer '+key,'Content-Type':'application/json','Idempotency-Key':'order-confirmation/'+o.id},body:JSON.stringify({from,to:[o.email],...receipt}),signal:AbortSignal.timeout(15000)});
 if(!response.ok)throw new Error('Email provider rejected request');
 const result=await response.json();
 await database.from('commerce_notifications').update({state:'sent',provider_id:result.id,last_error:null}).eq('order_id',o.id);
 return true;
 }catch{await database.from('commerce_notifications').update({state:'failed',last_error:'Confirmation delivery requires retry.'}).eq('order_id',o.id);return false;}
}
export async function complete(o:Order,allowCapture:boolean){
 if(o.status==='paid')return {order:o,emailSent:await notifyOrder(o)};
 if(o.status!=='awaiting_payment'||!o.paypal_order_id)throw new CheckoutError('This order has not been approved for payment.',409);
 let result=await paypal('/v2/checkout/orders/'+o.paypal_order_id,o.mode);
 if(result.status==='APPROVED'&&allowCapture){
  const authentication=result.payment_source?.google_pay?.card?.authentication_result;
  if(authentication&&!['POSSIBLE','YES'].includes(authentication.liability_shift))throw new CheckoutError('Google Pay authentication could not be verified. Please choose another payment method.',409);
  if(!(o.tax_details as any).saleAgreement?.acceptedAt)throw new CheckoutError('Sale agreement acceptance is missing. Return to checkout and review your order.',409);
  try{await paypal('/v2/checkout/orders/'+o.paypal_order_id+'/capture',o.mode,'POST',{},o.id);}catch{/* Reconcile remotely before reporting an uncertain payment. */}
  result=await paypal('/v2/checkout/orders/'+o.paypal_order_id,o.mode);
 }
 const evidence=captureEvidence(result,o);
 const {error}=await db().rpc('complete_commerce_order',{p_order_id:o.id,p_paypal_id:o.paypal_order_id,p_capture_id:evidence.id,p_total_cents:evidence.total});
 if(error)throw new CheckoutError('Payment is being reconciled. Please check again; do not place another order.',503);
 const {data:paid,error:readError}=await db().from('commerce_orders').select('*').eq('id',o.id).single();if(readError||!paid)throw new CheckoutError('Payment is saved. Please check the order again.',503);
 const paidOrder=paid as Order;
 return {order:paidOrder,emailSent:await notifyOrder(paidOrder)};
}
