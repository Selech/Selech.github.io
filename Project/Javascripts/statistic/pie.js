d3.csv("Data/Statistic/data2.csv", initPlot2);

function initPlot2(data) {
    var svg = d3.select("#svg-plot1");

    // get the size of the svg element
    var w = parseInt(svg.style("width").replace("px", ""));
    var h = parseInt(svg.style("height").replace("px", ""));


    // radius for the plots
    var padding = 5;
    var radius = ((Math.min(w, h) / 3) - 2 * padding) / 2;

    var color = d3.scale.category20b();

    var arc = d3.svg.arc()
        .outerRadius(radius);

    var pie = d3.layout.pie()
        .value(function(d) { return parseInt(d[1]); })
        .sort(null);

    // create the pie parts
    var path = svg.selectAll('path')
        .data(pie(data))
        .enter()
        .append('path')
        .attr('d', arc)
        .attr('fill', function(d) {
            return color(d[0]);
        });


}