let DS_VIS_STORE = {
    activeFilter: null,
    stateActive: [1,2],
    interestsActive: [1,2],
    retailActive: [1,2],
    activeView: "single",
    scaleWeight: 1
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
    if (index > 120) {
        return colorOverIndex;
    } else if (index > 80) {
        return colorNeutralIndex1;
    } else if (index == 0) {
        return colorZeroIndex;
    }
    return colorUnderIndex;
}
function colorByIndexPie(index, indexCats, attrValue) {
    if (index > 120) {
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

function barChart(attrName, indexDs) {
  let innerWidth = 400;
  if (attrName == "income") {
  	  innerWidth = 610;
  }
	let basics = barChartSetup(innerWidth);
	let margin = basics.margin,
      width = basics.width,
      height = basics.height,
  		barPadding = basics.barPadding;

  let firstDatasetBarChart = indexDs;

	let xScale = d3.scaleLinear()
                 .domain([0, firstDatasetBarChart.length])
					       .range([0, width]);

	let yScale = d3.scaleLinear()
		             .domain([0, d3.max(firstDatasetBarChart, function(d) { return d.target_pct; })])
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
	plot.selectAll("rect")
      .data(firstDatasetBarChart)
		  .enter()
		  .append("rect")
			.attr("x", function(d, i) {
			     return xScale(i);
			})
		  .attr("width", width / firstDatasetBarChart.length - barPadding)
			.attr("y", function(d) {
			     return yScale(d.target_pct);
			})
			.attr("height", function(d) {
			    return height-yScale(d.target_pct);
			})
			.attr("fill", function(d) {
          return colorByIndexBar(d.index);
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
	plot.selectAll("text")
	    .data(firstDatasetBarChart)
	    .enter()
	    .append("text")
	    .text(function(d) {
			     return formatAsInteger(d3.format("d")(d.index));
	    })
	    .attr("text-anchor", "middle")
	    /* Set x position to the left edge of each bar plus half the bar width */
	    .attr("x", function(d, i) {
			     return (i * (width / firstDatasetBarChart.length)) + ((width / firstDatasetBarChart.length - barPadding) / 2);
	    })
	    .attr("y", function(d) {
			     return textInside(d) ? yScale(d.target_pct) + 14 : yScale(d.target_pct) - 7;
	    })
	    .attr("class", "yAxis")
	    .attr("font-family", "sans-serif")
	    .attr("font-size", "11px")
	    .attr("fill", function(d) { return textInside(d) ? "white" : "#505050" })
      .on("mouseover", mouseover)
      .on("mouseout", mouseup)
      .on("mousemove", mouseover);

	/* Add x labels to chart */
	let xLabels = svg.append("g")
		               .attr("transform", "translate(" + margin.left + "," + (margin.top + height)  + ")");

	xLabels.selectAll("text.xAxis")
		     .data(firstDatasetBarChart)
		     .enter()
		     .append("text")
		     .text(function(d) { return d.attrib_value;})
		     .attr("text-anchor", "middle")
			   /* Set x position to the left edge of each bar plus half the bar width */
				 .attr("x", function(d, i) {
				       return (i * (width / firstDatasetBarChart.length)) + ((width / firstDatasetBarChart.length - barPadding) / 2);
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
       //tooltip.style('opacity', 0);
       DS_VIS_STORE["activeFilter"] = null;
       drawCharts();
       showActiveFilter(DS_VIS_STORE);
     } else {
       var t0 = performance.now();
       updateCharts(attrName, d.attrib_value);
       var t1 = performance.now();
     }
	}


  function mouseover(d) {
    // let ttipsvg = d3.select("#"+attrName+"Chart").node()
    // let bound = ttipsvg.getBoundingClientRect();
    // let tipX = d3.event.clientX - bound.x + 130;
    // let tipY = d3.event.clientY - bound.y + 320;
    // var tooltipSpan = document.getElementById('tooltip-span');
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
        .style('left', `${tipX}`)
        .style('top', `${tipY}`);
    // };
    // let tipX = d3.mouse(this)[0] + 10;//d3.event.clientX - bound.x + 30;
    // let tipY = d3.mouse(this)[1] + 20;//d3.event.clientY - bound.y - 20;
    // if (width - tipX < 50) {
    //     tipX = d3.mouse(this)[0] - 60;//d3.event.clientX - bound.x - 100;
    // }

  }

  function mouseup(d) {
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


/*
// Modified Legend Code from Mike Bostock: http://bl.ocks.org/mbostock/3888852
var legend = d3.select("body").append("svg")
      			.attr("class", "legend")
     			.attr("width", 140)
    			.attr("height", 200)
   				.selectAll("g")
   				.data(color.domain().slice().reverse())
   				.enter()
   				.append("g")
     			.attr("transform", function(d, i) { return "translate(0," + i * 20 + ")"; });

  	legend.append("rect")
   		  .attr("width", 18)
   		  .attr("height", 18)
   		  .style("fill", color);

  	legend.append("text")
  		  .data(legendText)
      	  .attr("x", 24)
      	  .attr("y", 9)
      	  .attr("dy", ".35em")
      	  .text(function(d) { return d; });
	});
*/

  function mouseover(d) {
      //let ttipsvg = d3.select("#"+attrName+"Chart").node()
      //let bound = ttipsvg.getBoundingClientRect();
      // let tipX = d3.mouse(this)[0] + 50;//d3.event.clientX - bound.x + 30;
      // let tipY = d3.mouse(this)[1] - 30;//d3.event.clientY - bound.y - 20;
      // if (width - tipX < 50) {
      //     tipX = d3.mouse(this)[0] - 80;//d3.event.clientX - bound.x - 100;
      // }

      let e = window.event;
      var x = e.clientX,
          y = e.clientY;
      let tipY = (y - 60) + 'px';
      let tipX = (x) + 'px';
      if  (window.innerWidth - x < 200) {
        tipX = (x - 130) + 'px';
      }

      tooltip.html(d.properties.name + "<br/>" + "Target Pct: " + d.properties.target_pct + "%<br/>"  + "Index: " + d.properties.index)
          .style("opacity", .9)
          .style('left', `${(tipX)}`)
          .style('top', `${(tipY)}`);
  }

  function mouseout() {
      tooltip.style('opacity', 0);
  }

};


/*******************************************************************************
*** HORIZONTAL BAR CHART *******************************************************
*******************************************************************************/
function hBarChart(attrName, indexDs) {
    $("#"+attrName+"Chart .ds-toggle-button").css("display", "none");
    $("#"+attrName+"Chart .ds-hbar-status").text("Top 5 By Index");
  let innerWidth = 630;

	let basics = barChartSetup(innerWidth);
	let margin = basics.margin,
      width = basics.width * DS_VIS_STORE["scaleWeight"] +30,
      height = basics.height * DS_VIS_STORE["scaleWeight"] + 10,
  		barPadding = basics.barPadding;

  let firstDatasetBarChart = indexDs;
  //let maxAttrLength = d3.max(firstDatasetBarChart, function(d) { return d.attrib_value.length; }) * 9;
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



  //xAxisElement.selectAll("text").remove()

  /* Remove vertical and extra horizontal gridlines */
  svg.selectAll(".domain").remove()



  function mouseover(d) {
    //let ttipsvg = d3.select("#"+attrName+"Chart").node()
    //let bound = ttipsvg.getBoundingClientRect();
    // let tipX = d3.mouse(this)[0] + 50;//d3.event.clientX - bound.x + 30;
    // let tipY = d3.mouse(this)[1] - 30;//d3.event.clientY - bound.y - 20;
    // if (width - tipX < 50) {
    //     tipX = d3.mouse(this)[0] - 80;//d3.event.clientX - bound.x - 100;
    // }
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
*** WAVE CHART *****************************************************************
*******************************************************************************/
function waveChart(ds) {

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

  let traces = [];
  let attrNames = Object.keys(ds);

  attrNames.forEach(function(attrName, i){
    traces[i] = {
      name: attrName,
      x: unpack(ds[attrName], 'index'),
      y: unpack(ds[attrName], 'target_pct'),
      base: unpack(ds[attrName], 'target_pct').map(x => -x/2),
      width: 6,
      type: 'bar',
      marker: {
        color: unpack(ds[attrName], 'index').map(x => colorByIndexBar(x)),
        opacity: 0.5
      },
     hovertext: makeToolTips(ds[attrName], attrName),
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
	let width = "100%";
  //let width = 1260;

  let layout = {
    hovermode:'closest',
    // height: height,
    // width: "100%",
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
    }
    ]
  };

  Plotly.newPlot("waveChart", traces, layout, {displayModeBar: false, responsive: true});

}



/*******************************************************************************
*** MIKEJ CHART ****************************************************************
*******************************************************************************/
function mikeJChart(attrName, indexDs) {
  // sort data alphabetically by category
  indexDs.sort((a, b) => b.category.localeCompare(a.category));

  // tooltip values
  let toolTipValues = indexDs.map(function(row) {
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

  let trace = {
    x: unpack(indexDs, 'index'),
    y: unpack(indexDs, 'category'),
    mode: 'markers',
    type: 'scatter',
    marker: {
      size: unpack(indexDs, 'target_pct').map(x => Math.sqrt(x)*5),
      color: unpack(indexDs, 'index').map(x => colorByIndexBar(x)),
      opacity: 0.5,
      line: {width: 0}
    },
    hovertext: toolTipValues,
    custom: "test",
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
  let allCats = [...new Set( unpack(indexDs, 'category') )];
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
  Plotly.newPlot(chartName, [trace], layout, {displayModeBar: false, responsive: true});
}

/*******************************************************************************
*** ADD STATS ******************************************************************
*******************************************************************************/
function addStat(attrName, stat, prefix='', suffix='') {
  // remove existing stats, if any
  $( "#" + attrName + "Chart" )
    .prev(".tile-header")
    .find(".ds-stats")
    .remove();
  $( "#" + attrName + "Chart" )
    .prev(".tile-header")
    .append("<div class='ds-stats'>" + prefix + stat + suffix + "</div>");
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
  $(".ds-current-filter").text(store["activeFilter"] != null ? cat + ": " + store["activeFilter"][1] : "Click chart item to apply filter.");
}

function removeActiveFilter(store) {
  store["activeFilter"] = null;
  if (store["activeView"] == "single") {
    drawCharts();
  } else {
    drawComparisonCharts();
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

  if (selectedAudiences.length > 0 & selectedAudiences.length >= 2) {
    DS_VIS_STORE["activeView"] = "compare";
  } else if (selectedAudiences.length == 1){
    DS_VIS_STORE["activeView"] = "single";
  }

  if (selectedAudiences.length == 0) {
    DS_VIS_STORE["activeView"] = null;
  }

  DS_VIS_STORE["activeFilter"] = null;
  $(".ds-current-filter").text("Click chart item to apply filter.");
  $(".ds-filter-tip").css("display","");
  $(".ds-current-filter-remove").css("display", "none");
});

/*******************************************************************************
*** ADD AUDIENCE TITLE *********************************************************
*******************************************************************************/
function addAudienceTitle(targetAud) {
  // remove existing title, if any
  $( ".ds-audience-title h1" ).remove();

  // add audience title
  $( ".ds-audience-title" ).append("<h1>" + targetAud.name + "</h1>");
}

/*******************************************************************************
*** DRAW ALL CHARTS ************************************************************
*******************************************************************************/
function drawCharts() {

  // current_width = window.innerWidth;
  //
  // if (current_width >= 1550) {
  //   console.log(current_width)
  //     DS_VIS_STORE["scaleWeight"] = 1;
  // } else if (current_width >= 960) {
  //     DS_VIS_STORE["scaleWeight"] = 1;
  // } else {
  //     console.log(current_width)
  //     DS_VIS_STORE["scaleWeight"] = 1;
  // }

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

  waveChart(indexes);

  let myPlot = document.getElementById('waveChart');
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

  barChart("age", ageIndex0);
  addStat("age", ageMedianCat, prefix = "<span style='color: #000;'><strong>Median: </strong></span>", suffix = " years");
  barChart("ethnicity", ethnicityIndex0);
  barChart("children", childrenIndex0);
  addStat("children", childrenNonZeroPct, prefix = "<strong>Child present: </strong>", suffix = "%");
  barChart("education", educationIndex0);
  barChart("income", incomeIndex0);
  addStat("income", incomeMedianCat, prefix = "<strong>Median: </strong>");
  pieChart("gender", genderIndex0);
  pieChart("marital", maritalIndex0);
  mapChart("state", stateIndex0);
  hBarChart("interests", interestsIndexTop0);
  hBarChart("retail", retailIndexTop0);

  $( ".tile" ).removeClass("selected-tile");

  mikeJChart('interests', interestsIndexBubble0);
  mikeJChart('retail', retailIndex0);
}

function resetCharts() {
    if (DS_VIS_STORE["activeView"] == "single") {
        drawCharts();
    } else if (DS_VIS_STORE["activeView"]) {
        drawComparisonCharts();
    }
}

/* Reset dashboard charts if filter was left on when switching to bubble */
$("#interests-tab").click(function() {
    if (DS_VIS_STORE.activeFilter != null) {
        DS_VIS_STORE.activeFilter = null;
        showActiveFilter(DS_VIS_STORE);
        resetCharts();
    }
    $(".ds-current-filter").text("");
    $(".ds-filter-tip").css("display","none");
});

$("#retail-tab").click(function() {
    if (DS_VIS_STORE.activeFilter != null) {
        DS_VIS_STORE.activeFilter = null;
        showActiveFilter(DS_VIS_STORE);
        resetCharts();
    }
    $(".ds-current-filter").text("");
    $(".ds-filter-tip").css("display","none");
});

$("#dashboard-tab").click(function() {
  showActiveFilter(DS_VIS_STORE);
});




//$("#dashboard-tab").click(function() {
    //console.log(DS_VIS_STORE)
    // if (DS_VIS_STORE["activeView"] == "single" && DS_VIS_STORE["activeFilter"] != null) {
    //     DS_VIS_STORE.activeFilter = null;
    //     drawCharts();
    // } else if (DS_VIS_STORE["activeView"] && DS_VIS_STORE["activeFilter"] != null) {
    //     DS_VIS_STORE.activeFilter = null;
    //     drawComparisonCharts();
    // }

// })



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
        var t3 = performance.now();
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
              // let targetPos = 0;
              //   filteredIds.forEach(function(id) {
              //     while (+targetInterests[targetPos]["temp_id"] < id) {
              //       targetPos++;
              //     }
              //     while (+targetInterests[targetPos]["temp_id"] == id) {
              //       filteredData.push(targetInterests[targetPos]);
              //       if (targetPos + 1 < targetInterests.length) {
              //         targetPos++;
              //       } else {
              //         break;
              //       }
              //
              //     }
              //   });
              //filteredData = targetInterests.filter(function(d) { return filteredIds.includes(d["temp_id"]); });
              attrIndex = indexInterestsRetail(demogAttributeListName, filteredData, randomInterests);
            } else if (demogAttributeListName == "retail"){
              var t0 = performance.now();

              orderedTargetFilter(targetRetail, filteredIds, filteredData);

              // let targetPos = 0;
              //   filteredIds.forEach(function(id) {
              //     while (+targetRetail[targetPos]["temp_id"] < id) {
              //       targetPos++;
              //     }
              //     while (+targetRetail[targetPos]["temp_id"] == id) {
              //       filteredData.push(targetRetail[targetPos]);
              //       if (targetPos + 1 < targetRetail.length) {
              //         targetPos++;
              //       } else {
              //         break;
              //       }
              //     }
              //   });


                // function objectsAreSame(x, y) {
                //    var objectsAreSame = true;
                //    for(var propertyName in x) {
                //       if(x[propertyName] !== y[propertyName]) {
                //          objectsAreSame = false;
                //          break;
                //       }
                //    }
                //    return objectsAreSame;
                // }

                /* old way */
                // let filteredData2 = []
                // filteredData2 = targetRetail.filter(function(d) {  return filteredIds.includes(d["temp_id"]); });
                // console.log("These are the same: " + objectsAreSame(filteredData, filteredData2))

              // filteredData = _.filter(targetRetail, (v) => _.includes(filteredIds, v.temp_id));
              // function filter(a)
              // {
              //     var match = []
              //
              //     for (var i = 0; i < a.length; i++)
              //     {
              //
              //         let tmp = filteredIds.find(function(element) {
              //           return element === a[i]["temp_id"];
              //         });
              //         if ( tmp !== -1 ) match.push(a[i])
              //     }
              //
              //     return match
              // }

              // filteredIds.forEach(function(id) {
              //   filteredData.push(targetRetail.filter(x => x.temp_id === id))
              // });


              // filteredData = targetRetail.filter(function(d) {
              //   return this.indexOf(d["temp_id"]) < 0;
              // },
              // filteredIds
              // );
              // const fastIntersection = (...arrays) => {
              //   // if we process the arrays from shortest to longest
              //   // then we will identify failure points faster, i.e. when
              //   // one item is not in all arrays
              //   const ordered = (arrays.length===1
              //       ? arrays :
              //       arrays.sort((a1,a2) => a1.length - a2.length)),
              //     shortest = ordered[0],
              //     set = new Set(), // used for bookeeping, Sets are faster
              //     result = [], // the intersection, conversion from Set is slow
              //   // for each item in the shortest array
              //   for(let i=0;i<shortest.length;i++) {
              //     const item = shortest[i];
              //     // see if item is in every subsequent array
              //     let every = true; // don't use ordered.every ... it is slow
              //     for(let j=1;j<ordered.length;j++) {
              //       if(ordered[j].includes(item)) continue;
              //       every = false;
              //       break;
              //     }
              //     // ignore if not in every other array, or if already captured
              //     if(!every || set.has(item)) continue;
              //     // otherwise, add to bookeeping set and the result
              //     set.add(item);
              //     result[result.length] = item;
              //   }
              //   return result;
              // }
              // let ids = fastIntersection()
              var t1 = performance.now();

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
      var t4 = performance.now();

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
            addStat("age", ageMedianCat, prefix = "<strong>Median: </strong>", suffix = " years");
        } else if (demogAttributeListName == "children") {
            let childrenNonZeroPct = getNonZeroPct(attrIndex);
            addStat("children", childrenNonZeroPct, prefix = "<strong>Child present: </strong>", suffix = "%");
        } else if (demogAttributeListName == "income") {
            let incomeMedianCat = getMedianCategory(attrIndex);
            addStat("income", incomeMedianCat, prefix = "<strong>Median: </strong>");
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
  waveChart(indexes);



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
