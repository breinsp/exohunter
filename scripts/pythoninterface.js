var cnnPath = "../LightCurveClassificationCNN/LightCurveClassificationCNNPrototype/main.py";
var analysisPath = "../LightCurveAnalysis/TimeSeriesAnalyseTest/main.py";
var recalculatePath = "../LightCurveAnalysis/TimeSeriesAnalyseTest/recalculate_parameter.py";

//create a python process with a .py path and parameters
function createPythonProcess(path, params, callback) {
    var py = spawn('python', [path]);
    var output = '';
    var error = '';

    py.stdout.on('data', function (data) {
        output += data.toString();
    })

    py.stdout.on('end', function () {
        callback(output, py);
    })

    py.stderr.on('data', (data) => {
        error += data.toString();
    });

    py.stderr.on('end', (data) => {
        logger.log("PYTHON", error);
    });

    py.stdin.write(JSON.stringify(params));
    py.stdin.end();
}

function killProcess(prc) {
    prc.stdin.pause();
    prc.kill();
}

function clone(obj) {
    var copy;

    if (null == obj || "object" != typeof obj) return obj;

    if (obj instanceof Date) {
        copy = new Date();
        copy.setTime(obj.getTime());
        return copy;
    }

    if (obj instanceof Array) {
        copy = [];
        for (var i = 0, len = obj.length; i < len; i++) {
            copy[i] = clone(obj[i]);
        }
        return copy;
    }

    if (obj instanceof Object) {
        copy = {};
        for (var attr in obj) {
            if (obj.hasOwnProperty(attr)) copy[attr] = clone(obj[attr]);
        }
        return copy;
    }

    return {};
}

function recalculateParams(params, callback) {
    createPythonProcess(recalculatePath, params, function (data) {
        try {
            callback(utils.parseToJson(data));
        } catch (err) {
            console.log(err);
            logger.log_error(err);
        }
    });
}