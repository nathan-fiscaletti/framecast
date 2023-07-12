const fs = require('fs');
const path = require('path');
const { v4: uuid } = require('uuid')

const userDir = process.env.APPDATA || (process.platform === 'darwin' ? process.env.HOME + '/Library/Preferences' : process.env.HOME + "/.local/share");
const settingsDir = path.join(userDir, 'advanced-screen-streamer');
const settingsFile = path.join(settingsDir, 'settings.json');

const settings = {
    webSocketPort: 9065,
    streamPort: 9066,
    frameRate: 60,
    bitRate: 100000,
    previewVisible: false,
    showRegion: true,
    regionBorderSize: 4,
    enableAnalytics: true,
    systemInformationReportedAt: null,
    clientId: uuid(),
};

function initialize() {
    // Load settings
    try {
        if (!fs.existsSync(settingsDir)) {
            fs.mkdirSync(settingsDir);
        }

        if (!fs.existsSync(settingsFile)) {
            fs.writeFileSync(settingsFile, JSON.stringify(settings));
        }

        const loadedSettings = JSON.parse(fs.readFileSync(settingsFile));
        Object.assign(settings, loadedSettings);
    } catch (err) {
        console.error(err);
    }
}

function get() {
    return settings;
}

function set(newSettings) {
    Object.assign(settings, newSettings);
    fs.writeFileSync(settingsFile, JSON.stringify(settings));
}

module.exports = { initialize, get, set };