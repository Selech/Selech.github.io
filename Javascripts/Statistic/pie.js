d3.json("Data/Statistic/pieChartData.json", initPlot2);

function initPlot2(data) {
    var svg = d3.select("#svg-plot2");

    // get the size of the svg element
    var w = parseInt(svg.style("width").replace("px", ""));
    var h = parseInt(svg.style("height").replace("px", ""));
    var padding = 20;

    // radius for the plots
    var dw = (w - 2*padding) / 5;
    var dh = (h - 2*padding) / 2;
    var radius = (Math.min(dw, dh) / 2) * 0.9;

    var arc = d3.svg.arc()
        .outerRadius(radius);

    var pie = d3.layout.pie()
        .value(function(d) { return d[2]; })
        .sort(null);

    for (var i = 0; i < data["data"].length; i++) {
        var info = data["data"][i];
        info[2] = parseInt(info[2]);

        // calculate position
        var x = padding + radius + (i % 5) * dw;
        var y = padding + radius + Math.round((i / 5) - 0.5) * dh;

        svg.append('text')
            .attr('text', info[0])
            .attr('x', '100')
            .attr('y', '100');

        // create the pie parts
        var path = svg.selectAll('.'+data[0])
            .data(pie([info, ["", 0, 100 - info[2]]]))
            .enter()
            .append('path')
            .attr('transform', 'translate('+x+', '+y+')')
            .attr('opacity', '1')
            .attr('stroke', 'black')
            .attr('stroke-width', '1')
            .attr('class', 'custom')
            .attr('d', arc)
            .attr('fill', function(d, i) {
                if (i == 0) return 'red'; else return 'transparent';
            })
            .attr('data-toggle', 'tooltip')
            .attr('title', 'testing')
            .on("mouseover", function(d, i) {
                if (i == 1) return;

                d3.select(this)
                    .transition()
                    .duration(250)
                    .attr("opacity", "0.7");
            })
            .on("mouseout", function(d, i) {
                if (i == 1) return;

                d3.select(this)
                    .transition()
                    .duration(250)
                    .attr("opacity", "1");
            });
    }

    // tooltips for districts
    $('[data-toggle="tooltip"]').tooltip();
}