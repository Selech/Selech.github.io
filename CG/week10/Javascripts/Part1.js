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
    // load the texture image (see ResourceLoader.js)
    loadImgs(data.cubemapFiles, initProgram);

    // add event listeners for buttons
    document.getElementById("hor").onclick = function(){
        data.angle = 0;
        data.rotationAxis = vec3(0, 1, 0);
    };
    document.getElementById("ver").onclick = function() {
        data.angle = 0;
        data.rotationAxis = vec3(1, 0, 0);
    };
};

function setData() {
    data = new Object();

    data.cubemapFiles = [
        'Cubemap/cm_left.png',      // POSITIVE_X
        'Cubemap/cm_right.png',     // NEGATIVE_X
        'Cubemap/cm_top.png',       // POSITIVE_Y
        'Cubemap/cm_bottom.png',    // NEGATIVE_Y
        'Cubemap/cm_back.png',      // POSITIVE_Z
        'Cubemap/cm_front.png'      // NEGATIVE_Z
    ];

    data.quad = [
        vec4(-1, 1, 0.999, 1),
        vec4(-1, -1, 0.999, 1),
        vec4(1, -1, 0.999, 1),
        vec4(1, 1, 0.999, 1)
    ];
    // subdivision level and rotation
    data.rotationAxis = vec3(0, 1, 0);
    data.subdiv = 5;
    data.angle = 0;
    data.rotationSpeed = 0.3;
}

function initProgram(images) {
    //  Load shaders
    program = initShaders(gl, "vertex-shader", "fragment-shader");
    gl.useProgram(program);

    // load attribute locations
    program.vPositionLocation = gl.getAttribLocation(program, "vPosition");
    program.MVPLocation = gl.getUniformLocation(program, "MVP");
    program.cubemapLocation = gl.getUniformLocation(program, "cubemap");

    // create buffers
    program.positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, program.positionBuffer);
    gl.vertexAttribPointer(program.vPositionLocation, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(program.vPositionLocation);

    initCamera();
    createSphere();
    createCubemap(images);
    render();
}

function initCamera() {
    // create view-projection matrix
    var fov = 90.0;
    var aspect = canvas.width / canvas.height;
    data.P = perspective(fov, aspect, 1, 10);

    // enable depth test
    gl.enable(gl.DEPTH_TEST);

    // enabling culling
    gl.enable(gl.CULL_FACE);
    gl.cullFace(gl.BACK);

    gl.clearColor(0.3921, 0.5843, 0.9294, 1.0);
}

function createCubemap(images) {
    // create cube map as texture0
    gl.activeTexture(gl.TEXTURE0);
    var cubeMap = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_CUBE_MAP, cubeMap);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    // set images
    gl.texImage2D(gl.TEXTURE_CUBE_MAP_POSITIVE_X, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, images[0]);
    gl.texImage2D(gl.TEXTURE_CUBE_MAP_NEGATIVE_X, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, images[1]);
    gl.texImage2D(gl.TEXTURE_CUBE_MAP_POSITIVE_Y, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, images[2]);
    gl.texImage2D(gl.TEXTURE_CUBE_MAP_NEGATIVE_Y, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, images[3]);
    gl.texImage2D(gl.TEXTURE_CUBE_MAP_POSITIVE_Z, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, images[4]);
    gl.texImage2D(gl.TEXTURE_CUBE_MAP_NEGATIVE_Z, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, images[5]);
    gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    // make the program use the texture0
    gl.uniform1i(program.cubemapLocation, 0);
}

function createSphere() {
    // construct the unit sphere (see Shapes.js)
    data.unitSphere = unitSphere(data.subdiv);
    gl.bindBuffer(gl.ARRAY_BUFFER, program.positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(data.unitSphere), gl.STATIC_DRAW);
}

function applyAnimation() {
    data.angle += data.rotationSpeed;
    if (data.angle >= 360)
        data.angle -= 360;
}

function render() {
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    applyAnimation();

    // create model-view-projection matrix (the camera orbits the sphere)
    var V = rotate(data.angle, data.rotationAxis);
    V = mult(translate(0, 0, -3), V);
    var MVP = mult(data.P, V); // no model
    gl.uniformMatrix4fv(program.MVPLocation, false, flatten(MVP));

    gl.drawArrays(gl.TRIANGLES, 0, data.unitSphere.length);
    requestAnimFrame(render);
}