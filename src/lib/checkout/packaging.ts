import {CheckoutError,parcels,type Line} from './core';
export type ParcelConfig={length:number;width:number;height:number;emptyWeight:number;itemWeight:number;maxItems:number};
export function validateParcel(value:unknown):ParcelConfig {
 const source=value as Record<string,unknown>|undefined;
 const result={} as ParcelConfig;
 for(const field of ['length','width','height','emptyWeight','itemWeight','maxItems'] as const){
  const n=Number(source?.[field]);
  if(!Number.isFinite(n)||n<=0||n>1000||(field==='maxItems'&&!Number.isInteger(n)))throw new CheckoutError('Enter positive package dimensions, weights, and a whole-number capacity.');
  result[field]=n;
 }
 return result;
}
export function configuredParcels(lines:Line[],config?:ParcelConfig,profiles:Record<string,ParcelConfig>={}){
 if(!lines.length)throw new CheckoutError('Add a product to your bag.');
 const count=lines.reduce((sum,line)=>sum+line.quantity*line.package_count,0);
 if(!Number.isSafeInteger(count)||count<=0||lines.some(line=>!Number.isInteger(line.quantity)||line.quantity<=0||!Number.isInteger(line.package_count)||line.package_count<=0))throw new CheckoutError('Product packaging needs attention. Please contact us.');
 if(count>240)throw new CheckoutError('Please contact us to arrange shipping for this large order.');
 const groups=new Map<string,Line[]>();
 for(const line of lines)groups.set(line.product_type,[...(groups.get(line.product_type)||[]),line]);
 const result=[];
 // Different product types travel in separate boxes; never assume they share packing rules.
 for(const [type,items] of groups){
  const profile=Object.hasOwn(profiles,type)?profiles[type]:type==='human-cookie'?config:undefined;
  if(!profile){
   if(type==='human-cookie'){result.push(...parcels(items));continue;}
   throw new CheckoutError(`Shipping is not yet available for ${items.map(item=>item.title).join(', ')}. Please choose pickup or contact us to arrange delivery.`);
  }
  const box=validateParcel(profile);
  let remaining=items.reduce((sum,line)=>sum+line.quantity*line.package_count,0);
  while(remaining>0){const units=Math.min(remaining,box.maxItems);result.push({length:String(box.length),width:String(box.width),height:String(box.height),distance_unit:'in',weight:String(units*box.itemWeight+box.emptyWeight),mass_unit:'oz'});remaining-=units;}
 }
 return result;
}
