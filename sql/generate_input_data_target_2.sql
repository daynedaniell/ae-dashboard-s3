/*** Target audience: Nissan Altima competitive set ***/


/*
In addition to the sql outputs below, the viz app
also needs a json file for each audience, containing
audience id and audience display name.

For now, to create this file for this audience, copy and paste
the following into a txt file, and then save it as
audience.json in the data/target_aud_2 folder:
{
  "id": 2,
  "name": "Nissan Competitive Set"
}

*/

-- Nissan Altima audience
drop table if exists #competitive;
select distinct idl_id
into #competitive
from acxiom.audience_attributes__2018_06
where attribute_name in (9044)
and attribute_value in ('AVALON','LACROSSE','IMPALA','CHARGER','GENESIS','TAURUS','MAXIMA','STINGER');

select distinct idl_id
into #comp_first
from acxiom.audience_attributes__2018_06
where attribute_name = 9042
and attribute_value in ('2008','2009','2010','2011','2012','2013','2014','2015','2016','2017','2018','2019');

select distinct idl_id
into #comp
from #competitive
join #comp_first
using (idl_id);

drop table if exists #competitive2;
select distinct idl_id
into #competitive2
from acxiom.audience_attributes__2018_06
where attribute_name in (9054)
and attribute_value in ('AVALON','LACROSSE','IMPALA','CHARGER','GENESIS','TAURUS','MAXIMA','STINGER');

select distinct idl_id
into #comp_second
from acxiom.audience_attributes__2018_06
where attribute_name = 9052
and attribute_value in ('2008','2009','2010','2011','2012','2013','2014','2015','2016','2017','2018','2019');

insert into #comp
select distinct idl_id
from #competitive2
join #comp_second
using (idl_id)
where idl_id not in (select idl_id from #comp);


-- ids crosswalk
create table #target_aud_ids_xwalk (
  idl_id varchar(70) encode zstd,
  temp_id bigint identity not null encode zstd
)
distkey(idl_id);

insert into #target_aud_ids_xwalk
SELECT distinct idl_id
from #comp
order by random()
limit 5000;

-- output to tsv, if needed
-- \pset footer OFF
-- \f '\t'
-- \a
-- \o '../data/target_aud_2/target_aud_ids_xwalk.tsv'
-- select * from #target_aud_ids_xwalk order by temp_id;
-- \o
-- \a
-- \pset footer on

-- audience attributes
create table #aud (
  temp_id bigint encode zstd,
  idl_id varchar(70) encode zstd,
  attribute_name varchar(200) encode zstd,
  attribute_value varchar(200) encode zstd
)
distkey(idl_id);

insert into #aud
SELECT
  temp_id,
  idl_id,
  attribute_name,
  attribute_value
from acxiom.audience_attributes__2018_03
join #target_aud_ids_xwalk using(idl_id);

create table #taxonomy (
  attribute_name varchar(200) encode zstd,
  attribute_value varchar(200) encode zstd,
  category varchar(200) encode zstd,
  subcategory varchar(200) encode zstd,
  clean_attribute_name_description varchar(200) encode zstd,
  clean_attribute_value_description varchar(200) encode zstd
)
distkey(attribute_name);

insert into #taxonomy
select distinct
  attribute_name,
  attribute_value,
  category,
  subcategory,
  clean_attribute_name_description,
  case
    when clean_attribute_value_description in ('1 Most Likely', '2 Somewhat Likely') then 'Likely'
    else clean_attribute_value_description
  end as clean_attribute_value_description
from jumpshot_data_science.acxiom_ds_taxonomy
where action in ('ok','limit to 1','split')
and use_as_idx_filter = 't'
and clean_attribute_value_description not in ('3 Average','4 Somewhat Unlikely','5 Most Unlikely')
;

create table #states (
  fipsstate varchar(2) encode zstd,
  state varchar(2) encode zstd
)
distkey(fipsstate);

insert into #states (fipsstate, state)
VALUES
  ('01', 'AL'),
  ('02', 'AK'),
  ('04', 'AZ'),
  ('05', 'AR'),
  ('06', 'CA'),
  ('08', 'CO'),
  ('09', 'CT'),
  ('10', 'DE'),
  ('11', 'DC'),
  ('12', 'FL'),
  ('13', 'GA'),
  ('15', 'HI'),
  ('16', 'ID'),
  ('17', 'IL'),
  ('18', 'IN'),
  ('19', 'IA'),
  ('20', 'KS'),
  ('21', 'KY'),
  ('22', 'LA'),
  ('23', 'ME'),
  ('24', 'MD'),
  ('25', 'MA'),
  ('26', 'MI'),
  ('27', 'MN'),
  ('28', 'MS'),
  ('29', 'MO'),
  ('30', 'MT'),
  ('31', 'NE'),
  ('32', 'NV'),
  ('33', 'NH'),
  ('34', 'NJ'),
  ('35', 'NM'),
  ('36', 'NY'),
  ('37', 'NC'),
  ('38', 'ND'),
  ('39', 'OH'),
  ('40', 'OK'),
  ('41', 'OR'),
  ('42', 'PA'),
  ('44', 'RI'),
  ('45', 'SC'),
  ('46', 'SD'),
  ('47', 'TN'),
  ('48', 'TX'),
  ('49', 'UT'),
  ('50', 'VT'),
  ('51', 'VA'),
  ('53', 'WA'),
  ('54', 'WV'),
  ('55', 'WI'),
  ('56', 'WY')
