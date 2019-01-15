

/*******************************************************************************
*** COLORS AND FORMATS *********************************************************
*******************************************************************************/

/* colors */

// colors that we could use ?
// let omniBubblesColors = [
//       '#b11f61', '#2a60aa', '#6f8695', '#a3b6bd', '#fde449', '#4d3c96',
//       '#252937', '#e57eb1', '#2e7d61', '#fbb116', '#8d7fba', '#ee4154'],
//     meriColors = ['#37acc3']
//   ;
// let allColors = omniBubblesColors.concat(meriColors);


let colorSeries1 = "#4d3c96",
    colorSeries2 = "#0fbbc1",
    colorSeries3 = "#dddddd",

    colorAudience11 = colorSeries1,
    colorAudience12 = colorSeries2,

    colorAudience21 = colorSeries1,
    colorAudience22 = colorSeries2;

DS_VIS_STORE.stateColors = [colorSeries1,colorSeries2]; //Set colors to be indexable to active audience in toggle
DS_VIS_STORE.interestsColors = [colorSeries1,colorSeries2]
DS_VIS_STORE.retailColors = [colorSeries1,colorSeries2]

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

function bar2SeriesChart(attrName, indexDs1, indexDs2) {
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
                      d3.max(indexDs2, function(d) { return d.target_pct; })
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
          .attr("width", width / (indexDs1.length * 2) - barPadding)
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
			     return xScale(i) + width / (indexDs1.length * 2) - barPadding;
			})
		  .attr("width", width / (indexDs1.length * 2) - barPadding)
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

	/* Add y labels to plot */
  let fontSize = "12px";
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
             + ( (width / (indexDs1.length * 2) - barPadding) / 2 );
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
             + ( (width / (indexDs1.length * 2) - barPadding) ) * 1.5 ;
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

    /* Attach index data and add the chart elems */
    /* 1st series */
    plot.selectAll("rect.series1")
        .data(indexDs1)
        .enter()
        .append("rect")
        .attr("class", "series1")
        .attr("x", function(d, i) { return i ? xScale(100 - d.target_pct) : 0})
        .attr("width", function(d) { return xScale(d.target_pct)})
        .attr("y", function(d) { return height/3.5 })
        .attr("height", function(d) { return height/8 ; })
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
        .attr("y", height/3.5 + 10 + height/8)
        .attr("height", function(d) { return height/8 ; })
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
        /* Set x position to the left edge of each bar plus half the bar width */
        .attr("x",  function(d, i) { return i ? xScale(100 ) - 20 : 14})
        .attr("y", function(d) { return height/3.5 + 3 + (height/16)})
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
        .attr("y", function(d) { return height/3.5 + 13 + height/8 + (height/16)})
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
        .attr("y", function(d) { return height/3.5 - 30 + (height/16)})
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
        .attr("transform", "translate(" + (margin.left) + "," + (height/3.5 + 60 + height/4) + ")")
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

  /* Add horizontal grid lines */
  // function make_y_gridlines() {
  //     return d3.axisLeft(yScale)
  //         .ticks(5)
  // }

  svg.append("g")
      .attr("class", "ds-grid")
      .attr("transform", "translate(" + (margin.left - 1) + "," + (margin.top - 1) + ")")
      // .call(make_y_gridlines()
      //     .tickSize(-width)
      //     .tickFormat("")
      //)

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
  //    .attr("font-size", "8px")
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
//      .attr("font-size", "8px")
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
            //   return (i * (width / indexDs1.length)) + ((width / indexDs1.length - barPadding) / 2);
            return xScale(i) + (width / indexDs1.length - barPadding)/2
                                  + ((width / 2 - barPadding) / 2);
         })
         .attr("y", 15)
         .attr("class", "xAxis");

  /* Add a y-axis */
  // let axis = d3.axisLeft(yScale)
  //     .ticks(5)
  //     .tickFormat(function (d) { return d + "%" })
  //     .tickSize(0);
  //
  // svg.append("g")
  //     .attr("transform", "translate(" + (margin.left - 1) + "," + (margin.top - 1) + ")")
  //     .attr("class", "axis")
  //     .call(axis);
  //
  // /* Remove vertical and extra horizontal gridlines */
  // svg.selectAll(".domain").remove()


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
    // let tipX = d3.mouse(this)[0] + 70;//d3.event.clientX - bound.x + 30;
    // let tipY = d3.mouse(this)[1] + 20;//d3.event.clientY - bound.y - 20;
    // if (width - tipX < 50) {
    //     tipX = d3.mouse(this)[0] - 60;//d3.event.clientX - bound.x - 100;
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
*** NUMBER CHART ***************************************************************
*******************************************************************************/
function numberChart(attrName, indexDs1, indexDs2) {
      let innerWidth = 360;

      let basics = barChartSetup(innerWidth);
      let margin = basics.margin,
          width = basics.width,
          height = basics.height,
          barPadding = basics.barPadding * 100;

      $("#"+attrName+"Chart").html(
        "<div class='ds-number-value' style='color: " + colorSeries1 + "'>" + indexDs1[0].target_pct + "% "
            + "<br/>"
            + indexDs1[0].attrib_value
            + "<br/>"
            + indexDs1[0].index + "</div>"
            + "<div class='ds-number-value' id='dsAud2' style='color: " + colorSeries2 + "'>" + indexDs2[0].target_pct + "% "
                + "<br/>"
                + indexDs2[0].attrib_value
                + "<br/>"
                + indexDs2[0].index + "</div>"
      )


      // svg.append("g")
      //     .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
      //     .append("div")
      //     .html("test")




}


