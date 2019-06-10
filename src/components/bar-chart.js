import { LitElement, html, css } from  'lit-element';

export class BarChart extends LitElement {
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

customElements.define('bar-chart', BarChart);