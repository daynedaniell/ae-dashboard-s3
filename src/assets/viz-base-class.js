import * as dataConfig from '../../dataVis.json';
import * as d3 from 'd3';
import { store } from '../state-management/store';
import {  addDataToStore } from '../state-management/actions';
import $ from 'jquery';
import _ from 'lodash';

const myStore = store;
let randomDemog = [];
let randomInterests = [];
let randomRetail = [];
let finalObj = {};
const indexCats = makeIndexCats();
let initFileList = [];
let secondaryFileList = [];
let activeAudience = dataConfig.config.activeAudience;


/*
refactor this to make it not look stupid
 */
function makeObject(input) {
    let t0 = performance.now();
    for(let y in input) {
        if(y.includes('IndexCats')) {
            let result = y.split('IndexCats');
            finalObj[result[0]] = input[y]
        } else {
            finalObj[y] = [];
        }
    }
    let t1 = performance.now();
    console.log("call to makeObject took " + (t1 - t0) + ' milliseconds.');
    return finalObj;
}

/* Make ordered category arrays */
function makeIndexCats(){
    let index = dataConfig.indexAttributes;
    return makeObject(index);
}

function getCompIndexes(audData, attrName, targetNum) {
    let t0 = performance.now();
    let indexes = [audData[targetNum][attrName]];
    audData.forEach(function(aud, i) {
        if (i !== targetNum) {
            indexes.push(aud[attrName])
        }
    });
    let t1 = performance.now();
    console.log("call to getCompIndexes for " + attrName + ' took ' + (t1 - t0) + ' milliseconds.');
    return indexes
}

function getIndexArray(audData, attrName) {
    let indexes = [];
    audData.forEach(function(aud) {
        indexes.push(aud[attrName])
    });
    return indexes
}

function getStatArray(audData, attrName) {
    let stats = [];
    audData.forEach(function(aud) {
        stats.push(aud[attrName+"Stat"])
    });
    return stats
}

/*******************************************************************************
 *** ADD SERIES STATS ***********************************************************
 *******************************************************************************/
function addSeriesStats(attrName, statsArray, prefix='', suffix='') {
    // remove existing stats, if any
    let chart = $( "#" + attrName + "Chart" );

        chart.prev(".tile-header")
        .find(".ds-stats")
        .remove();

    let statString = "<div class='ds-stats'><span class='ds-stats-name'>" + prefix + "</span>"
    statsArray.forEach(function(stat, i) {
        statString += `<span class='ds-stat-${i+1}' style='color: ${dataConfig.config.seriesColors[i]}'>${stat} ${suffix}</span>`;
        if (i !== statsArray.length - 1) {
            statString += "<span style='float:left;margin:0 3px;'> | </span>"
        }
    });
    statString += "</div>";

    // add in stats
    chart.prev(".tile-header")
        .append(statString);
}


function addAudienceLegend(targetAuds) {
    if (dataConfig.config.activeView === 1) {
        $("#dsAudienceLegend1 .ds-audience-legend-color").css("background-color", dataConfig.config.colorOverIndex);
        $("#dsAudienceLegend1 .ds-audience-legend-label span").text("Over-Index");
        $("#dsAudienceLegend2 .ds-audience-legend-color").css("background-color", dataConfig.config.colorUnderIndex);
        $("#dsAudienceLegend2 .ds-audience-legend-label span").text("Under-Index");
        $("#dsAudienceLegend3 .ds-audience-legend-color").css({"background-color": dataConfig.config.colorZeroIndex, "display": "block"});
        $("#dsAudienceLegend3 .ds-audience-legend-label span").text("No Data");
        $("#dsAudienceLegend3 .ds-audience-legend-label span").css("display", "block");
    } else {
        targetAuds.forEach(function(aud, i) {
            console.log('active view is not 1');
            $(`#dsAudienceLegend${i+1} .ds-audience-legend-color`).css("background-color", dataConfig.config.seriesColors[i]);
            $(`#dsAudienceLegend${i+1} .ds-audience-legend-label span`).text(aud.name);
            $(`#dsAudienceLegend${i+1} .ds-audience-legend-color`).css("display", "block");
            $(`#dsAudienceLegend${i+1} .ds-audience-legend-label span`).css("display", "block");
        });
        if (targetAuds.length < dataConfig.config.seriesColors.length) {
            let i = targetAuds.length;
            while (i <= targetAuds.length) {
                $(`#dsAudienceLegend${i+1} .ds-audience-legend-color`).css("display", "none");
                $(`#dsAudienceLegend${i+1} .ds-audience-legend-label span`).css("display", "none");
                i += 1;
            }
        }
    }
}

