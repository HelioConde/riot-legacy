create or replace view public.riot_legacy_retention_daily as
select
  created_at::date as event_date,
  count(distinct nullif(context->>'visitorHash','')) as unique_visitors,
  count(distinct session_id) as sessions,
  count(*) filter (where event_name='profile_lookup') as profile_lookups,
  count(*) filter (where event_name='profile_loaded') as profiles_loaded,
  count(*) filter (where event_name='share') as shares,
  count(*) filter (where event_name='download_card') as card_downloads,
  count(*) filter (where event_name='favorite_milestone') as favorites,
  count(*) filter (where event_name='pwa_installed') as pwa_installs
from public.client_event_logs
where area='riot-legacy'
group by created_at::date;

create or replace view public.riot_legacy_retention_cohorts as
with visits as (
  select
    context->>'visitorHash' as visitor_hash,
    created_at::date as visit_date
  from public.client_event_logs
  where area='riot-legacy'
    and event_name='app_open'
    and nullif(context->>'visitorHash','') is not null
  group by 1,2
),
first_seen as (
  select visitor_hash,min(visit_date) as cohort_date
  from visits
  group by visitor_hash
)
select
  f.cohort_date,
  count(*) as cohort_size,
  count(*) filter (
    where exists (
      select 1 from visits v
      where v.visitor_hash=f.visitor_hash
        and v.visit_date=f.cohort_date + 1
    )
  ) as returned_d1,
  count(*) filter (
    where exists (
      select 1 from visits v
      where v.visitor_hash=f.visitor_hash
        and v.visit_date between f.cohort_date + 7 and f.cohort_date + 8
    )
  ) as returned_d7
from first_seen f
group by f.cohort_date
order by f.cohort_date desc;

revoke all on public.riot_legacy_retention_daily from anon,authenticated;
revoke all on public.riot_legacy_retention_cohorts from anon,authenticated;
grant select on public.riot_legacy_retention_daily to service_role;
grant select on public.riot_legacy_retention_cohorts to service_role;
