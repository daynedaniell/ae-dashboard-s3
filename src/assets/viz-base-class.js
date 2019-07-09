import * as dataConfig from '../../dataVis.json';
import * as d3 from 'd3';
import { DataProcessing } from '../lib/data-processing';

let randomDemog = [];
let randomInterests = [];
let randomRetail = [];
export let audienceTitles = [];

let formatAsInteger = d3.format(",");
/*
    returnProp function
    data sources are either json or tsv data
    if the source is json, it returns the property defined
    otherwise, it returns the full data set
 */
function returnProp(obj, isJson, prop) {
    let propObj = dataStore.get(obj);
    let name = null;
    if(propObj && isJson) {
        name = propObj.data;
    } else {
        name = propObj;
    }
    if(prop && isJson){
        return name[prop];
    } else {
        return name;
    }
}

/*
DataCache class
acts as a data store for visualization data
 */
class DataCache {
    constructor(){
        if(! DataCache.instance){
            this._data = [];
            DataCache.instance = this;
        }
        return DataCache.instance;
    }
    add(item){
        this._data.push(item);
    }
    get(id){
        return this._data.find(d => d.id === id);

    }
}

// primary dataStore for data returned from the webworker
const dataStore = new DataCache();
Object.freeze(dataStore);
export default dataStore;
const chartData = new DataCache();

var finalObj = {};

/*
refactor this to make it not look stupid
 */
function makeObject(input) {
    console.log(typeof input);
    for(y in input) {
        //console.log(input[y])
        if(y.indexOf('IndexCats') !== -1) {
            var result = y.split('IndexCats');
            finalObj[result[0]] = input[y]
        } else {
            finalObj[y] = [];
        }
    } return finalObj;
}

/* Make ordered category arrays */
function makeIndexCats(){
    /*
        1. get the array from the dataConfig
        2. index.forEach(category) {
            if category[key] contains "IndexCats",
            get characters before IndexCats and set object to
            char : index. + char + 'IndexCats'
            or if not contains "IndexCats", set char: []
            3. return object
     */
    var index = dataConfig.indexAttributes;
    return makeObject(index);
}

