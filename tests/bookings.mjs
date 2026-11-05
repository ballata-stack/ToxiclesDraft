import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {pathToFileURL} from 'node:url';
import ts from 'typescript';
import {PGlite} from '@electric-sql/pglite';
let checks=0;const ok=(condition,message)=>{assert(condition,message);checks++};
const db=new PGlite();
const original=fs.readFileSync('tests/run.mjs','utf8');
const bootstrap=original.match(/await db.exec\(\x60([\s\S]*?)\x60\);/)[1];
await db.exec('create role service_role bypassrls;'+bootstrap);
await db.exec(fs.readFileSync('supabase/schema.sql','utf8'));
await db.exec(fs.readFileSync('supabase/bookings.sql','utf8'));
const users=[['00000000-0000-4000-8000-000000000001','owner@example.test',true],['00000000-0000-4000-8000-000000000002','stranger@example.test',true],['00000000-0000-4000-8000-000000000003','unverified@example.test',false]];
for(const [id,email,verified]of users)await db.query('insert into auth.users values ($1,$2,$3,$4)',[id,email,verified?new Date().toISOString():null,JSON.stringify({provider:'google'})]);
await db.exec("insert into studio_admins(email,is_owner) values ('owner@example.test',true),('unverified@example.test',false)");
const row="('Fixture Client','client@example.test','+639001234567','Traditional flower','Forearm','10 cm','2099-01-01','10:00',array['request/reference.webp'])";
await db.exec("insert into booking_requests(name,email,contact_number,idea,placement,size,preferred_date,preferred_time,reference_paths) values "+row);
await db.exec("insert into storage.objects(bucket_id,name) values ('booking-references','request/reference.webp')");
ok((await db.query("select public from storage.buckets where id='booking-references'")).rows[0].public===false,'Reference bucket must be private');
async function identity(index){await db.exec('reset role');await db.query("select set_config('request.jwt.claim.sub',$1,false)",[users[index][0]]);await db.exec('set role authenticated')}
async function denied(sql,code='42501'){try{await db.query(sql);assert.fail('Expected rejection')}catch(e){assert.equal(e.code,code,e.message);checks++}}
await db.exec('set role anon');
await denied('select * from booking_requests');
await denied("insert into booking_requests(name,email,contact_number,idea,placement,size,preferred_date,preferred_time,reference_paths) values "+row);
await denied("select public.reserve_booking_submission('"+'a'.repeat(64)+"')");
await identity(1);
ok((await db.query('select * from booking_requests')).rows.length===0,'Other Google users cannot read booking details');
ok((await db.query("select * from storage.objects where bucket_id='booking-references'")).rows.length===0,'Other users cannot read references');
ok((await db.query("update booking_requests set status='Contacted' returning id")).rows.length===0,'Other users cannot update requests');
await identity(2);ok((await db.query('select * from booking_requests')).rows.length===0,'Unverified approved users cannot read requests');
await identity(0);
ok((await db.query('select * from booking_requests')).rows.length===1,'Approved admin can read requests');
ok((await db.query("select * from storage.objects where bucket_id='booking-references'")).rows.length===1,'Approved admin can read private references');
ok((await db.query("update booking_requests set status='Contacted' returning status")).rows[0].status==='Contacted');
await denied("update booking_requests set idea='overwritten'");
const nested={artworks:[{id:'helmet',gallery:['one.webp','two.webp']}],studioPhotos:[{id:'studio'}],faqs:[{id:'question',question:'Fixture question',answer:'Fixture answer'}]};
await db.query('select public.save_studio_content($1,0)',[JSON.stringify(nested)]);
const saved=(await db.query('select data from studio_content')).rows[0].data;
ok(saved.artworks[0].gallery.length===2&&saved.faqs[0].answer==='Fixture answer','Nested galleries and new collections survive an atomic save');
await db.exec('reset role');await db.exec('set role service_role');
for(let i=0;i<5;i++)await db.query('select public.reserve_booking_submission($1)',['a'.repeat(64)]);
await denied("select public.reserve_booking_submission('"+'a'.repeat(64)+"')",'PT429');
await db.exec('reset role');await db.exec("update booking_submission_limits set window_started_at=now()-interval '2 hours'");await db.exec('set role service_role');await db.query('select public.reserve_booking_submission($1)',['a'.repeat(64)]);
ok((await db.query('select attempts from booking_submission_limits')).rows[0].attempts===1,'Submission rate window resets');
await db.close();

