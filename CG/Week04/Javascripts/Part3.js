var gl;
var canvas;
var buffers;
var data;

window.onload = function init()
{
    // initialize canvas and WebGL
    canvas = document.getElementById( "gl-canvas" );
    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }
    gl.viewport( 0, 0, canvas.width, canvas.height );

    setData();
    initProgram();
    render();

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
}

function setData() {
    data = new Object();

    data.subdiv = 4;
    data.angle = 0;
    data.rotationSpeed = 1.5;
    // directional light
    data.light = vec4(0, -1, 0, 0);
}

function initProgram() {
    //  Load shaders
    program = initShaders(gl, "vertex-shader", "fragment-shader");
    gl.useProgram(program);

    // load attribute locations
    program.vPositionLocation = gl.getAttribLocation(program, "vPosition");
    program.MVLocation = gl.getUniformLocation(program, "MV");
    program.PLocation = gl.getUniformLocation(program, "P");
    program.leLocation = gl.getUniformLocation(program, "le");
    program.apLocation = gl.getUniformLocation(program, "ap");
    program.dpLocation = gl.getUniformLocation(program, "dp");
    program.spLocation = gl.getUniformLocation(program, "sp");
    program.alphaLocation = gl.getUniformLocation(program, "alpha");

    // create buffers
    program.positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, program.positionBuffer);
    gl.vertexAttribPointer(program.vPositionLocation, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(program.vPositionLocation);

    initCamera();
    createSphere();
    updateProperties();
}

// called from the sliders in the HTML file
function updateProperties() {
    // light emission
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

    // alpha (shininess)
    var alpha = document.getElementById("alpha").value;
    document.getElementById("alphaText").textContent = alpha;
    gl.uniform1f(program.alphaLocation, alpha);
}

function createSphere() {
    // construct the unit sphere (see Shapes.js)
    data.unitSphere = unitSphere(data.subdiv);
    gl.bindBuffer(gl.ARRAY_BUFFER, program.positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(data.unitSphere), gl.STATIC_DRAW);
}

function initCamera() {
    // create projection matrix
    var fov = 45.0;
    var aspect = canvas.width / canvas.height;
    var P = perspective(fov, aspect, 1, 10);
    gl.uniformMatrix4fv(program.PLocation, false, flatten(P));

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

    // set model-view matrix (just the view since model is just an identity)
    var V = rotate(data.angle, vec3(0, 1, 0));
    V = mult(translate(0, 0, -3), V);
    gl.uniformMatrix4fv(program.MVLocation, false, flatten(V));

    // set directional light to view space
    var le = vec3(mult2(V, data.light));
    gl.uniform3fv(program.leLocation, flatten(le));

    gl.drawArrays(gl.TRIANGLES, 0, data.unitSphere.length);
    requestAnimFrame(render);
}