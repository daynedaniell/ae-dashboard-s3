import {LitElement, html, css} from 'lit-element';
import * as d3 from 'd3';
import _ from 'lodash';
import * as dataConfig from "../../dataVis";
import { store } from '../state-management/store';

export class BarChart extends LitElement {
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
        }
        
        .ds-tooltip {
  display: flex;
  flex-direction: column;
  flex-wrap: wrap;
  max-width: 500px;
  padding: 15px;
  word-break: break-all;
  position: fixed;
  background-color: #fff;
  margin-top: -20px;
  font: 15px "MuseoSans-300", sans-serif;
  color: #333;
  pointer-events: none;
  box-shadow: 0px 5px 15px rgba(0,0,0,0.5);
  opacity: 0;
  z-index: 1;
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
         <div class="ds-tooltip"></div>
       </div>`;
    }

    firstUpdated(changedProperties) {
        let element = this.shadowRoot.querySelector(".bar-chart");
        let dataSource = this.dataSource;
        let formatAsInteger = d3.format(",");
        let tooltipNode = this.shadowRoot.querySelector('.ds-tooltip');


        function addTooltip(element, tooltipNode, htmlString, xOffset, yOffset) {
            let e = element;
            let x = e.clientX,
                y = e.clientY;

            let tipY = (y + yOffset) + 'px';
            let tipX = (x + xOffset) + 'px';

            // Move tooltip to the left of the cursor if it gets too close to right edge
            if  (window.innerWidth - x < 200) {
                tipX = (x - 130) + 'px';
            }

            $(tooltipNode).html(htmlString)
                .css("opacity", .9)
                .css('left', `${(tipX)}`)
                .css('top', `${(tipY)}`);
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
            if(!indexArray) {
                return;
            }
            // temp fix to remove any null elements from indexArray
            for( let i = indexArray.length; i--;){
                if ( indexArray[i] === null) {
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

            let svg = d3.select(element)
                .attr("width", width + margin.left + margin.right)
                .attr("height", height + margin.top + margin.bottom)
                .attr("id", attrName+"ChartPlot")
                .attr("class", "ds-chart-base");

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
            function textInside(d) { return (height - yScale(d.target_pct)) > 20 }

            /* color-by-index functions */
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
            svg.selectAll(".domain").remove();


            function up(d, i) {
                applyFilter(attrName, d.attrib_value, "rect", targetAuds);
            }


            function mouseover(d) {
                let htmlString = "Target Pct: " + d.target_pct + "%<br/>"  + "Index: " + d.index;
                element.addEventListener('mousemove', function(e) {
                    addTooltip(e, tooltipNode, htmlString, 0, -40)
                });
            }

            function mouseup() {
                // Hide tooltip when the mouse leaves the element
                element.addEventListener('mouseout', function(e) {
                    $(tooltipNode).css('opacity', 0);
                });

            }

        }

        let currentValue;
       function handleChange() {
           let previousValue = currentValue;
           currentValue = store.getState().data[dataSource];
           if(previousValue !== currentValue) {
               drawBarChart(dataSource, currentValue)
           }
        }
       store.subscribe(handleChange);
    }

}

customElements.define('bar-chart', BarChart);