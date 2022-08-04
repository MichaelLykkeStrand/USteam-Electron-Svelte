// Modules to control application life and create native browser window
const { app, BrowserWindow, Menu, Tray, nativeImage, ipcMain } = require('electron')
const settings = require('electron-settings');

const load = ()=>{
    ipcMain.on("get-settings", async (event) => {
        event.returnValue = await settings.get();
    });
      
    ipcMain.on("get-setting", async (event, name) => {
        event.returnValue = await settings.get(name);
    });

    ipcMain.on("update-setting", (event, name,value) => {
        event.returnValue = settings.setSync(name,value);
    });
}
    

module.exports.load = load;