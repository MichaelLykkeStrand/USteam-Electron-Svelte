const { app, BrowserWindow, nativeImage } = require('electron');
const Store = require('electron-store');
const prompt = require('electron-prompt');
const Alert = require('electron-alert');
const path = require('path');
import AccountRepository from "./account/account.repo";
const USteamTray = require('./tray/usteam.tray');


let iconPath = path.join(__dirname, '/assets/icon/icon2.png');
let image = nativeImage.createFromPath(iconPath);
let crypto = require('crypto');
let alert = new Alert();
let accountRepository;
let store;

// Live Reload
require('electron-reload')(__dirname, {
  electron: path.join(__dirname, '../node_modules', '.bin', 'electron'),
  awaitWriteFinish: true
});

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) {
  // eslint-disable-line global-require
  app.quit();
}

const createWindow = () => {

  if (BrowserWindow.getAllWindows().length !== 0) return;
  showLoginPrompt();
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true
    }
  });

  // and load the index.html of the app.
  mainWindow.loadFile(path.join(__dirname, '../public/index.html'));

  // Open the DevTools.
  mainWindow.webContents.openDevTools();
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow);

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.
let dataSaveListener = {
  onDataSaved: function(){
    USteamTray.updateTrayContext();
  }
}

function loadIPC(){
  AccountIPC.load(accountRepository);
  USteamTray.load(accountRepository);
  SteamIPC.load(accountRepository,statRepository);
  SettingIPC.load();
}

function loadRepositoryModules(store){
  accountRepository = new AccountRepository(store, dataSaveListener);
  statRepository = new StatsRepository(store, dataSaveListener);
}

function showLoginPrompt() {
  prompt({
    title: 'U-Steam',
    label: 'Master Password:',
    value: '',
    inputAttrs: {
      type: 'password'
    },
    type: 'input',
    height: 180,
    icon: image
  })
    .then((masterPassword) => {
      if (masterPassword === null) {
        console.log('User cancelled');
        app.quit();
      } else {
        store = new Store({
          name: crypto.createHash('sha512').update(masterPassword).digest('hex'),
          encryptionKey: masterPassword,
          fileExtension: 'unb'
        })
        loadRepositoryModules(store);
        loadIPC();
        if (accountRepository.loadAccounts() == false) {
          let options = {
            title: 'Unrecognized Password!',
            text: 'Press OK for first time setup - Cancel to try again.',
            type: 'info',
            font: 'Arial',
            showCancelButton: true
          }
          let promise = alert.fireWithFrame(options, 'Unrecognized Password!', null, true);
          promise.then((result) => {
            if (result.value) {
              USteamTray.load(accountRepository);
              USteamTray.createTray();
              USteamWindowManger.open(window.MAIN_HTML);
            } else if (result.dismiss === Alert.DismissReason.cancel || result.dismiss === Alert.DismissReason.close) {
              showLoginPrompt();
            }
          })
        } else {
          USteamTray.createTray();
        }
      }
    })
    .catch(console.error);
}
