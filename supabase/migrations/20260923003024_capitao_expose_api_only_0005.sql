alter role authenticator set pgrst.db_schemas = 'api';
notify pgrst, 'reload config';
