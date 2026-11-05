import {createHmac,randomUUID} from 'node:crypto';
import {sameOrigin,apiError} from '../../../lib/server';
import {bookingDetailsSchema} from '../../../lib/bookings';
import {readBookingForm,readReferences,BookingInputError} from '../../../lib/booking-body';
import {bookingService,bookingsConfigured} from '../../../lib/supabase/service';

export const runtime='nodejs';
export const maxDuration=30;
export async function POST(request:Request){
 if(!sameOrigin(request))return apiError('The request must come from this site.',403);
 if(!bookingsConfigured())return apiError('Online requests are being set up. Please contact Tox on Instagram.',503);
 let form:FormData;
 try{form=await readBookingForm(request)}catch(e){return apiError((e as Error).message,e instanceof BookingInputError?e.status:400)}
 if(String(form.get('website')||'').trim())return apiError('Could not send this request. Please contact Tox on Instagram.');
 const details=Object.fromEntries(['name','email','contactNumber','instagram','idea','placement','size','preferredDate','preferredTime'].map(key=>[key,form.get(key)||'']));
 const parsed=bookingDetailsSchema.safeParse(details);if(!parsed.success)return apiError(parsed.error.issues[0]?.message||'Check the booking fields.');
 let files:Awaited<ReturnType<typeof readReferences>>;
 try{files=await readReferences(form)}catch(e){return apiError((e as Error).message,e instanceof BookingInputError?e.status:400)}
 const db=bookingService();
 const ip=(request.headers.get('x-vercel-forwarded-for')||request.headers.get('x-forwarded-for')||'unknown').split(',')[0].trim();
 const fingerprint=createHmac('sha256',process.env.SUPABASE_SERVICE_ROLE_KEY!).update(ip).digest('hex');
 const {error:limit}=await db.rpc('reserve_booking_submission',{p_fingerprint:fingerprint});
 if(limit)return apiError(limit.code==='PT429'?'Too many recent requests. Please try again later or contact Tox on Instagram.':'Booking requests are temporarily unavailable.',limit.code==='PT429'?429:503);
 const id=randomUUID();const uploaded:string[]=[];
 try{
  for(const file of files){const path=id+'/'+randomUUID()+'.'+file.extension;const {error}=await db.storage.from('booking-references').upload(path,file.bytes,{contentType:file.type,cacheControl:'3600',upsert:false});if(error)throw new Error('upload');uploaded.push(path)}
  const d=parsed.data;const {error}=await db.from('booking_requests').insert({id,name:d.name,email:d.email,contact_number:d.contactNumber,instagram:d.instagram,idea:d.idea,placement:d.placement,size:d.size,preferred_date:d.preferredDate,preferred_time:d.preferredTime,reference_paths:uploaded});
  if(error)throw new Error('save');
  return Response.json({ok:true,id},{status:201,headers:{'Cache-Control':'no-store'}});
 }catch{
  if(uploaded.length)await db.storage.from('booking-references').remove(uploaded).catch(()=>null);
  return apiError('Your request could not be saved. Please try again or contact Tox on Instagram.',503);
 }
}
