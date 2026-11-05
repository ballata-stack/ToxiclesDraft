'use client';
import {useEffect,useState,type FormEvent} from 'react';
import {ArrowUpRight,Check,LoaderCircle,Upload,X} from 'lucide-react';
import {bookingDetailsSchema,MAX_REFERENCE_BYTES,MAX_REFERENCE_PHOTOS,studioToday,type BookingDetails} from '../lib/bookings';

const empty:BookingDetails={name:'',email:'',contactNumber:'',instagram:'',idea:'',placement:'',size:'',preferredDate:'',preferredTime:''};
const accepted=['image/jpeg','image/png','image/webp'];

async function prepareReference(file:File){
 const url=URL.createObjectURL(file);
 try{
  const img=new Image();img.src=url;await img.decode();
  const scale=Math.min(1,1600/Math.max(img.naturalWidth,img.naturalHeight));
  const canvas=document.createElement('canvas');
  canvas.width=Math.max(1,Math.round(img.naturalWidth*scale));canvas.height=Math.max(1,Math.round(img.naturalHeight*scale));
  const ctx=canvas.getContext('2d');if(!ctx)throw new Error('Your browser could not prepare the photos.');
  ctx.fillStyle='#fff';ctx.fillRect(0,0,canvas.width,canvas.height);ctx.drawImage(img,0,0,canvas.width,canvas.height);
  for(const quality of [.88,.76,.64,.5]){
   const blob=await new Promise<Blob>((resolve,reject)=>canvas.toBlob(value=>value?resolve(value):reject(new Error('Could not prepare a reference photo.')),'image/jpeg',quality));
   if(blob.size<=MAX_REFERENCE_BYTES)return new File([blob],file.name.replace(/\.[^.]+$/,'').slice(0,100)+'.jpg',{type:'image/jpeg'});
  }
  throw new Error('A reference photo is too detailed to upload. Please choose a smaller image.');
 }catch(e){throw new Error(e instanceof Error&&e.message?e.message:'Use JPG, PNG or WebP reference photos.')}finally{URL.revokeObjectURL(url)}
}
function ReferencePreview({file,remove,disabled=false}:{file:File;remove:()=>void;disabled?:boolean}){
 const [url,setUrl]=useState('');useEffect(()=>{const next=URL.createObjectURL(file);setUrl(next);return()=>URL.revokeObjectURL(next)},[file]);
 return <div className="booking-reference">{url&&<img src={url} alt={file.name}/>}<span>{file.name}</span><button type="button" onClick={remove} disabled={disabled} aria-label={'Remove '+file.name}><X size={15}/></button></div>;
}