/*******************************************************************************
*** 2-SERIES HORIZONTAL BAR CHART **********************************************
*******************************************************************************/
function hBar2SeriesChart(attrName, indexDs1, indexDs2) {

  indexDs2 = indexDs1[1];
  indexDs1 = indexDs1[0];

  let localColor1 = DS_VIS_STORE[attrName+"Colors"][0],
      localColor2 = DS_VIS_STORE[attrName+"Colors"][1];

  let innerWidth = 630;

  let basics = barChartSetup(innerWidth);
  let margin = basics.margin,
    width = basics.width,
    height = basics.height,
  		barPadding = basics.barPadding * 2;

    margin.left = 0;

  let firstDatasetBarChart = indexDs1;
  let maxAttrLength = width / 2.25;

	let yScale = d3.scaleLinear()
                 .domain([0, indexDs1.length])
					       .range([0, height]);

	// let xScale = d3.scaleLinear()
	// 	             .domain([0, d3.max(firstDatasetBarChart, function(d) { return d.target_pct; })])
	// 	             .range([0, width-maxAttrLength]);

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

  let barHeight = height / ( indexDs1.length * 2 ) - barPadding;
  /* Attach index data and add the chart elems */
  /* 1st series */
	plot.selectAll("rect.series1")
      .data(indexDs1)
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
        .data(indexDs2)
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



  /* Will set x position and color dependent on size of bar */
  function textInside(d) { return xScale(d.target_pct) > 30};


	/* Add y labels to plot */
  /* Series 1 */
	plot.selectAll("text.series1")
	    .data(indexDs1)
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
	    //.attr("class", "xAxis")
	    .attr("font-family", "sans-serif")
	    .attr("font-size", "11px")
	    .attr("fill", function(d) { return textInside(d) ? "white" : "#505050" })
      .on("mouseover", mouseover)
      .on("mouseout", mouseout)
      .on("mousemove", mouseover);

  /* Series 2 */
  plot.selectAll("text.series2")
      .data(indexDs2)
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
		     .data(indexDs1)
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
				       return (i * (height / indexDs1.length))
                    + ((height / indexDs1.length - barPadding) / 2)
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

  addCompareToggle(attrName);

    /* Toggle Comparison Charts on click */
    $("#"+attrName+"Chart .ds-toggle-button .ds-toggle-main").unbind().click(function() {
          if (attrName === 'state') {
              toggleFromStore(DS_VIS_STORE, 'stateActive')
              toggleFromStore(DS_VIS_STORE, 'stateColors')
          } else if (attrName === 'interests') {
              toggleFromStore(DS_VIS_STORE, 'interestsActive')//store.activeInterests = (store.activeInterests === 1) ? 2 : 1;
              toggleFromStore(DS_VIS_STORE, 'interestsColors')
          } else {
              toggleFromStore(DS_VIS_STORE, 'retailActive')//store.activeRetail = (store.activeRetail === 1) ? 2 : 1;
              toggleFromStore(DS_VIS_STORE, 'retailColors')
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
      changeToggleColor(attrName, DS_VIS_STORE[attrName+"Colors"][0]);
      toggleComparisonCharts(attrName);
    });

      function toggleComparisonCharts(attrName) {

        let indexCats = makeIndexCats();
        let toggleTo;
        let target, compare;

        if (DS_VIS_STORE["activeFilter"] != null) {
          let filteredData1 = [];
          let filteredIds1 = filterAttr(targetDemog, DS_VIS_STORE["activeFilter"][0], DS_VIS_STORE["activeFilter"][1]).map(function(d) { return d.temp_id; });

          let filteredData2 = [];
          let filteredIds2 = filterAttr(targetDemog2, DS_VIS_STORE["activeFilter"][0], DS_VIS_STORE["activeFilter"][1]).map(function(d) { return d.temp_id; });

          if (attrName == "interests"){
            //filteredData1 = targetInterests.filter(function(d) { return filteredIds1.includes(d["temp_id"]); });
            orderedTargetFilter(targetInterests, filteredIds1, filteredData1);
            attrIndex1 = indexInterestsRetail(attrName, filteredData1, randomInterests);

            //filteredData2 = targetInterests2.filter(function(d) { return filteredIds2.includes(d["temp_id"]); });
            orderedTargetFilter(targetInterests2, filteredIds2, filteredData2);
            attrIndex2 = indexInterestsRetail(attrName, filteredData2, randomInterests);
            toggleTo = (DS_VIS_STORE["interestsActive"][0] === 1) ? 1 : 2;

          } else if (attrName == "retail"){
            //filteredData1 = targetRetail.filter(function(d) { return filteredIds1.includes(d["temp_id"]); });
            orderedTargetFilter(targetRetail, filteredIds1, filteredData1);
            attrIndex1 = indexInterestsRetail(attrName, filteredData1, randomRetail);

            //filteredData2 = targetRetail2.filter(function(d) { return filteredIds2.includes(d["temp_id"]); });
            orderedTargetFilter(targetRetail2, filteredIds2, filteredData2);
            attrIndex2 = indexInterestsRetail(attrName, filteredData2, randomRetail);
            toggleTo = (DS_VIS_STORE["retailActive"][0] === 1) ? 1 : 2;

          }

            attrIndexTop1 = indexInterestsRetailTop5(attrIndex1,attrIndex2);
            attrIndexTop2 = indexInterestsRetailTop5(attrIndex2,attrIndex1);
          if (attrName == "state") {
            let filteredData1 = filterAttr(targetDemog, DS_VIS_STORE["activeFilter"][0], DS_VIS_STORE["activeFilter"][1]);
            let filteredData2 = filterAttr(targetDemog2, DS_VIS_STORE["activeFilter"][0], DS_VIS_STORE["activeFilter"][1]);
            attrIndex1 = indexAttr(attrName,
                                  indexCats[attrName],
                                  filteredData1,
                                  randomDemog);
            attrIndex2 = indexAttr(attrName,
                                  indexCats[attrName],
                                  filteredData2,
                                  randomDemog);

                attrIndexTop1 = indexStatesTop5(attrIndex1, attrIndex2);
                attrIndexTop2 = indexStatesTop5(attrIndex2, attrIndex1);
            toggleTo = (DS_VIS_STORE["stateActive"][0] === 1) ? 1 : 2;

          }


        } else if (attrName != "state") {
            if (attrName == "interests"){
              attrIndex1 = indexInterestsRetail(attrName, targetInterests, randomInterests);
              attrIndex2 = indexInterestsRetail(attrName, targetInterests2, randomInterests);
              toggleTo = (DS_VIS_STORE["interestsActive"][0] === 1) ? 1 : 2;
            } else if (attrName == "retail"){
              attrIndex1 = indexInterestsRetail(attrName, targetRetail, randomRetail);
              attrIndex2 = indexInterestsRetail(attrName, targetRetail2, randomRetail);
              toggleTo = (DS_VIS_STORE["retailActive"][0] === 1) ? 1 : 2;
            }
            attrIndexTop1 = indexInterestsRetailTop5(attrIndex1,attrIndex2);
            attrIndexTop2 = indexInterestsRetailTop5(attrIndex2,attrIndex1);
        } else if (attrName == "state") {
          attrIndex1 = indexAttr(attrName,
                                indexCats[attrName],
                                targetDemog,
                                randomDemog);
          attrIndex2 = indexAttr(attrName,
                                indexCats[attrName],
                                targetDemog2,
                                randomDemog);
          attrIndexTop1 = indexStatesTop5(attrIndex1, attrIndex2);
          attrIndexTop2 = indexStatesTop5(attrIndex2, attrIndex1);
          toggleTo = (DS_VIS_STORE["stateActive"][0] === 1) ? 1 : 2;

        }

        target = (toggleTo === 1) ? attrIndexTop1[0] : attrIndexTop2[0];

        compare = (toggleTo === 1) ? attrIndexTop1[1] : attrIndexTop2[1];

        color1 = DS_VIS_STORE[attrName+"Colors"][0];
        color2 = DS_VIS_STORE[attrName+"Colors"][1];

        plot = d3.select("#"+attrName+"Chart");

        addCompHbar(plot, "series1", target, maxAttrLength, barHeight, xScale, yScale, color1);
        addCompHbar(plot, "series2", compare, maxAttrLength, barHeight, xScale, yScale, color2);
        addCompHbarText(plot, "series1", target, barHeight, barPadding, maxAttrLength);
        addCompHbarText(plot, "series2", compare, barHeight, barPadding, maxAttrLength);

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
               .data(target)
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
               .attr("x", width * 0.125);
    };

  function mouseover(d) {
    // let ttipsvg = d3.select("#"+attrName+"Chart").node()
    // let bound = ttipsvg.getBoundingClientRect();

    // let tipX = d3.event.clientX - bound.x + 30;
    // let tipY = d3.event.clientY - bound.y - 60;
    // if (width - tipX < 100) {
    //   tipX = d3.event.clientX - bound.x - 100;
    // }
    // let tipX = d3.mouse(this)[0] + 30;//d3.event.clientX - bound.x + 30;
    // let tipY = d3.mouse(this)[1] - 20;//d3.event.clientY - bound.y - 20;
    // if (width - tipX < 50) {
    //     tipX = d3.mouse(this)[0] - 20;//d3.event.clientX - bound.x - 100;
    // }
    let e = window.event;
    var x = e.clientX,
        y = e.clientY;

    let tipY = (y - 80) + 'px';
    let tipX = (x) + 'px';
    if  (window.innerWidth - x < 200) {
      tipX = (x - 130) + 'px';
    }
    // let e = window.event;
    // var x = e.clientX,
    //     y = e.clientY;
    //
    // let tipY = (y - 80) + 'px';
    // let tipX = (x) + 'px';

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
      width: 6,
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
      width: 8,
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
    .append("<div class='ds-stats'><div class='ds-stat-1'>"
            + prefix + stat1 + suffix
            + "</div><div class='ds-stat-2'>"
            + stat2 + suffix
            + "</div></div>");

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

  let threeString = (targetAud3 != null) ? (" VS <span class= 'ds-aud-title-3'>" + targetAud3.name + "</span>") : '';
  // add titles
  $( ".ds-audience-title" )
    .append("<h1><span class= 'ds-aud-title-1'>"
      + targetAud1.name
      + "</span> VS <span class= 'ds-aud-title-2'>"
      + targetAud2.name + "</span>"
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
  //let stateIndexTop1 = indexStatesTop5(stateIndex1);

  let interestsIndex1 = indexInterestsRetail("interests", targetInterests, randomInterests);
  // let interestsIndexTop1 = indexInterestsRetailTop5(interestsIndex1);
  let retailIndex1 = indexInterestsRetail("retail", targetRetail, randomRetail);
  // let retailIndexTop1 = indexInterestsRetailTop5(retailIndex1);

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
  //let stateIndex2 = indexAttr("state", indexCats.state, targetDemog2, randomDemog);
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
    setTimeout(function() {$("#"+mapping[d[0]]+"Chart").css("border", "none")}, 3000);
  });

  bar2SeriesChart("age", ageIndex1, ageIndex2);
  add2SeriesStat("age", ageMedianCat1, ageMedianCat2, prefix = "<span style='color: #000;'><strong>Median: </strong></span>", suffix = " years");
  bar2SeriesChart("ethnicity", ethnicityIndex1, ethnicityIndex2);
  bar2SeriesChart("children", childrenIndex1, childrenIndex2);
  add2SeriesStat("children", childrenNonZeroPct1, childrenNonZeroPct2, prefix = "<span style='color: #000;'><strong>Child present: </strong></span>", suffix = "%");
  bar2SeriesChart("education", educationIndex1, educationIndex2);
  bar2SeriesChart("income", incomeIndex1, incomeIndex2);
  add2SeriesStat("income", incomeMedianCat1, incomeMedianCat2, prefix = "<span style='color: #000;'><strong>Median: </strong></span>");
  //bar2SeriesChart("gender", genderIndex1, genderIndex2);
  //stackedBar2SeriesChart("gender", audName1, genderIndex1, audName2, genderIndex2);
  hBarParallelChart("gender", audName1, genderIndex1, audName2, genderIndex2);
  //numberChart("gender", genderIndex1, genderIndex2);
  //stackedBar2SeriesChart("marital", audName1, maritalIndex1, audName2, maritalIndex2);
  hBarParallelChart("marital", audName1, maritalIndex1, audName2, maritalIndex2);
  (DS_VIS_STORE["stateActive"][0] === 1) ? hBar2SeriesChart("state", stateIndexTop1, stateIndexTop2) : hBar2SeriesChart("state", stateIndexTop2, stateIndexTop1);
  (DS_VIS_STORE["interestsActive"][0] === 1) ? hBar2SeriesChart("interests", interestsIndexTop1, interestsIndexTop2) : hBar2SeriesChart("interests", interestsIndexTop2, interestsIndexTop1);
  (DS_VIS_STORE["retailActive"][0] === 1) ? hBar2SeriesChart("retail", retailIndexTop1, retailIndexTop2) : hBar2SeriesChart("retail", retailIndexTop2, retailIndexTop1);

  $( ".tile" ).removeClass("selected-tile");

  mikeJ2SeriesChart('interests', interestsIndex1, interestsIndex2);
  mikeJ2SeriesChart('retail', retailIndex1, retailIndex2);

}


function drawComparisonChartsHbar(hbarAttr) {
  d3.select("#"+hbarAttr+"Chart svg").remove();

  let indexCats = makeIndexCats();

  let audName1 = targetAud.name;
  let ageIndex1 = indexAttr("age", indexCats.age, targetDemog, randomDemog);

  let stateIndex1 = indexAttr("state", indexCats.state, targetDemog, randomDemog);
  //let stateIndexTop1 = indexStatesTop5(stateIndex1);

  let interestsIndex1 = indexInterestsRetail("interests", targetInterests, randomInterests);
  // let interestsIndexTop1 = indexInterestsRetailTop5(interestsIndex1);
  let retailIndex1 = indexInterestsRetail("retail", targetRetail, randomRetail);
  // let retailIndexTop1 = indexInterestsRetailTop5(retailIndex1);

  let audName2 = targetAud2.name;

  let incomeIndex2 = indexAttr("income", indexCats.income, targetDemog2, randomDemog);
  let incomeMedianCat2 = getMedianCategory(incomeIndex2);
  //let stateIndex2 = indexAttr("state", indexCats.state, targetDemog2, randomDemog);
  let stateIndex2 = indexAttr("state", indexCats.state, targetDemog2, randomDemog);
  let stateIndexTop1 = indexStatesTop5(stateIndex1, stateIndex2);
  let stateIndexTop2 = indexStatesTop5(stateIndex2,stateIndex1);
  let interestsIndex2 = indexInterestsRetail("interests", targetInterests2, randomInterests);
  let interestsIndexTop1 = indexInterestsRetailTop5(interestsIndex1,interestsIndex2);
  let interestsIndexTop2 = indexInterestsRetailTop5(interestsIndex2,interestsIndex1);
  let retailIndex2 = indexInterestsRetail("retail", targetRetail2, randomRetail);
  let retailIndexTop1 = indexInterestsRetailTop5(retailIndex1, retailIndex2);
  let retailIndexTop2 = indexInterestsRetailTop5(retailIndex2, retailIndex1);


  if (hbarAttr === "state") {
    (DS_VIS_STORE["stateActive"][0] === 1) ? hBar2SeriesChart("state", stateIndexTop1, stateIndexTop2) : hBar2SeriesChart("state", stateIndexTop2, stateIndexTop1);
  } else if (hbarAttr === "interests") {
    (DS_VIS_STORE["interestsActive"][0] === 1) ? hBar2SeriesChart("interests", interestsIndexTop1, interestsIndexTop2) : hBar2SeriesChart("interests", interestsIndexTop2, interestsIndexTop1);
  } else if (hbarAttr === "retail") {
    (DS_VIS_STORE["retailActive"][0] === 1) ? hBar2SeriesChart("retail", retailIndexTop1, retailIndexTop2) : hBar2SeriesChart("retail", retailIndexTop2, retailIndexTop1);
  }
}


/*******************************************************************************
*** UPDATE ALL CHARTS **********************************************************
*******************************************************************************/

/* updates bar charts when a value element is clicked on a chart */
function updateComparisonCharts(attrName, attrValue) {
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
              // target = DS_VIS_STORE["interestsActive"][0] === 1 ? targetInterests : targetInterests2;
              // compare = DS_VIS_STORE["interestsActive"][1] === 1 ? targetInterests : targetInterests2;
              //filteredData1 = targetInterests.filter(function(d) { return filteredIds1.includes(d["temp_id"]); });
              orderedTargetFilter(targetInterests, filteredIds1, filteredData1);
              attrIndex1 = indexInterestsRetail(demogAttributeListName, filteredData1, randomInterests);

              //filteredData2 = targetInterests2.filter(function(d) { return filteredIds2.includes(d["temp_id"]); });
              orderedTargetFilter(targetInterests2, filteredIds2, filteredData2);
              attrIndex2 = indexInterestsRetail(demogAttributeListName, filteredData2, randomInterests);
            } else if (demogAttributeListName == "retail"){
              //filteredData1 = targetRetail.filter(function(d) { return filteredIds1.includes(d["temp_id"]); });
              orderedTargetFilter(targetRetail, filteredIds1, filteredData1);
              attrIndex1 = indexInterestsRetail(demogAttributeListName, filteredData1, randomRetail);

              //filteredData2 = targetRetail2.filter(function(d) { return filteredIds2.includes(d["temp_id"]); });
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
            add2SeriesStat("age", ageMedianCat1, ageMedianCat2, prefix = "<span style='color: #000;'><strong>Median: </strong></span>", suffix = " years");
        } else if (demogAttributeListName == "children") {
            let childrenNonZeroPct1 = getNonZeroPct(attrIndex1);
            let childrenNonZeroPct2 = getNonZeroPct(attrIndex2);
            add2SeriesStat("children", childrenNonZeroPct1, childrenNonZeroPct2, prefix = "<span style='color: #000;'><strong>Child present: </strong></span>", suffix = "%");
        } else if (demogAttributeListName == "income") {
            let incomeMedianCat1 = getMedianCategory(attrIndex1);
            let incomeMedianCat2 = getMedianCategory(attrIndex2);
            add2SeriesStat("income", incomeMedianCat1, incomeMedianCat2, prefix = "<span style='color: #000;'><strong>Median: </strong></span>");
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
                              d3.max(attrIndex2, function(d) { return d.target_pct; })
                            )
                         ])
                         .range([height,0]);

          let svg = d3.select("#"+demogAttributeListName+"Chart svg");

          let plot = d3.select("#"+demogAttributeListName+"ChartPlot")
                       //.datum(attrIndex1)
                       ;

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
              .attr("width", width / (attrIndex1.length * 2) - barPadding)
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
                   return xScale(i) + width / (attrIndex2.length * 2) - barPadding;
        			})
              .attr("width", width / (attrIndex2.length * 2) - barPadding)
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
                   + ( (width / (attrIndex1.length * 2) - barPadding) / 2 );
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
                       + ( (width / (attrIndex1.length * 2) - barPadding) ) * 1.5 ;
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

      } else if ( sBarChartAttributesList.includes(demogAttributeListName) ) {
          d3.select("#"+demogAttributeListName+"Chart svg").remove();
          //pieChart(demogAttributeListName, attrIndex);
          // stackedBar2SeriesChart(demogAttributeListName,
          //   targetAud.name, attrIndex1,
          //   targetAud2.name, attrIndex2);
          hBarParallelChart(demogAttributeListName,
            targetAud.name, attrIndex1,
            targetAud2.name, attrIndex2);

      } else if ( hBarChartAttributesList.includes(demogAttributeListName) ) {
          d3.select("#"+demogAttributeListName+"Chart svg").remove();
          //hBarChart(demogAttributeListName, attrIndexTop);
          target = DS_VIS_STORE[demogAttributeListName+"Active"][0] === 1 ? attrIndexTop1 : attrIndexTop2;
          compare = DS_VIS_STORE[demogAttributeListName+"Active"][0] === 1 ? attrIndexTop2 : attrIndexTop1;
          hBar2SeriesChart(demogAttributeListName, target, compare);

      }

  });


  // update the wave chart
  wave2SeriesChart(indexes1, indexes2);

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


$(function(){
  $('.ds-toggle-button').on('click', function(event){
    //event.preventDefault();
    $(this).toggleClass('active');
  });
});

function changeToggleColor(attrName, color) {
    $("#"+attrName+"Chart .ds-toggle-after").css("background-color", color)
}

function addCompareToggle(attrName) {
  $("#"+attrName+"Chart .ds-toggle-button").css("display", "inline-block");
  $("#"+attrName+"Chart .ds-hbar-status").text(function() {
      //let cat = attrName.charAt(0).toUpperCase() + attrName.slice(1);
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
