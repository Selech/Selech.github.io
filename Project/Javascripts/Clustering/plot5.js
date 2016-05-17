var plot5;
loadPlot5();

// loads required files
function loadPlot5() {
    var files = ['Data/Clustering/2DAll.json',
        'Data/Clustering/2DAction.json',
        'Data/Clustering/2DAdventure.json',
        'Data/Clustering/2DComedy.json',
        'Data/Clustering/2DCrime.json',
        'Data/Clustering/2DDrama.json',
        'Data/Clustering/2DMystery.json',
        'Data/Clustering/2DSci-Fi.json',
        'Data/Clustering/2DThriller.json',
        'Data/Clustering/2DOther.json'
    ]
    loadJSONFiles(files, function(data) {
        d3.json("Data/map.json", function(mapData) {
            initPlot5(mapData, data);
        })
    });
}

// called when all necessary files have been loaded
function initPlot5(mapData, data) {
    var svg = d3.select("#svg-plot5");

    plot5 = {
        svg: svg,
        mapData: mapData,
        data: data,
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

    setDataPlot5(0, "k2");
}

// draws the svg element
function drawPlot5() {
    // get the size of the svg element
    var w = parseInt(plot5.svg.style("width").replace("px", ""));
    // height always equal to width
    var h = w;
    plot5.svg.attr("height", h);

    // create the scales for the map
    var scale = 3.9 * w;
    var projection = d3.geo.albersUsa()
        .translate([33.58 * scale, 3.325 * scale])
        .scale(96 * scale);
    var path = d3.geo.path().projection(projection);

    // create the map
    plot5.svg.selectAll("path")
        .data(plot5.mapData.features)
        .transition()
        .duration(700)
        .ease("linear")
        .attr("d", path)
        .attr("stroke-width", scale * 0.0002);

    // the data points
    plot5.svg.selectAll(".datapoint")
        .transition()
        .duration(700)
        .ease("linear")
        .attr("cx", function(d) {
            return projection([d.lon, d.lat])[0]
        })
        .attr("cy", function(d) {
            return projection([d.lon, d.lat])[1];
        })
        .attr("r", w * 0.004)
        .style("fill", function(d) {
            return mapKtoColor(parseInt(d[plot5.preview]));
        });

    // creates the new  points
    plot5.svg.selectAll(".centroid")
        .transition()
        .duration(700)
        .ease("linear")
        .attr("width", 12)
        .attr("height", 12)
        .attr("x", function(d) {
            return projection([d[1], d[0]])[0];
        })
        .attr("y", function(d) {
            return projection([d[1], d[0]])[1];
        });
}

function previewData2D(k) {
    plot5.preview = k;

    // removes points
    plot5.svg.selectAll(".centroid").remove();
    plot5.svg.selectAll(".datapoint").remove();

    // creates the new centroids
    plot5.svg.selectAll(".centroid")
        .data(plot5.data[k])
        .enter()
        .append("rect")
        .attr("class", "centroid")
        .attr("width", 10)
        .attr("height", 10)
        .attr("fill", function(d, i) {
            return mapKtoColor(i);
        })
        .attr("stroke", "#222222")
        .attr("stroke-width", "2px");

    // creates the data points
    svg.selectAll(".datapoint")
        .data(data[0].dataPoints)
        .enter()
        .append("circle")
        .attr("class", "datapoint");

    drawPlot5();
}

function setDataPlot5(dataset, k) {
    if (k != "") {
        plot5.k = k;
        plot5.set = dataset;
        plot5.preview = k;
    } else {
        plot5.preview = plot5.k;
        plot5.set = dataset;
    }

    // removes points
    plot5.svg.selectAll(".centroid").remove();
    plot5.svg.selectAll(".datapoint").remove();

    // creates the data points
    plot5.svg.selectAll(".datapoint")
        .data(plot5.data[plot5.set].dataPoints)
        .enter()
        .append("circle")
        .attr("class", "datapoint");

    // creates the new centroids
    plot5.svg.selectAll(".centroid")
        .data(plot5.data[plot5.set][plot5.k])
        .enter()
        .append("rect")
        .attr("class", "centroid")
        .attr("fill", function(d, i) {
            return mapKtoColor(i);
        })
        .attr("stroke", "black")
        .attr("stroke-width", "2px");

    drawPlot5();
}

function setGenre() {
    var e = document.getElementById("genre-select");
    var value = e.options[e.selectedIndex].value;
    setDataPlot5(value, plot5.k);
}

function setCluster() {
    var e = document.getElementById("cluster-select");
    var value = e.options[e.selectedIndex].value;
    setDataPlot5(plot5.set, value);
}

