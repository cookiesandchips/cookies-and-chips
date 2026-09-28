'use client';
import {fulfillmentMessage} from '@/lib/checkout/fulfillment-copy';
import {useEffect,useRef,useState} from 'react';
const money=(n:number)=>'$'+(n/100).toFixed(2);
export default function PaymentReturn(){
 const [result,setResult]=useState<any>(null),[error,setError]=useState(''),[busy,setBusy]=useState(true),started=useRef(false);
 async function confirm(){setBusy(true);setError('');try{const orderId=new URLSearchParams(window.location.search).get('order');const r=await fetch('/api/checkout/capture',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({orderId})});const data=await r.json();if(!r.ok)throw new Error(data.error);if(data.status!=='paid')throw new Error('Payment is still being verified.');setResult(data);localStorage.removeItem('cc-bag-v1');}catch(e){setError((e as Error).message||'Please check your payment again.');}finally{setBusy(false);}}
 useEffect(()=>{if(!started.current){started.current=true;void confirm();}},[]);
 if(!result)return <section className="card" aria-live="polite"><h1>Confirming your payment…</h1>{busy&&<p role="status">Please wait while we verify payment and save your order.</p>}{error&&<><p role="alert" className="message">{error} Do not place a second order while this is being checked.</p><button onClick={confirm} disabled={busy}>Check payment status again</button></>}</section>;
 const a=result.fulfillment.address;
 const method=result.fulfillment.method;
 const placeLabel=method==='pickup'?'Pickup':method==='delivery'?'Local delivery':'Shipping';
 return <section className="order-confirm" aria-live="polite"><header className="order-confirm-intro"><h1>Thank you for your order</h1><p>{result.mode==='sandbox'?'Sandbox test completed — no real charge or fulfillment.':'Your payment is confirmed and your order is saved.'}</p></header>
 <article className="receipt" aria-label="Receipt"><header className="receipt-head"><p className="receipt-kicker">Paid receipt</p><p className="receipt-order">Order {result.id}</p></header>
 <ul className="receipt-items">{result.items.map((l:any)=><li key={l.id}><div><strong>{l.quantity} × {l.title}</strong><span>{l.package_count} per package</span></div><span className="receipt-amount">{money(l.quantity*l.unit_cents)}</span></li>)}</ul>
 <dl className="receipt-totals"><div><dt>Subtotal</dt><dd>{money(result.subtotal_cents)}</dd></div>{!!result.donation_cents&&<div><dt>CureSearch support</dt><dd>{money(result.donation_cents)}</dd></div>}{method!=='pickup'&&<div><dt>{placeLabel}</dt><dd>{result.shipping_cents===0?'Free':money(result.shipping_cents)}</dd></div>}<div><dt>Sales tax</dt><dd>{money(result.tax_cents)}</dd></div><div className="receipt-total"><dt>Total paid</dt><dd>{money(result.total_cents)}</dd></div></dl>
 <section className="receipt-fulfillment"><h2>{placeLabel}</h2><address>{a.name}<br/>{a.street1}{a.street2&&<><br/>{a.street2}</>}<br/>{a.city}, {a.state} {a.zip}</address><p>{fulfillmentMessage(result.fulfillment)}</p></section></article>
 <footer className="order-confirm-next"><p>{result.emailSent?'Your confirmation email has been sent.':'Your payment is saved. Your confirmation email is pending delivery.'}</p>{result.createAccount&&<p><a className="button" href="/account">Set up your account</a></p>}<a href="/#shop">Continue shopping</a></footer></section>;
}
