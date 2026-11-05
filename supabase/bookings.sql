-- Run after schema.sql. Safe to rerun when adding bookings to an existing site.
create table if not exists public.booking_requests (
 id uuid primary key default gen_random_uuid(),
 created_at timestamptz not null default now(),
 name text not null check (char_length(name) between 2 and 120),
 email text not null check (char_length(email) between 3 and 254),
 contact_number text not null check (char_length(contact_number) between 5 and 40),
 instagram text not null default '' check (char_length(instagram)<=120),
 idea text not null check (char_length(idea) between 5 and 5000),
 placement text not null check (char_length(placement) between 1 and 160),
 size text not null check (char_length(size) between 1 and 160),
 preferred_date date not null,
 preferred_time time not null,
 reference_paths text[] not null default '{}' check (cardinality(reference_paths)<=4),
 status text not null default 'New' check (status in ('New','Contacted','Closed'))
);
create index if not exists booking_requests_created_idx on public.booking_requests(created_at desc);
alter table public.booking_requests enable row level security;
revoke all on public.booking_requests from anon,authenticated;
grant select on public.booking_requests to authenticated;
grant update(status) on public.booking_requests to authenticated;
grant select,insert,update,delete on public.booking_requests to service_role;
drop policy if exists booking_admin_read on public.booking_requests;
create policy booking_admin_read on public.booking_requests for select to authenticated using ((select public.is_studio_admin()));
drop policy if exists booking_admin_update on public.booking_requests;
create policy booking_admin_update on public.booking_requests for update to authenticated using ((select public.is_studio_admin())) with check ((select public.is_studio_admin()));

insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
values ('booking-references','booking-references',false,819200,array['image/jpeg','image/png','image/webp'])
on conflict(id) do update set public=false,file_size_limit=excluded.file_size_limit,allowed_mime_types=excluded.allowed_mime_types;
drop policy if exists booking_reference_admin_read on storage.objects;
create policy booking_reference_admin_read on storage.objects for select to authenticated using (bucket_id='booking-references' and (select public.is_studio_admin()));

-- Only the trusted booking endpoint can reserve submissions or insert requests.
create table if not exists public.booking_submission_limits (
 fingerprint text primary key check (fingerprint ~ '^[0-9a-f]{64}$'),
 window_started_at timestamptz not null default now(),
 attempts integer not null default 1 check (attempts>0)
);
create index if not exists booking_submission_window_idx on public.booking_submission_limits(window_started_at);
alter table public.booking_submission_limits enable row level security;
revoke all on public.booking_submission_limits from anon,authenticated;
grant select,insert,update,delete on public.booking_submission_limits to service_role;
create or replace function public.reserve_booking_submission(p_fingerprint text)
returns void language plpgsql security definer set search_path=public,pg_temp as $$
declare n integer;
begin
 if p_fingerprint !~ '^[0-9a-f]{64}$' then raise exception using errcode='PT400',message='Invalid request.';end if;
 delete from public.booking_submission_limits where window_started_at<now()-interval '1 day';
 insert into public.booking_submission_limits as limits(fingerprint,window_started_at,attempts)
 values(p_fingerprint,now(),1)
 on conflict(fingerprint) do update set
 attempts=case when limits.window_started_at<now()-interval '1 hour' then 1 else limits.attempts+1 end,
 window_started_at=case when limits.window_started_at<now()-interval '1 hour' then now() else limits.window_started_at end
 returning attempts into n;
 if n>5 then raise exception using errcode='PT429',message='Please try again later.';end if;
end $$;
revoke all on function public.reserve_booking_submission(text) from public,anon,authenticated;
grant execute on function public.reserve_booking_submission(text) to service_role;
