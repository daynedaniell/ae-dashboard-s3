import { LitElement, html, css, customElement } from  'lit-element';
import * as d3 from 'd3';

export class DonutChart extends LitElement {
    static get properties() {
        return { chartTitle: {type: String }, loadingMsg: {type: String}, chartIdentifier: {type: String}, dataSource: {type: String}, attrName: {type: String}}
    }
    constructor() {
        super();
        this.chartTitle = '';
        this.chartIdentifier = '';
        this.dataSource = '';
        this.attrName = '';
    }

    static get styles() {
        return css `
    :host {
    
    }
     h4.ds-chart-title {
            display: inline;
            font-size: 22px;
            margin-top: 10px;
            margin-bottom: 10px;
            font-weight: 500;
            line-height: 1.1
        }
    .ds-chart-base {
    margin-left: auto;
    margin-right: auto;
    display: block;
    
    `;
    }

    /*

     */


    render() {
        return html`
     <div class="tile-header">
     <h4 class="ds-chart-title">${this.chartTitle}</h4>
     </div>
     <div id="${this.chartIdentifier}">
     <svg class="donut-chart"></svg>
    </div>
    `;
    }

    firstUpdated(_changedProperties) {
        let element = this.shadowRoot.querySelector(".donut-chart");

        let colorSeries1 = "#4d3c96",
            colorSeries2 = "#0fbbc1",
            colorSeries3 = "#ff9999";

        let colorOverIndex = '#ffb14e',
            colorUnderIndex = '#4880da',
            colorNeutralIndex1 = 'grey',
            colorNeutralIndex2 = 'rgb(192,192,192)',
            colorZeroIndex = 'rgba(53, 128, 224, 0.07)';

        let DS_VIS_STORE = {
            activeFilter: null,
            stateActive: [1,2,3],
            interestsActive: [1,2,3],
            mediaActive: [1,2,3],
            activeView: 1,
            activeTab: 'dashboard',
            scaleWeight: 1,
            seriesColors: [colorSeries1,colorSeries2,colorSeries3],
            dnaBarWidths: [4,3,2]
        };

        function colorByIndexPie(index, indexCats, attrValue) {
            if (index >= 120) {
                return colorOverIndex;
            } else if (index > 80) {
                if (indexCats.findIndex(x => x.attrib_value === attrValue) === 0) {
                    return colorNeutralIndex1;
                } else {
                    return colorNeutralIndex2;
                }
            }
            return colorUnderIndex;
        }

        function wrap(text, width, sep = " ", type) {
            text.each(function() {
                var text = d3.select(this),
                    words = text.text().split(sep).reverse(),
                    word,
                    line = [],
                    lineNumber = 0,
                    lineHeight = 1.1, // ems
                    y = text.attr("y"),
                    dy = parseFloat(text.attr("dy")),
                    tspan = text.text(null).append("tspan").attr("x", 0).attr("y", y).attr("dy", dy + "em");
                /* Split horizontal bar text on last dash */
                if (type === "hbar") {
                    words = words.map(function (word) { return word.trim() });

                    let numWords = words.length;
                    let firstLine = words.slice(0, -1).join(" - ");
                    let secondLine = (numWords > 1) ? "- " + words.slice(-1)[0] : words.slice(-1)[0];
                    words = (numWords > 1) ? [secondLine, firstLine] : [secondLine];
                }

                let ct = 0;
                while (word = words.pop()) {
                    line.push(word);
                    tspan.text(line.join(" "));
                    if (width == 1 || tspan.node().getComputedTextLength() > width) {
                        line.pop();
                        tspan.text(line.join(" "));
                        line = [word];
                        if (type === 'pie') {
                            tspan = text.append("tspan").attr("x", 0).attr("y", y).attr("dy", lineHeight + dy + "em").text(word);
                        } else {
                            tspan = text.append("tspan").attr("x", 0).attr("y", y).attr("dy", ct > 0 ? ++lineNumber * lineHeight + dy + "em" : 0).attr("dx", ct > 0 ? 20 : 0).text(word);
                        }
                    }
                    ct ++;
                }
            });
        }


        function pieChart(attrName, indexDs){
            let width = 360 * DS_VIS_STORE["scaleWeight"],
                height = 360 * DS_VIS_STORE["scaleWeight"],
                outerRadius = Math.min(width - 60, height - 60) / 2,
                innerRadius = outerRadius * .5,
                innerRadiusFinal = outerRadius * .5,
                innerRadiusFinal3 = outerRadius* .45,
                marginShift = {top: outerRadius + 30, left: outerRadius + 30};


            let vis = d3.select(element)
                .attr("class", "ds-chart-base")
                .attr("id", attrName+"ChartPlot")
                .data([indexDs])          /* associate our data with the document */
                .attr("width", width)
                .attr("height", height)
                .append("svg:g")          /* make a group to hold our pie chart */
                .attr(
                    "transform",
                    "translate(" + marginShift.top + "," + marginShift.left + ")"
                );


            /* Create an arc generator, and configure its inner and outer radii */
            let arc = d3.arc() /* Generates path data for an arc */
                .outerRadius(outerRadius)
                .innerRadius(innerRadius);

            /* Create configured arc generators for animation */
            let arcFinal = d3.arc()
                .innerRadius(innerRadiusFinal)
                .outerRadius(outerRadius);

            /* Create arc data from a list of values */
            let pie = d3.pie()
                .value(function(d) { return d.target_pct; });

            let arcs = vis.selectAll("g.slice")  /* select all <g> elements with class slice (there aren't any yet) */
                .data(pie)            /* associate the generated pie data (an array of arcs, each having startAngle, endAngle and value properties) */
                .enter()              /* create <g> elements for every "extra" data element that should be associated with a selection. The result is creating a <g> for every object in the data array */
                .append("svg:g")      /* create a group to hold each slice (we will have a <path> and a <text> element associated with each slice) */
                .attr("class", "slice")
                .on("click", up);

            arcs.append("svg:path")
                .attr("cursor", "pointer")
                .attr("attrib-value", function(d) { return d.data.attrib_value; })    /* storing the Acxiom attrib value on the element */
                .attr("target-pct", function(d) { return d.data.target_pct; })
                .attr("index", function(d) { return d.data.index; })
                .attr("fill", function(d) {
                    return colorByIndexPie(d.data.index, indexDs, d.data.attrib_value);
                })
                .attr("d", arc)     /* this creates the actual SVG path using the associated data (pie) with the arc drawing function */
                .append("svg:title") /* mouseover title showing the figures */
            ;

            d3.selectAll(vis.selectAll('g.slice')).selectAll("path").attr("d", arcFinal );

            /* Add a label to the larger arcs, translated to the arc centroid and rotated.
            // source: http://bl.ocks.org/1305337#index.html */
            let labeledArcs = arcs.filter(function(d) { return d.endAngle - d.startAngle > .2; })
                .append("svg:text")
                .attr("dy", "0.35em")
                .attr("text-anchor", "middle")
                .attr("transform", function(d) { return "translate(" + arcFinal.centroid(d)[0] + ',' + (arcFinal.centroid(d)[1] - 20) + ")"; });

            labeledArcs
                .text(function(d) { return d.data.attrib_value + "|" + d.data.index + "|" + d.data.target_pct + "%" })
                .attr("dy", 0)
                .attr("class", "arc-name")
                .call(wrap, 1, "|", 'pie');


            function up(d) {
                applyFilter(attrName, d.data.attrib_value, "path", targetAuds);
            }
        }

        let dataFile = [];
        d3.json("data/mock/" + this.dataSource + '.json').then(function(data){
            pieChart('gender',data);
        });



    }
}
customElements.define('donut-chart', DonutChart);