var fs = require('fs');
var exports = module.exports;

const filename = "log.txt";
const filenameold = "log_old.txt";

var init = true;

//log a message with a severity-level and message to a log file
function log(level, message) {

    if (message === undefined || message.length == 0) {
        return;
    }

    var line = "[" + new Date().toLocaleString() + "] " + level + ": " + message.replace(/(?:\r\n|\r|\n)/g, ' ') + "\n";

    if (level == "ERROR") {
        console.error(line);
    } else {
        console.log(line);
    }

    //manage the log files
    if (init) {
        init = false;
        if (fs.existsSync(filename)) {
            if (fs.existsSync(filenameold)) {
                //delete old log file
                fs.unlinkSync(filenameold);
            }
            //rename latest log file to old log file
            fs.renameSync(filename, filenameold);
        }
    } else {
        //write in the current log file
        fs.writeFile(filename, line, { 'flag': 'a' }, (ret) => { });
    }
}

function log_info(message) {
    log("INFO", message);
}

function log_warning(message) {
    log("WARNING", message);
}

function log_error(message) {
    log("ERROR", message);
}


exports.log = log;
exports.log_info = log_info;
exports.log_warning = log_warning;
exports.log_error = log_error;