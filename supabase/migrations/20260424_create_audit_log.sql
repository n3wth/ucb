create table if not exists audit_log (
  id          uuid primary key,
  timestamp   timestamptz not null,
  actor       text        not null,
  action      text        not null,
  target_id   text        not null,
  payload     jsonb,
  created_at  timestamptz not null default now()
);

create index if not exists audit_log_timestamp_idx on audit_log (timestamp desc);
