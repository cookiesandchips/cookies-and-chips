import 'server-only';
import {db,type Order} from './server';
import {paypal,captureEvidence} from './providers';
import {CheckoutError,money} from './core';
const escape=(s:string)=>s.replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]!));
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
 const sandbox=o.mode==='sandbox';
 const lines=o.items.map(l=>`${l.quantity} × ${l.title} (${l.package_count} per package) — $${money(l.quantity*l.unit_cents)}`).join('\n');
 const text=`${sandbox?'SANDBOX TEST — no real charge or fulfillment\n\n':''}Thank you, ${o.customer_name}!\n\nYour Cookies & Chips order is confirmed.\nOrder: ${o.id}\n\n${lines}\n\nSubtotal: $${money(o.subtotal_cents)}\nShipping: $${money(o.shipping_cents)}\nTax: $${money(o.tax_cents)}\nTotal: $${money(o.total_cents)}\n\nFulfillment: ${o.fulfillment.method}\n${o.fulfillment.method==='pickup'?`Pickup location: ${o.fulfillment.address.street1}, ${o.fulfillment.address.city}, ${o.fulfillment.address.state} ${o.fulfillment.address.zip}. Pickup is by appointment; we will contact you when your order is ready.`:'We will contact you with shipping details when your order is dispatched.'}\n\nBaked with love,\nCookies & Chips`;
 const response=await fetch('https://api.resend.com/emails',{method:'POST',headers:{Authorization:'Bearer '+key,'Content-Type':'application/json','Idempotency-Key':'order-confirmation/'+o.id},body:JSON.stringify({from,to:[o.email],subject:(sandbox?'[Sandbox] ':'')+'Your Cookies & Chips order is confirmed',text,html:`<div style="background:#fff9f0;padding:32px;color:#4a2a1d;font:16px/1.6 Arial,sans-serif;max-width:600px;margin:auto"><h1>Cookies &amp; Chips</h1><div style="white-space:pre-line">${escape(text)}</div></div>`}),signal:AbortSignal.timeout(15000)});
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
  try{await paypal('/v2/checkout/orders/'+o.paypal_order_id+'/capture',o.mode,'POST',{},o.id);}catch{/* Reconcile remotely before reporting an uncertain payment. */}
  result=await paypal('/v2/checkout/orders/'+o.paypal_order_id,o.mode);
 }
 const evidence=captureEvidence(result,o);
 const {error}=await db().rpc('complete_commerce_order',{p_order_id:o.id,p_paypal_id:o.paypal_order_id,p_capture_id:evidence.id,p_total_cents:evidence.total});
 if(error)throw new CheckoutError('Payment is being reconciled. Please check again; do not place another order.',503);
 const paid={...o,status:'paid',paypal_capture_id:evidence.id};
 return {order:paid,emailSent:await notifyOrder(paid)};
}
