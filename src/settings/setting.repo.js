const { app, BrowserWindow, Menu, Tray, nativeImage, ipcMain } = require('electron');
const settings = require('electron-settings');
let settingsConstants = require('./settingsConstants');

class Settings {

    constructor(){
        this.loadSettings();
    }

    loadSettings(){
        let shouldGenerate = settings.getSync('generate');
        if(shouldGenerate == null || shouldGenerate == true){
          console.log('Creating default settings!');
          settings.setSync('generate',false);
          settings.setSync('darkmode',false);
          if(process.platform == "win32"){
            settings.setSync(settingsConstants.STEAM_DIR,settingsConstants.DEFAULT_STEAM_DIR)
          } else if( process.platform == "linux"){
            settings.setSync(settingsConstants.STEAM_DIR,settingsConstants.LINUX_DEFAULT_STEAM_DIR)
          }
        }else{
          console.log('Found settings!');
        }
      }


    update(setting,value){
        settings.setSync(setting,value);
    }
  }

  module.exports = Settings