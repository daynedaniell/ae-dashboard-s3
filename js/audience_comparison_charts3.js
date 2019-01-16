/*******************************************************************************
*** ADD 3-SERIES STATS *********************************************************
*******************************************************************************/
function add3SeriesStat(attrName, stat1, stat2, stat3, prefix='', suffix='') {
  // remove existing stats, if any
  $( "#" + attrName + "Chart" )
    .prev(".tile-header")
    .find(".ds-stats")
    .remove();

  // add in stats
  $( "#" + attrName + "Chart" )
    .prev(".tile-header")
    .append("<div class='ds-stats'><span class='ds-stats-name'>"
            + prefix
            + "</span><span class='ds-stat-1'>"
            + stat1 + suffix
            + "</span><span style='float:left;margin:0 3px;'> | </span><span class='ds-stat-2'>"
            + stat2 + suffix
            + "</span><span style='float:left;margin:0 3px;'> | </span><span class='ds-stat-3'>"
            + stat3 + suffix
            + "</span></div>");

  // color code the stats
  $("#" + attrName + "Chart").prev(".tile-header")
  .find(".ds-stats .ds-stat-1").css('color', colorSeries1);
  $("#" + attrName + "Chart").prev(".tile-header")
  .find(".ds-stats .ds-stat-2").css('color', colorSeries2);
  $("#" + attrName + "Chart").prev(".tile-header")
  .find(".ds-stats .ds-stat-3").css('color', colorSeries3);
}


/*******************************************************************************
*** 3-SERIES BAR CHART *********************************************************
*******************************************************************************/
function bar3SeriesChart(attrName, indexDs1, indexDs2, indexDs3) {
    let innerWidth = 400;
    if (attrName == "income") {
    	  innerWidth = 610;
    }
    let heightOffset = 0;
    // if (["age", "children", "income"].includes(attrName)) {
    //   heightOffset = 20;
    // }

    let basics = barChartSetup(innerWidth);
  	let margin = basics.margin,
        width = basics.width,
        height = basics.height - heightOffset,
    		barPadding = basics.barPadding * 2;

    let xScale = d3.scaleLinear()
                   .domain([0, indexDs1.length])
  					       .range([0, width]);

    let yScale = d3.scaleLinear()
  		             .domain([0, Math.max(
                        d3.max(indexDs1, function(d) { return d.target_pct; }),
                        d3.max(indexDs2, function(d) { return d.target_pct; }),
                        d3.max(indexDs3, function(d) { return d.target_pct; })
                      )
                   ])
  		             .range([height, 0]);

    /* Create SVG element */
    let svg = d3.select("#"+attrName+"Chart")
                .append("svg")
  		          .attr("width", width + margin.left + margin.right)
                .attr("height", height + margin.top + margin.bottom)
                .attr("id", attrName+"ChartPlot")
                .attr("class", "ds-chart-base");

    const tooltip = d3.select("#"+attrName+"Chart").append("div")
        .attr("class", "ds-tooltip")
        .style("opacity", 0);

    /* Add horizontal grid lines */
    function make_y_gridlines() {
        return d3.axisLeft(yScale)
            .ticks(5)
    }

    svg.append("g")
        .attr("class", "ds-grid")
        .attr("transform", "translate(" + (margin.left - 1) + "," + (margin.top - 1) + ")")
        .call(make_y_gridlines()
            .tickSize(-width)
            .tickFormat("")
        )

    let plot = svg.append("g")
  		            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    /* Will set y position and color dependent on size of bar */
    function textInside(d) { return (height - yScale(d.target_pct)) > 20 };

    /* Attach index data and add the chart elems */
    /* 1st series */
    plot.selectAll("rect.series1")
        .data(indexDs1)
          .enter()
          .append("rect")
        .attr("class", "series1")
        	.attr("x", function(d, i) {
        	     return xScale(i);
        	})
          .attr("width", width / (indexDs1.length * 3) - barPadding)
        	.attr("y", function(d) {
        	     return yScale(d.target_pct);
        	})
        	.attr("height", function(d) {
        	    return height-yScale(d.target_pct);
        	})
        	.attr("fill", colorSeries1)
        .attr("cursor", "pointer")
        .attr("attrib-value", function(d) { return d.attrib_value; })    /* storing the Acxiom attrib value on the element */
        .on("mouseover", mouseover)
        .on("mouseout", mouseup)
        .on("mousemove", mouseover)
        .attr("target-pct", function(d) { return d.target_pct; })
        .attr("index", function(d) { return d.index; })
        .on("click", up);

    /* 2nd series */
    plot.selectAll("rect.series2")
      .data(indexDs2)
		  .enter()
		  .append("rect")
      .attr("class", "series2")
			.attr("x", function(d, i) {
			     return xScale(i) + width / (indexDs1.length * 3) - barPadding;
			})
		  .attr("width", width / (indexDs1.length * 3) - barPadding)
			.attr("y", function(d) {
			     return yScale(d.target_pct);
			})
			.attr("height", function(d) {
			    return height-yScale(d.target_pct);
			})
			.attr("fill", colorSeries2)
      .attr("cursor", "pointer")
      .attr("attrib-value", function(d) { return d.attrib_value; })    /* storing the Acxiom attrib value on the element */
      .on("mouseover", mouseover)
      .on("mouseout", mouseup)
      .on("mousemove", mouseover)
      .attr("target-pct", function(d) { return d.target_pct; })
      .attr("index", function(d) { return d.index; })
      .on("click", up);

    /* 3rd series */
    plot.selectAll("rect.series3")
      .data(indexDs3)
		  .enter()
		  .append("rect")
      .attr("class", "series3")
			.attr("x", function(d, i) {
			     return xScale(i) + width / (indexDs1.length * 1.5) - barPadding * 2;
			})
		  .attr("width", width / (indexDs1.length * 3) - barPadding)
			.attr("y", function(d) {
			     return yScale(d.target_pct);
			})
			.attr("height", function(d) {
			    return height-yScale(d.target_pct);
			})
			.attr("fill", colorSeries3)
      .attr("cursor", "pointer")
      .attr("attrib-value", function(d) { return d.attrib_value; })    /* storing the Acxiom attrib value on the element */
      .on("mouseover", mouseover)
      .on("mouseout", mouseup)
      .on("mousemove", mouseover)
      .attr("target-pct", function(d) { return d.target_pct; })
      .attr("index", function(d) { return d.index; })
      .on("click", up);

    /* Add y labels to plot */
    let fontSize = "10px";
    if (attrName == "children") { fontSize = "8px" ;}
    /* 1st series */
  	plot.selectAll("text.series1")
  	    .data(indexDs1)
  	    .enter()
  	    .append("text")
        .attr("class", "series1")
        .text(function(d) {
         return formatAsInteger(d3.format("d")(d.index));
        })
  	    .attr("text-anchor", "middle")
  	    /* Set x position to the left edge of each bar plus half the bar width */
  	    .attr("x", function(d, i) {
  			     return ( i * (width / indexDs1.length) )
               + ( (width / (indexDs1.length * 3) - barPadding) / 2 );
  	    })
  	    .attr("y", function(d) {
  			     return textInside(d) ? yScale(d.target_pct) + 14 : yScale(d.target_pct) - 7;
  	    })
  	  //  .attr("class", "yAxis")
  	    .attr("font-family", "sans-serif")
  	    .attr("font-size", fontSize)
  	    .attr("fill", function(d) { return textInside(d) ? "white" : "#505050" })
        .on("mouseover", mouseover)
        .on("mouseout", mouseup)
        .on("mousemove", mouseover);

      /* 2nd series */
      plot.selectAll("text.series2")
          .data(indexDs2)
          .enter()
          .append("text")
          .attr("class", "series2")
          .text(function(d) {
           return formatAsInteger(d3.format("d")(d.index));
          })
          .attr("text-anchor", "middle")
          /* Set x position to the left edge of each bar plus half the bar width */
          .attr("x", function(d, i) {
               return ( i * (width / indexDs1.length) )
                 + ( (width / (indexDs1.length * 3) - barPadding) ) * 1.5 ;
          })
          .attr("y", function(d) {
               return textInside(d) ? yScale(d.target_pct) + 14 : yScale(d.target_pct) - 7;
    	    })
      //    .attr("class", "yAxis")
          .attr("font-family", "sans-serif")
          .attr("font-size", fontSize)
          .attr("fill", function(d) { return textInside(d) ? "white" : "#505050" })
          .on("mouseover", mouseover)
          .on("mouseout", mouseup)
          .on("mousemove", mouseover);

      /* 3rd series */
      plot.selectAll("text.series3")
          .data(indexDs3)
          .enter()
          .append("text")
          .attr("class", "series3")
          .text(function(d) {
           return formatAsInteger(d3.format("d")(d.index));
          })
          .attr("text-anchor", "middle")
          /* Set x position to the left edge of each bar plus half the bar width */
          .attr("x", function(d, i) {
               return ( i * (width / indexDs1.length) )
                 + ( (width / (indexDs1.length * 3) - barPadding) ) * 2.5 ;
          })
          .attr("y", function(d) {
               return textInside(d) ? yScale(d.target_pct) + 14 : yScale(d.target_pct) - 7;
    	    })
      //    .attr("class", "yAxis")
          .attr("font-family", "sans-serif")
          .attr("font-size", fontSize)
          .attr("fill", function(d) { return textInside(d) ? "white" : "#505050" })
          .on("mouseover", mouseover)
          .on("mouseout", mouseup)
          .on("mousemove", mouseover);

      /* Add x labels to chart */
    	let xLabels = svg.append("g")
    		               .attr("transform", "translate(" + margin.left + "," + (margin.top + height)  + ")");

    	xLabels.selectAll("text.xAxis")
    		     .data(indexDs1)
    		     .enter()
    		     .append("text")
    		     .text(function(d) { return d.attrib_value;})
    		     .attr("text-anchor", "middle")
    			   /* Set x position to the left edge of each bar plus half the bar width */
    				 .attr("x", function(d, i) {
    				       return (i * (width / indexDs1.length)) + ((width / indexDs1.length - barPadding) / 2);
    				 })
    		     .attr("y", 15)
    		     .attr("class", "xAxis");

      /* Add a y-axis */
      let axis = d3.axisLeft(yScale)
          .ticks(5)
          .tickFormat(function (d) { return d + "%" })
          .tickSize(0);

      svg.append("g")
          .attr("transform", "translate(" + (margin.left - 1) + "," + (margin.top - 1) + ")")
          .attr("class", "axis")
          .call(axis);

      /* Remove vertical and extra horizontal gridlines */
      svg.selectAll(".domain").remove()



      function up(d, i) {
    	   /* update all charts when user selects a single bar in this chart */
         /* if clicking on already selected item, then reset the charts */
         isSelected = d3.select(".selected-tile #"+attrName+"Chart rect[attrib-value='"+d.attrib_value+"'][selected='yes']")._groups[0][0];
         if (isSelected){
           DS_VIS_STORE["activeFilter"] = null;
           drawComparisonCharts3();
           showActiveFilter(DS_VIS_STORE);
         } else {
           update3ComparisonCharts(attrName, d.attrib_value);
           showActiveFilter(DS_VIS_STORE);
         }
    	}

      function mouseover(d) {
        // let ttipsvg = d3.select("#"+attrName+"Chart").node()
        // let bound = ttipsvg.getBoundingClientRect();
        // let tipX = d3.event.clientX - bound.x + 30;
        // let tipY = d3.event.clientY - bound.y - 10;
        // if (width - tipX < 50) {
        //   tipX = d3.event.clientX - bound.x - 100;
        // }
        let e = window.event;
        var x = e.clientX,
            y = e.clientY;

        let tipY = (y - 40) + 'px';
        let tipX = (x) + 'px';
        if  (window.innerWidth - x < 200) {
          tipX = (x - 130) + 'px';
        }


        tooltip.transition()
            .duration(200)
        tooltip.html("Target Pct: " + d.target_pct + "%<br/>"  + "Index: " + d.index)
            .style("opacity", .9)
            .style('left', `${(tipX)}`)
            .style('top', `${(tipY)}`);
      }

      function mouseup(d) {
        tooltip.style('opacity', 0);
      }

}


