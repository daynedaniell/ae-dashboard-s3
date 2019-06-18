import { LitElement, html, css } from  'lit-element';

export class Histogram extends LitElement {
    static get properties() {
        return { chartTitle: {type: String }, chartIdentifier: {type: String}, dataSource: {type: String}}
    }
    constructor() {
        super();
        this.chartTitle = "Age";
        this.chartIdentifier = 'ageChart';
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
    <div class="bubble-chart-cont">
        <svg class="bubble-chart-svg"></svg>
        <div class="bubble-tooltip"></div>
    </div>
    `;
    }

    firstUpdated(_changedProperties) {
        var element = this.shadowRoot.querySelector(".bubble-chart-svg");
    }


}

customElements.define('histogram', Histogram);