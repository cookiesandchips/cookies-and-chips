import {money,type Address} from './core';
const SITE='https://www.cookiesandchips.com';
export function trackingUrl(id:string){return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)?`${SITE}/track/${id}`:'';}
export type TrackingState='done'|'current'|'upcoming';
export type TrackingStep={label:string;state:TrackingState};
export function trackingSteps(input:{trackingNumber?:string;status?:string}){
 const status=(input.status||'').toUpperCase();
 const delivered=status==='DELIVERED';
 const labeled=!!input.trackingNumber||status==='PRE_TRANSIT'||status==='TRANSIT'||delivered;
 const doneCount=delivered?4:labeled?2:1;
 return ['Order placed','Shipping label created','On the way','Delivered'].map((label,index)=>({label,state:(index<doneCount?'done':index===doneCount?'current':'upcoming') as TrackingState}));
}
export function readShippoTracking(payload:unknown,provider=''){
 const transactions=Array.isArray((payload as {transactions?:unknown})?.transactions)?(payload as {transactions:unknown[]}).transactions:[];
 const records=transactions.filter((item):item is Record<string,unknown>=>!!item&&typeof item==='object');
 const chosen=records.find(item=>typeof item.tracking_number==='string'&&item.tracking_number)||records[0];
 if(!chosen)return null;
 const rawStatus=chosen.tracking_status;
 const status=typeof rawStatus==='string'?rawStatus:typeof rawStatus==='object'&&rawStatus&&typeof (rawStatus as {status?:unknown}).status==='string'?(rawStatus as {status:string}).status:'';
 const given=typeof chosen.tracking_url_provider==='string'&&chosen.tracking_url_provider.startsWith('https://')?chosen.tracking_url_provider:'';
 const trackingNumber=typeof chosen.tracking_number==='string'?chosen.tracking_number.trim().slice(0,40):'';
 const trackingUrl=given||(trackingNumber&&/usps/i.test(provider)?`https://tools.usps.com/go/TrackConfirmAction?tLabels=${encodeURIComponent(trackingNumber)}`:'');
 if(!trackingNumber&&!trackingUrl&&!status)return null;
 return {trackingNumber,trackingUrl,status:status.toUpperCase().slice(0,40)};
}
type Parcel={length:string;width:string;height:string;weight:string;distance_unit:string;mass_unit:string};
export function shippoOrderBody(input:{id:string;email:string;customerName:string;paidAt:string|null;items:{id:string;title:string;quantity:number;unit_cents:number}[];subtotal_cents:number;shipping_cents:number;tax_cents:number;total_cents:number;origin:Address;destination:Address;service?:string;parcels:Parcel[]}){
 const ounces=input.parcels.reduce((sum,parcel)=>sum+Number(parcel.weight),0);
 const weight=Number.isFinite(ounces)&&ounces>0?String(Math.round(ounces*100)/100):'';
 const boxes=input.parcels.map(parcel=>`${parcel.length} × ${parcel.width} × ${parcel.height} in, ${parcel.weight} oz`).join('; ');
 const destination=input.destination;
 const origin=input.origin;
 return {
  from_address:{name:origin.name,company:'Cookies & Chips',street1:origin.street1,...(origin.street2?{street2:origin.street2}:{}),city:origin.city,state:origin.state,zip:origin.zip,country:'US',...(origin.phone?{phone:origin.phone}:{})},
  to_address:{name:destination.name||input.customerName,street1:destination.street1,...(destination.street2?{street2:destination.street2}:{}),city:destination.city,state:destination.state,zip:destination.zip,country:'US',email:input.email,...(destination.phone?{phone:destination.phone}:{})},
  line_items:input.items.map(item=>({quantity:item.quantity,sku:item.id,title:item.title,total_price:money(item.unit_cents*item.quantity),currency:'USD'})),
  placed_at:input.paidAt&&!Number.isNaN(Date.parse(input.paidAt))?new Date(input.paidAt).toISOString():new Date().toISOString(),
  order_number:input.id.slice(0,8),
  order_status:'PAID',
  shipping_cost:money(input.shipping_cents),
  shipping_cost_currency:'USD',
  shipping_method:(input.service||'Shipping').slice(0,120),
  subtotal_price:money(input.subtotal_cents),
  total_price:money(input.total_cents),
  total_tax:money(input.tax_cents),
  currency:'USD',
  ...(weight?{weight,weight_unit:'oz'}:{}),
  notes:`Cookies & Chips order ${input.id}. ${boxes?`Pack: ${boxes}.`:''}`.trim().slice(0,500),
 };
}
