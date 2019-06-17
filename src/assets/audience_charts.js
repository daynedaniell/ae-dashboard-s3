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
    mediaActive: [1,2,3],
    activeView: 1,
    activeTab: 'dashboard',
    scaleWeight: 1,
    seriesColors: [colorSeries1,colorSeries2,colorSeries3],
    dnaBarWidths: [4,3,2]
}

function resetCompareAuds() {
    DS_VIS_STORE.stateColors = [colorSeries1,colorSeries2,colorSeries3]; //Set colors to be indexable to active audience in toggle
    DS_VIS_STORE.interestsColors = [colorSeries1,colorSeries2,colorSeries3]
    DS_VIS_STORE.mediaColors = [colorSeries1,colorSeries2,colorSeries3]
    DS_VIS_STORE.interestsActive = [1,2,3]
    DS_VIS_STORE.stateActive = [1,2,3]
    DS_VIS_STORE.mediaActive = [1,2,3]
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

/*******************************************************************************
*** Tooltips *******************************************************************
*******************************************************************************/
function addTooltip(tooltipNode, htmlString, xOffset, yOffset) {
    let e = window.event;
    var x = e.clientX,
        y = e.clientY;

    let tipY = (y + yOffset) + 'px';
    let tipX = (x + xOffset) + 'px';

    // Move tooltip to the left of the cursor if it gets too close to right edge
    if  (window.innerWidth - x < 200) {
      tipX = (x - 130) + 'px';
    }

    tooltipNode.html(htmlString)
        .style("opacity", .9)
        .style('left', `${(tipX)}`)
        .style('top', `${(tipY)}`);
}

/*******************************************************************************
*** Apply Filter ***************************************************************
*******************************************************************************/
function applyFilter(attrName, attrValue, shapeString, targetAuds) {
    /* update all charts when user selects a single bar in this chart */
    /* if clicking on already selected item, then reset the charts */
    isSelected = d3.select(".selected-tile #"+attrName+"Chart " + shapeString + "[attrib-value='"+attrValue+"'][selected='yes']")._groups[0][0];

    if (isSelected){
        DS_VIS_STORE["activeFilter"] = null;
        drawCharts(targetAuds);

        showActiveFilter(DS_VIS_STORE);
    } else {
        updateCharts(attrName, attrValue, targetAuds);
        showActiveFilter(DS_VIS_STORE);
    }
}


//d3.select(window).on('resize', console.log(window.innerWidth))

/*******************************************************************************
*** Main Toggle Function *******************************************************
*******************************************************************************/
function toggleFromStore(store, key) {
    /* Takes in the store and a key and switches position of elements in an array */
    tmp1 = store[key][0];
    tmp2 = store[key][1];
    store[key][0] = tmp2;
    store[key][1] = tmp1;
}


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
  svg.selectAll(".domain").remove();


  function up(d, i) {
      applyFilter(attrName, d.attrib_value, "rect", targetAuds);
  }


  function mouseover(d) {
    let htmlString = "Target Pct: " + d.target_pct + "%<br/>"  + "Index: " + d.index
    addTooltip(tooltip, htmlString, 0, -40);
  }

  function mouseup(d) {
    // Hide tooltip when the mouse leaves the element
    tooltip.style('opacity', 0);
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
        let jsonState = statesPaths.features[j].properties.name;
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
    .attr("attrib-value", function(d) { return d.properties.name; })    /* storing the Acxiom attrib value on the element */
    .on("mouseover", mouseover)
    .on("mouseout", mouseout)
    .on("mousemove", mouseover)
    .attr("target-pct", function(d) { return d.properties.target_pct; })
    .attr("index", function(d) { return d.properties.index; })
    ;


  function mouseover(d) {
      let htmlString = d.properties.name + "<br/>" + "Target Pct: " + d.properties.target_pct + "%<br/>"  + "Index: " + d.properties.index
      addTooltip(tooltip, htmlString, 0, -60);
  }

  function mouseout() {
      // Hide tooltip when the mouse leaves the element
      tooltip.style('opacity', 0);
  }

};


/*******************************************************************************
*** HORIZONTAL BAR CHART *******************************************************
*******************************************************************************/
function hBarChart(attrName, innerWidth, indexArray, hasToggle=false) {
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

        });


  /* Will set x position and color dependent on size of bar */
  function textInside(d) { return xScale(d.target_pct) > 30};


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
      let htmlString = d.attrib_value + "<br/>" + "<br/>" + "Category: " + d.category + "<br/>" + "Target Pct: " + d.target_pct + "%<br/>"  + "Index: " + d.index
      addTooltip(tooltip, htmlString, 0, -90);
  }

  function mouseout() {
      // Hide tooltip when the mouse leaves the element
      tooltip.style('opacity', 0);
  }

}


