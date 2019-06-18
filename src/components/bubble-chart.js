import { LitElement, html, css, customElement } from  'lit-element';
import * as d3 from "d3";

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
    let _this = this,
        bubbles,
        isInitialLoad = true;
    var attrNameKey = 'attribute_description';
    var bubbleScale = 40;
    this.element = element;
    var chartBase = "index";
    var bubbleScale = 40;
    // Scale rules
    var valueMin = d3.min(chartData, function(d) { return d[chartBase]; }),
        valueMax = d3.max(chartData, function(d) { return d[chartBase]; }),
        //scaleRange = 40,
        radiusScale = d3.scalePow()
            .exponent(0.4)
            .domain([valueMin, valueMax])
            .range([0, bubbleScale]);

    // Sizes

    var center;
    _this.margin = { top: 20, right: 20, bottom: 20, left: 20 };
    _this.width;
    _this.height;

  //  setSvgSize();

    var colors = d3.scaleOrdinal()
        .range(['#b11f61', '#2a60aa', '#6f8695', '#a3b6bd', '#fde449', '#4d3c96', '#252937', '#e57eb1', '#2e7d61', '#fbb116', '#8d7fba', '#ee4154']);
    var nodes = createNodes(chartData);

    var bubbleCollideForce = d3.forceCollide()
        .radius(function(d) { return d.scaled_radius + 0.5; })
        .iterations(3);

    var simulation = d3.forceSimulation()
        .velocityDecay(0.5)
        .force('x', d3.forceX().strength(0.32).x(center.x))
        .force('y', d3.forceY().strength(0.32).y(center.y))
        .force('collide', bubbleCollideForce)
        .on('tick', ticked)
        .on('end', function () {
            if (isInitialLoad) {
                isInitialLoad = false;
                console.log('Simulation ended. Resizing');
               // _this.resize();
            }
        });

    function ticked() {
        if(bubbles === undefined)
        { return; }
        bubbles.each(function(node) { return {}; })
            .attr('cx', function(d) { return d.x; })
            .attr('cy', function(d) { return d.y; });
    }
    function groupBubbles() {
        simulation.restart();
    }

    _this.drawBubbles = function() {
        simulation.stop();
        var chart = d3.select(document.querySelector('.bubble-chart-svg'))
            .append('g').attr('class','g-container')
            .attr('transform', 'translate(' + _this.margin.left + ', ' + _this.margin.top + ')');

        var bubblesA = chart.selectAll('.bubble')
            .data(nodes, function(d) { return d.attribute; });
        var bubblesE = bubblesA.enter().append('circle')
            .classed('bubble', true)
            .attr('r', 0)
            .attr('fill', function(d,i) { return colors(i); });

        bubbles = bubblesA.merge(bubblesE);
        bubbles.transition()
            .duration(200)
            .attr('r', function(d) { return d.scaled_radius; });

       // addTooltip();

        simulation.nodes(nodes);
        groupBubbles();
    };

   /* function addTooltip() {
        var tooltip = d3.select('.bubble-tooltip');
        var isTooltipOpen = false;
        bubbles.on('click', function(d) {
            var selected = d3.select(this);
            if (!isTooltipOpen) {
                console.log(d3.event);
                isTooltipOpen = true;
                tooltip.style('display', 'flex');
                tooltip.transition(200).style('opacity', 1);
                tooltip.html('<p><span class="bubble-tooltip-label">Attribute: </span>' + d.attribute + '</p>' +
                    '<p><span class="bubble-tooltip-label">Value: </span>' + d.value.toPrecision(3) + '%</p>' +
                    '<p><span class="bubble-tooltip-label">Index: </span>' + d.nodeIndex + '</p>')
                    .style('top', selected._groups[0][0].cy.animVal.value - 30 +  'px')
                    .style('left', selected._groups[0][0].cx.animVal.value + 50 +  'px');
                bubbles.each(function(b) {
                    var bubble = d3.select(this);
                    b.attribute != d.attribute ? bubble.transition(200).style('opacity', 0.2) : bubble.transition(200).style('opacity', 1);
                });
            } else {
                closeTooltip();
            }
        });*/

        /*function closeTooltip() {
            isTooltipOpen = false;
            tooltip.transition(200).style('opacity', 0);
            tooltip.style('display', 'none');
            tooltip.html('');
            bubbles.transition(200).style('opacity', 1);
        }*/

      /*  document.addEventListener('click', function(event) {
            if(!$(event.target).hasClass('bubble')) {
                closeTooltip();
            }
        });*/


    createNodes(data) {
        var nodes = data['gt'].map(function(d) {
            var node = {
                attribute: d[attrNameKey],
                value: d.target_pct * 100,
                index: d.index,
                nodeIndex: d.index,
                scaled_radius: (valueMin === valueMax) ? 5 : radiusScale(d[chartBase]),
                actual_radius: d[chartBase],
                x: _this.width / 2,
                y:_this. height / 2,
            };
            node.area = Math.PI * Math.pow(node.scaled_radius, 2);
            return node;
        });
        // return randomized array order
        return d3.shuffle(nodes);
    }

   /* function setSvgSize() {
        var parentWidth = Math.floor(parent.clientWidth),
            parentHeight = Math.floor(parent.clientHeight);
        _this.width = parentWidth - _this.margin.right - _this.margin.left;
        _this.height = parentHeight - _this.margin.top - _this.margin.bottom;
        center = { x: _this.width / 2, y: _this.height / 2 };
    }*/

  //  var sizeTimeout;

  /*  _this.resize = function() {
        console.log('resizing');
        setSvgSize();

        function check() {
            var gCont = d3.select('.g-container');
            if(gCont.node() === null)
            { return; }
            var box = gCont.node().getBBox();

            if(_this.height < box.height) {
                console.log(_this.height);
                console.log(box.height);
                bubbleScale -= 4;
                radiusScale.range([0, bubbleScale]);
                setBubbleSize();
            } else {
                if((_this.height - box.height) > 100) {
                    console.log('greater than');
                    console.log(_this.height);
                    console.log(box.height);
                    bubbleScale += 4;
                    radiusScale.range([0, bubbleScale]);
                    setBubbleSize();
                }
            }
        }
        check();
    };*/

/*    window.addEventListener('resize', function() {
        _this.resize();
    });*/

    function setBubbleSize() {
        if (valueMin === valueMax) {
            return;
        }
        bubbles.each(function (d) {
            d.scaled_radius = radiusScale(d.actual_radius);
        });

        bubbles.transition()
            .duration(200)
            .attr('r', function (d) {
                return d.scaled_radius;
            });

        simulation
            .force('x', d3.forceX().strength(0.32).x(center.x))
            .force('y', d3.forceY().strength(0.32).y(center.y))
            .force('collide', bubbleCollideForce)
            .alpha(0.3)
            .restart();
    }
}

export { BubbleChart }