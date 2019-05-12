var jquery = require('jquery');
var bootstrap = require('bootstrap');

var exports = module.exports;

function getColorForCandidate(index) {
    var colors = ["#51b351", "#C63D0F", "#004544", "#D9853B", "#005A31"];

    if (index >= colors.length) {
        return '#' + Math.floor(seededRandom(index) * 16777215).toString(16);
    }
    return colors[index];
}

function seededRandom(i) {
    return (1 + Math.sin(i * 342.325634543)) / 2;
}

function addStarEntry(parent, star) {
    var root = document.createElement("div");
    root.classList.add("candidate-entry");
    root.classList.add("row");
    root.style.borderLeft = "20px solid #ead009";

    var col1 = document.createElement("div");
    col1.classList.add("col-md-3");
    root.appendChild(col1);
    var h1 = document.createElement("h1");
    h1.innerHTML = "Host Star";
    col1.appendChild(h1);
    var h3 = document.createElement("h3");
    h3.innerHTML = "EPIC " + star.epic;
    col1.appendChild(h3);

    var col2 = document.createElement("div");
    col2.classList.add("col-md-9");
    root.appendChild(col2);

    addValueToElement(col2, "col-md-4", "mass", star.mass, star.units.mass);
    addValueToElement(col2, "col-md-4", "radius", star.radius, star.units.radius);
    addValueToElement(col2, "col-md-4", "radius err 1", star.rad_err1, star.units.rad_err1);
    addValueToElement(col2, "col-md-4", "radius err 2", star.rad_err2, star.units.rad_err2);
    addValueToElement(col2, "col-md-4", "temperature", star.effectiveTemp, star.units.effectiveTemp);

    parent.appendChild(root);
}

function addCandidateEntry(parent, candidate, index, color) {
    var root = document.createElement("div");
    root.classList.add("candidate-entry");
    root.classList.add("row");
    root.classList.add("collapse");
    root.id = "candidate-" + index;
    root.style.borderLeft = "20px solid " + color;

    var col1 = document.createElement("div");
    col1.classList.add("col-md-4");
    root.appendChild(col1);
    var h2 = document.createElement("h2");
    h2.innerHTML = (index + 1) + ". Candidate";
    col1.appendChild(h2);
    addPlanetRatio(col1, candidate.avgPlanetRadius);

    var col2 = document.createElement("div");
    col2.classList.add("col-md-4");
    root.appendChild(col2);
    col2.appendChild(document.createElement("br"));

    var col3 = document.createElement("div");
    col3.classList.add("dip-container");
    root.appendChild(col3);

    addValueToElement(col2, "col-md-12", "avg period", candidate.periodAvg, candidate.units.avgPeriod);
    addValueToElement(col2, "col-md-12", "avg delta flux", candidate.avgDeltaFlux, candidate.units.avgDeltaFlux);
    addValueToElement(col2, "col-md-12", "avg full time", candidate.avgFullTime, candidate.units.avgFullTime);
    addValueToElement(col2, "col-md-12", "avg total time", candidate.avgTotalTime, candidate.units.avgTotalTime);
    addValueToElement(col2, "col-md-12", "avg planet radius", candidate.avgPlanetRadius, candidate.units.avgPlanetRadius);
    addValueToElement(col2, "col-md-12", "avg planet radius err 1", candidate.avgPlanetRadiusErr1, candidate.units.avgPlanetRadiusErr1);
    addValueToElement(col2, "col-md-12", "avg planet radius err 2", candidate.avgPlanetRadiusErr2, candidate.units.avgPlanetRadiusErr2);
    addValueToElement(col2, "col-md-12", "semimajor axis", candidate.semiMajorAxis, candidate.units.semiMajorAxis);
    addValueToElement(col2, "col-md-12", "orbital velocity", candidate.orbitalVelocity, candidate.units.orbitalVelocity);
    addValueToElement(col2, "col-md-12", "equilibrium Temperature KBB01", candidate.equTempKBB01, candidate.units.equTempKBB01);
    addValueToElement(col2, "col-md-12", "equilibrium Temperature KBB02", candidate.equTempKBB02, candidate.units.equTempKBB02);
    addValueToElement(col2, "col-md-12", "equilibrium Temperature KBB07", candidate.equTempKBB07, candidate.units.equTempKBB07);

    addDipsToEntry(col3, candidate.dips);

    addToggleCollapse(root);

    parent.appendChild(root);
    $('.collapse').collapse('show');
}

function addToggleCollapse(root) {
    var collapsedHeight = "60px";

    var div = document.createElement("div");
    div.classList.add("toggle-collapse");
    div.innerHTML = "<i>collapsed</i><span class='glyphicon glyphicon-chevron-up'></span>";

    div.onclick = function (event) {
        $('#' + root.id).collapse('toggle');

        if (div.firstChild.innerHTML == "collapsed") {
            div.innerHTML = "<i>hidden</i><span class='glyphicon glyphicon-chevron-down'></span>";
        } else {
            div.innerHTML = "<i>collapsed</i><span class='glyphicon glyphicon-chevron-up'></span>";
        }
    }
    root.appendChild(div);
}

