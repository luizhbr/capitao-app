begin;
create extension if not exists pgtap with schema extensions;
select plan(8);

insert into auth.users (id,email,raw_user_meta_data)
values
('11111111-1111-4111-8111-111111111111','user-a@capitao.test','{"display_name":"User A"}'::jsonb),
('22222222-2222-4222-8222-222222222222','user-b@capitao.test','{"display_name":"User B"}'::jsonb);

set local role authenticated;
select set_config('request.jwt.claim.sub','11111111-1111-4111-8111-111111111111',true);
select set_config('request.jwt.claims','{"sub":"11111111-1111-4111-8111-111111111111","role":"authenticated","aud":"authenticated"}',true);

select results_eq(
  $$select id from api.profiles order by id$$,
  array['11111111-1111-4111-8111-111111111111'::uuid],
  'A reads only A'
);

select results_eq(
  $$select count(*)::bigint from api.profiles where id='22222222-2222-4222-8222-222222222222'$$,
  array[0::bigint],
  'A cannot read B'
);

update api.profiles set display_name='HACKED'
where id='22222222-2222-4222-8222-222222222222';

select results_eq(
  $$select count(*)::bigint from api.profiles where id='22222222-2222-4222-8222-222222222222'$$,
  array[0::bigint],
  'A cannot see/update B'
);

select throws_ok(
  $$delete from api.profiles where id='22222222-2222-4222-8222-222222222222'$$,
  '42501', null, 'A cannot delete B'
);

update api.profiles set display_name='User A Updated'
where id='11111111-1111-4111-8111-111111111111';

select results_eq(
  $$select display_name from api.profiles where id='11111111-1111-4111-8111-111111111111'$$,
  array['User A Updated'::text],
  'A can update A'
);

reset role;

select results_eq(
  $$select display_name from api.profiles where id='22222222-2222-4222-8222-222222222222'$$,
  array['User B'::text],
  'B stayed unchanged'
);

select ok(not has_table_privilege('authenticated','api.profiles','DELETE'),'authenticated has no DELETE grant');
select ok(not has_schema_privilege('authenticated','private','USAGE'),'authenticated cannot use private schema');

select * from finish();
rollback;
