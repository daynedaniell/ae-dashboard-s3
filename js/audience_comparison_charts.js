/*******************************************************************************
*** COLORS AND FORMATS *********************************************************
*******************************************************************************/
let colorSeries1 = "#4d3c96",
    colorSeries2 = "#0fbbc1",
    colorSeries3 = "#ff9999",

    colorAudience11 = colorSeries1,
    colorAudience12 = colorSeries2,

    colorAudience21 = colorSeries1,
    colorAudience22 = colorSeries2;

function resetCompareAuds() {
    DS_VIS_STORE.stateColors = [colorSeries1,colorSeries2,colorSeries3]; //Set colors to be indexable to active audience in toggle
    DS_VIS_STORE.interestsColors = [colorSeries1,colorSeries2,colorSeries3]
    DS_VIS_STORE.retailColors = [colorSeries1,colorSeries2,colorSeries3]
    DS_VIS_STORE.interestsActive = [1,2,3]
    DS_VIS_STORE.stateActive = [1,2,3]
    DS_VIS_STORE.retailActive = [1,2,3]
}



/*******************************************************************************
*** Main Toggle Function *******************************************************
*******************************************************************************/
function toggleFromStore(store, key) {
    /* Takes in the store and a key and switches position of elements in an array */
    tmp1 = store[key][0]
    tmp2 = store[key][1]
    store[key][0] = tmp2
    store[key][1] = tmp1
}


/*******************************************************************************
*** 2-SERIES BAR CHART *********************************************************
*******************************************************************************/


