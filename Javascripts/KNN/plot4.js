var plot4;
loadPlot4();

// loads required files
function loadPlot4() {
    d3.json("Data/KNN/knn.json", function(data) {
            d3.json("Data/map.json", function(mapData) {
                initPlot4(mapData, data);
            });
    });
}

// called when all necessary files have been loaded
function initPlot4(mapData, data) {
    var svg = d3.select("#svg-plot4");

    var obj = {
        "Comedy": true,
        "Adventure": true,
        'Drama': true,
        "Sci-Fi": true,
        "Action": true,
        "Mystery": true,
        "Romance": true,
        "Thriller": true,
        "Crime": true,
        "Other": true
    };

    plot4 = {
        svg: svg,
        mapData: mapData,
        data: data,
        show: obj
    };

    // create the map
    svg.selectAll("path")
        .data(mapData.features)
        .enter()
        .append("path")
        .attr('class', 'map')
        .attr("opacity", "0.6")
        .attr("fill", '#777777')
        .attr("stroke", "black")
        .on("mouseover", function() {
            d3.select(this)
                .transition()
                .duration(450)
                .attr("opacity", "1");
        })
        .on("mouseout", function() {
            d3.select(this)
                .transition()
                .duration(450)
                .attr("opacity", "0.6");
        });

    // tooltips for districts
    $('svg .map').tooltip({
        'container': 'body',
        'placement': 'top',
        'title': function(){
            // get the data object
            var d = d3.select(this).datum();
            return d.properties.DISTRICT;
        }
    });

    drawPlot4();
}

// draws the svg element
function drawPlot4() {
    // get the size of the svg element
    var w = parseInt(plot4.svg.style("width").replace("px", ""));
    // height always equal to width
    plot4.svg.attr("height", w);

    // create the scales for the map
    var scale = 3.9 * w;
    var projection = d3.geo.albersUsa()
        .translate([33.58 * scale, 3.325 * scale])
        .scale(96 * scale);
    var path = d3.geo.path().projection(projection);

    // create the map
    plot4.svg.selectAll("path")
        .data(plot4.mapData.features)
        .transition()
        .duration(700)
        .ease("linear")
        .attr("d", path)
        .attr("stroke-width", scale * 0.0002);

    // removes points
    plot4.svg.selectAll(".grid-point").remove();

    // creates the new points
    for (var property in plot4.show) {
        if (plot4.show.hasOwnProperty(property)) {
            if (!plot4.show[property])
                continue;

            plot4.svg.selectAll("."+property)
                .data(plot4.data[property]["locations"])
                .enter()
                .append("circle")
                .attr('opacity', '0.6')
                .attr("class", "grid-point")
                .attr("cx", function(d) {
                    return projection([d['lon'], d['lat']])[0];
                })
                .attr("cy", function(d) {
                    return projection([d['lon'], d['lat']])[1];
                })
                .attr("fill", function() {
                    return mapGenreToColor(property);
                })
                .attr("r", w / 300);
        }
    }
}

function updateplot4(cb) {
    plot4.show[cb.value] = cb.checked;
    drawPlot4();
}

