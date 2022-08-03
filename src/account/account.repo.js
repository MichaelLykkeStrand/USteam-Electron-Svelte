import {Account} from "./account.model"
const {app} = require('electron')


export class AccountRepository {
  constructor(store, callback){
    this.listener = callback;
    this.store = store;
    this.init();
  }
  
  init() {
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
      this.#save();
      return true;
    }
  }

  #save() {
      try { this.listener.onDataSaved(); } catch { }
      this.accounts.sort(compare);
      this.store.set('accounts', this.accounts);
      console.log("Saving accounts: " + this.accounts);
  }

  add(newAccount){
      console.log("add account called");
      let exists = false;
      this.accounts.forEach(account => {
        if (account._name == newAccount._name) {
          exists = true;
        }
      });
      //Check for valid name and create user
      if (newAccount._name != "" && newAccount._password != "" && exists != true) {
        this.accounts.push(new Account(newAccount._name, newAccount._password, newAccount._steamURL, newAccount._color));
        this.#save();
        console.log("Account added: " + newAccount._name);
        return true;
      } else {
        console.log("Could not add account!")
        return false;
      }
  }

  remove(username){
      console.log("Remove account: " + username);
      this.accounts.forEach(account => {
        if (account._name == username) {
          this.accounts = this.accounts.filter(function (item) {
            return item._name !== username;
          });
          this.#save();
          console.log("Account removed")
          return true;
        }
      });
      return false;
  }

  getAll(){
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
  var nameA = a._name.toUpperCase();
  var nameB = b._name.toUpperCase();
  if (nameA < nameB) {
    return -1;
  }
  if (nameA > nameB) {
    return 1;
  }
  return 0;
}
