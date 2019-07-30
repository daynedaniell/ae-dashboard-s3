import { LitElement, html, css } from  'lit-element';
import * as d3 from 'd3';
import _ from 'lodash';
import { store } from '../state-management/store'
import * as dataConfig from "../../dataVis";

export class MapChart extends LitElement {
    static get properties() {
        return { chartTitle: {type: String }, chartIdentifier: {type: String}, dataSource: {type: String}}
    }
    constructor() {
        super();
        this.chartTitle = 'State';
        this.chartIdentifier = 'state';
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
     <svg class="map-chart"></svg>
     <div class="ds-tooltip"></div>
    </div>`;
    }

    firstUpdated(_changedProperties) {
        let element = this.shadowRoot.querySelector('.map-chart');
        let dataSource = this.dataSource;
        let tooltipNode = this.shadowRoot.querySelector('.ds-tooltip');

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

        function mapChart(attrName, data, states) {
           // $("#"+attrName+"Chart .ds-toggle-button").css("display", "none");
            //Width and height of map
            let width = 600;
            let height = 360;
            let noDataStateColor = 'rgba(53, 128, 224, 0.07)';
            let statesPaths = states;

            // D3 Projection
            let projection = d3.geoAlbersUsa()
                .translate([width/2, height/2])    // translate to center of screen
                .scale([700]);          // scale things down so see entire US

            // Define path generator
            let path = d3.geoPath()               // path generator that will convert GeoJSON to SVG paths
                .projection(projection);  // tell path generator to use albersUsa projection

            //Create SVG element and append map to the SVG
            let svg = d3.select(element)
                .attr("width", width)
                .attr("height", height)
                .attr("class", "ds-chart-base");

            data.forEach(function(catEntryIndex) {
                // Find the corresponding state inside the GeoJSON
                for (let j = 0; j < statesPaths.data.features.length; j++)  {
                    let jsonState = statesPaths.data.features[j].properties.name;
                    if (catEntryIndex["attrib_value"] === jsonState) {
                        // Copy the data values into the JSON
                        statesPaths.data.features[j].properties.target_pct = catEntryIndex["target_pct"];
                        statesPaths.data.features[j].properties.index = catEntryIndex["index"];

                        // Stop looking through the JSON
                        break;
                    }
                }
            });


            // Bind the data to the SVG and create one path per GeoJSON feature
            svg.selectAll("path")
                .data(statesPaths.data.features)
                .enter()
                .append("path")
                .attr("d", path)
                .style("stroke", "#fff")
                .style("stroke-width", "1")
                .style("fill", function(d) {
                    let stateColor = colorByIndexBar(d.properties.index);
                    if (d.properties.target_pct === 0 || d.properties.random_pct) {
                        stateColor = noDataStateColor;
                    }
                    return stateColor;
                })
                .attr("attrib-value", function(d) { return d.properties.name; })    /* storing the Acxiom attrib value on the element */
                .on("mouseover", mouseover)
                .on("mouseout", mouseout)
                .on("mousemove", mouseover)
                .attr("target-pct", function(d) { return d.properties.target_pct; })
                .attr("index", function(d) { return d.properties.index; });

            function mouseover(d) {
                let htmlString = d.properties.name + ",<br />" + "Target Pct: " + d.properties.target_pct + "%<br/>"  + "Index: " + d.properties.index;
                element.addEventListener('mousemove', function(e) {
                    addTooltip(e, tooltipNode, htmlString, 0, -40)
                });
            }

            function mouseout() {
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
           let states =  _.find(store.getState().data['audience1'], function(a) { return a.title === "us-states"});
            if(previousValue !== currentValue) {
                mapChart(dataSource, currentValue, states);
            }
        }

        store.subscribe(handleChange);
    }

}

customElements.define('map-chart', MapChart);