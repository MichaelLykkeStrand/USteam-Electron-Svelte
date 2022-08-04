import { ipcMain } from 'electron';
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
export { load };