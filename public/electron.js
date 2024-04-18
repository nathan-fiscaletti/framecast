const settings = require('./js/settings');
// Initialize the application settings by loading them from disk.
settings.initialize();

const { PostHog } = require('posthog-node');

// Module to control the application lifecycle and the native browser window.
const { app, BrowserWindow, ipcMain, screen, protocol } = require("electron");

const windows = require('./js/windows');
const ipcHandlers = require('./js/ipc-handlers');


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
    // Report monitor count, size, and display scaling factor.
    // set the analytics expiry to 14 days
    const NOW = new Date().getTime();
    const ANALYTICS_EXPIRY = 1000 * 60 * 60 * 24 * 14;
    if (settings.get().enableAnalytics && (
        settings.get().systemInformationReportedAt === null ||
        NOW - settings.get().systemInformationReportedAt > ANALYTICS_EXPIRY
    )) {
        (async () => {
            const client = new PostHog(
                'phc_q6GSeEJBJTIIlAlLwRxWxA8OvVNS2sn32mAEWcJZyZD',
                { host: 'https://app.posthog.com' }
            );

            const displays = screen.getAllDisplays();
            const displayInfo = displays.map((display, i) => {
                return {
                    id: display.id,
                    bounds: display.bounds,
                    workArea: display.workArea,
                    scaleFactor: display.scaleFactor
                };
            });

            client.capture({
                distinctId: settings.get().clientId,
                event: 'screen-information',
                properties: {
                    version: app.getVersion(),
                    platform: process.platform,
                    platformVersion: process.getSystemVersion(),
                    displays: displayInfo
                }
            });

            settings.set({
                ...settings.get(),
                systemInformationReportedAt: NOW,
            });

            await client.shutdownAsync();
        })();
    }

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