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
    loadImg("earth.jpg", initProgram);

    // add event listeners for buttons
    document.getElementById("Increase").onclick = function(){
        data.subdiv++;
        createSphere();
        document.getElementById("subdiv").textContent = data.subdiv;
    };
    document.getElementById("Decrease").onclick = function(){
        if (data.subdiv > 0) {
            data.subdiv--;
            createSphere();
            document.getElementById("subdiv").textContent = data.subdiv;
        }
    };
};

function setData() {
    data = new Object();

    // subdivision level and rotation
    data.subdiv = 5;
    data.angle = 0;
    data.rotationSpeed = 0.3;
    data.light = vec3(0, -1, 0);
}

function initProgram(image) {
    //  Load shaders
    program = initShaders(gl, "vertex-shader", "fragment-shader");
    gl.useProgram(program);

    // load attribute locations
    program.vPositionLocation = gl.getAttribLocation(program, "vPosition");
    program.MLocation = gl.getUniformLocation(program, "M");
    program.VPLocation = gl.getUniformLocation(program, "VP");
    program.leLocation = gl.getUniformLocation(program, "le");
    program.LaLocation = gl.getUniformLocation(program, "La");
    program.LdLocation = gl.getUniformLocation(program, "Ld");

    // create buffers
    program.positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, program.positionBuffer);
    gl.vertexAttribPointer(program.vPositionLocation, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(program.vPositionLocation);

    // directional light
    gl.uniform3fv(program.leLocation, flatten(data.light));

    initCamera();
    createSphere();
    updateProperties();
    createTexture(image);
    render();
}

function createTexture(image) {
    // load texture
    var texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);
    // set options
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);

    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB,
        gl.UNSIGNED_BYTE, image);
}

// called from the sliders in the HTML file
function updateProperties() {
    // ambient light
    var val = document.getElementById("ambient").value;
    var ambient = vec4(val, val, val, 1);
    var string = "[" + val + ", " + val + ", " + val + "]";
    document.getElementById("ambientText").textContent = string;
    gl.uniform4fv(program.LaLocation, flatten(ambient));

    // diffuse light
    val = document.getElementById("diffuse").value;
    var diffuse = vec4(val, val, val, 1);
    string = "[" + val + ", " + val + ", " + val + "]";
    document.getElementById("diffuseText").textContent = string;
    gl.uniform4fv(program.LdLocation, flatten(diffuse));
}

function createSphere() {
    // construct the unit sphere (see Shapes.js)
    data.unitSphere = unitSphere(data.subdiv);
    gl.bindBuffer(gl.ARRAY_BUFFER, program.positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(data.unitSphere), gl.STATIC_DRAW);
}

function initCamera() {
    // create view-projection matrix
    var fov = 45.0;
    var aspect = canvas.width / canvas.height;
    var P = perspective(fov, aspect, 1, 10);
    var V = translate(0, 0, -3);
    var VP = mult(P, V);
    gl.uniformMatrix4fv(program.VPLocation, false, flatten(VP));

    // enable depth test
    gl.enable(gl.DEPTH_TEST);

    // enabling culling
    gl.enable(gl.CULL_FACE);
    gl.cullFace(gl.BACK);

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

    // create model matrix
    var M = rotate(data.angle, vec3(0, 1, 0));
    gl.uniformMatrix4fv(program.MLocation, false, flatten(M));

    gl.drawArrays(gl.TRIANGLES, 0, data.unitSphere.length);
    requestAnimFrame(render);
}