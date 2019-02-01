// loads an array of OBJ files
function loadModels(files) {

}

// loads the .mtl file first and then the .obj file
function loadModel(fileName, scale, reverse, callback) {

    // first load the mtl file
    var mtlFile = "../Resources/Models/" + fileName + ".mtl";
    var mtlRequest = new XMLHttpRequest();

    mtlRequest.onreadystatechange = function(){
        if(mtlRequest.readyState === 4 && mtlRequest.status !== 404) {
            var objFile = "../Resources/Models/" + fileName + ".obj";
            var objRequest = new XMLHttpRequest();

            objRequest.onreadystatechange = function() {
                if(objRequest.readyState === 4 && objRequest.status !== 404) {
                    onReadOBJFile(objRequest.responseText, objFile, scale, reverse, callback, mtlRequest.responseText);
                }
            };

            objRequest.open('GET', objFile, true);
            objRequest.send();
        }
    };

    mtlRequest.open('GET', mtlFile, true);
    mtlRequest.send();
}

function onReadOBJFile(fileString, fileName, scale, reverse, callback, mtlFile){
    var objDoc = new OBJDoc(fileName);
    var result = objDoc.parse(fileString, scale, reverse, mtlFile);

    if(!result) {
        console.log("OBJ file parsing error.");
        return;
    }

    callback(objDoc);
}

// loads an array of images with same order as the order of the input <files>
function loadImgs(files, callback) {
    var index = 0;
    var images = [];

    // use recursive function to load images in correct order
    var callback2 = function(image) {
        images[index] = image;
        index++;
        // all images has been loaded
        if (index == files.length)
            callback(images);
        else
            loadImg(files[index], callback2);
    };

    // load the images
    loadImg(files[0], callback2);
}

// loads a single image
function loadImg(file, callback) {
    var image = document.createElement('img');
    image.crossOrigin = 'anonymous';
    image.onload = function() {
        callback(image);
    };
    image.src = "../Resources/Images/" + file;
}
