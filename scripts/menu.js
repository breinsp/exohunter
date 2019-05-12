var displayManualMode = false;

function setManualMode() {
    displayManualMode = true;
    hideMenu();
    manualModeContainer.style.display = 'block';
    manualProgressDisplay.style.display = 'inline-block';

    if (manualResult.children.length == 0) {
        manualResult.style.display = "none";
    } else {
        manualResult.style.display = "inline-block";
    }
}

function setBatchMode() {
    displayManualMode = false;
    hideMenu();
    batchModeContainer.style.display = 'block';
    batchProgressDisplay.style.display = 'inline-block';
}

function hideMenu() {
    hideLoader();
    menu.style.display = 'none';
}

function showMenu() {
    displayManualMode = false;
    hideLoader();
    menu.style.display = 'block';
    manualModeContainer.style.display = 'none';
    batchModeContainer.style.display = 'none';
    manualProgressDisplay.style.display = 'none';
    batchProgressDisplay.style.display = 'none';
}

function showLoader() {
    loader.style.display = "block";
}

function hideLoader() {
    loader.style.display = "none";
}

function showModal(entity) {
    detailModal.style.display = "block";
    setDetailData(entity);
}

function hideModal() {
    detailModal.style.display = "none";
}