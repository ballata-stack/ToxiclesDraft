import {z} from 'zod';
import {adminContext,authorizeWrite,apiError} from '../../../../lib/server';
import {serverClient} from '../../../../lib/supabase/server';
import {bookingStatuses} from '../../../../lib/bookings';

export const dynamic='force-dynamic';
export async function GET(){
 const auth=await adminContext();if(!auth.configured)return apiError('Studio services are not configured.',503);if(!auth.user)return apiError('Sign in with Google first.',401);if(!auth.allowed)return apiError('This account does not have studio access.',403);
 const db=await serverClient();const {data,error}=await db.from('booking_requests').select('*').order('created_at',{ascending:false}).limit(100);
 if(error)return apiError('Booking requests could not be loaded. Run the booking setup SQL.',503);
 const records=data||[];const paths=[...new Set(records.flatMap(item=>item.reference_paths as string[]))];
 const urls=new Map<string,string>();
 if(paths.length){const signed=await db.storage.from('booking-references').createSignedUrls(paths,3600);for(const item of signed.data||[]){if(item.path&&item.signedUrl&&!item.error)urls.set(item.path,item.signedUrl)}}
 return Response.json({bookings:records.map(item=>({...item,references:(item.reference_paths as string[]).filter(path=>urls.has(path)).map(path=>({path,url:urls.get(path)}))}))},{headers:{'Cache-Control':'no-store'}});
}
export async function PATCH(request:Request){
 const auth=await authorizeWrite(request);if(auth.error)return auth.error;
 const parsed=z.object({id:z.string().uuid(),status:z.enum(bookingStatuses)}).safeParse(await request.json().catch(()=>null));
 if(!parsed.success)return apiError('Check the request and status.');
 const db=await serverClient();const {data,error}=await db.from('booking_requests').update({status:parsed.data.status}).eq('id',parsed.data.id).select('id,status').maybeSingle();
 if(error)return apiError('The booking status could not be updated.',503);if(!data)return apiError('Booking request not found.',404);
 return Response.json(data,{headers:{'Cache-Control':'no-store'}});
}
