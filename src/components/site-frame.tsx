'use client';
import {usePathname} from 'next/navigation';
import Link from 'next/link';
import Script from 'next/script';
import {MobileNav} from './mobile-nav';
import {AccountMenu} from './account-menu';
import type {HeaderSession} from '@/lib/account-menu';
const measurementId='G-CX6QRV8WC5';
export function SiteFrame({children,session}:{children:React.ReactNode;session:HeaderSession|null}){
 const path=usePathname();
 if(path==='/admin'||path.startsWith('/admin/'))return <>{children}</>;
 const checkout=path==='/checkout';
 return <><Script src={'https://www.googletagmanager.com/gtag/js?id='+measurementId} strategy="afterInteractive"/><Script id="google-analytics" strategy="afterInteractive">{`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${measurementId}');`}</Script><div className="ribbon">Good cookies make a brighter day. · Baked with love in Arizona.</div><header className={checkout?'checkout-bar':undefined}>{!checkout&&<MobileNav/>}<Link href="/" aria-label="Cookies and Chips home"><img src="/brand/logo.png" alt="Cookies & Chips — Baked with Love" width="96" height="96" /></Link>{checkout?<p className="secure-note"><svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><rect x="5" y="11" width="14" height="9" rx="1.5"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/></svg>Secure checkout</p>:<nav className="desktop-nav" aria-label="Main navigation"><Link href="/">Home</Link><Link href="/#shop">Shop</Link><Link href="/my-story">My Story</Link><Link href="/faq">FAQ</Link><Link href="/contact">Contact</Link></nav>}<div className="header-actions"><div className="account-slot"><AccountMenu session={session}/></div>{!checkout&&<Link href="/checkout" aria-label="Shopping bag" title="Shopping bag"><svg viewBox="0 0 24 24" width="23" height="23" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true"><path d="M5 7h14l1 14H4L5 7Z"/><path d="M9 8V6a3 3 0 0 1 6 0v2"/></svg></Link>}</div></header><main>{children}</main><footer className="site-footer"><Link href="/" aria-label="Cookies and Chips home"><img src="/brand/logo.png" width="96" height="96" alt="Cookies & Chips"/></Link><nav aria-label="Footer navigation"><Link href="/#shop">Shop cookies</Link><Link href="/my-story">My Story</Link><Link href="/shipping">Shipping & pickup</Link><Link href="/faq">FAQ</Link><Link href="/contact">Contact</Link><Link href="/policies">Policies & allergens</Link></nav><p>Baked with love in Arizona.</p></footer></>;
}
