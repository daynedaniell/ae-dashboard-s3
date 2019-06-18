export class Visualization {
    constructor() {

        this.colorSeries1 =  "#4d3c96";
        this.colorSeries2 =  "#0fbbc1";
        this.colorSeries3 =  "#ff9999";

        this.DS_VIS_STORE = {
            activeFilter: null,
            stateActive: [1,2,3],
            interestsActive: [1,2,3],
            mediaActive: [1,2,3],
            activeView: 1,
            activeTab: 'dashboard',
            scaleWeight: 1,
            seriesColors: [this.colorSeries1,this.colorSeries2,this.colorSeries3],
            dnaBarWidths: [4,3,2]
        }
    }



    /*******************************************************************************
     *** Tooltips *******************************************************************
     *******************************************************************************/
     addTooltip(tooltipNode, htmlString, xOffset, yOffset) {
        let e = window.event;
        var x = e.clientX,
            y = e.clientY;

        let tipY = (y + yOffset) + 'px';
        let tipX = (x + xOffset) + 'px';

        // Move tooltip to the left of the cursor if it gets too close to right edge
        if  (window.innerWidth - x < 200) {
            tipX = (x - 130) + 'px';
        }

        tooltipNode.html(htmlString)
            .style("opacity", .9)
            .style('left', `${(tipX)}`)
            .style('top', `${(tipY)}`);
    }

    //end tooltip


    /* Make ordered cartegory arrays */
    makeIndexCats(){
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
            {attrib_value: 'Alabama', target_count: 0, random_count: 0},
            {attrib_value: 'Alaska', target_count: 0, random_count: 0},
            {attrib_value: 'Arizona', target_count: 0, random_count: 0},
            {attrib_value: 'Arkansas', target_count: 0, random_count: 0},
            {attrib_value: 'California', target_count: 0, random_count: 0},
            {attrib_value: 'Colorado', target_count: 0, random_count: 0},
            {attrib_value: 'Connecticut', target_count: 0, random_count: 0},
            {attrib_value: 'Delaware', target_count: 0, random_count: 0},
            {attrib_value: 'District of Columbia', target_count: 0, random_count: 0},
            {attrib_value: 'Florida', target_count: 0, random_count: 0},
            {attrib_value: 'Georgia', target_count: 0, random_count: 0},
            {attrib_value: 'Hawaii', target_count: 0, random_count: 0},
            {attrib_value: 'Idaho', target_count: 0, random_count: 0},
            {attrib_value: 'Illinois', target_count: 0, random_count: 0},
            {attrib_value: 'Indiana', target_count: 0, random_count: 0},
            {attrib_value: 'Iowa', target_count: 0, random_count: 0},
            {attrib_value: 'Kansas', target_count: 0, random_count: 0},
            {attrib_value: 'Kentucky', target_count: 0, random_count: 0},
            {attrib_value: 'Louisiana', target_count: 0, random_count: 0},
            {attrib_value: 'Maine', target_count: 0, random_count: 0},
            {attrib_value: 'Maryland', target_count: 0, random_count: 0},
            {attrib_value: 'Massachusetts', target_count: 0, random_count: 0},
            {attrib_value: 'Michigan', target_count: 0, random_count: 0},
            {attrib_value: 'Minnesota', target_count: 0, random_count: 0},
            {attrib_value: 'Mississippi', target_count: 0, random_count: 0},
            {attrib_value: 'Missouri', target_count: 0, random_count: 0},
            {attrib_value: 'Montana', target_count: 0, random_count: 0},
            {attrib_value: 'Nebraska', target_count: 0, random_count: 0},
            {attrib_value: 'Nevada', target_count: 0, random_count: 0},
            {attrib_value: 'New Hampshire', target_count: 0, random_count: 0},
            {attrib_value: 'New Jersey', target_count: 0, random_count: 0},
            {attrib_value: 'New Mexico', target_count: 0, random_count: 0},
            {attrib_value: 'New York', target_count: 0, random_count: 0},
            {attrib_value: 'North Carolina', target_count: 0, random_count: 0},
            {attrib_value: 'North Dakota', target_count: 0, random_count: 0},
            {attrib_value: 'Ohio', target_count: 0, random_count: 0},
            {attrib_value: 'Oklahoma', target_count: 0, random_count: 0},
            {attrib_value: 'Oregon', target_count: 0, random_count: 0},
            {attrib_value: 'Pennsylvania', target_count: 0, random_count: 0},
            {attrib_value: 'Rhode Island', target_count: 0, random_count: 0},
            {attrib_value: 'South Carolina', target_count: 0, random_count: 0},
            {attrib_value: 'South Dakota', target_count: 0, random_count: 0},
            {attrib_value: 'Tennessee', target_count: 0, random_count: 0},
            {attrib_value: 'Texas', target_count: 0, random_count: 0},
            {attrib_value: 'Utah', target_count: 0, random_count: 0},
            {attrib_value: 'Vermont', target_count: 0, random_count: 0},
            {attrib_value: 'Virginia', target_count: 0, random_count: 0},
            {attrib_value: 'Washington', target_count: 0, random_count: 0},
            {attrib_value: 'West Virginia', target_count: 0, random_count: 0},
            {attrib_value: 'Wisconsin', target_count: 0, random_count: 0},
            {attrib_value: 'Wyoming', target_count: 0, random_count: 0}
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
            media: []
        };
    }

    /*******************************************************************************
     *** Apply Filter ***************************************************************
     *******************************************************************************/
    applyFilter(attrName, attrValue, shapeString, targetAuds) {
        /* update all charts when user selects a single bar in this chart */
        /* if clicking on already selected item, then reset the charts */
        isSelected = d3.select(".selected-tile #"+attrName+"Chart " + shapeString + "[attrib-value='"+attrValue+"'][selected='yes']")._groups[0][0];

        if (isSelected){
            DS_VIS_STORE["activeFilter"] = null;
            drawCharts(targetAuds);

            showActiveFilter(DS_VIS_STORE);
        } else {
            updateCharts(attrName, attrValue, targetAuds);
            showActiveFilter(DS_VIS_STORE);
        }
    }

    /*******************************************************************************
     *** Main Toggle Function *******************************************************
     *******************************************************************************/
    toggleFromStore(store, key) {
        /* Takes in the store and a key and switches position of elements in an array */
        tmp1 = store[key][0];
        tmp2 = store[key][1];
        store[key][0] = tmp2;
        store[key][1] = tmp1;
    }

    indexInterestsMedia(attrName, targetData, randomData, bubble=false) {
    var t0 = performance.now();
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

    var t1 = performance.now()
    console.log("maths: ", t1 - t0)

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
                .filter(d => ((d["index"] <= 300)))
            ;
        } else {
            let indexArray = targetCounts
                .filter(d => (d["index"] >= 100) & (d["index"] <= 300) & (d["target_pct"] > 5) )
            ;
        }

        return targetCounts;
    }

    /* for interests/media, get the max indexing item for each category, and pick top 5 among that list */
    indexInterestsMediaTop5(indexDs, indexDs2 = null, indexDs3 = null) {
        let f = indexDs.filter((d) => ( d.index <= 300 && d.target_pct >= 5));

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
                    comp = indexDs2.filter(function(d2) { return d2.index <= 300 && d2.attrib_value === d.value.attrib_value })
                }

                if (indexDs3 != null) {
                    comp2 = indexDs3.filter(function(d3) { return d3.index <= 300 && d3.attrib_value === d.value.attrib_value })
                }

                return {
                    category: d.key,
                    attrib_value: d.value.attrib_value,
                    target_pct: d.value.target_pct,
                    index: d.value.index,
                    compare_pct: (indexDs2 != null && comp[0] != undefined) ? comp[0].target_pct : 0,
                    compare_index: (indexDs2 != null && comp[0] != undefined) ? comp[0].index : 0,
                    compare2_pct: (indexDs3 != null && comp2[0] != undefined) ? comp2[0].target_pct : 0,
                    compare2_index: (indexDs3 != null && comp2[0] != undefined) ? comp2[0].index : 0
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
            });
            if (indexDs3 != null) {
                let c2 = a.map(function(d) {
                    return {
                        category: d.category,
                        attrib_value: d.attrib_value,
                        target_pct: d.compare2_pct,
                        random_pct: d.random_pct,
                        index: d.compare2_index
                    }
                });
                return [a, c, c2]
            } else {
                return [a, c]
            }

        } else {
            return a;
        }
    }

    indexStatesTop5(indexDs1, indexDs2, indexDs3 = null) {
        let triple = indexDs3 != null;
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
                let comp = [...indexDs2].filter(d2 => (d2.attrib_value === d.attrib_value));
                let comp2 = triple ? [...indexDs3].filter(d3 => (d3.attrib_value === d.attrib_value)) : null;
                return {
                    attrib_value: getStateName(d.attrib_value),
                    target_pct: d.target_pct,
                    random_pct: d.random_pct,
                    index: d.index,
                    compare_pct: comp[0].target_pct,
                    compare_index: comp[0].index,
                    compare2_pct: triple ? comp2[0].target_pct : null,
                    compare2_index: triple ? comp2[0].index : null
                }
            });

        let c = a.map(function(d) {
            return {
                attrib_value: d.attrib_value,
                target_pct: d.compare_pct,
                random_pct: d.random_pct,
                index: d.compare_index
            }
        });

        if (triple === true) {
            let c2 = a.map(function(d) {
                return {
                    attrib_value: d.attrib_value,
                    target_pct: d.compare2_pct,
                    random_pct: d.random_pct,
                    index: d.compare2_index,
                }
            });
            return [a, c, c2]
        }

        return [a, c];
    }


    /* extract an array of values for the specified attribute */
    unpack(rows, key) {
        return rows.map(function(row) { return row[key]; });
    }

    /* get state name from state code */
    getStateName(stateCode) {
        return statesPaths.features.filter(d => ( d.properties.name == stateCode ) ).map(function(d){return d.properties.name;})[0];
    }

    getIndexArray(audData, attrName) {
        let indexes = [];
        audData.forEach(function (aud) {
            indexes.push(aud[attrName])
        });
        return indexes
    }

    /* get median category */
    getMedianCategory(indexDs) {
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
    getNonZeroPct(indexDs) {
        let zeroPct = indexDs
            .filter(function(d) { return d["attrib_value"] == "0"; })[0].target_pct;
        return 100 - zeroPct;
    }
}
