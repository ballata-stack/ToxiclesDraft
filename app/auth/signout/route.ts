import {NextResponse,type NextRequest} from 'next/server';
import {serverClient} from '../../../lib/supabase/server';
import {isConfigured} from '../../../lib/supabase/config';
import {sameOrigin,apiError} from '../../../lib/server';
export async function POST(request:NextRequest){if(!sameOrigin(request))return apiError('Invalid sign-out request.',403);if(isConfigured())await (await serverClient()).auth.signOut();return NextResponse.redirect(new URL('/admin',request.url),303)}
