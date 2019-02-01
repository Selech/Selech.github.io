var gl;
var program;
var data;

window.onload = function init()
{
    // initialize canvas and WebGL
	var canvas = document.getElementById( "gl-canvas" );
    gl = WebGLUtils.setupWebGL( canvas );
	if ( !gl ) { alert( "WebGL isn't available" ); }
	gl.viewport( 0, 0, canvas.width, canvas.height );
	gl.clearColor(0.3921, 0.5843, 0.9294, 1.0);
    
    setData();
    initProgram();
    render();
}

function setData() {
    data = new Object();
    // positions
    data.points = [
        vec2(0, 0.5),
        vec2(0.5, 0),
        vec2(-0.5, 0),
        vec2(0, -0.5)
    ];
    // angle
    data.angle = 0.0;
    data.rotationSpeed = 2;
}

function initProgram() {
    //  Load shaders
    program = initShaders(gl, "vertex-shader", "fragment-shader");
    gl.useProgram(program);

    // load attribute locations
    program.vPositionLocation = gl.getAttribLocation(program, "vPosition");
    program.MLocation = gl.getUniformLocation(program, "M");

    // create buffers
    program.positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, program.positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(data.points), gl.STATIC_DRAW);
    gl.vertexAttribPointer(program.vPositionLocation, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(program.vPositionLocation);
}

function applyAnimation() {
    data.angle += data.rotationSpeed;
}

function render(){
    gl.clear(gl.COLOR_BUFFER_BIT);

    applyAnimation();

    // create model matrix
    var M = rotate(data.angle, [0, 0, 1]);
    gl.uniformMatrix4fv(program.MLocation, false, flatten(M));

    gl.drawArrays(gl.TRIANGLE_STRIP, 0, data.points.length);
    requestAnimFrame(render);
}