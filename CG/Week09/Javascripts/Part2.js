var gl;
var canvas;
var phongProgram;
var texProgram;
var data;

window.onload = function init()
{
    // initialize canvas and WebGL
    canvas = document.getElementById( "gl-canvas" );
    gl = WebGLUtils.setupWebGL( canvas, { alpha: false, stencil: true } );
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
        vec2(0, 1),
    ];

    // point light
    data.orbitPoint = vec3(0, 2, -3);
    data.angle = 0;
    data.rotationSpeed = 0.7;
    data.rotating = true;
    data.lightPower = vec3(4, 4, 4);

    // teapot
    data.bouncing = true;
    data.translateY = 0;
    data.bounceSpeed = 0.005;

    // set material properties
    data.alpha = 80;
    data.ambient = vec3(0.5, 0.5, 0.5);
    data.diffuse = vec3(0.7, 0.7, 0.7);
    data.specular = vec3(0.8, 0.8, 0.8);

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
    phongProgram.VLocation = gl.getUniformLocation(phongProgram, "V");
    phongProgram.PLocation = gl.getUniformLocation(phongProgram, "P");
    phongProgram.MLocation = gl.getUniformLocation(phongProgram, "M");
    phongProgram.RLocation = gl.getUniformLocation(phongProgram, "R");
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

    // set projection and view matrix
    gl.uniformMatrix4fv(phongProgram.PLocation, false, flatten(data.P));
    gl.uniformMatrix4fv(phongProgram.VLocation, false, flatten(data.V));

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
    texProgram.MVPLightLocation = gl.getUniformLocation(texProgram, "MVPLight");
    texProgram.textureLocation = gl.getUniformLocation(texProgram, "texture");
    texProgram.shadowMapLocation = gl.getUniformLocation(texProgram, "shadowMap");

    // create buffers for texProgram
    // positions
    texProgram.positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, texProgram.positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(data.ground), gl.STATIC_DRAW);
    // texture coordinates
    texProgram.texCoordBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, texProgram.texCoordBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(data.texCoords), gl.STATIC_DRAW);

    createTextures(image);

    // check if all programs has been loaded
    data.programsToLoad--;
    if (data.programsToLoad == 0)
        render();
}

function createTextures(image) {
    // create empty shadow map as texture0
    gl.activeTexture(gl.TEXTURE0);
    var shadowTexture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, shadowTexture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, size, size, 0,
        gl.RGBA, gl.UNSIGNED_BYTE, null);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);

    // create ground texture as texture0
    gl.activeTexture(gl.TEXTURE1);
    var groundTexture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, groundTexture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);
    // Set the parameters so we can render any size image.
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

    // set to use the textures
    gl.uniform1i(texProgram.shadowMapLocation, 0);
    gl.uniform1i(texProgram.textureLocation, 1);

    // initialize shadow map (see ShadowMap.js)
    initShadowMap(gl, shadowTexture);
}

function initCamera() {
    // create projection matrix
    var fov = 65.0;
    var aspect = canvas.width / canvas.height;
    data.P = perspective(fov, aspect, 1, 10);

    // create view matrix
    var eye = vec3(0, 0, 1);
    var at = vec3(0, 0, -3);
    var up = vec3(0, 1, 0);
    data.V = lookAt(eye, at, up);

    // enable depth test and blending
    gl.enable(gl.DEPTH_TEST);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

    gl.clearColor(0.3921, 0.5843, 0.9294, 1.0);
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

function render() {
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT | gl.STENCIL_BUFFER_BIT);

    applyAnimation();

    // calculate point light position from rotation
    var rads = data.angle * Math.PI / 180.0;
    var x = data.orbitPoint[0] + 2 * Math.cos(rads);
    var y = data.orbitPoint[1];
    var z = data.orbitPoint[2] + 2 * Math.sin(rads);
    var lightPos = vec4(x, y, z, 1);

    // create view matrix from light
    var VLight = lookAt(vec3(lightPos), vec3(0, -1, -3), vec3(0, 1, 0)); // look at center of ground quad

    // generate shadow map
    renderShadows(VLight);
    renderReflection(VLight, lightPos);
    renderGround(VLight);
    renderTeapot(lightPos);


    requestAnimFrame(render);
}

