import { serverClient } from '@/lib/supabase/server';
import { authConfig } from '@/lib/auth-config';
import { AuthForm } from '@/components/auth-form';
export const dynamic='force-dynamic';
export default async function Account(){
 try {authConfig();} catch {return <section className="card"><h1>My account</h1><p>Account setup is being completed. Please check back shortly.</p></section>}
 const client=await serverClient();const {data:{user}}=await client.auth.getUser();
 return <section className="card"><h1>{user?'Welcome back':'Your cookie account'}</h1>{user?<><p>Signed in as {user.email}.</p><p>Your order history will appear here once the shop opens.</p><AuthForm signedIn /></>:<><p>Create an account to keep track of your future orders. Guest checkout will also be available when the shop opens.</p><AuthForm /></>}</section>
}
