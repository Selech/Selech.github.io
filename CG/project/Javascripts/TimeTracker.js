var frames = 0;

function startTracking() {
    setInterval(updateLabels, 1000);
}

function updateLabels() {
    var fps = frames;
    var msPerFrame = (1000 / frames).toFixed(1);

    document.getElementById("fps").innerText = fps + "";
    document.getElementById("mspf").innerText = msPerFrame + "";
    frames = 0;
}