'use client';
import {useState,type FormEvent} from 'react';
import {useRouter} from 'next/navigation';
import {browserClient} from '@/lib/supabase/browser';
type Mode='login'|'signup'|'reset'|'resend';
export function AuthForm({signedIn=false,updatePassword=false}:{signedIn?:boolean;updatePassword?:boolean}) {
 const router=useRouter();const [mode,setMode]=useState<Mode>('login');const [busy,setBusy]=useState(false);const [message,setMessage]=useState('');
 async function submit(event:FormEvent<HTMLFormElement>){event.preventDefault();setBusy(true);setMessage('');
 const form=event.currentTarget;const data=new FormData(form);const email=String(data.get('email')||'').trim();const password=String(data.get('password')||'');
 try {const client=browserClient();const callback=window.location.origin+'/auth/callback';
 if(signedIn){const {error}=await client.auth.signOut();if(error)throw error;router.refresh();}
 else if(updatePassword){const {error}=await client.auth.updateUser({password});if(error)throw error;form.reset();setMessage('Your password has been updated.');}
 else if(mode==='login'){const {error}=await client.auth.signInWithPassword({email,password});if(error){setMessage('Unable to sign in. Check your details and confirm your email, or reset your password.');return;}router.refresh();}
 else if(mode==='signup'){const {error}=await client.auth.signUp({email,password,options:{emailRedirectTo:callback}});if(error)throw error;form.reset();setMessage('Check your inbox for the next step. If you already have an account, sign in or reset your password.');}
 else if(mode==='reset'){const {error}=await client.auth.resetPasswordForEmail(email,{redirectTo:callback+'?next=/auth/update-password'});if(error)throw error;setMessage('If an account matches that email, you will receive a password reset link.');}
 else {const {error}=await client.auth.resend({type:'signup',email,options:{emailRedirectTo:callback}});if(error)throw error;setMessage('If your account needs confirmation, check your inbox for a new link.');}
 }catch{setMessage('We could not complete that request. Please wait a moment and try again.');}finally{setBusy(false);}}
 const labels:Record<Mode,string>={login:'Sign in',signup:'Create account',reset:'Reset password',resend:'Resend confirmation'};
 return <>{!signedIn&&!updatePassword&&<div className="tabs auth-tabs" aria-label="Account options">{(['login','signup'] as Mode[]).map(item=><button key={item} type="button" disabled={busy} aria-pressed={mode===item} onClick={()=>{setMode(item);setMessage('');}}>{labels[item]}</button>)}</div>}
 {!signedIn&&!updatePassword&&mode==='reset'&&<p className="auth-help">Enter your email and we’ll send a password reset link.</p>}{!signedIn&&!updatePassword&&mode==='resend'&&<p className="auth-help">Enter your email to request a fresh account confirmation.</p>}
 <form className="auth-form" onSubmit={submit}>{!signedIn&&!updatePassword&&<><label htmlFor="email">Email address</label><input id="email" name="email" type="email" autoComplete="email" required maxLength={254}/></>}
 {!signedIn&&(updatePassword||mode==='login'||mode==='signup')&&<><label htmlFor="password">{updatePassword?'New password':'Password'}</label><input id="password" name="password" type="password" autoComplete={mode==='login'&&!updatePassword?'current-password':'new-password'} minLength={mode==='login'&&!updatePassword?1:8} maxLength={128} required/>{(updatePassword||mode==='signup')&&<p className="auth-hint">Use at least 8 characters.</p>}</>}
 <button disabled={busy}>{busy?'Please wait…':signedIn?'Sign out':updatePassword?'Save password':labels[mode]}</button></form>{!signedIn&&!updatePassword&&<div className="auth-links"><button type="button" onClick={()=>{setMode('reset');setMessage('');}}>Forgot password?</button><button type="button" onClick={()=>{setMode('resend');setMessage('');}}>Resend confirmation</button></div>}{message&&<p className="message" role="status">{message}</p>}</>;
}
