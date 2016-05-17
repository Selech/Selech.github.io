var plot6;
loadplot6();

// loads required files
function loadplot6() {
    d3.json("Data/KNN/knn-rating.json", function(data) {
            d3.json("Data/map.json", function(mapData) {
                initplot6(mapData, data);
            });
    });
}

// called when all necessary files have been loaded
function initplot6(mapData, data) {
    var svg = d3.select("#svg-plot6");

    var obj = {
        4: true,
        5: true,
        6: true,
        7: true,
        8: true
    };

    plot6 = {
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

    drawplot6();
}

// draws the svg element
function drawplot6() {
    // get the size of the svg element
    var w = parseInt(plot6.svg.style("width").replace("px", ""));
    // height always equal to width
    plot6.svg.attr("height", w);

    // create the scales for the map
    var scale = 3.9 * w;
    var projection = d3.geo.albersUsa()
        .translate([33.58 * scale, 3.325 * scale])
        .scale(96 * scale);
    var path = d3.geo.path().projection(projection);

    // create the map
    plot6.svg.selectAll("path")
        .data(plot6.mapData.features)
        .transition()
        .duration(700)
        .ease("linear")
        .attr("d", path)
        .attr("stroke-width", scale * 0.0002);

    // removes points
    plot6.svg.selectAll(".grid-point").remove();

    // creates the new points
    for (var i = 4; i < 9; i++) {
        var property = i+"";
        if (!plot6.show[property])
            continue;

        plot6.svg.selectAll(".item"+property)
            .data(plot6.data[property]["locations"])
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
                switch (property) {
                    case '4':
                        return 'red';
                    case '5':
                        return 'blue';
                    case '6':
                        return 'yellow';
                    case '7':
                        return 'green';
                    case '8':
                        return 'purple';
                    default:
                        return 'pink';
                }
            })
            .attr("r", w / 300);

    }
}

function updateplot6(cb) {
    plot6.show[cb.value] = cb.checked;
    drawplot6();
}

