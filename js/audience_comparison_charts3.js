/*******************************************************************************
*** ADD 2-SERIES STATS *********************************************************
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
    .append("<div class='ds-stats'><div class='ds-stat-1'>"
            + prefix + stat1 + suffix
            + "</div><div class='ds-stat-2'>"
            + stat2 + suffix
            + "</div><div class='ds-stat-3'>"
            + stat3 + suffix
            + "</div></div>");

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
    if (["age", "children", "income"].includes(attrName)) {
      heightOffset = 20;
    }

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
           drawComparisonCharts();
           showActiveFilter(DS_VIS_STORE);
         } else {
           updateComparisonCharts(attrName, d.attrib_value);
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
    let topPos = height / 4;

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
        .attr("stroke", "white")
        .on("click", up);

    plot.selectAll("rect.series2")
        .data(indexDs2)
        .enter()
        .append("rect")
        .attr("class", "series2")
        .attr("x", function(d, i) { return i ? xScale(100 - d.target_pct) : 0})
        .attr("width", function(d) { return xScale(d.target_pct)})
        .attr("y", topPos + 30 + barHeight)
        .attr("height", function(d) { return barHeight ; })
        .attr("fill", colorSeries2)
        .attr("cursor", "pointer")
        .attr("attrib-value", function(d) { return d.attrib_value; })    /* storing the Acxiom attrib value on the element */
        .on("mouseover", mouseover)
        .on("mouseout", mouseup)
        .on("mousemove", mouseover)
        .attr("target-pct", function(d) { return d.target_pct; })
        .attr("index", function(d) { return d.index; })
        .attr("stroke", "white")
        .on("click", up);

    plot.selectAll("rect.series3")
        .data(indexDs3)
        .enter()
        .append("rect")
        .attr("class", "series3")
        .attr("x", function(d, i) { return i ? xScale(100 - d.target_pct) : 0})
        .attr("width", function(d) { return xScale(d.target_pct)})
        .attr("y", topPos + 60 + barHeight*2)
        .attr("height", function(d) { return barHeight ; })
        .attr("fill", colorSeries3)
        .attr("cursor", "pointer")
        .attr("attrib-value", function(d) { return d.attrib_value; })    /* storing the Acxiom attrib value on the element */
        .on("mouseover", mouseover)
        .on("mouseout", mouseup)
        .on("mousemove", mouseover)
        .attr("target-pct", function(d) { return d.target_pct; })
        .attr("index", function(d) { return d.index; })
        .attr("stroke", "white")
        .on("click", up);

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
        .attr("y", function(d) { return topPos + 33 + barHeight + (barHeight/2)})
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
        .attr("y", function(d) { return topPos + 63 + barHeight*2 + (barHeight/2)})
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
        .attr("y", function(d) { return topPos - 30 + (barHeight/2)})
        .attr("class", "yAxis")
        .attr("font-family", "sans-serif")
        .attr("font-size", "24px")
        .attr("fill", "#505050")
        .on("mouseover", mouseover)
        .on("mouseout", mouseup)
        .on("mousemove", mouseover);

    /* Add x-axis */
    let xAxis = d3.axisBottom(xScale)
        //.ticks(3)
        .tickSize(5)
        .tickValues(d3.range(0, 101, 25))
        .tickFormat(function (d) { return d + "%" });

    let xAxisElement = svg.append("g")
        .attr("class", "xAxis")
        .attr("transform", "translate(" + (margin.left) + "," + (margin.top + height - 1) + ")")
        .call(xAxis);



    function up(d, i) {

      tooltip.style('opacity', 0);

       /* update all charts when user selects a single bar in this chart */
       /* if clicking on already selected item, then reset the charts */
       isSelected = d3.select(".selected-tile #"+attrName+"Chart rect[attrib-value='"+d.attrib_value+"'][selected='yes']")._groups[0][0];
       if (isSelected){
         DS_VIS_STORE["activeFilter"] = null;
         drawComparisonCharts();
         showActiveFilter(DS_VIS_STORE);
       } else {
         updateComparisonCharts(attrName, d.attrib_value);
         showActiveFilter(DS_VIS_STORE);
       }
    }

    function mouseover(d) {
      // let ttipsvg = d3.select("#"+attrName+"Chart").node()
      // let bound = ttipsvg.getBoundingClientRect();
      let tipX = d3.mouse(this)[0] + 70;//d3.event.clientX - bound.x + 30;
      let tipY = d3.mouse(this)[1] + 20;//d3.event.clientY - bound.y - 20;
      if (width - tipX < 50) {
          tipX = d3.mouse(this)[0] - 60;//d3.event.clientX - bound.x - 100;
      }
      // let e = window.event;
      // var x = e.clientX,
      //     y = e.clientY;
      //
      // let tipY = (y - 40) + 'px';
      // let tipX = (x) + 'px';

      tooltip.transition()
          .duration(200)
      tooltip.html(d.attrib_value + "<br/>" + "Target Pct: " + d.target_pct + "%<br/>"  + "Index: " + d.index)
          .style("opacity", .9)
          .style('left', `${(tipX)}px`)
          .style('top', `${(tipY)}px`);
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
  			     return (i * 3 * (barHeight + barPadding) + barHeight / 2 + barPadding);
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
             return (i * 3 * (barHeight + barPadding) + barHeight * 1.5 + barPadding);
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
             return (i * 3 * (barHeight + barPadding) + barHeight + barHeight * 1.5 + barPadding);
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
                return (i * 3 * (barHeight + barPadding) + barHeight * 1.5 + barPadding);
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

  console.log('ageIndex3' + JSON.stringify(ageIndex3))

  let stateIndexTop1 = indexStatesTop5(stateIndex1, stateIndex2, stateIndex3);
  let stateIndexTop2 = indexStatesTop5(stateIndex2,stateIndex1, stateIndex3);
  let stateIndexTop3 = indexStatesTop5(stateIndex3,stateIndex1, stateIndex2);
  let interestsIndexTop1 = indexInterestsRetailTop5(interestsIndex1,interestsIndex2);
  let interestsIndexTop2 = indexInterestsRetailTop5(interestsIndex2,interestsIndex1);
  let retailIndexTop1 = indexInterestsRetailTop5(retailIndex1, retailIndex2);
  let retailIndexTop2 = indexInterestsRetailTop5(retailIndex2, retailIndex1);

    let indexes1 = {
      age: ageIndex1,
      gender: genderIndex1,
      ethnicity: ethnicityIndex1,
      marital: maritalIndex1,
      children: childrenIndex1,
      education: educationIndex1,
      income: incomeIndex1,
      state: stateIndex1
      // interests: interestsIndexTop1[0],
      // retail: retailIndexTop1[0]
    };
    let indexes2 = {
      age: ageIndex2,
      gender: genderIndex2,
      ethnicity: ethnicityIndex2,
      marital: maritalIndex2,
      children: childrenIndex2,
      education: educationIndex2,
      income: incomeIndex2,
      state: stateIndex2
      // interests: interestsIndexTop2[0],
      // retail: retailIndexTop2[0]
    };
    let indexes3 = {
      age: ageIndex3,
      gender: genderIndex3,
      ethnicity: ethnicityIndex3,
      marital: maritalIndex3,
      children: childrenIndex3,
      education: educationIndex3,
      income: incomeIndex3,
      state: stateIndex3
      // interests: interestsIndexTop3[0],
      // retail: retailIndexTop3[0]
    };

    // wave3SeriesChart(indexes1, indexes2, indexes3);

    // var myPlot = document.getElementById('waveChart');
    // myPlot.on('plotly_click', function(data){
    //   let d = data.points[0].hovertext.split("<br>")[2].trim().split(" = ");
    //   d[0] = d[0][0].toLowerCase() + d[0].slice(1)
    //   let mapping = {
    //     "number of children": "children",
    //     "age": "age",
    //     "ethnicity": "ethnicity",
    //     "gender": "gender",
    //     "marital status": "marital",
    //     "education": "education",
    //     "income": "income",
    //     "location": "state",
    //     "interests": "interests",
    //     "retail": "retail"
    //   }
    //
    //
    //   document.getElementById(mapping[d[0]]+"Chart").parentNode.scrollIntoView();
    //   $("#"+mapping[d[0]]+"Chart").css("border", "1px solid gold")
    //   setTimeout(function() {$("#"+mapping[d[0]]+"Chart").css("border", "none")}, 3000);
    // });

    bar3SeriesChart("age", ageIndex1, ageIndex2, ageIndex3);
    add3SeriesStat("age", ageMedianCat1, ageMedianCat2, ageMedianCat3, prefix = "<span style='color: #000;'><strong>Median: </strong></span>", suffix = " years");
    bar3SeriesChart("ethnicity", ethnicityIndex1, ethnicityIndex2, ethnicityIndex3);
    bar3SeriesChart("children", childrenIndex1, childrenIndex2, childrenIndex3);
    add3SeriesStat("children", childrenNonZeroPct1, childrenNonZeroPct2, childrenNonZeroPct3, prefix = "<span style='color: #000;'><strong>Child present: </strong></span>", suffix = "%");
    bar3SeriesChart("education", educationIndex1, educationIndex2, educationIndex3);
    bar3SeriesChart("income", incomeIndex1, incomeIndex2, incomeIndex3);
    add3SeriesStat("income", incomeMedianCat1, incomeMedianCat2, incomeMedianCat3, prefix = "<span style='color: #000;'><strong>Median: </strong></span>");
    hBar3ParallelChart("gender", genderIndex1, genderIndex2, genderIndex3);
    hBar3ParallelChart("marital", maritalIndex1, maritalIndex2, maritalIndex3);

    (DS_VIS_STORE["stateActive"][0] === 1) ? hBar3SeriesChart("state", stateIndexTop1, stateIndexTop2, stateIndexTop3) : hBar3SeriesChart("state", stateIndexTop2, stateIndexTop1, stateIndexTop3);
    // (DS_VIS_STORE["interestsActive"][0] === 1) ? hBar2SeriesChart("interests", interestsIndexTop1, interestsIndexTop2) : hBar2SeriesChart("interests", interestsIndexTop2, interestsIndexTop1);
    // (DS_VIS_STORE["retailActive"][0] === 1) ? hBar2SeriesChart("retail", retailIndexTop1, retailIndexTop2) : hBar2SeriesChart("retail", retailIndexTop2, retailIndexTop1);

    $( ".tile" ).removeClass("selected-tile");

    // mikeJ2SeriesChart('interests', interestsIndex1, interestsIndex2);
    // mikeJ2SeriesChart('retail', retailIndex1, retailIndex2);
}
