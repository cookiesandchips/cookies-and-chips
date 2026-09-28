import {serverClient} from '@/lib/supabase/server';
import {rememberHeaderAccount} from '@/lib/management/auth';
export async function POST(){const client=await serverClient();await client.auth.signOut();await rememberHeaderAccount(null).catch(()=>{});return Response.json({ok:true},{headers:{'Cache-Control':'no-store'}});}