function getCompIndexes(audData, attrName, targetNum) {
    let indexes = [audData[targetNum][attrName]];
    audData.forEach(function(aud, i) {
        if (i !== targetNum) {
            indexes.push(aud[attrName])
        }
    });
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










function hBarChart(attrName, innerWidth, indexArray, hasToggle=false) {
    if (dataConfig.config.activeView === 1) {
        $("#"+attrName+"Chart .ds-toggle-button").css("display", "none");
        $("#"+attrName+"Chart .ds-hbar-status").text("Top 5 By Index");
    }

    let newIndexArray;
    if (hasToggle=== true) {
        let newIndexArray = [];
        let compIndexArray = [];
        indexArray[0].forEach(function(aud) {
            newIndexArray.push(aud)
        });
    } else {
        newIndexArray = indexArray.slice();
    }

    let numSeries = dataConfig.config.activeView;

    let basics = barChartSetup(innerWidth);
    let margin = basics.margin,
        width = basics.width * dataConfig.config["scaleWeight"] +30,
        height = basics.height * dataConfig.config["scaleWeight"] + 10,
        barPadding = basics.barPadding;

    let firstDatasetBarChart = newIndexArray[0];
    let maxAttrLength = width / 2.25;

    let yScale = d3.scaleLinear()
        .domain([0, firstDatasetBarChart.length])
        .range([0, height]);

    let xScale = d3.scaleLinear()
        .domain([0, 100])
        .range([0, width-maxAttrLength]);

    let barHeight = height / (firstDatasetBarChart.length * numSeries) - barPadding;


    /* Create SVG element */
    let svg = d3.select("#"+attrName+"Chart")
        .append("svg")
        .attr("width", width + margin.left + margin.right + 15) // Adjusted to fit axis
        .attr("height", height + margin.top + margin.bottom)
        .attr("id", attrName+"ChartPlot")
        .attr("class", "ds-chart-base");

    const tooltip = d3.select("#"+attrName+"Chart")
        .append("div")
        .attr("class", "ds-tooltip")
        .style("opacity", 0);

    /* Add horizontal grid lines */
    function make_x_gridlines() {
        return d3.axisBottom(xScale)
            .ticks(5)
    }

    svg.append("g")
        .attr("class", "ds-grid")
        .attr("transform", "translate(" + (margin.left + maxAttrLength - 1) + "," + (margin.top + height - 1) + ")")
        .call(make_x_gridlines()
            .tickSize(-height)
            .tickFormat("")
        )

    let plot = svg.append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");


    function drawHbar(data, series, color) {
        plot.selectAll("rect.series"+(series+1))
            .data(data)
            .enter()
            .append("rect")
            .attr("class", "series"+(series+1))
            .attr("x", function(d) {
                return maxAttrLength;
            })
            .attr("height", barHeight)
            .attr("y", function(d, i) {
                return yScale(i) + barHeight*series;
            })
            .attr("width", function(d) {
                return xScale(d.target_pct);
            })
            .attr("fill", numSeries > 1 ? color : function(d) { return colorByIndexBar(d.index) })
            .attr("attrib-value", function(d) { return d.attrib_value; })    /* storing the Acxiom attrib value on the element */
            .on("mouseover", mouseover)
            .on("mouseout", mouseout)
            .on("mousemove", mouseover)
            .attr("attrib-category", function(d) { return d.category; })
            .attr("target-pct", function(d) { return d.target_pct; })
            .attr("index", function(d) { return d.index; })
        ;
    }

    function addHbarText(data, series) {
        plot.selectAll("text.series"+(series+1))
            .data(data)
            .enter()
            .append("text")
            .attr("class", "series"+(series+1))
            .text(function(d) {
                return formatAsInteger(d3.format("d")(d.index));
            })
            .attr("text-anchor", "middle")
            .attr("dominant-baseline", "middle")
            /* Set y position to the top edge of each bar plus half the bar width */
            .attr("y", function(d, i) {
                return yScale(i) + (barHeight * series + barPadding * series) + (barHeight / 2);
            })
            .attr("x", function(d) { return textInside(d) ? maxAttrLength + xScale(d.target_pct) - 20 : maxAttrLength + xScale(d.target_pct) + 20 })
            .attr("font-family", "sans-serif")
            .attr("font-size", "11px")
            .attr("fill", function(d) { return textInside(d) ? "white" : "#505050" })
            .on("mouseover", mouseover)
            .on("mouseout", mouseout)
            .on("mousemove", mouseover);
    }

    newIndexArray.forEach(function(aud, i) {
        if (aud != null) {
            drawHbar(aud, i, numSeries > 1 ? dataConfig.config[attrName+"Colors"][i] : null);
            addHbarText(aud, i);
        }

    });


    /* Will set x position and color dependent on size of bar */
    function textInside(d) { return xScale(d.target_pct) > 30}


    /* Add y labels to chart */
    let yLabels = svg.append("g")
        .attr("transform", "translate(" + (margin.left - 30) + "," + (margin.top)  + ")");

    yLabels.selectAll("text.yAxis")
        .data(firstDatasetBarChart)
        .enter()
        .append("text")
        .text(function(d) {
            let yLabel = d.attrib_value;
            if (d.attrib_value.length > 30) {
                yLabel = yLabel.slice(0, 30) + "...";
            }
            return yLabel;
        })
        .attr("text-anchor", "start")
        /* Set y position to the top edge of each bar plus half the bar width */
        .attr("y", function(d, i) {
            return (i * (height / firstDatasetBarChart.length)) + ((height / firstDatasetBarChart.length - barPadding) / 2);
        })
        .attr("x", 66)
        .attr("class", "yAxis");
    //.call(wrap, 200, '-', type = 'hbar');

    yLabels.selectAll("text.ranking")
        .data([ 1, 2, 3, 4, 5])
        .enter()
        .append("text")
        .attr("class", "ranking")
        .text(function(d) {
            return "#" + d;
        })
        .attr("fill", "#81838c")
        .attr("font-size", "36px")
        .attr("text-anchor", "start")
        /* Set y position to the top edge of each bar plus half the bar width */
        .attr("y", function(d, i) {
            return (i * (height / newIndexArray[0].length))
                + ((height / newIndexArray[0].length - barPadding) / 2)
                + 10;
        })
        .attr("x", 0)
        .attr("class", "yAxis");

    /* Add x-axis */
    let xAxis = d3.axisBottom(xScale)
        .tickSize(0)
        .ticks(5)
        .tickFormat(function (d) { return d + "%" });

    let xAxisElement = svg.append("g")
        .attr("class", "xAxis")
        .attr("transform", "translate(" + (margin.left - 1 + maxAttrLength) + "," + (margin.top + height - 1) + ")")
        .call(xAxis);

    function changeToggleText(audNumber) {
        // Change the toggle text to represent the selected audience
        $("#"+attrName+"Chart .ds-hbar-status").text(function() {
            let aud = (audNumber === 1) ? targetAud.name : audNumber === 2 ? targetAud2.name : targetAud3.name;
            return "Top 5 for " + aud + " (by Index)";

        });
    }
    /* Remove vertical and extra horizontal gridlines */
    svg.selectAll(".domain").remove();

    if (hasToggle === true) {
        /* Add the toggle button */
        addCompareToggle(attrName);

        /* Organize the data based on the current selected audience */
        let inp = [indexArray[0],indexArray[1],indexArray[2]];
        let idx1 = dataConfig.config[attrName+"Active"].indexOf(1);
        let idx2 = dataConfig.config[attrName+"Active"].indexOf(2);
        let idx3 = dataConfig.config[attrName+"Active"].indexOf(3);
        let trans = [inp[idx1],inp[idx2],inp[idx3]];

        /* Toggle Comparison Charts on click */
        $("#"+attrName+"Chart .ds-toggle-button .ds-t1").unbind().click(function() {
            dataConfig.config[attrName+"Active"] = [1,2,3];
            dataConfig.config[attrName+"Colors"] = [colorSeries1, colorSeries2, colorSeries3];
            $(this).toggleClass("active",true);
            $("#"+attrName+"Chart .ds-toggle-button .ds-t2").toggleClass("active",false);
            $("#"+attrName+"Chart .ds-toggle-button .ds-t3").toggleClass("active",false);
            changeToggleText(1);
            toggleComparisonCharts(attrName, [trans[0],trans[1],trans[2]]);
        });

        $("#"+attrName+"Chart .ds-toggle-button .ds-t2").unbind().click(function() {
            dataConfig.config[attrName+"Active"] = [2,1,3];
            dataConfig.config[attrName+"Colors"] = [colorSeries2, colorSeries1, colorSeries3];
            $(this).toggleClass("active",true);
            $("#"+attrName+"Chart .ds-toggle-button .ds-t1").toggleClass("active",false);
            $("#"+attrName+"Chart .ds-toggle-button .ds-t3").toggleClass("active",false);
            changeToggleText(2);
            toggleComparisonCharts(attrName, [trans[1],trans[0],trans[2]]);
        });

        $("#"+attrName+"Chart .ds-toggle-button .ds-t3").unbind().click(function() {
            dataConfig.config[attrName+"Active"] = [3,1,2];
            dataConfig.config[attrName+"Colors"] = [colorSeries3, colorSeries1, colorSeries2];
            $(this).toggleClass("active",true);
            $("#"+attrName+"Chart .ds-toggle-button .ds-t2").toggleClass("active",false);
            $("#"+attrName+"Chart .ds-toggle-button .ds-t1").toggleClass("active",false);
            changeToggleText(3);
            toggleComparisonCharts(attrName, [trans[2],trans[0],trans[1]]);
        });

        function toggleComparisonCharts(attrName, toggleIndexArray) {
            /*
              The toggle is currently set to transition to the newly selected audience.
              If we don't want this, we can just redraw using the below for an instant transition.
                d3.select("#"+attrName+"Chart svg").remove();
                $("#"+attrName+"Chart .ds-toggle-button .ds-triple-toggle").remove();
                hBarMultiSeriesChart(attrName,out[0],out[1],out[2]);
            */

            plot = d3.select("#"+attrName+"Chart");

            /* Draw in the required bars and text with the functions below */

            function addCompHbar(plot, series, aud, maxAttrLength, barHeight, xScale, yScale, color) {
                plot.selectAll("rect.series"+(series+1))
                    .data(aud)
                    .transition()
                    .duration(600)
                    .attr("class", "series"+(series+1))
                    .attr("x", function(d) {
                        return maxAttrLength;
                    })
                    .attr("height", barHeight)
                    .attr("y", function(d, i) {
                        return (series == 0) ? yScale(i) : (series == 1) ? yScale(i) + barHeight : yScale(i) + barHeight*2;
                    })
                    .attr("width", function(d) {
                        return xScale(d.target_pct);
                    })
                    .attr("fill", function(d) {
                        return color;
                    })
                    .attr("attrib-value", function(d) { return d.attrib_value; })    /* storing the Acxiom attrib value on the element */
                    .attr("attrib-category", function(d) { return d.category; })
                    .attr("target-pct", function(d) { return d.target_pct; })
                    .attr("index", function(d) { return d.index; })
                ;

            }

            function addCompHbarText(plot, series, aud, barHeight, barPadding, maxAttrLength) {
                plot.selectAll("text.series"+(series+1))
                    .data(aud)
                    .transition()
                    .duration(600)
                    .text(function(d) {
                        return formatAsInteger(d3.format("d")(d.index));
                    })
                    .attr("class", "series"+(series+1))
                    .attr("text-anchor", "middle")
                    /* Set y position to the top edge of each bar plus half the bar width */
                    .attr("y", function(d, i) {
                        if (series == 0) {
                            return (i * numSeries * (barHeight + barPadding) + barHeight / 2 + barPadding * 2);
                        } else if (series == 1) {
                            return (i * numSeries * (barHeight + barPadding) + barHeight * 1.5 + barPadding * 2);
                        } else if (series == 2) {
                            return (i * numSeries * (barHeight + barPadding) + barHeight + barHeight * 1.5 + barPadding * 2);
                        }

                    })
                    .attr("x", function(d) { return textInside(d) ? maxAttrLength + xScale(d.target_pct) - 20 : maxAttrLength + xScale(d.target_pct) + 20 })
                    .attr("font-family", "sans-serif")
                    .attr("font-size", "11px")
                    .attr("fill", function(d) { return textInside(d) ? "white" : "#505050" });
            }

            toggleIndexArray[0].forEach(function(aud, i) {
                if (aud != null) {
                    addCompHbar(plot, i, aud, maxAttrLength, barHeight, xScale, yScale, dataConfig.config[attrName+"Colors"][i]);
                    addCompHbarText(plot, i, aud, barHeight, barPadding, maxAttrLength);
                }
            });

            plot.selectAll("text.yAxis")
                .data(toggleIndexArray[0][0])
                .transition()
                .duration(600)
                .attr("class", "series1 yAxis")
                .text(function(d) {
                    let yLabel = d.attrib_value;
                    if (d.attrib_value.length > 26) {
                        yLabel = yLabel.slice(0, 26) + "...";
                    }
                    return yLabel;
                })
                .attr("fill", function(d) {
                    return dataConfig.config[attrName+"Colors"][0];
                })
                .attr("text-anchor", "start")
                /* Set y position to the top edge of each bar plus half the bar width */
                .attr("y", function(d, i) {
                    return (i * numSeries * (barHeight + barPadding) + barHeight * numSeries/2 + barPadding * 2);
                })
                .attr("x", 66);
        }
    }


    function mouseover(d) {
        let htmlString = d.attrib_value + "<br/>" + "<br/>" + "Category: " + d.category + "<br/>" + "Target Pct: " + d.target_pct + "%<br/>"  + "Index: " + d.index
        addTooltip(tooltip, htmlString, 0, -90);
    }

    function mouseout() {
        // Hide tooltip when the mouse leaves the element
        tooltip.style('opacity', 0);
    }

}




function hBarBalanceChart(attrName, indexArray, innerWidth=400) {
    const index = indexArray.indexOf(null);
    if (index > -1) {
        indexArray.splice(index, 1);
    }

    let numSeries = dataConfig.config.activeView;

    let basics = barChartSetup(innerWidth);
    let margin = basics.margin,
        width = basics.width,
        height = basics.height,
        barPadding = basics.barPadding * 100;

    margin.left = 20;
    margin.right = 20;

    let xScale = d3.scaleLinear()
        .domain([0, 100])
        .range([0, width]);

    let yScale = d3.scaleLinear()
        .domain([0, 2])
        .range([0, height/3]);

    let svg = d3.select("#"+attrName+"Chart")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .attr("id", attrName+"ChartPlot")
        .attr("class", "ds-chart-base");

    const tooltip = d3.select("#"+attrName+"Chart").append("div")
        .attr("class", "ds-tooltip")
        .style("opacity", 0);

    svg.append("g")
        .attr("class", "ds-grid")
        .attr("transform", "translate(" + (margin.left - 1) + "," + (margin.top - 1) + ")")

    let plot = svg.append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    /* Temporary pseudo-hardcoded barHeight */
    let barHeight = 120 / numSeries + ((numSeries - 2) * 10);
    let paddingBottom = 120 / numSeries - ((numSeries - 2) * 10);
    let barSpacing = 40;
    let topPos = height - ((barHeight + barSpacing) * numSeries + paddingBottom);
    let lineStroke = 'steelblue';
    let lineExtend = 12;
    let lineStrokeWidth = 8;

    /* Attach index data and add the chart elems */
    function addPBar(data, series, color) {
        plot.selectAll("rect.series" + (series+1))
            .data(data)
            .enter()
            .append("rect")
            .attr("class", "series"+(series+1))
            .attr("x", function(d, i) { return i ? xScale(100 - d.target_pct) : 0})
            .attr("width", function(d) { return xScale(d.target_pct)})
            .attr("y", function() {
                return topPos + barSpacing * series + barHeight * series
            })
            .attr("height", function(d) { return barHeight ; })
            .attr("fill", color)
            .attr("cursor", "pointer")
            .attr("attrib-value", function(d) { return d.attrib_value; })    /* storing the Acxiom attrib value on the element */
            .on("mouseover", mouseover)
            .on("mouseout", mouseup)
            .on("mousemove", mouseover)
            .attr("target-pct", function(d) { return d.target_pct; })
            .attr("index", function(d) { return d.index; })
            .on("click", up);
    }

    function addPbarText(data, series) {
        plot.selectAll("text.series"+(series+1))
            .data(data)
            .enter()
            .append("text")
            .attr("class", "series"+(series+1))
            .text(function(d) {
                return formatAsInteger(d3.format("d")(d.index));
            })
            .attr("text-anchor", "middle")
            /* Set x position to be inside corresponding edge of the bar */
            .attr("x",  function(d, i) { return i ? xScale(100 ) - 20 : 14})
            .attr("y", function() {
                if (series == 0) {
                    return topPos + 3 + (barHeight/2)
                } else if (series == 1) {
                    return topPos + barSpacing + 3 + barHeight + (barHeight/2)
                } else if (series == 2) {
                    return topPos + barSpacing * 2 + 3 + barHeight*2 + (barHeight/2)
                }
            })
            .attr("class", "yAxis")
            .attr("font-family", "sans-serif")
            .attr("fill", "white")
            .on("mouseover", mouseover)
            .on("mouseout", mouseup)
            .on("mousemove", mouseover);
    }

    indexArray.forEach(function(aud, i) {
        addPBar(aud, i, dataConfig.config.seriesColors[i]);
        addPbarText(aud, i);
    });

    plot.selectAll("text.labels")
        .data(indexArray[0])
        .enter()
        .append("text")
        .attr("class", "ds-binary-label")
        .text(function(d) {
            return d.attrib_value;
        })
        .attr("text-anchor", function(d, i) { return i ? "end" : "start";})
        .attr("x",  function(d, i) { return i ? xScale(100 ) : 0})
        .attr("y", function(d) { return topPos - 30})
        .attr("class", "yAxis")
        .attr("font-family", "sans-serif")
        .attr("font-size", "20px")
        .attr("fill", "#505050")
        .on("mouseover", mouseover)
        .on("mouseout", mouseup)
        .on("mousemove", mouseover);


    /* Draw in the indicator line marking the appropriate position on the bars */
    indexArray.forEach(function(aud, i) {
        var lineData = [{"x": xScale(indexArray[i][0].target_pct), "y": topPos + barSpacing * i + barHeight * i - lineExtend},
            {"x": xScale(indexArray[i][0].target_pct), "y": topPos + barSpacing * i + barHeight * i + barHeight + lineExtend}]

        var line = d3.line()
            .x(function(d) {return d.x})
            .y(function(d) {return d.y});

        plot.append('path').attr('d', line(lineData)).attr("stroke", lineStroke)
            .attr("stroke-width", lineStrokeWidth)
            .attr("fill", "none");
    })

    /* Add x-axis */
    let xAxis = d3.axisBottom(xScale)
        .tickSize(0)
        .tickValues(d3.range(0, 101, 25))
        .tickFormat(function (d) { return d + "%" });

    let xAxisElement = svg.append("g")
        .attr("class", "xAxis")
        .attr("transform", "translate(" + (margin.left) + "," + (margin.top + height - 1) + ")")
        .call(xAxis);

    /* Remove the axis line */
    svg.selectAll(".domain").remove();


    function up(d) {
        applyFilter(attrName, d.attrib_value, "rect", targetAuds);
    }

    function mouseover(d) {
        let htmlString = d.attrib_value + "<br/>" + "Target Pct: " + d.target_pct + "%<br/>"  + "Index: " + d.index
        addTooltip(tooltip, htmlString, 0, -60);
    }

    function mouseup(d) {
        // Hide tooltip when the mouse leaves the element
        tooltip.style('opacity', 0);
    }

}




function barChartSetup(innerWidth=360) {
    let margin = {top: 30, right: 0, bottom: 20, left: 30};
    let width = innerWidth - margin.left - margin.right;
    let height = 360;
    let barPadding = 1;

    return {
        margin : margin,
        width : width,
        height : height,
        barPadding : barPadding
    };
}


function drawBarChart(attrName, indexArray, innerWidth=400) {

    // temp fix to remove any null elements from indexArray
    for( let i = indexArray.length; i--;){
        if ( indexArray[i] == null) {
            indexArray.pop();
        }
    }

    let numSeries = indexArray.length;

    let basics = barChartSetup(innerWidth);
    let margin = basics.margin,
        width = basics.width,
        height = basics.height,
        barPadding = basics.barPadding * 2;

    let barWidth = width / (indexArray[0].length * numSeries);

    let xScale = d3.scaleLinear()
        .domain([0, indexArray[0].length])
        .range([0, width]);

    let largest = 0;
    indexArray.forEach(function (aud) {
        let thisMax = d3.max(aud, function(d) { return d.target_pct; });
        largest = Math.max(thisMax, largest);
    });
    let yScale = d3.scaleLinear()
        .domain([0, largest])
        .range([height, 0]);

    /* Create SVG element */
    let svg = d3.select("#"+attrName+"Chart")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .attr("id", attrName+"ChartPlot")
        .attr("class", "ds-chart-base");

    const tooltip = d3.select("#"+attrName+"Chart").append("div")
        .attr("class", "ds-tooltip")
        .style("opacity", 0);

    /* Add horizontal grid lines */
    function make_y_gridlines() {
        return d3.axisLeft(yScale)
            .ticks(5)
    }

    svg.append("g")
        .attr("class", "ds-grid")
        .attr("transform", "translate(" + (margin.left - 1) + "," + (margin.top - 1) + ")")
        .call(make_y_gridlines()
            .tickSize(-width)
            .tickFormat("")
        )

    let plot = svg.append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    /* Will set y position and color dependent on size of bar */
    function textInside(d) { return (height - yScale(d.target_pct)) > 20 }

    function addBar(data,series,color) {
        plot.selectAll("rect.series"+(series+1))
            .data(data)
            .enter()
            .append("rect")
            .attr("class", "series"+(series+1))
            .attr("x", function(d, i) {
                return xScale(i) + (barWidth * series - barPadding * series);
            })
            .attr("width", width / (data.length * numSeries) - barPadding)
            .attr("y", function(d) {
                return yScale(d.target_pct);
            })
            .attr("height", function(d) {
                return height-yScale(d.target_pct);
            })
            .attr("fill", numSeries > 1 ? color : function(d) { return colorByIndexBar(d.index) })
            .attr("cursor", "pointer")
            .attr("attrib-value", function(d) { return d.attrib_value; })    /* storing the Acxiom attrib value on the element */
            .on("mouseover", mouseover)
            .on("mouseout", mouseup)
            .on("mousemove", mouseover)
            .attr("target-pct", function(d) { return d.target_pct; })
            .attr("index", function(d) { return d.index; })
            .on("click", up);
    }

    function addBarText(data, series) {

        let fontSize = "12px";
        if (numSeries === 3) {
            fontSize = "9px";
        }


        plot.selectAll("text.series"+(series+1)+" yAxis")
            .data(data)
            .enter()
            .append("text")
            .attr("class", "series"+(series+1)+" yAxis")
            .text(function(d) {
                return formatAsInteger(d3.format("d")(d.index));
            })
            .attr("text-anchor", "middle")
            /* Set x position to the left edge of each bar plus half the bar width */
            .attr("x", function(d, i) {
                return xScale(i) + (barWidth * series - barPadding * series) + barWidth/2 - 1;
            })
            .attr("y", function(d) {
                return textInside(d) ? yScale(d.target_pct) + 14 : yScale(d.target_pct) - 7;
            })
            //  .attr("class", "yAxis")
            .attr("font-family", "sans-serif")
            .attr("font-size", fontSize)
            .attr("fill", function(d) { return textInside(d) ? "white" : "#505050" })
            .on("mouseover", mouseover)
            .on("mouseout", mouseup)
            .on("mousemove", mouseover);
    }

    indexArray.forEach(function (aud, i) {
        addBar(aud,i,dataConfig.config.seriesColors[i]);
        addBarText(aud,i);
    });

    /* Add x labels to chart */
    let xLabels = svg.append("g")
        .attr("transform", "translate(" + margin.left + "," + (margin.top + height)  + ")");

    xLabels.selectAll("text.xAxis")
        .data(indexArray[0])
        .enter()
        .append("text")
        .text(function(d) { return d.attrib_value;})
        .attr("text-anchor", "middle")
        /* Set x position to the left edge of each bar plus half the bar width */
        .attr("x", function(d, i) {
            return xScale(i) + (barWidth * numSeries)/2;
        })
        .attr("y", 15)
        .attr("class", "xAxis");

    /* Add a y-axis */
    let axis = d3.axisLeft(yScale)
        .ticks(5)
        .tickFormat(function (d) { return d + "%" })
        .tickSize(0);

    svg.append("g")
        .attr("transform", "translate(" + (margin.left - 1) + "," + (margin.top - 1) + ")")
        .attr("class", "axis")
        .call(axis);

    /* Remove vertical and extra horizontal gridlines */
    svg.selectAll(".domain").remove()


    function up(d, i) {
        applyFilter(attrName, d.attrib_value, "rect", targetAuds);
    }


    function mouseover(d) {
        let htmlString = "Target Pct: " + d.target_pct + "%<br/>"  + "Index: " + d.index
        addTooltip(tooltip, htmlString, 0, -40);
    }

    function mouseup(d) {
        // Hide tooltip when the mouse leaves the element
        tooltip.style('opacity', 0);
    }

}



function dnaChart(indexArray, barWidth=4) {
    let numSeries = dataConfig.config.activeView;

    // tooltip values
    function makeToolTips(indexDs, attrName) {
        let attrFullName = {
            age: "Age",
            gender: "Gender",
            ethnicity: "Ethnicity",
            marital: "Marital status",
            children: "Number of children",
            education: "Education",
            income: "Income",
            state: "Location",
            interests: "Interests",
            retail: "Retail"
        };
        let t = indexDs.map(function(row) {
            // the white spaces are needed here to create padding, b/c plotly
            // doesn't seem to have padding options, and allows only inline html tags
            // in the tooltip text string
            return "<br>    " + "    <br>    "
                + attrFullName[attrName]
                + ": "
                + row['attrib_value']
                + "    <br>    Target Pct: "
                + row['target_pct'].toString()
                + "%    <br>    Index: "
                + row['index'].toString()
                + "    <br>    ";
        });
        return t;
    }

    let traces = [];
    let audKeys = [];
    indexArray.forEach(function(aud) {
        if (aud != null) {
            audKeys.push(...Object.keys(aud))
        }
    })
    let attrNames = [...new Set(audKeys)];

    const index = indexArray.indexOf(null);
    if (index > -1) {
        indexArray.splice(index, 1);
    }

    attrNames.forEach(function(attrName, i){
        indexArray.forEach(function(aud,j) {
            if (Object.keys(indexArray[j]).indexOf(attrName) > -1) {
                let startIdx = j > 0 ? Object.keys(indexArray[j - 1]).length * j: 0;
                traces[i+startIdx] = {
                    name: attrName,
                    x: unpack(indexArray[j][attrName], 'index'),
                    y: unpack(indexArray[j][attrName], 'target_pct'),
                    base: unpack(indexArray[j][attrName], 'target_pct').map(x => -x/2),
                    width: barWidth,
                    type: 'bar',
                    marker: {
                        color: numSeries === 1 ? unpack(indexArray[j][attrName], 'index').map(x => colorByIndexBar(x)) : dataConfig.config.seriesColors[j],
                        opacity: 0.5
                    },
                    hovertext: makeToolTips(indexArray[j][attrName], attrName),
                    hoverinfo: 'text',
                    hoverlabel: {
                    bgcolor: '#fff',
                    bordercolor: 'lightgrey',
                    font: {
                       family: "Open Sans",
                       size: 15,
                       color: '#333'
                    }
                    }
                };
            }

        })

    });

    // let height = 150;
    // let width = 1260;

    let layout = {
        hovermode:'closest',
        // height: height,
        // width: width,
        annotations: [{
            x: 0,
            y: -50,
            xref: 'x',
            yref: 'y',
            text: '0',
            showarrow: false,
        },
            {
                x: 300,
                y: -50,
                xref: 'x',
                yref: 'y',
                text: '300',
                showarrow: false,
            }],
        xaxis: {
            range: [0, 300],
            showgrid: false,
            zeroline: false,
            showline: false,
            autotick: true,
            ticks: '',
            showticklabels: false
        },
        yaxis: {
            autorange: true,
            showgrid: false,
            zeroline: false,
            showline: false,
            autotick: true,
            ticks: '',
            showticklabels: false
        },
        margin: {
            l: 10,
            r: 10,
            b: 0,
            t: 0,
            pad: 1
        },
        paper_bgcolor: '#fafafa',
        plot_bgcolor: '#fafafa',
        showlegend: false,
        shapes: [{
            type: 'line',
            x0: 120,
            y0: 0,
            x1: 120,
            yref: 'paper',
            y1: 1,
            line: {
                color: 'grey',
                width: 1.5,
                dash: 'dot'
            }
        },
            {
                type: 'line',
                x0: 80,
                y0: 0,
                x1: 80,
                yref: 'paper',
                y1: 1,
                line: {
                    color: 'grey',
                    width: 1.5,
                    dash: 'dot'
                }
            },
            {
                type: 'line',
                x0: 0,
                y0: 0.25,
                x1: 0,
                yref: 'paper',
                y1: 0.75,
                line: {
                    color: 'grey',
                    width: 0.75,
                    dash: 'dot'
                }
            },
            {
                type: 'line',
                x0: 500,
                y0: 0.25,
                x1: 500,
                yref: 'paper',
                y1: 0.75,
                line: {
                    color: 'grey',
                    width: 0.75,
                    dash: 'dot'
                }
            }]
    };
    Plotly.newPlot("waveChart", traces, layout, {displayModeBar: false, responsive: true});

}

/*******************************************************************************
 *** ADD SERIES STATS ***********************************************************
 *******************************************************************************/
function addSeriesStats(attrName, statsArray, prefix='', suffix='') {
    // remove existing stats, if any
    $( "#" + attrName + "Chart" )
        .prev(".tile-header")
        .find(".ds-stats")
        .remove();

    let statString = "<div class='ds-stats'><span class='ds-stats-name'>" + prefix + "</span>"
    statsArray.forEach(function(stat, i) {
        statString += `<span class='ds-stat-${i+1}' style='color: ${dataConfig.config.seriesColors[i]}'>${stat} ${suffix}</span>`
        if (i != statsArray.length - 1) {
            statString += "<span style='float:left;margin:0 3px;'> | </span>"
        }
    });
    statString += "</div>"

    // add in stats
    $( "#" + attrName + "Chart" )
        .prev(".tile-header")
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
};

function showActiveFilter(store) {
    let cat = null;
    if (store["activeFilter"] != null) {
        cat = store["activeFilter"][0];
        cat = cat[0].toUpperCase() + cat.slice(1)
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
console.log(randomData);
console.log(targetData.data);
console.log(catsArray);
console.log(attrName);
    let targetCounts = d3.nest()
        .key(function(d) { return d[attrName]; })
        .rollup(function(v) { return v.length; })
        .entries(targetData.data);

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
                if (d.key !== "") {return d.value;}
            });
        })
        .object(randomCounts);

    let indexArray = _.cloneDeep(catsArray);

    indexArray.forEach(function(catEntryIndex) {
        console.log(catEntryIndex);
        let targetResult = targetCounts.filter(function(catEntryTarget) {
            return catEntryTarget.key === catEntryIndex.attrib_value;
        });
        console.log(targetResult);
        catEntryIndex["target_count"] = (targetResult[0] !== undefined) ? targetResult[0].value : 0;
        console.log(catEntryIndex['target_count']);
        console.log(targetNonMissTotal);
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


/* color-by-index functions */
function colorByIndexBar(index) {
    if (index >= 120) {
        return dataConfig.config.colorOverIndex;
    } else if (index > 80) {
        return dataConfig.config.colorNeutralIndex1;
    } else if (index == 0) {
        return dataConfig.config.colorZeroIndex;
    }
    return dataConfig.config.colorUnderIndex;
}
function colorByIndexPie(index, indexCats, attrValue) {
    if (index >= 120) {
        return colorOverIndex;
    } else if (index > 80) {
        if (indexCats.findIndex(x => x.attrib_value == attrValue) == 0) {
            return dataConfig.config.colorNeutralIndex1;
        } else {
            return dataConfig.config.colorNeutralIndex2;
        }
    }
    return dataConfig.config.colorUnderIndex;
}

/* calculate an array of pct and indexes for interests/retail */
function indexInterestsRetail(attrName, targetData, randomData, bubble=false) {
    let targetCounts = d3.nest()
        .key(function(d) { return d[attrName+"_category"] + "|" + d[attrName]; })
        .rollup(function(v) { return v.length; })
        .entries(targetData.data)
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
        .entries(targetData.data)
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

    return targetCounts;
}


/* for interests/retail, get the max indexing item for each category, and pick top 5 among that list */
function indexInterestsRetailTop5(indexDs, indexDs2 = null, indexDs3 = null) {
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
        })
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

function indexStatesTop5(indexDs1, indexDs2, indexDs3 = null) {
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
    })

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
function unpack(rows, key) {
    return rows.map(function(row) { return row[key]; });
}

