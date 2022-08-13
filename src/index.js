// Modules to control application life and create native browser window
const { app, BrowserWindow, Menu, Tray, nativeImage, ipcMain } = require('electron');

const Store = require('electron-store');
const prompt = require('electron-prompt');
const Alert = require('electron-alert');

const AccountRepository = require('./account/account.repo');
const SettingRepository = require('./settings/setting.repo');
const SteamResourceLocator = require('./steam/steam.resource.Locator');

const USteamTray = require('./tray/usteam.tray');
const USteamWindowManger = require('./window/usteam.window.manager');

const AccountIPC = require('./account/account.ipc');
const SteamIPC = require('./steam/steam.ipc');
const SettingIPC = require('./settings/setting.ipc');

const path = require('path')

//Remove duplicate code
let iconPath = path.join(__dirname, '/assets/icon/icon2.png');
let image = nativeImage.createFromPath(iconPath);
let window = require('./window/window.constants');
let crypto = require('crypto');
let alert = new Alert();

let accountRepository;
let statRepository;
let settingRepository;
let store;

//Callback to update the ui when data has been altered
let dataSaveListener = {
  onDataSaved: function(){
    USteamTray.updateTrayContext();
  }
}

app.whenReady().then(() => {
  //Check settings
  settingRepository = new SettingRepository();
  let locator = new SteamResourceLocator();
  locator.getSteamPath().then((path)=>{
    console.log("Steam path: "+path);
  });

  locator.getAvatarPath().then((path)=>{
    console.log("Avatar path: "+path);
  });

  locator.getProfileVdfPath().then((path)=>{
    console.log("Profilevdf path: "+path);
  });

  console.log(path);
  showLoginPrompt();
  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) 
    USteamWindowManger.open(window.MAIN_HTML);
  })
})

const createWindow = () => {
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

function loadRepositoryModules(store){
  accountRepository = new AccountRepository(store, dataSaveListener);
}

function loadIPC(){
  AccountIPC.load(accountRepository);
  USteamTray.load(accountRepository);
  SteamIPC.load(accountRepository,statRepository);
  SettingIPC.load();
}

//TODO REFACTOR
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
              createWindow();
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