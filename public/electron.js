// Module to control the application lifecycle and the native browser window.
const { app, BrowserWindow, ipcMain, screen, protocol } = require("electron");

const windows = require('./js/windows');
const settings = require('./js/settings');
const ipcHandlers = require('./js/ipc-handlers');

// Initialize the application settings by loading them from disk.
settings.initialize();

// Initialize the IPC handlers used to control the main process from
// the renderer process.
ipcHandlers.initialize(app, ipcMain, screen);

// This is required to get transparency working on linux.
if (process.platform === 'linux') {
    app.commandLine.appendSwitch('enable-transparent-visuals');
    app.disableHardwareAcceleration();
}

// Create the initial control window once the application is ready.
app.whenReady().then(async () => {
    windows.createControlWindow({ app, screen });

    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    app.on("activate", function () {
        if (BrowserWindow.getAllWindows().length === 0) {
            windows.createControlWindow({ app, screen });
        }
    });
});

// Quit when all windows are closed, except on macOS.
app.on("window-all-closed", function () {
    if (process.platform !== "darwin") {
        app.quit();
    }
});

// Disable navigation in application windows, this is to prevent
// the user from navigating to a page that is not part of the application.
app.on("web-contents-created", (event, contents) => {
    contents.on("will-navigate", (event, navigationUrl) => {
        event.preventDefault();
    });
});