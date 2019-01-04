
/*** DATA PROCESSING **************************************************/

/* calculate an array of pct and indexes per demog attr */
function indexAttr(attrName, catsArray, targetData, randomData) {
    let targetCounts = d3.nest()
      .key(function(d) { return d[attrName]; })
      .rollup(function(v) { return v.length; })
      .entries(targetData);

    let targetNonMissTotal = d3.nest()
      .rollup(function(v) {
          return d3.sum(v, function(d) {
            if (d.key != "") {return d.value;}
          });
      })
      .object(targetCounts);

    let randomCounts = d3.nest()
      .key(function(d) { return d[attrName]; })
      .rollup(function(v) { return v.length; })
      .entries(randomData);

    let randomNonMissTotal = d3.nest()
      .rollup(function(v) {
          return d3.sum(v, function(d) {
            if (d.key != "") {return d.value;}
          });
      })
      .object(randomCounts);

    let indexArray = _.cloneDeep(catsArray);

    indexArray.forEach(function(catEntryIndex) {
        let targetResult = targetCounts.filter(function(catEntryTarget) {
            return catEntryTarget.key === catEntryIndex.attrib_value;
        });
        catEntryIndex["target_count"] = (targetResult[0] !== undefined) ? targetResult[0].value : 0;
        if (targetNonMissTotal > 0) {
          catEntryIndex["target_pct"] = Math.round(100 * catEntryIndex["target_count"] / targetNonMissTotal);
        } else { catEntryIndex["target_pct"] = 0 }
        let randomResult = randomCounts.filter(function(catEntryRandom) {
            return catEntryRandom.key === catEntryIndex.attrib_value;
        });
        catEntryIndex["random_count"] = (randomResult[0] !== undefined) ? randomResult[0].value : 0;
        if (randomNonMissTotal > 0) {
          catEntryIndex["random_pct"] = Math.round(100 * catEntryIndex["random_count"] / randomNonMissTotal);
        } else { catEntryIndex["random_pct"] = 0 }

        if (catEntryIndex["random_pct"] > 0) {
          catEntryIndex["index"] = Math.round(100 * catEntryIndex["target_pct"] / catEntryIndex["random_pct"]);
        } else {catEntryIndex["index"] = 0}
    });

    return indexArray;
}

/* filter the input data by attrib for re-indexing */
function filterAttr(ds, attrName, attrValue){
    let filteredData = ds.filter(function(d) { return d[attrName] == attrValue; });
    return filteredData;
}

