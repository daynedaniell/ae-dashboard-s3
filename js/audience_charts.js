/*******************************************************************************
*** STATE VARIABLE STORE *******************************************************
*******************************************************************************/
let colorSeries1 = "#4d3c96",
    colorSeries2 = "#0fbbc1",
    colorSeries3 = "#ff9999";

let DS_VIS_STORE = {
    activeFilter: null,
    stateActive: [1,2,3],
    interestsActive: [1,2,3],
    retailActive: [1,2,3],
    activeView: 1,
    activeTab: 'dashboard',
    scaleWeight: 1,
    seriesColors: [colorSeries1,colorSeries2,colorSeries3],
    dnaBarWidths: [4,3,2]
}

function resetCompareAuds() {
    DS_VIS_STORE.stateColors = [colorSeries1,colorSeries2,colorSeries3]; //Set colors to be indexable to active audience in toggle
    DS_VIS_STORE.interestsColors = [colorSeries1,colorSeries2,colorSeries3]
    DS_VIS_STORE.retailColors = [colorSeries1,colorSeries2,colorSeries3]
    DS_VIS_STORE.interestsActive = [1,2,3]
    DS_VIS_STORE.stateActive = [1,2,3]
    DS_VIS_STORE.retailActive = [1,2,3]
}

/*******************************************************************************
*** COLORS AND FORMATS *********************************************************
*******************************************************************************/

/* colors */
let colorOverIndex = '#ffb14e',
    colorUnderIndex = '#4880da',
    colorNeutralIndex1 = 'grey',
    colorNeutralIndex2 = 'rgb(192,192,192)',
    colorZeroIndex = 'rgba(53, 128, 224, 0.07)';


/* color-by-index functions */
function colorByIndexBar(index) {
    if (index >= 120) {
        return colorOverIndex;
    } else if (index > 80) {
        return colorNeutralIndex1;
    } else if (index == 0) {
        return colorZeroIndex;
    }
    return colorUnderIndex;
}
function colorByIndexPie(index, indexCats, attrValue) {
    if (index >= 120) {
        return colorOverIndex;
    } else if (index > 80) {
        if (indexCats.findIndex(x => x.attrib_value == attrValue) == 0) {
            return colorNeutralIndex1;
        } else {
            return colorNeutralIndex2;
        }
    }
    return colorUnderIndex;
}

/* formats */
let formatAsInteger = d3.format(",");

/* Wrap labels for name, index, and pct
  source: https://bl.ocks.org/mbostock/7555321 (with modifications) */
function wrap(text, width, sep = " ", type = "pie") {
    text.each(function() {
      var text = d3.select(this),
          words = text.text().split(sep).reverse(),
          word,
          line = [],
          lineNumber = 0,
          lineHeight = 1.1, // ems
          y = text.attr("y"),
          dy = parseFloat(text.attr("dy")),
          tspan = text.text(null).append("tspan").attr("x", 0).attr("y", y).attr("dy", dy + "em");
      /* Split horizontal bar text on last dash */
      if (type === "hbar") {
        words = words.map(function (word) { return word.trim() })

        let numWords = words.length
        let firstLine = words.slice(0, -1).join(" - ");
        let secondLine = (numWords > 1) ? "- " + words.slice(-1)[0] : words.slice(-1)[0];
        words = (numWords > 1) ? [secondLine, firstLine] : [secondLine];
      }


      let ct = 0;
      while (word = words.pop()) {
        line.push(word);
        tspan.text(line.join(" "));
        if (width == 1 || tspan.node().getComputedTextLength() > width) {
          line.pop();
          tspan.text(line.join(" "));
          line = [word];
          if (type === 'pie') {
            tspan = text.append("tspan").attr("x", 0).attr("y", y).attr("dy", lineHeight + dy + "em").text(word);
          } else {
            tspan = text.append("tspan").attr("x", 0).attr("y", y).attr("dy", ct > 0 ? ++lineNumber * lineHeight + dy + "em" : 0).attr("dx", ct > 0 ? 20 : 0).text(word);
          }
        }
        ct ++;
      }
    });
}

//d3.select(window).on('resize', console.log(window.innerWidth))




/*******************************************************************************
*** BAR CHART ******************************************************************
*******************************************************************************/
function barChartSetup(innerWidth=360) {
	let margin = {top: 30, right: 0, bottom: 20, left: 30};
	let width = innerWidth - margin.left - margin.right;
  let height = 360;
	let barPadding = 1;

	return {
		margin : margin,
		width : width,
		height : height,
		barPadding : barPadding
	};
}


