import {NextResponse,type NextRequest} from 'next/server';
import {serverClient} from '@/lib/supabase/server';
import {safeDestination} from '@/lib/auth-config';
export async function GET(request:NextRequest){
 const code=request.nextUrl.searchParams.get('code');
 if(code){try{const client=await serverClient();const {error}=await client.auth.exchangeCodeForSession(code);if(!error)return NextResponse.redirect(new URL(safeDestination(request.nextUrl.searchParams.get('next')),request.url));}catch{}}
 return NextResponse.redirect(new URL('/auth/error',request.url));
}
