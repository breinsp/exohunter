var detailData = [];
var detailChart = new CanvasJS.Chart("detailChart", {
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
        dataPoints: detailData
    }]
});
var detailEntity = null;
var selectedCandidateIndex = -1;

var lastX = 0;
var deltaT = new Date();

var content = document.getElementById("detail-modal-content");

function setDetailData(entity) {
    detailEntity = clone(entity);
    var id = entity.id;

    resetDetailData();
    datafetcher.getLightCurveURL(id, function (url) {
        datafetcher.getLightCurve(url, function (data) {
            for (var i = 0; i < data.length; i++) {
                detailData.push(data[i]);
            }

            detailChart.options.title.text = 'EPIC ' + id;
            detailChart.render();
            updateContent();
            showAllDips();
        });
    });
}

function updateContent() {
    content.innerHTML = "";

    var inner = "";
    inner += "<div class='form-group'>";
    inner += "<label class='control-label' for='detail-select'>Select Candidate</label>";
    inner += "<select id='detail-select' class='form-control form-control-lg' onchange='onDetailSelect(this)'>";

    inner += `<option value='-1' ${(selectedCandidateIndex >= 0) ? 'selected' : ''}></option>`;

    if ('candidates' in detailEntity) {
        for (var i = 0; i < detailEntity.candidates.length; i++) {
            var col = utils.getColorForCandidate(i);
            inner += `<option style='background-color:${col}' value='${i}' ${(selectedCandidateIndex == i) ? 'selected' : ''}>`;
            inner += `Candidate ${(i + 1)}`;
            inner += "</option>";
        }
    }
    inner += "<option value='-2' style='background-color:#474747'>Add Candidate</option>";

    inner += "</select>";
    inner += "</div>";

    if (selectedCandidateIndex >= 0) {
        inner += "<button id='detail-delete' class='btn btn-danger' onclick='deleteCandidate()'>Delete Candidate</button>";

        inner += "<hr/>";
        inner += "<div class='detail-dip-container'>";

        var c = detailEntity.candidates[selectedCandidateIndex];

        if ("dips" in c) {
            inner += "<h1>Dips <button id='detail-dip-new' class='btn btn-primary' onclick='newDetailDip()'><span class='glyphicon glyphicon-plus'></span></button></h1>";
            for (var i = 0; i < c.dips.length; i++) {
                var dip = c.dips[i];
                inner += "<div class='detail-dip row'>";

                inner += generateInput(i, `detail-dip-start-${i}`, `Start`, `${dip.startPoint}`);
                inner += generateInput(i, `detail-dip-duration-${i}`, `Duration`, `${dip.endPoint - dip.startPoint}`);
                inner += generateInput(i, `detail-dip-end-${i}`, `End`, `${dip.endPoint}`, true);

                inner += "<div class='form-group col-sm-3' style='text-align:right;'>";
                inner += `<button class='btn btn-danger' style='margin-top:25px;' onclick='deleteDip(${i})'><span class='glyphicon glyphicon-trash'></span></button>`;
                inner += "</div>";

                inner += "</div>";
            }
        }

        inner += "</div>";
    }
    inner += `<div style='width:100%; text-align:right;'><button style='margin:15px;' class='btn btn-primary' onclick='saveAdjustments()'>Save</button></div>`;

    content.innerHTML = inner;
}

//save adjustments of an analysis result and notify server
function saveAdjustments() {
    recalculateParams({
        star: detailEntity.star,
        candidates: detailEntity.candidates
    }, function (data) {
        //set recalculated parameters
        if ("candidates" in data) {
            detailEntity.candidates = data.candidates;
        }

        //override old entity
        entity = clone(detailEntity);

        //persist new entity in batchhistory
        for (var i = 0; i < batchHistory.length; i++) {
            if (batchHistory[i].id == entity.id) {
                batchHistory[i] = entity;
                break;
            }
        }

        //update manual page
        if (displayManualMode) {
            manualResult.innerHTML = "";
            utils.addStarEntry(manualResult, entity.star);
            utils.removeAllCandidatesFromChart(manualChart);
            for (var i = 0; i < entity.candidates.length; i++) {
                var c = entity.candidates[i];
                var color = utils.getColorForCandidate(i);
                utils.addDipsToChart(manualChart, manualData, c.dips, color);
                utils.addCandidateEntry(manualResult, c, i, color);
            }
        }

        //update progress text
        if (displayManualMode) {
            var status = document.getElementById("manual-status-display");
            var str = " - adjusted";
            if (status.innerHTML.indexOf(str) < 0) {
                status.innerHTML += str;
            }
        }

        //send to server
        sendCustomEvaluationToServer(entity);
        //hide modal
        hideModal();
    });
}

function generateInput(i, id, label, value, disabled = false) {
    var html = "";
    html += "<div class='form-group col-sm-3' style='position:relative;'>";
    html += `<label class='control-label' for='${id}'>${label}</label>`;
    html += `<input id='${id}' type='number' min='0' class='form-control' value='${value}' oninput='onDetailDipChange(${i})' ${disabled ? "disabled" : ""} />`;
    if (!disabled) {
        html += `<div class='input-number-slider' style='z-index:3;'><span class='glyphicon glyphicon-chevron-left'></span><span class='glyphicon glyphicon-chevron-right'></span></div>`;
        html += `<div class='input-number-slider grabbable' style='z-index:5;' draggable='true' ondrag="dragNumberInput('${id}',${i})" ondragend="onDetailDipChange(${i})"></div>`;
    }
    html += "</div>";
    return html;
}