const out=path.resolve('.sites-runtime/booking-tests');fs.mkdirSync(out,{recursive:true});
for(const name of ['bookings','booking-body']){
 let source=fs.readFileSync('lib/'+name+'.ts','utf8').replace("from './bookings'","from './bookings.mjs'");
 fs.writeFileSync(out+'/'+name+'.mjs',ts.transpileModule(source,{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.ES2022}}).outputText);
}
fs.writeFileSync(out+'/service-fixture.mjs',"export const state={configured:false,rateError:null,failAt:0,insertError:false,attempts:0,uploads:[],removed:[],rows:[],rateCalls:0};export function bookingsConfigured(){return state.configured}export function bookingService(){return {rpc:async()=>{state.rateCalls++;return {error:state.rateError}},storage:{from:bucket=>({upload:async(path,bytes,options)=>{state.attempts++;if(state.attempts===state.failAt)return {error:{message:'fixture'}};state.uploads.push({bucket,path,bytes:bytes.byteLength,options});return {error:null}},remove:async paths=>{state.removed.push(...paths);return {error:null}}})},from:()=>({insert:async row=>{if(state.insertError)return {error:{message:'fixture'}};state.rows.push(row);return {error:null}}})}}");
let route=fs.readFileSync('app/api/bookings/route.ts','utf8').replace("from '../../../lib/server'","from '../guard-tests/server.mjs'").replace("from '../../../lib/bookings'","from './bookings.mjs'").replace("from '../../../lib/booking-body'","from './booking-body.mjs'").replace("from '../../../lib/supabase/service'","from './service-fixture.mjs'");
fs.writeFileSync(out+'/route.mjs',ts.transpileModule(route,{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.ES2022}}).outputText);
const {contentSchema,defaultContent,studioTagline}=await import(pathToFileURL(path.resolve('.sites-runtime/guard-tests/content.mjs')));
const legacy=structuredClone(defaultContent);delete legacy.artworks;delete legacy.studioPhotos;delete legacy.faqs;legacy.settings.tagline='Traditional tattoos.';legacy.merch[0].category='Wearables';
const migrated=contentSchema.parse(legacy);
ok(migrated.artworks.length===0&&migrated.faqs.length===0&&migrated.merch[0].category==='Merch'&&migrated.settings.tagline===studioTagline,'Older content loads with the new structure');
const artwork=structuredClone(defaultContent);artwork.artworks[0].category='Drawings';ok(contentSchema.parse(artwork).artworks[0].category==='Paintings & Drawings','Painting/drawing labels merge without losing work');
artwork.artworks[0].gallery=['javascript:bad'];ok(!contentSchema.safeParse(artwork).success,'Artwork gallery URLs are validated');
const {bookingDetailsSchema,MAX_BOOKING_BODY_BYTES}=await import(pathToFileURL(out+'/bookings.mjs'));
const details={name:'Example Client',email:'client@example.test',contactNumber:'+639001234567',instagram:'@example',idea:'A traditional rose tattoo',placement:'Forearm',size:'10 cm',preferredDate:'2099-01-01',preferredTime:'14:30'};
ok(bookingDetailsSchema.safeParse(details).success);
ok(!bookingDetailsSchema.safeParse({...details,preferredDate:'2020-01-01'}).success,'Past dates are rejected');
ok(!bookingDetailsSchema.safeParse({...details,preferredDate:'2099-02-30'}).success,'Invalid calendar dates are rejected');
ok(!bookingDetailsSchema.safeParse({...details,preferredTime:'25:99'}).success,'Invalid times are rejected');
const {state}=await import(pathToFileURL(out+'/service-fixture.mjs'));const {POST}=await import(pathToFileURL(out+'/route.mjs'));
const originalKey=process.env.SUPABASE_SERVICE_ROLE_KEY;process.env.SUPABASE_SERVICE_ROLE_KEY='fixture-only-key';
const reset=()=>Object.assign(state,{configured:true,rateError:null,failAt:0,insertError:false,attempts:0,uploads:[],removed:[],rows:[],rateCalls:0});
const image=fs.readFileSync('public/images/toxicles-horses.webp');
function form(photos=1){const data=new FormData();for(const [key,value]of Object.entries(details))data.set(key,value);data.set('website','');for(let i=0;i<photos;i++)data.append('references',new File([image],'reference.webp',{type:'image/webp'}));return data}
function request(data=form(),headers={}){return new Request('https://toxicles.test/api/bookings',{method:'POST',headers:{origin:'https://toxicles.test',...headers},body:data})}
try{
 ok((await POST(request())).status===503,'Unconfigured form cannot accept requests');
 reset();ok((await POST(request(form(),{origin:'https://other.test'}))).status===403);
 reset();const invalid=form();invalid.set('email','not-an-email');ok((await POST(request(invalid))).status===400&&state.rateCalls===0);
 reset();const success=await POST(request());ok(success.status===201&&state.rows.length===1&&state.uploads[0].bucket==='booking-references','Actual POST stores details and private reference paths');
 const result=await success.json();ok(state.rows[0].reference_paths[0].startsWith(result.id+'/'),'References belong to the generated request');
 reset();const fake=form(0);fake.append('references',new File(['not an image'],'bad.jpg',{type:'image/jpeg'}));ok((await POST(request(fake))).status===400&&state.rateCalls===0,'Fake image content is rejected before storage');
 reset();ok((await POST(request(form(5)))).status===400&&state.uploads.length===0);
 reset();ok((await POST(request(form(0),{'content-length':String(MAX_BOOKING_BODY_BYTES+1)}))).status===413);
 reset();const huge=new Request('https://toxicles.test/api/bookings',{method:'POST',headers:{origin:'https://toxicles.test','content-type':'multipart/form-data; boundary=fixture'},body:new ReadableStream({start(controller){controller.enqueue(new Uint8Array(MAX_BOOKING_BODY_BYTES+1));controller.close()}}),duplex:'half'});ok((await POST(huge)).status===413,'Chunked bodies have the same size limit');
 reset();state.failAt=2;ok((await POST(request(form(2)))).status===503&&state.removed.length===1,'Partial uploads are removed after a later upload failure');
 reset();state.insertError=true;ok((await POST(request())).status===503&&state.removed.length===1,'Uploaded references are removed if saving the request fails');
 reset();state.rateError={code:'PT429'};ok((await POST(request())).status===429&&state.uploads.length===0,'Rate-limited requests do not upload photos');
 reset();const trap=form(0);trap.set('website','filled');ok((await POST(request(trap))).status===400&&state.rateCalls===0);
}finally{if(originalKey===undefined)delete process.env.SUPABASE_SERVICE_ROLE_KEY;else process.env.SUPABASE_SERVICE_ROLE_KEY=originalKey}
console.log(checks+' additional checks passed: private bookings, storage access, rate limits, content migration and real booking request processing.');
