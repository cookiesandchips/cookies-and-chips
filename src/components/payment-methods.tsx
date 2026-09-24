'use client';
import {useEffect,useRef,useState} from 'react';
const scripts=new Map<string,Promise<void>>();
function load(src:string){let promise=scripts.get(src);if(!promise){promise=new Promise<void>((resolve,reject)=>{const s=document.createElement('script');s.src=src;s.async=true;s.onload=()=>resolve();s.onerror=()=>{scripts.delete(src);s.remove();reject(new Error('Payment buttons could not load. Please reload checkout.'));};document.head.appendChild(s);});scripts.set(src,promise);}return promise;}
function bounded<T>(promise:Promise<T>){return new Promise<T>((resolve,reject)=>{const timer=setTimeout(()=>reject(new Error('Payment options took too long to load. Please reload checkout.')),20000);promise.then(value=>{clearTimeout(timer);resolve(value);},error=>{clearTimeout(timer);reject(error);});});}
async function post(path:string,body:unknown){const r=await fetch('/api/checkout/'+path,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)});const d=await r.json();if(!r.ok)throw new Error(d.error||'Payment could not be confirmed.');return d;}
export default function PaymentMethods({order,config,onError,onBusy}:{order:any;config:any;onError:(message:string)=>void;onBusy:(busy:boolean)=>void}){
 const holder=useRef<HTMLDivElement>(null),googleHolder=useRef<HTMLDivElement>(null),callbacks=useRef({onError,onBusy});callbacks.current={onError,onBusy};
 const [loading,setLoading]=useState(true);
 useEffect(()=>{
  let disposed=false;const buttons:any[]=[];const fail=(message:string)=>{if(!disposed){callbacks.current.onError(message);callbacks.current.onBusy(false);}};
  const finish=()=>window.location.assign('/checkout/return?order='+encodeURIComponent(order.id));
  const create=async()=>{callbacks.current.onError('');callbacks.current.onBusy(true);try{const d=await post('paypal',{orderId:order.id,acceptedTerms:true,termsVersion:config.agreement.version,sdk:true});if(d.paid){finish();throw new Error('This order is already paid.');}return d.paypalOrderId;}catch(e){fail((e as Error).message);throw e;}};
  async function setup(){
   const params=new URLSearchParams({'client-id':config.paypalClientId,currency:'USD',intent:'capture',commit:'true',components:'buttons,googlepay,funding-eligibility','enable-funding':'venmo','disable-funding':'paylater,credit'});
   await bounded(load('https://www.paypal.com/sdk/js?'+params));if(disposed)return;
   const paypal=(window as any).paypal;
   for(const fundingSource of [paypal.FUNDING.PAYPAL,paypal.FUNDING.VENMO,paypal.FUNDING.CARD]){
    const button=paypal.Buttons({fundingSource,style:{layout:'vertical',label:'pay',height:48},createOrder:create,onApprove:finish,onCancel:()=>fail('Payment was cancelled. Your order has not been completed.'),onError:()=>fail('Payment could not be completed. Please retry this same order.')});
    if(button.isEligible()){const container=document.createElement('div');holder.current?.appendChild(container);buttons.push(button);await bounded(button.render(container));}
   }
   if(!disposed)setLoading(false);
   // Optional wallet: eligibility/configuration failure must not disable PayPal.
   try{
    const gp=paypal.Googlepay(),gconfig=await gp.config();await load('https://pay.google.com/gp/p/js/pay.js');if(disposed)return;
    const client=new (window as any).google.payments.api.PaymentsClient({environment:order.mode==='live'?'PRODUCTION':'TEST',paymentDataCallbacks:{onPaymentAuthorized:async(data:any)=>{
     try{const id=await create();const approval=await gp.confirmOrder({orderId:id,paymentMethodData:data.paymentMethodData});if(approval.status==='PAYER_ACTION_REQUIRED'){await gp.initiatePayerAction({orderId:id});}else if(approval.status!=='APPROVED')throw new Error('Payment has not been approved.');
      const captured=await post('capture',{orderId:order.id});if(captured.status!=='paid')throw new Error('Payment is still being verified.');return {transactionState:'SUCCESS'};
     }catch(e){const message=(e as Error).message;fail(message);return {transactionState:'ERROR',error:{intent:'PAYMENT_AUTHORIZATION',message,reason:'OTHER_ERROR'}};}
    }}});
    const base={apiVersion:2,apiVersionMinor:0,allowedPaymentMethods:gconfig.allowedPaymentMethods};const ready=await client.isReadyToPay(base);if(disposed||!ready.result)return;
    const button=client.createButton({buttonType:'pay',allowedPaymentMethods:gconfig.allowedPaymentMethods,onClick:()=>{callbacks.current.onBusy(true);client.loadPaymentData({...base,merchantInfo:gconfig.merchantInfo,transactionInfo:{currencyCode:'USD',countryCode:'US',totalPriceStatus:'FINAL',totalPrice:(order.total_cents/100).toFixed(2)},callbackIntents:['PAYMENT_AUTHORIZATION']}).then(finish).catch(()=>fail('Google Pay was cancelled or could not complete payment. Please retry this same order.'));}});googleHolder.current?.appendChild(button);
   }catch{/* Unsupported merchant/device: do not advertise an unavailable wallet. */}
  }
  setup().catch(e=>{if(!disposed)setLoading(false);fail((e as Error).message);});
  return()=>{disposed=true;for(const button of buttons)button.close().catch(()=>{});holder.current?.replaceChildren();googleHolder.current?.replaceChildren();};
 },[order.id,order.mode,order.total_cents,config.paypalClientId,config.agreement.version]);
 return <div aria-label="Secure payment methods">{loading&&<p role="status">Loading secure payment options…</p>}<div ref={holder}/><div ref={googleHolder}/><p>Available payment options depend on your device and account.</p></div>;
}
