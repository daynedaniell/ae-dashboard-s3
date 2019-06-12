import {LitElement, html, css} from 'lit-element';
import * as d3 from 'd3';
import { BarChartBase } from "../assets/bar-chart-class";

export class BarChart extends LitElement {
    static get properties() {
        return { chartTitle: {type: String }, loadingMsg: {type: String}, chartIdentifier: {type: String}}
    }
    constructor() {
        super();
        this.loadingMsg = 'Loading';
        this.chartTitle = "Age";
        this.chartIdentifier = 'ageChart';
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
        }
        `;
    }

    render() {
        return html`
       <div class="tile-header">
         <h4 class="ds-chart-title">${this.chartTitle}</h4>
       </div>
       <div id="${this.chartIdentifier}">
         <svg class="bar-chart"></svg>
       </div>
    `;
    }

    firstUpdated(_changedProperties) {
        var element = this.shadowRoot.querySelector(".bar-chart");

        const barChart = new BarChartBase();

        const config = {
            "categories": [
                "18-25", "26-35", "36-45", "46-55", "56-65", "66+"
            ]
        };


        function getIndexArray(audData, attrName) {
            let indexes = [];
            audData.forEach(function (aud) {
                indexes.push(aud[attrName])
            });
            return indexes
        }

        function makeIndexCats(config) {
            let ageIndexCats = [];
            config.categories.forEach(function (value) {
                ageIndexCats.push({attrib_value: value, target_count: 0, random_count: 0})
            });

            return {
                age: ageIndexCats
            };
        }

        let thisMax = 0;

        function drawCharts(targetAuds) {
            console.log('draw charts called');
            let activeView = DS_VIS_STORE.activeView;
            showActiveFilter(DS_VIS_STORE);
            /* Remove any active tooltips */
            d3.selectAll(".ds-tooltip").remove();

            /* View setup */
            addAudienceLegend(targetAuds);
            addAudienceTitle(targetAuds);

            let indexCats = makeIndexCats(config);
            let demogAttributesList = Object.keys(indexCats);

            let audData = [];

            /* Remove the current svg from each chart div */
            demogAttributesList.forEach(function (demogAttributeListName) {
                d3.select("#" + demogAttributeListName + "Chart svg").remove();
            });
            targetAuds.forEach(function (aud, i) {
                let targetData = {
                    name: aud.name
                };
                demogAttributesList.forEach(function (demogAttributeListName) {
                    let index;
                    if (demogAttributeListName === "interests") {
                        index = indexInterestsMedia(demogAttributeListName, aud.interests, randomInterests);
                    } else if (demogAttributeListName === "media") {
                        index = indexInterestsMedia(demogAttributeListName, aud.media, randomMedia);
                    } else {
                        index = indexAttr(demogAttributeListName, indexCats[demogAttributeListName], aud.demog, randomDemog);
                    }

                    targetData[demogAttributeListName] = index;


                });
                targetData["ageStat"] = getMedianCategory(targetData.age);

                audData.push(targetData)
            });

            let indexes = [];
            audData.forEach(function (aud) {
                indexes.push({
                    age: aud.age,
                });
            });

            drawBarChart("age", getIndexArray(audData, "age"));
        }

        function drawBarChart(attrName, indexArray, innerWidth = 400) {
            console.log('draw bar chart called on ' + attrName);
            console.log(indexArray);
            // temp fix to remove any null elements from indexArray
            for (let i = indexArray.length; i--;) {
                if (indexArray[i] == null) {
                    indexArray.pop();
                }
            }

            let numSeries = indexArray.length;

            let basics = barChart.barChartSetup(innerWidth);
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
                thisMax = d3.max(aud, function (d) {
                    return d.target_pct;
                });
                largest = Math.max(thisMax, largest);
            });
            let yScale = d3.scaleLinear()
                .domain([0, largest])
                .range([height, 0]);

            /* Create SVG element */
            let svg = d3.select(element)
                .attr("width", width + margin.left + margin.right)
                .attr("height", height + margin.top + margin.bottom)
                .attr("id", attrName + "ChartPlot")
                .attr("class", "ds-chart-base");

            const tooltip = d3.select(element).append("div")
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
                );

            let plot = svg.append("g")
                .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

            /* Will set y position and color dependent on size of bar */
            function textInside(d) {
                return (height - yScale(d.target_pct)) > 20
            }

            function addBar(data, series, color) {
                plot.selectAll("rect.series" + (series + 1))
                    .data(data)
                    .enter()
                    .append("rect")
                    .attr("class", "series" + (series + 1))
                    .attr("x", function (d, i) {
                        return xScale(i) + (barWidth * series - barPadding * series);
                    })
                    .attr("width", width / (data.length * numSeries) - barPadding)
                    .attr("y", function (d) {
                        return yScale(d.target_pct);
                    })
                    .attr("height", function (d) {
                        return height - yScale(d.target_pct);
                    })
                    .attr("fill", numSeries > 1 ? color : function (d) {
                        return colorByIndexBar(d.index)
                    })
                    .attr("cursor", "pointer")
                    .attr("attrib-value", function (d) {
                        return d.attrib_value;
                    })    /* storing the Acxiom attrib value on the element */
                    .on("mouseover", mouseover)
                    .on("mouseout", mouseup)
                    .on("mousemove", mouseover)
                    .attr("target-pct", function (d) {
                        return d.target_pct;
                    })
                    .attr("index", function (d) {
                        return d.index;
                    })
                    .on("click", up);
            }

            function addBarText(data, series) {

                let fontSize = "12px";
                if (numSeries === 3) {
                    fontSize = "9px";
                }


                plot.selectAll("text.series" + (series + 1) + " yAxis")
                    .data(data)
                    .enter()
                    .append("text")
                    .attr("class", "series" + (series + 1) + " yAxis")
                    .text(function (d) {
                        return formatAsInteger(d3.format("d")(d.index));
                    })
                    .attr("text-anchor", "middle")
                    /* Set x position to the left edge of each bar plus half the bar width */
                    .attr("x", function (d, i) {
                        return xScale(i) + (barWidth * series - barPadding * series) + barWidth / 2 - 1;
                    })
                    .attr("y", function (d) {
                        return textInside(d) ? yScale(d.target_pct) + 14 : yScale(d.target_pct) - 7;
                    })
                    //  .attr("class", "yAxis")
                    .attr("font-family", "sans-serif")
                    .attr("font-size", fontSize)
                    .attr("fill", function (d) {
                        return textInside(d) ? "white" : "#505050"
                    })
                    .on("mouseover", mouseover)
                    .on("mouseout", mouseup)
                    .on("mousemove", mouseover);
            }

            indexArray.forEach(function (aud, i) {
                addBar(aud, i, DS_VIS_STORE.seriesColors[i]);
                addBarText(aud, i);
            });

            /* Add x labels to chart */
            let xLabels = svg.append("g")
                .attr("transform", "translate(" + margin.left + "," + (margin.top + height) + ")");

            xLabels.selectAll("text.xAxis")
                .data(indexArray[0])
                .enter()
                .append("text")
                .text(function (d) {
                    return d.attrib_value;
                })
                .attr("text-anchor", "middle")
                /* Set x position to the left edge of each bar plus half the bar width */
                .attr("x", function (d, i) {
                    return xScale(i) + (barWidth * numSeries) / 2;
                })
                .attr("y", 15)
                .attr("class", "xAxis");

            /* Add a y-axis */
            let axis = d3.axisLeft(yScale)
                .ticks(5)
                .tickFormat(function (d) {
                    return d + "%"
                })
                .tickSize(0);

            svg.append("g")
                .attr("transform", "translate(" + (margin.left - 1) + "," + (margin.top - 1) + ")")
                .attr("class", "axis")
                .call(axis);

            /* Remove vertical and extra horizontal gridlines */
            svg.selectAll(".domain").remove();


            function up(d, i) {
                applyFilter(attrName, d.attrib_value, "rect", targetAuds);
            }


            function mouseover(d) {
                let htmlString = "Target Pct: " + d.target_pct + "%<br/>" + "Index: " + d.index;
                addTooltip(tooltip, htmlString, 0, -40);
            }

            function mouseup(d) {
                // Hide tooltip when the mouse leaves the element
                tooltip.style('opacity', 0);
            }

        }

        async function f(audIds) {
            console.log('running async function');
            // setting these as globals for now
            if (audIds.length > 0 & audIds.length <= 3) {
                var targetAuds = [];
                let targetAud = await d3.json("data/target_aud_" + audIds[0] + "/audience.json");
                let targetDemog = await d3.tsv("data/target_aud_" + audIds[0] + "/demographics_target.tsv");


                let targetInterests = await d3.tsv("data/target_aud_" + audIds[0] + "/interests_target.tsv");

                var t0 = performance.now();
                let targetMedia = await d3.tsv("data/target_aud_" + audIds[0] + "/media_target.tsv");
                var t1 = performance.now();
                targetAuds.push({
                    name: targetAud.name,
                    demog: targetDemog,
                    interests: targetInterests,
                    media: targetMedia
                });

                let targetAuds2 = [];
                let targetAud2 = await d3.json("data/target_aud_" + audIds[0] + "/audience.json");
                let targetDemog2 = await d3.tsv("data/target_aud_" + audIds[0] + "/demographics_target.tsv");


                let targetInterests2 = await d3.tsv("data/target_aud_" + audIds[0] + "/interests_target.tsv");

                var t2 = performance.now();
                let targetMedia2 = await d3.tsv("data/target_aud_" + audIds[0] + "/media_target.tsv");
                var t3 = performance.now();
                targetAuds2.push({
                    name: targetAud.name,
                    demog: targetDemog,
                    interests: targetInterests,
                    media: targetMedia
                });

                if (audIds.length > 1) {
                    targetAud2 = await d3.json("data/target_aud_" + audIds[1] + "/audience.json");
                    targetDemog2 = await d3.tsv("data/target_aud_" + audIds[1] + "/demographics_target.tsv");
                    targetInterests2 = await d3.tsv("data/target_aud_" + audIds[1] + "/interests_target.tsv");
                    targetMedia2 = await d3.tsv("data/target_aud_" + audIds[1] + "/media_target.tsv");

                    targetAuds.push({
                        name: targetAud2.name,
                        demog: targetDemog2,
                        interests: targetInterests2,
                        media: targetMedia2
                    });
                }

                if (audIds.length > 2) {
                    let targetAud3 = await d3.json("data/target_aud_" + audIds[2] + "/audience.json");
                    let targetDemog3 = await d3.tsv("data/target_aud_" + audIds[2] + "/demographics_target.tsv");
                    let targetInterests3 = await d3.tsv("data/target_aud_" + audIds[2] + "/interests_target.tsv");
                    let targetMedia3 = await d3.tsv("data/target_aud_" + audIds[2] + "/media_target.tsv");

                    targetAuds.push({
                        name: targetAud3.name,
                        demog: targetDemog3,
                        interests: targetInterests3,
                        media: targetMedia3
                    });
                }
                drawCharts(targetAuds);
            }
        }

        f(["1"]);

    }
}

customElements.define('bar-chart', BarChart);