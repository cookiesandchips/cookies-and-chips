"use client";
import Link from 'next/link';
export function MobileNav(){return <details className="mobile-nav" onClick={e=>{if((e.target as HTMLElement).closest('a'))e.currentTarget.open=false;}} onKeyDown={e=>{if(e.key==='Escape'){e.currentTarget.open=false;e.currentTarget.querySelector('summary')?.focus();}}}>
<summary aria-label="Main menu"><svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><path d="M3 6h18M3 12h18M3 18h18"/></svg></summary>
<nav aria-label="Mobile navigation"><Link href="/">Home</Link><Link href="/#shop">Shop</Link><Link href="/my-story">My Story</Link><Link href="/faq">FAQ</Link><Link href="/contact">Contact</Link></nav>
</details>}
