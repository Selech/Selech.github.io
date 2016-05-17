var modelC;
loadC2();

// load the data
function loadC2() {
    // load the 10 data files
    var fileNames = ["bay", "cen", "ing", "mis", "nor", "par", "ric", "sou", "tar", "ten"];
    for (var i = 0; i < fileNames.length; i++) {
        fileNames[i] = "Data/2C/" + fileNames[i] + ".csv";
    }
    loadCsvFiles(fileNames, init2C);
}

// draws the svg element
function drawC2() {
    // get the size of the svg element
    var w = parseInt(modelC.svg.style("width").replace("px", ""));
    var h = parseInt(modelC.svg.style("height").replace("px", ""));
    var data = modelC.datasets[modelC.datasetIdx];

    // create dynamic scales
    var padding = 45;
    var combined = [];
    for (var i = 0; i < modelC.datasets.length; i++) {
        combined = combined.concat(modelC.datasets[i]);
    }
    var xScale = d3.scale.ordinal()
        .domain(d3.range(data.length))
        .rangeRoundBands([padding, w - padding], 0.15);
    var yScale = d3.scale.linear()
        .domain([0, d3.max(combined, function(d) { return parseInt(d["PROSTITUTION"]); })])
        .range([h - padding, padding]);

    // create the bars
    modelC.svg.selectAll(".bar")
        .data(data)
        .transition()
        .duration(1100)
        .attr("x", function(d, i) {
            return xScale(i);
        })
        .attr("y", function(d) {
            return yScale(parseInt(d["PROSTITUTION"]))
        })
        .attr("width", xScale.rangeBand())
        .attr("height", function(d) {
            return h - padding - yScale(parseInt(d["PROSTITUTION"]));
        })
        .attr("fill", mapDistrictsToColors(modelC.district));

    // Create X axis
    var xScale2 = d3.scale.ordinal() // used to control the ticks to only being years
        .domain(d3.range(2003, 2017))
        .rangeRoundBands([padding, w - padding]);
    var xAxis = d3.svg.axis()
        .scale(xScale2)
        .orient("bottom");
    modelC.svg.select("#x-axis")
        .attr("transform", "translate(0," + (h - padding) + ")")
        .call(xAxis);
    // Create Y axis
    var yAxis = d3.svg.axis()
        .scale(yScale)
        .orient("left")
        .ticks(5);
    modelC.svg.select("#y-axis")
        .attr("transform", "translate(" + padding + ",0)")
        .call(yAxis);
}

// initializes the 2B svg element
function init2C(dataArray) {
    // get the svg element and bind data to it
    var svg = d3.select("#svg-2c");
    var data = dataArray[0];

    // create the bars
    svg.selectAll(".bar")
        .data(data)
        .enter()
        .append("rect")
        .attr("class", "bar")
        .attr("fill", mapDistrictsToColors("Bayview"))
        .on("mouseover", function(d) {
            d3.select(this)
                .transition()
                .duration(250)
                .attr("opacity", "0.5");
        })
        .on("mouseout", function(d) {
            d3.select(this)
                .transition()
                .duration(250)
                .attr("opacity", "1.0");
        });

    // tooltips for svg elements
    $('svg rect.bar').tooltip({
        'container': 'body',
        'placement': 'top',
        'title': function(){
            // get the data object
            var d = d3.select(this).datum();
            return d["TIME"] + "\n Prostitution: " + d["PROSTITUTION"];
        }
    });

    // create the axes
    svg.append("g")
        .attr("id", "x-axis")
        .attr("class", "axis");
    svg.append("g")
        .attr("id", "y-axis")
        .attr("class", "axis");

    modelC = {
        svg: svg,
        datasets: dataArray,
        datasetIdx: 0,
        district: "Bayview"
    };

    drawC2();
}

// called when the district of 2C is changed
function setDataC(dataId) {
    modelC.datasetIdx = dataId;

    switch(dataId) {
        case 0:
            modelC.district = "Bayview";
            break;
        case 1:
            modelC.district = "Central";
            break;
        case 2:
            modelC.district = "Ingleside";
            break;
        case 3:
            modelC.district = "Mission";
            break;
        case 4:
            modelC.district = "Northern";
            break;
        case 5:
            modelC.district = "Park";
            break;
        case 6:
            modelC.district = "Richmond";
            break;
        case 7:
            modelC.district = "Southern";
            break;
        case 8:
            modelC.district = "Taraval";
            break;
        case 9:
            modelC.district = "Tenderloin";
            break;
    }

    drawC2();
}
