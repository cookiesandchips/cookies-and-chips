'use client';
import {useEffect,useRef,useState} from 'react';
import {accountNames,type HeaderSession} from '@/lib/account-menu';
export function AccountMenu({session:initial}:{session:HeaderSession|null}){
 const [open,setOpen]=useState(false),[session,setSession]=useState(initial);
 const menu=useRef<HTMLDivElement>(null);
 useEffect(()=>{setSession(initial);},[initial]);
 useEffect(()=>{let ignore=false;fetch('/api/account',{cache:'no-store',credentials:'same-origin'}).then(async r=>{if(ignore||!r.ok)return;const d=await r.json();setSession({name:String(d.name||''),email:String(d.email||''),isAdmin:!!d.isAdmin});}).catch(()=>{});return()=>{ignore=true;};},[]);
 useEffect(()=>{if(!open)return;function close(e:PointerEvent){if(!menu.current?.contains(e.target as Node))setOpen(false);}function esc(e:KeyboardEvent){if(e.key==='Escape')setOpen(false);}document.addEventListener('pointerdown',close);document.addEventListener('keydown',esc);return()=>{document.removeEventListener('pointerdown',close);document.removeEventListener('keydown',esc);};},[open]);
 async function signOut(){await fetch('/auth/sign-out',{method:'POST'});location.assign('/');}
 if(!session)return <a className="account-signin" href="/account">Sign in</a>;
 const names=accountNames(session.name,session.email);
 return <div className="account-control" ref={menu}><button className="account-trigger" type="button" aria-label={names.full} aria-expanded={open} aria-haspopup="menu" onClick={()=>setOpen(v=>!v)}><span className="account-name-full">{names.full}</span><span className="account-name-short">{names.short}</span><span aria-hidden="true">▾</span></button>{open&&<nav className="account-dropdown" aria-label="Account menu"><p className="account-identity"><strong>{names.full}</strong><span>{session.email}</span></p><a href="/account#orders">My orders</a><a href="/account">Account</a>{session.isAdmin&&<a href="/admin">Manage Bakery</a>}<button type="button" onClick={signOut}>Sign out</button></nav>}</div>;
}
