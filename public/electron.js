// Module to control the application lifecycle and the native browser window.
const { app, BrowserWindow, ipcMain } = require("electron");

const fs = require('fs');
const path = require("path");
const windows = require('./windows');
const crypto = require("crypto");

const { startWebsocketRelay } = require('./video-stream/websocket-relay');
const { startVideoStreamProcess } = require('./video-stream/stream-video');

const userDir = process.env.APPDATA || (process.platform === 'darwin' ? process.env.HOME + '/Library/Preferences' : process.env.HOME + "/.local/share");
const settingsDir = path.join(userDir, 'advanced-screen-streamer');
const settingsFile = path.join(settingsDir, 'settings.json');

const settingsWindowLocation = { x: -1, y: -1 };
const defaultDimensions = { width: 350, height: 1 };
let streamRegion = { x: 0, y: 0, width: 500, height: 500 };
let streamProcess;
let socketRelay;

function isStreaming() {
  return !!streamProcess;
}

const settings = {
  webSocketPort: 9065,
  streamPort: 9066,
  frameRate: 60,
  bitRate: 100000,
  previewVisible: false,
  showRegion: true,
};

// Load settings
try {
  if (!fs.existsSync(settingsDir)) {
    fs.mkdirSync(settingsDir);
  }

  if(!fs.existsSync(settingsFile)) {
    fs.writeFileSync(settingsFile, JSON.stringify(settings));
  }

  const loadedSettings = JSON.parse(fs.readFileSync(settingsFile));
  Object.assign(settings, loadedSettings);
} catch (err) {
  console.error(err);
}

ipcMain.on('closeRegionSelector',() => {
  windows.closeRegionSelectionWindow();
});

ipcMain.on('saveRegion', () => {
  const bounds = windows.getRegionSelectionWindow().getBounds();
  streamRegion = { x: bounds.x, y: bounds.y, width: bounds.width, height: bounds.height };
  windows.closeRegionSelectionWindow();
  if (isStreaming()) {
    stopStream();
    startStream();
  }
});

ipcMain.on("getSettings", (event) => {
  event.sender.send("settings", settings);
});

ipcMain.on("closeSettingsWindow", (event) => {
  windows.closeSettingsWindow();
});

ipcMain.on("updateSettings", (event, newSettings) => {
  settings.webSocketPort = newSettings.webSocketPort;
  settings.streamPort = newSettings.streamPort;
  settings.frameRate = newSettings.frameRate;
  settings.bitRate = newSettings.bitRate;
  settings.previewVisible = newSettings.previewVisible;
  settings.showRegion = newSettings.showRegion;

  try {
    fs.writeFileSync(settingsFile, JSON.stringify(settings));
  } catch (err) {
    console.error(err);
  }

  if(isStreaming()) {
    stopStream();
    startStream();
  }
});

ipcMain.on("selectRegion", (event) => {
  selectRegionHandler();
});

ipcMain.on("showSettings", (event, props) => {
  if (!props) {
    props = { tab: 0 };
  }
  settingsHandler(props);
});

ipcMain.on("startStream", (event) => {
  startStreamHandler();
});

ipcMain.on("stopStream", (event) => {
  stopStreamHandler();
});