function drawBarChart(attrName, indexDs1, indexDs2 = null, indexDs3 = null) {
  let numSeries = DS_VIS_STORE.activeView;

  let innerWidth = 400;
  if (attrName == "income") {
  	  innerWidth = 610;
  }

	let basics = barChartSetup(innerWidth);
	let margin = basics.margin,
      width = basics.width,
      height = basics.height,
  		barPadding = basics.barPadding * 2;

	let xScale = d3.scaleLinear()
                 .domain([0, indexDs1.length])
					       .range([0, width]);

  let max1 = d3.max(indexDs1, function(d) { return d.target_pct; });
  let max2 = indexDs2 != null ? d3.max(indexDs2, function(d) { return d.target_pct; }) : 0;
  let max3 = indexDs3 != null ? d3.max(indexDs3, function(d) { return d.target_pct; }) : 0;

	let yScale = d3.scaleLinear()
		             .domain([0, Math.max(max1,max2,max3)])
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

  function addBar(data,series,color) {
    plot.selectAll("rect."+series)
        .data(data)
          .enter()
          .append("rect")
        .attr("class", series)
          .attr("x", function(d, i) {
              if (series == "series1") {
                return xScale(i);
              } else if (series == "series2") {
                return xScale(i) + width / (data.length * numSeries) - barPadding;
              } else if (series == "series3") {
                return xScale(i) + width / (data.length * 1.5) - barPadding * 2;
              }

          })
          .attr("width", width / (data.length * numSeries) - barPadding)
          .attr("y", function(d) {
               return yScale(d.target_pct);
          })
          .attr("height", function(d) {
              return height-yScale(d.target_pct);
          })
          .attr("fill", numSeries > 1 ? color : function(d) { return colorByIndexBar(d.index) })
        .attr("cursor", "pointer")
        .attr("attrib-value", function(d) { return d.attrib_value; })    /* storing the Acxiom attrib value on the element */
        .on("mouseover", mouseover)
        .on("mouseout", mouseup)
        .on("mousemove", mouseover)
        .attr("target-pct", function(d) { return d.target_pct; })
        .attr("index", function(d) { return d.index; })
        .on("click", up);
  }


  /* Attach index data and add the chart elems */
  /* 1st series */
    // plot.selectAll("rect.series1")
    //     .data(indexDs1)
    //       .enter()
    //       .append("rect")
    //     .attr("class", "series1")
    //     	.attr("x", function(d, i) {
    //     	     return xScale(i);
    //     	})
    //       .attr("width", width / (indexDs1.length * 2) - barPadding)
    //     	.attr("y", function(d) {
    //     	     return yScale(d.target_pct);
    //     	})
    //     	.attr("height", function(d) {
    //     	    return height-yScale(d.target_pct);
    //     	})
    //     	.attr("fill", colorSeries1)
    //     .attr("cursor", "pointer")
    //     .attr("attrib-value", function(d) { return d.attrib_value; })    /* storing the Acxiom attrib value on the element */
    //     .on("mouseover", mouseover)
    //     .on("mouseout", mouseup)
    //     .on("mousemove", mouseover)
    //     .attr("target-pct", function(d) { return d.target_pct; })
    //     .attr("index", function(d) { return d.index; })
    //     .on("click", up);

    addBar(indexDs1,"series1",colorSeries1);
    if (numSeries > 1) {
        addBar(indexDs2,"series2",colorSeries2);
    }
    if (numSeries > 2) {
      addBar(indexDs3,"series3",colorSeries3);
    }

  /* 2nd series */
    // plot.selectAll("rect.series2")
    //   .data(indexDs2)
		//   .enter()
		//   .append("rect")
    //   .attr("class", "series2")
		// 	.attr("x", function(d, i) {
		// 	     return xScale(i) + width / (indexDs1.length * 2) - barPadding;
		// 	})
		//   .attr("width", width / (indexDs1.length * 2) - barPadding)
		// 	.attr("y", function(d) {
		// 	     return yScale(d.target_pct);
		// 	})
		// 	.attr("height", function(d) {
		// 	    return height-yScale(d.target_pct);
		// 	})
		// 	.attr("fill", colorSeries2)
    //   .attr("cursor", "pointer")
    //   .attr("attrib-value", function(d) { return d.attrib_value; })    /* storing the Acxiom attrib value on the element */
    //   .on("mouseover", mouseover)
    //   .on("mouseout", mouseup)
    //   .on("mousemove", mouseover)
    //   .attr("target-pct", function(d) { return d.target_pct; })
    //   .attr("index", function(d) { return d.index; })
    //   .on("click", up);

	/* Add y labels to plot */


  function addBarText(data, series) {

      let fontSize = "12px";
      if (numSeries == 3) {
          fontSize = "9px";
      }

      plot.selectAll("text."+series)
    	    .data(data)
    	    .enter()
    	    .append("text")
          .attr("class", series)
          .text(function(d) {
           return formatAsInteger(d3.format("d")(d.index));
          })
    	    .attr("text-anchor", "middle")
    	    /* Set x position to the left edge of each bar plus half the bar width */
    	    .attr("x", function(d, i) {
              if (series == "series1") {
                  return ( i * (width / indexDs1.length) )
                    + ( (width / (indexDs1.length * numSeries) - barPadding) / 2 );
              } else if (series == "series2") {
                  return ( i * (width / indexDs1.length) )
                           + ( (width / (indexDs1.length * numSeries) - barPadding) ) * 1.5 ;
              } else if (series == "series3") {
                  return ( i * (width / indexDs1.length) )
                      + ( (width / (indexDs1.length * 3) - barPadding) ) * 2.5 ;
              }

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
  }

  addBarText(indexDs1,"series1");
  if (numSeries > 1) {
      addBarText(indexDs2,"series2");
  }
  if (numSeries > 2) {
      addBarText(indexDs3,"series3");
  }
  /* 1st series */
	// plot.selectAll("text.series1")
	//     .data(indexDs1)
	//     .enter()
	//     .append("text")
  //     .attr("class", "series1")
  //     .text(function(d) {
  //      return formatAsInteger(d3.format("d")(d.index));
  //     })
	//     .attr("text-anchor", "middle")
	//     /* Set x position to the left edge of each bar plus half the bar width */
	//     .attr("x", function(d, i) {
	// 		     return ( i * (width / indexDs1.length) )
  //            + ( (width / (indexDs1.length * 2) - barPadding) / 2 );
	//     })
	//     .attr("y", function(d) {
	// 		     return textInside(d) ? yScale(d.target_pct) + 14 : yScale(d.target_pct) - 7;
	//     })
	//   //  .attr("class", "yAxis")
	//     .attr("font-family", "sans-serif")
	//     .attr("font-size", fontSize)
	//     .attr("fill", function(d) { return textInside(d) ? "white" : "#505050" })
  //     .on("mouseover", mouseover)
  //     .on("mouseout", mouseup)
  //     .on("mousemove", mouseover);

  /* 2nd series */
  // plot.selectAll("text.series2")
  //     .data(indexDs2)
  //     .enter()
  //     .append("text")
  //     .attr("class", "series2")
  //     .text(function(d) {
  //      return formatAsInteger(d3.format("d")(d.index));
  //     })
  //     .attr("text-anchor", "middle")
  //     /* Set x position to the left edge of each bar plus half the bar width */
  //     .attr("x", function(d, i) {
  //          return ( i * (width / indexDs1.length) )
  //            + ( (width / (indexDs1.length * 2) - barPadding) ) * 1.5 ;
  //     })
  //     .attr("y", function(d) {
  //          return textInside(d) ? yScale(d.target_pct) + 14 : yScale(d.target_pct) - 7;
	//     })
  //     .attr("font-family", "sans-serif")
  //     .attr("font-size", fontSize)
  //     .attr("fill", function(d) { return textInside(d) ? "white" : "#505050" })
  //     .on("mouseover", mouseover)
  //     .on("mouseout", mouseup)
  //     .on("mousemove", mouseover);

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
       if (numSeries == 1) {
          drawCharts();
       } else if (numSeries == 2) {
          drawComparisonCharts();
       } else if (numSeries == 3) {
          drawComparisonCharts3();
       }
       showActiveFilter(DS_VIS_STORE);
     } else {
       if (numSeries == 1) {
          updateCharts(attrName, d.attrib_value);
       } else if (numSeries == 2) {
          updateComparisonCharts(attrName, d.attrib_value, numSeries);
       } else if (numSeries == 3) {
          update3ComparisonCharts(attrName, d.attrib_value, numSeries);
       }
       showActiveFilter(DS_VIS_STORE);
     }
	}


  function mouseover(d) {
    // Add tooltip based on position of the mouse
    let e = window.event;
    var x = e.clientX,
        y = e.clientY;

    let tipY = (y - 40) + 'px';
    let tipX = (x) + 'px';

    // Move tooltip to the left of the cursor if it gets too close to right edge
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
    // Hide tooltip when the mouse leaves the element
    tooltip.style('opacity', 0);
  }

}


