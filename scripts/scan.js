var entity = {};

//starts the entire process of cnn and time series analysis and renders results
function startScan(id, display, chart, chartData, callback) {
    try {
        entity = {};
        entity.id = id;

        var debug = "";

        if (displayManualMode) {
            debug += "Scanning (manual): " + id;
        } else {
            debug += "Scanning (batch): " + id;
        }

        if (confirmedK2.indexOf(id) != -1) {
            debug += " [CONFIRMED]";
        }
        logger.log_info(debug);

        //continue by downloading the light curve
        datafetcher.getLightCurveURL(id, function (url) {
            datafetcher.getLightCurve(url, function (data) {
                //update the view
                var accuracy = display.accuracy;
                var status = display.status;

                status.innerHTML = `Scanning EPIC ${id}`;

                //update chart
                updateChart(chart, chartData, id, data, function () {
                    accuracy.innerHTML = "";
                });
                if (displayManualMode) {
                    resetManualResult();
                }

                //prepare data
                var y = [];
                var x = [];
                for (var i = 0; i < data.length; i++) {
                    x.push(data[i].x);
                    y.push(data[i].y);
                }

                //continue by spawning a python process for the cnn
                createPythonProcess(cnnPath, y, function (result, process) {
                    if (result.length > 0) {
                        var json = utils.parseToJson(result);
                        var acc = parseFloat(json.accuracy);
                        var skip = true;
                        var str = "SKIPPING";

                        //check if accuracy of the cnn is over a given threshold
                        //if the accuracy is greater than the threshold, the time series analysis gets initiated
                        if (acc > cnn_threshold) {
                            skip = false;
                            str = "RUNNING ANALYSIS";
                        }

                        entity.accuracy = acc;

                        //update view
                        accuracy.innerHTML = `Probability: <strong>${Math.round(acc * 1000000) / 10000}%` +
                            `</strong> <span class='glyphicon glyphicon-menu-right'></span> ${str}`;

                        //wait 3 seconds and then continue with the next steps
                        setTimeout(function () {
                            accuracy.innerHTML = "";

                            if (!skip) {
                                //potential exoplanets found, continue with analysis
                                status.innerHTML = `Analysing EPIC ${id} for exoplanets`;

                                //before starting analysis, the star meta data needs to be fetched
                                datafetcher.getStarMetaData(id, function (meta) {
                                    //build star configuration
                                    var star = {
                                        "units": {
                                            "mass": "M_Sun",
                                            "radius": "R_Sun",
                                            "rad_err1": "R_Sun",
                                            "rad_err2": "R_Sun",
                                            "effectiveTemp": "K",
                                            "distance": "pc"
                                        },
                                        "epic": id,
                                        "mass": meta.k2_mass,
                                        "radius": meta.k2_rad,
                                        "rad_err1": meta.k2_raderr1,
                                        "rad_err2": meta.k2_raderr2,
                                        "effectiveTemp": meta.k2_teff
                                    };

                                    var analysisParams = {
                                        "star": star,
                                        "x": x,
                                        "y": y
                                    };

                                    entity.star = star;

                                    //run analysis with paramters
                                    runAnalysisProcess(analysisPath, analysisParams, status, chart, data, callback);
                                });
                            } else {
                                //finished, exit this function
                                status.innerHTML = "Nothing found";
                                finish(callback);
                            }
                        }, 3000);
                    } else {
                        finish(callback);
                    }
                });
            });
        });
    } catch (ex) {
        logger.log_error(ex);
        callback();
    }
}

function finish(callback) {
    batchCounter++;
    batchHistory.push(entity);
    sendComputedEvaluationToServer(entity);
    callback();
}

//run the analysis process for a certain star and callback the result
function runAnalysisProcess(analysisPath, analysisParams, status, chart, data, callback) {
    starsWithHighProbabilityCounter++;
    //spawn the python process for the time series analysis
    createPythonProcess(analysisPath, analysisParams, function (analysisResult, process) {
        if (analysisResult.length > 0) {
            //parse result
            var json = utils.parseToJson(analysisResult);

            var dipcount = 0;

            //render result
            if (displayManualMode) {
                manualResult.style.display = 'inline-block';
                utils.addStarEntry(manualResult, json.star);
            }

            var candidatecount = json.candidates.length;

            //render result and charts
            for (var i = 0; i < candidatecount; i++) {
                var candidate = json.candidates[i];
                var color = utils.getColorForCandidate(i);
                utils.addDipsToChart(chart, data, candidate.dips, color);
                if (displayManualMode) {
                    utils.addCandidateEntry(manualResult, candidate, i, color);
                }
                dipcount += candidate.dips.length;
            }

            if (candidatecount > 0) {
                starsWithCandidatesCounter++;
                totalCandidatesCounter += candidatecount;
            }

            entity.candidates = json.candidates;

            //update status
            status.innerHTML = `Found ${json.candidates.length} candidate(s)` +
                ` with a total of ${dipcount} dip(s)`;
        }
        //exit function
        setTimeout(() => {
            finish(callback);
        }, 5000);
    });
}

function updateChart(chart, chartData, k2id, data, callback) {
    resetDips(chart);
    chartData.splice(0, chartData.length);

    for (var i = 0; i < data.length; i++) {
        chartData.push(data[i]);
    }

    chart.options.title.text = 'EPIC ' + k2id;
    chart.render();
    callback();
}

function resetDips(chart) {
    if (chart.options.data.length > 1) {
        var data0 = chart.options.data[0];
        chart.options.data = [];
        chart.options.data.push(data0);
    }
}