// create a circle at position <pos> with radius <r> that consists of <vCount> number of vertices
function createCircle(pos, r, vCount) {
    // angle between vertices
    var vAngle = (2 * Math.PI) / (vCount - 2);
    var vertices = [
        pos,
        vec2(pos[0] + r, pos[1])
    ];
    // generate the points
    for(var i = 1; i < (vCount - 1); i++) {
        var x = Math.cos(vAngle * i) * r + pos[0];
        var y = Math.sin(vAngle * i) * r + pos[1];
        vertices.push(vec2(x, y));
    }

    return vertices;
}

// creates a cube from a list of vertices <vertices> (wireframe)
function cubeLine(vertices) {
    var cube = [];
    // create all edges
    // top face edges
    edge(cube, vertices, 0, 1);
    edge(cube, vertices, 1, 2);
    edge(cube, vertices, 2, 3);
    edge(cube, vertices, 3, 0);
    // bottom face edges
    edge(cube, vertices, 4, 5);
    edge(cube, vertices, 5, 6);
    edge(cube, vertices, 6, 7);
    edge(cube, vertices, 7, 4);
    // vertical edges
    edge(cube, vertices, 0, 4);
    edge(cube, vertices, 1, 5);
    edge(cube, vertices, 2, 6);
    edge(cube, vertices, 3, 7);

    return cube;
}

// saves an edge in the cube from v1 to v2
function edge(cube, vertices, v1, v2) {
    cube.push(vertices[v1]);
    cube.push(vertices[v2]);
}

// creates a unit sphere from a tetrahexagon divided <subdiv> number of times
function unitSphere(subdiv) {
    // four initial vertices
    var a = vec4(0, 0, 1, 1);
    var b = vec4(0, 0.942809, -0.333333, 1);
    var c = vec4(-0.816497, -0.471405, -0.333333, 1);
    var d = vec4(0.816497, -0.471405, -0.333333, 1);

    // divide triangle recursively
    var shape = [];
    divideTriangle(shape, a, b, c, subdiv);
    divideTriangle(shape, d, c, b, subdiv);
    divideTriangle(shape, a, d, b, subdiv);
    divideTriangle(shape, a, c, d, subdiv);

    return shape;
}

function divideTriangle(shape, a, b, c, count) {
    if (count > 0) {
        var ab = normalize(mix(a, b, 0.5), true);
        var ac = normalize(mix(a, c, 0.5), true);
        var bc = normalize(mix(b, c, 0.5), true);

        divideTriangle(shape, a, ab, ac, count - 1);
        divideTriangle(shape, ab, b, bc, count - 1);
        divideTriangle(shape, bc, c, ac, count - 1);
        divideTriangle(shape, ab, bc, ac, count - 1);
    }
    else { // draw triangle at end of recursion
        shape.push(a);
        shape.push(b);
        shape.push(c);
    }
}