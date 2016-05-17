// redraw all svg elements when resizing the window
/*window.onresize = function(event) {
    drawB2();
    drawC2();
    drawD2();
};*/

// loads one or more JSON files and return an array of data objects
// the data objects are in same order as the files given
function loadJSONFiles(files, callback) {
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
            d3.json(files[index], recLoad);
    };

    // load the files
    d3.json(files[0], recLoad);
}

// maps a k-point to a color (used in 2D)
function mapGenreToColor(genre) {
    switch(genre) {
        case "Action":
            return "red";
        case "Adventure":
            return "#003399";
        case "Crime":
            return "yellow";
        case "Sci-Fi":
            return "green";
        case "Other":
            return "#3399ff";
        case "Drama":
            return "purple";
        case "Comedy":
            return "black";
        case "Thriller":
            return "orange";
        case "Romance":
            return "magenta";
        case "Mystery":
            return "brown";
    }
}

// maps a k-point to a color (used in 2D)
function mapKtoColor(k) {
    switch(k) {
        case 0:
            return "red";
        case 1:
            return "#003399";
        case 2:
            return "yellow";
        case 3:
            return "green";
        case 4:
            return "#3399ff";
        case 5:
            return "purple";
        case 6:
            return "black";
        case 7:
            return "orange";
        case 8:
            return "magenta";
        case 9:
            return "brown";
    }
}