// up direction
var up = vec3(0, 1, 0);
// camera position
var eyePos;
// rotation along x- and y-axis
var rx;
var ry;

var rotationSpeed = 1;
var translateSpeed = 10;
var zoomSpeed = 12;

function enableNavigation() {
    var canvas = document.getElementById( "gl-canvas" );

    document.addEventListener('keydown', function(event) {
        // get the key code of the button pressed
        var keycode;
        if (event.charCode) {
            keycode = event.charCode;
        }
        else {
            keycode = event.keyCode;
        }

        switch(keycode) {
            case 37: //left arrow
                eyePos = vec3(eyePos[0] + translateSpeed, eyePos[1], eyePos[2]);
                break;
            case 38: //up arrow
                eyePos = vec3(eyePos[0], eyePos[1] + translateSpeed, eyePos[2]);
                break;
            case 39: //right arrow
                eyePos = vec3(eyePos[0] - translateSpeed, eyePos[1], eyePos[2]);
                break;
            case 40: //down arrow
                eyePos = vec3(eyePos[0], eyePos[1] - translateSpeed, eyePos[2]);
                break;
            case 65: // a
                ry -= rotationSpeed;
                break;
            case 68: // d
                ry += rotationSpeed;
                break;
            case 83: // s
                rx += rotationSpeed;
                break;
            case 87: // w
                rx -= rotationSpeed;
                break;
            case 107: // +
            case 187:
                eyePos = vec3(eyePos[0], eyePos[1], eyePos[2] + zoomSpeed);
                break;
            case 109: // -
            case 189:
                eyePos = vec3(eyePos[0], eyePos[1], eyePos[2] - zoomSpeed);
                break;
        }
    }, false);

    setView(1);
}

// returns a view matrix
function getView() {
    var V = translate(-eyePos[0], -eyePos[1], -eyePos[2]);
    V = mult(rotate(ry, vec3(0, 1, 0)), V);
    V = mult(rotate(rx, vec3(1, 0, 0)), V);
    return V;
}

function setView(id) {
    switch(id) {
        case 1:
            eyePos = vec3(278, 273, -800);
            rx = 0;
            ry = 180;
            break;
        case 2:
            eyePos = vec3(210, 70, -10);
            rx = -5;
            ry = 140;
            break;
        case 3:
            eyePos = vec3(660, 380, -210);
            rx = 20;
            ry = -125;
            break;
        case 4:
            eyePos = vec3(540, 490, 540);
            rx = 50;
            ry = -25;
            break;
        case 5:
            eyePos = vec3(320, 120, 300);
            rx = 5;
            ry = -63;
            break;
    }
}
