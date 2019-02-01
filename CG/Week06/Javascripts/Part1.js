var gl;
var canvas;
var data;
var program;

window.onload = function init()
{
    // initialize canvas and WebGL
    canvas = document.getElementById( "gl-canvas" );
    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }
    gl.viewport( 0, 0, canvas.width, canvas.height );

    setData();
    initProgram();
}

function setData() {
    data = new Object();

    // create rectangle
    data.rectangle = [
        vec3(-4, -1, -1),
        vec3(4, -1, -1),
        vec3(4, -1, -21),
        vec3(-4, -1, -21)];

    // create tex coordinates
    data.texCoords = [
        vec2(-1.5, 0),
        vec2(2.5, 0),
        vec2(2.5, 10),
        vec2(-1.5, 10),
    ]

    // modes
    data.wrappingModes = [gl.REPEAT, gl.CLAMP_TO_EDGE ];
    data.filteringModes = [gl.NEAREST, gl.LINEAR, gl.LINEAR_MIPMAP_LINEAR];
}

function initProgram() {
    //  Load shaders
    program = initShaders(gl, "vertex-shader", "fragment-shader");
    gl.useProgram(program);

    // load attribute locations
    program.vPositionLocation = gl.getAttribLocation(program, "vPosition");
    program.vTexCoordLocation = gl.getAttribLocation(program, "vTexCoord");
    program.MVPLocation = gl.getUniformLocation(program, "MVP");
    program.textureLocation = gl.getUniformLocation(program, "texture");

    // create buffers
    // positions
    program.positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, program.positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(data.rectangle), gl.STATIC_DRAW);
    gl.vertexAttribPointer(program.vPositionLocation, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(program.vPositionLocation);
    // texture coordinates
    program.texCoordBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, program.texCoordBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(data.texCoords), gl.STATIC_DRAW);
    gl.vertexAttribPointer(program.vTexCoordLocation, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(program.vTexCoordLocation);

    initCamera();
    generateTexture();
    updateFilter();
    updateWrap();
}

function initCamera() {
    // create model-view-projection matrix (just projection here)
    var fov = 90.0;
    var aspect = canvas.width / canvas.height;
    var P = perspective(fov, aspect, 1, 25);
    gl.uniformMatrix4fv(program.MVPLocation, false, flatten(P));

    gl.clearColor(0.3921, 0.5843, 0.9294, 1.0);
}

function generateTexture() {
    var gridSize = 8;
    var texSize = gridSize * 8;
    var data = new Uint8Array(4 * texSize * texSize);;

    for (var i = 0; i < texSize; i++) {
        for (var j = 0; j < texSize; j++) {
            var x = Math.floor(i / gridSize);
            var y = Math.floor(j / gridSize);
            var c = (x + y) % 2 == 0 ? 255 : 0;
            var idx = 4 * (i * texSize + j);
            data[idx] = c;
            data[idx + 1] = c;
            data[idx + 2] = c;
            data[idx + 3] = 255;
        }
    }

    //create texture
    var texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.uniform1i(program.textureLocation, 0);
    // set texture pixel data
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, texSize, texSize, 0, gl.RGBA, gl.UNSIGNED_BYTE, data);
    // generate mip map of the texture
    gl.generateMipmap(gl.TEXTURE_2D);
}

function updateFilter() {
    // updates the filtering mode
    var chosen = document.getElementById("filteringMode").selectedIndex;
    var mode = data.filteringModes[chosen];
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, mode);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, mode);
    render();
}

function updateWrap() {
    // updates the wrapping mode
    var chosen = document.getElementById("wrappingMode").selectedIndex;
    var mode = data.wrappingModes[chosen];
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, mode);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, mode);
    render();
}

function render(){
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.drawArrays(gl.TRIANGLE_FAN, 0, data.rectangle.length);
}