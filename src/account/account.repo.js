const Account = require('./account.model');
const {app} = require('electron')


class AccountManager {
  constructor(store, callback){
    this.listener = callback;
    this.store = store;
    this.loadAccounts();
  }
  
  loadAccounts() {
    let tempAccounts = this.store.get('accounts');
    console.log(app.getPath('userData'));
    this.accounts = [];
    if (tempAccounts == null) {
      console.log("Accounts could not be loaded. Creating empty!");
      return false;
    } else {
      tempAccounts.forEach(obj => {
        this.accounts.push(new Account(obj._name, obj._password, obj._steamURL, obj._color));
      });
      this.accounts.sort(compare);
      console.log("Accounts loaded: " + this.accounts);
      //Resave accounts to conform with model changes!
      this.saveAccounts();
      return true;
    }
  }

  saveAccounts() {
      try { this.listener.onDataSaved(); } catch { }
      this.accounts.sort(compare);
      this.store.set('accounts', this.accounts);
      console.log("Saving accounts: " + this.accounts);
  }

  addAccount(newAccount){
      console.log("add account called");
      //CHECK IF ACCOUNT EXISTS
      let exists = false;
      this.accounts.forEach(account => {
        if (account._name == newAccount._name) {
          exists = true;
        }
      });
      //Check for valid name and create user
      if (newAccount._name != "" && newAccount._password != "" && exists != true) {
        this.accounts.push(new Account(newAccount._name, newAccount._password, newAccount._steamURL, newAccount._color));
        this.saveAccounts();
        console.log("Account added: " + newAccount._name);
        return true;
      } else {
        console.log("Could not add account!")
        return false;
      }
  }

  removeAccount(username){
      console.log("Remove account: " + username);
      this.accounts.forEach(account => {
        if (account._name == username) {
          this.accounts = this.accounts.filter(function (item) {
            return item._name !== username;
          });
          this.saveAccounts();
          console.log("Account removed")
          return true;
        }
      });
      return false;
  }

  getAccounts(){
      let tempAccounts = [];
      this.accounts.sort(compare);
      this.accounts.forEach(account => {
        let safeAccount = JSON.parse(JSON.stringify(account));
        tempAccounts.push(safeAccount)
      });
      return tempAccounts;
  }
}

function compare(a, b) {
  var nameA = a._name.toUpperCase(); // ignore upper and lowercase
  var nameB = b._name.toUpperCase(); // ignore upper and lowercase
  if (nameA < nameB) {
    return -1;
  }
  if (nameA > nameB) {
    return 1;
  }
  // names must be equal
  return 0;
}

module.exports = AccountManager;