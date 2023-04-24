let viewWindow;
let regionSelectionWindow;
let settingsWindow;
let controlWindow;

function setViewWindow(window) {
    viewWindow = window;
}

function getViewWindow() {
    return viewWindow;
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

function setControlWindow(window) {
    controlWindow = window;
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
    setControlWindow,
    getControlWindow,

    setViewWindow,
    getViewWindow,

    setRegionSelectionWindow,
    getRegionSelectionWindow,
    closeRegionSelectionWindow, 

    setSettingsWindow,
    getSettingsWindow,
    closeSettingsWindow,
};