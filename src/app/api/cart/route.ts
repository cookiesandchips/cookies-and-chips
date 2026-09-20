import {body,db,failure} from '@/lib/checkout/server';
import {cart,priceCart} from '@/lib/checkout/core';
import {cartOwner as owner} from '@/lib/management/auth';
export async function GET(){try{const key=await owner();const {data,error}=await db().from('commerce_carts').select('items').eq('owner_key',key).maybeSingle();if(error)throw error;return Response.json({items:data?.items||[]},{headers:{'Cache-Control':'no-store'}});}catch(e){return failure(e);}}
export async function POST(r:Request){try{const input=await body(r),key=await owner(),items=Array.isArray(input.items)&&input.items.length===0?[]:cart(input.items);if(items.length){const {data,error}=await db().from('commerce_products').select('*').in('id',items.map(i=>i.id));if(error)throw error;priceCart(items,data||[]);}const {error}=await db().from('commerce_carts').upsert({owner_key:key,items,updated_at:new Date().toISOString()});if(error)throw error;return Response.json({saved:true});}catch(e){return failure(e);}}