/* Make ordered cartegory arrays */
function makeIndexCats(){
  let ageIndexCats = [
      {attrib_value: '18-25', target_count: 0, random_count: 0},
      {attrib_value: '26-35', target_count: 0, random_count: 0},
      {attrib_value: '36-45', target_count: 0, random_count: 0},
      {attrib_value: '46-55', target_count: 0, random_count: 0},
      {attrib_value: '56-65', target_count: 0, random_count: 0},
      {attrib_value: '66+', target_count: 0, random_count: 0}
  ];
  let genderIndexCats = [
      {attrib_value: 'F', target_count: 0, random_count: 0},
      {attrib_value: 'M', target_count: 0, random_count: 0}
  ];
  let ethnicityIndexCats = [
      {attrib_value: 'Asian', target_count: 0, random_count: 0},
      {attrib_value: 'African American', target_count: 0, random_count: 0},
      {attrib_value: 'Hispanic', target_count: 0, random_count: 0},
      {attrib_value: 'White/Other', target_count: 0, random_count: 0}
  ];
  const maritalIndexCats = [
      {attrib_value: 'Married', target_count: 0, random_count: 0},
      {attrib_value: 'Single', target_count: 0, random_count: 0}
  ];
  // const childrenIndexCats = [
  //     {attrib_value: '0', target_count: 0, random_count: 0},
  //     {attrib_value: '1', target_count: 0, random_count: 0},
  //     {attrib_value: '2', target_count: 0, random_count: 0},
  //     {attrib_value: '3', target_count: 0, random_count: 0},
  //     {attrib_value: '4', target_count: 0, random_count: 0},
  //     {attrib_value: '5', target_count: 0, random_count: 0},
  //     {attrib_value: '6', target_count: 0, random_count: 0},
  //     {attrib_value: '7', target_count: 0, random_count: 0},
  //     {attrib_value: '8+', target_count: 0, random_count: 0}
  // ];
  const childrenIndexCats = [
      {attrib_value: '0', target_count: 0, random_count: 0},
      {attrib_value: '1', target_count: 0, random_count: 0},
      {attrib_value: '2', target_count: 0, random_count: 0},
      {attrib_value: '3', target_count: 0, random_count: 0},
      {attrib_value: '4', target_count: 0, random_count: 0},
      {attrib_value: '5+', target_count: 0, random_count: 0}
  ];
  const educationIndexCats = [
      {attrib_value: 'High School', target_count: 0, random_count: 0},
      {attrib_value: 'College', target_count: 0, random_count: 0},
      {attrib_value: 'Grad School', target_count: 0, random_count: 0},
      {attrib_value: 'Vocational', target_count: 0, random_count: 0}
  ];
  const incomeIndexCats = [
      {attrib_value: '< 15K', target_count: 0, random_count: 0},
      {attrib_value: '15K-20K', target_count: 0, random_count: 0},
      {attrib_value: '20K-30K', target_count: 0, random_count: 0},
      {attrib_value: '30K-40K', target_count: 0, random_count: 0},
      {attrib_value: '40K-50K', target_count: 0, random_count: 0},
      {attrib_value: '50K-75K', target_count: 0, random_count: 0},
      {attrib_value: '75K-100K', target_count: 0, random_count: 0},
      {attrib_value: '100K-125K', target_count: 0, random_count: 0},
      {attrib_value: '> 125K', target_count: 0, random_count: 0}
  ];

  const stateIndexCats = [
      {attrib_value: 'AL', target_count: 0, random_count: 0},
      {attrib_value: 'AK', target_count: 0, random_count: 0},
      {attrib_value: 'AZ', target_count: 0, random_count: 0},
      {attrib_value: 'AR', target_count: 0, random_count: 0},
      {attrib_value: 'CA', target_count: 0, random_count: 0},
      {attrib_value: 'CO', target_count: 0, random_count: 0},
      {attrib_value: 'CT', target_count: 0, random_count: 0},
      {attrib_value: 'DE', target_count: 0, random_count: 0},
      {attrib_value: 'DC', target_count: 0, random_count: 0},
      {attrib_value: 'FL', target_count: 0, random_count: 0},
      {attrib_value: 'GA', target_count: 0, random_count: 0},
      {attrib_value: 'HI', target_count: 0, random_count: 0},
      {attrib_value: 'ID', target_count: 0, random_count: 0},
      {attrib_value: 'IL', target_count: 0, random_count: 0},
      {attrib_value: 'IN', target_count: 0, random_count: 0},
      {attrib_value: 'IA', target_count: 0, random_count: 0},
      {attrib_value: 'KS', target_count: 0, random_count: 0},
      {attrib_value: 'KY', target_count: 0, random_count: 0},
      {attrib_value: 'LA', target_count: 0, random_count: 0},
      {attrib_value: 'ME', target_count: 0, random_count: 0},
      {attrib_value: 'MD', target_count: 0, random_count: 0},
      {attrib_value: 'MA', target_count: 0, random_count: 0},
      {attrib_value: 'MI', target_count: 0, random_count: 0},
      {attrib_value: 'MN', target_count: 0, random_count: 0},
      {attrib_value: 'MS', target_count: 0, random_count: 0},
      {attrib_value: 'MO', target_count: 0, random_count: 0},
      {attrib_value: 'MT', target_count: 0, random_count: 0},
      {attrib_value: 'NE', target_count: 0, random_count: 0},
      {attrib_value: 'NV', target_count: 0, random_count: 0},
      {attrib_value: 'NH', target_count: 0, random_count: 0},
      {attrib_value: 'NJ', target_count: 0, random_count: 0},
      {attrib_value: 'NM', target_count: 0, random_count: 0},
      {attrib_value: 'NY', target_count: 0, random_count: 0},
      {attrib_value: 'NC', target_count: 0, random_count: 0},
      {attrib_value: 'ND', target_count: 0, random_count: 0},
      {attrib_value: 'OH', target_count: 0, random_count: 0},
      {attrib_value: 'OK', target_count: 0, random_count: 0},
      {attrib_value: 'OR', target_count: 0, random_count: 0},
      {attrib_value: 'PA', target_count: 0, random_count: 0},
      {attrib_value: 'RI', target_count: 0, random_count: 0},
      {attrib_value: 'SC', target_count: 0, random_count: 0},
      {attrib_value: 'SD', target_count: 0, random_count: 0},
      {attrib_value: 'TN', target_count: 0, random_count: 0},
      {attrib_value: 'TX', target_count: 0, random_count: 0},
      {attrib_value: 'UT', target_count: 0, random_count: 0},
      {attrib_value: 'VT', target_count: 0, random_count: 0},
      {attrib_value: 'VA', target_count: 0, random_count: 0},
      {attrib_value: 'WA', target_count: 0, random_count: 0},
      {attrib_value: 'WV', target_count: 0, random_count: 0},
      {attrib_value: 'WI', target_count: 0, random_count: 0},
      {attrib_value: 'WY', target_count: 0, random_count: 0}
  ];

	return {
		age : ageIndexCats,
		ethnicity : ethnicityIndexCats,
    gender : genderIndexCats,
    marital : maritalIndexCats,
    children : childrenIndexCats,
    education : educationIndexCats,
    income : incomeIndexCats,
    state : stateIndexCats,
    interests: [],
    retail: []
	};
}


