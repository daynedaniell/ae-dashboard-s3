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
        let element = this.shadowRoot.querySelector(".bar-chart");

        let chartConfig = {
            element: element,
            showTooltips: true,
            orientation: this.orientation,
            dataSource: this.dataSource
        };

        let barChart = new BarChartBase(chartConfig);

        barChart.drawChart().then(function(data) {
            barChart.drawBarChart('gender', data);
        })


    }
}

customElements.define('bar-chart', BarChart);