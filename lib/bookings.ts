import {z} from 'zod';

export const MAX_REFERENCE_PHOTOS=4;
export const MAX_REFERENCE_BYTES=800*1024;
export const MAX_BOOKING_BODY_BYTES=4*1024*1024;
export const bookingStatuses=['New','Contacted','Closed'] as const;
export type BookingStatus=typeof bookingStatuses[number];

export function studioToday(now=new Date()){
 const parts=new Intl.DateTimeFormat('en-US',{timeZone:'Asia/Manila',year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(now);
 const part=(name:string)=>parts.find(p=>p.type===name)?.value||'';
 return `${part('year')}-${part('month')}-${part('day')}`;
}

export const bookingDetailsSchema=z.object({
 name:z.string().trim().min(2,'Enter your name.').max(120),
 email:z.string().trim().email('Enter a valid email address.').max(254),
 contactNumber:z.string().trim().min(5,'Enter a contact number.').max(40).regex(/^[+()\d\s.-]+$/,'Enter a valid contact number.'),
 instagram:z.string().trim().max(120).default(''),
 idea:z.string().trim().min(5,'Describe your tattoo idea.').max(5000),
 placement:z.string().trim().min(1,'Enter the placement.').max(160),
 size:z.string().trim().min(1,'Enter the size.').max(160),
 preferredDate:z.string().regex(/^\d{4}-\d{2}-\d{2}$/,'Choose a date.').refine(value=>{const d=new Date(value+'T00:00:00Z');return !Number.isNaN(d.valueOf())&&d.toISOString().slice(0,10)===value},'Choose a valid date.'),
 preferredTime:z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/,'Choose a time.'),
}).superRefine((value,ctx)=>{
 if(value.preferredDate<studioToday())ctx.addIssue({code:'custom',path:['preferredDate'],message:'Choose today or a future date.'});
});
export type BookingDetails=z.infer<typeof bookingDetailsSchema>;
export type BookingRecord={
 id:string;created_at:string;name:string;email:string;contact_number:string;instagram:string;
 idea:string;placement:string;size:string;preferred_date:string;preferred_time:string;
 status:BookingStatus;reference_paths:string[];references:{path:string;url:string}[];
};
