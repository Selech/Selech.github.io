var modelB;
loadCsvFiles(["Data/2B/data-2003.csv", "Data/2B/data-2015.csv"], init2B);

// draws the svg element
function drawB2() {
    // get the size of the svg element
    var w = parseInt(modelB.svg.style("width").replace("px", ""));
    var h = parseInt(modelB.svg.style("height").replace("px", ""));
    var data = modelB.datasets[modelB.datasetIdx];

    // create dynamic scales
    var padding = 45;
    var combined = modelB.datasets[0].concat(modelB.datasets[1]);
    var xScale = d3.scale.linear()
        .domain([0, d3.max(combined, function(d) { return parseInt(d["PROSTITUTION"]); })])
        .range([padding, w - padding]);
    var yScale = d3.scale.linear()
        .domain([0, d3.max(combined, function(d) { return parseInt(d["VEHICLE THEFT"]); })])
        .range([h - padding, padding]);
    var rScale = d3.scale.linear()
        .domain([0, d3.max(combined, function(d) { return parseInt(d["CRIMES"]); })])
        .range([0, 25]);

    // create the circles
    modelB.svg.selectAll("circle")
        .data(data)
        .transition()
        .duration(1100)
        .attr("cx", function(d) {
            return xScale(parseInt(d["PROSTITUTION"]));
        })
        .attr("cy", function(d) {
            return yScale(parseInt(d["VEHICLE THEFT"]));
        })
        .attr("r", function(d) {
            return rScale(parseInt(d["CRIMES"]));
        });

    // create the name labels
    modelB.svg.selectAll("text")
        .data(data)
        .transition()
        .duration(1100)
        .text(function(d) {
            return d["DISTRICT"].substring(0, 3);
        })
        .attr("x", function(d) {
            return xScale(parseInt(d["PROSTITUTION"])) - 11;
        })
        .attr("y", function(d) {
            return yScale(parseInt(d["VEHICLE THEFT"])) - rScale(parseInt(d["CRIMES"])) - 2;
        });

    // Create X axis
    var xAxis = d3.svg.axis()
        .scale(xScale)
        .orient("bottom")
        .ticks(10);
    modelB.svg.select("#x-axis")
        .attr("transform", "translate(0," + (h - padding) + ")")
        .call(xAxis);
    // Create Y axis
    var yAxis = d3.svg.axis()
        .scale(yScale)
        .orient("left")
        .ticks(5);
    modelB.svg.select("#y-axis")
        .attr("transform", "translate(" + padding + ",0)")
        .call(yAxis);
}

// initializes the 2B svg element
function init2B(dataArray) {
    // get the svg element and bind data to it
    var svg = d3.select("#svg-2b");
    var data = dataArray[0];

    modelB = {
        svg: svg,
        datasets: dataArray,
        datasetIdx: 0
    };

    // create the circles
    svg.selectAll("circle")
        .data(data)
        .enter()
        .append("circle")
        .attr("fill", function(d) {
            return mapDistrictsToColors(d["DISTRICT"]);
        });

    // create the name labels
    svg.selectAll("text")
        .data(data)
        .enter()
        .append("text")
        .text(function(d) {
            return d["DISTRICT"].substring(0, 3);
        })
        .attr("font-family", "sans-serif")
        .attr("font-size", "11px")
        .attr("fill", "#3a3a3a");

    // tooltips for svg elements
    $('svg circle').tooltip({
        'container': 'body',
        'placement': 'top',
        'title': function(){
            // get the data object
            var d = d3.select(this).datum();
            return d["DISTRICT"] + "\n Total crimes: " + d["CRIMES"] + "\nProstitution: " + d["PROSTITUTION"] + "\n Vehicle theft: " + d["VEHICLE THEFT"];
        }
    });

    // create the axes
    modelB.svg.append("g")
        .attr("id", "x-axis")
        .attr("class", "axis");
    modelB.svg.append("g")
        .attr("id", "y-axis")
        .attr("class", "axis");

    drawB2();
}

// called when the year of 2B is changed
function setDataB(dataId) {
    modelB.datasetIdx = dataId;
    var year = dataId == 0 ? 2003 : 2015;

    modelB.svg.select("#title")
        .text("Crimes in " + year);

    drawB2();
}
