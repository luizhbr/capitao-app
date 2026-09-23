begin;
create extension if not exists pgtap with schema extensions;
select plan(10);

select has_schema('api','api schema exists');
select has_schema('private','private schema exists');
select has_table('api','profiles','profiles exists');
select has_table('api','projects','projects exists');
select has_table('private','user_roles','private roles exists');

select ok((select relrowsecurity from pg_class c join pg_namespace n on n.oid=c.relnamespace where n.nspname='api' and c.relname='profiles'),'RLS enabled on profiles');
select ok((select relrowsecurity from pg_class c join pg_namespace n on n.oid=c.relnamespace where n.nspname='api' and c.relname='projects'),'RLS enabled on projects');
select ok(not has_table_privilege('anon','api.profiles','SELECT'),'anon cannot select profiles');
select ok(has_table_privilege('anon','api.projects','SELECT'),'anon may select public projects through RLS');
select ok(not has_schema_privilege('anon','private','USAGE') and not has_schema_privilege('authenticated','private','USAGE'),'client roles cannot use private schema');

select * from finish();
rollback;