/*******************************************************************************
*** BALANCE CHART **************************************************************
*******************************************************************************/
function hBarBalanceChart(attrName, indexArray, innerWidth=400) {
    const index = indexArray.indexOf(null);
    if (index > -1) {
      indexArray.splice(index, 1);
    }

    let numSeries = DS_VIS_STORE.activeView;

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

    /* Temporary pseudo-hardcoded barHeight */
    let barHeight = 120 / numSeries + ((numSeries - 2) * 10);
    let paddingBottom = 120 / numSeries - ((numSeries - 2) * 10);
    let barSpacing = 40;
    let topPos = height - ((barHeight + barSpacing) * numSeries + paddingBottom);
    let lineStroke = 'steelblue';
    let lineExtend = 12;
    let lineStrokeWidth = 8;

    /* Attach index data and add the chart elems */
    function addPBar(data, series, color) {
        plot.selectAll("rect.series" + (series+1))
            .data(data)
            .enter()
            .append("rect")
            .attr("class", "series"+(series+1))
            .attr("x", function(d, i) { return i ? xScale(100 - d.target_pct) : 0})
            .attr("width", function(d) { return xScale(d.target_pct)})
            .attr("y", function() {
                return topPos + barSpacing * series + barHeight * series
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

    function addPbarText(data, series) {
        plot.selectAll("text.series"+(series+1))
            .data(data)
            .enter()
            .append("text")
            .attr("class", "series"+(series+1))
            .text(function(d) {
                 return formatAsInteger(d3.format("d")(d.index));
            })
            .attr("text-anchor", "middle")
            /* Set x position to be inside corresponding edge of the bar */
            .attr("x",  function(d, i) { return i ? xScale(100 ) - 20 : 14})
            .attr("y", function() {
                if (series == 0) {
                  return topPos + 3 + (barHeight/2)
                } else if (series == 1) {
                  return topPos + barSpacing + 3 + barHeight + (barHeight/2)
                } else if (series == 2) {
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

    indexArray.forEach(function(aud, i) {
      addPBar(aud, i, DS_VIS_STORE.seriesColors[i]);
      addPbarText(aud, i);
    })

    plot.selectAll("text.labels")
        .data(indexArray[0])
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
    indexArray.forEach(function(aud, i) {
        var lineData = [{"x": xScale(indexArray[i][0].target_pct), "y": topPos + barSpacing * i + barHeight * i - lineExtend},
                        {"x": xScale(indexArray[i][0].target_pct), "y": topPos + barSpacing * i + barHeight * i + barHeight + lineExtend}]

        var line = d3.line()
                     .x(function(d) {return d.x})
                     .y(function(d) {return d.y});

        plot.append('path').attr('d', line(lineData)).attr("stroke", lineStroke)
            .attr("stroke-width", lineStrokeWidth)
            .attr("fill", "none");
    })

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


    function up(d) {
       applyFilter(attrName, d.attrib_value, "rect", targetAuds);
    }

    function mouseover(d) {
      let htmlString = d.attrib_value + "<br/>" + "Target Pct: " + d.target_pct + "%<br/>"  + "Index: " + d.index
      addTooltip(tooltip, htmlString, 0, -60);
    }

    function mouseup(d) {
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
      media: "Media"
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
        if (Object.keys(indexArray[j]).indexOf(attrName) > -1) {
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
        }

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
 // Plotly.newPlot("waveChart", traces, layout, {displayModeBar: false, responsive: true});

}



/*******************************************************************************
*** MIKEJ BUBBLE CHART *********************************************************
*******************************************************************************/
function bubbleChart(attrName, indexArray) {

  const index = indexArray.indexOf(null);
  if (index > -1) {
    indexArray.splice(index, 1);
  }

  let numSeries = DS_VIS_STORE.activeView;

  let audCatsAll = []
  indexArray.forEach(function(aud) {
    if (aud != null) {
        audCatsAll.push(aud.category)
        aud.sort((a, b) => b.category.localeCompare(a.category));
    }
  })
  let allCats = [...new Set(audCatsAll)];

  allCats.sort();



  let traces = []

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

  indexArray.forEach(function(aud,j) {

    traces[j] = {
      showlegend: false,
      x: unpack(indexArray[j], 'index'),
      y: unpack(indexArray[j], 'category'),
      mode: 'markers',
      type: 'scatter',
      marker: {
        size: unpack(indexArray[j], 'target_pct').map(x => Math.sqrt(x)*5),
        color: numSeries == 1 ? unpack(indexArray[j], 'index').map(x => colorByIndexBar(x)) : DS_VIS_STORE.seriesColors[j],
        opacity: unpack(indexArray[j], 'target_pct').map(x => 0.5),
        line: {width: 0}
      },
      id: getId(indexArray[j], 1),
      hovertext: getMikeJTooltipValues(indexArray[j]),
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

  });

  // calculate chart height based on the number of distinct categories
  // let allCats = [...new Set( [...unpack(indexDs1, 'category'), ...unpack(indexDs2, 'category')] )];
  //let allCats = [...new Set( [...unpack(indexDs1, 'category')] )];
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
  Plotly.newPlot(chartName, traces, layout, {displayModeBar: false, responsive: true});
}


/*******************************************************************************
*** ADD SERIES STATS ***********************************************************
*******************************************************************************/
function addSeriesStats(attrName, statsArray, prefix='', suffix='') {
  // remove existing stats, if any
  $( "#" + attrName + "Chart" )
    .prev(".tile-header")
    .find(".ds-stats")
    .remove();

  let statString = "<div class='ds-stats'><span class='ds-stats-name'>" + prefix + "</span>"
  statsArray.forEach(function(stat, i) {
      statString += `<span class='ds-stat-${i+1}' style='color: ${DS_VIS_STORE.seriesColors[i]}'>${stat} ${suffix}</span>`
      if (i != statsArray.length - 1) {
          statString += "<span style='float:left;margin:0 3px;'> | </span>"
      }
  });
  statString += "</div>"

  // add in stats
  $( "#" + attrName + "Chart" )
    .prev(".tile-header")
    .append(statString);
}

/*******************************************************************************
*** ADD AUDIENCE LEGEND ********************************************************
*******************************************************************************/
function addAudienceLegend(targetAuds) {
  if (DS_VIS_STORE.activeView == 1) {
    $("#dsAudienceLegend1 .ds-audience-legend-color").css("background-color", colorOverIndex)
    $("#dsAudienceLegend1 .ds-audience-legend-label span").text("Over-Index")
    $("#dsAudienceLegend2 .ds-audience-legend-color").css("background-color", colorUnderIndex)
    $("#dsAudienceLegend2 .ds-audience-legend-label span").text("Under-Index")
    $("#dsAudienceLegend3 .ds-audience-legend-color").css({"background-color": colorZeroIndex, "display": "block"})
    $("#dsAudienceLegend3 .ds-audience-legend-label span").text("No Data")
    $("#dsAudienceLegend3 .ds-audience-legend-label span").css("display", "block")
  } else {
    targetAuds.forEach(function(aud, i) {
        $(`#dsAudienceLegend${i+1} .ds-audience-legend-color`).css("background-color", DS_VIS_STORE.seriesColors[i])
        $(`#dsAudienceLegend${i+1} .ds-audience-legend-label span`).text(aud.name)
        $(`#dsAudienceLegend${i+1} .ds-audience-legend-color`).css("display", "block")
        $(`#dsAudienceLegend${i+1} .ds-audience-legend-label span`).css("display", "block")
    });
    if (targetAuds.length < DS_VIS_STORE.seriesColors.length) {
        let i = targetAuds.length;
        while (i <= targetAuds.length) {
            $(`#dsAudienceLegend${i+1} .ds-audience-legend-color`).css("display", "none")
            $(`#dsAudienceLegend${i+1} .ds-audience-legend-label span`).css("display", "none")
            i += 1;
        }
    }
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
  drawCharts(targetAuds);
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
function addAudienceTitle(targetAuds) {
    // remove existing titles, if any
    $( ".ds-audience-title h1" ).remove();

    let titleString = "<h1>";

    targetAuds.forEach(function(aud, i) {
        let vs =  (i > 0) ? "<span style='color:#505050;'> VS </span>" : '';
        titleString += `<div class= 'ds-aud-title-${(i+1)}' style='color:${DS_VIS_STORE.seriesColors[i]}'>` + vs + targetAuds[i].name + "</div>"
    });

    titleString += "</h1>"

    $( ".ds-audience-title" )
        .append(titleString);
}


function addBubbleHighlighting(attrName) {
    let activeView = DS_VIS_STORE.activeView;
    const bubblePlot = document.getElementById(attrName+"DetailChart");
    const ttip = d3.select("#"+attrName+"DetailChart").append("div")
        .attr("class", "ds-tooltip-bubble")
        .style("opacity", 0);

    let ops = [];
    let borders = [];
    let traces = [];

    bubblePlot.data.forEach(function(aud, i) {
        ops.push(aud.marker.opacity);
        borders.push(Array(aud.length).fill(0));
        traces.push(i);
    });

    bubblePlot.onmousemove = function(event) {
      ttip.style("left", event.pageX + "px");
      ttip.style("top", (event.pageY - 70) + "px");
    }

    bubblePlot.on('plotly_hover', function(data){
        pn = data.points[0].pointNumber;
        id = data.points[0].data.id[pn];

        let ids = [];
        bubblePlot.data.forEach(function(aud, i) {
            bubblePlot.data[i].id.forEach((d, j) => {
              if (d == id) {
                ids[i] = j;
              }
            })
            ops[i] = Array(ops[i].length).fill(0.3);
            ops[i][ids[i]] = 1.0;
            borders[ids[i]] = 1;
        });

        ttip.style("opacity", 0.9)
            .html(data.points[0].hovertext);

        let update = {
          'marker.opacity': ops,
          'marker.line.width': borders,
          'marker.line.color': '#ddd'
        }

        Plotly.restyle(attrName+"DetailChart", update, traces);
      });

    function removeHoverHighlightUpdate() {
        bubblePlot.data.forEach(function(aud, i) {
            ops[i] = Array(ops[i].length).fill(0.5);
            borders[i] = Array(ops[i].length).fill(0)
        });

        let update2 = {
          'marker.opacity': ops,
          'marker.line.width': ops
        }
        return update2
    }

    bubblePlot.on('plotly_unhover', function(data){
      ttip.style("opacity",0)
      Plotly.restyle(attrName+"DetailChart", removeHoverHighlightUpdate(), traces);
    });

    bubblePlot.on('plotly_click', function(data){
      ttip.style("opacity",0)
      Plotly.restyle(attrName+"DetailChart", removeHoverHighlightUpdate(), traces);
    });
}


/*******************************************************************************
*** RESET CHARTS ***************************************************************
*******************************************************************************/
function resetCharts() {
    drawCharts(targetAuds);
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

$("#media-tab").click(function() {
    DS_VIS_STORE.activeTab = 'media';
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
*** DRAW ALL CHARTS ************************************************************
*******************************************************************************/
/* Functions to get arrays to serve as inputs to charts */
function getIndexArray(audData, attrName) {
    let indexes = [];
    audData.forEach(function(aud) {
        indexes.push(aud[attrName])
    });
    return indexes
}

function getStatArray(audData, attrName) {
    let stats = [];
    audData.forEach(function(aud) {
        stats.push(aud[attrName+"Stat"])
    })
    return stats
}

function getTopIndexArray(audData, attrName, audNum) {
    let indexes = [audData[audNum][attrName]];

    audData.forEach(function(aud, i) {
      if (audNum != i) {
          indexes.push(aud[attrName])
      }
    });
    return indexes
}

function getAnyIndexArray(data, audKey) {
    let indexes = [];
    data.forEach(function(aud) { indexes.push(aud[audKey]) });
    return indexes
}

function getCompIndexes(audData, attrName, targetNum) {

    let indexes = [audData[targetNum][attrName]]
    audData.forEach(function(aud, i) {
        if (i != targetNum) {
          indexes.push(aud[attrName])
        }
    })
    return indexes
};

function drawCharts(targetAuds) {
    let activeView = DS_VIS_STORE.activeView;
    showActiveFilter(DS_VIS_STORE);
    /* Remove any active tooltips */
    d3.selectAll(".ds-tooltip").remove();

    /* View setup */
    addAudienceLegend(targetAuds);

    addAudienceTitle(targetAuds);

    let indexCats = makeIndexCats();
    let demogAttributesList = Object.keys(indexCats);

    let audData = [];

    /* Remove the current svg from each chart div */
    demogAttributesList.forEach(function(demogAttributeListName) {
      d3.select("#"+demogAttributeListName+"Chart svg").remove();
    });
    targetAuds.forEach(function(aud, i) {
        let targetData = {
            name: aud.name
        }
        demogAttributesList.forEach(function(demogAttributeListName) {
            let index;
            if (demogAttributeListName == "interests") {
                index = indexInterestsMedia(demogAttributeListName, aud.interests, randomInterests);
            } else if (demogAttributeListName == "media") {
                index = indexInterestsMedia(demogAttributeListName, aud.media, randomMedia);
            } else {
                index = indexAttr(demogAttributeListName, indexCats[demogAttributeListName], aud.demog, randomDemog);
            }

            targetData[demogAttributeListName] = index;


        });
        targetData["ageStat"] = getMedianCategory(targetData.age);
        targetData["childrenStat"] = getNonZeroPct(targetData.children);
        targetData["incomeStat"] = getMedianCategory(targetData.income);

        audData.push(targetData)
    });


    audData.forEach(function(aud, i) {
        if (audData.length > 1) {
            aud["topStates"] = indexStatesTop5(...getCompIndexes(audData, "state", i));
            aud["topInterests"] = indexInterestsMediaTop5(...getCompIndexes(audData, "interests", i));
            aud["topMedia"] = indexInterestsMediaTop5(...getCompIndexes(audData, "media", i));
        } else {
            aud["topInterests"] = [indexInterestsMediaTop5(...getCompIndexes(audData, "interests", i))];
            aud["topMedia"] = [indexInterestsMediaTop5(...getCompIndexes(audData, "media", i))];

        }

    });

    let indexes = [];
    audData.forEach(function(aud) {
      indexes.push({
        age: aud.age,
        gender: aud.gender,
        ethnicity: aud.ethnicity,
        children: aud.children,
        education: aud.education,
        income: aud.income,
        state: aud.state,
        interests: aud.topInterests[0],
        media: aud.topMedia[0]
      });
    });
    dnaChart(indexes,barWidth=DS_VIS_STORE.dnaBarWidths[DS_VIS_STORE.activeView - 1]);

   // var myPlot = document.getElementById('waveChart');
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
        "media": "media"
      }
      document.getElementById(mapping[d[0]]+"Chart").parentNode.scrollIntoView();
      $("#"+mapping[d[0]]+"Chart").css("border", "1px solid gold");
      setTimeout(function() {$("#"+mapping[d[0]]+"Chart").css("border", "none")}, 3000);
    });

    drawBarChart("age", getIndexArray(audData, "age"));
    addSeriesStats("age", getStatArray(audData, "age"), prefix = "Median: ", suffix = " years");
    drawBarChart("ethnicity", getIndexArray(audData, "ethnicity"));
    drawBarChart("children", getIndexArray(audData, "children"));
    addSeriesStats("children", getStatArray(audData, "children"), prefix = "Child Present: ", suffix = "%");
    drawBarChart("education", getIndexArray(audData, "education"));
    drawBarChart("income", getIndexArray(audData, "income"), width=610);
    addSeriesStats("income", getStatArray(audData, "income"), prefix = "Median: ");
    if (audData.length > 1) {
        hBarBalanceChart("gender", getIndexArray(audData, "gender"));
        hBarBalanceChart("marital", getIndexArray(audData, "marital"));
    } else {
        pieChart("gender", [audData[0].gender][0]);
        console.log( [audData[0].gender][0]);
        pieChart("marital", [audData[0].marital][0]);
    }

    /* Add Toggle-Ready HBar Charts for Comparison Views */
    if (audData.length > 1) {
        (DS_VIS_STORE["stateActive"][0] === 1)
          ? hBarChart("state", 630, getTopIndexArray(audData, "topStates", 0),hasToggle=true) : (DS_VIS_STORE["stateActive"][0] === 2)
          ? hBarChart("state", 630,getTopIndexArray(audData, "topStates", 1),hasToggle=true) :
          hBarChart("state", 630,getTopIndexArray(audData, "topStates", 2),hasToggle=true);

        (DS_VIS_STORE["interestsActive"][0] === 1)
          ? hBarChart("interests", 630, getTopIndexArray(audData, "topInterests", 0),hasToggle=true) : (DS_VIS_STORE["interestsActive"][0] === 2)
          ? hBarChart("interests", 630,getTopIndexArray(audData, "topInterests", 1),hasToggle=true) :
          hBarChart("interests", 630,getTopIndexArray(audData, "topInterests", 2),hasToggle=true);

        (DS_VIS_STORE["mediaActive"][0] === 1)
          ? hBarChart("media", 630, getTopIndexArray(audData, "topMedia", 0),hasToggle=true) : (DS_VIS_STORE["mediaActive"][0] === 2)
          ? hBarChart("media", 630, getTopIndexArray(audData, "topMedia", 1),hasToggle=true) :
          hBarChart("media", 630,getTopIndexArray(audData, "topMedia", 2),hasToggle=true);
    } else {
        mapChart("state", [audData[0].state][0]);
        hBarChart("interests", 630, [audData[0].topInterests][0]);
        hBarChart("media", 630, [audData[0].topMedia][0])
    }

    $( ".tile" ).removeClass("selected-tile");

    bubbleChart('interests', getIndexArray(audData, "interests"));
    bubbleChart('media', getIndexArray(audData, "media"));

    addBubbleHighlighting('interests');
    addBubbleHighlighting('media');

}



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

function updateCharts(attrName, attrValue, targetAuds) {
    DS_VIS_STORE.activeFilter = [attrName, attrValue];
    let numSeries = targetAuds.length;

    let attrIndex = [];
    let indexCats = makeIndexCats();

    let demogAttributesList = Object.keys(indexCats);
    let barChartAttributesList = ["age", "ethnicity", "children", "education", "income"]
    let sBarChartAttributesList = ["gender", "marital"]
    let hBarChartAttributesList = ["state", "interests", "media"]


    let filteredData = [];
    targetAuds.forEach(function(aud, i) {
      filteredData.push({
        name: aud.name,
        data: [],
        indexes: {}

      });
    });

    targetAuds.forEach(function(aud, i) {
        filteredData[i].filteredIds = filterAttr(aud.demog, attrName, attrValue).map(function(d) { return d.temp_id; })
    });

    let tmpData = [];
    targetAuds.forEach(function(aud, i) {
        barChartAttributesList.forEach(function(att) {
            tmpData = filterAttr(aud.demog, attrName, attrValue);
            filteredData[i][att] = indexAttr(att,indexCats[att],tmpData,randomDemog);
            filteredData[i]["state"] = indexAttr("state", indexCats["state"], tmpData, randomDemog);
        });
        sBarChartAttributesList.forEach(function(att) {
            tmpData = filterAttr(aud.demog, attrName, attrValue);
            filteredData[i][att] = indexAttr(att,indexCats[att],tmpData,randomDemog);
        });

        tmpData = []
        orderedTargetFilter(aud.interests, filteredData[i].filteredIds, tmpData);
        filteredData[i]["interests"] = indexInterestsMedia("interests", tmpData, randomInterests);

        tmpData = []
        orderedTargetFilter(aud.media, filteredData[i].filteredIds, tmpData);
        filteredData[i]["media"] = indexInterestsMedia("media", tmpData, randomMedia);

        filteredData[i]["ageStat"] = getMedianCategory(filteredData[i].age);
        filteredData[i]["childrenStat"] = getNonZeroPct(filteredData[i].children);
        filteredData[i]["incomeStat"] = getMedianCategory(filteredData[i].income);
    })

    targetAuds.forEach(function(aud, i) {
        if (targetAuds.length > 1) {
            filteredData[i].topState = indexStatesTop5(...getCompIndexes(filteredData, 'state', i));
            filteredData[i].topInterests = indexInterestsMediaTop5(...getCompIndexes(filteredData, 'interests', i));
            filteredData[i].topMedia = indexInterestsMediaTop5(...getCompIndexes(filteredData, 'media', i));
        } else {
            filteredData[i].topInterests = [indexInterestsMediaTop5(...getCompIndexes(filteredData, "interests", i))];
            filteredData[i].topMedia = [indexInterestsMediaTop5(...getCompIndexes(filteredData, "media", i))];
        }

    });


    demogAttributesList.forEach(function(demogAttributeListName) {

        if (attrName != demogAttributeListName) {
            /* reset opacity */
            d3.selectAll("#"+demogAttributeListName+"Chart svg rect").style("opacity", 1);

          }
        });


    demogAttributesList.forEach(function(demogAttributeListName) {
      if (attrName != demogAttributeListName && demogAttributeListName) {


        // update charts
        if ( barChartAttributesList.includes(demogAttributeListName) ) {

              let innerWidth = 400;
              if (demogAttributeListName == "income") {
              	  innerWidth = 610;
              }

            	let basics = barChartSetup(innerWidth);
            	let margin = basics.margin,
                  width = basics.width,
                  height = basics.height,
              		barPadding = basics.barPadding * 2;

              let barWidth = width / (filteredData[0][demogAttributeListName].length * numSeries);

              let xScale = d3.scaleLinear()
                             .domain([0, filteredData[0][demogAttributeListName].length])
                             .range([0, width]);

              let thisMax = 0;
              let largest = 0;
              filteredData.forEach(function (aud) {
                thisMax = d3.max(aud[demogAttributeListName], function(d) { return d.target_pct; });
                largest = Math.max(thisMax, largest);
              })
              let yScale = d3.scaleLinear()
                             .domain([0, largest])
                             .range([height, 0]);

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
                plot.selectAll("rect.series"+(series+1))
                    .data(data)
                    .transition()
                    .duration(750)
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
                    .attr("target-pct", function(d) { return d.target_pct; })
                    .attr("index", function(d) { return d.index; });
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

                  plot.selectAll("text.series"+(series+1))
                	    .data(data)
                	    .transition()
                      .duration(750)
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
                	    .attr("font-family", "sans-serif")
                	    .attr("fill", function(d) { return textInside(d) ? "white" : "#505050" });
              }

              filteredData.forEach(function(aud, i) {
                  updateBar(aud[demogAttributeListName], i, DS_VIS_STORE.seriesColors[i]);
                  updateBarText(aud[demogAttributeListName], i);
              })

        } else if ( sBarChartAttributesList.includes(demogAttributeListName) ) {
            d3.select("#"+demogAttributeListName+"Chart svg").remove();

            if (targetAuds.length > 1) {
                hBarBalanceChart(demogAttributeListName,getAnyIndexArray(filteredData, demogAttributeListName));
            } else {
                pieChart(demogAttributeListName, [filteredData[0][demogAttributeListName]][0]);
            }


        } else if ( hBarChartAttributesList.includes(demogAttributeListName) ) {
            d3.select("#"+demogAttributeListName+"Chart svg").remove();
        }
    } else {
      // update stats
      $( "#" + demogAttributeListName + "Chart" )
        .prev(".tile-header")
        .find(".ds-stats")
        .css("opacity", 0);
    }
  });

  if (targetAuds.length > 1) {
      hBarChart("state",630,getTopIndexArray(filteredData, "topState", DS_VIS_STORE["stateActive"][0] - 1),hasToggle=true);
  } else {
      mapChart("state", [filteredData[0].state][0]);
  }

  hBarChart("interests",630,getTopIndexArray(filteredData, "topInterests", DS_VIS_STORE["interestsActive"][0] - 1),hasToggle=true);
  hBarChart("media",630,getTopIndexArray(filteredData, "topMedia", DS_VIS_STORE["mediaActive"][0] - 1),hasToggle=true);

  if (attrName != "age") {
      addSeriesStats("age", getStatArray(filteredData, "age"), prefix = "Median: ", suffix = " years");
  }
  if (attrName != "children") {
      addSeriesStats("children", getStatArray(filteredData, "children"), prefix = "Child present: ", suffix = "%");
  }
  if (attrName != "income") {
      addSeriesStats("income", getStatArray(filteredData, "income"), prefix = "Median: ");
  }

    // update the wave chart
    let indexes = []
    filteredData.forEach(function(aud) {
      indexes.push({
        age: aud.age,
        gender: aud.gender,
        ethnicity: aud.ethnicity,
        children: aud.children,
        education: aud.education,
        income: aud.income,
        state: aud.state,
        interests: aud.topInterests[0],
        media: aud.topMedia[0]
      });
    });
    dnaChart(indexes,barWidth=DS_VIS_STORE.dnaBarWidths[DS_VIS_STORE.activeView - 1]);

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
        "media": "media"
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