/*******************************************************************************
*** 2-SERIES Parallel CHART ****************************************************
*******************************************************************************/
function hBarParallelChart(attrName, audName1, indexDs1, audName2, indexDs2) {

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
                    .range([0, height/2]);

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

    let barHeight = 60;
    let paddingBottom = 60;
    let barSpacing = 40;
    let topPos = height - ((barHeight + barSpacing) * 2 + paddingBottom);
    let lineStroke = 'steelblue';
    let lineExtend = 12;
    let lineStrokeWidth = 8;

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
        /* Set x position to be inside corresponding edge of the bar */
        .attr("x",  function(d, i) { return i ? xScale(100 ) - 20 : 14})
        .attr("y", function(d) { return topPos + 3 + (barHeight/2)})
        .attr("class", "yAxis")
        .attr("font-family", "sans-serif")
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
        /* Set x position to be inside corresponding edge of the bar */
        .attr("x",  function(d, i) { return i ? xScale(100 ) - 20 : 14})
        .attr("y", function(d) { return topPos + barSpacing + 3 + barHeight + (barHeight/2)})
        .attr("class", "yAxis")
        .attr("font-family", "sans-serif")
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
        .attr("x",  function(d, i) { return i ? xScale(100 ) : 0})
        .attr("y", function(d) { return topPos - 30 })
        .attr("class", "yAxis")
        .attr("font-family", "sans-serif")
        .attr("font-size", "22px")
        .attr("fill", "#505050")
        .on("mouseover", mouseover)
        .on("mouseout", mouseup)
        .on("mousemove", mouseover);

    /* Draw in the indicator line marking the appropriate position on the bars */

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

    /* Add x-axis */
    let xAxis = d3.axisBottom(xScale)
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
         drawComparisonCharts();
         showActiveFilter(DS_VIS_STORE);
       } else {
         updateComparisonCharts(attrName, d.attrib_value);
         showActiveFilter(DS_VIS_STORE);
       }
    }

    function mouseover(d) {
        // Add tooltip based on position of the mouse
        let e = window.event;
        var x = e.clientX,
            y = e.clientY;

        let tipY = (y - 60) + 'px';
        let tipX = (x) + 'px';

        // Move tooltip to the left of the cursor if it gets too close to right edge
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
        // Hide tooltip when the mouse leaves the element
        tooltip.style('opacity', 0);
    }
}

/*******************************************************************************
*** 2-SERIES STACKED BAR CHART *************************************************
*******************************************************************************/
function stackedBar2SeriesChart(attrName, audName1, indexDs1, audName2, indexDs2) {
  let indexCat1 = [indexDs1[0], indexDs2[0].attrib_value == indexDs1[0].attrib_value ? indexDs2[0] : indexDs2[1]]
  let indexCat2 = [indexDs1[1], indexDs2[1].attrib_value == indexDs1[1].attrib_value ? indexDs2[1] : indexDs2[0]]
  combo1 = +indexCat1[0].target_pct + +indexCat1[1].target_pct
  combo2 = +indexCat2[0].target_pct + +indexCat2[1].target_pct

  let innerWidth = 360;

  let basics = barChartSetup(innerWidth);
  let margin = basics.margin,
      width = basics.width,
      height = basics.height,
      barPadding = basics.barPadding * 100;

  let xScale = d3.scaleLinear()
                 .domain([0, 2])
                 .range([0, width]);

  let yScale = d3.scaleLinear()
                 .domain([0, Math.max((indexDs1[0].target_pct + indexDs2[0].target_pct), (indexDs1[1].target_pct + indexDs2[1].target_pct))])
                 .range([height, 0]);

  y1 = yScale(combo2) - yScale(combo1) < 0 ? yScale(combo2) - yScale(combo1) : 0;
  y2 = yScale(combo2) - yScale(combo1) > 0 ? yScale(combo2) - yScale(combo1) : 0;


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

  svg.append("g")
      .attr("class", "ds-grid")
      .attr("transform", "translate(" + (margin.left - 1) + "," + (margin.top - 1) + ")")

  let plot = svg.append("g")
                .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  /* Attach index data and add the chart elems */
  /* 1st series */
  plot.selectAll("rect.series1")
      .data(indexCat1)
      .enter()
      .append("rect")
      .attr("class", "series1")
      .attr("x", xScale(0) + (width / indexDs1.length - barPadding)/2 )
      .attr("width", width / indexDs1.length - barPadding)
      .attr("y", function(d, i) { return i ? y1 : yScale(d.target_pct); })
      .attr("height", function(d) { return height-yScale(d.target_pct); })
      .attr("fill", function(d, i) {
          return i ? colorAudience12 : colorAudience11;
      })
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
      .data(indexCat2)
      .enter()
      .append("rect")
      .attr("class", "series2")
      .attr("x", xScale(1) + (width / indexDs1.length - barPadding)/2 )
      .attr("width", width / indexDs1.length - barPadding)
      .attr("y", function(d, i) { return i ? y2 : yScale(d.target_pct); })
      .attr("height", function(d) { return height-yScale(d.target_pct); })
      .attr("fill", function(d, i) {
          return i ? colorAudience12 : colorAudience11;
      })
      .attr("cursor", "pointer")
      .attr("attrib-value", function(d) { return d.attrib_value; })    /* storing the Acxiom attrib value on the element */
      .on("mouseover", mouseover)
      .on("mouseout", mouseup)
      .on("mousemove", mouseover)
      .attr("target-pct", function(d) { return d.target_pct; })
      .attr("index", function(d) { return d.index; })
      .on("click", up);


  /* Add y labels to plot */
  /* 1st series */
  plot.selectAll("text.series1")
      .data(indexCat1)
      .enter()
      .append("text")
      .attr("class", "series1")
      .text(function(d) {
           return formatAsInteger(d3.format("d")(d.index));
      })
      .attr("text-anchor", "middle")
      /* Set x position to the left edge of each bar plus half the bar width */
      .attr("x",  xScale(0) + (width / indexDs1.length - barPadding)/2
                            + ((width / 2 - barPadding) / 2) )
      .attr("y", function(d, i) {
           return i ? y1 + 14 : yScale(d.target_pct) + 14;
      })
      .attr("class", "yAxis")
      .attr("font-family", "sans-serif")
      .attr("fill", "white")
      .on("mouseover", mouseover)
      .on("mouseout", mouseup)
      .on("mousemove", mouseover);

  /* 2nd series */
  plot.selectAll("text.series2")
      .data(indexCat2)
      .enter()
      .append("text")
      .attr("class", "series2")
      .text(function(d) {
           return formatAsInteger(d3.format("d")(d.index));
      })
      .attr("text-anchor", "middle")
      /* Set x position to the left edge of each bar plus half the bar width */
      .attr("x", xScale(1) + (width / indexDs1.length - barPadding)/2
                           + ((width / 2 - barPadding) / 2) )
      .attr("y", function(d, i) {
           return i ? y2 + 14 : yScale(d.target_pct) + 14;
      })
      .attr("class", "yAxis")
      .attr("font-family", "sans-serif")
      .attr("fill", "white")
      .on("mouseover", mouseover)
      .on("mouseout", mouseup)
      .on("mousemove", mouseover);


  /* Add x labels to chart */
  let xLabels = svg.append("g")
                   .attr("transform", "translate(" + margin.left + "," + (margin.top + height)  + ")");

  xLabels.selectAll("text.xAxis")
         .data([{"series_name": indexCat1[0].attrib_value}, {"series_name": indexCat2[0].attrib_value}])
         .enter()
         .append("text")
         .text(function(d) { return d.series_name;})
         .attr("text-anchor", "middle")
         /* Set x position to the left edge of each bar plus half the bar width */
         .attr("x", function(d, i) {
            return xScale(i) + (width / indexDs1.length - barPadding)/2
                                  + ((width / 2 - barPadding) / 2);
         })
         .attr("y", 15)
         .attr("class", "xAxis");


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
      // Add tooltip based on position of the mouse
      let e = window.event;
      var x = e.clientX,
          y = e.clientY;

      let tipY = (y - 40) + 'px';
      let tipX = (x) + 'px';

      // Move tooltip to the left of the cursor if it gets too close to right edge
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
      // Hide tooltip when the mouse leaves the element
      tooltip.style('opacity', 0);
  }
}


