var gl;
var canvas;
var data;

window.onload = function init()
{
    // initialize canvas and WebGL
    canvas = document.getElementById( "gl-canvas" );
    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }
    gl.viewport(0.0, 0.0, canvas.width, canvas.height);

    setData();
    initCamera();
    initPrograms(function() {
        enableNavigation();
        // used to track the time of the program (see TimeTracker.js)
        startTracking();
        renderFrame();
    });

    document.getElementById("ballSelect").onchange = function() {
        var element = document.getElementById("ballSelect");
        data.numOfBalls = parseInt(element.options[element.selectedIndex].value);
    }
};

function setData() {
    data = new Object();

    data.lightIntensity = 77000;
    data.lightColor = vec3(1, 0.87, 0.4);
    data.lightPos = vec3(278, 542, 278);

    data.unitSphere = unitSphere(5);
    // the number of inter-reflections in the mirror balls
    data.interreflections = 2;

    data.numOfBalls = 2;
    data.mirrorBalls = [];
    data.mirrorBalls[0] = createMirrorBall(0, vec3(445, 73, 320), 72);
    data.mirrorBalls[1] = createMirrorBall(1, vec3(90, 100, 180), 72);
    data.mirrorBalls[2] = createMirrorBall(2, vec3(190, 113, 410), 110);
    data.mirrorBalls[3] = createMirrorBall(3, vec3(500, 80, 210), 36);


    data.ballSpeed = 0.8;
}