function dragNumberInput(elid, i, e) {
    var el = document.getElementById(elid);
    e = e || window.event;
    var dragX = e.pageX;
    var delta = dragX - lastX;
    lastX = dragX;

    if (delta != 0 && Math.abs(delta) < 20) {
        var val = parseFloat(el.value);
        val += 0.001 * delta;
        if (val < 0) {
            val = 0;
        }
        el.value = val;

        var T = new Date();

        if (T - deltaT > 500) {
            deltaT = T;
            onDetailDipChange(i);
        }
    }
}

function newDetailDip() {
    var c = detailEntity.candidates[selectedCandidateIndex];
    if (!("dips" in c) || !(c.dips instanceof Array)) {
        c.dips = [];
    }
    var globalStart = Math.floor(Math.random() * (detailData.length - 30));
    var duration = Math.floor(Math.random() * 20 + 5);
    var globalEnd = globalStart + duration;

    var dip = {
        startPoint: detailData[globalStart].x,
        endPoint: detailData[globalEnd].x,
        r_x: [],
        r_y: [],
        globalStartIndex: globalStart,
        globalEndIndex: globalEnd
    };

    c.dips.push(dip);
    updateContent();
    utils.removeAllCandidatesFromChart(detailChart);
    utils.addDipsToChart(detailChart, detailData, detailEntity.candidates[selectedCandidateIndex].dips, utils.getColorForCandidate(selectedCandidateIndex));
}

function onDetailDipChange(index) {
    if (selectedCandidateIndex >= 0) {
        var startInput = document.getElementById(`detail-dip-start-${index}`);
        var durationInput = document.getElementById(`detail-dip-duration-${index}`);
        var endInput = document.getElementById(`detail-dip-end-${index}`);

        var start = parseFloat(startInput.value);
        var duration = parseFloat(durationInput.value);

        utils.removeAllCandidatesFromChart(detailChart);

        var globalStart = -1;
        var globalEnd = -1;
        var r_x = [];
        var r_y = [];

        var end = start + duration;
        var r = false;

        for (var i = 0; i < detailData.length - 1; i++) {
            var x1 = detailData[i].x;
            var x2 = detailData[i + 1].x;
            var y1 = detailData[i].y;
            var y2 = detailData[i + 1].y;

            if (start >= x1 && start <= x2) {
                globalStart = i;
                start = x1;
                r = true;
            }
            if (end >= x1 && end <= x2) {
                globalEnd = i;
                end = x2;
                r = false;
                r_x.push(x1);
                r_y.push(y1);
                r_x.push(x2);
                r_y.push(y2);
                break;
            } else if (r) {
                r_x.push(x1);
                r_y.push(y1);
            }
        }

        endInput.value = end;

        detailEntity.candidates[selectedCandidateIndex].dips[index].startPoint = start;
        detailEntity.candidates[selectedCandidateIndex].dips[index].endPoint = end;
        detailEntity.candidates[selectedCandidateIndex].dips[index].r_x = r_x;
        detailEntity.candidates[selectedCandidateIndex].dips[index].r_y = r_y;

        if (globalStart >= 0 && globalEnd >= 0) {
            detailEntity.candidates[selectedCandidateIndex].dips[index].globalStartIndex = globalStart;
            detailEntity.candidates[selectedCandidateIndex].dips[index].globalEndIndex = globalEnd;
        }

        utils.addDipsToChart(detailChart, detailData, detailEntity.candidates[selectedCandidateIndex].dips, utils.getColorForCandidate(selectedCandidateIndex));
    }
}

function deleteDip(index) {
    if (selectedCandidateIndex >= 0) {
        var c = detailEntity.candidates[selectedCandidateIndex];
        if ("dips" in c) {
            c.dips.splice(index, 1);
            updateContent();
            utils.removeAllCandidatesFromChart(detailChart);
            utils.addDipsToChart(detailChart, detailData, detailEntity.candidates[selectedCandidateIndex].dips, utils.getColorForCandidate(selectedCandidateIndex));
        }
    }
}

function deleteCandidate() {
    if (selectedCandidateIndex >= 0) {
        detailEntity.candidates.splice(selectedCandidateIndex, 1);
        selectedCandidateIndex = -1;
        updateContent();
        utils.removeAllCandidatesFromChart(detailChart);
        showAllDips();
    }
}

function onDetailSelect(selectObject) {
    var i = selectObject.value;
    utils.removeAllCandidatesFromChart(detailChart);

    selectedCandidateIndex = i;

    if (i == -1) {
        showAllDips();
    } else if (i == -2) {
        if (!('candidates' in detailEntity)) {
            detailEntity.candidates = [];
        }
        detailEntity.candidates.push({
            dips: 0
        });
        var newIndex = detailEntity.candidates.length - 1;
        selectedCandidateIndex = newIndex;
        utils.addDipsToChart(detailChart, detailData, detailEntity.candidates[newIndex].dips, utils.getColorForCandidate(i));
    } else {
        utils.addDipsToChart(detailChart, detailData, detailEntity.candidates[i].dips, utils.getColorForCandidate(i));
    }
    updateContent();
}

function showAllDips() {
    utils.removeAllCandidatesFromChart(detailChart);
    for (var i = 0; i < detailEntity.candidates.length; i++) {
        var candidate = detailEntity.candidates[i];
        utils.addDipsToChart(detailChart, detailData, candidate.dips, utils.getColorForCandidate(i));
    }
}

function resetDetailData() {
    detailData.splice(0, detailData.length);
    utils.removeAllCandidatesFromChart(detailChart);
    detailChart.render();
}