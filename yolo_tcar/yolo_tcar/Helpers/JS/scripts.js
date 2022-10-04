
// Middleware scripts to communicate with the main library

const convertPredictionsToTrackerFormat = (predictions) => predictions.reduce((acc, { score, name, rect }) => {
    acc.push({
        confidence: score,
        name,
        x: rect[0][0],
        y: rect[0][1],
        w: rect[1][0],
        h: rect[1][1]
    });

    return acc;
}, []);

function updateTrackedFrames(framesString, currentFrame) {
    console.log(`-------- updateFrames start. FrameNB:  ${currentFrame} Frames: ${framesString} --------`);
    try {
        const predictions = JSON.parse(framesString);
        Tracker.updateTrackedItemsWithNewFrame(convertPredictionsToTrackerFormat(predictions), currentFrame);
        console.log(`-------- updateFrames done. FrameNB:  ${currentFrame} Frames: ${framesString} --------`);
    } catch (err) {
        console.log(`-------- updateFrames error. Error: ${err}  --------`);
    }
}

function getTrackedFrames() {
    console.log("-------- getTrackedFrames start --------");
    const res = Tracker.getJSONOfTrackedItems();
    console.log(`-------- getTrackedFrames done. Response:  ${JSON.stringify(res)} --------`);
    return res;
}

function resetTracker() {
    console.log(`-------- resetTracker start. --------`);
    Tracker.reset();
    console.log(`-------- resetTracker done. --------`);
}

function setTrackerInitialParams(params) {
    Tracker.setParams(params);
}