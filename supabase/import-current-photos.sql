-- Optional: merge the supplied 48 photos into content already saved by an admin.
-- Deploy the updated public/images/uploads folder first; finish open admin drafts.
-- Run in Supabase SQL Editor as the project owner, after schema.sql.
-- Settings, memberships, bookings, products and unrelated items are preserved.
-- If there is no saved content row, the bundled defaults already contain the photos.
begin;
do $merge$
declare
 current_data jsonb;
 next_data jsonb;
 incoming jsonb := $catalog${"flash":[{"id":"import-20261105-flash-01","title":"","image":"/images/uploads/flash-design-01.webp","category":"Flash sheets","status":"Ask Tox","price":null,"description":"","source":"https://www.instagram.com/toxicles/p/DfMJriRzGvM/"},{"id":"import-20261105-flash-02","title":"","image":"/images/uploads/flash-design-02.webp","category":"Flash sheets","status":"Ask Tox","price":null,"description":"","source":"https://www.instagram.com/toxicles/p/DeRJWPHTq9J/"},{"id":"import-20261105-flash-03","title":"","image":"/images/uploads/flash-design-03.webp","category":"Flash sheets","status":"Ask Tox","price":null,"description":"","source":""},{"id":"import-20261105-flash-04","title":"","image":"/images/uploads/flash-design-04.webp","category":"Flash sheets","status":"Ask Tox","price":null,"description":"","source":""},{"id":"import-20261105-flash-05","title":"","image":"/images/uploads/flash-design-05.webp","category":"Flash sheets","status":"Ask Tox","price":null,"description":"","source":""},{"id":"import-20261105-flash-06","title":"","image":"/images/uploads/flash-design-06.webp","category":"Flash sheets","status":"Ask Tox","price":null,"description":"","source":""},{"id":"import-20261105-flash-07","title":"","image":"/images/uploads/flash-design-07.webp","category":"Flash sheets","status":"Ask Tox","price":null,"description":"","source":""},{"id":"import-20261105-flash-08","title":"","image":"/images/uploads/flash-design-08.webp","category":"Flash sheets","status":"Ask Tox","price":null,"description":"","source":""},{"id":"import-20261105-flash-09","title":"","image":"/images/uploads/flash-design-09.webp","category":"Flash sheets","status":"Ask Tox","price":null,"description":"","source":""},{"id":"import-20261105-flash-10","title":"","image":"/images/uploads/flash-design-10.webp","category":"Flash sheets","status":"Ask Tox","price":null,"description":"","source":""},{"id":"import-20261105-flash-11","title":"","image":"/images/uploads/flash-design-11.webp","category":"Flash sheets","status":"Ask Tox","price":null,"description":"","source":""},{"id":"import-20261105-flash-12","title":"","image":"/images/uploads/flash-design-12.webp","category":"Flash sheets","status":"Ask Tox","price":null,"description":"","source":""},{"id":"import-20261105-flash-13","title":"","image":"/images/uploads/flash-design-13.webp","category":"Flash sheets","status":"Ask Tox","price":null,"description":"","source":""}],"artworks":[{"id":"import-20261105-artwork-01","title":"","image":"/images/uploads/artwork-01.webp","category":"Paintings & Drawings","description":"","source":"","gallery":[]},{"id":"import-20261105-artwork-02","title":"","image":"/images/uploads/artwork-02.webp","category":"Paintings & Drawings","description":"","source":"","gallery":[]},{"id":"import-20261105-artwork-03","title":"","image":"/images/uploads/artwork-03.webp","category":"Paintings & Drawings","description":"","source":"","gallery":[]},{"id":"import-20261105-artwork-04","title":"","image":"/images/uploads/artwork-04.webp","category":"Paintings & Drawings","description":"","source":"","gallery":[]},{"id":"import-20261105-artwork-05","title":"","image":"/images/uploads/artwork-05.webp","category":"Paintings & Drawings","description":"","source":"","gallery":[]},{"id":"import-20261105-artwork-06","title":"","image":"/images/uploads/artwork-06.webp","category":"Paintings & Drawings","description":"","source":"https://www.instagram.com/toxicles/p/Debrj12E0mS/","gallery":[]},{"id":"import-20261105-artwork-07","title":"","image":"/images/uploads/artwork-07.webp","category":"Paintings & Drawings","description":"","source":"","gallery":[]},{"id":"import-20261105-artwork-08","title":"","image":"/images/uploads/artwork-08.webp","category":"Paintings & Drawings","description":"","source":"","gallery":[]},{"id":"import-20261105-artwork-09","title":"","image":"/images/uploads/artwork-09.webp","category":"Paintings & Drawings","description":"","source":"","gallery":[]},{"id":"import-20261105-artwork-10","title":"","image":"/images/uploads/artwork-10.webp","category":"Paintings & Drawings","description":"","source":"","gallery":[]},{"id":"import-20261105-artwork-11","title":"","image":"/images/uploads/artwork-11.webp","category":"Paintings & Drawings","description":"","source":"","gallery":[]},{"id":"import-20261105-artwork-12","title":"","image":"/images/uploads/artwork-12.webp","category":"Paintings & Drawings","description":"","source":"","gallery":[]},{"id":"import-20261105-artwork-13","title":"","image":"/images/uploads/artwork-13.webp","category":"Paintings & Drawings","description":"","source":"","gallery":[]},{"id":"import-20261105-artwork-14","title":"","image":"/images/uploads/artwork-14.webp","category":"Paintings & Drawings","description":"","source":"","gallery":[]},{"id":"import-20261105-artwork-15","title":"","image":"/images/uploads/artwork-15.webp","category":"Paintings & Drawings","description":"","source":"","gallery":[]},{"id":"import-20261105-object-helmet-1","title":"","image":"/images/uploads/object-helmet-1-1.webp","category":"Objects","description":"","source":"","gallery":["/images/uploads/object-helmet-1-2.webp","/images/uploads/object-helmet-1-3.webp","/images/uploads/object-helmet-1-4.webp"]},{"id":"import-20261105-object-helmet-2","title":"","image":"/images/uploads/object-helmet-2-1.webp","category":"Objects","description":"","source":"","gallery":["/images/uploads/object-helmet-2-2.webp","/images/uploads/object-helmet-2-3.webp"]},{"id":"import-20261105-object-lucky-cat-1","title":"","image":"/images/uploads/object-lucky-cat-1-1.webp","category":"Objects","description":"","source":"","gallery":["/images/uploads/object-lucky-cat-1-2.webp","/images/uploads/object-lucky-cat-1-3.webp","/images/uploads/object-lucky-cat-1-4.webp"]},{"id":"import-20261105-object-lucky-cat-2","title":"","image":"/images/uploads/object-lucky-cat-2-1.webp","category":"Objects","description":"","source":"","gallery":["/images/uploads/object-lucky-cat-2-2.webp"]},{"id":"import-20261105-object-mirror","title":"","image":"/images/uploads/object-mirror.webp","category":"Objects","description":"","source":"","gallery":[]},{"id":"import-20261105-object-table-1","title":"","image":"/images/uploads/object-table-1.webp","category":"Objects","description":"","source":"","gallery":[]},{"id":"import-20261105-object-table-2","title":"","image":"/images/uploads/object-table-2.webp","category":"Objects","description":"","source":"","gallery":[]},{"id":"import-20261105-object-table-3","title":"","image":"/images/uploads/object-table-3.webp","category":"Objects","description":"","source":"","gallery":[]},{"id":"import-20261105-object-table-4","title":"","image":"/images/uploads/object-table-4.webp","category":"Objects","description":"","source":"","gallery":[]},{"id":"import-20261105-object-wall-art-1","title":"","image":"/images/uploads/object-wall-art-1.webp","category":"Objects","description":"","source":"","gallery":[]},{"id":"import-20261105-object-wall-art-2","title":"","image":"/images/uploads/object-wall-art-2.webp","category":"Objects","description":"","source":"","gallery":[]}]}$catalog$::jsonb;
 flashes jsonb := '[]'::jsonb;
 artworks jsonb;
 item jsonb;
 replacement jsonb;
 legacy_skull jsonb;
