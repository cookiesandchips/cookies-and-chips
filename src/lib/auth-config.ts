export const SUPABASE_URL = 'https://vqebxtybuiegvfxawksf.supabase.co';
export function authConfig() {
 const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
 const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
 if (url !== SUPABASE_URL || !key) throw new Error('Cookies & Chips authentication is not configured.');
 return { url, key };
}
export function safeDestination(value: string | null) {
 return value === '/auth/update-password' ? value : '/account';
}
