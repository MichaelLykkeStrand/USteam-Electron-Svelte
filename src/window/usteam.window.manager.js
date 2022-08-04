// Modules to control application life and create native browser window
const { app, BrowserWindow, Menu, Tray, nativeImage, ipcMain } = require('electron')
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
    if (BrowserWindow.getAllWindows().length === 0){
        mainWindow = new BrowserWindow({
          width: 1030,
          height: 700,
          icon: image,
          webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            nodeIntegration: true
          },
        })
        mainWindow.setMinimumSize(1030, 700);
        //mainWindow.removeMenu();
        } 
        mainWindow.loadFile(fileName);
        mainWindow.focus();
}

module.exports.open = open;