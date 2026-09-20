import 'server-only';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { authConfig } from '../auth-config';
export async function serverClient() {
 const jar = await cookies(); const {url,key}=authConfig();
 return createServerClient(url,key,{cookies:{getAll:()=>jar.getAll(),setAll(values){
 try {values.forEach(({name,value,options})=>jar.set(name,value,options));} catch { /* Server components cannot write cookies; proxy handles refresh. */ }
 }}});
}
