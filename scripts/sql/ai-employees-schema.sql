create table if not exists public.ai_employee_records (
  id uuid primary key default gen_random_uuid(),
  record_type text not null check (record_type in ('task', 'draft', 'video_job')),
  division_id text not null,
  division_name text not null,
  prompt text not null default '',
  output text not null default '',
  model text not null default '',
  status text not null default 'completed',
  data jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists ai_employee_records_type_created_idx
  on public.ai_employee_records (record_type, created_at desc);

alter table public.ai_employee_records enable row level security;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'ai-employee-videos',
  'ai-employee-videos',
  true,
  104857600,
  array['video/mp4']
)
on conflict (id) do update
set public = excluded.public,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

create table if not exists public.site_analytics_events (
  id bigint generated always as identity primary key,
  event_type text not null check (event_type in ('pageview', 'click')),
  visitor_hash text,
  page_path text not null default '/',
  created_at timestamptz not null default now()
);

create index if not exists site_analytics_events_created_idx
  on public.site_analytics_events (created_at desc);

alter table public.site_analytics_events enable row level security;

create or replace function public.get_site_analytics_metrics()
returns jsonb
language sql
stable
security definer
set search_path = public
as $$
  with days as (
    select generate_series(
      (now() at time zone 'UTC')::date - 13,
      (now() at time zone 'UTC')::date,
      interval '1 day'
    )::date as day
  ),
  daily as (
    select
      (created_at at time zone 'UTC')::date as day,
      count(*) filter (where event_type = 'pageview')::integer as views,
      count(*) filter (where event_type = 'click')::integer as clicks
    from public.site_analytics_events
    where created_at >= now() - interval '14 days'
    group by 1
  ),
  series as (
    select days.day, coalesce(daily.views, 0) as views, coalesce(daily.clicks, 0) as clicks
    from days left join daily using (day)
  ),
  periods as (
    select
      coalesce(sum(views) filter (where day >= (now() at time zone 'UTC')::date - 6), 0)::integer as current_views,
      coalesce(sum(clicks) filter (where day >= (now() at time zone 'UTC')::date - 6), 0)::integer as current_clicks,
      coalesce(sum(views) filter (
        where day between (now() at time zone 'UTC')::date - 13 and (now() at time zone 'UTC')::date - 7
      ), 0)::integer as previous_views,
      coalesce(sum(clicks) filter (
        where day between (now() at time zone 'UTC')::date - 13 and (now() at time zone 'UTC')::date - 7
      ), 0)::integer as previous_clicks
    from series
  ),
  visitors as (
    select count(distinct visitor_hash)::integer as unique_visitors
    from public.site_analytics_events
    where event_type = 'pageview'
      and created_at >= now() - interval '7 days'
  )
  select jsonb_build_object(
    'totalViews', periods.current_views,
    'totalClicks', periods.current_clicks,
    'uniqueVisitors', visitors.unique_visitors,
    'viewsGrowth', case
      when periods.previous_views = 0 then 'n/a'
      else round(((periods.current_views - periods.previous_views)::numeric / periods.previous_views) * 100)::text || '%'
    end,
    'clicksGrowth', case
      when periods.previous_clicks = 0 then 'n/a'
      else round(((periods.current_clicks - periods.previous_clicks)::numeric / periods.previous_clicks) * 100)::text || '%'
    end,
    'weekly', (
      select jsonb_agg(jsonb_build_object('date', day::text, 'views', views, 'clicks', clicks) order by day)
      from series
      where day >= (now() at time zone 'UTC')::date - 6
    )
  )
  from periods cross join visitors;
$$;

revoke all on function public.get_site_analytics_metrics() from public, anon, authenticated;
grant execute on function public.get_site_analytics_metrics() to service_role;