/*******************************************************************************
*** 3-SERIES Parallel CHART ****************************************************
*******************************************************************************/
function hBar3ParallelChart(attrName, indexDs1, indexDs2, indexDs3) {
    let innerWidth = 400;

    let basics = barChartSetup(innerWidth);
    let margin = basics.margin,
        width = basics.width,
        height = basics.height,
        barPadding = basics.barPadding * 100;

    margin.left = 20;
    margin.right = 20;

    let xScale = d3.scaleLinear()
                    .domain([0, 100])
                    .range([0, width]);

    let yScale = d3.scaleLinear()
                    .domain([0, 2])
                    .range([0, height/3]);

    let svg = d3.select("#"+attrName+"Chart")
                .append("svg")
                .attr("width", width + margin.left + margin.right)
                .attr("height", height + margin.top + margin.bottom)
                .attr("id", attrName+"ChartPlot")
                .attr("class", "ds-chart-base");

    const tooltip = d3.select("#"+attrName+"Chart").append("div")
        .attr("class", "ds-tooltip")
        .style("opacity", 0);

    svg.append("g")
        .attr("class", "ds-grid")
        .attr("transform", "translate(" + (margin.left - 1) + "," + (margin.top - 1) + ")")

    let plot = svg.append("g")
                  .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    let barHeight = height / 8;
    let paddingBottom = 30;
    let barSpacing = 40;
    let topPos = height - ((barHeight + barSpacing) * 3 + paddingBottom);
    let lineStroke = 'steelblue';
    let lineExtend = 12;
    let lineStrokeWidth = 3;

    /* Attach index data and add the chart elems */
    /* 1st series */
    plot.selectAll("rect.series1")
        .data(indexDs1)
        .enter()
        .append("rect")
        .attr("class", "series1")
        .attr("x", function(d, i) { return i ? xScale(100 - d.target_pct) : 0})
        .attr("width", function(d) { return xScale(d.target_pct)})
        .attr("y", function(d) { return topPos })
        .attr("height", function(d) { return barHeight ; })
        .attr("fill", colorSeries1)
        .attr("cursor", "pointer")
        .attr("attrib-value", function(d) { return d.attrib_value; })    /* storing the Acxiom attrib value on the element */
        .on("mouseover", mouseover)
        .on("mouseout", mouseup)
        .on("mousemove", mouseover)
        .attr("target-pct", function(d) { return d.target_pct; })
        .attr("index", function(d) { return d.index; })
        .on("click", up);

    plot.selectAll("rect.series2")
        .data(indexDs2)
        .enter()
        .append("rect")
        .attr("class", "series2")
        .attr("x", function(d, i) { return i ? xScale(100 - d.target_pct) : 0})
        .attr("width", function(d) { return xScale(d.target_pct)})
        .attr("y", topPos + barSpacing + barHeight)
        .attr("height", function(d) { return barHeight ; })
        .attr("fill", colorSeries2)
        .attr("cursor", "pointer")
        .attr("attrib-value", function(d) { return d.attrib_value; })    /* storing the Acxiom attrib value on the element */
        .on("mouseover", mouseover)
        .on("mouseout", mouseup)
        .on("mousemove", mouseover)
        .attr("target-pct", function(d) { return d.target_pct; })
        .attr("index", function(d) { return d.index; })
        .on("click", up);

    plot.selectAll("rect.series3")
        .data(indexDs3)
        .enter()
        .append("rect")
        .attr("class", "series3")
        .attr("x", function(d, i) { return i ? xScale(100 - d.target_pct) : 0})
        .attr("width", function(d) { return xScale(d.target_pct)})
        .attr("y", topPos + barSpacing * 2 + barHeight*2)
        .attr("height", function(d) { return barHeight ; })
        .attr("fill", colorSeries3)
        .attr("cursor", "pointer")
        .attr("attrib-value", function(d) { return d.attrib_value; })    /* storing the Acxiom attrib value on the element */
        .on("mouseover", mouseover)
        .on("mouseout", mouseup)
        .on("mousemove", mouseover)
        .attr("target-pct", function(d) { return d.target_pct; })
        .attr("index", function(d) { return d.index; })
        .on("click", up)

    plot.selectAll("text.series1")
        .data(indexDs1)
        .enter()
        .append("text")
        .attr("class", "series1")
        .text(function(d) {
             return formatAsInteger(d3.format("d")(d.index));
        })
        .attr("text-anchor", "middle")
        /* Set x position to the left edge of each bar plus half the bar width */
        .attr("x",  function(d, i) { return i ? xScale(100 ) - 20 : 14})
        .attr("y", function(d) { return topPos + 3 + (barHeight/2)})
        .attr("class", "yAxis")
        .attr("font-family", "sans-serif")
    //    .attr("font-size", "8px")
        .attr("fill", "white")
        .on("mouseover", mouseover)
        .on("mouseout", mouseup)
        .on("mousemove", mouseover);

    plot.selectAll("text.series2")
        .data(indexDs2)
        .enter()
        .append("text")
        .attr("class", "series2")
        .text(function(d) {
             return formatAsInteger(d3.format("d")(d.index));
        })
        .attr("text-anchor", "middle")
        /* Set x position to the left edge of each bar plus half the bar width */
        .attr("x",  function(d, i) { return i ? xScale(100 ) - 20 : 14})
        .attr("y", function(d) { return topPos + barSpacing + 3 + barHeight + (barHeight/2)})
        .attr("class", "yAxis")
        .attr("font-family", "sans-serif")
    //    .attr("font-size", "8px")
        .attr("fill", "white")
        .on("mouseover", mouseover)
        .on("mouseout", mouseup)
        .on("mousemove", mouseover);

    plot.selectAll("text.series3")
        .data(indexDs3)
        .enter()
        .append("text")
        .attr("class", "series3")
        .text(function(d) {
             return formatAsInteger(d3.format("d")(d.index));
        })
        .attr("text-anchor", "middle")
        /* Set x position to the left edge of each bar plus half the bar width */
        .attr("x",  function(d, i) { return i ? xScale(100 ) - 20 : 14})
        .attr("y", function(d) { return topPos + barSpacing * 2 + 3 + barHeight*2 + (barHeight/2)})
        .attr("class", "yAxis")
        .attr("font-family", "sans-serif")
    //    .attr("font-size", "8px")
        .attr("fill", "white")
        .on("mouseover", mouseover)
        .on("mouseout", mouseup)
        .on("mousemove", mouseover);

    plot.selectAll("text.labels")
        .data(indexDs1)
        .enter()
        .append("text")
        .attr("class", "ds-binary-label")
        .text(function(d) {
             return d.attrib_value;
        })
        .attr("text-anchor", function(d, i) { return i ? "end" : "start";})
        /* Set x position to the left edge of each bar plus half the bar width */
        .attr("x",  function(d, i) { return i ? xScale(100 ) : 0})
        .attr("y", function(d) { return topPos - 30})
        .attr("class", "yAxis")
        .attr("font-family", "sans-serif")
        .attr("font-size", "20px")
        .attr("fill", "#505050")
        .on("mouseover", mouseover)
        .on("mouseout", mouseup)
        .on("mousemove", mouseover);

    var lineData1 = [{"x": xScale(indexDs1[0].target_pct), "y": topPos - lineExtend},
                    {"x": xScale(indexDs1[0].target_pct), "y": topPos + barHeight + lineExtend}]

    var line1 = d3.line()
                 .x(function(d) {return d.x})
                 .y(function(d) {return d.y});

    var path1 = plot.append('path').attr('d', line1(lineData1)).attr("stroke", lineStroke)
        .attr("stroke-width", lineStrokeWidth)
        .attr("fill", "none");

    var lineData2 = [{"x": xScale(indexDs2[0].target_pct), "y": topPos + barSpacing + barHeight - lineExtend},
                    {"x": xScale(indexDs2[0].target_pct), "y": topPos + barSpacing + barHeight + barHeight + lineExtend}]

    var line2 = d3.line()
                 .x(function(d) {return d.x})
                 .y(function(d) {return d.y});

    var path2 = plot.append('path').attr('d', line2(lineData2)).attr("stroke", lineStroke)
        .attr("stroke-width", lineStrokeWidth)
        .attr("fill", "none");

    var lineData3 = [{"x": xScale(indexDs3[0].target_pct), "y": topPos + barSpacing*2 + barHeight*2 - lineExtend},
                    {"x": xScale(indexDs3[0].target_pct), "y": topPos + barSpacing*2 + barHeight*2 + barHeight + lineExtend}]

    var line3 = d3.line()
                 .x(function(d) {return d.x})
                 .y(function(d) {return d.y});

    var path3 = plot.append('path').attr('d', line3(lineData3)).attr("stroke", lineStroke)
        .attr("stroke-width", lineStrokeWidth)
        .attr("fill", "none");

    /* Add x-axis */
    let xAxis = d3.axisBottom(xScale)
        //.ticks(3)
        .tickSize(0)
        .tickValues(d3.range(0, 101, 25))
        .tickFormat(function (d) { return d + "%" });

    let xAxisElement = svg.append("g")
        .attr("class", "xAxis")
        .attr("transform", "translate(" + (margin.left) + "," + (margin.top + height - 1) + ")")
        .call(xAxis);

    /* Remove the axis line */
    svg.selectAll(".domain").remove();



    function up(d, i) {

      tooltip.style('opacity', 0);

       /* update all charts when user selects a single bar in this chart */
       /* if clicking on already selected item, then reset the charts */
       isSelected = d3.select(".selected-tile #"+attrName+"Chart rect[attrib-value='"+d.attrib_value+"'][selected='yes']")._groups[0][0];
       if (isSelected){
         DS_VIS_STORE["activeFilter"] = null;
         drawComparisonCharts3();
         showActiveFilter(DS_VIS_STORE);
       } else {
         update3ComparisonCharts(attrName, d.attrib_value);
         showActiveFilter(DS_VIS_STORE);
       }
    }

    function mouseover(d) {
      let e = window.event;
      var x = e.clientX,
          y = e.clientY;

      let tipY = (y - 60) + 'px';
      let tipX = (x) + 'px';
      if  (window.innerWidth - x < 200) {
        tipX = (x - 130) + 'px';
      }

      tooltip.transition()
          .duration(200)
      tooltip.html(d.attrib_value + "<br/>" + "Target Pct: " + d.target_pct + "%<br/>"  + "Index: " + d.index)
          .style("opacity", .9)
          .style('left', `${(tipX)}`)
          .style('top', `${(tipY)}`);
    }

    function mouseup(d) {
      tooltip.style('opacity', 0);
    }

}


