-- Run AFTER schema.sql in the Supabase SQL Editor.
-- Authorized primary admin for this project. Safe to rerun.
-- Other existing admins are preserved.

insert into public.studio_admins(email,is_owner)
values ('arbee.ballat@gmail.com',true)
on conflict(email) do update set is_owner=true;

-- After this succeeds, open /admin and sign in with this Google account.
-- Additional admins can be added in Admin access after signing in.
