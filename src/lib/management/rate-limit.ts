import 'server-only';
import {createHmac} from 'node:crypto';
import {db} from '@/lib/checkout/server';
import {CheckoutError} from '@/lib/checkout/core';
export async function limit(request:Request,purpose:string,count:number){const ip=request.headers.get('x-forwarded-for')?.split(',')[0].trim()||'local';const key=process.env.SUPABASE_SECRET_KEY;if(!key)throw new CheckoutError('Service unavailable.',503);const bucket=createHmac('sha256',key).update(purpose+':'+ip).digest('hex');const {data,error}=await db().rpc('commerce_allow_request',{p_bucket:bucket,p_limit:count});if(error)throw error;if(data!==true)throw new CheckoutError('Too many attempts. Please try again later.',429);}
