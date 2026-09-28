import {notFound} from 'next/navigation';
import {publicTracking} from '@/lib/checkout/shippo-fulfillment';
export const dynamic='force-dynamic';
export const metadata={title:'Track your order | Cookies & Chips'};
export default async function TrackOrder({params}:{params:Promise<{id:string}>}){
 const {id}=await params;
 const order=await publicTracking(id);
 if(!order)notFound();
 return <section className="order-confirm"><header className="order-confirm-intro"><p className="eyebrow">Cookies & Chips</p><h1>Track your order</h1><p>Order {order.id.slice(0,8)}{order.city?` · ${order.city}, ${order.state}`:''}</p></header>
 <article className="receipt" aria-label="Shipment progress">{order.sandbox&&<p>Sandbox test shipment.</p>}<ol className="tracking-steps">{order.steps.map(step=><li key={step.label} className={step.state}><span>{step.label}</span></li>)}</ol>
 {order.trackingUrl?<p><a className="button" href={order.trackingUrl}>Follow the package</a></p>:<p>Your payment is confirmed. Carrier tracking appears here when the shipping label is created, and this page follows the package through delivery.</p>}
 {order.trackingNumber&&<p>Tracking number {order.trackingNumber}</p>}
 <h2>In this shipment</h2><ul className="receipt-items">{order.items.map((item,index)=><li key={index}><strong>{item.quantity} × {item.title}</strong></li>)}</ul></article></section>;
}
