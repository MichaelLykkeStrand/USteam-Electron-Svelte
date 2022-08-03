// Modules to control application life and create native browser window
const { app, BrowserWindow, Menu, Tray, nativeImage, ipcMain } = require('electron')
let accountRepository;
const load = (repository)=>{
    accountRepository = repository;
    ipcMain.on("add-account", (event, newAccount) => {
        event.returnValue = accountRepository.addAccount(newAccount);
        stats.add("add");
      });
      
      ipcMain.on("remove-account", (event, username) => {
        event.returnValue = accountRepository.removeAccount(username);
      });
      
      ipcMain.on("get-accounts", (event) => {
        event.returnValue = accountRepository.getAccounts();
      });
}

module.exports.load = load;