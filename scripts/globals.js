const outerBatchChart = document.getElementById("outer-batchChart");
const menu = document.getElementById("menu");
const manualModeContainer = document.getElementById("manual-mode");
const batchModeContainer = document.getElementById("batch-mode");
const batchModeControls = document.getElementById("batch-mode-controls");
const startBatchBtn = document.getElementById("start-batch-btn");
const stopBatchBtn = document.getElementById("stop-batch-btn");
const manualProgressDisplay = document.getElementById("manual-progress-display");
const batchProgressDisplay = document.getElementById("batch-progress-display");
const k2Input = document.getElementById("k2-input");
const k2InputBtn = document.getElementById("k2-input-btn");
const loader = document.getElementById("loader");
const manualResult = document.getElementById("manual-result");
const outerManualChart = document.getElementById("outer-manualChart");
const accuracyDisplay = document.getElementById("manual-accuracy-display");
const statusDisplay = document.getElementById("manual-status-display");
const detailModal = document.getElementById("detail-modal");
const manualAdjustResult = document.getElementById("manual-adjust-result");
const batchDisplay = document.getElementById("batch-display");
const batchReport = document.getElementById("batch-report");
const batchReportContent = document.getElementById("batch-report-content");
const countLimit = document.getElementById("count-limit");
const timeLimit = document.getElementById("time-limit");
const batchSettingsShowChart = document.getElementById("checkbox1");
const batchSettingsShowProgress = document.getElementById("checkbox2");
const batchSettingsShowReport = document.getElementById("checkbox3");
const batchSettingsEnableFeedback = document.getElementById("checkbox4");

const jquery = require('jquery');
const bootstrap = require('bootstrap');
const utils = require("./modules/utils");
const datafetcher = require("./modules/datafetcher");
const server = require('./modules/httpservice');
const logger = require("./modules/logger");
const consts = require('./modules/constants');
const path = require('path');
const spawn = require('child_process').spawn;
const electron = require('electron');
const fs = require('fs');
const http = require('http');

const cnn_threshold = consts.VARIABLES.THRESHOLD;
const confirmedK2 = consts.VARIABLES.CONFIRMED;
const server_url = consts.VARIABLES.SERVER_URL;