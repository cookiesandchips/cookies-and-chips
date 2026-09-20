import {authConfig} from '@/lib/auth-config';
import {redirect} from 'next/navigation';import {serverClient} from '@/lib/supabase/server';import {AuthForm} from '@/components/auth-form';
export const dynamic='force-dynamic';
export default async function Password(){try{authConfig();}catch{redirect('/auth/error');}const client=await serverClient();const {data:{user}}=await client.auth.getUser();if(!user)redirect('/auth/error');return <section className="card"><h1>Choose a new password</h1><AuthForm updatePassword/></section>}