;



create table #aud_attributes (
  temp_id bigint encode zstd,
  attribute_name varchar(200) encode zstd,
  category varchar(200) encode zstd,
  subcategory varchar(200) encode zstd,
  clean_attribute_name_description varchar(200) encode zstd,
  clean_attribute_value_description varchar(200) encode zstd,
  fipsstate varchar(2) encode zstd
)
distkey(temp_id);


insert into #aud_attributes
SELECT
  temp_id,
  attribute_name,
  category,
  subcategory,
  clean_attribute_name_description,
  clean_attribute_value_description,
  fipsstate
from #aud
join #taxonomy
using(attribute_name, attribute_value)
join acxiom.audience__2018_03 using (idl_id)
where attribute_name in(
    '8626', '8688', '3101', '7609', '7602', '9514', '7641')
  or (category = 'Interest'
      and clean_attribute_value_description = 'TRUE')
  or (category = 'Retail'
      and subcategory <> 'Categories'
      and clean_attribute_value_description = 'TRUE')
;

-- demographic attributes that are unique by id

-- age
create table #age (
  temp_id bigint encode zstd,
  age varchar(5) encode zstd
)
distkey(temp_id);

insert into #age
SELECT distinct
  temp_id,
  case clean_attribute_value_description
    when '18 - 19' then '18-25'
    when '20 - 21' then '18-25'
    when '22 - 23' then '18-25'
    when '24 - 25' then '18-25'
    when '26 - 27' then '26-35'
    when '28 - 29' then '26-35'
    when '30 - 31' then '26-35'
    when '32 - 33' then '26-35'
    when '34 - 35' then '26-35'
    when '36 - 37' then '36-45'
    when '38 - 39' then '36-45'
    when '40 - 41' then '36-45'
    when '42 - 43' then '36-45'
    when '44 - 45' then '36-45'
    when '46 - 47' then '46-55'
    when '48 - 49' then '46-55'
    when '50 - 51' then '46-55'
    when '52 - 53' then '46-55'
    when '54 - 55' then '46-55'
    when '56 - 57' then '56-65'
    when '58 - 59' then '56-65'
    when '60 - 61' then '56-65'
    when '62 - 63' then '56-65'
    when '64 - 65' then '56-65'
    else '66+'
  end as age
from #aud_attributes
where attribute_name = '8626';

-- remove any dups by id
create table #age_dups (
  temp_id bigint encode zstd,
  age varchar(5) encode zstd
)
distkey(temp_id);

insert into #age_dups
select temp_id
from #age
group by temp_id
having count(temp_id) > 1;

delete from #age where temp_id in (select temp_id from #age_dups);



-- gender
create table #gender (
  temp_id bigint encode zstd,
  gender varchar(1) encode zstd
)
distkey(temp_id);

insert into #gender
SELECT distinct
  temp_id,
  case clean_attribute_value_description
    when 'Female' then 'F'
    when 'Male' then 'M'
  end as gender
from #aud_attributes
where attribute_name = '8688';

-- remove any dups by id
create table #gender_dups (
  temp_id bigint encode zstd,
  gender varchar(1) encode zstd
)
distkey(temp_id);

insert into #gender_dups
select temp_id
from #gender
group by temp_id
having count(temp_id) > 1;

delete from #gender where temp_id in (select temp_id from #gender_dups);




-- ethnicity
create table #ethnicity (
  temp_id bigint encode zstd,
  ethnicity varchar(70) encode zstd
)
distkey(temp_id);

insert into #ethnicity
SELECT distinct
  temp_id,
  clean_attribute_value_description as ethnicity
from #aud_attributes
where attribute_name = '3101';

-- remove any dups by id
create table #ethnicity_dups (
  temp_id bigint encode zstd,
  ethnicity varchar(70) encode zstd
)
distkey(temp_id);

insert into #ethnicity_dups
select temp_id
from #ethnicity
group by temp_id
having count(temp_id) > 1;

delete from #ethnicity where temp_id in (select temp_id from #ethnicity_dups);



-- marital status
create table #marital (
  temp_id bigint encode zstd,
  marital varchar(7) encode zstd
)
distkey(temp_id);

insert into #marital
SELECT distinct
  temp_id,
  case clean_attribute_value_description
    when 'Inferred Single' then 'Single'
    when 'Inferred Married' then 'Married'
    else clean_attribute_value_description
  end as marital
from #aud_attributes
where attribute_name = '7609';

-- remove any dups by id
create table #marital_dups (
  temp_id bigint encode zstd,
  marital varchar(7) encode zstd
)
distkey(temp_id);

insert into #marital_dups
select temp_id
from #marital
group by temp_id
having count(temp_id) > 1;

delete from #marital where temp_id in (select temp_id from #marital_dups);




