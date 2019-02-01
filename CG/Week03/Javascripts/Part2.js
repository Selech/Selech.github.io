var gl;
var canvas;
var buffers;
var data;

window.onload = function init()
{
    // initialize canvas and WebGL
    canvas = document.getElementById( "gl-canvas" );
    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }
    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor(0.3921, 0.5843, 0.9294, 1.0);

    setData();
    initProgram();
    render();
}

function setData() {
    data = new Object();

    // vertices of the cube
    data.cubeVertices = [
        vec3(0.0, 1.0, 0.0),
        vec3(1.0, 1.0, 0.0),
        vec3(1.0, 1.0, 1.0),
        vec3(0.0, 1.0, 1.0),
        vec3(0.0, 0.0, 0.0),
        vec3(1.0, 0.0, 0.0),
        vec3(1.0, 0.0, 1.0),
        vec3(0.0, 0.0, 1.0)
    ];
    // construct the cube (see Shapes.js)
    data.cube = cubeLine(data.cubeVertices);
}

function initProgram() {
    //  Load shaders
    program = initShaders(gl, "vertex-shader", "fragment-shader");
    gl.useProgram(program);

    // load attribute locations
    program.vPositionLocation = gl.getAttribLocation(program, "vPosition");
    program.MVPLocation = gl.getUniformLocation(program, "MVP");
    program.colorLocation = gl.getUniformLocation(program, "color");

    // create buffers
    program.positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, program.positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(data.cube), gl.STATIC_DRAW);
    gl.vertexAttribPointer(program.vPositionLocation, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(program.vPositionLocation);
}

function render() {
    gl.clear(gl.COLOR_BUFFER_BIT);

    // distance from camera to center of cube
    var distance = 2.5;

    // create projection matrix
    var fov = 45.0;
    var aspect = canvas.width / canvas.height;
    var P = perspective(fov, aspect, 1, 10);
    gl.uniformMatrix4fv(program.PLocation, false, flatten(P));

    // model matrix
    var M = translate(-0.5, -0.5, -0.5);

    // render in one-point perspective (black)
    render1P(M, P, distance);

    // render in two-point perspective (white)
    render2P(M, P, distance);

    // render in three-point perspective (red)
    color = vec4(1, 0, 0, 1);
    render3P(M, P, distance);
}

function render1P(M, P, distance) {
    // create model-view-projection matrix
    var V = translate(0, 0, -distance);
    var MVP = mult(P, mult(V, M));
    gl.uniformMatrix4fv(program.MVPLocation, false, flatten(MVP));

    // use black color
    var color = vec4(0, 0, 0, 1);
    gl.uniform4fv(program.colorLocation, color);

    // draw cube in wire-frame
    gl.drawArrays(gl.LINES, 0, data.cube.length);

    // draw cube in wire-frame
    gl.drawArrays(gl.LINES, 0, data.cube.length);
}

function render2P(M, P, distance) {
    // create model-view-projection matrix
    var V = rotate(45, vec3(0, 1, 0));
    V = mult(translate(0, 0, -distance), V)
    var MVP = mult(P, mult(V, M));
    gl.uniformMatrix4fv(program.MVPLocation, false, flatten(MVP));

    // use white color
    var color = vec4(1, 1, 1, 1)
    gl.uniform4fv(program.colorLocation, color);

    // draw cube in wire-frame
    gl.drawArrays(gl.LINES, 0, data.cube.length);
}

function render3P(M, P, distance) {
    // create model-view-projection matrix
    var V = rotate(45, vec3(0, 1, 0));
    V = mult(rotate(35.264, vec3(1, 0, 0)), V);
    V = mult(translate(0, 0, -distance), V);
    var MVP = mult(P, mult(V, M));
    gl.uniformMatrix4fv(program.MVPLocation, false, flatten(MVP));

    // use red color
    var color = vec4(1, 0, 0, 1)
    gl.uniform4fv(program.colorLocation, color);

    // draw cube in wire-frame
    gl.drawArrays(gl.LINES, 0, data.cube.length);
}