'use client';
import {personName} from '@/lib/checkout/name';
import {fulfillmentMessage} from '@/lib/checkout/fulfillment-copy';
import {packageName} from '@/lib/checkout/display';
import {useEffect,useRef,useState} from 'react';
const money=(n:number)=>'$'+(n/100).toFixed(2);
export default function PaymentReturn(){
 const [result,setResult]=useState<any>(null),[images,setImages]=useState<Record<string,string>>({}),[error,setError]=useState(''),[busy,setBusy]=useState(true),started=useRef(false);
 async function confirm(){setBusy(true);setError('');try{const orderId=new URLSearchParams(window.location.search).get('order');const r=await fetch('/api/checkout/capture',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({orderId})});const data=await r.json();if(!r.ok)throw new Error(data.error);if(data.status!=='paid')throw new Error('Payment is still being verified.');setResult(data);localStorage.removeItem('cc-bag-v1');}catch(e){setError((e as Error).message||'Please check your payment again.');}finally{setBusy(false);}}
 useEffect(()=>{if(!started.current){started.current=true;void confirm();}},[]);
 useEffect(()=>{if(!result)return;fetch('/api/catalog').then(r=>r.json()).then(d=>{const next:Record<string,string>={};for(const p of d.products||[]){const image=p.details?.image||p.details?.defaultImage;if(p.id&&image)next[p.id]=image;}setImages(next);}).catch(()=>{});},[result]);
 if(!result)return <section className="card" aria-live="polite"><h1>Confirming your payment…</h1>{busy&&<p role="status">Please wait while we verify payment and save your order.</p>}{error&&<><p role="alert" className="message">{error} Do not place a second order while this is being checked.</p><button onClick={confirm} disabled={busy}>Check payment status again</button></>}</section>;
 const a=result.fulfillment.address;
 const method=result.fulfillment.method;
 const placeLabel=method==='pickup'?'Pickup':method==='delivery'?'Local delivery':'Shipping';
 let first='';try{first=personName(result.customerName).split(/\s+/)[0];}catch{}
 const when=result.paidAt?new Intl.DateTimeFormat('en-US',{dateStyle:'long',timeZone:'America/Phoenix'}).format(new Date(result.paidAt)):'';
 return <section className="order-confirm" aria-live="polite"><header className="confirm-hero"><p className="confirm-mark" aria-hidden="true">✓</p><h1>{first?`Thank you, ${first}!`:'Thank you!'}</h1><p>{result.mode==='sandbox'?'Sandbox test completed — no real charge or fulfillment.':method==='pickup'?'We’ve received your order and will get it ready soon.':'Your cookies are officially on the way.'}</p></header>
 <article className="confirm-card"><header className="confirm-order"><div><p className="receipt-kicker">Order</p><p className="receipt-order">#{result.id.slice(0,8)}</p></div>{when&&<p>{when}</p>}</header>
 <ul className="confirm-items">{result.items.map((l:any)=><li key={l.id}><img src={images[l.id]||'/brand/logo.png'} alt=""/><div><strong>{l.title}</strong><span>{packageName(l.quantity,l.package_count)}</span></div><span>{money(l.quantity*l.unit_cents)}</span></li>)}</ul>
 <dl className="receipt-totals"><div><dt>Subtotal</dt><dd>{money(result.subtotal_cents)}</dd></div>{!!result.donation_cents&&<div><dt>CureSearch donation</dt><dd>{money(result.donation_cents)}</dd></div>}<div><dt>{placeLabel}</dt><dd>{method==='pickup'||result.shipping_cents===0?'Free':money(result.shipping_cents)}</dd></div><div><dt>Tax</dt><dd>{money(result.tax_cents)}</dd></div><div className="receipt-total"><dt>Total</dt><dd>{money(result.total_cents)}</dd></div></dl>
 <section className="confirm-next"><h2>{method==='pickup'?'Pickup in Buckeye, Arizona':placeLabel}</h2>{method!=='pickup'&&<address>{a.name}<br/>{a.street1}{a.street2&&<><br/>{a.street2}</>}<br/>{a.city}, {a.state} {a.zip}</address>}<p>{method==='pickup'?'We’ll email you pickup instructions after your order is ready.':fulfillmentMessage(result.fulfillment)}</p>{method==='shipping'&&<p><a href={'/track/'+result.id}>Track your order</a></p>}<p>{result.emailSent?`A receipt has been sent to ${result.email}.`:'Your payment is saved. Your confirmation email is pending delivery.'}</p></section></article>
 <footer className="confirm-actions">{result.createAccount&&<p>Save your information for faster checkout next time. <a href="/account">Create your account</a></p>}<a className="button" href="/#shop">Continue shopping</a><a href="/account#orders">View my orders</a></footer></section>;
}
