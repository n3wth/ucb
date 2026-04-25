create table if not exists asssscat_lineup_log (
  id               uuid primary key,
  show_date        date        not null,
  monologist_name  text        not null default '',
  performers       jsonb       not null default '[]'::jsonb,
  created_at       timestamptz not null,
  updated_at       timestamptz not null default now()
);

create index if not exists asssscat_lineup_log_show_date_idx
  on asssscat_lineup_log (show_date desc);
