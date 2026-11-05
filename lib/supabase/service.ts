import 'server-only';
import {createClient} from '@supabase/supabase-js';
import {isConfigured} from './config';

export function bookingsConfigured(){return isConfigured()&&Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY)}
export function bookingService(){
 const url=process.env.NEXT_PUBLIC_SUPABASE_URL;
 const key=process.env.SUPABASE_SERVICE_ROLE_KEY;
 if(!url||!key)throw new Error('Booking services are not configured.');
 return createClient(url,key,{auth:{persistSession:false,autoRefreshToken:false}});
}
