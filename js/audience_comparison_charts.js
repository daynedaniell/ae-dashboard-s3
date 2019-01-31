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

    addBar(indexDs1,"series1",colorSeries1);
    if (numSeries > 1) {
        addBar(indexDs2,"series2",colorSeries2);
    }
    if (numSeries > 2) {
      addBar(indexDs3,"series3",colorSeries3);
    }

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
          drawComparisonCharts(activeView=DS_VIS_STORE.activeView);
       } else if (numSeries == 3) {
          drawComparisonCharts(activeView=DS_VIS_STORE.activeView);
       }
       showActiveFilter(DS_VIS_STORE);
     } else {
       if (numSeries == 1) {
          updateCharts(attrName, d.attrib_value);
       } else if (numSeries == 2) {
          updateComparisonCharts(attrName, d.attrib_value, numSeries);
       } else if (numSeries == 3) {
          updateComparisonCharts(attrName, d.attrib_value, numSeries);
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
*** Multi-Series Balance CHART *************************************************
*******************************************************************************/
function hBarBalanceChart(attrName, indexDs1, indexDs2, indexDs3 = null) {
    let numSeries = DS_VIS_STORE.activeView;

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

    let barHeight = numSeries == 3 ? 50 : 60;
    let paddingBottom = numSeries == 3 ? 30 : 60;
    let barSpacing = 40;
    let topPos = height - ((barHeight + barSpacing) * numSeries + paddingBottom);
    let lineStroke = 'steelblue';
    let lineExtend = 12;
    let lineStrokeWidth = 8;

    /* Attach index data and add the chart elems */
    function addPBar(data, series, color) {
        plot.selectAll("rect." + series)
            .data(data)
            .enter()
            .append("rect")
            .attr("class", series)
            .attr("x", function(d, i) { return i ? xScale(100 - d.target_pct) : 0})
            .attr("width", function(d) { return xScale(d.target_pct)})
            .attr("y", function() {
                if (series == "series1") {
                    return topPos
                } else if (series == "series2") {
                    return topPos + barSpacing + barHeight
                } else if (series == "series3") {
                    return topPos + barSpacing * 2 + barHeight*2
                }
            })
            .attr("height", function(d) { return barHeight ; })
            .attr("fill", color)
            .attr("cursor", "pointer")
            .attr("attrib-value", function(d) { return d.attrib_value; })    /* storing the Acxiom attrib value on the element */
            .on("mouseover", mouseover)
            .on("mouseout", mouseup)
            .on("mousemove", mouseover)
            .attr("target-pct", function(d) { return d.target_pct; })
            .attr("index", function(d) { return d.index; })
            .on("click", up);
    }
    addPBar(indexDs1, "series1", colorSeries1)
    addPBar(indexDs2, "series2", colorSeries2)
    if (numSeries > 2) {
      addPBar(indexDs3, "series3", colorSeries3)
    }

    function addPbarText(data, series) {
        plot.selectAll("text."+series)
            .data(data)
            .enter()
            .append("text")
            .attr("class", series)
            .text(function(d) {
                 return formatAsInteger(d3.format("d")(d.index));
            })
            .attr("text-anchor", "middle")
            /* Set x position to be inside corresponding edge of the bar */
            .attr("x",  function(d, i) { return i ? xScale(100 ) - 20 : 14})
            .attr("y", function() {
                if (series == "series1") {
                  return topPos + 3 + (barHeight/2)
                } else if (series == "series2") {
                  return topPos + barSpacing + 3 + barHeight + (barHeight/2)
                } else if (series == "series3") {
                  return topPos + barSpacing * 2 + 3 + barHeight*2 + (barHeight/2)
                }
            })
            .attr("class", "yAxis")
            .attr("font-family", "sans-serif")
            .attr("fill", "white")
            .on("mouseover", mouseover)
            .on("mouseout", mouseup)
            .on("mousemove", mouseover);
    }

    addPbarText(indexDs1, "series1");
    addPbarText(indexDs2, "series2");
    if (numSeries > 2) {
        addPbarText(indexDs3, "series3");
    }

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
        .attr("y", function(d) { return topPos - 30})
        .attr("class", "yAxis")
        .attr("font-family", "sans-serif")
        .attr("font-size", "20px")
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

    if (numSeries > 2) {
        var lineData3 = [{"x": xScale(indexDs3[0].target_pct), "y": topPos + barSpacing*2 + barHeight*2 - lineExtend},
                        {"x": xScale(indexDs3[0].target_pct), "y": topPos + barSpacing*2 + barHeight*2 + barHeight + lineExtend}]

        var line3 = d3.line()
                     .x(function(d) {return d.x})
                     .y(function(d) {return d.y});

        var path3 = plot.append('path').attr('d', line3(lineData3)).attr("stroke", lineStroke)
            .attr("stroke-width", lineStrokeWidth)
            .attr("fill", "none");
    }

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
         if (numSeries == 2) {
            drawComparisonCharts(activeView=DS_VIS_STORE.activeView);
         } else if (numSeries == 3) {
            drawComparisonCharts(activeView=DS_VIS_STORE.activeView);
         }
         showActiveFilter(DS_VIS_STORE);
       } else {
         if (numSeries == 2) {
            updateComparisonCharts(attrName, d.attrib_value, numSeries=DS_VIS_STORE.activeView);
         } else if (numSeries == 3) {
            updateComparisonCharts(attrName, d.attrib_value, numSeries=DS_VIS_STORE.activeView);
         }
         showActiveFilter(DS_VIS_STORE);
       }
    }

    function mouseover(d) {
      // Add tooltip based on position of the mouse
      let e = window.event;
      let x = e.clientX,
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
*** Multi-SERIES HORIZONTAL BAR CHART ******************************************
*******************************************************************************/
function hBarMultiSeriesChart(attrName, indexDs1, indexDs2, indexDs3 = null) {
    let numSeries = DS_VIS_STORE.activeView;

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

    let barHeight = height / ( index1.length * numSeries ) - barPadding;

    /* Attach index data and add the chart elems */
    /* 1st series */
    function drawHbar(data, series, color) {
        plot.selectAll("rect."+series)
            .data(data)
      		  .enter()
      		  .append("rect")
            .attr("class", series)
      			.attr("x", function(d) {
                 return maxAttrLength;
      			})
      		  .attr("height", barHeight)
      			.attr("y", function(d, i) {
                if (series == "series1") {
                    return yScale(i);
                } else if (series == "series2") {
                    return yScale(i) + barHeight;
                } else if (series == "series3") {
                    return yScale(i) + barHeight*2;
                }
      			})
      			.attr("width", function(d) {
      			    return xScale(d.target_pct);
      			})
      			.attr("fill", function(d) {
                return color;
            })
            .attr("attrib-value", function(d) { return d.attrib_value; })    /* storing the Acxiom attrib value on the element */
            .on("mouseover", mouseover)
            .on("mouseout", mouseout)
            .on("mousemove", mouseover)
            .attr("attrib-category", function(d) { return d.category; })
            .attr("target-pct", function(d) { return d.target_pct; })
            .attr("index", function(d) { return d.index; })
            ;
    }

    drawHbar(index1, "series1", localColor1);
    if (numSeries > 1) {
        drawHbar(index2, "series2", localColor2);
    }
    if (numSeries > 2) {
        drawHbar(index3, "series3", localColor3);
    }

    /* Set x position and color dependent on size of bar */
    function textInside(d) { return xScale(d.target_pct) > 30};

    /* Add y labels to plot */
    function addHbarText(data, series) {
        plot.selectAll("text."+series)
      	    .data(data)
      	    .enter()
      	    .append("text")
            .attr("class", series)
      	    .text(function(d) {
      			     return formatAsInteger(d3.format("d")(d.index));
      	    })
      	    .attr("text-anchor", "middle")
      	    /* Set y position to the top edge of each bar plus half the bar width */
      	    .attr("y", function(d, i) {
                if (series == "series1") {
                    return (i * numSeries * (barHeight + barPadding) + barHeight / 2 + barPadding * 2);
                } else if (series == "series2") {
                    return (i * numSeries * (barHeight + barPadding) + barHeight * 1.5 + barPadding * 2);
                } else if (series == "series3") {
                    return (i * numSeries * (barHeight + barPadding) + barHeight + barHeight * 1.5 + barPadding * 2);
                }

      	    })
      	    .attr("x", function(d) { return textInside(d) ? maxAttrLength + xScale(d.target_pct) - 20 : maxAttrLength + xScale(d.target_pct) + 20 })
      	    .attr("font-family", "sans-serif")
      	    .attr("font-size", "11px")
      	    .attr("fill", function(d) { return textInside(d) ? "white" : "#505050" })
            .on("mouseover", mouseover)
            .on("mouseout", mouseout)
            .on("mousemove", mouseover);
    }

    addHbarText(index1, "series1");
    if (numSeries > 1) {
      addHbarText(index2, "series2");
    }
    if (numSeries > 2) {
      addHbarText(index3, "series3")
    }

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
                return (i * numSeries * (barHeight + barPadding) + barHeight * numSeries/2 + barPadding * 2);
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
  				       return (i * numSeries * (barHeight + barPadding) + barHeight * numSeries/2 + barPadding + 10);
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

    /* Add the toggle button */
    addCompareToggle(attrName);

    function changeToggleText(audNumber) {
        // Change the toggle text to represent the selected audience
        $("#"+attrName+"Chart .ds-hbar-status").text(function() {
            let aud = (audNumber === 1) ? targetAud.name : audNumber === 2 ? targetAud2.name : targetAud3.name;
            return "Top 5 for " + aud + " (by Index)";

        });
    }

    /* Organize the data based on the current selected audience */
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
        /*
          The toggle is currently set to transition to the newly selected audience.
          If we don't want this, we can just redraw using the below for an instant transition.
            d3.select("#"+attrName+"Chart svg").remove();
            $("#"+attrName+"Chart .ds-toggle-button .ds-triple-toggle").remove();
            hBarMultiSeriesChart(attrName,out[0],out[1],out[2]);
        */

        plot = d3.select("#"+attrName+"Chart");

        /* Draw in the required bars and text with the functions below */
        addCompHbar(plot, "series1", out[0][0], maxAttrLength, barHeight, xScale, yScale, DS_VIS_STORE[attrName+"Colors"][0]);
        addCompHbar(plot, "series2", out[0][1], maxAttrLength, barHeight, xScale, yScale, DS_VIS_STORE[attrName+"Colors"][1]);
        if (numSeries > 2) {
            addCompHbar(plot, "series3", out[0][2], maxAttrLength, barHeight, xScale, yScale, DS_VIS_STORE[attrName+"Colors"][2]);
        }
        addCompHbarText(plot, "series1", out[0][0], barHeight, barPadding, maxAttrLength);
        addCompHbarText(plot, "series2", out[0][1], barHeight, barPadding, maxAttrLength);
        if (numSeries > 2) {
            addCompHbarText(plot, "series3", out[0][2], barHeight, barPadding, maxAttrLength);
        }

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
                    return (i * numSeries * (barHeight + barPadding) + barHeight / 2 + barPadding * 2);
                  } else if (series == "series2") {
                    return (i * numSeries * (barHeight + barPadding) + barHeight * 1.5 + barPadding * 2);
                  } else if (series == "series3") {
                    return (i * numSeries * (barHeight + barPadding) + barHeight + barHeight * 1.5 + barPadding * 2);
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
                   return DS_VIS_STORE[attrName+"Colors"][0];
               })
               .attr("text-anchor", "start")
               /* Set y position to the top edge of each bar plus half the bar width */
               .attr("y", function(d, i) {
                   return (i * numSeries * (barHeight + barPadding) + barHeight * numSeries/2 + barPadding * 2);
               })
               .attr("x", 66);
    }

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
*** DRAW COMPARISON CHARTS *****************************************************
*******************************************************************************/
function drawComparisonCharts(activeView) {
    /* Remove any active tooltips */
    d3.selectAll(".ds-tooltip").remove();

    /* View setup */
    addAudienceLegend(compare=activeView);

    if (activeView == 1) {
        addAudienceTitles(targetAud);
    } else if (activeView == 2) {
        addAudienceTitle(targetAud, targetAud2);
    } else if (activeView == 3) {
        addAudienceTitle(targetAud, targetAud2, targetAud3);
    }

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

    let audName2 = null;
    let ageIndex2 = null;
    let ageMedianCat2 = null;
    let genderIndex2 = null;
    let ethnicityIndex2 = null;
    let maritalIndex2 = null;
    let childrenIndex2 = null;
    let childrenNonZeroPct2 = null;
    let educationIndex2 = null;
    let incomeIndex2 = null;
    let incomeMedianCat2 = null;
    let stateIndex2 = null;
    let interestsIndex2 = null;
    let retailIndex2 = null;

    let audName3 = null;
    let ageIndex3 = null;
    let ageMedianCat3 = null;
    let genderIndex3 = null;
    let ethnicityIndex3 = null;
    let maritalIndex3 = null;
    let childrenIndex3 = null;
    let childrenNonZeroPct3 = null;
    let educationIndex3 = null;
    let incomeIndex3 = null;
    let incomeMedianCat3 = null;
    let stateIndex3 = null;
    let interestsIndex3 = null;
    let retailIndex3 = null;

    if (activeView > 1) {
        audName2 = targetAud2.name;
        ageIndex2 = indexAttr("age", indexCats.age, targetDemog2, randomDemog);
        ageMedianCat2 = getMedianCategory(ageIndex2);
        genderIndex2 = indexAttr("gender", indexCats.gender, targetDemog2, randomDemog);
        ethnicityIndex2 = indexAttr("ethnicity", indexCats.ethnicity, targetDemog2, randomDemog);
        maritalIndex2 = indexAttr("marital", indexCats.marital, targetDemog2, randomDemog);
        childrenIndex2 = indexAttr("children", indexCats.children, targetDemog2, randomDemog);
        childrenNonZeroPct2 = getNonZeroPct(childrenIndex2);
        educationIndex2 = indexAttr("education", indexCats.education, targetDemog2, randomDemog);
        incomeIndex2 = indexAttr("income", indexCats.income, targetDemog2, randomDemog);
        incomeMedianCat2 = getMedianCategory(incomeIndex2);
        stateIndex2 = indexAttr("state", indexCats.state, targetDemog2, randomDemog);
        interestsIndex2 = indexInterestsRetail("interests", targetInterests2, randomInterests);
        retailIndex2 = indexInterestsRetail("retail", targetRetail2, randomRetail);
    }

    if (activeView > 2) {
        audName3 = targetAud3.name;
        ageIndex3 = indexAttr("age", indexCats.age, targetDemog3, randomDemog);
        ageMedianCat3 = getMedianCategory(ageIndex3);
        genderIndex3 = indexAttr("gender", indexCats.gender, targetDemog3, randomDemog);
        ethnicityIndex3 = indexAttr("ethnicity", indexCats.ethnicity, targetDemog3, randomDemog);
        maritalIndex3 = indexAttr("marital", indexCats.marital, targetDemog3, randomDemog);
        childrenIndex3 = indexAttr("children", indexCats.children, targetDemog3, randomDemog);
        childrenNonZeroPct3 = getNonZeroPct(childrenIndex3);
        educationIndex3 = indexAttr("education", indexCats.education, targetDemog3, randomDemog);
        incomeIndex3 = indexAttr("income", indexCats.income, targetDemog3, randomDemog);
        incomeMedianCat3 = getMedianCategory(incomeIndex3);
        stateIndex3 = indexAttr("state", indexCats.state, targetDemog3, randomDemog);
        interestsIndex3 = indexInterestsRetail("interests", targetInterests3, randomInterests);
        retailIndex3 = indexInterestsRetail("retail", targetRetail3, randomRetail);
    }

    let stateIndexTop3 = null;
    let interestsIndexTop3 = null;
    let retailIndexTop3 = null;

    let stateIndexTop1 = indexStatesTop5(stateIndex1, stateIndex2, stateIndex3);
    let stateIndexTop2 = indexStatesTop5(stateIndex2,stateIndex1, stateIndex3);
    if (activeView > 2) {
        stateIndexTop3 = indexStatesTop5(stateIndex3,stateIndex1, stateIndex2);
        interestsIndexTop3 = indexInterestsRetailTop5(interestsIndex3,interestsIndex1,interestsIndex2);
        retailIndexTop3 = indexInterestsRetailTop5(retailIndex3, retailIndex1, retailIndex2);
    }

    let interestsIndexTop1 = indexInterestsRetailTop5(interestsIndex1,interestsIndex2,interestsIndex3);
    let interestsIndexTop2 = indexInterestsRetailTop5(interestsIndex2,interestsIndex1,interestsIndex3);

    let retailIndexTop1 = indexInterestsRetailTop5(retailIndex1, retailIndex2, retailIndex3);
    let retailIndexTop2 = indexInterestsRetailTop5(retailIndex2, retailIndex1, retailIndex3);


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

    let indexes2 = null;
    let indexes3 = null;

    if (activeView > 1) {
        indexes2 = {
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
    }

    if (activeView > 2) {
        indexes3 = {
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
    }


    dnaChart(indexes1, indexes2, indexes3);

    var myPlot = document.getElementById('waveChart');
    myPlot.on('plotly_click', function(data){
      let d = data.points[0].hovertext.split("<br>")[2].trim().split(":");
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

    drawBarChart("age", ageIndex1, ageIndex2, ageIndex3, numSeries = activeView);
    addSeriesStats("age", ageMedianCat1, ageMedianCat2, ageMedianCat3, prefix = "Median: ", suffix = " years");
    drawBarChart("ethnicity", ethnicityIndex1, ethnicityIndex2, ethnicityIndex3, numSeries = activeView);
    drawBarChart("children", childrenIndex1, childrenIndex2, childrenIndex3, numSeries = activeView);
    addSeriesStats("children", childrenNonZeroPct1, childrenNonZeroPct2, childrenNonZeroPct3, prefix = "Child Present: ", suffix = "%");
    drawBarChart("education", educationIndex1, educationIndex2, educationIndex3, numSeries = activeView);
    drawBarChart("income", incomeIndex1, incomeIndex2, incomeIndex3, numSeries = activeView);
    addSeriesStats("income", incomeMedianCat1, incomeMedianCat2, incomeMedianCat3, prefix = "Median: ");
    hBarBalanceChart("gender", genderIndex1, genderIndex2, genderIndex3);
    hBarBalanceChart("marital", maritalIndex1, maritalIndex2, maritalIndex3);

    (DS_VIS_STORE["stateActive"][0] === 1) ? hBarMultiSeriesChart("state", stateIndexTop1, stateIndexTop2, stateIndexTop3) : hBarMultiSeriesChart("state", stateIndexTop2, stateIndexTop1, stateIndexTop3);
    (DS_VIS_STORE["interestsActive"][0] === 1) ? hBarMultiSeriesChart("interests", interestsIndexTop1, interestsIndexTop2, interestsIndexTop3) : hBarMultiSeriesChart("interests", interestsIndexTop2, interestsIndexTop1, interestsIndexTop3);
    (DS_VIS_STORE["retailActive"][0] === 1) ? hBarMultiSeriesChart("retail", retailIndexTop1, retailIndexTop2, retailIndexTop3) : hBarMultiSeriesChart("retail", retailIndexTop2, retailIndexTop1, retailIndexTop3);

    $( ".tile" ).removeClass("selected-tile");

    mikeJBubbleChart('interests', interestsIndex1, interestsIndex2, interestsIndex3);
    mikeJBubbleChart('retail', retailIndex1, retailIndex2, retailIndex3);

    addBubbleHighlighting('interests');
    addBubbleHighlighting('retail');

}


/*******************************************************************************
*** UPDATE ALL CHARTS **********************************************************
*******************************************************************************/

/* updates bar charts when a value element is clicked on a chart */
function updateComparisonCharts(attrName, attrValue, numSeries = 3) {
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

    /* Temp fix to instantiate these in event of 2 series comparison */
    if (numSeries < 3) {
        attrIndex3 = null;
        attrIndexTop3 = null;
        targetDemog3 = null;
    }


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
                let filteredIds3;
                if (numSeries > 2) {
                    filteredIds3 = filterAttr(targetDemog3, attrName, attrValue).map(function(d) { return d.temp_id; });
                }

                if (demogAttributeListName == "interests") {
                  orderedTargetFilter(targetInterests, filteredIds1, filteredData1);
                  attrIndex1 = indexInterestsRetail(demogAttributeListName, filteredData1, randomInterests);

                  orderedTargetFilter(targetInterests2, filteredIds2, filteredData2);
                  attrIndex2 = indexInterestsRetail(demogAttributeListName, filteredData2, randomInterests);

                  if (numSeries > 2) {
                      orderedTargetFilter(targetInterests3, filteredIds3, filteredData3);
                      attrIndex3 = indexInterestsRetail(demogAttributeListName, filteredData3, randomInterests);
                  }
                } else if (demogAttributeListName == "retail"){
                  orderedTargetFilter(targetRetail, filteredIds1, filteredData1);
                  attrIndex1 = indexInterestsRetail(demogAttributeListName, filteredData1, randomRetail);

                  orderedTargetFilter(targetRetail2, filteredIds2, filteredData2);
                  attrIndex2 = indexInterestsRetail(demogAttributeListName, filteredData2, randomRetail);

                  if (numSeries > 2) {
                      orderedTargetFilter(targetRetail3, filteredIds3, filteredData3);
                      attrIndex3 = indexInterestsRetail(demogAttributeListName, filteredData3, randomRetail);
                  }
                }
                attrIndexTop1 = indexInterestsRetailTop5(attrIndex1,attrIndex2,attrIndex3);
                attrIndexTop2 = indexInterestsRetailTop5(attrIndex2,attrIndex1,attrIndex3);
                if (numSeries > 2) {
                    attrIndexTop3 = indexInterestsRetailTop5(attrIndex3,attrIndex1,attrIndex2);
                }
            } else {
              let filteredData1, filteredData2, filteredData3;
              filteredData1 = filterAttr(targetDemog, attrName, attrValue);
              filteredData2 = filterAttr(targetDemog2, attrName, attrValue);
              if (numSeries > 2) {
                  filteredData3 = filterAttr(targetDemog3, attrName, attrValue);
              }

              attrIndex1 = indexAttr(demogAttributeListName,
                                    indexCats[demogAttributeListName],
                                    filteredData1,
                                    randomDemog);
              attrIndex2 = indexAttr(demogAttributeListName,
                                    indexCats[demogAttributeListName],
                                    filteredData2,
                                    randomDemog);
              if (numSeries > 2) {
                  attrIndex3 = indexAttr(demogAttributeListName,
                                        indexCats[demogAttributeListName],
                                        filteredData3,
                                        randomDemog);
              }
              if (demogAttributeListName == "state") {
                  attrIndexTop1 = indexStatesTop5(attrIndex1, attrIndex2, attrIndex3);
                  attrIndexTop2 = indexStatesTop5(attrIndex2, attrIndex1, attrIndex3);
                  if (numSeries > 2) {
                      attrIndexTop3 = indexStatesTop5(attrIndex3, attrIndex1, attrIndex2);
                  }
              }
            }
        } else {
            if ( hBarChartAttributesList.includes(demogAttributeListName) & demogAttributeListName != "state" ) {
                if (demogAttributeListName == "interests"){
                    attrIndex1 = indexInterestsRetail(demogAttributeListName, targetInterests, randomInterests);
                    attrIndex2 = indexInterestsRetail(demogAttributeListName, targetInterests2, randomInterests);
                    if (numSeries > 2) {
                        attrIndex3 = indexInterestsRetail(demogAttributeListName, targetInterests3, randomInterests);
                    }
                } else if (demogAttributeListName == "retail"){
                    attrIndex1 = indexInterestsRetail(demogAttributeListName, targetRetail, randomRetail);
                    attrIndex2 = indexInterestsRetail(demogAttributeListName, targetRetail2, randomRetail);
                    if (numSeries > 2) {
                        attrIndex3 = indexInterestsRetail(demogAttributeListName, targetRetail3, randomRetail);
                    }
                }
                attrIndexTop1 = indexInterestsRetailTop5(attrIndex1,attrIndex2,attrIndex3);
                attrIndexTop2 = indexInterestsRetailTop5(attrIndex2,attrIndex1,attrIndex3);
                if (numSeries > 2) {
                    attrIndexTop3 = indexInterestsRetailTop5(attrIndex3,attrIndex1,attrIndex2);
                }
            } else {
                attrIndex1 = indexAttr(demogAttributeListName,
                                      indexCats[demogAttributeListName],
                                      targetDemog,
                                      randomDemog);

                attrIndex2 = indexAttr(demogAttributeListName,
                                      indexCats[demogAttributeListName],
                                      targetDemog2,
                                      randomDemog);

                if (numSeries > 2) {
                    attrIndex3 = indexAttr(demogAttributeListName,
                                          indexCats[demogAttributeListName],
                                          targetDemog3,
                                          randomDemog);
                }

                if (demogAttributeListName == "state") {
                    attrIndexTop1 = indexStatesTop5(attrIndex1, attrIndex2, attrIndex3)[0];
                    attrIndexTop2 = indexStatesTop5(attrIndex2, attrIndex1, attrIndex3)[0];
                    if (numSeries > 2) {
                        attrIndexTop3 = indexStatesTop5(attrIndex3, attrIndex1, attrIndex2)[0];
                    }
                }
            }
        }

        // update the wave chart data
        if ( hBarChartAttributesList.includes(demogAttributeListName) ) {
          indexes1[demogAttributeListName] = attrIndexTop1[0];
          indexes2[demogAttributeListName] = attrIndexTop2[0];
          if (numSeries > 2) {
              indexes3[demogAttributeListName] = attrIndexTop3[0];
          }
        } else {
          indexes1[demogAttributeListName] = attrIndex1;
          indexes2[demogAttributeListName] = attrIndex2;
          if (numSeries > 2) {
              indexes3[demogAttributeListName] = attrIndex3;
          }
        }

        // update stats
        $( "#" + demogAttributeListName + "Chart" )
          .prev(".tile-header")
          .find(".ds-stats")
          .css("opacity", 0);
        if (attrName != demogAttributeListName) {
            if (demogAttributeListName == "age") {
                let ageMedianCat1, ageMedianCat2, ageMedianCat3;
                ageMedianCat1 = getMedianCategory(attrIndex1);
                ageMedianCat2 = getMedianCategory(attrIndex2);
                if (numSeries > 2) {
                    ageMedianCat3 = getMedianCategory(attrIndex3);
                }
                addSeriesStats("age", ageMedianCat1, ageMedianCat2, ageMedianCat3, prefix = "Median: ", suffix = " years");
            } else if (demogAttributeListName == "children") {
                let childrenNonZeroPct1, childrenNonZeroPct2, childrenNonZeroPct3;
                childrenNonZeroPct1 = getNonZeroPct(attrIndex1);
                childrenNonZeroPct2 = getNonZeroPct(attrIndex2);
                if (numSeries > 2) {
                    childrenNonZeroPct3 = getNonZeroPct(attrIndex3);
                }
                addSeriesStats("children", childrenNonZeroPct1, childrenNonZeroPct2, childrenNonZeroPct3, prefix = "Child present: ", suffix = "%");
            } else if (demogAttributeListName == "income") {
                let incomeMedianCat1, incomeMedianCat2, incomeMedianCat3;
                incomeMedianCat1 = getMedianCategory(attrIndex1);
                incomeMedianCat2 = getMedianCategory(attrIndex2);
                if (numSeries > 2) {
                    incomeMedianCat3 = getMedianCategory(attrIndex3);
                }
                addSeriesStats("income", incomeMedianCat1, incomeMedianCat2, incomeMedianCat3, prefix = "Median: ");
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
                                  numSeries > 2 ? d3.max(attrIndex3, function(d) { return d.target_pct; }) : 0
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
              if (numSeries > 2) {
                  updateBarText(attrIndex3, "series3");
              }
        } else if ( sBarChartAttributesList.includes(demogAttributeListName) ) {
            d3.select("#"+demogAttributeListName+"Chart svg").remove();

            hBarBalanceChart(demogAttributeListName,attrIndex1,attrIndex2,attrIndex3);

        } else if ( hBarChartAttributesList.includes(demogAttributeListName) ) {
            d3.select("#"+demogAttributeListName+"Chart svg").remove();
            target = DS_VIS_STORE[demogAttributeListName+"Active"][0] === 1 ? attrIndexTop1 :
                DS_VIS_STORE[demogAttributeListName+"Active"][0] === 2 ? attrIndexTop2 : attrIndexTop3;
            compare = DS_VIS_STORE[demogAttributeListName+"Active"][1] === 1 ? attrIndexTop1 :
                DS_VIS_STORE[demogAttributeListName+"Active"][1] === 2 ? attrIndexTop2 : attrIndexTop3;
            compare2 = DS_VIS_STORE[demogAttributeListName+"Active"][2] === 1 ? attrIndexTop1 :
                DS_VIS_STORE[demogAttributeListName+"Active"][2] === 2 ? attrIndexTop2 : attrIndexTop3;

            hBarMultiSeriesChart(demogAttributeListName,target,compare,compare2);

        }
    });

    // update the wave chart
    dnaChart(indexes1, indexes2, indexes3);

    /* Make clicking on a bar take you to the corresponding chart below */
    var myPlot = document.getElementById('waveChart');
    myPlot.on('plotly_click', function(data){
      let d = data.points[0].hovertext.split("<br>")[2].trim().split(":");
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
  let numSeries = DS_VIS_STORE.activeView;

  $("#"+attrName+"Chart .ds-toggle-button").css("display", "inline-block");
  $("#"+attrName+"Chart .ds-toggle-main").remove();
  if (numSeries == 2 && ($("#"+attrName+"Chart .ds-t2").length === 0 || $("#"+attrName+"Chart .ds-t3").length === 1)) {
      $("#"+attrName+"Chart .ds-triple-toggle").remove();
      $("#"+attrName+"Chart .ds-toggle-button").append(
        "<div class='ds-triple-toggle'><div class='ds-t1'></div><div class='ds-t2'></div></div>");
  } else if (numSeries == 3 && $("#"+attrName+"Chart .ds-t3").length === 0) {
      $("#"+attrName+"Chart .ds-triple-toggle").remove();
      $("#"+attrName+"Chart .ds-toggle-button").append(
        "<div class='ds-triple-toggle'><div class='ds-t1'></div><div class='ds-t2'></div><div class='ds-t3'></div></div>");
  }

  $("#"+attrName+"Chart .ds-t1").css("background-color", colorSeries1);
  $("#"+attrName+"Chart .ds-t2").css("background-color", colorSeries2);
  if (numSeries == 3) {
      $("#"+attrName+"Chart .ds-t3").css("background-color", colorSeries3);
  }

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