async function startStream() {
  createViewWindow();
  const streamSecret = crypto.randomBytes(20).toString('hex')
  socketRelay = await startWebsocketRelay({ 
    streamSecret,
    streamPort: settings.streamPort,
    webSocketPort: settings.webSocketPort,
  });
  streamProcess = startVideoStreamProcess({ 
    frameRate: settings.frameRate,
    bitRate: `${settings.bitRate}k`,
    streamPort: settings.streamPort,
    showRegion: settings.showRegion,
    streamSecret,
    offsetX: streamRegion.x,
    offsetY: streamRegion.y,
    width: streamRegion.width,
    height: streamRegion.height
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

  if (windows.getViewWindow() && !windows.getViewWindow().isDestroyed()) {
    windows.getViewWindow().setClosable(true);
    windows.getViewWindow().close();
    windows.setViewWindow(null);
  }
}

function selectRegionHandler() {
  createRegionSelectionWindow();
}

function startStreamHandler() {
  startStream();
}

function stopStreamHandler() {
  stopStream();
}

function settingsHandler(props) {
  createSettingsWindow(props);
}

function createRegionSelectionWindow() {
  if (windows.getRegionSelectionWindow() && !windows.getRegionSelectionWindow().isDestroyed()) {
    windows.getRegionSelectionWindow().focus();
    return;
  }

  const regionSelectionWindow = new BrowserWindow({
    parent: windows.getControlWindow(),
    ...streamRegion,
    maximizable: false,
    frame: false,
    alwaysOnTop: true,
    roundedCorners: false,
    opacity: 0.75,
    x: streamRegion.x,
    y: streamRegion.y,
    width: streamRegion.width,
    height: streamRegion.height,
    title: "Select Recording Region",
    icon: path.join(__dirname, "icon.png"),
    webPreferences: {
      nodeIntegration: true,
      enableRemoteModule: true,
      contextIsolation: false
    }
  });

  windows.setRegionSelectionWindow(regionSelectionWindow);

  // In production, set the initial browser path to the local bundle generated
  // by the Create React App build process.
  // In development, set it to localhost to allow live/hot-reloading.
  const appURL = app.isPackaged
    ? `file://${__dirname}/index.html?content=selector`
    : "http://localhost:3000?content=selector";
  windows.getRegionSelectionWindow().loadURL(appURL);

  // Automatically open Chrome's DevTools in development mode.
  // if (!app.isPackaged) {
  //   windows.getRegionSelectionWindow().webContents.openDevTools();
  // }
}

function createSettingsWindow(props = { tab: 0 }) {
  if (windows.getSettingsWindow() && !windows.getSettingsWindow().isDestroyed()) {
    windows.getSettingsWindow().focus();
  } else {
    const settingsWindow = new BrowserWindow({
      parent: windows.getControlWindow(),
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
      icon: path.join(__dirname, "icon.png"),
      title: "Advanced Screen Streamer - Settings",
      webPreferences: {
        nodeIntegration: true,
        enableRemoteModule: true,
        contextIsolation: false
      }
    });

    settingsWindow.on("move", () => {
      const [x, y] = settingsWindow.getPosition();
      settingsWindowLocation.x = x;
      settingsWindowLocation.y = y;
    });
  
    windows.setSettingsWindow(settingsWindow);
  }

  // In production, set the initial browser path to the local bundle generated
  // by the Create React App build process.
  // In development, set it to localhost to allow live/hot-reloading.
  const appURL = app.isPackaged
  ? `file://${__dirname}/index.html?content=settings&platform=${process.platform}&version=${app.getVersion()}&tab=${props.tab}`
    : `http://localhost:3000?content=settings&platform=${process.platform}&version=${app.getVersion()}&tab=${props.tab}`;
  windows.getSettingsWindow().loadURL(appURL);
  // Automatically open Chrome's DevTools in development mode.
  // if (!app.isPackaged) {
  //   windows.getSettingsWindow().webContents.openDevTools();
  // }
}

function createControlWindow() {
  const controlWindow = new BrowserWindow({
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
    icon: path.join(__dirname, "icon.png"),
    title: "Advanced Screen Streamer",
    webPreferences: {
      nodeIntegration: true,
      enableRemoteModule: true,
      contextIsolation: false
    }
  });

  controlWindow.on("move", () => {
    if (windows.getViewWindow() && !windows.getViewWindow().isDestroyed()) {
      windows.getViewWindow().setPosition(
        windows.getControlWindow().getPosition()[0],
        windows.getControlWindow().getPosition()[1] + windows.getControlWindow().getSize()[1],
      );
    }
  });

  controlWindow.on("closed", () => {
    process.exit(0);
  });

  windows.setControlWindow(controlWindow);

  // In production, set the initial browser path to the local bundle generated
  // by the Create React App build process.
  // In development, set it to localhost to allow live/hot-reloading.
  const appURL = app.isPackaged
  ? `file://${__dirname}/index.html?content=control&platform=${process.platform}`
    : `http://localhost:3000?content=control&platform=${process.platform}`;
  windows.getControlWindow().loadURL(appURL);
  // Automatically open Chrome's DevTools in development mode.
  // if (!app.isPackaged) {
  //   windows.getControlWindow().webContents.openDevTools();
  // }
}

// Create the native browser window.
function createViewWindow() {
  if (windows.getViewWindow() && !windows.getViewWindow().isDestroyed()) {
    windows.getViewWindow().focus();
    return;
  }

  const viewWindow = new BrowserWindow({
    ...defaultDimensions,
    x: windows.getControlWindow().getPosition()[0],
    y: windows.getControlWindow().getPosition()[1] + windows.getControlWindow().getSize()[1],
    useContentSize: true,
    skipTaskbar: true,
    maximizable: false,
    icon: path.join(__dirname, "icon.png"),
    closable: false,
    title: "Advanced Screen Streamer - Viewer",
    minimizable: false,
    frame: false,
    resizable: false,
    alwaysOnTop: true,
    opacity: settings.previewVisible ? 1 : 0,
    webPreferences: {
      nodeIntegration: true,
      enableRemoteModule: true,
      contextIsolation: false
    }
  });

  windows.setViewWindow(viewWindow);

  // In production, set the initial browser path to the local bundle generated
  // by the Create React App build process.
  // In development, set it to localhost to allow live/hot-reloading.
  const appURL = app.isPackaged
    ? `file://${__dirname}/index.html?content=viewer`
    : "http://localhost:3000?content=viewer";
  windows.getViewWindow().loadURL(appURL);

  // Automatically open Chrome's DevTools in development mode.
  // if (!app.isPackaged) {
  //   windows.getViewWindow().webContents.openDevTools();
  // }
}

// Setup a local proxy to adjust the paths of requested files when loading
// them from the local production bundle (e.g.: local fonts, etc...).
// function setupLocalFilesNormalizerProxy() {
//   protocol.registerHttpProtocol(
//     "file",
//     (request, callback) => {
//       const url = request.url.substr(8);
//       callback({ path: path.normalize(`${__dirname}/${url}`) });
//     },
//     (error) => {
//       if (error) console.error("Failed to register protocol");
//     }
//   );
// }

// This method will be called when Electron has finished its initialization and
// is ready to create the browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(async () => {
  createControlWindow();
  // setupLocalFilesNormalizerProxy();

  app.on("activate", function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) {
      createControlWindow();
    }
  });
});

// Quit when all windows are closed, except on macOS.
// There, it's common for applications and their menu bar to stay active until
// the user quits  explicitly with Cmd + Q.
app.on("window-all-closed", function () {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

// If your app has no need to navigate or only needs to navigate to known pages,
// it is a good idea to limit navigation outright to that known scope,
// disallowing any other kinds of navigation.
app.on("web-contents-created", (event, contents) => {
  contents.on("will-navigate", (event, navigationUrl) => {
    event.preventDefault();
  });
});