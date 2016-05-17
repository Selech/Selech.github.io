var plot3;
loadPlot3();

// loads required files
function loadPlot3() {
    d3.json("Data/classification/classification.json", function(data) {
        d3.json("Data/map.json", function(mapData) {
            initPlot3(mapData, data);
        })
    });
}

// called when all necessary files have been loaded
function initPlot3(mapData, data) {
    var svg = d3.select("#svg-plot3");

    plot3 = {
        svg: svg,
        mapData: mapData,
        data: data
    };

    // create the map
    svg.selectAll("path")
        .data(mapData.features)
        .enter()
        .append("path")
        .attr("opacity", "0.6")
        .attr("fill", '#777777')
        .attr("stroke", "black")
        .on("mouseover", function(d) {
            d3.select(this)
                .transition()
                .duration(450)
                .attr("opacity", "1");
        })
        .on("mouseout", function(d) {
            d3.select(this)
                .transition()
                .duration(450)
                .attr("opacity", "0.6");
        });

    // tooltips for districts
    $('svg path').tooltip({
        'container': 'body',
        'placement': 'top',
        'title': function(){
            // get the data object
            var d = d3.select(this).datum();
            return d.properties.DISTRICT;
        }
    });

    // creates the new points
    plot3.svg.selectAll(".datapoint")
        .data(plot3.data["1910"]["Action"])
        .enter()
        .append("circle")
        .attr("class", "datapoint");

    setDataPlot3("Action", 1910);
}

// draws the svg element
function drawPlot3() {
    // get the size of the svg element
    var w = parseInt(plot3.svg.style("width").replace("px", ""));
    // height always equal to width
    var h = w;
    plot3.svg.attr("height", h);

    // create the scales for the map
    var scale = 3.9 * w;
    var projection = d3.geo.albersUsa()
        .translate([33.58 * scale, 3.325 * scale])
        .scale(96 * scale);
    var path = d3.geo.path().projection(projection);

    // create the map
    plot3.svg.selectAll("path")
        .data(plot3.mapData.features)
        .transition()
        .duration(700)
        .ease("linear")
        .attr("d", path)
        .attr("stroke-width", scale * 0.0002);

    // the data points
    plot3.svg.selectAll(".datapoint")
        .data(plot3.data[plot3.decade][plot3.genre])
        .attr("opacity", "0.5")
        .transition()
        .duration(700)
        .attr("cx", function(d) {
            return projection([d['lon'], d['lat']])[0] - 13;
        })
        .attr("cy", function(d) {
            return projection([d['lon'], d['lat']])[1] - 13;
        })
        .attr("fill", function(d) {
            var v = parseFloat(d["predict"]) * 255;
            return 'rgb('+0+','+0+','+v+')';
        })
        .attr("r", w / 80);;
}

function setDataPlot3(genre, decade) {
    plot3.genre = genre;
    plot3.decade = decade + "";

    drawPlot3();
}

function setGenre1() {
    var e = document.getElementById("genre-select1");
    var value = e.options[e.selectedIndex].value;
    setDataPlot3(value, plot3.decade);
}

function setDecade() {
    var e = document.getElementById("decade-select");
    var value = e.options[e.selectedIndex].value;
    setDataPlot3(plot3.genre, value);
}
