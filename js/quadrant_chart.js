let tmpData = [
  {domain: 'espn.com', uu_idx: 145, time_spent_idx: 150, pct_uu: 10},
  {domain: 'abc.com', uu_idx: 195, time_spent_idx: 110, pct_uu: 30},
  {domain: 'cnn.com', uu_idx: 115, time_spent_idx: 190, pct_uu: 20},
  {domain: 'twitch.tv', uu_idx: 175, time_spent_idx: 280, pct_uu: 8},
  {domain: 'mattmaresca.com', uu_idx: 445, time_spent_idx: 450, pct_uu: 90},
  {domain: 'nissanusa.com', uu_idx: 105, time_spent_idx: 60, pct_uu: 4},
  {domain: 'annalect.com', uu_idx: 135, time_spent_idx: 15, pct_uu: 25}
]

let selectedDomains = [];



function quadrantChart(data, innerWidth=800) {
    let margin = {top: 50, right: 0, bottom: 20, left: 30};
  	let width = innerWidth - margin.left - margin.right;
    let height = 400;

    let svg = d3.select("#quadrantChart").append("svg")
                .attr("width", width + margin.left + margin.right)
                .attr("height", height + margin.top + margin.bottom)
                .attr("id", "quadrantChartPlot")
                .attr("class", "ds-chart-base");

    let plot = svg.append("g")
                  .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    let largestX = 0;
    data.forEach(function(d) { if (d.uu_idx > largestX) largestX = d.uu_idx })

    let largestY = 0;
    data.forEach(function(d) { if (d.uu_idx > largestY) largestY = d.time_spent_idx })

    let xScale = d3.scaleLinear()
                    .domain([40, largestX])
                    .range([0, width - 100])

    let yScale = d3.scaleLinear()
                    .domain([40, largestY])
                    .range([height - 100, 0])

    console.log(xScale(largestX), xScale(largestY))

    plot.selectAll(".circle")
        .data(data)
        .enter()
        .append("circle")
        .attr("r", function(d) { return d.pct_uu*100 })
        .attr("cx", function(d) { return xScale(d.uu_idx) })
        .attr("cy", function(d) { return yScale(d.time_spent_idx) })
        .attr("fill", "#ffff00")

    plot.selectAll("text.series yAxis")
        .data(data)
        .enter()
        .append("text")
        .attr("class", "series yAxis")
        .text(function(d) {
         return d.domain;
        })
        .attr("text-anchor", "middle")
        /* Set x position to the left edge of each bar plus half the bar width */
        .attr("x", function(d, i) {
            return xScale(d.uu_idx);
        })
        .attr("y", function(d) {
            return yScale(d.time_spent_idx) + 20
        })
      //  .attr("class", "yAxis")
        .attr("font-family", "sans-serif")


    /* Add a y-axis */
    let axis = d3.axisLeft(yScale)
        .ticks(5)
        .tickFormat(function (d) { return d })
        .tickSize(0);

    svg.append("g")
        .attr("transform", "translate(" + (margin.left - 1) + "," + (margin.top - 1) + ")")
        .attr("class", "axis")
        .call(axis);

    /* Add x-axis */
    let xAxis = d3.axisBottom(xScale)
        .tickSize(0)
        .ticks(5)
        .tickFormat(function (d) { return d });

    svg.append("g")
        .attr("class", "xAxis")
        .attr("transform", "translate(" + (margin.left - xScale(100) ) + "," + (margin.top + height - yScale(height - 150)) + ")")
        .call(xAxis);


    $( ".ds-form-picker form" ).change(function() {
      alert( "Handler for .change() called." );
    });




}


// quadrantChart(targetJs, innerWidth=1000);
