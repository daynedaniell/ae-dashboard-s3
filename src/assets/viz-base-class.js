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
function parseData(targetAuds) {
    let t0 = performance.now();
    let activeView = dataConfig.config.activeView;
    showActiveFilter(dataConfig.config);
    /* Remove any active tooltips */
    d3.selectAll(".ds-tooltip").remove();

    let indexCats = makeIndexCats();
    let demogAttributesList = Object.keys(indexCats);

    let audData = [];

    /* Remove the current svg from each chart div */
    demogAttributesList.forEach(function(demogAttributeListName) {
        d3.select("#"+demogAttributeListName+"Chart svg").remove();
    });
    targetAuds.forEach(function(aud) {
        let targetData = {
            name: aud.name
        };
        demogAttributesList.forEach(function(demogAttributeListName) {
            let index;
            if (demogAttributeListName === "interests") {
                let randomI = store.getState().data.randomInterests;
                index = indexInterestsMedia(demogAttributeListName, aud.interests, randomI);
             } else if (demogAttributeListName === "media") {
                let randomM = store.getState().data.randomMedia;
                 index = indexInterestsMedia(demogAttributeListName, aud.media, randomM);
             } else {
                let randomD = store.getState().data.randomDemog;
                 index = indexAttr(demogAttributeListName, indexCats[demogAttributeListName], aud.demog, randomD);
             }

            targetData[demogAttributeListName] = index;
        });
        targetData["ageStat"] = getMedianCategory(targetData.age);
        targetData["childrenStat"] = getNonZeroPct(targetData.children);
        targetData["incomeStat"] = getMedianCategory(targetData.income);

        audData.push(targetData);
    });

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
    audData.forEach(function(aud) {
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
    });

    /*

    start of function to use config data for dispatching - need to handle audData.length values and the DNA outlier

    dataCategories.forEach(function(category) {
        if(category.getIndex) {
            myStore.dispatch(addDataToStore(category, getIndexArray(audData, category)));
        }
    })
    */

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
        myStore.dispatch(addDataToStore("gender", [audData[0].gender][0]));
        myStore.dispatch(addDataToStore("marital", [audData[0].marital][0]));
    }

    if (audData.length > 1) {
        myStore.dispatch(addDataToStore("interests", getTopIndexArray(audData, "interests")));
    } else {
        myStore.dispatch(addDataToStore("state", [audData[0].state][0]));
        myStore.dispatch(addDataToStore("interests", [audData[0].topInterests][0]));
        myStore.dispatch(addDataToStore("media", [audData[0].topMedia][0]));
    }

    /* Add Toggle-Ready HBar Charts for Comparison Views
   if (audData.length > 1) {
        (dataConfig.config["stateActive"][0] === 1)
            ? hBarChart("state", 630, getTopIndexArray(audData, "topStates", 0),hasToggle=true) : (dataConfig.config["stateActive"][0] === 2)
            ? hBarChart("state", 630,getTopIndexArray(audData, "topStates", 1),hasToggle=true) :
            hBarChart("state", 630,getTopIndexArray(audData, "topStates", 2),hasToggle=true);

        (dataConfig.config["interestsActive"][0] === 1)
            ? hBarChart("interests", 630, getTopIndexArray(audData, "topInterests", 0),hasToggle=true) : (dataConfig.config["interestsActive"][0] === 2)
            ? hBarChart("interests", 630,getTopIndexArray(audData, "topInterests", 1),hasToggle=true) :
            hBarChart("interests", 630,getTopIndexArray(audData, "topInterests", 2),hasToggle=true);

        (dataConfig.config["retailActive"][0] === 1)
            ? hBarChart("retail", 630, getTopIndexArray(audData, "topRetail", 0),hasToggle=true) : (dataConfig.config["retailActive"][0] === 2)
            ? hBarChart("retail", 630, getTopIndexArray(audData, "topRetail", 1),hasToggle=true) :
            hBarChart("retail", 630,getTopIndexArray(audData, "topRetail", 2),hasToggle=true);
    } else {
        mapChart("state", [audData[0].state][0]);
        hBarChart("interests", 630, [audData[0].topInterests][0]);
        hBarChart("retail", 630, [audData[0].topMedia][0])
    }

    $( ".tile" ).removeClass("selected-tile");

  //  bubbleChart('interests', getIndexArray(audData, "interests"));
  //  bubbleChart('retail', getIndexArray(audData, "retail"));

  //  addBubbleHighlighting('interests');
 //   addBubbleHighlighting('retail');
*/
    let t1 = performance.now();
    console.log("call to parseData took " + (t1 - t0) + ' milliseconds.');
}
/*
 processData builds the target audience object that gets passed to the parseData function
 */

