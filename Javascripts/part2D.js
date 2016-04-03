var modelD;
loadD2();

// loads required files
function loadD2() {
    d3.json("Data/2D/crimes.json", function(crimeData) {
        d3.json("Data/2D/map.json", function(mapData) {
            init2D(mapData, crimeData);
        });
    });

}

// draws the svg element
function drawD2() {
    // get the size of the svg element
    var w = parseInt(modelD.svg.style("width").replace("px", ""));
    // height always equal to width
    var h = w;
    modelD.svg.attr("height", h);

    // create the scales for the map
    var scale = 3.9 * w;
    var projection = d3.geo.albersUsa()
        .translate([33.58 * scale, 3.325 * scale])
        .scale(96 * scale);
    var path = d3.geo.path().projection(projection);

    // create the map
    modelD.svg.selectAll("path")
        .data(modelD.mapData.features)
        .transition()
        .duration(700)
        .ease("linear")
        .attr("d", path)
        .attr("stroke-width", scale * 0.0002);

    // the data points
    modelD.svg.selectAll(".datapoint")
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
            return mapKtoColor(parseInt(d[modelD.preview]));
        });

    // creates the new  points
    modelD.svg.selectAll(".centroid")
        .transition()
        .duration(700)
        .ease("linear")
        .attr("x", function(d) {
            return projection([d[0], d[1]])[0];
        })
        .attr("y", function(d) {
            return projection([d[0], d[1]])[1];
        });
}

// called when all necessary files have been loaded
function init2D(mapData, crimeData) {
    var svg = d3.select("#svg-2d");

    modelD = {
        svg: svg,
        mapData: mapData,
        crimeData: crimeData,
    };

    // create the map
    svg.selectAll("path")
        .data(mapData.features)
        .enter()
        .append("path")
        .attr("opacity", "0.25")
        .attr("fill", function(d) {
            return mapDistrictsToColors(d.properties.DISTRICT);
        })
        .attr("stroke", "black")
        .on("mouseover", function(d) {
            d3.select(this)
                .transition()
                .duration(450)
                .attr("opacity", "0.6");
        })
        .on("mouseout", function(d) {
            d3.select(this)
                .transition()
                .duration(450)
                .attr("opacity", "0.25");
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

    // creates the data points
    svg.selectAll(".datapoint")
        .data(crimeData.dataPoints)
        .enter()
        .append("circle")
        .attr("class", "datapoint")

    setData2D("k2")
}

function previewData2D(k) {
    modelD.preview = k;

    // removes old centroids
    modelD.svg.selectAll(".centroid").remove();

    // creates the new centroids
    modelD.svg.selectAll(".centroid")
        .data(modelD.crimeData[k])
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

    drawD2();
}

function setData2D(k) {
    if (k != "") {
        modelD.k = k;
        modelD.preview = k;
    } else {
        modelD.preview = modelD.k;
    }

    // removes old centroids
    modelD.svg.selectAll(".centroid").remove();

    // creates the new centroids
    modelD.svg.selectAll(".centroid")
        .data(modelD.crimeData[modelD.k])
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

    drawD2();
}
