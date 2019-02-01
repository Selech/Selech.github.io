var gl;
var canvas;
var data;
var program;

window.onload = function init()
{
    // initialize canvas and WebGL
    canvas = document.getElementById( "gl-canvas" );
    gl = WebGLUtils.setupWebGL( canvas, { alpha: false } );
    if ( !gl ) { alert( "WebGL isn't available" ); }
    gl.viewport( 0, 0, canvas.width, canvas.height );

    setData();
    loadImg("xamp23.png", initProgram);
};

function setData() {
    data = new Object();

    // ground quad
    data.ground = [
        vec3(-2, -1, -1),
        vec3(2, -1, -1),
        vec3(2, -1, -5),
        vec3(-2, -1, -5)
    ];
    data.texCoords = [
        vec2(0, 0),
        vec2(1, 0),
        vec2(1, 1),
        vec2(0, 1)
    ];

    // two small quads
    data.floatingQuad = [
        vec3(0.25, -0.5, -1.25),
        vec3(0.75, -0.5, -1.25),
        vec3(0.75, -0.5, -1.75),
        vec3(0.25, -0.5, -1.75)
    ];
    data.standingQuad = [
        vec3(-1, -1, -2.5),
        vec3(-1, 0, -2.5),
        vec3(-1, 0, -3),
        vec3(-1, -1, -3)
    ];

    // point light orbits around this point
    data.orbitPoint = vec3(0, 2, -2);
    // rotation
    data.angle = 0;
    data.rotationSpeed = 0.7;
}

function initProgram(image) {
    //  Load shaders
    program = initShaders(gl, "vertex-shader", "fragment-shader");
    gl.useProgram(program);

    // load attribute locations
    program.vPositionLocation = gl.getAttribLocation(program, "vPosition");
    program.vTexCoordLocation = gl.getAttribLocation(program, "vTexCoord");
    program.MVPLocation = gl.getUniformLocation(program, "MVP");
    program.visibilityLocation = gl.getUniformLocation(program, "visibility");
    program.textureLocation = gl.getUniformLocation(program, "texture");

    // collect all positions and texture coordinates in two single arrays
    var positionData = data.ground.concat(data.floatingQuad);
    positionData = positionData.concat(data.standingQuad);
    var texData = data.texCoords.concat(data.texCoords);
    texData = texData.concat(data.texCoords);

    // create buffers
    // positions
    program.positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, program.positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(positionData), gl.STATIC_DRAW);
    gl.vertexAttribPointer(program.vPositionLocation, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(program.vPositionLocation);
    // texture coordinates
    program.texCoordBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, program.texCoordBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(texData), gl.STATIC_DRAW);
    gl.vertexAttribPointer(program.vTexCoordLocation, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(program.vTexCoordLocation);

    initCamera();
    createTextures(image);
    render();
}

function initCamera() {
    // create projection matrix
    var fov = 90.0;
    var aspect = canvas.width / canvas.height;
    data.P = perspective(fov, aspect, 1, 10);

    //enable depth test
    gl.enable(gl.DEPTH_TEST);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

    gl.clearColor(0.3921, 0.5843, 0.9294, 1.0);
}

function createTextures(image) {
    // create ground texture as texture0
    gl.activeTexture(gl.TEXTURE0);
    var ground = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, ground);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);
    // Set the parameters so we can render any size image.
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

    // create red texture as texture1
    gl.activeTexture(gl.TEXTURE1);
    var redTexture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, redTexture);
    var red = new Uint8Array([255, 0, 0]);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, 1, 1, 0, gl.RGB, gl.UNSIGNED_BYTE, red);
    // Set the parameters so we can render any size image.
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
}

function applyAnimation() {
    data.angle += data.rotationSpeed;
    if (data.angle >= 360)
        data.angle -= 360;
}

function render(){
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    applyAnimation();

    renderGround();
    renderShadows();
    renderRedQuads();

    requestAnimFrame(render);
}

function renderGround() {
    // set full visibility
    gl.uniform4fv(program.visibilityLocation, vec4(1, 1, 1, 1));

    // create model-view-projection matrix (just projection here)
    gl.uniformMatrix4fv(program.MVPLocation, false, flatten(data.P));

    // set depth function for depth test
    gl.depthFunc(gl.LESS);

    // use ground image texture (texture0)
    gl.uniform1i(program.textureLocation, 0);
    gl.drawArrays(gl.TRIANGLE_FAN, 0, data.ground.length);
}

function renderShadows() {
    // calculate light position directly rather than using a matrix
    var rads = data.angle * Math.PI / 180.0;
    var x = data.orbitPoint[0] + 2 * Math.cos(rads);
    var y = data.orbitPoint[1];
    var z = data.orbitPoint[2] + 2 * Math.sin(rads);

    // compute shadow projection matrix
    var M = mat4();
    M[3][3] = 0;
    // add small offset of 0.001 to avoid z-fighting
    M[3][1] = -1 / (y + 1.001);

    // create model-view-projection matrix
    var V = translate(-x, -y, -z); // translate to light position
    V = mult(M, V); // apply shadow projection
    V = mult(translate(x, y, z), V); // translate back
    var MVP = mult(data.P, V);
    gl.uniformMatrix4fv(program.MVPLocation, false, flatten(MVP));

    // set no visibility (black shadow with 0.5 transparency)
    gl.uniform4fv(program.visibilityLocation, vec4(0, 0, 0, 0.5));

    // set depth function for depth test
    gl.depthFunc(gl.GREATER);

    var start = data.ground.length;
    gl.drawArrays(gl.TRIANGLE_FAN, start, data.floatingQuad.length);
    start += data.floatingQuad.length;
    gl.drawArrays(gl.TRIANGLE_FAN, start, data.standingQuad.length);
}

function renderRedQuads() {
    // set full visibility
    gl.uniform4fv(program.visibilityLocation, vec4(1, 1, 1, 1));

    // create model-view-projection matrix (just projection here)
    gl.uniformMatrix4fv(program.MVPLocation, false, flatten(data.P));

    // set depth function for depth test
    gl.depthFunc(gl.LESS);

    // use red texture (texture1)
    gl.uniform1i(program.textureLocation, 1);
    var start = data.ground.length;
    gl.drawArrays(gl.TRIANGLE_FAN, start, data.floatingQuad.length);
    start += data.floatingQuad.length;
    gl.drawArrays(gl.TRIANGLE_FAN, start, data.standingQuad.length);
}