function showActiveFilter(store) {
    let cat = null;
    if (store["activeFilter"] != null) {
        cat = store["activeFilter"][0];
        cat = cat[0].toUpperCase() + cat.slice(1);
        $(".ds-current-filter-remove").css("display", "inline");
        $(".ds-filter-tip").css("display","none");
    } else {
        $(".ds-filter-tip").css("display","");
        $(".ds-current-filter-remove").css("display", "none");
    }
    if (store.activeTab === "dashboard") {
        $(".ds-current-filter").text(store["activeFilter"] != null ? cat + ": " + store["activeFilter"][1] : "Click chart item to apply filter.");
    } else {
        $(".ds-filter-tip").css("display","none");
    }
}


function indexAttr(attrName, catsArray, targetData, randomData) {
    let t0 = performance.now();
    let targetCounts = d3.nest()
        .key(function(d) { return d[attrName]; })
        .rollup(function(v) { return v.length; })
        .entries(targetData);

    let targetNonMissTotal = d3.nest()
        .rollup(function(v) {
            return d3.sum(v, function(d) {
                if (d.key !== "") {return d.value;}
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
                if (d.key !== "") {return d.value;}
            });
        })
        .object(randomCounts);

    let indexArray = _.cloneDeep(catsArray);
/*
    indexArray is prior to data population
 */

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
    let t1 = performance.now();
    console.log("call to indexArray took " + (t1 - t0) + ' milliseconds.');
    return indexArray;
}

function getTopIndexArray(audData, attrName, audNum) {
    let t0 = performance.now();
    let indexes = [audData[audNum][attrName]];

    audData.forEach(function(aud, i) {
        if (audNum != i) {
            indexes.push(aud[attrName])
        }
    });
    let t1 = performance.now();
    console.log("call to getTopIndexArray took " + (t1 - t0) + ' milliseconds.');
    return indexes
}

/* calculate an array of pct and indexes for interests/retail */
function indexInterestsMedia(attrName, targetData, randomData, bubble=false) {
    let t0 = performance.now();
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

    if (bubble === true) {
        let indexArray = targetCounts
            .filter(d => ((d["index"] <= 300)))
        ;
    } else {
        let indexArray = targetCounts
            .filter(d => (d["index"] >= 100) & (d["index"] <= 300) & (d["target_pct"] > 5) )
        ;
    }
    let t1 = performance.now();
    console.log("call to indexInterestMedia took " + (t1 - t0) + ' milliseconds.');
    return targetCounts;
}


