var fs = require('fs');
var http = require('http');
var request = require('request');
var consts = require('./constants');

var exports = module.exports;

var SERVER_URL = consts.VARIABLES.SERVER_URL;

function sendGetRequest(url, callback) {
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.onreadystatechange = function () {
        if (xmlHttp.readyState == 4 && xmlHttp.status == 200)
            callback(xmlHttp.responseText);
    }
    xmlHttp.open("GET", url, true);
    xmlHttp.send(null);
}

function sendPostRequest(url, content, callback) {
    request.post({
        url: url,
        headers: {
            'content-type': 'application/json'
        },
        json: content
    }, function (error, response, body) {
        callback({
            err: error,
            res: response,
            body: body
        });
    })
}

exports.sendGetRequest = sendGetRequest;
exports.sendPostRequest = sendPostRequest;