function renderShadowMap() {
    switchProgram("Shadow");

    // use framebuffer
    gl.bindFramebuffer(gl.FRAMEBUFFER, shadowProgram.frameBuffer);
    gl.viewport(0, 0, 512, 512);

    // bind the cornell box position buffer
    gl.bindBuffer(gl.ARRAY_BUFFER, lambertianProgram.positionBuffer);
    gl.vertexAttribPointer(shadowProgram.vPositionLocation, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(shadowProgram.vPositionLocation);

    // set model-view-projection matrix
    var P = perspective(90, 1, 420, 600);
    var eye = data.lightPos;
    var at = vec3(eye[0], eye[1] - 1, eye[2]);
    var up = vec3(0, 0, 1);
    var V = lookAt(eye, at, up);
    var MVP = mult(P, V);
    gl.uniformMatrix4fv(shadowProgram.MVPLocation, false, flatten(MVP));

    // render cornell box
    gl.drawElements(gl.TRIANGLES, data.numOfIndices, gl.UNSIGNED_SHORT, 0);

    // bind the mirror ball position buffer
    gl.bindBuffer(gl.ARRAY_BUFFER, mirrorBallProgram.positionBuffer);
    gl.vertexAttribPointer(shadowProgram.vPositionLocation, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(shadowProgram.vPositionLocation);

    // render all mirror balls
    for (var i = 0; i < data.numOfBalls; i++) {
        var ball = data.mirrorBalls[i];

        // set model-view-projection matrix
        var MVP2 = mult(MVP, ball.M);
        gl.uniformMatrix4fv(shadowProgram.MVPLocation, false, flatten(MVP2));

        // render mirror ball
        gl.drawArrays(gl.TRIANGLES, 0, data.unitSphere.length);
    }

    // unbind framebuffer
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.viewport( 0, 0, 512, 512);
}

function initCamera() {
    // create view-projection matrix
    var fov = 37.5;
    var aspect = canvas.width / canvas.height;
    data.P = perspective(fov, aspect, 1, 3000);

    // set light matrix
    var PLight = perspective(90, 1, 420, 600);
    var eye = data.lightPos;
    var at = vec3(eye[0], eye[1] - 1, eye[2]);
    var up = vec3(0, 0, 1);
    data.MVPLight = mult(PLight, lookAt(eye, at, up));

    // enable depth test
    gl.enable(gl.DEPTH_TEST);

    gl.clearColor(0.15, 0.15, 0.15, 1.0);
}

function generateCubeMaps() {
    // generate the cube map
    for (var i = 0; i < data.mirrorBalls.length; i++) {
        generateCubemap(data.mirrorBalls[i], renderScene);
    }
    // once all maps are rendered we update them all
    for (var i = 0; i < data.mirrorBalls.length; i++) {
        updateCubeMap(data.mirrorBalls[i]);
    }
}

// renders a single frame
function renderFrame() {
    frames++;
    applyAnimations();

    // render shadow maps
    renderShadowMap();

    // render all cube maps
    generateCubeMaps();

    // render scene
    renderScene(getView(), data.P, -1, 0);
    requestAnimFrame(renderFrame);
}

// render the whole scene except the MirrorBall with id <ignoreId> using the view-projection <VP>
function renderScene(V, P, ignoreId, storeDepth) {
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    renderCornellBox(V, P, storeDepth);

    // render the mirror balls
    switchProgram("MirrorBall");
    for (var i = 0; i < data.numOfBalls; i++) {
        if (ignoreId != i)
            renderMirrorBall(data.mirrorBalls[i], V, P, storeDepth);
    }
}

function renderCornellBox(V, P, storeDepth) {
    switchProgram("Lambertian");

    // set matrices
    gl.uniformMatrix4fv(lambertianProgram.MVLocation, false, flatten(V));
    gl.uniformMatrix4fv(lambertianProgram.PLocation, false, flatten(P));
    // set light matrix
    gl.uniformMatrix4fv(lambertianProgram.MVPLightLocation, false, flatten(data.MVPLight));

    // store the depth in the alpha component of the cube map for each cube
    gl.uniform1f(lambertianProgram.storeDepthLocation, storeDepth);

    // set light emission
    var Lr = data.lightIntensity * data.lightColor[0];
    var Lg = data.lightIntensity * data.lightColor[1];
    var Lb = data.lightIntensity * data.lightColor[2];
    var Le = vec3(Lr, Lg, Lb);
    gl.uniform3fv(lambertianProgram.LeLocation, Le);

    // set shadow map
    gl.uniform1i(lambertianProgram.shadowMapLocation, 0);

    // set light position (in view space)
    var lightPos = vec3(mult2(V, vec4(data.lightPos, 1)));
    gl.uniform3fv(lambertianProgram.lPosLocation, lightPos);

    gl.drawElements(gl.TRIANGLES, data.numOfIndices, gl.UNSIGNED_SHORT, 0);
}

function renderMirrorBall(mirrorBall, V, P, storeDepth) {
    // set matrices
    var MV = mult(V, mirrorBall.M);
    gl.uniformMatrix4fv(mirrorBallProgram.MVLocation, false, flatten(MV));
    gl.uniformMatrix4fv(mirrorBallProgram.PLocation, false, flatten(P));
    // inverse of the rotational part of the view matrix
    var inv = inverse4(V);

    gl.uniformMatrix4fv(mirrorBallProgram.invLocation, false, flatten(inv));

    // don't store depth or use parallax (used in part3)
    gl.uniform1f(mirrorBallProgram.storeDepthLocation, storeDepth);
    gl.uniform1f(mirrorBallProgram.useParallaxLocation, 1);

    // set center position of mirror ball in view space
    var center = vec3(mult2(V, vec4(mirrorBall.position, 1)));
    gl.uniform3fv(mirrorBallProgram.centerLocation, center);

    // set cube map
    gl.activeTexture(gl.TEXTURE1);
    gl.bindTexture(gl.TEXTURE_CUBE_MAP, mirrorBall.lookup);
    gl.uniform1i(mirrorBallProgram.cubemapLocation, 1);

    gl.drawArrays(gl.TRIANGLES, 0, data.unitSphere.length);
}

function applyAnimations() {
    var posY = data.mirrorBalls[3].position[1];
    if (posY <= 40 || posY >= 125)
        data.ballSpeed *= -1;
    data.mirrorBalls[3].translate(data.ballSpeed);
}