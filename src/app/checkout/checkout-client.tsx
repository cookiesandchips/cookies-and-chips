'use client';
import PaymentMethods from '@/components/payment-methods';
import StateSelect from '@/components/state-select';
import {packageName} from '@/lib/checkout/display';
import {useEffect,useRef,useState} from 'react';
const amount=(n:number)=>'$'+(n/100).toFixed(2);
const emailReady=(value:string)=>/^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/.test(value);
const zipReady=(value:string)=>/^\d{5}(-\d{4})?$/.test(value);
async function api(path:string,input?:unknown){const r=await fetch('/api/checkout/'+path,{...(input?{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(input)}:{}),cache:'no-store'});const data=await r.json();if(!r.ok)throw new Error(data.error||'Please try again.');return data;}
function TermsDialog({title,text,onClose}:{title:string;text:string;onClose:()=>void}){
 const ref=useRef<HTMLDialogElement>(null);
 useEffect(()=>{const prior=document.activeElement as HTMLElement|null;ref.current?.showModal();return()=>prior?.focus();},[]);
 return <dialog ref={ref} className="terms-modal" aria-labelledby="terms-title" onCancel={e=>{e.preventDefault();onClose();}}><header><h2 id="terms-title">{title}</h2><button type="button" onClick={onClose}>Close</button></header><div className="sale-terms" tabIndex={0}>{text}</div></dialog>;
}
function linesFrom(bag:Record<string,number>){return Object.entries(bag).filter(([,q])=>Number.isInteger(q)&&q>0).map(([id,quantity])=>({id,quantity}));}
export default function Checkout({initialConfig=null,initialBag={},initialAccount=undefined}:{initialConfig?:any;initialBag?:Record<string,number>;initialAccount?:any}){
 const [config,setConfig]=useState<any>(initialConfig),[bag,setBag]=useState<Record<string,number>>(initialBag),[error,setError]=useState(''),[busy,setBusy]=useState(false),[pricing,setPricing]=useState(false),[stage,setStage]=useState<'information'|'payment'>('information');
 const [rates,setRates]=useState<any[]>([]),[rateToken,setRate]=useState(''),[order,setOrder]=useState<any>(null),[acceptedTerms,setAcceptedTerms]=useState(false),[termsOpen,setTermsOpen]=useState(false),[cureOpen,setCureOpen]=useState(false),[promoOpen,setPromoOpen]=useState(false),[appliedCode,setAppliedCode]=useState('');
 const errorRef=useRef<HTMLParagraphElement>(null),requestId=useRef(0),quoteTimer=useRef<ReturnType<typeof setTimeout>|null>(null),calculateRef=useRef<(advance:boolean)=>Promise<void>>(async()=>{});
 const [addresses,setAddresses]=useState<any[]>(initialAccount?.addresses||[]),[account,setAccount]=useState<any>(initialConfig?initialAccount??null:undefined);
 const [details,setDetails]=useState({name:'',email:'',donation:false,discountCode:'',method:'pickup',street1:'',street2:'',city:'',state:'AZ',zip:''});
 useEffect(()=>{if(error){errorRef.current?.focus({preventScroll:true});errorRef.current?.scrollIntoView({block:'center'});}},[error]);
 useEffect(()=>{if(initialConfig){if(initialAccount){const saved=initialAccount.addresses?.length===1?initialAccount.addresses[0].address:null;setDetails(v=>({...v,name:v.name||initialAccount.name||'',email:initialAccount.email,...(saved?{street1:saved.street1||'',street2:saved.street2||'',city:saved.city||'',state:saved.state||'AZ',zip:saved.zip||''}:{})}));}return;}api('config').then(setConfig).catch(e=>setError(e.message));fetch('/api/cart',{cache:'no-store'}).then(async r=>{const d=await r.json();if(!r.ok)throw Error(d.error);setBag(Object.fromEntries(d.items.map((i:any)=>[i.id,i.quantity])));}).catch(e=>setError(e.message));fetch('/api/account',{cache:'no-store'}).then(async r=>{if(r.status===401)return null;const d=await r.json();if(!r.ok)throw Error(d.error||'Could not check your account. Please reload checkout.');return d;}).then(d=>{setAccount(d);if(d){const saved=d.addresses?.length===1?d.addresses[0].address:null;setDetails(v=>({...v,name:v.name||d.name||'',email:d.email,...(saved?{street1:saved.street1||'',street2:saved.street2||'',city:saved.city||'',state:saved.state||'AZ',zip:saved.zip||''}:{})}));setAddresses(d.addresses||[]);}}).catch(e=>setError(e.message));},[]);
 useEffect(()=>{if(config&&!config.pickupEnabled)setDetails(v=>v.method==='pickup'?{...v,method:'shipping'}:v);},[config]);
 function edit(key:string,value:unknown){setError('');setAcceptedTerms(false);setTermsOpen(false);setDetails(d=>({...d,[key]:value}));if(key==='discountCode')return;setOrder(null);if(key==='method'||['street1','street2','city','state','zip'].includes(key)){setRate('');setRates([]);}}
 const items=linesFrom(bag);
 const bagSubtotal=items.reduce((sum,l)=>sum+(config?.products.find((p:any)=>p.id===l.id)?.price_cents||0)*l.quantity,0);
 const mode=order?.mode||config?.mode;
 const method=order?.fulfillment?.method||(details.method==='pickup'?'pickup':'shipping');
 const shipLabel=method==='delivery'?'Local delivery':method==='pickup'?'Pickup':'Shipping';
 const addressReady=details.street1.trim().length>=3&&details.city.trim().length>0&&/^[A-Z]{2}$/.test(details.state)&&zipReady(details.zip);
 const identityReady=emailReady(details.email)&&details.name.trim().length>0;
 const canShip=!!(config?.deliveryEnabled||config?.shippingEnabled);
 const canPickup=!!config?.pickupEnabled;
 const signature=[details.email,details.name,details.method,details.street1,details.city,details.state,details.zip,details.donation,appliedCode,rateToken,items.map(l=>l.id+':'+l.quantity).join(),account===undefined?'loading':'ready'].join('|');
 async function calculate(advance:boolean){
  if(quoteTimer.current){clearTimeout(quoteTimer.current);quoteTimer.current=null;}
  const id=++requestId.current;setPricing(true);setError('');
  try{
   const result=await api('quote',{...details,discountCode:advance?details.discountCode:appliedCode,createAccount:!account,items,rateToken,address:{...details,name:details.name,country:'US'}});
   if(id!==requestId.current)return;
   if(result.rates){setRates(result.rates);setOrder(null);if(advance)setError('Choose a shipping service to continue.');return;}
   setOrder(result.order);if(advance)setStage('payment');
  }catch(e){if(id===requestId.current)setError((e as Error).message);}finally{if(id===requestId.current)setPricing(false);}
 }
 calculateRef.current=calculate;
 useEffect(()=>{
  if(!config||account===undefined||!items.length||!identityReady)return;
  if(details.method!=='pickup'&&!addressReady)return;
  quoteTimer.current=setTimeout(()=>{void calculateRef.current(false);},600);
  return()=>{if(quoteTimer.current)clearTimeout(quoteTimer.current);};
 },[signature,config,identityReady,addressReady,details.method,items.length,account]);
 async function quantity(id:string,value:number){const next={...bag};if(value<=0)delete next[id];else next[id]=Math.min(value,20);setAcceptedTerms(false);setOrder(null);setError('');try{const r=await fetch('/api/cart',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({items:linesFrom(next)})});const d=await r.json();if(!r.ok)throw Error(d.error||'Could not save bag.');setBag(next);}catch(e){setError((e as Error).message);}}
 const discountCents=order?Math.max(0,bagSubtotal-order.subtotal_cents):0;
 const donationCents=order?order.donation_cents||0:details.donation?100:0;
 const knownTotal=order?order.total_cents:bagSubtotal+donationCents;
 return <div className="checkout-page"><header className="checkout-top"><div><p className="eyebrow">Your bag</p><h1>{stage==='payment'?'Payment':'Checkout'}</h1><p className="checkout-lead">{stage==='payment'?'Choose how you’d like to pay.':'Almost there. Tell us where to send your cookies.'}</p></div><p className="checkout-secure">Secure checkout</p></header>
 {stage==='payment'&&<button type="button" className="text-button checkout-back" onClick={()=>{setStage('information');setAcceptedTerms(false);}}>← Back to information</button>}
 {account===null&&stage==='information'&&<p className="checkout-signin">Already have an account? <a href="/account">Sign in</a></p>}
 {account&&<p className="checkout-signin">Signed in as {account.email}</p>}
 {mode==='sandbox'&&<p className="message checkout-mode">Test checkout — no real charge or fulfillment.</p>}
 {error&&<p id="checkout-error" ref={errorRef} tabIndex={-1} role="alert" className="message checkout-error">{error}</p>}
 {!config&&!error&&<p role="status">Loading checkout…</p>}
 {config&&!items.length&&<p>Your bag is empty. <a href="/#shop">Shop cookies</a></p>}
 {config&&items.length>0&&<form className="checkout-columns" onSubmit={e=>{e.preventDefault();if(stage==='information')void calculate(true);}}><div className="checkout-details">
 {stage==='information'?<div className="checkout-sections"><section><h2>1. Contact</h2><label htmlFor="email">Email address</label><input disabled={busy} id="email" type="email" required readOnly={!!account} autoComplete="email" value={details.email} onChange={e=>edit('email',e.target.value)}/></section>
 <section><h2>2. How would you like your cookies?</h2><div className="fulfillment-options" role="radiogroup" aria-label="Fulfillment">{canShip&&<button type="button" className="fulfillment-option" aria-pressed={details.method!=='pickup'} onClick={()=>edit('method','shipping')}><strong>Ship to me</strong><span>Calculate shipping at checkout</span></button>}{canPickup&&<button type="button" className="fulfillment-option" aria-pressed={details.method==='pickup'} onClick={()=>edit('method','pickup')}><strong>Pickup in Buckeye</strong><span>Free</span></button>}</div>
 {details.method==='pickup'?<p className="checkout-note">Pickup in Buckeye, Arizona. We’ll email pickup instructions after your order is confirmed.</p>:<p className="checkout-note">{config.deliveryEnabled?'Nearby addresses are local delivery. Other US addresses get carrier shipping.':'Shipping is calculated from your address.'}</p>}</section>
 <section><h2>3. Your details</h2><label htmlFor="name">Full name</label><input disabled={busy} id="name" required autoComplete="name" value={details.name} onChange={e=>edit('name',e.target.value)}/>
 {details.method!=='pickup'&&<>{addresses.length>0&&<label>Use a saved address<select disabled={busy} defaultValue="" onChange={e=>{const a=addresses.find(a=>a.id===e.target.value)?.address;if(a){setAcceptedTerms(false);setOrder(null);setRate('');setRates([]);setDetails(d=>({...d,street1:a.street1||'',street2:a.street2||'',city:a.city||'',state:a.state||'AZ',zip:a.zip||''}));}}}><option value="">Choose saved address</option>{addresses.map(a=><option key={a.id} value={a.id}>{a.address.street1}, {a.address.city}</option>)}</select></label>}{(['street1','street2','city','state','zip'] as const).map(k=><div key={k}><label htmlFor={k}>{{street1:'Street address',street2:'Apartment / suite (optional)',city:'City',state:'State',zip:'ZIP code'}[k]}</label>{k==='state'?<StateSelect disabled={busy} id={k} required value={details[k]} onChange={e=>edit(k,e.target.value)}/>:<input disabled={busy} id={k} required={k!=='street2'} autoComplete={{street1:'address-line1',street2:'address-line2',city:'address-level2',zip:'postal-code'}[k]} value={details[k]} onChange={e=>edit(k,e.target.value)}/>}</div>)}{rates.length>0&&<fieldset className="rate-options"><legend>Shipping service</legend>{rates.map(r=><label key={r.id} className="rate-option"><input type="radio" name="rate" required checked={rateToken===r.token} onChange={()=>{setError('');setOrder(null);setAcceptedTerms(false);setRate(r.token);}}/><span><strong>{r.provider} · {r.service}</strong><span>{amount(r.amount_cents)}{r.estimated_days?` · about ${r.estimated_days} days`:''}</span></span></label>)}</fieldset>}</>}
 {details.method==='pickup'&&<p className="checkout-note">Address is not required for pickup.</p>}</section></div>
 :<section className="checkout-pay" aria-live="polite"><h2>Payment</h2><p className="checkout-note">Place order · {order?amount(order.total_cents):'…'}</p><label className="checkbox-label"><input disabled={busy||pricing} type="checkbox" checked={acceptedTerms} onChange={e=>setAcceptedTerms(e.target.checked)}/><span>I agree to the <button type="button" className="text-button" onClick={()=>setTermsOpen(true)}>Terms & Conditions of Sale</button>, including the potential-allergen and freshness information.</span></label>{!order||pricing?<p role="status">Updating your total…</p>:acceptedTerms?<PaymentMethods order={order} config={config} onError={setError} onBusy={setBusy}/>:<p>Accept the sale terms to pay.</p>}</section>}
 </div>
 <aside className="card checkout-summary" aria-label="Order summary"><h2>Your order</h2>{items.map(l=>{const p=config.products.find((p:any)=>p.id===l.id);const priced=order?.items?.find((i:any)=>i.id===l.id);const unit=priced?.unit_cents??p?.price_cents??0;return <div key={l.id} className="checkout-item"><img src={p?.image||'/brand/logo.png'} alt=""/><div><strong>{p?.title||'Cookie'}</strong><p>{p?`${packageName(1,p.package_count)} · ${amount(p.price_cents)}`:''}</p><label className="checkout-quantity">Qty<select disabled={busy} value={l.quantity} aria-label={'Quantity for '+(p?.title||'product')} onChange={e=>quantity(l.id,Number(e.target.value))}><option value={0}>Remove</option>{Array.from({length:20},(_,i)=><option key={i+1} value={i+1}>{packageName(i+1,p?.package_count||12)}</option>)}</select></label></div><span className="checkout-line-price">{amount(unit*l.quantity)}</span></div>;})}
 <div className="promo-row">{promoOpen||appliedCode?<><label htmlFor="discount" className="visually-hidden">Promo code</label><input id="discount" placeholder="Promo code" value={details.discountCode} onChange={e=>edit('discountCode',e.target.value)}/><button type="button" onClick={()=>setAppliedCode(details.discountCode.trim())}>Apply</button></>:<button type="button" className="text-button" onClick={()=>setPromoOpen(true)}>Add a promo code</button>}</div>
 {config.supportAvailable&&<label className="checkbox-label cure-option"><input type="checkbox" checked={details.donation} disabled={busy} onChange={e=>{setOrder(null);setAcceptedTerms(false);setDetails(d=>({...d,donation:e.target.checked}));}}/><span>Add $1 to support <button type="button" className="text-button" onClick={()=>setCureOpen(true)}>CureSearch</button></span></label>}
 <dl className="checkout-costs" aria-label="Order costs" aria-live="polite"><div><dt>Subtotal</dt><dd>{amount(order?order.subtotal_cents:bagSubtotal)}</dd></div>{discountCents>0&&<div><dt>Discount</dt><dd>−{amount(discountCents)}</dd></div>}<div><dt>{shipLabel}</dt><dd>{method==='pickup'?'Free':order?order.shipping_cents===0?'Free':amount(order.shipping_cents):pricing?'Updating…':'Calculated'}</dd></div>{donationCents>0&&<div><dt>CureSearch donation</dt><dd>{amount(donationCents)}</dd></div>}<div><dt>Tax</dt><dd>{order?amount(order.tax_cents):pricing?'Updating…':'Calculated'}</dd></div><div className="checkout-grand"><dt>Total</dt><dd>{order?amount(order.total_cents):pricing?'Updating…':'Calculated'}</dd></div></dl>
 {!order&&method!=='pickup'&&<p className="checkout-note">Shipping and tax are added when your address and shipping service are ready.</p>}
 {pricing&&<p className="checkout-note" role="status">Updating your total…</p>}
 {stage==='information'&&<button className="checkout-continue" disabled={busy||pricing||account===undefined} type="submit">{pricing?'Updating total…':'Continue to payment →'}</button>}
 {stage==='payment'&&<p className="checkout-note">Use the payment options to place this order for {amount(order?.total_cents||knownTotal)}.</p>}
 <p className="pay-note">PayPal · Venmo · Card · Google Pay</p>
 <a className="checkout-back" href="/#shop">← Continue shopping</a></aside></form>}
 {termsOpen&&<TermsDialog title="Terms & Conditions of Sale" text={config.agreement.text} onClose={()=>setTermsOpen(false)}/>}
 {cureOpen&&<TermsDialog title="CureSearch" text="Add $1 to this order to support childhood cancer research through CureSearch. Cookies & Chips collects it with your payment and shows it in the total." onClose={()=>setCureOpen(false)}/>}
 <ol className="checkout-progress" aria-label="Checkout progress"><li aria-current={stage==='information'?'step':undefined}>1. Information & delivery</li><li aria-current={stage==='payment'?'step':undefined}>2. Payment</li><li>3. Order confirmation</li></ol></div>;
}
