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
    gl.viewport(0.0, 0.0, canvas.width, canvas.height);

    setData();
    initProgram();
};

function setData() {
    data = new Object();

    // rotation
    data.tilt = 25;
    data.angle = 0;
    data.rotationSpeed = 1.0;
    data.isRendering = false;
    // directional light
    data.light1 = vec4(0, -1, 0, 0);
    // point light
    data.light2 = vec4(2, -0.2, 0.8, 1);
}

function initProgram() {
    //  Load shaders
    program = initShaders(gl, "vertex-shader", "fragment-shader");
    gl.useProgram(program);

    // load attribute locations
    program.vPositionLocation = gl.getAttribLocation(program, "vPosition");
    program.vNormalLocation = gl.getAttribLocation(program, "vNormal");
    program.MVLocation = gl.getUniformLocation(program, "MV");
    program.PLocation = gl.getUniformLocation(program, "P");
    program.leLocation = gl.getUniformLocation(program, "le");
    program.apLocation = gl.getUniformLocation(program, "ap");
    program.dpLocation = gl.getUniformLocation(program, "dp");
    program.spLocation = gl.getUniformLocation(program, "sp");
    program.lPosLocation = gl.getUniformLocation(program, "lPos");
    program.ap2Location = gl.getUniformLocation(program, "ap2");
    program.dp2Location = gl.getUniformLocation(program, "dp2");
    program.sp2Location = gl.getUniformLocation(program, "sp2");
    program.alphaLocation = gl.getUniformLocation(program, "alpha");

    // create buffers
    program.positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, program.positionBuffer);
    gl.vertexAttribPointer(program.vPositionLocation, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(program.vPositionLocation);
    // normal buffer
    program.normalBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, program.normalBuffer);
    gl.vertexAttribPointer(program.vNormalLocation, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(program.vNormalLocation);
    // index buffer
    program.indexBuffer = gl.createBuffer();

    initCamera();
    updateProperties();
    loadTeapotOBJ();
}

// called from the sliders in the HTML file
function updateProperties() {
    // directional light emission
    var val = document.getElementById("Le").value;
    var Le = vec3(val, val, val);
    var string = "[" + val + ", " + val + ", " + val + "]";
    document.getElementById("LeText").textContent = string;
    // ambient product
    val = document.getElementById("Ka").value;
    var Ka = vec3(val, val, val);
    string = "[" + val + ", " + val + ", " + val + "]";
    document.getElementById("KaText").textContent = string;
    gl.uniform3fv(program.apLocation, flatten(mult(Le, Ka)));
    // diffuse product
    val = document.getElementById("Kd").value;
    var Kd = vec3(val, val, val);
    string = "[" + val + ", " + val + ", " + val + "]";
    document.getElementById("KdText").textContent = string;
    gl.uniform3fv(program.dpLocation, flatten(mult(Le, Kd)));
    // specular product
    val = document.getElementById("Ks").value;
    var Ks = vec3(val, val, val);
    string = "[" + val + ", " + val + ", " + val + "]";
    document.getElementById("KsText").textContent = string;
    gl.uniform3fv(program.spLocation, flatten(mult(Le, Ks)));

    // point light emission
    val = document.getElementById("Le2").value;
    var Le2 = vec3(val, 0, 0);
    string = "[" + val + ", 0, 0]";
    document.getElementById("Le2Text").textContent = string;
    // ambient product 2 (point light)
    gl.uniform3fv(program.ap2Location, flatten(mult(Le2, Ka)));
    // diffuse product 2 (point light)
    gl.uniform3fv(program.dp2Location, flatten(mult(Le2, Kd)));
    // specular product 2 (point light)
    gl.uniform3fv(program.sp2Location, flatten(mult(Le2, Ks)));

    // alpha (shininess)
    var alpha = document.getElementById("alpha").value;
    document.getElementById("alphaText").textContent = alpha;
    gl.uniform1f(program.alphaLocation, alpha);
}

// OBJ File has been read completely
function storeModel(objDoc){
    var drawingInfo = objDoc.getDrawingInfo();

    gl.bindBuffer(gl.ARRAY_BUFFER, program.positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, drawingInfo.vertices, gl.STATIC_DRAW);

    gl.bindBuffer(gl.ARRAY_BUFFER, program.normalBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, drawingInfo.normals, gl.STATIC_DRAW);

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, program.indexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, drawingInfo.indices, gl.STATIC_DRAW);
    data.numOfIndices = drawingInfo.indices.length;

    if (!data.isRendering) {
        data.isRendering = true;
        render();
    }
}

function loadTeapotOBJ() {
    // create the model matrix
    data.M = translate(0, -0.5, 0); // translate into center

    // read the file
    loadModel("teapot", 0.3, true, storeModel);
}

function loadBunnyOBJ() {
    // create the model matrix
    data.M = translate(0.2, -0.9, -0.1); // translate into center

    // read the file
    loadModel("bunny", 9, true, storeModel);
}

function initCamera() {
    // create projection matrix
    var fov = 45.0;
    var aspect = canvas.width / canvas.height;
    var P = perspective(fov, aspect, 1, 10);
    gl.uniformMatrix4fv(program.PLocation, false, flatten(P));

    // enable depth test
    gl.enable(gl.DEPTH_TEST);

    gl.clearColor(0.3921, 0.5843, 0.9294, 1.0);
}

function applyAnimation() {
    data.angle += data.rotationSpeed;
    if (data.angle >= 360)
        data.angle -= 360;
}

function render() {
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    applyAnimation();

    // create model-view matrix
    var V = rotate(data.angle, vec3(0, 1, 0));
    V = mult(rotate(data.tilt, vec3(1, 0, 0)), V); // add tilt to get 3-point perspective
    V = mult(translate(0, 0, -3), V);
    var MV = mult(V, data.M);
    gl.uniformMatrix4fv(program.MVLocation, false, flatten(MV));

    // set directional light to view space
    var le = vec3(mult2(V, data.light1));
    gl.uniform3fv(program.leLocation, flatten(le));

    // set point light to view space
    var lPos = vec3(mult2(V, data.light2));
    gl.uniform3fv(program.lPosLocation, flatten(lPos));

    gl.drawElements(gl.TRIANGLES, data.numOfIndices, gl.UNSIGNED_SHORT, 0);
    requestAnimFrame(render);
}