/* Indexing for interests/retail */

/* calculate an array of pct and indexes for interests/retail */
function indexInterestsRetail(attrName, targetData, randomData, bubble=false) {

    let targetCounts = d3.nest()
      .key(function(d) { return d[attrName+"_category"] + "|" + d[attrName]; })
      .rollup(function(v) { return v.length; })
      .entries(targetData)
      .map(function(d) {
          return {
            key: d.key,
            category: d.key.split("|")[0],
            attrib_value: d.key.split("|")[1],
            target_count: d.value
          }
      });

    let targetIdsCount = d3.nest()
      .key(function(d) { return d["temp_id"]; })
      .rollup(function(v) { return v.length; })
      .entries(targetData)
      .length;

    let randomCounts = d3.nest()
      .key(function(d) { return d[attrName+"_category"] + "|" + d[attrName]; })
      .rollup(function(v) { return v.length; })
      .entries(randomData)
      .map(function(d) {
          return {
            key: d.key,
            category: d.key.split("|")[0],
            attrib_value: d.key.split("|")[1],
            random_count: d.value
          }
      });

    let randomIdsCount = d3.nest()
      .key(function(d) { return d["temp_id"]; })
      .rollup(function(v) { return v.length; })
      .entries(randomData)
      .length;

    targetCounts.forEach(function(catEntryIndex) {
        if (targetIdsCount > 0) {
          catEntryIndex["target_pct"] = Math.round(100 * catEntryIndex["target_count"] / targetIdsCount);
        } else { catEntryIndex["target_pct"] = 0 }
        let randomResult = randomCounts.filter(function(catEntryRandom) {
            return catEntryRandom.key === catEntryIndex.key;
        });
        catEntryIndex["random_count"] = (randomResult[0] !== undefined) ? randomResult[0].random_count : 0;
        if (randomIdsCount > 0) {
          catEntryIndex["random_pct"] = Math.round(100 * catEntryIndex["random_count"] / randomIdsCount);
        } else { catEntryIndex["random_pct"] = 0 }

        if (catEntryIndex["random_pct"] > 0) {
          catEntryIndex["index"] = Math.round(100 * catEntryIndex["target_pct"] / catEntryIndex["random_pct"]);
        } else {catEntryIndex["index"] = 0}
    });

    if (bubble == true) {
      let indexArray = targetCounts
        .filter(d => ((d["index"] <= 500)))
      ;
    } else {
      let indexArray = targetCounts
        .filter(d => (d["index"] >= 100) & (d["index"] <= 500) & (d["target_pct"] > 5) )
      ;
    }





    return targetCounts;
}


