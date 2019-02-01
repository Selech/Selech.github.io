var gl;
var canvas;
var program;
var data;

window.onload = function init() {
    // initialize canvas and WebGL
    canvas = document.getElementById("gl-canvas");
    gl = WebGLUtils.setupWebGL(canvas);
    if (!gl) { alert("WebGL isn't available"); }
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(0.3921, 0.5843, 0.9294, 1.0);

    setData();
    initProgram();
    render();

    canvas.addEventListener("click", function(event){
        canvasClicked(event);
    });
}

function setData() {
    data = new Object();

    // vertex points of the shapes
    data.vTmp = [];
    data.vPoint = [];
    data.vCircle = [];
    data.vTriangle = [];
    // vertex colors of the shapes
    data.cTmp = [];
    data.cPoint = [];
    data.cCircle = [];
    data.cTriangle = [];

    // vertices per circle
    data.vPerCircle = 30;

    // possible colors
    data.colors = [
        vec3(1.0, 0.45, 0.45), // red
        vec3(0.2, 0.6, 1.0), // blue
        vec3(0.2, 0.8, 0.5), // green
        vec3(0.0, 1.0, 1.0), // cyan
        vec3(0.6, 0.2, 0.8), // purple
        vec3(1.0, 1.0, 0.0), // yellow
        vec3(1.0, 1.0, 1.0), // white
        vec3(0.0, 0.0, 0.0)  // black
    ];
    data.selectedColor = data.colors[0];
    data.mode = "point";
}

function initProgram() {
    //  Load shaders
    program = initShaders(gl, "vertex-shader", "fragment-shader");
    gl.useProgram(program);

    // load attribute locations
    program.vPositionLocation = gl.getAttribLocation(program, "vPosition");
    program.vColorLocation = gl.getAttribLocation(program, "vColor");

    // create buffers
    // vertex positions
    program.positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, program.positionBuffer);
    gl.vertexAttribPointer(program.vPositionLocation, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(program.vPositionLocation);
    // vertex colors
    program.colorBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, program.colorBuffer);
    gl.vertexAttribPointer(program.vColorLocation, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(program.vColorLocation);
}

function updateBufferData() {
    // collect all position data in a single array
    var posData = [];
    if (data.vTmp.length != 0)
        posData = posData.concat(data.vTmp);
    if (data.vPoint.length != 0)
        posData = posData.concat(data.vPoint);
    if (data.vTriangle.length != 0)
        posData = posData.concat(data.vTriangle);
    if (data.vCircle.length != 0)
        posData = posData.concat(data.vCircle);

    // collect all color data in a single array
    var colorData = [];
    if (data.cTmp.length != 0)
        colorData = colorData.concat(data.cTmp);
    if (data.cPoint.length != 0)
        colorData = colorData.concat(data.cPoint);
    if (data.cTriangle.length != 0)
        colorData = colorData.concat(data.cTriangle);
    if (data.cCircle.length != 0)
        colorData = colorData.concat(data.cCircle);

    // update buffer data
    gl.bindBuffer(gl.ARRAY_BUFFER, program.positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(posData), gl.STATIC_DRAW);
    gl.bindBuffer(gl.ARRAY_BUFFER, program.colorBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(colorData), gl.STATIC_DRAW);
}

function canvasClicked(event) {
    // find the position clicked
    var clickPos = getMousePosition(event);

    if (data.mode == "point") {
        // add a point
        data.vPoint.push(clickPos);
        data.cPoint.push(data.selectedColor);
    }
    else if (data.mode == "triangle") {
        if (data.vTmp.length == 2) {
            // add a triangle
            data.vTriangle.push(data.vTmp.pop());
            data.vTriangle.push(data.vTmp.pop());
            data.vTriangle.push(clickPos);

            data.cTriangle.push(data.cTmp.pop());
            data.cTriangle.push(data.cTmp.pop());
            data.cTriangle.push(data.selectedColor);
        }
        else {
            // add a temporary point
            data.vTmp.push(clickPos);
            data.cTmp.push(data.selectedColor);
        }
    }
    else if (data.mode = "circle") {

        if (data.vTmp.length == 1) {
            // add a circle
            var center = data.vTmp.pop();
            var r = length(subtract(clickPos, center));
            var circle = createCircle(center, r, data.vPerCircle); // check Shapes.js
            // add positions
            data.vCircle = data.vCircle.concat(circle);
            // add colors
            data.cCircle.push(data.cTmp.pop());
            for (var i = 0; i < data.vPerCircle - 1; i++) {
                data.cCircle.push(data.selectedColor);
            }
        }
        else {
            // add a temporary point
            data.vTmp.push(clickPos);
            data.cTmp.push(data.selectedColor);
        }
    }

    render();
}

function updateColor() {
    var colorChanger = document.getElementById("color");
    data.selectedColor = data.colors[colorChanger.selectedIndex];
}

function setMode(s) {
    // if mode changes
    if (data.mode != s) {
        // remove temporary points
        data.cTmp = [];
        data.vTmp = [];
        data.mode = s;
        render();
    }
}

function getMousePosition(event) {
    var rect = event.target.getBoundingClientRect()
    var rx = event.clientX - rect.left;
    var ry = event.clientY - rect.top;

    var x = 2 * rx / canvas.width - 1;
    var y = 2 * (canvas.height - ry) / canvas.height - 1;

    return vec2(x, y);
}

function render() {
    gl.clear(gl.COLOR_BUFFER_BIT);
    updateBufferData();
   
    // draw all points, both permanent and temporary
    var i = data.vTmp.length + data.vPoint.length;
    if (i > 0) {
        gl.drawArrays(gl.POINTS, 0, i);
    }
    // draw all triangles
    if (data.vTriangle.length != 0)
        gl.drawArrays(gl.TRIANGLES, i, data.vTriangle.length);
    i += data.vTriangle.length;

    // draw all circles
    if (data.vCircle.length != 0) {
        var numOfCircles = data.vCircle.length / data.vPerCircle;
        for (var j = 0; j < numOfCircles; j++) {
            gl.drawArrays(gl.TRIANGLE_FAN, i + j * data.vPerCircle, data.vPerCircle);
        }
    }
}

function clearCanvas() {
    // clear all buffers
    data.vTmp = [];
    data.vPoint = [];
    data.vCircle = [];
    data.vTriangle = [];
    // vertex colors of the shapes
    data.cTmp = [];
    data.cPoint = [];
    data.cCircle = [];
    data.cTriangle = [];

    gl.clearColor(data.selectedColor[0], data.selectedColor[1], data.selectedColor[2], 1);
    gl.clear(gl.COLOR_BUFFER_BIT);
}