/*******************************************************************************
*** 2-SERIES HORIZONTAL BAR CHART **********************************************
*******************************************************************************/
function hBar2SeriesChart(attrName, indexDs1, indexDs2) {

    let index1 = indexDs1[0],
        index2 = indexDs1[1];

    let localColor1 = DS_VIS_STORE[attrName+"Colors"][0],
        localColor2 = DS_VIS_STORE[attrName+"Colors"][1];

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

    let barHeight = height / ( index1.length * 2 ) - barPadding;

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


    /* Set x position and color dependent on size of bar */
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
  			     return (i * 2 * (barHeight + barPadding) + barHeight / 2 + barPadding);
  	    })
  	    .attr("x", function(d) { return textInside(d) ? maxAttrLength + xScale(d.target_pct) - 20 : maxAttrLength + xScale(d.target_pct) + 20 })
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
             return (i * 2 * (barHeight + barPadding) + barHeight * 1.5 + barPadding);
        })
        .attr("x", function(d) { return textInside(d) ? maxAttrLength + xScale(d.target_pct) - 20 : maxAttrLength + xScale(d.target_pct) + 20 })
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
  			   /* Set y position to the top edge of each bar plus half the bar width */
  				 .attr("y", function(d, i) {
     			     return (i * 2 * (barHeight + barPadding) + barHeight + barPadding);
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
  				       return (i * (height / index1.length))
                      + ((height / index1.length - barPadding) / 2)
                      + 10;
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
    svg.selectAll(".domain").remove()

    /* Add a toggle button */
    addCompareToggle(attrName);

    /* Organize the data based on the current selected audience */
    let inp = [indexDs1,indexDs2]
    let idx1 = DS_VIS_STORE[attrName+"Active"].indexOf(1)
    let idx2 = DS_VIS_STORE[attrName+"Active"].indexOf(2)
    let trans = [inp[idx1],inp[idx2]]

    /* Toggle Comparison Charts on click */
    $("#"+attrName+"Chart .ds-toggle-button .ds-toggle-main").unbind().click(function() {
          if (DS_VIS_STORE[attrName+"Active"][0] == 1) {
              DS_VIS_STORE[attrName+"Active"] = [2,1,3]
              DS_VIS_STORE[attrName+"Colors"] = [colorSeries2, colorSeries1, colorSeries3]
              toggleComparisonCharts(attrName, [trans[1],trans[0]]);
          } else {
              DS_VIS_STORE[attrName+"Active"] = [1,2,3]
              DS_VIS_STORE[attrName+"Colors"] = [colorSeries1, colorSeries2, colorSeries3]
              toggleComparisonCharts(attrName, [trans[0],trans[1]]);
          }

      $("#"+attrName+"Chart .ds-hbar-status").text(function() {
          let aud = DS_VIS_STORE[attrName+"Active"][0] === 1 ? targetAud.name : targetAud2.name;
          if (attrName === "interests") {
              return "Top 5 for " + aud + " (by Index)";
          } else if (attrName === "state") {
              return "Top 5 for " + aud + " (by Index)";
          } else {
              return "Top 5 for " + aud + " (by Index)";
          }

      });
      $("#"+attrName+"Chart .ds-toggle-after").css("background-color", DS_VIS_STORE[attrName+"Colors"][0]);
    });

    function toggleComparisonCharts(attrName, out) {

        plot = d3.select("#"+attrName+"Chart");

        /* Draw in the required bars and text with the functions below */
        addCompHbar(plot, "series1", out[0][0], maxAttrLength, barHeight, xScale, yScale, DS_VIS_STORE[attrName+"Colors"][0]);
        addCompHbar(plot, "series2", out[0][1], maxAttrLength, barHeight, xScale, yScale, DS_VIS_STORE[attrName+"Colors"][1]);
        addCompHbarText(plot, "series1", out[0][0], barHeight, barPadding, maxAttrLength);
        addCompHbarText(plot, "series2", out[0][1], barHeight, barPadding, maxAttrLength);

        function addCompHbar(plot, series, aud, maxAttrLength, barHeight, xScale, yScale, color) {
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
                     return series == "series1" ? yScale(i) : yScale(i) + barHeight;
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
                      return (i * 2 * (barHeight + barPadding) + barHeight / 2 + barPadding);
                    } else {
                      return (i * 2 * (barHeight + barPadding) + barHeight * 1.5 + barPadding);
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
               /* Set y position to the top edge of each bar plus half the bar width */
               .attr("y", function(d, i) {
                   return (i * 2 * (barHeight + barPadding) + barHeight + barPadding);
               })
               .attr("x", 66);
    };


  function mouseover(d) {
      // Add tooltip based on position of the mouse
      let e = window.event;
      var x = e.clientX,
          y = e.clientY;

      let tipY = (y - 80) + 'px';
      let tipX = (x) + 'px';

      // Move tooltip to the left of the cursor if it gets too close to right edge
      if  (window.innerWidth - x < 200) {
        tipX = (x - 130) + 'px';
      }

      tooltip.html(d.attrib_value + "<br/>" + "<br/>" + "Category: " + d.category + "<br/>" + "Target Pct: " + d.target_pct + "%<br/>"  + "Index: " + d.index)
          .style("opacity", .9)
          .style('left', `${(tipX)}`)
          .style('top', `${(tipY)}`);
  }

  function mouseout() {
      // Hide tooltip when the mouse leaves the element
      tooltip.style('opacity', 0);
  }

}


/*******************************************************************************
*** WAVE 2-SERIES CHART ********************************************************
*******************************************************************************/
function wave2SeriesChart(ds1, ds2) {

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

  let traces = [...traces1, ...traces2];
  Plotly.newPlot("waveChart", traces, layout, {displayModeBar: false, responsive: true});

}


/*******************************************************************************
*** 2-SERIES MIKEJ CHART *******************************************************
*******************************************************************************/
function mikeJ2SeriesChart(attrName, indexDs1, indexDs2) {

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


  // calculate chart height based on the number of distinct categories
  let allCats = [...new Set( [...unpack(indexDs1, 'category'), ...unpack(indexDs2, 'category')] )];
  let height = allCats.length * 58;
	let width = 1260;
  let margin = 40;

  // update the tile height to fit in the chart
  //$("#"+attrName+"DetailChart").parent().css("height", height + margin);


  let layout = {
    hovermode:'closest',
    // height: height,
    // width: width,
    xaxis: {
      range: [ 0, 320 ],
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
  Plotly.newPlot(chartName, [trace1, trace2], layout, {displayModeBar: false, responsive: true});
}


/*******************************************************************************
*** ADD 2-SERIES STATS *********************************************************
*******************************************************************************/
function add2SeriesStat(attrName, stat1, stat2, prefix='', suffix='') {
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
            + "</span></div>");

  // color code the stats
  $("#" + attrName + "Chart").prev(".tile-header")
  .find(".ds-stats .ds-stat-1").css('color', colorSeries1);
  $("#" + attrName + "Chart").prev(".tile-header")
  .find(".ds-stats .ds-stat-2").css('color', colorSeries2);
}


/*******************************************************************************
*** ADD AUDIENCE TITLE *********************************************************
*******************************************************************************/
function addMultipleAudienceTitles(targetAud1, targetAud2, targetAud3 = null) {
    // remove existing titles, if any
    $( ".ds-audience-title h1" ).remove();

    let threeString = (targetAud3 != null) ? ("<div class= 'ds-aud-title-3'> <span style='color:#505050;'> VS </span>" + targetAud3.name + "</div>") : '';
    // add titles
    $( ".ds-audience-title" )
        .append("<h1><div class= 'ds-aud-title-1'>"
          + targetAud1.name
          + "</div>  <div class= 'ds-aud-title-2'> <span style='color:#505050'> VS </span> "
          + targetAud2.name + "</div>"
          + threeString
          + "</h1>");

    // add color codes
    $(".ds-audience-title .ds-aud-title-1").css("color", colorSeries1);
    $(".ds-audience-title .ds-aud-title-2").css("color", colorSeries2);
    if (targetAud3 != null) {
        $(".ds-audience-title .ds-aud-title-3").css("color", colorSeries3);
    }
}


/*******************************************************************************
*** DRAW ALL COMPARISON CHARTS *************************************************
*******************************************************************************/
function drawComparisonCharts() {
    d3.selectAll(".ds-tooltip").remove()
    // add the audience titles
    addAudienceLegend(compare=2);
    addMultipleAudienceTitles(targetAud, targetAud2);

    let indexCats = makeIndexCats();
    let demogAttributesList = Object.keys(indexCats);

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

    let stateIndexTop1 = indexStatesTop5(stateIndex1, stateIndex2);
    let stateIndexTop2 = indexStatesTop5(stateIndex2,stateIndex1);
    let interestsIndex2 = indexInterestsRetail("interests", targetInterests2, randomInterests);
    let interestsIndexTop1 = indexInterestsRetailTop5(interestsIndex1,interestsIndex2);
    let interestsIndexTop2 = indexInterestsRetailTop5(interestsIndex2,interestsIndex1);
    let retailIndex2 = indexInterestsRetail("retail", targetRetail2, randomRetail);
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


    wave2SeriesChart(indexes1, indexes2);

    /* Clicking on bar in DNA chart takes you to corresponding chart for more info */
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
        // Highlight the chart of interest for 3 seconds
        setTimeout(function() {$("#"+mapping[d[0]]+"Chart").css("border", "none")}, 3000);
    });

  drawBarChart("age", ageIndex1, ageIndex2);
  add2SeriesStat("age", ageMedianCat1, ageMedianCat2, prefix = "Median: ", suffix = " years");
  drawBarChart("ethnicity", ethnicityIndex1, ethnicityIndex2);
  drawBarChart("children", childrenIndex1, childrenIndex2);
  add2SeriesStat("children", childrenNonZeroPct1, childrenNonZeroPct2, prefix = "Child present: ", suffix = "%");
  drawBarChart("education", educationIndex1, educationIndex2);
  drawBarChart("income", incomeIndex1, incomeIndex2);
  add2SeriesStat("income", incomeMedianCat1, incomeMedianCat2, prefix = "Median: ");
  hBarParallelChart("gender", audName1, genderIndex1, audName2, genderIndex2);
  hBarParallelChart("marital", audName1, maritalIndex1, audName2, maritalIndex2);

  (DS_VIS_STORE["stateActive"][0] === 1) ? hBar2SeriesChart("state", stateIndexTop1, stateIndexTop2) : hBar2SeriesChart("state", stateIndexTop2, stateIndexTop1);
  (DS_VIS_STORE["interestsActive"][0] === 1) ? hBar2SeriesChart("interests", interestsIndexTop1, interestsIndexTop2) : hBar2SeriesChart("interests", interestsIndexTop2, interestsIndexTop1);
  (DS_VIS_STORE["retailActive"][0] === 1) ? hBar2SeriesChart("retail", retailIndexTop1, retailIndexTop2) : hBar2SeriesChart("retail", retailIndexTop2, retailIndexTop1);

  $( ".tile" ).removeClass("selected-tile");

  mikeJ2SeriesChart('interests', interestsIndex1, interestsIndex2);
  mikeJ2SeriesChart('retail', retailIndex1, retailIndex2);

}


/*******************************************************************************
*** UPDATE ALL CHARTS **********************************************************
*******************************************************************************/

/* updates bar charts when a value element is clicked on a chart */
function updateComparisonCharts(attrName, attrValue) {
    let numSeries = DS_VIS_STORE.activeView;
    DS_VIS_STORE.activeFilter = [attrName, attrValue];

    let attrIndex = [];
    let indexCats = makeIndexCats();

    let indexes1 = {};
    let indexes2 = {};

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

            if (demogAttributeListName == "interests"){
              orderedTargetFilter(targetInterests, filteredIds1, filteredData1);
              attrIndex1 = indexInterestsRetail(demogAttributeListName, filteredData1, randomInterests);

              orderedTargetFilter(targetInterests2, filteredIds2, filteredData2);
              attrIndex2 = indexInterestsRetail(demogAttributeListName, filteredData2, randomInterests);
            } else if (demogAttributeListName == "retail"){
              orderedTargetFilter(targetRetail, filteredIds1, filteredData1);
              attrIndex1 = indexInterestsRetail(demogAttributeListName, filteredData1, randomRetail);

              orderedTargetFilter(targetRetail2, filteredIds2, filteredData2);
              attrIndex2 = indexInterestsRetail(demogAttributeListName, filteredData2, randomRetail);
            }
            attrIndexTop1 = indexInterestsRetailTop5(attrIndex1,attrIndex2);
            attrIndexTop2 = indexInterestsRetailTop5(attrIndex2,attrIndex1);
          } else {
            let filteredData1 = filterAttr(targetDemog, attrName, attrValue);
            let filteredData2 = filterAttr(targetDemog2, attrName, attrValue);
            attrIndex1 = indexAttr(demogAttributeListName,
                                  indexCats[demogAttributeListName],
                                  filteredData1,
                                  randomDemog);
            attrIndex2 = indexAttr(demogAttributeListName,
                                  indexCats[demogAttributeListName],
                                  filteredData2,
                                  randomDemog);
            if (demogAttributeListName == "state") {
                attrIndexTop1 = indexStatesTop5(attrIndex1, attrIndex2);
                attrIndexTop2 = indexStatesTop5(attrIndex2, attrIndex1);
            }
          }
      } else {
          if ( hBarChartAttributesList.includes(demogAttributeListName) & demogAttributeListName != "state" ) {
            if (demogAttributeListName == "interests"){
              attrIndex1 = indexInterestsRetail(demogAttributeListName, targetInterests, randomInterests);
              attrIndex2 = indexInterestsRetail(demogAttributeListName, targetInterests2, randomInterests);
            } else if (demogAttributeListName == "retail"){
              attrIndex1 = indexInterestsRetail(demogAttributeListName, targetRetail, randomRetail);
              attrIndex2 = indexInterestsRetail(demogAttributeListName, targetRetail2, randomRetail);
            }
            attrIndexTop1 = indexInterestsRetailTop5(attrIndex1,attrIndex2);
            attrIndexTop2 = indexInterestsRetailTop5(attrIndex2,attrIndex1);
          } else {
            attrIndex1 = indexAttr(demogAttributeListName,
                                  indexCats[demogAttributeListName],
                                  targetDemog,
                                  randomDemog);

            attrIndex2 = indexAttr(demogAttributeListName,
                                  indexCats[demogAttributeListName],
                                  targetDemog2,
                                  randomDemog);
            if (demogAttributeListName == "state") {
                attrIndexTop1 = indexStatesTop5(attrIndex1, attrIndex2)[0];
                attrIndexTop2 = indexStatesTop5(attrIndex2, attrIndex1)[0];
            }
          }
      }


      // update the wave chart data
      if ( hBarChartAttributesList.includes(demogAttributeListName) ) {
          indexes1[demogAttributeListName] = attrIndexTop1[0];
          indexes2[demogAttributeListName] = attrIndexTop2[0];
      } else {
          indexes1[demogAttributeListName] = attrIndex1;
          indexes2[demogAttributeListName] = attrIndex2;
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
            add2SeriesStat("age", ageMedianCat1, ageMedianCat2, prefix = "Median: ", suffix = " years");
        } else if (demogAttributeListName == "children") {
            let childrenNonZeroPct1 = getNonZeroPct(attrIndex1);
            let childrenNonZeroPct2 = getNonZeroPct(attrIndex2);
            add2SeriesStat("children", childrenNonZeroPct1, childrenNonZeroPct2, prefix = "Child present: ", suffix = "%");
        } else if (demogAttributeListName == "income") {
            let incomeMedianCat1 = getMedianCategory(attrIndex1);
            let incomeMedianCat2 = getMedianCategory(attrIndex2);
            add2SeriesStat("income", incomeMedianCat1, incomeMedianCat2, prefix = "Median: ");
        }
      }


      // update charts
      if ( barChartAttributesList.includes(demogAttributeListName) ) {
          // update bar chart
          let innerWidth = 400;
          if (demogAttributeListName == "income") {
          	  innerWidth = 610;
          }

        	let basics = barChartSetup(innerWidth);
        	let margin = basics.margin,
              width = basics.width,
              height = basics.height,
          		barPadding = basics.barPadding * 2;

          let xScale = d3.scaleLinear()
                         .domain([0, attrIndex1.length])
                         .range([0, width]);

          let yScale = d3.scaleLinear()
                         .domain([0, Math.max(
                              d3.max(attrIndex1, function(d) { return d.target_pct; }),
                              d3.max(attrIndex2, function(d) { return d.target_pct; }),
                              numSeries == 3 ? d3.max(attrIndex3, function(d) { return d.target_pct; }) : 0
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
            function updateBar(data,series,color) {
              plot.selectAll("rect."+series)
                  .data(data)
                  .transition()
                  .duration(750)
                    .attr("x", function(d, i) {
                        if (series == "series1") {
                          return xScale(i);
                        } else if (series == "series2") {
                          return xScale(i) + width / (data.length * numSeries) - barPadding;
                        } else if (series == "series3") {
                          return xScale(i) + width / (data.length * 1.5) - barPadding * 2;
                        }

                    })
                    .attr("width", width / (data.length * numSeries) - barPadding)
                    .attr("y", function(d) {
                         return yScale(d.target_pct);
                    })
                    .attr("height", function(d) {
                        return height-yScale(d.target_pct);
                    })
                    .attr("fill", color)
                  .attr("cursor", "pointer")
                  .attr("attrib-value", function(d) { return d.attrib_value; })    /* storing the Acxiom attrib value on the element */
                  .attr("target-pct", function(d) { return d.target_pct; })
                  .attr("index", function(d) { return d.index; });
            }
            updateBar(attrIndex1,"series1",colorSeries1)
            updateBar(attrIndex2,"series2",colorSeries2)
            if (numSeries == 3) {
              updateBar(attrIndex3,"series3",colorSeries3)
            }


            /* Update the text labels on bars */
            function textInside(d) { return (height - yScale(d.target_pct)) > 20 }; // Display text inside if bar is big enough

            function updateBarText(data, series) {
                let fontSize = "10px";
                if (numSeries == 2 && attrName != "children") {
                    fontSize = "12px";
                }  else if (numSeries == 3 && attrName == "children") {
                    fontSize = "9px";
                }

                plot.selectAll("text."+series)
              	    .data(data)
              	    .transition()
                    .duration(750)
                    .text(function(d) {
                     return formatAsInteger(d3.format("d")(d.index));
                    })
              	    .attr("text-anchor", "middle")
              	    /* Set x position to the left edge of each bar plus half the bar width */
              	    .attr("x", function(d, i) {
                        if (series == "series1") {
                            return ( i * (width / data.length) )
                              + ( (width / (data.length * numSeries) - barPadding) / 2 );
                        } else if (series == "series2") {
                            return ( i * (width / data.length) )
                                     + ( (width / (data.length * numSeries) - barPadding) ) * 1.5 ;
                        } else if (series == "series3") {
                            return ( i * (width / data.length) )
                                + ( (width / (data.length * 3) - barPadding) ) * 2.5 ;
                        }

              	    })
              	    .attr("y", function(d) {
              			     return textInside(d) ? yScale(d.target_pct) + 14 : yScale(d.target_pct) - 7;
              	    })
              	  //  .attr("class", "yAxis")
              	    .attr("font-family", "sans-serif")
              	    .attr("fill", function(d) { return textInside(d) ? "white" : "#505050" });
            }

            updateBarText(attrIndex1, "series1");
            updateBarText(attrIndex2, "series2");
            if (numSeries == 3) {
                updateBarText(attrIndex3, "series3");
            }
            /* 1st series */
            // plot.selectAll("text.series1")
            //     .data(attrIndex1)
            //     .transition()
            //     .duration(750)
            //     .attr("text-anchor", "middle")
            //     .attr("x", function(d, i) {
            //        return ( i * (width / attrIndex1.length) )
            //          + ( (width / (attrIndex1.length * 2) - barPadding) / 2 );
          	//     })
            //     .attr("y", function(d) {
            //        return textInside(d) ? yScale(d.target_pct) + 14 : yScale(d.target_pct) - 7;
            //     })
            //     .text(function(d) {
            //      return formatAsInteger(d3.format("d")(d.index));
            //     })
            //     .attr("fill", function(d) { return textInside(d) ? "white" : "#505050" })
            //     .attr("class", "yAxis")
            //     .attr("class", "series1")
            //     ;
            //
            // plot.selectAll("text.series2")
            //     .data(attrIndex2)
            //     .transition()
            //     .duration(750)
            //     .attr("text-anchor", "middle")
            //     .attr("x", function(d, i) {
            //            return ( i * (width / attrIndex1.length) )
            //              + ( (width / (attrIndex1.length * 2) - barPadding) ) * 1.5 ;
            //     })
            //     .attr("y", function(d) {
            //        return textInside(d) ? yScale(d.target_pct) + 14 : yScale(d.target_pct) - 7;
            //     })
            //     .text(function(d) {
            //      return formatAsInteger(d3.format("d")(d.index));
            //     })
            //     .attr("fill", function(d) { return textInside(d) ? "white" : "#505050" })
            //     .attr("class", "yAxis")
            //     .attr("class", "series2");

        } else if ( sBarChartAttributesList.includes(demogAttributeListName) ) {
            d3.select("#"+demogAttributeListName+"Chart svg").remove();
            hBarParallelChart(demogAttributeListName,
              targetAud.name, attrIndex1,
              targetAud2.name, attrIndex2);

        } else if ( hBarChartAttributesList.includes(demogAttributeListName) ) {
            d3.select("#"+demogAttributeListName+"Chart svg").remove();
            target = DS_VIS_STORE[demogAttributeListName+"Active"][0] === 1 ? attrIndexTop1 : attrIndexTop2;
            compare = DS_VIS_STORE[demogAttributeListName+"Active"][0] === 1 ? attrIndexTop2 : attrIndexTop1;
            hBar2SeriesChart(demogAttributeListName, target, compare);

      }

  });


  // update the wave chart
  wave2SeriesChart(indexes1, indexes2);

  /* Clicking on bar in DNA chart takes you to corresponding chart for more info */
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



/*******************************************************************************
*** Toggle Button **************************************************************
*******************************************************************************/

$('.ds-toggle-button').on('click', function(event){
  $(this).toggleClass('active');
});

function addCompareToggle(attrName) {
  $("#"+attrName+"Chart .ds-toggle-button").css("display", "inline-block");
  if (DS_VIS_STORE[attrName+"Active"][0] == 2) {
      $("#"+attrName+"Chart .ds-toggle-button").toggleClass("active",true);
  }

  if ($("#"+attrName+"Chart .ds-toggle-main").length === 0) {
      $("#"+attrName+"Chart .ds-toggle-button").append(
        "<div class='ds-toggle-main'><div class='ds-toggle-after'></div></div>"
      );
  }

  $("#"+attrName+"Chart .ds-triple-toggle").remove();
  $("#"+attrName+"Chart .ds-hbar-status").text(function() {
      let aud = DS_VIS_STORE[attrName+"Active"][0] === 1 ? targetAud.name : targetAud2.name;
      if (attrName === "interests") {
          return "Top 5 for " + aud + " (by Index)";
      } else if (attrName === "state") {
          return "Top 5 for " + aud + " (by Index)";
      } else {
          return "Top 5 for " + aud + " (by Index)";
      }
  });

  $("#"+attrName+"Chart .ds-toggle-after").css("background-color", DS_VIS_STORE[attrName+"Colors"][0]);

}

function addTripleCompareToggle(attrName) {
  $("#"+attrName+"Chart .ds-toggle-button").css("display", "inline-block");
  $("#"+attrName+"Chart .ds-toggle-main").remove();
  if ($("#"+attrName+"Chart .ds-triple-toggle").length === 0) {
    $("#"+attrName+"Chart .ds-toggle-button").append(
      "<div class='ds-triple-toggle'><div class='ds-t1'></div><div class='ds-t2'></div><div class='ds-t3'></div></div>");
  }
  $("#"+attrName+"Chart .ds-t1").css("background-color", colorSeries1);
  $("#"+attrName+"Chart .ds-t2").css("background-color", colorSeries2);
  $("#"+attrName+"Chart .ds-t3").css("background-color", colorSeries3);
  if (DS_VIS_STORE[attrName+"Active"][0] == 1) {
      $("#"+attrName+"Chart .ds-toggle-button .ds-t1").toggleClass("active",true);
  }
  $("#"+attrName+"Chart .ds-hbar-status").text(function() {
      let aud = DS_VIS_STORE[attrName+"Active"][0] === 1 ? targetAud.name : DS_VIS_STORE[attrName+"Active"][0] === 2 ? targetAud2.name : targetAud3.name;
      if (attrName === "interests") {
          return "Top 5 for " + aud + " (by Index)";
      } else if (attrName === "state") {
          return "Top 5 for " + aud + " (by Index)";
      } else {
          return "Top 5 for " + aud + " (by Index)";
      }

  });

}
