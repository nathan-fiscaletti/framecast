const windows = require('./windows');
const settings = require('./settings');
const stream = require('./stream');

module.exports = {
    initialize: (app, ipcMain, screen) => {
        ipcMain.on('closeRegionSelector', () => {
            windows.closeRegionSelectionWindow();
        });

        ipcMain.on('saveRegion', () => {
            const bounds = windows.getRegionSelectionWindow().getBounds();
            
            const streamScreen = screen.getDisplayNearestPoint(
                windows.getRegionSelectionWindow().getBounds()
            )
            stream.setStreamScreen(streamScreen);

            // Limit capture window to screen size
            const width = Math.min(bounds.width, streamScreen.workAreaSize.width)
            const height = Math.min(bounds.height, streamScreen.workAreaSize.width)

            let streamRegion = { x: bounds.x, y: bounds.y, width: width, height: height };
            if (process.platform === "darwin") {
                streamRegion.x -= stream.getStreamScreen().bounds.x;
                streamRegion.y -= stream.getStreamScreen().bounds.y;
            }
            stream.setStreamRegion(streamRegion);
            windows.closeRegionSelectionWindow();

            if (stream.isStreaming()) {
                stream.stopStream();
                stream.startStream({ app });
            }
        });

        ipcMain.on("getSettings", (event) => {
            event.sender.send("settings", settings.get());
        });

        ipcMain.on("closeSettingsWindow", (event) => {
            windows.closeSettingsWindow();
        });

        ipcMain.on("updateSettings", (event, newSettings) => {
            settings.set(newSettings);

            if (stream.isStreaming()) {
                stream.stopStream();
                stream.startStream({ app });
            }
        });

        ipcMain.on("selectRegion", (event) => {
            windows.createRegionSelectionWindow({ app });
        });

        ipcMain.on("showSettings", (event, props) => {
            let _props = { app, tab: 0 };
            if (props) {
                _props = { ..._props, ...props };
            }
            windows.createSettingsWindow(_props);
        });

        ipcMain.on("startStream", (event) => {
            stream.startStream({ app });
        });

        ipcMain.on("stopStream", (event) => {
            stream.stopStream();
        });
    }
};