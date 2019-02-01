var gl;
var canvas;
var phongProgram;
var texProgram;
var data;

window.onload = function init()
{
    // initialize canvas and WebGL
    canvas = document.getElementById( "gl-canvas" );
    gl = WebGLUtils.setupWebGL( canvas, { alpha: false } );
    if ( !gl ) { alert( "WebGL isn't available" ); }
    gl.viewport( 0, 0, canvas.width, canvas.height );

    setData();
    initCamera();

    // load resources needed for phong program (see ResourceLoader.js)
    loadModel("teapot", 0.25, true, initPhongProgram);
    // load resources needed for tex program
    loadImg("xamp23.png", initTexProgram);

    document.getElementById("lightButton").addEventListener("click", function(event){

        data.rotating = !data.rotating;
    });
    document.getElementById("teapotButton").addEventListener("click", function(event){
        data.bouncing = !data.bouncing;
    });
    document.getElementById("perspective").addEventListener("click", function(event){
        data.isTopview = !data.isTopview;
    });
}

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
        vec2(0, 1),
    ];

    // is perspective top-view or normal
    data.isTopview = false;

    // point light
    data.orbitPoint = vec3(0, 2, -3);
    data.angle = 0;
    data.rotationSpeed = 0.7;
    data.rotating = true;
    data.lightPower = vec3(5, 5, 5);

    // teapot
    data.bouncing = true;
    data.translateY = 0;
    data.bounceSpeed = 0.005;

    // set material properties
    data.alpha = 50;
    data.ambient = vec3(0.02, 0.02, 0.02);
    data.diffuse = vec3(0.7, 0.7, 0.7);
    data.specular = vec3(1, 1, 1);

    // needed to know when the programs is all loaded
    data.programsToLoad = 2;
}

function initPhongProgram(objDoc) {
    // load shaders
    phongProgram = initShaders(gl, "phong-vertex-shader", "phong-fragment-shader");
    gl.useProgram(phongProgram);

    // load attribute locations
    phongProgram.vPositionLocation = gl.getAttribLocation(phongProgram, "vPosition");
    phongProgram.vNormalLocation = gl.getAttribLocation(phongProgram, "vNormal");
    phongProgram.MVLocation = gl.getUniformLocation(phongProgram, "MV");
    phongProgram.PLocation = gl.getUniformLocation(phongProgram, "P");
    phongProgram.lPosLocation = gl.getUniformLocation(phongProgram, "lPos");
    phongProgram.apLocation = gl.getUniformLocation(phongProgram, "ap");
    phongProgram.dpLocation = gl.getUniformLocation(phongProgram, "dp");
    phongProgram.spLocation = gl.getUniformLocation(phongProgram, "sp");
    phongProgram.alphaLocation = gl.getUniformLocation(phongProgram, "alpha");


    // model
    var drawingInfo = objDoc.getDrawingInfo();

    // create buffers for the phong program
    // positions
    phongProgram.positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, phongProgram.positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, drawingInfo.vertices, gl.STATIC_DRAW);
    // normals
    phongProgram.normalBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, phongProgram.normalBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, drawingInfo.normals, gl.STATIC_DRAW);
    // indices
    phongProgram.indexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, phongProgram.indexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, drawingInfo.indices, gl.STATIC_DRAW);
    data.numOfIndices = drawingInfo.indices.length;

    // set material properties
    gl.uniform1f(phongProgram.alphaLocation, data.alpha);
    // ambient product
    var product = mult(data.ambient, data.lightPower);
    gl.uniform3fv(phongProgram.apLocation, flatten(product));
    // diffuse product
    product = mult(data.diffuse, data.lightPower);
    gl.uniform3fv(phongProgram.dpLocation, flatten(product));
    // specular product
    product = mult(data.specular, data.lightPower);
    gl.uniform3fv(phongProgram.spLocation, flatten(product));

    // set projection matrix (model-view is calculated in render)
    gl.uniformMatrix4fv(phongProgram.PLocation, false, flatten(data.P));

    // check if all programs has been loaded
    data.programsToLoad--;
    if (data.programsToLoad == 0)
        render();
}

function initTexProgram(image) {
    // load shaders
    texProgram = initShaders(gl, "tex-vertex-shader", "tex-fragment-shader");
    gl.useProgram(texProgram);

    // load attribute locations
    texProgram.vPositionLocation = gl.getAttribLocation(texProgram, "vPosition");
    texProgram.vTexCoordLocation = gl.getAttribLocation(texProgram, "vTexCoord");
    texProgram.MVPLocation = gl.getUniformLocation(texProgram, "MVP");
    texProgram.visibilityLocation = gl.getUniformLocation(texProgram, "visibility");
    texProgram.textureLocation = gl.getUniformLocation(texProgram, "texture");

    // create buffers for texProgram
    // positions
    texProgram.positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, texProgram.positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(data.ground), gl.STATIC_DRAW);
    // texture coordinates
    texProgram.texCoordBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, texProgram.texCoordBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(data.texCoords), gl.STATIC_DRAW);

    // set the texture
    createTexture(image);

    // check if all programs has been loaded
    data.programsToLoad--;
    if (data.programsToLoad == 0)
        render();
}

function initCamera() {
    // create projection matrix
    var fov = 90.0;
    var aspect = canvas.width / canvas.height;
    data.P = perspective(fov, aspect, 1, 25.0);

    // enable depth test
    gl.enable(gl.DEPTH_TEST);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

    gl.clearColor(0.3921, 0.5843, 0.9294, 1.0);
}

