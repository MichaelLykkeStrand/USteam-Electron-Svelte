// Modules to control application life and create native browser window
const { app, BrowserWindow, nativeImage } = require('electron')
const path = require('path')

//Remove duplicate code
let iconPath = path.join(__dirname, '../assets/icon/icon2.png');
let image = nativeImage.createFromPath(iconPath);

let mainWindow;

// Override fuction to ignore closing the window.
app.on('window-all-closed', function () {
})

const open = (fileName)=>{
    // Create the browser window.
    if (BrowserWindow.getAllWindows().length !== 0) return;
    // Create the browser window.
    const mainWindow = new BrowserWindow({
      width: 800,
      height: 600,
      webPreferences: {
        webSecurity: false,
        nodeIntegration: true
      }
    });
  
    // and load the index.html of the app.
    mainWindow.loadFile('/index.html');
  
    // Open the DevTools.
    mainWindow.webContents.openDevTools();
}

module.exports.open = open;