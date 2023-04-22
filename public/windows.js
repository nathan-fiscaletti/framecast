var mainWindow;
var regionSelectionWindow;
var settingsWindow;

function setMainWindow(window) {
    mainWindow = window;
}

function getMainWindow() {
    return mainWindow;
}

function setRegionSelectionWindow(window) {
    regionSelectionWindow = window;
}

function getRegionSelectionWindow() {
    return regionSelectionWindow;
}

function setSettingsWindow(window) {
    settingsWindow = window;
}

function getSettingsWindow() {
    return settingsWindow;
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

module.exports = { setMainWindow, getMainWindow, setRegionSelectionWindow, getRegionSelectionWindow, setSettingsWindow, getSettingsWindow, closeRegionSelectionWindow, closeSettingsWindow }