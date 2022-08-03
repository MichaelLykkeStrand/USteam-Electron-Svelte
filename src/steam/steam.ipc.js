// Modules to control application life and create native browser window
const { app, BrowserWindow, Menu, Tray, nativeImage, ipcMain } = require('electron')
const Steam = require('./steam');
let accountRepository;
let statsRepository;
const load = (repository, stats)=>{
    statsRepository = stats;
    accountRepository = repository;
    ipcMain.on("login", (event, username) => {
        accountRepository.getAccounts().forEach(account => {
          if (account._name == username) {
            Steam.login(account);
            stats.add("login");
            event.returnValue = true;
          }
        });
        event.returnValue = false;
      });
      
      ipcMain.on("get-steam-profile", async (event, account) => {
        await Steam.getSteamProfile(event, account);
      });
}

module.exports.load = load;