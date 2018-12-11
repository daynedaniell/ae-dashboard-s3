
/*******************************************************************************
*** COLORS AND FORMATS *********************************************************
*******************************************************************************/

/* colors */
let colorOverIndex = '#ffb14e',
    colorUnderIndex = '#4880da',
    colorNeutralIndex1 = 'grey',
    colorNeutralIndex2 = 'rgb(192,192,192)',

    colorAudience11 = colorOverIndex,
    colorAudience12 = colorNeutralIndex1,

    colorAudience21 = colorUnderIndex,
    colorAudience22 = colorNeutralIndex2;


/* color-by-index functions */
function colorByIndexBar(index) {
    if (index > 120) {
        return colorOverIndex;
    } else if (index > 80) {
        return colorNeutralIndex1;
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
let formatAsPercentage = d3.format("%"),
    formatAsPercentage1Dec = d3.format(".1%"),
    formatAsInteger = d3.format(",");

/* tooltips */
const tooltip = d3.select("body")
    .append("div")
    .attr("class", "tooltip")
    .style("opacity", 0);


/*******************************************************************************
*** BAR CHART ******************************************************************
*******************************************************************************/

function barChartSetup(innerWidth=360) {
	let margin = {top: 30, right: 5, bottom: 20, left: 10};
	let width = innerWidth - margin.left - margin.right;
  let height = 360 - margin.top - margin.bottom;
	let barPadding = 1;

	return {
		margin : margin,
		width : width,
		height : height,
		barPadding : barPadding
	};
}

function barChart(attrName, indexDs) {
  let innerWidth = 360;
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
              .attr("id", attrName+"ChartPlot");

	let plot = svg.append("g")
		            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

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
			     return yScale(d.target_pct) + 14;
	    })
	    .attr("class", "yAxis")
	    .attr("font-family", "sans-serif")
	    .attr("font-size", "11px")
	    .attr("fill", "white");

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

  function up(d, i) {
	   /* update all charts when user selects a single bar in this chart */
     /* if clicking on already selected item, then reset the charts */
     isSelected = d3.select(".selected-tile #"+attrName+"Chart rect[attrib-value='"+d.attrib_value+"'][selected='yes']")._groups[0][0];
     if (isSelected){
       drawCharts();
     } else {
       updateCharts(attrName, d.attrib_value);
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
*** PIE CHART ******************************************************************
*******************************************************************************/

function pieChart(attrName, indexDs){
  let width = 300,
		  height = 300,
		  outerRadius = Math.min(width, height) / 2,
      innerRadius = outerRadius * .999,
      innerRadiusFinal = outerRadius * .5,
      innerRadiusFinal3 = outerRadius* .45;


	let vis = d3.select("#"+attrName+"Chart")
              .append("svg:svg")
              .data([indexDs])          /* associate our data with the document */
              .attr("width", width)
              .attr("height", height)
              .append("svg:g")          /* make a group to hold our pie chart */
              .attr(
                "transform",
                "translate(" + outerRadius + "," + outerRadius + ")"
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

                .on("mouseover", mouseover)
                .on("mouseout", mouseout)
                .on("mousemove", mouseover)
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
      .text(function(d) { return d.data.attrib_value + ": " + formatAsPercentage(d.data.target_pct); });

  d3.selectAll("g.slice").selectAll("path").attr("d", arcFinal );

  /* Add a label to the larger arcs, translated to the arc centroid and rotated.
  // source: http://bl.ocks.org/1305337#index.html */
  arcs.filter(function(d) { return d.endAngle - d.startAngle > .2; })
      .append("svg:text")
	    .attr("dy", ".35em")
      .attr("text-anchor", "middle")
	    .attr("transform", function(d) { return "translate(" + arcFinal.centroid(d) + ")"; })
	    .text(function(d) { return d.data.attrib_value; });


  function mouseover(d) {
    let name = d.data.attrib_value;
    if (attrName === 'gender') {
      name = (d.data.attrib_value === 'F') ? 'Female' : 'Male';
    }
    tooltip.transition()
        .duration(200)
        .style("opacity", .9);
    tooltip.html(name + "<br/>" + "Target Pct: " + d.data.target_pct + "% <br/>"  + "Index: " + d.data.index)
        .style('left', `${(d3.event.pageX + 5)}px`)
        .style('top', `${(d3.event.pageY - 50)}px`);
  }

  function mouseout() {
      tooltip.transition(300).style('opacity', 0);
  }



  function up(d, i) {
      /* update all charts when user selects piece of the pie chart */
      /* if clicking on already selected item, then reset the charts */
      isSelected = d3.select(".selected-tile #"+attrName+"Chart path[attrib-value="+d.data.attrib_value+"][selected='yes']")
                     ._groups[0][0];
      if (isSelected){
        drawCharts();
      } else {
        updateCharts(attrName, d.data.attrib_value);
      }
  }
}


/*******************************************************************************
*** MAP CHART ******************************************************************
*******************************************************************************/

function mapChart(attrName, indexDs) {
  //Width and height of map
  let width = 600;
  let height = 360;

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
			        .attr("height", height);

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
        return colorByIndexBar(d.properties.index);
    })
    .attr("attrib-value", function(d) { return d.properties.code; })    /* storing the Acxiom attrib value on the element */

    .on("mouseover", mouseover)
    .on("mouseout", mouseout)
    .on("mousemove", mouseover)
    .on("click", up)

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


  function up(d, i) {
      /* update all charts when user selects piece of the map chart */
      updateCharts(attrName, d.properties.code);
      }

  function mouseover(d) {
    tooltip.transition()
        .duration(200)
        .style("opacity", .9);
    tooltip.html(d.properties.name + "<br/>" + "Target Pct: " + d.properties.target_pct + "%<br/>"  + "Index: " + d.properties.index)
        .style('left', `${(d3.event.pageX + 5)}px`)
        .style('top', `${(d3.event.pageY - 50)}px`);
  }

  function mouseout() {
      tooltip.transition(300).style('opacity', 0);
  }


};


/*******************************************************************************
*** HORIZONTAL BAR CHART *******************************************************
*******************************************************************************/
function hBarChart(attrName, indexDs) {
  let innerWidth = 610;

	let basics = barChartSetup(innerWidth);
	let margin = basics.margin,
      width = basics.width,
      height = basics.height,
  		barPadding = basics.barPadding;

  let firstDatasetBarChart = indexDs;
  //let maxAttrLength = d3.max(firstDatasetBarChart, function(d) { return d.attrib_value.length; }) * 9;
  let maxAttrLength = width / 2;

	let yScale = d3.scaleLinear()
                 .domain([0, firstDatasetBarChart.length])
					       .range([0, height]);

	let xScale = d3.scaleLinear()
		             .domain([0, d3.max(firstDatasetBarChart, function(d) { return d.target_pct; })])
		             .range([0, width-maxAttrLength]);

	/* Create SVG element */
  let svg = d3.select("#"+attrName+"Chart")
              .append("svg")
		          .attr("width", width + margin.left + margin.right)
              .attr("height", height + margin.top + margin.bottom)
              .attr("id", attrName+"ChartPlot");

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
      .on("click", up)

      .attr("attrib-category", function(d) { return d.category; })
      .attr("target-pct", function(d) { return d.target_pct; })
      .attr("index", function(d) { return d.index; })
      ;



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
	    .attr("x", function(d) {
			     return maxAttrLength + xScale(d.target_pct) - 20;
	    })
	    .attr("class", "xAxis")
	    .attr("font-family", "sans-serif")
	    .attr("font-size", "11px")
	    .attr("fill", "white");

	/* Add y labels to chart */
	let yLabels = svg.append("g")
		               .attr("transform", "translate(" + margin.left + "," + (margin.top)  + ")");

	yLabels.selectAll("text.yAxis")
		     .data(firstDatasetBarChart)
		     .enter()
		     .append("text")
		     .text(function(d) { return d.attrib_value;})
		     .attr("text-anchor", "start")
			   /* Set y position to the top edge of each bar plus half the bar width */
				 .attr("y", function(d, i) {
				       return (i * (height / firstDatasetBarChart.length)) + ((height / firstDatasetBarChart.length - barPadding) / 2);
				 })
		     .attr("x", 0)
		     .attr("class", "yAxis");


  function up(d, i) {
	   /* update all charts when user selects a single bar in this chart */
     updateCharts(attrName, d.attrib_value);
	}

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
*** DRAW ALL CHARTS **********************************************************
*******************************************************************************/
function drawCharts() {

  let indexCats = makeIndexCats();
  let demogAttributesList = Object.keys(indexCats);

  demogAttributesList.forEach(function(demogAttributeListName) {
    d3.select("#"+demogAttributeListName+"Chart svg").remove();
  });

  let ageIndex0 = indexAttr("age", indexCats.age, targetDemog, randomDemog);
  let genderIndex0 = indexAttr("gender", indexCats.gender, targetDemog, randomDemog);
  let ethnicityIndex0 = indexAttr("ethnicity", indexCats.ethnicity, targetDemog, randomDemog);
  let maritalIndex0 = indexAttr("marital", indexCats.marital, targetDemog, randomDemog);
  let childrenIndex0 = indexAttr("children", indexCats.children, targetDemog, randomDemog);
  let educationIndex0 = indexAttr("education", indexCats.education, targetDemog, randomDemog);
  let incomeIndex0 = indexAttr("income", indexCats.income, targetDemog, randomDemog);
  let stateIndex0 = indexAttr("state", indexCats.state, targetDemog, randomDemog);
  let interestsIndex0 = indexInterestsRetail("interests", targetInterests, randomInterests);
  let interestsIndexTop0 = indexInterestsRetailTop5(interestsIndex0);
  let retailIndex0 = indexInterestsRetail("retail", targetRetail, randomRetail);
  let retailIndexTop0 = indexInterestsRetailTop5(retailIndex0);

  barChart("age", ageIndex0);
  barChart("ethnicity", ethnicityIndex0);
  barChart("children", childrenIndex0);
  barChart("education", educationIndex0);
  barChart("income", incomeIndex0);
  pieChart("gender", genderIndex0);
  pieChart("marital", maritalIndex0);
  mapChart("state", stateIndex0);
  hBarChart("interests", interestsIndexTop0);
  hBarChart("retail", retailIndexTop0);

}


/*******************************************************************************
*** UPDATE ALL CHARTS **********************************************************
*******************************************************************************/

/* updates bar charts when a value element is clicked on a chart */
function updateCharts(attrName, attrValue) {
//  console.log(attrName);
//  console.log(attrValue);
  let attrIndex = [];
  let indexCats = makeIndexCats();

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
              filteredData = targetInterests.filter(function(d) { return filteredIds.includes(d["temp_id"]); });
              attrIndex = indexInterestsRetail(demogAttributeListName, filteredData, randomInterests);
            } else if (demogAttributeListName == "retail"){
              filteredData = targetRetail.filter(function(d) { return filteredIds.includes(d["temp_id"]); });
              attrIndex = indexInterestsRetail(demogAttributeListName, filteredData, randomRetail);
            }
            attrIndexTop = indexInterestsRetailTop5(attrIndex);
          } else {
            let filteredData = filterAttr(targetDemog, attrName, attrValue);
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


      if ( barChartAttributesList.includes(demogAttributeListName) ) {
          // update bar chart
          var currentDatasetBarChart = attrIndex;
          let innerWidth = 360;
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
          let plot = d3.select("#"+demogAttributeListName+"ChartPlot")
                       .datum(currentDatasetBarChart);

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
          plot.selectAll("text.yAxis")
              .data(currentDatasetBarChart)
              .transition()
              .duration(750)
              .attr("text-anchor", "middle")
              .attr("x", function(d, i) {
                 return (i * (width / currentDatasetBarChart.length)) + ((width / currentDatasetBarChart.length - barPadding) / 2);
              })
              .attr("y", function(d) {
                 return yScale(d.target_pct) + 14;
              })
              .text(function(d) {
               return formatAsInteger(d3.format("d")(d.index));
              })
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
