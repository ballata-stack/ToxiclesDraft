import {NextResponse,type NextRequest} from 'next/server';
import {serverClient} from '../../../lib/supabase/server';
import {isConfigured} from '../../../lib/supabase/config';
export async function GET(request:NextRequest){const code=request.nextUrl.searchParams.get('code');if(code&&isConfigured()){const db=await serverClient();const {error}=await db.auth.exchangeCodeForSession(code);if(!error)return NextResponse.redirect(new URL('/admin',request.url))}return NextResponse.redirect(new URL('/admin?error=signin',request.url))}
