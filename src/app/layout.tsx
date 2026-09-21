import type { Metadata } from 'next';
import {SiteFrame} from '@/components/site-frame';
import '@fontsource/inter/400.css';
import '@fontsource/inter/600.css';
import '@fontsource/dm-serif-display/400.css';
import './globals.css';
export const metadata:Metadata={title:'Cookies & Chips',description:'Baked with love.',robots:{index:false,follow:false}};
export default function Layout({children}:{children:React.ReactNode}) {return <html lang="en"><body><SiteFrame>{children}</SiteFrame></body></html>}
