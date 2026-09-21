import {integrationConfig,paymentCredentials} from '@/lib/management/integrations';
import {db,failure,type Order} from '@/lib/checkout/server';
import {paypal} from '@/lib/checkout/providers';
import {complete} from '@/lib/checkout/complete';
import {CheckoutError} from '@/lib/checkout/core';
export async function POST(request:Request){try{
 const raw=await request.text();if(raw.length>100000)throw new CheckoutError('Payload too large.',413);const event=JSON.parse(raw);
 const relatedId=event.resource?.supplementary_data?.related_ids?.order_id;
 let matchingOrder:Order|null=null;if(typeof relatedId==='string'&&relatedId.length<=100){const {data,error}=await db().from('commerce_orders').select('*').eq('paypal_order_id',relatedId).maybeSingle();if(error)throw error;matchingOrder=data as Order|null;}
 const mode=matchingOrder?.mode||(await integrationConfig()).paymentMode;const credentials=await paymentCredentials(mode);
 if(!credentials.webhook||!['sandbox','live'].includes(mode||''))throw new CheckoutError('Webhook not configured.',503);
 const verification=await paypal('/v1/notifications/verify-webhook-signature',mode as 'sandbox'|'live','POST',{auth_algo:request.headers.get('paypal-auth-algo'),cert_url:request.headers.get('paypal-cert-url'),transmission_id:request.headers.get('paypal-transmission-id'),transmission_sig:request.headers.get('paypal-transmission-sig'),transmission_time:request.headers.get('paypal-transmission-time'),webhook_id:credentials.webhook,webhook_event:event});
 if(verification.verification_status!=='SUCCESS')throw new CheckoutError('Invalid signature.',401);
 if(event.event_type==='PAYMENT.CAPTURE.COMPLETED'){
 const id=event.resource?.supplementary_data?.related_ids?.order_id;
 if(typeof id!=='string')throw new CheckoutError('Missing payment reference.');
 const {data,error}=await db().from('commerce_orders').select('*').eq('paypal_order_id',id).eq('mode',mode).single();
 if(error||!data)throw new CheckoutError('Order not found.',404);
 const result=await complete(data as Order,false);if(!result.emailSent)throw new CheckoutError('Email delivery pending retry.',503);
 }
 return Response.json({received:true});
 }catch(error){return failure(error);}}
