import {LitElement, html, css} from 'lit-element';
import * as d3 from 'd3';
import _ from 'lodash';
import * as dataConfig from "../../dataVis";
import { store } from '../state-management/store';

export class HorizBarChart extends LitElement {
    static get properties() {
        return { chartTitle: { type: String }, chartIdentifier: {type: String}, dataSource: {type: String}}
    }
    constructor() {
        super();
        this.chartTitle = "my Chart";
        this.chartIdentifer = "identifier";
        this.dataSource = '';
    }

    static get styles() {
        return css`
        h4.ds-chart-title {
            display: inline;
            font-size: 22px;
            margin-top: 10px;
            margin-bottom: 10px;
            font-weight: 500;
            line-height: 1.1
        }`;
    }

    render() {
        return html`
       <div class="tile-header">
         <h4 class="ds-chart-title">${this.chartTitle}</h4>
       </div>
       <div id="${this.chartIdentifier}">
         <svg class="horiz-bar-chart"></svg>
       </div>`;
    }

    firstUpdated(changedProperties) {
        let element = this.shadowRoot.querySelector(".horiz-bar-chart");
        let dataSource = this.dataSource;
        let formatAsInteger = d3.format(",");

        function addTooltip(tooltipNode, htmlString, xOffset, yOffset) {
            let e = window.event;
            let x = e.clientX,
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

        function hBarChart(attrName, innerWidth, indexArray, hasToggle=false) {
            if (dataConfig.config.activeView === 1) {
                $("#"+attrName+"Chart .ds-toggle-button").css("display", "none");
                $("#"+attrName+"Chart .ds-hbar-status").text("Top 5 By Index");
            }

            let newIndexArray;
            if (hasToggle===true) {
                newIndexArray = [];
                indexArray[0].forEach(function(aud) {
                    newIndexArray.push(aud)
                });
            } else {
                newIndexArray = indexArray.slice();
            }

            let numSeries = dataConfig.config.activeView;

            let basics = barChartSetup(innerWidth);
            let margin = basics.margin,
                width = basics.width * dataConfig.config.scaleWeight +30,
                height = basics.height * dataConfig.config.scaleWeight + 10,
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
            let svg = d3.select(element)
                .attr("width", width + margin.left + margin.right + 15) // Adjusted to fit axis
                .attr("height", height + margin.top + margin.bottom)
                .attr("id", attrName+"ChartPlot")
                .attr("class", "ds-chart-base");

            const tooltip = d3.select(element)
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

            function colorByIndexBar(index) {
                if (index >= 120) {
                    return dataConfig.config.colorOverIndex;
                } else if (index > 80) {
                    return dataConfig.config.colorNeutralIndex1;
                } else if (index === 0) {
                    return dataConfig.config.colorZeroIndex;
                }
                return dataConfig.config.colorUnderIndex;
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
            function textInside(d) { return xScale(d.target_pct) > 30};


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
                    return (i * (height / newIndexArray.length))
                        + ((height / newIndexArray.length - barPadding) / 2)
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


            /* Remove vertical and extra horizontal gridlines */
            svg.selectAll(".domain").remove();

            if (hasToggle === true) {
                /* Add the toggle button */
                addCompareToggle(attrName);

                function changeToggleText(audNumber) {
                    // Change the toggle text to represent the selected audience
                    $("#"+attrName+"Chart .ds-hbar-status").text(function() {
                        let aud = (audNumber === 1) ? targetAud.name : audNumber === 2 ? targetAud2.name : targetAud3.name;
                        return "Top 5 for " + aud + " (by Index)";

                    });
                }

                /* Organize the data based on the current selected audience */
                let inp = [indexArray[0],indexArray[1],indexArray[2]];
                let idx1 = dataConfig.config[attrName+"Active"].indexOf(1);
                let idx2 = dataConfig.config[attrName+"Active"].indexOf(2);
                let idx3 = dataConfig.config[attrName+"Active"].indexOf(3);
                let trans = [inp[idx1],inp[idx2],inp[idx3]];

                /* Toggle Comparison Charts on click */
                $("#"+attrName+"Chart .ds-toggle-button .ds-t1").unbind().click(function() {
                    dataConfig.config[attrName+"Active"] = [1,2,3];
                    dataConfig.config[attrName+"Colors"] = [dataConfig.config.seriesColors[0], dataConfig.config.seriesColors[1], dataConfig.config.seriesColors[2]];
                    $(this).toggleClass("active",true);
                    $("#"+attrName+"Chart .ds-toggle-button .ds-t2").toggleClass("active",false);
                    $("#"+attrName+"Chart .ds-toggle-button .ds-t3").toggleClass("active",false);
                    changeToggleText(1);
                    toggleComparisonCharts(attrName, [trans[0],trans[1],trans[2]]);
                });

                $("#"+attrName+"Chart .ds-toggle-button .ds-t2").unbind().click(function() {
                    dataConfig.config[attrName+"Active"] = [2,1,3];
                    dataConfig.config[attrName+"Colors"] = [dataConfig.config.seriesColors[1], dataConfig.config.seriesColors[0], dataConfig.config.seriesColors[2]];
                    $(this).toggleClass("active",true);
                    $("#"+attrName+"Chart .ds-toggle-button .ds-t1").toggleClass("active",false);
                    $("#"+attrName+"Chart .ds-toggle-button .ds-t3").toggleClass("active",false);
                    changeToggleText(2);
                    toggleComparisonCharts(attrName, [trans[1],trans[0],trans[2]]);
                });

                $("#"+attrName+"Chart .ds-toggle-button .ds-t3").unbind().click(function() {
                    dataConfig.config[attrName+"Active"] = [3,1,2];
                    dataConfig.config[attrName+"Colors"] = [dataConfig.config.seriesColors[2], dataConfig.config.seriesColors[0], dataConfig.config.seriesColors[1]];
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
                                return (series === 0) ? yScale(i) : (series === 1) ? yScale(i) + barHeight : yScale(i) + barHeight*2;
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
                                if (series === 0) {
                                    return (i * numSeries * (barHeight + barPadding) + barHeight / 2 + barPadding * 2);
                                } else if (series === 1) {
                                    return (i * numSeries * (barHeight + barPadding) + barHeight * 1.5 + barPadding * 2);
                                } else if (series === 2) {
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



        let currentValue;
        function handleChange() {
            let previousValue = currentValue;
            currentValue = store.getState().data[dataSource];
            if(previousValue !== currentValue) {
              hBarChart(dataSource, 630, currentValue)
            }
        }
        store.subscribe(handleChange);
    }

}

customElements.define('horiz-bar-chart', HorizBarChart);