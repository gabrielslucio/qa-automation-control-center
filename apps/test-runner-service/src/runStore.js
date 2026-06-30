const runs = new Map();

function saveRun(run){
    runs.set(run.runId, run);
    return run;
}

function updateRun(runId, changes){
    const currentRun = runs.get(runId);

    if(!currentRun){
        return null;
    }

    const updatedRun = {
        ...currentRun,
        ...changes,
        updatedAt: new Date().toISOString(),
    };

    runs.set(runId, updatedRun);

    return updatedRun;
}

function getRun(runId){
    return runs.get(runId);
}

function getAllRuns(){
    return Array.from(runs.values());
}

module.exports = {
    saveRun,
    updateRun,
    getRun,
    getAllRuns,
};