/*** Random audience ***/

-- ids crosswalk
create table #random_aud_ids_xwalk (
  idl_id varchar(70) encode zstd,
  temp_id bigint identity not null encode zstd
)
distkey(idl_id);

insert into #random_aud_ids_xwalk
SELECT idl_id
from acxiom.audience_attributes__2018_09
group by 1
order by random()
limit 10000;

-- output to tsv, if needed
-- \pset footer OFF
-- \f '\t'
-- \a
-- \o '../data/random_audience/random_aud_ids_xwalk.tsv'
-- select * from #random_aud_ids_xwalk order by temp_id;
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
from acxiom.audience_attributes__2018_09
join #random_aud_ids_xwalk using(idl_id)
where attribute_name in (select attribute_name from jumpshot_data_science.acxiom_ds_taxonomy where use_as_ab_filter = 't' group by 1);

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
    when clean_attribute_value_description ilike '%Most Likely%' or clean_attribute_value_description ilike '%Somewhat Likely%' then 'Likely'
    else clean_attribute_value_description
  end as clean_attribute_value_description
from jumpshot_data_science.acxiom_ds_taxonomy
where use_as_ab_filter = 't'
and clean_attribute_value_description not like '%Average%' and clean_attribute_value_description not like '%Somewhat Unlikely%' and clean_attribute_value_description not like '%Least Likely%';

create table #aud_attributes (
  temp_id bigint encode zstd,
  attribute_name varchar(200) encode zstd,
  category varchar(200) encode zstd,
  subcategory varchar(200) encode zstd,
  clean_attribute_name_description varchar(200) encode zstd,
  clean_attribute_value_description varchar(200) encode zstd
)
distkey(temp_id);

insert into #aud_attributes
SELECT
  temp_id,
  attribute_name,
  category,
  subcategory,
  clean_attribute_name_description,
  clean_attribute_value_description
from #aud
join #taxonomy
using(attribute_name, attribute_value)
join acxiom.audience__2018_09 using (idl_id)
where attribute_name in(
    '8626', '8688', '3101', '7609', '7602', '9514', '7641','AFLGC433','AFLGC430','AFLGC438','AFLGC432','AFLGC439','AFLGC434','AFLGC435','AFLGC431','AFLGC436',
    'AP005751','AP005746','AP005750','AP005741','AP005740','AP005739','AP005731','AP005730','AP005745','AP005733','AP005736','AP005734','AP005743','AP005754','AP005735','AP005732','AP005737','7755','7802','7803','7804','7823','7812','7781','7782','7783','7784','7785','7786','7787','8257','7810','7811','7814','7847','7805','7806','7807','7840','8315','2776','6134','6638','6757','6846','7730','7841','8271','8272','8274','8276','8277','8278','8279','8321','8322','8326','7721','7723','7724','7728','7729','8239','GFLG1860','7725','7732','GFLG1841','GFLG1847','GFLG1865','GFLG1866','2777','7766','7799','7764','7768','AP001492','7762','7763','GFLG1843','GFLG1844','GFLG1864','7733','GFLG1853','RBGMN381','RBGMN385','RBGMN388','RBGMN387','RBGMN379','RBGMN362','RBGMN383','RBGMN384','RBGMN378','RBGMN367','RBGMN393','RBGMN386','RBGMN389','RBGMN364','RBGMN343','RBGMN369','RBGMN361','RBGMN339','RBGMN370','RBGMN373','RBGMN358','RBGMN374','RBGMN391','RBGMN366','RBGMN390','RBGMN392','7739','7741','7740','7856','7826','GFLG1849','AP004401','GFLG1854','GFLG1848','6144','6152','6172','6173','6246','6259','6367','6379','6484','6498','6503','6505','6511','6513','6514','6515','6516','6517','6543','6545','6547','6548','6549','6753','6768','6809','6848','7776','7815','7816','7817','3588','6335','6741','6779','AP006167','RBGMN436','RBGMN441','RBGMN442','RBGMN450','RBGNR002','TP000001','TP000151','TP000152','TP000153','TP000154', 'state')
  or (category = 'Media'
      and subcategory not in ('Media Attitudinal','Yellow Pages'))
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

delete from #age where temp_id in (select temp_id from #age group by 1 having count(*) > 1);



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

delete from #gender where temp_id in (select temp_id from #gender group by 1 having count(*) > 1);




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

delete from #ethnicity where temp_id in (select temp_id from #ethnicity group by 1 having count(*) > 1);

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

delete from #marital where temp_id in (select temp_id from #marital group by 1 having count(*) > 1);




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
    when clean_attribute_value_description = 'No Children' then '0'
    when clean_attribute_value_description::int >= 5 then '5+'
    else clean_attribute_value_description
  end as children
from #aud_attributes
where attribute_name = '7602';

