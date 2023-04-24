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

async function startStream() {
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
  windows.getMainWindow().setContentSize(streamRegion.width, streamRegion.height);
  updateMenu();
  windows.getMainWindow().reload();
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

  windows.getMainWindow().setContentSize(defaultDimensions.width, defaultDimensions.height);
  windows.getMainWindow().reload();
  updateMenu();
}

function exitMenuHandler(menuItem, browserWindow, event) {
  BrowserWindow.getAllWindows().map(w => w.close());
}

function resetWindowSizeHandler(menuItem, browserWindow, event) {
  if (isStreaming()) {
    browserWindow.setContentSize(streamRegion.width, streamRegion.height);
  } else {
    browserWindow.setContentSize(defaultDimensions.width, defaultDimensions.height);
  }
}

function selectRegionHandler(menuItem, browserWindow, event) {
  if (isStreaming()) {
    stopStream();
  }
  createRegionSelectionWindow();
}

function startStreamHandler(menuItem, browserWindow, event) {
  startStream();
}

function settingsHandler(menuItem, browserWindow, event) {
  createSettingsWindow();
}

function devToolsHandler(menuItem, browserWindow, event) {
  windows.getMainWindow().webContents.openDevTools();
}

function createRegionSelectionWindow() {
  const regionSelectionWindow = new BrowserWindow({
    parent: windows.getMainWindow(),
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
    parent: windows.getMainWindow(),
    modal: true,
    x: windows.getMainWindow().getPosition()[0] + windows.getMainWindow().getSize()[0] / 2 - (464 / 2),
    y: windows.getMainWindow().getPosition()[1] + windows.getMainWindow().getSize()[1] / 2 - (308 / 2),
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
  if (!app.isPackaged) {
    windows.getSettingsWindow().webContents.openDevTools();
  }
}

function updateMenu() {
  const template = [
    {
      label: 'Application',
      submenu: [
        {
          label: "Settings",
          click: settingsHandler
        },
        {
          label: "Exit Application",
          click: exitMenuHandler
        }
      ]
    },
    {
      label: "Stream",
      submenu: [
        {
          label: "Select Region",
          enabled: !isStreaming(),
          click: selectRegionHandler
        },
        {
          label: "Start Stream",
          enabled: !isStreaming(),
          click: startStreamHandler
        },
        {
          label: "Stop Stream",
          enabled: isStreaming(),
          click: stopStream
        }
      ]
    },
    {
      label: "Window",
      submenu: [
        {
          label: "Reset Window Size",
          click: resetWindowSizeHandler
        },
        {
          label: 'Open Dev Tools',
          click: devToolsHandler
        }
      ]
    }
  ];
 
  const menu = Menu.buildFromTemplate(template)

  Menu.setApplicationMenu(menu);
}

// Create the native browser window.
function createWindow() {
  updateMenu();
  
  const mainWindow = new BrowserWindow({
    ...defaultDimensions,
    useContentSize: true,
    maximizable: false,
    title: "Advanced Screen Streamer",
    webPreferences: {
      nodeIntegration: true,
      enableRemoteModule: true,
      contextIsolation: false
    }
  });

  windows.setMainWindow(mainWindow);

  // In production, set the initial browser path to the local bundle generated
  // by the Create React App build process.
  // In development, set it to localhost to allow live/hot-reloading.
  const appURL = app.isPackaged
    ? `file://${__dirname}/index.html?content=viewer`
    : "http://localhost:3000?content=viewer";
  windows.getMainWindow().loadURL(appURL);

  // Automatically open Chrome's DevTools in development mode.
  // if (!app.isPackaged) {
  //   windows.getMainWindow().webContents.openDevTools();
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
  createWindow();
  // setupLocalFilesNormalizerProxy();

  app.on("activate", function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
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