function drawBarChart(attrName, indexArray, innerWidth=400) {

  // temp fix to remove any null elements from indexArray
  for( let i = indexArray.length; i--;){
      if ( indexArray[i] == null) {
        indexArray.pop();
      }
  }

  let numSeries = indexArray.length;

  let basics = barChartSetup(innerWidth);
  let margin = basics.margin,
      width = basics.width,
      height = basics.height,
      barPadding = basics.barPadding * 2;

  let barWidth = width / (indexArray[0].length * numSeries);

  let xScale = d3.scaleLinear()
                 .domain([0, indexArray[0].length])
                 .range([0, width]);

  let largest = 0;
  indexArray.forEach(function (aud) {
    thisMax = d3.max(aud, function(d) { return d.target_pct; });
    largest = Math.max(thisMax, largest);
  })
  let yScale = d3.scaleLinear()
                 .domain([0, largest])
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
    plot.selectAll("rect.series"+(series+1))
        .data(data)
          .enter()
          .append("rect")
        .attr("class", "series"+(series+1))
          .attr("x", function(d, i) {
              return xScale(i) + (barWidth * series - barPadding * series);
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

  function addBarText(data, series) {

      let fontSize = "12px";
      if (numSeries == 3) {
          fontSize = "9px";
      }

      plot.selectAll("text.series"+(series+1)+" yAxis")
          .data(data)
          .enter()
          .append("text")
          .attr("class", "series"+(series+1)+" yAxis")
          .text(function(d) {
           return formatAsInteger(d3.format("d")(d.index));
          })
          .attr("text-anchor", "middle")
          /* Set x position to the left edge of each bar plus half the bar width */
          .attr("x", function(d, i) {
              return xScale(i) + (barWidth * series - barPadding * series) + barWidth/2 - 1;
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

  indexArray.forEach(function (aud, i) {
      addBar(aud,i,DS_VIS_STORE.seriesColors[i]);
      addBarText(aud,i);
  })

  /* Add x labels to chart */
  let xLabels = svg.append("g")
                   .attr("transform", "translate(" + margin.left + "," + (margin.top + height)  + ")");

  xLabels.selectAll("text.xAxis")
         .data(indexArray[0])
         .enter()
         .append("text")
         .text(function(d) { return d.attrib_value;})
         .attr("text-anchor", "middle")
         /* Set x position to the left edge of each bar plus half the bar width */
         .attr("x", function(d, i) {
               return xScale(i) + (barWidth * numSeries)/2;
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
       } else {
          drawComparisonCharts(activeView=DS_VIS_STORE.activeView);
       }
       showActiveFilter(DS_VIS_STORE);
     } else {
       if (numSeries == 1) {
          updateCharts(attrName, d.attrib_value);
       } else  {
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
*** PIE CHART ******************************************************************
*******************************************************************************/

function pieChart(attrName, indexDs){
  let width = 360 * DS_VIS_STORE["scaleWeight"],
		  height = 360 * DS_VIS_STORE["scaleWeight"],
		  outerRadius = Math.min(width - 60, height - 60) / 2,
      innerRadius = outerRadius * .999,
      innerRadiusFinal = outerRadius * .5,
      innerRadiusFinal3 = outerRadius* .45,
      marginShift = {top: outerRadius + 30, left: outerRadius + 30}
      ;


	let vis = d3.select("#"+attrName+"Chart")
              .append("svg:svg")
              .attr("class", "ds-chart-base")
              .attr("id", attrName+"ChartPlot")
              .data([indexDs])          /* associate our data with the document */
              .attr("width", width)
              .attr("height", height)
              .append("svg:g")          /* make a group to hold our pie chart */
              .attr(
                "transform",
                "translate(" + marginShift.top + "," + marginShift.left + ")"
              ) /* move the center of the pie chart from 0, 0 to radius, radius */
              ;


  /* Create an arc generator, and configure its inner and outer radii */
  let arc = d3.arc() /* Generates path data for an arc */
              .outerRadius(outerRadius)
              .innerRadius(innerRadius);

  /* Create configured arc generators for animation */
  let arcFinal = d3.arc()
                   .innerRadius(innerRadiusFinal)
                   .outerRadius(outerRadius);
  let arcFinal3 = d3.arc()
                    .innerRadius(innerRadiusFinal3)
                    .outerRadius(outerRadius);

  /* Create arc data from a list of values */
  let pie = d3.pie()
              .value(function(d) { return d.target_pct; });

  let arcs = vis.selectAll("g.slice") /* select all <g> elements with class slice (there aren't any yet) */
                .data(pie)            /* associate the generated pie data (an array of arcs, each having startAngle, endAngle and value properties) */
                .enter()              /* create <g> elements for every "extra" data element that should be associated with a selection. The result is creating a <g> for every object in the data array */
                .append("svg:g")      /* create a group to hold each slice (we will have a <path> and a <text> element associated with each slice) */
                .attr("class", "slice")
                .on("click", up);

  arcs.append("svg:path")
      .attr("cursor", "pointer")
      .attr("attrib-value", function(d) { return d.data.attrib_value; })    /* storing the Acxiom attrib value on the element */
      .attr("target-pct", function(d) { return d.data.target_pct; })
      .attr("index", function(d) { return d.data.index; })
      .attr("fill", function(d) {
          return colorByIndexPie(d.data.index, indexDs, d.data.attrib_value);
      })
      .attr("d", arc)     /* this creates the actual SVG path using the associated data (pie) with the arc drawing function */
      .append("svg:title") /* mouseover title showing the figures */
      ;

  d3.selectAll("g.slice").selectAll("path").attr("d", arcFinal );

  /* Add a label to the larger arcs, translated to the arc centroid and rotated.
  // source: http://bl.ocks.org/1305337#index.html */
  let labeledArcs = arcs.filter(function(d) { return d.endAngle - d.startAngle > .2; })
      .append("svg:text")
	    .attr("dy", "0.35em")
      .attr("text-anchor", "middle")
	    .attr("transform", function(d) { return "translate(" + arcFinal.centroid(d)[0] + ',' + (arcFinal.centroid(d)[1] - 20) + ")"; });

	labeledArcs
      .text(function(d) { return d.data.attrib_value + "|" + d.data.index + "|" + d.data.target_pct + "%" })
      .attr("dy", 0)
      .attr("class", "arc-name")
      .call(wrap, 1, "|", type = 'pie');


  function up(d, i) {
      /* update all charts when user selects piece of the pie chart */
      /* if clicking on already selected item, then reset the charts */
      isSelected = d3.select(".selected-tile #"+attrName+"Chart path[attrib-value="+d.data.attrib_value+"][selected='yes']")
                     ._groups[0][0];
      if (isSelected){
        DS_VIS_STORE["activeFilter"] = null;
        drawCharts();
        showActiveFilter(DS_VIS_STORE);
      } else {
        updateCharts(attrName, d.data.attrib_value);
      }
  }
}


/*******************************************************************************
*** MAP CHART ******************************************************************
*******************************************************************************/

function mapChart(attrName, indexDs) {
  $("#"+attrName+"Chart .ds-toggle-button").css("display", "none");
  //Width and height of map
  let width = 600;
  let height = 360;
  let noDataStateColor = 'rgba(53, 128, 224, 0.07)';

  // D3 Projection
  let projection = d3.geoAlbersUsa()
          				   .translate([width/2, height/2])    // translate to center of screen
  				           .scale([700]);          // scale things down so see entire US

  // Define path generator
  let path = d3.geoPath()               // path generator that will convert GeoJSON to SVG paths
		  	       .projection(projection);  // tell path generator to use albersUsa projection

  //Create SVG element and append map to the SVG
  let svg = d3.select("#"+attrName+"Chart")
			        .append("svg")
			        .attr("width", width)
			        .attr("height", height)
              .attr("class", "ds-chart-base");

  let tooltip = d3.select("#"+attrName+"Chart")
    .append("div")
    .attr("class", "ds-tooltip")
    .style("opacity", 0);

  let data = indexDs;

  data.forEach(function(catEntryIndex) {
      // Find the corresponding state inside the GeoJSON
      for (let j = 0; j < statesPaths.features.length; j++)  {
        let jsonState = statesPaths.features[j].properties.code;
        if (catEntryIndex["attrib_value"] == jsonState) {
          // Copy the data values into the JSON
          statesPaths.features[j].properties.target_pct = catEntryIndex["target_pct"];
          statesPaths.features[j].properties.index = catEntryIndex["index"];

          // Stop looking through the JSON
          break;
        }
      }
  });


  // Bind the data to the SVG and create one path per GeoJSON feature
  svg.selectAll("path")
  	.data(statesPaths.features)
  	.enter()
  	.append("path")
  	.attr("d", path)
  	.style("stroke", "#fff")
  	.style("stroke-width", "1")
  	.style("fill", function(d) {
        let stateColor = colorByIndexBar(d.properties.index);
        if (d.properties.target_pct == 0 || d.properties.random_pct) {
          stateColor = noDataStateColor;
        }
        return stateColor;
    })
    .attr("attrib-value", function(d) { return d.properties.code; })    /* storing the Acxiom attrib value on the element */
    .on("mouseover", mouseover)
    .on("mouseout", mouseout)
    .on("mousemove", mouseover)
    .attr("target-pct", function(d) { return d.properties.target_pct; })
    .attr("index", function(d) { return d.properties.index; })
    ;


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

      tooltip.html(d.properties.name + "<br/>" + "Target Pct: " + d.properties.target_pct + "%<br/>"  + "Index: " + d.properties.index)
          .style("opacity", .9)
          .style('left', `${(tipX)}`)
          .style('top', `${(tipY)}`);
  }

  function mouseout() {
      // Hide tooltip when the mouse leaves the element
      tooltip.style('opacity', 0);
  }

};


/*******************************************************************************
*** HORIZONTAL BAR CHART *******************************************************
*******************************************************************************/
function hBarChart2(attrName, innerWidth, indexArray, hasToggle=false) {
    console.log(DS_VIS_STORE[attrName+"Colors"])
    if (DS_VIS_STORE.activeView == 1) {
        $("#"+attrName+"Chart .ds-toggle-button").css("display", "none");
        $("#"+attrName+"Chart .ds-hbar-status").text("Top 5 By Index");
    }

    let newIndexArray;
    if (hasToggle==true) {
        newIndexArray = []
        let compIndexArray = []
        indexArray[0].forEach(function(aud) {
          newIndexArray.push(aud)
          // compIndexArray.push(aud[1])
          // compIndexArray2.push(aud[2])
        });
    } else {
        newIndexArray = indexArray.slice();
    }

    let numSeries = DS_VIS_STORE.activeView;

	let basics = barChartSetup(innerWidth);
	let margin = basics.margin,
      width = basics.width * DS_VIS_STORE["scaleWeight"] +30,
      height = basics.height * DS_VIS_STORE["scaleWeight"] + 10,
  		barPadding = basics.barPadding;

  let firstDatasetBarChart = newIndexArray[0];
  let maxAttrLength = width / 2.25;

	let yScale = d3.scaleLinear()
                 .domain([0, firstDatasetBarChart.length])
					       .range([0, height]);

  let xScale = d3.scaleLinear()
		             .domain([0, 100])
		             .range([0, width-maxAttrLength]);

  let barHeight = height / (firstDatasetBarChart.length * numSeries) - barPadding;


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
		            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  /* Attach index data and add the chart elems */
	// plot.selectAll("rect")
  //     .data(firstDatasetBarChart)
	// 	  .enter()
	// 	  .append("rect")
	// 		.attr("x", function(d) {
  //          return maxAttrLength;
	// 		})
	// 	  .attr("height", barHeight)
	// 		.attr("y", function(d, i) {
	// 		     return yScale(i);
	// 		})
	// 		.attr("width", function(d) {
	// 		    return xScale(d.target_pct);
	// 		})
	// 		.attr("fill", function(d) {
  //         return colorByIndexBar(d.index);
  //     })
  //     .attr("attrib-value", function(d) { return d.attrib_value; })    /* storing the Acxiom attrib value on the element */
  //     .on("mouseover", mouseover)
  //     .on("mouseout", mouseout)
  //     .on("mousemove", mouseover)
  //     .attr("attrib-category", function(d) { return d.category; })
  //     .attr("target-pct", function(d) { return d.target_pct; })
  //     .attr("index", function(d) { return d.index; })
  //     ;

        function drawHbar(data, series, color) {
            plot.selectAll("rect.series"+(series+1))
                .data(data)
          		  .enter()
          		  .append("rect")
                .attr("class", "series"+(series+1))
          			.attr("x", function(d) {
                    return maxAttrLength;
          			})
          		  .attr("height", barHeight)
          			.attr("y", function(d, i) {
                    return yScale(i) + barHeight*series;
          			})
          			.attr("width", function(d) {
          			    return xScale(d.target_pct);
          			})
          			.attr("fill", numSeries > 1 ? color : function(d) { return colorByIndexBar(d.index) })
                .attr("attrib-value", function(d) { return d.attrib_value; })    /* storing the Acxiom attrib value on the element */
                .on("mouseover", mouseover)
                .on("mouseout", mouseout)
                .on("mousemove", mouseover)
                .attr("attrib-category", function(d) { return d.category; })
                .attr("target-pct", function(d) { return d.target_pct; })
                .attr("index", function(d) { return d.index; })
                ;
        }

        function addHbarText(data, series) {
            plot.selectAll("text.series"+(series+1))
          	    .data(data)
          	    .enter()
          	    .append("text")
                .attr("class", "series"+(series+1))
          	    .text(function(d) {
          			     return formatAsInteger(d3.format("d")(d.index));
          	    })
          	    .attr("text-anchor", "middle")
                .attr("dominant-baseline", "middle")
          	    /* Set y position to the top edge of each bar plus half the bar width */
          	    .attr("y", function(d, i) {
                    return yScale(i) + (barHeight * series + barPadding * series) + (barHeight / 2);
          	    })
          	    .attr("x", function(d) { return textInside(d) ? maxAttrLength + xScale(d.target_pct) - 20 : maxAttrLength + xScale(d.target_pct) + 20 })
          	    .attr("font-family", "sans-serif")
          	    .attr("font-size", "11px")
          	    .attr("fill", function(d) { return textInside(d) ? "white" : "#505050" })
                .on("mouseover", mouseover)
                .on("mouseout", mouseout)
                .on("mousemove", mouseover);
        }

        newIndexArray.forEach(function(aud, i) {
          if (aud != null) {
              drawHbar(aud, i, numSeries > 1 ? DS_VIS_STORE[attrName+"Colors"][i] : null);
              addHbarText(aud, i);
          }

        })


  /* Will set x position and color dependent on size of bar */
  function textInside(d) { return xScale(d.target_pct) > 30};


	/* Add y labels to plot */
	// plot.selectAll("text")
	//     .data(firstDatasetBarChart)
	//     .enter()
	//     .append("text")
	//     .text(function(d) {
	// 		     return formatAsInteger(d3.format("d")(d.index));
	//     })
	//     .attr("text-anchor", "middle")
	//     /* Set y position to the top edge of each bar plus half the bar width */
	//     .attr("y", function(d, i) {
	// 		     return (i * (height / firstDatasetBarChart.length)) + ((height / firstDatasetBarChart.length - barPadding) / 2);
	//     })
	//     .attr("x", function(d) { return textInside(d) ? maxAttrLength + xScale(d.target_pct) - 20 : maxAttrLength + xScale(d.target_pct) + 20 })
	//     .attr("class", "xAxis")
	//     .attr("font-family", "sans-serif")
	//     .attr("font-size", "11px")
	//     .attr("fill", function(d) { return textInside(d) ? "white" : "#505050" })
  //     .on("mouseover", mouseover)
  //     .on("mouseout", mouseout)
  //     .on("mousemove", mouseover);

	/* Add y labels to chart */
	let yLabels = svg.append("g")
		               .attr("transform", "translate(" + (margin.left - 30) + "," + (margin.top)  + ")");

	yLabels.selectAll("text.yAxis")
		     .data(firstDatasetBarChart)
		     .enter()
		     .append("text")
		     .text(function(d) {
           let yLabel = d.attrib_value;
           if (d.attrib_value.length > 30) {
             yLabel = yLabel.slice(0, 30) + "...";
           }
           return yLabel;
         })
		     .attr("text-anchor", "start")
			   /* Set y position to the top edge of each bar plus half the bar width */
				 .attr("y", function(d, i) {
				       return (i * (height / firstDatasetBarChart.length)) + ((height / firstDatasetBarChart.length - barPadding) / 2);
				 })
		     .attr("x", 66)
		     .attr("class", "yAxis");
         //.call(wrap, 200, '-', type = 'hbar');

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
				       return (i * (height / newIndexArray[0].length))
                    + ((height / newIndexArray[0].length - barPadding) / 2)
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

  if (hasToggle == true) {
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
      let inp = [indexArray[0],indexArray[1],indexArray[2]]
      let idx1 = DS_VIS_STORE[attrName+"Active"].indexOf(1)
      let idx2 = DS_VIS_STORE[attrName+"Active"].indexOf(2)
      let idx3 = DS_VIS_STORE[attrName+"Active"].indexOf(3)
      let trans = [inp[idx1],inp[idx2],inp[idx3]]

      /* Toggle Comparison Charts on click */
      $("#"+attrName+"Chart .ds-toggle-button .ds-t1").unbind().click(function() {
            DS_VIS_STORE[attrName+"Active"] = [1,2,3]
            DS_VIS_STORE[attrName+"Colors"] = [colorSeries1, colorSeries2, colorSeries3]
            $(this).toggleClass("active",true)
            $("#"+attrName+"Chart .ds-toggle-button .ds-t2").toggleClass("active",false)
            $("#"+attrName+"Chart .ds-toggle-button .ds-t3").toggleClass("active",false)
            changeToggleText(1);
            toggleComparisonCharts(attrName, [trans[0],trans[1],trans[2]]);
        });

      $("#"+attrName+"Chart .ds-toggle-button .ds-t2").unbind().click(function() {
            DS_VIS_STORE[attrName+"Active"] = [2,1,3]
            DS_VIS_STORE[attrName+"Colors"] = [colorSeries2, colorSeries1, colorSeries3]
            $(this).toggleClass("active",true)
            $("#"+attrName+"Chart .ds-toggle-button .ds-t1").toggleClass("active",false)
            $("#"+attrName+"Chart .ds-toggle-button .ds-t3").toggleClass("active",false)
            changeToggleText(2);
            toggleComparisonCharts(attrName, [trans[1],trans[0],trans[2]]);
        });

      $("#"+attrName+"Chart .ds-toggle-button .ds-t3").unbind().click(function() {
            DS_VIS_STORE[attrName+"Active"] = [3,1,2]
            DS_VIS_STORE[attrName+"Colors"] = [colorSeries3, colorSeries1, colorSeries2]
            $(this).toggleClass("active",true)
            $("#"+attrName+"Chart .ds-toggle-button .ds-t2").toggleClass("active",false)
            $("#"+attrName+"Chart .ds-toggle-button .ds-t1").toggleClass("active",false)
            changeToggleText(3);
            toggleComparisonCharts(attrName, [trans[2],trans[0],trans[1]]);
        });

      function toggleComparisonCharts(attrName, toggleIndexArray) {
          /*
            The toggle is currently set to transition to the newly selected audience.
            If we don't want this, we can just redraw using the below for an instant transition.
              d3.select("#"+attrName+"Chart svg").remove();
              $("#"+attrName+"Chart .ds-toggle-button .ds-triple-toggle").remove();
              hBarMultiSeriesChart(attrName,out[0],out[1],out[2]);
          */

          plot = d3.select("#"+attrName+"Chart");

          /* Draw in the required bars and text with the functions below */
          // addCompHbar(plot, "series1", out[0][0], maxAttrLength, barHeight, xScale, yScale, DS_VIS_STORE[attrName+"Colors"][0]);
          // addCompHbar(plot, "series2", out[0][1], maxAttrLength, barHeight, xScale, yScale, DS_VIS_STORE[attrName+"Colors"][1]);
          // if (numSeries > 2) {
          //     addCompHbar(plot, "series3", out[0][2], maxAttrLength, barHeight, xScale, yScale, DS_VIS_STORE[attrName+"Colors"][2]);
          // }
          // addCompHbarText(plot, "series1", out[0][0], barHeight, barPadding, maxAttrLength);
          // addCompHbarText(plot, "series2", out[0][1], barHeight, barPadding, maxAttrLength);
          // if (numSeries > 2) {
          //     addCompHbarText(plot, "series3", out[0][2], barHeight, barPadding, maxAttrLength);
          // }



          function addCompHbar(plot, series, aud, maxAttrLength, barHeight, xScale, yScale, color) {
            plot.selectAll("rect.series"+(series+1))
                .data(aud)
                .transition()
                .duration(600)
                .attr("class", "series"+(series+1))
                .attr("x", function(d) {
                     return maxAttrLength;
                })
                .attr("height", barHeight)
                .attr("y", function(d, i) {
                     return (series == 0) ? yScale(i) : (series == 1) ? yScale(i) + barHeight : yScale(i) + barHeight*2;
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
            plot.selectAll("text.series"+(series+1))
                .data(aud)
                .transition()
                .duration(600)
                .text(function(d) {
                     return formatAsInteger(d3.format("d")(d.index));
                })
                .attr("class", "series"+(series+1))
                .attr("text-anchor", "middle")
                /* Set y position to the top edge of each bar plus half the bar width */
                .attr("y", function(d, i) {
                    if (series == 0) {
                      return (i * numSeries * (barHeight + barPadding) + barHeight / 2 + barPadding * 2);
                    } else if (series == 1) {
                      return (i * numSeries * (barHeight + barPadding) + barHeight * 1.5 + barPadding * 2);
                    } else if (series == 2) {
                      return (i * numSeries * (barHeight + barPadding) + barHeight + barHeight * 1.5 + barPadding * 2);
                    }

                })
                .attr("x", function(d) { return textInside(d) ? maxAttrLength + xScale(d.target_pct) - 20 : maxAttrLength + xScale(d.target_pct) + 20 })
                .attr("font-family", "sans-serif")
                .attr("font-size", "11px")
                .attr("fill", function(d) { return textInside(d) ? "white" : "#505050" });
          }

          toggleIndexArray[0].forEach(function(aud, i) {
              console.log(attrName)
              if (aud != null) {
                  addCompHbar(plot, i, aud, maxAttrLength, barHeight, xScale, yScale, DS_VIS_STORE[attrName+"Colors"][i]);
                  addCompHbarText(plot, i, aud, barHeight, barPadding, maxAttrLength);
              }
          });

          plot.selectAll("text.yAxis")
                 .data(toggleIndexArray[0][0])
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


function hBarChart(attrName, indexDs) {
    if (DS_VIS_STORE.activeView == 1) {
        $("#"+attrName+"Chart .ds-toggle-button").css("display", "none");
        $("#"+attrName+"Chart .ds-hbar-status").text("Top 5 By Index");
    }

  let innerWidth = 630;

	let basics = barChartSetup(innerWidth);
	let margin = basics.margin,
      width = basics.width * DS_VIS_STORE["scaleWeight"] +30,
      height = basics.height * DS_VIS_STORE["scaleWeight"] + 10,
  		barPadding = basics.barPadding;

  let firstDatasetBarChart = indexDs;
  let maxAttrLength = width / 2.25;

	let yScale = d3.scaleLinear()
                 .domain([0, firstDatasetBarChart.length])
					       .range([0, height]);

  let xScale = d3.scaleLinear()
		             .domain([0, 100])
		             .range([0, width-maxAttrLength]);

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
		            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  /* Attach index data and add the chart elems */
	plot.selectAll("rect")
      .data(firstDatasetBarChart)
		  .enter()
		  .append("rect")
			.attr("x", function(d) {
           return maxAttrLength;
			})
		  .attr("height", height / firstDatasetBarChart.length - barPadding)
			.attr("y", function(d, i) {
			     return yScale(i);
			})
			.attr("width", function(d) {
			    return xScale(d.target_pct);
			})
			.attr("fill", function(d) {
          return colorByIndexBar(d.index);
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
	plot.selectAll("text")
	    .data(firstDatasetBarChart)
	    .enter()
	    .append("text")
	    .text(function(d) {
			     return formatAsInteger(d3.format("d")(d.index));
	    })
	    .attr("text-anchor", "middle")
	    /* Set y position to the top edge of each bar plus half the bar width */
	    .attr("y", function(d, i) {
			     return (i * (height / firstDatasetBarChart.length)) + ((height / firstDatasetBarChart.length - barPadding) / 2);
	    })
	    .attr("x", function(d) { return textInside(d) ? maxAttrLength + xScale(d.target_pct) - 20 : maxAttrLength + xScale(d.target_pct) + 20 })
	    .attr("class", "xAxis")
	    .attr("font-family", "sans-serif")
	    .attr("font-size", "11px")
	    .attr("fill", function(d) { return textInside(d) ? "white" : "#505050" })
      .on("mouseover", mouseover)
      .on("mouseout", mouseout)
      .on("mousemove", mouseover);

	/* Add y labels to chart */
	let yLabels = svg.append("g")
		               .attr("transform", "translate(" + (margin.left - 30) + "," + (margin.top)  + ")");

	yLabels.selectAll("text.yAxis")
		     .data(firstDatasetBarChart)
		     .enter()
		     .append("text")
		     .text(function(d) {
           let yLabel = d.attrib_value;
           if (d.attrib_value.length > 30) {
             yLabel = yLabel.slice(0, 30) + "...";
           }
           return yLabel;
         })
		     .attr("text-anchor", "start")
			   /* Set y position to the top edge of each bar plus half the bar width */
				 .attr("y", function(d, i) {
				       return (i * (height / firstDatasetBarChart.length)) + ((height / firstDatasetBarChart.length - barPadding) / 2);
				 })
		     .attr("x", 66)
		     .attr("class", "yAxis");
         //.call(wrap, 200, '-', type = 'hbar');

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
				       return (i * (height / indexDs.length))
                    + ((height / indexDs.length - barPadding) / 2)
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
*** DNA CHART ******************************************************************
*******************************************************************************/
function dnaChart(indexArray, barWidth=4) {
  let numSeries = DS_VIS_STORE.activeView;

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
        + ": "
        + row['attrib_value']
        + "    <br>    Target Pct: "
        + row['target_pct'].toString()
        + "%    <br>    Index: "
        + row['index'].toString()
        + "    <br>    ";
    });
    return t;
  }

  let traces = []
  let audKeys = []
  indexArray.forEach(function(aud) {
    if (aud != null) {
        audKeys.push(...Object.keys(aud))
    }
  })
  let attrNames = [...new Set(audKeys)];

  const index = indexArray.indexOf(null);
  if (index > -1) {
    indexArray.splice(index, 1);
  }

  attrNames.forEach(function(attrName, i){
    indexArray.forEach(function(aud,j) {
        let startIdx = j > 0 ? Object.keys(indexArray[j - 1]).length * j: 0;
        traces[i+startIdx] = {
          name: attrName,
          x: unpack(indexArray[j][attrName], 'index'),
          y: unpack(indexArray[j][attrName], 'target_pct'),
          base: unpack(indexArray[j][attrName], 'target_pct').map(x => -x/2),
          width: barWidth,
          type: 'bar',
          marker: {
            color: numSeries == 1 ? unpack(indexArray[j][attrName], 'index').map(x => colorByIndexBar(x)) : DS_VIS_STORE.seriesColors[j],
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

    })

  });

  // let height = 150;
	// let width = 1260;

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
  Plotly.newPlot("waveChart", traces, layout, {displayModeBar: false, responsive: true});

}



/*******************************************************************************
*** MIKEJ BUBBLE CHART *********************************************************
*******************************************************************************/
function mikeJBubbleChart(attrName, indexDs1, indexDs2 = null, indexDs3 = null) {

  let numSeries = DS_VIS_STORE.activeView;

  // sort data alphabetically by category
  indexDs1.sort((a, b) => b.category.localeCompare(a.category));
  if (numSeries > 1) {
      indexDs2.sort((a, b) => b.category.localeCompare(a.category));
  }
  if (numSeries > 2) {
      indexDs3.sort((a, b) => b.category.localeCompare(a.category));
  }

  let trace1 = [];
  let trace2 = [];
  let trace3 = [];

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
      return row['attrib_value']
        + "    <br>    Target Pct: "
        + row['target_pct'].toString()
        + "%<br>    Index: "
        + row['index'].toString()
        + "<br>   ";
    });
    return toolTipValuesArray;
  }

  function getId(ds,aud){
    idArray = ds.map(function(row) {
      let attr = row['attrib_value']
      return attr

    });
    return idArray;
  }

  trace1 = {
    showlegend: false,
    x: unpack(indexDs1, 'index'),
    y: unpack(indexDs1, 'category'),
    mode: 'markers',
    type: 'scatter',
    marker: {
      size: unpack(indexDs1, 'target_pct').map(x => Math.sqrt(x)*5),
      color: numSeries == 1 ? unpack(indexDs1, 'index').map(x => colorByIndexBar(x)) : colorSeries1,
      opacity: unpack(indexDs1, 'target_pct').map(x => 0.5),
      line: {width: 0}
    },
    id: getId(indexDs1, 1),
    hovertext: getMikeJTooltipValues(indexDs1),
    hoverinfo: 'none',
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

  if (numSeries > 1) {
      trace2 = {
        showlegend: false,
        x: unpack(indexDs2, 'index'),
        y: unpack(indexDs2, 'category'),
        mode: 'markers',
        type: 'scatter',
        marker: {
          size: unpack(indexDs2, 'target_pct').map(x => Math.sqrt(x)*5),
          color: colorSeries2,
          opacity: unpack(indexDs2, 'target_pct').map(x => 0.5),
          line: {width: 0}
        },
        id: getId(indexDs2, 2),
        hovertext: getMikeJTooltipValues(indexDs2),
        hoverinfo: 'none',
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

  if (numSeries > 2) {
      trace3 = {
        showlegend: false,
        x: unpack(indexDs3, 'index'),
        y: unpack(indexDs3, 'category'),
        mode: 'markers',
        type: 'scatter',
        marker: {
          size: unpack(indexDs3, 'target_pct').map(x => Math.sqrt(x)*5),
          color: colorSeries3,
          opacity: unpack(indexDs3, 'target_pct').map(x => 0.5),
          line: {width: 0}
        },
        id: getId(indexDs3, 3),
        hovertext: getMikeJTooltipValues(indexDs3),
        hoverinfo: 'none',
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



  // calculate chart height based on the number of distinct categories
  // let allCats = [...new Set( [...unpack(indexDs1, 'category'), ...unpack(indexDs2, 'category')] )];
  let allCats = [...new Set( [...unpack(indexDs1, 'category')] )];
  let height = allCats.length * 58;
	let width = 1260;
  let margin = 40;

  // update the tile height to fit in the chart
  //$("#"+attrName+"DetailChart").parent().css("height", height + margin);


  let layout = {
    hovermode: 'closest',
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
  Plotly.newPlot(chartName, [trace1, trace2, trace3], layout, {displayModeBar: false, responsive: true});
}


/*******************************************************************************
*** ADD SERIES STATS ***********************************************************
*******************************************************************************/
function addSeriesStats(attrName, stat1, stat2=null, stat3=null, prefix='', suffix='') {
  // remove existing stats, if any
  $( "#" + attrName + "Chart" )
    .prev(".tile-header")
    .find(".ds-stats")
    .remove();

  let twoString = DS_VIS_STORE.activeView > 1
      ? "</span><span style='float:left;margin:0 3px;'> | </span><span class='ds-stat-2'>" + stat2 + suffix
      : '';

  let threeString = DS_VIS_STORE.activeView > 2
      ? "</span><span style='float:left;margin:0 3px;'> | </span><span class='ds-stat-3'>" + stat3 + suffix
      : '';

  // add in stats
  $( "#" + attrName + "Chart" )
    .prev(".tile-header")
    .append("<div class='ds-stats'><span class='ds-stats-name'>"
            + prefix
            + "</span><span class='ds-stat-1'>"
            + stat1 + suffix
            + twoString
            + threeString
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
*** ADD AUDIENCE LEGEND ********************************************************
*******************************************************************************/
function addAudienceLegend(compare=null) {
  if (compare === null) {
    $("#dsAudienceLegend1 .ds-audience-legend-color").css("background-color", colorOverIndex)
    $("#dsAudienceLegend1 .ds-audience-legend-label span").text("Over-Index")
    $("#dsAudienceLegend2 .ds-audience-legend-color").css("background-color", colorUnderIndex)
    $("#dsAudienceLegend2 .ds-audience-legend-label span").text("Under-Index")
    $("#dsAudienceLegend3 .ds-audience-legend-color").css({"background-color": colorZeroIndex, "display": "block"})
    $("#dsAudienceLegend3 .ds-audience-legend-label span").text("No Data")
    $("#dsAudienceLegend3 .ds-audience-legend-label span").css("display", "block")
  } else if (compare === 2) {
    $("#dsAudienceLegend1 .ds-audience-legend-color").css("background-color", colorSeries1)
    $("#dsAudienceLegend1 .ds-audience-legend-label span").text(targetAud.name)
    $("#dsAudienceLegend2 .ds-audience-legend-color").css("background-color", colorSeries2)
    $("#dsAudienceLegend2 .ds-audience-legend-label span").text(targetAud2.name)
    $("#dsAudienceLegend3 .ds-audience-legend-color").css("display", "none")
    $("#dsAudienceLegend3 .ds-audience-legend-label span").css("display", "none")
  } else if (compare === 3) {
    $("#dsAudienceLegend1 .ds-audience-legend-color").css("background-color", colorSeries1)
    $("#dsAudienceLegend1 .ds-audience-legend-label span").text(targetAud.name)
    $("#dsAudienceLegend2 .ds-audience-legend-color").css("background-color", colorSeries2)
    $("#dsAudienceLegend2 .ds-audience-legend-label span").text(targetAud2.name)
    $("#dsAudienceLegend3 .ds-audience-legend-color").css({"background-color": colorSeries3, "display": "block"})
    $("#dsAudienceLegend3 .ds-audience-legend-label span").text(targetAud3.name)
    $("#dsAudienceLegend3 .ds-audience-legend-label span").css("display", "block")
  }

}

/*******************************************************************************
*** SHOW ACTIVE FILTERS ********************************************************
*******************************************************************************/
function showActiveFilter(store) {
  let cat = null;
  if (store["activeFilter"] != null) {
      cat = store["activeFilter"][0];
      cat = cat[0].toUpperCase() + cat.slice(1)
      $(".ds-current-filter-remove").css("display", "inline");
      $(".ds-filter-tip").css("display","none");
  } else {
    $(".ds-filter-tip").css("display","");
    $(".ds-current-filter-remove").css("display", "none");
  }
    if (store.activeTab == "dashboard") {
        $(".ds-current-filter").text(store["activeFilter"] != null ? cat + ": " + store["activeFilter"][1] : "Click chart item to apply filter.");
    } else {
        $(".ds-filter-tip").css("display","none");
    }
}

function removeActiveFilter(store) {
  store["activeFilter"] = null;
  if (store["activeView"] == 1) {
    drawCharts();
  } else if (store["activeView"] == 2) {
    drawComparisonCharts(activeView=DS_VIS_STORE.activeView);
  } else if (store["activeView"] == 3) {
    drawComparisonCharts(activeView=DS_VIS_STORE.activeView);
  }

}

/* Remove filter by clicking remove icon in sidebar */
$(".ds-current-filter-remove").click(function() {
  removeActiveFilter(DS_VIS_STORE);
  $(".ds-current-filter").text("Click chart item to apply filter.");
  $(".ds-filter-tip").css("display","");
  $(this).css("display", "none");
})

$(".ds-audience-selection-form").change(function(){
  let selectedAudiences =
    $('.ds-audience-selection-form input:checkbox:checked')
      .map(function() { return $(this).val(); })
      .get();

  if (DS_VIS_STORE["activeView"] == null) {
    $(".ds-audience-select-alert").remove()
    $(".ds-active-filters").css("top", "360px")
  }

  if (DS_VIS_STORE["activeFilter"] != null && DS_VIS_STORE["activeTab"] == 'dashboard') {
    DS_VIS_STORE["activeFilter"] = null;
    $(".ds-current-filter").text("Click chart item to apply filter.");
    $(".ds-filter-tip").css("display","");
    $(".ds-current-filter-remove").css("display", "none");
  }

  if (selectedAudiences.length == 3) {
    DS_VIS_STORE["activeView"] = 3;
    resetCompareAuds()
  } else if (selectedAudiences.length == 2) {
    DS_VIS_STORE["activeView"] = 2;
    resetCompareAuds()
  } else if (selectedAudiences.length == 1){
    DS_VIS_STORE["activeView"] = 1;
  }

  if (selectedAudiences.length == 0) {
    DS_VIS_STORE["activeView"] = null;
  }


});

/*******************************************************************************
*** ADD AUDIENCE TITLE *********************************************************
*******************************************************************************/
function addAudienceTitle(targetAud1, targetAud2 = null, targetAud3 = null) {
    // remove existing titles, if any
    $( ".ds-audience-title h1" ).remove();
    let twoString = (targetAud2 != null) ? ("<div class= 'ds-aud-title-2'> <span style='color:#505050;'> VS </span>" + targetAud2.name + "</div>") : '';
    let threeString = (targetAud3 != null) ? ("<div class= 'ds-aud-title-3'> <span style='color:#505050;'> VS </span>" + targetAud3.name + "</div>") : '';
    // add titles
    $( ".ds-audience-title" )
        .append("<h1><div class= 'ds-aud-title-1'>"
          + targetAud1.name
          + "</div>"
          + twoString
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
*** DRAW ALL CHARTS ************************************************************
*******************************************************************************/
function drawCharts() {

    d3.selectAll('.ds-tooltip').remove()
    // add the audience title
    addAudienceTitle(targetAud);
    addAudienceLegend();
    showActiveFilter(DS_VIS_STORE);

    let indexCats = makeIndexCats();
    let demogAttributesList = Object.keys(indexCats);

    demogAttributesList.forEach(function(demogAttributeListName) {
      d3.select("#"+demogAttributeListName+"Chart svg").remove();
    });

    let ageIndex0 = indexAttr("age", indexCats.age, targetDemog, randomDemog);
    let ageMedianCat = getMedianCategory(ageIndex0);
    let genderIndex0 = indexAttr("gender", indexCats.gender, targetDemog, randomDemog);
    let ethnicityIndex0 = indexAttr("ethnicity", indexCats.ethnicity, targetDemog, randomDemog);
    let maritalIndex0 = indexAttr("marital", indexCats.marital, targetDemog, randomDemog);
    let childrenIndex0 = indexAttr("children", indexCats.children, targetDemog, randomDemog);
    let childrenNonZeroPct = getNonZeroPct(childrenIndex0);
    let educationIndex0 = indexAttr("education", indexCats.education, targetDemog, randomDemog);
    let incomeIndex0 = indexAttr("income", indexCats.income, targetDemog, randomDemog);
    let incomeMedianCat = getMedianCategory(incomeIndex0);
    let stateIndex0 = indexAttr("state", indexCats.state, targetDemog, randomDemog);
    let interestsIndex0 = indexInterestsRetail("interests", targetInterests, randomInterests);
    let interestsIndexBubble0 = indexInterestsRetail("interests", targetInterests, randomInterests, bubble=true);
    let interestsIndexTop0 = indexInterestsRetailTop5(interestsIndex0);
    let retailIndex0 = indexInterestsRetail("retail", targetRetail, randomRetail);
    let retailIndexTop0 = indexInterestsRetailTop5(retailIndex0);

    let indexes = {
      age: ageIndex0,
      gender: genderIndex0,
      ethnicity: ethnicityIndex0,
      marital: maritalIndex0,
      children: childrenIndex0,
      education: educationIndex0,
      income: incomeIndex0,
      state: stateIndex0,
      interests: interestsIndexTop0,
      retail: retailIndexTop0
    };

    //dnaChart(indexes);
    dnaChart([indexes], barWidth=DS_VIS_STORE.dnaBarWidths[DS_VIS_STORE.activeView - 1]);

    /* Take user to corresponding chart on bar click */
    let myPlot = document.getElementById('waveChart');
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

    //barChart("age", ageIndex0);
    //drawBarChart("age", ageIndex0);
    drawBarChart("age", [ageIndex0]);
    addSeriesStats("age", ageMedianCat, null, null, prefix = "Median: ", suffix = " years");
    drawBarChart("ethnicity", [ethnicityIndex0]);
    drawBarChart("children", [childrenIndex0]);
    addSeriesStats("children", childrenNonZeroPct, null, null, prefix = "Child present: ", suffix = "%");
    drawBarChart("education", [educationIndex0]);
    drawBarChart("income", [incomeIndex0], width=610);
    addSeriesStats("income", incomeMedianCat, null, null, prefix = "Median: ");
    pieChart("gender", genderIndex0);
    pieChart("marital", maritalIndex0);
    mapChart("state", stateIndex0);
    hBarChart2("interests", 630, [interestsIndexTop0]);
    //hBarChart("interests", interestsIndexTop0);
    hBarChart("retail", retailIndexTop0);

    $( ".tile" ).removeClass("selected-tile");

    mikeJBubbleChart('interests', interestsIndexBubble0);
    mikeJBubbleChart('retail', retailIndex0);

    addBubbleHighlighting('interests');
    addBubbleHighlighting('retail');



}


function addBubbleHighlighting(attrName) {
    let activeView = DS_VIS_STORE.activeView;
    var myPlot2 = document.getElementById(attrName+"DetailChart");
    const ttip = d3.select("#"+attrName+"DetailChart").append("div")
        .attr("class", "ds-tooltip-bubble")
        .style("opacity", 0);

    let ops1, ops2, ops3, l1, l2, l3;

    ops1 = myPlot2.data[0].marker.opacity;
    activeView > 1 ? ops2 = myPlot2.data[1].marker.opacity : null;
    activeView > 2 ? ops3 = myPlot2.data[2].marker.opacity : null;

    l1 = Array(ops1.length).fill(0)
    activeView > 1 ? l2 = Array(ops2.length).fill(0) : null;
    activeView > 2 ? l3 = Array(ops3.length).fill(0) : null;

    myPlot2.onmousemove = function(event) {
      ttip.style("left", event.pageX + "px");
      ttip.style("top", (event.pageY - 70) + "px");
    }

    let traces = activeView == 2 ? [0,1] : [0,1,2];

    myPlot2.on('plotly_hover', function(data){
        pn = data.points[0].pointNumber;
        id = data.points[0].data.id[pn];
        let d1,d2,d3;
        myPlot2.data[0].id.forEach((d, i) => {
          if (d == id) {
            d1 = i;
          }
        })
        ops1 = Array(ops1.length).fill(0.3);
        ops1[d1] = 1.0;
        l1[d1] = 1;
        if (activeView > 1) {
          myPlot2.data[1].id.forEach((d, i) => {
            if (d == id) {
              d2 = i;
            }
          })
          ops2 = Array(ops2.length).fill(0.3);
          ops2[d2] = 1.0;
          l2[d2] = 1;
        }

        if (activeView > 2) {
            myPlot2.data[2].id.forEach((d, i) => {
              if (d == id) {
                d3 = i;
              }
            });
            ops3 = Array(ops3.length).fill(0.3);
            ops3[d3] = 1.0;
            l3[d3] = 1;
        }

        ttip.style("opacity", 0.9)
            .html(data.points[0].hovertext);

        let update = {
          'marker.opacity': [ops1, ops2, ops3],//activeView == 2 ? [ops1,ops2] : [ops1,ops2,ops3],
          'marker.line.width': [l1, l2, l3],//activeView == 2 ? [l1,l2] : [l1,l2,l3],
          'marker.line.color': '#ddd'
        }

        //var update = {'marker':{color: colors, size:16}};

        Plotly.restyle(attrName+"DetailChart", update, traces);
      });

    function removeHoverHighlightUpdate() {
        ops1 = Array(ops1.length).fill(0.5)
        l1 = Array(ops1.length).fill(0)

        if (activeView > 1) {
            ops2 = Array(ops2.length).fill(0.5)
            l2 = Array(ops2.length).fill(0)
        }
        if (activeView > 2) {
            ops3 = Array(ops3.length).fill(0.5)
            l3 = Array(ops3.length).fill(0)
        }

        let update2 = {
          'marker.opacity': [ops1, ops2, ops3],
          'marker.line.width': [l1,l2,l3]
        }
        return update2
    }

    myPlot2.on('plotly_unhover', function(data){
      ttip.style("opacity",0)
      Plotly.restyle(attrName+"DetailChart", removeHoverHighlightUpdate(), traces);
    });

    myPlot2.on('plotly_click', function(data){
      ttip.style("opacity",0)
      Plotly.restyle(attrName+"DetailChart", removeHoverHighlightUpdate(), traces);
    });
}


/*******************************************************************************
*** RESET CHARTS ***************************************************************
*******************************************************************************/
function resetCharts() {
    if (DS_VIS_STORE["activeView"] == 1) {
        drawCharts();
    } else if (DS_VIS_STORE["activeView"] == 2) {
        drawComparisonCharts(activeView=DS_VIS_STORE.activeView);
    } else if (DS_VIS_STORE["activeView"] == 1) {
        drawComparisonCharts(activeView=DS_VIS_STORE.activeView);
    }
}

/* Reset dashboard charts if filter was left on when switching to bubble */
$("#interests-tab").click(function() {
    DS_VIS_STORE.activeTab = 'interests';
    if (DS_VIS_STORE.activeFilter != null) {
        DS_VIS_STORE.activeFilter = null;
        //showActiveFilter(DS_VIS_STORE);
        resetCharts();
    }
    $(".ds-current-filter").text("");
    $(".ds-filter-tip").css("display","none");
});

$("#retail-tab").click(function() {
    DS_VIS_STORE.activeTab = 'retail';
    if (DS_VIS_STORE.activeFilter != null) {
        DS_VIS_STORE.activeFilter = null;
        //showActiveFilter(DS_VIS_STORE);
        resetCharts();
    }
    $(".ds-current-filter").text("");
    $(".ds-filter-tip").css("display","none");
});

$("#dashboard-tab").click(function() {
    DS_VIS_STORE.activeTab = 'dashboard';
    showActiveFilter(DS_VIS_STORE);
});


/*******************************************************************************
*** UPDATE ALL CHARTS **********************************************************
*******************************************************************************/
function orderedTargetFilter(targetData, filteredIds, filteredData) {
  let targetPos = 0;
    filteredIds.forEach(function(id) {
      while (+targetData[targetPos]["temp_id"] < id) {
        targetPos++;
      }
      while (+targetData[targetPos]["temp_id"] == id) {
        filteredData.push(targetData[targetPos]);
        if (targetPos + 1 < targetData.length) {
          targetPos++;
        } else {
          break;
        }

      }
    });
}

/* updates bar charts when a value element is clicked on a chart */
function updateCharts(attrName, attrValue) {
    DS_VIS_STORE.activeFilter = [attrName, attrValue];
    showActiveFilter(DS_VIS_STORE);

    let attrIndex = [];
    let indexCats = makeIndexCats();
    let indexes = {};

    let demogAttributesList = Object.keys(indexCats);
    let barChartAttributesList = ["age", "ethnicity", "children", "education", "income"]
    let pieChartAttributesList = ["gender", "marital"]
    let mapChartAttributesList = ["state"]
    let hBarChartAttributesList = ["interests", "retail"]

    demogAttributesList.forEach(function(demogAttributeListName) {
        if (attrName != demogAttributeListName) {
            /* reset opacity */
            if ( barChartAttributesList.includes(demogAttributeListName) ) {
              d3.selectAll("#"+demogAttributeListName+"Chart svg rect").style("opacity", 1);
            } else if ( pieChartAttributesList.includes(demogAttributeListName) ) {
              d3.selectAll("#"+demogAttributeListName+"Chart svg .slice path").style("opacity", 1);
            } else if ( mapChartAttributesList.includes(demogAttributeListName) ) {
              d3.selectAll("#"+demogAttributeListName+"Chart svg path").style("opacity", 1);
            } else if ( hBarChartAttributesList.includes(demogAttributeListName) ) {
              d3.selectAll("#"+demogAttributeListName+"Chart svg rect").style("opacity", 1);
            }

            if ( hBarChartAttributesList.includes(demogAttributeListName) ) {

                let filteredData = [];
                let filteredIds = filterAttr(targetDemog, attrName, attrValue).map(function(d) { return d.temp_id; });
                if (demogAttributeListName == "interests"){
                    orderedTargetFilter(targetInterests, filteredIds, filteredData);
                    attrIndex = indexInterestsRetail(demogAttributeListName, filteredData, randomInterests);
                } else if (demogAttributeListName == "retail"){
                    orderedTargetFilter(targetRetail, filteredIds, filteredData);
                    attrIndex = indexInterestsRetail(demogAttributeListName, filteredData, randomRetail);
                }

                attrIndexTop = indexInterestsRetailTop5(attrIndex);

            } else {
                var t0 = performance.now();
                let filteredData = filterAttr(targetDemog, attrName, attrValue);
                var t1 = performance.now();
                attrIndex = indexAttr(demogAttributeListName,
                                      indexCats[demogAttributeListName],
                                      filteredData,
                                      randomDemog);
            }

        } else {
            if ( hBarChartAttributesList.includes(demogAttributeListName) ) {
                if (demogAttributeListName == "interests"){
                    attrIndex = indexInterestsRetail(demogAttributeListName, targetInterests, randomInterests);
                } else if (demogAttributeListName == "retail"){
                    attrIndex = indexInterestsRetail(demogAttributeListName, targetRetail, randomRetail);
                }
                attrIndexTop = indexInterestsRetailTop5(attrIndex);
            } else {
              attrIndex = indexAttr(demogAttributeListName,
                                    indexCats[demogAttributeListName],
                                    targetDemog,
                                    randomDemog);
            }
        }

        // update the wave chart data
        if ( hBarChartAttributesList.includes(demogAttributeListName) ) {
          indexes[demogAttributeListName] = attrIndexTop;
        } else {
          indexes[demogAttributeListName] = attrIndex;
        }

        // update stats
        $( "#" + demogAttributeListName + "Chart" )
          .prev(".tile-header")
          .find(".ds-stats")
          .remove();
        if (attrName != demogAttributeListName) {
          if (demogAttributeListName == "age") {
              let ageMedianCat = getMedianCategory(attrIndex);
              addSeriesStats("age", ageMedianCat, null, null, prefix = "Median: ", suffix = " years");
          } else if (demogAttributeListName == "children") {
              let childrenNonZeroPct = getNonZeroPct(attrIndex);
              addSeriesStats("children", childrenNonZeroPct, null, null, prefix = "Child present: ", suffix = "%");
          } else if (demogAttributeListName == "income") {
              let incomeMedianCat = getMedianCategory(attrIndex);
              addSeriesStats("income", incomeMedianCat, null, null, prefix = "Median: ");
          }
        }

        // update charts
        if ( barChartAttributesList.includes(demogAttributeListName) ) {
            // update bar chart
            var currentDatasetBarChart = attrIndex;
            let innerWidth = 400;
            if (demogAttributeListName == "income") {
            	  innerWidth = 610;
            }
          	let basics = barChartSetup(innerWidth);
          	let margin = basics.margin,
                width = basics.width,
                height = basics.height,
            		barPadding = basics.barPadding;

            let xScale = d3.scaleLinear()
                           .domain([0, currentDatasetBarChart.length])
                           .range([0, width]);

            let yScale = d3.scaleLinear()
                           .domain([0, d3.max(currentDatasetBarChart, function(d) { return d.target_pct; })])
                           .range([height,0]);

            let svg = d3.select("#"+demogAttributeListName+"Chart svg");

            /* Transition grid lines */
            let t = d3.transition()
                  .duration(500)

            function make_y_gridlines() {
                return d3.axisLeft(yScale)
                    .ticks(5)
            }

            svg.select(".grid")
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


            let plot = d3.select("#"+demogAttributeListName+"ChartPlot");

            /* Select existing bars and update them */
            plot.selectAll("rect")
                .data(currentDatasetBarChart)
                .transition()
                .duration(750)
                .attr("x", function(d, i) {
                  return xScale(i);
                })
                .attr("width", width / currentDatasetBarChart.length - barPadding)
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
                .attr("fill", function(d) {
                  return colorByIndexBar(d.index);
                });

            /* Update the text labels on bars */
            function textInside(d) { return (height - yScale(d.target_pct)) > 20 }; // Display text inside if bar is big enough

            plot.selectAll("text.yAxis")
                .data(currentDatasetBarChart)
                .transition()
                .duration(750)
                .attr("text-anchor", "middle")
                .attr("x", function(d, i) {
                   return (i * (width / currentDatasetBarChart.length)) + ((width / currentDatasetBarChart.length - barPadding) / 2);
                })
                .attr("y", function(d) {
                   return textInside(d) ? yScale(d.target_pct) + 14 : yScale(d.target_pct) - 7;
                })
                .text(function(d) {
                 return formatAsInteger(d3.format("d")(d.index));
                })
                .attr("fill", function(d) { return textInside(d) ? "white" : "#505050" })
                .attr("class", "yAxis");
        } else if ( pieChartAttributesList.includes(demogAttributeListName) ) {
            d3.select("#"+demogAttributeListName+"Chart svg").remove();
            pieChart(demogAttributeListName, attrIndex);
        } else if ( mapChartAttributesList.includes(demogAttributeListName) ) {
            d3.select("#"+demogAttributeListName+"Chart svg").remove();
            mapChart(demogAttributeListName, attrIndex);
        } else if ( hBarChartAttributesList.includes(demogAttributeListName) ) {
            d3.select("#"+demogAttributeListName+"Chart svg").remove();
            hBarChart(demogAttributeListName, attrIndexTop);
        }

    });

    // update the wave chart
    dnaChart([indexes], barWidth=DS_VIS_STORE.dnaBarWidths[DS_VIS_STORE.activeView - 1]);

    /* Take user to corresponding chart on bar click */
    let myPlot = document.getElementById('waveChart');
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
    if ( barChartAttributesList.includes(attrName) | hBarChartAttributesList.includes(attrName) ) {
        d3.selectAll("#" + attrName + "Chart svg rect")
          .style("opacity", 0.25)
          .attr("selected", "no")
          ;
        d3.selectAll("#" + attrName + "Chart svg [attrib-value='" + attrValue + "']")
          .style("opacity", 1)
          .attr("selected", "yes")
          ;
    } else if ( pieChartAttributesList.includes(attrName) ) {
        d3.selectAll("#" + attrName + "Chart svg .slice path")
          .style("opacity", 0.25)
          .attr("selected", "no")
          ;
        d3.selectAll("#" + attrName + "Chart svg .slice [attrib-value=" + attrValue + "]")
          .style("opacity", 1)
          .attr("selected", "yes")
          ;
    }

    /* Highlight the selected tile */
    $( ".tile" ).removeClass("selected-tile");
    $( "#" + attrName + "Chart" ).parent().addClass("selected-tile");

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

    let stateIndexTop3 = [null,null];
    let interestsIndexTop3 = [null,null];
    let retailIndexTop3 = [null,null];

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

    dnaChart([indexes1, indexes2, indexes3],barWidth=DS_VIS_STORE.dnaBarWidths[DS_VIS_STORE.activeView - 1]);

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

    drawBarChart("age", [ageIndex1, ageIndex2, ageIndex3]);
    addSeriesStats("age", ageMedianCat1, ageMedianCat2, ageMedianCat3, prefix = "Median: ", suffix = " years");
    drawBarChart("ethnicity", [ethnicityIndex1, ethnicityIndex2, ethnicityIndex3]);
    drawBarChart("children", [childrenIndex1, childrenIndex2, childrenIndex3]);
    addSeriesStats("children", childrenNonZeroPct1, childrenNonZeroPct2, childrenNonZeroPct3, prefix = "Child Present: ", suffix = "%");
    drawBarChart("education", [educationIndex1, educationIndex2, educationIndex3]);
    drawBarChart("income", [incomeIndex1, incomeIndex2, incomeIndex3], width=610);
    addSeriesStats("income", incomeMedianCat1, incomeMedianCat2, incomeMedianCat3, prefix = "Median: ");
    hBarBalanceChart("gender", genderIndex1, genderIndex2, genderIndex3);
    hBarBalanceChart("marital", maritalIndex1, maritalIndex2, maritalIndex3);
    //(DS_VIS_STORE["stateActive"][0] === 1) ? hBarChart2("state", 630,[stateIndexTop1, stateIndexTop2, stateIndexTop3],hasToggle=true) : hBarChart2("state", 630, [stateIndexTop2, stateIndexTop1, stateIndexTop3]);
    //hBarChart2("state", 630,[stateIndexTop1, stateIndexTop2, stateIndexTop3],hasToggle=true);
    //hBarChart2("interests", 630, [interestsIndexTop1, interestsIndexTop2, interestsIndexTop3],hasToggle=true);
    //hBarChart2("retail", 630, [retailIndexTop1, retailIndexTop2, retailIndexTop3], hasToggle=true);
    (DS_VIS_STORE["stateActive"][0] === 1)
      ? hBarChart2("state", 630, [stateIndexTop1, stateIndexTop2, stateIndexTop3],hasToggle=true) : (DS_VIS_STORE["stateActive"][0] === 2)
      ? hBarChart2("state", 630,[stateIndexTop2, stateIndexTop1, stateIndexTop3],hasToggle=true) :
      hBarChart2("state", 630,[stateIndexTop3, stateIndexTop1, stateIndexTop2],hasToggle=true);

    (DS_VIS_STORE["interestsActive"][0] === 1)
      ? hBarChart2("interests", 630, [interestsIndexTop1, interestsIndexTop2, interestsIndexTop3],hasToggle=true) : (DS_VIS_STORE["interestsActive"][0] === 2)
      ? hBarChart2("interests", 630,[interestsIndexTop2, interestsIndexTop1, interestsIndexTop3],hasToggle=true) :
      hBarChart2("interests", 630,[interestsIndexTop3, interestsIndexTop1, interestsIndexTop2],hasToggle=true);

    (DS_VIS_STORE["retailActive"][0] === 1)
      ? hBarChart2("retail", 630, [retailIndexTop1, retailIndexTop2, retailIndexTop3],hasToggle=true) : (DS_VIS_STORE["retailActive"][0] === 2)
      ? hBarChart2("retail", 630,[retailIndexTop2, retailIndexTop1, retailIndexTop3],hasToggle=true) :
      hBarChart2("retail", 630,[retailIndexTop3, retailIndexTop1, retailIndexTop2],hasToggle=true);
    //(DS_VIS_STORE["interestsActive"][0] === 1) ? hBarMultiSeriesChart("interests", interestsIndexTop1, interestsIndexTop2, interestsIndexTop3) : hBarMultiSeriesChart("interests", interestsIndexTop2, interestsIndexTop1, interestsIndexTop3);
    //(DS_VIS_STORE["retailActive"][0] === 1) ? hBarChart2("retail", 630, [retailIndexTop1, retailIndexTop2, retailIndexTop3], hasToggle=true) : hBarChart2("retail", 630, [retailIndexTop2, retailIndexTop1, retailIndexTop3], hasToggle=true);

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
            console.log("running...")
            console.log(DS_VIS_STORE[demogAttributeListName+"Active"][0])
            console.log(JSON.stringify(target))
            hBarChart2(demogAttributeListName,630,[target,compare,compare2],hasToggle=true);

        }
    });

    // update the wave chart
    dnaChart([indexes1, indexes2, indexes3], barWidth=DS_VIS_STORE.dnaBarWidths[DS_VIS_STORE.activeView - 1]);

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