function addPlanetRatio(root, radius) {
    if (radius != null) {
        var parent = document.createElement("div");
        parent.classList.add("planet-display");

        var earth_rad = 0.0892;

        var max_size = 200;
        var earth_size = 0;
        var planet_size = 0;

        var p1 = document.createElement("div");
        p1.classList.add("planet");
        var p2 = document.createElement("div");
        p2.classList.add("planet");

        if (earth_rad > radius) {
            earth_size = max_size;
            planet_size = Math.round((radius / earth_rad) * max_size);
            p1.style.width = p1.style.height = earth_size + "px";
            p2.style.width = p2.style.height = planet_size + "px";
            addImageToElement(p1, 'https://i.imgur.com/EUMHlmb.jpg');
        } else {
            planet_size = max_size;
            earth_size = Math.round((earth_rad / radius) * max_size);
            p1.style.width = p1.style.height = planet_size + "px";
            p2.style.width = p2.style.height = earth_size + "px";
            addImageToElement(p2, 'https://i.imgur.com/EUMHlmb.jpg');
        }

        parent.appendChild(p1);
        parent.appendChild(p2);
        root.appendChild(parent);
    }
}

function addImageToElement(root, src) {
    var img = document.createElement("img");
    img.src = src;
    img.style.width = img.style.height = "100%";
    root.appendChild(img);
}

function addDipsToChart(chart, dataset, dips, color) {
    for (var i = 0; i < dips.length; i++) {
        var dipdata = [];
        var dip = dips[i];

        var start = dip.globalStartIndex;
        var end = dip.globalEndIndex;

        for (var j = start + 1; j <= end + 1; j++) {
            dipdata.push(dataset[j]);
        }
        chart.options.data.push({
            markerSize: 4,
            color: color,
            type: "line",
            dataPoints: dipdata,
            highlightEnabled: false
        });
    }
    chart.render();
}

function removeCandidateFromChart(chart, dipIndex) {
    chart.options.data.splice(dipIndex, 1);
    chart.render();
}
function removeAllCandidatesFromChart(chart) {
    chart.options.data.splice(1);
    chart.render();
}

function randomInt(a, b) {
    return Math.floor(a + (Math.random() * (b - a)));
}

function addDipsToEntry(root, dips) {
    for (var i = 0; i < dips.length; i++) {
        var dip = dips[i];

        var div = document.createElement("div");
        div.classList.add("candidate-entry-dip");
        div.classList.add("row");
        var h4 = document.createElement("h4");
        h4.innerHTML = (i + 1) + ". Dip";
        div.appendChild(h4);

        addValueToElement(div, "col-md-12 col-lg-6", "start", dip.startPoint);
        addValueToElement(div, "col-md-12 col-lg-6", "end", dip.endPoint);
        addValueToElement(div, "col-md-12", "delta flux", dip.deltaFlux);
        addValueToElement(div, "col-md-12", "total transit time", dip.totalTime);
        addValueToElement(div, "col-md-12", "full transit time", dip.fullTime);

        root.appendChild(div);
    }
}

function addValueToElement(root, col, key, value, unit = "") {
    if (typeof value === 'number') {
        var digits = 4;
        if (value < 0.1) {
            digits = 6;
        }
        if (value > 100) {
            digits = 2;
        }
        value = roundNDigits(value, digits);
    }

    if (value == null) {
        value = 'unknown';
        unit = '';
    }

    var div = document.createElement("div");
    var cols = col.split(" ");
    for (var i = 0; i < cols.length; i++) {
        div.classList.add(cols[i]);
    }
    div.innerHTML = "<strong>" + key + ": </strong>" + value;
    if (value != null) {
        div.innerHTML += " <i>" + unit + "</i>";
    }
    root.appendChild(div);
}

function roundNDigits(val, n) {
    var factor = Math.pow(10, n);
    return Math.round(val * factor) / factor;
}

function parseToJson(str) {
    if (str == undefined) {
        return null;
    }
    if (typeof str != 'string') {
        str = str.toString();
    }
    if (str.length == 0) {
        return null;
    }

    str = str.replace(/[']/g, "\"");
    str = str.replace(/True/g, "true");
    str = str.replace(/False/g, "false");
    str = str.replace(/None/g, "null");

    return JSON.parse(str);
}

exports.getColorForCandidate = getColorForCandidate;
exports.addCandidateEntry = addCandidateEntry;
exports.addStarEntry = addStarEntry;
exports.addDipsToChart = addDipsToChart;
exports.removeCandidateFromChart = removeCandidateFromChart;
exports.removeAllCandidatesFromChart = removeAllCandidatesFromChart;
exports.addDipsToEntry = addDipsToEntry;
exports.randomInt = randomInt;
exports.parseToJson = parseToJson;