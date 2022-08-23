
// Assume Tracker should be in the global context

function updateFrames(detectionScaledOfThisFrame, currentFrame) {
    Tracker.updateTrackedItemsWithNewFrame(detectionScaledOfThisFrame, currentFrame);
}

function getFrames() {
    return Tracker.getJSONOfTrackedItems();
}

function reset() {
    Tracker.reset();
}

function setInitialParams(params) {
    Tracker.setParams(params);
}