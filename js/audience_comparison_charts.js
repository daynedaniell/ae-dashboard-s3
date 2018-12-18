
/*******************************************************************************
*** COLORS AND FORMATS *********************************************************
*******************************************************************************/

/* colors */

// colors that we could use ?
let omniBubblesColors = [
      '#b11f61', '#2a60aa', '#6f8695', '#a3b6bd', '#fde449', '#4d3c96',
      '#252937', '#e57eb1', '#2e7d61', '#fbb116', '#8d7fba', '#ee4154'],
    meriColors = ['#37acc3']
  ;
let allColors = omniBubblesColors.concat(meriColors);

// testing out colors in console
console.log("Omni colors test: ");
allColors.forEach(function(color, i){
  console.log('%c this is color number ' + i , 'background: '+ color +'; color: #333');
});

// greys
// omniousColors[2],
// colorSeries2 = omniousColors[3],

let colorSeries1 = allColors[5],
    colorSeries2 = allColors[7],

    colorAudience11 = colorSeries1,
    colorAudience12 = colorSeries2,

    colorAudience21 = colorSeries1,
    colorAudience22 = colorSeries2;


/*******************************************************************************
*** 2-SERIES BAR CHART *********************************************************
*******************************************************************************/

function bar2SeriesChart(attrName, indexDs1, indexDs2) {
  let innerWidth = 360;
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
              .attr("id", attrName+"ChartPlot");

	let plot = svg.append("g")
		            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

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
			     return yScale(d.target_pct) + 14;
	    })
	  //  .attr("class", "yAxis")
	    .attr("font-family", "sans-serif")
	    .attr("font-size", fontSize)
	    .attr("fill", "white");

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
           return yScale(d.target_pct) + 14;
      })
  //    .attr("class", "yAxis")
      .attr("font-family", "sans-serif")
      .attr("font-size", fontSize)
      .attr("fill", "white");


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
      .tickSizeOuter(0);

  svg.append("g")
      .attr("transform", "translate(" + (margin.left - 1) + "," + (margin.top - 1) + ")")
      .attr("class", "axis")
      .call(axis);

  function up(d, i) {
	   /* update all charts when user selects a single bar in this chart */
     /* if clicking on already selected item, then reset the charts */
     isSelected = d3.select(".selected-tile #"+attrName+"Chart rect[attrib-value='"+d.attrib_value+"'][selected='yes']")._groups[0][0];
     if (isSelected){
       drawComparisonCharts();
     } else {
       updateComparisonCharts(attrName, d.attrib_value);
       updateAxis(d);
     }
	}

  function mouseover(d) {
    tooltip.transition()
        .duration(200)
        .style("opacity", .9);
    tooltip.html(d.attrib_value + "<br/>" + "Target Pct: " + d.target_pct + "%<br/>"  + "Index: " + d.index)
        .style('left', `${(d3.event.pageX + 5)}px`)
        .style('top', `${(d3.event.pageY - 50)}px`);
  }

  function mouseup(d) {
    tooltip.transition(300).style('opacity', 0);
  }
}


/*******************************************************************************
*** 2-SERIES STACKED BAR CHART *************************************************
*******************************************************************************/
function stackedBar2SeriesChart(attrName, audName1, indexDs1, audName2, indexDs2) {
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
                 .domain([0, 100])
                 .range([height, 0]);

  /* Create SVG element */
  let svg = d3.select("#"+attrName+"Chart")
              .append("svg")
              .attr("width", width + margin.left + margin.right)
              .attr("height", height + margin.top + margin.bottom)
              .attr("id", attrName+"ChartPlot");

  let plot = svg.append("g")
                .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  /* Attach index data and add the chart elems */
  /* 1st series */
  plot.selectAll("rect.series1")
      .data(indexDs1)
      .enter()
      .append("rect")
      .attr("class", "series1")
      .attr("x", xScale(0) + (width / indexDs1.length - barPadding)/2 )
      .attr("width", width / indexDs1.length - barPadding)
      .attr("y", function(d, i) { return i ? 0 : yScale(d.target_pct); })
      .attr("height", function(d) { return height - yScale(d.target_pct); })
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
      .data(indexDs2)
      .enter()
      .append("rect")
      .attr("class", "series2")
      .attr("x", xScale(1) + (width / indexDs1.length - barPadding)/2 )
      .attr("width", width / indexDs1.length - barPadding)
      .attr("y", function(d, i) { return i ? 0 : yScale(d.target_pct); })
      .attr("height", function(d) { return height - yScale(d.target_pct); })
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
      .data(indexDs1)
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
           return (1 - i) * yScale(d.target_pct) + 14;
      })
      .attr("class", "yAxis")
      .attr("font-family", "sans-serif")
  //    .attr("font-size", "8px")
      .attr("fill", "white");

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
      .attr("x", xScale(1) + (width / indexDs1.length - barPadding)/2
                           + ((width / 2 - barPadding) / 2) )
      .attr("y", function(d, i) {
           return (1 - i) * yScale(d.target_pct) + 14;
      })
      .attr("class", "yAxis")
      .attr("font-family", "sans-serif")