begin
 select data into current_data from public.studio_content where id='main' for update;
 if not found then return;end if;
 artworks:=coalesce(current_data->'artworks','[]'::jsonb);
 -- Upgrade the two older bundled flash copies while keeping their edited fields.
 for item in select value from jsonb_array_elements(coalesce(current_data->'flash','[]'::jsonb)) loop
  if item->>'image'='/images/Debrj12E0mS.webp' then
   legacy_skull:=item;
   continue;
  end if;
  replacement:=null;
  if item->>'image'='/images/DfMJriRzGvM.webp' then replacement:=incoming->'flash'->0;end if;
  if item->>'image'='/images/DeRJWPHTq9J.webp' then replacement:=incoming->'flash'->1;end if;
  if replacement is not null then item:=item||jsonb_build_object('image',replacement->>'image');end if;
  flashes:=flashes||jsonb_build_array(item);
 end loop;
 for item in select value from jsonb_array_elements(incoming->'flash') loop
  if not exists(select 1 from jsonb_array_elements(flashes) old where old->>'image'=item->>'image') then
   if exists(select 1 from jsonb_array_elements(flashes) old where old->>'id'=item->>'id') then
    item:=item||jsonb_build_object('id','import-'||gen_random_uuid()::text);
   end if;
   flashes:=flashes||jsonb_build_array(item);
  end if;
 end loop;
 for item in select value from jsonb_array_elements(incoming->'artworks') loop
  if legacy_skull is not null and item->>'image'='/images/uploads/artwork-06.webp' then
   item:=item||jsonb_build_object('description',legacy_skull->>'description','source',legacy_skull->>'source');
  end if;
  if not exists(select 1 from jsonb_array_elements(artworks) old where old->>'image'=item->>'image') then
   if exists(select 1 from jsonb_array_elements(artworks) old where old->>'id'=item->>'id') then
    item:=item||jsonb_build_object('id','import-'||gen_random_uuid()::text);
   end if;
   artworks:=artworks||jsonb_build_array(item);
  end if;
 end loop;
 if jsonb_array_length(flashes)>150 or jsonb_array_length(artworks)>150 then
  raise exception 'The merged gallery exceeds 150 items. No changes were saved.';
 end if;
 next_data:=current_data||jsonb_build_object('flash',flashes,'artworks',artworks);
 if next_data is distinct from current_data then
  update public.studio_content set data=next_data,revision=revision+1,updated_at=now() where id='main';
 end if;
end $merge$;
commit;
