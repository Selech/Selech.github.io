var gl;
var program;
var data;

window.onload = function init()
{
    // initialize canvas and WebGL
    var canvas = document.getElementById( "gl-canvas" );
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
    var cubeVertices = [
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
    data.cube = cubeLine(cubeVertices);
}

function initProgram() {
    //  Load shaders
    program = initShaders(gl, "vertex-shader", "fragment-shader");
    gl.useProgram(program);

    // load attribute locations
    program.vPositionLocation = gl.getAttribLocation(program, "vPosition");
    program.MVLocation = gl.getUniformLocation(program, "MV");

    // create buffers
    program.positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, program.positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(data.cube), gl.STATIC_DRAW);
    gl.vertexAttribPointer(program.vPositionLocation, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(program.vPositionLocation);
}

function render() {
    gl.clear(gl.COLOR_BUFFER_BIT);

    // create the mode-view matrix
    // translate model into center
    var M = translate(-0.5, -0.5, -0.5);
    // rotate it 45 degrees around y axis
    var V = rotate(45, vec3(0, 1, 0));
    // rotate it ~35 degrees around x axis
    V = mult(rotate(35.264, vec3(1, 0, 0)), V);
    // alternatively we could have used:
    // MV = lookat(vec3(1.5, 1.5, 1.5), vec3(0.5, 0.5, 0.5), vec3(0, 1, 0))
    var MV = mult(V, M);
    gl.uniformMatrix4fv(program.MVLocation, false, flatten(MV));

    // draw cube in wire-frame
    gl.drawArrays(gl.LINES, 0, data.cube.length);
}