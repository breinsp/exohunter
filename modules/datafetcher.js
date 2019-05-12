var fs = require('fs');
var http = require('http');
var consts = require('./constants');
var server = require('./httpservice');

var exports = module.exports;

var SERVER_URL = consts.VARIABLES.SERVER_URL;

//receives an epic number from the server, the server decides which epic numbers get distributed
exports.getK2Id = function (callback) {
    server.sendGetRequest(SERVER_URL + "k2/getK2Id", (data) => callback(parseInt(data)));
}

//receives the URL to the desired star's lightcurve
exports.getLightCurveURL = function (id, callback) {
    server.sendGetRequest(SERVER_URL + "k2/fetchLightcurveURL/" + id, callback);
}

//downloads the raw data with a given URL
exports.getLightCurve = function (url, callback) {
    server.sendGetRequest(url, function (data) {
        parseData(data, callback);
    });
}

exports.getStarMetaData = function (id, callback) {
    var url = "https://exoplanetarchive.ipac.caltech.edu/cgi-bin/nstedAPI/nph-nstedAPI?table=k2targets&format=json&order=epic_number&select=epic_number,k2_mass,k2_rad,k2_type,k2_raderr1,k2_raderr2,k2_teff,k2_dist&where=epic_number=" + id;
    server.sendGetRequest(url, function (data) {
        callback(JSON.parse(data)[0]);
    });
}

//parses the raw data to an array with x and y values
function parseData(data, callback) {
    var parsedData = [];
    var lines = data.split('\n');

    for (var i = 1; i < lines.length - 1; i++) {
        var line = lines[i];
        var parts = line.split(',');

        parsedData.push({
            x: parseFloat(parts[0]),
            y: parseFloat(parts[1])
        });
    }
    callback(parsedData);
}

