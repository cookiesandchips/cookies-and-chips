import { serverClient } from '@/lib/supabase/server';
import { authConfig } from '@/lib/auth-config';
import {CustomerDashboard} from '@/components/customer-dashboard';
import { AuthForm } from '@/components/auth-form';
export const dynamic='force-dynamic';
export default async function Account(){
 try {authConfig();} catch {return <section className="card"><h1>My account</h1><p>Account setup is being completed. Please check back shortly.</p></section>}
 const client=await serverClient();const {data:{user}}=await client.auth.getUser();
 if(user)return <section className="account-signed-in"><div className="account-heading"><div><p className="eyebrow">Your little corner of the bakery</p><h1>Welcome back.</h1><p>{user.email}</p></div><AuthForm signedIn/></div><CustomerDashboard/></section>;
 return <section className="account-entry"><div className="account-welcome"><img src="/brand/logo.png" width="104" height="104" alt="Cookies & Chips"/><p className="eyebrow">A little sweetness, just for you</p><h1>Good cookies.<br/>Brighter days.</h1><p>Your favorites, your orders, and a little more joy from our kitchen.</p><div className="account-benefits"><p>♡ Keep track of your orders</p><p>♡ Save your delivery addresses</p><p>♡ Order your favorites again</p></div><a href="/#shop">Just browsing? Shop cookies →</a></div><div className="account-form-panel"><h2>Your cookie account.</h2><p className="auth-intro">Sign in or create your account. Guest checkout is always available.</p><AuthForm/></div></section>;
}
