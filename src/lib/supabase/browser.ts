import { createBrowserClient } from '@supabase/ssr';
import { authConfig } from '../auth-config';
export function browserClient() { const {url,key}=authConfig(); return createBrowserClient(url,key); }
