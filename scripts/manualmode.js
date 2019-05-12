var cur_id = 0;
var cur_dataset = [];

var manualData = [];
var manualChart = null;

//load the light curve in manual mode
function loadLightcurve() {
    try {
        disableInput();
        showLoader();
        resetManualChart(function () {
            resetManualResult();
            statusDisplay.innerHTML = "";
            var id = parseInt(k2Input.value);

            datafetcher.getLightCurveURL(id, function (url) {
                datafetcher.getLightCurve(url, function (data) {
                    cur_id = id;
                    cur_dataset = data;

                    updateManualChart(id, data, function () {
                        accuracyDisplay.innerHTML = "";
                        enableInput();
                        hideLoader();
                        showScanBtn();
                    });
                });
            });
        });
    } catch (ex) {
        enableInput();
        logger.log_error("Error while loading lightcurve: " + ex);
        hideLoader();
    }
}

function resetManualChart(callback) {
    hideScanBtn();
    outerManualChart.removeChild(document.getElementById("manualChart"));
    var div = document.createElement("div");
    div.classList.add("chart");
    div.id = "manualChart";
    outerManualChart.appendChild(div);

    manualData = [];

    manualChart = new CanvasJS.Chart("manualChart", {
        zoomEnabled: true,
        title: {
            text: ""
        },
        axisY: {
            includeZero: false,
            title: "Flux"
        },
        data: [{
            markerSize: 2,
            color: "#6292C4",
            type: "line",
            dataPoints: manualData
        }]
    });
    manualChart.render();
    callback();
}

function enableInput() {
    k2Input.disabled = false;
    k2InputBtn.disabled = false;
}

function disableInput() {
    k2Input.disabled = true;
    k2InputBtn.disabled = true;
}

function showScanBtn() {
    document.getElementById("manual-start-scan-btn").style.display = "inline-block";
}

function hideScanBtn() {
    document.getElementById("manual-start-scan-btn").style.display = "none";
}

//start analysis for manual mode
function startAnalysis() {
    disableInput();
    var data = cur_dataset;
    var id = cur_id;
    startScan(id, {
        accuracy: document.getElementById("manual-accuracy-display"),
        status: document.getElementById("manual-status-display")
    }, manualChart, manualData, function () {
        logger.log_info("Succesfully scanned " + id);
        manualAdjustResult.style.display = 'block';
        enableInput();
    });
}

function adjustManualResult() {
    showModal(entity);
}

function resetManualResult() {
    manualAdjustResult.style.display = 'none';
    manualResult.style.display = 'none';
    while (manualResult.firstChild) {
        manualResult.removeChild(manualResult.firstChild);
    }
}

function updateManualChart(id, data, callback) {
    manualData.splice(0, manualData.length);

    for (var i = 0; i < data.length; i++) {
        manualData.push(data[i]);
    }

    manualChart.options.title.text = 'EPIC ' + id;
    manualChart.render();
    callback();
}

function changeType() {
    var type = document.getElementById("select-chart-type").value;
    manualChart.options.data[0].type = type;
    manualChart.render();
}