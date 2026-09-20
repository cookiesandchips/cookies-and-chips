import {NextResponse,type NextRequest} from 'next/server';
import {serverClient} from '@/lib/supabase/server';
export async function GET(request:NextRequest){
 const token_hash=request.nextUrl.searchParams.get('token_hash');const type=request.nextUrl.searchParams.get('type');
 if(token_hash&&(type==='signup'||type==='recovery')){try{const client=await serverClient();const {error}=await client.auth.verifyOtp({token_hash,type});if(!error)return NextResponse.redirect(new URL(type==='recovery'?'/auth/update-password':'/account',request.url));}catch{}}
 return NextResponse.redirect(new URL('/auth/error',request.url));
}
