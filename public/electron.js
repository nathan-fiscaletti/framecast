// Module to control the application lifecycle and the native browser window.
const { app, BrowserWindow, Menu, ipcMain } = require("electron");
const windows = require('./windows');

const crypto = require("crypto");

const { startWebsocketRelay } = require('./video-stream/websocket-relay');
const { startVideoStreamProcess } = require('./video-stream/stream-video');

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
  bitRate: 10000,
  showRegion: true,
};

ipcMain.on('closeRegionSelector',() => {
  windows.closeRegionSelectionWindow();
});

ipcMain.on('saveRegion', () => {
  const bounds = windows.getRegionSelectionWindow().getBounds();
  streamRegion = { x: bounds.x, y: bounds.y, width: bounds.width, height: bounds.height };
  windows.closeRegionSelectionWindow();
  stopStream();
  startStream();
});

ipcMain.on("getSettings", (event) => {
  event.sender.send("settings", settings);
});

ipcMain.on("updateSettings", (event, newSettings) => {
  settings.webSocketPort = newSettings.webSocketPort;
  settings.streamPort = newSettings.streamPort;
  settings.frameRate = newSettings.frameRate;
  settings.bitRate = newSettings.bitRate;
  settings.showRegion = newSettings.showRegion;

  windows.closeSettingsWindow();
  if(isStreaming()) {
    stopStream();
    startStream();
  }
});

ipcMain.on("selectRegion", (event) => {
  selectRegionHandler();
});

ipcMain.on("showSettings", (event) => {
  settingsHandler();
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

  windows.getViewWindow().setClosable(true);
  windows.getViewWindow().close();
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

function settingsHandler() {
  createSettingsWindow();
}

function createRegionSelectionWindow() {
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

function createSettingsWindow() {
  const settingsWindow = new BrowserWindow({
    parent: windows.getControlWindow(),
    modal: true,
    center: true,
    width: 464,
    height: 408,
    maximizable: false,
    autoHideMenuBar: true,
    alwaysOnTop: true,
    resizable: false,
    roundedCorners: false,
    minimizable: false,
    title: "Settings",
    webPreferences: {
      nodeIntegration: true,
      enableRemoteModule: true,
      contextIsolation: false
    }
  });

  windows.setSettingsWindow(settingsWindow);

  // In production, set the initial browser path to the local bundle generated
  // by the Create React App build process.
  // In development, set it to localhost to allow live/hot-reloading.
  const appURL = app.isPackaged
  ? `file://${__dirname}/index.html?content=settings&platform=${process.platform}`
    : `http://localhost:3000?content=settings&platform=${process.platform}`;
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
    height: 107,
    maximizable: false,
    minimizable: false,
    autoHideMenuBar: true,
    alwaysOnTop: true,
    resizable: false,
    roundedCorners: false,
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
  const viewWindow = new BrowserWindow({
    ...defaultDimensions,
    x: windows.getControlWindow().getPosition()[0],
    y: windows.getControlWindow().getPosition()[1] + windows.getControlWindow().getSize()[1],
    useContentSize: true,
    skipTaskbar: true,
    maximizable: false,
    closable: false,
    title: "Advanced Screen Streamer - Viewer",
    minimizable: false,
    frame: false,
    resizable: false,
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