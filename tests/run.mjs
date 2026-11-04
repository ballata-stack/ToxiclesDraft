import assert from 'node:assert/strict';
import {PGlite} from '@electric-sql/pglite';
import ts from 'typescript';
import fs from 'node:fs';
import path from 'node:path';
import {pathToFileURL} from 'node:url';
const db=new PGlite();let count=0;
async function ok(condition,message){assert(condition,message);count++}
async function rejects(query,code){try{await db.query(query);assert.fail('Expected query to be rejected')}catch(e){assert.equal(e.code,code,e.message);count++}}
await db.exec(`
create role anon; create role authenticated;
create schema auth; create schema storage;
create table auth.users(id uuid primary key,email text,email_confirmed_at timestamptz,raw_app_meta_data jsonb);
create function auth.uid() returns uuid language sql stable as $$ select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid; $$;
grant usage on schema auth to anon,authenticated;grant execute on function auth.uid() to anon,authenticated;
create table storage.buckets(id text primary key,name text,public boolean,file_size_limit bigint,allowed_mime_types text[]);
create table storage.objects(id uuid primary key default gen_random_uuid(),bucket_id text,name text);
alter table storage.objects enable row level security;
grant usage on schema storage to authenticated;grant insert,select on storage.objects to authenticated;
`);
await db.exec(fs.readFileSync('supabase/schema.sql','utf8'));
const fixture=[['00000000-0000-4000-8000-000000000001','owner@example.test',true,'google'],['00000000-0000-4000-8000-000000000002','second@example.test',true,'google'],['00000000-0000-4000-8000-000000000003','stranger@example.test',true,'google'],['00000000-0000-4000-8000-000000000004','unverified@example.test',false,'google'],['00000000-0000-4000-8000-000000000005','password@example.test',true,'email']];
for(const [id,email,verified,provider]of fixture)await db.query('insert into auth.users values ($1,$2,$3,$4)',[id,email,verified?new Date().toISOString():null,JSON.stringify({provider})]);
await db.query("insert into public.studio_admins(email,is_owner) values ('owner@example.test',true),('unverified@example.test',false),('password@example.test',false)");
async function identity(index){await db.exec('reset role');await db.query("select set_config('request.jwt.claim.sub',$1,false)",[fixture[index][0]]);await db.exec('set role authenticated')}
await db.exec('set role anon');await ok((await db.query('select * from public.studio_content')).rows.length===0,'Empty gallery is publicly readable');await rejects("insert into public.studio_content(id,data,revision) values ('main','{}',1)",'42501');await rejects('select public.is_studio_admin()','42501');
await identity(2);await ok((await db.query('select public.is_studio_admin() as allowed')).rows[0].allowed===false);await ok((await db.query('select * from public.studio_admins')).rows.length===0);await rejects("select public.save_studio_content('{}',0)",'42501');await rejects("select public.manage_studio_admin('stranger@example.test',false)",'42501');await rejects("insert into storage.objects(bucket_id,name) values ('studio-media','forbidden.jpg')",'42501');
await identity(3);await ok((await db.query('select public.is_studio_admin() as allowed')).rows[0].allowed===false,'Unverified accounts are denied');
await identity(4);await ok((await db.query('select public.is_studio_admin() as allowed')).rows[0].allowed===false,'Other sign-in providers are denied');
await identity(0);await ok((await db.query('select public.is_studio_admin() as allowed')).rows[0].allowed===true);await ok((await db.query("select public.save_studio_content('{\"price\":1200}',0) as revision")).rows[0].revision===1);await rejects("select public.save_studio_content('{}',0)",'PT409');await ok((await db.query("select public.save_studio_content('{\"price\":1500}',1) as revision")).rows[0].revision===2);await rejects("update public.studio_content set revision=99 where id='main'",'42501');await rejects("insert into public.studio_admins(email) values ('bypass@example.test')",'42501');await db.query("select public.manage_studio_admin('SECOND@EXAMPLE.TEST',false)");await ok((await db.query("select email from public.studio_admins where email='second@example.test'")).rows.length===1);await db.query("insert into storage.objects(bucket_id,name) values ('studio-media','approved.jpg')");count++;
await identity(1);await ok((await db.query('select public.is_studio_admin() as allowed')).rows[0].allowed===true);await rejects("select public.manage_studio_admin('second@example.test',true)",'PT400');await rejects("select public.manage_studio_admin('owner@example.test',true)",'PT400');await ok((await db.query("select public.save_studio_content('{\"price\":1800}',2) as revision")).rows[0].revision===3);
await identity(0);await db.query("select public.manage_studio_admin('second@example.test',true)");await identity(1);await rejects("select public.save_studio_content('{}',3)",'42501');await db.exec('reset role');await db.exec('set role anon');await ok((await db.query('select data from public.studio_content')).rows[0].data.price===1800);await rejects('select * from public.studio_admins','42501');await db.close();
// Exercise the actual server authorization guard and content validator.
const out=path.resolve('.sites-runtime/guard-tests');fs.mkdirSync(out,{recursive:true});fs.writeFileSync(path.join(out,'fixture.mjs'),"export const state={configured:false,user:null,allowed:false};export function isConfigured(){return state.configured};export async function serverClient(){return {auth:{getUser:async()=>({data:{user:state.user},error:null})},rpc:async()=>({data:state.allowed,error:null})};}");
for(const name of ['content','server']){let source=fs.readFileSync('lib/'+name+'.ts','utf8');source=source.replace(/from ['"]\.\/supabase\/(config|server)['"]/g,"from './fixture.mjs'").replace("from './content'","from './content.mjs'");fs.writeFileSync(path.join(out,name+'.mjs'),ts.transpileModule(source,{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.ES2022}}).outputText)}
const {state}=await import(pathToFileURL(path.join(out,'fixture.mjs')));const guard=await import(pathToFileURL(path.join(out,'server.mjs')));const {contentSchema,defaultContent}=await import(pathToFileURL(path.join(out,'content.mjs')));const origin='https://toxicles.test';const req=(from=origin)=>new Request(origin+'/api/content',{method:'PUT',headers:{origin:from}});
await ok((await guard.authorizeWrite(req())).error.status===503);state.configured=true;await ok((await guard.authorizeWrite(req())).error.status===401);state.user={id:'fixture',email:'owner@example.test',email_confirmed_at:'now',app_metadata:{provider:'google'}};await ok((await guard.authorizeWrite(req())).error.status===403);state.allowed=true;await ok(Boolean((await guard.authorizeWrite(req())).user));await ok((await guard.authorizeWrite(req('https://other.test'))).error.status===403);state.user.app_metadata.provider='email';await ok((await guard.authorizeWrite(req())).error.status===401);await ok(contentSchema.safeParse(defaultContent).success);const malicious=structuredClone(defaultContent);malicious.settings.bookingUrl='javascript:alert(1)';await ok(!contentSchema.safeParse(malicious).success);const badGallery=structuredClone(defaultContent);badGallery.merch[0].gallery=['data:text/html,bad'];await ok(!contentSchema.safeParse(badGallery).success);
console.log(`${count} checks passed: database RLS, Google identity, multiple admins, uploads, atomic saves, same-origin requests, and content validation.`);
