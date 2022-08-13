const find = require('find-process');
const { exec } = require('child_process');
const AbortController = require('abort-controller');
const fetch = require('node-fetch');
const settings = require('electron-settings');
let settingsConstants = require('../settings/settingsConstants');
let timer = require('../utils/timer');
const vdf = require('simple-vdf');

class Steam {
  constructor() {
  }

  static async login(account) {
    await this.logout();
    let steamDir = settings.getSync(settingsConstants.STEAM_DIR);
    console.log("Logging into account: " + account._name + " Pass: " + account._password.length);
    exec(steamDir + " -login " + account._name + " " + account._password, (error, stdout, stderr) => {
    });
  }


  static async logout() {
    let hasExited = false;
    while (hasExited == false) {
      hasExited = await Steam.TryExit();
      await timer.sleep(100);
      console.log("Waiting for Steam to exit. Exit: " + hasExited);
    }
    console.log("Steam has logged out!")
  }

  static async TryExit() {
    var count = 0;
    await find('name', 'steam').then(async function (list) {
      list.forEach(async steamRunner => {
        try {
          //TODO REFACTOR
          if (steamRunner.name == "steamwebhelper.exe" || steamRunner.name == "steam" || steamRunner.name == "steamwebhelper") {
            console.log("Closing: " + steamRunner.name);
            count = count + 1;
            process.kill(steamRunner.ppid, 'SIGKILL');
          }
        } catch (error) {
        }
      });

    });
    if (count > 0) {
      return false;
    }
    return true;
  }
}

module.exports = Steam