/*******************************************************************************
*** 2-SERIES HORIZONTAL BAR CHART **********************************************
*******************************************************************************/
function hBar3SeriesChart(attrName, indexDs1, indexDs2, indexDs3) {
    index1 = indexDs1[0];
    index2 = indexDs1[1];
    index3 = indexDs1[2];

    let localColor1 = DS_VIS_STORE[attrName+"Colors"][0],
        localColor2 = DS_VIS_STORE[attrName+"Colors"][1],
        localColor3 = DS_VIS_STORE[attrName+"Colors"][2];

    let innerWidth = 700;

    let basics = barChartSetup(innerWidth);
    let margin = basics.margin,
      width = basics.width,
      height = basics.height,
    		barPadding = basics.barPadding * 2;

      margin.left = 0;

    let maxAttrLength = width / 2.25;

  	let yScale = d3.scaleLinear()
                   .domain([0, index1.length])
  					       .range([0, height]);

    let xScale = d3.scaleLinear()
  		             .domain([0, 100])
  		             .range([0, width - maxAttrLength]);

    /* Create SVG element */
    let svg = d3.select("#"+attrName+"Chart")
                .append("svg")
  		          .attr("width", width + margin.left + margin.right + 15) // Adjusted to fit axis
                .attr("height", height + margin.top + margin.bottom)
                .attr("id", attrName+"ChartPlot")
                .attr("class", "ds-chart-base");

    const tooltip = d3.select("#"+attrName+"Chart")
        .append("div")
        .attr("class", "ds-tooltip")
        .style("opacity", 0);

    /* Add horizontal grid lines */
    function make_x_gridlines() {
        return d3.axisBottom(xScale)
            .ticks(5)
    }

    svg.append("g")
        .attr("class", "ds-grid")
        .attr("transform", "translate(" + (margin.left + maxAttrLength - 1) + "," + (margin.top + height - 1) + ")")
        .call(make_x_gridlines()
            .tickSize(-height)
            .tickFormat("")
        )

    let plot = svg.append("g")
  		            .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
                  .attr("id", "#"+attrName+"Plot");

    let barHeight = height / ( index1.length * 3 ) - barPadding;

    /* Attach index data and add the chart elems */
    /* 1st series */
  	plot.selectAll("rect.series1")
        .data(index1)
  		  .enter()
  		  .append("rect")
        .attr("class", "series1")
  			.attr("x", function(d) {
             return maxAttrLength;
  			})
  		  .attr("height", barHeight)
  			.attr("y", function(d, i) {
  			     return yScale(i);
  			})
  			.attr("width", function(d) {
  			    return xScale(d.target_pct);
  			})
  			.attr("fill", function(d) {
            return localColor1;
        })
        .attr("attrib-value", function(d) { return d.attrib_value; })    /* storing the Acxiom attrib value on the element */
        .on("mouseover", mouseover)
        .on("mouseout", mouseout)
        .on("mousemove", mouseover)
        .attr("attrib-category", function(d) { return d.category; })
        .attr("target-pct", function(d) { return d.target_pct; })
        .attr("index", function(d) { return d.index; })
        ;

    /* 2nd series */
  	plot.selectAll("rect.series2")
        .data(index2)
  		  .enter()
  		  .append("rect")
        .attr("class", "series2")
  			.attr("x", function(d) {
             return maxAttrLength;
  			})
  		  .attr("height", barHeight)
  			.attr("y", function(d, i) {
  			     return yScale(i) + barHeight;
  			})
  			.attr("width", function(d) {
  			    return xScale(d.target_pct);
  			})
  			.attr("fill", function(d) {
            return localColor2;
        })
        .attr("attrib-value", function(d) { return d.attrib_value; })    /* storing the Acxiom attrib value on the element */
        .on("mouseover", mouseover)
        .on("mouseout", mouseout)
        .on("mousemove", mouseover)
        .attr("attrib-category", function(d) { return d.category; })
        .attr("target-pct", function(d) { return d.target_pct; })
        .attr("index", function(d) { return d.index; })
        ;

    /* 3rd series */
  	plot.selectAll("rect.series3")
        .data(index3)
  		  .enter()
  		  .append("rect")
        .attr("class", "series3")
  			.attr("x", function(d) {
             return maxAttrLength;
  			})
  		  .attr("height", barHeight)
  			.attr("y", function(d, i) {
  			     return yScale(i) + barHeight*2;
  			})
  			.attr("width", function(d) {
  			    return xScale(d.target_pct);
  			})
  			.attr("fill", function(d) {
            return localColor3;
        })
        .attr("attrib-value", function(d) { return d.attrib_value; })    /* storing the Acxiom attrib value on the element */
        .on("mouseover", mouseover)
        .on("mouseout", mouseout)
        .on("mousemove", mouseover)
        .attr("attrib-category", function(d) { return d.category; })
        .attr("target-pct", function(d) { return d.target_pct; })
        .attr("index", function(d) { return d.index; })
        ;

    /* Will set x position and color dependent on size of bar */
    function textInside(d) { return xScale(d.target_pct) > 30};

    /* Add y labels to plot */
    /* Series 1 */
  	plot.selectAll("text.series1")
  	    .data(index1)
  	    .enter()
  	    .append("text")
        .attr("class", "series1")
  	    .text(function(d) {
  			     return formatAsInteger(d3.format("d")(d.index));
  	    })
  	    .attr("text-anchor", "middle")
  	    /* Set y position to the top edge of each bar plus half the bar width */
  	    .attr("y", function(d, i) {
  			     return (i * 3 * (barHeight + barPadding) + barHeight / 2 + barPadding * 2);
  	    })
  	    .attr("x", function(d) { return textInside(d) ? maxAttrLength + xScale(d.target_pct) - 20 : maxAttrLength + xScale(d.target_pct) + 20 })
  	    //.attr("class", "xAxis")
  	    .attr("font-family", "sans-serif")
  	    .attr("font-size", "11px")
  	    .attr("fill", function(d) { return textInside(d) ? "white" : "#505050" })
        .on("mouseover", mouseover)
        .on("mouseout", mouseout)
        .on("mousemove", mouseover);

    /* Series 2 */
    plot.selectAll("text.series2")
        .data(index2)
        .enter()
        .append("text")
        .attr("class", "series2")
        .text(function(d) {
             return formatAsInteger(d3.format("d")(d.index));
        })
        .attr("text-anchor", "middle")
        /* Set y position to the top edge of each bar plus half the bar width */
        .attr("y", function(d, i) {
             return (i * 3 * (barHeight + barPadding) + barHeight * 1.5 + barPadding * 2);
        })
        .attr("x", function(d) { return textInside(d) ? maxAttrLength + xScale(d.target_pct) - 20 : maxAttrLength + xScale(d.target_pct) + 20 })
        //.attr("class", "xAxis")
        .attr("font-family", "sans-serif")
        .attr("font-size", "11px")
        .attr("fill", function(d) { return textInside(d) ? "white" : "#505050" })
        .on("mouseover", mouseover)
        .on("mouseout", mouseout)
        .on("mousemove", mouseover);

    /* Series 3 */
    plot.selectAll("text.series3")
        .data(index3)
        .enter()
        .append("text")
        .attr("class", "series3")
        .text(function(d) {
             return formatAsInteger(d3.format("d")(d.index));
        })
        .attr("text-anchor", "middle")
        /* Set y position to the top edge of each bar plus half the bar width */
        .attr("y", function(d, i) {
             return (i * 3 * (barHeight + barPadding) + barHeight + barHeight * 1.5 + barPadding * 2);
        })
        .attr("x", function(d) { return textInside(d) ? maxAttrLength + xScale(d.target_pct) - 20 : maxAttrLength + xScale(d.target_pct) + 20 })
        //.attr("class", "xAxis")
        .attr("font-family", "sans-serif")
        .attr("font-size", "11px")
        .attr("fill", function(d) { return textInside(d) ? "white" : "#505050" })
        .on("mouseover", mouseover)
        .on("mouseout", mouseout)
        .on("mousemove", mouseover);

    /* Add y labels to chart */
  	let yLabels = svg.append("g")
  		               .attr("transform", "translate(" + margin.left + "," + (margin.top)  + ")");

    /* Series 1 */
  	yLabels.selectAll("text.yAxis.series1")
  		     .data(index1)
  		     .enter()
  		     .append("text")
           .attr("class", "series1")
  		     .text(function(d) {
             let yLabel = d.attrib_value;
             if (d.attrib_value.length > 26) {
               yLabel = yLabel.slice(0, 26) + "...";
             }
             return yLabel;
           })
           .attr("fill", function(d) {
               return localColor1;
           })
  		     .attr("text-anchor", "start")
           .attr("y", function(d, i) {
                return (i * 3 * (barHeight + barPadding) + barHeight * 1.5 + barPadding * 2);
           })
  		     .attr("x", 66)
  		     .attr("class", "yAxis");

    /* Add ranking y labels to chart */
  	yLabels.selectAll("text.ranking")
  		     .data([ 1, 2, 3, 4, 5])
  		     .enter()
  		     .append("text")
           .attr("class", "ranking")
  		     .text(function(d) {
             return "#" + d;
           })
           .attr("fill", "#81838c")
     	     .attr("font-size", "36px")
  		     .attr("text-anchor", "start")
  			   /* Set y position to the top edge of each bar plus half the bar width */
  				 .attr("y", function(d, i) {
  				       return (i * 3 * (barHeight + barPadding) + barHeight * 1.5 + barPadding + 10);
  				 })
  		     .attr("x", 0)
  		     .attr("class", "yAxis");


    /* Add x-axis */
    let xAxis = d3.axisBottom(xScale)
        .tickSize(0)
        .ticks(5)
        .tickFormat(function (d) { return d + "%" });

    let xAxisElement = svg.append("g")
        .attr("class", "xAxis")
        .attr("transform", "translate(" + (margin.left - 1 + maxAttrLength) + "," + (margin.top + height - 1) + ")")
        .call(xAxis);

    /* Remove vertical and extra horizontal gridlines */
    svg.selectAll(".domain").remove();

    addTripleCompareToggle(attrName);

    function changeToggleText(audNumber) {
        $("#"+attrName+"Chart .ds-hbar-status").text(function() {
            let aud = (audNumber === 1) ? targetAud.name : audNumber === 2 ? targetAud2.name : targetAud3.name;
            return "Top 5 for " + aud + " (by Index)";

        });
    }

    let inp = [indexDs1,indexDs2,indexDs3]
    let idx1 = DS_VIS_STORE[attrName+"Active"].indexOf(1)
    let idx2 = DS_VIS_STORE[attrName+"Active"].indexOf(2)
    let idx3 = DS_VIS_STORE[attrName+"Active"].indexOf(3)
    let trans = [inp[idx1],inp[idx2],inp[idx3]]

    /* Toggle Comparison Charts on click */
    $("#"+attrName+"Chart .ds-toggle-button .ds-t1").unbind().click(function() {
          DS_VIS_STORE[attrName+"Active"] = [1,2,3]
          DS_VIS_STORE[attrName+"Colors"] = [colorSeries1, colorSeries2, colorSeries3]
          $(this).toggleClass("active")
          $("#"+attrName+"Chart .ds-toggle-button .ds-t2").toggleClass("active",false)
          $("#"+attrName+"Chart .ds-toggle-button .ds-t3").toggleClass("active",false)
          changeToggleText(1);
          toggleComparisonCharts(attrName, [trans[0],trans[1],trans[2]]);
      });

    $("#"+attrName+"Chart .ds-toggle-button .ds-t2").unbind().click(function() {
          DS_VIS_STORE[attrName+"Active"] = [2,1,3]
          DS_VIS_STORE[attrName+"Colors"] = [colorSeries2, colorSeries1, colorSeries3]
          $(this).toggleClass("active")
          $("#"+attrName+"Chart .ds-toggle-button .ds-t1").toggleClass("active",false)
          $("#"+attrName+"Chart .ds-toggle-button .ds-t3").toggleClass("active",false)
          changeToggleText(2);
          toggleComparisonCharts(attrName, [trans[1],trans[0],trans[2]]);
      });


    $("#"+attrName+"Chart .ds-toggle-button .ds-t3").unbind().click(function() {
          DS_VIS_STORE[attrName+"Active"] = [3,1,2]
          DS_VIS_STORE[attrName+"Colors"] = [colorSeries3, colorSeries1, colorSeries2]
          $(this).toggleClass("active")
          $("#"+attrName+"Chart .ds-toggle-button .ds-t2").toggleClass("active",false)
          $("#"+attrName+"Chart .ds-toggle-button .ds-t1").toggleClass("active",false)
          changeToggleText(3);
          toggleComparisonCharts(attrName, [trans[2],trans[0],trans[1]]);
      });

    function toggleComparisonCharts(attrName, out) {
        //d3.select("#"+attrName+"Chart svg").remove();
        //$("#"+attrName+"Chart .ds-toggle-button .ds-triple-toggle").remove();
        //hBar3SeriesChart(attrName,out[0],out[1],out[2]);
        plot = d3.select("#"+attrName+"Chart");
        addCompHbar(plot, "series1", out[0][0], maxAttrLength, barHeight, xScale, yScale, DS_VIS_STORE[attrName+"Colors"][0]);
        addCompHbar(plot, "series2", out[0][1], maxAttrLength, barHeight, xScale, yScale, DS_VIS_STORE[attrName+"Colors"][1]);
        addCompHbar(plot, "series3", out[0][2], maxAttrLength, barHeight, xScale, yScale, DS_VIS_STORE[attrName+"Colors"][2]);
        addCompHbarText(plot, "series1", out[0][0], barHeight, barPadding, maxAttrLength);
        addCompHbarText(plot, "series2", out[0][1], barHeight, barPadding, maxAttrLength);
        addCompHbarText(plot, "series3", out[0][2], barHeight, barPadding, maxAttrLength);

        function addCompHbar(plot, series, aud, maxAttrLength, barHeight, xScale, yScale, color) {
          // index1 = indexDs1[0];
          // index2 = indexDs1[1];
          // index3 = indexDs1[2];
          console.log(JSON.stringify(aud))
          plot.selectAll("rect."+series)
              .data(aud)
              .transition()
              .duration(600)
              .attr("class", series)
              .attr("x", function(d) {
                   return maxAttrLength;
              })
              .attr("height", barHeight)
              .attr("y", function(d, i) {
                   return (series == "series1") ? yScale(i) : (series == "series2") ? yScale(i) + barHeight : yScale(i) + barHeight*2;
              })
              .attr("width", function(d) {
                  return xScale(d.target_pct);
              })
              .attr("fill", function(d) {
                  return color;
              })
              .attr("attrib-value", function(d) { return d.attrib_value; })    /* storing the Acxiom attrib value on the element */
              .attr("attrib-category", function(d) { return d.category; })
              .attr("target-pct", function(d) { return d.target_pct; })
              .attr("index", function(d) { return d.index; })
              ;

        }

        function addCompHbarText(plot, series, aud, barHeight, barPadding, maxAttrLength) {
          plot.selectAll("text."+series)
              .data(aud)
              .transition()
              .duration(600)
              .text(function(d) {
                   return formatAsInteger(d3.format("d")(d.index));
              })
              .attr("class", series)
              .attr("text-anchor", "middle")
              /* Set y position to the top edge of each bar plus half the bar width */
              .attr("y", function(d, i) {
                  if (series == "series1") {
                    return (i * 3 * (barHeight + barPadding) + barHeight / 2 + barPadding * 2);
                  } else if (series == "series2") {
                    return (i * 3 * (barHeight + barPadding) + barHeight * 1.5 + barPadding * 2);
                  } else {
                    return (i * 3 * (barHeight + barPadding) + barHeight + barHeight * 1.5 + barPadding * 2);
                  }

              })
              .attr("x", function(d) { return textInside(d) ? maxAttrLength + xScale(d.target_pct) - 20 : maxAttrLength + xScale(d.target_pct) + 20 })
              .attr("font-family", "sans-serif")
              .attr("font-size", "11px")
              .attr("fill", function(d) { return textInside(d) ? "white" : "#505050" });
        }

        plot.selectAll("text.yAxis")
               .data(out[0][0])
               .transition()
               .duration(600)
               .attr("class", "series1 yAxis")
               .text(function(d) {
                 console.log(d.attrib_value)
                 let yLabel = d.attrib_value;
                 if (d.attrib_value.length > 26) {
                   yLabel = yLabel.slice(0, 26) + "...";
                 }
                 return yLabel;
               })
               .attr("fill", function(d) {
                   return DS_VIS_STORE[attrName+"Colors"][0];
               })
               .attr("text-anchor", "start")
               /* Set y position to the top edge of each bar plus half the bar width */
               .attr("y", function(d, i) {
                   return (i * 3 * (barHeight + barPadding) + barHeight * 1.5 + barPadding * 2);
               })
               .attr("x", 66);
    }






    function mouseover(d) {

      let e = window.event;
      var x = e.clientX,
          y = e.clientY;

      let tipY = (y - 80) + 'px';
      let tipX = (x) + 'px';
      if  (window.innerWidth - x < 200) {
        tipX = (x - 130) + 'px';
      }

      tooltip.html(d.attrib_value + "<br/>" + "<br/>" + "Category: " + d.category + "<br/>" + "Target Pct: " + d.target_pct + "%<br/>"  + "Index: " + d.index)
          .style("opacity", .9)
          .style('left', `${(tipX)}`)
          .style('top', `${(tipY)}`);
    }

    function mouseout() {
        tooltip.style('opacity', 0);
    }

}


