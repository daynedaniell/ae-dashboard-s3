import { LitElement, html, css, customElement } from  'lit-element';
import * as d3 from "d3";
import _ from 'lodash';

export class BubbleChart extends LitElement {
    static get properties() {
        return { chartTitle: {type: String }, chartIdentifier: {type: String}, dataSource: {type: String}}
    }
    constructor() {
        super();
        this.chartTitle = 'Gender';
        this.chartIdentifier = 'gender';
        this.dataSource = '';
    };

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
     <svg class="map-chart"></svg>
    </div>`;
    }

    firstUpdated(_changedProperties) {
        var element = this.shadowRoot.querySelector(".map-chart");
    }


}

customElements.define('bubble-chart', BubbleChart);