/* for interests/retail, get the max indexing item for each category, and pick top 5 among that list */
function indexInterestsMediaTop5(indexDs, indexDs2 = null, indexDs3 = null) {
    let t0 = performance.now();
    let f = indexDs.filter((d) => ( d.index <= 300 && d.target_pct >= 5));

    let a = d3.nest()
        .key(function(d) { return d["category"]; })
        .rollup(function(v) {
            let max_index = d3.max( v, function(d) { return d.index; } );
            let max_item = v.filter( d => ( d["index"] === max_index ) )
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
            let comp2;
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
                compare_pct: (indexDs2 != null && comp[0] !== undefined) ? comp[0].target_pct : 0,
                compare_index: (indexDs2 != null && comp[0] !== undefined) ? comp[0].index : 0,
                compare2_pct: (indexDs3 != null && comp2[0] !== undefined) ? comp2[0].target_pct : 0,
                compare2_index: (indexDs3 != null && comp2[0] !== undefined) ? comp2[0].index : 0
            }
        })
        .sort(function(a,b){
            if ( b.index !== a.index ){
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
        let t1 = performance.now();
        console.log("call to indexInterestMediaTop5 took " + (t1 - t0) + ' milliseconds.');
        return a;
    }
}

function indexStatesTop5(indexDs1, indexDs2, indexDs3 = null) {
    let t0 = performance.now();
    let triple = indexDs3 != null;
    let a = [...indexDs1].filter( d => ( d["random_pct"] > 0 ) )
        .sort(function(a,b){
            if ( b.index !== a.index ){
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
    let t1 = performance.now();
    console.log("call to indexStatesTop5 took " + (t1 - t0) + ' milliseconds.');

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
    let t0 = performance.now();
    let medianCat = '';
    let sum = 0;
    let i = 0;
    while (sum < 50 && i <= indexDs.length) {
        medianCat = indexDs[i].attrib_value;
        sum += indexDs[i].target_pct;
        i++;
    }
    let t1 = performance.now();
    console.log("call to getMedianCategory took " + (t1 - t0) + ' milliseconds.');
    return medianCat;
}

/* get percentage of non-zero category values */
function getNonZeroPct(indexDs) {
    let zeroPct = indexDs
        .filter(function(d) { return d["attrib_value"] == "0"; })[0].target_pct;
    return 100 - zeroPct;
}

/*
main function to generate data for charts
 */
function parseData(targetAud) {
    let t0 = performance.now();
    let activeView = dataConfig.config.activeView;
    let demogAttributesList = Object.keys(indexCats);
    let audience = store.getState().data[targetAud];
    let audData = [];
    showActiveFilter(dataConfig.config);
    /* Remove any active tooltips */

    let audienceNameObj = _.find(audience, function(a) { return a.title === "audience"});
    let audienceInterests = _.find(audience, function(a) { return a.title === "interests"});
    let audienceMedia = _.find(audience, function(a) { return a.title === "media"});
    let audienceDemographics = _.find(audience, function(a) { return a.title === "demographics"});

        let targetData = {
            name: audienceNameObj.data.name
        };

        let demoI;
        for(demoI = 0; demoI < demogAttributesList.length; demoI++){
            let demogAttributeListName = demogAttributesList[demoI];
            let index;
            console.log(demogAttributeListName);
            if (demogAttributeListName === "interests") {
                let randomI = _.find(audience, function(a) { return a.title === "randomInterests"});
                index = indexInterestsMedia(demogAttributeListName, audienceInterests.data, randomI.data);
            } else if (demogAttributeListName === "media") {
                let randomM = _.find(audience, function(a) { return a.title === "randomMedia"});
                index = indexInterestsMedia(demogAttributeListName, audienceMedia.data, randomM.data);
            } else {
                let randomD = _.find(audience, function(a) { return a.title === "randomDemog"});
                index = indexAttr(demogAttributeListName, indexCats[demogAttributeListName], audienceDemographics.data, randomD.data);
            }

            targetData[demogAttributeListName] = index;
        }

        targetData["ageStat"] = getMedianCategory(targetData.age);
        targetData["childrenStat"] = getNonZeroPct(targetData.children);
        targetData["incomeStat"] = getMedianCategory(targetData.income);

        audData.push(targetData);


    audData.forEach(function(aud, i) {
        if (audData.length > 1) {
            aud["topStates"] = indexStatesTop5(...getCompIndexes(audData, "state", i));
            aud["topInterests"] = indexInterestsMediaTop5(...getCompIndexes(audData, "interests", i));
            aud["topMedia"] = indexInterestsMediaTop5(...getCompIndexes(audData, "media", i));
        } else {
            aud["topInterests"] = [indexInterestsMediaTop5(...getCompIndexes(audData, "interests", i))];
            aud["topMedia"] = [indexInterestsMediaTop5(...getCompIndexes(audData, "media", i))];
        }
    });

    let indexes = [];
    let audI;
    for(audI = 0; audI < audData.length; audI++){
        let aud = audData[audI];
        indexes.push({
            age: aud.age,
            gender: aud.gender,
            ethnicity: aud.ethnicity,
            children: aud.children,
            education: aud.education,
            income: aud.income,
            state: aud.state,
            interests: aud.topInterests[0],
            media: aud.topMedia[0]
        });
    }

    myStore.dispatch(addDataToStore("dna", indexes));
    myStore.dispatch(addDataToStore("age", getIndexArray(audData, "age")));
    myStore.dispatch(addDataToStore("ethnicity", getIndexArray(audData,"ethnicity")));
    myStore.dispatch(addDataToStore("children", getIndexArray(audData, "children")));
    myStore.dispatch(addDataToStore("education", getIndexArray(audData, "education")));
    myStore.dispatch(addDataToStore("income", getIndexArray(audData, "income")));

    if(audData.length > 1) {
        myStore.dispatch(addDataToStore("gender", getIndexArray(audData, "gender")));
        myStore.dispatch(addDataToStore("marital", getIndexArray(audData, "marital")));
    } else {
        console.log(audData[0].gender);
        myStore.dispatch(addDataToStore("gender", audData[0].gender));
        myStore.dispatch(addDataToStore("marital", audData[0].marital));
    }

    if (audData.length > 1) {
        myStore.dispatch(addDataToStore("interests", getTopIndexArray(audData, "interests")));
    } else {
        myStore.dispatch(addDataToStore("state", [audData[0].state][0]));
        myStore.dispatch(addDataToStore("interests", [audData[0].topInterests][0]));
        myStore.dispatch(addDataToStore("media", [audData[0].topMedia][0]));
    }

    let t1 = performance.now();
    console.log("call to parseData took " + (t1 - t0) + ' milliseconds.');
}

let targetObject = {};
function buildTargetObject(audienceDataPoint) {
    if(audienceDataPoint === 'randomDemog' || audienceDataPoint === 'randomInterests' || audienceDataPoint === 'randomRetail') {
        return;
    }
    targetObject[audienceDataPoint] = store.getState().data[audienceDataPoint];

    if(initFileList.length === 0 && statusPhase === 'initial') {
        let targetAuds = [];
        randomDemog = store.getState().data.randomDemog;
        randomInterests = store.getState().data.randomInterests;
        randomRetail = store.getState().data.randomRetail;
        console.log('processing data');
        targetAuds.push(targetObject);
        parseData(targetAuds);
        statusPhase = 'secondary'}

    if(initFileList.length === 0 && statusPhase === 'secondary') {
        //we're processing the secondary files now
        if(secondaryFileList.length === 0 ) {
            let targetAuds = [];
            targetAuds.push(targetObject);
            parseData(targetAuds);
        }
    }
}

/**
 * statusPhase
 * @type {string}
 */
let statusPhase = 'initial';

/**
 *  getDataFiles()
 */
     function initializeWorker() {
        let worker;
            if(typeof (Worker) !== "undefined") {
                if(typeof(worker) === "undefined") {
                    worker = new Worker('lib/webWorker.js');
                }
                worker.postMessage({'cmd': 'configFile', 'msg': JSON.stringify(dataConfig)});

                worker.onmessage = function(event) {
                    switch(event.data.cmd) {
                        case "fileTransferComplete":
                            // save data to Redux store
                             myStore.dispatch(addDataToStore(event.data.msg.title, event.data.msg.data));
                             // don't keep this here forever - for testing only
                             if(event.data.msg.title === "audience1") {
                                 parseData(event.data.msg.title);
                             }

                            break;
                        case "transferFailed":
                            worker.postMessage({'cmd': 'transferFailed'});
                            reject('transfer failed');
                            break;
                        case "transferCanceled":
                            worker.postMessage({'cmd': 'transferCancelled'});
                            reject('transfer cancelled');
                            break;
                        case "queueEmpty":
                          //  processData();
                            break;
                        case 'transferStatus':
                          //  console.log('transfer status ' + event.data.msg);
                    }
                }
            }

    } // end getDataFiles



export { initializeWorker }