-- remove any dups by id

delete from #children where temp_id in (select temp_id from #children group by 1 having count(*) > 1);


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

delete from #education where temp_id in (select temp_id from #education group by 1 having count(*) > 1);



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
    when 'Under $15,000' then '< 15K'
    when '$15,000 - $19,999' then '15K-20K'
    when '$20,000 - $29,999' then '20K-30K'
    when '$30,000 - $39,999' then '30K-40K'
    when '$40,000 - $49,999' then '40K-50K'
    when '$50,000 - $74,999' then '50K-75K'
    when '$75,000 - $99,999' then '75K-100K'
    when '$100,000 - $124,999' then '100K-125K'
    when '$125,000+' then '> 125K'
  end as income
from #aud_attributes
where attribute_name = '7641';

-- remove any dups by id

delete from #income where temp_id in (select temp_id from #income group by 1 having count(*) > 1);


-- state
create table #states (
  temp_id bigint encode zstd,
  state varchar(20) encode zstd
)
distkey(temp_id);

insert into #states
select distinct
  temp_id,
  clean_attribute_value_description
from #aud_attributes
where attribute_name = 'state'
;


-- output all id-level vars
create table #aud_demographics (
  temp_id bigint encode zstd,
  state varchar(20) encode zstd,
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
from #states
full outer join #age using(temp_id)
full outer join #gender using(temp_id)
full outer join #ethnicity using(temp_id)
full outer join #marital using(temp_id)
full outer join #children using(temp_id)
full outer join #education using(temp_id)
full outer join #income using(temp_id)
;


-- output to tsv
\pset footer OFF
\f '\t'
\a
\o '../data/random_audience/demographics_random.tsv'
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
  category as interests_category,
  case when clean_attribute_value_description = 'Likely' then clean_attribute_name_description||' - '||clean_attribute_value_description else clean_attribute_name_description end as interests
from #aud_attributes
where attribute_name in ('AFLGC433','AFLGC430','AFLGC438','AFLGC432','AFLGC439','AFLGC434','AFLGC435','AFLGC431','AFLGC436',
'AP005751','AP005746','AP005750','AP005741','AP005740','AP005739','AP005731','AP005730','AP005745','AP005733','AP005736','AP005734','AP005743','AP005754','AP005735','AP005732','AP005737','7755','7802','7803','7804','7823','7812','7781','7782','7783','7784','7785','7786','7787','8257','7810','7811','7814','7847','7805','7806','7807','7840','8315','2776','6134','6638','6757','6846','7730','7841','8271','8272','8274','8276','8277','8278','8279','8321','8322','8326','7721','7723','7724','7728','7729','8239','GFLG1860','7725','7732','GFLG1841','GFLG1847','GFLG1865','GFLG1866','2777','7766','7799','7764','7768','AP001492','7762','7763','GFLG1843','GFLG1844','GFLG1864','7733','GFLG1853','RBGMN381','RBGMN385','RBGMN388','RBGMN387','RBGMN379','RBGMN362','RBGMN383','RBGMN384','RBGMN378','RBGMN367','RBGMN393','RBGMN386','RBGMN389','RBGMN364','RBGMN343','RBGMN369','RBGMN361','RBGMN339','RBGMN370','RBGMN373','RBGMN358','RBGMN374','RBGMN391','RBGMN366','RBGMN390','RBGMN392','7739','7741','7740','7856','7826','GFLG1849','AP004401','GFLG1854','GFLG1848','6144','6152','6172','6173','6246','6259','6367','6379','6484','6498','6503','6505','6511','6513','6514','6515','6516','6517','6543','6545','6547','6548','6549','6753','6768','6809','6848','7776','7815','7816','7817','3588','6335','6741','6779','AP006167','RBGMN436','RBGMN441','RBGMN442','RBGMN450','RBGNR002','TP000001','TP000151','TP000152','TP000153','TP000154');

-- output to tsv
\pset footer OFF
\f '\t'
\a
\o '../data/random_audience/interests_random.tsv'
select * from #interests order by temp_id;
\o
\a
\pset footer on


-- media

create table #media (
  temp_id bigint encode zstd,
  media_category varchar(200) encode zstd,
  media varchar(200) encode zstd
)
distkey(temp_id);

insert into #media
select distinct
  temp_id,
  subcategory as media_category,
  case when clean_attribute_value_description = 'Likely' then clean_attribute_name_description||' - '||clean_attribute_value_description else clean_attribute_name_description end as interests
from #aud_attributes
where category = 'Media' and subcategory not in ('Media Attitudinal','Yellow Pages')
;

-- output to tsv
\pset footer OFF
\f '\t'
\a
\o '../data/random_audience/media_random.tsv'
select * from #media order by temp_id;
\o
\a
\pset footer on
