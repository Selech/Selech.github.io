var lambertianProgram;
var mirrorBallProgram;
var shadowProgram;

// initialize all programs
function initPrograms(callback) {

    var onLoadComplete = function(objDoc) {
        initLambertianProgram(objDoc);
        initMirrorBallProgram();
        initShadowProgram();
        callback();
    };

    loadModel("Cornell/CornellBox", 1, true, onLoadComplete);
}

// program used for the cornell box
function initLambertianProgram(objDoc) {
    //  Load shaders
    lambertianProgram = initShaders(gl, "Shaders/Lambertian/vertex.txt", "Shaders/Lambertian/fragment.txt");
    gl.useProgram(lambertianProgram);

    // load attribute locations
    lambertianProgram.vPositionLocation = gl.getAttribLocation(lambertianProgram, "vPosition");
    lambertianProgram.vNormalLocation = gl.getAttribLocation(lambertianProgram, "vNormal");
    lambertianProgram.vColorLocation = gl.getAttribLocation(lambertianProgram, "vColor");
    lambertianProgram.MVLocation = gl.getUniformLocation(lambertianProgram, "MV");
    lambertianProgram.PLocation = gl.getUniformLocation(lambertianProgram, "P");
    lambertianProgram.lPosLocation = gl.getUniformLocation(lambertianProgram, "lPos");
    lambertianProgram.LeLocation = gl.getUniformLocation(lambertianProgram, "Le");
    lambertianProgram.shadowMapLocation = gl.getUniformLocation(lambertianProgram, "shadowMap");
    lambertianProgram.MVPLightLocation = gl.getUniformLocation(lambertianProgram, "MVPLight");
    lambertianProgram.storeDepthLocation = gl.getUniformLocation(lambertianProgram, "storeDepth");

    // get model info
    var drawingInfo = objDoc.getDrawingInfo();

    // create buffers
    // position buffer
    lambertianProgram.positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, lambertianProgram.positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, drawingInfo.vertices, gl.STATIC_DRAW);
    // normal buffer
    lambertianProgram.normalBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, lambertianProgram.normalBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, drawingInfo.normals, gl.STATIC_DRAW);
    // color buffer
    lambertianProgram.colorBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, lambertianProgram.colorBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, drawingInfo.colors, gl.STATIC_DRAW);
    // index buffer
    lambertianProgram.indexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, lambertianProgram.indexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, drawingInfo.indices, gl.STATIC_DRAW);
    data.numOfIndices = drawingInfo.indices.length;
}

// program used for the mirror balls
function initMirrorBallProgram() {
    //  Load shaders
    mirrorBallProgram = initShaders(gl, "Shaders/MirrorBall/vertex.txt", "Shaders/MirrorBall/fragment.txt");
    gl.useProgram(mirrorBallProgram);

    // load attribute locations
    mirrorBallProgram.vPositionLocation = gl.getAttribLocation(mirrorBallProgram, "vPosition");
    mirrorBallProgram.MVLocation = gl.getUniformLocation(mirrorBallProgram, "MV");
    mirrorBallProgram.PLocation = gl.getUniformLocation(mirrorBallProgram, "P");
    mirrorBallProgram.invLocation = gl.getUniformLocation(mirrorBallProgram, "inv");
    mirrorBallProgram.cubemapLocation = gl.getUniformLocation(mirrorBallProgram, "cubemap");
    mirrorBallProgram.centerLocation = gl.getUniformLocation(mirrorBallProgram, "center");
    mirrorBallProgram.storeDepthLocation = gl.getUniformLocation(mirrorBallProgram, "storeDepth");
    mirrorBallProgram.useParallaxLocation = gl.getUniformLocation(mirrorBallProgram, "useParallax");

    // create position buffer
    mirrorBallProgram.positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, mirrorBallProgram.positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(data.unitSphere), gl.STATIC_DRAW);
}

function initShadowProgram() {
    //  Load shaders
    shadowProgram = initShaders(gl, "Shaders/Shadow/vertex.txt", "Shaders/Shadow/fragment.txt");
    gl.useProgram(shadowProgram);

    // load attribute locations
    shadowProgram.vPositionLocation = gl.getAttribLocation(shadowProgram, "vPosition");
    shadowProgram.MVPLocation = gl.getUniformLocation(shadowProgram, "MVP");

    // Create a framebuffer
    shadowProgram.frameBuffer = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, shadowProgram.frameBuffer);

    // create texture to render to (start from Texture1 as 0 is used for shadow map)
    var size = 512;
    gl.activeTexture(gl.TEXTURE0);
    var texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, size, size, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
    // set filters
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);


    // unbind everything
    gl.bindTexture(gl.TEXTURE_CUBE_MAP, null);
    gl.bindRenderbuffer(gl.RENDERBUFFER, null);
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
}

// switches to a given program
function switchProgram(name) {
    switch (name) {
        case "Lambertian":
            gl.useProgram(lambertianProgram);
            // enable position buffer
            gl.bindBuffer(gl.ARRAY_BUFFER, lambertianProgram.positionBuffer);
            gl.vertexAttribPointer(lambertianProgram.vPositionLocation, 3, gl.FLOAT, false, 0, 0);
            gl.enableVertexAttribArray(lambertianProgram.vPositionLocation);
            // enable normal buffer
            gl.bindBuffer(gl.ARRAY_BUFFER, lambertianProgram.normalBuffer);
            gl.vertexAttribPointer(lambertianProgram.vNormalLocation, 3, gl.FLOAT, false, 0, 0);
            gl.enableVertexAttribArray(lambertianProgram.vNormalLocation);
            // enable color buffer
            gl.bindBuffer(gl.ARRAY_BUFFER, lambertianProgram.colorBuffer);
            gl.vertexAttribPointer(lambertianProgram.vColorLocation, 4, gl.FLOAT, false, 0, 0);
            gl.enableVertexAttribArray(lambertianProgram.vColorLocation);
            break;
        case "MirrorBall":
            gl.useProgram(mirrorBallProgram);
            // enable position buffer
            gl.bindBuffer(gl.ARRAY_BUFFER, mirrorBallProgram.positionBuffer);
            gl.vertexAttribPointer(mirrorBallProgram.vPositionLocation, 4, gl.FLOAT, false, 0, 0);
            gl.enableVertexAttribArray(mirrorBallProgram.vPositionLocation);
            break;
        case "Shadow":
            gl.useProgram(shadowProgram);
            break;
        default:
            throw "No program with the name: " + name;
    }
}
