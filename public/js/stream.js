const crypto = require('crypto');
const chalk = require('chalk')

const { startWebsocketRelay } = require('./video-stream/websocket-relay');
const { startVideoStreamProcess } = require('./video-stream/stream-video');

const settings = require('./settings');

let streamScreen;
let streamRegion = { 
    x: 0, 
    y: 0, 
    width: settings.get().defaultScreenCaptureWidth, 
    height: settings.get().defaultScreenCaptureHeight 
};
let streamProcess;
let socketRelay;

async function startStream({ app }) {
    const windows = require('./windows');

    windows.createViewWindow({ app });

    if (process.platform === "darwin" && settings.get().showRegion) {
        console.log(chalk.red("showing region"))
        windows.createCaptureBoarderWindow({app});
    }

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
        width: Math.min(streamRegion.width, 4095), // Max resolution ffmpeg can handel
        height: Math.min(streamRegion.height, 4095), // Max resolution ffmpeg can handel
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

        windows.getCaptureBoarderWindow()?.setClosable(true)
        windows.closeCaptureBoarderWindow();
    }

    if (windows.getCaptureBoarderWindow() && !windows.getCaptureBoarderWindow().isDestroyed()) {
        windows.getCaptureBoarderWindow()?.setClosable(true)
        windows.closeCaptureBoarderWindow();
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