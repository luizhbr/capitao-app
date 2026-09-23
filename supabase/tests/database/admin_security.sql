begin;
create extension if not exists pgtap with schema extensions;
select plan(14);

select has_table('api','listings','listings exists');
select has_table('api','listing_media','listing_media exists');
select has_table('private','moderation_log','moderation_log exists');

select ok((select relrowsecurity from pg_class c join pg_namespace n on n.oid=c.relnamespace where n.nspname='api' and c.relname='listings'),'RLS on listings');
select ok((select relrowsecurity from pg_class c join pg_namespace n on n.oid=c.relnamespace where n.nspname='api' and c.relname='listing_media'),'RLS on listing_media');
select ok((select relrowsecurity from pg_class c join pg_namespace n on n.oid=c.relnamespace where n.nspname='private' and c.relname='moderation_log'),'RLS on moderation_log');

select ok(not has_table_privilege('anon','api.listings','INSERT'),'anon cannot insert listings');
select ok(not has_table_privilege('anon','private.moderation_log','SELECT'),'anon cannot read moderation_log');
select ok(not has_schema_privilege('anon','private','USAGE'),'anon cannot use private schema');
select ok(not has_function_privilege('anon','api.moderate_listing(uuid,text,text)','EXECUTE'),'anon cannot moderate');
select ok(not has_function_privilege('anon','api.admin_list_listings(text)','EXECUTE'),'anon cannot list all listings');
select ok(has_function_privilege('authenticated','api.moderate_listing(uuid,text,text)','EXECUTE'),'authenticated may call moderation (role validated inside)');
select ok(not has_column_privilege('authenticated','api.listings','owner_id','UPDATE'),'authenticated cannot update owner_id');
select ok(not has_column_privilege('authenticated','api.listings','status','UPDATE'),'authenticated cannot update status directly');

select * from finish();
rollback;
