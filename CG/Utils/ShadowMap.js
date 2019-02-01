var shadowMapProgram;
var size = 2048;

function initShadowMap(gl, texture) {
    // load shaders
    shadowMapProgram = initShaders(gl, "shadow-vertex-shader", "shadow-fragment-shader");
    gl.useProgram(shadowMapProgram);

    // get locations
    shadowMapProgram.vPositionLocation = gl.getAttribLocation(shadowMapProgram, "vPosition");
    shadowMapProgram.MVPLocation = gl.getUniformLocation(shadowMapProgram, "MVP");

    // Create a framebuffer
    shadowMapProgram.frameBuffer = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, shadowMapProgram.frameBuffer);
    // Attach a texture to it.
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);

    // unbind frame buffer
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
}

function renderShadowMap(gl, vBuffer, iBuffer, count, mvp) {
    // use texture program
    gl.useProgram(shadowMapProgram);

    // use framebuffer
    gl.bindFramebuffer(gl.FRAMEBUFFER, shadowMapProgram.frameBuffer);
    gl.viewport(0, 0, size, size);

    // buffers for positions
    gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
    gl.vertexAttribPointer(shadowMapProgram.vPositionLocation, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(shadowMapProgram.vPositionLocation);

    // set model-view-projection matrix
    gl.uniformMatrix4fv(shadowMapProgram.MVPLocation, false, flatten(mvp));

    // if no indices buffer is given we use standard drawArrays()
    if (iBuffer == null) {
        gl.drawArrays(gl.TRIANGLE_FAN, 0, count);
    }
    else {
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, iBuffer);
        gl.drawElements(gl.TRIANGLES, count, gl.UNSIGNED_SHORT, 0);
    }

    // unbind framebuffer
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.viewport( 0, 0, 500, 500);
}