//      .attr("font-size", "8px")
      .attr("fill", "white");


  /* Add x labels to chart */
  let xLabels = svg.append("g")
                   .attr("transform", "translate(" + margin.left + "," + (margin.top + height)  + ")");

  xLabels.selectAll("text.xAxis")
         .data([{"series_name": audName1}, {"series_name": audName2}])
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
  let axis = d3.axisLeft(yScale)
      .ticks(5)
      .tickFormat(function (d) { return d + "%" })
      .tickSizeOuter(0);

  svg.append("g")
      .attr("transform", "translate(" + (margin.left - 1) + "," + (margin.top - 1) + ")")
      .attr("class", "axis")
      .call(axis);

  function up(d, i) {
     /* update all charts when user selects a single bar in this chart */
     /* if clicking on already selected item, then reset the charts */
     isSelected = d3.select(".selected-tile #"+attrName+"Chart rect[attrib-value='"+d.attrib_value+"'][selected='yes']")._groups[0][0];
     if (isSelected){
       drawComparisonCharts();
     } else {
       updateComparisonCharts(attrName, d.attrib_value);
       updateAxis(d);
     }
  }

  function mouseover(d) {
    tooltip.transition()
        .duration(200)
        .style("opacity", .9);
    tooltip.html(d.attrib_value + "<br/>" + "Target Pct: " + d.target_pct + "%<br/>"  + "Index: " + d.index)
        .style('left', `${(d3.event.pageX + 5)}px`)
        .style('top', `${(d3.event.pageY - 50)}px`);
  }

  function mouseup(d) {
    tooltip.transition(300).style('opacity', 0);
  }
}



