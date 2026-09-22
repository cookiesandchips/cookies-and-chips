import 'server-only';
import {CheckoutError,type Address} from './core';
import {distanceMiles} from './distance';
async function coordinates(a:Address){
 const url=new URL('https://geocoding.geo.census.gov/geocoder/locations/address');
 for(const [k,v] of Object.entries({street:a.street1,city:a.city,state:a.state,zip:a.zip,benchmark:'Public_AR_Current',format:'json'}))url.searchParams.set(k,v);
 try{const response=await fetch(url,{signal:AbortSignal.timeout(15000),cache:'no-store'});if(!response.ok)throw Error();const data=await response.json();const matches=data.result?.addressMatches;if(!Array.isArray(matches)||matches.length!==1)throw Error();const c=matches[0].coordinates;if(!Number.isFinite(c?.x)||!Number.isFinite(c?.y))throw Error();return {lat:c.y,lon:c.x};}catch{throw new CheckoutError('We could not verify the delivery distance for this address. Check the address, choose pickup, or contact us.',503);}
}
export async function localDelivery(origin:Address,destination:Address){
 const [from,to]=await Promise.all([coordinates(origin),coordinates(destination)]);const miles=distanceMiles(from,to);
 if(miles>10)throw new CheckoutError('This address is outside our approximate 10-mile free-delivery area. Please choose pickup or an available shipping service.');
 return {distanceMiles:Math.round(miles*100)/100,radiusMiles:10,basis:'straight-line',verifiedAt:new Date().toISOString()};
}
