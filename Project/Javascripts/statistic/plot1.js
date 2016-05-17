var plot1Data;

d3.csv("Data/Statistic/data1.csv", function(data) {
    plot1Data = data;
    initPlot1();
});

function initPlot1() {
    var svg = d3.select("#svg-plot1");

    // get the size of the svg element
    var w = parseInt(svg.style("width").replace("px", ""));
    var h = parseInt(svg.style("height").replace("px", ""));

    // dimensions for the top and bottom plot (movies and locations)
    var offsetX = 80;
    var offsetY = 35;
    var padding = 15;
    var plotHeight = (h - offsetY - 3 * padding) / 2;
    var dimTop = [[padding + offsetX, w - offsetX - 2 * padding], [padding, plotHeight]];
    var dimBottom = [[padding + offsetX, w - offsetX - 2 * padding], [plotHeight + 2 * padding, plotHeight]];

    // create dynamic scales
    var xScale = d3.scale.linear()
        .domain([1915, 2017])
        .range([padding + offsetX, w - padding]);

    // create the axes
    svg.append("g")
        .attr("id", "x-axis")
        .attr("class", "axis");
    svg.append("g")
        .attr("id", "y-axis")
        .attr("class", "axis");

    // Create X axis
    var xAxis = d3.svg.axis()
        .scale(xScale)
        .orient("bottom");
    svg.append("g")
        .attr("class", "axis")
        .attr("transform", "translate(0," + (h - offsetY - padding) + ")")
        .call(xAxis);
    // label
    svg.append("text")
        .attr("class", "axis")
        .attr("text-anchor", "center")
        .attr("x", w / 2)
        .attr("y", h - (offsetY - padding) / 2 - 10)
        .text("year");

    createMoviesBars(svg, plot1Data, dimTop, xScale);
    createLocationsBars(svg, plot1Data, dimBottom, xScale);
}

function createMoviesBars(svg, data, dims, xScale) {

    var yScale = d3.scale.linear()
        .domain([0, d3.max(data, function(d) { return parseInt(d["movies"]); })])
        .range([dims[1][0] + dims[1][1], dims[1][0]]);

    // create the bars
    svg.selectAll(".bar")
        .data(data)
        .enter()
        .append("rect")
        .attr("class", "bar")
        .attr("class", "movie")
        .attr("fill", "#FFB31A")
        .on("mouseover", function(d, i1) {
            d3.selectAll("rect.location").filter(function(d, i2) {
                return i1 == i2;
                })
                .transition()
                .duration(250)
                .attr("opacity", "0.4");

            d3.select(this)
                .transition()
                .duration(250)
                .attr("opacity", "0.4");

            $('rect.location').filter(function(i2) {
                return i2 == i1;
            }).tooltip('show');
        })
        .on("mouseout", function(d, i1) {
            d3.selectAll("rect.location").filter(function(d, i2) {
                    return i1 == i2;
                })
                .transition()
                .duration(250)
                .attr("opacity", "1.0");

            d3.select(this)
                .transition()
                .duration(250)
                .attr("opacity", "1.0");

            $('rect.location').filter(function(i2) {
                return i2 == i1;
            }).tooltip('hide');
        })
        .attr("x", function(d) {
            return xScale(parseInt(d["year"]));
        })
        .attr("y", function(d) {
            return yScale(parseInt(d["movies"]))
        })
        .attr("width", dims[0][1] / (2017 - 1915) * 0.85)
        .attr("height", function(d) {
            return dims[1][0] + dims[1][1] - yScale(parseInt(d["movies"]));
        });

    // Create Y axis
    var yAxis = d3.svg.axis()
        .scale(yScale)
        .orient("left")
        .ticks(5);
    svg.append("g")
        .attr("id", "y-axis")
        .attr("class", "axis")
        .attr("transform", "translate(" + dims[0][0] + ",0)")
        .call(yAxis);
    // label
    svg.append("text")
        .attr("class", "axis")
        .attr("text-anchor", "end")
        .attr("x", dims[0][0] - 30)
        .attr("y", dims[1][0] + dims[1][1] / 2)
        .text("movies");

    // tooltips for svg elements
    $('svg rect.movie').tooltip({
        'container': 'body',
        'placement': 'top',
        'title': function(){
            // get the data object
            var d = d3.select(this).datum();
            return "year: " + d["year"] + "\n movies: " + d["movies"];
        }
    });
}

function createLocationsBars(svg, data, dims, xScale) {
    var yScale = d3.scale.linear()
        .domain([0, d3.max(data, function(d) { return parseInt(d["locations"]); })])
        .range([dims[1][0] + dims[1][1], dims[1][0]]);

    // create the bars
    svg.selectAll(".bar")
        .data(data)
        .enter()
        .append("rect")
        .attr("class", "bar")
        .attr("class", "location")
        .attr("fill", "#FF3366")
        .on("mouseover", function(d, i1) {
            d3.selectAll("rect.movie").filter(function(d, i2) {
                    return i1 == i2;
                })
                .transition()
                .duration(250)
                .attr("opacity", "0.4");

            d3.select(this)
                .transition()
                .duration(250)
                .attr("opacity", "0.4");

            $('rect.movie').filter(function(i2) {
                return i2 == i1;
            }).tooltip('show');
        })
        .on("mouseout", function(d, i1) {
            d3.selectAll("rect.movie").filter(function(d, i2) {
                    return i1 == i2;
                })
                .transition()
                .duration(250)
                .attr("opacity", "1.0");

            d3.select(this)
                .transition()
                .duration(250)
                .attr("opacity", "1.0");

            $('rect.movie').filter(function(i2) {
                return i2 == i1;
            }).tooltip('hide');
        })
        .attr("x", function(d) {
            return xScale(parseInt(d["year"]));
        })
        .attr("y", function(d) {
            return yScale(parseInt(d["locations"]))
        })
        .attr("width", dims[0][1] / (2017 - 1915) * 0.85)
        .attr("height", function(d) {
            return dims[1][0] + dims[1][1] - yScale(parseInt(d["locations"]));
        });

    // Create Y axis
    var yAxis = d3.svg.axis()
        .scale(yScale)
        .orient("left")
        .ticks(5);
    svg.append("g")
        .attr("id", "y-axis")
        .attr("class", "axis")
        .attr("transform", "translate(" + dims[0][0] + ",0)")
        .call(yAxis);
    // label
    svg.append("text")
        .attr("class", "axis")
        .attr("text-anchor", "end")
        .attr("x", dims[0][0] - 30)
        .attr("y", dims[1][0] + dims[1][1] / 2)
        .text("locations");

    // tooltips for svg elements
    $('svg rect.location').tooltip({
        'container': 'body',
        'placement': 'top',
        'title': function(){
            // get the data object
            var d = d3.select(this).datum();
            return "year: " + d["year"] + "\n locations: " + d["locations"];
        }
    });
}