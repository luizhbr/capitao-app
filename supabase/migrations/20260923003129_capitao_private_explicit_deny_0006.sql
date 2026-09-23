create policy private_roles_deny_clients
on private.user_roles
for all
to anon, authenticated
using (false)
with check (false);
