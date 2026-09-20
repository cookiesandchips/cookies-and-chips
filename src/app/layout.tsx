import type { Metadata } from 'next';
import Link from 'next/link';
import '@fontsource/inter/400.css';
import '@fontsource/inter/600.css';
import '@fontsource/dm-serif-display/400.css';
import './globals.css';
export const metadata:Metadata={title:'Cookies & Chips',description:'Baked with love.'};
export default function Layout({children}:{children:React.ReactNode}) {return <html lang="en"><body><div className="ribbon">Good cookies make a brighter day. · Baked with love in Arizona.</div><header><Link href="/" aria-label="Cookies and Chips home"><img src="/brand/logo.png" alt="Cookies & Chips — Baked with Love" width="96" height="96" /></Link><nav aria-label="Main navigation"><Link href="/">Home</Link><Link href="/account">My account</Link></nav></header><main>{children}</main><footer>Cookies & Chips · Baked with love.</footer></body></html>}