function processData() {
    let t0 = performance.now();
    let targetAuds = [];
    let targetObj = {};
    let storeName = store.getState().data.audience.name;

    randomDemog = store.getState().data.randomDemog;
    randomInterests = store.getState().data.randomInterests;
    randomRetail = store.getState().data.randomRetail;
    targetObj.name = storeName;
    targetObj.demog = store.getState().data.demographics;
    targetObj.interests = store.getState().data.interests;
    targetObj.media = store.getState().data.media;

    targetAuds.push(targetObj);

    parseData(targetAuds);
    let t1 = performance.now();
    console.log("call to processData took " + (t1 - t0) + ' milliseconds.');
}

let statusPhase = 'initial';
     function getDataFiles() {
        /*
            get list of data files
            this list will be used to verify all the files have been processed
         */
        let fileList = dataConfig.files;
        let initFileList = [];
        let secondaryFileList = [];
        /*
            the initFileList array is the first group of files to be processed - the initial audience selected
            the secondaryFileList is the second group of files to be processed - the unselected audiences
         */
        fileList.forEach(function(file) {
            if(file.audience === dataConfig.config.activeAudience) {
                initFileList.push(file);
            } else {
                secondaryFileList.push(file);
            }
        });

        return new Promise(function(resolve, reject) {
            if(typeof (w) === "undefined") {
                let w = new Worker('lib/webWorker.js');

                if(statusPhase === 'initial') {
                    console.log('initial status phase');
                    w.postMessage({'cmd': 'setDataFileCount', 'msg': initFileList.length});
                    w.postMessage({'cmd': 'queueDataFiles', 'msg': initFileList});
                } else {
                    console.log('secondary status phase');
                    w.postMessage({'cmd': 'setDataFileCount', 'msg': secondaryFileList.length});
                    w.postMessage({'cmd': 'queueDataFiles', 'msg': secondaryFileList});
                }

                w.onmessage = function(event) {
                    switch(event.data.cmd) {
                        case "fileTransferComplete":
                            myStore.dispatch(addDataToStore(event.data.msg.title, event.data.msg.data));
                            if(statusPhase === 'initial') {
                                initFileList.splice(initFileList.indexOf(event.data.msg.title), 1);
                                if(initFileList.length === 0) {
                                    processData();
                                }
                            } else {
                                if(statusPhase === 'secondary') {
                                    secondaryFileList.splice(secondaryFileList.indexOf(event.data.msg.title), 1);
                                    if(secondaryFileList.length === 0) {
                                        console.log('processing data for secondary files');
                                        processData();
                                    }
                                }
                            }
                            if(initFileList.length === 0 && statusPhase === 'initial') {statusPhase = 'secondary'}
                            break;
                        case "transferFailed":
                            w.postMessage({'cmd': 'transferFailed'});
                            reject('transfer failed');
                            break;
                        case "transferCanceled":
                            w.postMessage({'cmd': 'transferCancelled'});
                            reject('transfer cancelled');
                            break;
                        case "queueStatus":
                            if(event.data.msg === 'full') {
                                w.postMessage({'cmd': 'getDataFiles'})
                            }
                            if(event.data.msg === 'fileCountSet') {
                                w.postMessage({'cmd': 'getDataFiles'})
                            }
                            break;
                        case "queueEmpty":
                            resolve('queueEmpty');
                            //processData();
                            break;
                        case 'transferStatus':
                          //  console.log('transfer status ' + event.data.msg);
                    }
                }
            }
        })
    } // end getDataFiles

    /**
     displayAudienceData function
     @input array of audience ids

     */
    function displayAudienceData(defaultSelected, selectedAudiences) {
        if(this.selectedAudienceArr.indexOf(selectedAudiences) !== -1) {
            this.selectedAudienceArr.push(selectedAudiences);
        } else {this.selectedAudienceArr.splice(this.selectedAudienceArr.indexOf(selectedAudiences))}
        // array must contain only unique values
     //   console.log('I was told to display audience data ' + this.selectedAudienceArr);
    }


export { getDataFiles }