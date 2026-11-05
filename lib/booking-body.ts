import {MAX_BOOKING_BODY_BYTES,MAX_REFERENCE_BYTES,MAX_REFERENCE_PHOTOS} from './bookings';

export class BookingInputError extends Error{constructor(message:string,public status=400){super(message)}}
export async function readBookingForm(request:Request){
 const type=request.headers.get('content-type')||'';
 if(!/^multipart\/form-data(?:;|$)/i.test(type))throw new BookingInputError('Use the booking form to send your request.');
 if(Number(request.headers.get('content-length')||0)>MAX_BOOKING_BODY_BYTES)throw new BookingInputError('The reference photos are too large.',413);
 if(!request.body)throw new BookingInputError('The booking request is empty.');
 const reader=request.body.getReader();const chunks:Uint8Array[]=[];let size=0;
 while(true){const {done,value}=await reader.read();if(done)break;size+=value.byteLength;if(size>MAX_BOOKING_BODY_BYTES){await reader.cancel();throw new BookingInputError('The reference photos are too large.',413)}chunks.push(value)}
 const bytes=new Uint8Array(size);let offset=0;for(const chunk of chunks){bytes.set(chunk,offset);offset+=chunk.byteLength}
 try{return await new Response(bytes,{headers:{'Content-Type':type}}).formData()}catch{throw new BookingInputError('The booking form could not be read.')}
}
export async function readReferences(form:FormData){
 const entries=form.getAll('references').filter(value=>!(value instanceof File&&value.size===0));
 if(entries.length>MAX_REFERENCE_PHOTOS)throw new BookingInputError('Choose up to 4 reference photos.');
 const files:{bytes:ArrayBuffer;type:string;extension:string}[]=[];
 for(const value of entries){
  if(!(value instanceof File)||!['image/jpeg','image/png','image/webp'].includes(value.type))throw new BookingInputError('Use JPG, PNG or WebP reference photos.');
  if(value.size===0||value.size>MAX_REFERENCE_BYTES)throw new BookingInputError('A reference photo is too large.',413);
  const bytes=await value.arrayBuffer();const b=new Uint8Array(bytes);const ascii=(start:number,end:number)=>String.fromCharCode(...b.slice(start,end));
  const valid=value.type==='image/jpeg'?b[0]===255&&b[1]===216&&b[2]===255:value.type==='image/png'?b[0]===137&&ascii(1,4)==='PNG'&&b[4]===13&&b[5]===10&&b[6]===26&&b[7]===10:ascii(0,4)==='RIFF'&&ascii(8,12)==='WEBP';
  if(!valid)throw new BookingInputError('A reference photo could not be read. Choose a valid image.');
  files.push({bytes,type:value.type,extension:value.type==='image/jpeg'?'jpg':value.type==='image/png'?'png':'webp'});
 }
 return files;
}
