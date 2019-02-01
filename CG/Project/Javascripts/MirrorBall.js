var size = 512;

function createMirrorBall(id, pos, scale) {
    var mirrorBall = new Object();
    mirrorBall.id = id;
    mirrorBall.position = pos;
    mirrorBall.size = scale;
    mirrorBall.numOfVertices = unitSphere(5).length;

    // create the model matrix
    mirrorBall.M = scalem(scale, scale, scale); // scale it
    mirrorBall.M = mult(translate(pos[0], pos[1], pos[2]), mirrorBall.M); // translate it

    // create two cubemaps
    mirrorBall.lookup = createCubeMap();
    mirrorBall.writing = createCubeMap();

    initFramebuffer(mirrorBall);

    // function for translating the mirror ball
    mirrorBall.translate = function(dy) {
        // update position
        mirrorBall.position[1] += dy;
        // update model matrix
        mirrorBall.M = mult(translate(0, dy, 0), mirrorBall.M);
    };

    return mirrorBall;
}

function initFramebuffer(mirrorBall) {
    // create the cubemap that the framebuffer renders to
    mirrorBall.framebuffer = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, mirrorBall.framebuffer);

    // create depthbuffer
    var depthBuffer = gl.createRenderbuffer();
    gl.bindRenderbuffer(gl.RENDERBUFFER, depthBuffer);
    gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, size, size);
    gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, depthBuffer);

    // unbind everything
    gl.bindTexture(gl.TEXTURE_CUBE_MAP, null);
    gl.bindRenderbuffer(gl.RENDERBUFFER, null);
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
}

function createCubeMap() {
    var texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_CUBE_MAP, texture);
    gl.texImage2D(gl.TEXTURE_CUBE_MAP_POSITIVE_X, 0, gl.RGBA, size, size, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
    gl.texImage2D(gl.TEXTURE_CUBE_MAP_NEGATIVE_X, 0, gl.RGBA, size, size, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
    gl.texImage2D(gl.TEXTURE_CUBE_MAP_POSITIVE_Y, 0, gl.RGBA, size, size, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
    gl.texImage2D(gl.TEXTURE_CUBE_MAP_NEGATIVE_Y, 0, gl.RGBA, size, size, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
    gl.texImage2D(gl.TEXTURE_CUBE_MAP_POSITIVE_Z, 0, gl.RGBA, size, size, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
    gl.texImage2D(gl.TEXTURE_CUBE_MAP_NEGATIVE_Z, 0, gl.RGBA, size, size, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
    // set filters
    gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MIN_FILTER, gl.LINEAR);

    return texture;
}

// generates a cubemap for a given mirror ball
function generateCubemap(mirrorBall, renderFunction) {
    // create projection matrix
    var fov = 90;
    var aspect = 1;
    var P = perspective(fov, aspect, 1, 1000);

    // used for view matrix
    var eye = mirrorBall.position;

    // use the mirror ball framebuffer
    gl.bindFramebuffer(gl.FRAMEBUFFER, mirrorBall.framebuffer);
    gl.viewport(0, 0, size, size);

    // render positive x
    var at = vec3(eye[0] + 1, eye[1], eye[2]);
    var up = vec3(0, -1, 0);
    var V = lookAt(eye, at, up);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_CUBE_MAP_POSITIVE_X, mirrorBall.writing, 0);
    renderFunction(V, P, mirrorBall.id, 1);
    // render negative x
    at = vec3(eye[0] - 1, eye[1], eye[2]);
    V = lookAt(eye, at, up);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_CUBE_MAP_NEGATIVE_X, mirrorBall.writing, 0);
    renderFunction(V, P, mirrorBall.id, 1);
    // render positive z
    at = vec3(eye[0], eye[1], eye[2] + 1);
    V = lookAt(eye, at, up);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_CUBE_MAP_POSITIVE_Z, mirrorBall.writing, 0);
    renderFunction(V, P, mirrorBall.id, 1);
    // render negative z
    at = vec3(eye[0], eye[1], eye[2] - 1);
    V = lookAt(eye, at, up);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_CUBE_MAP_NEGATIVE_Z, mirrorBall.writing, 0);
    renderFunction(V, P, mirrorBall.id, 1);
    // render positive y
    up = vec3(0, 0, 1);
    at = vec3(eye[0], eye[1] + 1, eye[2]);
    V = lookAt(eye, at, up);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_CUBE_MAP_POSITIVE_Y, mirrorBall.writing, 0);
    renderFunction(V, P, mirrorBall.id, 1);
    // render negative y
    up = vec3(0, 0, -1);
    at = vec3(eye[0], eye[1] - 1, eye[2]);
    V = lookAt(eye, at, up);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_CUBE_MAP_NEGATIVE_Y, mirrorBall.writing, 0);
    renderFunction(V, P, mirrorBall.id, 1);

    // unbind framebuffer
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.viewport(0, 0, canvas.width, canvas.height);
}

// switch the textures (ping-pong)
function updateCubeMap(mirrorBall) {
    var tmp = mirrorBall.lookup;
    mirrorBall.lookup = mirrorBall.writing;
    mirrorBall.writing = tmp;
}

// clears the lookup cubemap
function resetCubemap(mirrorBall) {
    gl.bindTexture(gl.TEXTURE_CUBE_MAP, mirrorBall.lookup);
    gl.texImage2D(gl.TEXTURE_CUBE_MAP_POSITIVE_X, 0, gl.RGBA, size, size, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
    gl.texImage2D(gl.TEXTURE_CUBE_MAP_NEGATIVE_X, 0, gl.RGBA, size, size, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
    gl.texImage2D(gl.TEXTURE_CUBE_MAP_POSITIVE_Y, 0, gl.RGBA, size, size, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
    gl.texImage2D(gl.TEXTURE_CUBE_MAP_NEGATIVE_Y, 0, gl.RGBA, size, size, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
    gl.texImage2D(gl.TEXTURE_CUBE_MAP_POSITIVE_Z, 0, gl.RGBA, size, size, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
    gl.texImage2D(gl.TEXTURE_CUBE_MAP_NEGATIVE_Z, 0, gl.RGBA, size, size, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
}
