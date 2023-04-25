const crypto = require('crypto');

const { startWebsocketRelay } = require('./video-stream/websocket-relay');
const { startVideoStreamProcess } = require('./video-stream/stream-video');

const settings = require('./settings');

let streamScreen;
let streamRegion = { x: 0, y: 0, width: 500, height: 500 };
let streamProcess;
let socketRelay;

async function startStream({ app }) {
    const windows = require('./windows');

    windows.createViewWindow({ app });
    const streamSecret = crypto.randomBytes(20).toString('hex')
    socketRelay = await startWebsocketRelay({
        streamSecret,
        streamPort: settings.get().streamPort,
        webSocketPort: settings.get().webSocketPort,
    });
    streamProcess = await startVideoStreamProcess({
        frameRate: settings.get().frameRate,
        bitRate: `${settings.get().bitRate}k`,
        streamPort: settings.get().streamPort,
        showRegion: settings.get().showRegion,
        streamSecret,
        offsetX: streamRegion.x,
        offsetY: streamRegion.y,
        width: streamRegion.width,
        height: streamRegion.height,
        screenId: streamScreen.id,
        scaleFactor: streamScreen.scaleFactor
    });
    windows.getViewWindow().setResizable(true);
    windows.getViewWindow().setContentSize(streamRegion.width, streamRegion.height);
    windows.getViewWindow().setResizable(false);
    windows.getViewWindow().reload();
}

function stopStream() {
    if (socketRelay) {
        socketRelay.close();
        socketRelay = null;
    }

    if (streamProcess) {
        streamProcess.kill();
        streamProcess = null;
    }

    const windows = require('./windows');
    if (windows.getViewWindow() && !windows.getViewWindow().isDestroyed()) {
        windows.getViewWindow().setClosable(true);
        windows.closeViewWindow();
    }
}

function isStreaming() {
    return !!streamProcess;
}

function getStreamScreen() {
    return streamScreen;
}

function getStreamRegion() {
    return streamRegion;
}

function setStreamScreen(screen) {
    streamScreen = screen;
}

function setStreamRegion(region) {
    streamRegion = region;
}

module.exports = { isStreaming, startStream, stopStream, getStreamRegion, getStreamScreen, setStreamRegion, setStreamScreen };