/*******************************************************************************
*** WAVE 3-SERIES CHART ********************************************************
*******************************************************************************/
function wave3SeriesChart(ds1, ds2, ds3) {

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
    let t = indexDs.map(function(row) {
      // the white spaces are needed here to create padding, b/c plotly
      // doesn't seem to have padding options, and allows only inline html tags
      // in the tooltip text string
      return "<br>    " + "    <br>    "
        + attrFullName[attrName]
        + " = "
        + row['attrib_value']
        + "    <br>    Target Pct: "
        + row['target_pct'].toString()
        + "%    <br>    Index: "
        + row['index'].toString()
        + "    <br>    ";
    });
    return t;
  }

  let traces1 = [];
  let traces2 = [];
  let traces3 = [];
  let attrNames = Object.keys(ds1);

  attrNames.forEach(function(attrName, i){
    traces1[i] = {
      name: attrName,
      x: unpack(ds1[attrName], 'index'),
      y: unpack(ds1[attrName], 'target_pct'),
      base: unpack(ds1[attrName], 'target_pct').map(x => -x/2),
      width: 3,
      type: 'bar',
      marker: {
        color: colorSeries1,
        opacity: 0.5
      },
     hovertext: makeToolTips(ds1[attrName], attrName),
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

    traces2[i] = {
      name: attrName,
      x: unpack(ds2[attrName], 'index'),
      y: unpack(ds2[attrName], 'target_pct'),
      base: unpack(ds2[attrName], 'target_pct').map(x => -x/2),
      width: 3,
      type: 'bar',
      marker: {
        color: colorSeries2,
        opacity: 0.5
      },
     hovertext: makeToolTips(ds2[attrName], attrName),
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

    traces3[i] = {
      name: attrName,
      x: unpack(ds3[attrName], 'index'),
      y: unpack(ds3[attrName], 'target_pct'),
      base: unpack(ds3[attrName], 'target_pct').map(x => -x/2),
      width: 3,
      type: 'bar',
      marker: {
        color: colorSeries3,
        opacity: 0.5
      },
     hovertext: makeToolTips(ds3[attrName], attrName),
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

  });

  let height = 150;
	let width = 1260;

  let layout = {
    hovermode:'closest',
    // height: height,
    // width: width,
    annotations: [{
      x: 0,
      y: -50,
      xref: 'x',
      yref: 'y',
      text: '0',
      showarrow: false,
    },
    {
      x: 500,
      y: -50,
      xref: 'x',
      yref: 'y',
      text: '500',
      showarrow: false,
    }],
    xaxis: {
      range: [0, 500],
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

  let traces = [...traces1, ...traces2, ...traces3];
  Plotly.newPlot("waveChart", traces, layout, {displayModeBar: false, responsive: true});

}


/*******************************************************************************
*** 3-SERIES MIKEJ CHART *******************************************************
*******************************************************************************/
function mikeJ3SeriesChart(attrName, indexDs1, indexDs2, indexDs3) {

  // sort data alphabetically by category
  indexDs1.sort((a, b) => b.category.localeCompare(a.category));
  indexDs2.sort((a, b) => b.category.localeCompare(a.category));

  // put together tooltip values
  function getMikeJTooltipValues(ds){
    toolTipValuesArray = ds.map(function(row) {
      let toolTipBoxLength = Math.max(
        row['attrib_value'].length,
        row['target_pct'].toString().length + 12,
        row['index'].toString().length + 7
      );
      // the white spaces are needed here to create padding, b/c plotly
      // doesn't seem to have padding options, and allows only inline html tags
      // in the tooltip text string
      return "<br>    " + "  ".repeat(toolTipBoxLength) +"    <br>    "
        + row['attrib_value']
        + "    <br>    Target Pct: "
        + row['target_pct'].toString()
        + "%<br>    Index: "
        + row['index'].toString()
        + "<br>   ";
    });
    return toolTipValuesArray;
  }

  let trace1 = {
    showlegend: false,
    x: unpack(indexDs1, 'index'),
    y: unpack(indexDs1, 'category'),
    mode: 'markers',
    type: 'scatter',
    marker: {
      size: unpack(indexDs1, 'target_pct').map(x => Math.sqrt(x)*5),
      color: colorSeries1,
      opacity: 0.5,
      line: {width: 0}
    },
    hovertext: getMikeJTooltipValues(indexDs1),
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

  let trace2 = {
    showlegend: false,
    x: unpack(indexDs2, 'index'),
    y: unpack(indexDs2, 'category'),
    mode: 'markers',
    type: 'scatter',
    marker: {
      size: unpack(indexDs2, 'target_pct').map(x => Math.sqrt(x)*5),
      color: colorSeries2,
      opacity: 0.5,
      line: {width: 0}
    },
    hovertext: getMikeJTooltipValues(indexDs2),
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

  let trace3 = {
    showlegend: false,
    x: unpack(indexDs3, 'index'),
    y: unpack(indexDs3, 'category'),
    mode: 'markers',
    type: 'scatter',
    marker: {
      size: unpack(indexDs3, 'target_pct').map(x => Math.sqrt(x)*5),
      color: colorSeries3,
      opacity: 0.5,
      line: {width: 0}
    },
    hovertext: getMikeJTooltipValues(indexDs3),
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


  // calculate chart height based on the number of distinct categories
//  let allCats = [...new Set( unpack(indexDs, 'category') )];
  let allCats = [...new Set( [...unpack(indexDs1, 'category'), ...unpack(indexDs2, 'category')] )];
  let height = allCats.length * 58;
	let width = 1260;
  let margin = 40;

  // update the tile height to fit in the chart
  $("#"+attrName+"DetailChart").parent().css("height", height + margin);


  let layout = {
    hovermode:'closest',
    // height: height,
    // width: width,
    xaxis: {
      range: [ 0, 520 ],
      title: 'index'
    },
    yaxis: {
      type: 'category'
    },
    margin: {
      l: 140,
      r: 40,
      b: 100,
      t: 20,
      pad: 4
    },
    paper_bgcolor: '#fafafa',
    plot_bgcolor: '#fafafa',
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
    }]
  };

  let chartName = attrName+"DetailChart";
  Plotly.newPlot(chartName, [trace1, trace2, trace3], layout, {displayModeBar: false, responsive: true});
}





function add3AudienceTitles(targetAud1, targetAud2, targetAud3) {
  // remove existing titles, if any
  $( ".ds-audience-title h1" ).remove();

  // add titles
  $( ".ds-audience-title" )
    .append("<h1><span class= 'ds-aud-title-1'>"
      + targetAud1.name
      + "</span> VS <span class= 'ds-aud-title-2'>"
      + targetAud2.name
      + "</span> VS <span class= 'ds-aud-title-3'>"
      + targetAud3.name
      + "</span></h1>");

  // add color codes
  $(".ds-audience-title .ds-aud-title-1").css("color", colorSeries1);
  $(".ds-audience-title .ds-aud-title-2").css("color", colorSeries2);
  $(".ds-audience-title .ds-aud-title-3").css("color", colorSeries3);
}

function drawComparisonCharts3() {
  /* Remove any active tooltips */
  d3.selectAll(".ds-tooltip").remove();

  /* View setup */
  addAudienceLegend(compare=3);
  addMultipleAudienceTitles(targetAud, targetAud2, targetAud3);

  let indexCats = makeIndexCats();
  let demogAttributesList = Object.keys(indexCats);

  /* Remove the current svg from each chart div */
  demogAttributesList.forEach(function(demogAttributeListName) {
    d3.select("#"+demogAttributeListName+"Chart svg").remove();
  });

  let audName1 = targetAud.name;
  let ageIndex1 = indexAttr("age", indexCats.age, targetDemog, randomDemog);
  let ageMedianCat1 = getMedianCategory(ageIndex1);
  let genderIndex1 = indexAttr("gender", indexCats.gender, targetDemog, randomDemog);
  let ethnicityIndex1 = indexAttr("ethnicity", indexCats.ethnicity, targetDemog, randomDemog);
  let maritalIndex1 = indexAttr("marital", indexCats.marital, targetDemog, randomDemog);
  let childrenIndex1 = indexAttr("children", indexCats.children, targetDemog, randomDemog);
  let childrenNonZeroPct1 = getNonZeroPct(childrenIndex1);
  let educationIndex1 = indexAttr("education", indexCats.education, targetDemog, randomDemog);
  let incomeIndex1 = indexAttr("income", indexCats.income, targetDemog, randomDemog);
  let incomeMedianCat1 = getMedianCategory(incomeIndex1);
  let stateIndex1 = indexAttr("state", indexCats.state, targetDemog, randomDemog);
  let interestsIndex1 = indexInterestsRetail("interests", targetInterests, randomInterests);
  let retailIndex1 = indexInterestsRetail("retail", targetRetail, randomRetail);

  let audName2 = targetAud2.name;
  let ageIndex2 = indexAttr("age", indexCats.age, targetDemog2, randomDemog);
  let ageMedianCat2 = getMedianCategory(ageIndex2);
  let genderIndex2 = indexAttr("gender", indexCats.gender, targetDemog2, randomDemog);
  let ethnicityIndex2 = indexAttr("ethnicity", indexCats.ethnicity, targetDemog2, randomDemog);
  let maritalIndex2 = indexAttr("marital", indexCats.marital, targetDemog2, randomDemog);
  let childrenIndex2 = indexAttr("children", indexCats.children, targetDemog2, randomDemog);
  let childrenNonZeroPct2 = getNonZeroPct(childrenIndex2);
  let educationIndex2 = indexAttr("education", indexCats.education, targetDemog2, randomDemog);
  let incomeIndex2 = indexAttr("income", indexCats.income, targetDemog2, randomDemog);
  let incomeMedianCat2 = getMedianCategory(incomeIndex2);
  let stateIndex2 = indexAttr("state", indexCats.state, targetDemog2, randomDemog);
  let interestsIndex2 = indexInterestsRetail("interests", targetInterests2, randomInterests);
  let retailIndex2 = indexInterestsRetail("retail", targetRetail2, randomRetail);

  let audName3 = targetAud3.name;
  let ageIndex3 = indexAttr("age", indexCats.age, targetDemog3, randomDemog);
  let ageMedianCat3 = getMedianCategory(ageIndex3);
  let genderIndex3 = indexAttr("gender", indexCats.gender, targetDemog3, randomDemog);
  let ethnicityIndex3 = indexAttr("ethnicity", indexCats.ethnicity, targetDemog3, randomDemog);
  let maritalIndex3 = indexAttr("marital", indexCats.marital, targetDemog3, randomDemog);
  let childrenIndex3 = indexAttr("children", indexCats.children, targetDemog3, randomDemog);
  let childrenNonZeroPct3 = getNonZeroPct(childrenIndex3);
  let educationIndex3 = indexAttr("education", indexCats.education, targetDemog3, randomDemog);
  let incomeIndex3 = indexAttr("income", indexCats.income, targetDemog3, randomDemog);
  let incomeMedianCat3 = getMedianCategory(incomeIndex3);
  let stateIndex3 = indexAttr("state", indexCats.state, targetDemog3, randomDemog);
  let interestsIndex3 = indexInterestsRetail("interests", targetInterests3, randomInterests);
  let retailIndex3 = indexInterestsRetail("retail", targetRetail3, randomRetail);

  let stateIndexTop1 = indexStatesTop5(stateIndex1, stateIndex2, stateIndex3);
  let stateIndexTop2 = indexStatesTop5(stateIndex2,stateIndex1, stateIndex3);
  let stateIndexTop3 = indexStatesTop5(stateIndex3,stateIndex1, stateIndex2);
  let interestsIndexTop1 = indexInterestsRetailTop5(interestsIndex1,interestsIndex2,interestsIndex3);
  let interestsIndexTop2 = indexInterestsRetailTop5(interestsIndex2,interestsIndex1,interestsIndex3);
  let interestsIndexTop3 = indexInterestsRetailTop5(interestsIndex3,interestsIndex1,interestsIndex2);
  let retailIndexTop1 = indexInterestsRetailTop5(retailIndex1, retailIndex2, retailIndex3);
  let retailIndexTop2 = indexInterestsRetailTop5(retailIndex2, retailIndex1, retailIndex3);
  let retailIndexTop3 = indexInterestsRetailTop5(retailIndex3, retailIndex1, retailIndex2);

    let indexes1 = {
      age: ageIndex1,
      gender: genderIndex1,
      ethnicity: ethnicityIndex1,
      marital: maritalIndex1,
      children: childrenIndex1,
      education: educationIndex1,
      income: incomeIndex1,
      state: stateIndex1,
      interests: interestsIndexTop1[0],
      retail: retailIndexTop1[0]
    };
    let indexes2 = {
      age: ageIndex2,
      gender: genderIndex2,
      ethnicity: ethnicityIndex2,
      marital: maritalIndex2,
      children: childrenIndex2,
      education: educationIndex2,
      income: incomeIndex2,
      state: stateIndex2,
      interests: interestsIndexTop2[0],
      retail: retailIndexTop2[0]
    };
    let indexes3 = {
      age: ageIndex3,
      gender: genderIndex3,
      ethnicity: ethnicityIndex3,
      marital: maritalIndex3,
      children: childrenIndex3,
      education: educationIndex3,
      income: incomeIndex3,
      state: stateIndex3,
      interests: interestsIndexTop3[0],
      retail: retailIndexTop3[0]
    };

    wave3SeriesChart(indexes1, indexes2, indexes3);

    var myPlot = document.getElementById('waveChart');
    myPlot.on('plotly_click', function(data){
      let d = data.points[0].hovertext.split("<br>")[2].trim().split(" = ");
      d[0] = d[0][0].toLowerCase() + d[0].slice(1)
      let mapping = {
        "number of children": "children",
        "age": "age",
        "ethnicity": "ethnicity",
        "gender": "gender",
        "marital status": "marital",
        "education": "education",
        "income": "income",
        "location": "state",
        "interests": "interests",
        "retail": "retail"
      }
      document.getElementById(mapping[d[0]]+"Chart").parentNode.scrollIntoView();
      $("#"+mapping[d[0]]+"Chart").css("border", "1px solid gold")
      setTimeout(function() {$("#"+mapping[d[0]]+"Chart").css("border", "none")}, 3000);
    });

    bar3SeriesChart("age", ageIndex1, ageIndex2, ageIndex3);
    add3SeriesStat("age", ageMedianCat1, ageMedianCat2, ageMedianCat3, prefix = "Median: ", suffix = " years");
    bar3SeriesChart("ethnicity", ethnicityIndex1, ethnicityIndex2, ethnicityIndex3);
    bar3SeriesChart("children", childrenIndex1, childrenIndex2, childrenIndex3);
    add3SeriesStat("children", childrenNonZeroPct1, childrenNonZeroPct2, childrenNonZeroPct3, prefix = "Child Present: ", suffix = "%");
    bar3SeriesChart("education", educationIndex1, educationIndex2, educationIndex3);
    bar3SeriesChart("income", incomeIndex1, incomeIndex2, incomeIndex3);
    add3SeriesStat("income", incomeMedianCat1, incomeMedianCat2, incomeMedianCat3, prefix = "Median: ");
    hBar3ParallelChart("gender", genderIndex1, genderIndex2, genderIndex3);
    hBar3ParallelChart("marital", maritalIndex1, maritalIndex2, maritalIndex3);

    (DS_VIS_STORE["stateActive"][0] === 1) ? hBar3SeriesChart("state", stateIndexTop1, stateIndexTop2, stateIndexTop3) : hBar3SeriesChart("state", stateIndexTop2, stateIndexTop1, stateIndexTop3);
    (DS_VIS_STORE["interestsActive"][0] === 1) ? hBar3SeriesChart("interests", interestsIndexTop1, interestsIndexTop2, interestsIndexTop3) : hBar3SeriesChart("interests", interestsIndexTop2, interestsIndexTop1, interestsIndexTop3);
    (DS_VIS_STORE["retailActive"][0] === 1) ? hBar3SeriesChart("retail", retailIndexTop1, retailIndexTop2, retailIndexTop3) : hBar3SeriesChart("retail", retailIndexTop2, retailIndexTop1, retailIndexTop3);

    $( ".tile" ).removeClass("selected-tile");

    mikeJ3SeriesChart('interests', interestsIndex1, interestsIndex2, interestsIndex3);
    mikeJ3SeriesChart('retail', retailIndex1, retailIndex2, retailIndex3);
}


/*******************************************************************************
*** UPDATE ALL CHARTS **********************************************************
*******************************************************************************/

/* updates bar charts when a value element is clicked on a chart */
function update3ComparisonCharts(attrName, attrValue) {
    DS_VIS_STORE.activeFilter = [attrName, attrValue];

    let attrIndex = [];
    let indexCats = makeIndexCats();

    let indexes1 = {};
    let indexes2 = {};
    let indexes3 = {};

    let demogAttributesList = Object.keys(indexCats);
    let barChartAttributesList = ["age", "ethnicity", "children", "education", "income"]
    let sBarChartAttributesList = ["gender", "marital"]
    let hBarChartAttributesList = ["state", "interests", "retail"]

    demogAttributesList.forEach(function(demogAttributeListName) {
        if (attrName != demogAttributeListName) {
            /* reset opacity */
            d3.selectAll("#"+demogAttributeListName+"Chart svg rect").style("opacity", 1);

            if ( hBarChartAttributesList.includes(demogAttributeListName) & demogAttributeListName != "state") {
                let filteredData1 = [];
                let filteredIds1 = filterAttr(targetDemog, attrName, attrValue).map(function(d) { return d.temp_id; });

                let filteredData2 = [];
                let filteredIds2 = filterAttr(targetDemog2, attrName, attrValue).map(function(d) { return d.temp_id; });

                let filteredData3 = [];
                let filteredIds3 = filterAttr(targetDemog3, attrName, attrValue).map(function(d) { return d.temp_id; });

                if (demogAttributeListName == "interests") {
                  orderedTargetFilter(targetInterests, filteredIds1, filteredData1);
                  attrIndex1 = indexInterestsRetail(demogAttributeListName, filteredData1, randomInterests);

                  orderedTargetFilter(targetInterests2, filteredIds2, filteredData2);
                  attrIndex2 = indexInterestsRetail(demogAttributeListName, filteredData2, randomInterests);

                  orderedTargetFilter(targetInterests3, filteredIds3, filteredData3);
                  attrIndex3 = indexInterestsRetail(demogAttributeListName, filteredData3, randomInterests);
                } else if (demogAttributeListName == "retail"){
                  orderedTargetFilter(targetRetail, filteredIds1, filteredData1);
                  attrIndex1 = indexInterestsRetail(demogAttributeListName, filteredData1, randomRetail);

                  orderedTargetFilter(targetRetail2, filteredIds2, filteredData2);
                  attrIndex2 = indexInterestsRetail(demogAttributeListName, filteredData2, randomRetail);

                  orderedTargetFilter(targetRetail3, filteredIds3, filteredData3);
                  attrIndex3 = indexInterestsRetail(demogAttributeListName, filteredData3, randomRetail);
                }
                attrIndexTop1 = indexInterestsRetailTop5(attrIndex1,attrIndex2,attrIndex3);
                attrIndexTop2 = indexInterestsRetailTop5(attrIndex2,attrIndex1,attrIndex3);
                attrIndexTop3 = indexInterestsRetailTop5(attrIndex3,attrIndex1,attrIndex2);
            } else {
              let filteredData1 = filterAttr(targetDemog, attrName, attrValue);
              let filteredData2 = filterAttr(targetDemog2, attrName, attrValue);
              let filteredData3 = filterAttr(targetDemog3, attrName, attrValue);

              attrIndex1 = indexAttr(demogAttributeListName,
                                    indexCats[demogAttributeListName],
                                    filteredData1,
                                    randomDemog);
              attrIndex2 = indexAttr(demogAttributeListName,
                                    indexCats[demogAttributeListName],
                                    filteredData2,
                                    randomDemog);
              attrIndex3 = indexAttr(demogAttributeListName,
                                    indexCats[demogAttributeListName],
                                    filteredData3,
                                    randomDemog);
              if (demogAttributeListName == "state") {
                  attrIndexTop1 = indexStatesTop5(attrIndex1, attrIndex2, attrIndex3);
                  attrIndexTop2 = indexStatesTop5(attrIndex2, attrIndex1, attrIndex3);
                  attrIndexTop3 = indexStatesTop5(attrIndex3, attrIndex1, attrIndex2);
              }
            }
        } else {
            if ( hBarChartAttributesList.includes(demogAttributeListName) & demogAttributeListName != "state" ) {
                if (demogAttributeListName == "interests"){
                    attrIndex1 = indexInterestsRetail(demogAttributeListName, targetInterests, randomInterests);
                    attrIndex2 = indexInterestsRetail(demogAttributeListName, targetInterests2, randomInterests);
                    attrIndex3 = indexInterestsRetail(demogAttributeListName, targetInterests3, randomInterests);
                } else if (demogAttributeListName == "retail"){
                    attrIndex1 = indexInterestsRetail(demogAttributeListName, targetRetail, randomRetail);
                    attrIndex2 = indexInterestsRetail(demogAttributeListName, targetRetail2, randomRetail);
                    attrIndex3 = indexInterestsRetail(demogAttributeListName, targetRetail3, randomRetail);
                }
                attrIndexTop1 = indexInterestsRetailTop5(attrIndex1,attrIndex2,attrIndex3);
                attrIndexTop2 = indexInterestsRetailTop5(attrIndex2,attrIndex1,attrIndex3);
                attrIndexTop3 = indexInterestsRetailTop5(attrIndex3,attrIndex1,attrIndex2);
            } else {
                attrIndex1 = indexAttr(demogAttributeListName,
                                      indexCats[demogAttributeListName],
                                      targetDemog,
                                      randomDemog);

                attrIndex2 = indexAttr(demogAttributeListName,
                                      indexCats[demogAttributeListName],
                                      targetDemog2,
                                      randomDemog);

                attrIndex3 = indexAttr(demogAttributeListName,
                                      indexCats[demogAttributeListName],
                                      targetDemog3,
                                      randomDemog);

                if (demogAttributeListName == "state") {
                    attrIndexTop1 = indexStatesTop5(attrIndex1, attrIndex2, attrIndex3)[0];
                    attrIndexTop2 = indexStatesTop5(attrIndex2, attrIndex1, attrIndex3)[0];
                    attrIndexTop3 = indexStatesTop5(attrIndex3, attrIndex1, attrIndex2)[0];
                }
            }
        }

        // update the wave chart data
        if ( hBarChartAttributesList.includes(demogAttributeListName) ) {
          indexes1[demogAttributeListName] = attrIndexTop1[0];
          indexes2[demogAttributeListName] = attrIndexTop2[0];
          indexes3[demogAttributeListName] = attrIndexTop3[0];
        } else {
          indexes1[demogAttributeListName] = attrIndex1;
          indexes2[demogAttributeListName] = attrIndex2;
          indexes3[demogAttributeListName] = attrIndex3;
        }

        // update stats
        $( "#" + demogAttributeListName + "Chart" )
          .prev(".tile-header")
          .find(".ds-stats")
          .css("opacity", 0);
        if (attrName != demogAttributeListName) {
            if (demogAttributeListName == "age") {
                let ageMedianCat1 = getMedianCategory(attrIndex1);
                let ageMedianCat2 = getMedianCategory(attrIndex2);
                let ageMedianCat3 = getMedianCategory(attrIndex3);
                add3SeriesStat("age", ageMedianCat1, ageMedianCat2, ageMedianCat3, prefix = "Median: ", suffix = " years");
            } else if (demogAttributeListName == "children") {
                let childrenNonZeroPct1 = getNonZeroPct(attrIndex1);
                let childrenNonZeroPct2 = getNonZeroPct(attrIndex2);
                let childrenNonZeroPct3 = getNonZeroPct(attrIndex3);
                add3SeriesStat("children", childrenNonZeroPct1, childrenNonZeroPct2, childrenNonZeroPct3, prefix = "Child present: ", suffix = "%");
            } else if (demogAttributeListName == "income") {
                let incomeMedianCat1 = getMedianCategory(attrIndex1);
                let incomeMedianCat2 = getMedianCategory(attrIndex2);
                let incomeMedianCat3 = getMedianCategory(attrIndex3);
                add3SeriesStat("income", incomeMedianCat1, incomeMedianCat2, incomeMedianCat3, prefix = "Median: ");
            }
        }

        // update charts
        if ( barChartAttributesList.includes(demogAttributeListName) ) {
            // update bar chart
              let innerWidth = 400;
              if (demogAttributeListName == "income") {
              	  innerWidth = 610;
              }
              let heightOffset = 0;
              if (["age", "children", "income"].includes(demogAttributeListName) ) {
                heightOffset = 20;
              }
            	let basics = barChartSetup(innerWidth);
            	let margin = basics.margin,
                  width = basics.width,
                  height = basics.height - heightOffset,
              		barPadding = basics.barPadding * 2;

              let xScale = d3.scaleLinear()
                             .domain([0, attrIndex1.length])
                             .range([0, width]);

              let yScale = d3.scaleLinear()
                             .domain([0, Math.max(
                                  d3.max(attrIndex1, function(d) { return d.target_pct; }),
                                  d3.max(attrIndex2, function(d) { return d.target_pct; }),
                                  d3.max(attrIndex3, function(d) { return d.target_pct; })
                                )
                             ])
                             .range([height,0]);

              let svg = d3.select("#"+demogAttributeListName+"Chart svg");

              let plot = d3.select("#"+demogAttributeListName+"ChartPlot");

              /* Transition grid lines */
              let t = d3.transition()
                   .duration(500)

              function make_y_gridlines() {
                 return d3.axisLeft(yScale)
                     .ticks(5)
              }

              svg.select(".ds-grid")
                 .transition(t)
                 .attr("transform", "translate(" + (margin.left - 1) + "," + (margin.top - 1) + ")")
                 .call(make_y_gridlines()
                     .tickSize(-width)
                     .tickFormat("")
                 )

              let axis = d3.axisLeft(yScale)
                 .ticks(5)
                 .tickFormat(function (d) { return d + "%" })
                 .tickSize(0);


              svg.select(".axis")
                   .transition(t)
                   .call(axis)

              svg.selectAll(".domain").remove()

              /* Select existing bars and update them */
              /* 1st series */
              plot.selectAll("rect.series1")
                  .data(attrIndex1)
                  .transition()
                  .duration(750)
                  .attr("x", function(d, i) {
                    return xScale(i);
                  })
                  .attr("width", width / (attrIndex1.length * 3) - barPadding)
                  .attr("y", function(d) {
                    return yScale(d.target_pct);
                  })
                  .attr("height", function(d) {
                    return height - yScale(d.target_pct);
                  })
                  .attr("cursor", "pointer")
                  .attr("attrib-value", function(d) { return d.attrib_value; })    /* updating the Acxiom attrib value on the element */
                  .attr("target-pct", function(d) { return d.target_pct; })
                  .attr("index", function(d) { return d.index; })
                  .attr("fill", colorSeries1);

              plot.selectAll("rect.series2")
                  .data(attrIndex2)
                  .transition()
                  .duration(750)
                  .attr("x", function(d, i) {
                       return xScale(i) + width / (attrIndex1.length * 3) - barPadding;
            			})
                  .attr("width", width / (attrIndex2.length * 3) - barPadding)
                  .attr("y", function(d) {
                    return yScale(d.target_pct);
                  })
                  .attr("height", function(d) {
                    return height-yScale(d.target_pct);
                  })
                  .attr("cursor", "pointer")
                  .attr("attrib-value", function(d) { return d.attrib_value; })    /* updating the Acxiom attrib value on the element */
                  .attr("target-pct", function(d) { return d.target_pct; })
                  .attr("index", function(d) { return d.index; })
                  .attr("fill", colorSeries2);

              plot.selectAll("rect.series3")
                  .data(attrIndex3)
                  .transition()
                  .duration(750)
                  .attr("x", function(d, i) {
                       return xScale(i) + width / (attrIndex3.length * 1.5) - barPadding * 2;
            			})
                  .attr("width", width / (attrIndex3.length * 3) - barPadding)
                  .attr("y", function(d) {
                    return yScale(d.target_pct);
                  })
                  .attr("height", function(d) {
                    return height-yScale(d.target_pct);
                  })
                  .attr("cursor", "pointer")
                  .attr("attrib-value", function(d) { return d.attrib_value; })    /* updating the Acxiom attrib value on the element */
                  .attr("target-pct", function(d) { return d.target_pct; })
                  .attr("index", function(d) { return d.index; })
                  .attr("fill", colorSeries3);

              /* Update the text labels on bars */
              function textInside(d) { return (height - yScale(d.target_pct)) > 20 }; // Display text inside if bar is big enough
              /* 1st series */
              plot.selectAll("text.series1")
                  .data(attrIndex1)
                  .transition()
                  .duration(750)
                  .attr("text-anchor", "middle")
                  .attr("x", function(d, i) {
                     return ( i * (width / attrIndex1.length) )
                       + ( (width / (attrIndex1.length * 3) - barPadding) / 2 );
            	    })
                  .attr("y", function(d) {
                     return textInside(d) ? yScale(d.target_pct) + 14 : yScale(d.target_pct) - 7;
                  })
                  .text(function(d) {
                   return formatAsInteger(d3.format("d")(d.index));
                  })
                  .attr("fill", function(d) { return textInside(d) ? "white" : "#505050" })
                  .attr("class", "yAxis")
                  .attr("class", "series1")
                  ;

              plot.selectAll("text.series2")
                  .data(attrIndex2)
                  .transition()
                  .duration(750)
                  .attr("text-anchor", "middle")
                  .attr("x", function(d, i) {
                         return ( i * (width / attrIndex1.length) )
                           + ( (width / (attrIndex1.length * 3) - barPadding) ) * 1.5 ;
                  })
                  .attr("y", function(d) {
                     return textInside(d) ? yScale(d.target_pct) + 14 : yScale(d.target_pct) - 7;
                  })
                  .text(function(d) {
                   return formatAsInteger(d3.format("d")(d.index));
                  })
                  .attr("fill", function(d) { return textInside(d) ? "white" : "#505050" })
                  .attr("class", "yAxis")
                  .attr("class", "series2");

              plot.selectAll("text.series3")
                  .data(attrIndex3)
                  .transition()
                  .duration(750)
                  .attr("text-anchor", "middle")
                  .attr("x", function(d, i) {
                         return ( i * (width / attrIndex1.length) )
                           + ( (width / (attrIndex1.length * 3) - barPadding) ) * 2.5 ;
                  })
                  .attr("y", function(d) {
                     return textInside(d) ? yScale(d.target_pct) + 14 : yScale(d.target_pct) - 7;
                  })
                  .text(function(d) {
                   return formatAsInteger(d3.format("d")(d.index));
                  })
                  .attr("fill", function(d) { return textInside(d) ? "white" : "#505050" })
                  .attr("class", "yAxis")
                  .attr("class", "series3");
        } else if ( sBarChartAttributesList.includes(demogAttributeListName) ) {
            d3.select("#"+demogAttributeListName+"Chart svg").remove();

            hBar3ParallelChart(demogAttributeListName,attrIndex1,attrIndex2,attrIndex3);

        } else if ( hBarChartAttributesList.includes(demogAttributeListName) ) {
            d3.select("#"+demogAttributeListName+"Chart svg").remove();
            target = DS_VIS_STORE[demogAttributeListName+"Active"][0] === 1 ? attrIndexTop1 :
                DS_VIS_STORE[demogAttributeListName+"Active"][0] === 2 ? attrIndexTop2 : attrIndexTop3;
            compare = DS_VIS_STORE[demogAttributeListName+"Active"][1] === 1 ? attrIndexTop1 :
                DS_VIS_STORE[demogAttributeListName+"Active"][1] === 2 ? attrIndexTop2 : attrIndexTop3;
            compare2 = DS_VIS_STORE[demogAttributeListName+"Active"][2] === 1 ? attrIndexTop1 :
                DS_VIS_STORE[demogAttributeListName+"Active"][2] === 2 ? attrIndexTop2 : attrIndexTop3;

            hBar3SeriesChart(demogAttributeListName,target,compare,compare2);

        }
    });

    // update the wave chart
    wave3SeriesChart(indexes1, indexes2, indexes3);

    var myPlot = document.getElementById('waveChart');
    myPlot.on('plotly_click', function(data){
      let d = data.points[0].hovertext.split("<br>")[2].trim().split(" = ");
      d[0] = d[0][0].toLowerCase() + d[0].slice(1)
      let mapping = {
        "number of children": "children",
        "age": "age",
        "ethnicity": "ethnicity",
        "gender": "gender",
        "marital status": "marital",
        "education": "education",
        "income": "income",
        "location": "state",
        "interests": "interests",
        "retail": "retail"
      }
      document.getElementById(mapping[d[0]]+"Chart").parentNode.scrollIntoView();
      $("#"+mapping[d[0]]+"Chart").css("border", "1px solid gold")
      setTimeout(function() {$("#"+mapping[d[0]]+"Chart").css("border", "none")}, 3000);
    });

    /* Make the elems in selected chart opaque, except for the clicked chart elem */
    d3.selectAll("#" + attrName + "Chart svg rect")
      .style("opacity", 0.25)
      .attr("selected", "no")
      ;
    d3.selectAll("#" + attrName + "Chart svg [attrib-value='" + attrValue + "']")
      .style("opacity", 1)
      .attr("selected", "yes")
      ;

    /* Highlight the selected tile */
    $( ".tile" ).removeClass("selected-tile");
    $( "#" + attrName + "Chart" ).parent().addClass("selected-tile");
}
