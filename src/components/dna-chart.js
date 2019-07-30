import { LitElement, html, css } from  'lit-element';
import * as d3 from 'd3';
import _ from 'lodash';
import * as dataConfig from '../../dataVis.json';
import { store } from '../state-management/store'

export class DNAChart extends LitElement {
    static get properties() {
        return {
            chartTitle: {type: String},
            chartIdentifier: {type: String},
            dataSource: {type: String},
            attrName: {type: String}

        }
    }

    constructor() {
        super();
        this.chartTitle = '';
        this.chartIdentifier = '';
        this.dataSource = '';
        this.attrName = '';
    }

    static get styles() {
        return css`
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
     <div id="waveChart" style="width: 100%;height: 150px;">
    </div>`;
    }

    firstUpdated(_changedProperties) {

        let element = this.shadowRoot.querySelector("#waveChart");
        let dataSource = this.dataSource;

        function unpack(rows, key) {
            return rows.map(function(row) { return row[key]; });
        }

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

        function dnaChart(indexArray, barWidth = 4) {
            let numSeries = dataConfig.config.activeView;

            // tooltip values
            function makeToolTips(indexDs, attrName) {
                let attrFullName = {
                    age: "Age",
                    gender: "Gender",
                    ethnicity: "Ethnicity",
                    marital: "Marital status",
                    children: "Number of children",
                    education: "Education",
                    income: "Income",
                    state: "Location",
                    interests: "Interests",
                    retail: "Retail"
                };
                return indexDs.map(function (row) {
                    // the white spaces are needed here to create padding, b/c plotly
                    // doesn't seem to have padding options, and allows only inline html tags
                    // in the tooltip text string
                    return "<br>    " + "    <br>    "
                        + attrFullName[attrName]
                        + ": "
                        + row['attrib_value']
                        + "    <br>    Target Pct: "
                        + row['target_pct'].toString()
                        + "%    <br>    Index: "
                        + row['index'].toString()
                        + "    <br>    ";
                });
            }

            let traces = [];
            let audKeys = [];
            indexArray.forEach(function (aud) {
                if (aud != null) {
                    audKeys.push(...Object.keys(aud))
                }
            });
            let attrNames = [...new Set(audKeys)];

            const index = indexArray.indexOf(null);
            if (index > -1) {
                indexArray.splice(index, 1);
            }

            attrNames.forEach(function (attrName, i) {
                indexArray.forEach(function (aud, j) {
                    if (Object.keys(indexArray[j]).indexOf(attrName) > -1) {
                        let startIdx = j > 0 ? Object.keys(indexArray[j - 1]).length * j : 0;
                        traces[i + startIdx] = {
                            name: attrName,
                            x: unpack(indexArray[j][attrName], 'index'),
                            y: unpack(indexArray[j][attrName], 'target_pct'),
                            base: unpack(indexArray[j][attrName], 'target_pct').map(x => -x / 2),
                            width: barWidth,
                            type: 'bar',
                            marker: {
                                color: numSeries === 1 ? unpack(indexArray[j][attrName], 'index').map(x => colorByIndexBar(x)) : DS_VIS_STORE.seriesColors[j],
                                opacity: 0.5
                            },
                            hovertext: makeToolTips(indexArray[j][attrName], attrName),
                            hoverinfo: 'text',
                            hoverlabel: {
                                bgcolor: '#fff',
                                bordercolor: 'lightgrey',
                                font: {
                                    family: "Open Sans",
                                    size: 15,
                                    color: '#333'
                                }
                            }
                        };
                    }

                })

            });

            let layout = {
                hovermode: 'closest',
                annotations: [{
                    x: 0,
                    y: -50,
                    xref: 'x',
                    yref: 'y',
                    text: '0',
                    showarrow: false,
                },
                    {
                        x: 300,
                        y: -50,
                        xref: 'x',
                        yref: 'y',
                        text: '300',
                        showarrow: false,
                    }],
                xaxis: {
                    range: [0, 300],
                    showgrid: false,
                    zeroline: false,
                    showline: false,
                    autotick: true,
                    ticks: '',
                    showticklabels: false
                },
                yaxis: {
                    autorange: true,
                    showgrid: false,
                    zeroline: false,
                    showline: false,
                    autotick: true,
                    ticks: '',
                    showticklabels: false
                },
                margin: {
                    l: 10,
                    r: 10,
                    b: 0,
                    t: 0,
                    pad: 1
                },
                paper_bgcolor: '#fafafa',
                plot_bgcolor: '#fafafa',
                showlegend: false,
                shapes: [{
                    type: 'line',
                    x0: 120,
                    y0: 0,
                    x1: 120,
                    yref: 'paper',
                    y1: 1,
                    line: {
                        color: 'grey',
                        width: 1.5,
                        dash: 'dot'
                    }
                },
                    {
                        type: 'line',
                        x0: 80,
                        y0: 0,
                        x1: 80,
                        yref: 'paper',
                        y1: 1,
                        line: {
                            color: 'grey',
                            width: 1.5,
                            dash: 'dot'
                        }
                    },
                    {
                        type: 'line',
                        x0: 0,
                        y0: 0.25,
                        x1: 0,
                        yref: 'paper',
                        y1: 0.75,
                        line: {
                            color: 'grey',
                            width: 0.75,
                            dash: 'dot'
                        }
                    },
                    {
                        type: 'line',
                        x0: 500,
                        y0: 0.25,
                        x1: 500,
                        yref: 'paper',
                        y1: 0.75,
                        line: {
                            color: 'grey',
                            width: 0.75,
                            dash: 'dot'
                        }
                    }]
            };
            Plotly.newPlot(element, traces, layout, {displayModeBar: false, responsive: true});
        }
        let currentValue;
        function handleChange() {
            let previousValue = currentValue;
            currentValue = store.getState().data[dataSource];
            if(previousValue !== currentValue) {
                dnaChart(currentValue);
            }
        }

        store.subscribe(handleChange);
    }
}
customElements.define('dna-chart', DNAChart);


