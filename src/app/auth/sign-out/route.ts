import {serverClient} from '@/lib/supabase/server';
export async function POST(){const client=await serverClient();await client.auth.signOut();return Response.json({ok:true},{headers:{'Cache-Control':'no-store'}});}