/* for interests/retail, get the max indexing item for each category, and pick top 5 among that list */
function indexInterestsRetailTop5(indexDs, indexDs2 = null) {
  let f = indexDs.filter((d) => ( d.index <= 500 && d.target_pct >= 5))

  let a = d3.nest()
    .key(function(d) { return d["category"]; })
    .rollup(function(v) {
      let max_index = d3.max( v, function(d) { return d.index; } );
      let max_item = v.filter( d => ( d["index"] == max_index ) )
                      .sort(function(a,b) { return b.target_pct - a.target_pct; })[0];
      return {
        attrib_value: max_item.attrib_value,
        index: d3.max(v, function(d) { return d.index; }),
        target_pct: max_item.target_pct
      };
    })
    .entries(f)
    .map(function(d) {
        let comp;
        if (indexDs2 != null) {
          comp = indexDs2.filter(function(d2) { return d2.attrib_value === d.value.attrib_value })
        }

        return {
          category: d.key,
          attrib_value: d.value.attrib_value,
          target_pct: d.value.target_pct,
          index: d.value.index,
          compare_pct: (indexDs2 != null && comp[0] != undefined) ? comp[0].target_pct : 0,
          compare_index: (indexDs2 != null && comp[0] != undefined) ? comp[0].index : 0
        }
    })
    .sort(function(a,b){
      if ( b.index != a.index ){
        return b.index - a.index;
      } else {
        return b.target_pct - a.target_pct;
      }
    })
    .slice(0, 5);

    if (indexDs2 != null) {
        let c = a.map(function(d) {
            return {
              category: d.category,
              attrib_value: d.attrib_value,
              target_pct: d.compare_pct,
              random_pct: d.random_pct,
              index: d.compare_index
            }
        })

        return [a, c];
    } else {
      return a;
    }


}

function indexStatesTop5(indexDs1, indexDs2) {
  let a = [...indexDs1].filter( d => ( d["random_pct"] > 0 ) )
                      .sort(function(a,b){
                        if ( b.index != a.index ){
                          return b.index - a.index;
                        } else {
                          return b.target_pct - a.target_pct;
                        }
                      })
                      .slice(0, 5)
                      .map(function(d){
                        let comp = [...indexDs2].filter(d2 => (d2.attrib_value === d.attrib_value))
                        return {
                          attrib_value: getStateName(d.attrib_value),
                          target_pct: d.target_pct,
                          random_pct: d.random_pct,
                          index: d.index,
                          compare_pct: comp[0].target_pct,
                          compare_index: comp[0].index
                       }
                     });
  let c = a.map(function(d) {
      return {
        attrib_value: d.attrib_value,
        target_pct: d.compare_pct,
        random_pct: d.random_pct,
        index: d.compare_index
      }
  })

  return [a, c];
}


/* extract an array of values for the specified attribute */
function unpack(rows, key) {
  return rows.map(function(row) { return row[key]; });
}

/* get state name from state code */
function getStateName(stateCode) {
  return statesPaths.features.filter(d => ( d.properties.code == stateCode ) ).map(function(d){return d.properties.name;})[0];
}

/* get median category */
function getMedianCategory(indexDs) {
  let medianCat = '';
  let sum = 0;
  let i = 0;
  while (sum < 50) {
    medianCat = indexDs[i].attrib_value;
    sum += indexDs[i].target_pct;
    i++;
  }
  return medianCat;
}

/* get percentage of non-zero category values */
function getNonZeroPct(indexDs) {
  let zeroPct = indexDs
    .filter(function(d) { return d["attrib_value"] == "0"; })[0].target_pct;
  return 100 - zeroPct;
}








/* data for audience wave chart */
/*
const ageIndex0_copy = _.cloneDeep(ageIndex0);
ageIndex0.map(item => {item.attrib_name = "age"; return item;})
const genderIndex0_copy = _.cloneDeep(genderIndex0);
genderIndex0.map(item => {item.attrib_name = "gender"; return item;})
*/
//const ageIndex0_copy = _.cloneDeep(ageIndex0);
//ageIndex0.map(item => {item.attrib_name = "age"; return item;})
//allIndexes0 =
