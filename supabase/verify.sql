-- Read-only check: what actually exists in the live project.
-- Safe to run any time — it creates and changes nothing.
-- One query on purpose: the Supabase SQL editor only shows the LAST result set.
-- Expect 13 rows, all with ok = true.

select 'table' as check, t.name as object, (to_regclass('public.' || t.name) is not null) as ok
from (values ('profiles'), ('subscriptions'), ('reports'), ('chat_messages')) as t(name)

union all
select 'rls enabled', c.relname, c.relrowsecurity
from pg_class c
where c.relnamespace = 'public'::regnamespace
  and c.relname in ('profiles', 'subscriptions', 'reports', 'chat_messages')

union all
select 'policy', p.tablename || ' · ' || p.policyname, true
from pg_policies p
where p.schemaname = 'public'

union all
select 'column', c.table_name || '.' || c.column_name, true
from information_schema.columns c
where c.table_schema = 'public'
  and (c.table_name, c.column_name) in (
    ('profiles', 'free_reports_used'),
    ('subscriptions', 'reports_used'),
    ('reports', 'roadmap')
  )

union all
select 'trigger', tg.tgname, true
from pg_trigger tg
where tg.tgrelid = 'auth.users'::regclass
  and not tg.tgisinternal
  and tg.tgname = 'on_auth_user_created'

order by 1, 2;