function renderShadows(VLight) {
    // render ground quad shadows
    // create model-view-projection matrix
    var MVP = mult(data.P, VLight);
    renderShadowMap(gl, texProgram.positionBuffer, null, data.ground.length, MVP);

    // render teapot shadows
    var M = translate(0, data.translateY - 1, -3);
    MVP = mult(MVP, M);
    renderShadowMap(gl, phongProgram.positionBuffer, phongProgram.indexBuffer, data.numOfIndices, MVP);
}

function renderGround(VLight) {
    // use texture program
    gl.useProgram(texProgram);

    // enable buffers
    gl.bindBuffer(gl.ARRAY_BUFFER, texProgram.positionBuffer);
    gl.vertexAttribPointer(texProgram.vPositionLocation, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(texProgram.vPositionLocation);
    gl.bindBuffer(gl.ARRAY_BUFFER, texProgram.texCoordBuffer);
    gl.vertexAttribPointer(texProgram.vTexCoordLocation, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(texProgram.vTexCoordLocation);

    // set model-view-projection
    var MVP = mult(data.P, data.V);
    gl.uniformMatrix4fv(texProgram.MVPLocation, false, flatten(MVP));

    // set model-view-projection from light
    var MVPLight = mult(data.P, VLight);
    gl.uniformMatrix4fv(texProgram.MVPLightLocation, false, flatten(MVPLight));

    // use 2 textures
    gl.uniform1i(texProgram.textureLocation, 1);
    gl.uniform1i(texProgram.shadowMapLocation, 0);
    gl.drawArrays(gl.TRIANGLE_FAN, 0, data.ground.length);
}

function renderTeapot(lightPos) {
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
    var lPos = vec3(mult2(data.V, lightPos));
    gl.uniform3fv(phongProgram.lPosLocation, flatten(lPos));

    // create model matrix
    var M = translate(0, data.translateY - 1, -3);
    gl.uniformMatrix4fv(phongProgram.MLocation, false, flatten(M));

    // set reflection matrix to identity matrix
    gl.uniformMatrix4fv(phongProgram.RLocation, false, flatten(mat4()));

    // render original teapot
    gl.drawElements(gl.TRIANGLES, data.numOfIndices, gl.UNSIGNED_SHORT, 0);
}

function renderReflection(VLight, lightPos) {
    // disable update of the color- and depth buffer
    gl.disable(gl.DEPTH_TEST);
    gl.colorMask(false, false, false, false);
    // set stencil test to replace the value with 1
    gl.enable(gl.STENCIL_TEST );
    gl.stencilOp(gl.REPLACE, gl.REPLACE, gl.REPLACE);
    gl.stencilFunc(gl.ALWAYS, 1 ,0xffffffff);

    renderGround(VLight);

    //draw reflected 3d pot
    gl.enable(gl.STENCIL_TEST );
    gl.stencilOp( gl.REPLACE, gl.REPLACE, gl.REPLACE );
    gl.stencilFunc( gl.ALWAYS, 1, 0xffffffff);

    // re-enable update of the color- and depth buffer
    gl.enable(gl.DEPTH_TEST);
    gl.colorMask(true, true, true, true);
    // set stencil test to draw only if stencil value is 1
    gl.stencilFunc(gl.EQUAL, 1, 0xffffffff);
    gl.stencilOp(gl.KEEP, gl.KEEP, gl.KEEP);


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
    var lPos = vec3(mult2(data.V, lightPos));
    gl.uniform3fv(phongProgram.lPosLocation, flatten(lPos));

    // create model matrix
    var M = translate(0, data.translateY - 1, -3);
    gl.uniformMatrix4fv(phongProgram.MLocation, false, flatten(M));

    // create the reflection matrix
    var R = translate(0, 1, 0); // translate ground to origin
    R = mult(scalem(1, -1, 1), R); // mirror in xz-plane
    R = mult(translate(0, -1, 0), R); // translate back
    gl.uniformMatrix4fv(phongProgram.RLocation, false, flatten(R));

    // render reflection of teapot
    gl.drawElements(gl.TRIANGLES, data.numOfIndices, gl.UNSIGNED_SHORT, 0);

    // disable stencil test
    gl.disable(gl.STENCIL_TEST);
}

