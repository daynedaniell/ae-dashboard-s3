import { LitElement, html, css } from  'lit-element';
import * as d3 from 'd3';
import _ from 'lodash';

export class BubbleChartClassic extends LitElement {
    static get properties() {
        return { chartTitle: {type: String }, loadingMsg: {type: String}, chartIdentifier: {type: String}}
    }
    constructor() {
        super();
    }

    static get styles() {
        return css `
    :host {
    
    }
    
    .bubble-chart-cont {
    height: 100%;
    width: 100%;
}

.bubble-tooltip {
    display: none;
    flex-direction: column;
    flex-wrap: wrap;
    opacity: 0;
    position: absolute;
    max-width: 300px;
    background-color: #404040;
    color: #fff;
    padding: 5px 10px;
    border-radius: 4px;
}  
.bubble-tooltip p {
    font-family: MuseoSans-300, Arial, sans-serif;
    margin: 2.5px 0;
}  
.bubble-tooltip-label {
    font-family: MuseoSans-500, Arial, sans-serif;
}
    
    `;
    }

    /*

     */


    render() {
        return html`
    <div id="bubbleChart" class="bubble-chart-cont">
    <div class="loading">${this.loadingMsg}</div>
        <svg class="bubble-chart-svg"></svg>
        <div class="bubble-tooltip"></div>
    </div>
    `;
    }

    firstUpdated(_changedProperties) {
        var element = this.shadowRoot.querySelector(".bubble-chart-svg");

        let dataset = {
            "children": [{"Name":"Olives","Count":4319},
                {"Name":"Tea","Count":4159},
                {"Name":"Mashed Potatoes","Count":2583},
                {"Name":"Boiled Potatoes","Count":2074},
                {"Name":"Milk","Count":1894},
                {"Name":"Chicken Salad","Count":1809},
                {"Name":"Vanilla Ice Cream","Count":1713},
                {"Name":"Cocoa","Count":1636},
                {"Name":"Lettuce Salad","Count":1566},
                {"Name":"Lobster Salad","Count":1511},
                {"Name":"Chocolate","Count":1489},
                {"Name":"Apple Pie","Count":1487},
                {"Name":"Orange Juice","Count":1423},
                {"Name":"American Cheese","Count":1372},
                {"Name":"Green Peas","Count":1341},
                {"Name":"Assorted Cakes","Count":1331},
                {"Name":"French Fried Potatoes","Count":1328},
                {"Name":"Potato Salad","Count":1306},
                {"Name":"Baked Potatoes","Count":1293},
                {"Name":"Roquefort","Count":1273},
                {"Name":"Stewed Prunes","Count":1268}]
        };

        var diameter = 600;
        var color = d3.scaleOrdinal(d3.schemeCategory10);

        var bubble = d3.pack(dataset)
            .size([diameter, diameter])
            .padding(1.5);

        var svg = d3.select(element);


        var nodes = d3.hierarchy(dataset)
            .sum(function(d) { return d.Count; });

        var node = svg.selectAll(".node")
            .data(bubble(nodes).descendants())
            .enter()
            .filter(function(d){
                return  !d.children
            })
            .append("g")
            .attr("class", "node")
            .attr("transform", function(d) {
                return "translate(" + d.x + "," + d.y + ")";
            });

        node.append("title")
            .text(function(d) {
                return d.Name + ": " + d.Count;
            });

        node.append("circle")
            .attr("r", function(d) {
                return d.r;
            })
            .style("fill", function(d,i) {
                return color(i);
            });

        node.append("text")
            .attr("dy", ".2em")
            .style("text-anchor", "middle")
            .text(function(d) {
                return d.data.Name.substring(0, d.r / 3);
            })
            .attr("font-family", "sans-serif")
            .attr("font-size", function(d){
                return d.r/5;
            })
            .attr("fill", "white");

        node.append("text")
            .attr("dy", "1.3em")
            .style("text-anchor", "middle")
            .text(function(d) {
                return d.data.Count;
            })
            .attr("font-family",  "Gill Sans", "Gill Sans MT")
            .attr("font-size", function(d){
                return d.r/5;
            })
            .attr("fill", "white");

        d3.select(self.frameElement)
            .style("height", diameter + "px");
    }

}





customElements.define('bubble-chart-classic', BubbleChartClassic);