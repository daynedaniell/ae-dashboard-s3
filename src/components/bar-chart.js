import {LitElement, html, css} from 'lit-element';
import * as d3 from 'd3';
import { BarChartBase } from "../assets/bar-chart-class";

export class BarChart extends LitElement {
    static get properties() {
        return { chartTitle: {type: String }, loadingMsg: {type: String}, chartIdentifier: {type: String}, orientation: {type: String}, dataSource: {type: String}}
    }
    constructor() {
        super();
        this.chartTitle = "Age";
        this.chartIdentifier = 'age';
        this.orientation = 'vertical';
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
         <svg class="bar-chart"></svg>
       </div>
    `;
    }

    firstUpdated(_changedProperties) {
        var element = this.shadowRoot.querySelector(".bar-chart");

        var chartConfig = {
            element: element,
            showTooltips: true,
            orientation: this.orientation
        };

        const barChart = new BarChartBase(chartConfig);

        const config = {
            "categories": [
                "18-25", "26-35", "36-45", "46-55", "56-65", "66+"
            ]
        };

        function drawCharts(targetAuds) {
            console.log('draw charts called');
            let activeView = barChart.DS_VIS_STORE.activeView;
            showActiveFilter(barChart.DS_VIS_STORE);
            /* Remove any active tooltips */
            d3.selectAll(".ds-tooltip").remove();

            /* View setup */
            addAudienceLegend(targetAuds);
            addAudienceTitle(targetAuds);

            let indexCats = barChart.makeIndexCats(config);
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

            d3.json("data/mock/" + this.dataSource + '.json').then(function(data) {
                barChart.drawChart("age", data);
            })

        }
    }
}

customElements.define('bar-chart', BarChart);