import { LitElement, html, css } from  'lit-element';

export class BarChartClassic extends LitElement {
    static get properties() {
        return {
            isCompare: {type: Boolean}
        };
    }
    constructor() {
        super();
        this.isCompare = false;
    }
    render() {
        return html`
              <div class="hor-bar-chart">
        <!-- Info for Compare audiences feature -->
        ${this.isCompare?
            html ``:
            html ``}
        <div ng-if="$ctrl.isCompare" class="compare-top-titles">
            <div ng-repeat="audience in $ctrl.chart.audiences track by $index" class="compare-top-item">
                <div ng-bind="audience.name" class="item-name-bg-label"></div>
                <div class="compare-bignum-group">
                    <div class="compare-big-number first">
                        <div class="data">
                            <span ng-bind="audience.hhCount?audience.hhCount:'---'" style="font-weight: bold;"></span>
                            <span></span>
                        </div>
                        <div class="dataLabel">Households</div>
                    </div>
                    <div class="compare-big-number">
                        <div class="data">
                            <span ng-bind="audience.idCount?audience.idCount:'---'" style="font-weight: bold;"></span>
                            <span></span>
                        </div>
                        <div class="dataLabel">Individuals</div>
                    </div>
                    <div class="compare-big-number last">
                        <div class="data">                                
                            <span ng-bind="audience.deviceCount?audience.deviceCount:'---'" style="font-weight: bold;"></span>
                        </div>
                        <div class="dataLabel">Devices</div>
                    </div>
                </div>
            </div>
        </div>

        <div class="attribute-rows" ng-style="{width: ($ctrl.chart.rowWidth + 'px')}">
            <div class="attribute-header">
                <p>Attribute Description</p>
                <div ng-if="$ctrl.isCompare" class="bar-chart-key-container">
                    <div class="group-key" ng-repeat="audience in $ctrl.chart.audiences track by $index" ng-style="{'max-width': ($ctrl.chart.colWidth/$ctrl.chart.audiences.length + 'px')}">
                        <span class="group-key-color" ng-style="{'background-color': $ctrl.chart.barColor($index)}"></span>
                        <span class="group-key-label" ng-bind="audience.name"></span>
                    </div>
                </div>
            </div>

            <div ng-repeat="(attrIndex, attr) in $ctrl.chart.attrNames track by $index" class="attr-row"
                ng-style="{height: ($ctrl.chart.rowHeight + 'px')}">
                <p class="attr-name" ng-bind="attr" ng-style="{top: (($ctrl.chart.rowHeight/2 - 12) + 'px')}"
                    ng-mouseover="$ctrl.attrIndex=$index" ng-mouseleave="$ctrl.attrIndex=undefined"></p>
                <div class="attr-name-tooltip" ng-bind="attr" ng-show="$ctrl.attrIndex===$index"
                     ng-style="{top: (($ctrl.chart.rowHeight) + 'px')}"></div>

                <svg ng-style="{'width': ($ctrl.chart.rowWidth + 'px')}" ng-attr-height="{{$ctrl.chart.rowHeight}}">
                    <g ng-repeat="audience in $ctrl.chart.audiences" ng-attr-transform="{{$ctrl.chart.translate($index)}}">
                        <rect ng-if="audience.dataset[attrIndex]" class="hor-bar" x="0" ng-attr-y="{{ $ctrl.chart.rowMargin }}" ng-style="{width: $ctrl.chart.barLength(audience.dataset[attrIndex])}"
                            ng-attr-height="{{$ctrl.chart.barWidth}}" ng-attr-fill="{{$ctrl.chart.barColor($index)}}">
                        </rect>
                        <text ng-if="audience.dataset[attrIndex]" class="pct-label"
                              ng-attr-x="{{ $ctrl.chart.barLength(audience.dataset[attrIndex]) + 10 }}"
                              ng-attr-y="{{ $ctrl.chart.rowMargin + $ctrl.chart.barWidth/2 + 3 }}"
                              ng-attr-fill="{{ $ctrl.chart.textColor($index) }}">
                            {{ audience.dataset[attrIndex] }}
                        </text>
                    </g>
                </svg>
            </div>
            <div style="height: 25px;"></div>
        </div>
    </div>
</div>
    `;
    }
}

customElements.define('bar-chart-classic', BarChartClassic);