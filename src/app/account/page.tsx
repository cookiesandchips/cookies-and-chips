import { serverClient } from '@/lib/supabase/server';
import { authConfig } from '@/lib/auth-config';
import {CustomerDashboard} from '@/components/customer-dashboard';
import { AuthForm } from '@/components/auth-form';
export const dynamic='force-dynamic';
export default async function Account(){
 try {authConfig();} catch {return <section className="card"><h1>My account</h1><p>Account setup is being completed. Please check back shortly.</p></section>}
 const client=await serverClient();const {data:{user}}=await client.auth.getUser();
 return <section className="card"><h1>{user?'Welcome back':'Your cookie account'}</h1>{user?<><p>Signed in as {user.email}.</p><CustomerDashboard/><AuthForm signedIn /></>:<><p>Sign in to see your orders and saved addresses, or create an account. You can also check out as a guest.</p><AuthForm /></>}</section>
}