export function BookingForm({enabled,initialIdea='',instagram}:{enabled:boolean;initialIdea?:string;instagram:string}){
 const [values,setValues]=useState<BookingDetails>({...empty,idea:initialIdea});
 const [files,setFiles]=useState<File[]>([]);const [errors,setErrors]=useState<Record<string,string>>({});
 const [message,setMessage]=useState('');const [phase,setPhase]=useState<'idle'|'photos'|'sending'|'success'>('idle');
 useEffect(()=>{setValues(old=>({...old,idea:initialIdea}))},[initialIdea]);
 const busy=phase==='photos'||phase==='sending';
 function change(key:keyof BookingDetails,value:string){setValues(old=>({...old,[key]:value}));setErrors(old=>({...old,[key]:''}));setMessage('')}
 function chooseFiles(chosen:FileList|null){
  if(!chosen)return;const next=[...files,...Array.from(chosen)];
  if(next.length>MAX_REFERENCE_PHOTOS){setMessage('Choose up to 4 reference photos.');return}
  if(next.some(file=>!accepted.includes(file.type))){setMessage('Use JPG, PNG or WebP reference photos.');return}
  if(next.some(file=>file.size>12*1024*1024)){setMessage('Each original reference photo must be under 12 MB.');return}
  setFiles(next);setMessage('');
 }
 async function submit(event:FormEvent<HTMLFormElement>){
  event.preventDefault();if(busy||!enabled)return;setMessage('');
  const formData=new FormData(event.currentTarget);
  const checked=bookingDetailsSchema.safeParse(Object.fromEntries(Object.keys(empty).map(key=>[key,String(formData.get(key)||'')])));
  if(!checked.success){const next:Record<string,string>={};for(const issue of checked.error.issues){const key=String(issue.path[0]);if(!next[key])next[key]=issue.message}setErrors(next);document.getElementById('booking-'+checked.error.issues[0].path[0])?.focus();return}
  setValues(checked.data);
  const abort=new AbortController();let timer:ReturnType<typeof setTimeout>|undefined;
  try{
   setPhase(files.length?'photos':'sending');const body=new FormData();
   Object.entries(checked.data).forEach(([key,value])=>body.set(key,value));body.set('website',String(formData.get('website')||''));
   for(const file of files)body.append('references',await prepareReference(file));
   setPhase('sending');timer=setTimeout(()=>abort.abort(),40000);
   const response=await fetch('/api/bookings',{method:'POST',body,signal:abort.signal});const result=await response.json();
   if(!response.ok)throw new Error(result.error||'Could not send your request. Please try again.');
   setPhase('success');setFiles([]);
  }catch(e){setPhase('idle');setMessage((e as Error).name==='AbortError'?'The request took too long. Please try again or contact Tox on Instagram.':(e as Error).message)}finally{if(timer)clearTimeout(timer)}
 }
 function field(key:keyof BookingDetails,label:string,type='text',placeholder='',optional=false){return <label className="booking-field" key={key}><span>{label}{optional&&<small>Optional</small>}</span><input id={'booking-'+key} name={key} type={type} value={values[key]} placeholder={placeholder} required={!optional} autoComplete={key==='name'?'name':key==='email'?'email':key==='contactNumber'?'tel':'off'} min={type==='date'?studioToday():undefined} maxLength={key==='email'?254:key==='name'?120:160} aria-invalid={Boolean(errors[key])} aria-describedby={errors[key]?'booking-error-'+key:undefined} disabled={busy} onChange={e=>change(key,e.target.value)}/>{errors[key]&&<small className="field-error" id={'booking-error-'+key}>{errors[key]}</small>}</label>}
 if(phase==='success')return <div className="booking-success" role="status"><span className="booking-success-icon"><Check size={30}/></span><h2>Request received.</h2><p>Tox will contact you to confirm the appointment.</p><button className="text-link" onClick={()=>{setValues({...empty});setPhase('idle')}}>Send another request <ArrowUpRight size={17}/></button></div>;
 return <form className="booking-form" onSubmit={submit} noValidate aria-label="Tattoo booking form">
  <div className="booking-fields">{field('name','Name','text','Your full name')}{field('email','Email','email','you@example.com')}{field('contactNumber','Contact Number','tel','+63 …')}{field('instagram','Instagram','text','@yourname',true)}</div>
  <label className="booking-field"><span>Tattoo Idea / Description</span><textarea id="booking-idea" name="idea" rows={5} maxLength={5000} value={values.idea} placeholder="Tell Tox what you have in mind." required aria-invalid={Boolean(errors.idea)} aria-describedby={errors.idea?'booking-error-idea':undefined} disabled={busy} onChange={e=>change('idea',e.target.value)}/>{errors.idea&&<small className="field-error" id="booking-error-idea">{errors.idea}</small>}</label>
  <div className="booking-fields">{field('placement','Placement','text','e.g. left forearm')}{field('size','Size','text','e.g. 10 × 15 cm')}{field('preferredDate','Preferred Date','date')}{field('preferredTime','Preferred Time · Manila','time')}</div>
  <fieldset className="booking-upload"><legend>Upload Pegs and Reference Photos <small>Optional</small></legend><label className="booking-upload-target"><Upload size={22}/><span>Choose reference photos</span><small>Up to 4 JPG, PNG or WebP photos · 12 MB each</small><input type="file" multiple accept="image/jpeg,image/png,image/webp" disabled={busy} onChange={e=>{chooseFiles(e.target.files);e.target.value=''}}/></label>{files.length>0&&<div className="booking-references">{files.map((file,index)=><ReferencePreview key={file.name+file.lastModified+index} file={file} disabled={busy} remove={()=>setFiles(old=>old.filter((_,i)=>i!==index))}/>)}</div>}</fieldset>
  <label className="booking-honeypot" aria-hidden="true">Website<input name="website" tabIndex={-1} autoComplete="off"/></label>
  {message&&<p className="booking-error" role="alert">{message}</p>}
  {!enabled&&<p className="booking-setup-note">Online requests are being set up. <a href={instagram} target="_blank" rel="noopener noreferrer">Contact Tox on Instagram <ArrowUpRight size={13}/></a></p>}
  <div className="booking-submit"><p>Preferred dates and times are subject to confirmation.<br/>Your details and reference photos are shared with the studio admins.</p><button className="button" type="submit" disabled={busy||!enabled}>{busy?<LoaderCircle size={17} className="spin"/>:<ArrowUpRight size={17}/>} {phase==='photos'?'Preparing photos…':phase==='sending'?'Sending…':'SEND BOOKING REQUEST'}</button></div>
 </form>;
}
