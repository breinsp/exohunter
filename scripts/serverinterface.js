

//send a custom evaluation result to server after user adjustments
function sendCustomEvaluationToServer(evalEntity) {
    server.sendPostRequest(server_url + "LAEvaluation/addSingleCustom", {
        userId: 1,
        star: evalEntity.star,
        candidates: evalEntity.candidates,
        id: evalEntity.id,
        classificationResult: evalEntity.accuracy * 100,
    }, function () {
        logger.log_info("Succesfully sent adjustments to server");
    });
}

//send computed evaluation result to server, automatically after an analysis is finished
function sendComputedEvaluationToServer(evalEntity) {
    server.sendPostRequest(server_url + "LAEvaluation/addSingleComputed", {
        userId: 1,
        star: evalEntity.star,
        candidates: evalEntity.candidates,
        id: evalEntity.id,
        classificationResult: evalEntity.accuracy * 100,
    }, function () {
        logger.log_info("Succesfully sent analysis to server");
    });
}


