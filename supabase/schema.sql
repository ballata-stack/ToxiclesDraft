-- Run once in the Supabase SQL editor. No admin addresses are seeded by this file.
begin;
create table if not exists public.studio_admins (
 email text primary key check (email=lower(trim(email)) and length(email)<=254),
 is_owner boolean not null default false,
 created_at timestamptz not null default now(),
 created_by uuid references auth.users(id) on delete set null
);
create table if not exists public.studio_content (
 id text primary key check (id='main'),
 data jsonb not null check (jsonb_typeof(data)='object' and octet_length(data::text)<=1000000),
 revision integer not null check (revision>=1),
 updated_at timestamptz not null default now(),
 updated_by uuid references auth.users(id) on delete set null
);
alter table public.studio_admins enable row level security;
alter table public.studio_content enable row level security;

-- Read verified identity from auth.users, not editable profile metadata.
create or replace function public.is_studio_admin() returns boolean
language sql stable security definer set search_path='' as $$
 select exists (
  select 1 from public.studio_admins a
  join auth.users u on lower(u.email)=a.email
  where u.id=auth.uid() and u.email_confirmed_at is not null
    and u.raw_app_meta_data->>'provider'='google'
 );
$$;
revoke all on function public.is_studio_admin() from public;
grant execute on function public.is_studio_admin() to authenticated;

revoke all on public.studio_admins from anon,authenticated;
revoke all on public.studio_content from anon,authenticated;
grant select on public.studio_content to anon,authenticated;
grant select on public.studio_admins to authenticated;
drop policy if exists "Public gallery" on public.studio_content;
create policy "Public gallery" on public.studio_content for select to anon,authenticated using (true);
drop policy if exists "Admins can view the admin list" on public.studio_admins;
create policy "Admins can view the admin list" on public.studio_admins for select to authenticated using (public.is_studio_admin());

-- Atomic saves reject stale revisions even if two admins submit simultaneously.
create or replace function public.save_studio_content(p_content jsonb,p_expected_revision integer)
returns integer language plpgsql security definer set search_path='' as $$
declare saved_revision integer;
begin
 if not public.is_studio_admin() then raise insufficient_privilege using message='Studio access is required'; end if;
 if p_content is null or jsonb_typeof(p_content)<>'object' or octet_length(p_content::text)>1000000 or p_expected_revision is null or p_expected_revision<0 then
  raise sqlstate 'PT400' using message='Invalid content';
 end if;
 if p_expected_revision=0 then
  insert into public.studio_content(id,data,revision,updated_by) values('main',p_content,1,auth.uid())
  on conflict(id) do nothing returning revision into saved_revision;
 else
  update public.studio_content set data=p_content,revision=revision+1,updated_at=now(),updated_by=auth.uid()
  where id='main' and revision=p_expected_revision returning revision into saved_revision;
 end if;
 if saved_revision is null then raise sqlstate 'PT409' using message='Another admin saved changes'; end if;
 return saved_revision;
end;
$$;
revoke all on function public.save_studio_content(jsonb,integer) from public;
grant execute on function public.save_studio_content(jsonb,integer) to authenticated;

create or replace function public.manage_studio_admin(p_email text,p_remove boolean default false)
returns void language plpgsql security definer set search_path='' as $$
declare normalized_email text;
begin
 if not public.is_studio_admin() then raise insufficient_privilege using message='Studio access is required'; end if;
 normalized_email=lower(trim(p_email));
 if normalized_email is null or length(normalized_email)>254 or normalized_email !~ '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$' then
  raise sqlstate 'PT400' using message='Invalid email address';
 end if;
 if p_remove then
  if exists(select 1 from public.studio_admins where email=normalized_email and is_owner)
     or normalized_email=(select lower(email) from auth.users where id=auth.uid()) then
   raise sqlstate 'PT400' using message='Primary admins and your own access cannot be removed here';
  end if;
  delete from public.studio_admins where email=normalized_email;
 else
  insert into public.studio_admins(email,created_by) values(normalized_email,auth.uid()) on conflict(email) do nothing;
 end if;
end;
$$;
revoke all on function public.manage_studio_admin(text,boolean) from public;
grant execute on function public.manage_studio_admin(text,boolean) to authenticated;

-- Public gallery files, with uploads restricted to approved Google accounts.
insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
values ('studio-media','studio-media',true,41943040,array['image/jpeg','image/png','image/webp','image/gif','video/mp4','video/webm'])
on conflict(id) do update set public=true,file_size_limit=41943040,allowed_mime_types=excluded.allowed_mime_types;
drop policy if exists "Studio admin uploads" on storage.objects;
create policy "Studio admin uploads" on storage.objects for insert to authenticated
with check (bucket_id='studio-media' and public.is_studio_admin());
commit;
