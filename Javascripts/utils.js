// loads one or more csv files and return an array of data objects
// the data objects are in same order as the files given
function loadCsvFiles(files, callback) {
    var index = 0;
    var dataArray = [];

    // use recursive function to load images in correct order
    var recLoad = function(data) {
        dataArray[index] = data;
        index++;

        if (index >= files.length) {
            // all files have been loaded
            callback(dataArray);
        }
        else
            d3.csv(files[index], recLoad);
    };

    // load the files
    d3.csv(files[0], recLoad);
}

// maps a k-point to a color (used in 2D)
function mapKtoColor(k) {
    switch(k) {
        case 0:
            return "red";
        case 1:
            return "blue";
        case 2:
            return "yellow";
        case 3:
            return "green";
        case 4:
            return "white";
        case 5:
            return "purple";
    }
}

// maps each district to an unique color
function mapDistrictsToColors(district) {
    switch(district.toUpperCase()) {
        case "BAYVIEW":
            return "orange"; // orange
        case "MISSION":
            return "gray"; // gray
        case "CENTRAL":
            return "#850000"; // dark red
        case "INGLESIDE":
            return "#FF3366"; // red
        case "NORTHERN":
            return "#CA95E4"; // purple
        case "PARK":
            return "#3399CC"; // blue
        case "RICHMOND":
            return "#31BF80"; // light green
        case "SOUTHERN":
            return "#2B5540"; // dark green
        case "TARAVAL":
            return "#00458A"; // dark blue
        case "TENDERLOIN":
            return "#B79571"; // brown
        default:
            throw "Unknown district: " + district;
    }
}

// redraw all svg elements when resizing the window
window.onresize = function(event) {
    drawB2();
    drawC2();
    drawD2();
};