-- number of children
create table #children (
  temp_id bigint encode zstd,
  children varchar(10) encode zstd
)
distkey(temp_id);

insert into #children
SELECT distinct
  temp_id,
  case 
    when clean_attribute_value_description::int >= 5 then '5+'
    else clean_attribute_value_description
  end as children
from #aud_attributes
where attribute_name = '7602';

-- remove any dups by id
create table #children_dups (
  temp_id bigint encode zstd,
  children varchar(10) encode zstd
)
distkey(temp_id);

insert into #children_dups
select temp_id
from #children
group by temp_id
having count(temp_id) > 1;

delete from #children where temp_id in (select temp_id from #children_dups);



-- education
create table #education (
  temp_id bigint encode zstd,
  education varchar(50) encode zstd
)
distkey(temp_id);

insert into #education
SELECT distinct
  temp_id,
  case clean_attribute_value_description
    when 'Completed High School' then 'High School'
    when 'Completed College' then 'College'
    when 'Completed Graduate School' then 'Grad School'
    when 'Attended Vocational/Technical' then 'Vocational'
  end as education
from #aud_attributes
where attribute_name = '9514';

-- remove any dups by id
create table #education_dups (
  temp_id bigint encode zstd,
  education varchar(50) encode zstd
)
distkey(temp_id);

insert into #education_dups
select temp_id
from #education
group by temp_id
having count(temp_id) > 1;

delete from #education where temp_id in (select temp_id from #education_dups);



-- income
create table #income (
  temp_id bigint encode zstd,
  income varchar(50) encode zstd
)
distkey(temp_id);

insert into #income
SELECT distinct
  temp_id,
  case clean_attribute_value_description
    when 'Less than $15,000' then '< 15K'
    when '$15,000 - $19,999' then '15K-20K'
    when '$20,000 - $29,999' then '20K-30K'
    when '$30,000 - $39,999' then '30K-40K'
    when '$40,000 - $49,999' then '40K-50K'
    when '$50,000 - $74,999' then '50K-75K'
    when '$75,000 - $99,999' then '75K-100K'
    when '$100,000 - $124,999' then '100K-125K'
    when 'Greater than $124,999' then '> 125K'
  end as income
from #aud_attributes
where attribute_name = '7641';

-- remove any dups by id
create table #income_dups (
  temp_id bigint encode zstd,
  income varchar(50) encode zstd
)
distkey(temp_id);

insert into #income_dups
select temp_id
from #income
group by temp_id
having count(temp_id) > 1;

delete from #income where temp_id in (select temp_id from #income_dups);


-- state
create table #aud_states (
  temp_id bigint encode zstd,
  state varchar(2) encode zstd
)
distkey(temp_id);

insert into #aud_states
select distinct
  temp_id,
  state
from #aud_attributes
join #states using(fipsstate)
;


-- output all id-level vars
create table #aud_demographics (
  temp_id bigint encode zstd,
  state varchar(2) encode zstd,
  age varchar(5) encode zstd,
  gender varchar(1) encode zstd,
  ethnicity varchar(70) encode zstd,
  marital varchar(7) encode zstd,
  children varchar(10) encode zstd,
  education varchar(50) encode zstd,
  income varchar(50) encode zstd
)
distkey(temp_id);

insert into #aud_demographics
select
  temp_id,
  state,
  age,
  gender,
  ethnicity,
  marital,
  children,
  education,
  income
from #aud_states
left join #age using(temp_id)
left join #gender using(temp_id)
left join #ethnicity using(temp_id)
left join #marital using(temp_id)
left join #children using(temp_id)
left join #education using(temp_id)
left join #income using(temp_id)
;


-- output to tsv
\pset footer OFF
\f '\t'
\a
\o '../data/target_aud_2/demographics_target.tsv'
select * from #aud_demographics order by temp_id;
\o
\a
\pset footer on





-- interests
create table #interests (
  temp_id bigint encode zstd,
  interests_category varchar(200) encode zstd,
  interests varchar(200) encode zstd
)
distkey(temp_id);

insert into #interests
select distinct
  temp_id,
  subcategory as interests_category,
  clean_attribute_name_description as interests
from #aud_attributes
where category = 'Interest' and clean_attribute_value_description = 'TRUE'
;

-- output to tsv
\pset footer OFF
\f '\t'
\a
\o '../data/target_aud_2/interests_target.tsv'
select * from #interests order by temp_id;
\o
\a
\pset footer on


-- retail
create table #retail (
  temp_id bigint encode zstd,
  retail_category varchar(200) encode zstd,
  retail varchar(200) encode zstd
)
distkey(temp_id);

insert into #retail
select distinct
  temp_id,
  subcategory as retail_category,
  clean_attribute_name_description as retail
from #aud_attributes
where category = 'Retail' and clean_attribute_value_description = 'TRUE'
  and subcategory <> 'Categories'
;

-- output to tsv
\pset footer OFF
\f '\t'
\a
\o '../data/target_aud_2/retail_target.tsv'
select * from #retail order by temp_id;
\o
\a
\pset footer on
