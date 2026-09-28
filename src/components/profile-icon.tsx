'use client';
import {useEffect,useRef,useState} from 'react';
export function ProfileIcon(){
 const [open,setOpen]=useState(false),[session,setSession]=useState<{isAdmin:boolean}|null|false>(null);
 const menu=useRef<HTMLDivElement>(null);
 useEffect(()=>{fetch('/api/account',{cache:'no-store'}).then(async r=>{if(!r.ok){setSession(false);return;}const d=await r.json();setSession({isAdmin:!!d.isAdmin});}).catch(()=>setSession(false));},[]);
 useEffect(()=>{if(!open)return;function close(e:PointerEvent){if(!menu.current?.contains(e.target as Node))setOpen(false);}function esc(e:KeyboardEvent){if(e.key==='Escape')setOpen(false);}document.addEventListener('pointerdown',close);document.addEventListener('keydown',esc);return()=>{document.removeEventListener('pointerdown',close);document.removeEventListener('keydown',esc);};},[open]);
 async function signOut(){await fetch('/auth/sign-out',{method:'POST'});location.assign('/');}
 return <div className="profile-menu" ref={menu}><button className="profile-icon" type="button" aria-label="My account" aria-expanded={open} aria-haspopup="menu" onClick={()=>setOpen(v=>!v)}><svg viewBox="0 0 24 24" width="23" height="23" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true"><circle cx="12" cy="8" r="3.5"/><path d="M4.5 21v-2a7.5 7.5 0 0 1 15 0v2"/></svg></button>{open&&<nav className="profile-dropdown" aria-label="Account menu">{session?<><button type="button" onClick={signOut}>Sign out</button><a href="/account#orders">My orders</a><a href="/account#profile">My profile</a>{session.isAdmin&&<a href="/admin">Manage Bakery</a>}</>:<a href="/account">Sign in</a>}</nav>}</div>;
}
