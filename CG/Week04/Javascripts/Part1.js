var gl;
var canvas;
var program;
var data;

window.onload = function init()
{
    // initialize canvas and WebGL
    canvas = document.getElementById( "gl-canvas" );
    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }
    gl.viewport( 0, 0, canvas.width, canvas.height );

    setData();
    initProgram();
    render();

    // add event listeners for buttons
    document.getElementById("Increase").onclick = function(){
        data.subdiv++;
        createSphere();
        document.getElementById("subdiv").textContent = data.subdiv;
        render();
    };
    document.getElementById("Decrease").onclick = function(){
        if (data.subdiv > 0) {
            data.subdiv--;
            createSphere();
            document.getElementById("subdiv").textContent = data.subdiv;
            render();
        }
    };
}

function setData() {
    data = new Object();

    // subdivision level
    data.subdiv = 4;
}

function initProgram() {
    //  Load shaders
    program = initShaders(gl, "vertex-shader", "fragment-shader");
    gl.useProgram(program);

    // load attribute locations
    program.vPositionLocation = gl.getAttribLocation(program, "vPosition");
    program.MVPLocation = gl.getUniformLocation(program, "MVP");

    // create buffers
    program.positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, program.positionBuffer);
    gl.vertexAttribPointer(program.vPositionLocation, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(program.vPositionLocation);

    initCamera();
    createSphere();
}

function createSphere() {
    // construct the unit sphere (see Shapes.js)
    data.unitSphere = unitSphere(data.subdiv);
    gl.bindBuffer(gl.ARRAY_BUFFER, program.positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(data.unitSphere), gl.STATIC_DRAW);
}

function initCamera() {
    // create projection matrix
    var fov = 45.0;
    var aspect = canvas.width / canvas.height;
    var P = perspective(fov, aspect, 1, 10);
    // create view matrix
    var eye = vec3(0, 0, 3);
    var at = vec3(0, 0, 0);
    var up = vec3(0, 1, 0);
    var V = lookAt(eye, at, up);
    // create model-view-projection matrix (we don't use any model matrix)
    var MVP = mult(P, V);
    gl.uniformMatrix4fv(program.MVPLocation, false, flatten(MVP));

    // enable depth test
    gl.enable(gl.DEPTH_TEST);

    // enabling culling
    gl.enable(gl.CULL_FACE);
    gl.cullFace(gl.BACK);

    gl.clearColor(0.3921, 0.5843, 0.9294, 1.0);
}

function render() {
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    gl.drawArrays(gl.TRIANGLES, 0, data.unitSphere.length);
}