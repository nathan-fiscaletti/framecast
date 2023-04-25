const { BrowserWindow } = require('electron');

const path = require('path');

const settings = require('./settings');
const stream = require('./stream');

const { getStreamScreen, getStreamRegion } = require('./stream');

let viewWindow;
let regionSelectionWindow;
let settingsWindow;
let controlWindow;

const settingsWindowLocation = { x: -1, y: -1 };

function createViewWindow({ app }) {
    if (getViewWindow() && !getViewWindow().isDestroyed()) {
        getViewWindow().focus();
        return;
    }

    const _viewWindow = new BrowserWindow({
        x: getControlWindow().getPosition()[0],
        y: getControlWindow().getPosition()[1] + getControlWindow().getSize()[1],
        useContentSize: true,
        skipTaskbar: true,
        maximizable: false,
        icon: path.join(__dirname, "..", "icon.png"),
        closable: false,
        title: "Advanced Screen Streamer - Viewer",
        minimizable: false,
        frame: false,
        resizable: false,
        alwaysOnTop: true,
        opacity: settings.get().previewVisible ? 1 : 0,
        webPreferences: {
            nodeIntegration: true,
            enableRemoteModule: true,
            contextIsolation: false
        }
    });

    viewWindow = _viewWindow;

    const appURL = app.isPackaged
        ? `file://${__dirname}/../index.html?content=viewer`
        : "http://localhost:3000?content=viewer";
    getViewWindow().loadURL(appURL);

    // Automatically open Chrome's DevTools in development mode.
    // if (!app.isPackaged) {
    //   getViewWindow().webContents.openDevTools();
    // }
}

function getViewWindow() {
    return viewWindow;
}

function closeViewWindow() {
    if (viewWindow) {
        viewWindow.close();
        viewWindow = null;
    }
}

function createRegionSelectionWindow({ app }) {
    if (getRegionSelectionWindow() && !getRegionSelectionWindow().isDestroyed()) {
        getRegionSelectionWindow().focus();
        return;
    }

    const windowBounds = { ...getStreamRegion() };
    if (process.platform === 'darwin') {
        windowBounds.x += getStreamScreen().bounds.x;
        windowBounds.y += getStreamScreen().bounds.y;
    }

    const _regionSelectionWindow = new BrowserWindow({
        ...windowBounds,
        maximizable: false,
        frame: false,
        alwaysOnTop: true,
        roundedCorners: false,
        opacity: 0.75,
        width: getStreamRegion().width,
        height: getStreamRegion().height,
        title: "Select Recording Region",
        icon: path.join(__dirname, "..", "icon.png"),
        webPreferences: {
            nodeIntegration: true,
            enableRemoteModule: true,
            contextIsolation: false
        }
    });

    regionSelectionWindow = _regionSelectionWindow;

    const appURL = app.isPackaged
        ? `file://${__dirname}/../index.html?content=selector`
        : "http://localhost:3000?content=selector";
    getRegionSelectionWindow().loadURL(appURL);

    // Automatically open Chrome's DevTools in development mode.
    // if (!app.isPackaged) {
    //   getRegionSelectionWindow().webContents.openDevTools();
    // }
}

function getRegionSelectionWindow() {
    return regionSelectionWindow;
}

function createSettingsWindow({ app = {}, tab = 0 }) {
    if (getSettingsWindow() && !getSettingsWindow().isDestroyed()) {
        getSettingsWindow().focus();
    } else {
        const _settingsWindow = new BrowserWindow({
            parent: getControlWindow(),
            center: true,
            ...(
                settingsWindowLocation.x !== -1 &&
                    settingsWindowLocation.y !== -1 ? settingsWindowLocation : {}
            ),
            width: 550,
            height: 850,
            maximizable: false,
            autoHideMenuBar: true,
            alwaysOnTop: true,
            roundedCorners: false,
            minimizable: false,
            icon: path.join(__dirname, "..", "icon.png"),
            title: "Advanced Screen Streamer - Settings",
            webPreferences: {
                nodeIntegration: true,
                enableRemoteModule: true,
                contextIsolation: false
            }
        });

        _settingsWindow.on("move", () => {
            const [x, y] = getSettingsWindow().getPosition();
            settingsWindowLocation.x = x;
            settingsWindowLocation.y = y;
        });

        settingsWindow = _settingsWindow;
    }

    const appURL = app.isPackaged
        ? `file://${__dirname}/../index.html?content=settings&platform=${process.platform}&version=${app.getVersion()}&tab=${tab}`
        : `http://localhost:3000?content=settings&platform=${process.platform}&version=${app.getVersion()}&tab=${tab}`;
    getSettingsWindow().loadURL(appURL);
    
    // Automatically open Chrome's DevTools in development mode.
    // if (!app.isPackaged) {
    //   getSettingsWindow().webContents.openDevTools();
    // }
}

function getSettingsWindow() {
    return settingsWindow;
}

function createControlWindow({ app, screen }) {
    stream.setStreamScreen(screen.getPrimaryDisplay());

    const _controlWindow = new BrowserWindow({
        modal: true,
        center: true,
        width: 432,
        height: 140,
        maximizable: false,
        minimizable: false,
        autoHideMenuBar: true,
        alwaysOnTop: true,
        resizable: false,
        roundedCorners: false,
        icon: path.join(__dirname, "..",  "icon.png"),
        title: "Advanced Screen Streamer",
        webPreferences: {
            nodeIntegration: true,
            enableRemoteModule: true,
            contextIsolation: false
        }
    });

    _controlWindow.on("move", () => {
        if (getViewWindow() && !getViewWindow().isDestroyed()) {
            getViewWindow().setPosition(
                getControlWindow().getPosition()[0],
                getControlWindow().getPosition()[1] + getControlWindow().getSize()[1],
            );
        }
    });

    _controlWindow.on("closed", () => {
        process.exit(0);
    });

    controlWindow = _controlWindow;

    const appURL = app.isPackaged
        ? `file://${__dirname}/../index.html?content=control&platform=${process.platform}`
        : `http://localhost:3000?content=control&platform=${process.platform}`;
    getControlWindow().loadURL(appURL);

    // Automatically open Chrome's DevTools in development mode.
    // if (!app.isPackaged) {
    //   getControlWindow().webContents.openDevTools();
    // }
}

function getControlWindow() {
    return controlWindow;
}

function closeRegionSelectionWindow() {
    if (regionSelectionWindow) {
        regionSelectionWindow.close();
        regionSelectionWindow = null;
    }
}

function closeSettingsWindow() {
    if (settingsWindow) {
        settingsWindow.close();
        settingsWindow = null;
    }
}

module.exports = {
    createViewWindow,
    getViewWindow,
    closeViewWindow,

    createRegionSelectionWindow,
    getRegionSelectionWindow,
    closeRegionSelectionWindow,

    createSettingsWindow,
    getSettingsWindow,
    closeSettingsWindow,

    createControlWindow,
    getControlWindow,
};