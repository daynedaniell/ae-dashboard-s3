import {LitElement, html, css} from 'lit-element';
import * as d3 from 'd3';
import { BarChartBase } from "../assets/bar-chart-class";

export class BarChart extends LitElement {
    static get properties() {
        return { chartTitle: {type: String }, loadingMsg: {type: String}, chartIdentifier: {type: String}, orientation: {type: String}}
    }
    constructor() {
        super();
        this.loadingMsg = 'Loading';
        this.chartTitle = "Age";
        this.chartIdentifier = 'ageChart';
        this.orientation = 'vertical';
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
            showTooltips: true
        };

        const barChart = new BarChartBase(chartConfig);

        const config = {
            "categories": [
                "18-25", "26-35", "36-45", "46-55", "56-65", "66+"
            ]
        };




        function makeIndexCats(config) {
            let ageIndexCats = [];
            config.categories.forEach(function (value) {
                ageIndexCats.push({attrib_value: value, target_count: 0, random_count: 0})
            });

            return {
                age: ageIndexCats
            };
        }



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

            barChart.drawBarChart("age", barChart.getIndexArray(audData, "age"));
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