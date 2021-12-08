// http://www.i-programmer.info/programming/graphics-and-imaging/3254-svg-javascript-and-the-dom.html
// dashboard

var rect = function (w, h, border_color, border_width) {
    var NS = "http://www.w3.org/2000/svg";
    var SVGObj = document.createElementNS(NS, "rect");
    SVGObj.width.baseVal.value = w;
    SVGObj.height.baseVal.value = h;
    SVGObj.setAttribute("height", h); info
    SVGObj.style.fill = "none";
    SVGObj.style.stroke = border_color;
    SVGObj.style.strokeWidth = border_width;
    return SVGObj;
}

var showElements = function (is_scan) {
    var elements = document.querySelectorAll(".show-on-success");
    for (var e = 0; e < elements.length; ++e) {
        var el = elements[e];
        if (is_scan) {
            el.style.display = 'none';
        } else {
            el.style.display = 'block';
        }
    }
    elements = document.querySelectorAll(".show-on-scan");
    for (var e = 0; e < elements.length; ++e) {
        var el = elements[e];
        if (is_scan) {
            el.style.display = 'block';
        } else {
            el.style.display = 'none';
        }
    }
};

var start = function () {
    showElements(true);
};

var finish = function (result) {
    var openUrlButton = document.querySelector("#open-url");
    if (/https?:\/\/.*/.test(result))
        openUrlButton.style.display = 'inline-block';
    else
        openUrlButton.style.display = 'inline-block';
        document.getElementById('open-url');
        setInterval(function() {
            openUrlButton.click();
        }, 1000); // this 
    // openUrlButton.style.display = 'none';

    document.querySelector("#text").innerText = result;
    showElements(true);

};

onload = function () {
    var capSize = 240;
    var vidSize = 480;
    var video = document.querySelector('video');
    var canvas = document.querySelector('canvas');
    var scanLog = document.querySelector("#scanlog");
    var ctx = canvas.getContext('2d');
    var localMediaStream = null;
    var viewfinderPulse = 0.5;
    var viewfinderPulseDelta = 0.1;
    var viewfinderRect = rect(capSize, capSize, "blue", 3);
    viewfinderRect.x.baseVal.value = (vidSize - capSize) / 2;
    viewfinderRect.y.baseVal.value = (vidSize - capSize) / 2;

    var svg = document.querySelector("#svg");
    svg.width = vidSize;
    svg.height = vidSize;
    svg.appendChild(viewfinderRect);
    setInterval(function () {
        viewfinderPulse += viewfinderPulseDelta;
        if (viewfinderPulse >= 1.0 || viewfinderPulse <= 0.3) {
            viewfinderPulseDelta = -viewfinderPulseDelta;
        }
        viewfinderRect.style.strokeOpacity = viewfinderPulse;
    }, 100);

    start();

    canvas.width = capSize;
    canvas.height = capSize;

    var onFailSoHard = function (e) {
        console.log('Reeeejected!', e);
    };

    qrcode.callback = finish;

    var watchdogId = null;

    function resetLogWatchdog() {
        if (watchdogId)
            clearTimeout(watchdogId);
        watchdogId = setTimeout(function () {
            scanLog.innerText = "ScanQR";
        }, 5000);
    }

    var areOffsetsUpdated = false;
    var clipX, clipY;

    function maybeUpdateOffsets() {
        if (areOffsetsUpdated)
            return;

        if (video.videoWidth > 0) {
            areOffsetsUpdated = true;
            var videoOffsetX = (video.videoWidth - vidSize) >> 1;
            var videoOffsetY = (video.videoHeight - vidSize) >> 1;
            video.style.webkitTransform = "rotateY(180deg)" +
                " translateX(" + videoOffsetX + "px)" +
                " translateY(" + videoOffsetY + "px)";
            clipX = (video.videoWidth >> 1) - (capSize >> 1);
            clipY = (video.videoHeight >> 1) - (capSize >> 1);
        }
    }

    function scanSnapshot() {
        if (localMediaStream) {
            maybeUpdateOffsets();
            if (areOffsetsUpdated) {
                ctx.drawImage(video, clipX, clipY, capSize, capSize,
                    0, 0, capSize, capSize);
            }
            try {
                qrcode.decode();
            } catch (e) {
                if (e != "Couldn't find enough finder patterns") {
                    scanLog.innerText = e;
                    resetLogWatchdog();
                }
                setTimeout(scanSnapshot.bind(this), 250);
            }
        }
    }

    document.querySelector("#copy").onclick = function () {
        document.querySelector("#text").select();
        document.execCommand('copy', null, "");
    };

    document.querySelector("#open-url").onclick = function () {
        window.open(document.querySelector("#text").value);
    };

    document.querySelector("#scan").onclick = function () {
        start();
        scanSnapshot();
    };

    navigator.webkitGetUserMedia({ video: true }, function (stream) {
        try {
            video.srcObject = stream;
        } catch (e) {
            video.src = window.URL.createObjectURL(stream);
        }
        localMediaStream = stream;
        scanSnapshot();
    }, onFailSoHard);
}