/*******************************************************************************
*** 2-SERIES HORIZONTAL BAR CHART **********************************************
*******************************************************************************/
function hBar2SeriesChart(attrName, indexDs1, indexDs2) {

  let innerWidth = 610;

	let basics = barChartSetup(innerWidth);
	let margin = basics.margin,
      width = basics.width,
      height = basics.height,
  		barPadding = basics.barPadding * 2;

      margin.left = 0;

  let firstDatasetBarChart = indexDs1;
  let maxAttrLength = width / 2;

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
		          .attr("width", width + margin.left + margin.right)
              .attr("height", height + margin.top + margin.bottom)
              .attr("id", attrName+"ChartPlot");

	let plot = svg.append("g")
		            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

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
          return colorSeries1;
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
            return colorSeries2;
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
	    .attr("class", "xAxis")
	    .attr("font-family", "sans-serif")
	    .attr("font-size", "11px")
	    .attr("fill", function(d) { return textInside(d) ? "white" : "#505050" });

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
      .attr("class", "xAxis")
      .attr("font-family", "sans-serif")
      .attr("font-size", "11px")
      .attr("fill", function(d) { return textInside(d) ? "white" : "#505050" });



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
             return colorSeries1;
         })
		     .attr("text-anchor", "start")
			   /* Set y position to the top edge of each bar plus half the bar width */
				 .attr("y", function(d, i) {
   			     return (i * 2 * (barHeight + barPadding) + barHeight / 2 + barPadding);
				 })
		     .attr("x", width * 0.125)
		     .attr("class", "yAxis");

  /* Series 2 */
	yLabels.selectAll("text.yAxis.series2")
		     .data(indexDs2)
		     .enter()
		     .append("text")
         .attr("class", "series2")
		     .text(function(d) {
           let yLabel = d.attrib_value;
           if (d.attrib_value.length > 26) {
             yLabel = yLabel.slice(0, 26) + "...";
           }
           return yLabel;
         })
         .attr("fill", function(d) {
             return colorSeries2;
         })
		     .attr("text-anchor", "start")
			   /* Set y position to the top edge of each bar plus half the bar width */
				 .attr("y", function(d, i) {
              return (i * 2 * (barHeight + barPadding) + barHeight * 1.5 + barPadding);
				 })
		     .attr("x", width * 0.125)
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
   	     .attr("font-size", "44px")
		     .attr("text-anchor", "start")
			   /* Set y position to the top edge of each bar plus half the bar width */
				 .attr("y", function(d, i) {
				       return (i * (height / indexDs1.length))
                    + ((height / indexDs1.length - barPadding) / 2)
                    + 10;
				 })
		     .attr("x", 0)
		     .attr("class", "yAxis");


  function mouseover(d) {
    tooltip.transition()
        .duration(200)
        .style("opacity", .9);
    tooltip.html(d.attrib_value + "<br/>" + "<br/>" + "Category: " + d.category + "<br/>" + "Target Pct: " + d.target_pct + "%<br/>"  + "Index: " + d.index)
        .style('left', `${(d3.event.pageX + 5)}px`)
        .style('top', `${(d3.event.pageY - 50)}px`);
  }

  function mouseout() {
      tooltip.transition(300).style('opacity', 0);
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
      width: 8,
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
    height: height,
    width: width,
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
    }]
  };

  let traces = [...traces1, ...traces2];
  Plotly.newPlot("waveChart", traces, layout, {responsive: true});

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
    height: height,
    width: width,
    xaxis: {
      range: [ 80, 520 ],
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
  Plotly.newPlot(chartName, [trace1, trace2], layout, {responsive: true});
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
function add2AudienceTitles(targetAud1, targetAud2) {
  // remove existing titles, if any
  $( ".ds-audience-title h1" ).remove();

  // add titles
  $( ".ds-audience-title" )
    .append("<h1><span class= 'ds-aud-title-1'>"
      + targetAud1.name
      + "</span> VS <span class= 'ds-aud-title-2'>"
      + targetAud2.name
      + "</span></h1>");

  // add color codes
  $(".ds-audience-title .ds-aud-title-1").css("color", colorSeries1);
  $(".ds-audience-title .ds-aud-title-2").css("color", colorSeries2);
}


/*******************************************************************************
*** DRAW ALL COMPARISON CHARTS *************************************************
*******************************************************************************/
function drawComparisonCharts() {

  // add the audience titles
  add2AudienceTitles(targetAud, targetAud2);

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
  let stateIndexTop1 = indexStatesTop5(stateIndex1);
  let interestsIndex1 = indexInterestsRetail("interests", targetInterests, randomInterests);
  let interestsIndexTop1 = indexInterestsRetailTop5(interestsIndex1);
  let retailIndex1 = indexInterestsRetail("retail", targetRetail, randomRetail);
  let retailIndexTop1 = indexInterestsRetailTop5(retailIndex1);

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
  let stateIndexTop2 = indexStatesTop5(stateIndex2);
  let interestsIndex2 = indexInterestsRetail("interests", targetInterests2, randomInterests);
  let interestsIndexTop2 = indexInterestsRetailTop5(interestsIndex2);
  let retailIndex2 = indexInterestsRetail("retail", targetRetail2, randomRetail);
  let retailIndexTop2 = indexInterestsRetailTop5(retailIndex2);

  let indexes1 = {
    age: ageIndex1,
    gender: genderIndex1,
    ethnicity: ethnicityIndex1,
    marital: maritalIndex1,
    children: childrenIndex1,
    education: educationIndex1,
    income: incomeIndex1,
    state: stateIndex1,
    interests: interestsIndexTop1,
    retail: retailIndexTop1
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
    interests: interestsIndexTop2,
    retail: retailIndexTop2
  };

  wave2SeriesChart(indexes1, indexes2);

  bar2SeriesChart("age", ageIndex1, ageIndex2);
  add2SeriesStat("age", ageMedianCat1, ageMedianCat2, prefix = "<strong>Median: </strong>", suffix = " years");
  bar2SeriesChart("ethnicity", ethnicityIndex1, ethnicityIndex2);
  bar2SeriesChart("children", childrenIndex1, childrenIndex2);
  add2SeriesStat("children", childrenNonZeroPct1, childrenNonZeroPct2, prefix = "<strong>Child present: </strong>", suffix = "%");
  bar2SeriesChart("education", educationIndex1, educationIndex2);
  bar2SeriesChart("income", incomeIndex1, incomeIndex2);
  add2SeriesStat("income", incomeMedianCat1, incomeMedianCat2, prefix = "<strong>Median: </strong>");
  stackedBar2SeriesChart("gender", audName1, genderIndex1, audName2, genderIndex2);
  stackedBar2SeriesChart("marital", audName1, maritalIndex1, audName2, maritalIndex2);
  hBar2SeriesChart("state", stateIndexTop1, stateIndexTop2);
  hBar2SeriesChart("interests", interestsIndexTop1, interestsIndexTop2);
  hBar2SeriesChart("retail", retailIndexTop1, retailIndexTop2);

  $( ".tile" ).removeClass("selected-tile");

  mikeJ2SeriesChart('interests', interestsIndex1, interestsIndex2);
  mikeJ2SeriesChart('retail', retailIndex1, retailIndex2);
}


/*******************************************************************************
*** UPDATE ALL CHARTS **********************************************************
*******************************************************************************/

/* updates bar charts when a value element is clicked on a chart */
function updateComparisonCharts(attrName, attrValue) {
//  console.log(attrName);
//  console.log(attrValue);
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
              filteredData1 = targetInterests.filter(function(d) { return filteredIds1.includes(d["temp_id"]); });
              attrIndex1 = indexInterestsRetail(demogAttributeListName, filteredData1, randomInterests);

              filteredData2 = targetInterests2.filter(function(d) { return filteredIds2.includes(d["temp_id"]); });
              attrIndex2 = indexInterestsRetail(demogAttributeListName, filteredData2, randomInterests);
            } else if (demogAttributeListName == "retail"){
              filteredData1 = targetRetail.filter(function(d) { return filteredIds1.includes(d["temp_id"]); });
              attrIndex1 = indexInterestsRetail(demogAttributeListName, filteredData1, randomRetail);

              filteredData2 = targetRetail2.filter(function(d) { return filteredIds2.includes(d["temp_id"]); });
              attrIndex2 = indexInterestsRetail(demogAttributeListName, filteredData2, randomRetail);
            }
            attrIndexTop1 = indexInterestsRetailTop5(attrIndex1);
            attrIndexTop2 = indexInterestsRetailTop5(attrIndex2);
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
                attrIndexTop1 = indexStatesTop5(attrIndex1);
                attrIndexTop2 = indexStatesTop5(attrIndex2);
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
            attrIndexTop1 = indexInterestsRetailTop5(attrIndex1);
            attrIndexTop2 = indexInterestsRetailTop5(attrIndex2);
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
                attrIndexTop1 = indexStatesTop5(attrIndex1);
                attrIndexTop2 = indexStatesTop5(attrIndex2);
            }
          }
      }


      // update the wave chart data
      if ( hBarChartAttributesList.includes(demogAttributeListName) ) {
        indexes1[demogAttributeListName] = attrIndexTop1;
        indexes2[demogAttributeListName] = attrIndexTop2;
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
            add2SeriesStat("age", ageMedianCat1, ageMedianCat2, prefix = "<strong>Median: </strong>", suffix = " years");
        } else if (demogAttributeListName == "children") {
            let childrenNonZeroPct1 = getNonZeroPct(attrIndex1);
            let childrenNonZeroPct2 = getNonZeroPct(attrIndex2);
            add2SeriesStat("children", childrenNonZeroPct1, childrenNonZeroPct2, prefix = "<strong>Child present: </strong>", suffix = "%");
        } else if (demogAttributeListName == "income") {
            let incomeMedianCat1 = getMedianCategory(attrIndex1);
            let incomeMedianCat2 = getMedianCategory(attrIndex2);
            add2SeriesStat("income", incomeMedianCat1, incomeMedianCat2, prefix = "<strong>Median: </strong>");
        }
      }


      // update charts
      if ( barChartAttributesList.includes(demogAttributeListName) ) {
          // update bar chart
            let innerWidth = 360;
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

         let axis = d3.axisLeft(yScale)
             .ticks(5)
             .tickFormat(function (d) { return d + "%" })
             .tickSizeOuter(0);

         let t = d3.transition()
               .duration(500)

         svg.select(".axis")
               .transition(t)
               .call(axis)

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
                console.log(height);
                return height - yScale(d.target_pct);
              })
              .attr("cursor", "pointer")
              .attr("attrib-value", function(d) { return d.attrib_value; })    /* updating the Acxiom attrib value on the element */
              .attr("target-pct", function(d) { return d.target_pct; })
              .attr("index", function(d) { return d.index; })
              .attr("fill", colorSeries1);

          /* 2nd series */
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
                 return yScale(d.target_pct) + 14;
              })
              .text(function(d) {
               return formatAsInteger(d3.format("d")(d.index));
              })
              .attr("class", "yAxis")
              .attr("class", "series1")
              ;

          /* 2nd series */
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
                 return yScale(d.target_pct) + 14;
              })
              .text(function(d) {
               return formatAsInteger(d3.format("d")(d.index));
              })
              .attr("class", "yAxis")
              .attr("class", "series2");

      } else if ( sBarChartAttributesList.includes(demogAttributeListName) ) {
          d3.select("#"+demogAttributeListName+"Chart svg").remove();
          //pieChart(demogAttributeListName, attrIndex);
          stackedBar2SeriesChart(demogAttributeListName,
            targetAud.name, attrIndex1,
            targetAud2.name, attrIndex2);

      } else if ( hBarChartAttributesList.includes(demogAttributeListName) ) {
          d3.select("#"+demogAttributeListName+"Chart svg").remove();
          //hBarChart(demogAttributeListName, attrIndexTop);
          hBar2SeriesChart(demogAttributeListName, attrIndexTop1, attrIndexTop2);

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
