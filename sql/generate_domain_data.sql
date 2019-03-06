-- Need TS Index, UU Index, pct of aud, category

create table #a1 (
  guid varchar(256) encode zstd,
  target_date date encode zstd
) distkey(guid);

insert into #a1
select guid, min(calendar_date) as target_date
from jumpshot_us.clickstream__2018_q4
where domain in ('ea.com','twitch.tv','discordapp.com')
group by 1;


create table #random(
 guid varchar(256) encode zstd,
 target_date date encode zstd
)distkey(guid);

insert into #random
select guid, min(calendar_date) as target_date
from (
select distinct guid, calendar_date
from jumpshot_us.clickstream__2018_q4
join jumpshot_data_science.us_user_stats
using (guid)
where domain in ('amazon.com', 'facebook.com', 'google.com')
and tot_days_engaged >= 60
order by random()
limit 20000)
group by 1
order by random()
limit 10000;


create table #aud (
 guid varchar(256) encode zstd,
 target_date date encode zstd,
 segment varchar(30) encode zstd
)distkey(guid);

insert into #aud
select guid, target_date, 'target' as segment
from #a1
order by random()
limit 10000;

insert into #aud
select guid, target_date, 'rand' as segment
from #random;


create table #domain_visits (
  segment varchar(30) encode zstd,
  guid varchar(256) encode zstd,
  domain varchar encode zstd,
  time_spent int encode zstd
) distkey(guid);

insert into #domain_visits
select segment, guid, domain, time_spent
from #aud
join jumpshot_us.clickstream__2018_q4
using (guid)
where calendar_date between target_date - 14 and target_date + 14
and domain not in (select domain from jumpshot_data_science.js_domain_blacklist);

create table #domain_stats (
  segment varchar(30) encode zstd,
  domain varchar encode zstd,
  category varchar (50) encode zstd,
  total_time_spent bigint encode zstd,
  total_uu int encode zstd
) distkey(domain);

insert into #domain_stats
select segment, domain, category, sum(time_spent) as total_time_spent, count(distinct guid) as total_uu
from #domain_visits
join jumpshot_data_science.domain_category_mapping
using (domain)
group by 1, 2, 3;

-- create table #domain_stats (
--   segment varchar(30) encode zstd,
--   domain varchar encode zstd,
--   category varchar (50) encode zstd,
--   total_time_spent int encode zstd,
--   total_uu int encode zstd
-- ) distkey(domain);


select segment, domain, category, total_time_spent::float/(select count(distinct guid) from #aud where segment = segment) as avg_time_spent, total_uu::float/(select count(distinct guid) from #aud where segment = segment) as pct_uu
into #domain_stats2
from #domain_stats;

-- create table #indexes (
--   segment varchar(30) encode zstd,
--   domain varchar encode zstd,
--   category varchar(50) encode zstd,
--   time_spent_idx int encode zstd,
--   uu_idx int encode zstd,
--   pct_uu float encode zstd
-- );
--
-- insert into #indexes
select a.segment,
  domain,
  a.category,
  case when b.avg_time_spent = 0 then 0 else round(a.avg_time_spent/b.avg_time_spent * 100) end as time_spent_idx,
  case when b.pct_uu = 0 then 0 else round(a.pct_uu::float/b.pct_uu * 100) end as uu_idx,
  a.pct_uu::float
into #indexes
from #domain_stats2 a
join #domain_stats2 b
using (domain)
where a.segment != b.segment and a.segment = 'target';

\a
\f '\t'
\pset footer off
\o './data/target_aud_1_js/domain_indexes.tsv'
select * from #indexes where pct_uu >= .01;
