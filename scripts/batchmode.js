var batchRunning = false;

const { dialog } = require('electron').remote;

var batchData = [];
var batchChart = {};
var batchHistory = [];
var batchCounter = 0;
var starsWithHighProbabilityCounter = 0;
var starsWithCandidatesCounter = 0;
var totalCandidatesCounter = 0;
var maxBatchCount = 0;
var timeout_ms = 0;

var batchStart;
var batchEnd;
var showReport = true;

var reportJson = {};

function startBatch() {
    batchStart = new Date();
    batchModeControls.style.display = 'none';
    startBatchBtn.style.display = 'none';
    stopBatchBtn.style.display = 'inline-block';
    batchDisplay.style.display = 'inline-block';
    maxBatchCount = (countLimit.value == "" || countLimit.value == "0") ? 0 : parseInt(countLimit.value);
    timeout_ms = (timeLimit.value == "" || timeLimit.value == "0") ? 0 : parseFloat(timeLimit.value) * 60 * 1000;
    batchProgressDisplay.style.display = batchSettingsShowProgress.checked ? "block" : "none";
    outerBatchChart.style.display = batchSettingsShowChart.checked ? "block" : "none";
    showReport = batchSettingsShowReport.checked;

    resetStats();

    batchData = [];

    batchChart = new CanvasJS.Chart("batchChart", {
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
            dataPoints: batchData
        }]
    });

    if (timeout_ms != 0) {
        setTimeout(function () {
            stopBatch();
            showBatchReport();
        }, timeout_ms);
    }

    batchRunning = true;
    iterateBatch();
}

function resetStats() {
    batchCounter = 0;
    starsWithHighProbabilityCounter = 0;
    starsWithCandidatesCounter = 0;
    totalCandidatesCounter = 0;
    batchHistory = [];
}

function stopBatch() {
    batchEnd = new Date();
    startBatchBtn.style.display = 'none';
    stopBatchBtn.style.display = 'none';
    batchModeControls.style.display = 'none';
    batchDisplay.style.display = 'none';

    resetChart();
    batchRunning = false;
}


function showBatchReport() {
    if (showReport) {
        reportJson = {
            startTime: batchStart,
            endTime: batchEnd,
            starCounter: batchCounter,
            starsWithHighProbabilityCounter: starsWithHighProbabilityCounter,
            starsWithCandidatesCounter: starsWithCandidatesCounter,
            totalCandidatesCounter: totalCandidatesCounter,
            stars: []
        };
        batchReport.style.display = 'block';

        batchReportContent.innerHTML = "";
        batchReportContent.innerHTML += "<p>Batch Start: " + batchStart.toLocaleString() + "</p>";
        batchReportContent.innerHTML += "<p>Batch End: " + batchEnd.toLocaleString() + "</p>";
        batchReportContent.innerHTML += "<p>Batch duration: " + parseDate(batchEnd.getTime() - batchStart.getTime()) + "</p>";
        batchReportContent.innerHTML += "<p>Stars analysed: " + batchCounter + "</p>";
        batchReportContent.innerHTML += "<p>Stars with high probability: " + starsWithHighProbabilityCounter + "</p>";
        batchReportContent.innerHTML += "<p>Stars with candidates: " + starsWithCandidatesCounter + "</p>";
        batchReportContent.innerHTML += "<p>Total candidates: " + totalCandidatesCounter + "</p>";
        batchReportContent.innerHTML += "<hr>";
        for (var i = 0; i < batchHistory.length; i++) {
            var entity = batchHistory[i];
            reportJson.stars.push(entity);
            var temp = "";
            temp += "<p>" + entity.id + " - ";

            if ('accuracy' in entity) {
                if (entity.accuracy > cnn_threshold) {
                    temp += "<span style='color:#5fba7d'>" + entity.accuracy * 100 + "%</span>";

                    if ('candidates' in entity) {
                        temp += " - " + entity.candidates.length + " candidate(s)";
                        if (entity.candidates.length > 0) {
                            //temp += `<a onclick='viewDetails(${entity.id})' style='cursor:pointer;'> View Details</a>`;
                        }
                    }
                } else {
                    temp += "<span>" + entity.accuracy * 100 + "%</span>";
                }
            }
            temp += `<a onclick='viewDetails(${entity.id})' style='cursor:pointer;'> View Details</a>`;

            temp += "</p>";
            batchReportContent.innerHTML += temp;
        }
    } else {
        showBatchControls();
    }
}

function viewDetails(id) {
    for (var i = 0; i < batchHistory.length; i++) {
        var i_item = batchHistory[i];
        if (i_item.id == id) {
            showModal(i_item);
            return;
        }
    }
}

function saveJson() {
    dialog.showSaveDialog({ title: "Save Report", defaultPath: '~/save.json' }, (filename) => {
        if (filename === undefined) {
            return;
        }
        fs.writeFile(filename, JSON.stringify(reportJson, null, '\t'), (err) => {
            if (err != null)
                logger.log_error("Error writing file to " + filename + " : " + err);
        });
    });
}

function showBatchControls() {
    batchReport.style.display = 'none';
    startBatchBtn.style.display = 'inline-block';
    stopBatchBtn.style.display = 'none';
    batchModeControls.style.display = 'block';
}

//iteration sequence for a batch
function iterateBatch() {
    datafetcher.getK2Id(function (id) {
        //start scan with a k2Id distributed by the server
        startScan(id, {
            accuracy: document.getElementById("batch-accuracy-display"),
            status: document.getElementById("batch-status-display")
        }, batchChart, batchData, function () {
            setTimeout(function () {
                // if batch mode is still running continue to recursive call itself
                if (batchRunning) {
                    if (maxBatchCount == 0 || batchCounter < maxBatchCount) {
                        iterateBatch();
                    } else {
                        //stop batch mode when maxBatchCounter is reached
                        stopBatch();
                        showBatchReport();
                    }
                }
            }, 1000);
        });
    });
}

function resetChart() {
    outerBatchChart.removeChild(document.getElementById("batchChart"));
    var div = document.createElement("div");
    div.classList.add("chart");
    div.id = "batchChart";
    outerBatchChart.appendChild(div);
}

function parseDate(ms) {
    var s_total = Math.floor(ms / 1000);
    var s = s_total % 60;
    var min_total = Math.floor(s_total / 60);
    var min = min_total % 60;
    var h_total = Math.floor(min_total / 60);
    var h = h_total;
    return h.toString() + "h " + min.toString().padStart(2, "0") + "m " + s.toString().padStart(2, "0") + "s";
}