function createTexture(image) {
    // create ground texture as texture0
    gl.activeTexture(gl.TEXTURE0);
    var tex = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);
    // Set the parameters so we can render any size image.
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

    gl.uniform1i(texProgram.textureLocation, 0);
}

function applyAnimation() {
    if (data.rotating) {
        data.angle += data.rotationSpeed;
        if (data.angle >= 360)
            data.angle -= 360;
    }
    if (data.bouncing) {
        if (data.translateY > 1.0 || data.translateY < 0.0)
            data.bounceSpeed = -data.bounceSpeed;
        data.translateY += data.bounceSpeed;
    }
}

function render(){
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    applyAnimation();

    // create view matrix
    var V = mat4();
    if (data.isTopview) {
        var eye = vec3(0, 2, -3);
        var at = vec3(0, 1, -3);
        var up = vec3(0, 0, -1);
        V = lookAt(eye, at, up);
    }

    // calculate point light position from rotation
    var rads = data.angle * Math.PI / 180.0;
    var x = data.orbitPoint[0] + 2 * Math.cos(rads);
    var y = data.orbitPoint[1];
    var z = data.orbitPoint[2] + 2 * Math.sin(rads);
    var lightPos = vec4(x, y, z, 1);

    renderGround(V);
    renderShadow(V, lightPos);
    renderTeapot(V, lightPos);

    requestAnimFrame(render);
}

function renderGround(V) {
    // use texture program
    gl.useProgram(texProgram);

    // enable buffers
    gl.bindBuffer(gl.ARRAY_BUFFER, texProgram.positionBuffer);
    gl.vertexAttribPointer(texProgram.vPositionLocation, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(texProgram.vPositionLocation);
    gl.bindBuffer(gl.ARRAY_BUFFER, texProgram.texCoordBuffer);
    gl.vertexAttribPointer(texProgram.vTexCoordLocation, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(texProgram.vTexCoordLocation);

    // set full visibility
    gl.uniform4fv(texProgram.visibilityLocation, vec4(1, 1, 1, 1));

    // set model-view-projection matrix
    var MVP = mult(data.P, V);
    gl.uniformMatrix4fv(texProgram.MVPLocation, false, flatten(MVP));

    // set depth function for depth test
    gl.depthFunc(gl.LESS);

    gl.drawArrays(gl.TRIANGLE_FAN, 0, data.ground.length);
}

function renderTeapot(V, lightPos) {
    // use Phong program
    gl.useProgram(phongProgram);

    // enable buffers
    gl.bindBuffer(gl.ARRAY_BUFFER, phongProgram.positionBuffer);
    gl.vertexAttribPointer(phongProgram.vPositionLocation, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(phongProgram.vPositionLocation);
    gl.bindBuffer(gl.ARRAY_BUFFER, phongProgram.normalBuffer);
    gl.vertexAttribPointer(phongProgram.vNormalLocation, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(phongProgram.vNormalLocation);

    // set light position (in view space)
    var lPos = vec3(mult2(V, lightPos));
    gl.uniform3fv(phongProgram.lPosLocation, flatten(lPos));

    // set model-view matrix
    var M = translate(0, data.translateY - 1, -3);
    var MV = mult(V, M);
    gl.uniformMatrix4fv(phongProgram.MVLocation, false, flatten(MV));

    // set depth function for depth test
    gl.depthFunc(gl.LESS);

    gl.drawElements(gl.TRIANGLES, data.numOfIndices, gl.UNSIGNED_SHORT, 0);
}

function renderShadow(V, lightPos) {
    // use texture program
    gl.useProgram(texProgram);

    // enabling culling
    gl.enable(gl.CULL_FACE);
    gl.cullFace(gl.BACK);

    // set depth function for depth test
    gl.depthFunc(gl.GREATER);

    // enable buffers
    gl.bindBuffer(gl.ARRAY_BUFFER, phongProgram.positionBuffer);
    gl.vertexAttribPointer(texProgram.vPositionLocation, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(texProgram.vPositionLocation);
    // small hack (texture is not used for shadows but it still needs the texture coordinates)
    // we just pass the positions of the teapot as texture coordinates
    gl.bindBuffer(gl.ARRAY_BUFFER, phongProgram.positionBuffer);
    gl.vertexAttribPointer(texProgram.vTexCoordLocation, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(texProgram.vTexCoordLocation);

    // compute shadow projection matrix
    var m = mat4();
    m[3][3] = 0;
    // add small offset of 0.001 to avoid z-fighting
    m[3][1] = -1 / (lightPos[1] + 1.001);
    var M2 = translate(-lightPos[0], -lightPos[1], -lightPos[2]);
    M2 = mult(m, M2);
    M2 = mult(translate(lightPos[0], lightPos[1], lightPos[2]), M2);

    // model matrix of the teapot
    var M = translate(0, data.translateY - 1, -3);

    // create model-view-projection matrix
    var MVP = mult(data.P, mult(V, mult(M2, M)));
    gl.uniformMatrix4fv(texProgram.MVPLocation, false, flatten(MVP));

    // set no visibility (black shadow with 0.5 transparency)
    gl.uniform4fv(texProgram.visibilityLocation, vec4(0, 0, 0, 0.5));

    gl.drawElements(gl.TRIANGLES, data.numOfIndices, gl.UNSIGNED_SHORT, 0);

    //disable culling again
    gl.disable(gl.CULL_FACE);
}