/* get state name from state code */
function getStateName(stateCode) {
    return statesPaths.features.filter(d => ( d.properties.code == stateCode ) ).map(function(d){return d.properties.name;})[0];
}

/* get median category */
function getMedianCategory(indexDs) {
console.log(indexDs);
    let medianCat = '';
    let sum = 0;
    let i = 0;
    while (sum < 50 && i <= indexDs.length) {
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




/*
main function to generate data for charts
 */
function drawCharts(targetAuds) {
    let activeView = dataConfig.config.activeView;
    showActiveFilter(dataConfig.config);
    /* Remove any active tooltips */
    d3.selectAll(".ds-tooltip").remove();

    /* View setup */
   // addAudienceLegend(targetAuds);
    //addAudienceTitle(targetAuds);
    let indexCats = makeIndexCats();
    let demogAttributesList = Object.keys(indexCats);

    let audData = [];

    /* Remove the current svg from each chart div */
    demogAttributesList.forEach(function(demogAttributeListName) {
        d3.select("#"+demogAttributeListName+"Chart svg").remove();
    });
    targetAuds.forEach(function(aud, i) {
        let targetData = {
            name: aud.name
        };
        demogAttributesList.forEach(function(demogAttributeListName) {
            let index;
            if (demogAttributeListName === "interests") {
                let randomI = dataStore.get('randomInterests');
                index = indexInterestsRetail(demogAttributeListName, aud.interests, randomI.data);
             } else if (demogAttributeListName === "retail") {
                let randomR = dataStore.get('randomRetail');
                 index = indexInterestsRetail(demogAttributeListName, aud.retail, randomR.data);
             } else {
                let randomD = dataStore.get('randomDemog');
                console.log(demogAttributeListName);
                console.log(indexCats[demogAttributeListName]);
                console.log(aud.demog);
                console.log(randomD.data);
                 index = indexAttr(demogAttributeListName, indexCats[demogAttributeListName], aud.demog, randomD.data);
             }

            targetData[demogAttributeListName] = index;
        });
        console.log(targetData.income);
        targetData["ageStat"] = getMedianCategory(targetData.age);
        targetData["childrenStat"] = getNonZeroPct(targetData.children);
        targetData["incomeStat"] = getMedianCategory(targetData.income);


        audData.push(targetData)
    });


    audData.forEach(function(aud, i) {
        if (audData.length > 1) {
            aud["topStates"] = indexStatesTop5(...getCompIndexes(audData, "state", i));
            aud["topInterests"] = indexInterestsRetailTop5(...getCompIndexes(audData, "interests", i));
            aud["topRetail"] = indexInterestsRetailTop5(...getCompIndexes(audData, "retail", i));
        } else {
            aud["topInterests"] = [indexInterestsRetailTop5(...getCompIndexes(audData, "interests", i))];
            aud["topRetail"] = [indexInterestsRetailTop5(...getCompIndexes(audData, "retail", i))];

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
            retail: aud.topRetail[0]
        });
    });
    dnaChart(indexes,barWidth=dataConfig.config.dnaBarWidths[dataConfig.config.activeView - 1]);

    var myPlot = document.getElementById('waveChart');
    myPlot.on('plotly_click', function(data){
        let d = data.points[0].hovertext.split("<br>")[2].trim().split(":");
        d[0] = d[0][0].toLowerCase() + d[0].slice(1);
        let mapping = {
            "number of children": "children",
            "age": "age",
            "ethnicity": "ethnicity",
            "gender": "gender",
            "marital status": "marital",
            "education": "education",
            "income": "income",
            "location": "state",
            "interests": "interests",
            "retail": "retail"
        };
    });

    // dataStore.add({id: event.data.msg.title, data: event.data.msg.data });

    var ageData = [
        [
            {
                "attrib_value": "18-25",
                "target_count": 612,
                "random_count": 566,
                "target_pct": 7,
                "random_pct": 7,
                "index": 100
            },
            {
                "attrib_value": "26-35",
                "target_count": 940,
                "random_count": 1244,
                "target_pct": 10,
                "random_pct": 15,
                "index": 67
            },
            {
                "attrib_value": "36-45",
                "target_count": 1389,
                "random_count": 1234,
                "target_pct": 15,
                "random_pct": 15,
                "index": 100
            },
            {
                "attrib_value": "46-55",
                "target_count": 1805,
                "random_count": 1520,
                "target_pct": 19,
                "random_pct": 19,
                "index": 100
            },
            {
                "attrib_value": "56-65",
                "target_count": 2143,
                "random_count": 1504,
                "target_pct": 23,
                "random_pct": 18,
                "index": 128
            },
            {
                "attrib_value": "66+",
                "target_count": 2370,
                "random_count": 2139,
                "target_pct": 26,
                "random_pct": 26,
                "index": 100
            }
        ]
    ];

    chartData.add({id: 'age', data: ageData});

    drawBarChart("age", ageData);
    addSeriesStats("age", getStatArray(audData, "age"), prefix = "Median: ", suffix = " years");
    drawBarChart("ethnicity", getIndexArray(audData, "ethnicity"));
    drawBarChart("children", getIndexArray(audData, "children"));
    addSeriesStats("children", getStatArray(audData, "children"), prefix = "Child Present: ", suffix = "%");
    drawBarChart("education", getIndexArray(audData, "education"));
    drawBarChart("income", getIndexArray(audData, "income"), width=610);
    addSeriesStats("income", getStatArray(audData, "income"), prefix = "Median: ");
    if (audData.length > 1) {
       // hBarBalanceChart("gender", getIndexArray(audData, "gender"));
       // hBarBalanceChart("marital", getIndexArray(audData, "marital"));
    } else {
      //  pieChart("gender", [audData[0].gender][0]);
      //  console.log( [audData[0].gender][0]);
      //  pieChart("marital", [audData[0].marital][0]);
    }

    /* Add Toggle-Ready HBar Charts for Comparison Views */
/*    if (audData.length > 1) {
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
        hBarChart("retail", 630, [audData[0].topRetail][0])
    }*/

    $( ".tile" ).removeClass("selected-tile");

  //  bubbleChart('interests', getIndexArray(audData, "interests"));
  //  bubbleChart('retail', getIndexArray(audData, "retail"));

  //  addBubbleHighlighting('interests');
 //   addBubbleHighlighting('retail');

}

function processData() {
    console.log('process data called');
    let targetAuds = [];
    let targetObj = {};


    randomDemog = dataStore.get('randomDemog');
    randomInterests = dataStore.get('randomInterests');
    randomRetail = dataStore.get('randomRetail');
    targetObj.name = returnProp('audience', true,'name');
    targetObj.demog = dataStore.get('demographics');
    targetObj.interests = dataStore.get('interests');
    targetObj.retail = dataStore.get('retail');

    targetAuds.push(targetObj);

    drawCharts(targetAuds);
    targetAuds.forEach(function(audience) {
        audienceTitles.push(audience.name);
    })
}


let statusPhase = 'initial';

     function getDataFiles() {
        /*
            get list of data files
            this list will be used to verify all the files have been processed
         */
        let fileList = dataConfig.files;
        let fileListTitles = [];
        let initFileList = [];
        let secondaryFileList = [];

        /*
            the initFIleList array is the first group of files to be processed - the initial audience selected
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
                            dataStore.add({id: event.data.msg.title, data: event.data.msg.data });
                            if(statusPhase === 'initial') {
                                initFileList.splice(initFileList.indexOf(event.data.msg.title), 1);
                                if(initFileList.length === 0) {
                                    console.log('processing data for initial files');
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

                            break;
                        case "transferCanceled":

                            break;
                        case "queueStatus":
                            if(event.data.msg === 'full') {
                                console.log('queueStatus '+ event.data.msg);
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
                            console.log('transfer status ' + event.data.msg);
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
        console.log('I was told to display audience data ' + this.selectedAudienceArr);
    }

    function getConfig() {
        return dataConfig;
    }

    function getElementConfig() {
        return dataConfig.config;
    }





export { getConfig, getElementConfig, getDataFiles }