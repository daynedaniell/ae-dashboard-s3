import { LitElement, html, css } from  'lit-element';

export class ClusteredBarChart extends LitElement {
    static get properties() {
        return { chartTitle: {type: String }, loadingMsg: {type: String}, chartIdentifier: {type: String}}
    }
    constructor() {
        super();
    }
    render() {
        return html`
    <div class="bubble-chart-cont">
        <svg class="bubble-chart-svg"></svg>
        <div class="bubble-tooltip"></div>
    </div>
    `;
    }
}

customElements.define('clustered-bar-chart', ClusteredBarChart);